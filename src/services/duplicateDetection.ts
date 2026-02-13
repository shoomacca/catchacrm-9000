import { supabase } from '../lib/supabase';
import { getCurrentOrgId } from './supabaseData';
import { EntityType } from '../types';

export interface DuplicateRule {
  id: string;
  org_id: string;
  entity_type: string;
  name: string;
  description?: string;
  match_fields: string[][];
  match_logic: 'OR' | 'AND';
  is_active: boolean;
  priority: number;
}

export interface DuplicateMatch {
  id: string;
  record: any;
  matchedOn: Record<string, any>;
  confidenceScore: number;
}

export interface DuplicateCheckResult {
  hasDuplicates: boolean;
  matches: DuplicateMatch[];
  ruleId?: string;
}

/**
 * Get duplicate rules for an entity type
 */
export async function getDuplicateRules(entityType: string): Promise<DuplicateRule[]> {
  const orgId = await getCurrentOrgId();
  if (!orgId) {
    console.error('No org_id found for duplicate rules');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('duplicate_rules')
      .select('*')
      .eq('org_id', orgId)
      .eq('entity_type', entityType)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) {
      console.error('Error fetching duplicate rules:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Exception fetching duplicate rules:', err);
    return [];
  }
}

/**
 * Check for duplicates before creating a record
 */
export async function checkForDuplicates(
  entityType: EntityType,
  recordData: any
): Promise<DuplicateCheckResult> {
  const orgId = await getCurrentOrgId();
  if (!orgId) {
    return { hasDuplicates: false, matches: [] };
  }

  // Get active rules for this entity type
  const rules = await getDuplicateRules(entityType);
  if (rules.length === 0) {
    return { hasDuplicates: false, matches: [] };
  }

  const allMatches: DuplicateMatch[] = [];
  let matchedRuleId: string | undefined;

  // Check each rule
  for (const rule of rules) {
    const matches = await findMatchingRecords(entityType, recordData, rule);
    if (matches.length > 0) {
      allMatches.push(...matches);
      matchedRuleId = rule.id;
      break; // Stop at first rule that finds matches
    }
  }

  return {
    hasDuplicates: allMatches.length > 0,
    matches: allMatches,
    ruleId: matchedRuleId
  };
}

/**
 * Find matching records based on a duplicate rule
 */
