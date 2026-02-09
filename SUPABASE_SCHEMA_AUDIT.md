# SUPABASE SCHEMA AUDIT
Generated: 2026-02-08T15:44:35.089Z
Tables: 112

## accounts (23 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| industry | text | YES | - |
| website | text | YES | - |
| employee_count | integer | YES | - |
| avatar | text | YES | - |
| tier | text | YES | - |
| email | text | YES | - |
| phone | text | YES | - |
| city | text | YES | - |
| state | text | YES | - |
| logo | text | YES | - |
| revenue | numeric | YES | - |
| status | text | YES | 'active'::text |
| type | text | YES | 'customer'::text |
| owner_id | uuid | YES | - |
| commission_rate | numeric | YES | - |
| custom_data | jsonb | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | text | YES | - |
| address | text | YES | - |

## api_logs (10 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| endpoint | text | NO | - |
| method | text | NO | - |
| user_id | uuid | YES | - |
| status_code | integer | NO | - |
| response_time_ms | integer | YES | - |
| request_size_bytes | integer | YES | - |
| response_size_bytes | integer | YES | - |
| created_at | timestamp with time zone | NO | now() |

## api_logs_y2026m01 (10 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| endpoint | text | NO | - |
| method | text | NO | - |
| user_id | uuid | YES | - |
| status_code | integer | NO | - |
| response_time_ms | integer | YES | - |
| request_size_bytes | integer | YES | - |
| response_size_bytes | integer | YES | - |
| created_at | timestamp with time zone | NO | now() |

## api_rate_limits (8 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| requests_per_day | integer | YES | 100000 |
| requests_per_hour | integer | YES | 10000 |
| requests_per_minute | integer | YES | 200 |
| burst_allowance | integer | YES | 50 |
| updated_at | timestamp with time zone | YES | now() |
| updated_by | uuid | YES | - |

## approval_processes (20 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| object_type | text | NO | - |
| name | text | NO | - |
| label | text | NO | - |
| description | text | YES | - |
| entry_criteria | jsonb | YES | '{}'::jsonb |
| who_can_submit | text | YES | 'record_owner'::text |
| default_approver_type | text | NO | - |
| default_approver_id | uuid | YES | - |
| allow_recall | boolean | YES | true |
| require_unanimous | boolean | YES | false |
| initial_submission_actions | jsonb | YES | '[]'::jsonb |
| approval_actions | jsonb | YES | '[]'::jsonb |
| rejection_actions | jsonb | YES | '[]'::jsonb |
| recall_actions | jsonb | YES | '[]'::jsonb |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## approval_requests (17 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| approval_process_id | uuid | NO | - |
| approval_step_id | uuid | YES | - |
| object_type | text | NO | - |
| record_id | uuid | NO | - |
| status | text | NO | 'pending'::text |
| current_step_number | integer | YES | 1 |
| submitted_by | uuid | NO | - |
| submitted_at | timestamp with time zone | YES | now() |
| assigned_to_id | uuid | YES | - |
| responded_by | uuid | YES | - |
| responded_at | timestamp with time zone | YES | - |
| comments | text | YES | - |
| final_status | text | YES | - |
| completed_at | timestamp with time zone | YES | - |
| created_at | timestamp with time zone | YES | now() |

## approval_steps (13 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| approval_process_id | uuid | NO | - |
| step_number | integer | NO | - |
| name | text | NO | - |
| description | text | YES | - |
| criteria | jsonb | YES | '{}'::jsonb |
| approver_type | text | NO | - |
| approver_id | uuid | YES | - |
| approver_field | text | YES | - |
| approve_automatically | boolean | YES | false |
| reject_behavior | text | YES | 'final_rejection'::text |
| created_at | timestamp with time zone | YES | now() |

## assignment_rule_entries (12 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| assignment_rule_id | uuid | NO | - |
| sort_order | integer | NO | 0 |
| criteria | jsonb | NO | '{}'::jsonb |
| assignment_type | text | NO | - |
| assign_to_id | uuid | YES | - |
| queue_id | uuid | YES | - |
| notify_assignee | boolean | YES | true |
| email_template_id | uuid | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

## assignment_rules (9 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| object_type | text | NO | - |
| name | text | NO | - |
| description | text | YES | - |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## audit_log (12 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | YES | - |
| entity_type | text | YES | - |
| entity_id | uuid | YES | - |
| action | text | YES | - |
| previous_value | text | YES | - |
| new_value | text | YES | - |
| metadata | jsonb | YES | - |
| batch_id | uuid | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | text | YES | - |

## audit_logs (12 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| entity_type | text | NO | - |
| entity_id | uuid | NO | - |
| action | text | NO | - |
| old_values | jsonb | YES | - |
| new_values | jsonb | YES | - |
| user_id | uuid | YES | - |
| user_name | text | YES | - |
| created_at | timestamp with time zone | YES | now() |
| ip_address | inet | YES | - |
| user_agent | text | YES | - |

## auto_response_entries (12 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| auto_response_rule_id | uuid | NO | - |
| sort_order | integer | NO | 0 |
| criteria | jsonb | NO | '{}'::jsonb |
| email_template_id | uuid | YES | - |
| sms_template_id | uuid | YES | - |
| from_name | text | YES | - |
| from_email | text | YES | - |
| reply_to | text | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

## auto_response_rules (9 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| object_type | text | NO | - |
| name | text | NO | - |
| description | text | YES | - |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## bank_transactions (18 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| date | date | YES | - |
| description | text | YES | - |
| amount | numeric | YES | - |
| type | text | YES | - |
| status | text | YES | 'unmatched'::text |
| match_confidence | text | YES | - |
| matched_to_id | uuid | YES | - |
| matched_to_type | text | YES | - |
| reconciled | boolean | YES | false |
| reconciled_at | timestamp with time zone | YES | - |
| reconciled_by | uuid | YES | - |
| bank_reference | text | YES | - |
| notes | text | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | text | YES | - |

## business_hours (8 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| timezone | text | NO | 'Australia/Sydney'::text |
| schedule | jsonb | NO | '{"friday": {"end": "17:00", " |
| is_default | boolean | YES | false |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

