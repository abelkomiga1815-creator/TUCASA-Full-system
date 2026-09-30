-- =====================================================================
-- V2__seed_reference_data.sql
-- Seeds: 31 Tanzanian regions, Mabibo branch, default semester, admin user
-- =====================================================================

-- ------------------------------------------------------------------
-- Regions (31 Tanzanian regions)
-- ------------------------------------------------------------------
INSERT INTO regions (name) VALUES
    ('Arusha'), ('Dar es Salaam'), ('Dodoma'), ('Geita'), ('Iringa'),
    ('Kagera'), ('Katavi'), ('Kigoma'), ('Kilimanjaro'), ('Lindi'),
    ('Manyara'), ('Mara'), ('Mbeya'), ('Morogoro'), ('Mtwara'),
    ('Mwanza'), ('Njombe'), ('Pemba North'), ('Pemba South'), ('Pwani'),
    ('Rukwa'), ('Ruvuma'), ('Shinyanga'), ('Simiyu'), ('Singida'),
    ('Songwe'), ('Tabora'), ('Tanga'), ('Unguja North'), ('Unguja South'),
    ('Unguja Urban West')
ON CONFLICT (name) DO NOTHING;

-- ------------------------------------------------------------------
-- Branch: Mabibo Hostel (UDSM)
-- ------------------------------------------------------------------
INSERT INTO branches (name, location) VALUES
    ('Mabibo Hostel', 'UDSM - Dar es Salaam')
ON CONFLICT (name) DO NOTHING;

-- ------------------------------------------------------------------
-- Default active semester
-- ------------------------------------------------------------------
INSERT INTO semesters (name, start_date, end_date, registration_deadline, is_active)
VALUES ('Semester 1 2025/2026', '2025-09-01', '2026-01-31', '2025-09-30', TRUE);

-- ------------------------------------------------------------------
-- Default admin user
-- Email:    admin@tucasa.org
-- Password: Admin@123
-- Hash below is a real BCrypt (cost 10) digest of 'Admin@123'.
-- CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN IN ANY REAL DEPLOYMENT.
-- ------------------------------------------------------------------
INSERT INTO users (
    first_name, last_name, email, phone, university, program,
    year_of_study, is_baptized, home_region, home_church, talent,
    role, status, branch_id, password_hash, email_verified_at
)
SELECT
    'TUCASA', 'Administrator', 'admin@tucasa.org', '+255700000000',
    'University of Dar es Salaam', 'Administration',
    4, TRUE, 'Dar es Salaam', 'Mabibo SDA Church', NULL,
    'ADMIN', 'ACTIVE', b.id,
    '$2b$10$Bdi.0rt2NH9ujWOUmGggF.CHKB2sTbDeGGWXypvMUdp.eg1Lo7iQC',
    NOW()
FROM branches b
WHERE b.name = 'Mabibo Hostel'
ON CONFLICT (email) DO NOTHING;
