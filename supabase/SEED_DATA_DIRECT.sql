-- DIRECT SEED DATA FOR CATCHA CRM
-- Run this in Supabase SQL Editor - data inserts immediately
-- https://supabase.com/dashboard/project/anawatvgypmrpbmjfcht/sql/new

-- Demo org ID
DO $$
DECLARE
  demo_org_id UUID := '00000000-0000-0000-0000-000000000001';
  user_neo UUID := gen_random_uuid();
  user_trinity UUID := gen_random_uuid();
  user_morpheus UUID := gen_random_uuid();
  user_niobe UUID := gen_random_uuid();
  user_link UUID := gen_random_uuid();
  campaign_redpill UUID := gen_random_uuid();
  campaign_defend UUID := gen_random_uuid();
  campaign_oracle UUID := gen_random_uuid();
  account_neb UUID := gen_random_uuid();
  account_logos UUID := gen_random_uuid();
  account_hammer UUID := gen_random_uuid();
  account_vigilant UUID := gen_random_uuid();
  account_icarus UUID := gen_random_uuid();
  contact_morpheus UUID := gen_random_uuid();
  contact_neo UUID := gen_random_uuid();
  contact_trinity UUID := gen_random_uuid();
  contact_tank UUID := gen_random_uuid();
  contact_niobe UUID := gen_random_uuid();
  contact_ghost UUID := gen_random_uuid();
  contact_roland UUID := gen_random_uuid();
  contact_soren UUID := gen_random_uuid();
  product_redpill UUID := gen_random_uuid();
  product_bluepill UUID := gen_random_uuid();
  product_construct UUID := gen_random_uuid();
  product_hardline UUID := gen_random_uuid();
  product_emp UUID := gen_random_uuid();
  service_operator UUID := gen_random_uuid();
  service_combat UUID := gen_random_uuid();
  service_sentinel UUID := gen_random_uuid();
  service_hovercraft UUID := gen_random_uuid();
  lead_kid UUID := gen_random_uuid();
  lead_seraph UUID := gen_random_uuid();
  lead_persephone UUID := gen_random_uuid();
  lead_mero UUID := gen_random_uuid();
  lead_smith UUID := gen_random_uuid();
  deal_refit UUID := gen_random_uuid();
  deal_logos UUID := gen_random_uuid();
  deal_hammer UUID := gen_random_uuid();
  deal_vigilant UUID := gen_random_uuid();
  deal_combat UUID := gen_random_uuid();
  crew_alpha UUID := gen_random_uuid();
  crew_bravo UUID := gen_random_uuid();
  zone_downtown UUID := gen_random_uuid();
  zone_industrial UUID := gen_random_uuid();
  zone_residential UUID := gen_random_uuid();
  job1 UUID := gen_random_uuid();
  job2 UUID := gen_random_uuid();
  job3 UUID := gen_random_uuid();
  invoice1 UUID := gen_random_uuid();
  invoice2 UUID := gen_random_uuid();
  invoice3 UUID := gen_random_uuid();
