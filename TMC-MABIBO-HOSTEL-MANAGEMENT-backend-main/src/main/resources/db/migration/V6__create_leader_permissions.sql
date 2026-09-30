-- =====================================================================
-- V6__create_leader_permissions.sql
-- TUCASA Management System - Leader Permissions Module
-- =====================================================================

-- ------------------------------------------------------------------
-- LEADER PERMISSIONS
-- Granular permissions for leaders (granted by admin)
-- ------------------------------------------------------------------
CREATE TABLE leader_permissions (
    id                      BIGSERIAL PRIMARY KEY,
    user_id                 BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    can_upload_materials    BOOLEAN NOT NULL DEFAULT FALSE,
    can_post_announcements  BOOLEAN NOT NULL DEFAULT FALSE,
    can_create_events       BOOLEAN NOT NULL DEFAULT FALSE,
    granted_by              BIGINT NOT NULL REFERENCES users(id),
    granted_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_leader_permissions_user UNIQUE (user_id)
);

CREATE INDEX idx_leader_permissions_user ON leader_permissions (user_id);