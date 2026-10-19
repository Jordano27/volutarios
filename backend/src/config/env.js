import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT || 3000),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'troque-esta-chave-em-producao',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    name: process.env.DB_NAME || 'voluntariado_ifrs',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  },
};
