import React, { useState } from 'react';
import { X, Zap, PlayCircle, Pause, FileText } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { AutomationWorkflow } from '../types';

interface AutomationWorkflowComposerProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<AutomationWorkflow>;
  mode?: 'create' | 'edit';
}

export const AutomationWorkflowComposer: React.FC<AutomationWorkflowComposerProps> = ({
  isOpen,
  onClose,
  initialData,
  mode = 'create'
}) => {
  const { upsertRecord } = useCRM();

  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || 'Sales');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? false);

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Please enter a workflow name');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a description');
      return;
    }

    const workflow: Partial<AutomationWorkflow> = {
      ...(initialData?.id && { id: initialData.id }),
      name: name.trim(),
      description: description.trim(),
      category: category as any,
      isActive,
      trigger: initialData?.trigger || { type: 'RecordCreated', entity: 'contacts', config: {} },
      nodes: initialData?.nodes || [],
      executionCount: initialData?.executionCount || 0,
    };

    upsertRecord('automationWorkflows', workflow);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[45px] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-fuchsia-600 to-purple-600 p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Zap size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                {mode === 'create' ? 'New Automation Workflow' : 'Edit Automation Workflow'}
              </h2>
              <p className="text-white/80 font-bold text-sm mt-1">
                {mode === 'create' ? 'Create new workflow' : 'Update workflow details'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Workflow Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Welcome Email Sequence"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-100 transition-all"
                required
              />
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
                  placeholder="Describe what this workflow does..."
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-100 transition-all resize-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-100 transition-all"
              >
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
                <option value="Logistics">Logistics</option>
                <option value="System">System</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-fuchsia-600 focus:ring-fuchsia-500"
              />
              <label htmlFor="isActive" className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                {isActive ? <PlayCircle size={18} className="text-fuchsia-600" /> : <Pause size={18} className="text-slate-400" />}
                Workflow is active and enabled
              </label>
            </div>

            {initialData?.executionCount !== undefined && (
              <div className="p-4 bg-fuchsia-50 border border-fuchsia-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Execution Count</span>
                  <span className="text-2xl font-black text-fuchsia-600">{initialData.executionCount}</span>
                </div>
                {initialData.lastRunAt && (
                  <p className="text-xs text-slate-500 mt-2">Last run: {new Date(initialData.lastRunAt).toLocaleString()}</p>
                )}
              </div>
            )}

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl">
              <p className="text-xs font-bold text-slate-600 leading-relaxed">
                <strong>Note:</strong> Workflow triggers and nodes can be configured after creation in the workflow builder.
                This form sets up the basic workflow properties.
              </p>
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
            className="px-8 py-4 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-fuchsia-700 hover:to-purple-700 transition-all shadow-lg shadow-fuchsia-500/20"
          >
            {mode === 'create' ? 'Create Workflow' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
