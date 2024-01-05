// Import the framework and instantiate it
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import pg from 'pg';

import {
  createGetAccountHandler,
  createListAccountsHandler,
} from './handlers/accounts';
import {
  CreateTransactionBodySchema,
  CreateTransactionErrorSchema,
  CreateTransactionResponseSchema,
  GetAccountParamsSchema,
  GetAccountResponseSchema,
  ListAccountsQuerySchema,
  ListAccountsResponseSchema,
  ListTransactionsQuerySchema,
  ListTransactionsResponseSchema,
} from './schemas';
import { createListTransactionsHandler, createCreateTransactionsHandler } from './handlers/transactions';

const VALID_API_KEY = 'secret-1';

export function createApp(client: pg.Client) {
  const fastify = Fastify({
    logger: {
      level: 'info',
      file: '/tmp/api.log'
    },
    ignoreTrailingSlash: true,
  })

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
      response: {
        200: ListAccountsResponseSchema,
      },
    },
  },
    createListAccountsHandler(client),
  );

  fastify.get(
    '/accounts/:id', {
    schema: {
      params: GetAccountParamsSchema,
      response: {
        200: GetAccountResponseSchema,
      },
    },
  },
    createGetAccountHandler(client),
  );

  fastify.get(
    '/transactions', {
    schema: {
      querystring: ListTransactionsQuerySchema,
      response: {
        200: ListTransactionsResponseSchema,
      },
    },
  },
    createListTransactionsHandler(client),
  );

  fastify.post(
    '/transactions', {
    schema: {
      body: CreateTransactionBodySchema,
      response: {
        200: CreateTransactionErrorSchema,
        201: CreateTransactionResponseSchema,
      },
    },
  },
    createCreateTransactionsHandler(client),
  );

  return fastify;
}
