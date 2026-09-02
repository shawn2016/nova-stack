import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const ADMIN_DEV_ORIGIN = 'http://localhost:5173';
const UNI_APP_DEV_ORIGIN = 'http://localhost:5174';

/** 配置 Swagger 文档与 CORS（全局管道/拦截器/过滤器由 AppModule APP_* 提供） */
export async function configureApp(app: INestApplication) {
  app.enableCors({
    origin: [ADMIN_DEV_ORIGIN, UNI_APP_DEV_ORIGIN],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Nova Stack API')
    .setDescription('Nova Stack 后端 API 文档')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
