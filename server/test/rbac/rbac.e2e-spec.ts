jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ErrorCode } from '@nova/shared-types';
import { createE2eApp, E2eAppContext } from '../auth/e2e-app.helper';
import { seedLimitedUser } from '../auth/seed-limited-user';

describe('RBAC CRUD API (e2e)', () => {
  let ctx: E2eAppContext;
  let app: INestApplication<App>;
  let adminToken: string;
  let memberToken: string;
  let adminUserId: string;

  async function loginAdmin(): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    adminUserId = res.body.data.user.id;
    return res.body.data.tokens.accessToken;
  }

  async function loginMember(): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/api/member/auth/login')
      .send({ phone: '13800138000', password: 'member123' });
    return res.body.data.tokens.accessToken;
  }

  beforeAll(async () => {
    ctx = await createE2eApp();
    app = ctx.app;
    adminToken = await loginAdmin();
    memberToken = await loginMember();
    await seedLimitedUser(ctx.dataSource);
  }, 30000);

  afterAll(async () => {
    await app?.close();
  });

  describe('Users API', () => {
    let createdUserId: string;
    let testRoleId: string;

    it('GET /users 应返回用户列表', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(res.body.data.list.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.list[0]).toHaveProperty('username');
      expect(res.body.data.list[0]).toHaveProperty('roleCodes');
    });

    it('POST /users 应创建用户（密码 bcrypt 存储）', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'e2e_user',
          password: 'e2e_pass123',
          nickname: 'E2E 用户',
          status: 1,
        })
        .expect(201);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(res.body.data.username).toBe('e2e_user');
      expect(res.body.data.nickname).toBe('E2E 用户');
      expect(res.body.data).not.toHaveProperty('password');
      expect(res.body.data).not.toHaveProperty('passwordHash');
      createdUserId = res.body.data.id;

      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'e2e_user', password: 'e2e_pass123' })
        .expect(200);

      expect(loginRes.body.data.user.username).toBe('e2e_user');
    });

    it('GET /users/:id 应返回用户详情', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.id).toBe(createdUserId);
      expect(res.body.data.username).toBe('e2e_user');
      expect(res.body.data.roleIds).toEqual([]);
    });

    it('PUT /users/:id 应更新用户（不含密码）', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nickname: 'E2E 用户（已更新）', status: 1 })
        .expect(200);

      expect(res.body.data.nickname).toBe('E2E 用户（已更新）');
    });

    it('PUT /users/:id/roles 应分配角色', async () => {
      const rolesRes = await request(app.getHttpServer())
        .get('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`);

      const limitedRole = rolesRes.body.data.list.find(
        (r: { code: string }) => r.code === 'limited_user',
      );
      expect(limitedRole).toBeDefined();
      testRoleId = limitedRole.id;

      const res = await request(app.getHttpServer())
        .put(`/api/users/${createdUserId}/roles`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ roleIds: [testRoleId] })
        .expect(200);

      expect(res.body.data.roleIds).toContain(testRoleId);
      expect(res.body.data.roleCodes).toContain('limited_user');
    });

    it('DELETE /users/:id 禁止删除当前登录用户', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/users/${adminUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(res.body.code).toBe(ErrorCode.BAD_REQUEST);
    });

    it('DELETE /users/:id 应删除其他用户', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.success).toBe(true);

      await request(app.getHttpServer())
        .get(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('无 system:user:create 权限的用户 POST /users 应返回 403', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'limited', password: 'limited123' });

      const limitedToken = loginRes.body.data.tokens.accessToken;

      const res = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${limitedToken}`)
        .send({
          username: 'forbidden_user',
          password: 'pass123456',
        })
        .expect(403);

      expect(res.body.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('member token 访问 GET /users 应返回 403', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403);

      expect(res.body.code).toBe(ErrorCode.FORBIDDEN);
    });
  });

  describe('Roles API', () => {
    let createdRoleId: string;

    it('GET /roles 应返回角色列表', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(res.body.data.list.some((r: { code: string }) => r.code === 'super_admin')).toBe(
        true,
      );
    });

    it('POST /roles 应创建角色', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'E2E 测试角色',
          code: 'e2e_test_role',
          status: 1,
          sort: 50,
        })
        .expect(201);

      expect(res.body.data.code).toBe('e2e_test_role');
      createdRoleId = res.body.data.id;
    });

    it('GET /roles/:id 应返回角色详情含权限', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/roles/${createdRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.id).toBe(createdRoleId);
      expect(res.body.data.permissionCodes).toEqual([]);
    });

    it('PUT /roles/:id 应更新角色', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/roles/${createdRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'E2E 测试角色（已更新）', sort: 51 })
        .expect(200);

      expect(res.body.data.name).toBe('E2E 测试角色（已更新）');
      expect(res.body.data.sort).toBe(51);
    });

    it('PUT /roles/:id/permissions 应分配权限', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/roles/${createdRoleId}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ permissionCodes: ['system:user:list', 'content:article:list'] })
        .expect(200);

      expect(res.body.data.permissionCodes).toContain('system:user:list');
      expect(res.body.data.permissionCodes).toContain('content:article:list');
    });

    it('DELETE /roles/:id 禁止删除 super_admin 角色', async () => {
      const rolesRes = await request(app.getHttpServer())
        .get('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`);

      const superAdmin = rolesRes.body.data.list.find(
        (r: { code: string }) => r.code === 'super_admin',
      );

      const res = await request(app.getHttpServer())
        .delete(`/api/roles/${superAdmin.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(res.body.code).toBe(ErrorCode.BAD_REQUEST);
    });

    it('DELETE /roles/:id 应删除普通角色', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/roles/${createdRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.success).toBe(true);

      await request(app.getHttpServer())
        .get(`/api/roles/${createdRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('无 system:role:list 权限的用户 GET /roles 应返回 403', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'limited', password: 'limited123' });

      const res = await request(app.getHttpServer())
        .get('/api/roles')
        .set('Authorization', `Bearer ${loginRes.body.data.tokens.accessToken}`)
        .expect(403);

      expect(res.body.code).toBe(ErrorCode.FORBIDDEN);
    });
  });

  describe('Menus API', () => {
    let createdMenuId: string;

    it('GET /menus 应返回菜单列表', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/menus')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(res.body.data.list.length).toBeGreaterThan(0);
      expect(res.body.data.list[0]).toHaveProperty('parentId');
    });

    it('POST /menus 应创建菜单', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/menus')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          parentId: '0',
          name: 'E2E 测试菜单',
          path: '/e2e-test',
          component: 'views/e2e/test',
          icon: 'Star',
          type: 'menu',
          permissionCode: 'system:user:list',
          sort: 99,
          visible: 1,
          status: 1,
        })
        .expect(201);

      expect(res.body.data.name).toBe('E2E 测试菜单');
      createdMenuId = res.body.data.id;
    });

    it('GET /auth/me/menus 创建菜单后应反映变更', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/auth/me/menus')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const findMenu = (nodes: Array<{ name: string; children?: unknown[] }>): boolean =>
        nodes.some(
          (n) =>
            n.name === 'E2E 测试菜单' ||
            (n.children ? findMenu(n.children as typeof nodes) : false),
        );

      expect(findMenu(res.body.data)).toBe(true);
    });

    it('PUT /menus/:id 应更新菜单', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/menus/${createdMenuId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'E2E 测试菜单（已更新）' })
        .expect(200);

      expect(res.body.data.name).toBe('E2E 测试菜单（已更新）');
    });

    it('DELETE /menus/:id 有子菜单时应拒绝删除', async () => {
      const parentRes = await request(app.getHttpServer())
        .post('/api/menus')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          parentId: '0',
          name: 'E2E 父菜单',
          path: '/e2e-parent',
          type: 'directory',
          sort: 100,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/menus')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          parentId: parentRes.body.data.id,
          name: 'E2E 子菜单',
          path: '/e2e-parent/child',
          type: 'menu',
          sort: 1,
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .delete(`/api/menus/${parentRes.body.data.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(res.body.code).toBe(ErrorCode.BAD_REQUEST);
    });

    it('DELETE /menus/:id 应删除无子菜单的菜单', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/menus/${createdMenuId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.success).toBe(true);

      const menusRes = await request(app.getHttpServer())
        .get('/api/auth/me/menus')
        .set('Authorization', `Bearer ${adminToken}`);

      const findMenu = (nodes: Array<{ name: string; children?: unknown[] }>): boolean =>
        nodes.some(
          (n) =>
            n.name === 'E2E 测试菜单（已更新）' ||
            (n.children ? findMenu(n.children as typeof nodes) : false),
        );

      expect(findMenu(menusRes.body.data)).toBe(false);
    });

    it('无 system:menu:list 权限的用户 GET /menus 应返回 403', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'limited', password: 'limited123' });

      const res = await request(app.getHttpServer())
        .get('/api/menus')
        .set('Authorization', `Bearer ${loginRes.body.data.tokens.accessToken}`)
        .expect(403);

      expect(res.body.code).toBe(ErrorCode.FORBIDDEN);
    });
  });
});
