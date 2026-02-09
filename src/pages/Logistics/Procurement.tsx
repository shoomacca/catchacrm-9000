import React from 'react';
import { ShoppingCart, Building2, FileText, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white border border-slate-200 p-8 rounded-[35px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up">
    <div className="flex justify-between items-start mb-6">
      <div className={`w-14 h-14 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center`}>
        <Icon size={28} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
    <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</h3>
    <p className="text-4xl font-black text-slate-900 tracking-tight">{value}</p>
  </div>
);

const Procurement: React.FC = () => {
  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-20">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none mb-1">Procurement</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier & Vendor Management</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold active:scale-95 transition-all">
            + Add Supplier
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
            New RFQ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Active Suppliers" value="0" icon={Building2} color="bg-indigo-500" />
        <StatCard label="Open RFQs" value="0" icon={FileText} color="bg-purple-500" />
        <StatCard label="Pending Quotes" value="0" icon={Clock} color="bg-orange-500" />
        <StatCard label="This Month Spend" value="$0" icon={TrendingUp} color="bg-emerald-500" />
      </div>

      {/* Supplier Performance Dashboard */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 rounded-[35px] shadow-xl text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <ShoppingCart size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-200">Procurement Overview</h3>
            <p className="text-2xl font-black">Supplier Network</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
            <p className="text-indigo-200 text-xs font-bold uppercase mb-1">Top Supplier</p>
            <p className="text-xl font-black">—</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
            <p className="text-indigo-200 text-xs font-bold uppercase mb-1">Avg Lead Time</p>
            <p className="text-xl font-black">—</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
            <p className="text-indigo-200 text-xs font-bold uppercase mb-1">On-Time Rate</p>
            <p className="text-xl font-black">—</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-8 rounded-[35px] shadow-sm">
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={40} className="text-indigo-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Procurement Hub</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Manage suppliers, create RFQs, compare quotes, and track vendor performance. Complete procurement lifecycle in one place.
          </p>
          <div className="flex gap-3 justify-center">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
              Import Suppliers
            </button>
            <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold active:scale-95 transition-all">
              Learn More
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[35px] shadow-xl text-white">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">Coming Features</h3>
        <ul className="space-y-3">
          <li className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-indigo-400" />
            <span className="font-semibold">Supplier Catalog & Product Database</span>
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-indigo-400" />
            <span className="font-semibold">RFQ Creation & Quote Comparison</span>
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-indigo-400" />
            <span className="font-semibold">Supplier Performance Scorecards</span>
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-indigo-400" />
            <span className="font-semibold">Spend Analytics & Cost Savings Reports</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Procurement;