async function findMatchingRecords(
  entityType: EntityType,
  recordData: any,
  rule: DuplicateRule
): Promise<DuplicateMatch[]> {
  const orgId = await getCurrentOrgId();
  if (!orgId) return [];

  const tableName = getTableName(entityType);
  if (!tableName) return [];

  try {
    // Build query based on match fields
    let query = supabase
      .from(tableName)
      .select('*')
      .eq('org_id', orgId);

    // Apply match logic
    if (rule.match_logic === 'OR') {
      // Match on ANY of the field combinations
      const orConditions: any[] = [];

      for (const fieldGroup of rule.match_fields) {
        const hasAllFields = fieldGroup.every(field => {
          const value = getNestedValue(recordData, field);
          return value !== null && value !== undefined && value !== '';
        });

        if (hasAllFields) {
          const andCondition: any = {};
          fieldGroup.forEach(field => {
            andCondition[field] = getNestedValue(recordData, field);
          });
          orConditions.push(andCondition);
        }
      }

      if (orConditions.length === 0) {
        return [];
      }

      // For OR logic with multiple conditions, we need to fetch and filter manually
      const { data, error } = await query;

      if (error) {
        console.error('Error querying for duplicates:', error);
        return [];
      }

      const matches = (data || []).filter(record => {
        return orConditions.some(condition => {
          return Object.entries(condition).every(([field, value]) => {
            const recordValue = getNestedValue(record, field);
            return normalizeValue(recordValue) === normalizeValue(value);
          });
        });
      });

      return matches.map(record => ({
        id: record.id,
        record,
        matchedOn: findMatchedFields(record, recordData, rule.match_fields),
        confidenceScore: 1.0
      }));

    } else {
      // AND logic: all field groups must match
      for (const fieldGroup of rule.match_fields) {
        for (const field of fieldGroup) {
          const value = getNestedValue(recordData, field);
          if (value !== null && value !== undefined && value !== '') {
            query = query.eq(field, value);
          }
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error querying for duplicates:', error);
        return [];
      }

      return (data || []).map(record => ({
        id: record.id,
        record,
        matchedOn: findMatchedFields(record, recordData, rule.match_fields),
        confidenceScore: 1.0
      }));
    }
  } catch (err) {
    console.error('Exception finding duplicate records:', err);
    return [];
  }
}

/**
 * Find which fields matched between two records
 */
function findMatchedFields(
  existingRecord: any,
  newRecord: any,
  matchFieldGroups: string[][]
): Record<string, any> {
  const matched: Record<string, any> = {};

  for (const fieldGroup of matchFieldGroups) {
    for (const field of fieldGroup) {
      const existingValue = getNestedValue(existingRecord, field);
      const newValue = getNestedValue(newRecord, field);

      if (normalizeValue(existingValue) === normalizeValue(newValue) && newValue) {
        matched[field] = newValue;
      }
    }
  }

  return matched;
}

/**
 * Log a duplicate match result
 */
export async function logDuplicateMatch(
  entityType: EntityType,
  recordId: string,
  duplicateRecordId: string,
  matchedOn: Record<string, any>,
  ruleId?: string,
  userAction?: string
): Promise<void> {
  const orgId = await getCurrentOrgId();
  if (!orgId) return;

  try {
    const { error } = await supabase
      .from('matching_rules')
      .insert({
        org_id: orgId,
        entity_type: entityType,
        record_id: recordId,
        duplicate_record_id: duplicateRecordId,
        matched_on: matchedOn,
        rule_id: ruleId,
        confidence_score: 1.0,
        user_action: userAction,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action_at: userAction ? new Date().toISOString() : null
      });

    if (error) {
      console.error('Error logging duplicate match:', error);
    }
  } catch (err) {
    console.error('Exception logging duplicate match:', err);
  }
}

/**
 * Insert default duplicate rules for an organization
 */
export async function insertDefaultDuplicateRules(orgId: string): Promise<void> {
  try {
    const defaultRules = [
      // Leads - match on email
      {
        org_id: orgId,
        entity_type: 'leads',
        name: 'Email Match',
        description: 'Detect duplicate leads with the same email address',
        match_fields: [['email']],
        match_logic: 'OR',
        is_active: true,
        priority: 10
      },
      // Leads - match on phone
      {
        org_id: orgId,
        entity_type: 'leads',
        name: 'Phone Match',
        description: 'Detect duplicate leads with the same phone number',
        match_fields: [['phone']],
        match_logic: 'OR',
        is_active: true,
        priority: 9
      },
      // Leads - match on full name
      {
        org_id: orgId,
        entity_type: 'leads',
        name: 'Full Name Match',
        description: 'Detect duplicate leads with the same first and last name',
        match_fields: [['first_name', 'last_name']],
        match_logic: 'OR',
        is_active: true,
        priority: 5
      },
      // Contacts - match on email
      {
        org_id: orgId,
        entity_type: 'contacts',
        name: 'Email Match',
        description: 'Detect duplicate contacts with the same email address',
        match_fields: [['email']],
        match_logic: 'OR',
        is_active: true,
        priority: 10
      },
      // Contacts - match on phone
      {
        org_id: orgId,
        entity_type: 'contacts',
        name: 'Phone Match',
        description: 'Detect duplicate contacts with the same phone number',
        match_fields: [['phone']],
        match_logic: 'OR',
        is_active: true,
        priority: 9
      },
      // Contacts - match on full name
      {
        org_id: orgId,
        entity_type: 'contacts',
        name: 'Full Name Match',
        description: 'Detect duplicate contacts with the same first and last name',
        match_fields: [['first_name', 'last_name']],
        match_logic: 'OR',
        is_active: true,
        priority: 5
      },
      // Accounts - match on name
      {
        org_id: orgId,
        entity_type: 'accounts',
        name: 'Company Name Match',
        description: 'Detect duplicate accounts with the same company name',
        match_fields: [['name']],
        match_logic: 'OR',
        is_active: true,
        priority: 10
      },
      // Accounts - match on website
      {
        org_id: orgId,
        entity_type: 'accounts',
        name: 'Website Match',
        description: 'Detect duplicate accounts with the same website/domain',
        match_fields: [['website']],
        match_logic: 'OR',
        is_active: true,
        priority: 9
      }
    ];

    const { error } = await supabase
      .from('duplicate_rules')
      .insert(defaultRules);

    if (error) {
      console.error('Error inserting default duplicate rules:', error);
    }
  } catch (err) {
    console.error('Exception inserting default duplicate rules:', err);
  }
}

/**
 * Helper: Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Helper: Normalize value for comparison (lowercase, trim)
 */
function normalizeValue(value: any): any {
  if (typeof value === 'string') {
    return value.toLowerCase().trim();
  }
  return value;
}

/**
 * Helper: Get table name for entity type
 */
function getTableName(entityType: EntityType): string | null {
  const tableMap: Record<string, string> = {
    'leads': 'leads',
    'contacts': 'contacts',
    'accounts': 'accounts',
    'deals': 'deals',
    'tasks': 'tasks',
    'tickets': 'tickets',
    'invoices': 'invoices',
    'quotes': 'quotes',
    'products': 'products',
    'services': 'services',
    // Add more as needed
  };

  return tableMap[entityType] || null;
}
