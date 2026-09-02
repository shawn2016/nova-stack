import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SysMenuEntity } from '../../../database/entities';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(SysMenuEntity)
    private readonly menuRepo: Repository<SysMenuEntity>,
  ) {}

  async list() {
    const list = await this.menuRepo.find({ order: { sort: 'ASC' } });
    return {
      list: list.map((menu) => ({
        id: Number(menu.id),
        name: menu.name,
        path: menu.path,
        type: menu.type,
        sort: menu.sort,
      })),
      total: list.length,
      page: 1,
      pageSize: list.length || 1,
    };
  }
}
