export type OperationalDomain = 'admin' | 'manager' | 'agent' | 'technician';

export type EntityType =
  | 'leads'
  | 'deals'
  | 'accounts'
  | 'contacts'
  | 'tasks'
  | 'tickets'
  | 'campaigns'
  | 'users'
  | 'calendarEvents'
  | 'invoices'
  | 'quotes'
  | 'products'
  | 'services'
  | 'subscriptions'
  | 'documents'
  | 'communications'
  | 'conversations'
  | 'chatMessages'
  | 'crews'
  | 'jobs'
  | 'zones'
  | 'equipment'
  | 'inventoryItems'
  | 'purchaseOrders'
  | 'bankTransactions'
  | 'expenses'
  | 'reviews'
  | 'referralRewards'
  | 'inboundForms'
  | 'chatWidgets'
  | 'calculators'
  | 'automationWorkflows'
  | 'webhooks'
  | 'industryTemplates';

export type CommunicationOutcome = 'answered' | 'no-answer' | 'voicemail' | 'meeting-booked' | 'converted';

export type JobType = 'Install' | 'Service' | 'Emergency' | 'Inspection' | 'Audit';
export type JobStatus = 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled' | 'OnHold';
export type POStatus = 'Draft' | 'Ordered' | 'Dispatched' | 'Delivered';
export type ReviewPlatform = 'Google' | 'Facebook' | 'Yelp' | 'Trustpilot' | 'Internal';
export type CalculatorType = 'ROI' | 'Repayment' | 'SolarYield';
export type WorkflowTriggerType = 'RecordCreated' | 'FieldUpdated' | 'ThresholdReached' | 'FormSubmitted' | 'DateArrived';
export type WorkflowNodeType = 'Action' | 'Filter' | 'Delay';
export type WorkflowActionType = 'SendEmail' | 'SendSMS' | 'CreateTask' | 'UpdateField' | 'Webhook';

export type CustomFieldType =
  | 'text'
  | 'number'
  | 'currency'
  | 'date'
  | 'time'
  | 'select'
  | 'signature'
  | 'file'
  | 'barcode'
  | 'boolean';

export interface Address {
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
}

export interface CustomFieldDefinition {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'checkbox';
  options?: string[]; // for select
  required: boolean;
}

export interface User extends CRMBase {
  name: string;
  email: string;
  role: OperationalDomain;
  avatar: string;
  managerId?: string;
  team?: string;
}

export interface CRMBase {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  ownerId?: string; // Explicit owner for permission checks
}

export interface Notification extends CRMBase {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  read: boolean;
  link?: string;
}

export interface AuditLog extends CRMBase {
  entityType: EntityType;
  entityId: string;
  action: string;
  previousValue?: string;
  newValue?: string;
  metadata?: Record<string, any>;
  batchId?: string;
}

export interface Lead extends CRMBase {
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  campaignId?: string;
  estimatedValue: number;
  avatar: string;
  score: number;
  address?: Address;
  lastContactDate?: string;
  notes?: string;
  commissionRate?: number; // Commission % for lead conversion
  // Conversion tracking
  convertedToDealId?: string; // ID of the Deal this lead was converted to
  convertedAt?: string; // Timestamp of conversion
  convertedBy?: string; // User who converted the lead
  customData?: Record<string, any>;
}

export interface Account extends CRMBase {
  name: string;
  industry: string;
  website: string;
  employeeCount: number;
  avatar: string;
  tier: string;
  email?: string;
  city?: string;
  state?: string;
  logo?: string;
  address?: Address;
  commissionRate?: number; // Default commission % for deals with this account
  customData?: Record<string, any>;
}

export interface Contact extends CRMBase {
  name: string;
  accountId: string;
  email: string;
  phone: string;
  title: string;
  avatar: string;
  company?: string; // Denormalized company name for quick access
  address?: Address;
  customData?: Record<string, any>;
}

export interface Deal extends CRMBase {
  name: string;
  accountId: string;
  contactId: string;
  amount: number;
  stage: string;
  probability: number;
  expectedCloseDate: string;
  assigneeId: string;
  avatar: string;
  stageEntryDate?: string;
  campaignId?: string;
  commissionRate?: number; // Commission % for this deal
  commissionAmount?: number; // Calculated commission amount
  // Origin tracking
  leadId?: string; // ID of the Lead this deal was converted from
  // Won conversion tracking
  wonAt?: string; // Timestamp when deal was marked as won
  createdAccountId?: string; // Account created when deal was won
  createdContactId?: string; // Contact created when deal was won
  customData?: Record<string, any>;
}

