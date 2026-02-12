import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Lead, Deal, Account, Contact, Task, Campaign, AuditLog, EntityType, Ticket, User,
  CalendarEvent, Notification, Invoice, Quote, Product, Service, Subscription, Document, CRMSettings, Communication,
  ChatMessage, Conversation, TicketMessage, Crew, Job, Zone, JobField, BOMItem, JobType, JobStatus, CustomFieldType,
  Equipment, InventoryItem, PurchaseOrder, POStatus, BankTransaction, Expense,
  Review, ReferralReward, InboundForm, ChatWidget, Calculator, ReviewPlatform, CalculatorType, FormField,
  AutomationWorkflow, Webhook, WorkflowTriggerType, WorkflowNodeType, WorkflowActionType, WorkflowTrigger, WorkflowNode,
  IndustryTemplate, LayoutSection, CustomFieldDef, Role, Team, CrewConfig, Pipeline, LeadScoringRule, TaxRate, LedgerMapping,
  JobTemplate, ZoneConfig, Warehouse, FieldSecurityRule, PermissionMatrix, IndustryBlueprint,
  TacticalQueueItem, WarehouseLocation, DispatchAlert, RFQ, SupplierQuote
} from '../types';
import { generateDemoData } from '../utils/seedData';
import { INDUSTRY_BLUEPRINTS, getActiveBlueprint } from '../utils/industryBlueprints';
import { supabase } from '../lib/supabase';
import {
  loadAllCRMData,
  isDemoMode as checkIsDemoMode,
  DEMO_ORG_ID,
  resetDemoOrganization,
  insertRecord as supabaseInsert,
  updateRecord as supabaseUpdate,
  deleteRecord as supabaseDelete
} from '../services/supabaseData';
import { getTableName } from '../utils/tableMapping';

interface GlobalSearchResult {
  id: string;
  type: EntityType;
  title: string;
  subtitle: string;
  link: string;
}

