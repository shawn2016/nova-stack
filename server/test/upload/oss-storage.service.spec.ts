import { ConfigService } from '@nestjs/config';
import { OssStorageService } from '../../src/modules/upload/storage/oss-storage.service';

const mockPut = jest.fn();

jest.mock('ali-oss', () => {
  return jest.fn().mockImplementation(() => ({
    put: mockPut,
  }));
});

function createMockFile(
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'avatar.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 12,
    buffer: Buffer.from('jpeg-data'),
    stream: null as never,
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  };
}

describe('OssStorageService', () => {
  let service: OssStorageService;

  beforeEach(() => {
    mockPut.mockReset();
    mockPut.mockResolvedValue({ name: 'admin/u1/file.jpg' });

    const configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          'upload.ossRegion': 'oss-cn-hangzhou',
          'upload.ossBucket': 'nova-test',
          'upload.ossAccessKeyId': 'test-key-id',
          'upload.ossAccessKeySecret': 'test-key-secret',
          'upload.ossPublicBaseUrl': 'https://cdn.example.com',
        };
        return values[key];
      }),
    } as unknown as ConfigService;

    service = new OssStorageService(configService);
  });

  it('应调用 ali-oss put 并返回 OSS_PUBLIC_BASE_URL 拼接的 URL', async () => {
    const key = 'admin/u1/file.jpg';
    const file = createMockFile();

    const result = await service.upload(file, key);

    expect(mockPut).toHaveBeenCalledWith(key, file.buffer);
    expect(result).toEqual({
      url: 'https://cdn.example.com/admin/u1/file.jpg',
      key,
      size: 12,
      mimeType: 'image/jpeg',
    });
  });

  it('未配置 OSS_PUBLIC_BASE_URL 时应使用 bucket 默认域名', async () => {
    const configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          'upload.ossRegion': 'oss-cn-hangzhou',
          'upload.ossBucket': 'nova-test',
          'upload.ossAccessKeyId': 'test-key-id',
          'upload.ossAccessKeySecret': 'test-key-secret',
          'upload.ossPublicBaseUrl': '',
        };
        return values[key];
      }),
    } as unknown as ConfigService;

    service = new OssStorageService(configService);
    const key = 'admin/u1/file.jpg';
    const file = createMockFile();

    const result = await service.upload(file, key);

    expect(result.url).toBe(
      'https://nova-test.oss-cn-hangzhou.aliyuncs.com/admin/u1/file.jpg',
    );
  });
});
