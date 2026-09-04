jest.setTimeout(60000);

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ErrorCode } from '@nova/shared-types';
import { createE2eApp, E2eAppContext } from '../auth/e2e-app.helper';

describe('Online Session API (e2e)', () => {
  let ctx: E2eAppContext;
  let app: INestApplication<App>;
  let adminToken: string;
  let adminTokenId: string;

  async function login(username: string, password: string) {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username, password })
      .expect(200);
    return res.body.data.tokens.accessToken as string;
  }

  beforeAll(async () => {
    ctx = await createE2eApp();
    app = ctx.app;
    adminToken = await login('admin', 'admin123');
  }, 60000);

  afterAll(async () => {
    await app?.close();
  });

  it('GET /sessions/online 登录后应包含当前会话', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/sessions/online')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.code).toBe(ErrorCode.SUCCESS);
    expect(res.body.data.list.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.list.some((s: { username: string }) => s.username === 'admin')).toBe(
      true,
    );
    adminTokenId = res.body.data.currentTokenId;
    expect(adminTokenId).toBeTruthy();
  });

  it('POST /auth/logout 后在线列表不含该会话', async () => {
    const token = await login('admin', 'admin123');

    const before = await request(app.getHttpServer())
      .get('/api/sessions/online?pageSize=100')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const currentId = before.body.data.currentTokenId as string;
    expect(before.body.data.list.some((s: { tokenId: string }) => s.tokenId === currentId)).toBe(
      true,
    );

    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const freshToken = await login('admin', 'admin123');
    const after = await request(app.getHttpServer())
      .get('/api/sessions/online?pageSize=100')
      .set('Authorization', `Bearer ${freshToken}`)
      .expect(200);

    expect(
      after.body.data.list.some((s: { tokenId: string }) => s.tokenId === currentId),
    ).toBe(false);
  });

  it('DELETE kick 他人会话成功且 token 失效', async () => {
    const victimToken = await login('admin', 'admin123');

    const listRes = await request(app.getHttpServer())
      .get('/api/sessions/online?pageSize=100')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const victimSession = listRes.body.data.list.find(
      (s: { tokenId: string }) => s.tokenId !== listRes.body.data.currentTokenId,
    );

    expect(victimSession).toBeDefined();

    await request(app.getHttpServer())
      .delete(`/api/sessions/online/${victimSession.tokenId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${victimToken}`)
      .expect(401);
  });

  it('DELETE kick 当前会话应返回 400', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/sessions/online/${adminTokenId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(400);

    expect(res.body.code).toBe(ErrorCode.BAD_REQUEST);
  });
});
