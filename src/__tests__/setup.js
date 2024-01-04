/* eslint-disable */
const pg = require('pg');
const sql = require('@nearform/sql');

const { createApp } = require('../app');
const migrations = require('../../database/migrations/run');

module.exports = async function () {
    await migrations();

    const client = new pg.Client({
        host: process.env.DB_HOSTNAME,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
    });
    await client.connect();

    await client.query(sql`
        INSERT INTO accounts (iban, name, country, balances)
        VALUES
            ('iban1', 'name1', 'DEU', '{"available": {"value": 100, "currency": "EUR"}}'),
            ('iban2', 'name2', 'HUN', '{"available": {"value": 80, "currency": "EUR"}}'),
            ('iban3', 'name3', 'GBR', '{"available": {"value": 120, "currency": "EUR"}}')
    `);

    const app = createApp(client);
    await app.listen({ port: 3000, host: '0.0.0.0' });

    globalThis.CLIENT = client;
    globalThis.APP = app;
};
