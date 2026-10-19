import app from './app.js';
import { closeDatabase } from './config/database.js';
import { env } from './config/env.js';

const server = app.listen(env.port, () => {
  console.log(`API do Voluntariado IFRS em http://localhost:${env.port}`);
  console.log(`Swagger em http://localhost:${env.port}/docs`);
});

async function shutdown(signal) {
  console.log(`Recebido ${signal}. Encerrando servidor...`);
  server.close(async () => {
    await closeDatabase();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
