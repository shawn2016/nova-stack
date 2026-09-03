jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import request from 'supertest';
import { App } from 'supertest/types';
import { ErrorCode } from '@nova/shared-types';
import { createE2eApp, E2eAppContext } from '../auth/e2e-app.helper';

describe('Upload API (e2e)', () => {
  let ctx: E2eAppContext;
  let app: INestApplication<App>;
  let uploadsDir: string;
  let adminToken: string;

  beforeAll(async () => {
    uploadsDir = await mkdtemp(join(tmpdir(), 'nova-upload-e2e-'));
    process.env.OSS_ENABLED = 'false';
    process.env.APP_PUBLIC_URL = 'http://localhost:3000';
    process.env.UPLOAD_MAX_SIZE = '5242880';
    process.env.UPLOADS_DIR = uploadsDir;

    ctx = await createE2eApp();
    app = ctx.app;

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    adminToken = loginRes.body.data.tokens.accessToken;
  }, 30000);

  afterAll(async () => {
    await app?.close();
    await rm(uploadsDir, { recursive: true, force: true });
  });

  describe('POST /files/upload', () => {
    it('Admin JWT 上传图片应返回 UploadResult 且可通过 /uploads 访问', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', Buffer.from('fake-png-content'), {
          filename: 'avatar.png',
          contentType: 'image/png',
        })
        .expect(201);

      expect(res.body.code).toBe(ErrorCode.SUCCESS);
      expect(res.body.data.url).toMatch(
        /^http:\/\/localhost:3000\/uploads\/admin\/.+\.png$/,
      );
      expect(res.body.data.key).toMatch(/^admin\/.+\.png$/);
      expect(res.body.data.size).toBeGreaterThan(0);
      expect(res.body.data.mimeType).toBe('image/png');

      const fileRes = await request(app.getHttpServer())
        .get(new URL(res.body.data.url).pathname)
        .expect(200);

      expect(fileRes.headers['content-type']).toMatch(/image\/png/);
      const bodyText = Buffer.isBuffer(fileRes.body)
        ? fileRes.body.toString()
        : fileRes.text;
      expect(bodyText).toBe('fake-png-content');
    });

    it('Member token 应返回 403', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/member/auth/login')
        .send({ phone: '13800138000', password: 'member123' });

      const memberToken = loginRes.body.data.tokens.accessToken;

      const res = await request(app.getHttpServer())
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${memberToken}`)
        .attach('file', Buffer.from('fake-png'), {
          filename: 'avatar.png',
          contentType: 'image/png',
        })
        .expect(403);

      expect(res.body.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('非图片 MIME 应返回 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', Buffer.from('not-image'), {
          filename: 'doc.txt',
          contentType: 'text/plain',
        })
        .expect(400);

      expect(res.body.code).toBe(ErrorCode.BAD_REQUEST);
    });

    it('未携带文件应返回 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(res.body.code).toBe(ErrorCode.BAD_REQUEST);
    });
  });
});
