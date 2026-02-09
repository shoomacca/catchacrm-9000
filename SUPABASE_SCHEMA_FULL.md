# SUPABASE DATABASE SCHEMA - COMPLETE AUDIT
Generated: 2026-02-08T18:13:07.563Z

## Summary
Total Tables: 119

---

## 1. accounts
Rows: 5

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | name | text | ✗ | - | - |
| 4 | industry | text | ✓ | - | - |
| 5 | website | text | ✓ | - | - |
| 6 | employee_count | integer | ✓ | - | - |
| 7 | avatar | text | ✓ | - | - |
| 8 | tier | text | ✓ | - | - |
| 9 | email | text | ✓ | - | - |
| 10 | phone | text | ✓ | - | - |
| 11 | city | text | ✓ | - | - |
| 12 | state | text | ✓ | - | - |
| 13 | logo | text | ✓ | - | - |
| 14 | revenue | numeric | ✓ | - | - |
| 15 | status | text | ✓ | 'active'::text | - |
| 16 | type | text | ✓ | 'customer'::text | - |
| 17 | owner_id | uuid | ✓ | - | users.id |
| 18 | commission_rate | numeric | ✓ | - | - |
| 19 | custom_data | jsonb | ✓ | - | - |
| 20 | created_at | timestamp with time zone | ✓ | now() | - |
| 21 | updated_at | timestamp with time zone | ✓ | now() | - |
| 22 | created_by | text | ✓ | - | - |
| 23 | address | text | ✓ | - | - |

## 2. api_logs
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | endpoint | text | ✗ | - | - |
| 4 | method | text | ✗ | - | - |
| 5 | user_id | uuid | ✓ | - | - |
| 6 | status_code | integer | ✗ | - | - |
| 7 | response_time_ms | integer | ✓ | - | - |
| 8 | request_size_bytes | integer | ✓ | - | - |
| 9 | response_size_bytes | integer | ✓ | - | - |
| 10 | 🔑 created_at | timestamp with time zone | ✗ | now() | - |

## 3. api_logs_y2026m01
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | endpoint | text | ✗ | - | - |
| 4 | method | text | ✗ | - | - |
| 5 | user_id | uuid | ✓ | - | - |
| 6 | status_code | integer | ✗ | - | - |
| 7 | response_time_ms | integer | ✓ | - | - |
| 8 | request_size_bytes | integer | ✓ | - | - |
| 9 | response_size_bytes | integer | ✓ | - | - |
| 10 | 🔑 created_at | timestamp with time zone | ✗ | now() | - |

## 4. api_rate_limits
Rows: 1

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | requests_per_day | integer | ✓ | 100000 | - |
| 4 | requests_per_hour | integer | ✓ | 10000 | - |
| 5 | requests_per_minute | integer | ✓ | 200 | - |
| 6 | burst_allowance | integer | ✓ | 50 | - |
| 7 | updated_at | timestamp with time zone | ✓ | now() | - |
| 8 | updated_by | uuid | ✓ | - | - |

## 5. approval_processes
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | object_type | text | ✗ | - | - |
| 4 | name | text | ✗ | - | - |
| 5 | label | text | ✗ | - | - |
| 6 | description | text | ✓ | - | - |
| 7 | entry_criteria | jsonb | ✓ | '{}'::jsonb | - |
| 8 | who_can_submit | text | ✓ | 'record_owner'::text | - |
| 9 | default_approver_type | text | ✗ | - | - |
| 10 | default_approver_id | uuid | ✓ | - | - |
| 11 | allow_recall | boolean | ✓ | true | - |
| 12 | require_unanimous | boolean | ✓ | false | - |
| 13 | initial_submission_actions | jsonb | ✓ | '[]'::jsonb | - |
| 14 | approval_actions | jsonb | ✓ | '[]'::jsonb | - |
| 15 | rejection_actions | jsonb | ✓ | '[]'::jsonb | - |
| 16 | recall_actions | jsonb | ✓ | '[]'::jsonb | - |
| 17 | is_active | boolean | ✓ | true | - |
| 18 | created_at | timestamp with time zone | ✓ | now() | - |
| 19 | updated_at | timestamp with time zone | ✓ | now() | - |
| 20 | created_by | uuid | ✓ | - | - |

## 6. approval_requests
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | approval_process_id | uuid | ✗ | - | approval_processes.id |
| 4 | approval_step_id | uuid | ✓ | - | approval_steps.id |
| 5 | object_type | text | ✗ | - | - |
| 6 | record_id | uuid | ✗ | - | - |
| 7 | status | text | ✗ | 'pending'::text | - |
| 8 | current_step_number | integer | ✓ | 1 | - |
| 9 | submitted_by | uuid | ✗ | - | - |
| 10 | submitted_at | timestamp with time zone | ✓ | now() | - |
| 11 | assigned_to_id | uuid | ✓ | - | - |
| 12 | responded_by | uuid | ✓ | - | - |
| 13 | responded_at | timestamp with time zone | ✓ | - | - |
| 14 | comments | text | ✓ | - | - |
| 15 | final_status | text | ✓ | - | - |
| 16 | completed_at | timestamp with time zone | ✓ | - | - |
| 17 | created_at | timestamp with time zone | ✓ | now() | - |

## 7. approval_steps
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | approval_process_id | uuid | ✗ | - | approval_processes.id |
| 4 | step_number | integer | ✗ | - | - |
| 5 | name | text | ✗ | - | - |
| 6 | description | text | ✓ | - | - |
| 7 | criteria | jsonb | ✓ | '{}'::jsonb | - |
| 8 | approver_type | text | ✗ | - | - |
| 9 | approver_id | uuid | ✓ | - | - |
| 10 | approver_field | text | ✓ | - | - |
| 11 | approve_automatically | boolean | ✓ | false | - |
| 12 | reject_behavior | text | ✓ | 'final_rejection'::text | - |
| 13 | created_at | timestamp with time zone | ✓ | now() | - |

## 8. assignment_rule_entries
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | assignment_rule_id | uuid | ✗ | - | assignment_rules.id |
| 4 | sort_order | integer | ✗ | 0 | - |
| 5 | criteria | jsonb | ✗ | '{}'::jsonb | - |
| 6 | assignment_type | text | ✗ | - | - |
| 7 | assign_to_id | uuid | ✓ | - | - |
| 8 | queue_id | uuid | ✓ | - | queues.id |
| 9 | notify_assignee | boolean | ✓ | true | - |
| 10 | email_template_id | uuid | ✓ | - | email_templates.id |
| 11 | created_at | timestamp with time zone | ✓ | now() | - |
| 12 | updated_at | timestamp with time zone | ✓ | now() | - |

## 9. assignment_rules
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | object_type | text | ✗ | - | - |
| 4 | name | text | ✗ | - | - |
| 5 | description | text | ✓ | - | - |
| 6 | is_active | boolean | ✓ | true | - |
| 7 | created_at | timestamp with time zone | ✓ | now() | - |
| 8 | updated_at | timestamp with time zone | ✓ | now() | - |
| 9 | created_by | uuid | ✓ | - | - |

## 10. audit_log
Rows: 3

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✓ | - | organizations.id |
| 3 | entity_type | text | ✓ | - | - |
| 4 | entity_id | uuid | ✓ | - | - |
| 5 | action | text | ✓ | - | - |
| 6 | previous_value | text | ✓ | - | - |
| 7 | new_value | text | ✓ | - | - |
| 8 | metadata | jsonb | ✓ | - | - |
| 9 | batch_id | uuid | ✓ | - | - |
| 10 | created_at | timestamp with time zone | ✓ | now() | - |
| 11 | updated_at | timestamp with time zone | ✓ | now() | - |
| 12 | created_by | text | ✓ | - | - |

## 11. audit_logs
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | entity_type | text | ✗ | - | - |
| 4 | entity_id | uuid | ✗ | - | - |
| 5 | action | text | ✗ | - | - |
| 6 | old_values | jsonb | ✓ | - | - |
| 7 | new_values | jsonb | ✓ | - | - |
| 8 | user_id | uuid | ✓ | - | - |
| 9 | user_name | text | ✓ | - | - |
| 10 | created_at | timestamp with time zone | ✓ | now() | - |
| 11 | ip_address | inet | ✓ | - | - |
| 12 | user_agent | text | ✓ | - | - |

## 12. auto_response_entries
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | auto_response_rule_id | uuid | ✗ | - | auto_response_rules.id |
| 4 | sort_order | integer | ✗ | 0 | - |
| 5 | criteria | jsonb | ✗ | '{}'::jsonb | - |
| 6 | email_template_id | uuid | ✓ | - | email_templates.id |
| 7 | sms_template_id | uuid | ✓ | - | sms_templates.id |
| 8 | from_name | text | ✓ | - | - |
| 9 | from_email | text | ✓ | - | - |
| 10 | reply_to | text | ✓ | - | - |
| 11 | created_at | timestamp with time zone | ✓ | now() | - |
| 12 | updated_at | timestamp with time zone | ✓ | now() | - |

## 13. auto_response_rules
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | object_type | text | ✗ | - | - |
| 4 | name | text | ✗ | - | - |
| 5 | description | text | ✓ | - | - |
| 6 | is_active | boolean | ✓ | true | - |
| 7 | created_at | timestamp with time zone | ✓ | now() | - |
| 8 | updated_at | timestamp with time zone | ✓ | now() | - |
| 9 | created_by | uuid | ✓ | - | - |

## 14. automation_workflows
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | name | text | ✗ | - | - |
| 4 | description | text | ✓ | - | - |
| 5 | trigger | jsonb | ✓ | - | - |
| 6 | nodes | jsonb | ✓ | - | - |
| 7 | is_active | boolean | ✓ | false | - |
| 8 | execution_count | integer | ✓ | 0 | - |
| 9 | last_run_at | timestamp with time zone | ✓ | - | - |
| 10 | category | text | ✓ | - | - |
| 11 | created_at | timestamp with time zone | ✓ | now() | - |
| 12 | updated_at | timestamp with time zone | ✓ | now() | - |
| 13 | created_by | text | ✓ | - | - |

## 15. bank_transactions
Rows: 3

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | date | date | ✓ | - | - |
| 4 | description | text | ✓ | - | - |
| 5 | amount | numeric | ✓ | - | - |
| 6 | type | text | ✓ | - | - |
| 7 | status | text | ✓ | 'unmatched'::text | - |
| 8 | match_confidence | text | ✓ | - | - |
| 9 | matched_to_id | uuid | ✓ | - | - |
| 10 | matched_to_type | text | ✓ | - | - |
| 11 | reconciled | boolean | ✓ | false | - |
| 12 | reconciled_at | timestamp with time zone | ✓ | - | - |
| 13 | reconciled_by | uuid | ✓ | - | users.id |
| 14 | bank_reference | text | ✓ | - | - |
| 15 | notes | text | ✓ | - | - |
| 16 | created_at | timestamp with time zone | ✓ | now() | - |
| 17 | updated_at | timestamp with time zone | ✓ | now() | - |
| 18 | created_by | text | ✓ | - | - |

