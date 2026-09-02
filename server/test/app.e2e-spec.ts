import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { ErrorCode } from '@nova/shared-types';
import { AppModule } from '../src/app.module';

/**
 * E2E 测试策略：
 * - setup-e2e.ts 设置 SKIP_EXTERNAL_SERVICES=true，DatabaseModule 使用 sqlite 内存库
 * - RedisModule 使用 Mock 客户端，无需外部 Redis
 * - 生产/dev 环境使用 .env 配置的 MySQL8 + Redis
 */
describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.SKIP_EXTERNAL_SERVICES = 'true';
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.PORT = '0';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /health 应返回 200 且 ApiResponse 格式', () => {
    return request(app.getHttpServer())
      .get('/health')
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
