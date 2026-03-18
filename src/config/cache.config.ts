import { parseIntOrUndefined } from './env.utils';

export type CacheConfig = {
  ttl: number;
};

export const cacheConfig = () => ({
  cache: {
    ttl: parseIntOrUndefined(process.env.CACHE_TTL) ?? 5000,
  } satisfies CacheConfig,
});
