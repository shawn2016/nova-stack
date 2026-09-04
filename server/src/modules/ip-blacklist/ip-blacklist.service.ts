import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  CreateIpBlacklistDto,
  IpBlacklistListItem,
  IpBlacklistListQuery,
  IpBlacklistListResult,
} from '@nova/shared-types';
import { Repository } from 'typeorm';
import { isIpv4 } from '../../common/utils/is-ipv4';
import { toApiId } from '../../common/utils/to-api-id';
import { SysIpBlacklistEntity } from '../../database/entities';
import { RedisService } from '../../redis/redis.service';

interface BlockCheckResult {
  blocked: boolean;
  reason?: string;
}

@Injectable()
export class IpBlacklistService {
  private readonly logger = new Logger(IpBlacklistService.name);

  constructor(
    @InjectRepository(SysIpBlacklistEntity)
    private readonly blacklistRepo: Repository<SysIpBlacklistEntity>,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  isWhitelisted(ip: string): boolean {
    const whitelist =
      this.configService.get<string[]>('ipBlacklist.whitelist') ?? [];
    return whitelist.includes(ip.trim());
  }

  async isBlocked(ip: string): Promise<BlockCheckResult> {
    const normalized = ip.trim();
    if (!normalized || this.isWhitelisted(normalized)) {
      return { blocked: false };
    }

    const redis = this.redisService.getClient();
    if (redis) {
      const cached = await redis.get(this.blockKey(normalized));
      if (cached) {
        return { blocked: true, reason: 'Access denied: IP blocked' };
      }
    }

    const row = await this.blacklistRepo.findOne({
      where: { ip: normalized, status: 1 },
    });
    if (!row || this.isExpired(row.expiresAt)) {
      return { blocked: false };
    }

    await this.setRedisBlock(normalized, row.expiresAt);
    return { blocked: true, reason: 'Access denied: IP blocked' };
  }

  async recordLoginFailure(ip: string): Promise<void> {
    const normalized = ip.trim();
    if (!normalized || this.isWhitelisted(normalized)) {
      return;
    }

    const redis = this.redisService.getClient();
    if (!redis) {
      this.logger.warn('Redis unavailable; skip login failure counting');
      return;
    }

    const failKey = this.failKey(normalized);
    const count = await redis.incr(failKey);
    const windowSec =
      this.configService.get<number>('ipBlacklist.windowSec') ?? 300;
    if (count === 1) {
      await redis.expire(failKey, windowSec);
    }

    const threshold =
      this.configService.get<number>('ipBlacklist.failThreshold') ?? 10;
    if (count >= threshold) {
      await this.createAutoBan(normalized);
      await redis.del(failKey);
    }
  }

  async createAutoBan(ip: string): Promise<void> {
    const banSec = this.configService.get<number>('ipBlacklist.banSec') ?? 1800;
    const expiresAt = new Date(Date.now() + banSec * 1000);

    let row = await this.blacklistRepo.findOne({ where: { ip } });
    if (row) {
      row.source = 'auto';
      row.status = 1;
      row.expiresAt = expiresAt;
      row.remark = 'Auto banned due to repeated login failures';
      row.createdBy = null;
    } else {
      row = this.blacklistRepo.create({
        ip,
        source: 'auto',
        status: 1,
        expiresAt,
        remark: 'Auto banned due to repeated login failures',
        createdBy: null,
      });
    }

    row = await this.blacklistRepo.save(row);
    await this.setRedisBlock(ip, row.expiresAt);
  }

  async list(query: IpBlacklistListQuery): Promise<IpBlacklistListResult> {
    const { page = 1, pageSize = 10, keyword, source, status } = query;
    const qb = this.blacklistRepo
      .createQueryBuilder('b')
      .orderBy('b.created_at', 'DESC');

    if (keyword?.trim()) {
      qb.andWhere('(b.ip LIKE :kw OR b.remark LIKE :kw)', {
        kw: `%${keyword.trim()}%`,
      });
    }
    if (source) {
      qb.andWhere('b.source = :source', { source });
    }
    if (status !== undefined) {
      qb.andWhere('b.status = :status', { status });
    }

    const [rows, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      list: rows.map((row) => this.toListItem(row)),
      total,
      page,
      pageSize,
    };
  }

  async createManual(
    dto: CreateIpBlacklistDto,
    userId: string,
  ): Promise<IpBlacklistListItem> {
    const ip = dto.ip.trim();
    if (!isIpv4(ip)) {
      throw new BadRequestException('Invalid IPv4 address');
    }

    const existing = await this.blacklistRepo.findOne({ where: { ip } });
    if (existing && existing.status === 1 && !this.isExpired(existing.expiresAt)) {
      throw new ConflictException('IP already blocked');
    }

    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    if (expiresAt && Number.isNaN(expiresAt.getTime())) {
      throw new BadRequestException('Invalid expiresAt');
    }

    const entity =
      existing ??
      this.blacklistRepo.create({
        ip,
        source: 'manual',
        status: 1,
        expiresAt,
        remark: dto.remark?.trim() || null,
        createdBy: userId,
      });

    entity.source = 'manual';
    entity.status = 1;
    entity.expiresAt = expiresAt;
    entity.remark = dto.remark?.trim() || null;
    entity.createdBy = userId;

    const saved = await this.blacklistRepo.save(entity);
    await this.setRedisBlock(ip, saved.expiresAt);
    return this.toListItem(saved);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findEntityById(id);
    await this.blacklistRepo.remove(row);
    await this.clearRedisBlock(row.ip);
  }

  async updateStatus(id: string, status: number): Promise<IpBlacklistListItem> {
    if (status !== 0 && status !== 1) {
      throw new BadRequestException('Invalid status');
    }

    const row = await this.findEntityById(id);
    row.status = status;
    const saved = await this.blacklistRepo.save(row);

    if (status === 1 && !this.isExpired(saved.expiresAt)) {
      await this.setRedisBlock(saved.ip, saved.expiresAt);
    } else {
      await this.clearRedisBlock(saved.ip);
    }

    return this.toListItem(saved);
  }

  private async findEntityById(id: string): Promise<SysIpBlacklistEntity> {
    const row = await this.blacklistRepo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException('Blacklist record not found');
    }
    return row;
  }

  private isExpired(expiresAt: Date | null): boolean {
    return expiresAt !== null && expiresAt.getTime() <= Date.now();
  }

  private blockKey(ip: string): string {
    return `ip:blacklist:${ip}`;
  }

  private failKey(ip: string): string {
    return `ip:login-fail:${ip}`;
  }

  private async setRedisBlock(ip: string, expiresAt: Date | null): Promise<void> {
    const redis = this.redisService.getClient();
    if (!redis) {
      return;
    }

    const key = this.blockKey(ip);
    if (expiresAt) {
      const ttlSec = Math.max(1, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      await redis.set(key, '1', 'EX', ttlSec);
      return;
    }

    await redis.set(key, '1');
  }

  private async clearRedisBlock(ip: string): Promise<void> {
    const redis = this.redisService.getClient();
    if (!redis) {
      return;
    }
    await redis.del(this.blockKey(ip));
  }

  private toListItem(row: SysIpBlacklistEntity): IpBlacklistListItem {
    return {
      id: toApiId(row.id),
      ip: row.ip,
      source: row.source,
      status: row.status,
      expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
      remark: row.remark,
      createdBy: row.createdBy ? toApiId(row.createdBy) : null,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