interface CRMContextType {
  leads: Lead[];
  deals: Deal[];
  accounts: Account[];
  contacts: Contact[];
  tasks: Task[];
  campaigns: Campaign[];
  tickets: Ticket[];
  invoices: Invoice[];
  quotes: Quote[];
  products: Product[];
  services: Service[];
  subscriptions: Subscription[];
  documents: Document[];
  communications: Communication[];
  calendarEvents: CalendarEvent[];
  conversations: Conversation[];
  chatMessages: ChatMessage[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  users: User[];
  crews: Crew[];
  jobs: Job[];
  zones: Zone[];
  equipment: Equipment[];
  inventoryItems: InventoryItem[];
  purchaseOrders: PurchaseOrder[];
  bankTransactions: BankTransaction[];
  expenses: Expense[];
  reviews: Review[];
  referralRewards: ReferralReward[];
  inboundForms: InboundForm[];
  chatWidgets: ChatWidget[];
  calculators: Calculator[];
  automationWorkflows: AutomationWorkflow[];
  webhooks: Webhook[];
  industryTemplates: IndustryTemplate[];
  tacticalQueue: TacticalQueueItem[];
  warehouseLocations: WarehouseLocation[];
  dispatchAlerts: DispatchAlert[];
  rfqs: RFQ[];
  supplierQuotes: SupplierQuote[];
  settings: CRMSettings;
  currentUserId: string;
  currentUser: User | undefined;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setCurrentUserId: (id: string) => void;
  
  // Deterministic Reset Actions
  restoreDefaultSettings: () => void;
  resetDemoData: () => void;
  hardReset: () => void;
  resetSupabaseDemo: () => Promise<{ success: boolean; message: string }>;

  // Data source tracking
  dataSource: 'supabase' | 'localStorage' | 'loading';
  isSupabaseConnected: boolean;

  // Operational Actions
  addNote: (entityType: EntityType, entityId: string, text: string) => void;
  updateStatus: (entityType: EntityType, entityId: string, newStatus: string) => void;
  toggleTask: (taskId: string) => void;
  convertLead: (leadId: string) => string; // Returns new Deal ID
  convertQuoteToInvoice: (quoteId: string) => void;
  markNotificationRead: (id: string) => void;
  
  // CRUD
  upsertRecord: (type: EntityType, data: any) => void;
  updateRecord: (type: EntityType, id: string, data: any) => void;
  addRecord: (type: EntityType, data: any) => void;
  deleteRecord: (type: EntityType, id: string, force?: boolean) => boolean;
  addTicketMessage: (ticketId: string, text: string, isInternal?: boolean) => void;
  sendChatMessage: (conversationId: string, content: string) => void;
  startConversation: (participantIds: string[], name?: string, isSystem?: boolean) => string;
  updateSettings: (newSettings: Partial<CRMSettings>) => void;

  // Lifecycle Conversions
  convertLeadToDeal: (leadId: string) => { dealId: string; success: boolean };
  acceptQuote: (quoteId: string) => { success: boolean; dealStage?: string };
  closeDealAsWon: (dealId: string) => { accountId: string; contactId: string; success: boolean };

  // Invoice Payment
  recordPayment: (invoiceId: string, payment: {
    amount: number;
    method: 'cash' | 'card' | 'bank_transfer' | 'check';
    reference?: string;
    note?: string;
  }) => { success: boolean; remainingBalance: number };

  // User Management
  createUser: (user: {
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'agent' | 'technician';
    managerId?: string;
    team?: string;
  }) => { userId: string; success: boolean };
  updateUser: (userId: string, updates: {
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'agent' | 'technician';
    managerId?: string;
    team?: string;
  }) => { success: boolean; error?: string };
  deleteUser: (userId: string) => { success: boolean; error?: string };

  // Job Workflow
  updateJobWorkflow: (jobId: string, updates: {
    swmsSigned?: boolean;
    swmsSignedAt?: string;
    status?: JobStatus;
    completedAt?: string;
    evidencePhotos?: string[];
    completionSignature?: string;
  }) => { success: boolean };
  pickBOMItem: (jobId: string, inventoryItemId: string, qtyPicked: number, serialNumbers?: string[]) => { success: boolean };

  // Bank Reconciliation
  reconcileTransaction: (transactionId: string, action: 'match' | 'ignore' | 'unmatch', matchData?: {
    matchedToId: string;
    matchedToType: 'invoices' | 'expenses' | 'other';
    notes?: string;
  }) => { success: boolean };
  getReconciliationSuggestions: (transactionId: string) => Array<{
    id: string;
    type: 'invoices' | 'expenses';
    description: string;
    amount: number;
    confidence: 'green' | 'amber';
  }>;

  // Industry Blueprint System
  activeBlueprint: IndustryBlueprint;
  getCustomEntities: (entityName: string) => any[];
  upsertCustomEntity: (entityName: string, data: any) => void;
  deleteCustomEntity: (entityName: string, id: string) => boolean;

  // Helpers
  getCommunicationsForEntity: (type: EntityType, id: string) => Communication[];
  getAccountRevenueStats: (accountId: string) => { lifetimeBilled: number, outstanding: number, overdueCount: number };
  canAccessRecord: (record: any) => boolean;
  hasPermission: (domain: 'sales' | 'finance' | 'operations' | 'field' | 'marketing', action: 'create' | 'edit' | 'delete' | 'export') => boolean;

  // UI State
  modal: {
    isOpen: boolean;
    type: EntityType | null;
    initialData: any | null;
  };
  openModal: (type: EntityType, initialData?: any) => void;
  closeModal: () => void;
  globalSearchResults: GlobalSearchResult[];

  // Dashboard Rollups
  salesStats: {
    pipelineValue: number;
    weightedValue: number;
    activeDealsCount: number;
    winRate: number;
    totalRevenue: number;
    trends: {
      pipelineValue: number;
      activeDeals: number;
      qualifiedLeads: number;
      weightedForecast: number;
    };
  };
  financialStats: {
    totalRevenue: number;
    outstandingAmount: number;
    activeSubscriptionsCount: number;
    mrr: number;
  };
  marketingStats: {
    totalLeads: number;
    roi: number;
    leadsBySource: Record<string, number>;
    campaignPerformance: any[];
    trends: {
      roi: number;
      leads: number;
    };
  };
  opsStats: {
    efficiencySaved: number;
    projectsCompleted: number;
    activeTickets: number;
    urgentTickets: number;
    overdueTasksCount: number;
    trends: {
      activeTickets: number;
      efficiency: number;
    };
  };
}

const STORAGE_KEY = 'catchacrm_db_v3';

const DEFAULT_SETTINGS: CRMSettings = {
  // === GENERAL (Identity Engine) ===
  organization: {
    legalName: 'Acme Corporation',
    tradingName: 'Acme',
    taxId: '',
    supportEmail: 'support@acme.com',
    billingEmail: 'billing@acme.com',
    emergencyPhone: '',
    industry: 'general' as any,
  },
  localization: {
    timezone: 'America/New_York',
    currency: 'USD',
    currencySymbol: '$',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    multiCurrencyEnabled: false,
    taxRate: 10,
  },
  branding: {
    name: 'Catcha',
    slogan: 'Catch. Connect. Close.',
    primaryColor: '#3B82F6',
    sidebarMode: 'light',
    theme: 'light',
    logoLight: '',
    logoDark: '',
    favicon: '',
    pwaIcon: '',
    customDomain: '',
  },

  // === MODULES (Feature Flags) ===
  modules: {
    salesEngine: true,
    financials: true,
    fieldLogistics: true,
    marketing: true,
    bankFeeds: true,
    inventory: true,
    dispatch: true,
    reputation: true,
    referrals: true,
    inboundForms: true,
    chatWidgets: true,
    subscriptions: true,
    purchaseOrders: true,
  },

  // === USERS & ACCESS ===
  roles: [
    { id: 'ROLE-ADMIN', name: 'Administrator', description: 'Full system access', isSystem: true, color: '#3B82F6' },
    { id: 'ROLE-MANAGER', name: 'Manager', description: 'Team oversight and approvals', isSystem: true, color: '#8B5CF6' },
    { id: 'ROLE-USER', name: 'User', description: 'Standard access', isSystem: true, color: '#64748B' },
    { id: 'ROLE-FIELD', name: 'Field Tech', description: 'Mobile app access', isSystem: false, color: '#10B981' },
  ],
  permissions: {
    'ROLE-ADMIN': {
      sales: { viewGlobal: true, viewTeam: true, viewOwn: true, create: true, edit: true, delete: true, export: true },
      finance: { viewGlobal: true, viewTeam: true, viewOwn: true, create: true, edit: true, delete: true, export: true },
      operations: { viewGlobal: true, viewTeam: true, viewOwn: true, create: true, edit: true, delete: true, export: true },
      field: { viewGlobal: true, viewTeam: true, viewOwn: true, create: true, edit: true, delete: true, export: true },
      marketing: { viewGlobal: true, viewTeam: true, viewOwn: true, create: true, edit: true, delete: true, export: true },
    },
    'ROLE-MANAGER': {
      sales: { viewGlobal: false, viewTeam: true, viewOwn: true, create: true, edit: true, delete: false, export: true },
      finance: { viewGlobal: false, viewTeam: true, viewOwn: true, create: true, edit: true, delete: false, export: true },
      operations: { viewGlobal: false, viewTeam: true, viewOwn: true, create: true, edit: true, delete: false, export: true },
      field: { viewGlobal: false, viewTeam: true, viewOwn: true, create: true, edit: true, delete: false, export: true },
      marketing: { viewGlobal: false, viewTeam: true, viewOwn: true, create: true, edit: true, delete: false, export: true },
    },
    'ROLE-USER': {
      sales: { viewGlobal: false, viewTeam: false, viewOwn: true, create: true, edit: true, delete: false, export: false },
      finance: { viewGlobal: false, viewTeam: false, viewOwn: true, create: true, edit: false, delete: false, export: false },
      operations: { viewGlobal: false, viewTeam: false, viewOwn: true, create: true, edit: true, delete: false, export: false },
      field: { viewGlobal: false, viewTeam: false, viewOwn: true, create: true, edit: true, delete: false, export: false },
      marketing: { viewGlobal: false, viewTeam: false, viewOwn: true, create: false, edit: false, delete: false, export: false },
    },
  },
  teams: [],
  crews: [],
  fieldLevelSecurity: [],

  // === INTEGRATIONS ===
  integrations: {
    // Payment Processing
    stripe: {
      enabled: false,
      mode: 'test',
      publicKey: '',
      secretKey: '',
      webhookSecret: '',
      webhookEndpoint: '',
      passSurcharge: false,
    },
    paypal: {
      enabled: false,
      mode: 'sandbox',
      clientId: '',
      clientSecret: '',
      webhookId: '',
    },

    // Accounting
    xero: {
      enabled: false,
      syncFrequency: 'daily',
      clientId: '',
      tenantId: '',
    },

    // Communications - Traditional Providers
    twilio: {
      enabled: false,
      accountSid: '',
      authToken: '',
      phoneNumber: '',
      callerId: '',
      statusCallbackUrl: '',
    },
    sendgrid: {
      enabled: false,
      apiKey: '',
      domain: '',
      fromEmail: '',
      fromName: '',
      webhookUrl: '',
    },

    // BYO Australian Telco
    byoSip: {
      enabled: false,
      provider: '',
      sipServer: '',
      sipPort: 5060,
      username: '',
      password: '',
      realm: '',
      outboundProxy: '',
      callerIdName: '',
      callerIdNumber: '',
      transport: 'udp',
      registerExpires: 600,
    },
    byoSms: {
      enabled: false,
      provider: '',
      apiEndpoint: '',
      apiKey: '',
      apiSecret: '',
      fromNumber: '',
      fromName: '',
      webhookUrl: '',
      authMethod: 'bearer',
    },

    // External Services
    googleMaps: {
      enabled: false,
      apiKey: '',
      defaultRegion: 'AU',
    },
    openai: {
      enabled: false,
      apiKey: '',
      organizationId: '',
      defaultModel: 'gpt-4-turbo',
      maxTokens: 2000,
    },

    // Calendar Sync
    googleCalendar: {
      enabled: false,
      syncEnabled: false,
      clientId: '',
      calendarId: '',
    },
    outlook: {
      enabled: false,
      syncEnabled: false,
      clientId: '',
      tenantId: '',
    },
  },

  // === AUTOMATION ===
  automation: {
    executionMode: 'synchronous',
    retryPolicy: 3,
    loggingEnabled: true,
    errorNotifications: true,
    emailFrom: 'noreply@company.com',
    emailFromName: 'CRM System',
    trackOpens: true,
  },

  // === DOMAIN CONFIGS - Sales ===
  pipelines: [
    {
      id: 'PIPE-LEADS',
      name: 'Lead Pipeline',
      entityType: 'leads',
      isDefault: true,
      stages: [
        { label: 'New', color: '#3B82F6', order: 1 },
        { label: 'Qualified', color: '#10B981', order: 2 },
        { label: 'Nurturing', color: '#F59E0B', order: 3 },
        { label: 'Converted', color: '#8B5CF6', order: 4 },
        { label: 'Lost', color: '#EF4444', order: 5 },
      ],
    },
    {
      id: 'PIPE-DEALS',
      name: 'Sales Pipeline',
      entityType: 'deals',
      isDefault: true,
      stages: [
        { label: 'Qualification', probability: 10, color: '#3B82F6', order: 1 },
        { label: 'Discovery', probability: 20, color: '#06B6D4', order: 2 },
        { label: 'Proposal', probability: 40, color: '#F59E0B', order: 3 },
        { label: 'Negotiation', probability: 70, color: '#8B5CF6', order: 4 },
        { label: 'Closed Won', probability: 100, color: '#10B981', order: 5 },
        { label: 'Closed Lost', probability: 0, color: '#EF4444', order: 6 },
      ],
    },
  ],
  leadScoring: [
    { id: 'LS-1', trigger: 'email_opened', points: 5, description: 'Opened an email' },
    { id: 'LS-2', trigger: 'link_clicked', points: 10, description: 'Clicked a link' },
    { id: 'LS-3', trigger: 'form_submitted', points: 20, description: 'Submitted a form' },
    { id: 'LS-4', trigger: 'no_answer', points: -2, description: 'No answer on call' },
    { id: 'LS-5', trigger: 'meeting_booked', points: 30, description: 'Booked a meeting' },
  ],
  lostReasons: ['Price too high', 'Went with competitor', 'No budget', 'Bad timing', 'No response', 'Changed requirements'],
  quoteValidityDays: 30,
  paymentTerms: 'Net 30',

  // === DOMAIN CONFIGS - Financial ===
  taxEngine: [
    { id: 'TAX-GST', name: 'GST', rate: 10, isDefault: true, region: 'AU' },
    { id: 'TAX-VAT', name: 'VAT', rate: 20, isDefault: false, region: 'UK' },
    { id: 'TAX-NONE', name: 'Tax Exempt', rate: 0, isDefault: false },
  ],
  ledgerMapping: [
    { id: 'GL-1', eventType: 'sales', glCode: '4000', description: 'Sales Revenue' },
    { id: 'GL-2', eventType: 'stripe_fees', glCode: '6000', description: 'Payment Processing Fees' },
    { id: 'GL-3', eventType: 'refund', glCode: '4010', description: 'Sales Refunds' },
  ],
  numberingSeries: {
    invoicePrefix: 'INV-',
    invoiceNextNumber: 1001,
    quotePrefix: 'QT-',
    quoteNextNumber: 1001,
    poPrefix: 'PO-',
    poNextNumber: 1001,
  },

  // === DOMAIN CONFIGS - Field ===
  jobTemplates: [],
  zones: [],
  inventoryRules: {
    warehouses: [{ id: 'WH-MAIN', name: 'Main Warehouse', address: '', isDefault: true }],
    lowStockThreshold: 20,
    criticalStockThreshold: 10,
    autoReorderEnabled: false,
  },
  scheduling: {
    bookingBuffer: 15,
    workingHoursStart: '08:00',
    workingHoursEnd: '17:00',
    maxJobsPerCrewPerDay: 8,
    defaultServiceRadius: 50,
  },

  // === DOMAIN CONFIGS - Marketing ===
  reviewPlatforms: [
    { name: 'Google', url: '', enabled: true },
    { name: 'Facebook', url: '', enabled: true },
  ],
  referralSettings: {
    referrerReward: 100,
    refereeDiscount: 50,
    minPurchaseForReward: 500,
  },
  senderProfiles: [
    { name: 'Default', email: 'noreply@company.com', isDefault: true },
  ],

  // === DIAGNOSTICS ===
  diagnostics: {
    auditLogRetentionDays: 90,
    emailLogRetentionDays: 30,
    apiUsageTracking: true,
    dataIntegrityChecks: true,
  },

  // === EXISTING (backward compatibility) ===
  leadStatuses: ['New', 'Qualified', 'Nurturing', 'Lost', 'Converted'],
  leadSources: ['Direct', 'LinkedIn', 'Search', 'Referral', 'Email Campaign'],
  dealStages: [
    { label: 'Qualification', probability: 0.1 },
    { label: 'Discovery', probability: 0.2 },
    { label: 'Proposal', probability: 0.4 },
    { label: 'Negotiation', probability: 0.7 },
    { label: 'Closed Won', probability: 1.0 },
    { label: 'Closed Lost', probability: 0.0 },
  ],
  ticketStatuses: ['Open', 'In Progress', 'Resolved', 'Closed'],
  ticketPriorities: ['Low', 'Medium', 'High', 'Urgent'],
  ticketCategories: ['Technical', 'Billing', 'Feature Request', 'Bug Report'],
  taskStatuses: ['Pending', 'In Progress', 'Completed'],
  taskPriorities: ['Low', 'Medium', 'High'],
  slaConfig: { 'Urgent': 4, 'High': 24, 'Medium': 48, 'Low': 96 },
  defaultAssignments: { leads: 'USR-MATRIX', deals: 'USR-CONNOR', tickets: 'USR-RIPLEY' },
  industries: ['Tech', 'Finance', 'Healthcare', 'Defense', 'Real Estate', 'Education'],
  tiers: ['Tier A', 'Tier B', 'Tier C'],
  accountTypes: ['Customer', 'Partner', 'Vendor', 'Prospect'],
  dealLossReasons: ['Price', 'Competitor', 'No Budget', 'Timing'],
  customFields: {},
  requiredFields: {
    leads: ['name', 'email', 'company', 'phone'],
    deals: ['name', 'amount', 'stage', 'expectedCloseDate'],
    accounts: ['name', 'industry'],
    contacts: ['name', 'email', 'accountId'],
    invoices: ['accountId', 'issueDate', 'dueDate', 'lineItems'],
    quotes: ['dealId', 'accountId', 'lineItems'],
    jobs: ['subject', 'accountId', 'jobType', 'status'],
    tickets: ['subject', 'description', 'priority', 'assigneeId'],
  },
  validationRules: {},

  // === INDUSTRY BLUEPRINT SYSTEM ===
  activeIndustry: 'general' as any,
  industryBlueprints: INDUSTRY_BLUEPRINTS,
  customEntities: {},
};

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [referralRewards, setReferralRewards] = useState<ReferralReward[]>([]);
  const [inboundForms, setInboundForms] = useState<InboundForm[]>([]);
  const [chatWidgets, setChatWidgets] = useState<ChatWidget[]>([]);
  const [calculators, setCalculators] = useState<Calculator[]>([]);
  const [automationWorkflows, setAutomationWorkflows] = useState<AutomationWorkflow[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [industryTemplates, setIndustryTemplates] = useState<IndustryTemplate[]>([]);
  const [tacticalQueue, setTacticalQueue] = useState<TacticalQueueItem[]>([]);
  const [warehouseLocations, setWarehouseLocations] = useState<WarehouseLocation[]>([]);
  const [dispatchAlerts, setDispatchAlerts] = useState<DispatchAlert[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [supplierQuotes, setSupplierQuotes] = useState<SupplierQuote[]>([]);
  const [settings, setSettings] = useState<CRMSettings>(DEFAULT_SETTINGS);
  const [currentUserId, setCurrentUserIdState] = useState<string>('');

  // Data source tracking: 'supabase' | 'localStorage' | 'loading'
  const [dataSource, setDataSource] = useState<'supabase' | 'localStorage' | 'loading'>('loading');
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  const [modal, setModal] = useState<CRMContextType['modal']>({ isOpen: false, type: null, initialData: null });

  const currentUser = useMemo(() => users.find(u => u.id === currentUserId), [users, currentUserId]);

  const canAccessRecord = (record: any): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    const ownerId = record.ownerId || record.assigneeId || record.createdBy;
    return ownerId === currentUser.id || (currentUser.role === 'manager' && users.find(u => u.id === ownerId)?.managerId === currentUser.id);
  };

  /**
   * Enhanced RBAC permission checker based on full permission matrix
   */
  const hasPermission = (domain: 'sales' | 'finance' | 'operations' | 'field' | 'marketing', action: 'create' | 'edit' | 'delete' | 'export'): boolean => {
    if (!currentUser) return false;
    const roleId = `ROLE-${currentUser.role.toUpperCase()}`;
    const perms = settings.permissions?.[roleId]?.[domain];
    if (!perms) return currentUser.role === 'admin'; // Admins have all permissions by default
    return perms[action] || false;
  };

  const permittedLeads = useMemo(() => leads.filter(canAccessRecord), [leads, currentUser]);
  const permittedDeals = useMemo(() => deals.filter(canAccessRecord), [deals, currentUser]);
  const permittedAccounts = useMemo(() => accounts.filter(canAccessRecord), [accounts, currentUser]);
  const permittedInvoices = useMemo(() => invoices.filter(canAccessRecord), [invoices, currentUser]);
  const permittedSubscriptions = useMemo(() => subscriptions.filter(canAccessRecord), [subscriptions, currentUser]);
  const permittedTickets = useMemo(() => tickets.filter(canAccessRecord), [tickets, currentUser]);

  useEffect(() => {
    const initializeData = async () => {
      const isDemoMode = checkIsDemoMode();

      // Try Supabase first if available
      if (supabase) {
        try {
          console.log('🔌 Checking Supabase connection...');
          const { count, error } = await supabase
            .from('organizations')
            .select('*', { count: 'exact', head: true });

          if (!error && count !== null) {
            console.log('✅ Supabase connected, loading data...');
            setIsSupabaseConnected(true);

            const crmData = await loadAllCRMData();

            // Check if we got data
            if (crmData.accounts.length > 0 || crmData.leads.length > 0) {
              setAccounts(crmData.accounts);
              setContacts(crmData.contacts);
              setLeads(crmData.leads);
              setDeals(crmData.deals);
              setTasks(crmData.tasks);
              setCampaigns(crmData.campaigns);
              setTickets(crmData.tickets);
              setInvoices(crmData.invoices);
              setQuotes(crmData.quotes);
              setProducts(crmData.products);
              setServices(crmData.services);
              setSubscriptions(crmData.subscriptions);
              setCommunications(crmData.communications);
              setCalendarEvents(crmData.calendarEvents);
              setUsers(crmData.users);
              setCrews(crmData.crews);
              setJobs(crmData.jobs);
              setZones(crmData.zones);
              setEquipment(crmData.equipment);
              setInventoryItems(crmData.inventoryItems);
              setPurchaseOrders(crmData.purchaseOrders);
              setBankTransactions(crmData.bankTransactions);
              setExpenses(crmData.expenses);
              setReviews(crmData.reviews);
              // Marketing module
              setReferralRewards(crmData.referralRewards);
              setInboundForms(crmData.inboundForms);
              setChatWidgets(crmData.chatWidgets);
              setCalculators(crmData.calculators);
              // Automation module
              setAutomationWorkflows(crmData.automationWorkflows);
              setWebhooks(crmData.webhooks);
              setIndustryTemplates(crmData.industryTemplates);
              // Communication module
              setConversations(crmData.conversations);
              setChatMessages(crmData.chatMessages);
              // System
              setNotifications(crmData.notifications);
              setDocuments(crmData.documents);
              setAuditLogs(crmData.auditLogs);
              // Operations - additional tables
              setTacticalQueue(crmData.tacticalQueue);
              setWarehouseLocations(crmData.warehouseLocations);
              setDispatchAlerts(crmData.dispatchAlerts);
              // Procurement
              setRfqs(crmData.rfqs);
              setSupplierQuotes(crmData.supplierQuotes);

              // Set current user to first admin user
              const adminUser = crmData.users.find(u => u.role === 'admin');
              if (adminUser) {
                setCurrentUserIdState(adminUser.id);
              }

              setDataSource('supabase');
              console.log(`✅ Loaded from Supabase: ${crmData.accounts.length} accounts, ${crmData.leads.length} leads, ${crmData.deals.length} deals`);
              return;
            }
          }
        } catch (err) {
          console.error('❌ Supabase connection failed:', err);
          setDataSource('supabase'); // Still mark as supabase mode, just with connection error
        }
      }

      // If no Supabase or connection failed, log error - NO localStorage fallback
      console.error('❌ Failed to load data from Supabase. Please check your connection.');
      setDataSource('supabase');
    };

    initializeData();
  }, []);

  const saveToDisk = (newState: any) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const db = stored ? JSON.parse(stored) : {};
    const updated = { ...db, ...newState };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const seedInitialData = (keepSettings = false) => {
    const data = generateDemoData();
    const currentSettings = keepSettings ? settings : DEFAULT_SETTINGS;
    setLeads(data.leads);
    setDeals(data.deals);
    setAccounts(data.accounts);
    setContacts(data.contacts);
    setTasks(data.tasks);
    setCampaigns(data.campaigns);
    setTickets(data.tickets);
    setInvoices(data.invoices);
    setProducts(data.products);
    setServices(data.services);
    setSubscriptions(data.subscriptions);
    setDocuments(data.documents);
    setCommunications(data.communications);
    setAuditLogs(data.auditLogs);
    setUsers(data.users);
    setCrews(data.crews);
    setJobs(data.jobs);
    setZones(data.zones);
    setEquipment(data.equipment);
    setInventoryItems(data.inventoryItems);
    setPurchaseOrders(data.purchaseOrders);
    setBankTransactions(data.bankTransactions);
    setExpenses(data.expenses);
    setReviews(data.reviews);
    setReferralRewards(data.referralRewards);
    setInboundForms(data.inboundForms);
    setChatWidgets(data.chatWidgets);
    setCalculators(data.calculators);
    setAutomationWorkflows(data.automationWorkflows);
    setWebhooks(data.webhooks);
    setIndustryTemplates(data.industryTemplates);
    setSettings(currentSettings);
    setCurrentUserIdState(data.currentUserId);
    saveToDisk({ ...data, settings: currentSettings });
  };

  const restoreDefaultSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    saveToDisk({ settings: DEFAULT_SETTINGS });
  };

