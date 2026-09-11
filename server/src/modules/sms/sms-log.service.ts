import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { PaginationResult, SmsLogListItem } from '@nova/shared-types';
import { Repository } from 'typeorm';
import { SysSmsLogEntity } from '../../database/entities';
import { toApiId } from '../../common/utils/to-api-id';
import { ListSmsLogsDto } from './dto/sms-send.dto';

@Injectable()
export class SmsLogService {
  constructor(
    @InjectRepository(SysSmsLogEntity)
    private readonly logRepo: Repository<SysSmsLogEntity>,
  ) {}

  async list(query: ListSmsLogsDto): Promise<PaginationResult<SmsLogListItem>> {
    const { page = 1, pageSize = 10, phone, templateCode } = query;
    const qb = this.logRepo.createQueryBuilder('l').orderBy('l.sentAt', 'DESC');

    if (phone?.trim()) {
      qb.andWhere('l.phone LIKE :phone', { phone: `%${phone.trim()}%` });
    }
    if (templateCode?.trim()) {
      qb.andWhere('l.templateCode = :templateCode', { templateCode: templateCode.trim() });
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

  private toListItem(row: SysSmsLogEntity): SmsLogListItem {
    return {
      id: toApiId(row.id),
      channelId: toApiId(row.channelId),
      templateCode: row.templateCode,
      phone: row.phone,
      content: row.content,
      status: row.status as 0 | 1,
      providerMessage: row.providerMessage,
      sentAt: row.sentAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
    };
  }
}
