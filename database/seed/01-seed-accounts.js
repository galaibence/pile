const sql = require('@nearform/sql');
const pg = require('pg');

const accounts = require('../../data/accounts.json');

const insertQuery = ({ IBAN, balances, country, createdAt, id, name}) => sql`
    INSERT INTO accounts (iban, id, name, created_at, country, balances)
    VALUES (${IBAN}, ${id}, ${name}, ${createdAt}, ${country}, ${balances})
`;

async function run() {
    const client = new pg.Client({
        host: process.env.DB_HOSTNAME,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
    });
    await client.connect();

    await Promise.all(accounts.data.map((account) => insertQuery(account)).map((q) => client.query(q)));

    await client.end();
}

module.exports = {
    run,
};
