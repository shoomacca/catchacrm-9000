import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Plus, Download, 
  ChevronRight, Share2, FileText, Users,
  Briefcase, Target, Building2, LayoutGrid, List as ListIcon,
  DollarSign, MoreHorizontal, Calendar, Megaphone
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { EntityType } from '../types';

const ListView: React.FC<{ module?: string }> = ({ module: propModule }) => {
  const { module: routeModule } = useParams<{ module: string }>();
  const module = (propModule || routeModule || 'leads') as EntityType;
  const navigate = useNavigate();
  const {
    leads, deals, accounts, contacts, campaigns,
    jobs, crews, zones, equipment, inventoryItems, purchaseOrders,
    bankTransactions, expenses, reviews, referralRewards, inboundForms,
    chatWidgets, calculators, automationWorkflows, webhooks, industryTemplates,
    searchQuery, setSearchQuery, openModal, settings, upsertRecord
  } = useCRM();
  
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>(module === 'deals' ? 'kanban' : 'list');

  const allData = useMemo(() => {
    switch (module) {
      case 'leads': return leads || [];
      case 'deals': return deals || [];
      case 'accounts': return accounts || [];
      case 'contacts': return contacts || [];
      case 'campaigns': return campaigns || [];
      case 'jobs': return jobs || [];
      case 'crews': return crews || [];
      case 'zones': return zones || [];
      case 'equipment': return equipment || [];
      case 'inventoryItems': return inventoryItems || [];
      case 'purchaseOrders': return purchaseOrders || [];
      case 'bankTransactions': return bankTransactions || [];
      case 'expenses': return expenses || [];
      case 'reviews': return reviews || [];
      case 'referralRewards': return referralRewards || [];
      case 'inboundForms': return inboundForms || [];
      case 'chatWidgets': return chatWidgets || [];
      case 'calculators': return calculators || [];
      case 'automationWorkflows': return automationWorkflows || [];
      case 'webhooks': return webhooks || [];
      case 'industryTemplates': return industryTemplates || [];
      default: return [];
    }
  }, [module, leads, deals, accounts, contacts, campaigns, jobs, crews, zones, equipment, inventoryItems, purchaseOrders, bankTransactions, expenses, reviews, referralRewards, inboundForms, chatWidgets, calculators, automationWorkflows, webhooks, industryTemplates]);

  const filteredData = allData.filter(item => 
    (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Qualified': case 'Active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Lost': case 'Paused': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'New': case 'Planning': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Closed Won': case 'Completed': return 'bg-emerald-600 text-white border-emerald-700';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const renderKanban = () => (
    <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar min-h-[600px] items-start">
      {(settings.dealStages || []).map((stage) => {
        const stageDeals = (deals || []).filter(d => d.stage === stage.label);
        return (
          <div key={stage.label} className="flex-shrink-0 w-[320px] bg-slate-50/50 rounded-[35px] border border-slate-100 p-4 min-h-[500px]">
            <div className="px-4 py-3 flex justify-between items-center mb-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-900">{stage.label} ({stageDeals.length})</h3>
            </div>
            <div className="space-y-4">
              {stageDeals.map((deal) => (
                <div key={deal.id} draggable onClick={() => navigate(`/deals/${deal.id}`)} className="bg-white border border-slate-100 p-5 rounded-[28px] shadow-sm hover:shadow-xl transition-all cursor-pointer">
                  <h4 className="text-sm font-black text-slate-900 truncate">{deal.name}</h4>
                  <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <span className="text-xs font-black text-blue-600">${deal.amount.toLocaleString()}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{deal.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6 animate-slide-up max-w-[1500px] mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Hub / {module}</p>
          <h1 className="text-5xl font-black capitalize text-slate-900 tracking-tighter leading-none">{module}</h1>
        </div>
        <div className="flex gap-2">
          {module === 'deals' && (
            <div className="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
              <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>List</button>
              <button onClick={() => setViewMode('kanban')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${viewMode === 'kanban' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>Pipeline</button>
            </div>
          )}
          <button onClick={() => openModal(module)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2"><Plus size={16} /> Create {module.slice(0, -1)}</button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[45px] overflow-hidden shadow-sm">
        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/10">
          <div className="relative group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input type="text" placeholder={`Filter ${module}...`} className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black w-80 uppercase tracking-widest" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
        {viewMode === 'kanban' && module === 'deals' ? renderKanban() : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/20 text-slate-400 border-b border-slate-100">
                <th className="px-10 py-5 font-black uppercase tracking-widest text-[9px]">Entity Detail</th>
                <th className="px-10 py-5 font-black uppercase tracking-widest text-[9px]">Status</th>
                <th className="px-10 py-5 font-black uppercase tracking-widest text-[9px]">{module === 'campaigns' ? 'Budget' : 'Timeline'}</th>
                <th className="px-10 py-5 font-black uppercase tracking-widest text-[9px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-all cursor-pointer group" onClick={() => navigate(`/${module}/${item.id}`)}>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center">
                        {module === 'campaigns' ? (
                          <Megaphone size={20} className="text-blue-600" />
                        ) : (
                          <img src={(item as any).avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.id}`} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors text-base leading-none mb-2">{item.name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {item.id} {module === 'campaigns' ? `• ${(item as any).type}` : ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`inline-flex px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${getStatusColor((item as any).status || (item as any).stage || 'Active')}`}>{(item as any).status || (item as any).stage || 'Active'}</span>
                  </td>
                  <td className="px-10 py-8 font-black text-slate-500 uppercase text-[10px]">
                     {module === 'campaigns' ? `$${((item as any).budget || 0).toLocaleString()}` : new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-10 py-8 text-right"><ChevronRight size={18} className="text-slate-300 inline-block" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ListView;