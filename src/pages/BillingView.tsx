
import React, { useState, useMemo } from 'react';
import { useCRM } from '../context/CRMContext';
import { Plus, DollarSign, Download, Search, Filter, ChevronRight, FileText, LayoutGrid, List, Building2, Calendar, Clock, AlertCircle, CheckCircle, Send, X, Eye, CreditCard, Edit3, CheckSquare, Square, Minus, ArrowRight, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BillAccountModal } from '../components/BillAccountModal';

type ViewMode = 'cards' | 'list';
type StatusFilter = 'all' | 'Paid' | 'Sent' | 'Overdue' | 'Draft';

const BillingView: React.FC = () => {
  const { invoices, accounts, openModal, searchQuery, setSearchQuery, salesStats, upsertRecord } = useCRM();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedDrafts, setSelectedDrafts] = useState<Set<string>>(new Set());
  const [showCreditModal, setShowCreditModal] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState<string>('');
  const [creditReason, setCreditReason] = useState<string>('');
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [accountSearchTerm, setAccountSearchTerm] = useState('');
  const [selectedAccountForInvoice, setSelectedAccountForInvoice] = useState<{id: string; name: string} | null>(null);

  // Filter accounts for the picker
  const filteredAccounts = useMemo(() => {
    if (!accountSearchTerm) return accounts;
    const term = accountSearchTerm.toLowerCase();
    return accounts.filter(a =>
      a.name?.toLowerCase().includes(term) ||
      a.email?.toLowerCase().includes(term)
    );
  }, [accounts, accountSearchTerm]);

  // Stats calculation
  const stats = useMemo(() => {
    const paidAmount = invoices.filter(i => i.status === 'Paid').reduce((a, b) => a + b.total, 0);
    const pendingAmount = invoices.filter(i => i.status === 'Sent').reduce((a, b) => a + b.total, 0);
    const overdueAmount = invoices.filter(i => i.status === 'Overdue').reduce((a, b) => a + b.total, 0);
    const overdueCount = invoices.filter(i => i.status === 'Overdue').length;
    const paidCount = invoices.filter(i => i.status === 'Paid').length;
    const sentCount = invoices.filter(i => i.status === 'Sent').length;
    const draftCount = invoices.filter(i => i.status === 'Draft').length;
    return { paidAmount, pendingAmount, overdueAmount, overdueCount, paidCount, sentCount, draftCount };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    let filtered = [...invoices];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(query) ||
        accounts.find(a => a.id === inv.accountId)?.name.toLowerCase().includes(query)
      );
    }

    // Sort by due date (most recent first)
    return filtered.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [invoices, statusFilter, searchQuery, accounts]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Overdue': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Draft': return 'bg-slate-50 text-slate-500 border-slate-100';
      case 'Sent': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid': return CheckCircle;
      case 'Overdue': return AlertCircle;
      case 'Draft': return FileText;
      case 'Sent': return Send;
      default: return FileText;
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'Paid') return false;
    return new Date(dueDate) < new Date();
  };

  const getDaysOverdue = (dueDate: string) => {
    const days = Math.floor((new Date().getTime() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  // Draft invoices for batch processing
  const draftInvoices = useMemo(() => invoices.filter(i => i.status === 'Draft'), [invoices]);

  // Toggle draft selection
  const toggleDraftSelection = (invoiceId: string) => {
    setSelectedDrafts(prev => {
      const next = new Set(prev);
      if (next.has(invoiceId)) {
        next.delete(invoiceId);
      } else {
        next.add(invoiceId);
      }
      return next;
    });
  };

  // Select all drafts
  const selectAllDrafts = () => {
    if (selectedDrafts.size === draftInvoices.length) {
      setSelectedDrafts(new Set());
    } else {
      setSelectedDrafts(new Set(draftInvoices.map(i => i.id)));
    }
  };

  // Send selected drafts
  const sendSelectedDrafts = () => {
    if (selectedDrafts.size === 0) return;
    if (!window.confirm(`Send ${selectedDrafts.size} invoice(s) to customers? They will be marked as Sent.`)) return;

    selectedDrafts.forEach(invoiceId => {
      const invoice = invoices.find(i => i.id === invoiceId);
      if (invoice) {
        upsertRecord('invoices', { ...invoice, status: 'Sent', sentAt: new Date().toISOString() });
      }
    });
    setSelectedDrafts(new Set());
  };

  // Apply credit to invoice
  const applyCredit = () => {
    if (!showCreditModal || !creditAmount) return;
    const invoice = invoices.find(i => i.id === showCreditModal);
    if (!invoice) return;

    const credit = parseFloat(creditAmount);
    if (isNaN(credit) || credit <= 0) return;

    const newTotal = Math.max(0, invoice.total - credit);
    const creditNote = {
      amount: credit,
      reason: creditReason || 'Credit applied',
      appliedAt: new Date().toISOString()
    };

    upsertRecord('invoices', {
      ...invoice,
      total: newTotal,
      credits: [...(invoice.credits || []), creditNote]
    });

    setShowCreditModal(null);
    setCreditAmount('');
    setCreditReason('');
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-slide-up pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Operations</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Billing & Invoices</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'cards' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={16} />
            </button>
          </div>
          <button onClick={() => setShowAccountPicker(true)} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
            <Plus size={16} /> New Invoice
          </button>
        </div>
      </div>

      {/* Stats Row - Clickable Filters */}
      <div className="grid grid-cols-5 gap-4">
        {/* Total - Clears Filters */}
        <button
          onClick={() => setStatusFilter('all')}
          className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg ${
            statusFilter === 'all' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-slate-900">{invoices.length}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Invoices</p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <FileText size={18} className="text-slate-500" />
            </div>
          </div>
        </button>

        {/* Paid */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'Paid' ? 'all' : 'Paid')}
          className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg ${
            statusFilter === 'Paid' ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-emerald-600">${stats.paidAmount.toLocaleString()}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{stats.paidCount} Paid</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CheckCircle size={18} className="text-emerald-600" />
            </div>
          </div>
        </button>

        {/* Pending/Sent */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'Sent' ? 'all' : 'Sent')}
          className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg ${
            statusFilter === 'Sent' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-blue-600">${stats.pendingAmount.toLocaleString()}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{stats.sentCount} Pending</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Send size={18} className="text-blue-600" />
            </div>
          </div>
        </button>

        {/* Overdue */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'Overdue' ? 'all' : 'Overdue')}
          className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg ${
            statusFilter === 'Overdue' ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-rose-600">${stats.overdueAmount.toLocaleString()}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{stats.overdueCount} Overdue</p>
            </div>
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
              <AlertCircle size={18} className="text-rose-600" />
            </div>
          </div>
        </button>

        {/* Draft */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'Draft' ? 'all' : 'Draft')}
          className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg ${
            statusFilter === 'Draft' ? 'border-slate-400 ring-2 ring-slate-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-slate-600">{stats.draftCount}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Drafts</p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <FileText size={18} className="text-slate-500" />
            </div>
          </div>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by invoice # or account..."
            className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.amount)}
          />
        </div>
        {(statusFilter !== 'all' || searchQuery) && (
          <button
            onClick={() => { setStatusFilter('all'); setSearchQuery(''); }}
            className="flex items-center gap-1.5 px-4 py-3 bg-slate-100 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-200 transition-all"
          >
            <X size={12} /> Clear Filters
          </button>
        )}
        <span className="text-xs font-bold text-slate-400">{filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Draft Invoices Management Panel - Shown when Draft filter is active */}
      {statusFilter === 'Draft' && draftInvoices.length > 0 && (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-[30px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <FileText size={22} className="text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Draft Invoice Management</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Audit, approve, and send invoices to customers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Select All */}
              <button
                onClick={selectAllDrafts}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-50 transition-all"
              >
                {selectedDrafts.size === draftInvoices.length ? <CheckSquare size={14}/> : <Square size={14}/>}
                {selectedDrafts.size === draftInvoices.length ? 'Deselect All' : 'Select All'}
              </button>

              {/* Send Selected */}
              <button
                onClick={sendSelectedDrafts}
                disabled={selectedDrafts.size === 0}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  selectedDrafts.size > 0
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send size={14}/>
                Send {selectedDrafts.size > 0 ? `(${selectedDrafts.size})` : 'Selected'}
              </button>
            </div>
          </div>

          {/* Draft Invoices List */}
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-4 font-black uppercase tracking-widest text-[8px] w-10"></th>
                  <th className="px-6 py-4 font-black uppercase tracking-widest text-[8px]">Invoice #</th>
                  <th className="px-6 py-4 font-black uppercase tracking-widest text-[8px]">Account</th>
                  <th className="px-6 py-4 font-black uppercase tracking-widest text-[8px]">Amount</th>
                  <th className="px-6 py-4 font-black uppercase tracking-widest text-[8px]">Due Date</th>
                  <th className="px-6 py-4 font-black uppercase tracking-widest text-[8px]">Credits</th>
                  <th className="px-6 py-4 font-black uppercase tracking-widest text-[8px] text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {draftInvoices.map(inv => {
                  const account = accounts.find(a => a.id === inv.accountId);
                  const isSelected = selectedDrafts.has(inv.id);
                  const totalCredits = (inv.credits || []).reduce((sum: number, c: any) => sum + c.amount, 0);

                  return (
                    <tr key={inv.id} className={`hover:bg-slate-50/50 transition-all ${isSelected ? 'bg-blue-50/30' : ''}`}>
                      {/* Checkbox */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleDraftSelection(inv.id)}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-slate-300 hover:border-blue-400'
                          }`}
                        >
                          {isSelected && <CheckSquare size={14}/>}
                        </button>
                      </td>

                      {/* Invoice Number */}
                      <td className="px-6 py-4">
                        <span className="font-black text-slate-900">{inv.invoiceNumber}</span>
                      </td>

                      {/* Account */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className="text-slate-400"/>
                          <span className="font-bold text-slate-600">{account?.name || 'Unknown'}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <span className="font-black text-slate-900">${inv.total.toLocaleString()}</span>
                      </td>

                      {/* Due Date */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-600">
                          {new Date(inv.dueDate).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Credits Applied */}
                      <td className="px-6 py-4">
                        {totalCredits > 0 ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-black">
                            <Minus size={10}/> ${totalCredits.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px] font-bold">None</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* View/Audit */}
                          <button
                            onClick={() => openModal('invoices', inv)}
                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
                            title="Audit/Edit Invoice"
                          >
                            <Eye size={14}/>
                          </button>

                          {/* Add Credit */}
                          <button
                            onClick={() => setShowCreditModal(inv.id)}
                            className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-all"
                            title="Add Credit"
                          >
                            <CreditCard size={14}/>
                          </button>

                          {/* Send Individual */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Send invoice ${inv.invoiceNumber} to ${account?.name || 'the customer'}?`)) {
                                upsertRecord('invoices', { ...inv, status: 'Sent', sentAt: new Date().toISOString() });
                              }
                            }}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                            title="Send Invoice"
                          >
                            <Send size={14}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Batch Summary */}
          {selectedDrafts.size > 0 && (
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <RefreshCw size={18} className="text-blue-600"/>
                <div>
                  <p className="text-sm font-black text-blue-900">
                    {selectedDrafts.size} invoice{selectedDrafts.size !== 1 ? 's' : ''} selected
                  </p>
                  <p className="text-[10px] font-bold text-blue-600">
                    Total: ${draftInvoices.filter(i => selectedDrafts.has(i.id)).reduce((sum, i) => sum + i.total, 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={sendSelectedDrafts}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20"
              >
                <Send size={14}/> Send All Selected <ArrowRight size={14}/>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Credit Modal */}
      {showCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[30px] p-8 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900">Apply Credit</h3>
              <button onClick={() => { setShowCreditModal(null); setCreditAmount(''); setCreditReason(''); }} className="p-2 text-slate-400 hover:text-rose-500">
                <X size={20}/>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Credit Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-lg font-bold focus:outline-none focus:border-blue-500"
                  placeholder="0.00"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.amount)}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Reason (Optional)</label>
                <input
                  type="text"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Service discount, loyalty credit..."
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.amount)}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => { setShowCreditModal(null); setCreditAmount(''); setCreditReason(''); }}
                  className="flex-1 px-6 py-3 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={applyCredit}
                  disabled={!creditAmount || parseFloat(creditAmount) <= 0}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg disabled:bg-slate-200 disabled:text-slate-400"
                >
                  Apply Credit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInvoices.map(inv => {
            const account = accounts.find(a => a.id === inv.accountId);
            const StatusIcon = getStatusIcon(inv.status);
            const overdue = isOverdue(inv.dueDate, inv.status);
            const daysOverdue = getDaysOverdue(inv.dueDate);

            return (
              <div
                key={inv.id}
                onClick={() => openModal('invoices', inv)}
                className={`bg-white border rounded-[24px] p-6 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden ${
                  inv.status === 'Overdue' ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                {/* Status Badge */}
                <div className="absolute top-5 right-5">
                  <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border ${getStatusColor(inv.status)}`}>
                    {inv.status}
                  </span>
                </div>

                {/* Invoice Header */}
                <div className="flex items-start gap-4 mb-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all ${
                    inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' :
                    inv.status === 'Overdue' ? 'bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white' :
                    inv.status === 'Sent' ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' :
                    'bg-slate-100 text-slate-500 group-hover:bg-slate-600 group-hover:text-white'
                  }`}>
                    <StatusIcon size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {inv.invoiceNumber}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Building2 size={10} />
                      <span className="truncate">{account?.name || 'Unknown Account'}</span>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="mb-5">
                  <p className="text-3xl font-black text-slate-900">${inv.total.toLocaleString()}</p>
                  {overdue && inv.status !== 'Paid' && (
                    <p className="text-[10px] font-bold text-rose-500 uppercase mt-1">
                      {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
                    </p>
                  )}
                </div>

                {/* Due Date & Details */}
                <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Calendar size={10} /> Due Date
                    </p>
                    <p className={`text-sm font-bold ${overdue && inv.status !== 'Paid' ? 'text-rose-600' : 'text-slate-700'}`}>
                      {new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1 justify-end">
                      <Clock size={10} /> Created
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {new Date(inv.invoiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredInvoices.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white border border-slate-200 rounded-[24px]">
              <FileText size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-sm font-black text-slate-400">No invoices found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or create a new invoice</p>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white border border-slate-200 rounded-[35px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 border-b border-slate-100">
                  <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Invoice #</th>
                  <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Account</th>
                  <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Amount</th>
                  <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Due Date</th>
                  <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Status</th>
                  <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => {
                  const account = accounts.find(a => a.id === inv.accountId);
                  const StatusIcon = getStatusIcon(inv.status);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-all cursor-pointer group" onClick={() => openModal('invoices', inv)}>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-all ${
                            inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' :
                            inv.status === 'Overdue' ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white' :
                            inv.status === 'Sent' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' :
                            'bg-slate-50 text-slate-400 group-hover:bg-slate-600 group-hover:text-white'
                          }`}>
                            <StatusIcon size={18} />
                          </div>
                          <span className="font-black text-slate-900">{inv.invoiceNumber}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className="text-slate-400" />
                          <span className="font-bold text-slate-700">{account?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-black text-slate-900">${inv.total.toLocaleString()}</td>
                      <td className={`px-8 py-5 text-sm font-bold ${
                        isOverdue(inv.dueDate, inv.status) ? 'text-rose-600' : 'text-slate-600'
                      }`}>
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${getStatusColor(inv.status)}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <ChevronRight size={18} className="text-slate-300 inline-block group-hover:text-blue-500 transition-colors" />
                      </td>
                    </tr>
                  );
                })}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold">
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Account Picker Modal */}
      {showAccountPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[30px] shadow-2xl animate-slide-up overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">Select Account</h3>
                <p className="text-xs text-slate-400 mt-1">Choose an account to bill</p>
              </div>
              <button onClick={() => { setShowAccountPicker(false); setAccountSearchTerm(''); }} className="p-2 text-slate-400 hover:text-rose-500">
                <X size={20}/>
              </button>
            </div>

            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                <input
                  type="text"
                  placeholder="Search accounts..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-blue-500"
                  value={accountSearchTerm}
                  onChange={(e) => setAccountSearchTerm(e.target.amount)}
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {filteredAccounts.length > 0 ? (
                <div className="p-2">
                  {filteredAccounts.map(account => (
                    <button
                      key={account.id}
                      onClick={() => {
                        setSelectedAccountForInvoice({ id: account.id, name: account.name });
                        setShowAccountPicker(false);
                        setAccountSearchTerm('');
                      }}
                      className="w-full p-4 text-left rounded-2xl hover:bg-blue-50 transition-all flex items-center gap-4 group"
                    >
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <Building2 size={20}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{account.name}</p>
                        <p className="text-xs text-slate-400 truncate">{account.email || account.industry || 'No email'}</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600"/>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Building2 size={40} className="mx-auto text-slate-200 mb-3"/>
                  <p className="text-sm text-slate-400 font-bold">No accounts found</p>
                  <p className="text-xs text-slate-400 mt-1">Try a different search term</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => {
                  setShowAccountPicker(false);
                  openModal('accounts');
                }}
                className="w-full py-3 text-blue-600 font-bold text-sm hover:bg-blue-50 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16}/> Create New Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bill Account Modal */}
      {selectedAccountForInvoice && (
        <BillAccountModal
          isOpen={true}
          onClose={() => setSelectedAccountForInvoice(null)}
          accountId={selectedAccountForInvoice.id}
          accountName={selectedAccountForInvoice.name}
        />
      )}
    </div>
  );
};

export default BillingView;
