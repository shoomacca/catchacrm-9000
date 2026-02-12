import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import { Building2, ChevronRight, Check, Sparkles } from 'lucide-react';
import { INDUSTRY_BLUEPRINTS } from '../utils/industryBlueprints';

const BlueprintListPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useCRM();
  const activeIndustry = settings.activeIndustry || 'general';

  const blueprints = [
    { id: 'general', name: 'General Business', icon: '🏢', description: 'Standard CRM for all business types' },
    { id: 'real_estate', name: 'Real Estate', icon: '🏠', description: 'Properties, Showings, Offers, Listings' },
    { id: 'solar', name: 'Solar & Renewable Energy', icon: '☀️', description: 'Site Surveys, Installations, Permits' },
    { id: 'construction', name: 'Construction & Trades', icon: '🏗️', description: 'Projects, Bids, Change Orders' },
    { id: 'finance', name: 'Financial Services', icon: '💰', description: 'Loan Applications, Portfolios, Policies' },
    { id: 'healthcare', name: 'Healthcare', icon: '🏥', description: 'Patients, Appointments, Prescriptions' },
    { id: 'legal', name: 'Legal Services', icon: '⚖️', description: 'Cases, Billable Hours, Court Dates' },
    { id: 'automotive', name: 'Automotive', icon: '🚗', description: 'Vehicles, Test Drives, Trade-ins' },
    { id: 'hospitality', name: 'Hospitality', icon: '🏨', description: 'Rooms, Reservations, Events' },
    { id: 'manufacturing', name: 'Manufacturing', icon: '🏭', description: 'Production Orders, Quality, Materials' },
  ];

  return (
    <div className="space-y-12 max-w-[1600px] mx-auto animate-slide-up pb-40">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
            Industry Configuration
          </p>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-1">
            Blueprints
          </h1>
          <p className="text-sm text-slate-500 font-semibold mt-2">
            Choose your industry to customize fields, entities, and workflows
          </p>
        </div>
      </div>

      {/* Active Blueprint Banner */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[40px] p-8 text-white shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">
            {blueprints.find(b => b.id === activeIndustry)?.icon || '🏢'}
          </div>
          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-widest text-blue-100 mb-1">
              Active Blueprint
            </p>
            <h2 className="text-2xl font-black">
              {blueprints.find(b => b.id === activeIndustry)?.name || 'General Business'}
            </h2>
            <p className="text-sm text-blue-100 mt-1">
              {blueprints.find(b => b.id === activeIndustry)?.description}
            </p>
          </div>
          <button
            onClick={() => navigate(`/blueprints/${activeIndustry}`)}
            className="px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2"
          >
            Configure
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Blueprint Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-slate-900">All Industry Blueprints</h3>
          <p className="text-sm text-slate-500 font-semibold">
            {blueprints.length} industries available
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blueprints.map(blueprint => {
            const isActive = blueprint.id === activeIndustry;
            const blueprintData = Object.values(INDUSTRY_BLUEPRINTS).find(b => b.id === blueprint.id);
            const entityCount = blueprintData?.customEntities?.length || 0;

            return (
              <button
                key={blueprint.id}
                onClick={() => navigate(`/blueprints/${blueprint.id}`)}
                className={`group relative bg-white rounded-[35px] p-8 transition-all text-left ${
                  isActive
                    ? 'border-2 border-blue-500 shadow-2xl shadow-blue-500/20'
                    : 'border-2 border-slate-100 hover:border-blue-200 hover:shadow-xl'
                }`}
              >
                {/* Active Badge */}
                {isActive && (
                  <div className="absolute top-6 right-6">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <Check size={16} className="text-white" />
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 ${
                  isActive
                    ? 'bg-blue-100 border-2 border-blue-300'
                    : 'bg-slate-50 border-2 border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-200'
                }`}>
                  {blueprint.icon}
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h4 className={`text-xl font-black ${
                    isActive ? 'text-blue-900' : 'text-slate-900 group-hover:text-blue-900'
                  }`}>
                    {blueprint.name}
                  </h4>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {blueprint.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Custom Entities
                      </p>
                      <p className="text-lg font-black text-slate-900">
                        {entityCount}
                      </p>
                    </div>
                    <div className="flex-1"></div>
                    <ChevronRight size={20} className={`${
                      isActive ? 'text-blue-600' : 'text-slate-300 group-hover:text-blue-500'
                    } transition-all`} />
                  </div>
                </div>

                {/* Hover Effect */}
                <div className={`absolute inset-0 rounded-[35px] transition-opacity pointer-events-none ${
                  isActive ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 rounded-[35px]"></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-[35px] p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles size={24} className="text-slate-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-black text-slate-900 mb-2">
              What are Industry Blueprints?
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed mb-4">
              Industry Blueprints customize your CRM with industry-specific fields, custom entities, and workflows.
              Each blueprint is pre-configured with the terminology, processes, and data structures unique to your business type.
            </p>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="font-bold">Custom Entities</strong> - Industry-specific objects like Properties, Installations, Cases</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="font-bold">Custom Fields</strong> - Additional fields on Leads, Deals, Accounts tailored to your industry</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="font-bold">Industry Pipelines</strong> - Sales stages and workflows optimized for your business model</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="font-bold">No Data Loss</strong> - Switch blueprints anytime - all data is preserved</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlueprintListPage;