export interface Task extends CRMBase {
  title: string;
  description: string;
  assigneeId: string;
  dueDate: string;
  status: string;
  priority: string;
  relatedToId: string;
  relatedToType: EntityType;
}

export interface CalendarEvent extends CRMBase {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  type: 'Meeting' | 'Call' | 'Internal' | 'Deadline' | 'Personal' | 'Follow-up';
  location?: string;
  relatedToType?: EntityType;
  relatedToId?: string;
  priority?: 'high' | 'medium' | 'low';
  isAllDay?: boolean;
}

export interface Campaign extends CRMBase {
  name: string;
  type: 'Email' | 'Social' | 'Search' | 'Event' | 'Referral';
  budget: number;
  spent?: number; // Amount spent so far
  revenue?: number; // Revenue generated (alias for revenueGenerated)
  revenueGenerated: number;
  leadsGenerated?: number; // Number of leads captured
  status: 'Planning' | 'Active' | 'Paused' | 'Completed' | 'Cancelled';
  startDate?: string;
  endDate?: string;
  description?: string;
  expectedCPL?: number; // Expected Cost Per Lead
  targetAudience?: string; // Segmentation criteria
  templateId?: string; // Link to template library
}

export interface Communication extends CRMBase {
  type: 'Email' | 'Call' | 'SMS' | 'Note';
  subject: string;
  content: string;
  direction: 'Inbound' | 'Outbound';
  relatedToType: EntityType;
  relatedToId: string;
  outcome: CommunicationOutcome;
  nextStep?: string;
  nextFollowUpDate?: string;
  metadata?: Record<string, any>;
}

export interface TicketMessage {
  sender: string;
  senderId: string;
  text: string;
  time: string;
  isMe?: boolean;
  isBot?: boolean;
}

export interface Ticket extends CRMBase {
  ticketNumber: string; // Auto-generated TKT-YYYY-XXXX
  subject: string;
  description: string;
  requesterId: string;
  accountId?: string;
  assigneeId: string;
  status: string;
  priority: string;
  slaDeadline: string;
  messages: TicketMessage[];
  internalNotes?: TicketMessage[];
  customData?: Record<string, any>;
  relatedToId?: string;
  relatedToType?: EntityType;
}

export interface ChatMessage extends CRMBase {
  conversationId: string;
  senderId: string;
  content: string;
}

export interface Conversation extends CRMBase {
  participantIds: string[];
  name?: string; // For named group channels (e.g., "General", "Sales Team")
  isSystem?: boolean; // For mandatory system channels that cannot be left
}

export interface Crew extends CRMBase {
  name: string;
  leaderId: string;
  memberIds: string[];
  color: string;
}

export interface Zone extends CRMBase {
  name: string;
  region: string;
  description?: string;
  color?: string;
}

export interface JobField {
  id: string;
  label: string;
  type: CustomFieldType;
  options?: string[];
  value?: any;
  required: boolean;
}

export interface BOMItem {
  inventoryItemId: string;
  qtyRequired: number;
  qtyPicked: number;
  serialNumbers?: string[];
}

export interface Job extends CRMBase {
  jobNumber: string; // Auto-generated JOB-YYYY-XXXX
  name?: string; // Alternative display name
  subject: string;
  description: string;
  accountId: string;
  assigneeId?: string;
  crewId?: string;
  jobType: JobType;
  status: JobStatus;
  priority: string;
  zone?: string;
  estimatedDuration?: number;
  scheduledDate?: string;
  scheduledEndDate?: string;
  completedAt?: string;
  lat?: number;
  lng?: number;
  jobFields?: JobField[];
  swmsSigned?: boolean;
  completionSignature?: string;
  evidencePhotos?: string[];
  bom?: BOMItem[];
  invoiceId?: string;
}

export interface Equipment extends CRMBase {
  name: string;
  type: string;
  barcode: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Damaged';
  location: string;
  assignedTo?: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
  purchaseDate?: string;
  purchasePrice?: number;
}

export interface InventoryItem extends CRMBase {
  name: string;
  sku: string;
  warehouseQty: number;
  reorderPoint: number;
  category: 'Asset' | 'Material';
  unitPrice: number;
}

