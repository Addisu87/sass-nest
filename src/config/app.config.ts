import { normalizeNodeEnv, parseIntOrUndefined } from './env.utils';

export type AppConfig = {
  env: string;
  port: number;
};

export const appConfig = () => ({
  app: {
    env: normalizeNodeEnv(process.env.NODE_ENV),
    port: parseIntOrUndefined(process.env.PORT) ?? 3000,
  } satisfies AppConfig,
});
