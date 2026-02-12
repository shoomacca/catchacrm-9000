import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Building2, Mail, Phone, Edit3, Activity,
  Target, DollarSign, Globe, CheckCircle2, Plus, Info, Clock, Trash2,
  Briefcase, BarChart3, Layers, MessageSquare, History, Ticket as TicketIcon,
  FileText, Send, Share2, Smartphone, ArrowUpRight, ArrowDownRight, ArrowRight,
  ShieldAlert, CreditCard, RefreshCcw, Megaphone, PhoneIncoming,
  PhoneOutgoing, MailQuestion, ShieldOff, Paperclip, Download, User,
  Zap, TrendingUp, Calendar, Package, Calculator, Camera, ChevronDown, ChevronUp,
  MapPin
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { EntityType } from '../types';
import { EmailComposer } from '../components/EmailComposer';
import { SMSComposer } from '../components/SMSComposer';
import { BillAccountModal } from '../components/BillAccountModal';
import { GenerateQuoteModal } from '../components/GenerateQuoteModal';
import SignatureCapture from '../components/SignatureCapture';
import PhotoUploader from '../components/PhotoUploader';

const EntityDetail: React.FC<{ type?: string }> = ({ type }) => {
  const { module: routeModule, id } = useParams<{ module: string, id: string }>();
  const entityType = (type || (routeModule as any) || 'leads') as EntityType;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [isConverting, setIsConverting] = useState(false);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [showSMSComposer, setShowSMSComposer] = useState(false);
  const [showBillAccountModal, setShowBillAccountModal] = useState(false);
  const [showGenerateQuoteModal, setShowGenerateQuoteModal] = useState(false);
  
  const {
    leads, deals, accounts, contacts, tasks, auditLogs, campaigns, tickets,
    invoices, quotes, subscriptions, communications, documents, users,
    crews, jobs, zones, equipment, inventoryItems, purchaseOrders,
    bankTransactions, expenses, reviews, referralRewards, inboundForms,
    chatWidgets, calculators, automationWorkflows, webhooks, industryTemplates,
    openModal, deleteRecord, getAccountRevenueStats, canAccessRecord, hasPermission, toggleTask, convertLead, addNote,
    convertLeadToDeal, acceptQuote, closeDealAsWon, updateJobWorkflow, pickBOMItem, convertQuoteToInvoice
  } = useCRM();

  const [noteText, setNoteText] = useState('');
  const [expandedComms, setExpandedComms] = useState<Set<string>>(new Set());
  const [commFilter, setCommFilter] = useState<'all' | 'Email' | 'Call' | 'SMS'>('all');

  const toggleCommExpand = (commId: string) => {
    setExpandedComms(prev => {
      const next = new Set(prev);
      if (next.has(commId)) {
        next.delete(commId);
      } else {
        next.add(commId);
      }
      return next;
    });
  };

  const mainTabs = useMemo(() => {
    // Campaigns - special tabs
    if (entityType === 'campaigns') return ['OVERVIEW', 'ATTRIBUTED LEADS', 'ATTRIBUTED DEALS', 'HISTORY'];

    // Simplified entities - just Overview & Details
    const simpleEntities = ['zones', 'equipment', 'inventoryItems', 'bankTransactions', 'expenses',
                             'chatWidgets', 'calculators', 'webhooks', 'industryTemplates'];
    if (simpleEntities.includes(entityType)) return ['OVERVIEW', 'DETAILS', 'HISTORY'];

    // Jobs - special tabs for field work
    if (entityType === 'jobs') return ['OVERVIEW', 'DETAILS', 'JOB FIELDS', 'BOM', 'PHOTOS', 'HISTORY'];

    // Crews - special tabs for team
    if (entityType === 'crews') return ['OVERVIEW', 'DETAILS', 'MEMBERS', 'JOBS', 'HISTORY'];

    // Purchase Orders - items tab
    if (entityType === 'purchaseOrders') return ['OVERVIEW', 'DETAILS', 'ITEMS', 'HISTORY'];

    // Reviews - reply tab
    if (entityType === 'reviews') return ['OVERVIEW', 'DETAILS', 'REPLY', 'HISTORY'];

    // Referral Rewards - tracking tab
    if (entityType === 'referralRewards') return ['OVERVIEW', 'DETAILS', 'TRACKING', 'HISTORY'];

    // Inbound Forms - submissions tab
    if (entityType === 'inboundForms') return ['OVERVIEW', 'DETAILS', 'FIELDS', 'SUBMISSIONS', 'HISTORY'];

    // Automation Workflows - nodes tab
    if (entityType === 'automationWorkflows') return ['OVERVIEW', 'DETAILS', 'WORKFLOW', 'EXECUTION', 'HISTORY'];

    // Default CRM entities
    const base = ['OVERVIEW', 'DETAILS', 'DOCUMENTS', 'COMMUNICATION', 'TASKS', 'NOTES', 'HISTORY'];
    if (entityType === 'accounts') base.splice(3, 0, 'SERVICES & REVENUE');
    if (entityType === 'deals') base.splice(3, 0, 'REVENUE HUB');
    if (['accounts', 'contacts', 'leads'].includes(entityType)) base.splice(base.length - 1, 0, 'TICKETS');
    return base;
  }, [entityType]);

  const entity = useMemo(() => {
    const lists = [
      leads, deals, accounts, contacts, tickets, campaigns,
      crews, jobs, zones, equipment, inventoryItems, purchaseOrders,
      bankTransactions, expenses, reviews, referralRewards, inboundForms,
      chatWidgets, calculators, automationWorkflows, webhooks, industryTemplates
    ];
    for (const list of lists) {
      const found = (list as any[]).find(e => e.id === id);
      if (found) return found;
    }
    return null;
  }, [leads, deals, accounts, contacts, tickets, campaigns, crews, jobs, zones,
      equipment, inventoryItems, purchaseOrders, bankTransactions, expenses,
      reviews, referralRewards, inboundForms, chatWidgets, calculators,
      automationWorkflows, webhooks, industryTemplates, id]);

  if (!entity) return <div className="p-20 text-center font-black uppercase text-slate-300">Record Not Found</div>;

  if (!canAccessRecord(entity)) return (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-6">
       <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center shadow-lg border border-rose-100"><ShieldOff size={48} /></div>
       <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Security Access Denied</h2>
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-2 max-w-md mx-auto">This record is outside of your management hierarchy.</p>
       </div>
       <button onClick={() => navigate(-1)} className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest">Return</button>
    </div>
  );

  // Lead → Deal conversion (new workflow)
  const handleConvertToDeal = () => {
    if (window.confirm("Convert this Lead to a Deal? The lead will be archived and a new opportunity will be created in your pipeline.")) {
      setIsConverting(true);
      const result = convertLeadToDeal(entity.id);
      if (result.success) {
        setTimeout(() => {
          navigate(`/deals/${result.dealId}`);
        }, 800);
      }
    }
  };

  // Legacy full conversion (Lead → Account + Contact + Deal)
  const handleConvert = () => {
    if (window.confirm("Convert this Lead into a Client? This will migrate all history to a new Account, Contact, and Deal.")) {
      setIsConverting(true);
      const newDealId = convertLead(entity.id);
      setTimeout(() => {
        navigate(`/deals/${newDealId}`);
      }, 800);
    }
  };

  // Deal → Won conversion (creates Account + Contact)
  const [isDealClosing, setIsDealClosing] = useState(false);
  const handleCloseDealAsWon = () => {
    if (window.confirm("Mark this Deal as Won? This will create a new Account and Contact from this deal's information.")) {
      setIsDealClosing(true);
      const result = closeDealAsWon(entity.id);
      if (result.success) {
        setTimeout(() => {
          // Refresh the page to show updated deal
          window.location.reload();
        }, 800);
      }
    }
  };

  // Quote acceptance
  const handleAcceptQuote = (quoteId: string) => {
    if (window.confirm("Accept this Quote? Other quotes for this deal will be marked as superseded, and the deal will move to Negotiation.")) {
      const result = acceptQuote(quoteId);
      if (result.success) {
        // Refresh to show changes
        window.location.reload();
      }
    }
  };

  // Relational Selectors (normalized to lowercase for case-insensitive matching)
  const normalizedType = entityType.toLowerCase();
  const entityLogs = useMemo(() => auditLogs.filter(l => l.entityId === id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [auditLogs, id]);
  const entityComms = useMemo(() => communications.filter(c => c.relatedToType?.toLowerCase() === normalizedType && c.relatedToId === id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [communications, normalizedType, id]);
  const entityNotes = useMemo(() => communications.filter(c => c.relatedToType?.toLowerCase() === normalizedType && c.relatedToId === id && c.type === 'Note').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [communications, normalizedType, id]);
  const entityTasks = useMemo(() => tasks.filter(t => t.relatedToType?.toLowerCase() === normalizedType && t.relatedToId === id).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()), [tasks, normalizedType, id]);
  const entityDocs = useMemo(() => documents.filter(d => d.relatedToType?.toLowerCase() === normalizedType && d.relatedToId === id), [documents, normalizedType, id]);
  const entityTickets = useMemo(() => tickets.filter(t => t.accountId === id || t.requesterId === id || (t.relatedToId === id && t.relatedToType?.toLowerCase() === normalizedType)), [tickets, id, normalizedType]);
  const entityInvoices = useMemo(() => invoices.filter(i => i.accountId === id || i.dealId === id), [invoices, id]);
  const entitySubs = useMemo(() => subscriptions.filter(s => s.accountId === id), [subscriptions, id]);
  const entityQuotes = useMemo(() => quotes.filter(q => q.accountId === id || q.dealId === id), [quotes, id]);

  // Get related entities for detail display
  const relatedAccount = useMemo(() => accounts.find(a => a.id === entity?.accountId), [accounts, entity?.accountId]);
  const relatedContact = useMemo(() => contacts.find(c => c.id === entity?.contactId), [contacts, entity?.contactId]);
  const relatedCampaign = useMemo(() => campaigns.find(c => c.id === entity?.campaignId), [campaigns, entity?.campaignId]);

  const accStats = entityType === 'accounts' ? getAccountRevenueStats(id!) : { lifetimeBilled: 0, outstanding: 0, overdueCount: 0 };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': case 'Resolved': case 'Active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Overdue': case 'Urgent': case 'Lost': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Converted': return 'bg-blue-600 text-white border-blue-700 shadow-sm';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-[1200px] mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 shadow-sm transition-all"><ChevronLeft size={20} /></button>
          <div>
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">
               <span>{entityType}</span><span className="text-slate-200">/</span><span className="text-blue-600">ID #{entity.id}</span>
             </div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{entity.name || entity.subject || entity.company}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Send SMS Button - for leads, accounts, contacts */}
          {(['leads', 'accounts', 'contacts'].includes(entityType)) && (
            <button
              onClick={() => setShowSMSComposer(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Smartphone size={18} /> Send SMS
            </button>
          )}
          {/* Send Email Button - for leads, accounts, contacts */}
          {(['leads', 'accounts', 'contacts'].includes(entityType)) && (
            <button
              onClick={() => setShowEmailComposer(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
            >
              <Send size={18} /> Send Email
            </button>
          )}
          {/* Bill Account Button - for accounts only */}
          {entityType === 'accounts' && (
            <button
              onClick={() => setShowBillAccountModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <DollarSign size={18} /> Bill Account
            </button>
          )}
          {/* Generate Quote Button - for deals only */}
          {entityType === 'deals' && entity.accountId && (
            <button
              onClick={() => setShowGenerateQuoteModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-violet-500/20 active:scale-95 transition-all"
            >
              <FileText size={18} /> Generate Quote
            </button>
          )}
          {entityType === 'leads' && entity.status !== 'Converted' && (
             <button
              onClick={handleConvertToDeal}
              disabled={isConverting}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
             >
               {isConverting ? <RefreshCcw size={18} className="animate-spin"/> : <ArrowUpRight size={18} />}
               Convert to Deal
             </button>
          )}
          {entityType === 'leads' && entity.status === 'Converted' && entity.convertedToDealId && (
             <Link
              to={`/deals/${entity.convertedToDealId}`}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
             >
               <Briefcase size={18} />
               View Deal
             </Link>
          )}
          {entityType === 'deals' && !['Closed Won', 'Closed Lost'].includes(entity.stage) && (
             <button
              onClick={handleCloseDealAsWon}
              disabled={isDealClosing}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
             >
               {isDealClosing ? <RefreshCcw size={18} className="animate-spin"/> : <CheckCircle2 size={18} />}
               Mark as Won
             </button>
          )}
          {entityType === 'deals' && entity.stage === 'Closed Won' && entity.createdAccountId && (
             <Link
              to={`/accounts/${entity.createdAccountId}`}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
             >
               <Building2 size={18} />
               View Account
             </Link>
          )}
          {(() => {
            // Map entity type to permission domain
            const domain = ['leads', 'deals', 'accounts', 'contacts'].includes(entityType) ? 'sales' :
                           ['invoices', 'quotes', 'subscriptions'].includes(entityType) ? 'finance' :
                           ['jobs', 'crews', 'equipment'].includes(entityType) ? 'field' :
                           ['campaigns'].includes(entityType) ? 'marketing' : 'operations';
            return hasPermission(domain, 'delete') ? (
              <button onClick={() => deleteRecord(entityType, entity.id)} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-500 transition-all"><Trash2 size={18} /></button>
            ) : null;
          })()}
          <button onClick={() => openModal(entityType, entity)} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all"><Edit3 size={18} /> Edit Record</button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="bg-white border border-slate-200 rounded-[45px] p-12 shadow-sm flex flex-col items-center relative overflow-hidden">
         <div className="relative mb-8">
           <div className="w-32 h-32 rounded-[40px] bg-white p-1 flex items-center justify-center border-4 border-slate-50 shadow-xl overflow-hidden">
              <img src={entity.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entity.id}`} className="w-full h-full object-cover" alt="" />
           </div>
           {(entity.status === 'Active' || entity.status === 'Converted') && (
             <div className={`absolute bottom-1 right-1 w-6 h-6 border-4 border-white rounded-full ${entity.status === 'Converted' ? 'bg-blue-600' : 'bg-emerald-500'}`}></div>
           )}
         </div>
         <div className="text-center mb-10">
            <h2 className="text-xl font-black text-slate-900">{entity.name}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{entity.email || entity.company}</p>
            {/* Converted Lead Banner */}
            {entityType === 'leads' && entity.status === 'Converted' && entity.convertedToDealId && (
              <Link
                to={`/deals/${entity.convertedToDealId}`}
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:shadow-xl transition-all"
              >
                <CheckCircle2 size={14} />
                Converted to Deal
                <ArrowUpRight size={14} />
              </Link>
            )}
            {/* Deal Won Banner */}
            {entityType === 'deals' && entity.stage === 'Closed Won' && (
              <div className="flex items-center justify-center gap-3 mt-4">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 size={14} />
                  Deal Won
                </span>
                {entity.createdAccountId && (
                  <Link
                    to={`/accounts/${entity.createdAccountId}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg hover:bg-slate-800 transition-all"
                  >
                    <Building2 size={14} />
                    View Account
                  </Link>
                )}
              </div>
            )}
         </div>
         <div className="flex gap-12">
           {(['leads', 'accounts', 'contacts'].includes(entityType)) && (
             <div onClick={() => setShowEmailComposer(true)} className="flex flex-col items-center gap-1 group cursor-pointer text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform"><Mail size={20} /></div>
                <span className="text-[8px] font-black text-slate-400 tracking-widest mt-1">MAIL</span>
             </div>
           )}
           {(['leads', 'accounts', 'contacts'].includes(entityType)) && (
             <div onClick={() => setShowSMSComposer(true)} className="flex flex-col items-center gap-1 group cursor-pointer text-center">
                <div className="w-12 h-12 bg-teal-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-teal-200 group-hover:scale-110 transition-transform"><MessageSquare size={20} /></div>
                <span className="text-[8px] font-black text-slate-400 tracking-widest mt-1">SMS</span>
             </div>
           )}
           <div className="flex flex-col items-center gap-1 group cursor-pointer text-center">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform"><Phone size={20} /></div>
              <span className="text-[8px] font-black text-slate-400 tracking-widest mt-1">CALL</span>
           </div>
           {entityType === 'accounts' && (
             <div onClick={() => setShowBillAccountModal(true)} className="flex flex-col items-center gap-1 group cursor-pointer text-center">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform"><DollarSign size={20} /></div>
                <span className="text-[8px] font-black text-slate-400 tracking-widest mt-1">BILL</span>
             </div>
           )}
         </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-[45px] shadow-sm flex flex-col overflow-hidden min-h-[600px]">
        <div className="px-12 pt-12">
           <div className="flex gap-10 overflow-x-auto custom-scrollbar border-t border-slate-100">
             {mainTabs.map((tab) => (
               <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`pt-6 pb-6 text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap relative transition-all ${activeTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 {tab}
                 {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-t-full"></div>}
               </button>
             ))}
           </div>
        </div>

        <div className="p-12 pt-8 flex-1">
          {/* SERVICES & REVENUE TAB (Account only) */}
          {activeTab === 'SERVICES & REVENUE' && entityType === 'accounts' && (
            <div className="space-y-8">
               <div className="flex justify-between items-center bg-slate-50 p-8 rounded-[35px] border border-slate-100">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600"><Calculator size={24}/></div>
                     <div>
                        <h3 className="text-xl font-black text-slate-900">Account Entitlements</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active billing plans and service delivery</p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => openModal('invoices', { accountId: id })} className="bg-white border border-slate-200 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"><Plus size={14}/> One-Off Invoice</button>
                     <button onClick={() => openModal('subscriptions', { accountId: id })} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"><Plus size={14}/> Provision Service</button>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recurring Services */}
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2"><RefreshCcw size={14} className="text-blue-600"/> Active Services</h4>
                    {entitySubs.map(sub => (
                      <div key={sub.id} onClick={() => openModal('subscriptions', sub)} className="p-6 bg-blue-50/50 border border-blue-100 rounded-[30px] flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><RefreshCcw size={18}/></div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{sub.name}</p>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{sub.billingCycle} cycle • Next bill {sub.nextBillDate}</p>
                          </div>
                        </div>
                        <p className="text-lg font-black text-blue-600">${sub.items.reduce((a, b) => a + (b.qty * b.unitPrice), 0).toLocaleString()}</p>
                      </div>
                    ))}
                    {entitySubs.length === 0 && <EmptyState icon={RefreshCcw} label="No active service contracts" />}
                  </div>

                  {/* Recent Invoices */}
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2"><FileText size={14} className="text-emerald-600"/> Transaction History</h4>
                    {entityInvoices.map(inv => (
                      <div key={inv.id} onClick={() => openModal('invoices', inv)} className="p-6 bg-slate-50 border border-slate-100 rounded-[30px] flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm"><DollarSign size={18}/></div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{inv.invoiceNumber}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoiced {inv.issueDate}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-slate-900">${inv.total.toLocaleString()}</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase border mt-1 ${getStatusColor(inv.status)}`}>{inv.status}</span>
                        </div>
                      </div>
                    ))}
                    {entityInvoices.length === 0 && <EmptyState icon={CreditCard} label="No billing records found" />}
                  </div>
               </div>
            </div>
          )}

          {/* REVENUE HUB TAB (Deals only) */}
          {activeTab === 'REVENUE HUB' && entityType === 'deals' && (
            <div className="space-y-8">
               <div className="flex justify-between items-center bg-emerald-50 p-8 rounded-[35px] border border-emerald-100">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-emerald-600"><DollarSign size={24}/></div>
                     <div>
                        <h3 className="text-xl font-black text-slate-900">Deal Revenue Pipeline</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quotes and invoices for this opportunity</p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => openModal('quotes', { dealId: id, accountId: entity?.accountId })} className="bg-white border border-slate-200 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"><Plus size={14}/> Create Quote</button>
                     <button onClick={() => openModal('invoices', { dealId: id, accountId: entity?.accountId })} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"><Plus size={14}/> Create Invoice</button>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Quotes */}
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2"><FileText size={14} className="text-violet-600"/> Quotes & Proposals</h4>
                    {entityQuotes.map(quote => (
                      <div key={quote.id} className="p-6 bg-violet-50/50 border border-violet-100 rounded-[30px] flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
                        <div className="flex items-center gap-4 cursor-pointer" onClick={() => openModal('quotes', quote)}>
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-violet-600 shadow-sm"><FileText size={18}/></div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{quote.quoteNumber}</p>
                            <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">
                              {quote.version && quote.version > 1 && <span className="mr-2">v{quote.version}</span>}
                              Expires {new Date(quote.expiryDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-black text-slate-900">${quote.total.toLocaleString()}</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase border mt-1 ${getStatusColor(quote.status)}`}>{quote.status}</span>
                          </div>
                          {quote.status === 'Sent' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAcceptQuote(quote.id); }}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                            >
                              Accept
                            </button>
                          )}
                          {quote.status === 'Accepted' && !entityInvoices.some(inv => inv.quoteId === quote.id) && (
                            <button
                              onClick={(e) => { e.stopPropagation(); convertQuoteToInvoice(quote.id); }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-1"
                            >
                              <ArrowRight size={12} /> Invoice
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {entityQuotes.length === 0 && <EmptyState icon={FileText} label="No quotes created yet" />}
                  </div>

                  {/* Invoices for this Deal */}
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2"><CreditCard size={14} className="text-emerald-600"/> Invoices</h4>
                    {entityInvoices.map(inv => (
                      <div key={inv.id} onClick={() => openModal('invoices', inv)} className="p-6 bg-slate-50 border border-slate-100 rounded-[30px] flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm"><DollarSign size={18}/></div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{inv.invoiceNumber}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due {new Date(inv.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-slate-900">${inv.total.toLocaleString()}</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase border mt-1 ${getStatusColor(inv.status)}`}>{inv.status}</span>
                        </div>
                      </div>
                    ))}
                    {entityInvoices.length === 0 && <EmptyState icon={CreditCard} label="No invoices created yet" />}
                  </div>
               </div>
            </div>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {entityType === 'leads' && (
                  <>
                    <StatItem label="Lead Score" value={`${entity.score || 0}%`} icon={Target} color="text-emerald-500" bg="bg-emerald-50/50" />
                    <StatItem label="Est. Value" value={`$${(entity.estimatedValue || 0).toLocaleString()}`} icon={DollarSign} color="text-blue-600" bg="bg-blue-50/50" />
                    <StatItem label="Status" value={entity.status} icon={Zap} color={entity.status === 'Converted' ? 'text-blue-600' : 'text-violet-500'} bg={entity.status === 'Converted' ? 'bg-blue-50/50' : 'bg-violet-50/50'} />
                  </>
                )}
                {entityType === 'deals' && (
                  <>
                    <StatItem label="Deal Value" value={`$${(entity.amount || 0).toLocaleString()}`} icon={DollarSign} color="text-emerald-500" bg="bg-emerald-50/50" />
                    <StatItem label="Probability" value={`${((entity.probability || 0) * 100).toFixed(0)}%`} icon={TrendingUp} color="text-blue-600" bg="bg-blue-50/50" />
                    <StatItem label="Stage" value={entity.stage} icon={Layers} color="text-violet-500" bg="bg-violet-50/50" />
                  </>
                )}
                {entityType === 'accounts' && (
                  <>
                    <StatItem label="Lifetime Revenue" value={`$${accStats.lifetimeBilled.toLocaleString()}`} icon={DollarSign} color="text-emerald-500" bg="bg-emerald-50/50" />
                    <StatItem label="Provisioned Plans" value={entitySubs.length} icon={RefreshCcw} color="text-blue-600" bg="bg-blue-50/50" />
                    <StatItem label="Open Tickets" value={entityTickets.filter(t => t.status !== 'Closed').length} icon={TicketIcon} color="text-amber-500" bg="bg-amber-50/50" />
                  </>
                )}
                {entityType === 'contacts' && (
                  <>
                    <StatItem label="Communications" value={entityComms.length} icon={MessageSquare} color="text-blue-600" bg="bg-blue-50/50" />
                    <StatItem label="Open Tasks" value={entityTasks.filter(t => t.status !== 'Completed').length} icon={CheckCircle2} color="text-amber-500" bg="bg-amber-50/50" />
                    <StatItem label="Documents" value={entityDocs.length} icon={Paperclip} color="text-violet-500" bg="bg-violet-50/50" />
                  </>
                )}
                {/* NEW ENTITIES - FIELD SERVICE */}
                {entityType === 'jobs' && (
                  <>
                    <StatItem label="Job Status" value={entity.status} icon={Activity} color="text-blue-600" bg="bg-blue-50/50" />
                    <StatItem label="Job Type" value={entity.jobType} icon={Briefcase} color="text-violet-500" bg="bg-violet-50/50" />
                    <StatItem label="Priority" value={entity.priority} icon={ShieldAlert} color="text-rose-500" bg="bg-rose-50/50" />
                  </>
                )}
              </div>

              {/* JOB WORKFLOW STEPPER */}
              {entityType === 'jobs' && (() => {
                const workflowSteps = ['PREP', 'LOGISTICS', 'EXECUTION', 'EVIDENCE', 'COMPLETION'];
                const stepIcons = [ShieldAlert, Package, Activity, Camera, CheckCircle2];
                const getCurrentStep = () => {
                  if (!entity.swmsSigned) return 0;
                  if (entity.bom?.length && !entity.bom.every((b: any) => b.qtyPicked >= b.qtyRequired)) return 1;
                  if (entity.status !== 'InProgress' && entity.status !== 'Completed') return 2;
                  if (!entity.evidencePhotos?.length || entity.evidencePhotos.length < 1) return 3;
                  if (!entity.completionSignature) return 4;
                  return 5; // All complete
                };
                const currentStep = getCurrentStep();
                const isComplete = currentStep === 5;

                return (
                  <div className="mt-6 bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200 rounded-[30px] p-6">
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Zap size={14} className="text-amber-500"/> Job Workflow {isComplete && <span className="text-emerald-600 ml-2">✓ Complete</span>}
                    </h4>

                    {/* Stepper Bar */}
                    <div className="flex items-center justify-between mb-6 relative">
                      <div className="absolute top-5 left-0 right-0 h-1 bg-slate-200 rounded-full -z-1" style={{zIndex: 0}}></div>
                      <div className="absolute top-5 left-0 h-1 bg-emerald-500 rounded-full transition-all" style={{width: `${(currentStep / 5) * 100}%`, zIndex: 0}}></div>
                      {workflowSteps.map((step, idx) => {
                        const Icon = stepIcons[idx];
                        const isCompleted = idx < currentStep;
                        const isCurrent = idx === currentStep;
                        return (
                          <div key={step} className="flex flex-col items-center relative z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                              isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' :
                              isCurrent ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30' :
                              'bg-white border-slate-300 text-slate-400'
                            }`}>
                              {isCompleted ? <CheckCircle2 size={18}/> : <Icon size={18}/>}
                            </div>
                            <span className={`text-[10px] font-bold mt-2 ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Step-Specific Content */}
                    {currentStep === 0 && (
                      <div className="bg-white rounded-2xl p-5 border border-slate-200">
                        <h5 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><ShieldAlert size={16} className="text-amber-500"/> SWMS Acknowledgment</h5>
                        <p className="text-sm text-slate-600 mb-4">Safe Work Method Statement must be reviewed and acknowledged before starting work.</p>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={entity.swmsSigned || false}
                            onChange={(e) => updateJobWorkflow(entity.id, { swmsSigned: e.target.checked })}
                            className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                          />
                          <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-600 transition-colors">
                            I have read and acknowledge the SWMS for this job
                          </span>
                        </label>
                      </div>
                    )}

                    {currentStep === 1 && (
                      <div className="bg-white rounded-2xl p-5 border border-slate-200">
                        <h5 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Package size={16} className="text-blue-500"/> BOM Picking</h5>
                        <p className="text-sm text-slate-600 mb-4">Pick all required materials before proceeding to job execution.</p>
                        {entity.bom?.length ? (
                          <div className="space-y-3">
                            {entity.bom.map((item: any, idx: number) => {
                              const invItem = inventoryItems.find((i: any) => i.id === item.inventoryItemId);
                              const isPicked = item.qtyPicked >= item.qtyRequired;
                              return (
                                <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${isPicked ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPicked ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                      {isPicked ? <CheckCircle2 size={16}/> : <Package size={16}/>}
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-slate-800">{invItem?.name || 'Unknown Item'}</p>
                                      <p className="text-xs text-slate-500">{item.qtyPicked || 0} / {item.qtyRequired} picked</p>
                                    </div>
                                  </div>
                                  {!isPicked && (
                                    <button
                                      onClick={() => pickBOMItem(entity.id, item.inventoryItemId, item.qtyRequired)}
                                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors"
                                    >
                                      Pick All
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-slate-400">
                            <Package size={32} className="mx-auto mb-2 opacity-50"/>
                            <p className="text-sm">No BOM items assigned to this job</p>
                            <button
                              onClick={() => updateJobWorkflow(entity.id, { status: 'InProgress' })}
                              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-colors"
                            >
                              Skip to Execution
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="bg-white rounded-2xl p-5 border border-slate-200">
                        <h5 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Activity size={16} className="text-emerald-500"/> Start Job Execution</h5>
                        <p className="text-sm text-slate-600 mb-4">Begin work on this job. Status will be updated to "In Progress".</p>
                        <button
                          onClick={() => updateJobWorkflow(entity.id, { status: 'InProgress' })}
                          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          <Activity size={18}/> Start Job
                        </button>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="bg-white rounded-2xl p-5 border border-slate-200">
                        <h5 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Camera size={16} className="text-violet-500"/> Evidence Photos</h5>
                        <p className="text-sm text-slate-600 mb-4">Upload photos documenting the completed work (minimum 1 required).</p>
                        <PhotoUploader
                          photos={entity.evidencePhotos || []}
                          onPhotosChange={(photos) => updateJobWorkflow(entity.id, { evidencePhotos: photos })}
                          maxPhotos={10}
                        />
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className="bg-white rounded-2xl p-5 border border-slate-200">
                        <h5 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500"/> Completion Signature</h5>
                        <p className="text-sm text-slate-600 mb-4">Capture customer signature to finalize the job.</p>
                        <SignatureCapture
                          existingSignature={entity.completionSignature}
                          onCapture={(sig) => {
                            updateJobWorkflow(entity.id, {
                              completionSignature: sig,
                              status: 'Completed'
                            });
                          }}
                        />
                      </div>
                    )}

                    {isComplete && (
                      <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 text-center">
                        <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-3"/>
                        <h5 className="font-bold text-emerald-800 text-lg">Job Complete!</h5>
                        <p className="text-sm text-emerald-600 mt-1">All workflow steps have been completed successfully.</p>
                        {entity.completedAt && (
                          <p className="text-xs text-emerald-500 mt-2">Completed: {new Date(entity.completedAt).toLocaleString()}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Quick Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {entityType === 'crews' && (
                  <>
                    <StatItem label="Team Size" value={entity.memberIds?.length || 0} icon={User} color="text-blue-600" bg="bg-blue-50/50" />
                    <StatItem label="Active Jobs" value={jobs.filter(j => j.crewId === id && j.status === 'InProgress').length} icon={Briefcase} color="text-emerald-500" bg="bg-emerald-50/50" />
                    <StatItem label="Completed" value={jobs.filter(j => j.crewId === id && j.status === 'Completed').length} icon={CheckCircle2} color="text-violet-500" bg="bg-violet-50/50" />
                  </>
                )}
                {entityType === 'zones' && (
                  <>
                    <StatItem label="Region" value={entity.region} icon={Globe} color="text-blue-600" bg="bg-blue-50/50" />
                    <StatItem label="Active Jobs" value={jobs.filter(j => j.zone === entity.name && j.status !== 'Completed').length} icon={Briefcase} color="text-emerald-500" bg="bg-emerald-50/50" />
                    <StatItem label="Teams Assigned" value={crews.filter(c => jobs.some(j => j.zone === entity.name && j.crewId === c.id)).length} icon={User} color="text-violet-500" bg="bg-violet-50/50" />
                  </>
                )}
                {/* LOGISTICS */}
                {entityType === 'equipment' && (
                  <>
                    <StatItem label="Condition" value={entity.condition} icon={Activity} color="text-blue-600" bg="bg-blue-50/50" />
                    <StatItem label="Location" value={entity.location} icon={Globe} color="text-emerald-500" bg="bg-emerald-50/50" />
                    <StatItem label="Purchase Price" value={entity.purchasePrice ? `$${entity.purchasePrice.toLocaleString()}` : 'N/A'} icon={DollarSign} color="text-violet-500" bg="bg-violet-50/50" />
                  </>
                )}
                {entityType === 'inventoryItems' && (
                  <>
                    <StatItem label="In Stock" value={entity.warehouseQty} icon={Package} color="text-blue-600" bg="bg-blue-50/50" />
                    <StatItem label="Reorder Point" value={entity.reorderPoint} icon={ShieldAlert} color="text-amber-500" bg="bg-amber-50/50" />
                    <StatItem label="Unit Price" value={`$${entity.unitPrice.toFixed(2)}`} icon={DollarSign} color="text-emerald-500" bg="bg-emerald-50/50" />
                  </>
                )}
                {entityType === 'purchaseOrders' && (
                  <>
                    <StatItem label="PO Status" value={entity.status} icon={Activity} color="text-blue-600" bg="bg-blue-50/50" />
                    <StatItem label="Total Value" value={`$${entity.total.toLocaleString()}`} icon={DollarSign} color="text-emerald-500" bg="bg-emerald-50/50" />
                    <StatItem label="Items" value={entity.items?.length || 0} icon={Package} color="text-violet-500" bg="bg-violet-50/50" />
                  </>
                )}
                {/* FINANCIAL */}
                {entityType === 'bankTransactions' && (
                  <>
                    <StatItem label="Amount" value={`$${Math.abs(entity.amount).toLocaleString()}`} icon={DollarSign} color={entity.amount >= 0 ? 'text-emerald-500' : 'text-rose-500'} bg={entity.amount >= 0 ? 'bg-emerald-50/50' : 'bg-rose-50/50'} />
                    <StatItem label="Status" value={entity.status} icon={Activity} color="text-blue-600" bg="bg-blue-50/50" />
                    <StatItem label="Confidence" value={entity.matchConfidence} icon={CheckCircle2} color="text-violet-500" bg="bg-violet-50/50" />
                  </>
                )}
                {entityType === 'expenses' && (
                  <>
                    <StatItem label="Amount" value={`$${entity.amount.toLocaleString()}`} icon={DollarSign} color="text-rose-500" bg="bg-rose-50/50" />
                    <StatItem label="Category" value={entity.category} icon={Layers} color="text-blue-600" bg="bg-blue-50/50" />
                    <StatItem label="Status" value={entity.status} icon={Activity} color="text-emerald-500" bg="bg-emerald-50/50" />
                  </>
                )}
                {/* MARKETING */}
                {entityType === 'reviews' && (
                  <>
                    <StatItem label="Rating" value={`${entity.rating}/5 ⭐`} icon={TrendingUp} color="text-amber-500" bg="bg-amber-50/50" />
                    <StatItem label="Platform" value={entity.platform} icon={Globe} color="text-blue-600" bg="bg-blue-50/50" />
                    <StatItem label="Sentiment" value={entity.sentiment} icon={Activity} color={entity.sentiment === 'Positive' ? 'text-emerald-500' : entity.sentiment === 'Negative' ? 'text-rose-500' : 'text-slate-500'} bg={entity.sentiment === 'Positive' ? 'bg-emerald-50/50' : entity.sentiment === 'Negative' ? 'bg-rose-50/50' : 'bg-slate-50/50'} />
                  </>
                )}
                {entityType === 'referralRewards' && (
                  <>
                    <StatItem label="Reward Amount" value={`$${entity.amount.toLocaleString()}`} icon={DollarSign} color="text-emerald-500" bg="bg-emerald-50/50" />
                    <StatItem label="Status" value={entity.status} icon={Activity} color="text-blue-600" bg="bg-blue-50/50" />
                    <StatItem label="Referrer" value={contacts.find(c => c.id === entity.referrerId)?.name || 'Unknown'} icon={User} color="text-violet-500" bg="bg-violet-50/50" />
                  </>
                )}
                {entityType === 'inboundForms' && (
                  <>
                    <StatItem label="Fields" value={entity.fields?.length || 0} icon={Layers} color="text-blue-600" bg="bg-blue-50/50" />
                    <StatItem label="Submissions" value={entity.submissionCount} icon={Send} color="text-emerald-500" bg="bg-emerald-50/50" />
                    <StatItem label="Target Campaign" value={campaigns.find(c => c.id === entity.targetCampaignId)?.name || 'None'} icon={Megaphone} color="text-violet-500" bg="bg-violet-50/50" />
                  </>
                )}
                {entityType === 'chatWidgets' && (
                  <>
                    <StatItem label="Status" value={entity.isActive ? 'Active' : 'Inactive'} icon={Activity} color={entity.isActive ? 'text-emerald-500' : 'text-slate-400'} bg={entity.isActive ? 'bg-emerald-50/50' : 'bg-slate-50/50'} />
                    <StatItem label="Routing To" value={users.find(u => u.id === entity.routingUserId)?.name || 'Unknown'} icon={User} color="text-blue-600" bg="bg-blue-50/50" />
                    <StatItem label="Bubble Color" value={entity.bubbleColor} icon={Activity} color="text-violet-500" bg="bg-violet-50/50" />
                  </>
                )}
                {entityType === 'calculators' && (
                  <>
                    <StatItem label="Type" value={entity.type} icon={Calculator} color="text-blue-600" bg="bg-blue-50/50" />
                    <StatItem label="Status" value={entity.isActive ? 'Active' : 'Inactive'} icon={Activity} color={entity.isActive ? 'text-emerald-500' : 'text-slate-400'} bg={entity.isActive ? 'bg-emerald-50/50' : 'bg-slate-50/50'} />
                    <StatItem label="Base Rate" value={entity.baseRate ? `${entity.baseRate}%` : 'N/A'} icon={DollarSign} color="text-violet-500" bg="bg-violet-50/50" />
                  </>
                )}
                {/* AUTOMATION */}
                {entityType === 'automationWorkflows' && (
                  <>
                    <StatItem label="Status" value={entity.isActive ? 'Active' : 'Inactive'} icon={Activity} color={entity.isActive ? 'text-emerald-500' : 'text-slate-400'} bg={entity.isActive ? 'bg-emerald-50/50' : 'bg-slate-50/50'} />
                    <StatItem label="Executions" value={entity.executionCount} icon={RefreshCcw} color="text-blue-600" bg="bg-blue-50/50" />
                    <StatItem label="Category" value={entity.category} icon={Layers} color="text-violet-500" bg="bg-violet-50/50" />
                  </>
                )}
                {entityType === 'webhooks' && (
                  <>
                    <StatItem label="Status" value={entity.isActive ? 'Active' : 'Inactive'} icon={Activity} color={entity.isActive ? 'text-emerald-500' : 'text-slate-400'} bg={entity.isActive ? 'bg-emerald-50/50' : 'bg-slate-50/50'} />
                    <StatItem label="Success Rate" value={entity.successCount + entity.failureCount > 0 ? `${((entity.successCount / (entity.successCount + entity.failureCount)) * 100).toFixed(0)}%` : 'N/A'} icon={CheckCircle2} color="text-emerald-500" bg="bg-emerald-50/50" />
                    <StatItem label="Total Calls" value={entity.successCount + entity.failureCount} icon={Send} color="text-blue-600" bg="bg-blue-50/50" />
                  </>
                )}
                {/* GOVERNANCE */}
                {entityType === 'industryTemplates' && (
                  <>
                    <StatItem label="Target Entity" value={entity.targetEntity} icon={Target} color="text-blue-600" bg="bg-blue-50/50" />
                    <StatItem label="Industry" value={entity.industry} icon={Building2} color="text-violet-500" bg="bg-violet-50/50" />
                    <StatItem label="Sections" value={entity.sections?.length || 0} icon={Layers} color="text-emerald-500" bg="bg-emerald-50/50" />
                  </>
                )}
              </div>

              {/* Quick Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Info */}
                {(entity.email || entity.phone) && (
                  <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-[30px]">
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2"><User size={14} className="text-blue-600"/> Contact Information</h4>
                    {entity.email && (
                      <div className="flex items-center gap-3 py-2">
                        <Mail size={16} className="text-slate-400" />
                        <a href={`mailto:${entity.email}`} className="text-sm text-blue-600 hover:underline">{entity.email}</a>
                      </div>
                    )}
                    {entity.phone && (
                      <div className="flex items-center gap-3 py-2">
                        <Phone size={16} className="text-slate-400" />
                        <a href={`tel:${entity.phone}`} className="text-sm text-blue-600 hover:underline">{entity.phone}</a>
                      </div>
                    )}
                    {entity.company && (
                      <div className="flex items-center gap-3 py-2">
                        <Building2 size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-700">{entity.company}</span>
                      </div>
                    )}
                    {entity.website && (
                      <div className="flex items-center gap-3 py-2">
                        <Globe size={16} className="text-slate-400" />
                        <a href={entity.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">{entity.website}</a>
                      </div>
                    )}
                  </div>
                )}

                {/* Recent Activity */}
                <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-[30px]">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity size={14} className="text-emerald-600"/> Recent Activity</h4>
                  {entityComms.slice(0, 3).map(comm => (
                    <div key={comm.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm">
                        {comm.type === 'Call' ? <Phone size={14}/> : comm.type === 'Note' ? <FileText size={14}/> : <Mail size={14}/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{comm.subject}</p>
                        <p className="text-[10px] text-slate-400">{new Date(comm.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  {entityComms.length === 0 && <p className="text-xs text-slate-400 py-4 text-center">No recent activity</p>}
                </div>
              </div>

              {/* Related Account/Contact for Deals */}
              {entityType === 'deals' && (relatedAccount || relatedContact) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedAccount && (
                    <Link to={`/accounts/${relatedAccount.id}`} className="bg-white border border-slate-200 p-6 rounded-[30px] flex items-center gap-4 hover:shadow-xl transition-all">
                      <img src={relatedAccount.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${relatedAccount.id}`} className="w-14 h-14 rounded-2xl" alt="" />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account</p>
                        <p className="text-lg font-black text-slate-900">{relatedAccount.name}</p>
                        <p className="text-xs text-slate-500">{relatedAccount.industry} • {relatedAccount.tier}</p>
                      </div>
                    </Link>
                  )}
                  {relatedContact && (
                    <Link to={`/contacts/${relatedContact.id}`} className="bg-white border border-slate-200 p-6 rounded-[30px] flex items-center gap-4 hover:shadow-xl transition-all">
                      <img src={relatedContact.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${relatedContact.id}`} className="w-14 h-14 rounded-2xl" alt="" />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Contact</p>
                        <p className="text-lg font-black text-slate-900">{relatedContact.name}</p>
                        <p className="text-xs text-slate-500">{relatedContact.title} • {relatedContact.email}</p>
                      </div>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* COMMUNICATION TAB */}
          {activeTab === 'COMMUNICATION' && (
            <div className="space-y-8">
              {/* Communication Filter Tabs */}
              <div className="flex items-center justify-between">
                <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
                  {[
                    { key: 'all', label: 'All', count: entityComms.filter(c => c.type !== 'Note').length },
                    { key: 'Email', label: 'Emails', count: entityComms.filter(c => c.type === 'Email').length },
                    { key: 'Call', label: 'Calls', count: entityComms.filter(c => c.type === 'Call').length },
                    { key: 'SMS', label: 'SMS', count: entityComms.filter(c => c.type === 'SMS').length },
                  ].map(filter => (
                    <button
                      key={filter.key}
                      onClick={() => setCommFilter(filter.key as typeof commFilter)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                        commFilter === filter.key
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {filter.label}
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                        commFilter === filter.key ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {filter.count}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {(['leads', 'accounts', 'contacts'].includes(entityType)) && (
                    <>
                      <button
                        onClick={() => setShowEmailComposer(true)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
                      >
                        <Mail size={14}/> Email
                      </button>
                      <button
                        onClick={() => setShowSMSComposer(true)}
                        className="bg-teal-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-600 transition-all flex items-center gap-2 shadow-lg shadow-teal-500/20"
                      >
                        <Smartphone size={14}/> SMS
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => openModal('communications', { relatedToType: entityType, relatedToId: id })}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    <Plus size={14}/> Log
                  </button>
                </div>
              </div>

              {/* Email History Section */}
              {(['leads', 'accounts', 'contacts'].includes(entityType)) && (commFilter === 'all' || commFilter === 'Email') && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Mail size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Email History</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {entityComms.filter(c => c.type === 'Email').length} emails sent/received
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowEmailComposer(true)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
                    >
                      <Send size={14}/> Send Email
                    </button>
                  </div>

                  <div className="space-y-3">
                    {entityComms.filter(c => c.type === 'Email').map(email => {
                      const isExpanded = expandedComms.has(email.id);
                      return (
                      <div
                        key={email.id}
                        className={`bg-gradient-to-br from-purple-50/50 to-pink-50/50 border border-purple-100 rounded-[30px] transition-all cursor-pointer ${isExpanded ? 'shadow-xl' : 'hover:shadow-lg'}`}
                        onClick={() => toggleCommExpand(email.id)}
                      >
                        {/* Header - Always visible */}
                        <div className="p-6 flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${
                              email.direction === 'Outbound'
                                ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                                : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                            }`}>
                              {email.direction === 'Outbound' ? (
                                <Send size={18} className="text-white" />
                              ) : (
                                <Mail size={18} className="text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-base font-black text-slate-900 truncate">{email.subject}</p>
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${
                                  email.direction === 'Outbound'
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                }`}>
                                  {email.direction}
                                </span>
                              </div>
                              {!isExpanded && (
                                <p className="text-xs text-slate-500 truncate mt-1">{email.content?.slice(0, 80)}...</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 ml-4 shrink-0">
                            <div className="text-right">
                              <p className="text-[10px] font-black text-slate-900">
                                {new Date(email.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400">
                                {new Date(email.createdAt).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'bg-purple-200' : 'bg-purple-100'}`}>
                              {isExpanded ? <ChevronUp size={16} className="text-purple-600" /> : <ChevronDown size={16} className="text-purple-600" />}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="px-6 pb-6 pt-0 border-t border-purple-100 animate-slide-up">
                            <div className="flex items-center gap-2 py-3 text-[10px] text-slate-500">
                              <span className="font-bold">To:</span> {email.metadata?.to || entity.email}
                              {email.metadata?.cc && <><span className="mx-2">•</span><span className="font-bold">CC:</span> {email.metadata?.cc}</>}
                              <span className="mx-2">•</span>
                              <span className="font-bold">From:</span> {users.find(u => u.id === email.createdBy)?.name || 'System'}
                            </div>
                            <div className="bg-white rounded-xl p-5 border border-purple-100">
                              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                                {email.content}
                              </p>
                            </div>
                            {(email.metadata?.attachments?.length ?? 0) > 0 && (
                              <div className="flex items-center gap-2 mt-4 p-3 bg-white/50 rounded-xl border border-purple-100">
                                <Paperclip size={14} className="text-slate-400" />
                                <p className="text-[10px] font-bold text-slate-500">
                                  {email.metadata?.attachments?.length} attachment(s)
                                </p>
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-4">
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowEmailComposer(true); }}
                                className="px-4 py-2 bg-purple-600 text-white rounded-xl text-[10px] font-bold hover:bg-purple-700 transition-all"
                              >
                                Reply
                              </button>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-all"
                              >
                                Forward
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                    })}
                    {entityComms.filter(c => c.type === 'Email').length === 0 && (
                      <div className="text-center py-12 bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-[30px] border-2 border-dashed border-purple-200">
                        <Mail size={48} className="mx-auto text-purple-300 mb-4" />
                        <p className="text-sm font-bold text-slate-600 mb-2">No emails yet</p>
                        <p className="text-xs text-slate-400 mb-4">Start the conversation by sending an email</p>
                        <button
                          onClick={() => setShowEmailComposer(true)}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:from-purple-700 hover:to-pink-700 transition-all inline-flex items-center gap-2"
                        >
                          <Send size={14}/> Send First Email
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Other Communications (Calls, SMS) - Show when filter is all, Call, or SMS */}
              {(commFilter === 'all' || commFilter === 'Call' || commFilter === 'SMS') && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                      commFilter === 'Call' ? 'bg-emerald-500' : commFilter === 'SMS' ? 'bg-blue-500' : 'bg-slate-600'
                    }`}>
                      {commFilter === 'SMS' ? <Smartphone size={20} className="text-white" /> : <Phone size={20} className="text-white" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        {commFilter === 'Call' ? 'Call History' : commFilter === 'SMS' ? 'SMS History' : 'Calls & SMS'}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {commFilter === 'all' ? 'Calls, SMS & other interactions' : `${commFilter} communications`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {entityComms.filter(c => {
                    if (c.type === 'Note' || c.type === 'Email') return false;
                    if (commFilter === 'all') return true;
                    return c.type === commFilter;
                  }).map(comm => {
                    const isExpanded = expandedComms.has(comm.id);
                    return (
                    <div
                      key={comm.id}
                      className={`bg-slate-50/50 border border-slate-100 rounded-[30px] transition-all cursor-pointer ${isExpanded ? 'shadow-xl bg-white' : 'hover:bg-white hover:shadow-lg'}`}
                      onClick={() => toggleCommExpand(comm.id)}
                    >
                      {/* Header - Always visible */}
                      <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm text-white shrink-0 ${
                            comm.type === 'Call'
                              ? 'bg-emerald-500'
                              : comm.type === 'SMS'
                              ? 'bg-blue-500'
                              : 'bg-slate-500'
                          }`}>
                            {comm.type === 'Call' ? <Phone size={20}/> : comm.type === 'SMS' ? <Smartphone size={20}/> : <MessageSquare size={20}/>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-slate-900">{comm.subject || comm.type}</p>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                comm.direction === 'Inbound'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {comm.direction}
                              </span>
                              {comm.outcome && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-100 text-slate-500">
                                  {comm.outcome.replace('-', ' ')}
                                </span>
                              )}
                            </div>
                            {!isExpanded && comm.content && (
                              <p className="text-xs text-slate-500 truncate mt-1">{comm.content.slice(0, 60)}...</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 ml-4 shrink-0">
                          <div className="text-right">
                            <p className="text-[10px] font-black text-slate-900">
                              {new Date(comm.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400">
                              {new Date(comm.createdAt).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'bg-slate-200' : 'bg-slate-100'}`}>
                            {isExpanded ? <ChevronUp size={16} className="text-slate-600" /> : <ChevronDown size={16} className="text-slate-600" />}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="px-6 pb-6 pt-0 border-t border-slate-100 animate-slide-up">
                          <div className="flex items-center gap-4 py-3 text-[10px] text-slate-500">
                            <span><span className="font-bold">Type:</span> {comm.type}</span>
                            <span><span className="font-bold">Direction:</span> {comm.direction}</span>
                            {comm.outcome && <span><span className="font-bold">Outcome:</span> {comm.outcome.replace('-', ' ')}</span>}
                            {comm.duration && <span><span className="font-bold">Duration:</span> {comm.duration}</span>}
                            <span><span className="font-bold">By:</span> {users.find(u => u.id === comm.createdBy)?.name || comm.createdBy}</span>
                          </div>
                          {comm.content && (
                            <div className="bg-white rounded-xl p-5 border border-slate-100">
                              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                                {comm.content}
                              </p>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-4">
                            <button
                              onClick={(e) => { e.stopPropagation(); openModal('communications', { relatedToType: entityType, relatedToId: id }); }}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-bold hover:bg-emerald-700 transition-all"
                            >
                              Log Follow-up
                            </button>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-all"
                            >
                              Add Note
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                  })}
                  {entityComms.filter(c => {
                    if (c.type === 'Note' || c.type === 'Email') return false;
                    if (commFilter === 'all') return true;
                    return c.type === commFilter;
                  }).length === 0 && (
                    <div className="text-center py-12 bg-slate-50 rounded-[30px] border-2 border-dashed border-slate-200">
                      {commFilter === 'Call' ? <Phone size={48} className="mx-auto text-slate-300 mb-4" /> :
                       commFilter === 'SMS' ? <Smartphone size={48} className="mx-auto text-slate-300 mb-4" /> :
                       <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />}
                      <p className="text-sm font-bold text-slate-400">
                        {commFilter === 'Call' ? 'No calls logged yet' :
                         commFilter === 'SMS' ? 'No SMS messages yet' :
                         'No other communications logged'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              )}
            </div>
          )}

          {/* DETAILS TAB */}
          {activeTab === 'DETAILS' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Primary Details */}
                <div className="bg-slate-50/50 border border-slate-100 p-8 rounded-[35px]">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><Info size={14} className="text-blue-600"/> Primary Information</h4>
                  <div className="space-y-4">
                    {entity.name && <DetailRow label="Name" value={entity.name} />}
                    {entity.company && <DetailRow label="Company" value={entity.company} />}
                    {entity.email && <DetailRow label="Email" value={entity.email} icon={<Mail size={14} />} />}
                    {entity.phone && <DetailRow label="Phone" value={entity.phone} icon={<Phone size={14} />} />}
                    {entity.website && <DetailRow label="Website" value={entity.website} icon={<Globe size={14} />} />}
                    {entity.title && <DetailRow label="Title" value={entity.title} />}
                    {entity.industry && <DetailRow label="Industry" value={entity.industry} icon={<Building2 size={14} />} />}
                    {entity.tier && <DetailRow label="Tier" value={entity.tier} />}
                    {entity.employeeCount !== undefined && <DetailRow label="Employees" value={entity.employeeCount.toLocaleString()} />}
                  </div>
                </div>

                {/* Status & Metrics */}
                <div className="bg-slate-50/50 border border-slate-100 p-8 rounded-[35px]">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><Activity size={14} className="text-emerald-600"/> Status & Metrics</h4>
                  <div className="space-y-4">
                    {entity.status && <DetailRow label="Status" value={<span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(entity.status)}`}>{entity.status}</span>} />}
                    {entity.stage && <DetailRow label="Stage" value={<span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(entity.stage)}`}>{entity.stage}</span>} />}
                    {entity.source && <DetailRow label="Source" value={entity.source} />}
                    {entity.score !== undefined && <DetailRow label="Lead Score" value={`${entity.score}%`} />}
                    {entity.estimatedValue !== undefined && <DetailRow label="Est. Value" value={`$${entity.estimatedValue.toLocaleString()}`} />}
                    {entity.amount !== undefined && <DetailRow label="Deal Amount" value={`$${entity.amount.toLocaleString()}`} />}
                    {entity.probability !== undefined && <DetailRow label="Probability" value={`${(entity.probability * 100).toFixed(0)}%`} />}
                    {entity.expectedCloseDate && <DetailRow label="Expected Close" value={new Date(entity.expectedCloseDate).toLocaleDateString()} icon={<Calendar size={14} />} />}
                  </div>
                </div>
              </div>

              {/* Address & Dates - For Leads */}
              {entityType === 'leads' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Address Section */}
                  <div className="bg-slate-50/50 border border-slate-100 p-8 rounded-[35px]">
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><MapPin size={14} className="text-rose-600"/> Address</h4>
                    <div className="space-y-4">
                      {entity.address ? (
                        <>
                          {entity.address.street && <DetailRow label="Street" value={entity.address.street} />}
                          {entity.address.suburb && <DetailRow label="City/Suburb" value={entity.address.suburb} />}
                          {entity.address.state && <DetailRow label="State" value={entity.address.state} />}
                          {entity.address.postcode && <DetailRow label="Postcode" value={entity.address.postcode} />}
                          {entity.address.country && <DetailRow label="Country" value={entity.address.country} />}
                        </>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No address on file</p>
                      )}
                    </div>
                  </div>

                  {/* Dates & History Section */}
                  <div className="bg-slate-50/50 border border-slate-100 p-8 rounded-[35px]">
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><History size={14} className="text-amber-600"/> Timeline</h4>
                    <div className="space-y-4">
                      <DetailRow
                        label="Created"
                        value={entity.createdAt ? new Date(entity.createdAt).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                        icon={<Calendar size={14} />}
                      />
                      <DetailRow
                        label="Last Updated"
                        value={entity.updatedAt ? new Date(entity.updatedAt).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                        icon={<Clock size={14} />}
                      />
                      <DetailRow
                        label="Last Contact"
                        value={entity.lastContactDate ? (
                          <span className={`${
                            (Date.now() - new Date(entity.lastContactDate).getTime()) > 7 * 24 * 60 * 60 * 1000
                              ? 'text-amber-600'
                              : 'text-slate-900'
                          }`}>
                            {new Date(entity.lastContactDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                            <span className="text-xs text-slate-400 ml-2">
                              ({Math.ceil((Date.now() - new Date(entity.lastContactDate).getTime()) / (1000 * 60 * 60 * 24))} days ago)
                            </span>
                          </span>
                        ) : (
                          <span className="text-rose-500">Never contacted</span>
                        )}
                        icon={<Phone size={14} />}
                      />
                      {entity.notes && (
                        <div className="pt-4 mt-4 border-t border-slate-200">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notes</p>
                          <p className="text-sm text-slate-600 bg-white rounded-xl p-4 border border-slate-200">{entity.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Related Records */}
              {(relatedAccount || relatedContact || relatedCampaign) && (
                <div className="bg-slate-50/50 border border-slate-100 p-8 rounded-[35px]">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><Share2 size={14} className="text-violet-600"/> Related Records</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {relatedAccount && (
                      <Link to={`/accounts/${relatedAccount.id}`} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 hover:shadow-lg transition-all">
                        <img src={relatedAccount.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${relatedAccount.id}`} className="w-10 h-10 rounded-xl" alt="" />
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account</p>
                          <p className="text-sm font-black text-slate-900">{relatedAccount.name}</p>
                        </div>
                      </Link>
                    )}
                    {relatedContact && (
                      <Link to={`/contacts/${relatedContact.id}`} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 hover:shadow-lg transition-all">
                        <img src={relatedContact.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${relatedContact.id}`} className="w-10 h-10 rounded-xl" alt="" />
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</p>
                          <p className="text-sm font-black text-slate-900">{relatedContact.name}</p>
                        </div>
                      </Link>
                    )}
                    {relatedCampaign && (
                      <Link to={`/campaigns/${relatedCampaign.id}`} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 hover:shadow-lg transition-all">
                        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600"><Megaphone size={18} /></div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaign</p>
                          <p className="text-sm font-black text-slate-900">{relatedCampaign.name}</p>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* NEW ENTITIES DETAILS - Field Service */}
              {(entityType === 'jobs' || entityType === 'crews' || entityType === 'zones') && (
                <div className="bg-slate-50/50 border border-slate-100 p-8 rounded-[35px]">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><Info size={14} className="text-blue-600"/> Field Service Info</h4>
                  <div className="space-y-4">
                    {entityType === 'jobs' && (
                      <>
                        {entity.jobNumber && <DetailRow label="Job Number" value={entity.jobNumber} />}
                        {entity.subject && <DetailRow label="Subject" value={entity.subject} />}
                        {entity.accountId && <DetailRow label="Account" value={accounts.find(a => a.id === entity.accountId)?.name || 'N/A'} />}
                        {entity.crewId && <DetailRow label="Crew" value={crews.find(c => c.id === entity.crewId)?.name || 'N/A'} />}
                        {entity.zone && <DetailRow label="Zone" value={entity.zone} />}
                        {entity.scheduledDate && <DetailRow label="Scheduled" value={new Date(entity.scheduledDate).toLocaleString()} icon={<Calendar size={14} />} />}
                        {entity.estimatedDuration && <DetailRow label="Duration" value={`${entity.estimatedDuration} hours`} />}
                      </>
                    )}
                    {entityType === 'crews' && (
                      <>
                        {entity.name && <DetailRow label="Crew Name" value={entity.name} />}
                        {entity.leaderId && <DetailRow label="Leader" value={users.find(u => u.id === entity.leaderId)?.name || 'N/A'} />}
                        {entity.memberIds && <DetailRow label="Team Size" value={entity.memberIds.length} />}
                        {entity.color && <DetailRow label="Color" value={<div className={`w-6 h-6 rounded-lg`} style={{backgroundColor: entity.color}}></div>} />}
                      </>
                    )}
                    {entityType === 'zones' && (
                      <>
                        {entity.name && <DetailRow label="Zone Name" value={entity.name} />}
                        {entity.region && <DetailRow label="Region" value={entity.region} />}
                        {entity.description && <DetailRow label="Description" value={entity.description} />}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Logistics Details */}
              {(entityType === 'equipment' || entityType === 'inventoryItems' || entityType === 'purchaseOrders') && (
                <div className="bg-slate-50/50 border border-slate-100 p-8 rounded-[35px]">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><Package size={14} className="text-emerald-600"/> Logistics Info</h4>
                  <div className="space-y-4">
                    {entityType === 'equipment' && (
                      <>
                        {entity.name && <DetailRow label="Equipment Name" value={entity.name} />}
                        {entity.type && <DetailRow label="Type" value={entity.type} />}
                        {entity.barcode && <DetailRow label="Barcode" value={entity.barcode} />}
                        {entity.condition && <DetailRow label="Condition" value={<span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(entity.condition)}`}>{entity.condition}</span>} />}
                        {entity.location && <DetailRow label="Location" value={entity.location} />}
                        {entity.assignedTo && <DetailRow label="Assigned To" value={users.find(u => u.id === entity.assignedTo)?.name || 'N/A'} />}
                        {entity.purchasePrice && <DetailRow label="Purchase Price" value={`$${entity.purchasePrice.toLocaleString()}`} />}
                      </>
                    )}
                    {entityType === 'inventoryItems' && (
                      <>
                        {entity.name && <DetailRow label="Item Name" value={entity.name} />}
                        {entity.sku && <DetailRow label="SKU" value={entity.sku} />}
                        {entity.category && <DetailRow label="Category" value={entity.category} />}
                        {entity.warehouseQty !== undefined && <DetailRow label="Stock Quantity" value={entity.warehouseQty} />}
                        {entity.reorderPoint !== undefined && <DetailRow label="Reorder Point" value={entity.reorderPoint} />}
                        {entity.unitPrice && <DetailRow label="Unit Price" value={`$${entity.unitPrice.toFixed(2)}`} />}
                      </>
                    )}
                    {entityType === 'purchaseOrders' && (
                      <>
                        {entity.poNumber && <DetailRow label="PO Number" value={entity.poNumber} />}
                        {entity.supplierId && <DetailRow label="Supplier" value={accounts.find(a => a.id === entity.supplierId)?.name || 'N/A'} />}
                        {entity.accountId && <DetailRow label="Account" value={accounts.find(a => a.id === entity.accountId)?.name || 'N/A'} />}
                        {entity.status && <DetailRow label="Status" value={<span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(entity.status)}`}>{entity.status}</span>} />}
                        {entity.total && <DetailRow label="Total" value={`$${entity.total.toLocaleString()}`} />}
                        {entity.linkedJobId && <DetailRow label="Linked Job" value={jobs.find(j => j.id === entity.linkedJobId)?.subject || 'N/A'} />}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Financial Details */}
              {(entityType === 'bankTransactions' || entityType === 'expenses') && (
                <div className="bg-slate-50/50 border border-slate-100 p-8 rounded-[35px]">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><DollarSign size={14} className="text-emerald-600"/> Financial Info</h4>
                  <div className="space-y-4">
                    {entityType === 'bankTransactions' && (
                      <>
                        {entity.date && <DetailRow label="Date" value={new Date(entity.date).toLocaleDateString()} />}
                        {entity.description && <DetailRow label="Description" value={entity.description} />}
                        {entity.amount && <DetailRow label="Amount" value={`$${Math.abs(entity.amount).toLocaleString()}`} icon={entity.amount >= 0 ? <ArrowUpRight size={14} className="text-emerald-500"/> : <ArrowDownRight size={14} className="text-rose-500"/>} />}
                        {entity.status && <DetailRow label="Status" value={<span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(entity.status)}`}>{entity.status}</span>} />}
                        {entity.matchConfidence && <DetailRow label="Match Confidence" value={entity.matchConfidence.toUpperCase()} />}
                        {entity.matchedToId && <DetailRow label="Matched To" value={entity.matchedToId} />}
                      </>
                    )}
                    {entityType === 'expenses' && (
                      <>
                        {entity.vendor && <DetailRow label="Vendor" value={entity.vendor} />}
                        {entity.amount && <DetailRow label="Amount" value={`$${entity.amount.toLocaleString()}`} />}
                        {entity.category && <DetailRow label="Category" value={entity.category} />}
                        {entity.date && <DetailRow label="Date" value={new Date(entity.date).toLocaleDateString()} />}
                        {entity.status && <DetailRow label="Status" value={<span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(entity.status)}`}>{entity.status}</span>} />}
                        {entity.approvedBy && <DetailRow label="Approved By" value={users.find(u => u.id === entity.approvedBy)?.name || 'N/A'} />}
                        {entity.receiptUrl && <DetailRow label="Receipt" value={<a href={entity.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Receipt</a>} />}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Marketing Details */}
              {(entityType === 'reviews' || entityType === 'referralRewards' || entityType === 'inboundForms' || entityType === 'chatWidgets' || entityType === 'calculators') && (
                <div className="bg-slate-50/50 border border-slate-100 p-8 rounded-[35px]">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><Megaphone size={14} className="text-violet-600"/> Marketing Info</h4>
                  <div className="space-y-4">
                    {entityType === 'reviews' && (
                      <>
                        {entity.authorName && <DetailRow label="Author" value={entity.authorName} />}
                        {entity.rating !== undefined && <DetailRow label="Rating" value={`${entity.rating}/5 ⭐`} />}
                        {entity.platform && <DetailRow label="Platform" value={entity.platform} />}
                        {entity.sentiment && <DetailRow label="Sentiment" value={<span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${entity.sentiment === 'Positive' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : entity.sentiment === 'Negative' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{entity.sentiment}</span>} />}
                        {entity.status && <DetailRow label="Status" value={<span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(entity.status)}`}>{entity.status}</span>} />}
                        {entity.jobId && <DetailRow label="Related Job" value={jobs.find(j => j.id === entity.jobId)?.subject || 'N/A'} />}
                      </>
                    )}
                    {entityType === 'referralRewards' && (
                      <>
                        {entity.referrerId && <DetailRow label="Referrer" value={contacts.find(c => c.id === entity.referrerId)?.name || 'N/A'} />}
                        {entity.referredLeadId && <DetailRow label="Referred Lead" value={leads.find(l => l.id === entity.referredLeadId)?.name || 'N/A'} />}
                        {entity.amount && <DetailRow label="Reward Amount" value={`$${entity.amount.toLocaleString()}`} />}
                        {entity.status && <DetailRow label="Status" value={<span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(entity.status)}`}>{entity.status}</span>} />}
                        {entity.payoutDate && <DetailRow label="Payout Date" value={new Date(entity.payoutDate).toLocaleDateString()} />}
                      </>
                    )}
                    {entityType === 'inboundForms' && (
                      <>
                        {entity.name && <DetailRow label="Form Name" value={entity.name} />}
                        {entity.fields && <DetailRow label="Field Count" value={entity.fields.length} />}
                        {entity.submitButtonText && <DetailRow label="Submit Button" value={entity.submitButtonText} />}
                        {entity.submissionCount !== undefined && <DetailRow label="Submissions" value={entity.submissionCount} />}
                        {entity.targetCampaignId && <DetailRow label="Target Campaign" value={campaigns.find(c => c.id === entity.targetCampaignId)?.name || 'N/A'} />}
                      </>
                    )}
                    {entityType === 'chatWidgets' && (
                      <>
                        {entity.name && <DetailRow label="Widget Name" value={entity.name} />}
                        {entity.bubbleColor && <DetailRow label="Bubble Color" value={<div className="w-6 h-6 rounded-lg" style={{backgroundColor: entity.bubbleColor}}></div>} />}
                        {entity.welcomeMessage && <DetailRow label="Welcome Message" value={entity.welcomeMessage} />}
                        {entity.isActive !== undefined && <DetailRow label="Active" value={entity.isActive ? 'Yes' : 'No'} />}
                        {entity.routingUserId && <DetailRow label="Routing To" value={users.find(u => u.id === entity.routingUserId)?.name || 'N/A'} />}
                      </>
                    )}
                    {entityType === 'calculators' && (
                      <>
                        {entity.name && <DetailRow label="Calculator Name" value={entity.name} />}
                        {entity.type && <DetailRow label="Type" value={entity.type} />}
                        {entity.baseRate !== undefined && <DetailRow label="Base Rate" value={`${entity.baseRate}%`} />}
                        {entity.isActive !== undefined && <DetailRow label="Active" value={entity.isActive ? 'Yes' : 'No'} />}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Automation Details */}
              {(entityType === 'automationWorkflows' || entityType === 'webhooks') && (
                <div className="bg-slate-50/50 border border-slate-100 p-8 rounded-[35px]">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><Zap size={14} className="text-amber-600"/> Automation Info</h4>
                  <div className="space-y-4">
                    {entityType === 'automationWorkflows' && (
                      <>
                        {entity.name && <DetailRow label="Workflow Name" value={entity.name} />}
                        {entity.description && <DetailRow label="Description" value={entity.description} />}
                        {entity.category && <DetailRow label="Category" value={entity.category} />}
                        {entity.isActive !== undefined && <DetailRow label="Active" value={entity.isActive ? 'Yes' : 'No'} />}
                        {entity.executionCount !== undefined && <DetailRow label="Executions" value={entity.executionCount} />}
                        {entity.lastRunAt && <DetailRow label="Last Run" value={new Date(entity.lastRunAt).toLocaleString()} />}
                        {entity.nodes && <DetailRow label="Node Count" value={entity.nodes.length} />}
                      </>
                    )}
                    {entityType === 'webhooks' && (
                      <>
                        {entity.name && <DetailRow label="Webhook Name" value={entity.name} />}
                        {entity.url && <DetailRow label="URL" value={<a href={entity.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">{entity.url}</a>} />}
                        {entity.method && <DetailRow label="Method" value={entity.method} />}
                        {entity.triggerEvent && <DetailRow label="Trigger Event" value={entity.triggerEvent} />}
                        {entity.isActive !== undefined && <DetailRow label="Active" value={entity.isActive ? 'Yes' : 'No'} />}
                        {entity.successCount !== undefined && <DetailRow label="Success Count" value={entity.successCount} />}
                        {entity.failureCount !== undefined && <DetailRow label="Failure Count" value={entity.failureCount} />}
                        {entity.lastTriggeredAt && <DetailRow label="Last Triggered" value={new Date(entity.lastTriggeredAt).toLocaleString()} />}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Governance Details */}
              {entityType === 'industryTemplates' && (
                <div className="bg-slate-50/50 border border-slate-100 p-8 rounded-[35px]">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><Layers size={14} className="text-indigo-600"/> Template Info</h4>
                  <div className="space-y-4">
                    {entity.name && <DetailRow label="Template Name" value={entity.name} />}
                    {entity.targetEntity && <DetailRow label="Target Entity" value={entity.targetEntity} />}
                    {entity.industry && <DetailRow label="Industry" value={entity.industry} />}
                    {entity.isActive !== undefined && <DetailRow label="Active" value={entity.isActive ? 'Yes' : 'No'} />}
                    {entity.version !== undefined && <DetailRow label="Version" value={`v${entity.version}`} />}
                    {entity.sections && <DetailRow label="Sections" value={entity.sections.length} />}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="bg-slate-50/50 border border-slate-100 p-8 rounded-[35px]">
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><Clock size={14} className="text-amber-600"/> Record Timeline</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <DetailRow label="Created" value={new Date(entity.createdAt).toLocaleString()} />
                  <DetailRow label="Updated" value={new Date(entity.updatedAt).toLocaleString()} />
                  <DetailRow label="Created By" value={users.find(u => u.id === entity.createdBy)?.name || entity.createdBy} />
                </div>
              </div>
            </div>
          )}

          {/* TASKS TAB */}
          {activeTab === 'TASKS' && (
            <div className="space-y-6">
              <div className="flex justify-end mb-4">
                <button onClick={() => openModal('tasks', { relatedToType: entityType, relatedToId: id })} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"><Plus size={14}/> Add Task</button>
              </div>
              {entityTasks.map(task => (
                <div key={task.id} className={`bg-slate-50/50 border border-slate-100 p-6 rounded-[30px] flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all ${task.status === 'Completed' ? 'opacity-60' : ''}`}>
                   <div className="flex items-center gap-6">
                      <button onClick={() => toggleTask(task.id)} className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all ${task.status === 'Completed' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 hover:text-emerald-500'}`}>
                        <CheckCircle2 size={20}/>
                      </button>
                      <div>
                        <p className={`text-sm font-black ${task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{task.title}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{task.description}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                          Due: {new Date(task.dueDate).toLocaleDateString()} •
                          <span className={`ml-2 ${task.priority === 'High' ? 'text-rose-500' : task.priority === 'Medium' ? 'text-amber-500' : 'text-slate-400'}`}>{task.priority} Priority</span>
                        </p>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : task.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{task.status}</span>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{users.find(u => u.id === task.assigneeId)?.name || 'Unassigned'}</p>
                   </div>
                </div>
              ))}
              {entityTasks.length === 0 && <EmptyState icon={CheckCircle2} label="No tasks found for this record" />}
            </div>
          )}

          {/* NOTES TAB */}
          {activeTab === 'NOTES' && (
            <div className="space-y-6">
              {/* Add Note Form */}
              <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-[30px]">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note..."
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  rows={3}
                />
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => { if (noteText.trim()) { addNote(entityType, id!, noteText); setNoteText(''); } }}
                    disabled={!noteText.trim()}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={14}/> Add Note
                  </button>
                </div>
              </div>

              {/* Notes List */}
              {entityNotes.map(note => (
                <div key={note.id} className="bg-white border border-slate-200 p-6 rounded-[30px] shadow-sm">
                   <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 flex-shrink-0">
                        <FileText size={18}/>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.content}</p>
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(note.createdAt).toLocaleString()}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{users.find(u => u.id === note.createdBy)?.name || note.createdBy}</p>
                        </div>
                      </div>
                   </div>
                </div>
              ))}
              {entityNotes.length === 0 && <EmptyState icon={FileText} label="No notes yet. Add one above!" />}
            </div>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === 'DOCUMENTS' && (
            <div className="space-y-6">
              <div className="flex justify-end mb-4">
                <button onClick={() => openModal('documents', { relatedToType: entityType, relatedToId: id })} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"><Plus size={14}/> Add Document</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {entityDocs.map(doc => (
                  <div key={doc.id} className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm hover:shadow-lg transition-all group">
                     <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                          <Paperclip size={20}/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate">{doc.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{doc.fileType} • {doc.fileSize}</p>
                        </div>
                     </div>
                     <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex-1 bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"><Download size={12}/> Download</a>
                     </div>
                  </div>
                ))}
              </div>
              {entityDocs.length === 0 && <EmptyState icon={Paperclip} label="No documents attached" />}
            </div>
          )}

          {/* TICKETS TAB */}
          {activeTab === 'TICKETS' && (
            <div className="space-y-6">
              <div className="flex justify-end mb-4">
                <button onClick={() => openModal('tickets', { relatedToType: entityType, relatedToId: id, accountId: entityType === 'accounts' ? id : entity?.accountId, requesterId: entityType === 'contacts' ? id : undefined })} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"><Plus size={14}/> Create Ticket</button>
              </div>
              {entityTickets.map(ticket => (
                <Link to={`/tickets/${ticket.id}`} key={ticket.id} className="block bg-slate-50/50 border border-slate-100 p-6 rounded-[30px] hover:bg-white hover:shadow-xl transition-all">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${ticket.priority === 'Urgent' ? 'bg-rose-500 text-white' : ticket.priority === 'High' ? 'bg-amber-500 text-white' : 'bg-white text-slate-400'}`}>
                          <TicketIcon size={20}/>
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{ticket.subject}</p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ticket.description}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{ticket.priority} Priority • {ticket.messages?.length || 0} messages</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(ticket.status)}`}>{ticket.status}</span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                      </div>
                   </div>
                </Link>
              ))}
              {entityTickets.length === 0 && <EmptyState icon={TicketIcon} label="No support tickets found" />}
            </div>
          )}

          {/* ENTITY-SPECIFIC TABS */}
          {/* Jobs - JOB FIELDS */}
          {activeTab === 'JOB FIELDS' && entityType === 'jobs' && (
            <div className="space-y-4">
              <div className="flex justify-end mb-4">
                <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"><Plus size={14}/> Add Field</button>
              </div>
              {entity.jobFields && entity.jobFields.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {entity.jobFields.map((field: any) => (
                    <div key={field.id} className="bg-slate-50/50 border border-slate-100 p-6 rounded-[25px]">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{field.label}</p>
                        {field.required && <span className="text-[8px] font-black text-rose-500 uppercase">Required</span>}
                      </div>
                      <p className="text-sm font-bold text-slate-900">{field.amount || 'Not set'}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Type: {field.type}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Layers} label="No custom fields defined for this job" />
              )}
            </div>
          )}

          {/* Jobs - BOM (Bill of Materials) */}
          {activeTab === 'BOM' && entityType === 'jobs' && (
            <div className="space-y-4">
              <div className="flex justify-end mb-4">
                <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"><Plus size={14}/> Add Item</button>
              </div>
              {entity.bom && entity.bom.length > 0 ? (
                entity.bom.map((item: any) => {
                  const invItem = inventoryItems.find(i => i.id === item.inventoryItemId);
                  return (
                    <div key={item.inventoryItemId} className="bg-slate-50/50 border border-slate-100 p-6 rounded-[30px] flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600"><Package size={20}/></div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{invItem?.name || 'Unknown Item'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{invItem?.sku || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900">{item.qtyPicked}/{item.qtyRequired}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Picked/Required</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState icon={Package} label="No items in bill of materials" />
              )}
            </div>
          )}

          {/* Jobs - PHOTOS */}
          {activeTab === 'PHOTOS' && entityType === 'jobs' && (
            <div className="space-y-4">
              <div className="flex justify-end mb-4">
                <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"><Plus size={14}/> Upload Photo</button>
              </div>
              {entity.evidencePhotos && entity.evidencePhotos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {entity.evidencePhotos.map((photo: string, idx: number) => (
                    <div key={idx} className="aspect-square bg-slate-100 rounded-[25px] overflow-hidden shadow-sm hover:shadow-lg transition-all">
                      <img src={photo} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Camera} label="No photos uploaded yet" />
              )}
            </div>
          )}

          {/* Crews - MEMBERS */}
          {activeTab === 'MEMBERS' && entityType === 'crews' && (
            <div className="space-y-4">
              <div className="flex justify-end mb-4">
                <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"><Plus size={14}/> Add Member</button>
              </div>
              {/* Leader */}
              {entity.leaderId && (
                <div className="mb-6">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4">Team Leader</h4>
                  {(() => {
                    const leader = users.find(u => u.id === entity.leaderId);
                    return leader ? (
                      <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-[30px] flex items-center gap-4">
                        <img src={leader.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.id}`} className="w-12 h-12 rounded-xl" alt="" />
                        <div>
                          <p className="text-sm font-black text-slate-900">{leader.name}</p>
                          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{leader.role} • {leader.email}</p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
              {/* Members */}
              {entity.memberIds && entity.memberIds.length > 0 ? (
                <>
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4">Team Members</h4>
                  {entity.memberIds.map((memberId: string) => {
                    const member = users.find(u => u.id === memberId);
                    return member ? (
                      <div key={memberId} className="bg-slate-50/50 border border-slate-100 p-6 rounded-[30px] flex items-center gap-4">
                        <img src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`} className="w-12 h-12 rounded-xl" alt="" />
                        <div>
                          <p className="text-sm font-black text-slate-900">{member.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.role} • {member.email}</p>
                        </div>
                      </div>
                    ) : null;
                  })}
                </>
              ) : (
                <EmptyState icon={User} label="No team members assigned" />
              )}
            </div>
          )}

          {/* Crews - JOBS */}
          {activeTab === 'JOBS' && entityType === 'crews' && (
            <div className="space-y-4">
              {jobs.filter(j => j.crewId === id).map(job => (
                <Link to={`/jobs/${job.id}`} key={job.id} className="block bg-slate-50/50 border border-slate-100 p-6 rounded-[30px] hover:bg-white hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${job.status === 'InProgress' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400'}`}>
                        <Briefcase size={20}/>
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{job.subject}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{job.jobType} • {job.zone || 'No zone'}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(job.status)}`}>{job.status}</span>
                  </div>
                </Link>
              ))}
              {jobs.filter(j => j.crewId === id).length === 0 && <EmptyState icon={Briefcase} label="No jobs assigned to this crew" />}
            </div>
          )}

          {/* Purchase Orders - ITEMS */}
          {activeTab === 'ITEMS' && entityType === 'purchaseOrders' && (
            <div className="space-y-4">
              {entity.items && entity.items.length > 0 ? (
                entity.items.map((item: any, idx: number) => (
                  <div key={idx} className="bg-slate-50/50 border border-slate-100 p-6 rounded-[30px] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600"><Package size={20}/></div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{item.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SKU: {item.sku} • Qty: {item.qty}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900">${(item.qty * item.price).toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${item.price} each</p>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState icon={Package} label="No items in this purchase order" />
              )}
            </div>
          )}

          {/* Reviews - REPLY */}
          {activeTab === 'REPLY' && entityType === 'reviews' && (
            <div className="space-y-6">
              <div className="bg-slate-50/50 border border-slate-100 p-8 rounded-[35px]">
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6">Original Review</h4>
                <p className="text-sm text-slate-700 mb-4">{entity.content}</p>
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>{entity.authorName}</span>
                  <span>•</span>
                  <span>{entity.rating}/5 ⭐</span>
                  <span>•</span>
                  <span>{entity.platform}</span>
                </div>
              </div>
              {entity.replyContent ? (
                <div className="bg-blue-50/50 border border-blue-100 p-8 rounded-[35px]">
                  <h4 className="text-[11px] font-black text-blue-900 uppercase tracking-widest mb-6 flex items-center gap-2"><CheckCircle2 size={14}/> Your Reply</h4>
                  <p className="text-sm text-slate-700 mb-4">{entity.replyContent}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Replied on {entity.repliedAt ? new Date(entity.repliedAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 p-8 rounded-[35px]">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6">Post Reply</h4>
                  <textarea
                    placeholder="Write your response..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[120px]"
                  />
                  <div className="flex justify-end mt-4">
                    <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"><Send size={14}/> Post Reply</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Referral Rewards - TRACKING */}
          {activeTab === 'TRACKING' && entityType === 'referralRewards' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Referrer Card */}
                {entity.referrerId && (() => {
                  const referrer = contacts.find(c => c.id === entity.referrerId);
                  return referrer ? (
                    <div className="bg-emerald-50/50 border border-emerald-100 p-8 rounded-[35px]">
                      <h4 className="text-[11px] font-black text-emerald-900 uppercase tracking-widest mb-6">Referrer</h4>
                      <div className="flex items-center gap-4">
                        <img src={referrer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${referrer.id}`} className="w-14 h-14 rounded-2xl" alt="" />
                        <div>
                          <p className="text-lg font-black text-slate-900">{referrer.name}</p>
                          <p className="text-xs text-slate-500">{referrer.email}</p>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}
                {/* Referred Lead Card */}
                {entity.referredLeadId && (() => {
                  const lead = leads.find(l => l.id === entity.referredLeadId);
                  return lead ? (
                    <div className="bg-blue-50/50 border border-blue-100 p-8 rounded-[35px]">
                      <h4 className="text-[11px] font-black text-blue-900 uppercase tracking-widest mb-6">Referred Lead</h4>
                      <div className="flex items-center gap-4">
                        <img src={lead.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.id}`} className="w-14 h-14 rounded-2xl" alt="" />
                        <div>
                          <p className="text-lg font-black text-slate-900">{lead.name}</p>
                          <p className="text-xs text-slate-500">{lead.company} • {lead.status}</p>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
              {/* Reward Status */}
              <div className="bg-white border border-slate-200 p-8 rounded-[35px]">
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6">Reward Status</h4>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amount</p>
                    <p className="text-2xl font-black text-emerald-600">${entity.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(entity.status)}`}>{entity.status}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payout Date</p>
                    <p className="text-sm font-bold text-slate-900">{entity.payoutDate ? new Date(entity.payoutDate).toLocaleDateString() : 'Pending'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inbound Forms - FIELDS */}
          {activeTab === 'FIELDS' && entityType === 'inboundForms' && (
            <div className="space-y-4">
              <div className="flex justify-end mb-4">
                <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"><Plus size={14}/> Add Field</button>
              </div>
              {entity.fields && entity.fields.length > 0 ? (
                entity.fields.map((field: any) => (
                  <div key={field.id} className="bg-slate-50/50 border border-slate-100 p-6 rounded-[30px] flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600"><Layers size={20}/></div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{field.label}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type: {field.type} {field.required && ' • REQUIRED'}</p>
                      </div>
                    </div>
                    {field.options && field.options.length > 0 && (
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{field.options.length} options</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <EmptyState icon={Layers} label="No fields defined for this form" />
              )}
            </div>
          )}

          {/* Inbound Forms - SUBMISSIONS */}
          {activeTab === 'SUBMISSIONS' && entityType === 'inboundForms' && (
            <div className="space-y-4">
              <div className="bg-blue-50/50 border border-blue-100 p-8 rounded-[35px] text-center">
                <p className="text-5xl font-black text-blue-600 mb-2">{entity.submissionCount}</p>
                <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Total Submissions</p>
              </div>
              <EmptyState icon={Send} label="Submission list feature coming soon" />
            </div>
          )}

          {/* Automation Workflows - WORKFLOW */}
          {activeTab === 'WORKFLOW' && entityType === 'automationWorkflows' && (
            <div className="space-y-6">
              {/* Trigger */}
              <div className="bg-violet-50/50 border border-violet-100 p-8 rounded-[35px]">
                <h4 className="text-[11px] font-black text-violet-900 uppercase tracking-widest mb-6 flex items-center gap-2"><Zap size={14}/> Trigger</h4>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-violet-600"><Activity size={20}/></div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{entity.trigger?.type || 'Not configured'}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entity: {entity.trigger?.entity || 'N/A'}</p>
                  </div>
                </div>
              </div>
              {/* Nodes */}
              <div>
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4">Workflow Nodes ({entity.nodes?.length || 0})</h4>
                {entity.nodes && entity.nodes.length > 0 ? (
                  entity.nodes.map((node: any, idx: number) => (
                    <div key={node.id} className="mb-4">
                      <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-[30px] flex items-center gap-6">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600 font-black text-sm">{idx + 1}</div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{node.type} Node</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{node.actionType || 'No action'}</p>
                        </div>
                      </div>
                      {idx < entity.nodes.length - 1 && (
                        <div className="w-0.5 h-6 bg-slate-200 ml-5"></div>
                      )}
                    </div>
                  ))
                ) : (
                  <EmptyState icon={Layers} label="No nodes configured" />
                )}
              </div>
            </div>
          )}

          {/* Automation Workflows - EXECUTION */}
          {activeTab === 'EXECUTION' && entityType === 'automationWorkflows' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50/50 border border-blue-100 p-8 rounded-[35px] text-center">
                  <p className="text-4xl font-black text-blue-600 mb-2">{entity.executionCount}</p>
                  <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Total Executions</p>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 p-8 rounded-[35px] text-center">
                  <p className="text-4xl font-black text-emerald-600 mb-2">{entity.isActive ? 'ON' : 'OFF'}</p>
                  <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Workflow Status</p>
                </div>
                <div className="bg-violet-50/50 border border-violet-100 p-8 rounded-[35px] text-center">
                  <p className="text-sm font-black text-violet-600 mb-2">{entity.lastRunAt ? new Date(entity.lastRunAt).toLocaleString() : 'Never'}</p>
                  <p className="text-[10px] font-black text-violet-900 uppercase tracking-widest">Last Execution</p>
                </div>
              </div>
              <EmptyState icon={Activity} label="Execution history coming soon" />
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'HISTORY' && (
            <div className="space-y-4">
              {entityLogs.map((log, index) => (
                <div key={log.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                      <History size={16}/>
                    </div>
                    {index < entityLogs.length - 1 && <div className="w-0.5 h-full bg-slate-100 mt-2"></div>}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                      <p className="text-sm font-bold text-slate-900">{log.action}</p>
                      {log.newValue && <p className="text-xs text-slate-500 mt-1">New value: {log.newValue}</p>}
                      {log.previousValue && <p className="text-xs text-slate-400 mt-1">Previous: {log.previousValue}</p>}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(log.createdAt).toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{users.find(u => u.id === log.createdBy)?.name || log.createdBy}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {entityLogs.length === 0 && <EmptyState icon={History} label="No history records found" />}
            </div>
          )}

          {/* ATTRIBUTED LEADS TAB (Campaigns) */}
          {activeTab === 'ATTRIBUTED LEADS' && entityType === 'campaigns' && (
            <div className="space-y-4">
              {leads.filter(l => l.campaignId === id).map(lead => (
                <Link to={`/leads/${lead.id}`} key={lead.id} className="block bg-slate-50/50 border border-slate-100 p-6 rounded-[30px] hover:bg-white hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={lead.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.id}`} className="w-12 h-12 rounded-xl" alt="" />
                      <div>
                        <p className="text-sm font-black text-slate-900">{lead.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lead.company} • ${lead.estimatedValue.toLocaleString()}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(lead.status)}`}>{lead.status}</span>
                  </div>
                </Link>
              ))}
              {leads.filter(l => l.campaignId === id).length === 0 && <EmptyState icon={Target} label="No leads attributed to this campaign" />}
            </div>
          )}

          {/* ATTRIBUTED DEALS TAB (Campaigns) */}
          {activeTab === 'ATTRIBUTED DEALS' && entityType === 'campaigns' && (
            <div className="space-y-4">
              {deals.filter(d => d.campaignId === id).map(deal => (
                <Link to={`/deals/${deal.id}`} key={deal.id} className="block bg-slate-50/50 border border-slate-100 p-6 rounded-[30px] hover:bg-white hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><DollarSign size={20}/></div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{deal.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${deal.amount.toLocaleString()} • {deal.stage}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(deal.stage)}`}>{deal.stage}</span>
                  </div>
                </Link>
              ))}
              {deals.filter(d => d.campaignId === id).length === 0 && <EmptyState icon={Briefcase} label="No deals attributed to this campaign" />}
            </div>
          )}
        </div>
      </div>

      {/* Email Composer Modal */}
      {(['leads', 'accounts', 'contacts'].includes(entityType)) && (
        <EmailComposer
          isOpen={showEmailComposer}
          onClose={() => setShowEmailComposer(false)}
          recipientType={entityType}
          recipientId={entity.id}
          recipientName={entity.name || entity.company}
          recipientEmail={entity.email}
        />
      )}

      {/* SMS Composer Modal */}
      {(['leads', 'accounts', 'contacts'].includes(entityType)) && (
        <SMSComposer
          isOpen={showSMSComposer}
          onClose={() => setShowSMSComposer(false)}
          recipientType={entityType}
          recipientId={entity.id}
          recipientName={entity.name || entity.company}
          recipientPhone={entity.phone}
        />
      )}

      {/* Bill Account Modal */}
      {entityType === 'accounts' && (
        <BillAccountModal
          isOpen={showBillAccountModal}
          onClose={() => setShowBillAccountModal(false)}
          accountId={entity.id}
          accountName={entity.name || entity.company}
        />
      )}

      {/* Generate Quote Modal */}
      {entityType === 'deals' && (
        <GenerateQuoteModal
          isOpen={showGenerateQuoteModal}
          onClose={() => setShowGenerateQuoteModal(false)}
          accountId={entity.accountId}
          accountName={accounts.find(a => a.id === entity.accountId)?.name || 'Account'}
          dealId={entity.id}
        />
      )}
    </div>
  );
};

const DetailRow = ({ label, value, icon }: { label: string; value: any; icon?: React.ReactNode }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">{icon}{label}</span>
    <span className="text-sm font-bold text-slate-900">{value}</span>
  </div>
);

const StatItem = ({ label, value, icon: Icon, color, bg }: any) => (
  <div className={`${bg} border border-transparent p-10 rounded-[45px] shadow-sm hover:scale-[1.02] transition-all flex flex-col`}>
    <div className={`w-10 h-10 ${color} bg-white rounded-xl shadow-sm flex items-center justify-center mb-6`}><Icon size={20} /></div>
    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">{label}</p>
    <p className="text-3xl font-black text-slate-900 tracking-tight leading-none">{value}</p>
  </div>
);

const EmptyState = ({ icon: Icon, label }: any) => (
  <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-100 rounded-[40px] opacity-40">
    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4"><Icon size={32} /></div>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
  </div>
);

export default EntityDetail;
