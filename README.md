# pile

## How to run the application

> The local envinronment requires the test data to be added to the `./data` folder as `./data/accounts.json`!

The API is containerised with Docker and a Docker compose file is present in the repo that will launch a Postgresql database, run database migrations, and then start up the API server. To test locally, run `docker compose up --build` in the command line. Once finished, run `docker compose down` to clean up the environment.

There is an included NodeJS script (`local-requests.js`) that uses the standard `fetch` function to make test requests against the local API. These requests could be easily imported into a frontend application.

## How to run tests locally

To run Jest tests in a local environment, run `npm run test:local` in your command line. This will boot up the Postgres database from the Docker compose file, run migrations in a gobal before hook with Jest, and run all the tests, then tears down the database container.

## CICD

The repo uses Githun Actions to run two jobs
1. lints, tests and builds the app
2. deploys the app. This is just a dummy job, as a deployment script is not added for the API. Depending on where the deployment goes, we could use terraform or AWS cdk (if targeting AWS).

## Design considerations

* As there were only EUR available balances in the test file, the application does not take into consideration any other currencies. The data structure in the `accounts.json` file also could/should change if we were to allow multiple available balances in different currencies to be an array of balances within the acount.

* I opted for a `jsonb` column in the Postgres database to represent the balances, as this would allow for extending the balances structure in the future with additional data. Another option could have been to normalise the data, put all the available balances into their own table, and reference the account_id in this table.

```sql
CREATE TABLE balances (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id uuid NOT NULL REFERENCES accounts (id),
    currency VARCHAR(3) NOT NULL,
    amount DECIMAL NOT NULL
);
```

* I decided that for transactions, the target iban needs to be in the `accounts` table, however, it is possible anyone would transfer amounts to an account unknown to us.

* BIC and IBAN is not validated, but they should be

* To run SQL queries within the app, and to manage seeding and migrations, I decided to use plain SQL with the help of the package `@nearform/sql` that prevents SQL injection attacks. I found in the past that keeping things close to plain SQL makes it easier to read the application. Although tools like `knex` or `sequelize` could help run migrations, running into things that these tools do not support, we have to circle back to using plain SQL anyway

* Fastify was used as the backend framework, because of its built-in schema validation using JSON schema. `json-schema-to-ts` is used to generate TypeScript types from these schemas. With the resulting types, we can make sure that at compile time our application is type safe, and Fastify's input validation, using the same schemas provides runtime safety checking all incoming data

