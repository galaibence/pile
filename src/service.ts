import pg from 'pg';
import { createApp } from "./app";

(async () => {
    const client = new pg.Client({
        host: 'pile-db',
        database: 'pile',
        user: 'cicd',
        password: 'pipeline',
    });

    try {
        await client.connect();
    } catch (err) {
        console.error(`Cannot connect to database`);
        process.exit(1);
    }

    const app = createApp(client);
    try {        
        await app.listen({ port: 3000, host: '0.0.0.0' });
    } catch (err) {
        await client.end();
        console.error(`Service shut down unexpectedly`);
        process.exit(1);
    }
})();
