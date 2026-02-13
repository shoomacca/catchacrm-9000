import React, { useState, useEffect } from 'react';
import { useCRM } from '../context/CRMContext';
import { Book, Plus, Search, FolderOpen, FileText, Eye, ThumbsUp, ThumbsDown, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { KBArticle, KBCategory } from '../types';

export const KnowledgeBase: React.FC = () => {
  const { kbCategories, kbArticles, upsertRecord, deleteRecord, openModal, currentUser } = useCRM();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(null);

  // Seed default categories if none exist
  useEffect(() => {
    if (kbCategories.length === 0) {
      const defaultCategories = [
        { name: 'Getting Started', description: 'New user guides and onboarding', sortOrder: 1, isActive: true },
        { name: 'FAQ', description: 'Frequently asked questions', sortOrder: 2, isActive: true },
        { name: 'Troubleshooting', description: 'Common issues and solutions', sortOrder: 3, isActive: true },
        { name: 'Best Practices', description: 'Tips and recommended workflows', sortOrder: 4, isActive: true }
      ];
      defaultCategories.forEach(cat => {
        upsertRecord('kbCategories', cat);
      });
    }
  }, [kbCategories.length, upsertRecord]);

  // Filter articles by category and search
  const filteredArticles = kbArticles.filter(article => {
    const matchesCategory = !selectedCategory || article.categoryId === selectedCategory;
    const matchesSearch = !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.summary || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && article.status === 'published';
  });

  // Get article count per category
  const getCategoryCount = (categoryId: string) => {
    return kbArticles.filter(a => a.categoryId === categoryId && a.status === 'published').length;
  };

  const handleArticleView = (article: KBArticle) => {
    setSelectedArticle(article);
    // Increment view count
    if (article.id) {
      upsertRecord('kbArticles', {
        id: article.id,
        viewCount: (article.viewCount || 0) + 1
      });
    }
  };

  const handleHelpful = (helpful: boolean) => {
    if (selectedArticle?.id) {
      upsertRecord('kbArticles', {
        id: selectedArticle.id,
        helpfulCount: helpful ? (selectedArticle.helpfulCount || 0) + 1 : selectedArticle.helpfulCount,
        notHelpfulCount: !helpful ? (selectedArticle.notHelpfulCount || 0) + 1 : selectedArticle.notHelpfulCount
      });
    }
  };

  const handleDeleteArticle = (articleId: string) => {
    if (window.confirm('Delete this article?')) {
      deleteRecord('kbArticles', articleId);
      setSelectedArticle(null);
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    const articlesInCategory = kbArticles.filter(a => a.categoryId === categoryId);
    if (articlesInCategory.length > 0) {
      alert(`Cannot delete category with ${articlesInCategory.length} articles. Please delete or move the articles first.`);
      return;
    }
    if (window.confirm('Delete this category?')) {
      deleteRecord('kbCategories', categoryId);
      if (selectedCategory === categoryId) {
        setSelectedCategory(null);
      }
    }
  };

  if (selectedArticle) {
    // Article detail view
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedArticle(null)}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-bold mb-6"
        >
          <ArrowLeft size={20} />
          Back to Articles
        </button>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-black text-slate-900 mb-2">{selectedArticle.title}</h1>
              {selectedArticle.summary && (
                <p className="text-lg text-slate-600 font-medium">{selectedArticle.summary}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openModal('kbArticles', selectedArticle)}
                className="p-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => handleDeleteArticle(selectedArticle.id)}
                className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-500 mb-8 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-1">
              <Eye size={16} />
              {selectedArticle.viewCount || 0} views
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp size={16} />
              {selectedArticle.helpfulCount || 0}
            </div>
            <div className="flex items-center gap-1">
              <ThumbsDown size={16} />
              {selectedArticle.notHelpfulCount || 0}
            </div>
          </div>

          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
              {selectedArticle.content}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200">
            <p className="text-sm font-bold text-slate-600 mb-4">Was this article helpful?</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleHelpful(true)}
                className="px-6 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all flex items-center gap-2"
              >
                <ThumbsUp size={16} />
                Yes, helpful
              </button>
              <button
                onClick={() => handleHelpful(false)}
                className="px-6 py-3 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                <ThumbsDown size={16} />
                Not helpful
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main KB view with categories and articles list
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Categories Sidebar */}
      <div className="w-80 bg-slate-50 border-r border-slate-200 p-6 overflow-y-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
              <Book size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Knowledge Base</h2>
              <p className="text-xs text-slate-500 font-bold">Internal documentation</p>
            </div>
          </div>

          <button
            onClick={() => openModal('kbCategories')}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-xl text-sm font-black uppercase tracking-wider hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            New Category
          </button>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`w-full px-4 py-3 rounded-xl text-left font-bold text-sm transition-all flex items-center justify-between ${
              !selectedCategory
                ? 'bg-purple-100 text-purple-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <FolderOpen size={16} />
              All Articles
            </div>
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
              {kbArticles.filter(a => a.status === 'published').length}
            </span>
          </button>

          {kbCategories.filter(c => c.isActive !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(category => (
            <div key={category.id} className="relative group">
              <button
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full px-4 py-3 rounded-xl text-left font-bold text-sm transition-all flex items-center justify-between ${
                  selectedCategory === category.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FolderOpen size={16} />
                  {category.name}
                </div>
                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                  {getCategoryCount(category.id)}
                </span>
              </button>
              <button
                onClick={() => handleDeleteCategory(category.id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 bg-rose-500 text-white rounded text-xs transition-opacity"
                title="Delete category"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Articles List */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          {/* Search and New Article */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>
            <button
              onClick={() => openModal('kbArticles', {
                categoryId: selectedCategory,
                status: 'draft',
                authorId: currentUser?.id
              })}
              className="px-6 py-4 bg-purple-600 text-white rounded-2xl text-sm font-black uppercase tracking-wider hover:bg-purple-700 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={16} />
              New Article
            </button>
          </div>

          {/* Articles Grid */}
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16">
              <FileText size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-bold">
                {searchQuery ? 'No articles found matching your search' : 'No articles yet'}
              </p>
              <button
                onClick={() => openModal('kbArticles', {
                  categoryId: selectedCategory,
                  status: 'draft',
                  authorId: currentUser?.id
                })}
                className="mt-4 text-purple-600 hover:text-purple-700 font-bold"
              >
                Create your first article
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredArticles.map(article => (
                <div
                  key={article.id}
                  onClick={() => handleArticleView(article)}
                  className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer"
                >
                  <h3 className="text-xl font-black text-slate-900 mb-2">{article.title}</h3>
                  {article.summary && (
                    <p className="text-sm text-slate-600 mb-4">{article.summary}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Eye size={14} />
                      {article.viewCount || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp size={14} />
                      {article.helpfulCount || 0}
                    </div>
                    {article.keywords && article.keywords.length > 0 && (
                      <div className="flex gap-1 ml-auto">
                        {article.keywords.slice(0, 3).map((keyword, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
