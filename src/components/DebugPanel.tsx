
import React, { useMemo } from 'react';
import { useCRM } from '../context/CRMContext';
import { useLocation, useParams } from 'react-router-dom';
import { 
  Terminal, ShieldCheck, Database, X, AlertCircle, 
  // Added missing AlertTriangle import
  CheckCircle2, Info, Layers, UserCircle2, Settings2, BarChart, AlertTriangle
} from 'lucide-react';

const DebugPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const context = useCRM();
  const location = useLocation();
  const params = useParams();

  const collections = [
    { label: 'Leads', count: context.leads.length },
    { label: 'Deals', count: context.deals.length },
    { label: 'Accounts', count: context.accounts.length },
    { label: 'Contacts', count: context.contacts.length },
    { label: 'Tasks', count: context.tasks.length },
    { label: 'Tickets', count: context.tickets.length },
    { label: 'Comms', count: context.communications.length },
    { label: 'Invoices', count: context.invoices.length },
    { label: 'Subs', count: context.subscriptions.length },
    { label: 'Products', count: context.products.length },
    { label: 'Services', count: context.services.length },
    { label: 'Campaigns', count: context.campaigns.length },
    { label: 'Docs', count: context.documents.length },
    { label: 'Audit Logs', count: context.auditLogs.length },
  ];

  const settingsValidation = {
    leadStatuses: !!context.settings.leadStatuses?.length,
    dealStages: !!context.settings.dealStages?.length,
    ticketStatuses: !!context.settings.ticketStatuses?.length,
    taskStatuses: !!context.settings.taskStatuses?.length,
    industries: !!context.settings.industries?.length,
    localization: !!context.settings.localization?.currency,
  };

  const isDetailView = location.pathname.includes('/') && params.id;
  const currentEntityId = params.id;
  
  const relationalCounts = useMemo(() => {
    if (!currentEntityId) return null;
    return {
      tasks: context.tasks.filter(t => t.relatedToId === currentEntityId).length,
      comms: context.communications.filter(c => c.relatedToId === currentEntityId).length,
      docs: context.documents.filter(d => d.relatedToId === currentEntityId).length,
      invoices: context.invoices.filter(i => i.accountId === currentEntityId || i.dealId === currentEntityId).length,
      tickets: context.tickets.filter(t => t.accountId === currentEntityId || t.requesterId === currentEntityId).length,
    };
  }, [currentEntityId, context]);

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-slate-900 border border-slate-700 shadow-2xl rounded-[32px] overflow-hidden z-[1000] font-mono animate-slide-up flex flex-col max-h-[85vh]">
      <div className="bg-slate-800 p-6 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Terminal size={18} className="text-blue-400" />
          <h3 className="text-xs font-black text-white uppercase tracking-widest">Live Context Debug</h3>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={18}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* Identity */}
        <section className="space-y-3">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <UserCircle2 size={12} /> Active Identity
          </h4>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
             <p className="text-sm font-bold text-white mb-1">{context.currentUser?.name}</p>
             <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">{context.currentUser?.role} Mode</p>
          </div>
        </section>

        {/* Global Collections */}
        <section className="space-y-3">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Database size={12} /> Global Inventory
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {collections.map(c => (
              <div key={c.label} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                 <span className="text-[9px] font-bold text-slate-500 uppercase">{c.label}</span>
                 <span className={`text-xs font-black ${c.count > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{c.count}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Record Inspector */}
        {isDetailView && (
          <section className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <BarChart size={12} /> Record Relational Density
            </h4>
            <div className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-2xl space-y-3">
               <p className="text-[10px] font-black text-blue-400 uppercase">Focus: {currentEntityId}</p>
               <div className="space-y-2">
                  {/* Fixed: Cast count to number for valid operator comparison */}
                  {relationalCounts && Object.entries(relationalCounts).map(([key, count]) => (
                    <div key={key} className="flex justify-between items-center">
                       <span className="text-[9px] font-bold text-slate-400 uppercase">{key}</span>
                       <span className={`text-xs font-black ${(count as number) > 0 ? 'text-blue-400' : 'text-slate-600'}`}>{count as React.ReactNode}</span>
                    </div>
                  ))}
               </div>
            </div>
          </section>
        )}

        {/* Settings Health */}
        <section className="space-y-3">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Settings2 size={12} /> System Dictionaries
          </h4>
          <div className="space-y-1.5">
             {Object.entries(settingsValidation).map(([key, valid]) => (
               <div key={key} className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tighter">
                  <span className="text-slate-400">{key}</span>
                  {valid ? <CheckCircle2 size={10} className="text-emerald-500" /> : <AlertTriangle size={10} className="text-rose-500" />}
               </div>
             ))}
          </div>
        </section>
      </div>

      <div className="bg-slate-950 p-4 border-t border-slate-800">
         <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest text-center">CatchaCRM Kernel v3.0.1 • LocalStore Only</p>
      </div>
    </div>
  );
};

export default DebugPanel;
