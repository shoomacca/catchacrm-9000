# SYSTEM Control Plane Implementation Plan

**Created:** 2026-02-06
**Scope:** Transform current Settings module into full enterprise SYSTEM control plane
**Design Constraint:** Strictly maintain FlashUI design language (Tailwind classes, rounded-[45px], font-black, uppercase tracking-widest labels)

---

## Overview

Expand the current SettingsView.tsx into a comprehensive enterprise control plane covering:
1. **GENERAL** - The Identity Engine
2. **MODULES** - Feature Flag Matrix
3. **USERS_ACCESS** - Enterprise Governance (RBAC)
4. **INTEGRATIONS** - Connectivity Hub
5. **AUTOMATION** - Logic Core
6. **DOMAIN_CONFIG** - Vertical Builders (Sales, Financial, Field, Marketing)
7. **DIAGNOSTICS** - System Health

---

## PHASE 1: Type System Expansion (types.ts)

### 1.1 New CRMSettings Interface

Add these sections to the `CRMSettings` interface in `src/types.ts`:

```typescript
export interface CRMSettings {
  // === GENERAL (Identity Engine) ===
  organization: {
    legalName: string;
    tradingName: string;
    taxId: string; // ABN/EIN
    supportEmail: string;
    billingEmail: string;
    emergencyPhone: string;
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
    stripe: { enabled: boolean; publicKey: string; secretKey: string; passSurcharge: boolean };
    paypal: { enabled: boolean; clientId: string; clientSecret: string };
    xero: { enabled: boolean; syncFrequency: 'daily' | 'weekly' | 'manual' };
    twilio: { enabled: boolean; sid: string; token: string; callerId: string };
    sendgrid: { enabled: boolean; apiKey: string; domain: string };
    googleMaps: { enabled: boolean; apiKey: string };
    openai: { enabled: boolean; apiKey: string };
    googleCalendar: { enabled: boolean; syncEnabled: boolean };
    outlook: { enabled: boolean; syncEnabled: boolean };
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

  // === EXISTING (keep these) ===
  leadStatuses: string[];
  leadSources: string[];
  dealStages: { label: string; probability: number }[];
  ticketStatuses: string[];
  ticketPriorities: string[];
  ticketCategories: string[];
  taskStatuses: string[];
  taskPriorities: string[];
  slaConfig: Record<string, number>;
  defaultAssignments: Partial<Record<EntityType, string>>;
  industries: string[];
  tiers: string[];
  accountTypes: string[];
  dealLossReasons: string[];
  customFields: Partial<Record<EntityType, CustomFieldDefinition[]>>;
}

// === Supporting Types ===

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
```

---

## PHASE 2: Default Settings Update (CRMContext.tsx)

Update `DEFAULT_SETTINGS` in `src/context/CRMContext.tsx` with sensible defaults:

