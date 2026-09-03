import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  KickOnlineSessionResult,
  OnlineSessionListResult,
} from '@nova/shared-types';
import { Repository } from 'typeorm';
import { JwtService } from '../../common/jwt/jwt.service';
import { SysConfigEntity } from '../../database/entities';
import { RedisService } from '../../redis/redis.service';
import { ListOnlineSessionsDto } from './dto/list-online-sessions.dto';

const SESSION_KEY_PREFIX = 'online:admin:';
export const MODULE_ENABLED_KEY = 'online_session.module.enabled';

interface OnlineSessionRecord {
  userId: string;
  username: string;
  ip: string;
  userAgent: string | null;
  loginAt: string;
}

@Injectable()
export class OnlineSessionService {
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    @InjectRepository(SysConfigEntity)
    private readonly configRepo: Repository<SysConfigEntity>,
  ) {}

  async register(
    tokenId: string,
    record: OnlineSessionRecord,
    ttlSeconds: number,
  ): Promise<void> {
    if (!(await this.isModuleEnabled())) {
      return;
    }

    const redis = this.redisService.getClient();
    if (!redis) {
      return;
    }

    const ttl = Math.max(ttlSeconds, 1);
    await redis.set(
      this.sessionKey(tokenId),
      JSON.stringify(record),
      'EX',
      ttl,
    );
  }

  async remove(tokenId: string): Promise<void> {
    const redis = this.redisService.getClient();
    if (!redis) {
      return;
    }
    await redis.del(this.sessionKey(tokenId));
  }

  async list(
    query: ListOnlineSessionsDto,
    currentTokenId: string,
  ): Promise<OnlineSessionListResult> {
    const { page = 1, pageSize = 10, keyword } = query;

    if (!(await this.isModuleEnabled())) {
      return {
        list: [],
        total: 0,
        page,
        pageSize,
        currentTokenId,
      };
    }

    const redis = this.redisService.getClient();
    if (!redis) {
      return {
        list: [],
        total: 0,
        page,
        pageSize,
        currentTokenId,
      };
    }

    const keys = await this.findSessionKeys(redis);
    const items = [];

    for (const key of keys) {
      const raw = await redis.get(key);
      if (!raw) {
        continue;
      }
      const record = JSON.parse(raw) as OnlineSessionRecord;
      const tokenId = key.slice(SESSION_KEY_PREFIX.length);
      items.push({
        tokenId,
        userId: record.userId,
        username: record.username,
        ip: record.ip,
        userAgent: record.userAgent,
        loginAt: record.loginAt,
      });
    }

    items.sort(
      (a, b) =>
        new Date(b.loginAt).getTime() - new Date(a.loginAt).getTime(),
    );

    const kw = keyword?.trim().toLowerCase();
    const filtered = kw
      ? items.filter(
          (item) =>
            item.username.toLowerCase().includes(kw) ||
            item.ip.toLowerCase().includes(kw),
        )
      : items;

    const start = (page - 1) * pageSize;
    const list = filtered.slice(start, start + pageSize);

    return {
      list,
      total: filtered.length,
      page,
      pageSize,
      currentTokenId,
    };
  }

  async kick(
    tokenId: string,
    operatorTokenId: string,
    accessTokenTtlSeconds: number,
  ): Promise<KickOnlineSessionResult> {
    if (tokenId === operatorTokenId) {
      throw new BadRequestException('Cannot kick current session');
    }

    const redis = this.redisService.getClient();
    if (!redis) {
      throw new NotFoundException('Session not found');
    }

    const key = this.sessionKey(tokenId);
    const exists = await redis.exists(key);
    if (!exists) {
      throw new NotFoundException('Session not found');
    }

    await this.jwtService.blacklist(tokenId, Math.max(accessTokenTtlSeconds, 1));
    await redis.del(key);

    return { success: true };
  }

  private sessionKey(tokenId: string): string {
    return `${SESSION_KEY_PREFIX}${tokenId}`;
  }

  private async findSessionKeys(
    redis: NonNullable<ReturnType<RedisService['getClient']>>,
  ): Promise<string[]> {
    if (typeof redis.keys === 'function') {
      return redis.keys(`${SESSION_KEY_PREFIX}*`);
    }

    const store = (redis as { _store?: Map<string, string> })._store;
    if (store) {
      return [...store.keys()].filter((key) =>
        key.startsWith(SESSION_KEY_PREFIX),
      );
    }

    return [];
  }

  private async isModuleEnabled(): Promise<boolean> {
    const config = await this.configRepo.findOne({
      where: { configKey: MODULE_ENABLED_KEY },
    });
    return config?.configValue !== 'false';
  }
}

export type { OnlineSessionRecord };
