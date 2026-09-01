import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { GlobalExceptionFilter } from '@shared/infrastructure/filters/global-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser())
  app.useGlobalFilters(new GlobalExceptionFilter())

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.enableShutdownHooks();

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port);
  
  logger.log(`🚀 SaaS Multi-tenant API iniciada com sucesso em: http://localhost:${port}/api`);
}

bootstrap();