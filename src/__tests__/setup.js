/* eslint-disable */
const { Client } = require('pg');
const sql = require('@nearform/sql');

const migrations = require('../../database/migrations/run');

module.exports = async function () {
    await migrations();

    const client = new pg.Client({
        host: 'pile-db',
        database: 'pile',
        user: 'cicd',
        password: 'pipeline',
    });
    await client.connect();

    await client.query(sql`
        INSERT INTO accounts (iban,name, country, balances)
        VALUES
            ('iban1', 'name1', 'DEU', '{"available": {"value": 100, "currency": "EUR"}}'),
            ('iban2', 'name2', 'HUN', '{"available": {"value": 80, "currency": "EUR"}}'),
            ('iban3', 'name3', 'GBR', '{"available": {"value": 120, "currency": "EUR"}}'),
    `);

    await client.end();
};
