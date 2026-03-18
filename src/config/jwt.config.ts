export type JwtConfig = {
  accessSecret: string;
  refreshSecret: string;
  accessExpiration: string;
  refreshExpiration: string;
};

export const jwtConfig = () => ({
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION ?? '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION ?? '7d',
  } satisfies JwtConfig,
});
