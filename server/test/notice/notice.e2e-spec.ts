jest.setTimeout(60000);

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ErrorCode } from '@nova/shared-types';
import { createE2eApp, E2eAppContext } from '../auth/e2e-app.helper';

describe('Notice & Message API (e2e)', () => {
  let ctx: E2eAppContext;
  let app: INestApplication<App>;
  let adminToken: string;
  let secondUserId: string;
  let draftId: string;
  let publishedId: string;

  async function loginAdmin(): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    return res.body.data.tokens.accessToken;
  }

  beforeAll(async () => {
    ctx = await createE2eApp();
    app = ctx.app;
    adminToken = await loginAdmin();

    const userRes = await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username: 'notice_e2e_user',
        password: 'e2e_pass123',
        nickname: 'E2E 用户',
        status: 1,
      })
      .expect(201);

    secondUserId = userRes.body.data.id;
  }, 60000);

  afterAll(async () => {
    await app?.close();
  });

  describe('Notice API', () => {
    it('GET /notices 应返回管理列表', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/notices')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(res.body.data).toHaveProperty('list');
    });

    it('POST /notices 应创建草稿', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/notices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'E2E 测试公告',
          content: '内容',
          type: 1,
        })
        .expect(201);

      expect(res.body.data.status).toBe(0);
      draftId = res.body.data.id;
    });

    it('PUT /notices/:id/publish 应发布公告', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/notices/${draftId}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.status).toBe(1);
      expect(res.body.data.publishedAt).toBeTruthy();
      publishedId = res.body.data.id;
    });

    it('DELETE /notices/:id 已发布应返回 400', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/notices/${publishedId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(res.body.code).toBe(ErrorCode.BAD_REQUEST);
    });

    it('GET /notices/my 应含 isRead', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/notices/my')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const item = res.body.data.list.find((n: { id: string }) => n.id === publishedId);
      expect(item).toBeDefined();
      expect(item).toHaveProperty('isRead');
    });

    it('POST /notices/:id/read 应标记已读', async () => {
      await request(app.getHttpServer())
        .post(`/api/notices/${publishedId}/read`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const res = await request(app.getHttpServer())
        .get('/api/notices/my')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const item = res.body.data.list.find((n: { id: string }) => n.id === publishedId);
      expect(item.isRead).toBe(true);
    });

    it('GET /notices/unread-count 应返回数字', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/notices/unread-count')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(typeof res.body.data.count).toBe('number');
    });
  });

  describe('Message API', () => {
    let messageId: string;

    it('POST /messages 发给自己应返回 403', async () => {
      const usersRes = await request(app.getHttpServer())
        .get('/api/users')
        .query({ keyword: 'admin', page: 1, pageSize: 1 })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const adminId = usersRes.body.data.list[0].id;

      const res = await request(app.getHttpServer())
        .post('/api/messages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          receiverId: adminId,
          title: '自发自收',
          content: 'test',
        })
        .expect(403);

      expect(res.body.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('POST /messages 应发送给另一用户', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/messages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          receiverId: secondUserId,
          title: 'E2E 站内消息',
          content: 'hello',
        })
        .expect(201);

      expect(res.body.data.receiverId).toBe(secondUserId);
      messageId = res.body.data.id;
    });

    it('GET /messages/sent 发件箱应可见', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/messages/sent')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.list.some((m: { id: string }) => m.id === messageId)).toBe(true);
    });

    it('PUT /messages/:id/read 非收件人应返回 403', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/messages/${messageId}/read`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);

      expect(res.body.code).toBe(ErrorCode.FORBIDDEN);
    });
  });
});
