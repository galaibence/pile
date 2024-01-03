const { run: seedAccounts } = require('./01-seed-accounts');

module.exports = async () => {
    await seedAccounts();
};
