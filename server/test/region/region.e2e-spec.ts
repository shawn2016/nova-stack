jest.setTimeout(60000);

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ErrorCode } from '@nova/shared-types';
import { createE2eApp, E2eAppContext } from '../auth/e2e-app.helper';

describe('Region API (e2e)', () => {
  let ctx: E2eAppContext;
  let app: INestApplication<App>;
  let adminToken: string;
  let memberToken: string;

  async function loginAdmin(): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
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
  }, 60000);

  afterAll(async () => {
    await app?.close();
  });

  describe('Region tree & list', () => {
    it('GET /regions/tree 应返回省市区树', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/regions/tree')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('name');
      expect(res.body.data[0]).toHaveProperty('code');
      expect(res.body.data[0]).toHaveProperty('level');
    });

    it('GET /regions 应返回分页列表', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/regions')
        .query({ page: 1, pageSize: 10, level: 1 })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(res.body.data.list.length).toBeGreaterThan(0);
      expect(res.body.data.total).toBeGreaterThan(0);
      expect(res.body.data.list.every((item: { level: number }) => item.level === 1)).toBe(true);
    });
  });

  describe('Region CRUD', () => {
    let createdId: string;
    let parentId: string;

    beforeAll(async () => {
      const treeRes = await request(app.getHttpServer())
        .get('/api/regions/tree')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const beijing = treeRes.body.data.find((item: { name: string }) => item.name === '北京市');
      expect(beijing).toBeDefined();
      expect(beijing.children?.length).toBeGreaterThan(0);
      parentId = beijing.children[0].id;
    });

    it('POST /regions 应创建地区', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/regions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          parentId,
          name: 'E2E 测试区',
          code: '999999',
          level: 3,
          sort: 99,
          status: 1,
        })
        .expect(201);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(res.body.data.name).toBe('E2E 测试区');
      expect(res.body.data.code).toBe('999999');
      createdId = res.body.data.id;
    });

    it('POST /regions 重复 code 应返回 409', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/regions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          parentId,
          name: '重复区',
          code: '999999',
        })
        .expect(409);

      expect(res.body.code).toBe(409);
    });

    it('PUT /regions/:id 应更新地区', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/regions/${createdId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'E2E 测试区（已更新）', sort: 100 })
        .expect(200);

      expect(res.body.data.name).toBe('E2E 测试区（已更新）');
      expect(res.body.data.sort).toBe(100);
    });

    it('GET /regions/:id 应返回详情', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/regions/${createdId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.id).toBe(createdId);
      expect(res.body.data.code).toBe('999999');
    });

    it('DELETE /regions/:id 有子节点时应返回 400', async () => {
      const treeRes = await request(app.getHttpServer())
        .get('/api/regions/tree')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const beijing = treeRes.body.data.find((item: { name: string }) => item.name === '北京市');
      const city = beijing.children.find((item: { name: string }) => item.name === '市辖区');
      expect(city?.children?.length).toBeGreaterThan(0);

      const res = await request(app.getHttpServer())
        .delete(`/api/regions/${city.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(res.body.code).toBe(ErrorCode.BAD_REQUEST);
    });

    it('DELETE /regions/:id 无子节点时应删除', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/regions/${createdId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.success).toBe(true);
    });
  });

  describe('Auth', () => {
    it('member token 访问 GET /regions/tree 应返回 403', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/regions/tree')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403);

      expect(res.body.code).toBe(ErrorCode.FORBIDDEN);
    });
  });
});