export interface PurchaseOrder extends CRMBase {
  poNumber: string;
  supplierId: string;
  accountId: string;
  status: POStatus;
  items: { sku: string; name: string; qty: number; price: number }[];
  total: number;
  linkedJobId?: string;
}

export interface BankTransaction extends CRMBase {
  date: string;
  description: string;
  amount: number;
  type: 'Credit' | 'Debit';
  status: 'unmatched' | 'matched' | 'ignored';
  matchConfidence: 'none' | 'amber' | 'green';
  matchedToId?: string;
  matchedToType?: 'invoices' | 'expenses' | 'other';
  reconciled: boolean;
  reconciledAt?: string;
  reconciledBy?: string;
  bankReference?: string;
  notes?: string;
}

export interface Expense extends CRMBase {
  vendor: string;
  amount: number;
  category: 'Materials' | 'Fuel' | 'Subbies' | 'Rent' | 'Other';
  date: string;
  status: 'Paid' | 'Pending';
  receiptUrl?: string;
  approvedBy?: string;
}

export interface Review extends CRMBase {
  authorName: string;
  rating: number;
  content: string;
  platform: ReviewPlatform;
  status: 'New' | 'Replied' | 'Escalated' | 'Ignored';
  replied?: boolean; // Quick boolean flag for filtering
  replyContent?: string;
  repliedAt?: string;
  jobId?: string;
  accountId?: string; // Link to account if applicable
  sentiment: 'Positive' | 'Neutral' | 'Negative';
}

export interface ReferralReward extends CRMBase {
  referrerId: string;
  referredLeadId: string;
  rewardAmount: number; // Reward amount to be paid
  status: 'Active' | 'Pending Payout' | 'Paid' | 'Cancelled';
  payoutDate?: string;
  notes?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'file';
  placeholder?: string;
  required: boolean;
  options?: string[];
  logic?: { showIfField: string; showIfValue: string };
}

export interface InboundForm extends CRMBase {
  name: string;
  type?: 'Contact' | 'Lead' | 'Quote Request' | 'Support'; // Form category
  fields: FormField[];
  submitButtonText: string;
  successMessage: string;
  targetCampaignId?: string;
  submissionCount: number;
  conversionRate?: number; // Percentage of submissions that converted
  status?: 'Active' | 'Inactive' | 'Draft';
  embedCode?: string; // HTML/JavaScript snippet for embedding
}

export interface ChatWidget extends CRMBase {
  name: string;
  page?: string; // Which page the widget is on
  bubbleColor: string;
  welcomeMessage: string;
  isActive: boolean;
  status?: 'Active' | 'Inactive';
  routingUserId: string;
  conversations?: number; // Total conversations count
  avgResponseTime?: number; // Average response time in seconds
}

export interface Calculator extends CRMBase {
  name: string;
  type: CalculatorType;
  baseRate?: number;
  isActive: boolean;
  status?: 'Active' | 'Inactive';
  usageCount?: number; // Number of times calculator was used
  leadConversionRate?: number; // Percentage of users who became leads
}

export interface WorkflowTrigger {
  type: WorkflowTriggerType;
  entity: EntityType;
  config: Record<string, any>;
}

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  actionType?: WorkflowActionType;
  config: Record<string, any>;
  nextId?: string;
  failId?: string;
}

export interface AutomationWorkflow extends CRMBase {
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  nodes: WorkflowNode[];
  isActive: boolean;
  executionCount: number;
  lastRunAt?: string;
  category: 'Sales' | 'Operations' | 'Logistics' | 'System';
}

export interface Webhook extends CRMBase {
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  isActive: boolean;
  triggerEvent: string;
  lastTriggeredAt?: string;
  successCount: number;
  failureCount: number;
}

export interface CustomFieldDef {
  id: string;
  label: string;
  type: CustomFieldType;
  placeholder?: string;
  required: boolean;
  options?: string[];
  defaultValue?: any;
  helpText?: string;
}

export interface LayoutSection {
  id: string;
  title: string;
  fields: CustomFieldDef[];
}

export interface IndustryTemplate extends CRMBase {
  name: string;
  targetEntity: EntityType;
  industry: string;
  sections: LayoutSection[];
  isActive: boolean;
  version: number;
}