## 16. business_hours
Rows: 1

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | name | text | ✗ | - | - |
| 4 | timezone | text | ✗ | 'Australia/Sydney'::text | - |
| 5 | schedule | jsonb | ✗ | '{"friday": {"end": "17:00", " | - |
| 6 | is_default | boolean | ✓ | false | - |
| 7 | created_at | timestamp with time zone | ✓ | now() | - |
| 8 | updated_at | timestamp with time zone | ✓ | now() | - |

## 17. calculators
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | name | text | ✗ | - | - |
| 4 | type | text | ✓ | - | - |
| 5 | base_rate | numeric | ✓ | - | - |
| 6 | is_active | boolean | ✓ | true | - |
| 7 | status | text | ✓ | 'Active'::text | - |
| 8 | usage_count | integer | ✓ | 0 | - |
| 9 | lead_conversion_rate | numeric | ✓ | - | - |
| 10 | created_at | timestamp with time zone | ✓ | now() | - |
| 11 | updated_at | timestamp with time zone | ✓ | now() | - |
| 12 | created_by | text | ✓ | - | - |

## 18. calendar_events
Rows: 3

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | title | text | ✗ | - | - |
| 4 | description | text | ✓ | - | - |
| 5 | start_time | timestamp with time zone | ✗ | - | - |
| 6 | end_time | timestamp with time zone | ✓ | - | - |
| 7 | type | text | ✓ | - | - |
| 8 | location | text | ✓ | - | - |
| 9 | related_to_type | text | ✓ | - | - |
| 10 | related_to_id | uuid | ✓ | - | - |
| 11 | priority | text | ✓ | - | - |
| 12 | is_all_day | boolean | ✓ | false | - |
| 13 | created_at | timestamp with time zone | ✓ | now() | - |
| 14 | updated_at | timestamp with time zone | ✓ | now() | - |
| 15 | created_by | text | ✓ | - | - |
| 16 | owner_id | uuid | ✓ | - | - |

## 19. campaigns
Rows: 3

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | name | text | ✗ | - | - |
| 4 | type | text | ✓ | - | - |
| 5 | budget | numeric | ✓ | - | - |
| 6 | spent | numeric | ✓ | 0 | - |
| 7 | revenue | numeric | ✓ | 0 | - |
| 8 | revenue_generated | numeric | ✓ | 0 | - |
| 9 | leads_generated | integer | ✓ | 0 | - |
| 10 | status | text | ✓ | 'Planning'::text | - |
| 11 | start_date | date | ✓ | - | - |
| 12 | end_date | date | ✓ | - | - |
| 13 | description | text | ✓ | - | - |
| 14 | expected_c_p_l | numeric | ✓ | - | - |
| 15 | target_audience | text | ✓ | - | - |
| 16 | template_id | uuid | ✓ | - | - |
| 17 | created_at | timestamp with time zone | ✓ | now() | - |
| 18 | updated_at | timestamp with time zone | ✓ | now() | - |
| 19 | created_by | text | ✓ | - | - |

## 20. chat_messages
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | conversation_id | uuid | ✓ | - | conversations.id |
| 4 | content | text | ✗ | - | - |
| 5 | sender_id | uuid | ✓ | - | - |
| 6 | mentions | _uuid[] | ✓ | - | - |
| 7 | attachments | jsonb | ✓ | '[]'::jsonb | - |
| 8 | is_edited | boolean | ✓ | false | - |
| 9 | edited_at | timestamp with time zone | ✓ | - | - |
| 10 | created_at | timestamp with time zone | ✓ | now() | - |

## 21. chat_widgets
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | name | text | ✗ | - | - |
| 4 | page | text | ✓ | - | - |
| 5 | bubble_color | text | ✓ | - | - |
| 6 | welcome_message | text | ✓ | - | - |
| 7 | is_active | boolean | ✓ | true | - |
| 8 | status | text | ✓ | 'Active'::text | - |
| 9 | routing_user_id | uuid | ✓ | - | - |
| 10 | conversations | integer | ✓ | 0 | - |
| 11 | avg_response_time | integer | ✓ | - | - |
| 12 | created_at | timestamp with time zone | ✓ | now() | - |
| 13 | updated_at | timestamp with time zone | ✓ | now() | - |
| 14 | created_by | text | ✓ | - | - |

## 22. communications
Rows: 3

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | type | text | ✓ | - | - |
| 4 | subject | text | ✓ | - | - |
| 5 | content | text | ✓ | - | - |
| 6 | direction | text | ✓ | - | - |
| 7 | related_to_type | text | ✓ | - | - |
| 8 | related_to_id | uuid | ✓ | - | - |
| 9 | outcome | text | ✓ | - | - |
| 10 | next_step | text | ✓ | - | - |
| 11 | next_follow_up_date | date | ✓ | - | - |
| 12 | metadata | jsonb | ✓ | - | - |
| 13 | created_at | timestamp with time zone | ✓ | now() | - |
| 14 | updated_at | timestamp with time zone | ✓ | now() | - |
| 15 | created_by | text | ✓ | - | - |

## 23. company_settings
Rows: 1

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | company_name | text | ✗ | - | - |
| 4 | legal_name | text | ✓ | - | - |
| 5 | abn | text | ✓ | - | - |
| 6 | tax_id | text | ✓ | - | - |
| 7 | address_street | text | ✓ | - | - |
| 8 | address_city | text | ✓ | - | - |
| 9 | address_state | text | ✓ | - | - |
| 10 | address_postal_code | text | ✓ | - | - |
| 11 | address_country | text | ✓ | 'Australia'::text | - |
| 12 | phone | text | ✓ | - | - |
| 13 | fax | text | ✓ | - | - |
| 14 | website | text | ✓ | - | - |
| 15 | default_currency | text | ✓ | 'AUD'::text | - |
| 16 | default_timezone | text | ✓ | 'Australia/Sydney'::text | - |
| 17 | default_locale | text | ✓ | 'en-AU'::text | - |
| 18 | fiscal_year_start_month | integer | ✓ | 7 | - |
| 19 | enable_multiple_currencies | boolean | ✓ | false | - |
| 20 | updated_at | timestamp with time zone | ✓ | now() | - |
| 21 | updated_by | uuid | ✓ | - | - |

## 24. contacts
Rows: 8

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | name | text | ✗ | - | - |
| 4 | account_id | uuid | ✓ | - | accounts.id |
| 5 | email | text | ✓ | - | - |
| 6 | phone | text | ✓ | - | - |
| 7 | mobile | text | ✓ | - | - |
| 8 | title | text | ✓ | - | - |
| 9 | avatar | text | ✓ | - | - |
| 10 | company | text | ✓ | - | - |
| 11 | department | text | ✓ | - | - |
| 12 | is_primary | boolean | ✓ | false | - |
| 13 | status | text | ✓ | 'active'::text | - |
| 14 | custom_data | jsonb | ✓ | - | - |
| 15 | created_at | timestamp with time zone | ✓ | now() | - |
| 16 | updated_at | timestamp with time zone | ✓ | now() | - |
| 17 | created_by | text | ✓ | - | - |
| 18 | address | text | ✓ | - | - |
| 19 | owner_id | uuid | ✓ | - | - |

## 25. conversations
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | name | text | ✓ | - | - |
| 4 | type | text | ✓ | 'direct'::text | - |
| 5 | participants | _uuid[] | ✓ | - | - |
| 6 | is_active | boolean | ✓ | true | - |
| 7 | last_message_at | timestamp with time zone | ✓ | - | - |
| 8 | created_at | timestamp with time zone | ✓ | now() | - |
| 9 | created_by | uuid | ✓ | - | - |

## 26. credit_notes
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | credit_note_number | text | ✓ | - | - |
| 4 | invoice_id | uuid | ✓ | - | - |
| 5 | amount | numeric | ✗ | - | - |
| 6 | reason | text | ✓ | - | - |
| 7 | notes | text | ✓ | - | - |
| 8 | issue_date | date | ✓ | CURRENT_DATE | - |
| 9 | status | text | ✓ | 'issued'::text | - |
| 10 | applied_at | timestamp with time zone | ✓ | - | - |
| 11 | created_at | timestamp with time zone | ✓ | now() | - |
| 12 | created_by | uuid | ✓ | - | - |

## 27. crews
Rows: 2

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | name | text | ✗ | - | - |
| 4 | leader_id | uuid | ✓ | - | users.id |
| 5 | member_ids | _uuid[] | ✓ | - | - |
| 6 | color | text | ✓ | - | - |
| 7 | specialty | text | ✓ | - | - |
| 8 | status | text | ✓ | 'active'::text | - |
| 9 | created_at | timestamp with time zone | ✓ | now() | - |
| 10 | updated_at | timestamp with time zone | ✓ | now() | - |
| 11 | created_by | text | ✓ | - | - |

