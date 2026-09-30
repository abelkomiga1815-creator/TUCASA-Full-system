-- =====================================================================
-- V9__create_password_reset_tokens.sql
-- TUCASA Management System - Password Reset Tokens
-- =====================================================================

-- ------------------------------------------------------------------
-- PASSWORD RESET TOKENS
-- Stores OTP tokens for password reset via email/SMS
-- =====================================================================
CREATE TABLE password_reset_tokens (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel             VARCHAR(10) NOT NULL CHECK (channel IN ('EMAIL', 'SMS')),
    destination         VARCHAR(100) NOT NULL,  -- email address or phone number
    otp_hash            VARCHAR(255) NOT NULL,  -- BCrypt hash of the 6-digit OTP
    expires_at          TIMESTAMP NOT NULL,
    consumed_at         TIMESTAMP,
    attempts            INT NOT NULL DEFAULT 0,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prt_user ON password_reset_tokens (user_id);
CREATE INDEX idx_prt_destination ON password_reset_tokens (destination);
CREATE INDEX idx_prt_expires ON password_reset_tokens (expires_at);