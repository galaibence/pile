// Import the framework and instantiate it
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import pg from 'pg';

import {
  createGetAccountHandler,
  createListAccountsHandler,
} from './handlers/accounts';
import { CreateTransactionBodySchema, GetAccountParamsSchema, ListAccountsQuerySchema, ListTransactionsQuerySchema } from './schemas';
import { createListTransactionsHandler, createCreateTransactionsHandler } from './handlers/transactions';

const VALID_API_KEY = 'secret-1';

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

  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    const apiKey = request.headers['x-api-key'];
    if (apiKey !== VALID_API_KEY) {
      reply.status(401);
      reply.send();
    }
  });

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

  fastify.get(
    '/transactions', {
    schema: {
      params: ListTransactionsQuerySchema,
    },
  },
    createListTransactionsHandler(client),
  );

  fastify.post(
    '/transactions', {
    schema: {
      body: CreateTransactionBodySchema,
    },
  },
    createCreateTransactionsHandler(client),
  );


  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})();
