/**
 * Supabase Data Service
 *
 * Handles all CRUD operations with Supabase.
 * Used by CRMContext when in connected mode (demo or authenticated).
 */

import { supabase } from '../lib/supabase';
import type {
  Lead, Deal, Account, Contact, Task, Campaign, Ticket, User,
  CalendarEvent, Invoice, Quote, Product, Service, Communication,
  Crew, Job, Zone, Equipment, InventoryItem, PurchaseOrder, BankTransaction,
  Expense, Review, Subscription, ReferralReward, InboundForm, ChatWidget,
  Calculator, AutomationWorkflow, Webhook, IndustryTemplate, Conversation,
  ChatMessage, Notification, Document, AuditLog,
  TacticalQueueItem, WarehouseLocation, DispatchAlert, RFQ, SupplierQuote, EmailTemplate, SMSTemplate,
  KBCategory, KBArticle, Role, Currency, ImportJob, ExportJob, MassOperationJob,
  ImportJobStatus, ExportJobStatus, JobEntityType, WebhookConfig, WebhookLog,
  CustomObject, CustomEntityDefinition, CompanyIntegration, UserIntegration, OrgEmailAccount, SmsNumber, SmsMessage, PaymentTransaction
} from '../types';

// Demo org ID - this is the fixed UUID for the demo organization
export const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Check if we're in demo mode (no auth, use demo org)
export function isDemoMode(): boolean {
  // Demo mode if:
  // 1. URL contains /demo
  // 2. localStorage flag is set
  // 3. No authenticated user
  if (typeof window !== 'undefined') {
    if (window.location.pathname.includes('/demo')) return true;
    if (localStorage.getItem('catchacrm_demo_mode') === 'true') return true;
  }
  return false;
}

// Get the current org_id (demo or authenticated user's org)
export async function getCurrentOrgId(): Promise<string> {
  if (isDemoMode()) {
    return DEMO_ORG_ID;
  }

  // Try to get authenticated user's org
  const { data: { user } } = await supabase.auth.getUser();

  // First check user metadata
  if (user?.user_metadata?.org_id) {
    return user.user_metadata.org_id;
  }

  // If not in metadata, query organization_users table
  if (user?.id) {
    const { data: orgUser, error } = await supabase
      .from('organization_users')
      .select('org_id')
      .eq('user_id', user.id)
      .single();

    if (!error && orgUser?.org_id) {
      return orgUser.org_id;
    }
  }

  // If authenticated user has no org, throw error - DO NOT fall back to demo
  throw new Error('User has no organization. Please contact support.');
}

// ============================================
// GENERIC CRUD OPERATIONS
// ============================================

type TableName = 'accounts' | 'contacts' | 'leads' | 'deals' | 'tasks' | 'campaigns' |
  'tickets' | 'invoices' | 'quotes' | 'products' | 'services' | 'users' |
  'calendar_events' | 'communications' | 'crews' | 'jobs' | 'zones' |
  'equipment' | 'inventory_items' | 'purchase_orders' | 'bank_transactions' |
  'expenses' | 'reviews' | 'subscriptions' | 'warehouses' | 'notifications' |
  'documents' | 'audit_log' | 'referral_rewards' | 'inbound_forms' | 'chat_widgets' |
  'calculators' | 'automation_workflows' | 'webhooks' | 'industry_templates' |
  'conversations' | 'chat_messages' | 'payments' | 'ticket_messages' |
  'currencies' | 'roles' | 'tactical_queue' | 'warehouse_locations' |
  'dispatch_alerts' | 'rfqs' | 'supplier_quotes' | 'email_templates' | 'sms_templates' |
  'kb_categories' | 'kb_articles' | 'import_jobs' | 'export_jobs' | 'mass_operation_jobs' |
  'webhook_configs' | 'webhook_logs' | 'custom_objects' | 'company_integrations' |
  'user_integrations' | 'org_email_accounts' | 'sms_numbers' | 'sms_messages' | 'payment_transactions';

