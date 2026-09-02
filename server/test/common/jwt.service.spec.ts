import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { JwtService } from '../../src/common/jwt/jwt.service';
import { RedisService } from '../../src/redis/redis.service';

const REFRESH_TTL_SECONDS = 7 * 24 * 3600;

function createMockRedis() {
  const store = new Map<string, { value: string; ex?: number }>();

  return {
    set: jest.fn(
      async (key: string, value: string, mode?: string, ttl?: number) => {
        store.set(key, { value, ex: mode === 'EX' ? ttl : undefined });
      },
    ),
    get: jest.fn(async (key: string) => store.get(key)?.value ?? null),
    exists: jest.fn(async (key: string) => (store.has(key) ? 1 : 0)),
    _store: store,
  };
}

describe('JwtService', () => {
  let service: JwtService;
  let mockRedis: ReturnType<typeof createMockRedis>;
  let nestJwtService: NestJwtService;

  beforeEach(() => {
    mockRedis = createMockRedis();

    const configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          'jwt.secret': 'test-secret-key-at-least-32-chars-long',
          'jwt.accessExpiresIn': '2h',
          'jwt.expiresIn': '7d',
        };
        return values[key];
      }),
    } as unknown as ConfigService;

    nestJwtService = new NestJwtService({
      secret: 'test-secret-key-at-least-32-chars-long',
    });

    const redisService = {
      getClient: () => mockRedis,
    } as unknown as RedisService;

    service = new JwtService(configService, nestJwtService, redisService);
  });

  it('signAccessToken 签发含 sub、type、jti 的 access token', async () => {
    const token = await service.signAccessToken({
      userId: '42',
      type: 'admin',
    });

    const payload = nestJwtService.verify(token);
    expect(payload.sub).toBe('42');
    expect(payload.type).toBe('admin');
    expect(typeof payload.jti).toBe('string');
    expect(payload.jti.length).toBeGreaterThan(0);
  });

  it('signRefreshToken 将 token 存入 Redis refresh:admin:{userId} 并设置 7d TTL', async () => {
    const token = await service.signRefreshToken({
      userId: '99',
      type: 'admin',
    });

    expect(mockRedis.set).toHaveBeenCalledWith(
      'refresh:admin:99',
      token,
      'EX',
      REFRESH_TTL_SECONDS,
    );
  });

  it('signRefreshToken 将 member token 存入 refresh:member:{userId}', async () => {
    await service.signRefreshToken({
      userId: '7',
      type: 'member',
    });

    expect(mockRedis.set).toHaveBeenCalledWith(
      'refresh:member:7',
      expect.any(String),
      'EX',
      REFRESH_TTL_SECONDS,
    );
  });

  it('verifyToken 解析有效 token 并返回 payload', async () => {
    const token = await service.signAccessToken({
      userId: '1',
      type: 'member',
    });

    const payload = await service.verifyToken(token);
    expect(payload.sub).toBe('1');
    expect(payload.type).toBe('member');
    expect(payload.jti).toBeDefined();
    expect(payload.iat).toBeDefined();
    expect(payload.exp).toBeDefined();
  });

  it('verifyToken 对无效 token 抛出异常', async () => {
    await expect(service.verifyToken('invalid.token.here')).rejects.toThrow();
  });

  it('blacklist 写入 jwt:blacklist:{jti} 并设置 TTL', async () => {
    await service.blacklist('abc-jti', 3600);

    expect(mockRedis.set).toHaveBeenCalledWith(
      'jwt:blacklist:abc-jti',
      '1',
      'EX',
      3600,
    );
  });

  it('isBlacklisted 在 jti 已拉黑时返回 true', async () => {
    mockRedis._store.set('jwt:blacklist:blocked-jti', { value: '1' });

    await expect(service.isBlacklisted('blocked-jti')).resolves.toBe(true);
  });

  it('isBlacklisted 在 jti 未拉黑时返回 false', async () => {
    await expect(service.isBlacklisted('clean-jti')).resolves.toBe(false);
  });
});
