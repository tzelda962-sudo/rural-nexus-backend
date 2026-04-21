-- Phase 4: Notifications, Webhooks, Reports

CREATE TABLE IF NOT EXISTS notifications (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    recipient_email  VARCHAR(255)  NOT NULL,
    channel          VARCHAR(10)   NOT NULL
        CHECK (channel IN ('EMAIL','SMS','IN_APP')),
    template_id      VARCHAR(50)   NOT NULL,
    subject          VARCHAR(255),
    body             TEXT          NOT NULL,
    variables        JSONB         NOT NULL DEFAULT '{}',
    status           VARCHAR(10)   NOT NULL DEFAULT 'QUEUED'
        CHECK (status IN ('QUEUED','SENT','FAILED','BOUNCED')),
    sent_at          TIMESTAMPTZ,
    failure_reason   TEXT,
    retry_count      INTEGER       NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status    ON notifications(status, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_notifications_template  ON notifications(template_id);

CREATE TABLE IF NOT EXISTS processed_webhooks (
    idempotency_key  VARCHAR(255) PRIMARY KEY,
    provider         VARCHAR(20)  NOT NULL,
    event_type       VARCHAR(100) NOT NULL,
    result           JSONB        NOT NULL,
    processed_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_processed_at ON processed_webhooks(processed_at);

CREATE TABLE IF NOT EXISTS reports (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type             VARCHAR(30)   NOT NULL
        CHECK (type IN (
            'FINANCIAL_SUMMARY','DONATION_DETAIL','IMPACT_SUMMARY',
            'VOLUNTEER_HOURS','DONOR_RETENTION','TAX_REPORT'
        )),
    format           VARCHAR(10)   NOT NULL
        CHECK (format IN ('PDF','CSV','XLSX')),
    title            VARCHAR(200)  NOT NULL,
    parameters       JSONB         NOT NULL DEFAULT '{}',
    status           VARCHAR(20)   NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING','GENERATING','COMPLETED','FAILED')),
    file_url         TEXT,
    failure_reason   TEXT,
    generated_by     UUID          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    generated_at     TIMESTAMPTZ,
    expires_at       TIMESTAMPTZ   NOT NULL,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_user    ON reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_reports_status  ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_expires ON reports(expires_at)
    WHERE status = 'COMPLETED';
