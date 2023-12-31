CREATE TABLE IF NOT EXISTS accounts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    iban varchar(34) NOT NULL UNIQUE,
    country varchar(3) NOT NULL,
    createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name varchar(6) NOT NULL UNIQUE,
    balances jsonb
);