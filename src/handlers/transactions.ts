import sql from '@nearform/sql';
import { FastifyReply, FastifyRequest } from "fastify";
import { Client } from 'pg';
import { FromSchema } from 'json-schema-to-ts';

import { ListTransactionsQuerySchema, CreateTransactionBodySchema } from '../schemas';

type ListTransactionsQuery = FromSchema<typeof ListTransactionsQuerySchema>;
type CreateTransactionBody = FromSchema<typeof CreateTransactionBodySchema>;

function listTransactionsQuery({ from, limit }: ListTransactionsQuery) {
    return sql`
        SELECT * FROM transactions
        ${from ? sql`OFFSET ${from}` : sql``}
        ${limit ? sql`LIMIT ${limit}` : sql``}
    `;
}

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
    RETURNING *
`;

export function createListTransactionsHandler(client: Client) {
    return async function handler(request: FastifyRequest, reply: FastifyReply) {
        const query = request.query as ListTransactionsQuery;

        request.log.debug(`Listing ${query.limit ? query.limit : ' '}transactions ${query.from ? `starting with ${query.from}th entry` : ''}`);

        try {
            const transactions = await client.query(listTransactionsQuery(query));

            reply.status(200);
            reply.type('application/json');
            reply.send({ status: 'success', data: transactions.rows });
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

            request.log.info(`Successful transfer: ${JSON.stringify(transactionData)}`); // can easily be parsed in Grafana or elsewhere
            request.log.debug(`Successfully transfered ${transactionData.amount} EUR from account ${transactionData.sourceAccountId} to IBAN ${transactionData.targetIban}`);

            reply.status(201);
            reply.type('application/json');
            reply.send({ status: 'success', data: transaction.rows[0] });
        } catch (err) {
            request.log.debug(`Failed to transfer ${transactionData.amount} EUR from account ${transactionData.sourceAccountId} to IBAN ${transactionData.targetIban}`);

            if (err instanceof Error && (['Target IBAN not found', 'Insufficient available balances'].includes(err.message))) {
                reply.status(200);
                reply.type('application/json');
                reply.send({ status: 'error', message: err.message });
            }

            request.log.error(err);

            reply.status(500);
            reply.send();
        }
    }
}
