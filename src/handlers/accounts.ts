import sql from '@nearform/sql';
import { FastifyReply, FastifyRequest } from "fastify";
import { Client } from 'pg';
import { FromSchema, } from 'json-schema-to-ts';

import { GetAccountParamsSchema, ListAccountsQuerySchema } from '../schemas';

type ListAccountsQuery = FromSchema<typeof ListAccountsQuerySchema>;
type GetAccountPathParams = FromSchema<typeof GetAccountParamsSchema>;

function listAccountsQuery({ from, limit, max, min, }: ListAccountsQuery) {
    return sql`
        SELECT * FROM accounts
        ${min || max ? sql`WHERE` : sql``}
        ${min ? sql`(balances -> 'available' ->> 'value')::DECIMAL >= ${min}` : sql``}
        ${max ? sql`(balances -> 'available' ->> 'value')::DECIMAL < ${max}` : sql``}
        ${from ? sql`OFFSET ${from}` : sql``}
        ${limit ? sql`LIMIT ${limit}` : sql``}
    `;
}

export function createListAccountsHandler(client: Client) {
    return async function handler(request: FastifyRequest, reply: FastifyReply) {
        // Fastify already validated the schema, safe to use `as`
        const query = request.query as ListAccountsQuery

        request.log.debug(`Listing ${query.limit ? query.limit : ' '}accounts ${query.from ? `starting with ${query.from}th entry` : ''}`);

        try {
            const responses = await client.query(listAccountsQuery(query));

            reply.status(200);
            reply.type('application/json');
            reply.send(responses.rows);
        } catch (err) {
            request.log.error(err);

            reply.status(500);
            reply.send();
        }
    }
}

export function createGetAccountHandler(client: Client) {
    return async function handler(request: FastifyRequest, reply: FastifyReply) {
        // Fastify already validated the schema, safe to use `as`
        const { id } = request.params as GetAccountPathParams;

        request.log.debug(`Getting account information for account ${id}`);

        try {
            const response = await client.query(sql`SELECT * FROM accounts WHERE id = ${id}`);

            reply.status(200);
            reply.type('application/json');
            reply.send(response.rows[0]);
        } catch (err) {
            request.log.error(err);

            reply.status(500);
            reply.send();
        }
    }
}
