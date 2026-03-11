import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { CatsModule } from './modules/cats/cats.module';
import { logger } from './modules/cats/logger.middleware';
import { CatsController } from './modules/cats/cats.controller';
import { AppService } from './app.service';
import { ConfigModule } from './modules/config/config.module';
import { AppController } from './app.controller';
import configuration from './modules/config/configuration';
import databaseConfig from './modules/config/database.config';
import Joi, { options } from 'joi';
import { validate } from './modules/config/env.validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSchema } from './modules/users/schema/user.schema';
import { ConfigService } from './modules/config/config.service';
import { DataSource } from 'typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { Cat, CatSchema } from './modules/cats/schemas/cat.schema';
import {
  Schema,
  Model,
  Document,
  DefaultSchemaOptions,
  Types,
  SchemaDefinitionProperty,
  connection,
} from 'mongoose';
// import { RolesGuard } from './cats/roles.guard';
// import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

import { CacheModule } from '@nestjs/cache-manager';
import { KeyvRedis } from 'keyv/redis';
import { Keyv } from 'keyv';
import * as CacheableMemory from 'cacheable';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './modules/tasks/tasks.module';
import { BullModule } from '@nestjs/bullmq';
import { join } from 'node:path';
import { EventEmitterModule } from '@nestjs/event-emitter';

// import { DevConfigService } from './modules/config/dev-config.service';
// import { ProdConfigService } from './modules/config/prod-config.service';

// const configServiceProvider = {
//   provide: 'ConfigService',
//   useClass:
//     process.env.NODE_ENV === 'development'
//       ? DevConfigService
//       : ProdConfigService,
// };

@Module({
  // imports: [ConfigModule.register({ folder: './config' }), CatsModule],
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost/nest',
      {
        connectionFactory: (connection) => {
          connection.plugin(require('mongoose-autopopulate'));

          connection.on('connected', () => {
            console.log('Mongoose connected to ' + connection.name);
          });

          return connection;
        },
      },
    ),
    CatsModule,
    CacheModule.register({
      ttl: 5, // seconds
      max: 100, // maximum number of items in cache
    }),

    // Task scheduling
    ScheduleModule.forRoot(),
    TasksModule,

    // Queues and background jobs
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

    EventEmitterModule.forRoot(),

    // CacheModule.registerAsync({
    //   useFactory: async () => {
    //     return {
    //       stores: [
    //         new Keyv({
    //           store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
    //         }),
    //         new KeyvRedis('redis://localhost:6379'),
    //       ],
    //     };
    //   },
    // }),

    // CacheModule.registerAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     ttl: configService.get('CACHE_TTL')
    //   }),
    //   inject: [ConfigService]
    // })

    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     uri: configService.get<string>('MONGODB_URI'),
    //   }),
    //   inject: [ConfigService],
    // }),

    // useFactory: async (ConfigService: ConfigService) => ({
    //   type: 'postgres',
    //   port: +ConfigService.get('DATABASE_PORT') || 5432,
    //   host: ConfigService.get('DATABASE_HOST') || 'localhost',
    //   username: ConfigService.get('DATABASE_USER') || 'postgres',
    //   password: ConfigService.get('DATABASE_PASSWORD') || 'password',
    //   database: ConfigService.get('DATABASE_NAME') || 'db',
    //   synchronize: true,
    // }),
    // inject: [ConfigService],

    // dataSourceFactory: async (options => {
    //   const dataSource = await new DataSource(options).initialize();
    //   return dataSource
    // })

    // ConfigModule.forRoot({
    //   envFilePath: '.development.env',
    //   ignoreEnvFile: true,
    //   isGlobal: true,
    //   load: [databaseConfig, configuration],
    //   cache: true,
    //   validationSchema: Joi.object({
    //     NODE_ENV: Joi.string()
    //       .valid('development', 'production', 'test')
    //       .default('development'),
    //     PORT: Joi.number().default(3000),
    //     DATABASE_HOST: Joi.string().default('localhost'),
    //     DATABASE_PORT: Joi.number().default(5432),
    //   }),
    //   validationOptions: {
    //     allowUnknown: false,
    //     abortEarly: true,
    //   },
    //   validate,
    //   expandVariables: true,
    // }),
  ],
  controllers: [AppController],
  providers: [AppService, configServiceProvider],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(logger).forRoutes(CatsController);
  }
}
