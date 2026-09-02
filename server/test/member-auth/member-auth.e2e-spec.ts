jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ErrorCode } from '@nova/shared-types';
import { createE2eApp, E2eAppContext } from '../auth/e2e-app.helper';

describe('Member Auth API (e2e)', () => {
  let ctx: E2eAppContext;
  let app: INestApplication<App>;

  beforeAll(async () => {
    ctx = await createE2eApp();
    app = ctx.app;
  }, 30000);

  afterAll(async () => {
    await app?.close();
  });

  describe('POST /member/auth/login', () => {
    it('有效凭据应返回 200、TokenPair 与 MemberInfo', async () => {
      const res = await request(app.getHttpServer())
        .post('/member/auth/login')
        .send({ phone: '13800138000', password: 'member123' })
        .expect(200);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.tokens.refreshToken).toBeDefined();
      expect(res.body.data.tokens.expiresIn).toBeGreaterThan(0);
      expect(res.body.data.user.phone).toBe('13800138000');
      expect(res.body.data.user.nickname).toBe('测试会员');
    });

    it('错误密码应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/member/auth/login')
        .send({ phone: '13800138000', password: 'wrong-password' })
        .expect(401);

      expect(res.body.code).toBe(ErrorCode.UNAUTHORIZED);
    });
  });

  describe('POST /member/auth/register', () => {
    it('新手机号应返回 201 与 TokenPair', async () => {
      const res = await request(app.getHttpServer())
        .post('/member/auth/register')
        .send({
          phone: '13900139001',
          password: 'newmember123',
          nickname: '新会员',
        })
        .expect(201);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.tokens.refreshToken).toBeDefined();
      expect(res.body.data.user.phone).toBe('13900139001');
      expect(res.body.data.user.nickname).toBe('新会员');
    });

    it('重复手机号应返回 409', async () => {
      const res = await request(app.getHttpServer())
        .post('/member/auth/register')
        .send({ phone: '13800138000', password: 'member123' })
        .expect(409);

      expect(res.body.code).toBe(409);
    });
  });

  describe('POST /member/auth/logout + blacklist', () => {
    it('登出后 accessToken 应被拒绝', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/member/auth/login')
        .send({ phone: '13800138000', password: 'member123' });

      const accessToken = loginRes.body.data.tokens.accessToken;

      await request(app.getHttpServer())
        .post('/member/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const retryRes = await request(app.getHttpServer())
        .post('/member/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);

      expect(retryRes.body.code).toBe(ErrorCode.UNAUTHORIZED);
    });
  });

  describe('POST /member/auth/refresh', () => {
    it('有效 refreshToken 应返回新 accessToken', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/member/auth/login')
        .send({ phone: '13800138000', password: 'member123' });

      const { refreshToken } = loginRes.body.data.tokens;

      const refreshRes = await request(app.getHttpServer())
        .post('/member/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshRes.body.data.accessToken).toBeDefined();
      expect(refreshRes.body.data.expiresIn).toBeGreaterThan(0);
    });
  });

  describe('Admin/Member token isolation', () => {
    it('member token 访问 GET /auth/me 应返回 403', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/member/auth/login')
        .send({ phone: '13800138000', password: 'member123' });

      const accessToken = loginRes.body.data.tokens.accessToken;

      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);

      expect(res.body.code).toBe(ErrorCode.FORBIDDEN);
    });
  });
});
