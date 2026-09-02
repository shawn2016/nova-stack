import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const skipExternal =
      this.configService.get<boolean>('app.skipExternalServices') ?? false;

    if (skipExternal) {
      this.logger.log('Skipping Redis connection (SKIP_EXTERNAL_SERVICES=true)');
      return;
    }

    this.client = new Redis({
      host: this.configService.get<string>('redis.host', 'localhost'),
      port: this.configService.get<number>('redis.port', 6379),
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });

    this.client.connect().catch((error: Error) => {
      this.logger.error(`Redis connection failed: ${error.message}`);
    });
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  getClient(): Redis | null {
    return this.client;
  }
}
