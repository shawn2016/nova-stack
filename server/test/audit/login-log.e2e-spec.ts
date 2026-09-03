jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { SysLoginLogEntity } from '../../src/database/entities';
import { createE2eApp, E2eAppContext } from '../auth/e2e-app.helper';

describe('Login log (e2e)', () => {
  let ctx: E2eAppContext;
  let app: INestApplication<App>;

  beforeAll(async () => {
    ctx = await createE2eApp();
    app = ctx.app;
  }, 30000);

  afterAll(async () => {
    await app?.close();
  });

  async function countLoginLogs(): Promise<number> {
    return ctx.dataSource.getRepository(SysLoginLogEntity).count();
  }

  async function getLatestLoginLog(): Promise<SysLoginLogEntity | null> {
    const rows = await ctx.dataSource.getRepository(SysLoginLogEntity).find({
      order: { id: 'DESC' },
      take: 1,
    });
    return rows[0] ?? null;
  }

  describe('POST /auth/login', () => {
    it('登录成功应写入 status=1 的登录日志', async () => {
      const before = await countLoginLogs();

      await request(app.getHttpServer())
        .post('/auth/login')
        .set('User-Agent', 'NovaE2E/1.0')
        .set('X-Forwarded-For', '203.0.113.10')
        .send({ username: 'admin', password: 'admin123' })
        .expect(200);

      expect(await countLoginLogs()).toBe(before + 1);

      const log = await getLatestLoginLog();
      expect(log).toMatchObject({
        username: 'admin',
        status: 1,
        message: 'success',
        userAgent: 'NovaE2E/1.0',
      });
      expect(log?.userId).toBeTruthy();
      expect(log?.ip).toBeTruthy();
    });

    it('错误密码应写入 status=0 的登录日志后返回 401', async () => {
      const before = await countLoginLogs();

      await request(app.getHttpServer())
        .post('/auth/login')
        .set('User-Agent', 'NovaE2E-Fail/1.0')
        .send({ username: 'admin', password: 'wrong-password' })
        .expect(401);

      expect(await countLoginLogs()).toBe(before + 1);

      const log = await getLatestLoginLog();
      expect(log).toMatchObject({
        username: 'admin',
        status: 0,
        message: 'Invalid credentials',
        userAgent: 'NovaE2E-Fail/1.0',
      });
      expect(log?.userId).toBeTruthy();
    });

    it('不存在用户应写入 status=0 且 userId 为空的登录日志', async () => {
      const before = await countLoginLogs();

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'ghost-user', password: 'any' })
        .expect(401);

      expect(await countLoginLogs()).toBe(before + 1);

      const log = await getLatestLoginLog();
      expect(log).toMatchObject({
        username: 'ghost-user',
        status: 0,
        message: 'Invalid credentials',
        userId: null,
      });
    });
  });
});
