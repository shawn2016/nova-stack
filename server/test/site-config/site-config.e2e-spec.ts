jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ErrorCode } from '@nova/shared-types';
import { createE2eApp, E2eAppContext } from '../auth/e2e-app.helper';

describe('Site Config API (e2e)', () => {
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
  }, 30000);

  afterAll(async () => {
    await app?.close();
  });

  describe('CRUD', () => {
    let seededSiteNameId: string;

    it('GET /config/items 应返回配置列表（含 seed 示例）', async () => {
      const res = await request(app.getHttpServer())
        .get('/config/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(res.body.data).toHaveProperty('list');
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data.total).toBeGreaterThanOrEqual(3);
      expect(res.body.data.list.some((item: { configKey: string }) => item.configKey === 'site.name')).toBe(
        true,
      );
    });

    it('POST /config/items 应创建配置项', async () => {
      const res = await request(app.getHttpServer())
        .post('/config/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          configKey: 'site.tagline',
          configName: '站点标语',
          configValue: 'Build with Nova',
          configGroup: 'site',
          remark: 'e2e test',
        })
        .expect(201);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(res.body.data.configKey).toBe('site.tagline');
      expect(res.body.data.configName).toBe('站点标语');
      expect(res.body.data.configValue).toBe('Build with Nova');
      expect(res.body.data.configGroup).toBe('site');
    });

    it('POST /config/items 重复 configKey 应返回 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/config/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          configKey: 'site.name',
          configName: '重复项',
          configValue: 'duplicate',
        })
        .expect(400);

      expect(res.body.code).toBe(ErrorCode.BAD_REQUEST);
    });

    it('PUT /config/items/:id 应更新配置项且 configKey 不可改', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/config/items')
        .query({ keyword: 'site.name' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      seededSiteNameId = listRes.body.data.list.find(
        (item: { configKey: string }) => item.configKey === 'site.name',
      ).id;

      const res = await request(app.getHttpServer())
        .put(`/config/items/${seededSiteNameId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          configName: '站点名称（已更新）',
          configValue: 'Nova Stack Pro',
          remark: 'updated',
        })
        .expect(200);

      expect(res.body.data.configName).toBe('站点名称（已更新）');
      expect(res.body.data.configValue).toBe('Nova Stack Pro');
      expect(res.body.data.configKey).toBe('site.name');
    });

    it('GET /config/by-key/:key 应返回已知配置', async () => {
      const res = await request(app.getHttpServer())
        .get('/config/by-key/site.name')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(res.body.data.configKey).toBe('site.name');
      expect(res.body.data.configName).toBe('站点名称（已更新）');
      expect(res.body.data.configValue).toBe('Nova Stack Pro');
      expect(res.body.data.configGroup).toBe('site');
    });

    it('GET /config/by-key/:key 未知 key 应返回 404', async () => {
      const res = await request(app.getHttpServer())
        .get('/config/by-key/unknown.key')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(res.body.code).toBe(ErrorCode.NOT_FOUND);
    });

    it('GET /config/items 应支持 keyword 与 group 筛选', async () => {
      const res = await request(app.getHttpServer())
        .get('/config/items')
        .query({ keyword: 'logo', group: 'site' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.list.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.list.some((item: { configKey: string }) => item.configKey === 'site.logo')).toBe(
        true,
      );
      expect(res.body.data.list.every((item: { configGroup: string }) => item.configGroup === 'site')).toBe(
        true,
      );
    });

    it('DELETE /config/items/:id 应删除配置项', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/config/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          configKey: 'site.temp',
          configName: '临时配置',
          configValue: 'to-delete',
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .delete(`/config/items/${createRes.body.data.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.success).toBe(true);
    });
  });

  describe('Auth constraints', () => {
    it('member token 访问 GET /config/items 应返回 403', async () => {
      const res = await request(app.getHttpServer())
        .get('/config/items')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403);

      expect(res.body.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('member token 访问 GET /config/by-key/:key 应返回 403', async () => {
      const res = await request(app.getHttpServer())
        .get('/config/by-key/site.name')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403);

      expect(res.body.code).toBe(ErrorCode.FORBIDDEN);
    });
  });
});
