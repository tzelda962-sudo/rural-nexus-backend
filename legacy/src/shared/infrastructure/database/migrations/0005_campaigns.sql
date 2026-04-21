-- Phase 3: Campaigns & Impact Metrics
-- Tables: campaigns, impact_metrics, campaign_updates
-- Also adds FK from donations.campaign_id → campaigns.id

CREATE TABLE IF NOT EXISTS campaigns (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               VARCHAR(200)   NOT NULL,
    slug                VARCHAR(220)   NOT NULL UNIQUE,
    description         TEXT           NOT NULL,
    cover_image_url     TEXT,
    funding_goal_cents  BIGINT         NOT NULL CHECK (funding_goal_cents >= 1000),
    currency            CHAR(3)        NOT NULL,
    is_flexible_goal    BOOLEAN        NOT NULL DEFAULT FALSE,
    amount_raised_cents BIGINT         NOT NULL DEFAULT 0,
    donation_count      INTEGER        NOT NULL DEFAULT 0,
    status              VARCHAR(20)    NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT','ACTIVE','PAUSED','CLOSED','ARCHIVED')),
    start_date          DATE           NOT NULL,
    end_date            DATE,
    created_by          UUID           NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    tags                JSONB          NOT NULL DEFAULT '[]',
    is_published        BOOLEAN        NOT NULL DEFAULT FALSE,
    published_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_slug       ON campaigns(slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_status     ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_creator    ON campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_published  ON campaigns(is_published, created_at DESC)
    WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_campaigns_tags       ON campaigns USING GIN (tags);

-- Deferred FK: donations.campaign_id → campaigns.id
ALTER TABLE donations
    ADD CONSTRAINT fk_donations_campaign
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
    ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS impact_metrics (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id     UUID           NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    type            VARCHAR(30)    NOT NULL
        CHECK (type IN (
            'PEOPLE_SERVED','ITEMS_DISTRIBUTED','AREA_RESTORED','FUNDS_DISBURSED','CUSTOM'
        )),
    label           VARCHAR(200)   NOT NULL,
    value           NUMERIC(18,4)  NOT NULL CHECK (value >= 0),
    unit            VARCHAR(50)    NOT NULL,
    recorded_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    recorded_by     UUID           NOT NULL REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_metrics_campaign     ON impact_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_metrics_type         ON impact_metrics(type);
CREATE INDEX IF NOT EXISTS idx_metrics_recorded_at  ON impact_metrics(recorded_at DESC);

CREATE TABLE IF NOT EXISTS campaign_updates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id     UUID           NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    author_id       UUID           NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title           VARCHAR(200)   NOT NULL,
    body            TEXT           NOT NULL,
    image_urls      JSONB          NOT NULL DEFAULT '[]',
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_updates_campaign ON campaign_updates(campaign_id, created_at DESC);