  const resetDemoData = () => seedInitialData(false);
  const hardReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    seedInitialData(false);
    window.location.reload();
  };

  // Reset demo data in Supabase (calls the stored function)
  const resetSupabaseDemo = async (): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConnected) {
      return { success: false, message: 'Supabase not connected' };
    }

    try {
      console.log('🔄 Resetting demo data in Supabase...');
      const result = await resetDemoOrganization();

      if (result.success) {
        // Reload data from Supabase
        const crmData = await loadAllCRMData();
        setAccounts(crmData.accounts);
        setContacts(crmData.contacts);
        setLeads(crmData.leads);
        setDeals(crmData.deals);
        setTasks(crmData.tasks);
        setCampaigns(crmData.campaigns);
        setTickets(crmData.tickets);
        setInvoices(crmData.invoices);
        setProducts(crmData.products);
        setServices(crmData.services);
        setUsers(crmData.users);
        setCrews(crmData.crews);
        setJobs(crmData.jobs);
        setZones(crmData.zones);
        setEquipment(crmData.equipment);
        setInventoryItems(crmData.inventoryItems);
        setPurchaseOrders(crmData.purchaseOrders);
        setBankTransactions(crmData.bankTransactions);
        setExpenses(crmData.expenses);
        setQuotes(crmData.quotes);
        setSubscriptions(crmData.subscriptions);
        setCommunications(crmData.communications);
        setCalendarEvents(crmData.calendarEvents);
        setConversations(crmData.conversations);
        setChatMessages(crmData.chatMessages);
        setDocuments(crmData.documents);
        setAuditLogs(crmData.auditLogs);
        setNotifications(crmData.notifications);
        setReviews(crmData.reviews);
        setReferralRewards(crmData.referralRewards);
        setInboundForms(crmData.inboundForms);
        setChatWidgets(crmData.chatWidgets);
        setCalculators(crmData.calculators);
        setAutomationWorkflows(crmData.automationWorkflows);
        setWebhooks(crmData.webhooks);
        setIndustryTemplates(crmData.industryTemplates);
        // Operations - additional tables
        setTacticalQueue(crmData.tacticalQueue);
        setWarehouseLocations(crmData.warehouseLocations);
        setDispatchAlerts(crmData.dispatchAlerts);
        // Procurement
        setRfqs(crmData.rfqs);
        setSupplierQuotes(crmData.supplierQuotes);
        console.log('✅ Demo reset complete');
      }

      return result;
    } catch (err) {
      console.error('Error resetting demo:', err);
      return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const openModal = (type: EntityType, initialData: any = null) => setModal({ isOpen: true, type, initialData });
  const closeModal = () => setModal({ isOpen: false, type: null, initialData: null });

  /**
   * Root Cause Patch 2: Polymorphic Relation Normalization
   * We normalize relatedToType to lowercase during write to ensure cross-module selector consistency.
   * This prevents casing mismatches during filtering (e.g. 'Leads' vs 'leads').
   */
  const upsertRecord = (type: EntityType, data: any) => {
    const timestamp = new Date().toISOString();
    const recordId = data.id || `${type.toUpperCase().slice(0, 1)}-${Date.now()}`;
    const setters: any = {
      leads: setLeads, deals: setDeals, accounts: setAccounts, contacts: setContacts,
      tasks: setTasks, tickets: setTickets, campaigns: setCampaigns,
      calendarEvents: setCalendarEvents, invoices: setInvoices, quotes: setQuotes,
      products: setProducts, services: setServices, subscriptions: setSubscriptions,
      documents: setDocuments, communications: setCommunications, auditLogs: setAuditLogs,
      crews: setCrews, jobs: setJobs, zones: setZones,
      equipment: setEquipment, inventoryItems: setInventoryItems, purchaseOrders: setPurchaseOrders,
      bankTransactions: setBankTransactions, expenses: setExpenses,
      reviews: setReviews, referralRewards: setReferralRewards, inboundForms: setInboundForms,
      chatWidgets: setChatWidgets, calculators: setCalculators,
      automationWorkflows: setAutomationWorkflows, webhooks: setWebhooks,
      industryTemplates: setIndustryTemplates,
      tacticalQueue: setTacticalQueue, warehouseLocations: setWarehouseLocations,
      dispatchAlerts: setDispatchAlerts, rfqs: setRfqs, supplierQuotes: setSupplierQuotes
    };
    if (!setters[type]) return;

    // Check if we need to auto-generate document numbers (before setter)
    const existingRecordCheck = data.id ? (
      type === 'invoices' ? invoices.find(r => r.id === recordId) :
      type === 'quotes' ? quotes.find(r => r.id === recordId) :
      type === 'purchaseOrders' ? purchaseOrders.find(r => r.id === recordId) :
      type === 'jobs' ? jobs.find(r => r.id === recordId) :
      type === 'tickets' ? tickets.find(r => r.id === recordId) :
      null
    ) : null;

    const shouldIncrementInvoice = !existingRecordCheck && type === 'invoices' && !data.invoiceNumber;
    const shouldIncrementQuote = !existingRecordCheck && type === 'quotes' && !data.quoteNumber;
    const shouldIncrementPO = !existingRecordCheck && type === 'purchaseOrders' && !data.poNumber;
    const shouldGenerateJobNumber = !existingRecordCheck && type === 'jobs' && !data.jobNumber;
    const shouldGenerateTicketNumber = !existingRecordCheck && type === 'tickets' && !data.ticketNumber;

    setters[type]((prev: any[]) => {
      // If editing (recordId matches existing), merge with existing record to prevent field loss
      const existingRecord = data.id ? prev.find((r: any) => r.id === recordId) : null;

      const finalRecord = {
        ...(existingRecord || {}),  // Preserve existing fields
        ...data,                     // Apply new/updated fields
        id: recordId,
        createdAt: existingRecord?.createdAt || data.createdAt || timestamp,
        updatedAt: timestamp,
        createdBy: existingRecord?.createdBy || data.createdBy || currentUser?.id || 'System'
      };

      // Auto-generate document numbers for financial records (only on creation)
      if (!existingRecord) {
        if (shouldIncrementInvoice) {
          finalRecord.invoiceNumber = `${settings.numberingSeries.invoicePrefix}${settings.numberingSeries.invoiceNextNumber}`;
          // Set invoiceDate to issueDate if not provided
          if (!finalRecord.invoiceDate) {
            finalRecord.invoiceDate = finalRecord.issueDate || timestamp.split('T')[0];
          }
        }
        if (shouldIncrementQuote) {
          finalRecord.quoteNumber = `${settings.numberingSeries.quotePrefix}${settings.numberingSeries.quoteNextNumber}`;
        }
        if (shouldIncrementPO) {
          finalRecord.poNumber = `${settings.numberingSeries.poPrefix}${settings.numberingSeries.poNextNumber}`;
        }
        if (shouldGenerateJobNumber) {
          finalRecord.jobNumber = `JOB-${new Date().getFullYear()}-${String(jobs.length + 1).padStart(4, '0')}`;
        }
        if (shouldGenerateTicketNumber) {
          finalRecord.ticketNumber = `TKT-${new Date().getFullYear()}-${String(tickets.length + 1).padStart(4, '0')}`;
        }
      }

      // Patch: Normalize casing for polymorphic links to prevent selector failure
      if (['communications', 'tasks', 'documents', 'tickets'].includes(type) && finalRecord.relatedToType) {
        finalRecord.relatedToType = finalRecord.relatedToType.toLowerCase();
      }

      const isUpdate = prev.find(r => r.id === recordId) !== undefined;
      const updated = isUpdate ? prev.map(r => r.id === recordId ? finalRecord : r) : [finalRecord, ...prev];
      saveToDisk({ [type]: updated });

      // Persist to Supabase if connected (fire and forget)
      if (isSupabaseConnected) {
        const tableName = getTableName(type) as any;
        if (isUpdate) {
          supabaseUpdate(tableName, recordId, finalRecord).catch(err =>
            console.error(`Supabase update failed for ${type}:`, err)
          );
        } else {
          supabaseInsert(tableName, finalRecord).catch(err =>
            console.error(`Supabase insert failed for ${type}:`, err)
          );
        }
      }

      return updated;
    });

    // Interaction Rules & Business Logic Hooks
    if (type === 'communications') {
      const comm = data as Communication;
      
      // 1. Lead Scoring Adjustment
      if (comm.relatedToType?.toLowerCase() === 'leads') {
        const lead = leads.find(l => l.id === comm.relatedToId);
        if (lead) {
          let scoreDelta = 0;
          switch (comm.outcome) {
            case 'meeting-booked': scoreDelta = 15; break;
            case 'answered': scoreDelta = 5; break;
            case 'voicemail': scoreDelta = 1; break;
            case 'no-answer': scoreDelta = -2; break;
            case 'converted': scoreDelta = 50; break;
          }
          if (scoreDelta !== 0) {
            setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, score: Math.min(100, Math.max(0, l.score + scoreDelta)) } : l));
          }
        }
      }

      // 2. Automated Follow-up Tasks
      if (comm.nextStep || comm.nextFollowUpDate || ['meeting-booked', 'answered'].includes(comm.outcome)) {
        const followUpId = `TSK-AUTO-${Date.now()}`;
        const dueDate = comm.nextFollowUpDate || new Date(Date.now() + 86400000).toISOString(); // Default tomorrow
        const newTask: Task = {
          id: followUpId,
          title: comm.nextStep || `Follow up: ${comm.subject}`,
          description: `Automatic follow-up generated from interaction outcome: ${comm.outcome}. Context: ${comm.content.slice(0, 100)}...`,
          assigneeId: currentUser?.id || currentUserId,
          dueDate,
          status: 'Todo',
          priority: comm.outcome === 'meeting-booked' ? 'High' : 'Medium',
          relatedToId: comm.relatedToId,
          relatedToType: comm.relatedToType?.toLowerCase() as EntityType,
          createdAt: timestamp,
          updatedAt: timestamp,
          createdBy: 'System'
        };
        setTasks(prev => [newTask, ...prev]);
      }
    }

    // Increment document numbering series after successful creation
    if (shouldIncrementInvoice || shouldIncrementQuote || shouldIncrementPO) {
      setSettings(prev => {
        const updated = {
          ...prev,
          numberingSeries: {
            ...prev.numberingSeries,
            invoiceNextNumber: shouldIncrementInvoice ? prev.numberingSeries.invoiceNextNumber + 1 : prev.numberingSeries.invoiceNextNumber,
            quoteNextNumber: shouldIncrementQuote ? prev.numberingSeries.quoteNextNumber + 1 : prev.numberingSeries.quoteNextNumber,
            poNextNumber: shouldIncrementPO ? prev.numberingSeries.poNextNumber + 1 : prev.numberingSeries.poNextNumber
          }
        };
        saveToDisk({ settings: updated });
        return updated;
      });
    }

    closeModal();
  };

  // Thin wrappers around upsertRecord for pages that expect updateRecord/addRecord
  const updateRecord = (type: EntityType, id: string, data: any) => {
    upsertRecord(type, { ...data, id });
  };

  const addRecord = (type: EntityType, data: any) => {
    upsertRecord(type, data);
  };

  /**
   * Root Cause Patch 3: Cascading Delete Logic
   * Ensures deleting a parent record (Account/Lead/Deal) also removes associated child records
   * (communications, tasks, docs) to prevent ORPHAN_REFERENCE failures in the Audit Engine.
   */
  const deleteRecord = (type: EntityType, id: string): boolean => {
    const setters: any = {
      leads: setLeads, deals: setDeals, accounts: setAccounts, contacts: setContacts,
      tasks: setTasks, tickets: setTickets, campaigns: setCampaigns,
      calendarEvents: setCalendarEvents, invoices: setInvoices, quotes: setQuotes,
      products: setProducts, services: setServices, subscriptions: setSubscriptions,
      documents: setDocuments, communications: setCommunications,
      crews: setCrews, jobs: setJobs, zones: setZones,
      equipment: setEquipment, inventoryItems: setInventoryItems, purchaseOrders: setPurchaseOrders,
      bankTransactions: setBankTransactions, expenses: setExpenses,
      reviews: setReviews, referralRewards: setReferralRewards, inboundForms: setInboundForms,
      chatWidgets: setChatWidgets, calculators: setCalculators,
      automationWorkflows: setAutomationWorkflows, webhooks: setWebhooks,
      industryTemplates: setIndustryTemplates,
      tacticalQueue: setTacticalQueue, warehouseLocations: setWarehouseLocations,
      dispatchAlerts: setDispatchAlerts, rfqs: setRfqs, supplierQuotes: setSupplierQuotes
    };
    if (!setters[type]) return false;

    setters[type]((prev: any[]) => {
      const updated = prev.filter(r => r.id !== id);
      saveToDisk({ [type]: updated });
      return updated;
    });

    // Delete from Supabase if connected (fire and forget)
    if (isSupabaseConnected) {
      const tableName = getTableName(type) as any;
      supabaseDelete(tableName, id).catch(err =>
        console.error(`Supabase delete failed for ${type}:`, err)
      );
    }

    // Patch: Cascade deletion to cleanup the database graph
    const normalizedType = type.toLowerCase();
    const isParent = ['leads', 'accounts', 'contacts', 'deals'].includes(normalizedType);
    
    if (isParent) {
      const isChildOfDeletedParent = (item: any) => 
        item.relatedToId === id && item.relatedToType?.toLowerCase() === normalizedType;

      setCommunications(prev => prev.filter(c => !isChildOfDeletedParent(c)));
      setTasks(prev => prev.filter(t => !isChildOfDeletedParent(t)));
      setDocuments(prev => prev.filter(d => !isChildOfDeletedParent(d)));

      if (normalizedType === 'accounts') {
        setContacts(prev => prev.filter(c => c.accountId !== id));
        setDeals(prev => prev.filter(d => d.accountId !== id));
        setInvoices(prev => prev.filter(i => i.accountId !== id));
        setSubscriptions(prev => prev.filter(s => s.accountId !== id));
      }
    }

    return true;
  };

  const convertLead = (leadId: string): string => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return '';

    const timestamp = new Date().toISOString();
    const newAccId = `ACC-CVT-${Date.now()}`;
    const newConId = `CON-CVT-${Date.now()}`;
    const newDealId = `D-CVT-${Date.now()}`;

    // 1. Create New Records
    const newAccount: Account = {
      id: newAccId, name: lead.company, industry: settings.industries[0],
      website: '', employeeCount: 0, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.company}`,
      tier: settings.tiers[0], ownerId: lead.ownerId || currentUser?.id,
      createdAt: timestamp, updatedAt: timestamp, createdBy: currentUser?.id || 'System'
    };

    const newContact: Contact = {
      id: newConId, name: lead.name, accountId: newAccId, email: lead.email, phone: lead.phone,
      title: 'Converted Client', avatar: lead.avatar, ownerId: lead.ownerId || currentUser?.id,
      createdAt: timestamp, updatedAt: timestamp, createdBy: currentUser?.id || 'System'
    };

    const newDeal: Deal = {
      id: newDealId, name: `${lead.company} - Expansion Deal`, accountId: newAccId, contactId: newConId,
      amount: lead.estimatedValue, stage: settings.dealStages[0].label, probability: settings.dealStages[0].probability,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      assigneeId: lead.ownerId || currentUser?.id || '', avatar: lead.avatar,
      campaignId: lead.campaignId, createdAt: timestamp, updatedAt: timestamp, createdBy: currentUser?.id || 'System'
    };

    // 2. Update status and add to collections
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'Converted', updatedAt: timestamp } : l));
    setAccounts(prev => [newAccount, ...prev]);
    setContacts(prev => [newContact, ...prev]);
    setDeals(prev => [newDeal, ...prev]);

    // 3. Migrate Related Data
    const updateRelation = (item: any) => {
      if (item.relatedToId === leadId && item.relatedToType?.toLowerCase() === 'leads') {
        return { ...item, relatedToId: newConId, relatedToType: 'contacts' };
      }
      return item;
    };

    setTasks(prev => prev.map(updateRelation));
    setCommunications(prev => prev.map(updateRelation));
    setDocuments(prev => prev.map(updateRelation));
    setTickets(prev => prev.map(t => (t.requesterId === leadId || (t.relatedToId === leadId && t.relatedToType?.toLowerCase() === 'leads')) ? { ...t, requesterId: newConId, accountId: newAccId, relatedToId: newConId, relatedToType: 'contacts' } : t));
    setInvoices(prev => prev.map(i => (i.accountId === leadId) ? { ...i, accountId: newAccId, dealId: newDealId } : i));

    // 4. Traceability Logs
    const newLogs: AuditLog[] = [
      { id: `L-CVT-${Date.now()}`, entityType: 'leads', entityId: leadId, action: 'Lead Converted', createdAt: timestamp, updatedAt: timestamp, createdBy: currentUser?.id || 'System' },
      { id: `A-CVT-${Date.now()}`, entityType: 'accounts', entityId: newAccId, action: 'Account Created', createdAt: timestamp, updatedAt: timestamp, createdBy: currentUser?.id || 'System' },
      { id: `C-CVT-${Date.now()}`, entityType: 'contacts', entityId: newConId, action: 'Contact Created', createdAt: timestamp, updatedAt: timestamp, createdBy: currentUser?.id || 'System' },
      { id: `D-CVT-${Date.now()}`, entityType: 'deals', entityId: newDealId, action: 'Deal Created', createdAt: timestamp, updatedAt: timestamp, createdBy: currentUser?.id || 'System' },
    ];
    setAuditLogs(prev => [...newLogs, ...prev]);

    // Sync to disk
    saveToDisk({ 
      leads: leads.map(l => l.id === leadId ? { ...l, status: 'Converted' } : l),
      accounts: [newAccount, ...accounts],
      contacts: [newContact, ...contacts],
      deals: [newDeal, ...deals],
      auditLogs: [...newLogs, ...auditLogs]
    });

    return newDealId;
  };

  const financialStats = useMemo(() => {
    const totalRevenue = permittedInvoices.filter(i => i.status === 'Paid').reduce((a, b) => a + b.total, 0);
    const outstandingAmount = permittedInvoices.filter(i => ['Sent', 'Overdue'].includes(i.status)).reduce((a, b) => a + b.total, 0);
    const mrr = permittedSubscriptions.filter(s => s.status === 'Active').reduce((acc, sub) => {
      const subTotal = (sub.items || []).reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
      return acc + (sub.billingCycle === 'monthly' ? subTotal : sub.billingCycle === 'yearly' ? subTotal / 12 : 0);
    }, 0);
    return { totalRevenue, outstandingAmount, activeSubscriptionsCount: permittedSubscriptions.length, mrr };
  }, [permittedInvoices, permittedSubscriptions]);

  const salesStats = useMemo(() => ({
    pipelineValue: permittedDeals.reduce((a, b) => a + b.amount, 0),
    weightedValue: permittedDeals.reduce((a, b) => a + (b.amount * b.probability), 0),
    activeDealsCount: permittedDeals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage)).length,
    winRate: (permittedDeals.filter(d => d.stage === 'Closed Won').length / (permittedDeals.filter(d => ['Closed Won', 'Closed Lost'].includes(d.stage)).length || 1)) * 100,
    totalRevenue: financialStats.totalRevenue,
    trends: { pipelineValue: 12, activeDeals: 5, qualifiedLeads: 8, weightedForecast: 15 }
  }), [permittedDeals, financialStats]);

  const getAccountRevenueStats = (accountId: string) => {
    const accInvoices = permittedInvoices.filter(i => i.accountId === accountId);
    return { 
      lifetimeBilled: accInvoices.reduce((a, b) => a + b.total, 0), 
      outstanding: accInvoices.filter(i => i.paymentStatus !== 'paid').reduce((a, b) => a + b.total, 0),
      overdueCount: accInvoices.filter(i => i.status === 'Overdue').length 
    };
  };

  const globalSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: GlobalSearchResult[] = [];
    const maxPerType = 5; // Limit results per entity type

    // Search Leads
    permittedLeads.filter(l => l.name?.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q) || l.company?.toLowerCase().includes(q))
      .slice(0, maxPerType)
      .forEach(l => results.push({ id: l.id, type: 'leads', title: l.name, subtitle: `Lead • ${l.status}`, link: `/leads/${l.id}` }));

    // Search Deals
    permittedDeals.filter(d => d.name?.toLowerCase().includes(q))
      .slice(0, maxPerType)
      .forEach(d => results.push({ id: d.id, type: 'deals', title: d.name, subtitle: `Deal • $${d.amount?.toLocaleString() || 0}`, link: `/deals/${d.id}` }));

    // Search Accounts
    accounts.filter(a => a.name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q))
      .slice(0, maxPerType)
      .forEach(a => results.push({ id: a.id, type: 'accounts', title: a.name, subtitle: `Account • ${a.tier || 'Standard'}`, link: `/accounts/${a.id}` }));

    // Search Contacts
    contacts.filter(c => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q))
      .slice(0, maxPerType)
      .forEach(c => results.push({ id: c.id, type: 'contacts', title: c.name, subtitle: `Contact • ${c.company || 'N/A'}`, link: `/contacts/${c.id}` }));

    // Search Tasks
    tasks.filter(t => t.title?.toLowerCase().includes(q))
      .slice(0, maxPerType)
      .forEach(t => results.push({ id: t.id, type: 'tasks', title: t.title, subtitle: `Task • ${t.status}`, link: `/tasks/${t.id}` }));

    // Search Tickets
    tickets.filter(t => t.subject?.toLowerCase().includes(q) || t.ticketNumber?.toLowerCase().includes(q))
      .slice(0, maxPerType)
      .forEach(t => results.push({ id: t.id, type: 'tickets', title: t.subject, subtitle: `Ticket • ${t.ticketNumber}`, link: `/tickets/${t.id}` }));

    // Search Jobs
    jobs.filter(j => j.name?.toLowerCase().includes(q) || j.subject?.toLowerCase().includes(q) || j.jobNumber?.toLowerCase().includes(q))
      .slice(0, maxPerType)
      .forEach(j => results.push({ id: j.id, type: 'jobs', title: j.name || j.subject, subtitle: `Job • ${j.status}`, link: `/jobs/${j.id}` }));

    // Search Invoices
    invoices.filter(i => i.invoiceNumber?.toLowerCase().includes(q))
      .slice(0, maxPerType)
      .forEach(i => results.push({ id: i.id, type: 'invoices', title: i.invoiceNumber, subtitle: `Invoice • $${i.total?.toLocaleString()}`, link: `/invoices/${i.id}` }));

    // Search Quotes
    quotes.filter(q2 => q2.quoteNumber?.toLowerCase().includes(q))
      .slice(0, maxPerType)
      .forEach(q2 => results.push({ id: q2.id, type: 'quotes', title: q2.quoteNumber, subtitle: `Quote • $${q2.total?.toLocaleString()}`, link: `/quotes/${q2.id}` }));

    // Search Campaigns
    campaigns.filter(c => c.name?.toLowerCase().includes(q))
      .slice(0, maxPerType)
      .forEach(c => results.push({ id: c.id, type: 'campaigns', title: c.name, subtitle: `Campaign • ${c.status}`, link: `/campaigns/${c.id}` }));

    return results.slice(0, 25); // Cap total results at 25
  }, [searchQuery, permittedLeads, permittedDeals, accounts, contacts, tasks, tickets, jobs, invoices, quotes, campaigns]);

  const updateSettings = (newSettings: Partial<CRMSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      saveToDisk({ settings: updated });
      return updated;
    });
  };

  /**
   * addAuditLog: Creates an audit log entry for any entity action.
   */
  const addAuditLog = (entityType: EntityType, entityId: string, action: string, userId: string) => {
    const timestamp = new Date().toISOString();
    const logId = `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newLog: AuditLog = {
      id: logId,
      entityType,
      entityId,
      action,
      metadata: { userId },
      createdBy: userId,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    setAuditLogs(prev => {
      const updated = [newLog, ...prev];
      saveToDisk({ auditLogs: updated });
      return updated;
    });
  };

  /**
   * addNote: Creates a Communication record of type 'Note' for any entity.
   * Notes are polymorphically linked via relatedToType/relatedToId.
   */
  const addNote = (entityType: EntityType, entityId: string, text: string) => {
    const timestamp = new Date().toISOString();
    const noteId = `COMM-NOTE-${Date.now()}`;

    const newNote: Communication = {
      id: noteId,
      type: 'Note',
      subject: 'Note',
      content: text,
      direction: 'Outbound',
      relatedToType: entityType.toLowerCase() as EntityType,
      relatedToId: entityId,
      outcome: 'answered', // Notes don't have outcomes but field is required
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: currentUser?.id || 'System'
    };

    setCommunications(prev => {
      const updated = [newNote, ...prev];
      saveToDisk({ communications: updated });
      return updated;
    });

    // Audit log for traceability
    const auditEntry: AuditLog = {
      id: `LOG-NOTE-${Date.now()}`,
      entityType: entityType,
      entityId: entityId,
      action: 'Note Added',
      newValue: text.slice(0, 100),
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: currentUser?.id || 'System'
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  /**
   * updateStatus: Generic status updater for any entity type.
   * Handles the specific status field for each entity type.
   */
  const updateStatus = (entityType: EntityType, entityId: string, newStatus: string) => {
    const timestamp = new Date().toISOString();
    const setters: Record<string, React.Dispatch<React.SetStateAction<any[]>>> = {
      leads: setLeads,
      deals: setDeals,
      tasks: setTasks,
      tickets: setTickets,
      campaigns: setCampaigns,
      invoices: setInvoices,
      quotes: setQuotes,
      subscriptions: setSubscriptions
    };

    const setter = setters[entityType];
    if (!setter) return;

    setter((prev: any[]) => {
      const updated = prev.map((r: any) => {
        if (r.id === entityId) {
          // For deals, also update probability based on stage
          if (entityType === 'deals') {
            const stageConfig = settings.dealStages.find(s => s.label === newStatus);
            return {
              ...r,
              stage: newStatus,
              probability: stageConfig?.probability ?? r.probability,
              stageEntryDate: timestamp,
              updatedAt: timestamp
            };
          }
          return { ...r, status: newStatus, updatedAt: timestamp };
        }
        return r;
      });
      saveToDisk({ [entityType]: updated });
      return updated;
    });

    // Audit log
    const auditEntry: AuditLog = {
      id: `LOG-STATUS-${Date.now()}`,
      entityType: entityType,
      entityId: entityId,
      action: 'Status Changed',
      newValue: newStatus,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: currentUser?.id || 'System'
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  /**
   * convertQuoteToInvoice: Transforms an accepted Quote into an Invoice.
   * Copies line items, calculates totals, and links back to the quote.
   */
  const convertQuoteToInvoice = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;

    const timestamp = new Date().toISOString();
    const invoiceId = `INV-${Date.now()}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`;

    // Calculate due date (30 days from now)
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const newInvoice: Invoice = {
      id: invoiceId,
      invoiceNumber,
      accountId: quote.accountId,
      dealId: quote.dealId,
      quoteId: quote.id,
      status: 'Draft',
      paymentStatus: 'unpaid',
      issueDate: timestamp,
      invoiceDate: timestamp.split('T')[0],
      dueDate,
      lineItems: quote.lineItems.map(item => ({ ...item })),
      subtotal: quote.subtotal,
      taxTotal: quote.taxTotal,
      total: quote.total,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: currentUser?.id || 'System',
      ownerId: currentUser?.id
    };

    setInvoices(prev => {
      const updated = [newInvoice, ...prev];
      saveToDisk({ invoices: updated });
      return updated;
    });

    // Update quote status to reflect conversion
    setQuotes(prev => {
      const updated = prev.map(q =>
        q.id === quoteId ? { ...q, status: 'Accepted' as const, updatedAt: timestamp } : q
      );
      saveToDisk({ quotes: updated });
      return updated;
    });

    // Audit logs
    const auditEntries: AuditLog[] = [
      {
        id: `LOG-QTI-Q-${Date.now()}`,
        entityType: 'quotes',
        entityId: quoteId,
        action: 'Quote Converted to Invoice',
        newValue: invoiceId,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: currentUser?.id || 'System'
      },
      {
        id: `LOG-QTI-I-${Date.now()}`,
        entityType: 'invoices',
        entityId: invoiceId,
        action: 'Invoice Created from Quote',
        metadata: { quoteId, quoteNumber: quote.quoteNumber },
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: currentUser?.id || 'System'
      }
    ];
    setAuditLogs(prev => [...auditEntries, ...prev]);
  };

  /**
   * markNotificationRead: Updates a notification's read status.
   */
  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n =>
        n.id === notificationId ? { ...n, read: true, updatedAt: new Date().toISOString() } : n
      );
      saveToDisk({ notifications: updated });
      return updated;
    });
  };

  /**
   * addTicketMessage: Adds a message to a ticket's message thread.
   * Supports both public messages and internal notes.
   */
  const addTicketMessage = (ticketId: string, text: string, isInternal: boolean = false) => {
    const timestamp = new Date().toISOString();

    const newMessage: TicketMessage = {
      sender: currentUser?.name || 'System',
      senderId: currentUser?.id || 'System',
      text,
      time: timestamp,
      isMe: true,
      isBot: false
    };

    setTickets(prev => {
      const updated = prev.map(ticket => {
        if (ticket.id !== ticketId) return ticket;

        if (isInternal) {
          return {
            ...ticket,
            internalNotes: [...(ticket.internalNotes || []), newMessage],
            updatedAt: timestamp
          };
        } else {
          return {
            ...ticket,
            messages: [...ticket.messages, newMessage],
            updatedAt: timestamp
          };
        }
      });
      saveToDisk({ tickets: updated });
      return updated;
    });

    // Audit log
    const auditEntry: AuditLog = {
      id: `LOG-TKTMSG-${Date.now()}`,
      entityType: 'tickets',
      entityId: ticketId,
      action: isInternal ? 'Internal Note Added' : 'Message Added',
      newValue: text.slice(0, 100),
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: currentUser?.id || 'System'
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  /**
   * sendChatMessage: Sends a message to a conversation.
   */
  const sendChatMessage = (conversationId: string, content: string) => {
    const timestamp = new Date().toISOString();
    const messageId = `MSG-${Date.now()}`;

    const newMessage: ChatMessage = {
      id: messageId,
      conversationId,
      senderId: currentUser?.id || 'System',
      content,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: currentUser?.id || 'System'
    };

    setChatMessages(prev => {
      const updated = [...prev, newMessage];
      saveToDisk({ chatMessages: updated });
      return updated;
    });

    // Update conversation's updatedAt timestamp
    setConversations(prev => {
      const updated = prev.map(c =>
        c.id === conversationId ? { ...c, updatedAt: timestamp } : c
      );
      saveToDisk({ conversations: updated });
      return updated;
    });
  };

  /**
   * startConversation: Creates a new conversation with specified participants.
   * Returns the new conversation ID.
   * @param name - Optional name for group channels (e.g., "General", "Sales Team")
   * @param isSystem - If true, marks this as a mandatory system channel
   */
  const startConversation = (participantIds: string[], name?: string, isSystem?: boolean): string => {
    const timestamp = new Date().toISOString();
    const conversationId = `CONV-${Date.now()}`;

    // Ensure current user is included in participants
    const allParticipants = participantIds.includes(currentUser?.id || '')
      ? participantIds
      : [...participantIds, currentUser?.id || ''];

    const newConversation: Conversation = {
      id: conversationId,
      participantIds: allParticipants.filter(Boolean),
      name,
      isSystem,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: currentUser?.id || 'System'
    };

    setConversations(prev => {
      const updated = [newConversation, ...prev];
      saveToDisk({ conversations: updated });
      return updated;
    });

    return conversationId;
  };

  /**
   * Root Cause Patch 1: Implement getCommunicationsForEntity
   * Resolves SELECTOR_BYPASS errors by replacing the stub with actual filter logic.
   * Includes lowercase normalization on the filter to ensure resilience against legacy case mismatches.
   */
  const getCommunicationsForEntity = (type: EntityType, id: string) => {
    return communications.filter(c =>
      c.relatedToId === id &&
      c.relatedToType?.toLowerCase() === type.toLowerCase()
    );
  };

  /**
   * convertLeadToDeal: Converts a qualified lead into a deal
   * - Archives the lead (marks as Converted)
   * - Creates a new deal with the lead's data
   * - Links the deal back to the lead for tracking
   */
  const convertLeadToDeal = (leadId: string): { dealId: string; success: boolean } => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return { dealId: '', success: false };

    const timestamp = new Date().toISOString();
    const newDealId = `DEAL-${Date.now()}`;

    // Create the new deal
    const newDeal: Deal = {
      id: newDealId,
      name: `${lead.company || lead.name} - New Opportunity`,
      accountId: '', // Will be set when deal is won
      contactId: '', // Will be set when deal is won
      amount: lead.estimatedValue || 0,
      stage: settings.dealStages[0]?.label || 'Qualification',
      probability: settings.dealStages[0]?.probability || 0.1,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      assigneeId: lead.ownerId || currentUser?.id || '',
      avatar: lead.avatar,
      campaignId: lead.campaignId,
      leadId: leadId,
      commissionRate: lead.commissionRate,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: currentUser?.id || 'System'
    };

    // Update the lead to Converted status
    setLeads(prev => {
      const updated = prev.map(l =>
        l.id === leadId
          ? { ...l, status: 'Converted', convertedToDealId: newDealId, convertedAt: timestamp, convertedBy: currentUser?.id, updatedAt: timestamp }
          : l
      );
      saveToDisk({ leads: updated });
      return updated;
    });

    // Add the new deal
    setDeals(prev => {
      const updated = [newDeal, ...prev];
      saveToDisk({ deals: updated });
      return updated;
    });

    return { dealId: newDealId, success: true };
  };

  /**
   * acceptQuote: Accepts a quote and supersedes other quotes for the same deal
   * - Marks the quote as Accepted
   * - Marks other quotes for the same deal as Superseded
   * - Moves the deal to Negotiation stage
   */
  const acceptQuote = (quoteId: string): { success: boolean; dealStage?: string } => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return { success: false };

    const timestamp = new Date().toISOString();
    const newStage = 'Negotiation';

    // Update the quote to Accepted and mark others as Superseded
    setQuotes(prev => {
      const updated = prev.map(q => {
        if (q.id === quoteId) {
          return { ...q, status: 'Accepted' as const, acceptedAt: timestamp, acceptedBy: currentUser?.id, updatedAt: timestamp };
        }
        if (q.dealId === quote.dealId && q.id !== quoteId && q.status !== 'Accepted') {
          return { ...q, status: 'Superseded' as const, supersededBy: quoteId, updatedAt: timestamp };
        }
        return q;
      });
      saveToDisk({ quotes: updated });
      return updated;
    });

    // Move the deal to Negotiation stage
    const stageConfig = settings.dealStages.find(s => s.label === newStage);
    setDeals(prev => {
      const updated = prev.map(d =>
        d.id === quote.dealId
          ? { ...d, stage: newStage, probability: stageConfig?.probability || d.probability, stageEntryDate: timestamp, updatedAt: timestamp }
          : d
      );
      saveToDisk({ deals: updated });
      return updated;
    });

    return { success: true, dealStage: newStage };
  };

  /**
   * closeDealAsWon: Marks a deal as won and creates Account + Contact
   * - Creates a new Account from deal/lead data
   * - Creates a new Contact linked to the Account
   * - Updates the deal with the new Account/Contact IDs
   * - Marks the deal as Closed Won
   */
  const closeDealAsWon = (dealId: string): { accountId: string; contactId: string; success: boolean } => {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return { accountId: '', contactId: '', success: false };

    // Get the original lead if exists
    const lead = deal.leadId ? leads.find(l => l.id === deal.leadId) : null;

    const timestamp = new Date().toISOString();
    const newAccountId = `ACC-${Date.now()}`;
    const newContactId = `CONT-${Date.now()}`;

    // Create the new Account
    const newAccount: Account = {
      id: newAccountId,
      name: lead?.company || deal.name.split(' - ')[0] || 'New Account',
      industry: 'Other',
      website: '',
      employeeCount: 0,
      avatar: deal.avatar,
      tier: 'Standard',
      address: lead?.address,
      commissionRate: deal.commissionRate,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: currentUser?.id || 'System',
      ownerId: deal.assigneeId
    };

    // Create the new Contact
    const newContact: Contact = {
      id: newContactId,
      name: lead?.name || 'Primary Contact',
      accountId: newAccountId,
      email: lead?.email || '',
      phone: lead?.phone || '',
      title: 'Primary Contact',
      avatar: lead?.avatar || deal.avatar,
      address: lead?.address,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: currentUser?.id || 'System'
    };

    // Add the new Account
    setAccounts(prev => {
      const updated = [newAccount, ...prev];
      saveToDisk({ accounts: updated });
      return updated;
    });

    // Add the new Contact
    setContacts(prev => {
      const updated = [newContact, ...prev];
      saveToDisk({ contacts: updated });
      return updated;
    });

    // Update the deal to Closed Won with the new IDs
    const wonStage = settings.dealStages.find(s => s.label === 'Closed Won');
    setDeals(prev => {
      const updated = prev.map(d =>
        d.id === dealId
          ? {
              ...d,
              stage: 'Closed Won',
              probability: wonStage?.probability || 1.0,
              accountId: newAccountId,
              contactId: newContactId,
              wonAt: timestamp,
              createdAccountId: newAccountId,
              createdContactId: newContactId,
              stageEntryDate: timestamp,
              updatedAt: timestamp
            }
          : d
      );
      saveToDisk({ deals: updated });
      return updated;
    });

    return { accountId: newAccountId, contactId: newContactId, success: true };
  };

  /**
   * recordPayment: Records a payment against an invoice
   * - Adds to credits array
   * - Updates paymentStatus (paid, partially_paid)
   * - Updates invoice status (Paid if fully paid)
   * - Sets paidAt timestamp
   */
  const recordPayment = (
    invoiceId: string,
    payment: { amount: number; method: 'cash' | 'card' | 'bank_transfer' | 'check'; reference?: string; note?: string }
  ): { success: boolean; remainingBalance: number } => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return { success: false, remainingBalance: 0 };

    const timestamp = new Date().toISOString();

    // Calculate current paid amount from existing credits
    const existingPaid = (invoice.credits || []).reduce((sum, c) => sum + c.amount, 0);
    const totalPaid = existingPaid + payment.amount;
    const remainingBalance = Math.max(0, invoice.total - totalPaid);

    // Create new credit entry
    const newCredit = {
      amount: payment.amount,
      reason: `Payment via ${payment.method}${payment.reference ? ` (Ref: ${payment.reference})` : ''}${payment.note ? ` - ${payment.note}` : ''}`,
      appliedAt: timestamp,
    };

    // Determine new payment status
    const newPaymentStatus = remainingBalance <= 0 ? 'paid' : totalPaid > 0 ? 'partially_paid' : 'unpaid';
    const newStatus = remainingBalance <= 0 ? 'Paid' : invoice.status;

    setInvoices(prev => {
      const updated = prev.map(i =>
        i.id === invoiceId
          ? {
              ...i,
              credits: [...(i.credits || []), newCredit],
              paymentStatus: newPaymentStatus as 'unpaid' | 'paid' | 'partially_paid',
              status: newStatus as 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled',
              paidAt: remainingBalance <= 0 ? timestamp : i.paidAt,
              updatedAt: timestamp,
            }
          : i
      );
      saveToDisk({ invoices: updated });
      return updated;
    });

    // Audit log
    const auditEntry: AuditLog = {
      id: `LOG-PAY-${Date.now()}`,
      entityType: 'invoices',
      entityId: invoiceId,
      action: 'Payment Recorded',
      newValue: `$${payment.amount} via ${payment.method}`,
      metadata: { method: payment.method, reference: payment.reference, remainingBalance },
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: currentUser?.id || 'System',
    };
    setAuditLogs(prev => [auditEntry, ...prev]);

    return { success: true, remainingBalance };
  };

  /**
   * createUser: Creates a new user in the system
   */
  const createUser = (userData: {
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'agent' | 'technician';
    managerId?: string;
    team?: string;
  }): { userId: string; success: boolean } => {
    const timestamp = new Date().toISOString();
    const userId = `USR-${Date.now()}`;

    const newUser: User = {
      id: userId,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      managerId: userData.managerId,
      team: userData.team,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: currentUser?.id || 'System',
    };

    setUsers(prev => {
      const updated = [...prev, newUser];
      saveToDisk({ users: updated });
      return updated;
    });

    return { userId, success: true };
  };

  /**
   * deleteUser: Deletes a user from the system with safety checks
   */
  const deleteUser = (userId: string): { success: boolean; error?: string } => {
    // Safety checks
    if (userId === currentUserId) {
      return { success: false, error: 'Cannot delete the currently active user' };
    }

    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check if this is the last admin
    const admins = users.filter(u => u.role === 'admin');
    if (user.role === 'admin' && admins.length <= 1) {
      return { success: false, error: 'Cannot delete the last admin user' };
    }

    setUsers(prev => {
      const updated = prev.filter(u => u.id !== userId);
      saveToDisk({ users: updated });
      return updated;
    });

    return { success: true };
  };

  /**
   * updateUser: Updates an existing user with new data
   */
  const updateUser = (userId: string, updates: {
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'agent' | 'technician';
    managerId?: string;
    team?: string;
  }): { success: boolean; error?: string } => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Safety check: can't demote the last admin
    if (user.role === 'admin' && updates.role !== 'admin') {
      const admins = users.filter(u => u.role === 'admin');
      if (admins.length <= 1) {
        return { success: false, error: 'Cannot demote the last admin user' };
      }
    }

    setUsers(prev => {
      const updated = prev.map(u =>
        u.id === userId
          ? {
              ...u,
              name: updates.name,
              email: updates.email,
              role: updates.role,
              managerId: updates.managerId,
              team: updates.team,
              updatedAt: new Date().toISOString()
            }
          : u
      );
      saveToDisk({ users: updated });
      return updated;
    });

    return { success: true };
  };

  /**
   * updateJobWorkflow: Updates job workflow fields (SWMS, status, photos, signature)
   */
  const updateJobWorkflow = (
    jobId: string,
    updates: {
      swmsSigned?: boolean;
      swmsSignedAt?: string;
      status?: JobStatus;
      completedAt?: string;
      evidencePhotos?: string[];
      completionSignature?: string;
    }
  ): { success: boolean } => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return { success: false };

    const timestamp = new Date().toISOString();

    setJobs(prev => {
      const updated = prev.map(j =>
        j.id === jobId
          ? {
              ...j,
              ...updates,
              completedAt: updates.status === 'Completed' ? timestamp : j.completedAt,
              updatedAt: timestamp,
            }
          : j
      );
      saveToDisk({ jobs: updated });
      return updated;
    });

    return { success: true };
  };

  /**
   * pickBOMItem: Updates the picked quantity for a BOM item on a job
   */
  const pickBOMItem = (
    jobId: string,
    inventoryItemId: string,
    qtyPicked: number,
    serialNumbers?: string[]
  ): { success: boolean } => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return { success: false };

    const timestamp = new Date().toISOString();

    setJobs(prev => {
      const updated = prev.map(j => {
        if (j.id !== jobId) return j;

        const updatedBom = (j.bom || []).map(item =>
          item.inventoryItemId === inventoryItemId
            ? { ...item, qtyPicked, serialNumbers: serialNumbers || item.serialNumbers }
            : item
        );

        return { ...j, bom: updatedBom, updatedAt: timestamp };
      });
      saveToDisk({ jobs: updated });
      return updated;
    });

    return { success: true };
  };

  /**
   * reconcileTransaction: Matches, ignores, or unmatches a bank transaction
   * - match: Links transaction to an invoice or expense
   * - ignore: Marks transaction as ignored (no match needed)
   * - unmatch: Removes existing match and sets back to unmatched
   */
  const reconcileTransaction = (
    transactionId: string,
    action: 'match' | 'ignore' | 'unmatch',
    matchData?: { matchedToId: string; matchedToType: 'invoices' | 'expenses' | 'other'; notes?: string }
  ): { success: boolean } => {
    const transaction = bankTransactions.find(t => t.id === transactionId);
    if (!transaction) return { success: false };

    const timestamp = new Date().toISOString();

    setBankTransactions(prev => {
      const updated = prev.map(t => {
        if (t.id !== transactionId) return t;

        switch (action) {
          case 'match':
            if (!matchData) return t;
            return {
              ...t,
              status: 'matched' as const,
              matchConfidence: 'green' as const,
              matchedToId: matchData.matchedToId,
              matchedToType: matchData.matchedToType,
              reconciled: true,
              reconciledAt: timestamp,
              reconciledBy: currentUser?.id || 'System',
              notes: matchData.notes || t.notes,
              updatedAt: timestamp,
            };
          case 'ignore':
            return {
              ...t,
              status: 'ignored' as const,
              reconciled: true,
              reconciledAt: timestamp,
              reconciledBy: currentUser?.id || 'System',
              updatedAt: timestamp,
            };
          case 'unmatch':
            return {
              ...t,
              status: 'unmatched' as const,
              matchConfidence: 'none' as const,
              matchedToId: undefined,
              matchedToType: undefined,
              reconciled: false,
              reconciledAt: undefined,
              reconciledBy: undefined,
              updatedAt: timestamp,
            };
          default:
            return t;
        }
      });
      saveToDisk({ bankTransactions: updated });
      return updated;
    });

    // Audit log
    const auditEntry: AuditLog = {
      id: `LOG-BANK-${Date.now()}`,
      entityType: 'bankTransactions',
      entityId: transactionId,
      action: action === 'match' ? 'Transaction Matched' : action === 'ignore' ? 'Transaction Ignored' : 'Transaction Unmatched',
      newValue: action === 'match' && matchData ? `Matched to ${matchData.matchedToType}:${matchData.matchedToId}` : action,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: currentUser?.id || 'System',
    };
    setAuditLogs(prev => [auditEntry, ...prev]);

    return { success: true };
  };

  /**
   * getReconciliationSuggestions: Returns potential matches for a bank transaction
   * Matches based on amount similarity (within 5% tolerance)
   */
  const getReconciliationSuggestions = (transactionId: string): Array<{
    id: string;
    type: 'invoices' | 'expenses';
    description: string;
    amount: number;
    confidence: 'green' | 'amber';
  }> => {
    const transaction = bankTransactions.find(t => t.id === transactionId);
    if (!transaction || transaction.status !== 'unmatched') return [];

    const suggestions: Array<{
      id: string;
      type: 'invoices' | 'expenses';
      description: string;
      amount: number;
      confidence: 'green' | 'amber';
    }> = [];

    const txAmount = Math.abs(transaction.amount);
    const tolerance = txAmount * 0.05; // 5% tolerance

    // For credits (incoming), suggest unpaid invoices
    if (transaction.type === 'Credit') {
      invoices
        .filter(inv => ['Sent', 'Overdue'].includes(inv.status) && inv.paymentStatus !== 'paid')
        .forEach(inv => {
          const diff = Math.abs(inv.total - txAmount);
          if (diff === 0) {
            suggestions.push({
              id: inv.id,
              type: 'invoices',
              description: `${inv.invoiceNumber} - ${accounts.find(a => a.id === inv.accountId)?.name || 'Unknown'}`,
              amount: inv.total,
              confidence: 'green',
            });
          } else if (diff <= tolerance) {
            suggestions.push({
              id: inv.id,
              type: 'invoices',
              description: `${inv.invoiceNumber} - ${accounts.find(a => a.id === inv.accountId)?.name || 'Unknown'}`,
              amount: inv.total,
              confidence: 'amber',
            });
          }
        });
    }

    // For debits (outgoing), suggest pending expenses
    if (transaction.type === 'Debit') {
      expenses
        .filter(exp => exp.status === 'Pending' || !bankTransactions.some(bt => bt.matchedToId === exp.id))
        .forEach(exp => {
          const diff = Math.abs(exp.amount - txAmount);
          if (diff === 0) {
            suggestions.push({
              id: exp.id,
              type: 'expenses',
              description: `${exp.vendor} - ${exp.category}`,
              amount: exp.amount,
              confidence: 'green',
            });
          } else if (diff <= tolerance) {
            suggestions.push({
              id: exp.id,
              type: 'expenses',
              description: `${exp.vendor} - ${exp.category}`,
              amount: exp.amount,
              confidence: 'amber',
            });
          }
        });
    }

    // Sort by confidence (green first) then by closest amount match
    return suggestions.sort((a, b) => {
      if (a.confidence === 'green' && b.confidence !== 'green') return -1;
      if (a.confidence !== 'green' && b.confidence === 'green') return 1;
      return Math.abs(a.amount - txAmount) - Math.abs(b.amount - txAmount);
    });
  };

  // === INDUSTRY BLUEPRINT SYSTEM ===

  // Get active blueprint
  const activeBlueprint = useMemo(() => getActiveBlueprint(settings), [settings]);

  // Get custom entities for a specific entity type
  const getCustomEntities = (entityName: string): any[] => {
    return settings.customEntities[entityName] || [];
  };

  // Create or update custom entity
  const upsertCustomEntity = (entityName: string, data: any) => {
    const entities = settings.customEntities[entityName] || [];
    const timestamp = new Date().toISOString();

    if (data.id) {
      // Update existing
      const updated = entities.map((e: any) =>
        e.id === data.id ? { ...e, ...data, updatedAt: timestamp } : e
      );
      updateSettings({
        customEntities: {
          ...settings.customEntities,
          [entityName]: updated
        }
      });
      addAuditLog(entityName as any, data.id, `Updated ${entityName}`, currentUserId);
    } else {
      // Create new
      const newEntity = {
        ...data,
        id: `${entityName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: currentUserId,
        ownerId: currentUserId
      };
      updateSettings({
        customEntities: {
          ...settings.customEntities,
          [entityName]: [...entities, newEntity]
        }
      });
      addAuditLog(entityName as any, newEntity.id, `Created ${entityName}`, currentUserId);
    }
  };

  // Delete custom entity
  const deleteCustomEntity = (entityName: string, id: string): boolean => {
    const entities = settings.customEntities[entityName] || [];
    const updated = entities.filter((e: any) => e.id !== id);

    updateSettings({
      customEntities: {
        ...settings.customEntities,
        [entityName]: updated
      }
    });

    addAuditLog(entityName as any, id, `Deleted ${entityName}`, currentUserId);
    return true;
  };

  return (
    <CRMContext.Provider value={{
      leads, deals, accounts, contacts, tasks, campaigns, tickets, invoices, quotes, products, services, subscriptions, conversations, chatMessages,
      documents, communications, auditLogs, calendarEvents, notifications, users, crews, jobs, zones, equipment, inventoryItems, purchaseOrders, bankTransactions, expenses, reviews, referralRewards, inboundForms, chatWidgets, calculators, automationWorkflows, webhooks, industryTemplates,
      tacticalQueue, warehouseLocations, dispatchAlerts, rfqs, supplierQuotes,
      settings, currentUserId, currentUser, 
      searchQuery, setSearchQuery, setCurrentUserId: (id) => { setCurrentUserIdState(id); saveToDisk({ currentUserId: id }); }, 
      restoreDefaultSettings, resetDemoData, hardReset, resetSupabaseDemo, dataSource, isSupabaseConnected,
      addNote, updateStatus, toggleTask: (id) => {
        setTasks(prev => {
          const updated = prev.map(t => t.id === id ? { ...t, status: t.status === 'Completed' ? 'Todo' : 'Completed', updatedAt: new Date().toISOString() } : t);
          saveToDisk({ tasks: updated });
          return updated;
        });
      }, convertLead, convertQuoteToInvoice, markNotificationRead, updateSettings,
      upsertRecord, updateRecord, addRecord, deleteRecord, addTicketMessage, getCommunicationsForEntity, getAccountRevenueStats, canAccessRecord, hasPermission,
      sendChatMessage, startConversation, convertLeadToDeal, acceptQuote, closeDealAsWon, recordPayment, createUser, updateUser, deleteUser, updateJobWorkflow, pickBOMItem, reconcileTransaction, getReconciliationSuggestions,
      modal, openModal, closeModal, globalSearchResults,
      salesStats, financialStats,
      marketingStats: {
        totalLeads: permittedLeads.length,
        roi: (() => { const spent = campaigns.reduce((s, c) => s + (c.spent ?? 0), 0); const rev = campaigns.reduce((s, c) => s + (c.revenueGenerated ?? 0), 0); return spent > 0 ? Math.round((rev / spent) * 10) / 10 : 0; })(),
        leadsBySource: leads.reduce((acc, l) => { acc[l.source] = (acc[l.source] || 0) + 1; return acc; }, {} as Record<string, number>),
        campaignPerformance: campaigns.map(c => ({ name: c.name, leads: c.leadsGenerated ?? 0, revenue: c.revenueGenerated ?? 0 })),
        trends: { roi: 2, leads: 5 }
      },
      opsStats: {
        efficiencySaved: Math.round(jobs.filter(j => j.status === 'Completed').length / (jobs.length || 1) * 100),
        projectsCompleted: jobs.filter(j => j.status === 'Completed').length,
        activeTickets: permittedTickets.length,
        urgentTickets: tickets.filter(t => t.priority === 'Urgent' && t.status !== 'Resolved').length,
        overdueTasksCount: tasks.filter(t => t.status !== 'Completed' && new Date(t.dueDate) < new Date()).length,
        trends: { activeTickets: -2, efficiency: 10 }
      },
      activeBlueprint, getCustomEntities, upsertCustomEntity, deleteCustomEntity
    }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) throw new Error('useCRM must be used within a CRMProvider');
  return context;
};
