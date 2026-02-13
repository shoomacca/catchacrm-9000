/**
 * Settings Service
 * Manages CRM settings persistence to Supabase
 *
 * Tables:
 * - company_settings: Organization profile, localization, branding
 * - crm_settings: CRM configuration, modules, integrations, domain configs
 */

import { supabase } from '../lib/supabase';
import { CRMSettings } from '../types';
import { getCurrentOrgId } from './supabaseData';

// ============================================
// Type Definitions for Supabase Tables
// ============================================

interface CompanySettingsRow {
  org_id: string;
  organization: CRMSettings['organization'];
  localization: CRMSettings['localization'];
  branding: CRMSettings['branding'];
  created_at?: string;
  updated_at?: string;
}

interface CRMSettingsRow {
  org_id: string;
  modules: CRMSettings['modules'];
  roles: CRMSettings['roles'];
  permissions: CRMSettings['permissions'];
  teams: CRMSettings['teams'];
  crews: CRMSettings['crews'];
  field_level_security: CRMSettings['fieldLevelSecurity'];
  integrations: CRMSettings['integrations'];
  automation: CRMSettings['automation'];
  pipelines: CRMSettings['pipelines'];
  lead_scoring: CRMSettings['leadScoring'];
  lost_reasons: CRMSettings['lostReasons'];
  quote_validity_days: CRMSettings['quoteValidityDays'];
  payment_terms: CRMSettings['paymentTerms'];
  tax_engine: CRMSettings['taxEngine'];
  ledger_mapping: CRMSettings['ledgerMapping'];
  numbering_series: CRMSettings['numberingSeries'];
  job_templates: CRMSettings['jobTemplates'];
  zones: CRMSettings['zones'];
  inventory_rules: CRMSettings['inventoryRules'];
  scheduling: CRMSettings['scheduling'];
  review_platforms: CRMSettings['reviewPlatforms'];
  referral_settings: CRMSettings['referralSettings'];
  sender_profiles: CRMSettings['senderProfiles'];
  diagnostics: CRMSettings['diagnostics'];
  lead_statuses: CRMSettings['leadStatuses'];
  lead_sources: CRMSettings['leadSources'];
  deal_stages: CRMSettings['dealStages'];
  ticket_statuses: CRMSettings['ticketStatuses'];
  ticket_priorities: CRMSettings['ticketPriorities'];
  ticket_categories: CRMSettings['ticketCategories'];
  task_statuses: CRMSettings['taskStatuses'];
  task_priorities: CRMSettings['taskPriorities'];
  sla_config: CRMSettings['slaConfig'];
  default_assignments: CRMSettings['defaultAssignments'];
  industries: CRMSettings['industries'];
  tiers: CRMSettings['tiers'];
  account_types: CRMSettings['accountTypes'];
  deal_loss_reasons: CRMSettings['dealLossReasons'];
  custom_fields: CRMSettings['customFields'];
  required_fields: CRMSettings['requiredFields'];
  validation_rules: CRMSettings['validationRules'];
  active_industry: CRMSettings['activeIndustry'];
  industry_blueprints: CRMSettings['industryBlueprints'];
  custom_entities: CRMSettings['customEntities'];
  created_at?: string;
  updated_at?: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Split CRMSettings into company and CRM parts
 */
function splitSettings(settings: CRMSettings): {
  company: Omit<CompanySettingsRow, 'org_id' | 'created_at' | 'updated_at'>;
  crm: Omit<CRMSettingsRow, 'org_id' | 'created_at' | 'updated_at'>;
} {
  return {
    company: {
      organization: settings.organization,
      localization: settings.localization,
      branding: settings.branding,
    },
    crm: {
      modules: settings.modules,
      roles: settings.roles,
      permissions: settings.permissions,
      teams: settings.teams,
      crews: settings.crews,
      field_level_security: settings.fieldLevelSecurity,
      integrations: settings.integrations,
      automation: settings.automation,
      pipelines: settings.pipelines,
      lead_scoring: settings.leadScoring,
      lost_reasons: settings.lostReasons,
      quote_validity_days: settings.quoteValidityDays,
      payment_terms: settings.paymentTerms,
      tax_engine: settings.taxEngine,
      ledger_mapping: settings.ledgerMapping,
      numbering_series: settings.numberingSeries,
      job_templates: settings.jobTemplates,
      zones: settings.zones,
      inventory_rules: settings.inventoryRules,
      scheduling: settings.scheduling,
      review_platforms: settings.reviewPlatforms,
      referral_settings: settings.referralSettings,
      sender_profiles: settings.senderProfiles,
      diagnostics: settings.diagnostics,
      lead_statuses: settings.leadStatuses,
      lead_sources: settings.leadSources,
      deal_stages: settings.dealStages,
      ticket_statuses: settings.ticketStatuses,
      ticket_priorities: settings.ticketPriorities,
      ticket_categories: settings.ticketCategories,
      task_statuses: settings.taskStatuses,
      task_priorities: settings.taskPriorities,
      sla_config: settings.slaConfig,
      default_assignments: settings.defaultAssignments,
      industries: settings.industries,
      tiers: settings.tiers,
      account_types: settings.accountTypes,
      deal_loss_reasons: settings.dealLossReasons,
      custom_fields: settings.customFields,
      required_fields: settings.requiredFields,
      validation_rules: settings.validationRules,
      active_industry: settings.activeIndustry,
      industry_blueprints: settings.industryBlueprints,
      custom_entities: settings.customEntities,
    },
  };
}

/**
 * Merge company and CRM settings rows into a single CRMSettings object
 */
function mergeSettings(
  company: CompanySettingsRow | null,
  crm: CRMSettingsRow | null,
  defaults: CRMSettings
): CRMSettings {
  return {
    // Company settings (with defaults if not found)
    organization: company?.organization ?? defaults.organization,
    localization: company?.localization ?? defaults.localization,
    branding: company?.branding ?? defaults.branding,

    // CRM settings (with defaults if not found)
    modules: crm?.modules ?? defaults.modules,
    roles: crm?.roles ?? defaults.roles,
    permissions: crm?.permissions ?? defaults.permissions,
    teams: crm?.teams ?? defaults.teams,
    crews: crm?.crews ?? defaults.crews,
    fieldLevelSecurity: crm?.field_level_security ?? defaults.fieldLevelSecurity,
    integrations: crm?.integrations ?? defaults.integrations,
    automation: crm?.automation ?? defaults.automation,
    pipelines: crm?.pipelines ?? defaults.pipelines,
    leadScoring: crm?.lead_scoring ?? defaults.leadScoring,
    lostReasons: crm?.lost_reasons ?? defaults.lostReasons,
    quoteValidityDays: crm?.quote_validity_days ?? defaults.quoteValidityDays,
    paymentTerms: crm?.payment_terms ?? defaults.paymentTerms,
    taxEngine: crm?.tax_engine ?? defaults.taxEngine,
    ledgerMapping: crm?.ledger_mapping ?? defaults.ledgerMapping,
    numberingSeries: crm?.numbering_series ?? defaults.numberingSeries,
    jobTemplates: crm?.job_templates ?? defaults.jobTemplates,
    zones: crm?.zones ?? defaults.zones,
    inventoryRules: crm?.inventory_rules ?? defaults.inventoryRules,
    scheduling: crm?.scheduling ?? defaults.scheduling,
    reviewPlatforms: crm?.review_platforms ?? defaults.reviewPlatforms,
    referralSettings: crm?.referral_settings ?? defaults.referralSettings,
    senderProfiles: crm?.sender_profiles ?? defaults.senderProfiles,
    diagnostics: crm?.diagnostics ?? defaults.diagnostics,
    leadStatuses: crm?.lead_statuses ?? defaults.leadStatuses,
    leadSources: crm?.lead_sources ?? defaults.leadSources,
    dealStages: crm?.deal_stages ?? defaults.dealStages,
    ticketStatuses: crm?.ticket_statuses ?? defaults.ticketStatuses,
    ticketPriorities: crm?.ticket_priorities ?? defaults.ticketPriorities,
    ticketCategories: crm?.ticket_categories ?? defaults.ticketCategories,
    taskStatuses: crm?.task_statuses ?? defaults.taskStatuses,
    taskPriorities: crm?.task_priorities ?? defaults.taskPriorities,
    slaConfig: crm?.sla_config ?? defaults.slaConfig,
    defaultAssignments: crm?.default_assignments ?? defaults.defaultAssignments,
    industries: crm?.industries ?? defaults.industries,
    tiers: crm?.tiers ?? defaults.tiers,
    accountTypes: crm?.account_types ?? defaults.accountTypes,
    dealLossReasons: crm?.deal_loss_reasons ?? defaults.dealLossReasons,
    customFields: crm?.custom_fields ?? defaults.customFields,
    requiredFields: crm?.required_fields ?? defaults.requiredFields,
    validationRules: crm?.validation_rules ?? defaults.validationRules,
    activeIndustry: crm?.active_industry ?? defaults.activeIndustry,
    industryBlueprints: crm?.industry_blueprints ?? defaults.industryBlueprints,
    customEntities: crm?.custom_entities ?? defaults.customEntities,
  };
}

// ============================================
// Public API
// ============================================

/**
 * Load settings from Supabase for the current organization
 * Returns defaults if no settings found in Supabase
 *
 * @param orgId - Organization ID to load settings for
 * @param defaults - Default settings to use if no Supabase data exists
 * @returns Complete CRMSettings object
 */
export async function loadOrgSettings(
  orgId: string,
  defaults: CRMSettings
): Promise<CRMSettings> {
  try {
    console.log(`📥 Loading settings from Supabase for org: ${orgId}`);

    // Load company settings
    const { data: companyData, error: companyError } = await supabase
      .from('company_settings')
      .select('*')
      .eq('org_id', orgId)
      .maybeSingle();

    if (companyError) {
      console.error('Error loading company_settings:', companyError);
    }

    // Load CRM settings
    const { data: crmData, error: crmError } = await supabase
      .from('crm_settings')
      .select('*')
      .eq('org_id', orgId)
      .maybeSingle();

    if (crmError) {
      console.error('Error loading crm_settings:', crmError);
    }

    // Merge with defaults
    const merged = mergeSettings(companyData, crmData, defaults);

    if (!companyData && !crmData) {
      console.log('⚠️ No settings found in Supabase, using defaults');
    } else {
      console.log('✅ Settings loaded from Supabase');
    }

    return merged;
  } catch (error) {
    console.error('Fatal error loading settings from Supabase:', error);
    return defaults;
  }
}

/**
 * Save settings to Supabase (upserts both company and CRM settings)
 *
 * @param orgId - Organization ID to save settings for
 * @param settings - Complete CRMSettings object to save
 */
export async function saveOrgSettings(
  orgId: string,
  settings: CRMSettings
): Promise<void> {
  try {
    console.log(`💾 Saving settings to Supabase for org: ${orgId}`);

    const { company, crm } = splitSettings(settings);

    // Upsert company settings
    const { error: companyError } = await supabase
      .from('company_settings')
      .upsert(
        {
          org_id: orgId,
          ...company,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'org_id' }
      );

    if (companyError) {
      console.error('Error saving company_settings:', companyError);
      throw companyError;
    }

    // Upsert CRM settings
    const { error: crmError } = await supabase
      .from('crm_settings')
      .upsert(
        {
          org_id: orgId,
          ...crm,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'org_id' }
      );

    if (crmError) {
      console.error('Error saving crm_settings:', crmError);
      throw crmError;
    }

    console.log('✅ Settings saved to Supabase successfully');
  } catch (error) {
    console.error('Fatal error saving settings to Supabase:', error);
    throw error;
  }
}

/**
 * Save a single settings section to Supabase
 * More efficient than saving the entire settings object
 *
 * @param orgId - Organization ID
 * @param section - Section name (e.g., 'organization', 'modules', 'integrations')
 * @param data - Data for that section
 */
export async function saveSettingsSection(
  orgId: string,
  section: string,
  data: Record<string, any>
): Promise<void> {
  try {
    console.log(`💾 Saving settings section '${section}' to Supabase for org: ${orgId}`);

    // Determine which table this section belongs to
    const companyFields = ['organization', 'localization', 'branding'];
    const isCompanyField = companyFields.includes(section);

    const tableName = isCompanyField ? 'company_settings' : 'crm_settings';
    const columnName = isCompanyField
      ? section
      : section.replace(/([A-Z])/g, '_$1').toLowerCase();

    // Upsert the specific field
    const { error } = await supabase
      .from(tableName)
      .upsert(
        {
          org_id: orgId,
          [columnName]: data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'org_id' }
      );

    if (error) {
      console.error(`Error saving ${section} to ${tableName}:`, error);
      throw error;
    }

    console.log(`✅ Settings section '${section}' saved to ${tableName}`);
  } catch (error) {
    console.error(`Fatal error saving settings section '${section}':`, error);
    throw error;
  }
}

/**
 * Get the current organization ID from Supabase
 * This is a convenience wrapper around getCurrentOrgId from supabaseData
 */
export async function getCurrentOrganizationId(): Promise<string> {
  return await getCurrentOrgId();
}
