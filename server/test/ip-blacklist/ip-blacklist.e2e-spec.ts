jest.setTimeout(60000);

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ErrorCode } from '@nova/shared-types';
import { createE2eApp, E2eAppContext } from '../auth/e2e-app.helper';

describe('IP Blacklist API (e2e)', () => {
  let ctx: E2eAppContext;
  let app: INestApplication<App>;
  let adminToken: string;

  const adminIp = '203.0.113.1';
  const blockedIp = '203.0.113.50';
  const autoBanIp = '203.0.113.99';

  function login(username: string, password: string, ip = adminIp) {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .set('X-Forwarded-For', ip)
      .send({ username, password });
  }

  beforeAll(async () => {
    ctx = await createE2eApp();
    app = ctx.app;

    const res = await login('admin', 'admin123');
    expect(res.status).toBe(200);
    adminToken = res.body.data.tokens.accessToken as string;
  }, 60000);

  afterAll(async () => {
    await app?.close();
  });

  it('GET /health 不受 IP 黑名单影响', async () => {
    await request(app.getHttpServer()).get('/api/health').expect(200);
  });

  it('手动封禁后该 IP 访问 API 返回 403', async () => {
    await request(app.getHttpServer())
      .post('/api/security/ip-blacklist')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Forwarded-For', adminIp)
      .send({ ip: blockedIp, remark: 'e2e test' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Forwarded-For', blockedIp)
      .expect(403);

    expect(res.body.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('解除封禁后恢复访问', async () => {
    const listRes = await request(app.getHttpServer())
      .get('/api/security/ip-blacklist')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Forwarded-For', adminIp)
      .query({ keyword: blockedIp })
      .expect(200);

    const record = listRes.body.data.list.find(
      (item: { ip: string }) => item.ip === blockedIp,
    );
    expect(record).toBeTruthy();

    await request(app.getHttpServer())
      .delete(`/api/security/ip-blacklist/${record.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Forwarded-For', adminIp)
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Forwarded-For', blockedIp)
      .expect(200);
  });

  it('连续登录失败触发自动封禁', async () => {
    for (let i = 0; i < 3; i += 1) {
      const res = await login('admin', 'wrong-password', autoBanIp);
      expect(res.status).toBe(401);
    }

    const blockedLogin = await login('admin', 'admin123', autoBanIp);
    expect(blockedLogin.status).toBe(403);
    expect(blockedLogin.body.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('POST 非法 IPv4 返回 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/security/ip-blacklist')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Forwarded-For', adminIp)
      .send({ ip: 'not-an-ip' })
      .expect(400);

    expect(res.body.code).toBe(ErrorCode.BAD_REQUEST);
  });
});
