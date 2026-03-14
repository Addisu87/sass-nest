export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10) || 3000,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10) || 5432,
    username: process.env.DB_USER || 'user',
    password: process.env.DB_PASS|| 'password',
    name: process.env.DB_NAME || 'db',
  },
});
