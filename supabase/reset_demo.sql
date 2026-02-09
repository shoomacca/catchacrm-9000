-- ============================================
-- DEMO ORGANIZATION RESET FUNCTION
-- Deletes all demo org data and re-seeds
-- Call with: SELECT reset_demo_organization();
-- ============================================

-- Demo org ID (fixed UUID for demo mode)
-- This is the organization that gets reset every 24 hours

CREATE OR REPLACE FUNCTION reset_demo_organization()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  demo_org_id UUID := '00000000-0000-0000-0000-000000000001';
  user_neo UUID;
  user_trinity UUID;
  user_morpheus UUID;
  user_niobe UUID;
  user_link UUID;
  campaign_redpill UUID;
  campaign_defend UUID;
  campaign_oracle UUID;
  account_neb UUID;
  account_logos UUID;
  account_hammer UUID;
  account_vigilant UUID;
  account_icarus UUID;
  contact_morpheus UUID;
  contact_neo UUID;
  contact_trinity UUID;
  contact_tank UUID;
  contact_niobe UUID;
  contact_ghost UUID;
  contact_roland UUID;
  contact_soren UUID;
  product_redpill UUID;
  product_bluepill UUID;
  product_construct UUID;
  product_hardline UUID;
  product_emp UUID;
  service_operator UUID;
  service_combat UUID;
  service_sentinel UUID;
  service_hovercraft UUID;
  lead_kid UUID;
  lead_seraph UUID;
  lead_persephone UUID;
  lead_mero UUID;
  lead_smith UUID;
  deal_refit UUID;
  deal_logos UUID;
  deal_hammer UUID;
  deal_vigilant UUID;
  deal_combat UUID;
  crew_alpha UUID;
  crew_bravo UUID;
  zone_downtown UUID;
  zone_industrial UUID;
  zone_residential UUID;
  job1 UUID;
  job2 UUID;
  job3 UUID;
  invoice1 UUID;
  invoice2 UUID;
  invoice3 UUID;
