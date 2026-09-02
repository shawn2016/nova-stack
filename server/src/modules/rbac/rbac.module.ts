import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  SysMenuEntity,
  SysPermissionEntity,
  SysRoleEntity,
  SysRolePermissionEntity,
  SysUserEntity,
  SysUserRoleEntity,
} from '../../database/entities';
import { AuthModule } from '../auth/auth.module';
import { PermissionGuard } from './guards/permission.guard';
import { MenuController } from './menu/menu.controller';
import { MenuService } from './menu/menu.service';
import { RoleController } from './role/role.controller';
import { RoleService } from './role/role.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      SysUserEntity,
      SysUserRoleEntity,
      SysRoleEntity,
      SysRolePermissionEntity,
      SysPermissionEntity,
      SysMenuEntity,
    ]),
  ],
  controllers: [UserController, RoleController, MenuController],
  providers: [
    UserService,
    RoleService,
    MenuService,
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class RbacModule {}
