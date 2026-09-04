import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  SysConfigEntity,
  SysRoleDeptEntity,
  SysRoleEntity,
  SysUserEntity,
  SysUserRoleEntity,
} from '../../database/entities';
import { DeptModule } from '../dept/dept.module';
import { DataScopeService } from './data-scope.service';

@Module({
  imports: [
    forwardRef(() => DeptModule),
    TypeOrmModule.forFeature([
      SysUserEntity,
      SysUserRoleEntity,
      SysRoleEntity,
      SysRoleDeptEntity,
      SysConfigEntity,
    ]),
  ],
  providers: [DataScopeService],
  exports: [DataScopeService],
})
export class DataScopeModule {}
