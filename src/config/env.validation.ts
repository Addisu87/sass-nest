import { plainToInstance, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsString, Max, Min, validateSync } from 'class-validator';

enum Environment {
  development = 'development',
  production = 'production',
  test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.development;

  @IsNumber()
  @Min(0)
  @Max(65535)
  @Type(() => Number)
  PORT: number;

  @IsString()
  DATABASE_HOST: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  @Type(() => Number)
  DATABASE_PORT: number;
}

export function validate(config: Record<string, unknown>) {
  // Normalize config: support both flat env vars and nested load() structure
  const normalizedConfig = {
    NODE_ENV: config.NODE_ENV ?? process.env.NODE_ENV ?? 'development',
    PORT: config.PORT ?? (config as any).port ?? process.env.PORT ?? 3000,
    DATABASE_HOST: config.DATABASE_HOST ?? (config as any).database?.host ?? process.env.DB_HOST ?? process.env.DATABASE_HOST ?? 'localhost',
    DATABASE_PORT: config.DATABASE_PORT ?? (config as any).database?.port ?? process.env.DB_PORT ?? process.env.DATABASE_PORT ?? 5432,
  };

  const validatedConfig = plainToInstance(EnvironmentVariables, normalizedConfig, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return { ...config, ...validatedConfig };
}
