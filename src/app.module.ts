import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { CatsModule } from './modules/cats/cats.module';
import { logger } from './modules/cats/logger.middleware';
import { CatsController } from './modules/cats/cats.controller';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { ApiConfigService, AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
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

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    UsersModule,
    CatsModule,
    CoreModule,
    EventsModule,

    CacheModule.register({
      ttl: Number(process.env.CACHE_TTL) || 5000,
      max: 100,
    }),

    // Task scheduling
    ScheduleModule.forRoot(),
    TasksModule,

    // Queues and background jobs (Redis)
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: Number.parseInt(process.env.REDIS_PORT || '6379'),
        },
      }),
    }),
    BullModule.registerQueueAsync({
      name: 'audio',
      useFactory: () => ({
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: Number.parseInt(process.env.REDIS_PORT || '6379'),
        },
      }),
    }),

    // Event-driven architecture
    EventEmitterModule.forRoot(),
    OrdersModule,

    // upload files
    MulterModule.register({
      dest: process.env.MULTER_DEST || './uploads',
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

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'password',
      database: process.env.DB_NAME || 'db',
      autoLoadEntities: true,
      synchronize: true,
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
