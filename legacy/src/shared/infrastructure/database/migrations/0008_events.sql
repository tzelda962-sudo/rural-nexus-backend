-- Phase 6: Event Management
CREATE TABLE IF NOT EXISTS events (
  id            UUID PRIMARY KEY,
  title         VARCHAR(200) NOT NULL,
  slug          VARCHAR(220) NOT NULL,
  description   TEXT         NOT NULL,
  type          VARCHAR(30)  NOT NULL CHECK (type IN ('FUNDRAISER','VOLUNTEER_DRIVE','AWARENESS','COMMUNITY')),
  campaign_id   UUID         REFERENCES campaigns(id) ON DELETE SET NULL,
  venue         VARCHAR(300) NOT NULL,
  address       VARCHAR(500) NOT NULL,
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,
  is_virtual    BOOLEAN      NOT NULL DEFAULT false,
  virtual_link  TEXT,
  start_date    TIMESTAMPTZ  NOT NULL,
  end_date      TIMESTAMPTZ  NOT NULL,
  max_attendees INTEGER,
  registration_count INTEGER NOT NULL DEFAULT 0,
  status        VARCHAR(20)  NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','CANCELLED','COMPLETED')),
  created_by    UUID         NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_slug   ON events (slug);
CREATE INDEX idx_events_status ON events (status);
CREATE INDEX idx_events_type   ON events (type);
CREATE INDEX idx_events_start  ON events (start_date);

CREATE TABLE IF NOT EXISTS event_registrations (
  id            UUID PRIMARY KEY,
  event_id      UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  cancelled_at  TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_event_reg_active ON event_registrations (event_id, user_id) WHERE cancelled_at IS NULL;
CREATE INDEX idx_event_reg_event ON event_registrations (event_id);
CREATE INDEX idx_event_reg_user  ON event_registrations (user_id);