```typescript
const DEFAULT_SETTINGS: CRMSettings = {
  // Organization
  organization: {
    legalName: 'Acme Corporation',
    tradingName: 'Acme',
    taxId: '',
    supportEmail: 'support@acme.com',
    billingEmail: 'billing@acme.com',
    emergencyPhone: '',
  },

  // Localization
  localization: {
    timezone: 'America/New_York',
    currency: 'USD',
    currencySymbol: '$',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    multiCurrencyEnabled: false,
    taxRate: 10,
  },

  // Branding
  branding: {
    name: 'CatchaCRM',
    slogan: 'Catch. Connect. Close.',
    primaryColor: '#3B82F6',
    sidebarMode: 'dark',
    logoLight: '',
    logoDark: '',
    favicon: '',
    pwaIcon: '',
    customDomain: '',
  },

  // Modules (all enabled by default)
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

  // Roles
  roles: [
    { id: 'ROLE-ADMIN', name: 'Administrator', description: 'Full system access', isSystem: true, color: '#3B82F6' },
    { id: 'ROLE-MANAGER', name: 'Manager', description: 'Team oversight and approvals', isSystem: true, color: '#8B5CF6' },
    { id: 'ROLE-USER', name: 'User', description: 'Standard access', isSystem: true, color: '#64748B' },
    { id: 'ROLE-FIELD', name: 'Field Tech', description: 'Mobile app access', isSystem: false, color: '#10B981' },
  ],

  // Permissions (sample matrix)
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

  // Integrations (all disabled by default)
  integrations: {
    stripe: { enabled: false, publicKey: '', secretKey: '', passSurcharge: false },
    paypal: { enabled: false, clientId: '', clientSecret: '' },
    xero: { enabled: false, syncFrequency: 'daily' },
    twilio: { enabled: false, sid: '', token: '', callerId: '' },
    sendgrid: { enabled: false, apiKey: '', domain: '' },
    googleMaps: { enabled: false, apiKey: '' },
    openai: { enabled: false, apiKey: '' },
    googleCalendar: { enabled: false, syncEnabled: false },
    outlook: { enabled: false, syncEnabled: false },
  },

  // Automation
  automation: {
    executionMode: 'synchronous',
    retryPolicy: 3,
    loggingEnabled: true,
    errorNotifications: true,
    emailFrom: 'noreply@company.com',
    emailFromName: 'CRM System',
    trackOpens: true,
  },

  // Domain Configs
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

  // Tax Engine
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

  // Field Config
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

  // Marketing Config
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

  // Diagnostics
  diagnostics: {
    auditLogRetentionDays: 90,
    emailLogRetentionDays: 30,
    apiUsageTracking: true,
    dataIntegrityChecks: true,
  },

  // Existing fields (preserve)
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
};
```

---

## PHASE 3: SettingsView.tsx Rewrite

### 3.1 New Tab Structure

Replace current tab navigation with:

```typescript
type SettingTab = 'GENERAL' | 'MODULES' | 'USERS_ACCESS' | 'INTEGRATIONS' | 'AUTOMATION' | 'DOMAIN_CONFIG' | 'DIAGNOSTICS';

// Sub-tabs for DOMAIN_CONFIG
type DomainSubTab = 'SALES' | 'FINANCIAL' | 'FIELD' | 'MARKETING';
```

### 3.2 Tab Navigation Component

```tsx
const tabs = [
  { id: 'GENERAL', icon: Building2, label: 'General', description: 'Identity & Branding' },
  { id: 'MODULES', icon: Layers, label: 'Modules', description: 'Feature Flags' },
  { id: 'USERS_ACCESS', icon: ShieldCheck, label: 'Users & Access', description: 'RBAC & Teams' },
  { id: 'INTEGRATIONS', icon: Plug, label: 'Integrations', description: 'External Services' },
  { id: 'AUTOMATION', icon: Zap, label: 'Automation', description: 'Workflows & Templates' },
  { id: 'DOMAIN_CONFIG', icon: Settings2, label: 'Domain Config', description: 'Module Settings' },
  { id: 'DIAGNOSTICS', icon: Activity, label: 'Diagnostics', description: 'System Health' },
];
```

### 3.3 Tab Content Structure

#### GENERAL Tab
- Organization Profile Card (Legal Name, Trading Name, Tax ID)
- Contact Information Card (Support Email, Billing Email, Emergency Phone)
- Localization Card (Timezone dropdown, Currency, Date/Time Format)
- Branding Card (Primary Color picker, Sidebar Mode, Logo uploads)
- Domain Mapping Card (Custom Domain with CNAME instructions)

#### MODULES Tab
- Feature Flag Matrix with toggle switches
- Module dependencies warning (e.g., "Inventory requires Field Logistics")
- Sub-module granularity toggles

#### USERS_ACCESS Tab
- User Directory (list with role badges)
- Role Builder (create custom roles)
- Permission Matrix (expandable grid)
- Teams & Crews management
- Field Level Security rules

#### INTEGRATIONS Tab
- Financial Gateways (Stripe, PayPal)
- Communications (Twilio, SendGrid)
- Calendar Sync (Google, Outlook)
- Maps & Geo (Google Maps)
- AI Services (OpenAI)
- Connection status indicators

#### AUTOMATION Tab
- Link to Workflow Builder (/workflows)
- Link to Webhooks (/webhooks)
- Communication Templates manager
- Document Templates manager
- Automation Settings (execution mode, retry, logging)

