-- TODO: handle different currencies

CREATE OR REPLACE FUNCTION check_source_balance_and_reduce() RETURNS trigger AS $$
    DECLARE available_balance DECIMAL;

    BEGIN
        SELECT (balances -> 'available' ->> 'value')::DECIMAL INTO available_balance FROM accounts WHERE id = NEW.source FOR UPDATE;

        IF (available_balance < NEW.amount) THEN
            RAISE EXCEPTION 'Insufficient available balances';
        END IF;

        UPDATE accounts
        SET balances = jsonb_set(balances, '{available,value}', TO_JSONB(available_balance - NEW.amount))
        WHERE id = NEW.source;

        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increase_target_balance() RETURNS trigger AS $$
    DECLARE target_available_balance DECIMAL;

    BEGIN
        SELECT (balances -> 'available' ->> 'value')::DECIMAL INTO target_available_balance FROM accounts WHERE iban = NEW.target_iban;
        
        UPDATE accounts
        SET balances = jsonb_set(balances, '{available,value}', TO_JSONB(target_available_balance + NEW.amount), )
        WHERE iban = NEW.target_iban;

        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER check_source_balance_and_reduce BEFORE INSERT ON transactions FOR EACH ROW EXECUTE FUNCTION check_source_balance_and_reduce();
CREATE OR REPLACE TRIGGER increase_target_balance AFTER INSERT ON transactions FOR EACH ROW EXECUTE FUNCTION increase_target_balance();
