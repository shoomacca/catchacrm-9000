import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import {
  ArrowLeft, Save, Eye, EyeOff, Lock, Unlock, Layers,
  Settings as SettingsIcon, ChevronRight, Check, X, AlertCircle, Sparkles
} from 'lucide-react';
import { INDUSTRY_BLUEPRINTS } from '../utils/industryBlueprints';
import { IndustryType } from '../types';

const BlueprintDetailPage: React.FC = () => {
  const { blueprintId } = useParams<{ blueprintId: string }>();
  const navigate = useNavigate();
  const { settings, updateSettings } = useCRM();

  const blueprint = Object.values(INDUSTRY_BLUEPRINTS).find(b => b.id === blueprintId);
  const isActive = settings.activeIndustry === blueprintId;

  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'entities' | 'fields'>('entities');

  if (!blueprint) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle size={48} className="text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900">Blueprint Not Found</h2>
          <button
            onClick={() => navigate('/blueprints')}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold"
          >
            Back to Blueprints
          </button>
        </div>
      </div>
    );
  }

  const blueprintIcons: Record<string, string> = {
    general: '🏢',
    real_estate: '🏠',
    solar: '☀️',
    construction: '🏗️',
    finance: '💰',
    healthcare: '🏥',
    legal: '⚖️',
    automotive: '🚗',
    hospitality: '🏨',
    manufacturing: '🏭',
  };

  const activateBlueprint = () => {
    updateSettings({
      ...settings,
      activeIndustry: blueprintId as IndustryType,
      organization: {
        ...settings.organization,
        industry: blueprintId as IndustryType
      }
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-12 max-w-[1600px] mx-auto animate-slide-up pb-40">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/blueprints')}
            className="w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-2xl flex items-center justify-center transition-all"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 border-2 border-blue-300 rounded-2xl flex items-center justify-center text-3xl">
              {blueprintIcons[blueprintId || 'general']}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                Blueprint Configuration
              </p>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                {blueprint.name}
              </h1>
              <p className="text-sm text-slate-500 font-semibold mt-1">
                {blueprint.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {!isActive && (
            <button
              onClick={activateBlueprint}
              className={`flex items-center gap-2 px-10 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-xl transition-all ${
                isSaved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-blue-600 text-white shadow-blue-500/20 active:scale-95'
              }`}
            >
              {isSaved ? <Check size={18} /> : <Sparkles size={18} />}
              {isSaved ? 'Blueprint Activated' : 'Activate Blueprint'}
            </button>
          )}
          {isActive && (
            <div className="flex items-center gap-2 px-10 py-4 rounded-[24px] bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
              <Check size={18} />
              Active Blueprint
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-100">
        <button
          onClick={() => setActiveTab('entities')}
          className={`flex items-center gap-3 px-6 py-4 rounded-t-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'entities'
              ? 'bg-slate-900 text-white'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Layers size={16} />
          Custom Entities
        </button>
        <button
          onClick={() => setActiveTab('fields')}
          className={`flex items-center gap-3 px-6 py-4 rounded-t-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'fields'
              ? 'bg-slate-900 text-white'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
        >
          <SettingsIcon size={16} />
          Custom Fields
        </button>
      </div>

      {/* Entities Tab */}
      {activeTab === 'entities' && (
        <div className="space-y-8">
          {blueprint.customEntities && blueprint.customEntities.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Custom Entities</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Industry-specific objects unique to {blueprint.name}
                  </p>
                </div>
                <div className="text-sm text-slate-500 font-semibold">
                  {blueprint.customEntities.length} entities
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blueprint.customEntities.map(entity => (
                  <div
                    key={entity.id}
                    className="bg-white rounded-[30px] border-2 border-slate-100 p-8 hover:border-blue-200 hover:shadow-xl transition-all"
                  >
                    {/* Entity Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-xl">
                          {entity.icon}
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-900">
                            {entity.namePlural}
                          </h4>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            {entity.fields.length} fields
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Eye size={14} className="text-emerald-600" />
                        </button>
                      </div>
                    </div>

                    {/* Fields Preview */}
                    <div className="space-y-2">
                      {entity.fields.slice(0, 4).map(field => (
                        <div
                          key={field.id}
                          className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-xl"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{field.label}</span>
                            {field.required && (
                              <Lock size={12} className="text-rose-500" />
                            )}
                          </div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            {field.type}
                          </span>
                        </div>
                      ))}
                      {entity.fields.length > 4 && (
                        <div className="text-center pt-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            + {entity.fields.length - 4} more fields
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Entity Features */}
                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                      {entity.hasTimeline && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-[9px] font-black uppercase tracking-widest">
                          Timeline
                        </span>
                      )}
                      {entity.hasDocuments && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-[9px] font-black uppercase tracking-widest">
                          Documents
                        </span>
                      )}
                      {entity.relationTo && entity.relationTo.length > 0 && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-[9px] font-black uppercase tracking-widest">
                          Relations
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <Layers size={48} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-900 mb-2">No Custom Entities</h3>
              <p className="text-sm text-slate-500">
                This blueprint uses standard CRM entities only
              </p>
            </div>
          )}
        </div>
      )}

      {/* Fields Tab */}
      {activeTab === 'fields' && (
        <div className="space-y-8">
          {Object.entries(blueprint.customFields || {}).length > 0 ? (
            Object.entries(blueprint.customFields || {}).map(([entityType, fields]) => {
              const fieldList = (fields || []) as import('../types').CustomFieldDefinition[];
              return (
              <div key={entityType} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-slate-900 capitalize">
                    {entityType} Custom Fields
                  </h3>
                  <span className="text-sm text-slate-500 font-semibold">
                    {fieldList.length} fields
                  </span>
                </div>

                <div className="bg-white rounded-[30px] border-2 border-slate-100 p-8">
                  <div className="space-y-3">
                    {fieldList.map((field: import('../types').CustomFieldDefinition, index: number) => (
                      <div
                        key={field.id}
                        className="flex items-center justify-between py-4 px-6 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-all"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200">
                            <span className="text-xs font-black text-slate-600">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-black text-slate-900">{field.label}</h4>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                              {field.type} {field.required && '• Required'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {field.required && (
                            <div className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-[9px] font-black uppercase tracking-widest">
                              Required
                            </div>
                          )}
                          {field.options && (
                            <div className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-[9px] font-black uppercase tracking-widest">
                              {field.options.length} Options
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button className="w-8 h-8 bg-emerald-100 hover:bg-emerald-200 rounded-lg flex items-center justify-center transition-all">
                              <Eye size={14} className="text-emerald-600" />
                            </button>
                            <button className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-all">
                              <EyeOff size={14} className="text-slate-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ); })
          ) : (
            <div className="text-center py-20">
              <SettingsIcon size={48} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-900 mb-2">No Custom Fields</h3>
              <p className="text-sm text-slate-500">
                This blueprint uses standard CRM fields only
              </p>
            </div>
          )}
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-[35px] p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center shrink-0">
            <AlertCircle size={24} className="text-blue-700" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-black text-slate-900 mb-2">
              Blueprint Management
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              Custom entities and fields are automatically shown/hidden based on your active blueprint.
              All data is preserved when switching blueprints - nothing is deleted.
              {isActive && ' This blueprint is currently active across your entire CRM.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlueprintDetailPage;
