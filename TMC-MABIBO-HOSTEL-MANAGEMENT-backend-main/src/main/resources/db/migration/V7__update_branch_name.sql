-- =====================================================================
-- V7__update_branch_name.sql
-- Update branch name from "Mabibo Hostel" to "UDSM Mabibo Hostel"
-- =====================================================================

UPDATE branches
SET name = 'UDSM Mabibo Hostel'
WHERE name = 'Mabibo Hostel';