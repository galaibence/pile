const migrations = require('./migrations/run');
const seed = require('./seed/run');

(async () => {
    await migrations();
    await seed();

    return;
})().then(_ => process.exit());