export async function fetchAll<T>(table: TableName): Promise<T[]> {
  const orgId = await getCurrentOrgId();

  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching ${table}:`, error);
    return [];
  }

  return (data || []) as T[];
}

export async function fetchById<T>(table: TableName, id: string): Promise<T | null> {
  const orgId = await getCurrentOrgId();

  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .eq('org_id', orgId)
    .single();

  if (error) {
    console.error(`Error fetching ${table} by id:`, error);
    return null;
  }

  return data as T;
}

export async function insertRecord<T>(table: TableName, record: Partial<T>): Promise<T | null> {
  const orgId = await getCurrentOrgId();

  const { data, error } = await supabase
    .from(table)
    .insert({ ...record, org_id: orgId })
    .select()
    .single();

  if (error) {
    console.error(`Error inserting into ${table}:`, error);
    return null;
  }

  return data as T;
}

export async function updateRecord<T>(table: TableName, id: string, updates: Partial<T>): Promise<T | null> {
  const orgId = await getCurrentOrgId();

  const { data, error } = await supabase
    .from(table)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('org_id', orgId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating ${table}:`, error);
    return null;
  }

  return data as T;
}

export async function deleteRecord(table: TableName, id: string): Promise<boolean> {
  const orgId = await getCurrentOrgId();

  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .eq('org_id', orgId);

  if (error) {
    console.error(`Error deleting from ${table}:`, error);
    return false;
  }

  return true;
}

// ============================================
// SPECIALIZED FETCH OPERATIONS
// ============================================

export async function fetchDealsWithRelations(): Promise<Deal[]> {
  const orgId = await getCurrentOrgId();

  const { data, error } = await supabase
    .from('deals')
    .select(`
      *,
      account:accounts(id, name, avatar),
      contact:contacts(id, name, email, avatar),
      assignee:users(id, name, avatar)
    `)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching deals with relations:', error);
    return [];
  }

  return (data || []) as Deal[];
}

export async function fetchContactsWithAccount(): Promise<Contact[]> {
  const orgId = await getCurrentOrgId();

  const { data, error } = await supabase
    .from('contacts')
    .select(`
      *,
      account:accounts(id, name)
    `)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contacts with account:', error);
    return [];
  }

  return (data || []) as Contact[];
}

