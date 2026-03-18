import { type ConfigFactory } from '@nestjs/config';
import { appConfig } from './app.config';
import { cacheConfig } from './cache.config';
import { databaseConfig } from './database.config';
import { jwtConfig } from './jwt.config';
import { multerConfig } from './multer.config';
import { redisConfig } from './redis.config';

export const configuration: ConfigFactory[] = [
  appConfig,
  databaseConfig,
  redisConfig,
  cacheConfig,
  multerConfig,
  jwtConfig,
];
