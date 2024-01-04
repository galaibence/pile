const { readdir, readFile } = require('node:fs/promises');
const pg = require('pg');

const { run: createUserApi } = require('./create-api-user');

module.exports = async () => {
    const client = new pg.Client({
        host: process.env.DB_HOSTNAME,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
    });
    await client.connect();

    const migrationFiles = (await readdir('./database/migrations', { withFileTypes: true }))
        .filter((entry) => entry.name.toLowerCase().includes('.sql'));

    const migrations = await Promise.all(migrationFiles.map(
        (file) => readFile(`${file.path}/${file.name}`).then((buffer) => buffer.toString())
    ));

    try {
        for (let i = 0; i < migrations.length; ++i) {
            console.info(`Running migration ${i}...`);
            await client.query(migrations[i]);
        }
        console.info('Creating database user "api"');
        await createUserApi(client);

        await client.end();
    } catch (e) {
        await client.end();

        console.error(e);
        throw e;
    }
};
