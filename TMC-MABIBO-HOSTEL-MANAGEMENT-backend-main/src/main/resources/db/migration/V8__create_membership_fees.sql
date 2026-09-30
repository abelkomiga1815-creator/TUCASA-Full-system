-- =====================================================================
-- V8__create_membership_fees.sql
-- TUCASA Management System - Membership Fee Tracking
--
-- Notes:
--   * semester_id is BIGINT (not INT) to match semesters.id (BIGSERIAL),
--     otherwise the foreign key would fail.
--   * id uses BIGSERIAL per existing repo convention (V1/V5 style).
-- =====================================================================

CREATE TABLE membership_fees (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    semester_id         BIGINT REFERENCES semesters(id) ON DELETE SET NULL,
    amount              NUMERIC(10, 2) NOT NULL,
    currency            VARCHAR(10) NOT NULL DEFAULT 'TZS',
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    payment_method      VARCHAR(50),
    reference_number    VARCHAR(100),
    paid_at             TIMESTAMP,
    confirmed_by        BIGINT REFERENCES users(id) ON DELETE SET NULL,
    confirmed_at        TIMESTAMP,
    notes               TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_fee_amount CHECK (amount > 0),
    CONSTRAINT chk_fee_status CHECK (status IN ('PENDING', 'PAID', 'WAIVED'))
);

CREATE INDEX idx_fees_user ON membership_fees (user_id);
CREATE INDEX idx_fees_status ON membership_fees (status);
CREATE INDEX idx_fees_semester ON membership_fees (semester_id);
