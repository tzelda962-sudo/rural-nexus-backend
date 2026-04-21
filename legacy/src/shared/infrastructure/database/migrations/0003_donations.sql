-- Phase 1: Donations
-- Tables: donations, recurring_plans
-- The campaigns table arrives in Phase 3; campaign_id is left as a UUID column
-- without a foreign key for now and will gain a constraint in 0005_campaigns.sql.

CREATE TABLE IF NOT EXISTS donations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id            UUID REFERENCES users(id) ON DELETE SET NULL,
    donor_email         VARCHAR(255) NOT NULL,
    amount_cents        BIGINT       NOT NULL CHECK (amount_cents >= 100),
    currency            CHAR(3)      NOT NULL,
    campaign_id         UUID,
    frequency           VARCHAR(20)  NOT NULL
        CHECK (frequency IN ('ONE_TIME','MONTHLY','QUARTERLY','YEARLY')),
    status              VARCHAR(20)  NOT NULL DEFAULT 'INTENT_CREATED'
        CHECK (status IN (
            'INTENT_CREATED','PROCESSING','COMPLETED','FAILED','REFUNDED','CANCELLED'
        )),
    payment_intent_id   VARCHAR(255),
    idempotency_key     VARCHAR(64)  NOT NULL UNIQUE,
    metadata            JSONB        NOT NULL DEFAULT '{}',
    failure_reason      TEXT,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMPTZ,
    refunded_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_donations_donor       ON donations(donor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_campaign    ON donations(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_donations_status      ON donations(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_payment_id  ON donations(payment_intent_id) WHERE payment_intent_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS recurring_plans (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount_cents             BIGINT       NOT NULL CHECK (amount_cents >= 100),
    currency                 CHAR(3)      NOT NULL,
    frequency                VARCHAR(20)  NOT NULL
        CHECK (frequency IN ('MONTHLY','QUARTERLY','YEARLY')),
    campaign_id              UUID,
    next_charge_date         TIMESTAMPTZ  NOT NULL,
    status                   VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE','PAUSED','CANCELLED')),
    gateway_subscription_id  VARCHAR(255) NOT NULL UNIQUE,
    created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recurring_donor       ON recurring_plans(donor_id);
CREATE INDEX IF NOT EXISTS idx_recurring_next_charge ON recurring_plans(next_charge_date)
    WHERE status = 'ACTIVE';
