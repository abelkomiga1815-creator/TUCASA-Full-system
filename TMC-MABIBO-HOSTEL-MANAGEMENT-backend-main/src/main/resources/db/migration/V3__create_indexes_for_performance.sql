-- =====================================================================
-- V3__create_indexes_for_performance.sql
-- =====================================================================

-- Users
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role_status ON users (role, status);
CREATE INDEX idx_users_branch_year ON users (branch_id, year_of_study);
CREATE INDEX idx_users_branch_status ON users (branch_id, status);

-- Member semester updates (active-count query)
CREATE INDEX idx_msu_member_semester ON member_semester_updates (member_id, semester_id);
CREATE INDEX idx_msu_semester ON member_semester_updates (semester_id);

-- Baptism audit log
CREATE INDEX idx_baptism_audit_member ON baptism_audit_log (member_id);

-- Alumni records
CREATE INDEX idx_alumni_original_member ON alumni_records (original_member_id);
CREATE INDEX idx_alumni_email ON alumni_records (email);

-- Content tables
CREATE INDEX idx_materials_branch ON spiritual_materials (branch_id);

CREATE INDEX idx_announcements_branch
    ON announcements (branch_id);

CREATE INDEX idx_events_branch_upcoming
    ON events (branch_id, starts_at);

CREATE INDEX idx_reports_branch_status
    ON reports (branch_id, status);

-- Chat
CREATE INDEX idx_chat_room_sent_at ON chat_messages (room_id, sent_at);
