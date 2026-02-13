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
  | 'industryTemplates'
  | 'currencies'
  | 'payments'
  | 'warehouses'
  | 'roles'
  | 'tacticalQueue'
  | 'warehouseLocations'
  | 'dispatchAlerts'
  | 'rfqs'
  | 'supplierQuotes'
  | 'emailTemplates'
  | 'smsTemplates'
  | 'kbCategories'
  | 'kbArticles';

export type CommunicationOutcome = 'answered' | 'no-answer' | 'voicemail' | 'meeting-booked' | 'converted';

export type JobType = 'Install' | 'Service' | 'Emergency' | 'Inspection' | 'Audit';
export type JobStatus = 'Scheduled' | 'InProgress' | 'In Progress' | 'Completed' | 'Cancelled' | 'OnHold' | 'On Hold';
export type POStatus = 'Draft' | 'Ordered' | 'Dispatched' | 'Delivered';
export type ReviewPlatform = 'Google' | 'Facebook' | 'Yelp' | 'Trustpilot' | 'Internal';
export type CalculatorType = 'ROI' | 'Repayment' | 'SolarYield';
export type WorkflowTriggerType = 'RecordCreated' | 'FieldUpdated' | 'ThresholdReached' | 'FormSubmitted' | 'DateArrived';
export type WorkflowNodeType = 'Action' | 'Filter' | 'Delay';
export type WorkflowActionType = 'SendEmail' | 'SendSMS' | 'CreateTask' | 'UpdateField' | 'Webhook' | 'AssignOwner';

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
  type: 'text' | 'number' | 'select' | 'date' | 'checkbox' | 'email' | 'tel' | 'textarea';
  options?: string[]; // for select
  required: boolean;
  placeholder?: string;
  defaultValue?: string | number | boolean;
}

export interface User extends CRMBase {
  name: string;
  email: string;
  phone?: string;
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
  content?: string; // Alternative to message
  type: 'info' | 'warning' | 'success' | 'urgent';
  read: boolean;
  isRead?: boolean; // Alternative to read
  readAt?: string;
  link?: string;
  actionUrl?: string; // Alternative to link
  userId?: string; // Target user
  relatedToType?: EntityType;
  relatedToId?: string;
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
  accountId?: string; // Optional link to an Account
  estimatedValue: number;
  amount?: number; // Alias for estimatedValue — used by LeadsPage and Reports
  avatar: string;
  score: number;
  address?: Address;
  lastContactDate?: string;
  notes?: string;
  commissionRate?: number; // Commission % for lead conversion
  temperature?: 'Cold' | 'Warm' | 'Hot'; // Lead temperature/engagement level
  assignedTo?: string; // Assigned user ID
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
  phone?: string;
  city?: string;
  state?: string;
  logo?: string;
  address?: Address;
  revenue?: number; // Annual revenue
  status?: 'Active' | 'Inactive' | 'Prospect';
  type?: 'Customer' | 'Vendor' | 'Partner' | 'Reseller';
  billingAddress?: Address;
  commissionRate?: number; // Default commission % for deals with this account
  customData?: Record<string, any>;
}

export interface Contact extends CRMBase {
  name: string;
  accountId: string;
  email: string;
  phone: string;
  mobile?: string;
  title: string;
  avatar: string;
  company?: string; // Denormalized company name for quick access
  department?: string;
  isPrimary?: boolean; // Primary contact for the account
  role?: string;
  lastActivityDate?: string;
  interactionCount?: number;
  status?: 'Active' | 'Inactive';
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
  description?: string; // Used by some pages as alias for notes
  notes?: string; // Deal notes
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
  type: 'Email' | 'email' | 'Social' | 'social' | 'Search' | 'search' | 'Event' | 'event' | 'Referral' | 'referral';
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
  type: 'Email' | 'Call' | 'SMS' | 'Note' | 'Meeting';
  subject: string;
  content: string;
  direction: 'Inbound' | 'Outbound';
  relatedToType: EntityType;
  relatedToId: string;
  outcome: CommunicationOutcome;
  status?: string;
  notes?: string;
  date?: string;
  contactId?: string;
  summary?: string;
  nextStep?: string;
  nextFollowUpDate?: string;
  duration?: number; // Duration in seconds (for calls)
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
  assignedTo?: string; // Alias for assigneeId — used by some pages
  status: string;
  priority: string;
  category?: string;
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
  mentions?: string[]; // Array of user IDs mentioned
  attachments?: string[]; // Array of attachment URLs
  isEdited?: boolean;
  editedAt?: string;
}

export interface Conversation extends CRMBase {
  participantIds: string[];
  name?: string; // For named group channels (e.g., "General", "Sales Team")
  isSystem?: boolean; // For mandatory system channels that cannot be left
  type?: 'direct' | 'group' | 'channel';
  participants?: string[]; // Alternative to participantIds
  isActive?: boolean;
  lastMessageAt?: string;
}

export interface Crew extends CRMBase {
  name: string;
  leaderId: string;
  memberIds: string[];
  color: string;
  specialty?: string;
  status?: 'Active' | 'Inactive';
}

