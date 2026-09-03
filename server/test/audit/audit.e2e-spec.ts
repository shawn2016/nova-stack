jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ErrorCode } from '@nova/shared-types';
import {
  SysOperLogEntity,
} from '../../src/database/entities';
import { createE2eApp, E2eAppContext } from '../auth/e2e-app.helper';

describe('Audit API (e2e)', () => {
  let ctx: E2eAppContext;
  let app: INestApplication<App>;
  let adminToken: string;
  let memberToken: string;

  async function loginAdmin(): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    return res.body.data.tokens.accessToken;
  }

  async function loginMember(): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/member/auth/login')
      .send({ phone: '13800138000', password: 'member123' });
    return res.body.data.tokens.accessToken;
  }

  async function countOperLogs(): Promise<number> {
    return ctx.dataSource.getRepository(SysOperLogEntity).count();
  }

  async function getLatestOperLog(): Promise<SysOperLogEntity | null> {
    const rows = await ctx.dataSource.getRepository(SysOperLogEntity).find({
      order: { id: 'DESC' },
      take: 1,
    });
    return rows[0] ?? null;
  }

  beforeAll(async () => {
    ctx = await createE2eApp();
    app = ctx.app;
    adminToken = await loginAdmin();
    memberToken = await loginMember();
  }, 30000);

  afterAll(async () => {
    await app?.close();
  });

  describe('OperLogInterceptor', () => {
    it('POST 写操作应写入操作日志', async () => {
      const before = await countOperLogs();

      await request(app.getHttpServer())
        .post('/dict/types')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-Forwarded-For', '203.0.113.20')
        .send({
          name: '审计测试类型',
          code: 'audit_e2e_type',
          status: 1,
        })
        .expect(201);

      expect(await countOperLogs()).toBe(before + 1);

      const log = await getLatestOperLog();
      expect(log).toMatchObject({
        username: 'admin',
        module: 'dict',
        action: 'create',
        method: 'POST',
        path: '/dict/types',
        status: 1,
      });
      expect(log?.userId).toBeTruthy();
      expect(log?.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('GET 读操作不应写入操作日志', async () => {
      const before = await countOperLogs();

      await request(app.getHttpServer())
        .get('/dict/types')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(await countOperLogs()).toBe(before);
    });

    it('POST /auth/login 应排除在操作审计之外', async () => {
      const before = await countOperLogs();

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin', password: 'admin123' })
        .expect(200);

      expect(await countOperLogs()).toBe(before);
    });

    it('POST /users 应脱敏 password 字段', async () => {
      const before = await countOperLogs();

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'audit_user',
          password: 'secret123',
          nickname: '审计用户',
        })
        .expect(201);

      expect(await countOperLogs()).toBe(before + 1);

      const log = await getLatestOperLog();
      expect(log?.module).toBe('users');
      expect(log?.action).toBe('create');
      expect(log?.requestSummary).toContain('"password":"***"');
      expect(log?.requestSummary).not.toContain('secret123');
    });
  });

  describe('GET /audit/login-logs', () => {
    it('有权限的 admin 应返回分页登录日志', async () => {
      const res = await request(app.getHttpServer())
        .get('/audit/login-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, pageSize: 10 })
        .expect(200);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(res.body.data).toHaveProperty('list');
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data.total).toBeGreaterThan(0);
      expect(res.body.data.list[0]).toMatchObject({
        username: expect.any(String),
        status: expect.any(Number),
        ip: expect.any(String),
      });
    });

    it('可按 username 筛选登录日志', async () => {
      const res = await request(app.getHttpServer())
        .get('/audit/login-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ username: 'admin', page: 1, pageSize: 5 })
        .expect(200);

      expect(res.body.data.list.every((item: { username: string }) => item.username === 'admin')).toBe(
        true,
      );
    });

    it('member token 应返回 403', async () => {
      const res = await request(app.getHttpServer())
        .get('/audit/login-logs')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403);

      expect(res.body.code).toBe(ErrorCode.FORBIDDEN);
    });
  });

  describe('GET /audit/oper-logs', () => {
    it('有权限的 admin 应返回分页操作日志', async () => {
      const res = await request(app.getHttpServer())
        .get('/audit/oper-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, pageSize: 10 })
        .expect(200);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(res.body.data).toHaveProperty('list');
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data.total).toBeGreaterThan(0);
      expect(res.body.data.list[0]).toMatchObject({
        username: expect.any(String),
        module: expect.any(String),
        action: expect.any(String),
        method: expect.any(String),
        path: expect.any(String),
      });
    });

    it('可按 module 筛选操作日志', async () => {
      const res = await request(app.getHttpServer())
        .get('/audit/oper-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ module: 'dict', page: 1, pageSize: 10 })
        .expect(200);

      expect(
        res.body.data.list.every((item: { module: string }) => item.module === 'dict'),
      ).toBe(true);
    });

    it('member token 应返回 403', async () => {
      const res = await request(app.getHttpServer())
        .get('/audit/oper-logs')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403);

      expect(res.body.code).toBe(ErrorCode.FORBIDDEN);
    });
  });
});