export interface Product extends CRMBase{
  name: string;
  sku?: string;
  code?: string; // Alternative code (for union type compatibility)
  description: string;
  category?: string; // e.g., Hardware, Software, Parts, Materials, Equipment
  type?: string; // More specific categorization within category
  unitPrice: number;
  costPrice?: number; // Cost to acquire
  taxRate: number;
  isActive: boolean;
  // Inventory tracking
  stockLevel?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  // Product details
  specifications?: string; // Detailed technical specs
  images?: string[]; // Array of image URLs
  dimensions?: { length?: number; width?: number; height?: number; unit?: string };
  weight?: { value?: number; unit?: string };
  manufacturer?: string;
  supplier?: string;
  supplierSKU?: string;
  warrantyMonths?: number;
  warrantyDetails?: string;
  // Metadata
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface Service extends CRMBase {
  name: string;
  code?: string;
  sku?: string; // Alternative SKU (for union type compatibility)
  description: string;
  category?: string; // e.g., Consulting, Installation, Maintenance, Support, Training
  type?: string; // More specific categorization
  billingCycle: 'one-off' | 'monthly' | 'quarterly' | 'yearly';
  unitPrice: number;
  costPrice?: number; // Cost to deliver
  taxRate: number;
  isActive: boolean;
  // Service details
  durationHours?: number; // Estimated time to complete
  durationMinutes?: number;
  prerequisites?: string; // Requirements before service can be performed
  deliverables?: string; // What customer receives
  skillsRequired?: string[]; // Skills needed to perform service
  crewSize?: number; // Number of technicians required
  equipmentNeeded?: string[]; // Equipment/tools required
  // SLA & Quality
  slaResponseHours?: number;
  slaCompletionDays?: number;
  qualityChecklist?: string[];
  // Metadata
  images?: string[]; // Service photos/diagrams
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface LineItem {
  itemType: 'product' | 'service';
  itemId: string;
  description: string;
  qty: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
}

export interface Quote extends CRMBase {
  quoteNumber: string;
  dealId: string;
  accountId: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Expired' | 'Superseded';
  issueDate: string;
  expiryDate: string;
  lineItems: LineItem[];
  subtotal: number;
  taxTotal: number;
  total: number;
  notes?: string;
  terms?: string;
  // Acceptance tracking
  acceptedAt?: string; // When the quote was accepted
  acceptedBy?: string; // User who accepted the quote
  supersededBy?: string; // ID of the quote that superseded this one
  version?: number; // Quote version number (1, 2, 3...)
}

export interface InvoiceCredit {
  amount: number;
  reason: string;
  appliedAt: string;
}

export interface Invoice extends CRMBase {
  invoiceNumber: string;
  accountId: string;
  dealId?: string;
  quoteId?: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'partially_paid' | 'failed';
  issueDate: string;
  invoiceDate: string; // Date invoice was issued (for display)
  dueDate: string;
  sentAt?: string;
  paidAt?: string;
  lineItems: LineItem[];
  subtotal: number;
  taxTotal: number;
  total: number;
  notes?: string; // Additional invoice notes
  terms?: string; // Payment terms
  credits?: InvoiceCredit[];
}

export interface Subscription extends CRMBase {
  accountId: string;
  name: string;
  status: 'Active' | 'Paused' | 'Cancelled';
  billingCycle: 'one-off' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  nextBillDate: string;
  startDate: string;
  endDate?: string;
  items: Omit<LineItem, 'lineTotal'>[];
  autoGenerateInvoice: boolean;
  lastInvoiceId?: string;
}

export interface Document extends CRMBase {
  title: string;
  fileType: string;
  fileSize: string;
  url: string;
  relatedToType: EntityType;
  relatedToId: string;
}

// === Role & Permission Types ===

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean; // admin, manager, user are system roles
  color: string;
}

export interface PermissionMatrix {
  [roleId: string]: {
    [module: string]: {
      viewGlobal: boolean;
      viewTeam: boolean;
      viewOwn: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
      export: boolean;
    };
  };
}

export interface Team {
  id: string;
  name: string;
  managerId: string;
  memberIds: string[];
  description: string;
}

export interface CrewConfig {
  id: string;
  name: string;
  memberIds: string[];
  zoneId?: string;
  skills: string[];
}

export interface FieldSecurityRule {
  id: string;
  entityType: EntityType;
  fieldName: string;
  hiddenFromRoles: string[];
}

// === Pipeline & Sales Types ===

export interface Pipeline {
  id: string;
  name: string;
  entityType: 'leads' | 'deals' | 'tickets' | 'jobs';
  stages: { label: string; probability?: number; color: string; order: number }[];
  isDefault: boolean;
}

export interface LeadScoringRule {
  id: string;
  trigger: string; // e.g., 'email_opened', 'form_submitted', 'no_answer'
  points: number; // positive or negative
  description: string;
}

// === Financial Types ===

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  isDefault: boolean;
  region?: string;
}

