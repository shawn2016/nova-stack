jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ErrorCode } from '@nova/shared-types';
import { createE2eApp, E2eAppContext } from '../auth/e2e-app.helper';

describe('Dict API (e2e)', () => {
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
  }, 30000);

  afterAll(async () => {
    await app?.close();
  });

  describe('DictType API', () => {
    let createdTypeId: string;

    it('GET /dict/types 应返回类型列表', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dict/types')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(res.body.data).toHaveProperty('list');
      expect(res.body.data).toHaveProperty('total');
    });

    it('POST /dict/types 应创建字典类型', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/dict/types')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'E2E 测试类型',
          code: 'e2e_test_type',
          status: 1,
          remark: 'e2e test',
        })
        .expect(201);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(res.body.data.name).toBe('E2E 测试类型');
      expect(res.body.data.code).toBe('e2e_test_type');
      expect(res.body.data.status).toBe(1);
      createdTypeId = res.body.data.id;
    });

    it('POST /dict/types 重复 code 应返回 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/dict/types')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '重复类型',
          code: 'user_status',
        })
        .expect(400);

      expect(res.body.code).toBe(ErrorCode.BAD_REQUEST);
    });

    it('PUT /dict/types/:id 应更新字典类型', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/dict/types/${createdTypeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'E2E 测试类型（已更新）', status: 0 })
        .expect(200);

      expect(res.body.data.name).toBe('E2E 测试类型（已更新）');
      expect(res.body.data.status).toBe(0);
    });

    it('DELETE /dict/types/:id 无字典项时应删除', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/dict/types')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '临时类型', code: 'temp_type', status: 1 })
        .expect(201);

      const tempId = createRes.body.data.id;

      const res = await request(app.getHttpServer())
        .delete(`/api/dict/types/${tempId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.success).toBe(true);
    });
  });

  describe('DictData API', () => {
    let typeId: string;
    let createdDataId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dict/types')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const articleType = res.body.data.list.find(
        (item: { code: string }) => item.code === 'article_status',
      );
      expect(articleType).toBeDefined();
      typeId = articleType.id;
    });

    it('POST /dict/data 应创建字典项', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/dict/data')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          typeId,
          label: 'E2E 测试项',
          value: 'e2e_custom',
          sort: 10,
          status: 1,
        })
        .expect(201);

      expect(res.body.data.label).toBe('E2E 测试项');
      expect(res.body.data.value).toBe('e2e_custom');
      createdDataId = res.body.data.id;
    });

    it('POST /dict/data 同 type 重复 value 应返回 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/dict/data')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          typeId,
          label: '草稿副本',
          value: 'draft',
        })
        .expect(400);

      expect(res.body.code).toBe(ErrorCode.BAD_REQUEST);
    });

    it('GET /dict/data 应返回字典项列表', async () => {
      await request(app.getHttpServer())
        .post('/api/dict/data')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          typeId,
          label: '额外项',
          value: 'e2e_extra',
          sort: 20,
          status: 1,
        });

      const res = await request(app.getHttpServer())
        .get('/api/dict/data')
        .query({ typeId })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(res.body.data.list.length).toBeGreaterThanOrEqual(3);
      expect(res.body.data.list[0]).toHaveProperty('typeId');
    });

    it('PUT /dict/data/:id 应更新字典项', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/dict/data/${createdDataId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ label: 'E2E 测试项（已更新）', sort: 0 })
        .expect(200);

      expect(res.body.data.label).toBe('E2E 测试项（已更新）');
      expect(res.body.data.sort).toBe(0);
    });

    it('GET /dict/data/by-type/:code 应仅返回启用项且按 sort 升序', async () => {
      await request(app.getHttpServer())
        .post('/api/dict/data')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          typeId,
          label: '已归档',
          value: 'archived',
          sort: 3,
          status: 0,
        });

      const res = await request(app.getHttpServer())
        .get('/api/dict/data/by-type/article_status')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(res.body.data.every((item: { value: string }) => item.value !== 'archived')).toBe(
        true,
      );
      const sorts = res.body.data.map((item: { sort: number }) => item.sort);
      expect(sorts).toEqual([...sorts].sort((a, b) => a - b));
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /dict/data/by-type/:code 未知 code 应返回 404', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dict/data/by-type/unknown_code')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(res.body.code).toBe(ErrorCode.NOT_FOUND);
    });

    it('DELETE /dict/data/:id 应删除字典项', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/dict/data')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          typeId,
          label: '待删项',
          value: 'to_delete',
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .delete(`/api/dict/data/${createRes.body.data.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.success).toBe(true);
    });
  });

  describe('Constraints & auth', () => {
    let typeWithDataId: string;

    beforeAll(async () => {
      const typeRes = await request(app.getHttpServer())
        .post('/api/dict/types')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '不可删类型', code: 'blocked_delete', status: 1 });

      typeWithDataId = typeRes.body.data.id;

      await request(app.getHttpServer())
        .post('/api/dict/data')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          typeId: typeWithDataId,
          label: '项',
          value: 'item',
        });
    });

    it('DELETE /dict/types/:id 存在字典项时应返回 400', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/dict/types/${typeWithDataId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(res.body.code).toBe(ErrorCode.BAD_REQUEST);
      expect(res.body.message).toMatch(/data items/i);
    });

    it('member token 访问 GET /dict/types 应返回 403', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dict/types')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403);

      expect(res.body.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('member token 访问 GET /dict/data/by-type/:code 应返回 403', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dict/data/by-type/article_status')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403);

      expect(res.body.code).toBe(ErrorCode.FORBIDDEN);
    });
  });
});
