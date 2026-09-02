import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysMenuEntity, SysRoleEntity } from '../../database/entities';
import { AuthModule } from '../auth/auth.module';
import { PermissionGuard } from './guards/permission.guard';
import { MenuController } from './menu/menu.controller';
import { MenuService } from './menu/menu.service';
import { RoleController } from './role/role.controller';
import { RoleService } from './role/role.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([SysRoleEntity, SysMenuEntity]),
  ],
  controllers: [RoleController, MenuController],
  providers: [
    RoleService,
    MenuService,
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class RbacModule {}