export interface LedgerMapping {
  id: string;
  eventType: string; // e.g., 'sales', 'stripe_fees', 'refund'
  glCode: string;
  description: string;
}

// === Field Operations Types ===

export interface JobTemplate {
  id: string;
  name: string;
  description: string;
  estimatedDuration: number; // minutes
  requiredSkills: string[];
  customFields: CustomFieldDefinition[];
  checklistItems: string[];
}

export interface ZoneConfig {
  id: string;
  name: string;
  color: string;
  polygon?: { lat: number; lng: number }[]; // For map drawing
  assignedCrewIds: string[];
}

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  isDefault: boolean;
}

// === CRM Settings Interface ===

export interface CRMSettings {
  // === GENERAL (Identity Engine) ===
  organization: {
    legalName: string;
    tradingName: string;
    taxId: string; // ABN/EIN
    supportEmail: string;
    billingEmail: string;
    emergencyPhone: string;
    industry: IndustryType; // Active industry blueprint
  };
  localization: {
    timezone: string; // e.g., 'Australia/Sydney'
    currency: string;
    currencySymbol: string;
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    timeFormat: '12h' | '24h';
    multiCurrencyEnabled: boolean;
    taxRate: number;
  };
  branding: {
    name: string;
    slogan: string;
    primaryColor: string; // Hex e.g., '#00E5FF'
    sidebarMode: 'dark' | 'light' | 'brand';
    theme: 'light' | 'dark'; // System-wide dark mode
    logoLight: string;
    logoDark: string;
    favicon: string;
    pwaIcon: string;
    customDomain: string;
  };

  // === MODULES (Feature Flags) ===
  modules: {
    salesEngine: boolean;
    financials: boolean;
    fieldLogistics: boolean;
    marketing: boolean;
    // Sub-modules
    bankFeeds: boolean;
    inventory: boolean;
    dispatch: boolean;
    reputation: boolean;
    referrals: boolean;
    inboundForms: boolean;
    chatWidgets: boolean;
    subscriptions: boolean;
    purchaseOrders: boolean;
  };

  // === USERS & ACCESS ===
  roles: Role[];
  permissions: PermissionMatrix;
  teams: Team[];
  crews: CrewConfig[];
  fieldLevelSecurity: FieldSecurityRule[];

