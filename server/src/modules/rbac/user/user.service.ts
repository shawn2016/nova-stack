import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { PaginationResult, SysUserDetail, SysUserListItem } from '@nova/shared-types';
import * as bcrypt from 'bcrypt';
import { In, Repository } from 'typeorm';
import {
  SysRoleEntity,
  SysUserEntity,
  SysUserRoleEntity,
} from '../../../database/entities';
import { AssignUserRolesDto } from './dto/assign-user-roles.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(SysUserEntity)
    private readonly userRepo: Repository<SysUserEntity>,
    @InjectRepository(SysUserRoleEntity)
    private readonly userRoleRepo: Repository<SysUserRoleEntity>,
    @InjectRepository(SysRoleEntity)
    private readonly roleRepo: Repository<SysRoleEntity>,
  ) {}

  async list(): Promise<PaginationResult<SysUserListItem>> {
    const users = await this.userRepo.find({ order: { id: 'ASC' } });
    const list = await Promise.all(users.map((user) => this.toListItem(user)));
    return {
      list,
      total: list.length,
      page: 1,
      pageSize: list.length || 1,
    };
  }

  async findById(id: string): Promise<SysUserDetail> {
    const user = await this.findEntityById(id);
    return this.toDetail(user);
  }

  async create(dto: CreateUserDto): Promise<SysUserDetail> {
    const existing = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException('Username already exists');
    }

    const user = this.userRepo.create({
      username: dto.username,
      passwordHash: await bcrypt.hash(dto.password, 10),
      nickname: dto.nickname ?? dto.username,
      avatar: null,
      status: dto.status ?? 1,
    });
    const saved = await this.userRepo.save(user);
    return this.toDetail(saved);
  }

  async update(id: string, dto: UpdateUserDto): Promise<SysUserDetail> {
    const user = await this.findEntityById(id);

    if (dto.nickname !== undefined) user.nickname = dto.nickname;
    if (dto.status !== undefined) user.status = dto.status;

    const saved = await this.userRepo.save(user);
    return this.toDetail(saved);
  }

  async assignRoles(id: string, dto: AssignUserRolesDto): Promise<SysUserDetail> {
    await this.findEntityById(id);

    const roleIds = dto.roleIds.map(String);
    if (roleIds.length > 0) {
      const roles = await this.roleRepo.find({ where: { id: In(roleIds) } });
      if (roles.length !== roleIds.length) {
        throw new BadRequestException('One or more roles not found');
      }
    }

    await this.userRoleRepo.delete({ userId: id });

    for (const roleId of roleIds) {
      await this.userRoleRepo.save(
        this.userRoleRepo.create({ userId: id, roleId }),
      );
    }

    const user = await this.findEntityById(id);
    return this.toDetail(user);
  }

  async remove(id: string, currentUserId: string): Promise<{ success: true }> {
    if (String(id) === String(currentUserId)) {
      throw new BadRequestException('Cannot delete current login user');
    }

    const user = await this.findEntityById(id);
    await this.userRoleRepo.delete({ userId: id });
    await this.userRepo.remove(user);
    return { success: true };
  }

  private async findEntityById(id: string): Promise<SysUserEntity> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private async loadRoleInfo(userId: string): Promise<{
    roleIds: number[];
    roleCodes: string[];
  }> {
    const links = await this.userRoleRepo.find({ where: { userId } });
    if (!links.length) {
      return { roleIds: [], roleCodes: [] };
    }

    const roleIds = links.map((link) => link.roleId);
    const roles = await this.roleRepo.find({ where: { id: In(roleIds) } });
    return {
      roleIds: roles.map((role) => Number(role.id)),
      roleCodes: roles.map((role) => role.code),
    };
  }

  private async toListItem(user: SysUserEntity): Promise<SysUserListItem> {
    const { roleIds, roleCodes } = await this.loadRoleInfo(user.id);
    return {
      id: Number(user.id),
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar ?? '',
      status: user.status as 0 | 1,
      roleIds,
      roleCodes,
    };
  }

  private async toDetail(user: SysUserEntity): Promise<SysUserDetail> {
    const listItem = await this.toListItem(user);
    return {
      ...listItem,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
