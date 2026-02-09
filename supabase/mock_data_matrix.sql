-- ============================================
-- MATRIX-THEMED MOCK DATA
-- Ships, Agents, Programs, and The Resistance
-- ============================================

-- Get the Demo Organization ID (assuming it's the first/only org)
DO $$
DECLARE
  demo_org_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN

-- ============================================
-- ACCOUNTS (Organizations in The Matrix)
-- ============================================

-- The Resistance
INSERT INTO accounts (id, org_id, name, industry, website, employee_count, tier, email, city, state, address) VALUES
('10000000-0000-0000-0000-000000000001', demo_org_id, 'Zion Command', 'Technology', 'https://zion.matrix', 250, 'Platinum', 'command@zion.matrix', 'Zion', 'The Last Human City', 'Level 01, Zion Core'),
('10000000-0000-0000-0000-000000000002', demo_org_id, 'Nebuchadnezzar Crew', 'Operations', 'https://neb.zion.matrix', 12, 'Gold', 'crew@neb.matrix', 'The Real World', 'Mobile', 'Hovercraft Bay 7'),
('10000000-0000-0000-0000-000000000003', demo_org_id, 'Logos Operations', 'Logistics', 'https://logos.zion.matrix', 8, 'Gold', 'ops@logos.matrix', 'Zion', 'Dock 9', 'Hovercraft Bay 3'),
('10000000-0000-0000-0000-000000000004', demo_org_id, 'Mjolnir Command', 'Security', 'https://mjolnir.zion.matrix', 200, 'Platinum', 'command@mjolnir.matrix', 'Zion', 'Defense Grid', 'Flagship Dock'),
('10000000-0000-0000-0000-000000000005', demo_org_id, 'Vigilant Recon', 'Intelligence', 'https://vigilant.zion.matrix', 6, 'Silver', 'recon@vigilant.matrix', 'The Sewers', 'Mobile', 'Grid Sector 7-G');

-- Machine Empire
INSERT INTO accounts (id, org_id, name, industry, website, employee_count, tier, email, city, state, address) VALUES
('10000000-0000-0000-0000-000000000006', demo_org_id, 'Machine City Central', 'AI Systems', 'https://01.machine', 10000000, 'Enterprise', 'control@01.machine', 'Machine City', '01', 'The Source'),
('10000000-0000-0000-0000-000000000007', demo_org_id, 'Sentinel Manufacturing', 'Robotics', 'https://sentinels.machine', 500000, 'Enterprise', 'production@sentinels.machine', 'Machine City', 'Factory District', 'Assembly Line Alpha'),
('10000000-0000-0000-0000-000000000008', demo_org_id, 'Agent Program Division', 'Security', 'https://agents.matrix', 1000, 'Platinum', 'enforcement@agents.matrix', 'The Matrix', 'Virtual', 'System Core'),
('10000000-0000-0000-0000-000000000009', demo_org_id, 'Architect Bureau', 'Engineering', 'https://architect.matrix', 50, 'Platinum', 'design@architect.matrix', 'The Construct', 'Virtual', 'White Room'),
('10000000-0000-0000-0000-000000000010', demo_org_id, 'Oracle Consulting', 'Advisory', 'https://oracle.matrix', 3, 'Gold', 'wisdom@oracle.matrix', 'The Matrix', 'Virtual', 'Oracle\'s Apartment');

-- ============================================
-- CONTACTS (Operatives, Agents, Programs)
-- ============================================

-- The One and Crew
INSERT INTO contacts (id, org_id, account_id, name, email, phone, title, company, address) VALUES
('20000000-0000-0000-0000-000000000001', demo_org_id, '10000000-0000-0000-0000-000000000002', 'Neo (Thomas Anderson)', 'neo@neb.matrix', '+1-555-THE-ONE', 'The One', 'Nebuchadnezzar', 'Broadcast Depth 089'),
('20000000-0000-0000-0000-000000000002', demo_org_id, '10000000-0000-0000-0000-000000000002', 'Morpheus', 'morpheus@neb.matrix', '+1-555-ORACLE', 'Captain', 'Nebuchadnezzar', 'Captain\'s Quarters'),
('20000000-0000-0000-0000-000000000003', demo_org_id, '10000000-0000-0000-0000-000000000002', 'Trinity', 'trinity@neb.matrix', '+1-555-DODGE-THIS', 'Operator / Pilot', 'Nebuchadnezzar', 'Flight Deck'),
('20000000-0000-0000-0000-000000000004', demo_org_id, '10000000-0000-0000-0000-000000000002', 'Tank', 'tank@neb.matrix', '+1-555-OPERATOR', 'Operator', 'Nebuchadnezzar', 'Operations Core'),
('20000000-0000-0000-0000-000000000005', demo_org_id, '10000000-0000-0000-0000-000000000002', 'Dozer', 'dozer@neb.matrix', '+1-555-ZION-BORN', 'Pilot', 'Nebuchadnezzar', 'Engineering'),
('20000000-0000-0000-0000-000000000006', demo_org_id, '10000000-0000-0000-0000-000000000002', 'Mouse', 'mouse@neb.matrix', '+1-555-CONSTRUCT', 'Programmer', 'Nebuchadnezzar', 'Code Bay'),
('20000000-0000-0000-0000-000000000007', demo_org_id, '10000000-0000-0000-0000-000000000002', 'Apoc', 'apoc@neb.matrix', '+1-555-WEAPONS', 'Weapons Specialist', 'Nebuchadnezzar', 'Armory'),
('20000000-0000-0000-0000-000000000008', demo_org_id, '10000000-0000-0000-0000-000000000002', 'Switch', 'switch@neb.matrix', '+1-555-COPPERTOP', 'Operative', 'Nebuchadnezzar', 'Mess Hall'),
('20000000-0000-0000-0000-000000000009', demo_org_id, '10000000-0000-0000-0000-000000000002', 'Cypher (Traitor)', 'cypher@neb.matrix', '+1-555-IGNORANCE', 'Operator (Traitor)', 'Nebuchadnezzar', '[REDACTED]');

-- Zion Command
INSERT INTO contacts (id, org_id, account_id, name, email, phone, title, company) VALUES
('20000000-0000-0000-0000-000000000010', demo_org_id, '10000000-0000-0000-0000-000000000001', 'Commander Lock', 'lock@zion.command', '+1-555-DEFENSE', 'Defense Commander', 'Zion'),
('20000000-0000-0000-0000-000000000011', demo_org_id, '10000000-0000-0000-0000-000000000001', 'Councillor Hamann', 'hamann@zion.council', '+1-555-COUNCIL', 'Councillor', 'Zion'),
('20000000-0000-0000-0000-000000000012', demo_org_id, '10000000-0000-0000-0000-000000000001', 'Captain Niobe', 'niobe@logos.matrix', '+1-555-FASTEST', 'Captain', 'Logos'),
('20000000-0000-0000-0000-000000000013', demo_org_id, '10000000-0000-0000-0000-000000000001', 'Ghost', 'ghost@logos.matrix', '+1-555-PHASE', 'First Mate', 'Logos'),
('20000000-0000-0000-0000-000000000014', demo_org_id, '10000000-0000-0000-0000-000000000001', 'Captain Roland', 'roland@mjolnir.matrix', '+1-555-HAMMER', 'Captain', 'Mjolnir'),
('20000000-0000-0000-0000-000000000015', demo_org_id, '10000000-0000-0000-0000-000000000001', 'Kid', 'kid@logos.matrix', '+1-555-BELIEVER', 'Trainee', 'Zion');

-- Programs and Agents
INSERT INTO contacts (id, org_id, account_id, name, email, phone, title, company) VALUES
('20000000-0000-0000-0000-000000000020', demo_org_id, '10000000-0000-0000-0000-000000000008', 'Agent Smith', 'smith@agents.matrix', '+1-555-MULTIPLY', 'Rogue Agent', 'Agent Program Division'),
('20000000-0000-0000-0000-000000000021', demo_org_id, '10000000-0000-0000-0000-000000000008', 'Agent Brown', 'brown@agents.matrix', '+1-555-ENFORCE', 'Senior Agent', 'Agent Program Division'),
('20000000-0000-0000-0000-000000000022', demo_org_id, '10000000-0000-0000-0000-000000000008', 'Agent Jones', 'jones@agents.matrix', '+1-555-PURSUE', 'Field Agent', 'Agent Program Division'),
('20000000-0000-0000-0000-000000000023', demo_org_id, '10000000-0000-0000-0000-000000000009', 'The Architect', 'architect@matrix.sys', '+1-555-CREATOR', 'System Architect', 'Architect Bureau'),
('20000000-0000-0000-0000-000000000024', demo_org_id, '10000000-0000-0000-0000-000000000010', 'The Oracle', 'oracle@matrix.wisdom', '+1-555-COOKIES', 'Intuitive Program', 'Oracle Consulting'),
('20000000-0000-0000-0000-000000000025', demo_org_id, '10000000-0000-0000-0000-000000000010', 'Seraph', 'seraph@oracle.matrix', '+1-555-GUARDIAN', 'Protector', 'Oracle Consulting'),
('20000000-0000-0000-0000-000000000026', demo_org_id, '10000000-0000-0000-0000-000000000009', 'The Keymaker', 'keymaker@construct.matrix', '+1-555-DOORS', 'Access Specialist', 'The Construct'),
('20000000-0000-0000-0000-000000000027', demo_org_id, '10000000-0000-0000-0000-000000000010', 'Persephone', 'persephone@merovingian.club', '+1-555-KISS', 'Exile', 'Le Vrai Restaurant'),
('20000000-0000-0000-0000-000000000028', demo_org_id, '10000000-0000-0000-0000-000000000010', 'The Merovingian', 'mero@exile.matrix', '+1-555-CAUSALITY', 'Trafficker of Information', 'Le Vrai');

-- ============================================
-- LEADS (New Recruits)
-- ============================================

INSERT INTO leads (id, org_id, name, email, company, phone, status, source, estimated_value, address, notes, score, assigned_to) VALUES
('30000000-0000-0000-0000-000000000001', demo_org_id, 'Potential #1247', 'john.doe@metacortex.com', 'MetaCortex', '+1-555-BLUE-PILL', 'new', 'Hovercraft Scan', 75000, 'Apartment 101, The Matrix', 'Shows signs of awakening. Monitors report anomalous behavior.', 85, '20000000-0000-0000-0000-000000000002'),
('30000000-0000-0000-0000-000000000002', demo_org_id, 'Jane Smith', 'jsmith@system.matrix', 'System Corp', '+1-555-RED-PILL', 'qualified', 'Oracle Recommendation', 120000, 'Downtown Virtual Tower', 'Oracle believes she might be important. High potential.', 95, '20000000-0000-0000-0000-000000000003'),
('30000000-0000-0000-0000-000000000003', demo_org_id, 'Alex Chen', 'achen@datacorp.matrix', 'DataCorp', '+1-555-GLITCH', 'contacted', 'Vigilant Recon', 50000, 'Suburb Simulation Zone 7', 'Experiencing déjà vu. Ripe for extraction.', 70, '20000000-0000-0000-0000-000000000013'),
('30000000-0000-0000-0000-000000000004', demo_org_id, 'Marcus Webb', 'mwebb@virtual.systems', 'VirtualTech', '+1-555-ANOMALY', 'new', 'Broadcast Intercept', 30000, 'Grid Sector 12-F', 'Detected anomaly pattern. Low priority.', 45, '20000000-0000-0000-0000-000000000012'),
('30000000-0000-0000-0000-000000000005', demo_org_id, 'Sarah Connor... wait', 'sconnor@future.sys', 'Future Industries', '+1-555-WRONG-MOVIE', 'disqualified', 'Random Scan', 0, 'Different Universe', 'Wrong franchise. Rejection recommended.', 0, NULL);

-- ============================================
-- DEALS (Operations & Missions)
-- ============================================

INSERT INTO deals (id, org_id, name, amount, stage, probability, expected_close_date, account_id, contact_id, assigned_to, notes) VALUES
('40000000-0000-0000-0000-000000000001', demo_org_id, 'Operation: Exodus', 1000000, 'negotiation', 90, '2026-03-15', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'Final evacuation of remaining humans. Critical mission.'),
('40000000-0000-0000-0000-000000000002', demo_org_id, 'Source Code Recovery', 500000, 'discovery', 50, '2026-04-01', '10000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000023', '20000000-0000-0000-0000-000000000001', 'Neo must reach The Source. High value, extreme risk.'),
('40000000-0000-0000-0000-000000000003', demo_org_id, 'Sentinel Defense Grid', 750000, 'proposal', 75, '2026-02-28', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000012', 'Upgrade Zion defenses against incoming Sentinel swarm.'),
('40000000-0000-0000-0000-000000000004', demo_org_id, 'Oracle Interview', 250000, 'won', 100, '2026-02-01', '10000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000024', '20000000-0000-0000-0000-000000000001', 'Neo met with Oracle. Mission complete. Cookies confirmed.'),
('40000000-0000-0000-0000-000000000005', demo_org_id, 'Keymaker Extraction', 350000, 'closed-lost', 0, '2026-01-20', '10000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000026', '20000000-0000-0000-0000-000000000002', 'Keymaker extraction failed. Agent interference.');

-- ============================================
-- TASKS (Operational Tasks)
-- ============================================

INSERT INTO tasks (id, org_id, title, description, status, priority, due_date, assigned_to, related_entity_type, related_entity_id, completed) VALUES
('50000000-0000-0000-0000-000000000001', demo_org_id, 'Learn Kung Fu', 'Upload kung fu training program to Neo', 'completed', 'high', '2026-02-01', '20000000-0000-0000-0000-000000000004', 'contacts', '20000000-0000-0000-0000-000000000001', true),
('50000000-0000-0000-0000-000000000002', demo_org_id, 'Dodge Bullets', 'Train Neo in bullet time and dodging', 'completed', 'critical', '2026-02-03', '20000000-0000-0000-0000-000000000002', 'contacts', '20000000-0000-0000-0000-000000000001', true),
('50000000-0000-0000-0000-000000000003', demo_org_id, 'There is no spoon', 'Mental training - bend reality', 'in_progress', 'high', '2026-02-10', '20000000-0000-0000-0000-000000000024', 'contacts', '20000000-0000-0000-0000-000000000001', false),
('50000000-0000-0000-0000-000000000004', demo_org_id, 'EMP Maintenance', 'Test and calibrate EMP on Nebuchadnezzar', 'pending', 'medium', '2026-02-12', '20000000-0000-0000-0000-000000000005', 'accounts', '10000000-0000-0000-0000-000000000002', false),
('50000000-0000-0000-0000-000000000005', demo_org_id, 'Sentinel Patrol Scan', 'Check for Sentinel activity in Grid 7-G', 'in_progress', 'critical', '2026-02-09', '20000000-0000-0000-0000-000000000013', 'accounts', '10000000-0000-0000-0000-000000000005', false),
('50000000-0000-0000-0000-000000000006', demo_org_id, 'Hack the Matrix', 'Penetrate system defenses for intelligence', 'pending', 'high', '2026-02-15', '20000000-0000-0000-0000-000000000003', 'deals', '40000000-0000-0000-0000-000000000002', false),
('50000000-0000-0000-0000-000000000007', demo_org_id, 'Visit the Oracle', 'Bring cookies, get prophecy', 'completed', 'high', '2026-02-05', '20000000-0000-0000-0000-000000000001', 'contacts', '20000000-0000-0000-0000-000000000024', true),
('50000000-0000-0000-0000-000000000008', demo_org_id, 'Track Agent Smith', 'Monitor Agent Smith anomalous replication', 'in_progress', 'critical', '2026-02-14', '20000000-0000-0000-0000-000000000002', 'contacts', '20000000-0000-0000-0000-000000000020', false);

-- ============================================
-- CAMPAIGNS (Resistance Operations)
-- ============================================

INSERT INTO campaigns (id, org_id, name, type, budget, status, start_date, end_date, description, target_audience) VALUES
('60000000-0000-0000-0000-000000000001', demo_org_id, 'Wake Up Campaign', 'broadcast', 500000, 'active', '2026-02-01', '2026-03-31', 'Broadcast pirate signals to wake up potential recruits', 'Bluepills showing signs of awakening'),
('60000000-0000-0000-0000-000000000002', demo_org_id, 'Red Pill Distribution', 'field-ops', 250000, 'active', '2026-01-15', '2026-12-31', 'Distribute red pills to qualified candidates', 'High-score anomaly detections'),
('60000000-0000-0000-0000-000000000003', demo_org_id, 'Zion Recruitment Drive', 'outreach', 100000, 'planning', '2026-03-01', '2026-06-30', 'Increase crew numbers for multiple hovercrafts', 'Extracted humans in Zion'),
('60000000-0000-0000-0000-000000000004', demo_org_id, 'Agent Evasion Training', 'training', 75000, 'active', '2026-02-01', '2026-02-28', 'Train all operatives in advanced agent evasion', 'All field operatives'),
('60000000-0000-0000-0000-000000000005', demo_org_id, 'EMP Strike Coordination', 'military', 1000000, 'completed', '2026-01-01', '2026-01-31', 'Coordinated EMP strike on Sentinel forces', 'Machine forces');

-- ============================================
-- TICKETS (Support Requests & Incidents)
-- ============================================

INSERT INTO tickets (id, org_id, subject, description, status, priority, assigned_to, requester_id, account_id, sla_deadline) VALUES
('70000000-0000-0000-0000-000000000001', demo_org_id, 'Déjà Vu Glitch Reported', 'Black cat walked by twice. Possible Matrix alteration.', 'open', 'critical', '20000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', '2026-02-09 12:00:00'),
('70000000-0000-0000-0000-000000000002', demo_org_id, 'Agent Smith Replication Bug', 'Agent Smith is copying himself infinitely. URGENT.', 'in-progress', 'critical', '20000000-0000-0000-0000-000000000023', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000008', '2026-02-10 18:00:00'),
('70000000-0000-0000-0000-000000000003', demo_org_id, 'Construct Loading Slowly', 'Weapons program taking 3+ seconds to load. Need optimization.', 'open', 'medium', '20000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', '2026-02-15 09:00:00'),
('70000000-0000-0000-0000-000000000004', demo_org_id, 'Sentinel Detection Alert', 'Proximity alert - 5 Sentinels detected 200 meters from broadcast depth', 'resolved', 'critical', '20000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', '2026-02-08 15:00:00'),
('70000000-0000-0000-0000-000000000005', demo_org_id, 'Traitor Identified', 'Cypher is selling us out to Agent Smith. IMMEDIATE ACTION REQUIRED.', 'resolved', 'critical', '20000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', '2026-02-07 20:00:00');

-- ============================================
-- JOBS (Field Operations)
-- ============================================

INSERT INTO jobs (id, org_id, subject, description, account_id, job_type, status, priority, zone, scheduled_date, assigned_to) VALUES
('80000000-0000-0000-0000-000000000001', demo_org_id, 'Extraction: Neo', 'Extract Thomas Anderson from Metacortex office', '10000000-0000-0000-0000-000000000002', 'extraction', 'completed', 'critical', 'Central Business District', '2026-01-15', '20000000-0000-0000-0000-000000000002'),
('80000000-0000-0000-0000-000000000002', demo_org_id, 'Recon: Machine City Perimeter', 'Scout Machine City defenses for possible infiltration', '10000000-0000-0000-0000-000000000001', 'reconnaissance', 'in-progress', 'high', 'Machine Territory', '2026-02-12', '20000000-0000-0000-0000-000000000012'),
('80000000-0000-0000-0000-000000000003', demo_org_id, 'Repair: Hovercraft Engines', 'Emergency repairs on Nebuchadnezzar engines after EMP', '10000000-0000-0000-0000-000000000002', 'maintenance', 'scheduled', 'high', 'Zion Docks', '2026-02-10', '20000000-0000-0000-0000-000000000005'),
('80000000-0000-0000-0000-000000000004', demo_org_id, 'Supply Run: Ammunition', 'Resupply ammunition for all hovercrafts', '10000000-0000-0000-0000-000000000001', 'logistics', 'completed', 'medium', 'Zion Armory', '2026-02-05', '20000000-0000-0000-0000-000000000014'),
('80000000-0000-0000-0000-000000000005', demo_org_id, 'Infiltration: Power Plant', 'Infiltrate power plant to free battery humans', '10000000-0000-0000-0000-000000000001', 'rescue', 'scheduled', 'critical', 'Power Plant Sector 9', '2026-02-20', '20000000-0000-0000-0000-000000000001');

-- ============================================
-- CREWS (Hovercraft Crews)
-- ============================================

INSERT INTO crews (id, org_id, name, team_lead, status) VALUES
('90000000-0000-0000-0000-000000000001', demo_org_id, 'Nebuchadnezzar Crew', '20000000-0000-0000-0000-000000000002', 'active'),
('90000000-0000-0000-0000-000000000002', demo_org_id, 'Logos Crew', '20000000-0000-0000-0000-000000000012', 'active'),
('90000000-0000-0000-0000-000000000003', demo_org_id, 'Mjolnir Battalion', '20000000-0000-0000-0000-000000000014', 'active'),
('90000000-0000-0000-0000-000000000004', demo_org_id, 'Vigilant Scouts', '20000000-0000-0000-0000-000000000013', 'active');

-- ============================================
-- EQUIPMENT (Hovercrafts & Weapons)
-- ============================================

INSERT INTO equipment (id, org_id, name, type, serial_number, status, assigned_to, last_maintenance_date, next_maintenance_date) VALUES
('a0000000-0000-0000-0000-000000000001', demo_org_id, 'Nebuchadnezzar (Mark III No. 11)', 'Hovercraft', 'NEB-MK3-011', 'in-use', '20000000-0000-0000-0000-000000000002', '2026-02-01', '2026-03-01'),
('a0000000-0000-0000-0000-000000000002', demo_org_id, 'Logos (Mark IV)', 'Hovercraft', 'LOG-MK4-003', 'in-use', '20000000-0000-0000-0000-000000000012', '2026-02-05', '2026-03-05'),
('a0000000-0000-0000-0000-000000000003', demo_org_id, 'Mjolnir (Command Carrier)', 'Battleship', 'MJO-CMD-001', 'in-use', '20000000-0000-0000-0000-000000000014', '2026-01-15', '2026-02-15'),
('a0000000-0000-0000-0000-000000000004', demo_org_id, 'EMP Device (Nebuchadnezzar)', 'Weapon', 'EMP-NEB-011', 'operational', '20000000-0000-0000-0000-000000000002', '2026-02-03', '2026-04-03'),
('a0000000-0000-0000-0000-000000000005', demo_org_id, 'Lightning Rifle Array', 'Weapon', 'LRA-ZN-042', 'operational', '20000000-0000-0000-0000-000000000014', '2026-02-01', '2026-03-01');

-- ============================================
-- ZONES (Operational Zones)
-- ============================================

INSERT INTO zones (id, org_id, name, region, description, status) VALUES
('b0000000-0000-0000-0000-000000000001', demo_org_id, 'Zion Territory', 'The Real', 'The last human city and surrounding tunnels', 'active'),
('b0000000-0000-0000-0000-000000000002', demo_org_id, 'Machine City Perimeter', 'Machine Territory', 'Outer defensive perimeter of 01', 'hostile'),
('b0000000-0000-0000-0000-000000000003', demo_org_id, 'The Sewers', 'Tunnels', 'Network of service tunnels below The Matrix', 'active'),
('b0000000-0000-0000-0000-000000000004', demo_org_id, 'Broadcast Zones', 'Virtual', 'Safe zones for broadcast entry to The Matrix', 'active'),
('b0000000-0000-0000-0000-000000000005', demo_org_id, 'Sentinel Patrol Routes', 'Machine Territory', 'Known Sentinel hunting grounds', 'dangerous');

-- ============================================
-- CALENDAR EVENTS (Operations & Meetings)
-- ============================================

INSERT INTO calendar_events (id, org_id, title, description, type, start_time, end_time, location, created_by) VALUES
('c0000000-0000-0000-0000-000000000001', demo_org_id, 'Zion Council Meeting', 'Strategic planning session with Zion Council', 'meeting', '2026-02-10 14:00:00', '2026-02-10 16:00:00', 'Zion Council Chambers', '20000000-0000-0000-0000-000000000002'),
('c0000000-0000-0000-0000-000000000002', demo_org_id, 'Neo Training: Advanced Combat', 'Sparring program with Morpheus', 'training', '2026-02-11 09:00:00', '2026-02-11 12:00:00', 'The Construct', '20000000-0000-0000-0000-000000000002'),
('c0000000-0000-0000-0000-000000000003', demo_org_id, 'Oracle Consultation', 'Neo meets Oracle for guidance', 'meeting', '2026-02-12 15:00:00', '2026-02-12 16:30:00', 'Oracle\'s Apartment, The Matrix', '20000000-0000-0000-0000-000000000001'),
('c0000000-0000-0000-0000-000000000004', demo_org_id, 'Emergency: Sentinel Attack', 'Sentinel swarm detected approaching Zion', 'emergency', '2026-02-13 03:00:00', '2026-02-13 08:00:00', 'Zion Defense Grid', '20000000-0000-0000-0000-000000000010'),
('c0000000-0000-0000-0000-000000000005', demo_org_id, 'Captain''s Briefing', 'All hovercraft captains strategy session', 'meeting', '2026-02-14 10:00:00', '2026-02-14 12:00:00', 'Zion Command Center', '20000000-0000-0000-0000-000000000010');

-- ============================================
-- USERS (CRM Users)
-- ============================================

INSERT INTO users (id, org_id, name, email, role, team, active) VALUES
('d0000000-0000-0000-0000-000000000001', demo_org_id, 'Morpheus', 'morpheus@zion.matrix', 'admin', 'Nebuchadnezzar', true),
('d0000000-0000-0000-0000-000000000002', demo_org_id, 'Neo', 'neo@zion.matrix', 'manager', 'Nebuchadnezzar', true),
('d0000000-0000-0000-0000-000000000003', demo_org_id, 'Trinity', 'trinity@zion.matrix', 'agent', 'Nebuchadnezzar', true),
('d0000000-0000-0000-0000-000000000004', demo_org_id, 'Niobe', 'niobe@zion.matrix', 'manager', 'Logos', true),
('d0000000-0000-0000-0000-000000000005', demo_org_id, 'Commander Lock', 'lock@zion.matrix', 'admin', 'Zion Command', true),
('d0000000-0000-0000-0000-000000000006', demo_org_id, 'Tank (Operator)', 'tank@zion.matrix', 'technician', 'Nebuchadnezzar', true);

END $$;
