import { generate } from 'randomstring';
import { FromSchema } from 'json-schema-to-ts';

import expected from '../../__tests__/data.json';
import { TransactionSchema, AccountSchema } from '../../schemas';

type Transaction = FromSchema<typeof TransactionSchema>;
type Account = FromSchema<typeof AccountSchema>

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
            const { data: transactions } = await fetch('http://0.0.0.0:3000/transactions', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());

            expect(transactions.length).toEqual(3);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            expect(transactions.map(({id, source, created_at, ...rest}: Transaction) => rest)).toEqual(expect.arrayContaining(expected.transactions));
        });

        it('lists paginated transactions', async () => {
            const { data: transactions } = await fetch('http://0.0.0.0:3000/transactions', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());

            const { data: transaction1 } = await fetch('http://0.0.0.0:3000/transactions?limit=1', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());
            expect(transaction1.length).toEqual(1);
            expect(transaction1[0]).toEqual(transactions[0]);

            const { data: transaction2 } = await fetch('http://0.0.0.0:3000/transactions?from=1&limit=1', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());
            expect(transaction2.length).toEqual(1);
            expect(transaction2[0]).toEqual(transactions[1]);

            const { data: transaction3 } = await fetch('http://0.0.0.0:3000/transactions?from=2&limit=1', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());
            expect(transaction3.length).toEqual(1);
            expect(transaction3[0]).toEqual(transactions[2]);

            const { data: emptyTransactions } = await fetch('http://0.0.0.0:3000/transactions?from=3&limit=1', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());
            expect(emptyTransactions.length).toEqual(0);
        });
    });

    describe('create transaction', () => {
        it('fails if invalid body is sent', async () => {
            const { status } = await fetch('http://0.0.0.0:3000/transactions', {
                method: 'POST',
                headers: {
                    'x-api-key': 'secret-1',
                },
                body: JSON.stringify({
                    sourceAccountId: 'foo',
                    amount: '4',
                    recipientName: undefined,
                    targetIban: 12312,
                    targetBic: null,
                    reference: 'foo',
                }),
            });
            expect(status).toEqual(400);
        });

        it('fails if sender does not have sufficient amounts in their account', async () => {
            const { data } = await fetch('http://0.0.0.0:3000/accounts?limit=2', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());
            const accounts = data as Account[];

            const { status, message } = await fetch('http://0.0.0.0:3000/transactions', {
                method: 'POST',
                headers: {
                    'x-api-key': 'secret-1',
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    sourceAccountId: accounts[0].id,
                    amount: (accounts[0].balances?.available?.value || 0) + 10,
                    recipientName: 'Foo',
                    targetIban: accounts[1].iban,
                    targetBic: 'FAKE',
                    reference: 'foo too',
                }),
            }).then(R => R.json());
            expect(status).toEqual('error');
            expect(message).toEqual('Insufficient available balances')
        });

        it('fails if target IBAN is not found', async () => {
            const { data } = await fetch('http://0.0.0.0:3000/accounts?limit=1', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());
            const accounts = data as Account[];

            const { status, message } = await fetch('http://0.0.0.0:3000/transactions', {
                method: 'POST',
                headers: {
                    'x-api-key': 'secret-1',
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    sourceAccountId: accounts[0].id,
                    amount: 1,
                    recipientName: 'Foo',
                    targetIban: '!!nonexistingiban!!',
                    targetBic: 'FAKE',
                    reference: 'foo too',
                }),
            }).then(R => R.json());
            expect(status).toEqual('error');
            expect(message).toEqual('Target IBAN not found')
        });

        it('inserts new transaction record', async () => {
            const { data } = await fetch('http://0.0.0.0:3000/accounts?limit=2', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());
            const accounts = data as Account[];

            const randomReference = generate(12);
            const response = await fetch('http://0.0.0.0:3000/transactions', {
                method: 'POST',
                headers: {
                    'x-api-key': 'secret-1',
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    sourceAccountId: accounts[0].id,
                    amount: 2,
                    recipientName: 'TEST',
                    targetIban: accounts[1].iban,
                    targetBic: 'FAKE',
                    reference: randomReference,
                }),
            }).then(R => R.json());

            expect(response.status).toEqual('success');
            expect(response.data).toEqual(expect.objectContaining({
                source: accounts[0].id,
                amount: 2,
                recipient_name: 'TEST',
                target_iban: accounts[1].iban,
                target_bic: 'FAKE',
                reference: randomReference,
            }));

            const { data: transactions } = await fetch('http://0.0.0.0:3000/transactions', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());
            expect(transactions.find((transaction: Transaction) => transaction.reference === randomReference));

            // send it back so other tests can check expected accounts balances
            await fetch('http://0.0.0.0:3000/transactions', {
                method: 'POST',
                headers: {
                    'x-api-key': 'secret-1',
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    sourceAccountId: accounts[1].id,
                    amount: 2,
                    recipientName: 'TEST',
                    targetIban: accounts[0].iban,
                    targetBic: 'FAKE',
                    reference: randomReference,
                }),
            }).then(R => R.json());
        });

        it('updates sender and target balances', async () => {
            const { data } = await fetch('http://0.0.0.0:3000/accounts', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());
            const accounts = data as Account[];

            const randomReference = generate(12);
            const transferAmount = 2;
            await fetch('http://0.0.0.0:3000/transactions', {
                method: 'POST',
                headers: {
                    'x-api-key': 'secret-1',
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    sourceAccountId: accounts[0].id,
                    amount: transferAmount,
                    recipientName: 'TEST',
                    targetIban: accounts[1].iban,
                    targetBic: 'FAKE',
                    reference: randomReference,
                }),
            }).then(R => R.json());

            const { data: updatedData } = await fetch('http://0.0.0.0:3000/accounts', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());
            const updatedAccounts = updatedData as Account[];
            const updatedAccount0 = updatedAccounts.find((account) => account.id === accounts[0].id);
            const updatedAccount1 = updatedAccounts.find((account) => account.iban === accounts[1].iban);
            expect(updatedAccount0?.balances?.available?.value).toEqual(accounts[0].balances?.available?.value as number - transferAmount);
            expect(updatedAccount1?.balances?.available?.value).toEqual(accounts[1].balances?.available?.value as number + transferAmount);

            // send it back so other tests can check expected accounts balances
            await fetch('http://0.0.0.0:3000/transactions', {
                method: 'POST',
                headers: {
                    'x-api-key': 'secret-1',
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    sourceAccountId: accounts[1].id,
                    amount: 2,
                    recipientName: 'TEST',
                    targetIban: accounts[0].iban,
                    targetBic: 'FAKE',
                    reference: randomReference,
                }),
            }).then(R => R.json());
        }); 
    });
});
