import { describe, expect, it } from 'vitest';
import {
  AdminInfo,
  AdminLoginRequest,
  AdminLoginResponse,
  AdminMeResponse,
  ChangePasswordDto,
  JwtPayload,
  MemberInfo,
  MemberLoginRequest,
  MemberLoginResponse,
  MemberRegisterRequest,
  MenuNode,
  RefreshTokenRequest,
  TokenPair,
  UpdateProfileDto,
  UploadResult,
} from './index.js';

describe('auth types', () => {
  it('TokenPair 包含 accessToken、refreshToken 与 expiresIn', () => {
    const tokens: TokenPair = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: 3600,
    };

    expect(tokens.accessToken).toBe('access-token');
    expect(tokens.refreshToken).toBe('refresh-token');
    expect(tokens.expiresIn).toBe(3600);
  });

  it('AdminInfo 包含 id、username、nickname、avatar、roles 与 permissions', () => {
    const admin: AdminInfo = {
      id: '1',
      username: 'admin',
      nickname: '管理员',
      avatar: 'https://example.com/avatar.png',
      roles: ['super_admin'],
      permissions: ['user:read', 'user:write'],
    };

    expect(admin.id).toBe('1');
    expect(admin.username).toBe('admin');
    expect(admin.roles).toEqual(['super_admin']);
    expect(admin.permissions).toEqual(['user:read', 'user:write']);
  });

  it('MemberInfo 包含 id、phone、nickname 与 avatar', () => {
    const member: MemberInfo = {
      id: '2',
      phone: '13800138000',
      nickname: '会员',
      avatar: 'https://example.com/member.png',
    };

    expect(member.id).toBe('2');
    expect(member.phone).toBe('13800138000');
    expect(member.nickname).toBe('会员');
  });

  it('MenuNode 支持 directory、menu、button 类型与嵌套 children', () => {
    const menu: MenuNode = {
      id: '1',
      name: '系统管理',
      path: '/system',
      component: 'Layout',
      icon: 'setting',
      type: 'directory',
      children: [
        {
          id: '2',
          name: '用户管理',
          path: '/system/user',
          component: 'system/user/index',
          icon: 'user',
          type: 'menu',
        },
        {
          id: '3',
          name: '新增用户',
          path: '',
          component: '',
          icon: '',
          type: 'button',
        },
      ],
    };

    expect(menu.type).toBe('directory');
    expect(menu.children).toHaveLength(2);
    expect(menu.children![0].type).toBe('menu');
    expect(menu.children![1].type).toBe('button');
  });

  it('JwtPayload 包含 sub、type、jti、iat 与 exp', () => {
    const payload: JwtPayload = {
      sub: '1',
      type: 'admin',
      jti: 'unique-jti',
      iat: 1700000000,
      exp: 1700003600,
    };

    expect(payload.sub).toBe('1');
    expect(payload.type).toBe('admin');
    expect(payload.jti).toBe('unique-jti');
  });

  it('AdminLoginRequest 包含 username 与 password', () => {
    const request: AdminLoginRequest = {
      username: 'admin',
      password: 'admin123',
    };

    expect(request.username).toBe('admin');
    expect(request.password).toBe('admin123');
  });

  it('MemberLoginRequest 包含 phone 与 password', () => {
    const request: MemberLoginRequest = {
      phone: '13800138000',
      password: 'member123',
    };

    expect(request.phone).toBe('13800138000');
    expect(request.password).toBe('member123');
  });

  it('MemberRegisterRequest 包含 phone、password 与可选 nickname', () => {
    const withNickname: MemberRegisterRequest = {
      phone: '13800138000',
      password: 'member123',
      nickname: '新会员',
    };
    const withoutNickname: MemberRegisterRequest = {
      phone: '13800138001',
      password: 'member123',
    };

    expect(withNickname.nickname).toBe('新会员');
    expect(withoutNickname.nickname).toBeUndefined();
  });

  it('AdminLoginResponse 包含 tokens 与 user', () => {
    const response: AdminLoginResponse = {
      tokens: {
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 3600,
      },
      user: {
        id: '1',
        username: 'admin',
        nickname: '管理员',
        avatar: '',
        roles: ['admin'],
        permissions: ['*'],
      },
    };

    expect(response.tokens.accessToken).toBe('access');
    expect(response.user.username).toBe('admin');
  });

  it('MemberLoginResponse 包含 tokens 与 user', () => {
    const response: MemberLoginResponse = {
      tokens: {
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 3600,
      },
      user: {
        id: '2',
        phone: '13800138000',
        nickname: '会员',
        avatar: '',
      },
    };

    expect(response.tokens.refreshToken).toBe('refresh');
    expect(response.user.phone).toBe('13800138000');
  });

  it('RefreshTokenRequest 包含 refreshToken', () => {
    const request: RefreshTokenRequest = {
      refreshToken: 'refresh-token',
    };

    expect(request.refreshToken).toBe('refresh-token');
  });

  it('AdminMeResponse 与 AdminInfo 结构一致', () => {
    const me: AdminMeResponse = {
      id: '1',
      username: 'admin',
      nickname: '管理员',
      avatar: '',
      roles: ['super_admin'],
      permissions: ['user:read'],
    };

    expect(me.roles).toEqual(['super_admin']);
    expect(me.permissions).toEqual(['user:read']);
  });

  it('UpdateProfileDto 支持可选 nickname 与 avatar', () => {
    const nicknameOnly: UpdateProfileDto = { nickname: '新昵称' };
    const avatarOnly: UpdateProfileDto = {
      avatar: 'https://example.com/avatar.png',
    };
    const both: UpdateProfileDto = {
      nickname: '新昵称',
      avatar: 'https://example.com/avatar.png',
    };

    expect(nicknameOnly.nickname).toBe('新昵称');
    expect(avatarOnly.avatar).toBe('https://example.com/avatar.png');
    expect(both.nickname).toBe('新昵称');
    expect(both.avatar).toBe('https://example.com/avatar.png');
  });

  it('ChangePasswordDto 包含 oldPassword 与 newPassword', () => {
    const dto: ChangePasswordDto = {
      oldPassword: 'admin123',
      newPassword: 'newpass123',
    };

    expect(dto.oldPassword).toBe('admin123');
    expect(dto.newPassword).toBe('newpass123');
  });

  it('UploadResult 包含 url、key、size 与 mimeType', () => {
    const result: UploadResult = {
      url: 'https://example.com/uploads/admin/1/abc.png',
      key: 'admin/1/abc.png',
      size: 1024,
      mimeType: 'image/png',
    };

    expect(result.url).toContain('/uploads/');
    expect(result.key).toBe('admin/1/abc.png');
    expect(result.size).toBe(1024);
    expect(result.mimeType).toBe('image/png');
  });
});
