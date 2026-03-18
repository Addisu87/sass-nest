import { parseIntOrUndefined } from './env.utils';

export type RedisConfig = {
  host: string;
  port: number;
};

export const redisConfig = () => ({
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseIntOrUndefined(process.env.REDIS_PORT) ?? 6379,
  } satisfies RedisConfig,
});
