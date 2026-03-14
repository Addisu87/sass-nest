import { HttpAdapterHost, LazyModuleLoader, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { Logger, VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import session from 'express-session';
import { join } from 'node:path';
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { doubleCsrf, DoubleCsrfConfigOptions } from 'csrf-csrf';
import { RedisIoAdapter } from './common/adapters/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger: new Logger(),
      // logger: new WinstonLoggerService(),
      forceCloseConnections: true,
      snapshot: true,
    },
  );

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  const lazyModuleLoader = app.get(LazyModuleLoader);
  console.log(lazyModuleLoader);

  app.enableShutdownHooks();

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.use(cookieParser());
  app.use(compression());
  app.use(
    session({
      secret: 'my-secret',
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
    prefix: '/public/',
  });
  app.setViewEngine({
    engine: {
      handlebars: require('handlebars'),
    },
    templates: join(__dirname, '..', 'views'),
  });

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    jsonDocumentUrl: 'swagger/json',
  });

  app.use(helmet());
  app.enableCors();

  const doubleCsrfOptions: DoubleCsrfConfigOptions = {
    getSecret: () => process.env.CSRF_SECRET ?? 'csrf-secret',
    getSessionIdentifier: (req) => (req.session as any)?.id ?? 'default',
  };

  const {
    invalidCsrfTokenError: _invalidCsrfTokenError,
    generateCsrfToken: _generateCsrfToken,
    validateRequest: _validateRequest,
    doubleCsrfProtection,
  } = doubleCsrf(doubleCsrfOptions);
  app.use(doubleCsrfProtection);

  if (process.env.ENABLE_REDIS_IO === 'true') {
    try {
      const redisUrl =
        process.env.REDIS_URL ||
        `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`;
      const redisIoAdapter = new RedisIoAdapter(app, redisUrl);
      await redisIoAdapter.connectToRedis();
      app.useWebSocketAdapter(redisIoAdapter);
      console.log('Socket.IO using Redis adapter');
    } catch (err) {
      console.warn(
        'Redis unavailable for Socket.IO, using default adapter:',
        (err as Error).message,
      );
    }
  }

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
