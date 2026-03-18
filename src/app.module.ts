import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { CatsModule } from './modules/cats/cats.module';
import { logger } from './modules/cats/logger.middleware';
import { CatsController } from './modules/cats/cats.controller';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { ApiConfigService, AppService } from './app.service';
import { DatabaseModule } from './config/database.module';
import { configuration } from './config/configuration';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './commands/tasks/tasks.module';
import { BullModule } from '@nestjs/bullmq';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { OrdersModule } from './modules/orders/orders.module';
import { MulterModule } from '@nestjs/platform-express';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { EventsModule } from './events/events.module';
import { PhotoModule } from './modules/photo/photo.module';
import { ConfigService } from '@nestjs/config';
import { normalizeNodeEnv } from './config/env.utils';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        normalizeNodeEnv(process.env.NODE_ENV) === 'production'
          ? ['.env.production', '.env']
          : ['.env', '.env.production'],
      load: configuration,
      cache: true,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    CatsModule,
    CoreModule,
    EventsModule,
    PhotoModule,
    HealthModule,

    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get<number>('cache.ttl') ?? 5000,
        max: 100,
      }),
    }),

    // Task scheduling
    ScheduleModule.forRoot(),
    TasksModule,

    // Queues and background jobs (Redis)
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redis.host') ?? 'localhost',
          port: configService.get<number>('redis.port') ?? 6379,
        },
      }),
    }),
    BullModule.registerQueueAsync({
      name: 'audio',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redis.host') ?? 'localhost',
          port: configService.get<number>('redis.port') ?? 6379,
        },
      }),
    }),

    // Event-driven architecture
    EventEmitterModule.forRoot(),
    OrdersModule,

    // upload files
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dest: configService.get<string>('multer.dest') ?? './uploads',
      }),
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 5,
      },
    ]),

    // Dev tools
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
  ],
  controllers: [AppController],
  providers: [ApiConfigService, AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(logger).forRoutes(CatsController);
  }
}