export interface Zone extends CRMBase {
  name: string;
  region: string;
  description?: string;
  color?: string;
  type?: string;
  status?: 'Active' | 'Inactive';
  coordinates?: { lat: number; lng: number }[];
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
  swmsSignedAt?: string;
  completionSignature?: string;
  evidencePhotos?: string[];
  bom?: BOMItem[];
  notes?: string;
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
  model?: string;
  status?: 'Available' | 'In Use' | 'Maintenance' | 'Retired';
  value?: number; // Current value
}

export interface InventoryItem extends CRMBase {
  name: string;
  sku: string;
  warehouseQty: number;
  reorderPoint: number;
  category: 'Asset' | 'Material' | 'Medical' | 'Weapons' | 'Communications' | 'Technology' | string;
  unitPrice: number;
  supplier?: string;
  lastRestocked?: string;
  location?: string;
}

export interface PurchaseOrder extends CRMBase {
  name?: string;
  poNumber: string;
  supplierId: string;
  accountId: string;
  status: POStatus;
  items: { sku: string; name: string; qty: number; price: number }[];
  total: number;
  linkedJobId?: string;
  expectedDelivery?: string;
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
  notes?: string;
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

export interface WebhookConfig extends CRMBase {
  org_id: string;
  webhook_id: string;
  auth_type?: 'none' | 'basic' | 'bearer' | 'api_key';
  auth_username?: string;
  auth_password?: string;
  auth_token?: string;
  auth_api_key?: string;
  auth_api_key_header?: string;
  custom_headers?: Record<string, string>;
  timeout_ms?: number;
  retry_enabled?: boolean;
  retry_count?: number;
  retry_delay_ms?: number;
  verify_ssl?: boolean;
}

export interface WebhookLog extends CRMBase {
  org_id: string;
  webhook_id: string;
  request_url: string;
  request_method: string;
  request_headers?: Record<string, string>;
  request_body?: any;
  response_status?: number;
  response_body?: any;
  response_time_ms?: number;
  success: boolean;
  error_message?: string;
  triggered_at: string;
  retry_count?: number;
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
  amountPaid?: number; // Total amount paid
  balanceDue?: number; // Remaining balance
  lateFeeRate?: number; // Late fee percentage
  notes?: string; // Additional invoice notes
  terms?: string; // Payment terms
  credits?: InvoiceCredit[];
}

export interface Subscription extends CRMBase {
  accountId: string;
  name: string;
  status: 'Active' | 'Paused' | 'Cancelled';
  billingCycle: 'one-off' | 'weekly' | 'monthly' | 'Monthly' | 'quarterly' | 'Quarterly' | 'yearly' | 'Yearly' | 'custom';
  nextBillDate: string;
  startDate: string;
  endDate?: string;
  items: Omit<LineItem, 'lineTotal'>[];
  autoGenerateInvoice: boolean;
  lastInvoiceId?: string;
}

export interface Document extends CRMBase {
  title: string;
  name?: string; // Alternative to title
  fileType: string;
  fileSize: string;
  url: string;
  fileUrl?: string; // Alternative to url
  relatedToType: EntityType;
  relatedToId: string;
  contentText?: string; // Extracted text content
  embedding?: number[]; // Vector embedding for search
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  processedAt?: string;
  uploadedBy?: string;
  version?: number;
  parentDocumentId?: string;
  description?: string;
  tags?: string[];
}

export interface EmailTemplate extends CRMBase {
  name: string;
  description?: string;
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  category?: string;
  folder?: string;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
  attachments?: any[];
  isActive?: boolean;
  usageCount?: number;
  lastUsedAt?: string;
}

export interface SMSTemplate extends CRMBase {
  name: string;
  description?: string;
  content: string;
  category?: string;
  isActive?: boolean;
  usageCount?: number;
  lastUsedAt?: string;
}

export interface KBCategory extends CRMBase {
  name: string;
  description?: string;
  parentCategoryId?: string;
  sortOrder?: number;
  isPublic?: boolean;
  isActive?: boolean;
}

export interface KBArticle extends CRMBase {
  title: string;
  content: string;
  summary?: string;
  categoryId?: string;
  authorId?: string;
  keywords?: string[];
  status?: 'draft' | 'published';
  publishedAt?: string;
  isPublic?: boolean;
  viewCount?: number;
  helpfulCount?: number;
  notHelpfulCount?: number;
}

// === Role & Permission Types ===

export interface Role extends CRMBase {
  name: string;
  label?: string;
  description: string;
  isSystem: boolean; // admin, manager, user are system roles
  color: string;
  parentRoleId?: string;
  hierarchyLevel?: number;
  canViewAllData?: boolean;
  canModifyAllData?: boolean;
  portalType?: 'internal' | 'customer' | 'partner';
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

export interface Currency extends CRMBase {
  isoCode: string; // e.g., 'USD', 'AUD', 'EUR'
  name: string;
  symbol: string; // e.g., '$', '€', '£'
  conversionRate: number; // Conversion rate to base currency
  decimalPlaces: number;
  isActive: boolean;
  isCorporate: boolean; // Is this the organization's base currency
}

export interface Payment extends CRMBase {
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'Credit Card' | 'Bank Transfer' | 'Cash' | 'Check' | 'PayPal' | 'Stripe' | 'Other';
  method?: string; // Alternative to paymentMethod
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  transactionId?: string;
  referenceNumber?: string;
  reference?: string; // Alternative to referenceNumber
  notes?: string;
  processedBy?: string;
  paidAt?: string;
}

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
  dealStages: { label: string; probability: number; color?: string }[];
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

// Custom Object (Supabase table representation)
export interface CustomObject extends CRMBase {
  org_id: string;
  entity_type: string; // e.g., "properties", "showings", "installations"
  name: string; // singular name, e.g., "Property"
  name_plural: string; // plural name, e.g., "Properties"
  icon?: string; // emoji icon
  fields_schema: CustomFieldDefinition[]; // JSONB array of field definitions
  relation_to?: string[]; // array of entity types this relates to
  has_timeline?: boolean;
  has_documents?: boolean;
  has_workflow?: boolean;
  is_active?: boolean;
  updated_by?: string;
}

// === Operations & Logistics Types ===

export interface TacticalQueueNote {
  text: string;
  addedBy: string;
  addedAt: string;
}

export interface TacticalQueueItem extends CRMBase {
  title: string;
  description?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  priorityScore: number;
  status: 'open' | 'in_progress' | 'escalated' | 'resolved' | 'closed';
  assigneeId?: string;
  slaDeadline?: string;
  escalationLevel: number;
  relatedToType?: 'accounts' | 'contacts' | 'leads' | 'deals' | 'tickets' | 'jobs';
  relatedToId?: string;
  relatedToName?: string;
  notes: TacticalQueueNote[];
  resolvedAt?: string;
}

export interface WarehouseLocation extends CRMBase {
  warehouseId?: string;
  name: string;
  code?: string; // e.g., "A-01-03"
  type: 'zone' | 'aisle' | 'rack' | 'bin' | 'floor';
  description?: string;
  capacity?: number;
  currentCount?: number;
  isActive: boolean;
  isPickable: boolean;
  isReceivable: boolean;
  parentLocationId?: string;
}

export interface DispatchAlert extends CRMBase {
  title: string;
  message?: string;
  type: 'info' | 'warning' | 'urgent' | 'critical';
  relatedToType?: 'jobs' | 'crews' | 'equipment' | 'zones';
  relatedToId?: string;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  expiresAt?: string;
  isDismissed: boolean;
}

export type RFQStatus = 'draft' | 'sent' | 'received' | 'evaluating' | 'awarded' | 'closed' | 'cancelled';

export interface RFQ extends CRMBase {
  rfqNumber: string;
  title: string;
  description?: string;
  status: RFQStatus;
  supplierIds?: string[]; // Array of account IDs
  lineItems: { name: string; qty: number; specs?: string; unitPrice?: number }[];
  issueDate?: string;
  dueDate?: string;
  validUntil?: string;
  purchaseOrderId?: string;
  jobId?: string;
  winningSupplierId?: string;
  awardedAt?: string;
  totalValue?: number;
  notes?: string;
  terms?: string;
}

export type SupplierQuoteStatus = 'received' | 'under_review' | 'accepted' | 'rejected' | 'expired';

export interface SupplierQuote extends CRMBase {
  quoteNumber?: string;
  rfqId?: string;
  supplierId: string;
  status: SupplierQuoteStatus;
  lineItems: { name: string; qty: number; unitPrice: number; total: number }[];
  subtotal?: number;
  taxTotal?: number;
  total?: number;
  receivedDate?: string;
  validUntil?: string;
  evaluationScore?: number;
  evaluationNotes?: string;
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

// ============================================
// IMPORT/EXPORT JOB TRACKING
// ============================================

export type ImportJobStatus = 'pending' | 'running' | 'completed' | 'failed';
export type ExportJobStatus = 'pending' | 'running' | 'completed' | 'failed';
export type JobEntityType = 'leads' | 'deals' | 'accounts' | 'contacts' | 'tasks' |
  'campaigns' | 'tickets' | 'products' | 'services' | 'invoices' | 'jobs';

export interface ImportJob extends CRMBase {
  org_id: string;
  entity_type: JobEntityType;
  file_name: string;
  file_size?: number;
  status: ImportJobStatus;
  total_rows?: number;
  success_rows?: number;
  failed_rows?: number;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_by?: string;
}

export interface ExportJob extends CRMBase {
  org_id: string;
  entity_type: JobEntityType;
  file_name: string;
  status: ExportJobStatus;
  row_count?: number;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_by?: string;
}

export interface MassOperationJob extends CRMBase {
  org_id: string;
  operation_type: 'delete' | 'update' | 'merge';
  entity_type: JobEntityType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  total_records?: number;
  processed_records?: number;
  failed_records?: number;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_by?: string;
}
