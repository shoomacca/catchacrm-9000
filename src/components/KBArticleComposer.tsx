import React, { useState } from 'react';
import { X, BookOpen, FileText, Tag, Eye, ThumbsUp, Calendar } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { KBArticle } from '../types';

interface KBArticleComposerProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<KBArticle>;
  mode?: 'create' | 'edit';
}

export const KBArticleComposer: React.FC<KBArticleComposerProps> = ({
  isOpen,
  onClose,
  initialData,
  mode = 'create'
}) => {
  const { upsertRecord } = useCRM();

  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [keywords, setKeywords] = useState(initialData?.keywords?.join(', ') || '');
  const [status, setStatus] = useState(initialData?.status || 'draft');
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true);

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('Please enter an article title');
      return;
    }
    if (!content.trim()) {
      alert('Please enter article content');
      return;
    }

    const article: Partial<KBArticle> = {
      ...(initialData?.id && { id: initialData.id }),
      title: title.trim(),
      content: content.trim(),
      summary: summary.trim() || undefined,
      categoryId: categoryId || undefined,
      keywords: keywords.trim() ? keywords.split(',').map(k => k.trim()) : undefined,
      status: status as any,
      isPublic,
      publishedAt: status === 'published' && !initialData?.publishedAt ? new Date().toISOString() : initialData?.publishedAt,
      viewCount: initialData?.viewCount || 0,
      helpfulCount: initialData?.helpfulCount || 0,
      notHelpfulCount: initialData?.notHelpfulCount || 0,
    };

    upsertRecord('kbArticles', article);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[45px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <BookOpen size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                {mode === 'create' ? 'New KB Article' : 'Edit KB Article'}
              </h2>
              <p className="text-white/80 font-bold text-sm mt-1">
                {mode === 'create' ? 'Create knowledge base article' : 'Update article details'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Article Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="How to create a new contact"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Summary
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                placeholder="Brief summary of the article..."
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Content *
              </label>
              <div className="relative">
                <FileText size={16} className="absolute left-4 top-4 text-slate-400" />
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  placeholder="Article content in Markdown..."
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all resize-none font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Category ID
                </label>
                <input
                  type="text"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  placeholder="cat-123"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Status
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Keywords (comma-separated)
              </label>
              <div className="relative">
                <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="contact, create, tutorial"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
              />
              <label htmlFor="isPublic" className="text-sm font-bold text-slate-700 cursor-pointer">
                Article is publicly visible
              </label>
            </div>

            {mode === 'edit' && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-cyan-50 border border-cyan-200 rounded-2xl">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Eye size={16} className="text-cyan-600" />
                    <span className="text-xs font-black text-slate-700 uppercase">Views</span>
                  </div>
                  <p className="text-2xl font-black text-cyan-600">{initialData?.viewCount || 0}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <ThumbsUp size={16} className="text-emerald-600" />
                    <span className="text-xs font-black text-slate-700 uppercase">Helpful</span>
                  </div>
                  <p className="text-2xl font-black text-emerald-600">{initialData?.helpfulCount || 0}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <ThumbsUp size={16} className="text-rose-600 rotate-180" />
                    <span className="text-xs font-black text-slate-700 uppercase">Not Helpful</span>
                  </div>
                  <p className="text-2xl font-black text-rose-600">{initialData?.notHelpfulCount || 0}</p>
                </div>
              </div>
            )}
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
            className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/20"
          >
            {mode === 'create' ? 'Create Article' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
