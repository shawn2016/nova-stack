import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { API_PREFIX } from './common/constants/api-prefix';

/** 配置 Swagger 文档与 CORS（全局管道/拦截器/过滤器由 AppModule APP_* 提供） */
export async function configureApp(app: INestApplication) {
  const configService = app.get(ConfigService);
  const corsOrigins =
    configService
      .get<string>('app.corsOrigins')
      ?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? ['http://localhost:5173', 'http://localhost:5174'];

  app.setGlobalPrefix(API_PREFIX);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Nova Stack API')
    .setDescription('Nova Stack 后端 API 文档')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const uploadsDir = process.env.UPLOADS_DIR ?? join(process.cwd(), 'uploads');
  (app as NestExpressApplication).useStaticAssets(uploadsDir, {
    prefix: '/uploads',
  });
}
