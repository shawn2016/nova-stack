import { mkdtemp, readFile, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { LocalStorageService } from '../../src/modules/upload/storage/local-storage.service';

function createMockFile(
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'avatar.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: 8,
    buffer: Buffer.from('png-data'),
    stream: null as never,
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  };
}

describe('LocalStorageService', () => {
  let uploadsRoot: string;
  let service: LocalStorageService;

  beforeEach(async () => {
    uploadsRoot = await mkdtemp(join(tmpdir(), 'nova-upload-'));
    service = new LocalStorageService();
  });

  afterEach(async () => {
    await rm(uploadsRoot, { recursive: true, force: true });
  });

  it('应将文件写入 uploads 目录并返回可访问 URL', async () => {
    const key = 'admin/user-1/test-key.png';
    const file = createMockFile();

    const result = await service.upload(file, key, {
      appPublicUrl: 'http://localhost:3000',
      uploadsDir: uploadsRoot,
    });

    const saved = await readFile(join(uploadsRoot, key));
    expect(saved.toString()).toBe('png-data');
    expect(result).toEqual({
      url: 'http://localhost:3000/uploads/admin/user-1/test-key.png',
      key,
      size: 8,
      mimeType: 'image/png',
    });
  });
});
