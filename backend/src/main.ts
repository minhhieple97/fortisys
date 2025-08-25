import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import {
  HttpExceptionFilter,
  ValidationExceptionFilter,
} from './common/filters';
import {
  LoggingInterceptor,
  ResponseTransformInterceptor,
} from './common/interceptors';
import {
  SERVER_DEFAULT_PORT,
  SERVER_DEFAULT_FRONTEND_URL,
  SERVER_API_PREFIX,
} from './constants';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(SERVER_API_PREFIX);
  app.use(helmet());
  app.use(compression());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filters
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new ValidationExceptionFilter(),
  );

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseTransformInterceptor(),
  );

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || SERVER_DEFAULT_FRONTEND_URL,
    credentials: true,
  });

  const port = process.env.PORT || SERVER_DEFAULT_PORT;

  await app.listen(port);

  console.log(
    `✅ Application is running on: http://localhost:${port}/${SERVER_API_PREFIX}`,
  );
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
