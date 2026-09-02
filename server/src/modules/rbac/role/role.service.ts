import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SysRoleEntity } from '../../../database/entities';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(SysRoleEntity)
    private readonly roleRepo: Repository<SysRoleEntity>,
  ) {}

  async list() {
    const list = await this.roleRepo.find({ order: { sort: 'ASC' } });
    return {
      list: list.map((role) => ({
        id: Number(role.id),
        name: role.name,
        code: role.code,
        status: role.status,
        sort: role.sort,
      })),
      total: list.length,
      page: 1,
      pageSize: list.length || 1,
    };
  }
}
