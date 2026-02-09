-- ============================================
-- COMPLETE SEED DATA FOR ALL MODULES
-- Run this AFTER ADD_MISSING_TABLES.sql
-- Provides Matrix-themed data for ALL CRM modules
-- ============================================

-- Demo org ID
DO $$
DECLARE
  demo_org_id UUID := '00000000-0000-0000-0000-000000000001';
  user_neo UUID;
  user_trinity UUID;
  user_morpheus UUID;
  user_niobe UUID;
  user_link UUID;
  contact_morpheus UUID;
  contact_neo UUID;
  contact_trinity UUID;
  contact_tank UUID;
  contact_niobe UUID;
  lead_kid UUID;
  lead_seraph UUID;
  account_neb UUID;
  account_logos UUID;
  account_hammer UUID;
  campaign_redpill UUID;
  conv_general UUID;
  conv_sales UUID;
  form_contact UUID;
  form_quote UUID;
  widget_main UUID;
  calc_roi UUID;
  subscription1 UUID;
  invoice1 UUID;
BEGIN
  -- Get existing user IDs (created by reset_demo.sql)
  SELECT id INTO user_neo FROM users WHERE org_id = demo_org_id AND email = 'neo@demo.catchacrm.com' LIMIT 1;
  SELECT id INTO user_trinity FROM users WHERE org_id = demo_org_id AND email = 'trinity@demo.catchacrm.com' LIMIT 1;
  SELECT id INTO user_morpheus FROM users WHERE org_id = demo_org_id AND email = 'morpheus@demo.catchacrm.com' LIMIT 1;
  SELECT id INTO user_niobe FROM users WHERE org_id = demo_org_id AND email = 'niobe@demo.catchacrm.com' LIMIT 1;
  SELECT id INTO user_link FROM users WHERE org_id = demo_org_id AND email = 'link@demo.catchacrm.com' LIMIT 1;

  -- Get existing contact IDs
  SELECT id INTO contact_morpheus FROM contacts WHERE org_id = demo_org_id AND name = 'Morpheus' LIMIT 1;
  SELECT id INTO contact_neo FROM contacts WHERE org_id = demo_org_id AND name = 'Neo' LIMIT 1;
  SELECT id INTO contact_trinity FROM contacts WHERE org_id = demo_org_id AND name = 'Trinity' LIMIT 1;
  SELECT id INTO contact_tank FROM contacts WHERE org_id = demo_org_id AND name = 'Tank' LIMIT 1;
  SELECT id INTO contact_niobe FROM contacts WHERE org_id = demo_org_id AND name = 'Niobe' LIMIT 1;

  -- Get existing lead IDs
  SELECT id INTO lead_kid FROM leads WHERE org_id = demo_org_id AND name = 'The Kid' LIMIT 1;
  SELECT id INTO lead_seraph FROM leads WHERE org_id = demo_org_id AND name = 'Seraph' LIMIT 1;

  -- Get existing account IDs
  SELECT id INTO account_neb FROM accounts WHERE org_id = demo_org_id AND name = 'Nebuchadnezzar' LIMIT 1;
  SELECT id INTO account_logos FROM accounts WHERE org_id = demo_org_id AND name = 'Logos' LIMIT 1;
  SELECT id INTO account_hammer FROM accounts WHERE org_id = demo_org_id AND name = 'Mjolnir (Hammer)' LIMIT 1;

  -- Get existing campaign IDs
  SELECT id INTO campaign_redpill FROM campaigns WHERE org_id = demo_org_id AND name = 'Red Pill Initiative' LIMIT 1;

  -- Get existing invoice ID
  SELECT id INTO invoice1 FROM invoices WHERE org_id = demo_org_id LIMIT 1;

  -- ============================================
  -- REFERRAL REWARDS (for Referral Engine)
  -- ============================================

  DELETE FROM referral_rewards WHERE org_id = demo_org_id;

  INSERT INTO referral_rewards (id, org_id, referrer_id, referred_lead_id, reward_amount, status, payout_date, notes) VALUES
    (gen_random_uuid(), demo_org_id, contact_morpheus, lead_kid, 500, 'Active', NULL, 'The Kid was referred by Morpheus after the dock battle'),
    (gen_random_uuid(), demo_org_id, contact_trinity, lead_seraph, 750, 'Pending Payout', CURRENT_DATE + INTERVAL '7 days', 'Seraph met Trinity at the Oracle''s apartment'),
    (gen_random_uuid(), demo_org_id, contact_neo, NULL, 1000, 'Paid', CURRENT_DATE - INTERVAL '30 days', 'Successful conversion - Oracle referral');

  -- ============================================
  -- INBOUND FORMS (for Inbound Engine)
  -- ============================================

  DELETE FROM inbound_forms WHERE org_id = demo_org_id;

  form_contact := gen_random_uuid();
  form_quote := gen_random_uuid();

  INSERT INTO inbound_forms (id, org_id, name, type, fields, submit_button_text, success_message, target_campaign_id, submission_count, conversion_rate, status) VALUES
    (form_contact, demo_org_id, 'Contact Request', 'Contact',
     '[{"id":"name","label":"Full Name","type":"text","required":true},{"id":"email","label":"Email","type":"email","required":true},{"id":"phone","label":"Phone","type":"phone","required":false},{"id":"message","label":"Message","type":"textarea","required":true}]'::jsonb,
     'Submit Request', 'Thank you! An operator will contact you shortly.', campaign_redpill, 147, 23.5, 'Active'),
    (form_quote, demo_org_id, 'Quote Request', 'Quote Request',
     '[{"id":"name","label":"Name","type":"text","required":true},{"id":"email","label":"Email","type":"email","required":true},{"id":"ship","label":"Ship Name","type":"text","required":true},{"id":"service","label":"Service Type","type":"select","required":true,"options":["Hovercraft Maintenance","Combat Training","Sentinel Watch","Operator Support"]}]'::jsonb,
     'Get Quote', 'We will prepare your quote within 24 hours.', NULL, 52, 45.2, 'Active'),
    (gen_random_uuid(), demo_org_id, 'Awakening Interest', 'Lead',
     '[{"id":"name","label":"What is your name?","type":"text","required":true},{"id":"reality","label":"Do you sense something wrong with the world?","type":"select","required":true,"options":["Yes, constantly","Sometimes","Not sure","No"]}]'::jsonb,
     'Take the Red Pill', 'You are ready. An agent will contact you.', campaign_redpill, 892, 12.8, 'Active');

  -- ============================================
  -- CHAT WIDGETS (for Inbound Engine)
  -- ============================================

  DELETE FROM chat_widgets WHERE org_id = demo_org_id;

  widget_main := gen_random_uuid();

  INSERT INTO chat_widgets (id, org_id, name, page, bubble_color, welcome_message, is_active, status, routing_user_id, conversations, avg_response_time) VALUES
    (widget_main, demo_org_id, 'Main Support Widget', 'All Pages', '#3B82F6', 'Welcome to Zion Command. How can we assist you today?', true, 'Active', user_link, 234, 45),
    (gen_random_uuid(), demo_org_id, 'Sales Chat', 'Pricing Page', '#10B981', 'Interested in our services? Let me help you find the right solution.', true, 'Active', user_trinity, 89, 30),
    (gen_random_uuid(), demo_org_id, 'After Hours Bot', 'All Pages', '#8B5CF6', 'Our operators are currently in the Matrix. Leave a message and we will contact you.', false, 'Inactive', user_link, 12, 0);

  -- ============================================
  -- CALCULATORS (for Inbound Engine)
  -- ============================================

  DELETE FROM calculators WHERE org_id = demo_org_id;

  calc_roi := gen_random_uuid();

  INSERT INTO calculators (id, org_id, name, type, base_rate, is_active, status, usage_count, lead_conversion_rate) VALUES
    (calc_roi, demo_org_id, 'Freedom ROI Calculator', 'ROI', 15.5, true, 'Active', 1245, 8.5),
    (gen_random_uuid(), demo_org_id, 'Hovercraft Loan Calculator', 'Repayment', 5.25, true, 'Active', 324, 12.3),
    (gen_random_uuid(), demo_org_id, 'EMP Yield Estimator', 'SolarYield', 18.0, false, 'Inactive', 45, 0);

  -- ============================================
  -- SUBSCRIPTIONS (for Billing)
  -- ============================================

  DELETE FROM subscriptions WHERE org_id = demo_org_id;

  subscription1 := gen_random_uuid();

  INSERT INTO subscriptions (id, org_id, account_id, name, status, billing_cycle, next_bill_date, start_date, items, auto_generate_invoice, mrr) VALUES
    (subscription1, demo_org_id, account_neb, 'Nebuchadnezzar Operations Package', 'Active', 'monthly', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE - INTERVAL '45 days',
     '[{"itemType":"service","description":"Operator Support","qty":1,"unitPrice":8000,"taxRate":10},{"itemType":"service","description":"Sentinel Watch","qty":1,"unitPrice":10000,"taxRate":0}]'::jsonb,
     true, 18000),
    (gen_random_uuid(), demo_org_id, account_logos, 'Logos Premium Support', 'Active', 'monthly', CURRENT_DATE + INTERVAL '22 days', CURRENT_DATE - INTERVAL '60 days',
     '[{"itemType":"service","description":"Operator Support","qty":1,"unitPrice":8000,"taxRate":10}]'::jsonb,
     true, 8000),
    (gen_random_uuid(), demo_org_id, account_hammer, 'Hammer Defense Package', 'Paused', 'yearly', CURRENT_DATE + INTERVAL '120 days', CURRENT_DATE - INTERVAL '245 days',
     '[{"itemType":"service","description":"Sentinel Watch Annual","qty":1,"unitPrice":120000,"taxRate":0}]'::jsonb,
     true, 10000);

  -- ============================================
  -- PAYMENTS (for payment tracking)
  -- ============================================

  DELETE FROM payments WHERE org_id = demo_org_id;

  INSERT INTO payments (id, org_id, invoice_id, amount, method, status, reference, paid_at, notes) VALUES
    (gen_random_uuid(), demo_org_id, invoice1, 495000, 'bank_transfer', 'completed', 'ZION-TXN-001', CURRENT_DATE - INTERVAL '25 days', 'Payment received from Nebuchadnezzar'),
    (gen_random_uuid(), demo_org_id, NULL, 8800, 'card', 'completed', 'STRIPE-PI-002', CURRENT_DATE - INTERVAL '15 days', 'Monthly subscription - Logos'),
    (gen_random_uuid(), demo_org_id, NULL, 5000, 'cash', 'completed', NULL, CURRENT_DATE - INTERVAL '5 days', 'Partial payment - Vigilant');

  -- ============================================
  -- CONVERSATIONS (for Team Chat)
  -- ============================================

  DELETE FROM chat_messages WHERE org_id = demo_org_id;
  DELETE FROM conversations WHERE org_id = demo_org_id;

  conv_general := gen_random_uuid();
  conv_sales := gen_random_uuid();

  INSERT INTO conversations (id, org_id, participant_ids, name, is_system, last_message_at) VALUES
    (conv_general, demo_org_id, ARRAY[user_neo, user_trinity, user_morpheus, user_niobe, user_link], 'General', true, NOW() - INTERVAL '5 minutes'),
    (conv_sales, demo_org_id, ARRAY[user_neo, user_trinity, user_morpheus], 'Sales Team', true, NOW() - INTERVAL '2 hours'),
    (gen_random_uuid(), demo_org_id, ARRAY[user_neo, user_trinity], NULL, false, NOW() - INTERVAL '1 day');

  -- ============================================
  -- CHAT MESSAGES (for Team Chat)
  -- ============================================

  INSERT INTO chat_messages (id, org_id, conversation_id, sender_id, content, read_by) VALUES
    (gen_random_uuid(), demo_org_id, conv_general, user_morpheus, 'The Oracle has requested a meeting. Who is available?', ARRAY[user_neo, user_trinity, user_link]),
    (gen_random_uuid(), demo_org_id, conv_general, user_neo, 'I can go. When does she want to meet?', ARRAY[user_morpheus, user_trinity, user_link]),
    (gen_random_uuid(), demo_org_id, conv_general, user_trinity, 'I will come with you. Link, prepare the loading program.', ARRAY[user_morpheus, user_neo, user_link]),
    (gen_random_uuid(), demo_org_id, conv_general, user_link, 'Loading program ready. Hardline confirmed at 42nd and Main.', ARRAY[user_morpheus, user_neo, user_trinity]),
    (gen_random_uuid(), demo_org_id, conv_sales, user_morpheus, 'The Hammer deal is progressing. Roland wants to upgrade their EMP array.', ARRAY[user_neo]),
    (gen_random_uuid(), demo_org_id, conv_sales, user_neo, 'I can prepare a proposal. What is their budget?', ARRAY[user_morpheus]);

  -- ============================================
  -- QUOTES (seed data)
  -- ============================================

  DELETE FROM quotes WHERE org_id = demo_org_id;

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
  -- EXPENSES (seed data)
  -- ============================================

  DELETE FROM expenses WHERE org_id = demo_org_id;

  INSERT INTO expenses (id, org_id, vendor, amount, category, date, status, approved_by) VALUES
    (gen_random_uuid(), demo_org_id, 'Zion Dock Services', 45000, 'Materials', CURRENT_DATE - INTERVAL '10 days', 'Paid', user_morpheus),
    (gen_random_uuid(), demo_org_id, 'Fuel Depot Alpha', 12500, 'Fuel', CURRENT_DATE - INTERVAL '5 days', 'Paid', user_niobe),
    (gen_random_uuid(), demo_org_id, 'Matrix Tech Supply', 28000, 'Materials', CURRENT_DATE - INTERVAL '2 days', 'Pending', NULL),
    (gen_random_uuid(), demo_org_id, 'Zion Command Rent', 15000, 'Rent', CURRENT_DATE - INTERVAL '30 days', 'Paid', user_morpheus);

  -- ============================================
  -- BANK TRANSACTIONS (seed data)
  -- ============================================

  DELETE FROM bank_transactions WHERE org_id = demo_org_id;

  INSERT INTO bank_transactions (id, org_id, date, description, amount, type, status, match_confidence, reconciled, bank_reference) VALUES
    (gen_random_uuid(), demo_org_id, CURRENT_DATE - INTERVAL '1 day', 'PAYMENT - NEBUCHADNEZZAR', 495000, 'Credit', 'matched', 'green', true, 'REF-001234'),
    (gen_random_uuid(), demo_org_id, CURRENT_DATE - INTERVAL '2 days', 'ZION DOCK SERVICES', -45000, 'Debit', 'matched', 'green', true, 'REF-001235'),
    (gen_random_uuid(), demo_org_id, CURRENT_DATE - INTERVAL '3 days', 'UNKNOWN TRANSFER', 8800, 'Credit', 'unmatched', 'amber', false, 'REF-001236'),
    (gen_random_uuid(), demo_org_id, CURRENT_DATE - INTERVAL '5 days', 'FUEL DEPOT ALPHA', -12500, 'Debit', 'matched', 'green', true, 'REF-001237'),
    (gen_random_uuid(), demo_org_id, CURRENT_DATE, 'PENDING DEPOSIT', 26400, 'Credit', 'unmatched', 'none', false, 'REF-001238');

  -- ============================================
  -- PURCHASE ORDERS (seed data)
  -- ============================================

  DELETE FROM purchase_orders WHERE org_id = demo_org_id;

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
  -- AUTOMATION WORKFLOWS (for Settings > Automation)
  -- ============================================

  DELETE FROM automation_workflows WHERE org_id = demo_org_id;

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
     true, 5, NOW() - INTERVAL '4 hours', 'Operations'),
    (gen_random_uuid(), demo_org_id, 'Deal Won Webhook', 'Posts to n8n when a deal is won',
     '{"type":"FieldUpdated","entity":"deals","config":{"field":"stage","value":"Closed Won"}}'::jsonb,
     '[{"id":"1","type":"Action","actionType":"Webhook","config":{"url":"https://n8n.zion.local/webhook/deal-won"}}]'::jsonb,
     false, 0, NULL, 'Sales');

  -- ============================================
  -- WEBHOOKS (for Settings > Automation)
  -- ============================================

  DELETE FROM webhooks WHERE org_id = demo_org_id;

  INSERT INTO webhooks (id, org_id, name, url, method, headers, is_active, trigger_event, last_triggered_at, success_count, failure_count) VALUES
    (gen_random_uuid(), demo_org_id, 'Slack New Lead', 'https://hooks.slack.com/services/XXXXX', 'POST',
     '{"Content-Type":"application/json"}'::jsonb,
     true, 'leads.created', NOW() - INTERVAL '3 hours', 145, 2),
    (gen_random_uuid(), demo_org_id, 'Accounting Sync', 'https://accounting.zion.local/api/sync', 'POST',
     '{"Authorization":"Bearer xxxx","Content-Type":"application/json"}'::jsonb,
     true, 'invoices.paid', NOW() - INTERVAL '1 day', 89, 0),
    (gen_random_uuid(), demo_org_id, 'CRM Backup', 'https://backup.zion.local/api/snapshot', 'POST',
     '{"X-API-Key":"backup-key-123"}'::jsonb,
     false, 'system.daily', NOW() - INTERVAL '7 days', 30, 5);

  -- ============================================
  -- NOTIFICATIONS (system notifications)
  -- ============================================

  DELETE FROM notifications WHERE org_id = demo_org_id;

  INSERT INTO notifications (id, org_id, user_id, title, message, type, read, link) VALUES
    (gen_random_uuid(), demo_org_id, user_neo, 'New Lead Assigned', 'The Kid has been assigned to you as a new lead.', 'info', false, '/leads'),
    (gen_random_uuid(), demo_org_id, user_trinity, 'Invoice Overdue', 'Invoice INV-2026-0003 for Hammer is now overdue.', 'warning', false, '/financials/ledger/income'),
    (gen_random_uuid(), demo_org_id, user_morpheus, 'Deal Won!', 'Nebuchadnezzar Refit Contract has been closed as won!', 'success', true, '/deals'),
    (gen_random_uuid(), demo_org_id, user_link, 'Urgent Ticket', 'EMP Device Not Charging requires immediate attention.', 'urgent', false, '/ops/support-inbox'),
    (gen_random_uuid(), demo_org_id, user_niobe, 'Meeting Reminder', 'Fleet Command Meeting starts in 1 hour.', 'info', true, '/calendar');

  -- ============================================
  -- DOCUMENTS (file attachments)
  -- ============================================

  DELETE FROM documents WHERE org_id = demo_org_id;

  INSERT INTO documents (id, org_id, title, file_type, file_size, url, related_to_type, related_to_id) VALUES
    (gen_random_uuid(), demo_org_id, 'Nebuchadnezzar Schematic', 'pdf', '2.4 MB', 'https://storage.zion.local/docs/neb-schematic.pdf', 'accounts', account_neb),
    (gen_random_uuid(), demo_org_id, 'EMP Installation Guide', 'pdf', '1.8 MB', 'https://storage.zion.local/docs/emp-guide.pdf', 'products', NULL),
    (gen_random_uuid(), demo_org_id, 'Combat Training Certificate - Neo', 'pdf', '156 KB', 'https://storage.zion.local/docs/neo-cert.pdf', 'contacts', contact_neo);

  RAISE NOTICE '✅ Complete seed data inserted for ALL modules!';
  RAISE NOTICE '📊 Modules with data: Marketing (Referrals, Forms, Widgets, Calculators), Financials (Subscriptions, Payments, Quotes, Expenses, Bank), Operations (Chat, Notifications), System (Workflows, Webhooks, Documents)';
END $$;
