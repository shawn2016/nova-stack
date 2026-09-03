import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DATA_SCOPE_ALL,
  DATA_SCOPE_CUSTOM,
  DATA_SCOPE_DEPT,
  DATA_SCOPE_DEPT_AND_CHILD,
  DATA_SCOPE_SELF,
  type DataScopeFilter,
} from '@nova/shared-types';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import {
  SysConfigEntity,
  SysDeptEntity,
  SysRoleDeptEntity,
  SysRoleEntity,
  SysUserEntity,
  SysUserRoleEntity,
} from '../../database/entities';
import { toApiId } from '../../common/utils/to-api-id';
import { DeptService } from '../dept/dept.service';

const MODULE_ENABLED_KEY = 'data_scope.module.enabled';
const SUPER_ADMIN_ROLE_CODE = 'super_admin';

@Injectable()
export class DataScopeService {
  constructor(
    @InjectRepository(SysUserEntity)
    private readonly userRepo: Repository<SysUserEntity>,
    @InjectRepository(SysUserRoleEntity)
    private readonly userRoleRepo: Repository<SysUserRoleEntity>,
    @InjectRepository(SysRoleEntity)
    private readonly roleRepo: Repository<SysRoleEntity>,
    @InjectRepository(SysRoleDeptEntity)
    private readonly roleDeptRepo: Repository<SysRoleDeptEntity>,
    @InjectRepository(SysConfigEntity)
    private readonly configRepo: Repository<SysConfigEntity>,
    private readonly deptService: DeptService,
  ) {}

  async resolveForUser(userId: string): Promise<DataScopeFilter> {
    if (!(await this.isModuleEnabled())) {
      return { type: 'all' };
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      return { type: 'none' };
    }

    const links = await this.userRoleRepo.find({ where: { userId } });
    if (!links.length) {
      return { type: 'self', userId: toApiId(userId) };
    }

    const roleIds = links.map((link) => link.roleId);
    const roles = await this.roleRepo.find({
      where: { id: In(roleIds), status: 1 },
    });

    if (roles.some((role) => role.code === SUPER_ADMIN_ROLE_CODE)) {
      return { type: 'all' };
    }

    const deptIdSet = new Set<string>();
    let includeSelf = false;

    for (const role of roles) {
      const scope = role.dataScope ?? DATA_SCOPE_ALL;
      if (scope === DATA_SCOPE_ALL) {
        return { type: 'all' };
      }
      if (scope === DATA_SCOPE_SELF) {
        includeSelf = true;
        continue;
      }
      if (scope === DATA_SCOPE_DEPT) {
        if (user.deptId) {
          deptIdSet.add(toApiId(user.deptId));
        }
        continue;
      }
      if (scope === DATA_SCOPE_DEPT_AND_CHILD) {
        if (user.deptId) {
          const ids = await this.deptService.collectDescendantIds(user.deptId);
          ids.forEach((id) => deptIdSet.add(id));
        }
        continue;
      }
      if (scope === DATA_SCOPE_CUSTOM) {
        const roleDepts = await this.roleDeptRepo.find({
          where: { roleId: role.id },
        });
        roleDepts.forEach((item) => deptIdSet.add(toApiId(item.deptId)));
      }
    }

    if (deptIdSet.size > 0) {
      return { type: 'depts', deptIds: [...deptIdSet] };
    }
    if (includeSelf) {
      return { type: 'self', userId: toApiId(userId) };
    }
    return { type: 'none' };
  }

  applyUserFilter(
    qb: SelectQueryBuilder<SysUserEntity>,
    alias: string,
    filter: DataScopeFilter,
  ): void {
    if (filter.type === 'all') {
      return;
    }
    if (filter.type === 'none') {
      qb.andWhere('1 = 0');
      return;
    }
    if (filter.type === 'self') {
      qb.andWhere(`${alias}.id = :scopeUserId`, { scopeUserId: filter.userId });
      return;
    }
    if (filter.deptIds.length === 0) {
      qb.andWhere('1 = 0');
      return;
    }
    qb.andWhere(`${alias}.dept_id IN (:...scopeDeptIds)`, {
      scopeDeptIds: filter.deptIds,
    });
  }

  private async isModuleEnabled(): Promise<boolean> {
    const config = await this.configRepo.findOne({
      where: { configKey: MODULE_ENABLED_KEY },
    });
    return config?.configValue !== 'false';
  }
}

export { MODULE_ENABLED_KEY, SUPER_ADMIN_ROLE_CODE as DATA_SCOPE_SUPER_ADMIN_CODE };
