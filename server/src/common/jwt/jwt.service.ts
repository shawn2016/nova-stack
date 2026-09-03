import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { RedisService } from '../../redis/redis.service';
import { JwtPayload, SignTokenParams } from './jwt-payload.interface';

const REFRESH_TTL_SECONDS = 7 * 24 * 3600;
const BLACKLIST_VALUE = '1';

@Injectable()
export class JwtService {
  constructor(
    private readonly configService: ConfigService,
    private readonly nestJwtService: NestJwtService,
    private readonly redisService: RedisService,
  ) {}

  async signAccessToken(params: SignTokenParams): Promise<string> {
    const jti = randomUUID();
    const expiresIn = this.configService.get<string>('jwt.accessExpiresIn') ?? '2h';

    return this.nestJwtService.signAsync(
      {
        sub: params.userId,
        type: params.type,
        jti,
      },
      { expiresIn: expiresIn as `${number}${'s' | 'm' | 'h' | 'd'}` },
    );
  }

  async signRefreshToken(params: SignTokenParams): Promise<string> {
    const jti = randomUUID();
    const expiresIn = this.configService.get<string>('jwt.expiresIn') ?? '7d';

    const token = await this.nestJwtService.signAsync(
      {
        sub: params.userId,
        type: params.type,
        jti,
      },
      { expiresIn: expiresIn as `${number}${'s' | 'm' | 'h' | 'd'}` },
    );

    const redis = this.requireRedisClient();
    const refreshKey = this.refreshKey(params.type, params.userId);
    await redis.set(refreshKey, token, 'EX', REFRESH_TTL_SECONDS);

    return token;
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.nestJwtService.verifyAsync<JwtPayload>(token);
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async blacklist(jti: string, ttl: number): Promise<void> {
    const redis = this.requireRedisClient();
    await redis.set(`jwt:blacklist:${jti}`, BLACKLIST_VALUE, 'EX', ttl);
  }

  async isBlacklisted(jti: string): Promise<boolean> {
    const redis = this.redisService.getClient();
    if (!redis) {
      const skipExternal = process.env.SKIP_EXTERNAL_SERVICES === 'true';
      const isTest = process.env.NODE_ENV === 'test';
      if (skipExternal || isTest) {
        return false;
      }
      throw new UnauthorizedException('Auth service unavailable');
    }

    const exists = await redis.exists(`jwt:blacklist:${jti}`);
    return exists === 1;
  }

  private refreshKey(type: 'admin' | 'member', userId: string): string {
    return type === 'admin'
      ? `refresh:admin:${userId}`
      : `refresh:member:${userId}`;
  }

  private requireRedisClient() {
    const client = this.redisService.getClient();
    if (!client) {
      throw new InternalServerErrorException('Redis is unavailable');
    }

    return client;
  }
}
