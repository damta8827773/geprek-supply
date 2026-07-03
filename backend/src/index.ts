import { createApp } from './app.js';
import { env } from './env.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';

async function bootstrap() {
  // Fail fast if the database is unreachable.
  await prisma.$connect();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 API ready at http://localhost:${env.PORT}/api  (env: ${env.NODE_ENV})`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received - shutting down gracefully`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
