-- =====================================================================
-- V4__convert_enums_to_varchar.sql
-- TUCASA Management System - Mabibo Hostel Branch
--
-- Hibernate 6 renders PostgreSQL native enum columns in query filters using
-- the Java enum class name as the cast target (e.g. `'ACTIVE'::UserStatus`)
-- and cannot infer a native enum type for NULL-able query bind parameters.
-- That makes several repository queries fail at runtime (active-member
-- count, member search filters, alumni search). Convert the enum columns to
-- plain VARCHAR and switch the entities to @Enumerated(EnumType.STRING) so
-- every query path (literals, NULL-able params, case-insensitive LIKE) works.
-- =====================================================================

ALTER TABLE users                      ALTER COLUMN role                TYPE VARCHAR(20) USING role::text;
ALTER TABLE users                      ALTER COLUMN status              TYPE VARCHAR(20) USING status::text;
ALTER TABLE spiritual_materials        ALTER COLUMN type                TYPE VARCHAR(20) USING type::text;
ALTER TABLE reports                    ALTER COLUMN status              TYPE VARCHAR(20) USING status::text;
ALTER TABLE member_semester_updates    ALTER COLUMN registration_status TYPE VARCHAR(20) USING registration_status::text;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS material_type CASCADE;
DROP TYPE IF EXISTS report_status CASCADE;
DROP TYPE IF EXISTS registration_status CASCADE;
