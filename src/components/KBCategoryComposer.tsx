import React, { useState } from 'react';
import { X, FolderTree, FileText, Hash } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { KBCategory } from '../types';

interface KBCategoryComposerProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<KBCategory>;
  mode?: 'create' | 'edit';
}

export const KBCategoryComposer: React.FC<KBCategoryComposerProps> = ({
  isOpen,
  onClose,
  initialData,
  mode = 'create'
}) => {
  const { upsertRecord } = useCRM();

  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [parentCategoryId, setParentCategoryId] = useState(initialData?.parentCategoryId || '');
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder?.toString() || '0');
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Please enter a category name');
      return;
    }

    const category: Partial<KBCategory> = {
      ...(initialData?.id && { id: initialData.id }),
      name: name.trim(),
      description: description.trim() || undefined,
      parentCategoryId: parentCategoryId || undefined,
      sortOrder: sortOrder ? parseInt(sortOrder) : 0,
      isPublic,
      isActive,
    };

    upsertRecord('kbCategories', category);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[45px] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-lime-600 to-green-600 p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <FolderTree size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                {mode === 'create' ? 'New KB Category' : 'Edit KB Category'}
              </h2>
              <p className="text-white/80 font-bold text-sm mt-1">
                {mode === 'create' ? 'Create knowledge base category' : 'Update category details'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Category Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Getting Started"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100 transition-all"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Description
              </label>
              <div className="relative">
                <FileText size={16} className="absolute left-4 top-4 text-slate-400" />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Category description..."
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100 transition-all resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Parent Category ID
                </label>
                <input
                  type="text"
                  value={parentCategoryId}
                  onChange={(e) => setParentCategoryId(e.target.value)}
                  placeholder="parent-cat-123 (optional)"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Sort Order
                </label>
                <div className="relative">
                  <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-lime-600 focus:ring-lime-500"
              />
              <label htmlFor="isPublic" className="text-sm font-bold text-slate-700 cursor-pointer">
                Category is publicly visible
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-lime-600 focus:ring-lime-500"
              />
              <label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer">
                Category is active
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
            className="px-8 py-4 bg-gradient-to-r from-lime-600 to-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-lime-700 hover:to-green-700 transition-all shadow-lg shadow-lime-500/20"
          >
            {mode === 'create' ? 'Create Category' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
