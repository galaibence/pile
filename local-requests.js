const HOST = 'http://localhost:3000';
const SECRETIVE_API_KEY = 'secret-1';

(async () => {
    console.info('Fetching accounts...');

    const accountsRequest = await fetch(`${HOST}/accounts?from=0&limit=5`, {
        headers: {
            'x-api-key': SECRETIVE_API_KEY,
        },
    });
    if (accountsRequest.status < 400) {
        console.info(`Listing first 5 accounts was successful with status code ${accountsRequest.status}`);
    }
    const accounts = await accountsRequest.json();
    console.info(`First 5 accounts:`);
    console.info(`${accounts.data.map((account) => 
        `\tName: ${account.name}, Country: ${account.country}, Iban: ${account.iban}
            Balance: ${account.balances.available.value} ${account.balances.available.currency}`).join('\n')}`);

    const accounts2 = await fetch(`${HOST}/accounts?from=5&limit=5`, {
        headers: {
            'x-api-key': SECRETIVE_API_KEY,
        },
    }).then(R => R.json());
    console.info(`Another 5 accounts: `);
    console.info(`${accounts2.data.map((account) => 
        `\tName: ${account.name}, Country: ${account.country}, Iban: ${account.iban}
            Balance: ${account.balances.available.value} ${account.balances.available.currency}`).join('\n')}`);
    
    console.info('\n');

    console.info(`Find accounts with balances above 100,000 EUR`);
    const accounts100k = await fetch(`${HOST}/accounts?min=100000&limit=5`, {
        headers: {
            'x-api-key': SECRETIVE_API_KEY,
        },
    }).then(R => R.json());
    console.info(`Listing 5 accounts with >100k EURs:`);
    console.info(`${accounts100k.data.map((account) => 
        `\tName: ${account.name}, Country: ${account.country}, Iban: ${account.iban}
            Balance: ${account.balances.available.value} ${account.balances.available.currency}`).join('\n')}`);

    console.info('\n');

    console.info(`Find accounts with balances between 80,000 and 100,000 EUR`);
    const accounts80k = await fetch(`${HOST}/accounts?min=80000&max=100000&limit=5`, {
        headers: {
            'x-api-key': SECRETIVE_API_KEY,
        },
    }).then(R => R.json());
    console.info(`Listing ${accounts80k.data.length} accounts with balances between 80k and 100k EURs:`);
    console.info(`${accounts80k.data.map((account) => 
        `\tName: ${account.name}, Country: ${account.country}, Iban: ${account.iban}
            Balance: ${account.balances.available.value} ${account.balances.available.currency}`).join('\n')}`);
        

    console.info('\n\n');

    console.info('Fetching transactions...');
    const transactionsRequest = await fetch(`${HOST}/transactions?from=0&limit=5`, {
        headers: {
            'x-api-key': SECRETIVE_API_KEY,
        },
    });
    if (transactionsRequest.status < 400) {
        console.info(`Listing transactions was successful with status code ${transactionsRequest.status}`);
    }
    const noTransactions = await transactionsRequest.json();
    if (noTransactions.data.length <= 0) {
        console.warn('There are no transactions to show');
    }

    console.info(`Making a transaction from account ${accounts.data[0].name} to ${accounts.data[1].name} with an amount of 5 EUR`);
    const createTransactionRequest = await fetch(`${HOST}/transactions`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-api-key': SECRETIVE_API_KEY,
        },
        body: JSON.stringify({
            sourceAccountId: accounts.data[0].id,
            amount: 5,
            recipientName: 'Bence',
            targetIban: accounts.data[1].iban,
            targetBic: 'someBIC',
            reference: 'happy new year',
        }),
    });
    if (createTransactionRequest.status === 201) {
        console.log(`Successfully transferred 5 EUR`);
    }

    console.info(`Making another transaction from account ${accounts.data[0].name} to ${accounts.data[1].name} with an amount of 5 EUR`);
    const createTransactionRequest2 = await fetch(`${HOST}/transactions`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-api-key': SECRETIVE_API_KEY,
        },
        body: JSON.stringify({
            sourceAccountId: accounts.data[0].id,
            amount: accounts.data[0].balances.available.value + 5,
            recipientName: 'Bence',
            targetIban: accounts.data[1].iban,
            targetBic: 'someBIC',
            reference: 'happy new year',
        }),
    }).then(R => R.json());
    console.info(`Failed to send ${accounts.data[0].balances.available.value + 5}. ${createTransactionRequest2.message}`);
})();
