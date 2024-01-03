const { run: seedAccounts } = require('./01-seed-accounts');

(async () => {
    await seedAccounts();

    return;
})().then(_ => process.exit());