## calendar_events (15 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| title | text | NO | - |
| description | text | YES | - |
| start_time | timestamp with time zone | NO | - |
| end_time | timestamp with time zone | YES | - |
| type | text | YES | - |
| location | text | YES | - |
| related_to_type | text | YES | - |
| related_to_id | uuid | YES | - |
| priority | text | YES | - |
| is_all_day | boolean | YES | false |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | text | YES | - |

## campaigns (20 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| type | text | YES | - |
| budget | numeric | YES | - |
| spent | numeric | YES | 0 |
| revenue | numeric | YES | 0 |
| revenue_generated | numeric | YES | 0 |
| leads_generated | integer | YES | 0 |
| status | text | YES | 'Planning'::text |
| start_date | date | YES | - |
| end_date | date | YES | - |
| description | text | YES | - |
| expected_cpl | numeric | YES | - |
| target_audience | text | YES | - |
| template_id | uuid | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | text | YES | - |
| expected_c_p_l | numeric | YES | - |

## chat_messages (10 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| conversation_id | uuid | YES | - |
| content | text | NO | - |
| sender_id | uuid | YES | - |
| mentions | ARRAY | YES | - |
| attachments | jsonb | YES | '[]'::jsonb |
| is_edited | boolean | YES | false |
| edited_at | timestamp with time zone | YES | - |
| created_at | timestamp with time zone | YES | now() |

## communications (15 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| type | text | YES | - |
| subject | text | YES | - |
| content | text | YES | - |
| direction | text | YES | - |
| related_to_type | text | YES | - |
| related_to_id | uuid | YES | - |
| outcome | text | YES | - |
| next_step | text | YES | - |
| next_follow_up_date | date | YES | - |
| metadata | jsonb | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | text | YES | - |

## company_settings (21 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| company_name | text | NO | - |
| legal_name | text | YES | - |
| abn | text | YES | - |
| tax_id | text | YES | - |
| address_street | text | YES | - |
| address_city | text | YES | - |
| address_state | text | YES | - |
| address_postal_code | text | YES | - |
| address_country | text | YES | 'Australia'::text |
| phone | text | YES | - |
| fax | text | YES | - |
| website | text | YES | - |
| default_currency | text | YES | 'AUD'::text |
| default_timezone | text | YES | 'Australia/Sydney'::text |
| default_locale | text | YES | 'en-AU'::text |
| fiscal_year_start_month | integer | YES | 7 |
| enable_multiple_currencies | boolean | YES | false |
| updated_at | timestamp with time zone | YES | now() |
| updated_by | uuid | YES | - |

## contacts (18 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| account_id | uuid | YES | - |
| email | text | YES | - |
| phone | text | YES | - |
| mobile | text | YES | - |
| title | text | YES | - |
| avatar | text | YES | - |
| company | text | YES | - |
| department | text | YES | - |
| is_primary | boolean | YES | false |
| status | text | YES | 'active'::text |
| custom_data | jsonb | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | text | YES | - |
| address | text | YES | - |

## conversations (9 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | YES | - |
| type | text | YES | 'direct'::text |
| participants | ARRAY | YES | - |
| is_active | boolean | YES | true |
| last_message_at | timestamp with time zone | YES | - |
| created_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## credit_notes (12 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| credit_note_number | text | YES | - |
| invoice_id | uuid | YES | - |
| amount | numeric | NO | - |
| reason | text | YES | - |
| notes | text | YES | - |
| issue_date | date | YES | CURRENT_DATE |
| status | text | YES | 'issued'::text |
| applied_at | timestamp with time zone | YES | - |
| created_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## crews (11 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| leader_id | uuid | YES | - |
| member_ids | ARRAY | YES | - |
| color | text | YES | - |
| specialty | text | YES | - |
| status | text | YES | 'active'::text |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | text | YES | - |

