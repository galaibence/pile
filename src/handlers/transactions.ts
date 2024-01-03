import sql from '@nearform/sql';
import { FastifyReply, FastifyRequest } from "fastify";
import { Client } from 'pg';
import { FromSchema } from 'json-schema-to-ts';

import { ListTransactionsQuerySchema, CreateTransactionBodySchema } from '../schemas';

type ListTransactionsQuery = FromSchema<typeof ListTransactionsQuerySchema>;
type CreateTransactionBody = FromSchema<typeof CreateTransactionBodySchema>;

const insertTransactionQuery = ({
    sourceAccountId,
    amount,
    recipientName,
    reference,
    targetBic,
    targetIban,
}: CreateTransactionBody) => sql`
    INSERT INTO transactions (source, amount, recipient_name, reference, target_bic, target_iban)
    VALUES (${sourceAccountId}, ${amount}, ${recipientName}, ${reference}, ${targetBic}, ${targetIban})
    RETURNING id, source, amount, recipient_name, reference, target_bic, target_iban
`;

export function createListTransactionsHandler(client: Client) {
    return async function handler(request: FastifyRequest, reply: FastifyReply) {
        const { from, limit } = request.query as ListTransactionsQuery;

        try {
            const transactions = await client.query(sql`SELECT * FROM transactions OFFSET ${from} LIMIT ${limit}`);

            reply.status(200);
            reply.type('application/json');
            reply.send(transactions.rows);
        } catch (err) {
            request.log.error(err);

            reply.status(500);
            reply.send();
        }
    }
}

export function createCreateTransactionsHandler(client: Client) {
    return async function handler(request: FastifyRequest, reply: FastifyReply) {
        const transactionData = request.body as CreateTransactionBody

        try {
            const transaction = await client.query(insertTransactionQuery(transactionData));
            console.log(transaction);

            reply.status(200);
        } catch (err) {
            request.log.error(err);

            reply.status(500);
            reply.send();
        }
    }
}
