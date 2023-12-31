import { readdir, readFile } from 'node:fs/promises';
import pg from 'pg';

(async () => {
    const client = new pg.Client({
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
        return;
    } catch (e) {
        console.error(e);
        throw e;
    }
})().then(x => process.exit());
