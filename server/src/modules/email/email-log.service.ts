import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { EmailLogListItem, PaginationResult } from '@nova/shared-types';
import { Repository } from 'typeorm';
import { SysEmailLogEntity } from '../../database/entities';
import { toApiId } from '../../common/utils/to-api-id';
import { ListEmailLogsDto } from './dto/email-send.dto';

@Injectable()
export class EmailLogService {
  constructor(
    @InjectRepository(SysEmailLogEntity)
    private readonly logRepo: Repository<SysEmailLogEntity>,
  ) {}

  async list(query: ListEmailLogsDto): Promise<PaginationResult<EmailLogListItem>> {
    const { page = 1, pageSize = 10, to, templateCode } = query;
    const qb = this.logRepo.createQueryBuilder('l').orderBy('l.sentAt', 'DESC');

    if (to?.trim()) {
      qb.andWhere('l.to LIKE :to', { to: `%${to.trim()}%` });
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

  private toListItem(row: SysEmailLogEntity): EmailLogListItem {
    return {
      id: toApiId(row.id),
      channelId: toApiId(row.channelId),
      templateCode: row.templateCode,
      to: row.to,
      subject: row.subject,
      content: row.content,
      status: row.status as 0 | 1,
      providerMessage: row.providerMessage,
      sentAt: row.sentAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
    };
  }
}
