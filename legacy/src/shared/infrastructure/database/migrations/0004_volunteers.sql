-- Phase 1: Volunteers
-- Tables: volunteers, volunteer_assignments

CREATE TABLE IF NOT EXISTS volunteers (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                  UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name               VARCHAR(100) NOT NULL,
    last_name                VARCHAR(100) NOT NULL,
    email                    VARCHAR(255) NOT NULL UNIQUE,
    phone                    VARCHAR(20),
    skills                   JSONB        NOT NULL DEFAULT '[]',
    availability             JSONB        NOT NULL DEFAULT '{}',
    status                   VARCHAR(20)  NOT NULL DEFAULT 'PENDING_REVIEW'
        CHECK (status IN ('PENDING_REVIEW','ACTIVE','INACTIVE','SUSPENDED')),
    notes                    TEXT         NOT NULL DEFAULT '',
    background_check_status  VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
        CHECK (background_check_status IN ('PENDING','CLEARED','FLAGGED','NOT_REQUIRED')),
    total_hours_logged       NUMERIC(10,2) NOT NULL DEFAULT 0,
    joined_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_volunteers_status ON volunteers(status);
CREATE INDEX IF NOT EXISTS idx_volunteers_skills_gin ON volunteers USING GIN (skills);

CREATE TABLE IF NOT EXISTS volunteer_assignments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id     UUID NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
    campaign_id      UUID NOT NULL,
    role             VARCHAR(100) NOT NULL,
    start_date       TIMESTAMPTZ NOT NULL,
    end_date         TIMESTAMPTZ,
    hours_committed  NUMERIC(10,2) NOT NULL DEFAULT 0,
    hours_logged     NUMERIC(10,2) NOT NULL DEFAULT 0,
    status           VARCHAR(20) NOT NULL DEFAULT 'ASSIGNED'
        CHECK (status IN ('ASSIGNED','ACTIVE','COMPLETED','WITHDRAWN')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assignments_volunteer ON volunteer_assignments(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_assignments_campaign  ON volunteer_assignments(campaign_id);
