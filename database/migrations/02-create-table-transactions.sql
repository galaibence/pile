CREATE TABLE IF NOT EXISTS transactions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    source uuid NOT NULL REFERENCES accounts (id),
    -- because the requirements states the input is formatted as EUR, we leave no choice here for currencies other than EUR
    amount double precision NOT NULL,
    recipient_name text NOT NULL,
    target_iban varchar(34) NOT NULL,
    target_bic varchar(11) NOT NULL,
    reference text
);