
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  Clock, 
  Edit3, 
  Share2, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Layout,
  MessageSquare,
  Paperclip,
  Activity,
  UserPlus
} from 'lucide-react';

const DetailView: React.FC = () => {
  const { module, id } = useParams<{ module: string, id: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'related' | 'files' | 'activity'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layout },
    { id: 'activity', label: 'Timeline', icon: Activity },
    { id: 'related', label: 'Related Records', icon: UserPlus },
    { id: 'files', label: 'Files', icon: Paperclip },
  ];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      {/* Header / Breadcrumbs */}
      <div className="flex items-center justify-between mb-2">
        <Link to={`/${module}`} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ChevronLeft size={20} />
          <span>Back to {module}</span>
        </Link>
        <div className="flex gap-2">
          <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"><Share2 size={18} /></button>
          <button className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-all">
            <Edit3 size={18} />
            Edit Record
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Entity Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
              <button className="text-slate-500 hover:text-white transition-colors"><MoreVertical size={20} /></button>
            </div>
            
            <div className="flex flex-col items-center text-center pt-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-xl shadow-blue-500/20">
                {module?.[0].toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Cyberdyne Systems</h2>
              <p className="text-slate-400 text-sm mb-6 flex items-center gap-2">
                <Building2 size={14} />
                Enterprise Account • CA, USA
              </p>

              <div className="w-full grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Pipeline</p>
                  <p className="text-sm font-semibold text-blue-400">$2.4M</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Rating</p>
                  <p className="text-sm font-semibold text-amber-400">★★★★☆</p>
                </div>
              </div>

              <div className="w-full space-y-4 text-left">
                <div className="flex items-center gap-3 text-sm group/item">
                  <div className="p-2 bg-slate-800 rounded-lg text-slate-400 group-hover/item:text-blue-400 transition-colors"><Mail size={16} /></div>
                  <span className="text-slate-300">billing@cyberdyne.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm group/item">
                  <div className="p-2 bg-slate-800 rounded-lg text-slate-400 group-hover/item:text-blue-400 transition-colors"><Phone size={16} /></div>
                  <span className="text-slate-300">+1 (555) 000-1984</span>
                </div>
                <div className="flex items-center gap-3 text-sm group/item">
                  <div className="p-2 bg-slate-800 rounded-lg text-slate-400 group-hover/item:text-blue-400 transition-colors"><Globe size={16} /></div>
                  <span className="text-slate-300">www.cyberdyne.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="font-semibold mb-4 text-white">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {['Tech', 'High-Value', 'SaaS', 'Priority-A'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-full border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Tabs & Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[700px]">
            {/* Tab Bar */}
            <div className="flex border-b border-slate-800 bg-slate-900/50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative ${
                    activeTab === tab.id ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_-4px_10px_rgba(59,130,246,0.5)]"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">About Cyberdyne</h4>
                      <p className="text-slate-300 leading-relaxed text-sm">
                        Cyberdyne Systems is a global tech conglomerate specializing in artificial intelligence and robotics. 
                        Currently investigating advanced processor architectures and defense automation systems.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Account Manager</h4>
                      <div className="flex items-center gap-3">
                        <img src="https://picsum.photos/40/40?random=8" className="w-10 h-10 rounded-full" alt="avatar" />
                        <div>
                          <p className="text-sm font-semibold">Sarah Dyson</p>
                          <p className="text-xs text-slate-500">Senior Key Accounts</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-800">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="font-semibold flex items-center gap-2">
                        <MessageSquare size={18} className="text-blue-500" />
                        Discussions
                      </h4>
                      <span className="text-xs text-slate-500">3 Comments</span>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <img src="https://picsum.photos/32/32?random=11" className="w-8 h-8 rounded-full shrink-0" alt="avatar" />
                        <div className="flex-1 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-semibold">John Connor</span>
                            <span className="text-[10px] text-slate-500">Oct 12, 10:45 AM</span>
                          </div>
                          <p className="text-sm text-slate-300">Negotiations for the Model T-800 contract are reaching final stages. Please verify the shipment dates.</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 items-center">
                        <img src="https://picsum.photos/32/32?random=1" className="w-8 h-8 rounded-full" alt="me" />
                        <div className="flex-1 relative">
                          <input 
                            type="text" 
                            placeholder="Write a comment..." 
                            className="w-full bg-slate-950 border border-slate-800 rounded-full py-2 px-5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                          />
                          <button className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 p-1 hover:bg-blue-500/10 rounded-full transition-colors">
                            {/* Fixed: ChevronRight was missing from imports */}
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-8">
                   {[1,2,3].map(i => (
                     <div key={i} className="flex gap-6 relative">
                       {i < 3 && <div className="absolute left-[15px] top-8 bottom-[-32px] w-[2px] bg-slate-800"></div>}
                       <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center z-10">
                         <Clock size={14} className="text-blue-500" />
                       </div>
                       <div>
                         <p className="text-sm text-slate-200">System updated deal stage to <span className="font-semibold text-blue-400">Negotiation</span></p>
                         <p className="text-xs text-slate-500 mt-1">Today at 2:30 PM</p>
                       </div>
                     </div>
                   ))}
                </div>
              )}

              {activeTab === 'files' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="group bg-slate-950 border border-slate-800 p-4 rounded-xl hover:border-blue-500/50 transition-all cursor-pointer">
                      <div className="w-full aspect-video bg-slate-900 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        <img src={`https://picsum.photos/400/225?random=${i+10}`} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" alt="doc" />
                      </div>
                      <p className="text-sm font-medium truncate">Contract_v2.pdf</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">2.4 MB • PDF</p>
                    </div>
                  ))}
                  <label className="border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 hover:bg-slate-900 transition-all cursor-pointer group">
                    <input type="file" className="hidden" />
                    <Paperclip size={24} className="text-slate-600 group-hover:text-blue-500 transition-colors mb-2" />
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-300">Upload File</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailView;
