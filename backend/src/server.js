import { app } from './app.js';
import { ENV, validateProductionSecrets } from './config/env.js';
import { logger } from './utils/logger.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

let server;

async function startServer() {
  try {
    validateProductionSecrets();

    // Attempt database connection (fail-fast in production)
    try {
      await connectDatabase();
    } catch (dbErr) {
      if (ENV.NODE_ENV === 'production') {
        logger.error(`Database connection failed in production: ${dbErr.message}. Exiting.`);
        process.exit(1);
      }
      logger.warn(`Database connection failed: ${dbErr.message}. Starting server in offline-database mode.`);
    }

    server = app.listen(ENV.PORT, () => {
      logger.info(`JonoShor Backend Server running on port ${ENV.PORT} [${ENV.NODE_ENV}]`);
      logger.info(`Health check available at http://localhost:${ENV.PORT}/api/v1/health`);
    });

    const handleShutdown = async (signal) => {
      logger.info(`${signal} received. Initiating graceful shutdown...`);
      if (server) {
        server.close(async () => {
          logger.info('HTTP server closed.');
          await disconnectDatabase();
          process.exit(0);
        });
      } else {
        await disconnectDatabase();
        process.exit(0);
      }
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Only start automatically if executed directly
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { server, startServer };