## 28. crm_settings
Rows: 1

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | lead_statuses | _text[] | ✓ | ARRAY['New'::text, 'Contacted' | - |
| 4 | lead_sources | _text[] | ✓ | ARRAY['Website'::text, 'Referr | - |
| 5 | deal_stages | _text[] | ✓ | ARRAY['Prospecting'::text, 'Qu | - |
| 6 | ticket_statuses | _text[] | ✓ | ARRAY['Open'::text, 'In Progre | - |
| 7 | ticket_priorities | _text[] | ✓ | ARRAY['Low'::text, 'Medium'::t | - |
| 8 | task_statuses | _text[] | ✓ | ARRAY['Not Started'::text, 'In | - |
| 9 | task_priorities | _text[] | ✓ | ARRAY['Low'::text, 'Medium'::t | - |
| 10 | default_currency | text | ✓ | 'AUD'::text | - |
| 11 | default_timezone | text | ✓ | 'Australia/Sydney'::text | - |
| 12 | fiscal_year_start_month | integer | ✓ | 7 | - |
| 13 | updated_at | timestamp with time zone | ✓ | now() | - |
| 14 | updated_by | uuid | ✓ | - | - |

## 29. currencies
Rows: 1

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | iso_code | text | ✗ | - | - |
| 4 | name | text | ✗ | - | - |
| 5 | symbol | text | ✗ | - | - |
| 6 | conversion_rate | numeric | ✓ | 1.0 | - |
| 7 | decimal_places | integer | ✓ | 2 | - |
| 8 | is_active | boolean | ✓ | true | - |
| 9 | is_corporate | boolean | ✓ | false | - |
| 10 | created_at | timestamp with time zone | ✓ | now() | - |
| 11 | updated_at | timestamp with time zone | ✓ | now() | - |

## 30. custom_fields
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | object_type | text | ✗ | - | - |
| 4 | api_name | text | ✗ | - | - |
| 5 | label | text | ✗ | - | - |
| 6 | description | text | ✓ | - | - |
| 7 | help_text | text | ✓ | - | - |
| 8 | data_type | text | ✗ | - | - |
| 9 | length | integer | ✓ | - | - |
| 10 | precision_digits | integer | ✓ | - | - |
| 11 | decimal_places | integer | ✓ | - | - |
| 12 | picklist_values | jsonb | ✓ | - | - |
| 13 | lookup_object | text | ✓ | - | - |
| 14 | lookup_relationship_name | text | ✓ | - | - |
| 15 | formula | text | ✓ | - | - |
| 16 | formula_return_type | text | ✓ | - | - |
| 17 | is_required | boolean | ✓ | false | - |
| 18 | is_unique | boolean | ✓ | false | - |
| 19 | min_value | numeric | ✓ | - | - |
| 20 | max_value | numeric | ✓ | - | - |
| 21 | regex_pattern | text | ✓ | - | - |
| 22 | regex_error_message | text | ✓ | - | - |
| 23 | default_value | text | ✓ | - | - |
| 24 | display_order | integer | ✓ | 0 | - |
| 25 | is_visible | boolean | ✓ | true | - |
| 26 | is_read_only | boolean | ✓ | false | - |
| 27 | is_active | boolean | ✓ | true | - |
| 28 | created_at | timestamp with time zone | ✓ | now() | - |
| 29 | updated_at | timestamp with time zone | ✓ | now() | - |
| 30 | created_by | uuid | ✓ | - | - |

## 31. custom_objects
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | api_name | text | ✗ | - | - |
| 4 | label | text | ✗ | - | - |
| 5 | plural_label | text | ✗ | - | - |
| 6 | description | text | ✓ | - | - |
| 7 | icon_name | text | ✓ | 'custom'::text | - |
| 8 | enable_activities | boolean | ✓ | true | - |
| 9 | enable_notes | boolean | ✓ | true | - |
| 10 | enable_search | boolean | ✓ | true | - |
| 11 | enable_reports | boolean | ✓ | true | - |
| 12 | record_name_label | text | ✓ | 'Name'::text | - |
| 13 | record_name_format | text | ✓ | 'text'::text | - |
| 14 | auto_number_format | text | ✓ | - | - |
| 15 | auto_number_start | integer | ✓ | 1 | - |
| 16 | is_deployed | boolean | ✓ | false | - |
| 17 | is_active | boolean | ✓ | true | - |
| 18 | created_at | timestamp with time zone | ✓ | now() | - |
| 19 | updated_at | timestamp with time zone | ✓ | now() | - |
| 20 | created_by | uuid | ✓ | - | - |

## 32. data_retention_policies
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | object_type | text | ✗ | - | - |
| 4 | retention_days | integer | ✗ | - | - |
| 5 | criteria | jsonb | ✓ | '{}'::jsonb | - |
| 6 | action | text | ✓ | 'delete'::text | - |
| 7 | is_active | boolean | ✓ | true | - |
| 8 | created_at | timestamp with time zone | ✓ | now() | - |
| 9 | updated_at | timestamp with time zone | ✓ | now() | - |
| 10 | created_by | uuid | ✓ | - | - |

## 33. dated_exchange_rates
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | from_currency | text | ✗ | - | - |
| 4 | to_currency | text | ✗ | - | - |
| 5 | rate | numeric | ✗ | - | - |
| 6 | rate_date | date | ✗ | - | - |
| 7 | created_at | timestamp with time zone | ✓ | now() | - |

## 34. deals
Rows: 5

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | name | text | ✗ | - | - |
| 4 | account_id | uuid | ✓ | - | accounts.id |
| 5 | contact_id | uuid | ✓ | - | contacts.id |
| 6 | amount | numeric | ✓ | - | - |
| 7 | stage | text | ✓ | 'qualification'::text | - |
| 8 | probability | integer | ✓ | 50 | - |
| 9 | expected_close_date | date | ✓ | - | - |
| 10 | assignee_id | uuid | ✓ | - | users.id |
| 11 | avatar | text | ✓ | - | - |
| 12 | stage_entry_date | timestamp with time zone | ✓ | - | - |
| 13 | campaign_id | uuid | ✓ | - | - |
| 14 | commission_rate | numeric | ✓ | - | - |
| 15 | commission_amount | numeric | ✓ | - | - |
| 16 | lead_id | uuid | ✓ | - | - |
| 17 | won_at | timestamp with time zone | ✓ | - | - |
| 18 | created_account_id | uuid | ✓ | - | - |
| 19 | created_contact_id | uuid | ✓ | - | - |
| 20 | custom_data | jsonb | ✓ | - | - |
| 21 | created_at | timestamp with time zone | ✓ | now() | - |
| 22 | updated_at | timestamp with time zone | ✓ | now() | - |
| 23 | created_by | text | ✓ | - | - |
| 24 | owner_id | uuid | ✓ | - | - |

## 35. dependent_picklists
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | controlling_field_id | uuid | ✗ | - | custom_fields.id |
| 4 | dependent_field_id | uuid | ✗ | - | custom_fields.id |
| 5 | value_mapping | jsonb | ✗ | '{}'::jsonb | - |
| 6 | created_at | timestamp with time zone | ✓ | now() | - |
| 7 | updated_at | timestamp with time zone | ✓ | now() | - |

## 36. documents
Rows: 3

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | name | text | ✗ | - | - |
| 4 | file_type | text | ✓ | - | - |
| 5 | file_size | text | ✓ | - | - |
| 6 | file_url | text | ✓ | - | - |
| 7 | related_to_type | text | ✗ | - | - |
| 8 | related_to_id | uuid | ✗ | - | - |
| 9 | content_text | text | ✓ | - | - |
| 10 | embedding | vector | ✓ | - | - |
| 11 | processing_status | text | ✓ | 'pending'::text | - |
| 12 | processed_at | timestamp with time zone | ✓ | - | - |
| 13 | uploaded_by | uuid | ✓ | - | - |
| 14 | version | integer | ✓ | 1 | - |
| 15 | parent_document_id | uuid | ✓ | - | documents.id |
| 16 | description | text | ✓ | - | - |
| 17 | tags | _text[] | ✓ | - | - |
| 18 | created_at | timestamp with time zone | ✓ | now() | - |
| 19 | title | text | ✓ | - | - |
| 20 | url | text | ✓ | - | - |

## 37. duplicate_rules
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | object_type | text | ✗ | - | - |
| 4 | name | text | ✗ | - | - |
| 5 | description | text | ✓ | - | - |
| 6 | is_active | boolean | ✓ | true | - |
| 7 | created_at | timestamp with time zone | ✓ | now() | - |
| 8 | updated_at | timestamp with time zone | ✓ | now() | - |
| 9 | created_by | uuid | ✓ | - | - |

## 38. email_accounts
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | user_id | uuid | ✓ | - | - |
| 4 | email_address | text | ✗ | - | - |
| 5 | display_name | text | ✓ | - | - |
| 6 | provider | text | ✓ | 'gmail'::text | - |
| 7 | access_token_encrypted | text | ✓ | - | - |
| 8 | refresh_token_encrypted | text | ✓ | - | - |
| 9 | is_active | boolean | ✓ | true | - |
| 10 | last_sync_at | timestamp with time zone | ✓ | - | - |
| 11 | sync_token | text | ✓ | - | - |
| 12 | sync_enabled | boolean | ✓ | true | - |
| 13 | sync_frequency_minutes | integer | ✓ | 5 | - |
| 14 | created_at | timestamp with time zone | ✓ | now() | - |

## 39. email_letterheads
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | name | text | ✗ | - | - |
| 4 | description | text | ✓ | - | - |
| 5 | header_html | text | ✓ | - | - |
| 6 | header_height | integer | ✓ | 100 | - |
| 7 | footer_html | text | ✓ | - | - |
| 8 | footer_height | integer | ✓ | 50 | - |
| 9 | logo_url | text | ✓ | - | - |
| 10 | logo_width | integer | ✓ | 200 | - |
| 11 | logo_height | integer | ✓ | 50 | - |
| 12 | background_color | text | ✓ | '#FFFFFF'::text | - |
| 13 | text_color | text | ✓ | '#000000'::text | - |
| 14 | is_default | boolean | ✓ | false | - |
| 15 | created_at | timestamp with time zone | ✓ | now() | - |
| 16 | updated_at | timestamp with time zone | ✓ | now() | - |

## 40. email_sequence_enrollments
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | email_sequence_id | uuid | ✓ | - | email_sequences.id |
| 4 | contact_id | uuid | ✓ | - | - |
| 5 | lead_id | uuid | ✓ | - | - |
| 6 | status | text | ✓ | 'active'::text | - |
| 7 | current_step | integer | ✓ | 1 | - |
| 8 | enrolled_at | timestamp with time zone | ✓ | now() | - |
| 9 | completed_at | timestamp with time zone | ✓ | - | - |
| 10 | created_at | timestamp with time zone | ✓ | now() | - |

## 41. email_sequence_steps
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | email_sequence_id | uuid | ✓ | - | email_sequences.id |
| 4 | step_number | integer | ✗ | - | - |
| 5 | name | text | ✗ | - | - |
| 6 | delay_days | integer | ✓ | 0 | - |
| 7 | email_template_id | uuid | ✓ | - | email_templates.id |
| 8 | created_at | timestamp with time zone | ✓ | now() | - |

## 42. email_sequences
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | name | text | ✗ | - | - |
| 4 | description | text | ✓ | - | - |
| 5 | is_active | boolean | ✓ | true | - |
| 6 | total_enrolled | integer | ✓ | 0 | - |
| 7 | total_completed | integer | ✓ | 0 | - |
| 8 | created_at | timestamp with time zone | ✓ | now() | - |
| 9 | created_by | uuid | ✓ | - | - |

## 43. email_settings
Rows: 1

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | bounce_handling_enabled | boolean | ✓ | true | - |
| 4 | dkim_enabled | boolean | ✓ | false | - |
| 5 | dkim_domain | text | ✓ | - | - |
| 6 | enable_enhanced_email_security | boolean | ✓ | true | - |
| 7 | enable_sender_id | boolean | ✓ | true | - |
| 8 | daily_email_limit | integer | ✓ | 5000 | - |
| 9 | hourly_email_limit | integer | ✓ | 1000 | - |
| 10 | enable_email_tracking | boolean | ✓ | true | - |
| 11 | track_opens | boolean | ✓ | true | - |
| 12 | track_clicks | boolean | ✓ | true | - |
| 13 | updated_at | timestamp with time zone | ✓ | now() | - |
| 14 | updated_by | uuid | ✓ | - | - |

## 44. email_templates
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | name | text | ✗ | - | - |
| 4 | description | text | ✓ | - | - |
| 5 | subject | text | ✓ | - | - |
| 6 | body_html | text | ✓ | - | - |
| 7 | body_text | text | ✓ | - | - |
| 8 | category | text | ✓ | - | - |
| 9 | folder | text | ✓ | - | - |
| 10 | from_name | text | ✓ | - | - |
| 11 | from_email | text | ✓ | - | - |
| 12 | reply_to | text | ✓ | - | - |
| 13 | attachments | jsonb | ✓ | '[]'::jsonb | - |
| 14 | is_active | boolean | ✓ | true | - |
| 15 | usage_count | integer | ✓ | 0 | - |
| 16 | last_used_at | timestamp with time zone | ✓ | - | - |
| 17 | created_at | timestamp with time zone | ✓ | now() | - |
| 18 | updated_at | timestamp with time zone | ✓ | now() | - |
| 19 | created_by | uuid | ✓ | - | - |

## 45. email_threads
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | gmail_thread_id | text | ✓ | - | - |
| 4 | subject | text | ✓ | - | - |
| 5 | participants | _text[] | ✓ | - | - |
| 6 | related_to_type | text | ✓ | - | - |
| 7 | related_to_id | uuid | ✓ | - | - |
| 8 | is_unread | boolean | ✓ | true | - |
| 9 | is_starred | boolean | ✓ | false | - |
| 10 | labels | _text[] | ✓ | - | - |
| 11 | message_count | integer | ✓ | 0 | - |
| 12 | first_message_at | timestamp with time zone | ✓ | - | - |
| 13 | last_message_at | timestamp with time zone | ✓ | - | - |
| 14 | created_at | timestamp with time zone | ✓ | now() | - |
| 15 | updated_at | timestamp with time zone | ✓ | now() | - |

## 46. email_tracking_settings
Rows: 1

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | track_email_opens | boolean | ✓ | true | - |
| 4 | track_link_clicks | boolean | ✓ | true | - |
| 5 | notify_on_open | boolean | ✓ | false | - |
| 6 | notify_on_click | boolean | ✓ | false | - |
| 7 | updated_at | timestamp with time zone | ✓ | now() | - |

## 47. emails
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | email_thread_id | uuid | ✓ | - | email_threads.id |
| 4 | gmail_message_id | text | ✓ | - | - |
| 5 | from_address | text | ✓ | - | - |
| 6 | from_name | text | ✓ | - | - |
| 7 | to_addresses | _text[] | ✓ | - | - |
| 8 | cc_addresses | _text[] | ✓ | - | - |
| 9 | bcc_addresses | _text[] | ✓ | - | - |
| 10 | reply_to | text | ✓ | - | - |
| 11 | subject | text | ✓ | - | - |
| 12 | body_text | text | ✓ | - | - |
| 13 | body_html | text | ✓ | - | - |
| 14 | snippet | text | ✓ | - | - |
| 15 | has_attachments | boolean | ✓ | false | - |
| 16 | attachments | jsonb | ✓ | '[]'::jsonb | - |
| 17 | status | email_status | ✓ | 'sent'::email_status | - |
| 18 | is_incoming | boolean | ✓ | true | - |
| 19 | is_unread | boolean | ✓ | true | - |
| 20 | is_starred | boolean | ✓ | false | - |
| 21 | labels | _text[] | ✓ | - | - |
| 22 | opened_at | timestamp with time zone | ✓ | - | - |
| 23 | open_count | integer | ✓ | 0 | - |
| 24 | clicked_at | timestamp with time zone | ✓ | - | - |
| 25 | click_count | integer | ✓ | 0 | - |
| 26 | related_to_type | text | ✓ | - | - |
| 27 | related_to_id | uuid | ✓ | - | - |
| 28 | sent_by | uuid | ✓ | - | - |
| 29 | sent_at | timestamp with time zone | ✓ | - | - |
| 30 | received_at | timestamp with time zone | ✓ | - | - |
| 31 | created_at | timestamp with time zone | ✓ | now() | - |

## 48. equipment
Rows: 3

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | name | text | ✗ | - | - |
| 4 | type | text | ✓ | - | - |
| 5 | barcode | text | ✓ | - | - |
| 6 | condition | text | ✓ | 'Good'::text | - |
| 7 | location | text | ✓ | - | - |
| 8 | assigned_to | uuid | ✓ | - | users.id |
| 9 | last_service_date | date | ✓ | - | - |
| 10 | next_service_date | date | ✓ | - | - |
| 11 | purchase_date | date | ✓ | - | - |
| 12 | purchase_price | numeric | ✓ | - | - |
| 13 | model | text | ✓ | - | - |
| 14 | status | text | ✓ | 'available'::text | - |
| 15 | value | numeric | ✓ | - | - |
| 16 | created_at | timestamp with time zone | ✓ | now() | - |
| 17 | updated_at | timestamp with time zone | ✓ | now() | - |
| 18 | created_by | text | ✓ | - | - |

## 49. escalation_actions
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | escalation_rule_id | uuid | ✗ | - | escalation_rules.id |
| 4 | age_minutes | integer | ✗ | - | - |
| 5 | age_field | text | ✓ | 'created_at'::text | - |
| 6 | criteria | jsonb | ✓ | '{}'::jsonb | - |
| 7 | reassign_to_id | uuid | ✓ | - | - |
| 8 | notify_user_ids | _uuid[] | ✓ | '{}'::uuid[] | - |
| 9 | email_template_id | uuid | ✓ | - | email_templates.id |
| 10 | sort_order | integer | ✓ | 0 | - |
| 11 | created_at | timestamp with time zone | ✓ | now() | - |
| 12 | updated_at | timestamp with time zone | ✓ | now() | - |

## 50. escalation_rules
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | object_type | text | ✗ | - | - |
| 4 | name | text | ✗ | - | - |
| 5 | description | text | ✓ | - | - |
| 6 | is_active | boolean | ✓ | true | - |
| 7 | use_business_hours | boolean | ✓ | true | - |
| 8 | business_hours_id | uuid | ✓ | - | - |
| 9 | created_at | timestamp with time zone | ✓ | now() | - |
| 10 | updated_at | timestamp with time zone | ✓ | now() | - |
| 11 | created_by | uuid | ✓ | - | - |

## 51. expenses
Rows: 2

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | vendor | text | ✓ | - | - |
| 4 | amount | numeric | ✓ | - | - |
| 5 | category | text | ✓ | - | - |
| 6 | date | date | ✓ | - | - |
| 7 | status | text | ✓ | 'Pending'::text | - |
| 8 | receipt_url | text | ✓ | - | - |
| 9 | approved_by | uuid | ✓ | - | users.id |
| 10 | created_at | timestamp with time zone | ✓ | now() | - |
| 11 | updated_at | timestamp with time zone | ✓ | now() | - |
| 12 | created_by | text | ✓ | - | - |

## 52. export_jobs
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | object_type | text | ✗ | - | - |
| 4 | export_format | text | ✓ | 'csv'::text | - |
| 5 | filters | jsonb | ✓ | '{}'::jsonb | - |
| 6 | fields | _text[] | ✗ | - | - |
| 7 | status | text | ✗ | 'pending'::text | - |
| 8 | file_url | text | ✓ | - | - |
| 9 | file_size | bigint | ✓ | - | - |
| 10 | record_count | integer | ✓ | 0 | - |
| 11 | error_message | text | ✓ | - | - |
| 12 | started_at | timestamp with time zone | ✓ | - | - |
| 13 | completed_at | timestamp with time zone | ✓ | - | - |
| 14 | expires_at | timestamp with time zone | ✓ | - | - |
| 15 | created_at | timestamp with time zone | ✓ | now() | - |
| 16 | created_by | uuid | ✓ | - | - |

## 53. field_history
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | object_type | text | ✗ | - | - |
| 4 | record_id | uuid | ✗ | - | - |
| 5 | field_name | text | ✗ | - | - |
| 6 | old_value | text | ✓ | - | - |
| 7 | new_value | text | ✓ | - | - |
| 8 | changed_at | timestamp with time zone | ✓ | now() | - |
| 9 | changed_by | uuid | ✓ | - | - |

## 54. field_history_tracking
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | object_type | text | ✗ | - | - |
| 4 | field_name | text | ✗ | - | - |
| 5 | is_tracked | boolean | ✓ | true | - |
| 6 | created_at | timestamp with time zone | ✓ | now() | - |
| 7 | created_by | uuid | ✓ | - | - |

## 55. field_permissions
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | permission_set_id | uuid | ✗ | - | permission_sets.id |
| 4 | object_type | text | ✗ | - | - |
| 5 | field_name | text | ✗ | - | - |
| 6 | can_read | boolean | ✓ | true | - |
| 7 | can_edit | boolean | ✓ | true | - |

## 56. fiscal_year_settings
Rows: 1

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | start_month | integer | ✗ | 7 | - |
| 4 | naming_convention | text | ✓ | 'start_year'::text | - |
| 5 | updated_at | timestamp with time zone | ✓ | now() | - |
| 6 | updated_by | uuid | ✓ | - | - |

## 57. holidays
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | name | text | ✗ | - | - |
| 4 | holiday_date | date | ✗ | - | - |
| 5 | is_recurring | boolean | ✓ | false | - |
| 6 | recurrence_type | text | ✓ | - | - |
| 7 | recurrence_day | integer | ✓ | - | - |
| 8 | recurrence_month | integer | ✓ | - | - |
| 9 | business_hours_id | uuid | ✓ | - | business_hours.id |
| 10 | created_at | timestamp with time zone | ✓ | now() | - |

## 58. import_jobs
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | object_type | text | ✗ | - | - |
| 4 | operation | text | ✗ | 'insert'::text | - |
| 5 | file_name | text | ✗ | - | - |
| 6 | file_size | bigint | ✓ | - | - |
| 7 | file_url | text | ✓ | - | - |
| 8 | field_mapping | jsonb | ✗ | - | - |
| 9 | status | text | ✗ | 'pending'::text | - |
| 10 | total_rows | integer | ✓ | 0 | - |
| 11 | processed_rows | integer | ✓ | 0 | - |
| 12 | success_count | integer | ✓ | 0 | - |
| 13 | error_count | integer | ✓ | 0 | - |
| 14 | errors | jsonb | ✓ | '[]'::jsonb | - |
| 15 | started_at | timestamp with time zone | ✓ | - | - |
| 16 | completed_at | timestamp with time zone | ✓ | - | - |
| 17 | created_at | timestamp with time zone | ✓ | now() | - |
| 18 | created_by | uuid | ✓ | - | - |

## 59. inbound_forms
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | name | text | ✗ | - | - |
| 4 | type | text | ✓ | - | - |
| 5 | fields | jsonb | ✓ | - | - |
| 6 | submit_button_text | text | ✓ | - | - |
| 7 | success_message | text | ✓ | - | - |
| 8 | target_campaign_id | uuid | ✓ | - | - |
| 9 | submission_count | integer | ✓ | 0 | - |
| 10 | conversion_rate | numeric | ✓ | - | - |
| 11 | status | text | ✓ | 'Draft'::text | - |
| 12 | embed_code | text | ✓ | - | - |
| 13 | created_at | timestamp with time zone | ✓ | now() | - |
| 14 | updated_at | timestamp with time zone | ✓ | now() | - |
| 15 | created_by | text | ✓ | - | - |

## 60. industry_templates
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✓ | - | organizations.id |
| 3 | name | text | ✗ | - | - |
| 4 | target_entity | text | ✓ | - | - |
| 5 | industry | text | ✓ | - | - |
| 6 | sections | jsonb | ✓ | - | - |
| 7 | is_active | boolean | ✓ | true | - |
| 8 | version | integer | ✓ | 1 | - |
| 9 | created_at | timestamp with time zone | ✓ | now() | - |
| 10 | updated_at | timestamp with time zone | ✓ | now() | - |
| 11 | created_by | text | ✓ | - | - |

## 61. inventory_items
Rows: 4

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | name | text | ✗ | - | - |
| 4 | sku | text | ✓ | - | - |
| 5 | warehouse_qty | integer | ✓ | 0 | - |
| 6 | reorder_point | integer | ✓ | - | - |
| 7 | category | text | ✓ | - | - |
| 8 | unit_price | numeric | ✓ | - | - |
| 9 | created_at | timestamp with time zone | ✓ | now() | - |
| 10 | updated_at | timestamp with time zone | ✓ | now() | - |
| 11 | created_by | text | ✓ | - | - |

## 62. invoices
Rows: 3

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | invoice_number | text | ✓ | - | - |
| 4 | account_id | uuid | ✓ | - | accounts.id |
| 5 | deal_id | uuid | ✓ | - | deals.id |
| 6 | quote_id | uuid | ✓ | - | quotes.id |
| 7 | status | text | ✓ | 'Draft'::text | - |
| 8 | payment_status | text | ✓ | 'unpaid'::text | - |
| 9 | issue_date | date | ✓ | - | - |
| 10 | invoice_date | date | ✓ | - | - |
| 11 | due_date | date | ✓ | - | - |
| 12 | sent_at | timestamp with time zone | ✓ | - | - |
| 13 | paid_at | timestamp with time zone | ✓ | - | - |
| 14 | line_items | jsonb | ✓ | - | - |
| 15 | subtotal | numeric | ✓ | - | - |
| 16 | tax_total | numeric | ✓ | - | - |
| 17 | total | numeric | ✓ | - | - |
| 18 | amount_paid | numeric | ✓ | 0 | - |
| 19 | balance_due | numeric | ✓ | - | - |
| 20 | notes | text | ✓ | - | - |
| 21 | terms | text | ✓ | - | - |
| 22 | late_fee_rate | numeric | ✓ | - | - |
| 23 | credits | jsonb | ✓ | - | - |
| 24 | created_at | timestamp with time zone | ✓ | now() | - |
| 25 | updated_at | timestamp with time zone | ✓ | now() | - |
| 26 | created_by | text | ✓ | - | - |
| 27 | owner_id | uuid | ✓ | - | - |

## 63. ip_restrictions
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | permission_set_id | uuid | ✓ | - | permission_sets.id |
| 4 | ip_start | inet | ✗ | - | - |
| 5 | ip_end | inet | ✗ | - | - |
| 6 | description | text | ✓ | - | - |
| 7 | is_active | boolean | ✓ | true | - |
| 8 | created_at | timestamp with time zone | ✓ | now() | - |
| 9 | updated_at | timestamp with time zone | ✓ | now() | - |

## 64. jobs
Rows: 3

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | job_number | text | ✓ | - | - |
| 4 | name | text | ✓ | - | - |
| 5 | subject | text | ✓ | - | - |
| 6 | description | text | ✓ | - | - |
| 7 | account_id | uuid | ✓ | - | accounts.id |
| 8 | assignee_id | uuid | ✓ | - | users.id |
| 9 | crew_id | uuid | ✓ | - | - |
| 10 | job_type | text | ✓ | - | - |
| 11 | status | text | ✓ | 'Scheduled'::text | - |
| 12 | priority | text | ✓ | 'medium'::text | - |
| 13 | zone | text | ✓ | - | - |
| 14 | estimated_duration | integer | ✓ | - | - |
| 15 | scheduled_date | date | ✓ | - | - |
| 16 | scheduled_end_date | date | ✓ | - | - |
| 17 | completed_at | timestamp with time zone | ✓ | - | - |
| 18 | lat | numeric | ✓ | - | - |
| 19 | lng | numeric | ✓ | - | - |
| 20 | job_fields | jsonb | ✓ | - | - |
| 21 | swms_signed | boolean | ✓ | false | - |
| 22 | completion_signature | text | ✓ | - | - |
| 23 | evidence_photos | _text[] | ✓ | - | - |
| 24 | bom | jsonb | ✓ | - | - |
| 25 | invoice_id | uuid | ✓ | - | - |
| 26 | created_at | timestamp with time zone | ✓ | now() | - |
| 27 | updated_at | timestamp with time zone | ✓ | now() | - |
| 28 | created_by | text | ✓ | - | - |

## 65. kb_articles
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | title | text | ✗ | - | - |
| 4 | content | text | ✗ | - | - |
| 5 | summary | text | ✓ | - | - |
| 6 | category_id | uuid | ✓ | - | kb_categories.id |
| 7 | author_id | uuid | ✓ | - | - |
| 8 | keywords | _text[] | ✓ | - | - |
| 9 | status | text | ✓ | 'draft'::text | - |
| 10 | published_at | timestamp with time zone | ✓ | - | - |
| 11 | is_public | boolean | ✓ | true | - |
| 12 | view_count | integer | ✓ | 0 | - |
| 13 | helpful_count | integer | ✓ | 0 | - |
| 14 | not_helpful_count | integer | ✓ | 0 | - |
| 15 | created_at | timestamp with time zone | ✓ | now() | - |
| 16 | updated_at | timestamp with time zone | ✓ | now() | - |

## 66. kb_categories
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | name | text | ✗ | - | - |
| 4 | description | text | ✓ | - | - |
| 5 | parent_category_id | uuid | ✓ | - | kb_categories.id |
| 6 | sort_order | integer | ✓ | 0 | - |
| 7 | is_public | boolean | ✓ | true | - |
| 8 | is_active | boolean | ✓ | true | - |
| 9 | created_at | timestamp with time zone | ✓ | now() | - |

## 67. leads
Rows: 5

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | name | text | ✗ | - | - |
| 4 | company | text | ✓ | - | - |
| 5 | email | text | ✓ | - | - |
| 6 | phone | text | ✓ | - | - |
| 7 | status | text | ✓ | 'new'::text | - |
| 8 | source | text | ✓ | - | - |
| 9 | campaign_id | uuid | ✓ | - | - |
| 10 | estimated_value | numeric | ✓ | - | - |
| 11 | avatar | text | ✓ | - | - |
| 12 | score | integer | ✓ | 0 | - |
| 13 | address_street | text | ✓ | - | - |
| 14 | address_suburb | text | ✓ | - | - |
| 15 | address_state | text | ✓ | - | - |
| 16 | address_postcode | text | ✓ | - | - |
| 17 | address_country | text | ✓ | - | - |
| 18 | last_contact_date | timestamp with time zone | ✓ | - | - |
| 19 | notes | text | ✓ | - | - |
| 20 | commission_rate | numeric | ✓ | - | - |
| 21 | converted_to_deal_id | uuid | ✓ | - | - |
| 22 | converted_at | timestamp with time zone | ✓ | - | - |
| 23 | converted_by | text | ✓ | - | - |
| 24 | custom_data | jsonb | ✓ | - | - |
| 25 | assigned_to | uuid | ✓ | - | users.id |
| 26 | created_at | timestamp with time zone | ✓ | now() | - |
| 27 | updated_at | timestamp with time zone | ✓ | now() | - |
| 28 | created_by | text | ✓ | - | - |
| 29 | address | text | ✓ | - | - |
| 30 | owner_id | uuid | ✓ | - | - |

## 68. line_items
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | related_to_type | text | ✗ | - | - |
| 4 | related_to_id | uuid | ✗ | - | - |
| 5 | item_type | text | ✓ | 'product'::text | - |
| 6 | product_id | uuid | ✓ | - | - |
| 7 | service_id | uuid | ✓ | - | - |
| 8 | name | text | ✗ | - | - |
| 9 | description | text | ✓ | - | - |
| 10 | quantity | numeric | ✓ | 1 | - |
| 11 | unit_price | numeric | ✓ | - | - |
| 12 | discount_percent | numeric | ✓ | 0 | - |
| 13 | tax_rate | numeric | ✓ | 10 | - |
| 14 | line_total | numeric | ✓ | - | - |
| 15 | sort_order | integer | ✓ | 0 | - |
| 16 | created_at | timestamp with time zone | ✓ | now() | - |

## 69. login_history
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✓ | - | - |
| 3 | user_id | uuid | ✓ | - | - |
| 4 | login_time | timestamp with time zone | ✓ | now() | - |
| 5 | logout_time | timestamp with time zone | ✓ | - | - |
| 6 | ip_address | inet | ✓ | - | - |
| 7 | country | text | ✓ | - | - |
| 8 | city | text | ✓ | - | - |
| 9 | browser | text | ✓ | - | - |
| 10 | platform | text | ✓ | - | - |
| 11 | device_type | text | ✓ | 'desktop'::text | - |
| 12 | status | text | ✗ | 'success'::text | - |
| 13 | failure_reason | text | ✓ | - | - |

## 70. mass_operation_jobs
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | object_type | text | ✗ | - | - |
| 4 | operation_type | text | ✗ | - | - |
| 5 | filters | jsonb | ✗ | - | - |
| 6 | estimated_count | integer | ✓ | - | - |
| 7 | field_updates | jsonb | ✓ | - | - |
| 8 | new_owner_id | uuid | ✓ | - | - |
| 9 | status | text | ✗ | 'pending'::text | - |
| 10 | total_records | integer | ✓ | 0 | - |
| 11 | processed_records | integer | ✓ | 0 | - |
| 12 | success_count | integer | ✓ | 0 | - |
| 13 | error_count | integer | ✓ | 0 | - |
| 14 | errors | jsonb | ✓ | '[]'::jsonb | - |
| 15 | started_at | timestamp with time zone | ✓ | - | - |
| 16 | completed_at | timestamp with time zone | ✓ | - | - |
| 17 | created_at | timestamp with time zone | ✓ | now() | - |
| 18 | created_by | uuid | ✓ | - | - |

## 71. matching_rules
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | duplicate_rule_id | uuid | ✗ | - | duplicate_rules.id |
| 4 | field_name | text | ✗ | - | - |
| 5 | matching_method | text | ✗ | 'exact'::text | - |
| 6 | fuzzy_threshold | numeric | ✓ | 0.8 | - |
| 7 | created_at | timestamp with time zone | ✓ | now() | - |

## 72. notifications
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | user_id | uuid | ✓ | - | - |
| 4 | type | text | ✗ | - | - |
| 5 | title | text | ✗ | - | - |
| 6 | content | text | ✓ | - | - |
| 7 | action_url | text | ✓ | - | - |
| 8 | related_to_type | text | ✓ | - | - |
| 9 | related_to_id | uuid | ✓ | - | - |
| 10 | is_read | boolean | ✓ | false | - |
| 11 | read_at | timestamp with time zone | ✓ | - | - |
| 12 | created_at | timestamp with time zone | ✓ | now() | - |

## 73. object_permissions
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | permission_set_id | uuid | ✗ | - | permission_sets.id |
| 4 | object_type | text | ✗ | - | - |
| 5 | can_create | boolean | ✓ | false | - |
| 6 | can_read | boolean | ✓ | false | - |
| 7 | can_edit | boolean | ✓ | false | - |
| 8 | can_delete | boolean | ✓ | false | - |
| 9 | can_view_all | boolean | ✓ | false | - |
| 10 | can_modify_all | boolean | ✓ | false | - |

## 74. organization_wide_addresses
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | display_name | text | ✗ | - | - |
| 4 | email_address | text | ✗ | - | - |
| 5 | purpose | text | ✓ | 'general'::text | - |
| 6 | is_verified | boolean | ✓ | false | - |
| 7 | verified_at | timestamp with time zone | ✓ | - | - |
| 8 | allow_all_profiles | boolean | ✓ | true | - |
| 9 | allowed_profile_ids | _uuid[] | ✓ | '{}'::uuid[] | - |
| 10 | created_at | timestamp with time zone | ✓ | now() | - |
| 11 | updated_at | timestamp with time zone | ✓ | now() | - |

## 75. organizations
Rows: 1

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | name | text | ✗ | - | - |
| 3 | slug | text | ✓ | - | - |
| 4 | plan | text | ✓ | 'free'::text | - |
| 5 | subscription_status | text | ✓ | 'active'::text | - |
| 6 | trial_ends_at | timestamp with time zone | ✓ | - | - |
| 7 | user_limit | integer | ✓ | 5 | - |
| 8 | storage_limit_gb | integer | ✓ | 10 | - |
| 9 | api_calls_per_day | integer | ✓ | 1000 | - |
| 10 | current_user_count | integer | ✓ | 0 | - |
| 11 | current_storage_bytes | bigint | ✓ | 0 | - |
| 12 | settings | jsonb | ✓ | - | - |
| 13 | created_at | timestamp with time zone | ✓ | now() | - |
| 14 | updated_at | timestamp with time zone | ✓ | now() | - |

## 76. page_layout_assignments
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | page_layout_id | uuid | ✗ | - | page_layouts.id |
| 4 | assignment_type | text | ✗ | - | - |
| 5 | assignment_id | uuid | ✗ | - | - |
| 6 | created_at | timestamp with time zone | ✓ | now() | - |

## 77. page_layouts
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | object_type | text | ✗ | - | - |
| 4 | name | text | ✗ | - | - |
| 5 | description | text | ✓ | - | - |
| 6 | layout_sections | jsonb | ✗ | '[]'::jsonb | - |
| 7 | related_lists | jsonb | ✓ | '[]'::jsonb | - |
| 8 | available_buttons | _text[] | ✓ | ARRAY['edit'::text, 'delete':: | - |
| 9 | is_default | boolean | ✓ | false | - |
| 10 | is_active | boolean | ✓ | true | - |
| 11 | created_at | timestamp with time zone | ✓ | now() | - |
| 12 | updated_at | timestamp with time zone | ✓ | now() | - |
| 13 | created_by | uuid | ✓ | - | - |

## 78. payments
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | invoice_id | uuid | ✓ | - | - |
| 4 | amount | numeric | ✗ | - | - |
| 5 | payment_date | date | ✓ | CURRENT_DATE | - |
| 6 | payment_method | payment_method | ✓ | - | - |
| 7 | status | payment_status | ✓ | 'completed'::payment_status | - |
| 8 | transaction_id | text | ✓ | - | - |
| 9 | reference_number | text | ✓ | - | - |
| 10 | notes | text | ✓ | - | - |
| 11 | processed_by | uuid | ✓ | - | - |
| 12 | created_at | timestamp with time zone | ✓ | now() | - |

## 79. permission_sets
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | name | text | ✗ | - | - |
| 4 | label | text | ✗ | - | - |
| 5 | description | text | ✓ | - | - |
| 6 | is_profile | boolean | ✓ | false | - |
| 7 | license_type | text | ✓ | 'standard'::text | - |
| 8 | created_at | timestamp with time zone | ✓ | now() | - |
| 9 | updated_at | timestamp with time zone | ✓ | now() | - |
| 10 | created_by | uuid | ✓ | - | - |

## 80. products
Rows: 5

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | name | text | ✗ | - | - |
| 4 | sku | text | ✓ | - | - |
| 5 | code | text | ✓ | - | - |
| 6 | description | text | ✓ | - | - |
| 7 | category | text | ✓ | - | - |
| 8 | type | text | ✓ | - | - |
| 9 | unit_price | numeric | ✓ | - | - |
| 10 | cost_price | numeric | ✓ | - | - |
| 11 | tax_rate | numeric | ✓ | - | - |
| 12 | is_active | boolean | ✓ | true | - |
| 13 | stock_level | integer | ✓ | - | - |
| 14 | reorder_point | integer | ✓ | - | - |
| 15 | reorder_quantity | integer | ✓ | - | - |
| 16 | specifications | text | ✓ | - | - |
| 17 | images | _text[] | ✓ | - | - |
| 18 | dimensions | jsonb | ✓ | - | - |
| 19 | weight | jsonb | ✓ | - | - |
| 20 | manufacturer | text | ✓ | - | - |
| 21 | supplier | text | ✓ | - | - |
| 22 | supplier_sku | text | ✓ | - | - |
| 23 | warranty_months | integer | ✓ | - | - |
| 24 | warranty_details | text | ✓ | - | - |
| 25 | tags | _text[] | ✓ | - | - |
| 26 | custom_fields | jsonb | ✓ | - | - |
| 27 | created_at | timestamp with time zone | ✓ | now() | - |
| 28 | updated_at | timestamp with time zone | ✓ | now() | - |
| 29 | created_by | text | ✓ | - | - |

## 81. public_group_members
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | group_id | uuid | ✗ | - | public_groups.id |
| 4 | member_type | text | ✗ | - | - |
| 5 | member_id | uuid | ✗ | - | - |

## 82. public_groups
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | name | text | ✗ | - | - |
| 4 | label | text | ✗ | - | - |
| 5 | description | text | ✓ | - | - |
| 6 | created_at | timestamp with time zone | ✓ | now() | - |
| 7 | updated_at | timestamp with time zone | ✓ | now() | - |
| 8 | created_by | uuid | ✓ | - | - |

## 83. purchase_orders
Rows: 2

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | po_number | text | ✓ | - | - |
| 4 | supplier_id | uuid | ✓ | - | - |
| 5 | account_id | uuid | ✓ | - | accounts.id |
| 6 | status | text | ✓ | 'Draft'::text | - |
| 7 | items | jsonb | ✓ | - | - |
| 8 | total | numeric | ✓ | - | - |
| 9 | linked_job_id | uuid | ✓ | - | - |
| 10 | expected_delivery | date | ✓ | - | - |
| 11 | created_at | timestamp with time zone | ✓ | now() | - |
| 12 | updated_at | timestamp with time zone | ✓ | now() | - |
| 13 | created_by | text | ✓ | - | - |

## 84. queue_members
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | queue_id | uuid | ✗ | - | queues.id |
| 4 | user_id | uuid | ✗ | - | - |
| 5 | last_assigned_at | timestamp with time zone | ✓ | - | - |
| 6 | current_load | integer | ✓ | 0 | - |
| 7 | is_active | boolean | ✓ | true | - |

## 85. queues
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | name | text | ✗ | - | - |
| 4 | description | text | ✓ | - | - |
| 5 | object_types | _text[] | ✗ | ARRAY['leads'::text, 'tickets' | - |
| 6 | queue_type | text | ✓ | 'round_robin'::text | - |
| 7 | queue_email | text | ✓ | - | - |
| 8 | is_active | boolean | ✓ | true | - |
| 9 | created_at | timestamp with time zone | ✓ | now() | - |
| 10 | updated_at | timestamp with time zone | ✓ | now() | - |
| 11 | created_by | uuid | ✓ | - | - |

## 86. quote_line_items
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | gen_random_uuid() | - |
| 2 | quote_id | uuid | ✗ | - | - |
| 3 | product_name | text | ✗ | - | - |
| 4 | description | text | ✓ | - | - |
| 5 | quantity | numeric | ✗ | 1 | - |
| 6 | unit_price | numeric | ✗ | 0 | - |
| 7 | discount_percent | numeric | ✗ | 0 | - |
| 8 | line_total | numeric | ✗ | 0 | - |
| 9 | sort_order | integer | ✗ | 0 | - |
| 10 | created_at | timestamp with time zone | ✗ | now() | - |

## 87. quotes
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | quote_number | text | ✓ | - | - |
| 4 | deal_id | uuid | ✓ | - | deals.id |
| 5 | account_id | uuid | ✓ | - | accounts.id |
| 6 | status | text | ✓ | 'Draft'::text | - |
| 7 | issue_date | date | ✓ | - | - |
| 8 | expiry_date | date | ✓ | - | - |
| 9 | line_items | jsonb | ✓ | - | - |
| 10 | subtotal | numeric | ✓ | - | - |
| 11 | tax_total | numeric | ✓ | - | - |
| 12 | total | numeric | ✓ | - | - |
| 13 | notes | text | ✓ | - | - |
| 14 | terms | text | ✓ | - | - |
| 15 | accepted_at | timestamp with time zone | ✓ | - | - |
| 16 | accepted_by | text | ✓ | - | - |
| 17 | superseded_by | uuid | ✓ | - | - |
| 18 | version | integer | ✓ | 1 | - |
| 19 | created_at | timestamp with time zone | ✓ | now() | - |
| 20 | updated_at | timestamp with time zone | ✓ | now() | - |
| 21 | created_by | text | ✓ | - | - |

## 88. record_type_assignments
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | record_type_id | uuid | ✗ | - | record_types.id |
| 4 | permission_set_id | uuid | ✗ | - | permission_sets.id |
| 5 | is_default | boolean | ✓ | false | - |
| 6 | created_at | timestamp with time zone | ✓ | now() | - |

## 89. record_types
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | object_type | text | ✗ | - | - |
| 4 | name | text | ✗ | - | - |
| 5 | label | text | ✗ | - | - |
| 6 | description | text | ✓ | - | - |
| 7 | business_process_id | uuid | ✓ | - | - |
| 8 | picklist_mappings | jsonb | ✓ | '{}'::jsonb | - |
| 9 | is_default | boolean | ✓ | false | - |
| 10 | is_active | boolean | ✓ | true | - |
| 11 | created_at | timestamp with time zone | ✓ | now() | - |
| 12 | updated_at | timestamp with time zone | ✓ | now() | - |
| 13 | created_by | uuid | ✓ | - | - |

## 90. referral_rewards
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | referrer_id | uuid | ✓ | - | - |
| 4 | referred_lead_id | uuid | ✓ | - | - |
| 5 | reward_amount | numeric | ✓ | - | - |
| 6 | status | text | ✓ | 'Active'::text | - |
| 7 | payout_date | date | ✓ | - | - |
| 8 | notes | text | ✓ | - | - |
| 9 | created_at | timestamp with time zone | ✓ | now() | - |
| 10 | updated_at | timestamp with time zone | ✓ | now() | - |
| 11 | created_by | text | ✓ | - | - |

## 91. reviews
Rows: 3

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | author_name | text | ✓ | - | - |
| 4 | rating | integer | ✓ | - | - |
| 5 | content | text | ✓ | - | - |
| 6 | platform | text | ✓ | - | - |
| 7 | status | text | ✓ | 'New'::text | - |
| 8 | replied | boolean | ✓ | false | - |
| 9 | reply_content | text | ✓ | - | - |
| 10 | replied_at | timestamp with time zone | ✓ | - | - |
| 11 | job_id | uuid | ✓ | - | - |
| 12 | account_id | uuid | ✓ | - | accounts.id |
| 13 | sentiment | text | ✓ | - | - |
| 14 | created_at | timestamp with time zone | ✓ | now() | - |
| 15 | updated_at | timestamp with time zone | ✓ | now() | - |
| 16 | created_by | text | ✓ | - | - |

## 92. roles
Rows: 6

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | name | text | ✗ | - | - |
| 4 | label | text | ✗ | - | - |
| 5 | description | text | ✓ | - | - |
| 6 | parent_role_id | uuid | ✓ | - | roles.id |
| 7 | hierarchy_level | integer | ✗ | 1 | - |
| 8 | can_view_all_data | boolean | ✓ | false | - |
| 9 | can_modify_all_data | boolean | ✓ | false | - |
| 10 | portal_type | text | ✓ | 'internal'::text | - |
| 11 | created_at | timestamp with time zone | ✓ | now() | - |
| 12 | updated_at | timestamp with time zone | ✓ | now() | - |
| 13 | created_by | uuid | ✓ | - | - |

## 93. scheduled_action_queue
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | scheduled_action_id | uuid | ✗ | - | scheduled_actions.id |
| 4 | status | text | ✓ | 'queued'::text | - |
| 5 | processing_started_at | timestamp with time zone | ✓ | - | - |
| 6 | processing_completed_at | timestamp with time zone | ✓ | - | - |
| 7 | created_at | timestamp with time zone | ✓ | now() | - |

## 94. scheduled_actions
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | action_type | text | ✗ | - | - |
| 4 | action_config | jsonb | ✗ | - | - |
| 5 | object_type | text | ✗ | - | - |
| 6 | record_id | uuid | ✗ | - | - |
| 7 | scheduled_for | timestamp with time zone | ✗ | - | - |
| 8 | executed_at | timestamp with time zone | ✓ | - | - |
| 9 | status | text | ✓ | 'pending'::text | - |
| 10 | error_message | text | ✓ | - | - |
| 11 | created_at | timestamp with time zone | ✓ | now() | - |
| 12 | created_by | uuid | ✓ | - | - |

## 95. services
Rows: 4

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | name | text | ✗ | - | - |
| 4 | code | text | ✓ | - | - |
| 5 | sku | text | ✓ | - | - |
| 6 | description | text | ✓ | - | - |
| 7 | category | text | ✓ | - | - |
| 8 | type | text | ✓ | - | - |
| 9 | billing_cycle | text | ✓ | 'one-off'::text | - |
| 10 | unit_price | numeric | ✓ | - | - |
| 11 | cost_price | numeric | ✓ | - | - |
| 12 | tax_rate | numeric | ✓ | - | - |
| 13 | is_active | boolean | ✓ | true | - |
| 14 | duration_hours | integer | ✓ | - | - |
| 15 | duration_minutes | integer | ✓ | - | - |
| 16 | prerequisites | text | ✓ | - | - |
| 17 | deliverables | text | ✓ | - | - |
| 18 | sla_hours | integer | ✓ | - | - |
| 19 | requires_equipment | boolean | ✓ | false | - |
| 20 | equipment_list | _text[] | ✓ | - | - |
| 21 | certification_required | text | ✓ | - | - |
| 22 | images | _text[] | ✓ | - | - |
| 23 | tags | _text[] | ✓ | - | - |
| 24 | custom_fields | jsonb | ✓ | - | - |
| 25 | created_at | timestamp with time zone | ✓ | now() | - |
| 26 | updated_at | timestamp with time zone | ✓ | now() | - |
| 27 | created_by | text | ✓ | - | - |
| 28 | skills_required | jsonb | ✓ | - | - |
| 29 | crew_size | numeric | ✓ | - | - |
| 30 | equipment_needed | jsonb | ✓ | - | - |
| 31 | sla_response_hours | numeric | ✓ | - | - |
| 32 | sla_completion_days | numeric | ✓ | - | - |
| 33 | quality_checklist | jsonb | ✓ | - | - |

## 96. session_settings
Rows: 1

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | session_timeout_minutes | integer | ✓ | 120 | - |
| 4 | lock_after_inactivity_minutes | integer | ✓ | 15 | - |
| 5 | password_min_length | integer | ✓ | 8 | - |
| 6 | password_require_uppercase | boolean | ✓ | true | - |
| 7 | password_require_lowercase | boolean | ✓ | true | - |
| 8 | password_require_number | boolean | ✓ | true | - |
| 9 | password_require_special | boolean | ✓ | true | - |
| 10 | password_expiry_days | integer | ✓ | 90 | - |
| 11 | password_history_count | integer | ✓ | 5 | - |
| 12 | max_failed_attempts | integer | ✓ | 5 | - |
| 13 | lockout_duration_minutes | integer | ✓ | 30 | - |
| 14 | require_2fa_for_roles | _text[] | ✓ | '{}'::text[] | - |
| 15 | updated_at | timestamp with time zone | ✓ | now() | - |
| 16 | updated_by | uuid | ✓ | - | - |

## 97. setup_audit_trail
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | action_type | text | ✗ | - | - |
| 4 | object_type | text | ✗ | - | - |
| 5 | object_id | uuid | ✓ | - | - |
| 6 | object_name | text | ✓ | - | - |
| 7 | before_value | jsonb | ✓ | - | - |
| 8 | after_value | jsonb | ✓ | - | - |
| 9 | changed_fields | _text[] | ✓ | - | - |
| 10 | performed_at | timestamp with time zone | ✓ | now() | - |
| 11 | performed_by | uuid | ✓ | - | - |
| 12 | performed_by_delegate | uuid | ✓ | - | - |

## 98. sharing_rules
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | name | text | ✗ | - | - |
| 4 | object_type | text | ✗ | - | - |
| 5 | owned_by_type | text | ✗ | - | - |
| 6 | owned_by_id | uuid | ✓ | - | - |
| 7 | share_with_type | text | ✗ | - | - |
| 8 | share_with_id | uuid | ✓ | - | - |
| 9 | access_level | text | ✗ | 'read'::text | - |
| 10 | criteria | jsonb | ✓ | '{}'::jsonb | - |
| 11 | is_active | boolean | ✓ | true | - |
| 12 | created_at | timestamp with time zone | ✓ | now() | - |
| 13 | updated_at | timestamp with time zone | ✓ | now() | - |
| 14 | created_by | uuid | ✓ | - | - |

## 99. sms_messages
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | direction | sms_direction | ✗ | - | - |
| 4 | from_number | text | ✗ | - | - |
| 5 | to_number | text | ✗ | - | - |
| 6 | content | text | ✗ | - | - |
| 7 | status | sms_status | ✓ | 'draft'::sms_status | - |
| 8 | external_id | text | ✓ | - | - |
| 9 | provider_name | text | ✓ | - | - |
| 10 | error_message | text | ✓ | - | - |
| 11 | retry_count | integer | ✓ | 0 | - |
| 12 | sent_at | timestamp with time zone | ✓ | - | - |
| 13 | delivered_at | timestamp with time zone | ✓ | - | - |
| 14 | related_to_type | text | ✓ | - | - |
| 15 | related_to_id | uuid | ✓ | - | - |
| 16 | sent_by | uuid | ✓ | - | - |
| 17 | created_at | timestamp with time zone | ✓ | now() | - |

## 100. sms_templates
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | name | text | ✗ | - | - |
| 4 | description | text | ✓ | - | - |
| 5 | content | text | ✗ | - | - |
| 6 | category | text | ✓ | - | - |
| 7 | is_active | boolean | ✓ | true | - |
| 8 | usage_count | integer | ✓ | 0 | - |
| 9 | last_used_at | timestamp with time zone | ✓ | - | - |
| 10 | created_at | timestamp with time zone | ✓ | now() | - |
| 11 | updated_at | timestamp with time zone | ✓ | now() | - |
| 12 | created_by | uuid | ✓ | - | - |

## 101. subscription_items
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | subscription_id | uuid | ✓ | - | subscriptions.id |
| 4 | product_id | uuid | ✓ | - | - |
| 5 | service_id | uuid | ✓ | - | - |
| 6 | name | text | ✗ | - | - |
| 7 | quantity | integer | ✓ | 1 | - |
| 8 | unit_price | numeric | ✓ | - | - |
| 9 | created_at | timestamp with time zone | ✓ | now() | - |

## 102. subscriptions
Rows: 2

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | account_id | uuid | ✓ | - | - |
| 4 | contact_id | uuid | ✓ | - | - |
| 5 | name | text | ✗ | - | - |
| 6 | status | subscription_status | ✓ | 'active'::subscription_status | - |
| 7 | billing_period | text | ✓ | 'monthly'::text | - |
| 8 | amount | numeric | ✓ | - | - |
| 9 | currency | text | ✓ | 'AUD'::text | - |
| 10 | start_date | date | ✓ | CURRENT_DATE | - |
| 11 | end_date | date | ✓ | - | - |
| 12 | next_billing_date | date | ✓ | - | - |
| 13 | trial_end_date | date | ✓ | - | - |
| 14 | cancelled_at | timestamp with time zone | ✓ | - | - |
| 15 | payment_method | payment_method | ✓ | - | - |
| 16 | owner_id | uuid | ✓ | - | - |
| 17 | custom_fields | jsonb | ✓ | '{}'::jsonb | - |
| 18 | created_at | timestamp with time zone | ✓ | now() | - |
| 19 | updated_at | timestamp with time zone | ✓ | now() | - |
| 20 | created_by | uuid | ✓ | - | - |
| 21 | billing_cycle | text | ✓ | - | - |
| 22 | next_bill_date | date | ✓ | - | - |
| 23 | items | jsonb | ✓ | - | - |
| 24 | auto_generate_invoice | boolean | ✓ | false | - |
| 25 | last_invoice_id | uuid | ✓ | - | - |

## 103. tasks
Rows: 3

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | title | text | ✗ | - | - |
| 4 | description | text | ✓ | - | - |
| 5 | assignee_id | uuid | ✓ | - | users.id |
| 6 | due_date | date | ✓ | - | - |
| 7 | status | text | ✓ | 'pending'::text | - |
| 8 | priority | text | ✓ | 'medium'::text | - |
| 9 | related_to_id | uuid | ✓ | - | - |
| 10 | related_to_type | text | ✓ | - | - |
| 11 | completed | boolean | ✓ | false | - |
| 12 | completed_at | timestamp with time zone | ✓ | - | - |
| 13 | created_at | timestamp with time zone | ✓ | now() | - |
| 14 | updated_at | timestamp with time zone | ✓ | now() | - |
| 15 | created_by | text | ✓ | - | - |

## 104. team_members
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | team_id | uuid | ✗ | - | teams.id |
| 4 | user_id | uuid | ✗ | - | - |
| 5 | role_in_team | text | ✓ | 'member'::text | - |
| 6 | joined_at | timestamp with time zone | ✓ | now() | - |

## 105. teams
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | name | text | ✗ | - | - |
| 4 | description | text | ✓ | - | - |
| 5 | parent_team_id | uuid | ✓ | - | teams.id |
| 6 | team_type | text | ✓ | 'sales'::text | - |
| 7 | manager_id | uuid | ✓ | - | - |
| 8 | is_active | boolean | ✓ | true | - |
| 9 | created_at | timestamp with time zone | ✓ | now() | - |
| 10 | updated_at | timestamp with time zone | ✓ | now() | - |
| 11 | created_by | uuid | ✓ | - | - |

## 106. territories
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | name | text | ✗ | - | - |
| 4 | description | text | ✓ | - | - |
| 5 | parent_territory_id | uuid | ✓ | - | territories.id |
| 6 | criteria | jsonb | ✓ | '{}'::jsonb | - |
| 7 | forecast_manager_id | uuid | ✓ | - | - |
| 8 | is_active | boolean | ✓ | true | - |
| 9 | created_at | timestamp with time zone | ✓ | now() | - |
| 10 | updated_at | timestamp with time zone | ✓ | now() | - |
| 11 | created_by | uuid | ✓ | - | - |

## 107. territory_assignments
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | territory_id | uuid | ✗ | - | territories.id |
| 4 | user_id | uuid | ✗ | - | - |
| 5 | role_in_territory | text | ✓ | 'member'::text | - |
| 6 | assigned_at | timestamp with time zone | ✓ | now() | - |

## 108. ticket_messages
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | ticket_id | uuid | ✓ | - | - |
| 4 | content | text | ✗ | - | - |
| 5 | is_internal | boolean | ✓ | false | - |
| 6 | sender_id | uuid | ✓ | - | - |
| 7 | sender_name | text | ✓ | - | - |
| 8 | sender_email | text | ✓ | - | - |
| 9 | attachments | jsonb | ✓ | '[]'::jsonb | - |
| 10 | created_at | timestamp with time zone | ✓ | now() | - |

## 109. tickets
Rows: 2

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | ticket_number | text | ✓ | - | - |
| 4 | subject | text | ✗ | - | - |
| 5 | description | text | ✓ | - | - |
| 6 | requester_id | uuid | ✓ | - | - |
| 7 | account_id | uuid | ✓ | - | accounts.id |
| 8 | assignee_id | uuid | ✓ | - | users.id |
| 9 | status | text | ✓ | 'open'::text | - |
| 10 | priority | text | ✓ | 'medium'::text | - |
| 11 | sla_deadline | timestamp with time zone | ✓ | - | - |
| 12 | messages | jsonb | ✓ | - | - |
| 13 | internal_notes | jsonb | ✓ | - | - |
| 14 | custom_data | jsonb | ✓ | - | - |
| 15 | related_to_id | uuid | ✓ | - | - |
| 16 | related_to_type | text | ✓ | - | - |
| 17 | created_at | timestamp with time zone | ✓ | now() | - |
| 18 | updated_at | timestamp with time zone | ✓ | now() | - |
| 19 | created_by | text | ✓ | - | - |

## 110. user_permission_sets
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | user_id | uuid | ✗ | - | - |
| 4 | permission_set_id | uuid | ✗ | - | permission_sets.id |
| 5 | assigned_at | timestamp with time zone | ✓ | now() | - |
| 6 | assigned_by | uuid | ✓ | - | - |

## 111. users
Rows: 6

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✓ | - | organizations.id |
| 3 | name | text | ✗ | - | - |
| 4 | email | text | ✗ | - | - |
| 5 | role | text | ✗ | - | - |
| 6 | team | text | ✓ | - | - |
| 7 | manager_id | uuid | ✓ | - | users.id |
| 8 | avatar | text | ✓ | - | - |
| 9 | created_at | timestamp with time zone | ✓ | now() | - |
| 10 | updated_at | timestamp with time zone | ✓ | now() | - |
| 11 | created_by | text | ✓ | - | - |

## 112. validation_rules
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | object_type | text | ✗ | - | - |
| 4 | name | text | ✗ | - | - |
| 5 | description | text | ✓ | - | - |
| 6 | evaluate_on | _text[] | ✓ | ARRAY['create'::text, 'update' | - |
| 7 | condition | jsonb | ✗ | - | - |
| 8 | error_message | text | ✗ | - | - |
| 9 | error_location | text | ✓ | 'top'::text | - |
| 10 | error_field | text | ✓ | - | - |
| 11 | is_active | boolean | ✓ | true | - |
| 12 | created_at | timestamp with time zone | ✓ | now() | - |
| 13 | updated_at | timestamp with time zone | ✓ | now() | - |
| 14 | created_by | uuid | ✓ | - | - |

## 113. warehouses
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | name | text | ✗ | - | - |
| 4 | location | text | ✓ | - | - |
| 5 | capacity | integer | ✓ | - | - |
| 6 | status | text | ✓ | 'active'::text | - |
| 7 | created_at | timestamp with time zone | ✓ | now() | - |
| 8 | updated_at | timestamp with time zone | ✓ | now() | - |
| 9 | created_by | text | ✓ | - | - |
| 10 | address | text | ✓ | - | - |
| 11 | is_default | boolean | ✗ | - | - |

## 114. webhook_configs
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | name | text | ✗ | - | - |
| 4 | url | text | ✗ | - | - |
| 5 | event_type | text | ✗ | - | - |
| 6 | secret_key | text | ✓ | - | - |
| 7 | custom_headers | jsonb | ✓ | '{}'::jsonb | - |
| 8 | is_active | boolean | ✓ | true | - |
| 9 | total_calls | integer | ✓ | 0 | - |
| 10 | last_called_at | timestamp with time zone | ✓ | - | - |
| 11 | last_status_code | integer | ✓ | - | - |
| 12 | created_at | timestamp with time zone | ✓ | now() | - |
| 13 | updated_at | timestamp with time zone | ✓ | now() | - |

## 115. webhook_logs
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | webhook_config_id | uuid | ✓ | - | webhook_configs.id |
| 4 | url | text | ✗ | - | - |
| 5 | method | text | ✓ | 'POST'::text | - |
| 6 | headers | jsonb | ✓ | - | - |
| 7 | payload | jsonb | ✓ | - | - |
| 8 | status_code | integer | ✓ | - | - |
| 9 | response_body | text | ✓ | - | - |
| 10 | response_time_ms | integer | ✓ | - | - |
| 11 | error_message | text | ✓ | - | - |
| 12 | retry_count | integer | ✓ | 0 | - |
| 13 | created_at | timestamp with time zone | ✓ | now() | - |

## 116. webhooks
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | name | text | ✗ | - | - |
| 4 | url | text | ✗ | - | - |
| 5 | method | text | ✓ | 'POST'::text | - |
| 6 | headers | jsonb | ✓ | - | - |
| 7 | is_active | boolean | ✓ | true | - |
| 8 | trigger_event | text | ✓ | - | - |
| 9 | last_triggered_at | timestamp with time zone | ✓ | - | - |
| 10 | success_count | integer | ✓ | 0 | - |
| 11 | failure_count | integer | ✓ | 0 | - |
| 12 | created_at | timestamp with time zone | ✓ | now() | - |
| 13 | updated_at | timestamp with time zone | ✓ | now() | - |
| 14 | created_by | text | ✓ | - | - |

## 117. workflow_actions
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | workflow_rule_id | uuid | ✓ | - | workflow_rules.id |
| 4 | action_type | workflow_action_type | ✗ | - | - |
| 5 | action_order | integer | ✓ | 0 | - |
| 6 | config | jsonb | ✗ | - | - |
| 7 | delay_hours | integer | ✓ | 0 | - |
| 8 | created_at | timestamp with time zone | ✓ | now() | - |

## 118. workflow_rules
Rows: 0

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | - |
| 3 | name | text | ✗ | - | - |
| 4 | description | text | ✓ | - | - |
| 5 | object_type | text | ✗ | - | - |
| 6 | trigger_type | workflow_trigger_type | ✗ | - | - |
| 7 | trigger_field | text | ✓ | - | - |
| 8 | evaluation_criteria | text | ✓ | 'created'::text | - |
| 9 | conditions | jsonb | ✓ | '{"and": []}'::jsonb | - |
| 10 | is_active | boolean | ✓ | true | - |
| 11 | execution_order | integer | ✓ | 0 | - |
| 12 | times_triggered | integer | ✓ | 0 | - |
| 13 | last_triggered_at | timestamp with time zone | ✓ | - | - |
| 14 | created_at | timestamp with time zone | ✓ | now() | - |
| 15 | updated_at | timestamp with time zone | ✓ | now() | - |
| 16 | created_by | uuid | ✓ | - | - |

## 119. zones
Rows: 3

| # | Column | Type | Nullable | Default | FK → |
|---|--------|------|----------|---------|------|
| 1 | 🔑 id | uuid | ✗ | uuid_generate_v4() | - |
| 2 | org_id | uuid | ✗ | - | organizations.id |
| 3 | name | text | ✗ | - | - |
| 4 | region | text | ✓ | - | - |
| 5 | description | text | ✓ | - | - |
| 6 | color | text | ✓ | - | - |
| 7 | type | text | ✓ | - | - |
| 8 | status | text | ✓ | 'active'::text | - |
| 9 | coordinates | text | ✓ | - | - |
| 10 | created_at | timestamp with time zone | ✓ | now() | - |
| 11 | updated_at | timestamp with time zone | ✓ | now() | - |
| 12 | created_by | text | ✓ | - | - |

