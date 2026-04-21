-- Phase 5: Donor Profiles, Beneficiaries, Programs

CREATE TABLE IF NOT EXISTS donor_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    tier                VARCHAR(10)   NOT NULL DEFAULT 'BRONZE'
        CHECK (tier IN ('BRONZE','SILVER','GOLD','PATRON')),
    total_donated_cents BIGINT        NOT NULL DEFAULT 0,
    donation_count      INTEGER       NOT NULL DEFAULT 0,
    first_donation_at   TIMESTAMPTZ,
    last_donation_at    TIMESTAMPTZ,
    is_anonymous        BOOLEAN       NOT NULL DEFAULT FALSE,
    comm_prefs          JSONB         NOT NULL DEFAULT '{"newsletter":true,"updates":true,"channel":"EMAIL"}',
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donor_profiles_user ON donor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_donor_profiles_tier ON donor_profiles(tier);

CREATE TABLE IF NOT EXISTS beneficiaries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name      VARCHAR(100)  NOT NULL,
    last_name       VARCHAR(100)  NOT NULL,
    dob             DATE,
    location        VARCHAR(255)  NOT NULL,
    status          VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE','GRADUATED','INACTIVE')),
    notes           TEXT,
    enrolled_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beneficiaries_status ON beneficiaries(status);

CREATE TABLE IF NOT EXISTS programs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200)  NOT NULL,
    description     TEXT,
    campaign_id     UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    capacity        INTEGER       NOT NULL CHECK (capacity >= 1),
    enrolled_count  INTEGER       NOT NULL DEFAULT 0,
    status          VARCHAR(20)   NOT NULL DEFAULT 'PLANNED'
        CHECK (status IN ('ACTIVE','COMPLETED','PLANNED')),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_programs_status     ON programs(status);
CREATE INDEX IF NOT EXISTS idx_programs_campaign   ON programs(campaign_id) WHERE campaign_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS beneficiary_programs (
    beneficiary_id  UUID NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
    program_id      UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (beneficiary_id, program_id)
);