  // === INTEGRATIONS ===
  integrations: {
    // Payment Processing
    stripe: {
      enabled: boolean;
      mode: 'test' | 'live'; // Test or live mode
      publicKey: string; // Publishable key (pk_test_... or pk_live_...)
      secretKey: string; // Secret key (sk_test_... or sk_live_...)
      webhookSecret?: string; // Webhook signing secret for signature verification
      webhookEndpoint?: string; // Webhook endpoint URL
      passSurcharge: boolean; // Pass credit card surcharge to customer
    };
    paypal: {
      enabled: boolean;
      mode: 'sandbox' | 'live'; // Sandbox or live mode
      clientId: string;
      clientSecret: string;
      webhookId?: string; // Webhook ID for verification
    };

    // Accounting
    xero: {
      enabled: boolean;
      syncFrequency: 'daily' | 'weekly' | 'manual';
      clientId?: string; // OAuth 2.0 client ID
      tenantId?: string; // Xero organization/tenant ID
    };

    // Communications - Traditional Providers
    twilio: {
      enabled: boolean;
      accountSid: string; // Account SID (replaces 'sid')
      authToken: string; // Auth Token (replaces 'token')
      phoneNumber: string; // Twilio phone number in E.164 format (e.g., +61412345678)
      callerId: string; // Caller ID name for outbound calls
      statusCallbackUrl?: string; // Webhook URL for delivery status
    };
    sendgrid: {
      enabled: boolean;
      apiKey: string; // API key with appropriate scopes
      domain: string; // Verified sender domain
      fromEmail?: string; // Default from email address
      fromName?: string; // Default from name
      webhookUrl?: string; // Webhook URL for delivery tracking
    };

    // BYO (Bring Your Own) Integrations for Australian Telco
    byoSip: {
      enabled: boolean;
      provider: string; // Provider name (e.g., "Telstra", "Optus", "Aatrox", "Telcoinabox")
      sipServer: string; // SIP server address (e.g., "sip.provider.com.au")
      sipPort: number; // SIP port (usually 5060 for UDP, 5061 for TLS)
      username: string; // SIP username/account
      password: string; // SIP password/secret
      realm?: string; // SIP realm/domain
      outboundProxy?: string; // Optional outbound proxy server
      callerIdName?: string; // Display name for outbound calls
      callerIdNumber?: string; // Australian number in E.164 format (e.g., "+61412345678")
      transport?: 'udp' | 'tcp' | 'tls'; // SIP transport protocol (default: udp)
      registerExpires?: number; // Registration expiry in seconds (default: 600)
    };
    byoSms: {
      enabled: boolean;
      provider: string; // Provider name (e.g., "MessageMedia", "ClickSend", "SMS Global")
      apiEndpoint: string; // SMS API endpoint (e.g., "https://api.provider.com.au/sms/v1")
      apiKey: string; // API key for authentication
      apiSecret?: string; // Optional API secret for HMAC signing
      fromNumber: string; // Australian mobile number in E.164 format (e.g., "+61412345678")
      fromName?: string; // Optional alpha sender ID (11 chars max, may not work on all carriers)
      webhookUrl?: string; // Delivery receipt webhook URL
      authMethod?: 'basic' | 'bearer' | 'header'; // API authentication method (default: bearer)
    };

    // External Services
    googleMaps: {
      enabled: boolean;
      apiKey: string; // API key with Geocoding, Places, and Maps JavaScript API enabled
      defaultRegion?: string; // Default region bias (e.g., 'AU' for Australia)
    };
    openai: {
      enabled: boolean;
      apiKey: string; // OpenAI API key (sk-...)
      organizationId?: string; // Optional organization ID
      defaultModel?: string; // Default model (e.g., 'gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo')
      maxTokens?: number; // Default max tokens for completions
    };

    // Calendar Sync
    googleCalendar: {
      enabled: boolean;
      syncEnabled: boolean;
      clientId?: string; // OAuth 2.0 client ID
      calendarId?: string; // Default calendar ID
    };
    outlook: {
      enabled: boolean;
      syncEnabled: boolean;
      clientId?: string; // Azure AD application client ID
      tenantId?: string; // Azure AD tenant ID
    };
  };

  // === AUTOMATION ===
  automation: {
    executionMode: 'synchronous' | 'asynchronous' | 'scheduled';
    retryPolicy: number; // 0, 3, 5, 10
    loggingEnabled: boolean;
    errorNotifications: boolean;
    emailFrom: string;
    emailFromName: string;
    trackOpens: boolean;
  };

  // === DOMAIN CONFIGS ===
  // Sales Config
  pipelines: Pipeline[];
  leadScoring: LeadScoringRule[];
  lostReasons: string[];
  quoteValidityDays: number;
  paymentTerms: string;

  // Financial Config
  taxEngine: TaxRate[];
  ledgerMapping: LedgerMapping[];
  numberingSeries: {
    invoicePrefix: string;
    invoiceNextNumber: number;
    quotePrefix: string;
    quoteNextNumber: number;
    poPrefix: string;
    poNextNumber: number;
  };

  // Field Config
  jobTemplates: JobTemplate[];
  zones: ZoneConfig[];
  inventoryRules: {
    warehouses: Warehouse[];
    lowStockThreshold: number;
    criticalStockThreshold: number;
    autoReorderEnabled: boolean;
  };
  scheduling: {
    bookingBuffer: number;
    workingHoursStart: string;
    workingHoursEnd: string;
    maxJobsPerCrewPerDay: number;
    defaultServiceRadius: number;
  };

  // Marketing Config
  reviewPlatforms: { name: string; url: string; enabled: boolean }[];
  referralSettings: {
    referrerReward: number;
    refereeDiscount: number;
    minPurchaseForReward: number;
  };
  senderProfiles: { name: string; email: string; isDefault: boolean }[];

  // === DIAGNOSTICS ===
  diagnostics: {
    auditLogRetentionDays: number;
    emailLogRetentionDays: number;
    apiUsageTracking: boolean;
    dataIntegrityChecks: boolean;
  };

