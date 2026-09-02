jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ErrorCode } from '@nova/shared-types';
import { createE2eApp, E2eAppContext } from './e2e-app.helper';
import { seedLimitedUser } from './seed-limited-user';

describe('Auth API (e2e)', () => {
  let ctx: E2eAppContext;
  let app: INestApplication<App>;

  beforeAll(async () => {
    ctx = await createE2eApp();
    app = ctx.app;
  }, 30000);

  afterAll(async () => {
    await app?.close();
  });

  describe('POST /auth/login', () => {
    it('有效凭据应返回 200、TokenPair 与 AdminInfo', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin', password: 'admin123' })
        .expect(200);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.tokens.refreshToken).toBeDefined();
      expect(res.body.data.tokens.expiresIn).toBeGreaterThan(0);
      expect(res.body.data.user.username).toBe('admin');
      expect(res.body.data.user.roles).toContain('super_admin');
      expect(res.body.data.user.permissions.length).toBeGreaterThan(0);
    });

    it('错误密码应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin', password: 'wrong-password' })
        .expect(401);

      expect(res.body.code).toBe(ErrorCode.UNAUTHORIZED);
    });
  });

  describe('POST /auth/logout + blacklist', () => {
    it('登出后 accessToken 应被拒绝', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin', password: 'admin123' });

      const accessToken = loginRes.body.data.tokens.accessToken;

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const meRes = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);

      expect(meRes.body.code).toBe(ErrorCode.UNAUTHORIZED);
    });
  });

  describe('POST /auth/refresh', () => {
    it('有效 refreshToken 应返回新 accessToken', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin', password: 'admin123' });

      const { refreshToken } = loginRes.body.data.tokens;

      const refreshRes = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshRes.body.data.accessToken).toBeDefined();
      expect(refreshRes.body.data.expiresIn).toBeGreaterThan(0);

      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${refreshRes.body.data.accessToken}`)
        .expect(200);
    });
  });

  describe('GET /auth/me', () => {
    it('携带有效 Token 应返回当前管理员信息', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin', password: 'admin123' });

      const accessToken = loginRes.body.data.tokens.accessToken;

      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.username).toBe('admin');
      expect(res.body.data.roles).toContain('super_admin');
      expect(res.body.data.permissions).toContain('system:user:list');
    });
  });

  describe('PUT /auth/me', () => {
    it('应更新 nickname 并在 GET /auth/me 中反映', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin', password: 'admin123' });

      const accessToken = loginRes.body.data.tokens.accessToken;
      const originalNickname = loginRes.body.data.user.nickname;

      const updateRes = await request(app.getHttpServer())
        .put('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ nickname: '新昵称' })
        .expect(200);

      expect(updateRes.body.data.nickname).toBe('新昵称');

      const meRes = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(meRes.body.data.nickname).toBe('新昵称');

      await request(app.getHttpServer())
        .put('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ nickname: originalNickname })
        .expect(200);
    });
  });

  describe('PUT /auth/me/password', () => {
    it('旧密码正确时应改密成功且新密码可登录', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin', password: 'admin123' });

      const accessToken = loginRes.body.data.tokens.accessToken;

      await request(app.getHttpServer())
        .put('/auth/me/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ oldPassword: 'admin123', newPassword: 'newpass123' })
        .expect(200);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin', password: 'newpass123' })
        .expect(200);

      const restoreLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin', password: 'newpass123' });

      await request(app.getHttpServer())
        .put('/auth/me/password')
        .set(
          'Authorization',
          `Bearer ${restoreLogin.body.data.tokens.accessToken}`,
        )
        .send({ oldPassword: 'newpass123', newPassword: 'admin123' })
        .expect(200);
    });

    it('旧密码错误应返回 400', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin', password: 'admin123' });

      const accessToken = loginRes.body.data.tokens.accessToken;

      const res = await request(app.getHttpServer())
        .put('/auth/me/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ oldPassword: 'wrong-old-password', newPassword: 'newpass123' })
        .expect(400);

      expect(res.body.code).toBe(ErrorCode.BAD_REQUEST);
      expect(res.body.message).toBe('Invalid old password');

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin', password: 'admin123' })
        .expect(200);
    });
  });

  describe('GET /auth/me/menus', () => {
    it('超级管理员应返回完整菜单树', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin', password: 'admin123' });

      const accessToken = loginRes.body.data.tokens.accessToken;

      const res = await request(app.getHttpServer())
        .get('/auth/me/menus')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const systemDir = res.body.data.find(
        (m: { name: string }) => m.name === '系统管理',
      );
      expect(systemDir).toBeDefined();
      expect(systemDir.children?.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('PermissionGuard 403', () => {
    beforeAll(async () => {
      await seedLimitedUser(ctx.dataSource);
    });

    it('无 system:role:list 权限的用户访问 GET /roles 应返回 403', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'limited', password: 'limited123' });

      expect(loginRes.status).toBe(200);
      const accessToken = loginRes.body.data.tokens.accessToken;

      const res = await request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);

      expect(res.body.code).toBe(ErrorCode.FORBIDDEN);
    });
  });

  describe('CORS', () => {
    it('admin dev origin 应获得 Access-Control-Allow-Origin', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .set('Origin', 'http://localhost:5173')
        .expect(200);

      expect(res.headers['access-control-allow-origin']).toBe(
        'http://localhost:5173',
      );
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });
  });
});
