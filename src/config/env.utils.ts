export const parseIntOrUndefined = (
  value: string | undefined,
): number | undefined => {
  if (value === undefined) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export type NormalizedNodeEnv = 'development' | 'production';

export const normalizeNodeEnv = (
  value: string | undefined,
): NormalizedNodeEnv => {
  const normalized = (value ?? '').trim().toLowerCase();
  if (normalized === 'production' || normalized === 'prod') return 'production';
  if (normalized === 'development' || normalized === 'dev')
    return 'development';
  return 'development';
};
