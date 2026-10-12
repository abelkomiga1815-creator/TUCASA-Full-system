-- Create about_us table
CREATE TABLE IF NOT EXISTS about_us (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    mission TEXT,
    vision TEXT,
    contact_information TEXT,
    organization_name VARCHAR(200),
    branch_name VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default About Us content
INSERT INTO about_us (title, description, mission, vision, contact_information, organization_name, branch_name)
SELECT 'About Us',
       'To reach, equip, and send out Christian students to impact the university community and beyond with the Gospel of Jesus Christ through discipleship, worship, and service.',
       'A transformed university community where every student encounters Christ, grows in faith, and becomes a faithful witness in their sphere of influence.',
       'A transformed university community where every student encounters Christ, grows in faith, and becomes a faithful witness in their sphere of influence.',
       'UDSM Mabibo Hostel, Main Campus\n+255 XXX XXXXXXX\ntucasa.mabibo@udsm.ac.tz',
       'Tanzania Universities and Colleges Adventist Students Association',
       'TUCASA UDSM MABIBO HOSTEL'
WHERE NOT EXISTS (SELECT 1 FROM about_us);