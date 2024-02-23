import { httpServer } from './init.http';
import { config } from 'dotenv';
config();

// Export handler to initialize lambdas
export { handler } from './init.serverless';

// If is in dev environment initialize http server
if (process.env.SERVER_MODE === 'http') {
  httpServer();
}