export async function fetchJobsWithRelations(): Promise<Job[]> {
  const orgId = await getCurrentOrgId();

  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      account:accounts(id, name),
      assignee:users(id, name, avatar),
      crew:crews(id, name, color)
    `)
    .eq('org_id', orgId)
    .order('scheduled_date', { ascending: true });

  if (error) {
    console.error('Error fetching jobs with relations:', error);
    return [];
  }

  return (data || []) as Job[];
}

// ============================================
// ORGANIZATION SETUP (Fallback if trigger doesn't fire)
// ============================================

export async function ensureUserOrganization(userId: string, metadata: {
  companyName?: string;
  fullName?: string;
  email?: string;
}): Promise<{ orgId: string | null; success: boolean; message: string }> {
  try {
    // First check if user already has an org via organization_users
    const { data: existingOrgUser, error: checkError } = await supabase
      .from('organization_users')
      .select('org_id')
      .eq('user_id', userId)
      .single();

    if (existingOrgUser?.org_id) {
      console.log('User already has organization:', existingOrgUser.org_id);

      // Ensure org_id is in user metadata for faster access
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !user.user_metadata?.org_id) {
        await supabase.auth.updateUser({
          data: { org_id: existingOrgUser.org_id }
        });
      }

      return { orgId: existingOrgUser.org_id, success: true, message: 'Organization already exists' };
    }

    const companyName = metadata.companyName || 'My Organization';
    const fullName = metadata.fullName || metadata.email?.split('@')[0] || 'User';
    const emailDomain = metadata.email?.split('@')[1] || 'example.com';

    // Create organization
    const { data: newOrg, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: companyName,
        slug: companyName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + userId.substring(0, 8),
        plan: 'free',
        subscription_status: 'active',
        user_limit: 5
      })
      .select()
      .single();

    if (orgError) {
      console.error('Error creating organization:', orgError);
      return { orgId: null, success: false, message: orgError.message };
    }

    const newOrgId = newOrg.id;

    // Link user to org as owner
    const { error: linkError } = await supabase
      .from('organization_users')
      .insert({
        org_id: newOrgId,
        user_id: userId,
        role: 'owner',
        active: true
      });

    if (linkError) {
      console.error('Error linking user to org:', linkError);
    }

    // Create CRM user record
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        org_id: newOrgId,
        name: fullName,
        email: metadata.email,
        role: 'admin',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating CRM user:', userError);
    }

    // Create initial account for the company
    const { data: newAccount, error: accountError } = await supabase
      .from('accounts')
      .insert({
        org_id: newOrgId,
        name: companyName,
        industry: 'Technology',
        tier: 'Silver',
        website: `https://${emailDomain}`,
        status: 'Active',
        owner_id: newUser?.id
      })
      .select()
      .single();

    if (accountError) {
      console.error('Error creating initial account:', accountError);
    }

    // Create initial contact for the user
    if (newAccount) {
      const { error: contactError } = await supabase
        .from('contacts')
        .insert({
          org_id: newOrgId,
          account_id: newAccount.id,
          name: fullName,
          email: metadata.email,
          title: 'Owner',
          status: 'Active',
          owner_id: newUser?.id
        });

      if (contactError) {
        console.error('Error creating initial contact:', contactError);
      }
    }

    // Update auth user metadata with org_id for persistence across sessions
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { org_id: newOrgId }
    });

    if (metadataError) {
      console.error('Error updating user metadata:', metadataError);
    }

    console.log('Organization setup complete:', newOrgId);
    return { orgId: newOrgId, success: true, message: 'Organization created successfully' };
  } catch (err) {
    console.error('Error in ensureUserOrganization:', err);
    return { orgId: null, success: false, message: 'Failed to setup organization' };
  }
}

// ============================================
// DEMO RESET
// ============================================

export async function resetDemoOrganization(): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.rpc('reset_demo_organization');

    if (error) {
      console.error('Error resetting demo:', error);
      return { success: false, message: error.message };
    }

    return { success: true, message: data || 'Demo reset successfully' };
  } catch (err) {
    console.error('Error calling reset_demo_organization:', err);
    return { success: false, message: 'Failed to reset demo' };
  }
}

// ============================================
// LOAD ALL DATA (Initial fetch for CRMContext)
// ============================================

export interface CRMData {
  accounts: Account[];
  contacts: Contact[];
  leads: Lead[];
  deals: Deal[];
  tasks: Task[];
  campaigns: Campaign[];
  tickets: Ticket[];
  invoices: Invoice[];
  quotes: Quote[];
  products: Product[];
  services: Service[];
  users: User[];
  calendarEvents: CalendarEvent[];
  communications: Communication[];
  crews: Crew[];
  jobs: Job[];
  zones: Zone[];
  equipment: Equipment[];
  inventoryItems: InventoryItem[];
  purchaseOrders: PurchaseOrder[];
  bankTransactions: BankTransaction[];
  expenses: Expense[];
  reviews: Review[];
  subscriptions: Subscription[];
  // Marketing module
  referralRewards: ReferralReward[];
  inboundForms: InboundForm[];
  chatWidgets: ChatWidget[];
  calculators: Calculator[];
  // Automation module
  automationWorkflows: AutomationWorkflow[];
  webhooks: Webhook[];
  industryTemplates: IndustryTemplate[];
  // Communication module
  conversations: Conversation[];
  chatMessages: ChatMessage[];
  emailTemplates: EmailTemplate[];
  smsTemplates: SMSTemplate[];
  // Knowledge Base
  kbCategories: KBCategory[];
  kbArticles: KBArticle[];
  // System
  roles: Role[];
  currencies: Currency[];
  notifications: Notification[];
  documents: Document[];
  auditLogs: AuditLog[];
  // Operations - additional tables
  tacticalQueue: TacticalQueueItem[];
  warehouseLocations: WarehouseLocation[];
  dispatchAlerts: DispatchAlert[];
  // Procurement
  rfqs: RFQ[];
  supplierQuotes: SupplierQuote[];
  // Integrations
  companyIntegrations: CompanyIntegration[];
  userIntegrations: UserIntegration[];
  orgEmailAccounts: OrgEmailAccount[];
  smsNumbers: SmsNumber[];
  smsMessages: SmsMessage[];
  paymentTransactions: PaymentTransaction[];
}

