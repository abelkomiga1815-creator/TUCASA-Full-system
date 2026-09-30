-- =====================================================================
-- V1__initial_schema.sql
-- TUCASA Management System - Mabibo Hostel Branch
-- =====================================================================

-- ------------------------------------------------------------------
-- ENUM TYPES
-- ------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('MEMBER', 'LEADER', 'ADMIN');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'ALUMNI', 'SUSPENDED');
CREATE TYPE material_type AS ENUM ('SERMON', 'BIBLE_STUDY', 'SONG', 'DOCUMENT', 'VIDEO', 'AUDIO', 'OTHER');
CREATE TYPE report_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE registration_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- ------------------------------------------------------------------
-- REFERENCE TABLES
-- ------------------------------------------------------------------
CREATE TABLE regions (
    id   SMALLSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE branches (
    id       SMALLSERIAL PRIMARY KEY,
    name     VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(150) NOT NULL
);

CREATE TABLE semesters (
    id                   BIGSERIAL PRIMARY KEY,
    name                 VARCHAR(50) NOT NULL,
    start_date           DATE NOT NULL,
    end_date             DATE NOT NULL,
    registration_deadline DATE NOT NULL,
    is_active            BOOLEAN NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_semester_dates CHECK (end_date > start_date)
);

-- Only one semester may be active at a time.
CREATE UNIQUE INDEX uq_semesters_single_active ON semesters (is_active) WHERE is_active = TRUE;

-- ------------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------------
CREATE TABLE users (
    id                 BIGSERIAL PRIMARY KEY,
    first_name         VARCHAR(50) NOT NULL,
    middle_name        VARCHAR(50),
    last_name          VARCHAR(50) NOT NULL,
    email              VARCHAR(100) NOT NULL UNIQUE,
    phone              VARCHAR(15) NOT NULL UNIQUE,
    university         VARCHAR(100) NOT NULL,
    program            VARCHAR(100) NOT NULL,
    year_of_study      SMALLINT NOT NULL,
    is_baptized        BOOLEAN NOT NULL DEFAULT FALSE,
    home_region        VARCHAR(50) NOT NULL,
    home_church        VARCHAR(100) NOT NULL,
    talent             VARCHAR(255),
    role               user_role NOT NULL DEFAULT 'MEMBER',
    status             user_status NOT NULL DEFAULT 'ACTIVE',
    branch_id          SMALLINT NOT NULL REFERENCES branches(id),
    password_hash      VARCHAR(255) NOT NULL,
    profile_pic_url    VARCHAR(500),
    email_verified_at  TIMESTAMP,
    last_login         TIMESTAMP,
    created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_year_of_study CHECK (year_of_study BETWEEN 1 AND 7)
);

-- ------------------------------------------------------------------
-- MEMBER SEMESTER UPDATES
-- ------------------------------------------------------------------
CREATE TABLE member_semester_updates (
    id                   BIGSERIAL PRIMARY KEY,
    member_id            BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    semester_id           BIGINT NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    year_of_study         SMALLINT NOT NULL,
    program               VARCHAR(100) NOT NULL,
    phone                 VARCHAR(15) NOT NULL,
    talent                VARCHAR(255),
    registration_status   registration_status NOT NULL DEFAULT 'CONFIRMED',
    updated_at            TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_member_semester UNIQUE (member_id, semester_id),
    CONSTRAINT chk_msu_year_of_study CHECK (year_of_study BETWEEN 1 AND 7)
);

-- ------------------------------------------------------------------
-- BAPTISM AUDIT LOG (one-way: false -> true only)
-- ------------------------------------------------------------------
CREATE TABLE baptism_audit_log (
    id                   BIGSERIAL PRIMARY KEY,
    member_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    changed_by_admin_id    BIGINT NOT NULL REFERENCES users(id),
    previous_status       BOOLEAN NOT NULL,
    new_status            BOOLEAN NOT NULL DEFAULT TRUE,
    baptism_date          DATE,
    church_name           VARCHAR(150),
    notes                 VARCHAR(500),
    created_at            TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_baptism_one_way CHECK (previous_status = FALSE AND new_status = TRUE)
);

-- ------------------------------------------------------------------
-- ALUMNI RECORDS (snapshot archive)
-- ------------------------------------------------------------------
CREATE TABLE alumni_records (
    id                    BIGSERIAL PRIMARY KEY,
    original_member_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
    full_name              VARCHAR(160) NOT NULL,
    email                  VARCHAR(100) NOT NULL,
    phone                  VARCHAR(15) NOT NULL,
    university              VARCHAR(100) NOT NULL,
    program                 VARCHAR(100) NOT NULL,
    final_year_of_study      SMALLINT NOT NULL,
    home_region             VARCHAR(50) NOT NULL,
    home_church             VARCHAR(100) NOT NULL,
    graduation_year          SMALLINT NOT NULL,
    snapshot_data            JSONB NOT NULL,
    archived_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------
-- CONTENT TABLES
-- ------------------------------------------------------------------
CREATE TABLE spiritual_materials (
    id            BIGSERIAL PRIMARY KEY,
    title         VARCHAR(200) NOT NULL,
    description   VARCHAR(1000),
    type          material_type NOT NULL,
    file_url      VARCHAR(500) NOT NULL,
    branch_id     SMALLINT NOT NULL REFERENCES branches(id),
    uploaded_by   BIGINT NOT NULL REFERENCES users(id),
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE announcements (
    id           BIGSERIAL PRIMARY KEY,
    title        VARCHAR(200) NOT NULL,
    content      VARCHAR(2000) NOT NULL,
    branch_id    SMALLINT NOT NULL REFERENCES branches(id),
    created_by   BIGINT NOT NULL REFERENCES users(id),
    expiry_at    TIMESTAMP,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE events (
    id            BIGSERIAL PRIMARY KEY,
    title         VARCHAR(200) NOT NULL,
    description   VARCHAR(2000),
    location      VARCHAR(200),
    branch_id     SMALLINT NOT NULL REFERENCES branches(id),
    starts_at     TIMESTAMP NOT NULL,
    ends_at       TIMESTAMP,
    created_by    BIGINT NOT NULL REFERENCES users(id),
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE reports (
    id            BIGSERIAL PRIMARY KEY,
    title         VARCHAR(200) NOT NULL,
    content       VARCHAR(4000) NOT NULL,
    branch_id     SMALLINT NOT NULL REFERENCES branches(id),
    submitted_by  BIGINT NOT NULL REFERENCES users(id),
    status        report_status NOT NULL DEFAULT 'PENDING',
    reviewed_by   BIGINT REFERENCES users(id),
    reviewed_at   TIMESTAMP,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------
-- CHAT
-- ------------------------------------------------------------------
CREATE TABLE chat_messages (
    id          BIGSERIAL PRIMARY KEY,
    sender_id   BIGINT NOT NULL REFERENCES users(id),
    room_id     VARCHAR(100) NOT NULL DEFAULT 'public',
    message     VARCHAR(2000) NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at     TIMESTAMP NOT NULL DEFAULT NOW()
);
