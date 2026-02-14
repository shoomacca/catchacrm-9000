import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import {
  Wrench, ChevronLeft, Edit3, Trash2, DollarSign,
  Hash, Tag, Clock, Users, Cog, CheckSquare,
  Image as ImageIcon, TrendingUp, Shield, AlertCircle, RefreshCcw
} from 'lucide-react';
import { ServiceComposer } from '../components/ServiceComposer';

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { services, deleteRecord } = useCRM();
  const [showServiceComposer, setShowServiceComposer] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  const service = useMemo(() => services.find(s => s.id === id), [services, id]);

  if (!service) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Wrench size={64} className="mx-auto text-slate-300 mb-4" />
          <p className="text-lg font-bold text-slate-400">Service not found</p>
          <button
            onClick={() => navigate('/financials/catalog')}
            className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-black uppercase"
          >
            Back to Catalog
          </button>
        </div>
      </div>
    );
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${service.name}?`)) {
      deleteRecord('services', service.id);
      navigate('/financials/catalog');
    }
  };

  const formatDuration = () => {
    const hours = service.durationHours || 0;
    const minutes = service.durationMinutes || 0;
    if (hours === 0 && minutes === 0) return 'Not specified';
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/financials/catalog')}
            className="p-3 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Details</p>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">{service.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setEditingService(service); setShowServiceComposer(true); }}
            className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
          >
            <Edit3 size={20} />
          </button>
          <button
            onClick={handleDelete}
            className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[35px] overflow-hidden shadow-sm">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Wrench size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">{service.name}</h2>
                {service.description && (
                  <p className="text-emerald-100 font-bold mt-1">{service.description}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-emerald-100 font-bold text-sm">Unit Price</p>
              <p className="text-3xl font-black text-white">${service.unitPrice.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-8">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* Service Code */}
            {service.code && (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Hash size={18} className="text-emerald-600" />
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Service Code</h3>
                </div>
                <p className="text-lg font-black text-slate-900">{service.code}</p>
              </div>
            )}

            {/* Category */}
            {service.category && (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={18} className="text-emerald-600" />
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Category</h3>
                </div>
                <p className="text-lg font-black text-slate-900">{service.category}</p>
              </div>
            )}

            {/* Type */}
            {(service.type || (service as any).itemType) && (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Wrench size={18} className="text-emerald-600" />
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Type</h3>
                </div>
                <p className="text-lg font-black text-slate-900">{service.type || (service as any).itemType}</p>
              </div>
            )}

            {/* Billing Cycle */}
            {service.billingCycle && (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <RefreshCcw size={18} className="text-emerald-600" />
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Billing Cycle</h3>
                </div>
                <p className="text-lg font-black text-slate-900 capitalize">{service.billingCycle === 'one-off' ? 'One-Time' : service.billingCycle}</p>
              </div>
            )}
          </div>

          {/* Pricing & Duration */}
          <div className="grid grid-cols-2 gap-6">
            {/* Pricing */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={20} className="text-emerald-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Pricing</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Unit Price</span>
                  <span className="text-lg font-black text-slate-900">${service.unitPrice.toFixed(2)}</span>
                </div>
                {service.costPrice !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Cost Price</span>
                    <span className="text-lg font-black text-slate-900">${service.costPrice.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Tax Rate</span>
                  <span className="text-lg font-black text-slate-900">{service.taxRate}%</span>
                </div>
                {service.costPrice !== undefined && (
                  <div className="pt-3 border-t border-slate-300 flex justify-between">
                    <span className="text-xs font-bold text-emerald-600 uppercase">Markup</span>
                    <span className="text-lg font-black text-emerald-600">
                      {((service.unitPrice - service.costPrice) / service.costPrice * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Duration & Resources */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={20} className="text-emerald-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Service Info</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Duration</span>
                  <span className="text-lg font-black text-slate-900">{formatDuration()}</span>
                </div>
                {service.crewSize !== undefined && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-500 uppercase">Crew Size</span>
                    </div>
                    <span className="text-lg font-black text-slate-900">{service.crewSize}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SLA Commitments */}
          {(service.slaResponseHours !== undefined || service.slaCompletionDays !== undefined) && (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={20} className="text-blue-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Service Level Agreement</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {service.slaResponseHours !== undefined && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Response Time</p>
                    <p className="text-2xl font-black text-blue-600">{service.slaResponseHours}h</p>
                  </div>
                )}
                {service.slaCompletionDays !== undefined && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Completion Time</p>
                    <p className="text-2xl font-black text-blue-600">{service.slaCompletionDays} days</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Prerequisites */}
          {service.prerequisites && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={20} className="text-emerald-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Prerequisites</h3>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{service.prerequisites}</p>
              </div>
            </div>
          )}

          {/* Deliverables */}
          {service.deliverables && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckSquare size={20} className="text-emerald-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Deliverables</h3>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{service.deliverables}</p>
              </div>
            </div>
          )}

          {/* Skills Required */}
          {service.skillsRequired && service.skillsRequired.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {service.skillsRequired.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase border border-emerald-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Equipment Needed */}
          {service.equipmentNeeded && service.equipmentNeeded.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Cog size={20} className="text-emerald-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Equipment Needed</h3>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                <ul className="space-y-2">
                  {service.equipmentNeeded.map((equipment, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      {equipment}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Quality Checklist */}
          {service.qualityChecklist && service.qualityChecklist.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckSquare size={20} className="text-emerald-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Quality Checklist</h3>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                <div className="space-y-3">
                  {service.qualityChecklist.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1 w-5 h-5 border-2 border-emerald-500 rounded flex items-center justify-center flex-shrink-0">
                        <CheckSquare size={12} className="text-emerald-500" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {service.tags && service.tags.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase border border-emerald-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Images */}
          {service.images && service.images.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon size={20} className="text-emerald-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Service Images</h3>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {service.images.map((img, index) => (
                  <div key={index} className="aspect-square bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                    <img src={img} alt={`${service.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ServiceComposer
        isOpen={showServiceComposer}
        onClose={() => {
          setShowServiceComposer(false);
          setEditingService(null);
        }}
        initialData={editingService || undefined}
        mode={editingService ? 'edit' : 'create'}
      />
    </div>
  );
};

export default ServiceDetail;
