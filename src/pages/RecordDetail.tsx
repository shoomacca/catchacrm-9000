import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Building2, Mail, Phone, Globe, Clock, 
  Edit3, Share2, MoreVertical, Layout, MessageSquare, 
  Paperclip, Activity, UserPlus, FileText, CheckCircle2,
  Download, FileUp, MoreHorizontal, Plus, Trash2, Send, Target,
  Info
} from 'lucide-react';
import { HookIcon } from '../App';

const RecordDetail: React.FC = () => {
  const { module, id } = useParams<{ module: string, id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('DOCUMENTS');
  const [activeDetailTab, setActiveDetailTab] = useState('ACTIVITIES');

  const mainTabs = ['OVERVIEW', 'DETAILS', 'DOCUMENTS', 'COMMUNICATION', 'TASKS', 'NOTES', 'HISTORY'];

  return (
    <div className="space-y-6 animate-slide-up max-w-[1200px] mx-auto pb-20">
      
      {/* HEADER BAR */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Ronald Richards <span className="text-blue-600 font-bold">#5236852</span>
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 shadow-sm"><Share2 size={18} /></button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
            <Edit3 size={18} />
            Edit Record
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* PROFILE SECTION CARD */}
        <div className="bg-white border border-slate-200 rounded-[45px] p-12 shadow-sm flex flex-col items-center">
           <div className="relative mb-8">
             <div className="w-32 h-32 rounded-[40px] bg-white p-1 flex items-center justify-center border-4 border-slate-50 shadow-xl overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ronald" className="w-full h-full object-cover" alt="profile" />
             </div>
             <div className="absolute bottom-1 right-1 w-7 h-7 bg-emerald-500 border-4 border-white rounded-full"></div>
           </div>

           <div className="flex gap-16 mb-12">
             <div className="flex flex-col items-center gap-2">
               <button className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 hover:scale-110 transition-transform">
                 <Mail size={22} className="stroke-[2.5]" />
               </button>
               <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-1">MAIL</span>
             </div>
             <div className="flex flex-col items-center gap-2">
               <button className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 hover:scale-110 transition-transform">
                 <Phone size={22} className="stroke-[2.5]" />
               </button>
               <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-1">CALL</span>
             </div>
             <div className="flex flex-col items-center gap-2">
               <button className="w-14 h-14 bg-violet-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200 hover:scale-110 transition-transform">
                 <MessageSquare size={22} className="stroke-[2.5]" />
               </button>
               <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-1">SMS</span>
             </div>
           </div>

           <div className="w-full max-w-sm space-y-6 pt-8 border-t border-slate-100">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                 <Building2 size={18} />
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ACCOUNT</p>
                 <p className="text-xs font-black text-blue-600 cursor-pointer hover:underline">Cyberdyne Systems</p>
               </div>
             </div>
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                 <Target size={18} />
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">SOURCE</p>
                 <p className="text-xs font-black text-slate-900">LinkedIn Campaign</p>
               </div>
             </div>
           </div>
        </div>

        {/* DETAIL INFO & ACTIVITIES SECTION */}
        <div className="bg-white border border-slate-200 rounded-[45px] overflow-hidden shadow-sm">
           <div className="flex border-b border-slate-100 h-16">
              <button 
                onClick={() => setActiveDetailTab('DETAIL INFO')}
                className={`flex-1 text-[11px] font-black tracking-widest uppercase transition-all ${activeDetailTab === 'DETAIL INFO' ? 'text-blue-600 bg-white' : 'text-slate-400 hover:text-slate-600 bg-slate-50/20'}`}
              >
                DETAIL INFO
              </button>
              <button 
                onClick={() => setActiveDetailTab('ACTIVITIES')}
                className={`flex-1 text-[11px] font-black tracking-widest uppercase transition-all relative ${activeDetailTab === 'ACTIVITIES' ? 'text-blue-600 bg-white' : 'text-slate-400 hover:text-slate-600 bg-slate-50/20'}`}
              >
                ACTIVITIES
                {activeDetailTab === 'ACTIVITIES' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-t-full"></div>}
              </button>
           </div>
           
           <div className="p-12">
              {activeDetailTab === 'ACTIVITIES' && (
                <div className="space-y-10 relative">
                  <div className="absolute left-6 top-6 bottom-6 w-[2px] bg-slate-100"></div>
                  {[
                    { user: 'Eleanor Pena', action: 'tagged you in a comment', time: '12:00 PM', icon: MessageSquare, color: 'text-blue-500' },
                    { user: 'Eleanor Pena', action: 'shared deal progress', time: '12:00 PM', icon: HookIcon, color: 'text-violet-500' },
                    { user: 'Eleanor Pena', action: 'commented on update', time: '4:00 AM', icon: MessageSquare, color: 'text-pink-500' },
                  ].map((act, i) => (
                    <div key={i} className="flex gap-8 relative z-10 items-center">
                      <div className="w-12 h-12 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm">
                        <div className={`${act.color} bg-white`}><act.icon size={18} /></div>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-slate-600 leading-tight">
                          <span className="font-black text-slate-900 cursor-pointer underline decoration-blue-100 underline-offset-4 decoration-2">{act.user}</span> {act.action}
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">{act.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
           </div>
        </div>

        {/* BOTTOM SECTION: PROJECT DETAILS */}
        <div className="bg-white border border-slate-200 rounded-[45px] shadow-sm flex flex-col">
          <div className="p-12 pb-0">
             <div className="flex justify-between items-start mb-8">
               <div>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-6">Property Loan</h2>
                  <div className="flex items-center gap-4">
                    <span className="bg-emerald-50 text-emerald-500 font-black text-[10px] uppercase tracking-[0.2em] px-4 py-2 rounded-xl border border-emerald-100">ACTIVE DEAL</span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CREATED ON: <span className="text-slate-900 font-black">02 MAR, 2025</span></p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                 <div className="flex -space-x-3">
                   <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=1" className="w-10 h-10 rounded-2xl border-4 border-white shadow-md bg-slate-50" />
                   <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=2" className="w-10 h-10 rounded-2xl border-4 border-white shadow-md bg-slate-50" />
                   <div className="w-10 h-10 rounded-2xl bg-slate-900 border-4 border-white flex items-center justify-center text-[10px] font-black text-white shadow-md">+2</div>
                 </div>
                 <button className="flex items-center gap-2 text-[11px] font-black text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all">
                   <UserPlus size={16} /> Add Stakeholder
                 </button>
               </div>
             </div>

             {/* BOTTOM TABS */}
             <div className="flex gap-10 overflow-x-auto custom-scrollbar border-t border-slate-100 mt-12">
               {mainTabs.map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`pt-6 pb-6 text-[11px] font-black uppercase tracking-[0.15em] whitespace-nowrap relative transition-all ${
                     activeTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                   }`}
                 >
                   {tab}
                   {activeTab === tab && (
                     <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-t-full"></div>
                   )}
                 </button>
               ))}
             </div>
          </div>

          <div className="p-12 pt-16 bg-white rounded-b-[45px]">
            {activeTab === 'DOCUMENTS' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { label: 'DOCUMENTS OWED', val: 5, color: 'text-amber-500', bg: 'bg-amber-50/30' },
                  { label: 'PENDING REVIEW', val: 4, color: 'text-blue-600', bg: 'bg-blue-50/30' },
                  { label: 'APPROVED DOCS', val: '12/13', color: 'text-emerald-500', bg: 'bg-emerald-50/30' },
                ].map((stat) => (
                  <div key={stat.label} className={`${stat.bg} border border-transparent hover:border-slate-100 p-10 rounded-[40px] shadow-sm transition-all hover:scale-[1.02] cursor-pointer`}>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">{stat.label}</p>
                    <p className={`text-4xl font-black ${stat.color}`}>{stat.val}</p>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab !== 'DOCUMENTS' && (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-100 rounded-[40px]">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4"><Info size={32} /></div>
                <h4 className="text-lg font-black text-slate-900">{activeTab} MODULE</h4>
                <p className="text-xs font-bold text-slate-400 mt-1 max-w-sm uppercase tracking-widest">Connect your operational tools to see live data rollups.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordDetail;