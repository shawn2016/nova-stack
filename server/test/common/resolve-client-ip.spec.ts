import type { Request } from 'express';
import { resolveClientIp } from '../../src/common/utils/resolve-client-ip';

function mockReq(partial: Partial<Request>): Request {
  return partial as Request;
}

describe('resolveClientIp', () => {
  it('uses req.ip when trustProxy is false', () => {
    const req = mockReq({ ip: '10.0.0.5', headers: {} });
    expect(resolveClientIp(req, false)).toBe('10.0.0.5');
  });

  it('uses X-Forwarded-For first segment when trustProxy is true', () => {
    const req = mockReq({
      ip: '10.0.0.1',
      headers: { 'x-forwarded-for': '203.0.113.50, 10.0.0.1' },
    });
    expect(resolveClientIp(req, true)).toBe('203.0.113.50');
  });

  it('falls back to socket remoteAddress', () => {
    const req = mockReq({
      headers: {},
      socket: { remoteAddress: '127.0.0.1' } as Request['socket'],
    });
    expect(resolveClientIp(req, false)).toBe('127.0.0.1');
  });
});
