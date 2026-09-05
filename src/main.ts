import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import type { EnvironmentVariables } from './config/env.validation';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // Campo desconhecido vira 400 em vez de ser silenciosamente descartado.
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaExceptionFilter(httpAdapter));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Dining')
    .setDescription('Onde a gente vai comer hoje?')
    .setVersion('1.0')
    .build();

  SwaggerModule.setup(
    'api',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  // Faz o Nest chamar onModuleDestroy no SIGTERM/SIGINT.
  app.enableShutdownHooks();

  const config = app.get(ConfigService<EnvironmentVariables, true>);

  await app.listen(config.get('PORT', { infer: true }));
}

void bootstrap();