## crm_settings (14 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| lead_statuses | ARRAY | YES | ARRAY['New'::text, 'Contacted' |
| lead_sources | ARRAY | YES | ARRAY['Website'::text, 'Referr |
| deal_stages | ARRAY | YES | ARRAY['Prospecting'::text, 'Qu |
| ticket_statuses | ARRAY | YES | ARRAY['Open'::text, 'In Progre |
| ticket_priorities | ARRAY | YES | ARRAY['Low'::text, 'Medium'::t |
| task_statuses | ARRAY | YES | ARRAY['Not Started'::text, 'In |
| task_priorities | ARRAY | YES | ARRAY['Low'::text, 'Medium'::t |
| default_currency | text | YES | 'AUD'::text |
| default_timezone | text | YES | 'Australia/Sydney'::text |
| fiscal_year_start_month | integer | YES | 7 |
| updated_at | timestamp with time zone | YES | now() |
| updated_by | uuid | YES | - |

## currencies (11 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| iso_code | text | NO | - |
| name | text | NO | - |
| symbol | text | NO | - |
| conversion_rate | numeric | YES | 1.0 |
| decimal_places | integer | YES | 2 |
| is_active | boolean | YES | true |
| is_corporate | boolean | YES | false |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

## custom_fields (30 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| object_type | text | NO | - |
| api_name | text | NO | - |
| label | text | NO | - |
| description | text | YES | - |
| help_text | text | YES | - |
| data_type | text | NO | - |
| length | integer | YES | - |
| precision_digits | integer | YES | - |
| decimal_places | integer | YES | - |
| picklist_values | jsonb | YES | - |
| lookup_object | text | YES | - |
| lookup_relationship_name | text | YES | - |
| formula | text | YES | - |
| formula_return_type | text | YES | - |
| is_required | boolean | YES | false |
| is_unique | boolean | YES | false |
| min_value | numeric | YES | - |
| max_value | numeric | YES | - |
| regex_pattern | text | YES | - |
| regex_error_message | text | YES | - |
| default_value | text | YES | - |
| display_order | integer | YES | 0 |
| is_visible | boolean | YES | true |
| is_read_only | boolean | YES | false |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## custom_objects (20 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| api_name | text | NO | - |
| label | text | NO | - |
| plural_label | text | NO | - |
| description | text | YES | - |
| icon_name | text | YES | 'custom'::text |
| enable_activities | boolean | YES | true |
| enable_notes | boolean | YES | true |
| enable_search | boolean | YES | true |
| enable_reports | boolean | YES | true |
| record_name_label | text | YES | 'Name'::text |
| record_name_format | text | YES | 'text'::text |
| auto_number_format | text | YES | - |
| auto_number_start | integer | YES | 1 |
| is_deployed | boolean | YES | false |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## data_retention_policies (10 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| object_type | text | NO | - |
| retention_days | integer | NO | - |
| criteria | jsonb | YES | '{}'::jsonb |
| action | text | YES | 'delete'::text |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## dated_exchange_rates (7 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| from_currency | text | NO | - |
| to_currency | text | NO | - |
| rate | numeric | NO | - |
| rate_date | date | NO | - |
| created_at | timestamp with time zone | YES | now() |

## deals (23 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| account_id | uuid | YES | - |
| contact_id | uuid | YES | - |
| amount | numeric | YES | - |
| stage | text | YES | 'qualification'::text |
| probability | integer | YES | 50 |
| expected_close_date | date | YES | - |
| assignee_id | uuid | YES | - |
| avatar | text | YES | - |
| stage_entry_date | timestamp with time zone | YES | - |
| campaign_id | uuid | YES | - |
| commission_rate | numeric | YES | - |
| commission_amount | numeric | YES | - |
| lead_id | uuid | YES | - |
| won_at | timestamp with time zone | YES | - |
| created_account_id | uuid | YES | - |
| created_contact_id | uuid | YES | - |
| custom_data | jsonb | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | text | YES | - |

## dependent_picklists (7 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| controlling_field_id | uuid | NO | - |
| dependent_field_id | uuid | NO | - |
| value_mapping | jsonb | NO | '{}'::jsonb |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

## documents (18 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| file_type | text | YES | - |
| file_size | integer | YES | - |
| file_url | text | YES | - |
| related_to_type | text | NO | - |
| related_to_id | uuid | NO | - |
| content_text | text | YES | - |
| embedding | USER-DEFINED | YES | - |
| processing_status | text | YES | 'pending'::text |
| processed_at | timestamp with time zone | YES | - |
| uploaded_by | uuid | YES | - |
| version | integer | YES | 1 |
| parent_document_id | uuid | YES | - |
| description | text | YES | - |
| tags | ARRAY | YES | - |
| created_at | timestamp with time zone | YES | now() |

## duplicate_rules (9 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| object_type | text | NO | - |
| name | text | NO | - |
| description | text | YES | - |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## email_accounts (14 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| user_id | uuid | YES | - |
| email_address | text | NO | - |
| display_name | text | YES | - |
| provider | text | YES | 'gmail'::text |
| access_token_encrypted | text | YES | - |
| refresh_token_encrypted | text | YES | - |
| is_active | boolean | YES | true |
| last_sync_at | timestamp with time zone | YES | - |
| sync_token | text | YES | - |
| sync_enabled | boolean | YES | true |
| sync_frequency_minutes | integer | YES | 5 |
| created_at | timestamp with time zone | YES | now() |

## email_letterheads (16 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| description | text | YES | - |
| header_html | text | YES | - |
| header_height | integer | YES | 100 |
| footer_html | text | YES | - |
| footer_height | integer | YES | 50 |
| logo_url | text | YES | - |
| logo_width | integer | YES | 200 |
| logo_height | integer | YES | 50 |
| background_color | text | YES | '#FFFFFF'::text |
| text_color | text | YES | '#000000'::text |
| is_default | boolean | YES | false |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

## email_sequence_enrollments (10 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| email_sequence_id | uuid | YES | - |
| contact_id | uuid | YES | - |
| lead_id | uuid | YES | - |
| status | text | YES | 'active'::text |
| current_step | integer | YES | 1 |
| enrolled_at | timestamp with time zone | YES | now() |
| completed_at | timestamp with time zone | YES | - |
| created_at | timestamp with time zone | YES | now() |

## email_sequence_steps (8 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| email_sequence_id | uuid | YES | - |
| step_number | integer | NO | - |
| name | text | NO | - |
| delay_days | integer | YES | 0 |
| email_template_id | uuid | YES | - |
| created_at | timestamp with time zone | YES | now() |

## email_sequences (9 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| description | text | YES | - |
| is_active | boolean | YES | true |
| total_enrolled | integer | YES | 0 |
| total_completed | integer | YES | 0 |
| created_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## email_settings (14 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| bounce_handling_enabled | boolean | YES | true |
| dkim_enabled | boolean | YES | false |
| dkim_domain | text | YES | - |
| enable_enhanced_email_security | boolean | YES | true |
| enable_sender_id | boolean | YES | true |
| daily_email_limit | integer | YES | 5000 |
| hourly_email_limit | integer | YES | 1000 |
| enable_email_tracking | boolean | YES | true |
| track_opens | boolean | YES | true |
| track_clicks | boolean | YES | true |
| updated_at | timestamp with time zone | YES | now() |
| updated_by | uuid | YES | - |

## email_templates (19 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| description | text | YES | - |
| subject | text | YES | - |
| body_html | text | YES | - |
| body_text | text | YES | - |
| category | text | YES | - |
| folder | text | YES | - |
| from_name | text | YES | - |
| from_email | text | YES | - |
| reply_to | text | YES | - |
| attachments | jsonb | YES | '[]'::jsonb |
| is_active | boolean | YES | true |
| usage_count | integer | YES | 0 |
| last_used_at | timestamp with time zone | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## email_threads (15 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| gmail_thread_id | text | YES | - |
| subject | text | YES | - |
| participants | ARRAY | YES | - |
| related_to_type | text | YES | - |
| related_to_id | uuid | YES | - |
| is_unread | boolean | YES | true |
| is_starred | boolean | YES | false |
| labels | ARRAY | YES | - |
| message_count | integer | YES | 0 |
| first_message_at | timestamp with time zone | YES | - |
| last_message_at | timestamp with time zone | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

## email_tracking_settings (7 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| track_email_opens | boolean | YES | true |
| track_link_clicks | boolean | YES | true |
| notify_on_open | boolean | YES | false |
| notify_on_click | boolean | YES | false |
| updated_at | timestamp with time zone | YES | now() |

## emails (31 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| email_thread_id | uuid | YES | - |
| gmail_message_id | text | YES | - |
| from_address | text | YES | - |
| from_name | text | YES | - |
| to_addresses | ARRAY | YES | - |
| cc_addresses | ARRAY | YES | - |
| bcc_addresses | ARRAY | YES | - |
| reply_to | text | YES | - |
| subject | text | YES | - |
| body_text | text | YES | - |
| body_html | text | YES | - |
| snippet | text | YES | - |
| has_attachments | boolean | YES | false |
| attachments | jsonb | YES | '[]'::jsonb |
| status | USER-DEFINED | YES | 'sent'::email_status |
| is_incoming | boolean | YES | true |
| is_unread | boolean | YES | true |
| is_starred | boolean | YES | false |
| labels | ARRAY | YES | - |
| opened_at | timestamp with time zone | YES | - |
| open_count | integer | YES | 0 |
| clicked_at | timestamp with time zone | YES | - |
| click_count | integer | YES | 0 |
| related_to_type | text | YES | - |
| related_to_id | uuid | YES | - |
| sent_by | uuid | YES | - |
| sent_at | timestamp with time zone | YES | - |
| received_at | timestamp with time zone | YES | - |
| created_at | timestamp with time zone | YES | now() |

## equipment (18 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| type | text | YES | - |
| barcode | text | YES | - |
| condition | text | YES | 'Good'::text |
| location | text | YES | - |
| assigned_to | uuid | YES | - |
| last_service_date | date | YES | - |
| next_service_date | date | YES | - |
| purchase_date | date | YES | - |
| purchase_price | numeric | YES | - |
| model | text | YES | - |
| status | text | YES | 'available'::text |
| value | numeric | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | text | YES | - |

## escalation_actions (12 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| escalation_rule_id | uuid | NO | - |
| age_minutes | integer | NO | - |
| age_field | text | YES | 'created_at'::text |
| criteria | jsonb | YES | '{}'::jsonb |
| reassign_to_id | uuid | YES | - |
| notify_user_ids | ARRAY | YES | '{}'::uuid[] |
| email_template_id | uuid | YES | - |
| sort_order | integer | YES | 0 |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

## escalation_rules (11 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| object_type | text | NO | - |
| name | text | NO | - |
| description | text | YES | - |
| is_active | boolean | YES | true |
| use_business_hours | boolean | YES | true |
| business_hours_id | uuid | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## expenses (12 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| vendor | text | YES | - |
| amount | numeric | YES | - |
| category | text | YES | - |
| date | date | YES | - |
| status | text | YES | 'Pending'::text |
| receipt_url | text | YES | - |
| approved_by | uuid | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | text | YES | - |

## export_jobs (16 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| object_type | text | NO | - |
| export_format | text | YES | 'csv'::text |
| filters | jsonb | YES | '{}'::jsonb |
| fields | ARRAY | NO | - |
| status | text | NO | 'pending'::text |
| file_url | text | YES | - |
| file_size | bigint | YES | - |
| record_count | integer | YES | 0 |
| error_message | text | YES | - |
| started_at | timestamp with time zone | YES | - |
| completed_at | timestamp with time zone | YES | - |
| expires_at | timestamp with time zone | YES | - |
| created_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## field_history (9 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| object_type | text | NO | - |
| record_id | uuid | NO | - |
| field_name | text | NO | - |
| old_value | text | YES | - |
| new_value | text | YES | - |
| changed_at | timestamp with time zone | YES | now() |
| changed_by | uuid | YES | - |

## field_history_tracking (7 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| object_type | text | NO | - |
| field_name | text | NO | - |
| is_tracked | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## field_permissions (7 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| permission_set_id | uuid | NO | - |
| object_type | text | NO | - |
| field_name | text | NO | - |
| can_read | boolean | YES | true |
| can_edit | boolean | YES | true |

## fiscal_year_settings (6 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| start_month | integer | NO | 7 |
| naming_convention | text | YES | 'start_year'::text |
| updated_at | timestamp with time zone | YES | now() |
| updated_by | uuid | YES | - |

## holidays (10 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| holiday_date | date | NO | - |
| is_recurring | boolean | YES | false |
| recurrence_type | text | YES | - |
| recurrence_day | integer | YES | - |
| recurrence_month | integer | YES | - |
| business_hours_id | uuid | YES | - |
| created_at | timestamp with time zone | YES | now() |

## import_jobs (18 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| object_type | text | NO | - |
| operation | text | NO | 'insert'::text |
| file_name | text | NO | - |
| file_size | bigint | YES | - |
| file_url | text | YES | - |
| field_mapping | jsonb | NO | - |
| status | text | NO | 'pending'::text |
| total_rows | integer | YES | 0 |
| processed_rows | integer | YES | 0 |
| success_count | integer | YES | 0 |
| error_count | integer | YES | 0 |
| errors | jsonb | YES | '[]'::jsonb |
| started_at | timestamp with time zone | YES | - |
| completed_at | timestamp with time zone | YES | - |
| created_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## inventory_items (11 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| sku | text | YES | - |
| warehouse_qty | integer | YES | 0 |
| reorder_point | integer | YES | - |
| category | text | YES | - |
| unit_price | numeric | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | text | YES | - |

## invoices (26 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| invoice_number | text | YES | - |
| account_id | uuid | YES | - |
| deal_id | uuid | YES | - |
| quote_id | uuid | YES | - |
| status | text | YES | 'Draft'::text |
| payment_status | text | YES | 'unpaid'::text |
| issue_date | date | YES | - |
| invoice_date | date | YES | - |
| due_date | date | YES | - |
| sent_at | timestamp with time zone | YES | - |
| paid_at | timestamp with time zone | YES | - |
| line_items | jsonb | YES | - |
| subtotal | numeric | YES | - |
| tax_total | numeric | YES | - |
| total | numeric | YES | - |
| amount_paid | numeric | YES | 0 |
| balance_due | numeric | YES | - |
| notes | text | YES | - |
| terms | text | YES | - |
| late_fee_rate | numeric | YES | - |
| credits | jsonb | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | text | YES | - |

## ip_restrictions (9 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| permission_set_id | uuid | YES | - |
| ip_start | inet | NO | - |
| ip_end | inet | NO | - |
| description | text | YES | - |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

## jobs (28 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| job_number | text | YES | - |
| name | text | YES | - |
| subject | text | YES | - |
| description | text | YES | - |
| account_id | uuid | YES | - |
| assignee_id | uuid | YES | - |
| crew_id | uuid | YES | - |
| job_type | text | YES | - |
| status | text | YES | 'Scheduled'::text |
| priority | text | YES | 'medium'::text |
| zone | text | YES | - |
| estimated_duration | integer | YES | - |
| scheduled_date | date | YES | - |
| scheduled_end_date | date | YES | - |
| completed_at | timestamp with time zone | YES | - |
| lat | numeric | YES | - |
| lng | numeric | YES | - |
| job_fields | jsonb | YES | - |
| swms_signed | boolean | YES | false |
| completion_signature | text | YES | - |
| evidence_photos | ARRAY | YES | - |
| bom | jsonb | YES | - |
| invoice_id | uuid | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | text | YES | - |

## kb_articles (16 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| title | text | NO | - |
| content | text | NO | - |
| summary | text | YES | - |
| category_id | uuid | YES | - |
| author_id | uuid | YES | - |
| keywords | ARRAY | YES | - |
| status | text | YES | 'draft'::text |
| published_at | timestamp with time zone | YES | - |
| is_public | boolean | YES | true |
| view_count | integer | YES | 0 |
| helpful_count | integer | YES | 0 |
| not_helpful_count | integer | YES | 0 |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

## kb_categories (9 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| description | text | YES | - |
| parent_category_id | uuid | YES | - |
| sort_order | integer | YES | 0 |
| is_public | boolean | YES | true |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |

## leads (29 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| company | text | YES | - |
| email | text | YES | - |
| phone | text | YES | - |
| status | text | YES | 'new'::text |
| source | text | YES | - |
| campaign_id | uuid | YES | - |
| estimated_value | numeric | YES | - |
| avatar | text | YES | - |
| score | integer | YES | 0 |
| address_street | text | YES | - |
| address_suburb | text | YES | - |
| address_state | text | YES | - |
| address_postcode | text | YES | - |
| address_country | text | YES | - |
| last_contact_date | timestamp with time zone | YES | - |
| notes | text | YES | - |
| commission_rate | numeric | YES | - |
| converted_to_deal_id | uuid | YES | - |
| converted_at | timestamp with time zone | YES | - |
| converted_by | text | YES | - |
| custom_data | jsonb | YES | - |
| assigned_to | uuid | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | text | YES | - |
| address | text | YES | - |

## line_items (16 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| related_to_type | text | NO | - |
| related_to_id | uuid | NO | - |
| item_type | text | YES | 'product'::text |
| product_id | uuid | YES | - |
| service_id | uuid | YES | - |
| name | text | NO | - |
| description | text | YES | - |
| quantity | numeric | YES | 1 |
| unit_price | numeric | YES | - |
| discount_percent | numeric | YES | 0 |
| tax_rate | numeric | YES | 10 |
| line_total | numeric | YES | - |
| sort_order | integer | YES | 0 |
| created_at | timestamp with time zone | YES | now() |

## login_history (13 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | YES | - |
| user_id | uuid | YES | - |
| login_time | timestamp with time zone | YES | now() |
| logout_time | timestamp with time zone | YES | - |
| ip_address | inet | YES | - |
| country | text | YES | - |
| city | text | YES | - |
| browser | text | YES | - |
| platform | text | YES | - |
| device_type | text | YES | 'desktop'::text |
| status | text | NO | 'success'::text |
| failure_reason | text | YES | - |

## mass_operation_jobs (18 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| object_type | text | NO | - |
| operation_type | text | NO | - |
| filters | jsonb | NO | - |
| estimated_count | integer | YES | - |
| field_updates | jsonb | YES | - |
| new_owner_id | uuid | YES | - |
| status | text | NO | 'pending'::text |
| total_records | integer | YES | 0 |
| processed_records | integer | YES | 0 |
| success_count | integer | YES | 0 |
| error_count | integer | YES | 0 |
| errors | jsonb | YES | '[]'::jsonb |
| started_at | timestamp with time zone | YES | - |
| completed_at | timestamp with time zone | YES | - |
| created_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## matching_rules (7 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| duplicate_rule_id | uuid | NO | - |
| field_name | text | NO | - |
| matching_method | text | NO | 'exact'::text |
| fuzzy_threshold | numeric | YES | 0.8 |
| created_at | timestamp with time zone | YES | now() |

## notifications (12 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| user_id | uuid | YES | - |
| type | text | NO | - |
| title | text | NO | - |
| content | text | YES | - |
| action_url | text | YES | - |
| related_to_type | text | YES | - |
| related_to_id | uuid | YES | - |
| is_read | boolean | YES | false |
| read_at | timestamp with time zone | YES | - |
| created_at | timestamp with time zone | YES | now() |

## object_permissions (10 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| permission_set_id | uuid | NO | - |
| object_type | text | NO | - |
| can_create | boolean | YES | false |
| can_read | boolean | YES | false |
| can_edit | boolean | YES | false |
| can_delete | boolean | YES | false |
| can_view_all | boolean | YES | false |
| can_modify_all | boolean | YES | false |

## organization_wide_addresses (11 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| display_name | text | NO | - |
| email_address | text | NO | - |
| purpose | text | YES | 'general'::text |
| is_verified | boolean | YES | false |
| verified_at | timestamp with time zone | YES | - |
| allow_all_profiles | boolean | YES | true |
| allowed_profile_ids | ARRAY | YES | '{}'::uuid[] |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

## organizations (14 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| name | text | NO | - |
| slug | text | YES | - |
| plan | text | YES | 'free'::text |
| subscription_status | text | YES | 'active'::text |
| trial_ends_at | timestamp with time zone | YES | - |
| user_limit | integer | YES | 5 |
| storage_limit_gb | integer | YES | 10 |
| api_calls_per_day | integer | YES | 1000 |
| current_user_count | integer | YES | 0 |
| current_storage_bytes | bigint | YES | 0 |
| settings | jsonb | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

## page_layout_assignments (6 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| page_layout_id | uuid | NO | - |
| assignment_type | text | NO | - |
| assignment_id | uuid | NO | - |
| created_at | timestamp with time zone | YES | now() |

## page_layouts (13 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| object_type | text | NO | - |
| name | text | NO | - |
| description | text | YES | - |
| layout_sections | jsonb | NO | '[]'::jsonb |
| related_lists | jsonb | YES | '[]'::jsonb |
| available_buttons | ARRAY | YES | ARRAY['edit'::text, 'delete':: |
| is_default | boolean | YES | false |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## payments (12 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| invoice_id | uuid | YES | - |
| amount | numeric | NO | - |
| payment_date | date | YES | CURRENT_DATE |
| payment_method | USER-DEFINED | YES | - |
| status | USER-DEFINED | YES | 'completed'::payment_status |
| transaction_id | text | YES | - |
| reference_number | text | YES | - |
| notes | text | YES | - |
| processed_by | uuid | YES | - |
| created_at | timestamp with time zone | YES | now() |

## permission_sets (10 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| label | text | NO | - |
| description | text | YES | - |
| is_profile | boolean | YES | false |
| license_type | text | YES | 'standard'::text |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## products (30 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| sku | text | YES | - |
| code | text | YES | - |
| description | text | YES | - |
| category | text | YES | - |
| type | text | YES | - |
| unit_price | numeric | YES | - |
| cost_price | numeric | YES | - |
| tax_rate | numeric | YES | - |
| is_active | boolean | YES | true |
| stock_level | integer | YES | - |
| reorder_point | integer | YES | - |
| reorder_quantity | integer | YES | - |
| specifications | text | YES | - |
| images | ARRAY | YES | - |
| dimensions | jsonb | YES | - |
| weight | jsonb | YES | - |
| manufacturer | text | YES | - |
| supplier | text | YES | - |
| supplier_sku | text | YES | - |
| warranty_months | integer | YES | - |
| warranty_details | text | YES | - |
| tags | ARRAY | YES | - |
| custom_fields | jsonb | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | text | YES | - |
| supplier_s_k_u | text | YES | - |

## public_group_members (5 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| group_id | uuid | NO | - |
| member_type | text | NO | - |
| member_id | uuid | NO | - |

## public_groups (8 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| label | text | NO | - |
| description | text | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## purchase_orders (13 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| po_number | text | YES | - |
| supplier_id | uuid | YES | - |
| account_id | uuid | YES | - |
| status | text | YES | 'Draft'::text |
| items | jsonb | YES | - |
| total | numeric | YES | - |
| linked_job_id | uuid | YES | - |
| expected_delivery | date | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | text | YES | - |

## queue_members (7 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| queue_id | uuid | NO | - |
| user_id | uuid | NO | - |
| last_assigned_at | timestamp with time zone | YES | - |
| current_load | integer | YES | 0 |
| is_active | boolean | YES | true |

## queues (11 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| description | text | YES | - |
| object_types | ARRAY | NO | ARRAY['leads'::text, 'tickets' |
| queue_type | text | YES | 'round_robin'::text |
| queue_email | text | YES | - |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## quote_line_items (10 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| quote_id | uuid | NO | - |
| product_name | text | NO | - |
| description | text | YES | - |
| quantity | numeric | NO | 1 |
| unit_price | numeric | NO | 0 |
| discount_percent | numeric | NO | 0 |
| line_total | numeric | NO | 0 |
| sort_order | integer | NO | 0 |
| created_at | timestamp with time zone | NO | now() |

## quotes (21 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| quote_number | text | YES | - |
| deal_id | uuid | YES | - |
| account_id | uuid | YES | - |
| status | text | YES | 'Draft'::text |
| issue_date | date | YES | - |
| expiry_date | date | YES | - |
| line_items | jsonb | YES | - |
| subtotal | numeric | YES | - |
| tax_total | numeric | YES | - |
| total | numeric | YES | - |
| notes | text | YES | - |
| terms | text | YES | - |
| accepted_at | timestamp with time zone | YES | - |
| accepted_by | text | YES | - |
| superseded_by | uuid | YES | - |
| version | integer | YES | 1 |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | text | YES | - |

## record_type_assignments (6 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| record_type_id | uuid | NO | - |
| permission_set_id | uuid | NO | - |
| is_default | boolean | YES | false |
| created_at | timestamp with time zone | YES | now() |

## record_types (13 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| object_type | text | NO | - |
| name | text | NO | - |
| label | text | NO | - |
| description | text | YES | - |
| business_process_id | uuid | YES | - |
| picklist_mappings | jsonb | YES | '{}'::jsonb |
| is_default | boolean | YES | false |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## reviews (16 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| author_name | text | YES | - |
| rating | integer | YES | - |
| content | text | YES | - |
| platform | text | YES | - |
| status | text | YES | 'New'::text |
| replied | boolean | YES | false |
| reply_content | text | YES | - |
| replied_at | timestamp with time zone | YES | - |
| job_id | uuid | YES | - |
| account_id | uuid | YES | - |
| sentiment | text | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | text | YES | - |

## roles (13 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| label | text | NO | - |
| description | text | YES | - |
| parent_role_id | uuid | YES | - |
| hierarchy_level | integer | NO | 1 |
| can_view_all_data | boolean | YES | false |
| can_modify_all_data | boolean | YES | false |
| portal_type | text | YES | 'internal'::text |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## scheduled_action_queue (7 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| scheduled_action_id | uuid | NO | - |
| status | text | YES | 'queued'::text |
| processing_started_at | timestamp with time zone | YES | - |
| processing_completed_at | timestamp with time zone | YES | - |
| created_at | timestamp with time zone | YES | now() |

## scheduled_actions (12 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| action_type | text | NO | - |
| action_config | jsonb | NO | - |
| object_type | text | NO | - |
| record_id | uuid | NO | - |
| scheduled_for | timestamp with time zone | NO | - |
| executed_at | timestamp with time zone | YES | - |
| status | text | YES | 'pending'::text |
| error_message | text | YES | - |
| created_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## services (33 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| code | text | YES | - |
| sku | text | YES | - |
| description | text | YES | - |
| category | text | YES | - |
| type | text | YES | - |
| billing_cycle | text | YES | 'one-off'::text |
| unit_price | numeric | YES | - |
| cost_price | numeric | YES | - |
| tax_rate | numeric | YES | - |
| is_active | boolean | YES | true |
| duration_hours | integer | YES | - |
| duration_minutes | integer | YES | - |
| prerequisites | text | YES | - |
| deliverables | text | YES | - |
| sla_hours | integer | YES | - |
| requires_equipment | boolean | YES | false |
| equipment_list | ARRAY | YES | - |
| certification_required | text | YES | - |
| images | ARRAY | YES | - |
| tags | ARRAY | YES | - |
| custom_fields | jsonb | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | text | YES | - |
| skills_required | jsonb | YES | - |
| crew_size | numeric | YES | - |
| equipment_needed | jsonb | YES | - |
| sla_response_hours | numeric | YES | - |
| sla_completion_days | numeric | YES | - |
| quality_checklist | jsonb | YES | - |

## session_settings (16 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| session_timeout_minutes | integer | YES | 120 |
| lock_after_inactivity_minutes | integer | YES | 15 |
| password_min_length | integer | YES | 8 |
| password_require_uppercase | boolean | YES | true |
| password_require_lowercase | boolean | YES | true |
| password_require_number | boolean | YES | true |
| password_require_special | boolean | YES | true |
| password_expiry_days | integer | YES | 90 |
| password_history_count | integer | YES | 5 |
| max_failed_attempts | integer | YES | 5 |
| lockout_duration_minutes | integer | YES | 30 |
| require_2fa_for_roles | ARRAY | YES | '{}'::text[] |
| updated_at | timestamp with time zone | YES | now() |
| updated_by | uuid | YES | - |

## setup_audit_trail (12 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| action_type | text | NO | - |
| object_type | text | NO | - |
| object_id | uuid | YES | - |
| object_name | text | YES | - |
| before_value | jsonb | YES | - |
| after_value | jsonb | YES | - |
| changed_fields | ARRAY | YES | - |
| performed_at | timestamp with time zone | YES | now() |
| performed_by | uuid | YES | - |
| performed_by_delegate | uuid | YES | - |

## sharing_rules (14 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| object_type | text | NO | - |
| owned_by_type | text | NO | - |
| owned_by_id | uuid | YES | - |
| share_with_type | text | NO | - |
| share_with_id | uuid | YES | - |
| access_level | text | NO | 'read'::text |
| criteria | jsonb | YES | '{}'::jsonb |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## sms_messages (17 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| direction | USER-DEFINED | NO | - |
| from_number | text | NO | - |
| to_number | text | NO | - |
| content | text | NO | - |
| status | USER-DEFINED | YES | 'draft'::sms_status |
| external_id | text | YES | - |
| provider_name | text | YES | - |
| error_message | text | YES | - |
| retry_count | integer | YES | 0 |
| sent_at | timestamp with time zone | YES | - |
| delivered_at | timestamp with time zone | YES | - |
| related_to_type | text | YES | - |
| related_to_id | uuid | YES | - |
| sent_by | uuid | YES | - |
| created_at | timestamp with time zone | YES | now() |

## sms_templates (12 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| description | text | YES | - |
| content | text | NO | - |
| category | text | YES | - |
| is_active | boolean | YES | true |
| usage_count | integer | YES | 0 |
| last_used_at | timestamp with time zone | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## subscription_items (9 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| subscription_id | uuid | YES | - |
| product_id | uuid | YES | - |
| service_id | uuid | YES | - |
| name | text | NO | - |
| quantity | integer | YES | 1 |
| unit_price | numeric | YES | - |
| created_at | timestamp with time zone | YES | now() |

## subscriptions (20 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| account_id | uuid | YES | - |
| contact_id | uuid | YES | - |
| name | text | NO | - |
| status | USER-DEFINED | YES | 'active'::subscription_status |
| billing_period | text | YES | 'monthly'::text |
| amount | numeric | YES | - |
| currency | text | YES | 'AUD'::text |
| start_date | date | YES | CURRENT_DATE |
| end_date | date | YES | - |
| next_billing_date | date | YES | - |
| trial_end_date | date | YES | - |
| cancelled_at | timestamp with time zone | YES | - |
| payment_method | USER-DEFINED | YES | - |
| owner_id | uuid | YES | - |
| custom_fields | jsonb | YES | '{}'::jsonb |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## tasks (15 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| title | text | NO | - |
| description | text | YES | - |
| assignee_id | uuid | YES | - |
| due_date | date | YES | - |
| status | text | YES | 'pending'::text |
| priority | text | YES | 'medium'::text |
| related_to_id | uuid | YES | - |
| related_to_type | text | YES | - |
| completed | boolean | YES | false |
| completed_at | timestamp with time zone | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | text | YES | - |

## team_members (6 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| team_id | uuid | NO | - |
| user_id | uuid | NO | - |
| role_in_team | text | YES | 'member'::text |
| joined_at | timestamp with time zone | YES | now() |

## teams (11 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| description | text | YES | - |
| parent_team_id | uuid | YES | - |
| team_type | text | YES | 'sales'::text |
| manager_id | uuid | YES | - |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## territories (11 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| description | text | YES | - |
| parent_territory_id | uuid | YES | - |
| criteria | jsonb | YES | '{}'::jsonb |
| forecast_manager_id | uuid | YES | - |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## territory_assignments (6 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| territory_id | uuid | NO | - |
| user_id | uuid | NO | - |
| role_in_territory | text | YES | 'member'::text |
| assigned_at | timestamp with time zone | YES | now() |

## ticket_messages (10 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| ticket_id | uuid | YES | - |
| content | text | NO | - |
| is_internal | boolean | YES | false |
| sender_id | uuid | YES | - |
| sender_name | text | YES | - |
| sender_email | text | YES | - |
| attachments | jsonb | YES | '[]'::jsonb |
| created_at | timestamp with time zone | YES | now() |

## tickets (19 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| ticket_number | text | YES | - |
| subject | text | NO | - |
| description | text | YES | - |
| requester_id | uuid | YES | - |
| account_id | uuid | YES | - |
| assignee_id | uuid | YES | - |
| status | text | YES | 'open'::text |
| priority | text | YES | 'medium'::text |
| sla_deadline | timestamp with time zone | YES | - |
| messages | jsonb | YES | - |
| internal_notes | jsonb | YES | - |
| custom_data | jsonb | YES | - |
| related_to_id | uuid | YES | - |
| related_to_type | text | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | text | YES | - |

## user_permission_sets (6 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| user_id | uuid | NO | - |
| permission_set_id | uuid | NO | - |
| assigned_at | timestamp with time zone | YES | now() |
| assigned_by | uuid | YES | - |

## users (46 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| instance_id | uuid | YES | - |
| org_id | uuid | YES | - |
| id | uuid | NO | - |
| name | text | NO | - |
| aud | character varying | YES | - |
| email | text | NO | - |
| role | character varying | YES | - |
| role | text | NO | - |
| email | character varying | YES | - |
| encrypted_password | character varying | YES | - |
| team | text | YES | - |
| email_confirmed_at | timestamp with time zone | YES | - |
| manager_id | uuid | YES | - |
| avatar | text | YES | - |
| invited_at | timestamp with time zone | YES | - |
| confirmation_token | character varying | YES | - |
| created_at | timestamp with time zone | YES | now() |
| confirmation_sent_at | timestamp with time zone | YES | - |
| updated_at | timestamp with time zone | YES | now() |
| created_by | text | YES | - |
| recovery_token | character varying | YES | - |
| recovery_sent_at | timestamp with time zone | YES | - |
| email_change_token_new | character varying | YES | - |
| email_change | character varying | YES | - |
| email_change_sent_at | timestamp with time zone | YES | - |
| last_sign_in_at | timestamp with time zone | YES | - |
| raw_app_meta_data | jsonb | YES | - |
| raw_user_meta_data | jsonb | YES | - |
| is_super_admin | boolean | YES | - |
| created_at | timestamp with time zone | YES | - |
| updated_at | timestamp with time zone | YES | - |
| phone | text | YES | NULL::character varying |
| phone_confirmed_at | timestamp with time zone | YES | - |
| phone_change | text | YES | ''::character varying |
| phone_change_token | character varying | YES | ''::character varying |
| phone_change_sent_at | timestamp with time zone | YES | - |
| confirmed_at | timestamp with time zone | YES | - |
| email_change_token_current | character varying | YES | ''::character varying |
| email_change_confirm_status | smallint | YES | 0 |
| banned_until | timestamp with time zone | YES | - |
| reauthentication_token | character varying | YES | ''::character varying |
| reauthentication_sent_at | timestamp with time zone | YES | - |
| is_sso_user | boolean | NO | false |
| deleted_at | timestamp with time zone | YES | - |
| is_anonymous | boolean | NO | false |

## validation_rules (14 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| object_type | text | NO | - |
| name | text | NO | - |
| description | text | YES | - |
| evaluate_on | ARRAY | YES | ARRAY['create'::text, 'update' |
| condition | jsonb | NO | - |
| error_message | text | NO | - |
| error_location | text | YES | 'top'::text |
| error_field | text | YES | - |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## warehouses (11 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| location | text | YES | - |
| capacity | integer | YES | - |
| status | text | YES | 'active'::text |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | text | YES | - |
| address | text | YES | - |
| is_default | boolean | NO | - |

## webhook_configs (13 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| url | text | NO | - |
| event_type | text | NO | - |
| secret_key | text | YES | - |
| custom_headers | jsonb | YES | '{}'::jsonb |
| is_active | boolean | YES | true |
| total_calls | integer | YES | 0 |
| last_called_at | timestamp with time zone | YES | - |
| last_status_code | integer | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

## webhook_logs (13 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| webhook_config_id | uuid | YES | - |
| url | text | NO | - |
| method | text | YES | 'POST'::text |
| headers | jsonb | YES | - |
| payload | jsonb | YES | - |
| status_code | integer | YES | - |
| response_body | text | YES | - |
| response_time_ms | integer | YES | - |
| error_message | text | YES | - |
| retry_count | integer | YES | 0 |
| created_at | timestamp with time zone | YES | now() |

## workflow_actions (8 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| workflow_rule_id | uuid | YES | - |
| action_type | USER-DEFINED | NO | - |
| action_order | integer | YES | 0 |
| config | jsonb | NO | - |
| delay_hours | integer | YES | 0 |
| created_at | timestamp with time zone | YES | now() |

## workflow_rules (16 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| description | text | YES | - |
| object_type | text | NO | - |
| trigger_type | USER-DEFINED | NO | - |
| trigger_field | text | YES | - |
| evaluation_criteria | text | YES | 'created'::text |
| conditions | jsonb | YES | '{"and": []}'::jsonb |
| is_active | boolean | YES | true |
| execution_order | integer | YES | 0 |
| times_triggered | integer | YES | 0 |
| last_triggered_at | timestamp with time zone | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES | - |

## zones (12 columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| org_id | uuid | NO | - |
| name | text | NO | - |
| region | text | YES | - |
| description | text | YES | - |
| color | text | YES | - |
| type | text | YES | - |
| status | text | YES | 'active'::text |
| coordinates | text | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | text | YES | - |

