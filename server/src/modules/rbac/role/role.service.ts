import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { PaginationResult, SysRoleDetail, SysRoleListItem } from '@nova/shared-types';
import { In, Repository } from 'typeorm';
import {
  SysPermissionEntity,
  SysRoleEntity,
  SysRolePermissionEntity,
} from '../../../database/entities';
import { AssignRolePermissionsDto } from './dto/assign-role-permissions.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

const SUPER_ADMIN_ROLE_CODE = 'super_admin';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(SysRoleEntity)
    private readonly roleRepo: Repository<SysRoleEntity>,
    @InjectRepository(SysRolePermissionEntity)
    private readonly rolePermissionRepo: Repository<SysRolePermissionEntity>,
    @InjectRepository(SysPermissionEntity)
    private readonly permissionRepo: Repository<SysPermissionEntity>,
  ) {}

  async list(): Promise<PaginationResult<SysRoleListItem>> {
    const list = await this.roleRepo.find({ order: { sort: 'ASC' } });
    return {
      list: list.map((role) => this.toListItem(role)),
      total: list.length,
      page: 1,
      pageSize: list.length || 1,
    };
  }

  async findById(id: string): Promise<SysRoleDetail> {
    const role = await this.findEntityById(id);
    return this.toDetail(role);
  }

  async create(dto: CreateRoleDto): Promise<SysRoleDetail> {
    const existing = await this.roleRepo.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException('Role code already exists');
    }

    const role = this.roleRepo.create({
      name: dto.name,
      code: dto.code,
      status: dto.status ?? 1,
      sort: dto.sort ?? 0,
    });
    const saved = await this.roleRepo.save(role);
    return this.toDetail(saved);
  }

  async update(id: string, dto: UpdateRoleDto): Promise<SysRoleDetail> {
    const role = await this.findEntityById(id);

    if (dto.code !== undefined && dto.code !== role.code) {
      const existing = await this.roleRepo.findOne({ where: { code: dto.code } });
      if (existing) {
        throw new ConflictException('Role code already exists');
      }
      role.code = dto.code;
    }

    if (dto.name !== undefined) role.name = dto.name;
    if (dto.status !== undefined) role.status = dto.status;
    if (dto.sort !== undefined) role.sort = dto.sort;

    const saved = await this.roleRepo.save(role);
    return this.toDetail(saved);
  }

  async assignPermissions(
    id: string,
    dto: AssignRolePermissionsDto,
  ): Promise<SysRoleDetail> {
    const role = await this.findEntityById(id);

    const permissions = await this.permissionRepo.find({
      where: { code: In(dto.permissionCodes) },
    });

    if (permissions.length !== dto.permissionCodes.length) {
      throw new BadRequestException('One or more permissions not found');
    }

    await this.rolePermissionRepo.delete({ roleId: role.id });

    for (const permission of permissions) {
      await this.rolePermissionRepo.save(
        this.rolePermissionRepo.create({
          roleId: role.id,
          permissionId: permission.id,
        }),
      );
    }

    return this.toDetail(role);
  }

  async remove(id: string): Promise<{ success: true }> {
    const role = await this.findEntityById(id);

    if (role.code === SUPER_ADMIN_ROLE_CODE) {
      throw new BadRequestException('Cannot delete super_admin role');
    }

    await this.rolePermissionRepo.delete({ roleId: role.id });
    await this.roleRepo.remove(role);
    return { success: true };
  }

  private async findEntityById(id: string): Promise<SysRoleEntity> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  private toListItem(role: SysRoleEntity): SysRoleListItem {
    return {
      id: Number(role.id),
      name: role.name,
      code: role.code,
      status: role.status as 0 | 1,
      sort: role.sort,
    };
  }

  private async loadPermissionCodes(roleId: string): Promise<string[]> {
    const links = await this.rolePermissionRepo.find({ where: { roleId } });
    if (!links.length) {
      return [];
    }

    const permissionIds = links.map((link) => link.permissionId);
    const permissions = await this.permissionRepo.find({
      where: { id: In(permissionIds) },
    });
    return permissions.map((p) => p.code);
  }

  private async toDetail(role: SysRoleEntity): Promise<SysRoleDetail> {
    const permissionCodes = await this.loadPermissionCodes(role.id);
    return {
      ...this.toListItem(role),
      permissionCodes,
    };
  }
}
