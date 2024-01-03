const { readdir, readFile } = require('node:fs/promises');
const pg = require('pg');

const { run: createUserApi } = require('./create-api-user');

(async () => {
    const client = new pg.Client({
        host: 'pile-db',
        database: 'pile',
        user: 'cicd',
        password: 'pipeline',
    });
    await client.connect();

    const migrationFiles = (await readdir('./database/migrations', { withFileTypes: true }))
        .filter((entry) => entry.name.toLowerCase().includes('.sql'));

    const migrations = await Promise.all(migrationFiles.map(
        (file) => readFile(`${file.path}/${file.name}`).then((buffer) => buffer.toString())
    ));

    try {
        for (let i = 0; i < migrations.length; ++i) {
            console.log(`Running migration ${i}...`);
            await client.query(migrations[i]);
        }
        await createUserApi(client);

        return;
    } catch (e) {
        console.error(e);
        throw e;
    }
})().then(_ => process.exit());