#### DOMAIN_CONFIG Tab (with sub-tabs)
- Sales: Pipelines, Lead Scoring, Lost Reasons
- Financial: Tax Engine, Ledger Mapping, Numbering Series
- Field: Job Templates, Zones, Inventory Rules, Scheduling
- Marketing: Review Platforms, Referral Settings, Sender Profiles

#### DIAGNOSTICS Tab
- Audit Log viewer (filterable, searchable)
- Email/SMS Delivery logs
- API Usage metrics
- Data Integrity checker (orphan detector)
- System Maintenance actions (existing reset buttons)

---

## PHASE 4: Reusable Components

Create these reusable components for Settings:

### 4.1 ToggleSwitch
```tsx
const ToggleSwitch = ({ label, description, value, onChange, disabled }: ToggleSwitchProps) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
    <div>
      <p className="text-sm font-bold text-slate-900">{label}</p>
      {description && <p className="text-[10px] text-slate-400 mt-1">{description}</p>}
    </div>
    <button
      onClick={() => !disabled && onChange(!value)}
      className={`relative w-14 h-7 rounded-full transition-colors ${
        value ? 'bg-emerald-500' : 'bg-slate-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
        value ? 'translate-x-7' : 'translate-x-0.5'
      }`} />
    </button>
  </div>
);
```

### 4.2 ColorPicker
```tsx
const ColorPicker = ({ label, value, onChange }: ColorPickerProps) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">{label}</label>
    <div className="flex gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-14 h-14 rounded-2xl border-2 border-slate-100 cursor-pointer"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
        placeholder="#000000"
      />
    </div>
  </div>
);
```

### 4.3 PermissionMatrix
```tsx
const PermissionMatrixGrid = ({ roles, permissions, onUpdate }: PermissionMatrixProps) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-slate-100">
          <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Module</th>
          {roles.map(role => (
            <th key={role.id} className="text-center p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{role.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {['sales', 'finance', 'operations', 'field', 'marketing'].map(module => (
          <tr key={module} className="border-b border-slate-50">
            <td className="p-4 text-sm font-bold text-slate-900 capitalize">{module}</td>
            {roles.map(role => (
              <td key={role.id} className="p-4 text-center">
                <PermissionDropdown
                  value={permissions[role.id]?.[module]}
                  onChange={(perms) => onUpdate(role.id, module, perms)}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
```

### 4.4 IntegrationCard
```tsx
const IntegrationCard = ({ name, icon, description, enabled, onToggle, onConfigure }: IntegrationCardProps) => (
  <div className={`p-6 rounded-[35px] border transition-all ${
    enabled ? 'bg-white border-emerald-200 shadow-lg' : 'bg-slate-50 border-slate-100'
  }`}>
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
          enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
        }`}>
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-900">{name}</h4>
          <p className="text-[10px] text-slate-400">{description}</p>
        </div>
      </div>
      <ToggleSwitch value={enabled} onChange={onToggle} />
    </div>
    {enabled && (
      <button
        onClick={onConfigure}
        className="w-full py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 transition-colors"
      >
        Configure
      </button>
    )}
  </div>
);
```

---

## PHASE 5: State Management Updates

### 5.1 Add to CRMContext

```typescript
// Add these methods to CRMContextType
updateOrganization: (data: Partial<CRMSettings['organization']>) => void;
updateLocalization: (data: Partial<CRMSettings['localization']>) => void;
updateBranding: (data: Partial<CRMSettings['branding']>) => void;
updateModules: (data: Partial<CRMSettings['modules']>) => void;
updateIntegration: (key: keyof CRMSettings['integrations'], data: any) => void;
updatePermissions: (roleId: string, module: string, perms: any) => void;
addRole: (role: Role) => void;
updateRole: (roleId: string, data: Partial<Role>) => void;
deleteRole: (roleId: string) => void;
addTeam: (team: Team) => void;
updateTeam: (teamId: string, data: Partial<Team>) => void;
deleteTeam: (teamId: string) => void;
// ... etc for all settings sections
```

### 5.2 Migration Handler

Add migration logic to handle existing settings:

```typescript
const migrateSettings = (stored: any): CRMSettings => {
  // Start with defaults
  const migrated = { ...DEFAULT_SETTINGS };

  // Preserve existing branding
  if (stored.branding) {
    migrated.branding = { ...migrated.branding, ...stored.branding };
  }

  // Preserve existing localization
  if (stored.localization) {
    migrated.localization = { ...migrated.localization, ...stored.localization };
  }

  // Preserve existing lists
  if (stored.leadStatuses) migrated.leadStatuses = stored.leadStatuses;
  if (stored.leadSources) migrated.leadSources = stored.leadSources;
  // ... etc

  return migrated;
};
```

---

## PHASE 6: Audit Log Implementation

### 6.1 AuditLog Type Enhancement

```typescript
export interface AuditLog extends CRMBase {
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'permission_change' | 'settings_change';
  fieldName?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}
