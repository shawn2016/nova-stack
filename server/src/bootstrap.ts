import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/** 配置 Swagger 文档（全局管道/拦截器/过滤器由 AppModule APP_* 提供） */
export async function configureApp(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Nova Stack API')
    .setDescription('Nova Stack 后端 API 文档')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
