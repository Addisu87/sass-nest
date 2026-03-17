import {
  HttpAdapterHost,
  LazyModuleLoader,
  NestFactory,
  Reflector,
} from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ValidationPipe } from './common/pipes/validation.pipe';
import {
  ClassSerializerInterceptor,
  Logger,
  VersioningType,
} from '@nestjs/common';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import session from 'express-session';
import { join } from 'node:path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { doubleCsrf, DoubleCsrfConfigOptions } from 'csrf-csrf';
import { RedisIoAdapter } from './common/adapters/redis-io.adapter';
import type { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new Logger(),
    // logger: new WinstonLoggerService(),
    forceCloseConnections: true,
    snapshot: true,
  });

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  const lazyModuleLoader = app.get(LazyModuleLoader);
  console.log(lazyModuleLoader);

  app.enableShutdownHooks();

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Convenience redirect: the API is URI-versioned, so `/` would otherwise 404.
  app
    .getHttpAdapter()
    .getInstance()
    .get('/', (_req: Request, res: Response) => res.redirect('/api'));

  app.use(cookieParser());
  app.use(compression());
  app.use(
    session({
      secret: 'my-secret',
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/public/' });
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  const config = new DocumentBuilder()
    .addGlobalResponse({
      status: 500,
      description: 'Internal server error',
    })
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
    getSessionIdentifier: (req) => (req.sessionID as string) ?? 'default',
  };

  const {
    invalidCsrfTokenError: _invalidCsrfTokenError,
    generateCsrfToken: _generateCsrfToken,
    validateRequest: _validateRequest,
    doubleCsrfProtection,
  } = doubleCsrf(doubleCsrfOptions);
  if (process.env.ENABLE_CSRF === 'true') {
    app.use((req: Request, res: Response, next: NextFunction) => {
      const accept = req.headers.accept ?? '';
      const contentType = req.headers['content-type'] ?? '';
      const isJson =
        accept.includes('application/json') ||
        contentType.includes('application/json');
      const hasBearer = Boolean(req.headers.authorization);

      if (isJson || hasBearer) return next();
      return doubleCsrfProtection(req, res, next);
    });
  }

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
