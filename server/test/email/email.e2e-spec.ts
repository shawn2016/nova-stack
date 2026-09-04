jest.setTimeout(60000);

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ErrorCode } from '@nova/shared-types';
import { createE2eApp, E2eAppContext } from '../auth/e2e-app.helper';

describe('Email API (e2e)', () => {
  let ctx: E2eAppContext;
  let app: INestApplication<App>;
  let adminToken: string;

  beforeAll(async () => {
    ctx = await createE2eApp();
    app = ctx.app;

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' })
      .expect(200);

    adminToken = loginRes.body.data.tokens.accessToken;
  }, 60000);

  afterAll(async () => {
    await app?.close();
  });

  it('GET /email/channels 应包含 seed Mock 通道', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/email/channels')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.code).toBe(ErrorCode.SUCCESS);
    expect(res.body.data.list.some((c: { name: string }) => c.name === 'Mock 通道')).toBe(
      true,
    );
  });

  it('POST /email/channels 非法 provider 应 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/email/channels')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Bad',
        provider: 'unknown',
        config: '{}',
      })
      .expect(400);

    expect(res.body.code).toBe(ErrorCode.BAD_REQUEST);
  });

  it('GET /email/templates 应包含 seed welcome 模板', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/email/templates')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.data.list.some((t: { code: string }) => t.code === 'welcome')).toBe(
      true,
    );
  });

  it('POST /email/send mock 发送应写日志', async () => {
    const sendRes = await request(app.getHttpServer())
      .post('/api/email/send')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        to: 'user@example.com',
        templateCode: 'welcome',
        params: { siteName: 'Nova Stack' },
      })
      .expect(200);

    expect(sendRes.body.data.status).toBe(1);
    expect(sendRes.body.data.subject).toContain('Nova Stack');
    expect(sendRes.body.data.content).toContain('Nova Stack');

    const logRes = await request(app.getHttpServer())
      .get('/api/email/logs?to=user@example.com')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(logRes.body.data.list.length).toBeGreaterThanOrEqual(1);
    expect(logRes.body.data.list[0].status).toBe(1);
  });
});
