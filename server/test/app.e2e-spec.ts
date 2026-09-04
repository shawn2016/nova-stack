import request from 'supertest';
import { App } from 'supertest/types';
import { ErrorCode } from '@nova/shared-types';
import { createE2eApp, E2eAppContext } from './auth/e2e-app.helper';

describe('AppController (e2e)', () => {
  let ctx: E2eAppContext;

  beforeAll(async () => {
    ctx = await createE2eApp();
  }, 30000);

  afterAll(async () => {
    await ctx.app?.close();
  });

  it('GET /health 应返回 200 且 ApiResponse 格式', () => {
    return request(ctx.app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({
          code: ErrorCode.SUCCESS,
          message: 'ok',
          data: { status: 'ok' },
        });
      });
  });
});
