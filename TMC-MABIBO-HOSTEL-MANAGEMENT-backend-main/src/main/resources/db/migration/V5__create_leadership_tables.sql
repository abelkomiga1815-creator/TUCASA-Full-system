-- =====================================================================
-- V5__create_leadership_tables.sql
-- TUCASA Management System - Leadership Structure Module
-- =====================================================================

-- ------------------------------------------------------------------
-- POSITIONS
-- Permanent, global role definitions (e.g., "Choir Leader", "Branch Leader")
-- ------------------------------------------------------------------
CREATE TABLE positions (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(100) NOT NULL UNIQUE,
    description         VARCHAR(500),
    responsibilities    VARCHAR(2000),
    level               SMALLINT NOT NULL CHECK (level BETWEEN 1 AND 5),
    department_tag      VARCHAR(50),
    is_retired          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_positions_level ON positions (level);
CREATE INDEX idx_positions_active ON positions (is_retired) WHERE is_retired = FALSE;

-- ------------------------------------------------------------------
-- REGIMES
-- Leadership terms (academic years), only one active at a time
-- ------------------------------------------------------------------
CREATE TABLE regimes (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(50) NOT NULL UNIQUE,
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_regime_dates CHECK (end_date > start_date)
);

-- Only one regime may be active at a time
CREATE UNIQUE INDEX uq_regimes_single_active ON regimes (is_active) WHERE is_active = TRUE;

-- ------------------------------------------------------------------
-- LEADERSHIP ASSIGNMENTS
-- Links user ↔ position ↔ regime
-- ------------------------------------------------------------------
CREATE TABLE leadership_assignments (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    position_id         BIGINT NOT NULL REFERENCES positions(id) ON DELETE RESTRICT,
    regime_id           BIGINT NOT NULL REFERENCES regimes(id) ON DELETE CASCADE,
    assigned_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    assigned_by         BIGINT NOT NULL REFERENCES users(id),
    is_current          BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_assignment_user_position_regime UNIQUE (user_id, position_id, regime_id)
);

CREATE INDEX idx_assignments_regime ON leadership_assignments (regime_id);
CREATE INDEX idx_assignments_user ON leadership_assignments (user_id);
CREATE INDEX idx_assignments_current ON leadership_assignments (is_current) WHERE is_current = TRUE;