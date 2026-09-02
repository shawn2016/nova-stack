import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../../common/jwt/jwt-payload.interface';
import { JwtService } from '../../../common/jwt/jwt.service';
import { RedisService } from '../../../redis/redis.service';
import { AuthUser } from '../decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('jwt.secret') ?? 'change-me-in-production',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    await this.assertBlacklistAvailable();
    const blacklisted = await this.jwtService.isBlacklisted(payload.jti);
    if (blacklisted) {
      throw new UnauthorizedException('Token revoked');
    }

    return {
      userId: payload.sub,
      type: payload.type,
      jti: payload.jti,
    };
  }

  private async assertBlacklistAvailable(): Promise<void> {
    const skipExternal =
      this.configService.get<boolean>('app.skipExternalServices') ?? false;
    if (skipExternal) {
      return;
    }

    if (!this.redisService.getClient()) {
      throw new UnauthorizedException('Auth service unavailable');
    }
  }
}
