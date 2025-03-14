import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerFactory } from './shared/module/logger/util/logger.factory';
import { ConfigService } from './shared/module/config/config.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const logger = LoggerFactory('appplication-main');
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get('port');

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useLogger(logger);
  app.enableCors();
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
    defaultVersion: '1',
  });
  const config = new DocumentBuilder()
    .setTitle('Article Agent RAG API')
    .addApiKey(
      {
        description: 'You need to provide an API key to access this API',
        name: 'x-api-key',
        scheme: 'x-api-key',
        type: 'apiKey',
        in: 'header',
      },
      'x-api-key',
    )
    .addSecurityRequirements('x-api-key')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  app.use(
    '/api/v1/docs',
    apiReference({
      theme: 'deepSpace',
      spec: {
        content: document,
      },
      hideModels: true,
    }),
  );

  await app.listen(port);
  logger.log({ message: `Application running on port ${port}` });
}
bootstrap();
