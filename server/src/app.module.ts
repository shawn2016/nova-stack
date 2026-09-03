import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import appConfig, {
  databaseConfig,
  jwtConfig,
  redisConfig,
  uploadConfig,
} from './config/configuration';
import { validate } from './config/env.validation';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { JwtModule } from './common/jwt/jwt.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from './modules/auth/guards/admin-auth.guard';
import { HealthModule } from './modules/health/health.module';
import { MemberAuthModule } from './modules/member-auth/member-auth.module';
import { MemberAuthGuard } from './modules/member-auth/guards/member-auth.guard';
import { ArticleModule } from './modules/article/article.module';
import { UploadModule } from './modules/upload/upload.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { PermissionGuard } from './modules/rbac/guards/permission.guard';
import { DictModule } from './modules/dict/dict.module';
import { SiteConfigModule } from './modules/site-config/site-config.module';
import { AuditModule } from './modules/audit/audit.module';
import { RegionModule } from './modules/region/region.module';
import { NoticeModule } from './modules/notice/notice.module';
import { DeptModule } from './modules/dept/dept.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig, uploadConfig],
      validate,
      envFilePath: ['.env'],
    }),
    DatabaseModule.forRoot(),
    RedisModule,
    JwtModule,
    HealthModule,
    AuthModule,
    MemberAuthModule,
    RbacModule,
    ArticleModule,
    UploadModule,
    DictModule,
    SiteConfigModule,
    AuditModule,
    RegionModule,
    NoticeModule,
    DeptModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // 顺序：JWT → Admin/Member 类型隔离 → 权限码
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: AdminAuthGuard },
    { provide: APP_GUARD, useClass: MemberAuthGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
  ],
})
export class AppModule {}