```

### 6.2 Audit Log Viewer Component

```tsx
const AuditLogViewer = () => {
  const [filters, setFilters] = useState({ entityType: '', action: '', userId: '', dateRange: '7d' });
  const { auditLogs } = useCRM();

  // Filter and paginate logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (filters.entityType && log.entityType !== filters.entityType) return false;
      if (filters.action && log.action !== filters.action) return false;
      if (filters.userId && log.createdBy !== filters.userId) return false;
      return true;
    });
  }, [auditLogs, filters]);

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex gap-4">
        <select>...</select>
        <select>...</select>
        <input type="date" />
      </div>

      {/* Log table */}
      <div className="bg-white rounded-[35px] border border-slate-200 overflow-hidden">
        {filteredLogs.map(log => (
          <AuditLogRow key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
};
```

---

## Implementation Order

1. **types.ts** - Add all new types (30 min)
2. **CRMContext.tsx** - Update DEFAULT_SETTINGS and add migration (45 min)
3. **SettingsView.tsx** - Restructure tabs and implement GENERAL tab (1 hr)
4. **SettingsView.tsx** - Implement MODULES tab (30 min)
5. **SettingsView.tsx** - Implement USERS_ACCESS tab (1.5 hr)
6. **SettingsView.tsx** - Implement INTEGRATIONS tab (1 hr)
7. **SettingsView.tsx** - Implement AUTOMATION tab (30 min)
8. **SettingsView.tsx** - Implement DOMAIN_CONFIG tab with sub-tabs (2 hr)
9. **SettingsView.tsx** - Implement DIAGNOSTICS tab (1 hr)
10. **Testing & polish** - Verify all functionality preserved (30 min)

---

## Files to Modify

1. `src/types.ts` - Add new interfaces
2. `src/context/CRMContext.tsx` - Update DEFAULT_SETTINGS, add migration, add new methods
3. `src/pages/SettingsView.tsx` - Complete rewrite with new structure

## Files to Create (Optional)

1. `src/components/settings/ToggleSwitch.tsx`
2. `src/components/settings/ColorPicker.tsx`
3. `src/components/settings/PermissionMatrix.tsx`
4. `src/components/settings/IntegrationCard.tsx`
5. `src/components/settings/AuditLogViewer.tsx`

---

## Design Guidelines (FlashUI)

Maintain these patterns throughout:
- **Border radius:** `rounded-[35px]` for cards, `rounded-2xl` for inputs
- **Labels:** `text-[10px] font-black text-slate-400 uppercase tracking-widest`
- **Card headers:** `text-xl font-black text-slate-900 tracking-tight`
- **Inputs:** `px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold`
- **Buttons (primary):** `bg-blue-600 text-white shadow-lg shadow-blue-500/20`
- **Buttons (secondary):** `bg-slate-100 text-slate-700 hover:bg-slate-200`
- **Toggle active:** `bg-emerald-500`
- **Cards:** `bg-white border border-slate-200 rounded-[45px] p-10 shadow-sm`

---

## Backward Compatibility

- Preserve all existing `localSettings` state operations
- Preserve all existing `handleSave`, `handleListUpdate`, etc. functions
- Merge new settings with existing on load
- Don't break existing functionality in other pages that read settings
