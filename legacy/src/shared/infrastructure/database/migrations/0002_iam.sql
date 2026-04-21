-- Phase 2: Identity & Access Management
-- Tables: users, roles, user_roles, audit_logs
-- Also seeds the default system roles and their permissions.

CREATE TABLE IF NOT EXISTS users (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email                   VARCHAR(255) NOT NULL UNIQUE,
    hashed_password         VARCHAR(255) NOT NULL,
    first_name              VARCHAR(100) NOT NULL,
    last_name               VARCHAR(100) NOT NULL,
    is_active               BOOLEAN      NOT NULL DEFAULT TRUE,
    is_email_verified       BOOLEAN      NOT NULL DEFAULT FALSE,
    failed_login_attempts   INTEGER      NOT NULL DEFAULT 0,
    locked_until            TIMESTAMPTZ,
    last_login_at           TIMESTAMPTZ,
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = TRUE;

CREATE TABLE IF NOT EXISTS roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50)  NOT NULL UNIQUE,
    description TEXT,
    permissions TEXT[]       NOT NULL DEFAULT '{}',
    is_system   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);

CREATE TABLE IF NOT EXISTS audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id),
    action      VARCHAR(100) NOT NULL,
    resource    VARCHAR(255) NOT NULL,
    details     JSONB        NOT NULL DEFAULT '{}',
    ip_address  INET,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource);

-- Seed default system roles (idempotent).
INSERT INTO roles (name, description, permissions, is_system) VALUES
  ('SUPER_ADMIN', 'Full system access', ARRAY[
    'donations:read','donations:write','donations:refund',
    'volunteers:read','volunteers:write','volunteers:assign',
    'campaigns:read','campaigns:write','campaigns:publish',
    'reports:read','reports:generate',
    'users:read','users:write','users:manage-roles',
    'audit:read','settings:manage',
    'beneficiaries:read','beneficiaries:write',
    'events:read','events:write'
  ], TRUE),
  ('ADMIN', 'Administrative access', ARRAY[
    'donations:read','donations:write','donations:refund',
    'volunteers:read','volunteers:write','volunteers:assign',
    'campaigns:read','campaigns:write','campaigns:publish',
    'reports:read','reports:generate',
    'users:read','users:write','users:manage-roles',
    'audit:read',
    'beneficiaries:read','beneficiaries:write',
    'events:read','events:write'
  ], TRUE),
  ('STAFF', 'Staff member access', ARRAY[
    'donations:read','donations:write',
    'volunteers:read','volunteers:write','volunteers:assign',
    'campaigns:read','campaigns:write',
    'reports:read','reports:generate',
    'beneficiaries:read','beneficiaries:write',
    'events:read','events:write'
  ], TRUE),
  ('VOLUNTEER', 'Volunteer access', ARRAY[
    'volunteers:read','campaigns:read','events:read'
  ], TRUE),
  ('DONOR', 'Donor access', ARRAY[
    'donations:read','campaigns:read'
  ], TRUE)
ON CONFLICT (name) DO NOTHING;
