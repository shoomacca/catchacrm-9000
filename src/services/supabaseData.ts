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
  TacticalQueueItem, WarehouseLocation, DispatchAlert, RFQ, SupplierQuote
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
  if (user?.user_metadata?.org_id) {
    return user.user_metadata.org_id;
  }

  // Fallback to demo org
  return DEMO_ORG_ID;
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
  'dispatch_alerts' | 'rfqs' | 'supplier_quotes';

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
  // System
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
    // System
    notifications,
    documents,
    auditLogs,
    // Operations - additional tables
    tacticalQueue,
    warehouseLocations,
    dispatchAlerts,
    // Procurement
    rfqs,
    supplierQuotes
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
    // System
    fetchAll<Notification>('notifications'),
    fetchAll<Document>('documents'),
    fetchAll<AuditLog>('audit_log'),
    // Operations - additional tables
    fetchAll<TacticalQueueItem>('tactical_queue'),
    fetchAll<WarehouseLocation>('warehouse_locations'),
    fetchAll<DispatchAlert>('dispatch_alerts'),
    // Procurement
    fetchAll<RFQ>('rfqs'),
    fetchAll<SupplierQuote>('supplier_quotes')
  ]);

  console.log(`Loaded: ${accounts.length} accounts, ${contacts.length} contacts, ${leads.length} leads, ${deals.length} deals, ${reviews.length} reviews, ${referralRewards.length} referrals`);

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
    // System
    notifications,
    documents,
    auditLogs,
    // Operations - additional tables
    tacticalQueue,
    warehouseLocations,
    dispatchAlerts,
    // Procurement
    rfqs,
    supplierQuotes
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
  subscribeToTable
};
