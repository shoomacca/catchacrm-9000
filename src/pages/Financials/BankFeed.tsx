import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Building2, ArrowDownLeft, ArrowUpRight, Check, X, Link2, Unlink,
  Filter, Search, AlertCircle, CheckCircle2, Clock, Eye, ChevronDown,
  ChevronUp, RefreshCcw, FileText, Receipt, HelpCircle
} from 'lucide-react';
import { BankTransaction } from '../../types';

type FilterStatus = 'all' | 'unmatched' | 'matched' | 'ignored';

const BankFeed: React.FC = () => {
  const {
    bankTransactions,
    invoices,
    expenses,
    accounts,
    reconcileTransaction,
    getReconciliationSuggestions,
    settings
  } = useCRM();

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<{ id: string; type: 'invoices' | 'expenses' } | null>(null);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...bankTransactions];

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(q) ||
        t.bankReference?.toLowerCase().includes(q) ||
        t.amount.toString().includes(q)
      );
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [bankTransactions, filterStatus, searchQuery]);

  // Summary stats
  const stats = useMemo(() => {
    const unmatched = bankTransactions.filter(t => t.status === 'unmatched');
    const matched = bankTransactions.filter(t => t.status === 'matched');
    const ignored = bankTransactions.filter(t => t.status === 'ignored');

    const totalInflows = bankTransactions
      .filter(t => t.type === 'Credit')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalOutflows = bankTransactions
      .filter(t => t.type === 'Debit')
      .reduce((sum, t) => sum + t.amount, 0);

    const unmatchedAmount = unmatched.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      total: bankTransactions.length,
      unmatched: unmatched.length,
      matched: matched.length,
      ignored: ignored.length,
      totalInflows,
      totalOutflows,
      netFlow: totalInflows - totalOutflows,
      unmatchedAmount
    };
  }, [bankTransactions]);

  const handleMatch = (transactionId: string, matchId: string, matchType: 'invoices' | 'expenses') => {
    reconcileTransaction(transactionId, 'match', {
      matchedToId: matchId,
      matchedToType: matchType
    });
    setExpandedTransactionId(null);
    setSelectedMatch(null);
  };

  const handleIgnore = (transactionId: string) => {
    reconcileTransaction(transactionId, 'ignore');
    setExpandedTransactionId(null);
  };

  const handleUnmatch = (transactionId: string) => {
    reconcileTransaction(transactionId, 'unmatch');
  };

  const getMatchedItemDescription = (transaction: BankTransaction): string => {
    if (!transaction.matchedToId || !transaction.matchedToType) return 'Unknown';

    if (transaction.matchedToType === 'invoices') {
      const invoice = invoices.find(i => i.id === transaction.matchedToId);
      if (invoice) {
        const account = accounts.find(a => a.id === invoice.accountId);
        return `${invoice.invoiceNumber} - ${account?.name || 'Unknown'}`;
      }
    }

    if (transaction.matchedToType === 'expenses') {
      const expense = expenses.find(e => e.id === transaction.matchedToId);
      if (expense) {
        return `${expense.vendor} - ${expense.category}`;
      }
    }

    return transaction.matchedToId;
  };

  const StatusBadge = ({ status }: { status: BankTransaction['status'] }) => {
    const configs = {
      unmatched: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: Clock, label: 'Unmatched' },
      matched: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', icon: CheckCircle2, label: 'Matched' },
      ignored: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', icon: X, label: 'Ignored' }
    };
    const config = configs[status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${config.bg} ${config.text} ${config.border}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const ConfidenceBadge = ({ confidence }: { confidence: BankTransaction['matchConfidence'] }) => {
    if (confidence === 'none') return null;
    const configs = {
      green: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'High Match' },
      amber: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Possible Match' }
    };
    const config = configs[confidence];
    return (
      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Management</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Bank Feed</h1>
        </div>
        <button className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
          <RefreshCcw size={14} /> Sync Bank
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Clock size={20} className="text-amber-600" />
            <h3 className="text-sm font-black text-slate-700">Unreconciled</h3>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.unmatched}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {settings.localization.currencySymbol}{stats.unmatchedAmount.toLocaleString()} pending
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <ArrowDownLeft size={20} className="text-emerald-600" />
            <h3 className="text-sm font-black text-slate-700">Cash Inflows</h3>
          </div>
          <p className="text-3xl font-black text-emerald-600">+{settings.localization.currencySymbol}{stats.totalInflows.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {bankTransactions.filter(t => t.type === 'Credit').length} transactions
          </p>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-red-50 border border-rose-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <ArrowUpRight size={20} className="text-rose-600" />
            <h3 className="text-sm font-black text-slate-700">Cash Outflows</h3>
          </div>
          <p className="text-3xl font-black text-rose-600">-{settings.localization.currencySymbol}{stats.totalOutflows.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {bankTransactions.filter(t => t.type === 'Debit').length} transactions
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <Building2 size={20} className="text-blue-600" />
            <h3 className="text-sm font-black text-slate-700">Net Cash Flow</h3>
          </div>
          <p className={`text-3xl font-black ${stats.netFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {stats.netFlow >= 0 ? '+' : '-'}{settings.localization.currencySymbol}{Math.abs(stats.netFlow).toLocaleString()}
          </p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {stats.total} total transactions
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 p-4 rounded-[25px] shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          {/* Status Filters */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'unmatched', 'matched', 'ignored'] as FilterStatus[]).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filterStatus === status
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'all' ? `All (${stats.total})` :
                 status === 'unmatched' ? `Unmatched (${stats.unmatched})` :
                 status === 'matched' ? `Matched (${stats.matched})` :
                 `Ignored (${stats.ignored})`}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white border border-slate-200 rounded-[25px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 border-b border-slate-100">
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Date</th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Description</th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Reference</th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px] text-right">Amount</th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Status</th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map(transaction => {
                const isExpanded = expandedTransactionId === transaction.id;
                const suggestions = transaction.status === 'unmatched' ? getReconciliationSuggestions(transaction.id) : [];

                return (
                  <React.Fragment key={transaction.id}>
                    <tr
                      className={`hover:bg-slate-50 transition-all cursor-pointer ${isExpanded ? 'bg-blue-50/30' : ''}`}
                      onClick={() => setExpandedTransactionId(isExpanded ? null : transaction.id)}
                    >
                      <td className="px-8 py-5">
                        <span className="font-bold text-slate-900 text-sm">
                          {new Date(transaction.date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transaction.type === 'Credit' ? 'bg-emerald-100' : 'bg-rose-100'
                          }`}>
                            {transaction.type === 'Credit'
                              ? <ArrowDownLeft size={14} className="text-emerald-600" />
                              : <ArrowUpRight size={14} className="text-rose-600" />
                            }
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{transaction.description}</p>
                            {transaction.status === 'matched' && (
                              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                                Matched to: {getMatchedItemDescription(transaction)}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs font-mono text-slate-500">{transaction.bankReference || '-'}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className={`font-black text-lg ${
                          transaction.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {transaction.type === 'Credit' ? '+' : '-'}
                          {settings.localization.currencySymbol}{transaction.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={transaction.status} />
                          <ConfidenceBadge confidence={transaction.matchConfidence} />
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          {transaction.status === 'matched' ? (
                            <button
                              onClick={e => { e.stopPropagation(); handleUnmatch(transaction.id); }}
                              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
                              title="Unmatch"
                            >
                              <Unlink size={14} />
                            </button>
                          ) : transaction.status === 'unmatched' ? (
                            <>
                              <button
                                onClick={e => { e.stopPropagation(); setExpandedTransactionId(transaction.id); }}
                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                                title="Match"
                              >
                                <Link2 size={14} />
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); handleIgnore(transaction.id); }}
                                className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
                                title="Ignore"
                              >
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={e => { e.stopPropagation(); handleUnmatch(transaction.id); }}
                              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
                              title="Restore"
                            >
                              <RefreshCcw size={14} />
                            </button>
                          )}
                          <ChevronDown
                            size={16}
                            className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row - Reconciliation Panel */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="px-8 py-0">
                          <div className="py-6 border-b border-slate-200">
                            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-[25px] p-6 border border-slate-200">
                              {transaction.status === 'unmatched' ? (
                                <>
                                  <h4 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                                    <Link2 size={16} className="text-blue-600" />
                                    Match to {transaction.type === 'Credit' ? 'Invoice' : 'Expense'}
                                  </h4>

                                  {suggestions.length > 0 ? (
                                    <div className="space-y-3 mb-4">
                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        Suggested Matches
                                      </p>
                                      {suggestions.map(suggestion => (
                                        <div
                                          key={suggestion.id}
                                          onClick={() => setSelectedMatch({ id: suggestion.id, type: suggestion.type })}
                                          className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                                            selectedMatch?.id === suggestion.id
                                              ? 'bg-blue-50 border-blue-300'
                                              : 'bg-white border-slate-200 hover:border-blue-200'
                                          }`}
                                        >
                                          <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                              suggestion.type === 'invoices' ? 'bg-blue-100' : 'bg-amber-100'
                                            }`}>
                                              {suggestion.type === 'invoices'
                                                ? <FileText size={18} className="text-blue-600" />
                                                : <Receipt size={18} className="text-amber-600" />
                                              }
                                            </div>
                                            <div>
                                              <p className="font-bold text-slate-900 text-sm">{suggestion.description}</p>
                                              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                                                {suggestion.type === 'invoices' ? 'Invoice' : 'Expense'}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <p className="font-black text-slate-900">
                                              {settings.localization.currencySymbol}{suggestion.amount.toLocaleString()}
                                            </p>
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                              suggestion.confidence === 'green'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-amber-100 text-amber-700'
                                            }`}>
                                              {suggestion.confidence === 'green' ? 'Exact Match' : 'Close Match'}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-3 p-4 bg-slate-100 rounded-xl mb-4">
                                      <HelpCircle size={18} className="text-slate-400" />
                                      <p className="text-sm text-slate-600">
                                        No automatic matches found. You can manually select a record below.
                                      </p>
                                    </div>
                                  )}

                                  <div className="flex gap-3">
                                    <button
                                      onClick={() => selectedMatch && handleMatch(transaction.id, selectedMatch.id, selectedMatch.type)}
                                      disabled={!selectedMatch}
                                      className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        selectedMatch
                                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                      }`}
                                    >
                                      <Check size={14} /> Confirm Match
                                    </button>
                                    <button
                                      onClick={() => handleIgnore(transaction.id)}
                                      className="px-5 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    >
                                      Ignore Transaction
                                    </button>
                                  </div>
                                </>
                              ) : transaction.status === 'matched' ? (
                                <div>
                                  <h4 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-600" />
                                    Transaction Matched
                                  </h4>
                                  <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Matched To</p>
                                        <p className="font-bold text-slate-900">{getMatchedItemDescription(transaction)}</p>
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Reconciled</p>
                                        <p className="font-bold text-slate-900">
                                          {transaction.reconciledAt ? new Date(transaction.reconciledAt).toLocaleDateString() : '-'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleUnmatch(transaction.id)}
                                    className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                  >
                                    <Unlink size={14} /> Unmatch Transaction
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <h4 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                                    <X size={16} className="text-slate-500" />
                                    Transaction Ignored
                                  </h4>
                                  <p className="text-sm text-slate-600 mb-4">
                                    This transaction has been marked as ignored and will not appear in reconciliation reports.
                                  </p>
                                  <button
                                    onClick={() => handleUnmatch(transaction.id)}
                                    className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                  >
                                    <RefreshCcw size={14} /> Restore Transaction
                                  </button>
                                </div>
                              )}

                              {/* Transaction Details */}
                              {transaction.notes && (
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Notes</p>
                                  <p className="text-sm text-slate-600">{transaction.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Building2 size={48} className="text-slate-200" />
                      <p className="text-slate-400 font-black uppercase text-xs">No transactions found</p>
                      <p className="text-slate-300 text-sm">Try adjusting your filters or search query</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reconciliation Alert */}
      {stats.unmatched > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-6 rounded-[35px] flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <AlertCircle size={24} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 mb-1">Reconciliation Required</h3>
            <p className="text-sm text-slate-600">
              You have {stats.unmatched} unmatched transaction{stats.unmatched !== 1 ? 's' : ''} totaling{' '}
              <span className="font-bold">{settings.localization.currencySymbol}{stats.unmatchedAmount.toLocaleString()}</span>.
              Match these to invoices or expenses to keep your books balanced.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankFeed;
