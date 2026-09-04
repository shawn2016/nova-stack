import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import type {
  AdminInfo,
  AdminLoginResponse,
  ChangePasswordDto,
  MenuNode,
  TokenPair,
  UpdateProfileDto,
} from '@nova/shared-types';
import { In, Repository } from 'typeorm';
import { JwtService } from '../../common/jwt/jwt.service';
import { toApiId } from '../../common/utils/to-api-id';
import {
  SysMenuEntity,
  SysPermissionEntity,
  SysRoleEntity,
  SysRolePermissionEntity,
  SysUserEntity,
  SysUserRoleEntity,
} from '../../database/entities';
import { RedisService } from '../../redis/redis.service';
import { LoginLogService } from '../audit/login-log.service';
import { OnlineSessionService } from '../online-session/online-session.service';
import { LoginDto } from './dto/login.dto';

export interface LoginContext {
  ip: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(SysUserEntity)
    private readonly userRepo: Repository<SysUserEntity>,
    @InjectRepository(SysUserRoleEntity)
    private readonly userRoleRepo: Repository<SysUserRoleEntity>,
    @InjectRepository(SysRoleEntity)
    private readonly roleRepo: Repository<SysRoleEntity>,
    @InjectRepository(SysRolePermissionEntity)
    private readonly rolePermissionRepo: Repository<SysRolePermissionEntity>,
    @InjectRepository(SysPermissionEntity)
    private readonly permissionRepo: Repository<SysPermissionEntity>,
    @InjectRepository(SysMenuEntity)
    private readonly menuRepo: Repository<SysMenuEntity>,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly loginLogService: LoginLogService,
    private readonly onlineSessionService: OnlineSessionService,
  ) {}

  async login(
    dto: LoginDto,
    context: LoginContext = { ip: '' },
  ): Promise<AdminLoginResponse> {
    const { ip, userAgent } = context;
    const user = await this.userRepo.findOne({
      where: { username: dto.username },
    });

    if (!user || user.status !== 1) {
      await this.loginLogService.recordLoginAttempt({
        username: dto.username,
        ip,
        userAgent,
        success: false,
        message: 'Invalid credentials',
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      await this.loginLogService.recordLoginAttempt({
        username: dto.username,
        userId: user.id,
        ip,
        userAgent,
        success: false,
        message: 'Invalid credentials',
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.loginLogService.recordLoginAttempt({
      username: dto.username,
      userId: user.id,
      ip,
      userAgent,
      success: true,
    });

    const { roles, permissions } = await this.loadRolesAndPermissions(user.id);
    const tokens = await this.issueTokenPair(user.id);

    const accessJti = this.jwtService.extractJti(tokens.accessToken);
    await this.onlineSessionService.register(
      accessJti,
      {
        userId: toApiId(user.id),
        username: user.username,
        ip,
        userAgent: userAgent ?? null,
        loginAt: new Date().toISOString(),
      },
      tokens.expiresIn,
    );

    return {
      tokens,
      user: this.toAdminInfo(user, roles, permissions),
    };
  }

  async logout(accessToken: string): Promise<{ success: true }> {
    if (!accessToken) {
      throw new UnauthorizedException('Missing token');
    }

    const payload = await this.jwtService.verifyToken(accessToken);
    const ttl = Math.max(payload.exp - Math.floor(Date.now() / 1000), 1);
    await this.jwtService.blacklist(payload.jti, ttl);
    await this.onlineSessionService.remove(payload.jti);

    return { success: true };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const payload = await this.jwtService.verifyToken(refreshToken);

    if (payload.type !== 'admin') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.assertRefreshTokenValid('admin', payload.sub, refreshToken);

    const accessToken = await this.jwtService.signAccessToken({
      userId: payload.sub,
      type: 'admin',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getAccessExpiresInSeconds(),
    };
  }

  async getMe(userId: string): Promise<AdminInfo> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || user.status !== 1) {
      throw new UnauthorizedException('User not found');
    }

    const { roles, permissions } = await this.loadRolesAndPermissions(userId);
    return this.toAdminInfo(user, roles, permissions);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<AdminInfo> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || user.status !== 1) {
      throw new UnauthorizedException('User not found');
    }

    if (dto.nickname !== undefined) {
      user.nickname = dto.nickname;
    }
    if (dto.avatar !== undefined) {
      user.avatar = dto.avatar;
    }

    const saved = await this.userRepo.save(user);
    const { roles, permissions } = await this.loadRolesAndPermissions(userId);
    return this.toAdminInfo(saved, roles, permissions);
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ success: true }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || user.status !== 1) {
      throw new UnauthorizedException('User not found');
    }

    const passwordValid = await bcrypt.compare(
      dto.oldPassword,
      user.passwordHash,
    );
    if (!passwordValid) {
      throw new BadRequestException('Invalid old password');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepo.save(user);

    return { success: true };
  }

  async getMenus(userId: string): Promise<MenuNode[]> {
    const { permissions } = await this.loadRolesAndPermissions(userId);
    const permissionSet = new Set(permissions);

    const menus = await this.menuRepo.find({
      where: { status: 1, visible: 1 },
      order: { sort: 'ASC' },
    });

    const accessible = menus.filter((menu) => {
      if (menu.type === 'button') {
        return false;
      }
      if (!menu.permissionCode) {
        return true;
      }
      return permissionSet.has(menu.permissionCode);
    });

    return this.buildMenuTree(accessible);
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const { permissions } = await this.loadRolesAndPermissions(userId);
    return permissions;
  }

  private async issueTokenPair(userId: string): Promise<TokenPair> {
    const accessToken = await this.jwtService.signAccessToken({
      userId,
      type: 'admin',
    });
    const refreshToken = await this.jwtService.signRefreshToken({
      userId,
      type: 'admin',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getAccessExpiresInSeconds(),
    };
  }

  private async loadRolesAndPermissions(userId: string): Promise<{
    roles: string[];
    permissions: string[];
  }> {
    const userRoles = await this.userRoleRepo.find({ where: { userId } });
    if (!userRoles.length) {
      return { roles: [], permissions: [] };
    }

    const roleIds = userRoles.map((link) => link.roleId);
    const roles = await this.roleRepo.find({ where: { id: In(roleIds) } });
    const activeRoles = roles.filter((role) => role.status === 1);
    const roleCodes = activeRoles.map((role) => role.code);

    const rolePermissions = await this.rolePermissionRepo.find({
      where: { roleId: In(roleIds) },
    });
    const permissionIds = rolePermissions.map((link) => link.permissionId);

    if (!permissionIds.length) {
      return { roles: roleCodes, permissions: [] };
    }

    const permissions = await this.permissionRepo.find({
      where: { id: In(permissionIds) },
    });
    const permissionCodes = [...new Set(permissions.map((p) => p.code))];

    return { roles: roleCodes, permissions: permissionCodes };
  }

  private toAdminInfo(
    user: SysUserEntity,
    roles: string[],
    permissions: string[],
  ): AdminInfo {
    return {
      id: toApiId(user.id),
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar ?? '',
      roles,
      permissions,
    };
  }

  private buildMenuTree(menus: SysMenuEntity[], parentId = '0'): MenuNode[] {
    const normalizedParent = String(parentId);
    return menus
      .filter((menu) => String(menu.parentId) === normalizedParent)
      .map((menu) => {
        const children = this.buildMenuTree(menus, menu.id);
        const node: MenuNode = {
          id: toApiId(menu.id),
          name: menu.name,
          path: menu.path ?? '',
          component: menu.component ?? '',
          icon: menu.icon ?? '',
          type: menu.type as MenuNode['type'],
        };
        if (children.length > 0) {
          node.children = children;
        }
        return node;
      });
  }

  private getAccessExpiresInSeconds(): number {
    const raw =
      this.configService.get<string>('jwt.accessExpiresIn') ?? '2h';
    return parseDurationToSeconds(raw);
  }

  private async assertRefreshTokenValid(
    type: 'admin' | 'member',
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const skipExternal =
      this.configService.get<boolean>('app.skipExternalServices') ?? false;
    const redis = this.redisService.getClient();

    if (!redis) {
      if (!skipExternal) {
        throw new UnauthorizedException('Auth service unavailable');
      }
      return;
    }

    const key =
      type === 'admin'
        ? `refresh:admin:${userId}`
        : `refresh:member:${userId}`;
    const stored = await redis.get(key);

    if (stored !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}

/** 将 jwt expiresIn 字符串（如 2h、7d）转为秒 */
export function parseDurationToSeconds(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) {
    return 7200;
  }

  const amount = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return amount;
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 3600;
    case 'd':
      return amount * 86400;
    default:
      return 7200;
  }
}
