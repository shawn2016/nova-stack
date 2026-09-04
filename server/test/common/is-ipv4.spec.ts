import { isIpv4 } from '../../src/common/utils/is-ipv4';

describe('isIpv4', () => {
  it('accepts valid IPv4', () => {
    expect(isIpv4('192.168.1.1')).toBe(true);
    expect(isIpv4('203.0.113.50')).toBe(true);
  });

  it('rejects invalid values', () => {
    expect(isIpv4('256.1.1.1')).toBe(false);
    expect(isIpv4('10.0.0.0/8')).toBe(false);
    expect(isIpv4('::1')).toBe(false);
    expect(isIpv4('example.com')).toBe(false);
  });
});
