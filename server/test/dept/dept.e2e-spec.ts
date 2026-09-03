jest.setTimeout(60000);

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ErrorCode } from '@nova/shared-types';
import { createE2eApp, E2eAppContext } from '../auth/e2e-app.helper';

describe('Dept API (e2e)', () => {
  let ctx: E2eAppContext;
  let app: INestApplication<App>;
  let adminToken: string;

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
  }, 60000);

  afterAll(async () => {
    await app?.close();
  });

  describe('Dept tree & settings', () => {
    it('GET /depts/tree 应返回启用部门树', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/depts/tree')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('name', '总公司');
    });

    it('GET /depts/tree/all 应包含完整树', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/depts/tree/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(res.body.data[0].children?.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /depts/settings 应返回功能开关', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/depts/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data).toMatchObject({
        moduleEnabled: true,
        userBindingEnabled: true,
      });
    });
  });

  describe('Dept CRUD', () => {
    let createdId: string;
    let parentId: string;

    beforeAll(async () => {
      const treeRes = await request(app.getHttpServer())
        .get('/api/depts/tree/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      parentId = treeRes.body.data[0].id;
    });

    it('POST /depts 应创建部门', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/depts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          parentId,
          name: 'E2E 测试部',
          sort: 99,
          status: 1,
        })
        .expect(201);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      createdId = res.body.data.id;
      expect(res.body.data.name).toBe('E2E 测试部');
    });

    it('PUT /depts/:id/status 应停用部门', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/depts/${createdId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 0 })
        .expect(200);

      expect(res.body.data.status).toBe(0);
    });

    it('停用部门不出现在启用树中', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/depts/tree')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const flat: { id: string; name: string }[] = [];
      const walk = (nodes: { id: string; name: string; children?: typeof nodes }[]) => {
        for (const node of nodes) {
          flat.push({ id: node.id, name: node.name });
          if (node.children) walk(node.children);
        }
      };
      walk(res.body.data);
      expect(flat.some((item) => item.id === createdId)).toBe(false);
    });

    it('DELETE /depts/:id 有子部门应失败', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/depts/${parentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(res.body.code).toBe(ErrorCode.BAD_REQUEST);
    });

    it('DELETE /depts/:id 应删除叶子部门', async () => {
      await request(app.getHttpServer())
        .delete(`/api/depts/${createdId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Module toggle & user dept', () => {
    it('关闭模块总开关后 POST /depts 应 403', async () => {
      await request(app.getHttpServer())
        .put('/api/depts/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ moduleEnabled: false })
        .expect(200);

      const res = await request(app.getHttpServer())
        .post('/api/depts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ parentId: '0', name: '应失败' })
        .expect(403);

      expect(res.body.code).toBe(ErrorCode.FORBIDDEN);

      await request(app.getHttpServer())
        .put('/api/depts/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ moduleEnabled: true })
        .expect(200);
    });

    it('POST /users 绑定停用部门应 400', async () => {
      const treeRes = await request(app.getHttpServer())
        .get('/api/depts/tree/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const parentId = treeRes.body.data[0].id;
      const createRes = await request(app.getHttpServer())
        .post('/api/depts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ parentId, name: '停用测试部', sort: 98, status: 0 })
        .expect(201);

      const disabledDeptId = createRes.body.data.id;

      const res = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'dept_test_user',
          password: 'e2e_pass123',
          deptId: disabledDeptId,
        })
        .expect(400);

      expect(res.body.code).toBe(ErrorCode.BAD_REQUEST);

      await request(app.getHttpServer())
        .delete(`/api/depts/${disabledDeptId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('POST /users 绑定启用部门应成功', async () => {
      const treeRes = await request(app.getHttpServer())
        .get('/api/depts/tree')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const deptId = treeRes.body.data[0].id;

      const res = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'dept_bind_user',
          password: 'e2e_pass123',
          deptId,
        })
        .expect(201);

      expect(res.body.data.deptId).toBe(deptId);
      expect(res.body.data.deptName).toBe('总公司');

      await request(app.getHttpServer())
        .delete(`/api/users/${res.body.data.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });
});
