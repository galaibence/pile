// Import the framework and instantiate it
import Fastify from 'fastify';
import pg from 'pg';

import {
  createGetAccountHandler,
  createListAccountsHandler,
} from './handlers/accounts';
import { GetAccountParamsSchema, ListAccountsQuerySchema } from './schemas';

(async () => {
  const fastify = Fastify({
    logger: true,
    ignoreTrailingSlash: true,
  })

  const client = new pg.Client({
    database: 'pile',
    user: 'cicd',
    password: 'pipeline',
    host: 'pile-db',
    port: 5432,
  });
  await client.connect();

  // Declare a route
  fastify.get(
    '/accounts', {
      schema: {
        querystring: ListAccountsQuerySchema,
      }
  },
    createListAccountsHandler(client),
  );

  fastify.get(
    '/accounts/:id', {
      schema: {
        params: GetAccountParamsSchema,
      }
  },
    createGetAccountHandler(client),
  );

  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})();