export async function loadAllCRMData(): Promise<CRMData> {
  console.log('Loading CRM data from Supabase...');

  // Fetch all data in parallel for performance
  const [
    accounts,
    contacts,
    leads,
    deals,
    tasks,
    campaigns,
    tickets,
    invoices,
    quotes,
    products,
    services,
    users,
    calendarEvents,
    communications,
    crews,
    jobs,
    zones,
    equipment,
    inventoryItems,
    purchaseOrders,
    bankTransactions,
    expenses,
    reviews,
    subscriptions,
    // Marketing module
    referralRewards,
    inboundForms,
    chatWidgets,
    calculators,
    // Automation module
    automationWorkflows,
    webhooks,
    industryTemplates,
    // Communication module
    conversations,
    chatMessages,
    emailTemplates,
    smsTemplates,
    // Knowledge Base
    kbCategories,
    kbArticles,
    // System
    roles,
    currencies,
    notifications,
    documents,
    auditLogs,
    // Operations - additional tables
    tacticalQueue,
    warehouseLocations,
    dispatchAlerts,
    // Procurement
    rfqs,
    supplierQuotes,
    // Integrations
    companyIntegrations,
    userIntegrations,
    orgEmailAccounts,
    smsNumbers,
    smsMessages,
    paymentTransactions
  ] = await Promise.all([
    fetchAll<Account>('accounts'),
    fetchAll<Contact>('contacts'),
    fetchAll<Lead>('leads'),
    fetchAll<Deal>('deals'),
    fetchAll<Task>('tasks'),
    fetchAll<Campaign>('campaigns'),
    fetchAll<Ticket>('tickets'),
    fetchAll<Invoice>('invoices'),
    fetchAll<Quote>('quotes'),
    fetchAll<Product>('products'),
    fetchAll<Service>('services'),
    fetchAll<User>('users'),
    fetchAll<CalendarEvent>('calendar_events'),
    fetchAll<Communication>('communications'),
    fetchAll<Crew>('crews'),
    fetchAll<Job>('jobs'),
    fetchAll<Zone>('zones'),
    fetchAll<Equipment>('equipment'),
    fetchAll<InventoryItem>('inventory_items'),
    fetchAll<PurchaseOrder>('purchase_orders'),
    fetchAll<BankTransaction>('bank_transactions'),
    fetchAll<Expense>('expenses'),
    fetchAll<Review>('reviews'),
    fetchAll<Subscription>('subscriptions'),
    // Marketing module
    fetchAll<ReferralReward>('referral_rewards'),
    fetchAll<InboundForm>('inbound_forms'),
    fetchAll<ChatWidget>('chat_widgets'),
    fetchAll<Calculator>('calculators'),
    // Automation module
    fetchAll<AutomationWorkflow>('automation_workflows'),
    fetchAll<Webhook>('webhooks'),
    fetchAll<IndustryTemplate>('industry_templates'),
    // Communication module
    fetchAll<Conversation>('conversations'),
    fetchAll<ChatMessage>('chat_messages'),
    fetchAll<EmailTemplate>('email_templates'),
    fetchAll<SMSTemplate>('sms_templates'),
    // Knowledge Base
    fetchAll<KBCategory>('kb_categories'),
    fetchAll<KBArticle>('kb_articles'),
    // System
    fetchAll<Role>('roles'),
    fetchAll<Currency>('currencies'),
    fetchAll<Notification>('notifications'),
    fetchAll<Document>('documents'),
    fetchAll<AuditLog>('audit_log'),
    // Operations - additional tables
    fetchAll<TacticalQueueItem>('tactical_queue'),
    fetchAll<WarehouseLocation>('warehouse_locations'),
    fetchAll<DispatchAlert>('dispatch_alerts'),
    // Procurement
    fetchAll<RFQ>('rfqs'),
    fetchAll<SupplierQuote>('supplier_quotes'),
    // Integrations
    fetchAll<CompanyIntegration>('company_integrations'),
    fetchAll<UserIntegration>('user_integrations'),
    fetchAll<OrgEmailAccount>('org_email_accounts'),
    fetchAll<SmsNumber>('sms_numbers'),
    fetchAll<SmsMessage>('sms_messages'),
    fetchAll<PaymentTransaction>('payment_transactions')
  ]);

  console.log(`Loaded: ${accounts.length} accounts, ${contacts.length} contacts, ${leads.length} leads, ${deals.length} deals, ${reviews.length} reviews, ${referralRewards.length} referrals, ${companyIntegrations.length} company integrations, ${userIntegrations.length} user integrations`);

  return {
    accounts,
    contacts,
    leads,
    deals,
    tasks,
    campaigns,
    tickets,
    invoices,
    quotes,
    products,
    services,
    users,
    calendarEvents,
    communications,
    crews,
    jobs,
    zones,
    equipment,
    inventoryItems,
    purchaseOrders,
    bankTransactions,
    expenses,
    reviews,
    subscriptions,
    // Marketing module
    referralRewards,
    inboundForms,
    chatWidgets,
    calculators,
    // Automation module
    automationWorkflows,
    webhooks,
    industryTemplates,
    // Communication module
    conversations,
    chatMessages,
    emailTemplates,
    smsTemplates,
    // Knowledge Base
    kbCategories,
    kbArticles,
    // System
    roles,
    currencies,
    notifications,
    documents,
    auditLogs,
    // Operations - additional tables
    tacticalQueue,
    warehouseLocations,
    dispatchAlerts,
    // Procurement
    rfqs,
    supplierQuotes,
    // Integrations
    companyIntegrations,
    userIntegrations,
    orgEmailAccounts,
    smsNumbers,
    smsMessages,
    paymentTransactions
  };
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

export function subscribeToTable(
  table: TableName,
  callback: (payload: { eventType: string; new: any; old: any }) => void
) {
  const channel = supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload) => {
        callback({
          eventType: payload.eventType,
          new: payload.new,
          old: payload.old
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ============================================
// JOB TRACKING FUNCTIONS
// ============================================

/**
 * Create a new export job
 */
export async function createExportJob(
  entityType: JobEntityType,
  fileName: string
): Promise<ExportJob | null> {
  const orgId = await getCurrentOrgId();

  const job: Partial<ExportJob> = {
    org_id: orgId,
    entity_type: entityType,
    file_name: fileName,
    status: 'running',
    started_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('export_jobs')
    .insert(job)
    .select()
    .single();

  if (error) {
    console.error('Error creating export job:', error);
    return null;
  }

  return data as ExportJob;
}

/**
 * Update an export job (mark as completed or failed)
 */
export async function updateExportJob(
  jobId: string,
  updates: {
    status: ExportJobStatus;
    row_count?: number;
    error_message?: string;
  }
): Promise<boolean> {
  const orgId = await getCurrentOrgId();

  const updateData: Partial<ExportJob> = {
    ...updates,
    completed_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('export_jobs')
    .update(updateData)
    .eq('id', jobId)
    .eq('org_id', orgId);

  if (error) {
    console.error('Error updating export job:', error);
    return false;
  }

  return true;
}

/**
 * Create a new import job
 */
export async function createImportJob(
  entityType: JobEntityType,
  fileName: string,
  fileSize?: number
): Promise<ImportJob | null> {
  const orgId = await getCurrentOrgId();

  const job: Partial<ImportJob> = {
    org_id: orgId,
    entity_type: entityType,
    file_name: fileName,
    file_size: fileSize,
    status: 'running',
    started_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('import_jobs')
    .insert(job)
    .select()
    .single();

  if (error) {
    console.error('Error creating import job:', error);
    return null;
  }

  return data as ImportJob;
}

/**
 * Update an import job (mark as completed or failed)
 */
export async function updateImportJob(
  jobId: string,
  updates: {
    status: ImportJobStatus;
    total_rows?: number;
    success_rows?: number;
    failed_rows?: number;
    error_message?: string;
  }
): Promise<boolean> {
  const orgId = await getCurrentOrgId();

  const updateData: Partial<ImportJob> = {
    ...updates,
    completed_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('import_jobs')
    .update(updateData)
    .eq('id', jobId)
    .eq('org_id', orgId);

  if (error) {
    console.error('Error updating import job:', error);
    return false;
  }

  return true;
}

/**
 * Fetch recent export jobs (for history display)
 */
export async function fetchRecentExportJobs(limit = 10): Promise<ExportJob[]> {
  const orgId = await getCurrentOrgId();

  const { data, error } = await supabase
    .from('export_jobs')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching export jobs:', error);
    return [];
  }

  return (data || []) as ExportJob[];
}

/**
 * Fetch recent import jobs (for history display)
 */
export async function fetchRecentImportJobs(limit = 10): Promise<ImportJob[]> {
  const orgId = await getCurrentOrgId();

  const { data, error } = await supabase
    .from('import_jobs')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching import jobs:', error);
    return [];
  }

  return (data || []) as ImportJob[];
}

/**
 * Fetch combined recent jobs (both import and export)
 */
export async function fetchRecentJobs(limit = 10): Promise<Array<ImportJob | ExportJob>> {
  const [importJobs, exportJobs] = await Promise.all([
    fetchRecentImportJobs(limit),
    fetchRecentExportJobs(limit),
  ]);

  // Combine and sort by createdAt
  const allJobs = [...importJobs, ...exportJobs].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return allJobs.slice(0, limit);
}

// ============================================
// WEBHOOK FUNCTIONS
// ============================================

/**
 * Get webhook config for a webhook
 */
export async function getWebhookConfig(webhookId: string): Promise<WebhookConfig | null> {
  const orgId = await getCurrentOrgId();

  const { data, error } = await supabase
    .from('webhook_configs')
    .select('*')
    .eq('webhook_id', webhookId)
    .eq('org_id', orgId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No config found, return null (not an error)
      return null;
    }
    console.error('Error fetching webhook config:', error);
    return null;
  }

  return data as WebhookConfig;
}

/**
 * Save or update webhook config
 */
export async function saveWebhookConfig(config: Partial<WebhookConfig>): Promise<WebhookConfig | null> {
  const orgId = await getCurrentOrgId();

  // Check if config already exists
  const existing = await getWebhookConfig(config.webhook_id!);

  if (existing) {
    // Update existing config
    const { data, error } = await supabase
      .from('webhook_configs')
      .update({ ...config, org_id: orgId })
      .eq('id', existing.id)
      .eq('org_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Error updating webhook config:', error);
      return null;
    }

    return data as WebhookConfig;
  } else {
    // Insert new config
    const { data, error } = await supabase
      .from('webhook_configs')
      .insert({ ...config, org_id: orgId })
      .select()
      .single();

    if (error) {
      console.error('Error creating webhook config:', error);
      return null;
    }

    return data as WebhookConfig;
  }
}

/**
 * Log a webhook delivery attempt
 */
export async function logWebhookDelivery(log: Omit<WebhookLog, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<WebhookLog | null> {
  const orgId = await getCurrentOrgId();

  const logData = {
    ...log,
    org_id: orgId,
    triggered_at: log.triggered_at || new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('webhook_logs')
    .insert(logData)
    .select()
    .single();

  if (error) {
    console.error('Error logging webhook delivery:', error);
    return null;
  }

  return data as WebhookLog;
}

/**
 * Get webhook delivery logs for a specific webhook
 */
export async function getWebhookLogs(webhookId: string, limit = 50): Promise<WebhookLog[]> {
  const orgId = await getCurrentOrgId();

  const { data, error } = await supabase
    .from('webhook_logs')
    .select('*')
    .eq('webhook_id', webhookId)
    .eq('org_id', orgId)
    .order('triggered_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching webhook logs:', error);
    return [];
  }

  return (data || []) as WebhookLog[];
}

/**
 * Trigger a webhook with automatic logging
 */
export async function triggerWebhook(
  webhook: Webhook,
  payload: any
): Promise<{ success: boolean; log: WebhookLog | null }> {
  const config = await getWebhookConfig(webhook.id);
  const startTime = Date.now();

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...webhook.headers,
    ...config?.custom_headers,
  };

  // Add authentication if configured
  if (config?.auth_type === 'basic' && config.auth_username && config.auth_password) {
    const credentials = btoa(`${config.auth_username}:${config.auth_password}`);
    requestHeaders['Authorization'] = `Basic ${credentials}`;
  } else if (config?.auth_type === 'bearer' && config.auth_token) {
    requestHeaders['Authorization'] = `Bearer ${config.auth_token}`;
  } else if (config?.auth_type === 'api_key' && config.auth_api_key && config.auth_api_key_header) {
    requestHeaders[config.auth_api_key_header] = config.auth_api_key;
  }

  let success = false;
  let responseStatus: number | undefined;
  let responseBody: any;
  let errorMessage: string | undefined;

  try {
    const response = await fetch(webhook.url, {
      method: webhook.method,
      headers: requestHeaders,
      body: webhook.method !== 'GET' ? JSON.stringify(payload) : undefined,
      signal: config?.timeout_ms ? AbortSignal.timeout(config.timeout_ms) : undefined,
    });

    responseStatus = response.status;
    success = response.ok;

    try {
      responseBody = await response.json();
    } catch {
      responseBody = await response.text();
    }

    if (!response.ok) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
  } catch (error) {
    success = false;
    errorMessage = error instanceof Error ? error.message : 'Unknown error';
  }

  const responseTime = Date.now() - startTime;

  // Log the delivery
  const log = await logWebhookDelivery({
    webhook_id: webhook.id,
    org_id: '', // Will be set by logWebhookDelivery
    request_url: webhook.url,
    request_method: webhook.method,
    request_headers: requestHeaders,
    request_body: payload,
    response_status: responseStatus,
    response_body: responseBody,
    response_time_ms: responseTime,
    success,
    error_message: errorMessage,
    triggered_at: new Date().toISOString(),
  });

  // Update webhook success/failure counts
  const orgId = await getCurrentOrgId();
  await supabase
    .from('webhooks')
    .update({
      lastTriggeredAt: new Date().toISOString(),
      successCount: success ? webhook.successCount + 1 : webhook.successCount,
      failureCount: !success ? webhook.failureCount + 1 : webhook.failureCount,
    })
    .eq('id', webhook.id)
    .eq('org_id', orgId);

  return { success, log };
}

// ============================================
// CUSTOM OBJECTS (Blueprint Entities)
// ============================================

/**
 * Fetch all custom objects (blueprint entities) for the current org
 */
export async function fetchCustomObjects(): Promise<CustomObject[]> {
  const orgId = await getCurrentOrgId();

  const { data, error } = await supabase
    .from('custom_objects')
    .select('*')
    .eq('org_id', orgId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching custom objects:', error);
    return [];
  }

  return (data || []) as CustomObject[];
}

/**
 * Fetch a single custom object by entity_type
 */
export async function fetchCustomObjectByType(entityType: string): Promise<CustomObject | null> {
  const orgId = await getCurrentOrgId();

  const { data, error } = await supabase
    .from('custom_objects')
    .select('*')
    .eq('org_id', orgId)
    .eq('entity_type', entityType)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error(`Error fetching custom object ${entityType}:`, error);
    return null;
  }

  return data as CustomObject;
}

/**
 * Create or update custom objects from blueprint activation
 * This is called when a user activates a blueprint
 */
export async function upsertCustomObjectsFromBlueprint(
  entities: CustomEntityDefinition[]
): Promise<{ success: boolean; count: number }> {
  const orgId = await getCurrentOrgId();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  let successCount = 0;

  for (const entity of entities) {
    // Convert CustomEntityDefinition to CustomObject format
    const customObject = {
      org_id: orgId,
      entity_type: entity.id, // e.g., "properties", "showings"
      name: entity.name,
      name_plural: entity.namePlural,
      icon: entity.icon,
      fields_schema: entity.fields,
      relation_to: entity.relationTo || [],
      has_timeline: entity.hasTimeline || false,
      has_documents: entity.hasDocuments || false,
      has_workflow: entity.hasWorkflow || false,
      is_active: true,
      created_by: userId,
      updated_by: userId,
    };

    // Upsert (insert or update if exists)
    const { error } = await supabase
      .from('custom_objects')
      .upsert(customObject, {
        onConflict: 'org_id,entity_type',
      });

    if (error) {
      console.error(`Error upserting custom object ${entity.id}:`, error);
    } else {
      successCount++;
    }
  }

  return { success: successCount === entities.length, count: successCount };
}

/**
 * Deactivate a custom object (soft delete)
 */
export async function deactivateCustomObject(entityType: string): Promise<boolean> {
  const orgId = await getCurrentOrgId();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('custom_objects')
    .update({
      is_active: false,
      updated_by: user?.id,
      updated_at: new Date().toISOString(),
    })
    .eq('org_id', orgId)
    .eq('entity_type', entityType);

  if (error) {
    console.error(`Error deactivating custom object ${entityType}:`, error);
    return false;
  }

  return true;
}

/**
 * Reactivate a custom object
 */
export async function reactivateCustomObject(entityType: string): Promise<boolean> {
  const orgId = await getCurrentOrgId();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('custom_objects')
    .update({
      is_active: true,
      updated_by: user?.id,
      updated_at: new Date().toISOString(),
    })
    .eq('org_id', orgId)
    .eq('entity_type', entityType);

  if (error) {
    console.error(`Error reactivating custom object ${entityType}:`, error);
    return false;
  }

  return true;
}

export default {
  DEMO_ORG_ID,
  isDemoMode,
  getCurrentOrgId,
  fetchAll,
  fetchById,
  insertRecord,
  updateRecord,
  deleteRecord,
  fetchDealsWithRelations,
  fetchContactsWithAccount,
  fetchJobsWithRelations,
  ensureUserOrganization,
  resetDemoOrganization,
  loadAllCRMData,
  subscribeToTable,
  createExportJob,
  updateExportJob,
  createImportJob,
  updateImportJob,
  fetchRecentExportJobs,
  fetchRecentImportJobs,
  fetchRecentJobs,
  getWebhookConfig,
  saveWebhookConfig,
  logWebhookDelivery,
  getWebhookLogs,
  triggerWebhook,
  fetchCustomObjects,
  fetchCustomObjectByType,
  upsertCustomObjectsFromBlueprint,
  deactivateCustomObject,
  reactivateCustomObject
};
