jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ErrorCode } from '@nova/shared-types';
import { createE2eApp, E2eAppContext } from '../auth/e2e-app.helper';
import { seedLimitedUser } from '../auth/seed-limited-user';

describe('Article API (e2e)', () => {
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

  describe('B 端 Admin /articles', () => {
    let createdId: number;

    it('GET /articles 应返回分页列表（含 seed 数据）', async () => {
      const res = await request(app.getHttpServer())
        .get('/articles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(res.body.data.list.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.total).toBeGreaterThanOrEqual(2);
      expect(res.body.data.page).toBe(1);
      expect(res.body.data.pageSize).toBe(10);
      expect(res.body.data.list[0]).toHaveProperty('title');
      expect(res.body.data.list[0]).not.toHaveProperty('content');
    });

    it('GET /articles?status=1 应只返回已发布文章', async () => {
      const res = await request(app.getHttpServer())
        .get('/articles?status=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.list.every((a: { status: number }) => a.status === 1)).toBe(
        true,
      );
    });

    it('POST /articles 应创建草稿文章', async () => {
      const res = await request(app.getHttpServer())
        .post('/articles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'E2E 测试文章',
          summary: '测试摘要',
          content: '测试正文内容',
        })
        .expect(201);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(res.body.data.title).toBe('E2E 测试文章');
      expect(res.body.data.status).toBe(0);
      expect(res.body.data.authorId).toBeDefined();
      createdId = res.body.data.id;
    });

    it('GET /articles/:id 应返回文章详情', async () => {
      const res = await request(app.getHttpServer())
        .get(`/articles/${createdId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.id).toBe(createdId);
      expect(res.body.data.content).toBe('测试正文内容');
    });

    it('PUT /articles/:id 应更新文章', async () => {
      const res = await request(app.getHttpServer())
        .put(`/articles/${createdId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'E2E 测试文章（已更新）', summary: '新摘要' })
        .expect(200);

      expect(res.body.data.title).toBe('E2E 测试文章（已更新）');
      expect(res.body.data.summary).toBe('新摘要');
    });

    it('PATCH /articles/:id/publish 应发布文章', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/articles/${createdId}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.status).toBe(1);
      expect(res.body.data.publishedAt).toBeDefined();
    });

    it('DELETE /articles/:id 应删除文章', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/articles/${createdId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.success).toBe(true);

      await request(app.getHttpServer())
        .get(`/articles/${createdId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('无 content:article:list 权限的用户应返回 403', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'limited', password: 'limited123' });

      const limitedToken = loginRes.body.data.tokens.accessToken;

      const res = await request(app.getHttpServer())
        .get('/articles')
        .set('Authorization', `Bearer ${limitedToken}`)
        .expect(403);

      expect(res.body.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('member token 访问 GET /articles 应返回 403', async () => {
      const res = await request(app.getHttpServer())
        .get('/articles')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403);

      expect(res.body.code).toBe(ErrorCode.FORBIDDEN);
    });
  });

  describe('C 端 Member /member/articles', () => {
    it('GET /member/articles 应只返回已发布文章', async () => {
      const res = await request(app.getHttpServer())
        .get('/member/articles')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(res.body.data.list.length).toBeGreaterThanOrEqual(1);
      expect(
        res.body.data.list.every((a: { status: number }) => a.status === 1),
      ).toBe(true);
      expect(
        res.body.data.list.some(
          (a: { title: string }) => a.title === '欢迎使用 Nova Stack',
        ),
      ).toBe(true);
      expect(
        res.body.data.list.every(
          (a: { title: string }) => a.title !== '草稿示例文章',
        ),
      ).toBe(true);
    });

    it('GET /member/articles/:id 已发布文章应返回详情', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/member/articles')
        .set('Authorization', `Bearer ${memberToken}`);

      const publishedId = listRes.body.data.list[0].id;

      const res = await request(app.getHttpServer())
        .get(`/member/articles/${publishedId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);

      expect(res.body.data.id).toBe(publishedId);
      expect(res.body.data.content).toBeDefined();
      expect(res.body.data.status).toBe(1);
    });

    it('GET /member/articles/:id 草稿文章应返回 404', async () => {
      const adminListRes = await request(app.getHttpServer())
        .get('/articles?status=0')
        .set('Authorization', `Bearer ${adminToken}`);

      const draft = adminListRes.body.data.list.find(
        (a: { title: string }) => a.title === '草稿示例文章',
      );
      expect(draft).toBeDefined();

      const res = await request(app.getHttpServer())
        .get(`/member/articles/${draft.id}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(404);

      expect(res.body.code).toBe(ErrorCode.NOT_FOUND);
    });

    it('无 token 访问 GET /member/articles 应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .get('/member/articles')
        .expect(401);

      expect(res.body.code).toBe(ErrorCode.UNAUTHORIZED);
    });

    it('admin token 访问 GET /member/articles 应返回 403', async () => {
      const res = await request(app.getHttpServer())
        .get('/member/articles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);

      expect(res.body.code).toBe(ErrorCode.FORBIDDEN);
    });
  });
});
