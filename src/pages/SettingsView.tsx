import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import { supabase } from '../lib/supabase';
import { getCurrentOrgId } from '../services/supabaseData';
import {
  Settings, Save, Plus, Trash2, Database, Shield, Layout, Target, Briefcase,
  PlusCircle, Settings2, Hash, Type as TextIcon, Calendar, CheckSquare, List,
  ArrowUp, ArrowDown, Globe, CreditCard, Users as UsersIcon, AlertTriangle,
  Info, Cpu, Clock, HardDrive, BarChart, UserPlus, ShieldCheck, ChevronRight,
  RotateCcw, Sparkles, Building2, Ticket as TicketIcon, Sliders, AlertCircle, Bomb,
  Zap, Webhook, FileText, Layers, Activity, Wrench, ShoppingCart,
  Truck, Package, MapPin, Users2, DollarSign, Receipt, Building, Mail,
  MessageSquare, Star, Gift, Calculator as CalculatorIcon, Eye, EyeOff, Lock, Key,
  Plug, Phone, Image, Upload, ExternalLink, RefreshCw, Play, Pause,
  Check, X, ChevronDown, Filter, Search, Download, Palette, Sun, Moon
} from 'lucide-react';
import { EntityType, CRMSettings, Role, Pipeline, LeadScoringRule, TaxRate, ImportJob, ExportJob, JobEntityType, CompanyIntegration, UserIntegration, OrgEmailAccount, SmsNumber } from '../types';
import UserModal from '../components/UserModal';
import { getCurrencyOptions, getCurrencySymbol } from '../utils/currencies';
import {
  createExportJob,
  updateExportJob,
  createImportJob,
  updateImportJob,
  fetchRecentJobs
} from '../services/supabaseData';

type SettingTab = 'GENERAL' | 'MODULES' | 'USERS_ACCESS' | 'INTEGRATIONS' | 'AUTOMATION' | 'BLUEPRINT' | 'DOMAIN_CONFIG' | 'IMPORT_EXPORT' | 'DIAGNOSTICS';
type DomainSubTab = 'SALES' | 'FINANCIAL' | 'FIELD' | 'MARKETING';

interface SettingsViewProps {
  initialTab?: SettingTab;
}