  // === EXISTING (backward compatibility) ===
  leadStatuses: string[];
  leadSources: string[];
  dealStages: { label: string; probability: number }[];
  ticketStatuses: string[];
  ticketPriorities: string[];
  ticketCategories: string[];
  taskStatuses: string[];
  taskPriorities: string[];
  slaConfig: Record<string, number>; // hours per priority
  defaultAssignments: Partial<Record<EntityType, string>>; // userId
  industries: string[];
  tiers: string[];
  accountTypes: string[];
  dealLossReasons: string[];
  customFields: Partial<Record<EntityType, CustomFieldDefinition[]>>;
  requiredFields: Partial<Record<EntityType, string[]>>; // List of required field names per entity
  validationRules: Partial<Record<EntityType, ValidationRule[]>>; // Validation rules per entity

  // === INDUSTRY BLUEPRINT SYSTEM ===
  activeIndustry: IndustryType; // Currently selected industry
  industryBlueprints: Record<IndustryType, IndustryBlueprint>; // All available blueprints
  customEntities: Record<string, any[]>; // Data storage for custom entities (e.g., customEntities.properties)
}

export interface ValidationRule {
  id: string;
  field: string;
  rule: 'required' | 'email' | 'phone' | 'url' | 'min' | 'max' | 'regex' | 'custom';
  value?: any; // For min/max/regex rules
  message: string;
  enabled: boolean;
}

// === Industry Blueprint System ===

export type IndustryType =
  | 'general'
  | 'real_estate'
  | 'solar'
  | 'construction'
  | 'finance'
  | 'healthcare'
  | 'legal'
  | 'automotive'
  | 'hospitality'
  | 'manufacturing';

export interface IndustryBlueprint {
  id: string;
  name: string;
  type: IndustryType;
  description: string;
  icon: string;
  customEntities: CustomEntityDefinition[]; // Industry-specific entities like "Properties" or "Installations"
  customFields: Partial<Record<EntityType, CustomFieldDefinition[]>>; // Custom fields per standard entity
  requiredFields: Partial<Record<EntityType, string[]>>; // Override required fields
  pipelines: Pipeline[]; // Custom pipelines
  statuses: Record<string, string[]>; // Custom statuses per entity
  integrations: string[]; // Recommended integrations
  modules: {
    enabled: string[]; // Which modules to enable
    disabled: string[]; // Which modules to hide
  };
}

export interface CustomEntityDefinition {
  id: string;
  name: string; // e.g., "Property", "Installation", "Loan Application"
  namePlural: string; // e.g., "Properties"
  icon: string;
  fields: CustomFieldDefinition[];
  relationTo?: EntityType[]; // Which standard entities it relates to
  hasTimeline?: boolean;
  hasDocuments?: boolean;
  hasWorkflow?: boolean;
}

// --- Audit Engine Types ---

export interface AuditFailure {
  failureCode: 'SELECTOR_BYPASS' | 'RELATION_KEY_MISMATCH' | 'RELATION_CASING_MISMATCH' | 'SETTINGS_WIPE' | 'RESET_STATE_INCONSISTENCY' | 'SEED_ORDER_VIOLATION' | 'ORPHAN_REFERENCE';
  entityType: string;
  recordId: string;
  expected: any;
  actual: any;
  likelyCause: string;
  whereToLook: string;
}

export interface AuditReport {
  summary: {
    totalChecks: number;
    passed: number;
    failed: number;
    integrityScore: number;
  };
  collections: Record<string, number>;
  settings: {
    health: 'healthy' | 'unhealthy';
    checks: Record<string, { ok: boolean; issues: string[] }>;
  };
  relationships: {
    orphanCount: number;
    orphans: { parentType: string; parentId: string; childId: string; childType: string }[];
    casingIssues: string[];
  };
  selectors: {
    discrepancies: { name: string; expected: number; actual: number; id: string }[];
  };
  tabCoverage: Record<string, { id: string; name: string; tabs: Record<string, number> }[]>;
  personaFilters: {
    totalHidden: number;
    activeUser: string;
    activeRole: string;
    impactByCollection: Record<string, { total: number; visible: number; hidden: number }>;
  };
  seedIntegrity: {
    status: 'pristine' | 'modified' | 'corrupt';
    issues: string[];
  };
  failures: AuditFailure[];
  timestamp: string;
}
