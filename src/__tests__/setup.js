/* eslint-disable */
const pg = require('pg');
const sql = require('@nearform/sql');

const { createApp } = require('../app');
const migrations = require('../../database/migrations/run');
const { accounts, transactions } = require('./data.json');

module.exports = async function () {
    await migrations();

    const client = new pg.Client({
        host: process.env.DB_HOSTNAME,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
    });
    await client.connect();

    const { rows } = await client.query(sql`
        INSERT INTO accounts (iban, name, country, balances)
        VALUES ${sql.glue(
            accounts.map((account) => sql`(${account.iban}, ${account.name}, ${account.country}, ${JSON.stringify(account.balances)})`),
            ',')}
        RETURNING id
    `);

    await client.query(sql`
        INSERT INTO transactions (source, amount, recipient_name, reference, target_bic, target_iban)
        VALUES ${sql.glue(
            transactions.map((trx, idx) => sql`(${rows[idx].id}, ${trx.amount}, ${trx.recipient_name}, ${trx.reference}, ${trx.target_bic}, ${trx.target_iban})`),
            ',')}
    `);

    const app = createApp(client);
    await app.listen({ port: 3000, host: '0.0.0.0' });

    globalThis.CLIENT = client;
    globalThis.APP = app;
};
