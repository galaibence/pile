import { FromSchema } from 'json-schema-to-ts';

import { AccountSchema } from '../../schemas';
import expected from '../../__tests__/data.json';

type Account = FromSchema<typeof AccountSchema>;

describe('account handlers', () => {
    describe('list accounts', () => {
        it('fails with malformed query parameters', async () => {
            const response1 = await fetch('http://0.0.0.0:3000/accounts?from=A', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            });
            expect(response1.status).toEqual(400);

            const response2 = await fetch('http://0.0.0.0:3000/accounts?limit={}', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            });
            expect(response2.status).toEqual(400);

            const response3 = await fetch('http://0.0.0.0:3000/accounts?min=null', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            });
            expect(response3.status).toEqual(400);

            const response4 = await fetch('http://0.0.0.0:3000/accounts?max=false', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            });
            expect(response4.status).toEqual(400);
        });

        it('lists all accounts without pagination', async () => {
            const { data: accounts } = await fetch('http://0.0.0.0:3000/accounts', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());

            expect(accounts.length).toEqual(3);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            expect(accounts.map(({ id, created_at, ...rest }: Account) => rest)).toEqual(expect.arrayContaining(expected.accounts));
        });

        it('lists paginated accounts', async () => {
            const { data: accounts } = await fetch('http://0.0.0.0:3000/accounts', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());

            const { data: account1 } = await fetch('http://0.0.0.0:3000/accounts?limit=1', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());
            expect(account1.length).toEqual(1);
            expect(account1[0]).toEqual(accounts[0]);

            const { data: account2 } = await fetch('http://0.0.0.0:3000/accounts?from=1&limit=1', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());
            expect(account2.length).toEqual(1);
            expect(account2[0]).toEqual(accounts[1]);

            const { data: account3 } = await fetch('http://0.0.0.0:3000/accounts?from=2&limit=1', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());
            expect(account3.length).toEqual(1);
            expect(account3[0]).toEqual(accounts[2]);

            const { data: emptyAccounts } = await fetch('http://0.0.0.0:3000/accounts?from=3&limit=1', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());
            expect(emptyAccounts.length).toEqual(0);
        });

        it('respects min filter value', async () => {
            const { data: accounts } = await fetch('http://0.0.0.0:3000/accounts?min=90', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());

            expect(accounts.every((account: Account) => account.balances?.available?.value && account.balances?.available?.value > 90)).toBeTruthy();
        });

        it('respects max filter value', async () => {
            const { data: accounts } = await fetch('http://0.0.0.0:3000/accounts?max=90', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());

            expect(accounts.every((account: Account) => account.balances?.available?.value && account.balances?.available?.value < 90)).toBeTruthy();
        });

    });

    describe('get account', () => {
        it('returns the requested account', async () => {
            const { data: accounts } = await fetch('http://0.0.0.0:3000/accounts', {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());

            const { data: account3 } = await fetch(`http://0.0.0.0:3000/accounts/${accounts[2].id}`, {
                headers: {
                    'x-api-key': 'secret-1',
                },
            }).then(R => R.json());

            expect(account3).toEqual(accounts[2]);
        });
    });
});
