-- SEED DATA FOR REMAINING EMPTY TABLES
-- Run this in Supabase SQL Editor after SEED_DATA_DIRECT.sql

DO $$
DECLARE
  demo_org_id UUID := '00000000-0000-0000-0000-000000000001';
  user_neo UUID;
  user_trinity UUID;
  user_morpheus UUID;
  conv_general UUID;
  invoice1 UUID;
BEGIN
  -- Get existing user IDs
  SELECT id INTO user_neo FROM users WHERE org_id = demo_org_id AND name = 'Neo Anderson' LIMIT 1;
  SELECT id INTO user_trinity FROM users WHERE org_id = demo_org_id AND name = 'Trinity' LIMIT 1;
  SELECT id INTO user_morpheus FROM users WHERE org_id = demo_org_id AND name = 'Morpheus' LIMIT 1;
  SELECT id INTO conv_general FROM conversations WHERE org_id = demo_org_id AND name = 'General' LIMIT 1;
  SELECT id INTO invoice1 FROM invoices WHERE org_id = demo_org_id AND invoice_number = 'INV-2026-0001' LIMIT 1;

  -- INDUSTRY TEMPLATES
  INSERT INTO industry_templates (id, org_id, name, target_entity, industry, sections, is_active, version, created_at, updated_at) VALUES
    (gen_random_uuid(), demo_org_id, 'Solar Installation Template', 'deals', 'Solar',
     '[{"id":"site","title":"Site Assessment","fields":[{"id":"roof_type","label":"Roof Type","type":"select","options":["Tile","Metal","Flat"],"required":true},{"id":"panel_count","label":"Panel Count","type":"number","required":true}]}]'::jsonb,
     true, 1, NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'HVAC Service Template', 'jobs', 'HVAC',
     '[{"id":"system","title":"System Details","fields":[{"id":"unit_type","label":"Unit Type","type":"select","options":["Split","Ducted","Portable"],"required":true},{"id":"age_years","label":"System Age (Years)","type":"number","required":false}]}]'::jsonb,
     true, 1, NOW(), NOW()),
    (gen_random_uuid(), demo_org_id, 'Real Estate Lead Template', 'leads', 'Real Estate',
     '[{"id":"property","title":"Property Interest","fields":[{"id":"property_type","label":"Property Type","type":"select","options":["House","Apartment","Land","Commercial"],"required":true},{"id":"budget","label":"Budget Range","type":"text","required":true}]}]'::jsonb,
     true, 1, NOW(), NOW());

  -- CHAT MESSAGES (for the General conversation)
  IF conv_general IS NOT NULL THEN
    INSERT INTO chat_messages (id, org_id, conversation_id, sender_id, content, created_at, updated_at) VALUES
      (gen_random_uuid(), demo_org_id, conv_general, user_morpheus, 'Welcome to the team chat. Remember: there is no spoon.', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
      (gen_random_uuid(), demo_org_id, conv_general, user_neo, 'I know kung fu.', NOW() - INTERVAL '1 hour 45 minutes', NOW() - INTERVAL '1 hour 45 minutes'),
      (gen_random_uuid(), demo_org_id, conv_general, user_trinity, 'Show me.', NOW() - INTERVAL '1 hour 30 minutes', NOW() - INTERVAL '1 hour 30 minutes'),
      (gen_random_uuid(), demo_org_id, conv_general, user_morpheus, 'The Oracle wants to see Neo tomorrow at 0900.', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),
      (gen_random_uuid(), demo_org_id, conv_general, user_neo, 'Copy that. I will be there.', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '15 minutes');
  END IF;

  -- PAYMENTS (linked to invoice1)
  IF invoice1 IS NOT NULL THEN
    INSERT INTO payments (id, org_id, invoice_id, amount, method, reference, paid_at, created_at, updated_at) VALUES
      (gen_random_uuid(), demo_org_id, invoice1, 495000, 'Bank Transfer', 'PAY-001234-ZION', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');
  END IF;

  -- Add more payments for other scenarios
  INSERT INTO payments (id, org_id, invoice_id, amount, method, reference, paid_at, created_at, updated_at) VALUES
    (gen_random_uuid(), demo_org_id, NULL, 15000, 'Credit Card', 'PAY-001235-STRIPE', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
    (gen_random_uuid(), demo_org_id, NULL, 8000, 'Cash', 'PAY-001236-CASH', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

  -- AUDIT LOG (sample entries)
  INSERT INTO audit_log (id, org_id, entity_type, entity_id, action, previous_value, new_value, created_by, created_at, updated_at) VALUES
    (gen_random_uuid(), demo_org_id, 'deals', gen_random_uuid(), 'stage_changed', 'Proposal', 'Negotiation', user_neo::text, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    (gen_random_uuid(), demo_org_id, 'leads', gen_random_uuid(), 'created', NULL, 'The Kid', user_morpheus::text, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
    (gen_random_uuid(), demo_org_id, 'invoices', gen_random_uuid(), 'status_changed', 'Sent', 'Paid', user_trinity::text, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), demo_org_id, 'tickets', gen_random_uuid(), 'assigned', NULL, 'Link', user_morpheus::text, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), demo_org_id, 'jobs', gen_random_uuid(), 'status_changed', 'Scheduled', 'InProgress', user_neo::text, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours');

  RAISE NOTICE 'Missing table data seeded successfully!';
END;
$$;