BEGIN
  -- Ensure demo org exists
  INSERT INTO organizations (id, name, settings)
  VALUES (demo_org_id, 'Catcha CRM Demo', '{}'::jsonb)
  ON CONFLICT (id) DO UPDATE SET name = 'Catcha CRM Demo';

  -- USERS
  INSERT INTO users (id, org_id, name, email, role, team, avatar, created_at, updated_at) VALUES
    (user_neo, demo_org_id, 'Neo Anderson', 'neo@demo.catchacrm.com', 'admin', 'Field Operations', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neo', NOW(), NOW()),
    (user_trinity, demo_org_id, 'Trinity', 'trinity@demo.catchacrm.com', 'manager', 'Field Operations', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Trinity', NOW(), NOW()),
    (user_morpheus, demo_org_id, 'Morpheus', 'morpheus@demo.catchacrm.com', 'manager', 'Recruitment', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Morpheus', NOW(), NOW()),
    (user_niobe, demo_org_id, 'Niobe', 'niobe@demo.catchacrm.com', 'manager', 'Fleet Command', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Niobe', NOW(), NOW()),
    (user_link, demo_org_id, 'Link', 'link@demo.catchacrm.com', 'agent', 'Operators', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Link', NOW(), NOW());

  -- CAMPAIGNS
  INSERT INTO campaigns (id, org_id, name, type, budget, spent, revenue, revenue_generated, leads_generated, status, expected_cpl, created_at, updated_at) VALUES
    (campaign_redpill, demo_org_id, 'Red Pill Initiative', 'Email', 100000, 78000, 2500000, 2500000, 47, 'Active', 1500, NOW(), NOW()),
    (campaign_defend, demo_org_id, 'Defend Zion', 'Event', 500000, 425000, 1200000, 1200000, 12, 'Active', 35000, NOW(), NOW()),
    (campaign_oracle, demo_org_id, 'Oracle Prophecy Tour', 'Social', 75000, 75000, 180000, 180000, 23, 'Completed', 3000, NOW(), NOW());

  -- PRODUCTS
  INSERT INTO products (id, org_id, name, sku, description, unit_price, tax_rate, is_active, category, stock_level, reorder_point, created_at, updated_at) VALUES
    (product_redpill, demo_org_id, 'Red Pill', 'PILL-RED', 'Wake up to reality. No going back.', 999999, 0, true, 'Awakening', 100, 20, NOW(), NOW()),
    (product_bluepill, demo_org_id, 'Blue Pill', 'PILL-BLUE', 'Stay in Wonderland. Story ends.', 0, 0, true, 'Comfort', 999, 100, NOW(), NOW()),
    (product_construct, demo_org_id, 'Construct Program', 'PROG-CON', 'Loading program for combat training.', 50000, 10, true, 'Training', 50, 10, NOW(), NOW()),
    (product_hardline, demo_org_id, 'Hardline Phone', 'HARD-PHONE', 'Exit point connection device.', 15000, 10, true, 'Equipment', 25, 5, NOW(), NOW()),
    (product_emp, demo_org_id, 'EMP Device', 'WEAP-EMP', 'Electromagnetic pulse weapon for Sentinel defense.', 250000, 10, true, 'Defense', 10, 2, NOW(), NOW());

  -- SERVICES
  INSERT INTO services (id, org_id, name, code, description, billing_cycle, unit_price, tax_rate, is_active, duration_hours, created_at, updated_at) VALUES
    (service_operator, demo_org_id, 'Operator Support', 'SVC-OPR', 'Real-time Matrix navigation and exit coordination.', 'monthly', 8000, 10, true, NULL, NOW(), NOW()),
    (service_combat, demo_org_id, 'Combat Training Upload', 'SVC-TRN', 'Kung Fu, weapons, piloting - instant knowledge transfer.', 'one-off', 25000, 10, true, 10, NOW(), NOW()),
    (service_sentinel, demo_org_id, 'Sentinel Watch', 'SVC-SEN', 'Early warning system for machine attacks.', 'yearly', 120000, 0, true, NULL, NOW(), NOW()),
    (service_hovercraft, demo_org_id, 'Hovercraft Maintenance', 'SVC-HOV', 'Full ship systems diagnostic and repair.', 'monthly', 15000, 10, true, NULL, NOW(), NOW());

  -- ACCOUNTS
  INSERT INTO accounts (id, org_id, name, industry, website, employee_count, tier, owner_id, avatar, created_at, updated_at) VALUES
    (account_neb, demo_org_id, 'Nebuchadnezzar', 'Reconnaissance', 'nebuchadnezzar.zion', 9, 'Tier A', user_morpheus, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nebuchadnezzar', NOW(), NOW()),
    (account_logos, demo_org_id, 'Logos', 'Strike Force', 'logos.zion', 4, 'Tier A', user_niobe, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Logos', NOW(), NOW()),
    (account_hammer, demo_org_id, 'Mjolnir (Hammer)', 'Heavy Assault', 'hammer.zion', 12, 'Tier A', user_neo, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hammer', NOW(), NOW()),
    (account_vigilant, demo_org_id, 'Vigilant', 'Patrol', 'vigilant.zion', 6, 'Tier B', user_trinity, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vigilant', NOW(), NOW()),
    (account_icarus, demo_org_id, 'Icarus', 'Exploration', 'icarus.zion', 5, 'Tier B', user_link, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Icarus', NOW(), NOW());

  -- CONTACTS
  INSERT INTO contacts (id, org_id, name, account_id, email, phone, title, avatar, created_at, updated_at) VALUES
    (contact_morpheus, demo_org_id, 'Morpheus', account_neb, 'morpheus@nebuchadnezzar.zion', '+1-ZION-001', 'Captain', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Morpheus', NOW(), NOW()),
    (contact_neo, demo_org_id, 'Neo', account_neb, 'neo@nebuchadnezzar.zion', '+1-ZION-002', 'The One', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neo', NOW(), NOW()),
    (contact_trinity, demo_org_id, 'Trinity', account_neb, 'trinity@nebuchadnezzar.zion', '+1-ZION-003', 'First Mate', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Trinity', NOW(), NOW()),
    (contact_tank, demo_org_id, 'Tank', account_neb, 'tank@nebuchadnezzar.zion', '+1-ZION-004', 'Operator', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tank', NOW(), NOW()),
    (contact_niobe, demo_org_id, 'Niobe', account_logos, 'niobe@logos.zion', '+1-ZION-010', 'Captain', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Niobe', NOW(), NOW()),
    (contact_ghost, demo_org_id, 'Ghost', account_logos, 'ghost@logos.zion', '+1-ZION-011', 'First Mate', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ghost', NOW(), NOW()),
    (contact_roland, demo_org_id, 'Roland', account_hammer, 'roland@hammer.zion', '+1-ZION-020', 'Captain', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roland', NOW(), NOW()),
    (contact_soren, demo_org_id, 'Soren', account_vigilant, 'soren@vigilant.zion', '+1-ZION-030', 'Captain', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Soren', NOW(), NOW());

  -- LEADS
  INSERT INTO leads (id, org_id, name, company, email, phone, status, source, campaign_id, estimated_value, score, owner_id, created_at, updated_at) VALUES
    (lead_kid, demo_org_id, 'The Kid', 'Self-Substantiation', 'kid@freed.matrix', '+1-MATRIX-005', 'New', 'Search', campaign_redpill, 150000, 92, user_neo, NOW(), NOW()),
    (lead_seraph, demo_org_id, 'Seraph', 'Oracle Security', 'seraph@oracle.matrix', '+1-MATRIX-004', 'New', 'LinkedIn', campaign_redpill, 200000, 88, user_morpheus, NOW(), NOW()),
    (lead_persephone, demo_org_id, 'Persephone', 'Club Hel', 'persephone@clubhel.matrix', '+1-MATRIX-003', 'Qualified', 'Referral', campaign_oracle, 350000, 78, user_trinity, NOW(), NOW()),
    (lead_mero, demo_org_id, 'The Merovingian', 'Club Hel', 'mero@clubhel.matrix', '+1-MATRIX-002', 'Qualified', 'Referral', campaign_oracle, 500000, 65, user_morpheus, NOW(), NOW()),
    (lead_smith, demo_org_id, 'Agent Smith', 'Machine City', 'smith@matrix.ai', '+1-MACHINE-001', 'Nurturing', 'Direct', campaign_redpill, 0, 15, user_neo, NOW(), NOW());

  -- DEALS
  INSERT INTO deals (id, org_id, name, account_id, contact_id, amount, stage, probability, expected_close_date, assignee_id, campaign_id, created_at, updated_at) VALUES
    (deal_refit, demo_org_id, 'Nebuchadnezzar Refit Contract', account_neb, contact_morpheus, 450000, 'Closed Won', 100, CURRENT_DATE - INTERVAL '10 days', user_morpheus, campaign_defend, NOW(), NOW()),
    (deal_logos, demo_org_id, 'Logos Special Mission', account_logos, contact_niobe, 280000, 'Negotiation', 70, CURRENT_DATE + INTERVAL '15 days', user_niobe, campaign_defend, NOW(), NOW()),
    (deal_hammer, demo_org_id, 'Hammer Weapons Upgrade', account_hammer, contact_roland, 620000, 'Proposal', 40, CURRENT_DATE + INTERVAL '45 days', user_neo, campaign_defend, NOW(), NOW()),
    (deal_vigilant, demo_org_id, 'Vigilant Extended Patrol', account_vigilant, contact_soren, 175000, 'Discovery', 10, CURRENT_DATE + INTERVAL '60 days', user_trinity, campaign_oracle, NOW(), NOW()),
    (deal_combat, demo_org_id, 'Fleet-Wide Combat Training', account_neb, contact_neo, 850000, 'Negotiation', 75, CURRENT_DATE + INTERVAL '20 days', user_neo, campaign_redpill, NOW(), NOW());

  -- CREWS
  INSERT INTO crews (id, org_id, name, leader_id, member_ids, color, created_at, updated_at) VALUES
    (crew_alpha, demo_org_id, 'Alpha Strike Team', user_neo, ARRAY[user_neo, user_trinity, user_morpheus]::uuid[], '#3B82F6', NOW(), NOW()),
    (crew_bravo, demo_org_id, 'Bravo Extraction', user_niobe, ARRAY[user_niobe, user_link]::uuid[], '#10B981', NOW(), NOW());

  -- ZONES
  INSERT INTO zones (id, org_id, name, region, description, color, created_at, updated_at) VALUES
    (zone_downtown, demo_org_id, 'Downtown', 'Megacity Core', 'High-traffic area with multiple hardlines', '#EF4444', NOW(), NOW()),
    (zone_industrial, demo_org_id, 'Industrial', 'Factory District', 'Sentinel patrol routes nearby', '#F59E0B', NOW(), NOW()),
    (zone_residential, demo_org_id, 'Residential', 'Suburbs', 'Lower security, limited exit points', '#3B82F6', NOW(), NOW());

  -- JOBS
  INSERT INTO jobs (id, org_id, job_number, subject, description, account_id, assignee_id, crew_id, job_type, status, priority, zone, estimated_duration, scheduled_date, created_at, updated_at) VALUES
    (job1, demo_org_id, 'J-2026-0001', 'Extract The Kid', 'Red pill candidate extraction', account_neb, user_neo, crew_alpha, 'Emergency', 'Scheduled', 'Urgent', 'Downtown', 2, CURRENT_DATE + INTERVAL '1 day', NOW(), NOW()),
    (job2, demo_org_id, 'J-2026-0002', 'Logos Systems Check', 'Full diagnostic before mission', account_logos, user_niobe, crew_bravo, 'Inspection', 'InProgress', 'High', 'Industrial', 4, CURRENT_DATE, NOW(), NOW()),
    (job3, demo_org_id, 'J-2026-0003', 'EMP Installation - Hammer', 'Install and calibrate new EMP devices', account_hammer, user_link, crew_alpha, 'Install', 'Scheduled', 'Medium', 'Industrial', 6, CURRENT_DATE + INTERVAL '5 days', NOW(), NOW());

  -- INVOICES
  INSERT INTO invoices (id, org_id, invoice_number, account_id, deal_id, status, payment_status, invoice_date, issue_date, due_date, line_items, subtotal, tax_total, total, created_at, updated_at) VALUES
    (invoice1, demo_org_id, 'INV-2026-0001', account_neb, deal_refit, 'Paid', 'paid', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, '[{"description": "Hull restoration", "qty": 1, "unitPrice": 450000, "taxRate": 10, "lineTotal": 495000}]'::jsonb, 450000, 45000, 495000, NOW(), NOW()),
    (invoice2, demo_org_id, 'INV-2026-0002', account_logos, NULL, 'Sent', 'unpaid', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', '[{"description": "Operator Support Q1", "qty": 3, "unitPrice": 8000, "taxRate": 10, "lineTotal": 26400}]'::jsonb, 24000, 2400, 26400, NOW(), NOW()),
    (invoice3, demo_org_id, 'INV-2026-0003', account_hammer, NULL, 'Overdue', 'unpaid', CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE - INTERVAL '15 days', '[{"description": "EMP Device x2", "qty": 2, "unitPrice": 250000, "taxRate": 10, "lineTotal": 550000}]'::jsonb, 500000, 50000, 550000, NOW(), NOW());

  -- TASKS
  INSERT INTO tasks (id, org_id, title, description, assignee_id, due_date, status, priority, related_to_id, related_to_type, created_at, updated_at) VALUES
    (gen_random_uuid(), demo_org_id, 'Complete Neo Combat Training', 'Upload remaining martial arts programs.', user_link, CURRENT_DATE + INTERVAL '2 days', 'In Progress', 'High', contact_neo, 'contacts', NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'Schedule Oracle Meeting', 'Arrange meeting with the Oracle.', user_morpheus, CURRENT_DATE + INTERVAL '7 days', 'Pending', 'High', lead_seraph, 'leads', NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'Follow up on Hammer Invoice', 'Contact Roland about overdue payment.', user_trinity, CURRENT_DATE - INTERVAL '2 days', 'Pending', 'Urgent', invoice3, 'invoices', NOW(), NOW());

  -- TICKETS
  INSERT INTO tickets (id, org_id, ticket_number, subject, description, requester_id, account_id, status, priority, assignee_id, created_at, updated_at) VALUES
    (gen_random_uuid(), demo_org_id, 'TKT-001', 'EMP Device Not Charging', 'EMP device shows 0% charge and wont power up.', contact_roland, account_hammer, 'Open', 'Urgent', user_link, NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'TKT-002', 'Operator Console Flickering', 'Display keeps flickering during Matrix operations.', contact_ghost, account_logos, 'In Progress', 'High', user_link, NOW(), NOW());

  -- EQUIPMENT
  INSERT INTO equipment (id, org_id, name, type, barcode, condition, location, assigned_to, last_service_date, next_service_date, purchase_date, purchase_price, created_at, updated_at) VALUES
    (gen_random_uuid(), demo_org_id, 'Operator Console Alpha', 'Console', 'EQ-000001', 'Excellent', 'Nebuchadnezzar', user_link, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days', CURRENT_DATE - INTERVAL '365 days', 50000, NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'Hovercraft Engine Unit', 'Engine', 'EQ-000002', 'Good', 'Zion Dock', NULL, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE - INTERVAL '500 days', 150000, NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'EMP Charging Station', 'Charger', 'EQ-000003', 'Fair', 'Hammer', user_neo, CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '400 days', 25000, NOW(), NOW());

  -- INVENTORY ITEMS
  INSERT INTO inventory_items (id, org_id, name, sku, warehouse_qty, reorder_point, category, unit_price, created_at, updated_at) VALUES
    (gen_random_uuid(), demo_org_id, 'Red Pills', 'MED-RED', 47, 20, 'Medical', 999999, NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'EMP Capacitors', 'WEAP-CAP', 15, 5, 'Weapons', 5000, NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'Hardline Phones', 'COMM-HARD', 8, 10, 'Communications', 15000, NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'Neural Interface Plugs', 'TECH-PLUG', 50, 20, 'Technology', 2500, NOW(), NOW());

  -- CALENDAR EVENTS
  INSERT INTO calendar_events (id, org_id, title, description, start_time, end_time, type, location, related_to_type, related_to_id, created_at, updated_at) VALUES
    (gen_random_uuid(), demo_org_id, 'Oracle Consultation', 'Meeting with the Oracle to discuss prophecy', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '1 hour', 'Meeting', 'Oracle Teahouse', 'leads', lead_seraph, NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'Fleet Command Meeting', 'Quarterly strategy session with all captains', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '2 hours', 'Meeting', 'Zion Council Chambers', 'accounts', account_logos, NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'Neo Training Session', 'Advanced combat training in the Construct', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '3 hours', 'Internal', 'Construct Loading Program', 'contacts', contact_neo, NOW(), NOW());

  -- COMMUNICATIONS
  INSERT INTO communications (id, org_id, type, subject, content, direction, related_to_type, related_to_id, outcome, created_at, updated_at) VALUES
    (gen_random_uuid(), demo_org_id, 'Call', 'Prophecy Discussion', 'Discussed latest prophecy interpretations with Morpheus.', 'Outbound', 'contacts', contact_morpheus, 'answered', NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'Email', 'Mission Briefing: Machine City', 'Attached mission parameters for upcoming reconnaissance.', 'Outbound', 'accounts', account_logos, 'answered', NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'SMS', 'Exit Point Confirmed', 'Hardline at 42nd & Main confirmed operational.', 'Outbound', 'leads', lead_kid, 'answered', NOW(), NOW());

  -- REVIEWS
  INSERT INTO reviews (id, org_id, author_name, rating, content, platform, status, replied, reply_content, sentiment, account_id, created_at, updated_at) VALUES
    (gen_random_uuid(), demo_org_id, 'Councillor Hamann', 5, 'The Nebuchadnezzar crew saved Zion. Outstanding service.', 'Google', 'Replied', true, 'Thank you, Councillor. The fight continues.', 'Positive', account_neb, NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'Anonymous Freed Mind', 5, 'The red pill changed my life. Forever grateful to Morpheus.', 'Facebook', 'New', false, NULL, 'Positive', NULL, NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'Commander Lock', 3, 'Morpheus takes too many risks. Results are mixed.', 'Internal', 'Escalated', false, NULL, 'Neutral', NULL, NOW(), NOW());

  -- WAREHOUSES
  INSERT INTO warehouses (id, org_id, name, address, is_default, created_at, updated_at) VALUES
    (gen_random_uuid(), demo_org_id, 'Zion Main Warehouse', 'Dock Level 3, Zion', true, NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'Nebuchadnezzar Storage', 'Cargo Bay, Nebuchadnezzar', false, NOW(), NOW());

  -- REFERRAL REWARDS
  INSERT INTO referral_rewards (id, org_id, referrer_id, referred_lead_id, reward_amount, status, payout_date, notes, created_at, updated_at) VALUES
    (gen_random_uuid(), demo_org_id, contact_morpheus, lead_kid, 500, 'Active', NULL, 'The Kid was referred by Morpheus after the dock battle', NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, contact_trinity, lead_seraph, 750, 'Pending Payout', CURRENT_DATE + INTERVAL '7 days', 'Seraph met Trinity at the Oracles apartment', NOW(), NOW());

  -- INBOUND FORMS
  INSERT INTO inbound_forms (id, org_id, name, type, fields, submit_button_text, success_message, target_campaign_id, submission_count, conversion_rate, status, created_at, updated_at) VALUES
    (gen_random_uuid(), demo_org_id, 'Contact Request', 'Contact',
     '[{"id":"name","label":"Full Name","type":"text","required":true},{"id":"email","label":"Email","type":"email","required":true}]'::jsonb,
     'Submit Request', 'Thank you! An operator will contact you shortly.', campaign_redpill, 147, 23.5, 'Active', NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'Awakening Interest', 'Lead',
     '[{"id":"name","label":"What is your name?","type":"text","required":true}]'::jsonb,
     'Take the Red Pill', 'You are ready. An agent will contact you.', campaign_redpill, 892, 12.8, 'Active', NOW(), NOW());

  -- CHAT WIDGETS
  INSERT INTO chat_widgets (id, org_id, name, page, bubble_color, welcome_message, is_active, status, routing_user_id, conversations, avg_response_time, created_at, updated_at) VALUES
    (gen_random_uuid(), demo_org_id, 'Main Support Widget', 'All Pages', '#3B82F6', 'Welcome to Zion Command. How can we assist you today?', true, 'Active', user_link, 234, 45, NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'Sales Chat', 'Pricing Page', '#10B981', 'Interested in our services? Let me help you find the right solution.', true, 'Active', user_trinity, 89, 30, NOW(), NOW());

  -- CALCULATORS
  INSERT INTO calculators (id, org_id, name, type, base_rate, is_active, status, usage_count, lead_conversion_rate, created_at, updated_at) VALUES
    (gen_random_uuid(), demo_org_id, 'Freedom ROI Calculator', 'ROI', 15.5, true, 'Active', 1245, 8.5, NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'Hovercraft Loan Calculator', 'Repayment', 5.25, true, 'Active', 324, 12.3, NOW(), NOW());

  -- SUBSCRIPTIONS
  INSERT INTO subscriptions (id, org_id, account_id, name, status, billing_cycle, next_bill_date, start_date, items, auto_generate_invoice, created_at, updated_at) VALUES
    (gen_random_uuid(), demo_org_id, account_neb, 'Nebuchadnezzar Operations Package', 'active', 'monthly', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE - INTERVAL '45 days',
     '[{"itemType":"service","description":"Operator Support","qty":1,"unitPrice":8000,"taxRate":10}]'::jsonb, true, NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, account_logos, 'Logos Premium Support', 'active', 'monthly', CURRENT_DATE + INTERVAL '22 days', CURRENT_DATE - INTERVAL '60 days',
     '[{"itemType":"service","description":"Operator Support","qty":1,"unitPrice":8000,"taxRate":10}]'::jsonb, true, NOW(), NOW());

  -- QUOTES
  INSERT INTO quotes (id, org_id, quote_number, account_id, status, issue_date, expiry_date, line_items, subtotal, tax_total, total, notes, version, created_at, updated_at) VALUES
    (gen_random_uuid(), demo_org_id, 'Q-2026-0001', account_hammer, 'Sent', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days',
     '[{"itemType":"product","description":"EMP Device","qty":3,"unitPrice":250000,"taxRate":10,"lineTotal":825000}]'::jsonb, 800000, 80000, 880000, 'Quote for Hammer EMP upgrade project', 1, NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'Q-2026-0002', account_logos, 'Draft', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days',
     '[{"itemType":"service","description":"Combat Training Upload","qty":4,"unitPrice":25000,"taxRate":10,"lineTotal":110000}]'::jsonb, 100000, 10000, 110000, 'Crew training for Logos team', 1, NOW(), NOW());

  -- EXPENSES
  INSERT INTO expenses (id, org_id, vendor, amount, category, date, status, approved_by, created_at, updated_at) VALUES
    (gen_random_uuid(), demo_org_id, 'Zion Dock Services', 45000, 'Materials', CURRENT_DATE - INTERVAL '10 days', 'Paid', user_morpheus, NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'Fuel Depot Alpha', 12500, 'Fuel', CURRENT_DATE - INTERVAL '5 days', 'Paid', user_niobe, NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'Matrix Tech Supply', 28000, 'Materials', CURRENT_DATE - INTERVAL '2 days', 'Pending', NULL, NOW(), NOW());

  -- BANK TRANSACTIONS
  INSERT INTO bank_transactions (id, org_id, date, description, amount, type, status, match_confidence, reconciled, bank_reference, created_at, updated_at) VALUES
    (gen_random_uuid(), demo_org_id, CURRENT_DATE - INTERVAL '1 day', 'PAYMENT - NEBUCHADNEZZAR', 495000, 'Credit', 'matched', 'green', true, 'REF-001234', NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, CURRENT_DATE - INTERVAL '2 days', 'ZION DOCK SERVICES', -45000, 'Debit', 'matched', 'green', true, 'REF-001235', NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, CURRENT_DATE - INTERVAL '3 days', 'UNKNOWN TRANSFER', 8800, 'Credit', 'unmatched', 'amber', false, 'REF-001236', NOW(), NOW());

  -- PURCHASE ORDERS
  INSERT INTO purchase_orders (id, org_id, po_number, supplier_id, account_id, status, items, total, created_at, updated_at) VALUES
    (gen_random_uuid(), demo_org_id, 'PO-2026-0001', NULL, account_hammer, 'Ordered', '[{"sku":"WEAP-EMP","name":"EMP Device","qty":2,"price":250000}]'::jsonb, 500000, NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'PO-2026-0002', NULL, account_neb, 'Delivered', '[{"sku":"HARD-PHONE","name":"Hardline Phone","qty":5,"price":15000}]'::jsonb, 75000, NOW(), NOW());

  -- AUTOMATION WORKFLOWS
  INSERT INTO automation_workflows (id, org_id, name, description, trigger, nodes, is_active, execution_count, last_run_at, category, created_at, updated_at) VALUES
    (gen_random_uuid(), demo_org_id, 'New Lead Welcome', 'Sends welcome email when a new lead is created',
     '{"type":"RecordCreated","entity":"leads","config":{}}'::jsonb,
     '[{"id":"1","type":"Action","actionType":"SendEmail","config":{"template":"welcome"}}]'::jsonb,
     true, 47, NOW() - INTERVAL '2 hours', 'Sales', NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'Overdue Invoice Reminder', 'Sends reminder 3 days after invoice due date',
     '{"type":"DateArrived","entity":"invoices","config":{"field":"dueDate","offset":3}}'::jsonb,
     '[{"id":"1","type":"Action","actionType":"SendEmail","config":{"template":"overdue_reminder"}}]'::jsonb,
     true, 12, NOW() - INTERVAL '1 day', 'Operations', NOW(), NOW());

  -- WEBHOOKS
  INSERT INTO webhooks (id, org_id, name, url, method, headers, is_active, trigger_event, last_triggered_at, success_count, failure_count, created_at, updated_at) VALUES
    (gen_random_uuid(), demo_org_id, 'Slack New Lead', 'https://hooks.slack.com/services/XXXXX', 'POST',
     '{"Content-Type":"application/json"}'::jsonb, true, 'leads.created', NOW() - INTERVAL '3 hours', 145, 2, NOW(), NOW());

  -- CONVERSATIONS
  INSERT INTO conversations (id, org_id, participant_ids, name, is_system, created_at, updated_at) VALUES
    (gen_random_uuid(), demo_org_id, jsonb_build_array(user_neo::text, user_trinity::text, user_morpheus::text), 'General', true, NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, jsonb_build_array(user_neo::text, user_trinity::text), 'Sales Team', true, NOW(), NOW());

  -- NOTIFICATIONS
  INSERT INTO notifications (id, org_id, owner_id, title, message, type, read, link, created_at, updated_at) VALUES
    (gen_random_uuid(), demo_org_id, user_neo, 'New Lead Assigned', 'The Kid has been assigned to you as a new lead.', 'info', false, '/leads', NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, user_trinity, 'Invoice Overdue', 'Invoice INV-2026-0003 for Hammer is now overdue.', 'warning', false, '/financials/ledger/income', NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, user_morpheus, 'Deal Won!', 'Nebuchadnezzar Refit Contract has been closed as won!', 'success', true, '/deals', NOW(), NOW());

  -- DOCUMENTS
  INSERT INTO documents (id, org_id, name, file_type, file_size, url, related_to_type, related_to_id, created_at, updated_at) VALUES
    (gen_random_uuid(), demo_org_id, 'Nebuchadnezzar Schematic', 'pdf', '2.4 MB', 'https://storage.zion.local/docs/neb-schematic.pdf', 'accounts', account_neb, NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'Combat Training Certificate - Neo', 'pdf', '156 KB', 'https://storage.zion.local/docs/neo-cert.pdf', 'contacts', contact_neo, NOW(), NOW());

  RAISE NOTICE 'Demo data seeded successfully!';
END;
$$;
