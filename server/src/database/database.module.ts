import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './entities';

@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    const skipExternal = process.env.SKIP_EXTERNAL_SERVICES === 'true';

    if (skipExternal) {
      return { module: DatabaseModule };
    }

    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'mysql' as const,
            host: configService.get<string>('database.host'),
            port: configService.get<number>('database.port'),
            username: configService.get<string>('database.username'),
            password: configService.get<string>('database.password'),
            database: configService.get<string>('database.database'),
            // entities 显式注册全部实体；autoLoadEntities 供后续 forFeature 模块增量加载（二者并存无害）
            entities,
            autoLoadEntities: true,
            synchronize: configService.get<string>('app.nodeEnv') !== 'production',
          }),
        }),
      ],
    };
  }
}