const SettingsView: React.FC<SettingsViewProps> = ({ initialTab = 'GENERAL' }) => {
  const { settings, updateSettings, restoreDefaultSettings, resetDemoData, hardReset, users, currentUserId, setCurrentUserId, currentUser, auditLogs, createUser, updateUser, deleteUser, accounts, contacts, leads, deals, tasks, campaigns, tickets, products, services, invoices, jobs, activateBlueprint, companyIntegrations, userIntegrations, orgEmailAccounts, smsNumbers, upsertRecord, deleteRecord } = useCRM();
  const [localSettings, setLocalSettings] = useState<CRMSettings>(settings);
  const [activeTab, setActiveTab] = useState<SettingTab>(initialTab);
  const [domainSubTab, setDomainSubTab] = useState<DomainSubTab>('SALES');
  const [isSaved, setIsSaved] = useState(false);
  const [auditFilter, setAuditFilter] = useState({ entityType: '', action: '', dateRange: '7d' });
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedRequiredFieldsEntity, setSelectedRequiredFieldsEntity] = useState<EntityType>('leads');
  const [selectedExportEntity, setSelectedExportEntity] = useState<string>('accounts');
  const [recentJobs, setRecentJobs] = useState<Array<ImportJob | ExportJob>>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [loadingLoginHistory, setLoadingLoginHistory] = useState(false);

  // Integration modals & state
  const [showEmailAccountModal, setShowEmailAccountModal] = useState(false);
  const [editingEmailAccount, setEditingEmailAccount] = useState<OrgEmailAccount | null>(null);
  const [showSmsNumberModal, setShowSmsNumberModal] = useState(false);
  const [editingSmsNumber, setEditingSmsNumber] = useState<SmsNumber | null>(null);
  const [showUserIntegrationModal, setShowUserIntegrationModal] = useState(false);
  const [managingUserIntegration, setManagingUserIntegration] = useState<any>(null);

  // Email account form
  const [emailForm, setEmailForm] = useState({ email: '', display_name: '', purpose: 'billing' as OrgEmailAccount['purpose'], provider: 'google' as OrgEmailAccount['provider'], calendar_id: '' });
  // SMS number form
  const [smsForm, setSmsForm] = useState({ phone_number: '', display_name: '', purpose: 'general' as SmsNumber['purpose'], is_default: false });
  // Twilio credentials form (stored in company_integrations)
  const twilioIntegration = companyIntegrations.find(ci => ci.provider === 'twilio');
  const stripeIntegration = companyIntegrations.find(ci => ci.provider === 'stripe');
  const paypalIntegration = companyIntegrations.find(ci => ci.provider === 'paypal');
  const mapsIntegration = companyIntegrations.find(ci => ci.provider === 'google_maps');
  const currentUserIntegration = userIntegrations.find(ui => ui.user_id === currentUserId);
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Sync activeTab with initialTab when navigating via sidebar
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Load recent jobs when IMPORT_EXPORT tab is active
  useEffect(() => {
    if (activeTab === 'IMPORT_EXPORT') {
      loadRecentJobs();
    }
  }, [activeTab]);

  // Load login history when DIAGNOSTICS tab is active
  useEffect(() => {
    if (activeTab === 'DIAGNOSTICS') {
      loadLoginHistory();
    }
  }, [activeTab]);

  const loadRecentJobs = async () => {
    setLoadingJobs(true);
    try {
      const jobs = await fetchRecentJobs(10);
      setRecentJobs(jobs);
    } catch (error) {
      console.error('Error loading recent jobs:', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const loadLoginHistory = async () => {
    if (!supabase) return;

    setLoadingLoginHistory(true);
    try {
      const orgId = await getCurrentOrgId();

      // Fetch login history
      const { data: loginData, error: loginError } = await supabase
        .from('login_history')
        .select('*')
        .eq('org_id', orgId)
        .order('login_time', { ascending: false })
        .limit(50);

      if (loginError) {
        console.error('Error loading login history:', loginError);
        setLoginHistory([]);
        return;
      }

      // Fetch user details for the login records
      const userIds = [...new Set(loginData?.map(log => log.user_id).filter(Boolean) || [])];
      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, full_name, email')
          .in('id', userIds);

        if (!usersError && usersData) {
          // Map user data to login records
          const usersMap = new Map(usersData.map(u => [u.id, u]));
          const enrichedData = loginData?.map(log => ({
            ...log,
            users: log.user_id ? usersMap.get(log.user_id) : null
          }));
          setLoginHistory(enrichedData || []);
        } else {
          setLoginHistory(loginData || []);
        }
      } else {
        setLoginHistory(loginData || []);
      }
    } catch (error) {
      console.error('Error loading login history:', error);
      setLoginHistory([]);
    } finally {
      setLoadingLoginHistory(false);
    }
  };

  const handleSave = () => {
    updateSettings(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleHardReset = () => {
    if (window.confirm("HARD RESET: This will wipe all localStorage keys and re-seed the environment from scratch. All custom work will be lost. Continue?")) {
      hardReset();
    }
  };

  const handleResetDemoData = () => {
    if (window.confirm("RESET DEMO DATA: This will delete all current Leads, Deals, Accounts, and Tasks, and replace them with original demo data. Continue?")) {
      resetDemoData();
    }
  };

  const handleRestoreSettings = () => {
    if (window.confirm("RESET SETTINGS ONLY: This will reset all pipelines, statuses, and system dictionaries to defaults. Your records (Leads/Deals) will be preserved. Continue?")) {
      restoreDefaultSettings();
    }
  };

  const updateNested = (path: string, value: any) => {
    const keys = path.split('.');
    setLocalSettings(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      let current: any = next;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleListUpdate = (key: keyof CRMSettings, index: number, value: any) => {
    const list = [...(localSettings[key] as any[])];
    list[index] = value;
    setLocalSettings({ ...localSettings, [key]: list });
  };

  const handleAddToList = (key: keyof CRMSettings, defaultValue: any) => {
    const list = [...(localSettings[key] as any[])];
    list.push(defaultValue);
    setLocalSettings({ ...localSettings, [key]: list });
  };

  const handleRemoveFromList = (key: keyof CRMSettings, index: number) => {
    const list = [...(localSettings[key] as any[])];
    list.splice(index, 1);
    setLocalSettings({ ...localSettings, [key]: list });
  };

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (auditFilter.entityType && log.entityType !== auditFilter.entityType) return false;
      if (auditFilter.action && !log.action.toLowerCase().includes(auditFilter.action.toLowerCase())) return false;
      return true;
    }).slice(0, 50);
  }, [auditLogs, auditFilter]);

  // Field mappings for required fields configuration
  const entityFieldMappings: Record<string, string[]> = {
    leads: ['name', 'email', 'company', 'phone', 'status', 'source', 'estimatedValue', 'address', 'notes', 'score'],
    deals: ['name', 'amount', 'stage', 'probability', 'expectedCloseDate', 'accountId', 'contactId', 'assigneeId'],
    accounts: ['name', 'industry', 'website', 'employeeCount', 'tier', 'email', 'city', 'state', 'address'],
    contacts: ['name', 'accountId', 'email', 'phone', 'title', 'company', 'address'],
    campaigns: ['name', 'type', 'budget', 'status', 'startDate', 'endDate', 'description'],
    jobs: ['subject', 'description', 'accountId', 'jobType', 'status', 'priority', 'zone', 'scheduledDate', 'crewId'],
    tickets: ['subject', 'description', 'priority', 'assigneeId', 'status', 'requesterId', 'accountId', 'slaDeadline'],
    invoices: ['accountId', 'issueDate', 'dueDate', 'lineItems', 'status', 'dealId', 'quoteId'],
    quotes: ['dealId', 'accountId', 'lineItems', 'issueDate', 'expiryDate', 'status'],
    products: ['name', 'description', 'unitPrice', 'taxRate', 'category', 'sku'],
    services: ['name', 'description', 'unitPrice', 'taxRate', 'billingCycle', 'category'],
  };

  const tabs = [
    { id: 'GENERAL', icon: Building2, label: 'General', description: 'Identity & Branding' },
    { id: 'MODULES', icon: Layers, label: 'Modules', description: 'Feature Flags' },
    { id: 'USERS_ACCESS', icon: ShieldCheck, label: 'Users & Access', description: 'RBAC & Teams' },
    { id: 'INTEGRATIONS', icon: Plug, label: 'Integrations', description: 'External Services' },
    { id: 'AUTOMATION', icon: Zap, label: 'Automation', description: 'Workflows & Logic' },
    { id: 'BLUEPRINT', icon: Layout, label: 'Blueprint', description: 'Layouts & Fields' },
    { id: 'DOMAIN_CONFIG', icon: Settings2, label: 'Domain Config', description: 'Module Settings' },
    { id: 'IMPORT_EXPORT', icon: Database, label: 'Import / Export', description: 'Bulk Data Operations' },
    { id: 'DIAGNOSTICS', icon: Activity, label: 'Diagnostics', description: 'System Health' },
  ];

  return (
    <div className="space-y-12 max-w-[1600px] mx-auto animate-slide-up pb-40">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">SYSTEM Control Plane</p>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-1">Configuration</h1>
          <p className="text-sm text-slate-500 font-semibold mt-2">Enterprise settings, access control, and system diagnostics</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-10 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-xl transition-all ${isSaved ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white shadow-blue-500/20 active:scale-95'}`}
          >
            {isSaved ? <CheckSquare size={18} /> : <Save size={18} />}
            {isSaved ? 'Configuration Saved' : 'Commit Configuration'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar border-b border-slate-100">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as SettingTab)}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-slide-up">
        {/* =========== GENERAL TAB =========== */}
        {activeTab === 'GENERAL' && (
          <div className="space-y-8">
            {/* ====== MY ACCOUNT: Google Workspace Connection ====== */}
            <div className="p-8 rounded-[45px] bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
              <h3 className="text-xl font-black text-slate-900 mb-1">My Account</h3>
              <p className="text-xs text-slate-500 mb-6">Your personal integrations and connected services</p>
              <div className="p-6 bg-white rounded-[30px] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${currentUserIntegration?.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Globe size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-slate-900">Google Workspace</h4>
                    <p className="text-[10px] text-slate-500">Gmail & Calendar sync for your account</p>
                  </div>
                  {currentUserIntegration?.is_active ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-emerald-700">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      <span className="text-xs font-bold text-slate-400">Not Connected</span>
                    </div>
                  )}
                </div>
                {currentUserIntegration?.is_active ? (
                  <div className="flex items-center gap-4 pl-16">
                    <span className="text-xs text-slate-600">Signed in as <span className="font-bold">{currentUserIntegration.connected_email}</span></span>
                    <button onClick={() => setActiveTab('INTEGRATIONS')} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      Manage <ChevronRight size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 pl-16">
                    <button onClick={() => alert('Google OAuth flow coming in next session. This will redirect to Google sign-in.')} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2">
                      <ExternalLink size={12} /> Connect Google
                    </button>
                    <button onClick={() => setActiveTab('INTEGRATIONS')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 flex items-center gap-1">
                      View Details <ChevronRight size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Organization Profile */}
              <SettingsCard title="Organization Profile" icon={Building2}>
                <div className="space-y-6">
                  <ConfigInput label="Legal Name" value={localSettings.organization?.legalName || ''} onChange={(v: string) => updateNested('organization.legalName', v)} />
                  <ConfigInput label="Trading Name (DBA)" value={localSettings.organization?.tradingName || ''} onChange={(v: string) => updateNested('organization.tradingName', v)} />
                  <ConfigInput label="Tax ID (ABN/EIN)" value={localSettings.organization?.taxId || ''} onChange={(v: string) => updateNested('organization.taxId', v)} />
                </div>
              </SettingsCard>

              {/* Contact Information */}
              <SettingsCard title="Contact Information" icon={Mail}>
                <div className="space-y-6">
                  <ConfigInput label="Support Email" value={localSettings.organization?.supportEmail || ''} onChange={(v: string) => updateNested('organization.supportEmail', v)} />
                  <ConfigInput label="Billing Email" value={localSettings.organization?.billingEmail || ''} onChange={(v: string) => updateNested('organization.billingEmail', v)} />
                  <ConfigInput label="Emergency Phone" value={localSettings.organization?.emergencyPhone || ''} onChange={(v: string) => updateNested('organization.emergencyPhone', v)} />
                </div>
              </SettingsCard>

              {/* Localization */}
              <SettingsCard title="Localization & Regional" icon={Globe}>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Timezone</label>
                    <select
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                      value={localSettings.localization?.timezone || 'America/New_York'}
                      onChange={(e) => updateNested('localization.timezone', e.target.value)}
                    >
                      <option value="America/New_York">Eastern Time (US)</option>
                      <option value="America/Chicago">Central Time (US)</option>
                      <option value="America/Los_Angeles">Pacific Time (US)</option>
                      <option value="Europe/London">London (UK)</option>
                      <option value="Australia/Sydney">Sydney (AU)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Currency</label>
                    <select
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                      value={localSettings.localization?.currency || 'USD'}
                      onChange={(e) => {
                        const currencyCode = e.target.value;
                        const symbol = getCurrencySymbol(currencyCode);
                        updateNested('localization.currency', currencyCode);
                        updateNested('localization.currencySymbol', symbol);
                      }}
                    >
                      {getCurrencyOptions().map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Date Format</label>
                    <select
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                      value={localSettings.localization?.dateFormat || 'MM/DD/YYYY'}
                      onChange={(e) => updateNested('localization.dateFormat', e.target.value)}
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <ConfigInput label="Global Tax Rate (%)" type="number" value={localSettings.localization?.taxRate || 10} onChange={(v: string) => updateNested('localization.taxRate', parseFloat(v))} />
                </div>
              </SettingsCard>

              {/* Branding */}
              <SettingsCard title="Branding Identity" icon={Palette}>
                <div className="space-y-6">
                  <ConfigInput label="Organization Name" value={localSettings.branding?.name || ''} onChange={(v: string) => updateNested('branding.name', v)} />
                  <ConfigInput label="Brand Slogan" value={localSettings.branding?.slogan || ''} onChange={(v: string) => updateNested('branding.slogan', v)} />
                  <ColorPicker label="Primary Color" value={localSettings.branding?.primaryColor || '#3B82F6'} onChange={(v: string) => updateNested('branding.primaryColor', v)} />
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">App Theme</label>
                    <div className="flex gap-3">
                      {['light', 'dark'].map(theme => (
                        <button
                          key={theme}
                          onClick={() => updateNested('branding.theme', theme)}
                          className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            localSettings.branding?.theme === theme
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {theme === 'dark' && <Moon size={14} className="inline mr-2" />}
                          {theme === 'light' && <Sun size={14} className="inline mr-2" />}
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Sidebar Mode</label>
                    <div className="flex gap-3">
                      {['dark', 'light', 'brand'].map(mode => (
                        <button
                          key={mode}
                          onClick={() => updateNested('branding.sidebarMode', mode)}
                          className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            localSettings.branding?.sidebarMode === mode
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {mode === 'dark' && <Moon size={14} className="inline mr-2" />}
                          {mode === 'light' && <Sun size={14} className="inline mr-2" />}
                          {mode === 'brand' && <Palette size={14} className="inline mr-2" />}
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </SettingsCard>
            </div>

            {/* Domain Mapping */}
            <SettingsCard title="Custom Domain" icon={ExternalLink}>
              <div className="space-y-6">
                <ConfigInput label="Custom Domain" value={localSettings.branding?.customDomain || ''} onChange={(v: string) => updateNested('branding.customDomain', v)} placeholder="app.yourcompany.com" />
                <div className="bg-slate-50 p-6 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">DNS Configuration</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-500 w-16">Type:</span>
                      <code className="text-xs font-mono bg-white px-3 py-1 rounded-lg border border-slate-200">CNAME</code>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-500 w-16">Name:</span>
                      <code className="text-xs font-mono bg-white px-3 py-1 rounded-lg border border-slate-200">app</code>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-500 w-16">Value:</span>
                      <code className="text-xs font-mono bg-white px-3 py-1 rounded-lg border border-slate-200">cname.catchacrm.com</code>
                    </div>
                  </div>
                </div>
              </div>
            </SettingsCard>
          </div>
        )}

        {/* =========== MODULES TAB =========== */}
        {activeTab === 'MODULES' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-8 rounded-[45px] mb-8">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Feature Flags</h3>
              <p className="text-sm text-slate-600">Enable or disable core modules and sub-features</p>
            </div>

            {/* Core Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <SettingsCard title="Core Modules" icon={Layers}>
                <div className="space-y-4">
                  <ToggleSwitch label="Sales Engine" description="Leads, Deals, Quotes, Pipeline" value={localSettings.modules?.salesEngine ?? true} onChange={(v: boolean) => updateNested('modules.salesEngine', v)} />
                  <ToggleSwitch label="Financials" description="Invoices, Payments, Bank Feeds" value={localSettings.modules?.financials ?? true} onChange={(v: boolean) => updateNested('modules.financials', v)} />
                  <ToggleSwitch label="Field & Logistics" description="Jobs, Crews, Dispatch, Inventory" value={localSettings.modules?.fieldLogistics ?? true} onChange={(v: boolean) => updateNested('modules.fieldLogistics', v)} />
                  <ToggleSwitch label="Marketing" description="Campaigns, Reviews, Referrals" value={localSettings.modules?.marketing ?? true} onChange={(v: boolean) => updateNested('modules.marketing', v)} />
                </div>
              </SettingsCard>

              <SettingsCard title="Sub-Modules" icon={Settings2}>
                <div className="space-y-4">
                  <ToggleSwitch label="Bank Feeds" description="Transaction matching & reconciliation" value={localSettings.modules?.bankFeeds ?? true} onChange={(v: boolean) => updateNested('modules.bankFeeds', v)} disabled={!localSettings.modules?.financials} />
                  <ToggleSwitch label="Inventory" description="Stock tracking & warehouse management" value={localSettings.modules?.inventory ?? true} onChange={(v: boolean) => updateNested('modules.inventory', v)} disabled={!localSettings.modules?.fieldLogistics} />
                  <ToggleSwitch label="Dispatch Board" description="Visual job scheduling & crew assignment" value={localSettings.modules?.dispatch ?? true} onChange={(v: boolean) => updateNested('modules.dispatch', v)} disabled={!localSettings.modules?.fieldLogistics} />
                  <ToggleSwitch label="Reputation" description="Review monitoring & response" value={localSettings.modules?.reputation ?? true} onChange={(v: boolean) => updateNested('modules.reputation', v)} disabled={!localSettings.modules?.marketing} />
                  <ToggleSwitch label="Referrals" description="Referral rewards program" value={localSettings.modules?.referrals ?? true} onChange={(v: boolean) => updateNested('modules.referrals', v)} disabled={!localSettings.modules?.marketing} />
                  <ToggleSwitch label="Inbound Forms" description="Lead capture forms" value={localSettings.modules?.inboundForms ?? true} onChange={(v: boolean) => updateNested('modules.inboundForms', v)} disabled={!localSettings.modules?.marketing} />
                  <ToggleSwitch label="Chat Widgets" description="Website chat integration" value={localSettings.modules?.chatWidgets ?? true} onChange={(v: boolean) => updateNested('modules.chatWidgets', v)} />
                  <ToggleSwitch label="Subscriptions" description="Recurring billing management" value={localSettings.modules?.subscriptions ?? true} onChange={(v: boolean) => updateNested('modules.subscriptions', v)} disabled={!localSettings.modules?.financials} />
                  <ToggleSwitch label="Purchase Orders" description="Vendor ordering & procurement" value={localSettings.modules?.purchaseOrders ?? true} onChange={(v: boolean) => updateNested('modules.purchaseOrders', v)} disabled={!localSettings.modules?.fieldLogistics} />
                </div>
              </SettingsCard>
            </div>

            {/* Data Dictionaries (kept from original) */}
            <h3 className="text-xl font-black text-slate-900 tracking-tight pt-8 border-t border-slate-100">Data Dictionaries</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <SettingsCard title="Lead Sources" icon={Target}>
                <EditableList
                  items={localSettings.leadSources}
                  onUpdate={(i: number, v: string) => handleListUpdate('leadSources', i, v)}
                  onAdd={() => handleAddToList('leadSources', 'New Source')}
                  onRemove={(i: number) => handleRemoveFromList('leadSources', i)}
                />
              </SettingsCard>
              <SettingsCard title="Industries" icon={Building2}>
                <EditableList
                  items={localSettings.industries}
                  onUpdate={(i: number, v: string) => handleListUpdate('industries', i, v)}
                  onAdd={() => handleAddToList('industries', 'New Industry')}
                  onRemove={(i: number) => handleRemoveFromList('industries', i)}
                />
              </SettingsCard>
              <SettingsCard title="Account Types" icon={Building}>
                <EditableList
                  items={localSettings.accountTypes || ['Customer', 'Partner', 'Vendor', 'Prospect']}
                  onUpdate={(i: number, v: string) => handleListUpdate('accountTypes', i, v)}
                  onAdd={() => handleAddToList('accountTypes', 'New Type')}
                  onRemove={(i: number) => handleRemoveFromList('accountTypes', i)}
                />
              </SettingsCard>
              <SettingsCard title="Ticket Categories" icon={TicketIcon}>
                <EditableList
                  items={localSettings.ticketCategories || ['Technical', 'Billing', 'Feature Request', 'Bug Report']}
                  onUpdate={(i: number, v: string) => handleListUpdate('ticketCategories', i, v)}
                  onAdd={() => handleAddToList('ticketCategories', 'New Category')}
                  onRemove={(i: number) => handleRemoveFromList('ticketCategories', i)}
                />
              </SettingsCard>
            </div>

            {/* Field Management */}
            <h3 className="text-xl font-black text-slate-900 tracking-tight pt-8 border-t border-slate-100">Field Visibility Management</h3>
            <p className="text-sm text-slate-600 mb-6">Control which fields are visible in forms across all modules</p>

            <div className="bg-white rounded-[40px] border-2 border-blue-200 p-8 shadow-xl">
              <div className="mb-6">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Select Module</label>
                <select
                  value={selectedRequiredFieldsEntity}
                  onChange={(e) => setSelectedRequiredFieldsEntity(e.target.value as EntityType)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="leads">Leads</option>
                  <option value="deals">Deals</option>
                  <option value="accounts">Accounts</option>
                  <option value="contacts">Contacts</option>
                  <option value="jobs">Jobs</option>
                  <option value="tickets">Tickets</option>
                  <option value="invoices">Invoices</option>
                  <option value="quotes">Quotes</option>
                  <option value="products">Products</option>
                  <option value="services">Services</option>
                </select>
              </div>

              <div className="bg-slate-50 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                  <h4 className="text-sm font-black text-slate-900">Available Fields for {selectedRequiredFieldsEntity}</h4>
                  <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <Plus size={14} /> Add Custom Field
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(entityFieldMappings[selectedRequiredFieldsEntity] || []).map(field => {
                    const isRequired = ((localSettings.requiredFields as any)?.[selectedRequiredFieldsEntity] || []).includes(field);
                    return (
                      <div key={field} className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-slate-900 capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              defaultChecked
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          {isRequired && (
                            <span className="text-[9px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-1 rounded-full">Required</span>
                          )}
                          <button
                            onClick={() => {
                              const current = (localSettings.requiredFields as any)?.[selectedRequiredFieldsEntity] || [];
                              const updated = isRequired
                                ? current.filter((f: string) => f !== field)
                                : [...current, field];
                              updateNested(`requiredFields.${selectedRequiredFieldsEntity}`, updated);
                            }}
                            className="text-[9px] font-black uppercase tracking-wider text-blue-600 hover:text-blue-700"
                          >
                            {isRequired ? 'Make Optional' : 'Make Required'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-900 mb-1">Field Management</p>
                  <p className="text-xs text-blue-700">
                    Toggle fields on/off to show or hide them in forms. Mark fields as required to enforce data entry. Changes apply across all users and are stored in the database schema.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========== USERS & ACCESS TAB =========== */}
        {activeTab === 'USERS_ACCESS' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 p-8 rounded-[45px] mb-8">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Users & Access Control</h3>
              <p className="text-sm text-slate-600">Manage user roles, permissions, and team hierarchy</p>
            </div>

            {/* User Directory */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">User Directory</h3>
              <button
                onClick={() => setShowUserModal(true)}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-500/20 active:scale-95 transition-all"
              >
                <UserPlus size={16} /> Add User
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {users.map(u => (
                <div
                  key={u.id}
                  className={`p-8 border rounded-[40px] transition-all group flex flex-col justify-between ${currentUserId === u.id ? 'bg-blue-600 border-blue-600 text-white shadow-xl' : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'}`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <img src={u.avatar} className="w-16 h-16 rounded-2xl bg-white shadow-sm" />
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${currentUserId === u.id ? 'bg-white/20 border-white/30 text-white' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>{u.role}</span>
                    </div>
                    <h3 className="text-xl font-black tracking-tight mb-1">{u.name}</h3>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${currentUserId === u.id ? 'text-blue-100' : 'text-slate-400'}`}>
                      {u.email || 'No email'}
                    </p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${currentUserId === u.id ? 'text-blue-100' : 'text-slate-400'}`}>
                      {u.role === 'admin' ? 'Total Control' : u.role === 'manager' ? 'Unit Lead' : `Reports to ${users.find(m => m.id === u.managerId)?.name || 'None'}`}
                    </p>

                    {/* Google Connection Status */}
                    {(() => {
                      const ui = userIntegrations.find(i => i.user_id === u.id && i.provider === 'google');
                      return (
                        <div className={`mt-3 flex items-center gap-2 ${currentUserId === u.id ? 'text-blue-100' : ''}`}>
                          <Globe size={12} className={ui?.is_active ? 'text-emerald-500' : currentUserId === u.id ? 'text-blue-200' : 'text-slate-300'} />
                          {ui?.is_active ? (
                            <span className={`text-[10px] font-bold ${currentUserId === u.id ? 'text-emerald-300' : 'text-emerald-600'}`}>Google Connected</span>
                          ) : (
                            <>
                              <span className={`text-[10px] font-bold ${currentUserId === u.id ? 'text-blue-200' : 'text-slate-400'}`}>Google Not Connected</span>
                              {isAdmin && currentUserId !== u.id && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); alert(`Invite email would be sent to ${u.email} to connect their Google account.`); }}
                                  className={`ml-auto text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg transition-all ${currentUserId === u.id ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                >
                                  Invite
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })()}

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingUser(u);
                          setShowUserModal(true);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all ${currentUserId === u.id ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                        title="Edit user"
                      >
                        <Settings size={12} /> Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Password reset email would be sent to ${u.email}`);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all ${currentUserId === u.id ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
                        title="Reset password"
                      >
                        <Key size={12} /> Reset PW
                      </button>
                      {currentUserId !== u.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to delete ${u.name}? This action cannot be undone.`)) {
                              const result = deleteUser(u.id);
                              if (!result.success) {
                                alert(result.error);
                              }
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-[10px] font-bold flex items-center gap-1 transition-all"
                          title="Delete user"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <div
                    onClick={() => setCurrentUserId(u.id)}
                    className={`mt-8 pt-8 border-t flex items-center justify-between cursor-pointer ${currentUserId === u.id ? 'border-white/20' : 'border-slate-50'}`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">{currentUserId === u.id ? 'ACTIVE SESSION' : 'SWITCH TO USER'}</span>
                    <ChevronRight size={18} className={currentUserId === u.id ? 'text-white' : 'text-slate-300'} />
                  </div>
                </div>
              ))}
            </div>

            {/* Roles & Permissions */}
            <h3 className="text-xl font-black text-slate-900 tracking-tight pt-8 border-t border-slate-100">Roles & Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <SettingsCard title="Role Builder" icon={ShieldCheck}>
                <div className="space-y-4">
                  {(localSettings.roles || []).map((role, idx) => (
                    <div key={role.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: role.color }} />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">{role.name}</p>
                        <p className="text-[10px] text-slate-400">{role.description}</p>
                      </div>
                      {role.isSystem ? (
                        <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-100 px-3 py-1 rounded-full">System</span>
                      ) : (
                        <button className="text-slate-300 hover:text-rose-500"><Trash2 size={14} /></button>
                      )}
                    </div>
                  ))}
                  <button className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    <Plus size={14} /> Add Custom Role
                  </button>
                </div>
              </SettingsCard>

              <SettingsCard title="Permission Matrix" icon={Lock}>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left p-3 text-[9px] font-black text-slate-400 uppercase">Module</th>
                        <th className="text-center p-3 text-[9px] font-black text-slate-400 uppercase">View</th>
                        <th className="text-center p-3 text-[9px] font-black text-slate-400 uppercase">Create</th>
                        <th className="text-center p-3 text-[9px] font-black text-slate-400 uppercase">Edit</th>
                        <th className="text-center p-3 text-[9px] font-black text-slate-400 uppercase">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['sales', 'finance', 'operations', 'field', 'marketing'].map(module => (
                        <tr key={module} className="border-b border-slate-50">
                          <td className="p-3 font-bold text-slate-900 capitalize">{module}</td>
                          <td className="p-3 text-center"><Check size={14} className="inline text-emerald-500" /></td>
                          <td className="p-3 text-center"><Check size={14} className="inline text-emerald-500" /></td>
                          <td className="p-3 text-center"><Check size={14} className="inline text-emerald-500" /></td>
                          <td className="p-3 text-center">{currentUser?.role === 'admin' ? <Check size={14} className="inline text-emerald-500" /> : <X size={14} className="inline text-slate-300" />}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-slate-400 mt-4 text-center">Viewing permissions for: <span className="font-bold text-slate-600">{currentUser?.role?.toUpperCase()}</span></p>
              </SettingsCard>
            </div>

            {/* Teams */}
            <h3 className="text-xl font-black text-slate-900 tracking-tight pt-8 border-t border-slate-100">Teams & Hierarchy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <SettingsCard title="Team Management" icon={Users2}>
                <div className="space-y-4">
                  {(localSettings.teams || []).length === 0 ? (
                    <div className="text-center py-8">
                      <Users2 size={32} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-sm font-bold text-slate-400">No teams configured</p>
                      <p className="text-[10px] text-slate-400 mt-1">Create teams to group users and assign permissions</p>
                    </div>
                  ) : (
                    (localSettings.teams || []).map(team => (
                      <div key={team.id} className="p-4 bg-slate-50 rounded-2xl">
                        <p className="text-sm font-bold text-slate-900">{team.name}</p>
                        <p className="text-[10px] text-slate-400">{team.memberIds.length} members</p>
                      </div>
                    ))
                  )}
                  <button className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    <Plus size={14} /> Create Team
                  </button>
                </div>
              </SettingsCard>

              <SettingsCard title="Organizational Structure" icon={Building2}>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <ShieldCheck size={18} className="text-blue-600" />
                      <span className="text-sm font-black text-slate-900">Admin Level</span>
                    </div>
                    <p className="text-[10px] text-slate-600 ml-7">Full system access, manages all users and settings</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-2xl ml-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield size={18} className="text-violet-600" />
                      <span className="text-sm font-black text-slate-900">Manager Level</span>
                    </div>
                    <p className="text-[10px] text-slate-600 ml-7">Team oversight, approvals, reporting access</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-100 rounded-2xl ml-12">
                    <div className="flex items-center gap-3 mb-2">
                      <UsersIcon size={18} className="text-slate-600" />
                      <span className="text-sm font-black text-slate-900">User Level</span>
                    </div>
                    <p className="text-[10px] text-slate-600 ml-7">Standard access, own data visibility</p>
                  </div>
                </div>
              </SettingsCard>
            </div>
          </div>
        )}

        {/* =========== INTEGRATIONS TAB =========== */}
        {activeTab === 'INTEGRATIONS' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-8 rounded-[45px] mb-8">
              <h3 className="text-2xl font-black text-slate-900 mb-2">External Integrations</h3>
              <p className="text-sm text-slate-600">Connect third-party services, email accounts, SMS numbers, and OAuth providers</p>
            </div>

            {/* ====== SECTION A: Google Workspace (Per-User) ====== */}
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Google Workspace (Your Account)</h3>
            <div className="p-8 rounded-[35px] border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${currentUserIntegration?.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Globe size={28} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900">Google Workspace</h4>
                  <p className="text-xs text-slate-500">Connect your Google account to sync Gmail and Calendar</p>
                </div>
              </div>
              {currentUserIntegration?.is_active ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm font-bold text-emerald-800">Connected as {currentUserIntegration.connected_email || 'Unknown'}</span>
                    {currentUserIntegration.last_synced_at && (
                      <span className="text-[10px] text-emerald-600 ml-auto">Last synced: {new Date(currentUserIntegration.last_synced_at).toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex gap-6 px-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={currentUserIntegration.sync_config?.sync_gmail !== false} onChange={(e) => {
                        upsertRecord('userIntegrations', { ...currentUserIntegration, sync_config: { ...currentUserIntegration.sync_config, sync_gmail: e.target.checked } });
                      }} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                      <span className="text-xs font-bold text-slate-700">Sync Gmail</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={currentUserIntegration.sync_config?.sync_calendar !== false} onChange={(e) => {
                        upsertRecord('userIntegrations', { ...currentUserIntegration, sync_config: { ...currentUserIntegration.sync_config, sync_calendar: e.target.checked } });
                      }} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                      <span className="text-xs font-bold text-slate-700">Sync Calendar</span>
                    </label>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => alert('Sync triggered. Real-time sync coming in next session.')} className="px-5 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2">
                      <RefreshCw size={14} /> Sync Now
                    </button>
                    <button onClick={() => { if (window.confirm('Disconnect your Google account? This will stop Gmail and Calendar sync.')) { deleteRecord('userIntegrations', currentUserIntegration.id); } }} className="px-5 py-3 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center gap-2">
                      <X size={14} /> Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                    <span className="text-sm font-bold text-slate-500">Not Connected</span>
                  </div>
                  <button onClick={() => alert('Google OAuth flow coming in next session. This will redirect to Google sign-in to authorize Gmail and Calendar access.')} className="px-6 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2">
                    <ExternalLink size={14} /> Connect Google Account
                  </button>
                  <div className="px-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Permissions Requested</p>
                    <ul className="space-y-1 text-xs text-slate-500">
                      <li className="flex items-center gap-2"><Check size={12} className="text-emerald-500" /> Read and send email (Gmail)</li>
                      <li className="flex items-center gap-2"><Check size={12} className="text-emerald-500" /> Manage calendar events</li>
                      <li className="flex items-center gap-2"><Check size={12} className="text-emerald-500" /> View your email address</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* ====== SECTION B: Organisation Email Accounts (Admin Only) ====== */}
            {isAdmin && (<>
            <h3 className="text-xl font-black text-slate-900 tracking-tight pt-8 border-t border-slate-100">Organisation Email Accounts</h3>
            <p className="text-xs text-slate-500 -mt-4 mb-2">Connect business email accounts for different functions (billing, support, info, ops, marketing)</p>
            <div className="bg-white border border-slate-200 rounded-[35px] p-8 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left p-3 text-[9px] font-black text-slate-400 uppercase">Purpose</th>
                      <th className="text-left p-3 text-[9px] font-black text-slate-400 uppercase">Email</th>
                      <th className="text-left p-3 text-[9px] font-black text-slate-400 uppercase">Display Name</th>
                      <th className="text-left p-3 text-[9px] font-black text-slate-400 uppercase">Provider</th>
                      <th className="text-center p-3 text-[9px] font-black text-slate-400 uppercase">Status</th>
                      <th className="text-right p-3 text-[9px] font-black text-slate-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(['billing', 'support', 'info', 'operations', 'marketing'] as const).map(purpose => {
                      const account = orgEmailAccounts.find(a => a.purpose === purpose);
                      return (
                        <tr key={purpose} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-900 capitalize">{purpose}</td>
                          <td className="p-3 text-slate-600">{account?.email || <span className="text-slate-300">&mdash;</span>}</td>
                          <td className="p-3 text-slate-600">{account?.display_name || <span className="text-slate-300">&mdash;</span>}</td>
                          <td className="p-3 text-slate-600 capitalize">{account?.provider || <span className="text-slate-300">&mdash;</span>}</td>
                          <td className="p-3 text-center">
                            {account?.is_active ? <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" title="Active" /> : <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-300" title="Not connected" />}
                          </td>
                          <td className="p-3 text-right">
                            {account ? (
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => { setEditingEmailAccount(account); setEmailForm({ email: account.email, display_name: account.display_name || '', purpose: account.purpose, provider: account.provider, calendar_id: account.calendar_id || '' }); setShowEmailAccountModal(true); }} className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-[10px] font-bold transition-all">Edit</button>
                                <button onClick={() => { if (window.confirm(`Remove ${account.email}?`)) deleteRecord('orgEmailAccounts', account.id); }} className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-[10px] font-bold transition-all">Remove</button>
                              </div>
                            ) : (
                              <button onClick={() => { setEditingEmailAccount(null); setEmailForm({ email: '', display_name: '', purpose, provider: 'google', calendar_id: '' }); setShowEmailAccountModal(true); }} className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-[10px] font-bold transition-all">Add</button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <button onClick={() => { setEditingEmailAccount(null); setEmailForm({ email: '', display_name: '', purpose: 'billing', provider: 'google', calendar_id: '' }); setShowEmailAccountModal(true); }} className="mt-4 w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <Plus size={14} /> Add Email Account
              </button>
            </div>

            {/* Email Account Modal */}
            {showEmailAccountModal && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowEmailAccountModal(false)}>
                <div className="bg-white rounded-[35px] p-10 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                  <h3 className="text-xl font-black text-slate-900 mb-6">{editingEmailAccount ? 'Edit Email Account' : 'Add Email Account'}</h3>
                  <div className="space-y-5">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Purpose</label>
                      <select value={emailForm.purpose} onChange={e => setEmailForm({ ...emailForm, purpose: e.target.value as any })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500">
                        <option value="billing">Billing</option>
                        <option value="support">Support</option>
                        <option value="info">Info</option>
                        <option value="operations">Operations</option>
                        <option value="marketing">Marketing</option>
                      </select>
                    </div>
                    <ConfigInput label="Email Address" value={emailForm.email} onChange={v => setEmailForm({ ...emailForm, email: v })} placeholder="billing@company.com" />
                    <ConfigInput label="Display Name" value={emailForm.display_name} onChange={v => setEmailForm({ ...emailForm, display_name: v })} placeholder="Company Billing" />
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Provider</label>
                      <div className="flex gap-3">
                        <button onClick={() => setEmailForm({ ...emailForm, provider: 'google' })} className={`flex-1 py-4 rounded-2xl text-xs font-bold transition-all ${emailForm.provider === 'google' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>Google</button>
                        <button disabled className="flex-1 py-4 rounded-2xl text-xs font-bold bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed">Microsoft (Coming Soon)</button>
                      </div>
                    </div>
                    {emailForm.purpose === 'operations' && (
                      <ConfigInput label="Calendar ID (Optional)" value={emailForm.calendar_id} onChange={v => setEmailForm({ ...emailForm, calendar_id: v })} placeholder="primary or custom calendar ID" />
                    )}
                  </div>
                  <div className="flex gap-3 mt-8">
                    <button onClick={() => {
                      if (!emailForm.email) { alert('Email address is required'); return; }
                      const data: any = { email: emailForm.email, display_name: emailForm.display_name, purpose: emailForm.purpose, provider: emailForm.provider, is_active: false, is_default: false, calendar_id: emailForm.calendar_id || undefined };
                      if (editingEmailAccount) data.id = editingEmailAccount.id;
                      upsertRecord('orgEmailAccounts', data);
                      setShowEmailAccountModal(false);
                      alert('Email account saved. Google OAuth connection coming in next session.');
                    }} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                      {editingEmailAccount ? 'Update' : 'Save & Connect Later'}
                    </button>
                    <button onClick={() => setShowEmailAccountModal(false)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {/* ====== SECTION C: SMS Numbers (Admin Only) ====== */}
            <h3 className="text-xl font-black text-slate-900 tracking-tight pt-8 border-t border-slate-100">SMS Numbers</h3>
            <p className="text-xs text-slate-500 -mt-4 mb-2">Manage phone numbers for outbound and inbound SMS</p>
            <div className="bg-white border border-slate-200 rounded-[35px] p-8 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left p-3 text-[9px] font-black text-slate-400 uppercase">Purpose</th>
                      <th className="text-left p-3 text-[9px] font-black text-slate-400 uppercase">Number</th>
                      <th className="text-left p-3 text-[9px] font-black text-slate-400 uppercase">Display Name</th>
                      <th className="text-left p-3 text-[9px] font-black text-slate-400 uppercase">Provider</th>
                      <th className="text-center p-3 text-[9px] font-black text-slate-400 uppercase">Default</th>
                      <th className="text-center p-3 text-[9px] font-black text-slate-400 uppercase">Status</th>
                      <th className="text-right p-3 text-[9px] font-black text-slate-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {smsNumbers.length === 0 ? (
                      <tr><td colSpan={7} className="p-8 text-center text-slate-400 font-bold">No SMS numbers configured. Add your first number below.</td></tr>
                    ) : smsNumbers.map(num => (
                      <tr key={num.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-900 capitalize">{num.purpose}</td>
                        <td className="p-3 text-slate-600 font-mono">{num.phone_number}</td>
                        <td className="p-3 text-slate-600">{num.display_name || <span className="text-slate-300">&mdash;</span>}</td>
                        <td className="p-3 text-slate-600 capitalize">{num.provider}</td>
                        <td className="p-3 text-center">{num.is_default ? <Check size={14} className="inline text-emerald-500" /> : <span className="text-slate-300">&mdash;</span>}</td>
                        <td className="p-3 text-center">
                          {num.is_active ? <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" title="Active" /> : <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-300" title="Inactive" />}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => { setEditingSmsNumber(num); setSmsForm({ phone_number: num.phone_number, display_name: num.display_name || '', purpose: num.purpose, is_default: num.is_default }); setShowSmsNumberModal(true); }} className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-[10px] font-bold transition-all">Edit</button>
                            <button onClick={() => { if (window.confirm(`Remove ${num.phone_number}?`)) deleteRecord('smsNumbers', num.id); }} className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-[10px] font-bold transition-all">Remove</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={() => { setEditingSmsNumber(null); setSmsForm({ phone_number: '', display_name: '', purpose: 'general', is_default: false }); setShowSmsNumberModal(true); }} className="mt-4 w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <Plus size={14} /> Add SMS Number
              </button>

              {/* Twilio Credentials */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <Info size={16} className="text-blue-500" />
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Twilio Account Credentials</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ConfigInput label="Account SID" value={twilioIntegration?.config?.account_sid || localSettings.integrations?.twilio?.accountSid || ''} onChange={v => updateNested('integrations.twilio.accountSid', v)} placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
                  <ConfigInput label="Auth Token" value={twilioIntegration?.config?.auth_token || localSettings.integrations?.twilio?.authToken || ''} onChange={v => updateNested('integrations.twilio.authToken', v)} type="password" />
                </div>
                <button onClick={() => {
                  const sid = localSettings.integrations?.twilio?.accountSid;
                  const token = localSettings.integrations?.twilio?.authToken;
                  if (!sid || !token) { alert('Please enter both Account SID and Auth Token'); return; }
                  upsertRecord('companyIntegrations', { ...(twilioIntegration || {}), provider: 'twilio', is_active: true, config: { account_sid: sid, auth_token: token } });
                  alert('Twilio credentials saved.');
                }} className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2">
                  <Save size={14} /> Save Twilio Credentials
                </button>
              </div>
            </div>

            {/* SMS Number Modal */}
            {showSmsNumberModal && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowSmsNumberModal(false)}>
                <div className="bg-white rounded-[35px] p-10 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                  <h3 className="text-xl font-black text-slate-900 mb-6">{editingSmsNumber ? 'Edit SMS Number' : 'Add SMS Number'}</h3>
                  <div className="space-y-5">
                    <ConfigInput label="Phone Number (E.164)" value={smsForm.phone_number} onChange={v => setSmsForm({ ...smsForm, phone_number: v })} placeholder="+61 400 123 456" />
                    <ConfigInput label="Display Name" value={smsForm.display_name} onChange={v => setSmsForm({ ...smsForm, display_name: v })} placeholder="General SMS Line" />
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Purpose</label>
                      <select value={smsForm.purpose} onChange={e => setSmsForm({ ...smsForm, purpose: e.target.value as any })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500">
                        <option value="general">General</option>
                        <option value="marketing">Marketing</option>
                        <option value="campaigns">Campaigns</option>
                        <option value="support">Support</option>
                        <option value="operations">Operations</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer">
                      <input type="checkbox" checked={smsForm.is_default} onChange={e => setSmsForm({ ...smsForm, is_default: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                      <span className="text-xs font-bold text-slate-700">Set as default number for this purpose</span>
                    </label>
                  </div>
                  <div className="flex gap-3 mt-8">
                    <button onClick={() => {
                      if (!smsForm.phone_number) { alert('Phone number is required'); return; }
                      const data: any = { phone_number: smsForm.phone_number, display_name: smsForm.display_name, purpose: smsForm.purpose, is_default: smsForm.is_default, provider: 'twilio', is_active: true };
                      if (editingSmsNumber) data.id = editingSmsNumber.id;
                      upsertRecord('smsNumbers', data);
                      setShowSmsNumberModal(false);
                    }} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                      {editingSmsNumber ? 'Update Number' : 'Add Number'}
                    </button>
                    <button onClick={() => setShowSmsNumberModal(false)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                  </div>
                </div>
              </div>
            )}
            </>)}

            {/* ====== SECTION D: Payments & Maps (existing cards, now also save to company_integrations) ====== */}
            <h3 className="text-xl font-black text-slate-900 tracking-tight pt-8 border-t border-slate-100">Payment Gateways</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <IntegrationCard
                name="Stripe"
                icon={<CreditCard size={24} />}
                description="Accept credit card payments"
                enabled={localSettings.integrations?.stripe?.enabled || false}
                onToggle={(v: boolean) => { updateNested('integrations.stripe.enabled', v); upsertRecord('companyIntegrations', { ...(stripeIntegration || {}), provider: 'stripe', is_active: v, config: { ...(stripeIntegration?.config || {}), enabled: v } }); }}
                fields={[
                  { label: 'Mode', value: localSettings.integrations?.stripe?.mode || 'test', onChange: (v: string) => updateNested('integrations.stripe.mode', v), type: 'select', options: [{ value: 'test', label: 'Test Mode' }, { value: 'live', label: 'Live Mode' }] },
                  { label: 'Publishable Key', value: localSettings.integrations?.stripe?.publicKey || '', onChange: (v: string) => updateNested('integrations.stripe.publicKey', v), type: 'text', placeholder: 'pk_test_... or pk_live_...' },
                  { label: 'Secret Key', value: localSettings.integrations?.stripe?.secretKey || '', onChange: (v: string) => updateNested('integrations.stripe.secretKey', v), type: 'password', placeholder: 'sk_test_... or sk_live_...' },
                  { label: 'Webhook Secret', value: localSettings.integrations?.stripe?.webhookSecret || '', onChange: (v: string) => updateNested('integrations.stripe.webhookSecret', v), type: 'password', placeholder: 'whsec_...' },
                ]}
              />
              <IntegrationCard
                name="PayPal"
                icon={<DollarSign size={24} />}
                description="PayPal payment processing"
                enabled={localSettings.integrations?.paypal?.enabled || false}
                onToggle={(v: boolean) => { updateNested('integrations.paypal.enabled', v); upsertRecord('companyIntegrations', { ...(paypalIntegration || {}), provider: 'paypal', is_active: v, config: { ...(paypalIntegration?.config || {}), enabled: v } }); }}
                fields={[
                  { label: 'Mode', value: localSettings.integrations?.paypal?.mode || 'sandbox', onChange: (v: string) => updateNested('integrations.paypal.mode', v), type: 'select', options: [{ value: 'sandbox', label: 'Sandbox' }, { value: 'live', label: 'Live' }] },
                  { label: 'Client ID', value: localSettings.integrations?.paypal?.clientId || '', onChange: (v: string) => updateNested('integrations.paypal.clientId', v), type: 'text' },
                  { label: 'Client Secret', value: localSettings.integrations?.paypal?.clientSecret || '', onChange: (v: string) => updateNested('integrations.paypal.clientSecret', v), type: 'password' },
                ]}
              />
            </div>

            {/* Communications */}
            <h3 className="text-xl font-black text-slate-900 tracking-tight pt-8 border-t border-slate-100">Communications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <IntegrationCard
                name="Twilio"
                icon={<Phone size={24} />}
                description="SMS & voice calling"
                enabled={localSettings.integrations?.twilio?.enabled || false}
                onToggle={(v: boolean) => updateNested('integrations.twilio.enabled', v)}
                fields={[
                  { label: 'Account SID', value: localSettings.integrations?.twilio?.accountSid || '', onChange: (v: string) => updateNested('integrations.twilio.accountSid', v), type: 'text', placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
                  { label: 'Auth Token', value: localSettings.integrations?.twilio?.authToken || '', onChange: (v: string) => updateNested('integrations.twilio.authToken', v), type: 'password' },
                  { label: 'Phone Number', value: localSettings.integrations?.twilio?.phoneNumber || '', onChange: (v: string) => updateNested('integrations.twilio.phoneNumber', v), type: 'text', placeholder: '+61412345678' },
                  { label: 'Caller ID Name', value: localSettings.integrations?.twilio?.callerId || '', onChange: (v: string) => updateNested('integrations.twilio.callerId', v), type: 'text', placeholder: 'Your Company Name' },
                ]}
              />
              <IntegrationCard
                name="SendGrid"
                icon={<Mail size={24} />}
                description="Transactional email delivery"
                enabled={localSettings.integrations?.sendgrid?.enabled || false}
                onToggle={(v: boolean) => updateNested('integrations.sendgrid.enabled', v)}
                fields={[
                  { label: 'API Key', value: localSettings.integrations?.sendgrid?.apiKey || '', onChange: (v: string) => updateNested('integrations.sendgrid.apiKey', v), type: 'password', placeholder: 'SG.xxxxxxxxxxxxxxxxxxxx' },
                  { label: 'Verified Domain', value: localSettings.integrations?.sendgrid?.domain || '', onChange: (v: string) => updateNested('integrations.sendgrid.domain', v), type: 'text', placeholder: 'your-domain.com' },
                  { label: 'From Email', value: localSettings.integrations?.sendgrid?.fromEmail || '', onChange: (v: string) => updateNested('integrations.sendgrid.fromEmail', v), type: 'text', placeholder: 'noreply@your-domain.com' },
                  { label: 'From Name', value: localSettings.integrations?.sendgrid?.fromName || '', onChange: (v: string) => updateNested('integrations.sendgrid.fromName', v), type: 'text', placeholder: 'Your Company Name' },
                ]}
              />
            </div>

            {/* BYO Australian Telco */}
            <h3 className="text-xl font-black text-slate-900 tracking-tight pt-8 border-t border-slate-100">BYO Australian Telco</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <IntegrationCard
                name="BYO SIP Trunk"
                icon={<Phone size={24} />}
                description="Bring your own SIP provider (Telstra, Optus, Aatrox, etc.)"
                enabled={localSettings.integrations?.byoSip?.enabled || false}
                onToggle={(v: boolean) => updateNested('integrations.byoSip.enabled', v)}
                fields={[
                  { label: 'Provider Name', value: localSettings.integrations?.byoSip?.provider || '', onChange: (v: string) => updateNested('integrations.byoSip.provider', v), type: 'text', placeholder: 'e.g., Aatrox, Telcoinabox' },
                  { label: 'SIP Server', value: localSettings.integrations?.byoSip?.sipServer || '', onChange: (v: string) => updateNested('integrations.byoSip.sipServer', v), type: 'text', placeholder: 'sip.provider.com.au' },
                  { label: 'Username', value: localSettings.integrations?.byoSip?.username || '', onChange: (v: string) => updateNested('integrations.byoSip.username', v), type: 'text' },
                  { label: 'Password', value: localSettings.integrations?.byoSip?.password || '', onChange: (v: string) => updateNested('integrations.byoSip.password', v), type: 'password' },
                  { label: 'Caller ID Number', value: localSettings.integrations?.byoSip?.callerIdNumber || '', onChange: (v: string) => updateNested('integrations.byoSip.callerIdNumber', v), type: 'text', placeholder: '+61412345678' },
                ]}
              />
              <IntegrationCard
                name="BYO SMS API"
                icon={<MessageSquare size={24} />}
                description="Bring your own SMS provider (MessageMedia, ClickSend, SMS Global, etc.)"
                enabled={localSettings.integrations?.byoSms?.enabled || false}
                onToggle={(v: boolean) => updateNested('integrations.byoSms.enabled', v)}
                fields={[
                  { label: 'Provider Name', value: localSettings.integrations?.byoSms?.provider || '', onChange: (v: string) => updateNested('integrations.byoSms.provider', v), type: 'text', placeholder: 'e.g., MessageMedia, ClickSend' },
                  { label: 'API Endpoint', value: localSettings.integrations?.byoSms?.apiEndpoint || '', onChange: (v: string) => updateNested('integrations.byoSms.apiEndpoint', v), type: 'text', placeholder: 'https://api.provider.com.au/sms/v1' },
                  { label: 'API Key', value: localSettings.integrations?.byoSms?.apiKey || '', onChange: (v: string) => updateNested('integrations.byoSms.apiKey', v), type: 'password' },
                  { label: 'From Number (E.164)', value: localSettings.integrations?.byoSms?.fromNumber || '', onChange: (v: string) => updateNested('integrations.byoSms.fromNumber', v), type: 'text', placeholder: '+61412345678' },
                ]}
              />
            </div>

            {/* External Services */}
            <h3 className="text-xl font-black text-slate-900 tracking-tight pt-8 border-t border-slate-100">External Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <IntegrationCard
                name="Google Maps"
                icon={<MapPin size={24} />}
                description="Maps & geocoding"
                enabled={localSettings.integrations?.googleMaps?.enabled || false}
                onToggle={(v: boolean) => { updateNested('integrations.googleMaps.enabled', v); upsertRecord('companyIntegrations', { ...(mapsIntegration || {}), provider: 'google_maps', is_active: v, config: { ...(mapsIntegration?.config || {}), enabled: v } }); }}
                fields={[
                  { label: 'API Key', value: localSettings.integrations?.googleMaps?.apiKey || '', onChange: (v: string) => updateNested('integrations.googleMaps.apiKey', v), type: 'password', placeholder: 'Enable Geocoding, Places, and Maps JavaScript API' },
                  { label: 'Default Region', value: localSettings.integrations?.googleMaps?.defaultRegion || 'AU', onChange: (v: string) => updateNested('integrations.googleMaps.defaultRegion', v), type: 'text', placeholder: 'AU' },
                ]}
              />
              <IntegrationCard
                name="OpenAI"
                icon={<Sparkles size={24} />}
                description="AI-powered features"
                enabled={localSettings.integrations?.openai?.enabled || false}
                onToggle={(v: boolean) => updateNested('integrations.openai.enabled', v)}
                fields={[
                  { label: 'API Key', value: localSettings.integrations?.openai?.apiKey || '', onChange: (v: string) => updateNested('integrations.openai.apiKey', v), type: 'password', placeholder: 'sk-...' },
                  { label: 'Default Model', value: localSettings.integrations?.openai?.defaultModel || 'gpt-4-turbo', onChange: (v: string) => updateNested('integrations.openai.defaultModel', v), type: 'select', options: [{ value: 'gpt-4-turbo', label: 'GPT-4 Turbo' }, { value: 'gpt-4', label: 'GPT-4' }, { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }] },
                ]}
              />
              <IntegrationCard
                name="Xero"
                icon={<Receipt size={24} />}
                description="Accounting sync (OAuth 2.0)"
                enabled={localSettings.integrations?.xero?.enabled || false}
                onToggle={(v: boolean) => updateNested('integrations.xero.enabled', v)}
                fields={[
                  { label: 'Sync Frequency', value: localSettings.integrations?.xero?.syncFrequency || 'daily', onChange: (v: string) => updateNested('integrations.xero.syncFrequency', v), type: 'select', options: [{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }, { value: 'manual', label: 'Manual' }] },
                  { label: 'Client ID (OAuth)', value: localSettings.integrations?.xero?.clientId || '', onChange: (v: string) => updateNested('integrations.xero.clientId', v), type: 'text', placeholder: 'Get from Xero Developer Portal' },
                ]}
              />
            </div>

            {/* Calendar Sync */}
            <h3 className="text-xl font-black text-slate-900 tracking-tight pt-8 border-t border-slate-100">Calendar Sync</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <IntegrationCard
                name="Google Calendar"
                icon={<Calendar size={24} />}
                description="Two-way calendar sync (OAuth 2.0)"
                enabled={localSettings.integrations?.googleCalendar?.enabled || false}
                onToggle={(v: boolean) => updateNested('integrations.googleCalendar.enabled', v)}
                fields={[
                  { label: 'Enable Sync', value: localSettings.integrations?.googleCalendar?.syncEnabled || false, onChange: (v: string) => updateNested('integrations.googleCalendar.syncEnabled', v), type: 'checkbox' },
                  { label: 'Client ID (OAuth)', value: localSettings.integrations?.googleCalendar?.clientId || '', onChange: (v: string) => updateNested('integrations.googleCalendar.clientId', v), type: 'text', placeholder: 'Get from Google Cloud Console' },
                ]}
              />
              <IntegrationCard
                name="Outlook"
                icon={<Mail size={24} />}
                description="Microsoft calendar sync (Azure AD OAuth)"
                enabled={localSettings.integrations?.outlook?.enabled || false}
                onToggle={(v: boolean) => updateNested('integrations.outlook.enabled', v)}
                fields={[
                  { label: 'Enable Sync', value: localSettings.integrations?.outlook?.syncEnabled || false, onChange: (v: string) => updateNested('integrations.outlook.syncEnabled', v), type: 'checkbox' },
                  { label: 'Client ID (Azure AD)', value: localSettings.integrations?.outlook?.clientId || '', onChange: (v: string) => updateNested('integrations.outlook.clientId', v), type: 'text', placeholder: 'Get from Azure Portal' },
                ]}
              />
            </div>
          </div>
        )}

        {/* =========== AUTOMATION TAB =========== */}
        {activeTab === 'AUTOMATION' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 p-8 rounded-[45px] mb-8">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Automation & Workflows</h3>
              <p className="text-sm text-slate-600">Configure automated workflows and webhook integrations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Link to="/workflows" className="block group">
                <SettingsCard title="Automation Workflows" icon={Activity}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-3xl font-black text-slate-900">5</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Active Workflows</p>
                    </div>
                    <ChevronRight size={24} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="pt-6 border-t border-slate-100">
                    <p className="text-xs text-slate-600">Click to manage workflow automations</p>
                  </div>
                </SettingsCard>
              </Link>

              <Link to="/webhooks" className="block group">
                <SettingsCard title="Webhooks" icon={Webhook}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-3xl font-black text-slate-900">3</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Active Webhooks</p>
                    </div>
                    <ChevronRight size={24} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="pt-6 border-t border-slate-100">
                    <p className="text-xs text-slate-600">Click to manage webhook endpoints</p>
                  </div>
                </SettingsCard>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <SettingsCard title="Automation Settings" icon={Settings2}>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Execution Mode</label>
                    <select
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                      value={localSettings.automation?.executionMode || 'synchronous'}
                      onChange={(e) => updateNested('automation.executionMode', e.target.value)}
                    >
                      <option value="synchronous">Synchronous</option>
                      <option value="asynchronous">Asynchronous</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Retry Policy</label>
                    <select
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                      value={localSettings.automation?.retryPolicy || 3}
                      onChange={(e) => updateNested('automation.retryPolicy', parseInt(e.target.value))}
                    >
                      <option value={0}>No Retry</option>
                      <option value={3}>Retry 3 times</option>
                      <option value={5}>Retry 5 times</option>
                      <option value={10}>Retry 10 times</option>
                    </select>
                  </div>
                  <ToggleSwitch label="Workflow Logging" description="Record all workflow executions" value={localSettings.automation?.loggingEnabled ?? true} onChange={(v: boolean) => updateNested('automation.loggingEnabled', v)} />
                  <ToggleSwitch label="Error Notifications" description="Send alerts on workflow failures" value={localSettings.automation?.errorNotifications ?? true} onChange={(v: boolean) => updateNested('automation.errorNotifications', v)} />
                </div>
              </SettingsCard>

              <SettingsCard title="Email Automation" icon={Mail}>
                <div className="space-y-6">
                  <ConfigInput label="From Email Address" value={localSettings.automation?.emailFrom || ''} onChange={(v: string) => updateNested('automation.emailFrom', v)} />
                  <ConfigInput label="From Name" value={localSettings.automation?.emailFromName || ''} onChange={(v: string) => updateNested('automation.emailFromName', v)} />
                  <ToggleSwitch label="Track Email Opens" description="Monitor email engagement" value={localSettings.automation?.trackOpens ?? true} onChange={(v: boolean) => updateNested('automation.trackOpens', v)} />
                </div>
              </SettingsCard>
            </div>
          </div>
        )}

        {/* =========== BLUEPRINT TAB =========== */}
        {activeTab === 'BLUEPRINT' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-8 rounded-[45px] mb-8">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Industry Blueprints</h3>
              <p className="text-sm text-slate-600">Select your industry to show relevant fields, or create custom blueprints</p>
            </div>

            {/* Industry Blueprint Selector */}
            <div className="bg-white rounded-[40px] border-2 border-indigo-200 p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Sparkles className="text-indigo-600" />
                    Choose Your Industry
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Select a blueprint to show industry-specific fields and entities</p>
                </div>
                <button className="px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-bold text-sm hover:shadow-xl hover:shadow-violet-500/30 transition-all flex items-center gap-2">
                  <Plus size={16} /> Create Custom Blueprint
                </button>
              </div>

              {/* Industry Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { id: 'general', name: 'General Business', icon: '🏢', description: 'Standard CRM' },
                  { id: 'real_estate', name: 'Real Estate', icon: '🏠', description: 'Properties, Showings' },
                  { id: 'solar', name: 'Solar & Renewables', icon: '☀️', description: 'Site Surveys, Installs' },
                  { id: 'construction', name: 'Construction', icon: '🏗️', description: 'Projects, Change Orders' },
                  { id: 'finance', name: 'Financial Services', icon: '💰', description: 'Loan Applications' },
                  { id: 'healthcare', name: 'Healthcare', icon: '🏥', description: 'Patients, Appointments' },
                  { id: 'legal', name: 'Legal Services', icon: '⚖️', description: 'Cases, Billable Hours' },
                  { id: 'automotive', name: 'Automotive', icon: '🚗', description: 'Vehicles, Test Drives' },
                  { id: 'hospitality', name: 'Hospitality', icon: '🏨', description: 'Rooms, Reservations' },
                  { id: 'manufacturing', name: 'Manufacturing', icon: '🏭', description: 'Production, QC' }
                ].map(industry => (
                  <button
                    key={industry.id}
                    onClick={async () => {
                      updateNested('organization.industry', industry.id);
                      updateNested('activeIndustry', industry.id);
                      // Activate blueprint - stores custom entities in Supabase
                      const success = await activateBlueprint(industry.id);
                      if (success) {
                        console.log(`✅ Activated ${industry.name} blueprint`);
                      } else {
                        console.error(`❌ Failed to activate ${industry.name} blueprint`);
                      }
                    }}
                    className={`p-6 rounded-3xl border-2 transition-all text-left hover:scale-105 ${
                      localSettings.activeIndustry === industry.id
                        ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg shadow-indigo-500/20'
                        : 'border-slate-200 bg-white hover:border-indigo-300'
                    }`}
                  >
                    <div className="text-4xl mb-3">{industry.icon}</div>
                    <h4 className="text-sm font-black text-slate-900 mb-1">{industry.name}</h4>
                    <p className="text-[10px] text-slate-500 leading-tight">{industry.description}</p>
                    {localSettings.activeIndustry === industry.id && (
                      <div className="mt-3 flex items-center gap-1 text-indigo-600">
                        <Check size={14} />
                        <span className="text-[10px] font-black uppercase tracking-wider">Active</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Info */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-900 mb-1">How Blueprints Work</p>
                  <p className="text-xs text-blue-700">
                    Blueprints control which fields appear in forms, which custom entities are available, and what sales pipelines are used. All relevant fields are already in the database - blueprints just show/hide what's needed for your industry.
                  </p>
                </div>
              </div>
            </div>

            {/* Layout Configuration */}
            <SettingsCard title="Module Layouts" icon={Layout}>
              <div className="space-y-6">
                <p className="text-sm text-slate-600">
                  Configure how data is displayed in each module. Control field visibility, ordering, and layout sections.
                </p>

                {/* Module Selector */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Select Module</label>
                  <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500">
                    <option value="leads">Leads</option>
                    <option value="deals">Deals</option>
                    <option value="accounts">Accounts</option>
                    <option value="contacts">Contacts</option>
                    <option value="campaigns">Campaigns</option>
                    <option value="jobs">Jobs</option>
                    <option value="tickets">Support Tickets</option>
                    <option value="invoices">Invoices</option>
                    <option value="quotes">Quotes</option>
                  </select>
                </div>

                {/* Example Layout Sections */}
                <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <h4 className="text-sm font-black text-slate-900">Detail View Sections</h4>
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      <Plus size={14} /> Add Section
                    </button>
                  </div>

                  {/* Example Sections */}
                  <div className="space-y-2">
                    {['Overview', 'Contact Information', 'Sales Details', 'Activity Timeline', 'Related Records'].map((section, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="cursor-move text-slate-400 hover:text-slate-600">
                            <Sliders size={14} />
                          </div>
                          <span className="text-sm font-bold text-slate-900">{section}</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600">
                            <Settings size={14} />
                          </button>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                  <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-blue-900 mb-1">Blueprint Customization</p>
                    <p className="text-xs text-blue-700">
                      Layout changes are applied per module and affect all users. Field visibility can be controlled through field-level permissions in the Users & Access tab.
                    </p>
                  </div>
                </div>
              </div>
            </SettingsCard>

            {/* Required Fields Configuration */}
            <SettingsCard title="Required Fields" icon={CheckSquare}>
              <div className="space-y-6">
                <p className="text-sm text-slate-600">
                  Configure which fields are mandatory when creating or editing records. Required fields enforce data quality and completeness.
                </p>

                {/* Entity Type Selector */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Select Entity Type</label>
                  <select
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                    value={selectedRequiredFieldsEntity}
                    onChange={(e) => setSelectedRequiredFieldsEntity(e.target.value as EntityType)}
                  >
                    <option value="leads">Leads</option>
                    <option value="deals">Deals</option>
                    <option value="accounts">Accounts</option>
                    <option value="contacts">Contacts</option>
                    <option value="campaigns">Campaigns</option>
                    <option value="jobs">Jobs</option>
                    <option value="tickets">Support Tickets</option>
                    <option value="invoices">Invoices</option>
                    <option value="quotes">Quotes</option>
                    <option value="products">Products</option>
                    <option value="services">Services</option>
                  </select>
                </div>

                {/* Required Fields List - Dynamic */}
                <div className="bg-slate-50 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <h4 className="text-sm font-black text-slate-900 capitalize">
                      Required Fields for {selectedRequiredFieldsEntity}
                    </h4>
                    <span className="text-xs font-bold text-slate-500">
                      {((localSettings.requiredFields as any)?.[selectedRequiredFieldsEntity] || []).length} required
                    </span>
                  </div>

                  {/* Available Fields Checkboxes */}
                  <div className="grid grid-cols-2 gap-3">
                    {(entityFieldMappings[selectedRequiredFieldsEntity] || []).map(field => (
                      <label key={field} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all cursor-pointer">
                        <input
                          type="checkbox"
                          checked={((localSettings.requiredFields as any)?.[selectedRequiredFieldsEntity] || []).includes(field)}
                          onChange={(e) => {
                            const current = (localSettings.requiredFields as any)?.[selectedRequiredFieldsEntity] || [];
                            const updated = e.target.checked
                              ? [...current, field]
                              : current.filter((f: string) => f !== field);
                            updateNested(`requiredFields.${selectedRequiredFieldsEntity}`, updated);
                          }}
                          className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm font-bold text-slate-900 capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-900 mb-1">Validation Enforcement</p>
                    <p className="text-xs text-amber-700">
                      Required fields are validated when creating or editing records via forms. API integrations and bulk imports must also comply with these requirements.
                    </p>
                  </div>
                </div>
              </div>
            </SettingsCard>

            {/* Custom Fields */}
            <SettingsCard title="Custom Fields" icon={PlusCircle}>
              <div className="space-y-6">
                <p className="text-sm text-slate-600">
                  Add custom fields to extend your data model. Custom fields are available across all modules.
                </p>

                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                    <PlusCircle size={16} /> Add Custom Field
                  </button>
                </div>

                {/* Example Custom Fields List */}
                <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Existing Custom Fields</p>
                  <div className="space-y-2">
                    {[
                      { name: 'Industry Type', type: 'Dropdown', modules: ['Accounts', 'Leads'] },
                      { name: 'Customer Since', type: 'Date', modules: ['Accounts'] },
                      { name: 'Lead Temperature', type: 'Text', modules: ['Leads'] }
                    ].map((field, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{field.name}</p>
                          <p className="text-xs text-slate-400">{field.type} • Used in: {field.modules.join(', ')}</p>
                        </div>
                        <button className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SettingsCard>

            {/* Field Visibility */}
            <SettingsCard title="Field Visibility Rules" icon={Eye}>
              <div className="space-y-6">
                <p className="text-sm text-slate-600">
                  Control which fields are visible to different user roles. Fine-tune data access without modifying role permissions.
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-900 mb-1">Coming Soon</p>
                    <p className="text-xs text-amber-700">
                      Granular field-level permissions are in development. Use role-based permissions in Users & Access for now.
                    </p>
                  </div>
                </div>
              </div>
            </SettingsCard>
          </div>
        )}

        {/* =========== DOMAIN CONFIG TAB =========== */}
        {activeTab === 'DOMAIN_CONFIG' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-8 rounded-[45px] mb-8">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Domain Configuration</h3>
              <p className="text-sm text-slate-600">Module-specific settings for Sales, Finance, Field, and Marketing</p>
            </div>

            {/* Sub-Tab Navigation */}
            <div className="flex gap-2 border-b border-slate-100 pb-4">
              {[
                { id: 'SALES', icon: BarChart, label: 'Sales' },
                { id: 'FINANCIAL', icon: DollarSign, label: 'Financial' },
                { id: 'FIELD', icon: Truck, label: 'Field Ops' },
                { id: 'MARKETING', icon: Star, label: 'Marketing' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDomainSubTab(tab.id as DomainSubTab)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    domainSubTab === tab.id ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* SALES Sub-Tab */}
            {domainSubTab === 'SALES' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SettingsCard title="Deal Stages" icon={BarChart}>
                  <div className="space-y-3">
                    {localSettings.dealStages.map((stage, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <input
                          className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                          value={stage.label}
                          onChange={(e) => {
                            const newStages = [...localSettings.dealStages];
                            newStages[i] = { ...stage, label: e.target.value };
                            setLocalSettings({ ...localSettings, dealStages: newStages });
                          }}
                        />
                        <input
                          type="number"
                          className="w-20 bg-slate-50 border border-slate-100 rounded-2xl px-3 py-3 text-xs font-bold text-slate-900 text-center focus:outline-none focus:border-blue-500"
                          value={Math.round(stage.probability * 100)}
                          onChange={(e) => {
                            const newStages = [...localSettings.dealStages];
                            newStages[i] = { ...stage, probability: parseInt(e.target.value) / 100 };
                            setLocalSettings({ ...localSettings, dealStages: newStages });
                          }}
                        />
                        <span className="text-[10px] font-bold text-slate-400">%</span>
                      </div>
                    ))}
                  </div>
                </SettingsCard>

                <SettingsCard title="Lead Scoring Rules" icon={Target}>
                  <div className="space-y-3">
                    {(localSettings.leadScoring || []).map((rule, i) => (
                      <div key={rule.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-900">{rule.description}</p>
                          <p className="text-[10px] text-slate-400">Trigger: {rule.trigger}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black ${rule.points > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                          {rule.points > 0 ? '+' : ''}{rule.points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </SettingsCard>

                <SettingsCard title="Quote Settings" icon={FileText}>
                  <div className="space-y-6">
                    <ConfigInput label="Quote Validity (Days)" type="number" value={localSettings.quoteValidityDays || 30} onChange={(v: string) => updateNested('quoteValidityDays', parseInt(v))} />
                    <ConfigInput label="Payment Terms" value={localSettings.paymentTerms || 'Net 30'} onChange={(v: string) => updateNested('paymentTerms', v)} />
                  </div>
                </SettingsCard>

                <SettingsCard title="Lost Reasons" icon={X}>
                  <EditableList
                    items={localSettings.lostReasons || []}
                    onUpdate={(i: number, v: string) => {
                      const newReasons = [...(localSettings.lostReasons || [])];
                      newReasons[i] = v;
                      setLocalSettings({ ...localSettings, lostReasons: newReasons });
                    }}
                    onAdd={() => setLocalSettings({ ...localSettings, lostReasons: [...(localSettings.lostReasons || []), 'New Reason'] })}
                    onRemove={(i: number) => {
                      const newReasons = [...(localSettings.lostReasons || [])];
                      newReasons.splice(i, 1);
                      setLocalSettings({ ...localSettings, lostReasons: newReasons });
                    }}
                  />
                </SettingsCard>
              </div>
            )}

            {/* FINANCIAL Sub-Tab */}
            {domainSubTab === 'FINANCIAL' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SettingsCard title="Tax Rates" icon={Receipt}>
                  <div className="space-y-3">
                    {(localSettings.taxEngine || []).map((tax, i) => (
                      <div key={tax.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900">{tax.name}</p>
                          <p className="text-[10px] text-slate-400">{tax.region || 'All regions'}</p>
                        </div>
                        <span className="text-sm font-black text-slate-600">{tax.rate}%</span>
                        {tax.isDefault && <span className="px-2 py-1 bg-blue-100 text-blue-600 text-[9px] font-black uppercase rounded-full">Default</span>}
                      </div>
                    ))}
                    <button className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50 transition-all">+ Add Tax Rate</button>
                  </div>
                </SettingsCard>

                <SettingsCard title="Document Numbering" icon={Hash}>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <ConfigInput label="Invoice Prefix" value={localSettings.numberingSeries?.invoicePrefix || 'INV-'} onChange={(v: string) => updateNested('numberingSeries.invoicePrefix', v)} />
                      <ConfigInput label="Next Number" type="number" value={localSettings.numberingSeries?.invoiceNextNumber || 1001} onChange={(v: string) => updateNested('numberingSeries.invoiceNextNumber', parseInt(v))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <ConfigInput label="Quote Prefix" value={localSettings.numberingSeries?.quotePrefix || 'QT-'} onChange={(v: string) => updateNested('numberingSeries.quotePrefix', v)} />
                      <ConfigInput label="Next Number" type="number" value={localSettings.numberingSeries?.quoteNextNumber || 1001} onChange={(v: string) => updateNested('numberingSeries.quoteNextNumber', parseInt(v))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <ConfigInput label="PO Prefix" value={localSettings.numberingSeries?.poPrefix || 'PO-'} onChange={(v: string) => updateNested('numberingSeries.poPrefix', v)} />
                      <ConfigInput label="Next Number" type="number" value={localSettings.numberingSeries?.poNextNumber || 1001} onChange={(v: string) => updateNested('numberingSeries.poNextNumber', parseInt(v))} />
                    </div>
                  </div>
                </SettingsCard>

                <SettingsCard title="Ledger Mapping" icon={Database}>
                  <div className="space-y-3">
                    {(localSettings.ledgerMapping || []).map((mapping, i) => (
                      <div key={mapping.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <code className="px-3 py-1 bg-white rounded-lg text-xs font-mono border border-slate-200">{mapping.glCode}</code>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-900">{mapping.description}</p>
                          <p className="text-[10px] text-slate-400">Event: {mapping.eventType}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </SettingsCard>
              </div>
            )}

            {/* FIELD Sub-Tab */}
            {domainSubTab === 'FIELD' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SettingsCard title="Scheduling Settings" icon={Calendar}>
                  <div className="space-y-6">
                    <ConfigInput label="Booking Buffer (Minutes)" type="number" value={localSettings.scheduling?.bookingBuffer || 15} onChange={(v: string) => updateNested('scheduling.bookingBuffer', parseInt(v))} />
                    <div className="grid grid-cols-2 gap-4">
                      <ConfigInput label="Work Hours Start" value={localSettings.scheduling?.workingHoursStart || '08:00'} onChange={(v: string) => updateNested('scheduling.workingHoursStart', v)} />
                      <ConfigInput label="Work Hours End" value={localSettings.scheduling?.workingHoursEnd || '17:00'} onChange={(v: string) => updateNested('scheduling.workingHoursEnd', v)} />
                    </div>
                    <ConfigInput label="Max Jobs/Crew/Day" type="number" value={localSettings.scheduling?.maxJobsPerCrewPerDay || 8} onChange={(v: string) => updateNested('scheduling.maxJobsPerCrewPerDay', parseInt(v))} />
                    <ConfigInput label="Service Radius (Miles)" type="number" value={localSettings.scheduling?.defaultServiceRadius || 50} onChange={(v: string) => updateNested('scheduling.defaultServiceRadius', parseInt(v))} />
                  </div>
                </SettingsCard>

                <SettingsCard title="Inventory Rules" icon={Package}>
                  <div className="space-y-6">
                    <ConfigInput label="Low Stock Threshold" type="number" value={localSettings.inventoryRules?.lowStockThreshold || 20} onChange={(v: string) => updateNested('inventoryRules.lowStockThreshold', parseInt(v))} />
                    <ConfigInput label="Critical Stock Threshold" type="number" value={localSettings.inventoryRules?.criticalStockThreshold || 10} onChange={(v: string) => updateNested('inventoryRules.criticalStockThreshold', parseInt(v))} />
                    <ToggleSwitch label="Auto-Reorder" description="Automatically create POs at critical level" value={localSettings.inventoryRules?.autoReorderEnabled || false} onChange={(v: boolean) => updateNested('inventoryRules.autoReorderEnabled', v)} />
                  </div>
                </SettingsCard>

                <SettingsCard title="Warehouses" icon={Building}>
                  <div className="space-y-3">
                    {(localSettings.inventoryRules?.warehouses || []).map((wh, i) => (
                      <div key={wh.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                        <Building size={18} className="text-slate-400" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900">{wh.name}</p>
                          <p className="text-[10px] text-slate-400">{wh.address || 'No address'}</p>
                        </div>
                        {wh.isDefault && <span className="px-2 py-1 bg-blue-100 text-blue-600 text-[9px] font-black uppercase rounded-full">Primary</span>}
                      </div>
                    ))}
                    <button className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50 transition-all">+ Add Warehouse</button>
                  </div>
                </SettingsCard>
              </div>
            )}

            {/* MARKETING Sub-Tab */}
            {domainSubTab === 'MARKETING' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SettingsCard title="Review Platforms" icon={Star}>
                  <div className="space-y-3">
                    {(localSettings.reviewPlatforms || []).map((platform, i) => (
                      <div key={platform.name} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                        <Star size={18} className="text-amber-500" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900">{platform.name}</p>
                          <p className="text-[10px] text-slate-400">{platform.url || 'No URL configured'}</p>
                        </div>
                        <ToggleSwitch value={platform.enabled} onChange={(v: boolean) => {
                          const newPlatforms = [...(localSettings.reviewPlatforms || [])];
                          newPlatforms[i] = { ...platform, enabled: v };
                          setLocalSettings({ ...localSettings, reviewPlatforms: newPlatforms });
                        }} mini />
                      </div>
                    ))}
                  </div>
                </SettingsCard>

                <SettingsCard title="Referral Program" icon={Gift}>
                  <div className="space-y-6">
                    <ConfigInput label="Referrer Reward ($)" type="number" value={localSettings.referralSettings?.referrerReward || 100} onChange={(v: string) => updateNested('referralSettings.referrerReward', parseInt(v))} />
                    <ConfigInput label="Referee Discount ($)" type="number" value={localSettings.referralSettings?.refereeDiscount || 50} onChange={(v: string) => updateNested('referralSettings.refereeDiscount', parseInt(v))} />
                    <ConfigInput label="Min Purchase for Reward ($)" type="number" value={localSettings.referralSettings?.minPurchaseForReward || 500} onChange={(v: string) => updateNested('referralSettings.minPurchaseForReward', parseInt(v))} />
                  </div>
                </SettingsCard>

                <SettingsCard title="Sender Profiles" icon={Mail}>
                  <div className="space-y-3">
                    {(localSettings.senderProfiles || []).map((profile, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                        <Mail size={18} className="text-blue-500" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900">{profile.name}</p>
                          <p className="text-[10px] text-slate-400">{profile.email}</p>
                        </div>
                        {profile.isDefault && <span className="px-2 py-1 bg-blue-100 text-blue-600 text-[9px] font-black uppercase rounded-full">Default</span>}
                      </div>
                    ))}
                    <button className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50 transition-all">+ Add Sender</button>
                  </div>
                </SettingsCard>
              </div>
            )}
          </div>
        )}

        {/* =========== IMPORT/EXPORT TAB =========== */}
        {activeTab === 'IMPORT_EXPORT' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-8 rounded-[45px] mb-8">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Import / Export Data</h3>
              <p className="text-sm text-slate-600">Bulk data operations - import CSV files or export data from any module</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Import Section */}
              <SettingsCard title="Import Data" icon={Upload}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3">Select Module</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={selectedRequiredFieldsEntity}
                      onChange={(e) => setSelectedRequiredFieldsEntity(e.target.value as EntityType)}
                    >
                      <option value="accounts">Accounts</option>
                      <option value="contacts">Contacts</option>
                      <option value="leads">Leads</option>
                      <option value="deals">Deals</option>
                      <option value="tasks">Tasks</option>
                      <option value="campaigns">Campaigns</option>
                      <option value="tickets">Tickets</option>
                      <option value="products">Products</option>
                      <option value="services">Services</option>
                      <option value="invoices">Invoices</option>
                      <option value="jobs">Jobs</option>
                      <option value="crews">Crews</option>
                      <option value="equipment">Equipment</option>
                      <option value="zones">Zones</option>
                      <option value="inventory">Inventory</option>
                    </select>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Info size={16} className="text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-amber-900 mb-1">Template Format</p>
                        <p className="text-xs text-amber-700">Download the template to see required columns and format. All dates should be in YYYY-MM-DD format.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        // Generate CSV template based on selected entity
                        const templates: Record<string, string[]> = {
                          leads: ['firstName', 'lastName', 'email', 'phone', 'company', 'source', 'status', 'leadScore'],
                          contacts: ['firstName', 'lastName', 'email', 'phone', 'company', 'title', 'department'],
                          accounts: ['name', 'email', 'phone', 'industry', 'website', 'billingStreet', 'billingCity', 'billingState', 'billingPostcode'],
                          deals: ['name', 'accountId', 'value', 'stage', 'probability', 'expectedCloseDate', 'owner'],
                          tasks: ['title', 'description', 'priority', 'status', 'dueDate', 'assigneeId'],
                          products: ['name', 'sku', 'description', 'category', 'unitPrice', 'taxRate', 'stockQty'],
                          services: ['name', 'code', 'description', 'category', 'unitPrice', 'durationMins', 'taxRate'],
                          jobs: ['title', 'accountId', 'status', 'priority', 'scheduledDate', 'assignedCrewId'],
                          crews: ['name', 'specialization', 'status', 'baseLocation'],
                          equipment: ['name', 'type', 'serialNumber', 'status', 'assignedToCrewId'],
                          zones: ['name', 'region', 'postalCodes'],
                          inventory: ['productId', 'warehouseId', 'quantity', 'minStockLevel', 'maxStockLevel']
                        };
                        const columns = templates[selectedRequiredFieldsEntity] || ['id', 'name'];
                        const csvContent = columns.join(',') + '\\n' + columns.map(() => '').join(',');
                        const blob = new Blob([csvContent], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${selectedRequiredFieldsEntity}_template.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
                    >
                      <Download size={16} />
                      Download Template
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-6">
                    <button
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.csv';
                        input.onchange = async (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            // Create import job
                            const job = await createImportJob(
                              selectedRequiredFieldsEntity as JobEntityType,
                              file.name,
                              file.size
                            );

                            const reader = new FileReader();
                            reader.onload = async (event) => {
                              try {
                                const text = event.target?.result as string;
                                const lines = text.split('\\n').filter(line => line.trim());
                                const headers = lines[0]?.split(',').map(h => h.trim());
                                const rows = lines.slice(1);
                                const validRows = rows.filter(row => row.split(',').length === headers?.length);

                                // In demo mode, show parsed data info
                                alert(`CSV Import Preview:\\n\\nFile: ${file.name}\\nEntity: ${selectedRequiredFieldsEntity}\\nColumns: ${headers?.join(', ')}\\nValid Rows: ${validRows.length}\\n\\nNote: In demo mode, data is not persisted. Connect to Supabase for full import functionality.`);

                                // Update job as completed
                                if (job) {
                                  await updateImportJob(job.id, {
                                    status: 'completed',
                                    total_rows: rows.length,
                                    success_rows: validRows.length,
                                    failed_rows: rows.length - validRows.length
                                  });
                                  // Reload job history
                                  loadRecentJobs();
                                }
                              } catch (error) {
                                // Update job as failed
                                if (job) {
                                  await updateImportJob(job.id, {
                                    status: 'failed',
                                    error_message: error instanceof Error ? error.message : 'Import failed'
                                  });
                                }
                                console.error('Import error:', error);
                                alert('Import failed. Please try again.');
                              }
                            };
                            reader.readAsText(file);
                          }
                        };
                        input.click();
                      }}
                      className="w-full flex items-center justify-center gap-3 px-6 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[24px] text-sm font-black uppercase tracking-wider hover:shadow-xl transition-all active:scale-95"
                    >
                      <Upload size={20} />
                      Upload CSV File
                    </button>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Import Rules</p>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li>• Duplicate records will be updated (matched by email/ID)</li>
                      <li>• Empty cells will be skipped (won't overwrite existing data)</li>
                      <li>• Invalid rows will be logged and skipped</li>
                      <li>• Max 10,000 rows per import</li>
                    </ul>
                  </div>
                </div>
              </SettingsCard>

              {/* Export Section */}
              <SettingsCard title="Export Data" icon={Download}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3">Select Module</label>
                    <select
                      value={selectedExportEntity}
                      onChange={(e) => setSelectedExportEntity(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="accounts">Accounts</option>
                      <option value="contacts">Contacts</option>
                      <option value="leads">Leads</option>
                      <option value="deals">Deals</option>
                      <option value="tasks">Tasks</option>
                      <option value="campaigns">Campaigns</option>
                      <option value="tickets">Tickets</option>
                      <option value="products">Products</option>
                      <option value="services">Services</option>
                      <option value="invoices">Invoices</option>
                      <option value="jobs">Jobs</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest">Export Options</label>

                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                        <span className="text-xs font-bold text-slate-700">Include archived records</span>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                        <span className="text-xs font-bold text-slate-700">Include custom fields</span>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                        <span className="text-xs font-bold text-slate-700">Include audit timestamps</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        // Get data based on selected entity
                        const dataMap: Record<string, any[]> = {
                          accounts, contacts, leads, deals, tasks, campaigns, tickets, products, services, invoices, jobs
                        };
                        const data = dataMap[selectedExportEntity] || [];

                        if (data.length === 0) {
                          alert(`No ${selectedExportEntity} data to export.`);
                          return;
                        }

                        const fileName = `${selectedExportEntity}_export_${new Date().toISOString().split('T')[0]}.csv`;

                        // Create export job
                        const job = await createExportJob(selectedExportEntity as JobEntityType, fileName);

                        try {
                          // Get all unique keys from the data
                          const allKeys = new Set<string>();
                          data.forEach(item => Object.keys(item).forEach(key => allKeys.add(key)));
                          const headers = Array.from(allKeys);

                          // Convert to CSV
                          const csvRows = [headers.join(',')];
                          data.forEach(item => {
                            const row = headers.map(header => {
                              const value = item[header];
                              if (value === null || value === undefined) return '';
                              if (typeof value === 'object') return JSON.stringify(value).replace(/,/g, ';');
                              return String(value).replace(/,/g, ';').replace(/\\n/g, ' ');
                            });
                            csvRows.push(row.join(','));
                          });

                          const csvContent = csvRows.join('\\n');
                          const blob = new Blob([csvContent], { type: 'text/csv' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = fileName;
                          a.click();
                          URL.revokeObjectURL(url);

                          // Update job as completed
                          if (job) {
                            await updateExportJob(job.id, {
                              status: 'completed',
                              row_count: data.length
                            });
                            // Reload job history
                            loadRecentJobs();
                          }
                        } catch (error) {
                          // Update job as failed
                          if (job) {
                            await updateExportJob(job.id, {
                              status: 'failed',
                              error_message: error instanceof Error ? error.message : 'Export failed'
                            });
                          }
                          console.error('Export error:', error);
                          alert('Export failed. Please try again.');
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95"
                    >
                      <Download size={16} />
                      Export to CSV
                    </button>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Jobs</p>
                      <button
                        onClick={loadRecentJobs}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <RefreshCw size={12} />
                        Refresh
                      </button>
                    </div>
                    <div className="space-y-2">
                      {loadingJobs ? (
                        <div className="text-center py-4">
                          <p className="text-xs text-slate-500">Loading...</p>
                        </div>
                      ) : recentJobs.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-xs text-slate-500">No import/export jobs yet</p>
                        </div>
                      ) : (
                        recentJobs.map((job) => {
                          const isImport = 'total_rows' in job;
                          const isExport = 'row_count' in job;
                          const rowCount = isExport ? (job as ExportJob).row_count : (job as ImportJob).success_rows;
                          const statusColor = job.status === 'completed' ? 'text-green-600' : job.status === 'failed' ? 'text-red-600' : 'text-yellow-600';
                          const timeAgo = new Date(job.createdAt).toLocaleString();

                          return (
                            <div key={job.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                              <div className="flex items-center gap-3">
                                {isImport ? <Upload size={14} className="text-blue-500" /> : <Download size={14} className="text-green-500" />}
                                <div>
                                  <p className="text-xs font-bold text-slate-900">{job.file_name}</p>
                                  <p className="text-[10px] text-slate-500">
                                    {timeAgo} • {job.entity_type} • {rowCount || 0} rows
                                  </p>
                                </div>
                              </div>
                              <div className={`text-[10px] font-bold ${statusColor} uppercase`}>
                                {job.status}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </SettingsCard>
            </div>

            {/* Bulk Operations Info */}
            <SettingsCard title="Bulk Operations" icon={Zap}>
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  For bulk operations (delete, status update, assignment) on existing records, use the checkbox selection in each module page.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <CheckSquare size={16} className="text-white" />
                      </div>
                      <h4 className="text-xs font-black text-slate-900">Bulk Select</h4>
                    </div>
                    <p className="text-xs text-slate-600">Use checkboxes to select multiple records</p>
                  </div>

                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center">
                        <Trash2 size={16} className="text-white" />
                      </div>
                      <h4 className="text-xs font-black text-slate-900">Bulk Delete</h4>
                    </div>
                    <p className="text-xs text-slate-600">Delete hundreds of records at once</p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                        <RefreshCw size={16} className="text-white" />
                      </div>
                      <h4 className="text-xs font-black text-slate-900">Bulk Update</h4>
                    </div>
                    <p className="text-xs text-slate-600">Change status/owner for multiple records</p>
                  </div>
                </div>
              </div>
            </SettingsCard>
          </div>
        )}

        {/* =========== DIAGNOSTICS TAB =========== */}
        {activeTab === 'DIAGNOSTICS' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 p-8 rounded-[45px] mb-8">
              <h3 className="text-2xl font-black text-slate-900 mb-2">System Diagnostics</h3>
              <p className="text-sm text-slate-600">Monitor system health, view audit logs, and perform maintenance</p>
            </div>

            {/* Login History Viewer */}
            <SettingsCard title="Login History" icon={Key}>
              <div className="space-y-6">
                {/* Refresh Button */}
                <div className="flex justify-end">
                  <button
                    onClick={loadLoginHistory}
                    disabled={loadingLoginHistory}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={loadingLoginHistory ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                </div>

                {/* Login History Entries */}
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {loadingLoginHistory ? (
                    <div className="text-center py-12">
                      <RefreshCw size={32} className="mx-auto text-slate-300 mb-3 animate-spin" />
                      <p className="text-sm font-bold text-slate-400">Loading login history...</p>
                    </div>
                  ) : loginHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <Key size={32} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-sm font-bold text-slate-400">No login history found</p>
                    </div>
                  ) : (
                    loginHistory.map(log => (
                      <div key={log.id} className={`flex items-center gap-4 p-4 rounded-xl ${log.status === 'success' ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${log.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                          {log.status === 'success' ? <Check size={14} className="text-white" /> : <X size={14} className="text-white" />}
                        </div>
                        <div className="flex-1 grid grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs font-bold text-slate-900">{log.users?.full_name || 'Unknown'}</p>
                            <p className="text-[10px] text-slate-400">{log.users?.email || 'No email'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Device</p>
                            <p className="text-xs font-bold text-slate-900">{log.device_type}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Platform</p>
                            <p className="text-xs font-bold text-slate-900">{log.browser} / {log.platform}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Time</p>
                            <p className="text-xs font-bold text-slate-900">{new Date(log.login_time).toLocaleString()}</p>
                          </div>
                        </div>
                        {log.status === 'failed' && log.failure_reason && (
                          <div className="px-3 py-1 bg-rose-100 rounded-lg">
                            <p className="text-[10px] text-rose-600 font-bold">{log.failure_reason}</p>
                          </div>
                        )}
                        {log.ip_address && (
                          <div className="px-3 py-1 bg-slate-100 rounded-lg">
                            <p className="text-[10px] text-slate-600 font-mono">{log.ip_address}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </SettingsCard>

            {/* Audit Log Viewer */}
            <SettingsCard title="Audit Log" icon={Activity}>
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex gap-4">
                  <select
                    className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                    value={auditFilter.entityType}
                    onChange={(e) => setAuditFilter({ ...auditFilter, entityType: e.target.value })}
                  >
                    <option value="">All Entities</option>
                    <option value="leads">Leads</option>
                    <option value="deals">Deals</option>
                    <option value="accounts">Accounts</option>
                    <option value="invoices">Invoices</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Filter by action..."
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                    value={auditFilter.action}
                    onChange={(e) => setAuditFilter({ ...auditFilter, action: e.target.value })}
                  />
                </div>

                {/* Log Entries */}
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredAuditLogs.length === 0 ? (
                    <div className="text-center py-12">
                      <Activity size={32} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-sm font-bold text-slate-400">No audit logs found</p>
                    </div>
                  ) : (
                    filteredAuditLogs.map(log => (
                      <div key={log.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <Activity size={14} className="text-slate-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-900">{log.action}</p>
                          <p className="text-[10px] text-slate-400">{log.entityType} / {log.entityId}</p>
                        </div>
                        <span className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </SettingsCard>

            {/* Diagnostic Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <SettingsCard title="Data Retention" icon={Database}>
                <div className="space-y-6">
                  <ConfigInput label="Audit Log Retention (Days)" type="number" value={localSettings.diagnostics?.auditLogRetentionDays || 90} onChange={(v: string) => updateNested('diagnostics.auditLogRetentionDays', parseInt(v))} />
                  <ConfigInput label="Email Log Retention (Days)" type="number" value={localSettings.diagnostics?.emailLogRetentionDays || 30} onChange={(v: string) => updateNested('diagnostics.emailLogRetentionDays', parseInt(v))} />
                  <ToggleSwitch label="API Usage Tracking" description="Monitor API call patterns" value={localSettings.diagnostics?.apiUsageTracking ?? true} onChange={(v: boolean) => updateNested('diagnostics.apiUsageTracking', v)} />
                  <ToggleSwitch label="Data Integrity Checks" description="Run periodic orphan detection" value={localSettings.diagnostics?.dataIntegrityChecks ?? true} onChange={(v: boolean) => updateNested('diagnostics.dataIntegrityChecks', v)} />
                </div>
              </SettingsCard>

              <SettingsCard title="System Stats" icon={BarChart}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="text-xs font-bold text-slate-600">Total Records</span>
                    <span className="text-sm font-black text-slate-900">{auditLogs.length.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="text-xs font-bold text-slate-600">Active Users</span>
                    <span className="text-sm font-black text-slate-900">{users.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="text-xs font-bold text-slate-600">Storage Used</span>
                    <span className="text-sm font-black text-slate-900">~{Math.round(JSON.stringify(localStorage).length / 1024)} KB</span>
                  </div>
                </div>
              </SettingsCard>
            </div>

            {/* System Maintenance Section */}
            <div className="bg-slate-900 text-white p-12 rounded-[45px] shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-black tracking-tight mb-2">System Maintenance & Recovery</h2>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Identity Session: <span className="text-blue-400">{currentUser?.name}</span></p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                  <div className="bg-slate-800/50 p-8 rounded-[35px] border border-slate-700/50 flex flex-col justify-between">
                    <div>
                      <RotateCcw className="text-emerald-400 mb-4" size={32} />
                      <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Reset Settings</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">Restores all pipelines, status lists, and system metadata to factory defaults. Your records remain intact.</p>
                    </div>
                    <button onClick={handleRestoreSettings} className="mt-8 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">Restore Metadata</button>
                  </div>

                  <div className="bg-slate-800/50 p-8 rounded-[35px] border border-slate-700/50 flex flex-col justify-between">
                    <div>
                      <Database className="text-blue-400 mb-4" size={32} />
                      <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Reset Demo Data</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">Wipes all current records (Leads, Deals, Accounts) and re-populates the CRM with fresh demo data.</p>
                    </div>
                    <button onClick={handleResetDemoData} className="mt-8 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">Re-seed Entities</button>
                  </div>

                  <div className="bg-slate-800/50 p-8 rounded-[35px] border border-slate-700/50 flex flex-col justify-between">
                    <div>
                      <Bomb className="text-rose-400 mb-4" size={32} />
                      <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Hard Reset</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">Deletes the local database entirely. Resets everything including user preferences and storage keys.</p>
                    </div>
                    <button onClick={handleHardReset} className="mt-8 bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all text-center">Nuke Everything</button>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><ShieldCheck size={300} /></div>
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setEditingUser(null);
        }}
        users={users}
        editingUser={editingUser}
        onCreateUser={createUser}
        onUpdateUser={updateUser}
      />
    </div>
  );
};

// ============ Reusable Components ============

const SettingsCard = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
  <div className="bg-white border border-slate-200 rounded-[45px] p-10 shadow-sm flex flex-col hover:shadow-xl transition-all">
    <div className="flex items-center gap-3 mb-8">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
        <Icon size={20} />
      </div>
      <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
    </div>
    {children}
  </div>
);

const ConfigInput = ({ label, value, onChange, type = "text", placeholder = "" }: { label: string; value: string | number | boolean; onChange: (v: string) => void; type?: string; placeholder?: string }) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">{label}</label>
    <input
      type={type}
      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
      value={typeof value === 'boolean' ? String(value) : value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

const EditableList = ({ items, onUpdate, onAdd, onRemove }: { items: string[]; onUpdate: (i: number, v: string) => void; onAdd: () => void; onRemove: (i: number) => void }) => {
  const safeItems = items || [];
  return (
    <div className="space-y-3">
      {safeItems.map((item: string, i: number) => (
        <div key={i} className="flex gap-2 group">
          <input
            className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
            value={item}
            onChange={(e) => onUpdate(i, e.target.value)}
          />
          <button onClick={() => onRemove(i)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
        </div>
      ))}
      <button onClick={onAdd} className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50 transition-all">+ Add Entry</button>
    </div>
  );
};

const ToggleSwitch = ({ label, description, value, onChange, disabled = false, mini = false }: { label?: string; description?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean; mini?: boolean }) => {
  if (mini) {
    return (
      <button
        onClick={() => !disabled && onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          value ? 'bg-emerald-500' : 'bg-slate-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          value ? 'translate-x-6' : 'translate-x-0.5'
        }`} />
      </button>
    );
  }

  return (
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
};

const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
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

interface IntegrationField {
  label: string;
  value: string | number | boolean;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

const IntegrationCard = ({ name, icon, description, enabled, onToggle, fields = [], compact = false }: { name: string; icon: React.ReactNode; description: string; enabled: boolean; onToggle: (v: boolean) => void; fields?: IntegrationField[]; compact?: boolean }) => (
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
      <ToggleSwitch value={enabled} onChange={onToggle} mini />
    </div>
    {enabled && !compact && fields.length > 0 && (
      <div className="space-y-4 pt-4 border-t border-slate-100">
        {fields.map((field: IntegrationField, idx: number) => (
          <ConfigInput
            key={idx}
            label={field.label}
            value={field.value}
            onChange={field.onChange}
            type={field.type || 'text'}
          />
        ))}
      </div>
    )}
  </div>
);

export default SettingsView;
