import { FromSchema } from 'json-schema-to-ts';

import expected from '../../__tests__/data.json';
import { TransactionSchema } from '../../schemas';

type Transaction = FromSchema<typeof TransactionSchema>;

describe('transaction handlers', () => {
    describe('list transactions', () => {
        it('fails with malformed query parameters', async () => {
            const response1 = await fetch('http://0.0.0.0:3000/transactions?from=A', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            });
            expect(response1.status).toEqual(400);

            const response2 = await fetch('http://0.0.0.0:3000/transactions?limit={}', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            });
            expect(response2.status).toEqual(400);
        });

        it('lists all transactions without pagination', async () => {
            const transactions = await fetch('http://0.0.0.0:3000/transactions', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());

            expect(transactions.length).toEqual(3);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            expect(transactions.map(({id, source, created_at, ...rest}: Transaction) => rest)).toEqual(expect.arrayContaining(expected.transactions));
        });

        it('lists paginated transactions', async () => {
            const transactions = await fetch('http://0.0.0.0:3000/transactions', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());

            const transaction1 = await fetch('http://0.0.0.0:3000/transactions?limit=1', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());
            expect(transaction1.length).toEqual(1);
            expect(transaction1[0]).toEqual(transactions[0]);

            const transaction2 = await fetch('http://0.0.0.0:3000/transactions?from=1&limit=1', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());
            expect(transaction2.length).toEqual(1);
            expect(transaction2[0]).toEqual(transactions[1]);

            const transaction3 = await fetch('http://0.0.0.0:3000/transactions?from=2&limit=1', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());
            expect(transaction3.length).toEqual(1);
            expect(transaction3[0]).toEqual(transactions[2]);

            const emptyTransactions = await fetch('http://0.0.0.0:3000/transactions?from=3&limit=1', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());
            expect(emptyTransactions.length).toEqual(0);
        });
    });

    describe('create transaction', () => {
        it('should fail', () => {
            expect(true).toBeFalsy();
        });
    });
});
