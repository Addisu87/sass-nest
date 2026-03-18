import { normalizeNodeEnv, parseIntOrUndefined } from './env.utils';

export type DatabaseConfig = {
  url?: string;
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
  synchronize: boolean;
};

export const databaseConfig = () => ({
  database: {
    url: process.env.DB_URI || undefined,
    host: process.env.DB_HOST,
    port: parseIntOrUndefined(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    name: process.env.DB_NAME,
    synchronize: normalizeNodeEnv(process.env.NODE_ENV) !== 'production',
  } satisfies DatabaseConfig,
});
