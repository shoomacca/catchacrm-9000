import React, { useState } from 'react';
import { X, Wrench, DollarSign, Percent, Tag, FileText, Clock } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Service } from '../types';

interface ServiceComposerProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Service>;
  mode?: 'create' | 'edit';
}

export const ServiceComposer: React.FC<ServiceComposerProps> = ({
  isOpen,
  onClose,
  initialData,
  mode = 'create'
}) => {
  const { upsertRecord } = useCRM();

  const [name, setName] = useState(initialData?.name || '');
  const [code, setCode] = useState(initialData?.code || initialData?.sku || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || 'Consulting');
  const [billingCycle, setBillingCycle] = useState(initialData?.billingCycle || 'one-off');
  const [unitPrice, setUnitPrice] = useState(initialData?.unitPrice?.toString() || '');
  const [costPrice, setCostPrice] = useState(initialData?.costPrice?.toString() || '');
  const [taxRate, setTaxRate] = useState(initialData?.taxRate?.toString() || '10');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [durationHours, setDurationHours] = useState(initialData?.durationHours?.toString() || '');
  const [durationMinutes, setDurationMinutes] = useState(initialData?.durationMinutes?.toString() || '');
  const [crewSize, setCrewSize] = useState(initialData?.crewSize?.toString() || '');

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Please enter a service name');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a description');
      return;
    }
    if (!unitPrice || parseFloat(unitPrice) < 0) {
      alert('Please enter a valid unit price');
      return;
    }

    const service: Partial<Service> = {
      ...(initialData?.id && { id: initialData.id }),
      name: name.trim(),
      code: code.trim() || undefined,
      description: description.trim(),
      category,
      billingCycle: billingCycle as any,
      unitPrice: parseFloat(unitPrice),
      costPrice: costPrice ? parseFloat(costPrice) : undefined,
      taxRate: parseFloat(taxRate),
      isActive,
      durationHours: durationHours ? parseInt(durationHours) : undefined,
      durationMinutes: durationMinutes ? parseInt(durationMinutes) : undefined,
      crewSize: crewSize ? parseInt(crewSize) : undefined,
    };

    upsertRecord('services', service);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[45px] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Wrench size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                {mode === 'create' ? 'New Service' : 'Edit Service'}
              </h2>
              <p className="text-white/80 font-bold text-sm mt-1">
                {mode === 'create' ? 'Add service to catalog' : 'Update service details'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Service Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Installation Service"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Service Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="SVC-001"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Description *
              </label>
              <div className="relative">
                <FileText size={16} className="absolute left-4 top-4 text-slate-400" />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Service description..."
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all resize-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Category
                </label>
                <div className="relative">
                  <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                  >
                    <option value="Consulting">Consulting</option>
                    <option value="Installation">Installation</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Support">Support</option>
                    <option value="Training">Training</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Billing Cycle
                </label>
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value as any)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                >
                  <option value="one-off">One-off</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Unit Price *
                </label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Cost Price
                </label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Tax Rate (%)
                </label>
                <div className="relative">
                  <Percent size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    placeholder="10"
                    step="0.1"
                    min="0"
                    max="100"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Duration (Hours)
                </label>
                <div className="relative">
                  <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="59"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Crew Size
                </label>
                <input
                  type="number"
                  value={crewSize}
                  onChange={(e) => setCrewSize(e.target.value)}
                  placeholder="1"
                  min="1"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              <label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer">
                Service is active and available
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/20"
          >
            {mode === 'create' ? 'Create Service' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
