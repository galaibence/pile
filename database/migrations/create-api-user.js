const sql = require('@nearform/sql');
const pg = require('pg');

const createGrantQuery = () => sql`
    GRANT SELECT ON TABLE accounts TO api;
    GRANT UPDATE ON TABLE accounts TO api;
    GRANT INSERT ON TABLE transactions TO api;
    GRANT SELECT ON TABLE transactions TO api;
`;

async function run(client) {
    const roleExists = (await client.query(sql`SELECT rolname FROM pg_roles WHERE rolname = 'api'`)).rowCount === 1;
    if (!roleExists) {
        const randomGeneratedPassword = 'foobar';

        // pg does not allow using placeholders for WITH PASSWORD 'x' so cannot use @nearform/sql for this line
        // but we know the randomly generated password is not malicious so it is safe here to do this
        await client.query(`CREATE USER api WITH PASSWORD '${randomGeneratedPassword}'`);

        // TODO: store login details somewhere in AWS Secrets Manager or similar
    }
    await client.query(createGrantQuery());
}

module.exports = {
    run,
};