BEGIN
  -- ============================================
  -- STEP 1: DELETE ALL EXISTING DEMO DATA
  -- ============================================

  -- Delete in correct order (respect FK constraints)
  DELETE FROM chat_messages WHERE org_id = demo_org_id;
  DELETE FROM conversations WHERE org_id = demo_org_id;
  DELETE FROM ticket_messages WHERE org_id = demo_org_id;
  DELETE FROM notifications WHERE org_id = demo_org_id;
  DELETE FROM audit_log WHERE org_id = demo_org_id;
  DELETE FROM documents WHERE org_id = demo_org_id;
  DELETE FROM communications WHERE org_id = demo_org_id;
  DELETE FROM calendar_events WHERE org_id = demo_org_id;
  DELETE FROM tasks WHERE org_id = demo_org_id;
  DELETE FROM tickets WHERE org_id = demo_org_id;
  DELETE FROM payments WHERE org_id = demo_org_id;
  DELETE FROM invoices WHERE org_id = demo_org_id;
  DELETE FROM quotes WHERE org_id = demo_org_id;
  DELETE FROM subscriptions WHERE org_id = demo_org_id;
  DELETE FROM jobs WHERE org_id = demo_org_id;
  DELETE FROM purchase_orders WHERE org_id = demo_org_id;
  DELETE FROM bank_transactions WHERE org_id = demo_org_id;
  DELETE FROM expenses WHERE org_id = demo_org_id;
  DELETE FROM reviews WHERE org_id = demo_org_id;
  DELETE FROM equipment WHERE org_id = demo_org_id;
  DELETE FROM inventory_items WHERE org_id = demo_org_id;
  DELETE FROM deals WHERE org_id = demo_org_id;
  DELETE FROM referral_rewards WHERE org_id = demo_org_id;
  DELETE FROM leads WHERE org_id = demo_org_id;
  DELETE FROM contacts WHERE org_id = demo_org_id;
  DELETE FROM accounts WHERE org_id = demo_org_id;
  DELETE FROM products WHERE org_id = demo_org_id;
  DELETE FROM services WHERE org_id = demo_org_id;
  DELETE FROM campaigns WHERE org_id = demo_org_id;
  DELETE FROM inbound_forms WHERE org_id = demo_org_id;
  DELETE FROM chat_widgets WHERE org_id = demo_org_id;
  DELETE FROM calculators WHERE org_id = demo_org_id;
  DELETE FROM automation_workflows WHERE org_id = demo_org_id;
  DELETE FROM webhooks WHERE org_id = demo_org_id;
  DELETE FROM industry_templates WHERE org_id = demo_org_id;
  DELETE FROM crews WHERE org_id = demo_org_id;
  DELETE FROM zones WHERE org_id = demo_org_id;
  DELETE FROM warehouses WHERE org_id = demo_org_id;
  DELETE FROM users WHERE org_id = demo_org_id;

  -- ============================================
  -- STEP 2: ENSURE DEMO ORGANIZATION EXISTS
  -- ============================================

  INSERT INTO organizations (id, name, slug, plan, subscription_status)
  VALUES (demo_org_id, 'Catcha CRM Demo', 'demo', 'enterprise', 'active')
  ON CONFLICT (id) DO UPDATE SET name = 'Catcha CRM Demo', plan = 'enterprise';

  -- ============================================
  -- STEP 3: INSERT USERS
  -- ============================================

  user_neo := gen_random_uuid();
  user_trinity := gen_random_uuid();
  user_morpheus := gen_random_uuid();
  user_niobe := gen_random_uuid();
  user_link := gen_random_uuid();

  INSERT INTO users (id, org_id, name, email, role, team, avatar) VALUES
    (user_neo, demo_org_id, 'Neo Anderson', 'neo@demo.catchacrm.com', 'admin', 'Field Operations', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neo'),
    (user_trinity, demo_org_id, 'Trinity', 'trinity@demo.catchacrm.com', 'manager', 'Field Operations', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Trinity'),
    (user_morpheus, demo_org_id, 'Morpheus', 'morpheus@demo.catchacrm.com', 'manager', 'Recruitment', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Morpheus'),
    (user_niobe, demo_org_id, 'Niobe', 'niobe@demo.catchacrm.com', 'manager', 'Fleet Command', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Niobe'),
    (user_link, demo_org_id, 'Link', 'link@demo.catchacrm.com', 'agent', 'Operators', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Link');

  -- ============================================
  -- STEP 4: INSERT CAMPAIGNS
  -- ============================================

  campaign_redpill := gen_random_uuid();
  campaign_defend := gen_random_uuid();
  campaign_oracle := gen_random_uuid();

  INSERT INTO campaigns (id, org_id, name, type, budget, spent, revenue, revenue_generated, leads_generated, status, expected_c_p_l) VALUES
    (campaign_redpill, demo_org_id, 'Red Pill Initiative', 'Email', 100000, 78000, 2500000, 2500000, 47, 'Active', 1500),
    (campaign_defend, demo_org_id, 'Defend Zion', 'Event', 500000, 425000, 1200000, 1200000, 12, 'Active', 35000),
    (campaign_oracle, demo_org_id, 'Oracle Prophecy Tour', 'Social', 75000, 75000, 180000, 180000, 23, 'Completed', 3000);

  -- ============================================
  -- STEP 5: INSERT PRODUCTS
  -- ============================================

  product_redpill := gen_random_uuid();
  product_bluepill := gen_random_uuid();
  product_construct := gen_random_uuid();
  product_hardline := gen_random_uuid();
  product_emp := gen_random_uuid();

  INSERT INTO products (id, org_id, name, sku, description, unit_price, tax_rate, is_active, category, stock_level, reorder_point) VALUES
    (product_redpill, demo_org_id, 'Red Pill', 'PILL-RED', 'Wake up to reality. No going back.', 999999, 0, true, 'Awakening', 100, 20),
    (product_bluepill, demo_org_id, 'Blue Pill', 'PILL-BLUE', 'Stay in Wonderland. Story ends.', 0, 0, true, 'Comfort', 999, 100),
    (product_construct, demo_org_id, 'Construct Program', 'PROG-CON', 'Loading program for combat training.', 50000, 10, true, 'Training', 50, 10),
    (product_hardline, demo_org_id, 'Hardline Phone', 'HARD-PHONE', 'Exit point connection device.', 15000, 10, true, 'Equipment', 25, 5),
    (product_emp, demo_org_id, 'EMP Device', 'WEAP-EMP', 'Electromagnetic pulse weapon for Sentinel defense.', 250000, 10, true, 'Defense', 10, 2);

  -- ============================================
  -- STEP 6: INSERT SERVICES
  -- ============================================

  service_operator := gen_random_uuid();
  service_combat := gen_random_uuid();
  service_sentinel := gen_random_uuid();
  service_hovercraft := gen_random_uuid();

  INSERT INTO services (id, org_id, name, code, description, billing_cycle, unit_price, tax_rate, is_active, duration_hours) VALUES
    (service_operator, demo_org_id, 'Operator Support', 'SVC-OPR', 'Real-time Matrix navigation and exit coordination.', 'monthly', 8000, 10, true, NULL),
    (service_combat, demo_org_id, 'Combat Training Upload', 'SVC-TRN', 'Kung Fu, weapons, piloting - instant knowledge transfer.', 'one-off', 25000, 10, true, 10),
    (service_sentinel, demo_org_id, 'Sentinel Watch', 'SVC-SEN', 'Early warning system for machine attacks.', 'yearly', 120000, 0, true, NULL),
    (service_hovercraft, demo_org_id, 'Hovercraft Maintenance', 'SVC-HOV', 'Full ship systems diagnostic and repair.', 'monthly', 15000, 10, true, NULL);

  -- ============================================
  -- STEP 7: INSERT ACCOUNTS (Ships)
  -- ============================================

  account_neb := gen_random_uuid();
  account_logos := gen_random_uuid();
  account_hammer := gen_random_uuid();
  account_vigilant := gen_random_uuid();
  account_icarus := gen_random_uuid();

  INSERT INTO accounts (id, org_id, name, industry, website, employee_count, tier, owner_id, status, avatar) VALUES
    (account_neb, demo_org_id, 'Nebuchadnezzar', 'Reconnaissance', 'nebuchadnezzar.zion', 9, 'Tier A', user_morpheus, 'active', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nebuchadnezzar'),
    (account_logos, demo_org_id, 'Logos', 'Strike Force', 'logos.zion', 4, 'Tier A', user_niobe, 'active', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Logos'),
    (account_hammer, demo_org_id, 'Mjolnir (Hammer)', 'Heavy Assault', 'hammer.zion', 12, 'Tier A', user_neo, 'active', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hammer'),
    (account_vigilant, demo_org_id, 'Vigilant', 'Patrol', 'vigilant.zion', 6, 'Tier B', user_trinity, 'active', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vigilant'),
    (account_icarus, demo_org_id, 'Icarus', 'Exploration', 'icarus.zion', 5, 'Tier B', user_link, 'inactive', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Icarus');

  -- ============================================
  -- STEP 8: INSERT CONTACTS (Crew members)
  -- ============================================

  contact_morpheus := gen_random_uuid();
  contact_neo := gen_random_uuid();
  contact_trinity := gen_random_uuid();
  contact_tank := gen_random_uuid();
  contact_niobe := gen_random_uuid();
  contact_ghost := gen_random_uuid();
  contact_roland := gen_random_uuid();
  contact_soren := gen_random_uuid();

  INSERT INTO contacts (id, org_id, name, account_id, email, phone, title, is_primary, avatar) VALUES
    (contact_morpheus, demo_org_id, 'Morpheus', account_neb, 'morpheus@nebuchadnezzar.zion', '+1-ZION-001', 'Captain', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Morpheus'),
    (contact_neo, demo_org_id, 'Neo', account_neb, 'neo@nebuchadnezzar.zion', '+1-ZION-002', 'The One', false, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neo'),
    (contact_trinity, demo_org_id, 'Trinity', account_neb, 'trinity@nebuchadnezzar.zion', '+1-ZION-003', 'First Mate', false, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Trinity'),
    (contact_tank, demo_org_id, 'Tank', account_neb, 'tank@nebuchadnezzar.zion', '+1-ZION-004', 'Operator', false, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tank'),
    (contact_niobe, demo_org_id, 'Niobe', account_logos, 'niobe@logos.zion', '+1-ZION-010', 'Captain', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Niobe'),
    (contact_ghost, demo_org_id, 'Ghost', account_logos, 'ghost@logos.zion', '+1-ZION-011', 'First Mate', false, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ghost'),
    (contact_roland, demo_org_id, 'Roland', account_hammer, 'roland@hammer.zion', '+1-ZION-020', 'Captain', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roland'),
    (contact_soren, demo_org_id, 'Soren', account_vigilant, 'soren@vigilant.zion', '+1-ZION-030', 'Captain', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Soren');

  -- ============================================
  -- STEP 9: INSERT LEADS
  -- ============================================

  lead_kid := gen_random_uuid();
  lead_seraph := gen_random_uuid();
  lead_persephone := gen_random_uuid();
  lead_mero := gen_random_uuid();
  lead_smith := gen_random_uuid();

  INSERT INTO leads (id, org_id, name, company, email, phone, status, source, campaign_id, estimated_value, score, assigned_to) VALUES
    (lead_kid, demo_org_id, 'The Kid', 'Self-Substantiation', 'kid@freed.matrix', '+1-MATRIX-005', 'New', 'Search', campaign_redpill, 150000, 92, user_neo),
    (lead_seraph, demo_org_id, 'Seraph', 'Oracle Security', 'seraph@oracle.matrix', '+1-MATRIX-004', 'New', 'LinkedIn', campaign_redpill, 200000, 88, user_morpheus),
    (lead_persephone, demo_org_id, 'Persephone', 'Club Hel', 'persephone@clubhel.matrix', '+1-MATRIX-003', 'Qualified', 'Referral', campaign_oracle, 350000, 78, user_trinity),
    (lead_mero, demo_org_id, 'The Merovingian', 'Club Hel', 'mero@clubhel.matrix', '+1-MATRIX-002', 'Qualified', 'Referral', campaign_oracle, 500000, 65, user_morpheus),
    (lead_smith, demo_org_id, 'Agent Smith', 'Machine City', 'smith@matrix.ai', '+1-MACHINE-001', 'Nurturing', 'Direct', campaign_redpill, 0, 15, user_neo);

  -- ============================================
  -- STEP 10: INSERT DEALS
  -- ============================================

  deal_refit := gen_random_uuid();
  deal_logos := gen_random_uuid();
  deal_hammer := gen_random_uuid();
  deal_vigilant := gen_random_uuid();
  deal_combat := gen_random_uuid();

  INSERT INTO deals (id, org_id, name, account_id, contact_id, amount, stage, probability, expected_close_date, assignee_id, campaign_id) VALUES
    (deal_refit, demo_org_id, 'Nebuchadnezzar Refit Contract', account_neb, contact_morpheus, 450000, 'Closed Won', 100, CURRENT_DATE - INTERVAL '10 days', user_morpheus, campaign_defend),
    (deal_logos, demo_org_id, 'Logos Special Mission', account_logos, contact_niobe, 280000, 'Negotiation', 70, CURRENT_DATE + INTERVAL '15 days', user_niobe, campaign_defend),
    (deal_hammer, demo_org_id, 'Hammer Weapons Upgrade', account_hammer, contact_roland, 620000, 'Proposal', 40, CURRENT_DATE + INTERVAL '45 days', user_neo, campaign_defend),
    (deal_vigilant, demo_org_id, 'Vigilant Extended Patrol', account_vigilant, contact_soren, 175000, 'Discovery', 10, CURRENT_DATE + INTERVAL '60 days', user_trinity, campaign_oracle),
    (deal_combat, demo_org_id, 'Fleet-Wide Combat Training', account_neb, contact_neo, 850000, 'Negotiation', 75, CURRENT_DATE + INTERVAL '20 days', user_neo, campaign_redpill);

  -- ============================================
  -- STEP 11: INSERT CREWS
  -- ============================================

  crew_alpha := gen_random_uuid();
  crew_bravo := gen_random_uuid();

  INSERT INTO crews (id, org_id, name, leader_id, member_ids, color, status) VALUES
    (crew_alpha, demo_org_id, 'Alpha Strike Team', user_neo, ARRAY[user_neo, user_trinity, user_morpheus], '#3B82F6', 'active'),
    (crew_bravo, demo_org_id, 'Bravo Extraction', user_niobe, ARRAY[user_niobe, user_link], '#10B981', 'active');

  -- ============================================
  -- STEP 12: INSERT ZONES
  -- ============================================

  zone_downtown := gen_random_uuid();
  zone_industrial := gen_random_uuid();
  zone_residential := gen_random_uuid();

  INSERT INTO zones (id, org_id, name, region, description, color, status) VALUES
    (zone_downtown, demo_org_id, 'Downtown', 'Megacity Core', 'High-traffic area with multiple hardlines', '#EF4444', 'active'),
    (zone_industrial, demo_org_id, 'Industrial', 'Factory District', 'Sentinel patrol routes nearby', '#F59E0B', 'active'),
    (zone_residential, demo_org_id, 'Residential', 'Suburbs', 'Lower security, limited exit points', '#3B82F6', 'active');

  -- ============================================
  -- STEP 13: INSERT JOBS
  -- ============================================

  job1 := gen_random_uuid();
  job2 := gen_random_uuid();
  job3 := gen_random_uuid();

  INSERT INTO jobs (id, org_id, job_number, subject, description, account_id, assignee_id, crew_id, job_type, status, priority, zone, estimated_duration, scheduled_date) VALUES
    (job1, demo_org_id, 'J-2026-0001', 'Extract The Kid', 'Red pill candidate extraction', account_neb, user_neo, crew_alpha, 'Emergency', 'Scheduled', 'Urgent', 'Downtown', 2, CURRENT_DATE + INTERVAL '1 day'),
    (job2, demo_org_id, 'J-2026-0002', 'Logos Systems Check', 'Full diagnostic before mission', account_logos, user_niobe, crew_bravo, 'Inspection', 'InProgress', 'High', 'Industrial', 4, CURRENT_DATE),
    (job3, demo_org_id, 'J-2026-0003', 'EMP Installation - Hammer', 'Install and calibrate new EMP devices', account_hammer, user_link, crew_alpha, 'Install', 'Scheduled', 'Medium', 'Industrial', 6, CURRENT_DATE + INTERVAL '5 days');

  -- ============================================
  -- STEP 14: INSERT INVOICES
  -- ============================================

  invoice1 := gen_random_uuid();
  invoice2 := gen_random_uuid();
  invoice3 := gen_random_uuid();

  INSERT INTO invoices (id, org_id, invoice_number, account_id, deal_id, status, payment_status, invoice_date, issue_date, due_date, line_items, subtotal, tax_total, total) VALUES
    (invoice1, demo_org_id, 'INV-2026-0001', account_neb, deal_refit, 'Paid', 'paid', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, '[{"description": "Hull restoration", "qty": 1, "unitPrice": 450000, "taxRate": 10, "lineTotal": 495000}]'::jsonb, 450000, 45000, 495000),
    (invoice2, demo_org_id, 'INV-2026-0002', account_logos, NULL, 'Sent', 'unpaid', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', '[{"description": "Operator Support Q1", "qty": 3, "unitPrice": 8000, "taxRate": 10, "lineTotal": 26400}]'::jsonb, 24000, 2400, 26400),
    (invoice3, demo_org_id, 'INV-2026-0003', account_hammer, NULL, 'Overdue', 'unpaid', CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE - INTERVAL '15 days', '[{"description": "EMP Device x2", "qty": 2, "unitPrice": 250000, "taxRate": 10, "lineTotal": 550000}]'::jsonb, 500000, 50000, 550000);

  -- ============================================
  -- STEP 15: INSERT TASKS
  -- ============================================

  INSERT INTO tasks (id, org_id, title, description, assignee_id, due_date, status, priority, related_to_id, related_to_type) VALUES
    (gen_random_uuid(), demo_org_id, 'Complete Neo Combat Training', 'Upload remaining martial arts programs.', user_link, CURRENT_DATE + INTERVAL '2 days', 'In Progress', 'High', contact_neo, 'contacts'),
    (gen_random_uuid(), demo_org_id, 'Schedule Oracle Meeting', 'Arrange meeting with the Oracle.', user_morpheus, CURRENT_DATE + INTERVAL '7 days', 'Pending', 'High', lead_seraph, 'leads'),
    (gen_random_uuid(), demo_org_id, 'Follow up on Hammer Invoice', 'Contact Roland about overdue payment.', user_trinity, CURRENT_DATE - INTERVAL '2 days', 'Pending', 'Urgent', invoice3, 'invoices');

  -- ============================================
  -- STEP 16: INSERT TICKETS
  -- ============================================

  INSERT INTO tickets (id, org_id, ticket_number, subject, description, requester_id, account_id, status, priority, assignee_id) VALUES
    (gen_random_uuid(), demo_org_id, 'TKT-001', 'EMP Device Not Charging', 'EMP device shows 0% charge and wont power up.', contact_roland, account_hammer, 'Open', 'Urgent', user_link),
    (gen_random_uuid(), demo_org_id, 'TKT-002', 'Operator Console Flickering', 'Display keeps flickering during Matrix operations.', contact_ghost, account_logos, 'In Progress', 'High', user_link);

  -- ============================================
  -- STEP 17: INSERT EQUIPMENT
  -- ============================================

  INSERT INTO equipment (id, org_id, name, type, barcode, condition, location, assigned_to, last_service_date, next_service_date, purchase_date, purchase_price) VALUES
    (gen_random_uuid(), demo_org_id, 'Operator Console Alpha', 'Console', 'EQ-000001', 'Excellent', 'Nebuchadnezzar', user_link, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days', CURRENT_DATE - INTERVAL '365 days', 50000),
    (gen_random_uuid(), demo_org_id, 'Hovercraft Engine Unit', 'Engine', 'EQ-000002', 'Good', 'Zion Dock', NULL, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE - INTERVAL '500 days', 150000),
    (gen_random_uuid(), demo_org_id, 'EMP Charging Station', 'Charger', 'EQ-000003', 'Fair', 'Hammer', user_neo, CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '400 days', 25000);

  -- ============================================
  -- STEP 18: INSERT INVENTORY ITEMS
  -- ============================================

  INSERT INTO inventory_items (id, org_id, name, sku, warehouse_qty, reorder_point, category, unit_price) VALUES
    (gen_random_uuid(), demo_org_id, 'Red Pills', 'MED-RED', 47, 20, 'Medical', 999999),
    (gen_random_uuid(), demo_org_id, 'EMP Capacitors', 'WEAP-CAP', 15, 5, 'Weapons', 5000),
    (gen_random_uuid(), demo_org_id, 'Hardline Phones', 'COMM-HARD', 8, 10, 'Communications', 15000),
    (gen_random_uuid(), demo_org_id, 'Neural Interface Plugs', 'TECH-PLUG', 50, 20, 'Technology', 2500);

  -- ============================================
  -- STEP 19: INSERT CALENDAR EVENTS
  -- ============================================

  INSERT INTO calendar_events (id, org_id, title, description, start_time, end_time, type, location, related_to_type, related_to_id) VALUES
    (gen_random_uuid(), demo_org_id, 'Oracle Consultation', 'Meeting with the Oracle to discuss prophecy', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '1 hour', 'Meeting', 'Oracle Teahouse', 'leads', lead_seraph),
    (gen_random_uuid(), demo_org_id, 'Fleet Command Meeting', 'Quarterly strategy session with all captains', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '2 hours', 'Meeting', 'Zion Council Chambers', 'accounts', account_logos),
    (gen_random_uuid(), demo_org_id, 'Neo Training Session', 'Advanced combat training in the Construct', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '3 hours', 'Internal', 'Construct Loading Program', 'contacts', contact_neo);

  -- ============================================
  -- STEP 20: INSERT COMMUNICATIONS
  -- ============================================

  INSERT INTO communications (id, org_id, type, subject, content, direction, related_to_type, related_to_id, outcome) VALUES
    (gen_random_uuid(), demo_org_id, 'Call', 'Prophecy Discussion', 'Discussed latest prophecy interpretations with Morpheus.', 'Outbound', 'contacts', contact_morpheus, 'answered'),
    (gen_random_uuid(), demo_org_id, 'Email', 'Mission Briefing: Machine City', 'Attached mission parameters for upcoming reconnaissance.', 'Outbound', 'accounts', account_logos, 'answered'),
    (gen_random_uuid(), demo_org_id, 'SMS', 'Exit Point Confirmed', 'Hardline at 42nd & Main confirmed operational.', 'Outbound', 'leads', lead_kid, 'answered');

  -- ============================================
  -- STEP 21: INSERT REVIEWS
  -- ============================================

  INSERT INTO reviews (id, org_id, author_name, rating, content, platform, status, replied, reply_content, sentiment, account_id) VALUES
    (gen_random_uuid(), demo_org_id, 'Councillor Hamann', 5, 'The Nebuchadnezzar crew saved Zion. Outstanding service.', 'Google', 'Replied', true, 'Thank you, Councillor. The fight continues.', 'Positive', account_neb),
    (gen_random_uuid(), demo_org_id, 'Anonymous Freed Mind', 5, 'The red pill changed my life. Forever grateful to Morpheus.', 'Facebook', 'New', false, NULL, 'Positive', NULL),
    (gen_random_uuid(), demo_org_id, 'Commander Lock', 3, 'Morpheus takes too many risks. Results are mixed.', 'Internal', 'Escalated', false, NULL, 'Neutral', NULL);

  -- ============================================
  -- STEP 22: INSERT WAREHOUSES
  -- ============================================

  INSERT INTO warehouses (id, org_id, name, location, capacity, status, is_default) VALUES
    (gen_random_uuid(), demo_org_id, 'Zion Main Warehouse', 'Dock Level 3, Zion', 10000, 'active', true),
    (gen_random_uuid(), demo_org_id, 'Nebuchadnezzar Storage', 'Cargo Bay, Nebuchadnezzar', 500, 'active', false);

  -- ============================================
  -- STEP 23: INSERT REFERRAL REWARDS
  -- ============================================

  INSERT INTO referral_rewards (id, org_id, referrer_id, referred_lead_id, reward_amount, status, payout_date, notes) VALUES
    (gen_random_uuid(), demo_org_id, contact_morpheus, lead_kid, 500, 'Active', NULL, 'The Kid was referred by Morpheus after the dock battle'),
    (gen_random_uuid(), demo_org_id, contact_trinity, lead_seraph, 750, 'Pending Payout', CURRENT_DATE + INTERVAL '7 days', 'Seraph met Trinity at the Oracles apartment'),
    (gen_random_uuid(), demo_org_id, contact_neo, NULL, 1000, 'Paid', CURRENT_DATE - INTERVAL '30 days', 'Successful conversion - Oracle referral');

  -- ============================================
  -- STEP 24: INSERT INBOUND FORMS
  -- ============================================

  INSERT INTO inbound_forms (id, org_id, name, type, fields, submit_button_text, success_message, target_campaign_id, submission_count, conversion_rate, status) VALUES
    (gen_random_uuid(), demo_org_id, 'Contact Request', 'Contact',
     '[{"id":"name","label":"Full Name","type":"text","required":true},{"id":"email","label":"Email","type":"email","required":true},{"id":"phone","label":"Phone","type":"phone","required":false},{"id":"message","label":"Message","type":"textarea","required":true}]'::jsonb,
     'Submit Request', 'Thank you! An operator will contact you shortly.', campaign_redpill, 147, 23.5, 'Active'),
    (gen_random_uuid(), demo_org_id, 'Quote Request', 'Quote Request',
     '[{"id":"name","label":"Name","type":"text","required":true},{"id":"email","label":"Email","type":"email","required":true},{"id":"ship","label":"Ship Name","type":"text","required":true},{"id":"service","label":"Service Type","type":"select","required":true,"options":["Hovercraft Maintenance","Combat Training","Sentinel Watch","Operator Support"]}]'::jsonb,
     'Get Quote', 'We will prepare your quote within 24 hours.', NULL, 52, 45.2, 'Active'),
    (gen_random_uuid(), demo_org_id, 'Awakening Interest', 'Lead',
     '[{"id":"name","label":"What is your name?","type":"text","required":true},{"id":"reality","label":"Do you sense something wrong with the world?","type":"select","required":true,"options":["Yes, constantly","Sometimes","Not sure","No"]}]'::jsonb,
     'Take the Red Pill', 'You are ready. An agent will contact you.', campaign_redpill, 892, 12.8, 'Active');

  -- ============================================
  -- STEP 25: INSERT CHAT WIDGETS
  -- ============================================

  INSERT INTO chat_widgets (id, org_id, name, page, bubble_color, welcome_message, is_active, status, routing_user_id, conversations, avg_response_time) VALUES
    (gen_random_uuid(), demo_org_id, 'Main Support Widget', 'All Pages', '#3B82F6', 'Welcome to Zion Command. How can we assist you today?', true, 'Active', user_link, 234, 45),
    (gen_random_uuid(), demo_org_id, 'Sales Chat', 'Pricing Page', '#10B981', 'Interested in our services? Let me help you find the right solution.', true, 'Active', user_trinity, 89, 30),
    (gen_random_uuid(), demo_org_id, 'After Hours Bot', 'All Pages', '#8B5CF6', 'Our operators are currently in the Matrix. Leave a message and we will contact you.', false, 'Inactive', user_link, 12, 0);

  -- ============================================
  -- STEP 26: INSERT CALCULATORS
  -- ============================================

  INSERT INTO calculators (id, org_id, name, type, base_rate, is_active, status, usage_count, lead_conversion_rate) VALUES
    (gen_random_uuid(), demo_org_id, 'Freedom ROI Calculator', 'ROI', 15.5, true, 'Active', 1245, 8.5),
    (gen_random_uuid(), demo_org_id, 'Hovercraft Loan Calculator', 'Repayment', 5.25, true, 'Active', 324, 12.3),
    (gen_random_uuid(), demo_org_id, 'EMP Yield Estimator', 'SolarYield', 18.0, false, 'Inactive', 45, 0);

  -- ============================================
  -- STEP 27: INSERT SUBSCRIPTIONS
  -- ============================================

  INSERT INTO subscriptions (id, org_id, account_id, name, status, billing_cycle, next_bill_date, start_date, items, auto_generate_invoice, mrr) VALUES
    (gen_random_uuid(), demo_org_id, account_neb, 'Nebuchadnezzar Operations Package', 'Active', 'monthly', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE - INTERVAL '45 days',
     '[{"itemType":"service","description":"Operator Support","qty":1,"unitPrice":8000,"taxRate":10},{"itemType":"service","description":"Sentinel Watch","qty":1,"unitPrice":10000,"taxRate":0}]'::jsonb,
     true, 18000),
    (gen_random_uuid(), demo_org_id, account_logos, 'Logos Premium Support', 'Active', 'monthly', CURRENT_DATE + INTERVAL '22 days', CURRENT_DATE - INTERVAL '60 days',
     '[{"itemType":"service","description":"Operator Support","qty":1,"unitPrice":8000,"taxRate":10}]'::jsonb,
     true, 8000),
    (gen_random_uuid(), demo_org_id, account_hammer, 'Hammer Defense Package', 'Paused', 'yearly', CURRENT_DATE + INTERVAL '120 days', CURRENT_DATE - INTERVAL '245 days',
     '[{"itemType":"service","description":"Sentinel Watch Annual","qty":1,"unitPrice":120000,"taxRate":0}]'::jsonb,
     true, 10000);

  -- ============================================
  -- STEP 28: INSERT QUOTES
  -- ============================================

  INSERT INTO quotes (id, org_id, quote_number, account_id, status, issue_date, expiry_date, line_items, subtotal, tax_total, total, notes, version) VALUES
    (gen_random_uuid(), demo_org_id, 'Q-2026-0001', account_hammer, 'Sent', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days',
     '[{"itemType":"product","description":"EMP Device","qty":3,"unitPrice":250000,"taxRate":10,"lineTotal":825000},{"itemType":"service","description":"Installation","qty":1,"unitPrice":50000,"taxRate":10,"lineTotal":55000}]'::jsonb,
     800000, 80000, 880000, 'Quote for Hammer EMP upgrade project', 1),
    (gen_random_uuid(), demo_org_id, 'Q-2026-0002', account_logos, 'Draft', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days',
     '[{"itemType":"service","description":"Combat Training Upload - Full Package","qty":4,"unitPrice":25000,"taxRate":10,"lineTotal":110000}]'::jsonb,
     100000, 10000, 110000, 'Crew training for Logos team', 1),
    (gen_random_uuid(), demo_org_id, 'Q-2026-0003', account_neb, 'Accepted', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE + INTERVAL '10 days',
     '[{"itemType":"product","description":"Hardline Phone","qty":5,"unitPrice":15000,"taxRate":10,"lineTotal":82500}]'::jsonb,
     75000, 7500, 82500, 'Replacement hardline devices', 1);

  -- ============================================
  -- STEP 29: INSERT EXPENSES
  -- ============================================

  INSERT INTO expenses (id, org_id, vendor, amount, category, date, status, approved_by) VALUES
    (gen_random_uuid(), demo_org_id, 'Zion Dock Services', 45000, 'Materials', CURRENT_DATE - INTERVAL '10 days', 'Paid', user_morpheus),
    (gen_random_uuid(), demo_org_id, 'Fuel Depot Alpha', 12500, 'Fuel', CURRENT_DATE - INTERVAL '5 days', 'Paid', user_niobe),
    (gen_random_uuid(), demo_org_id, 'Matrix Tech Supply', 28000, 'Materials', CURRENT_DATE - INTERVAL '2 days', 'Pending', NULL),
    (gen_random_uuid(), demo_org_id, 'Zion Command Rent', 15000, 'Rent', CURRENT_DATE - INTERVAL '30 days', 'Paid', user_morpheus);

  -- ============================================
  -- STEP 30: INSERT BANK TRANSACTIONS
  -- ============================================

  INSERT INTO bank_transactions (id, org_id, date, description, amount, type, status, match_confidence, reconciled, bank_reference) VALUES
    (gen_random_uuid(), demo_org_id, CURRENT_DATE - INTERVAL '1 day', 'PAYMENT - NEBUCHADNEZZAR', 495000, 'Credit', 'matched', 'green', true, 'REF-001234'),
    (gen_random_uuid(), demo_org_id, CURRENT_DATE - INTERVAL '2 days', 'ZION DOCK SERVICES', -45000, 'Debit', 'matched', 'green', true, 'REF-001235'),
    (gen_random_uuid(), demo_org_id, CURRENT_DATE - INTERVAL '3 days', 'UNKNOWN TRANSFER', 8800, 'Credit', 'unmatched', 'amber', false, 'REF-001236'),
    (gen_random_uuid(), demo_org_id, CURRENT_DATE - INTERVAL '5 days', 'FUEL DEPOT ALPHA', -12500, 'Debit', 'matched', 'green', true, 'REF-001237'),
    (gen_random_uuid(), demo_org_id, CURRENT_DATE, 'PENDING DEPOSIT', 26400, 'Credit', 'unmatched', 'none', false, 'REF-001238');

  -- ============================================
  -- STEP 31: INSERT PURCHASE ORDERS
  -- ============================================

  INSERT INTO purchase_orders (id, org_id, po_number, supplier_id, account_id, status, items, total, expected_delivery) VALUES
    (gen_random_uuid(), demo_org_id, 'PO-2026-0001', NULL, account_hammer, 'Ordered',
     '[{"sku":"WEAP-EMP","name":"EMP Device","qty":2,"price":250000}]'::jsonb,
     500000, CURRENT_DATE + INTERVAL '14 days'),
    (gen_random_uuid(), demo_org_id, 'PO-2026-0002', NULL, account_neb, 'Delivered',
     '[{"sku":"HARD-PHONE","name":"Hardline Phone","qty":5,"price":15000}]'::jsonb,
     75000, CURRENT_DATE - INTERVAL '3 days'),
    (gen_random_uuid(), demo_org_id, 'PO-2026-0003', NULL, account_logos, 'Draft',
     '[{"sku":"WEAP-CAP","name":"EMP Capacitors","qty":10,"price":5000}]'::jsonb,
     50000, NULL);

  -- ============================================
  -- STEP 32: INSERT AUTOMATION WORKFLOWS
  -- ============================================

  INSERT INTO automation_workflows (id, org_id, name, description, trigger, nodes, is_active, execution_count, last_run_at, category) VALUES
    (gen_random_uuid(), demo_org_id, 'New Lead Welcome', 'Sends welcome email when a new lead is created',
     '{"type":"RecordCreated","entity":"leads","config":{}}'::jsonb,
     '[{"id":"1","type":"Action","actionType":"SendEmail","config":{"template":"welcome"}}]'::jsonb,
     true, 47, NOW() - INTERVAL '2 hours', 'Sales'),
    (gen_random_uuid(), demo_org_id, 'Overdue Invoice Reminder', 'Sends reminder 3 days after invoice due date',
     '{"type":"DateArrived","entity":"invoices","config":{"field":"dueDate","offset":3}}'::jsonb,
     '[{"id":"1","type":"Action","actionType":"SendEmail","config":{"template":"overdue_reminder"}}]'::jsonb,
     true, 12, NOW() - INTERVAL '1 day', 'Operations'),
    (gen_random_uuid(), demo_org_id, 'High Priority Ticket Alert', 'Notifies team when urgent ticket is created',
     '{"type":"RecordCreated","entity":"tickets","config":{"filter":{"priority":"Urgent"}}}'::jsonb,
     '[{"id":"1","type":"Action","actionType":"SendSMS","config":{"to":"assignee"}}]'::jsonb,
     true, 5, NOW() - INTERVAL '4 hours', 'Operations');

  -- ============================================
  -- STEP 33: INSERT WEBHOOKS
  -- ============================================

  INSERT INTO webhooks (id, org_id, name, url, method, headers, is_active, trigger_event, last_triggered_at, success_count, failure_count) VALUES
    (gen_random_uuid(), demo_org_id, 'Slack New Lead', 'https://hooks.slack.com/services/XXXXX', 'POST',
     '{"Content-Type":"application/json"}'::jsonb,
     true, 'leads.created', NOW() - INTERVAL '3 hours', 145, 2),
    (gen_random_uuid(), demo_org_id, 'Accounting Sync', 'https://accounting.zion.local/api/sync', 'POST',
     '{"Authorization":"Bearer xxxx","Content-Type":"application/json"}'::jsonb,
     true, 'invoices.paid', NOW() - INTERVAL '1 day', 89, 0);

  -- ============================================
  -- STEP 34: INSERT CONVERSATIONS & MESSAGES
  -- ============================================

  INSERT INTO conversations (id, org_id, participant_ids, name, is_system, last_message_at) VALUES
    (gen_random_uuid(), demo_org_id, ARRAY[user_neo, user_trinity, user_morpheus, user_niobe, user_link], 'General', true, NOW() - INTERVAL '5 minutes'),
    (gen_random_uuid(), demo_org_id, ARRAY[user_neo, user_trinity, user_morpheus], 'Sales Team', true, NOW() - INTERVAL '2 hours');

  -- ============================================
  -- STEP 35: INSERT NOTIFICATIONS
  -- ============================================

  INSERT INTO notifications (id, org_id, user_id, title, message, type, read, link) VALUES
    (gen_random_uuid(), demo_org_id, user_neo, 'New Lead Assigned', 'The Kid has been assigned to you as a new lead.', 'info', false, '/leads'),
    (gen_random_uuid(), demo_org_id, user_trinity, 'Invoice Overdue', 'Invoice INV-2026-0003 for Hammer is now overdue.', 'warning', false, '/financials/ledger/income'),
    (gen_random_uuid(), demo_org_id, user_morpheus, 'Deal Won!', 'Nebuchadnezzar Refit Contract has been closed as won!', 'success', true, '/deals'),
    (gen_random_uuid(), demo_org_id, user_link, 'Urgent Ticket', 'EMP Device Not Charging requires immediate attention.', 'urgent', false, '/ops/support-inbox');

  -- ============================================
  -- STEP 36: INSERT DOCUMENTS
  -- ============================================

  INSERT INTO documents (id, org_id, title, file_type, file_size, url, related_to_type, related_to_id) VALUES
    (gen_random_uuid(), demo_org_id, 'Nebuchadnezzar Schematic', 'pdf', '2.4 MB', 'https://storage.zion.local/docs/neb-schematic.pdf', 'accounts', account_neb),
    (gen_random_uuid(), demo_org_id, 'EMP Installation Guide', 'pdf', '1.8 MB', 'https://storage.zion.local/docs/emp-guide.pdf', 'products', NULL),
    (gen_random_uuid(), demo_org_id, 'Combat Training Certificate - Neo', 'pdf', '156 KB', 'https://storage.zion.local/docs/neo-cert.pdf', 'contacts', contact_neo);

  RETURN 'Demo organization reset successfully with ALL modules at ' || NOW()::TEXT;
END;
$$;

-- Create a scheduled job to run daily at midnight UTC (requires pg_cron extension)
-- This is commented out because pg_cron needs to be enabled in Supabase Dashboard
-- SELECT cron.schedule('reset-demo-daily', '0 0 * * *', 'SELECT reset_demo_organization()');

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION reset_demo_organization() TO anon;
GRANT EXECUTE ON FUNCTION reset_demo_organization() TO authenticated;

-- Create an RPC endpoint that can be called from the client
COMMENT ON FUNCTION reset_demo_organization() IS 'Resets the demo organization to its initial state. Call via supabase.rpc("reset_demo_organization")';
