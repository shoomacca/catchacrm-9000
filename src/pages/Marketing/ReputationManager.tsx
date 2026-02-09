import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../../context/CRMContext';
import {
  Star, ThumbsUp, ThumbsDown, Send, MessageSquare, AlertCircle,
  TrendingUp, Award, Filter, Search, ExternalLink, ChevronRight,
  Check, X, Clock, Mail, Zap, Plus, Eye, Edit3
} from 'lucide-react';

type PlatformFilter = 'all' | 'Google' | 'Facebook' | 'Yelp' | 'Trustpilot' | 'Internal';
type StatusFilter = 'all' | 'New' | 'Replied' | 'Escalated' | 'Ignored';
type SentimentFilter = 'all' | 'Positive' | 'Neutral' | 'Negative';

const ReputationManager: React.FC = () => {
  const navigate = useNavigate();
  const { reviews, jobs, contacts, accounts, settings, openModal, upsertRecord } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('all');
  const [selectedReview, setSelectedReview] = useState<typeof reviews[0] | null>(null);
  const [replyText, setReplyText] = useState('');

  // Calculate stats
  const stats = useMemo(() => {
    const totalReviews = reviews.length;
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    const positiveReviews = reviews.filter(r => r.sentiment === 'Positive').length;
    const negativeReviews = reviews.filter(r => r.sentiment === 'Negative').length;
    const pendingReply = reviews.filter(r => r.status === 'New').length;
    const replyRate = totalReviews > 0
      ? (reviews.filter(r => r.status === 'Replied').length / totalReviews) * 100
      : 0;

    // Platform breakdown
    const platformBreakdown: Record<string, number> = {};
    reviews.forEach(r => {
      platformBreakdown[r.platform] = (platformBreakdown[r.platform] || 0) + 1;
    });

    return {
      totalReviews,
      avgRating,
      positiveReviews,
      negativeReviews,
      pendingReply,
      replyRate,
      platformBreakdown
    };
  }, [reviews]);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    let filtered = [...reviews];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.authorName.toLowerCase().includes(query) ||
        r.content.toLowerCase().includes(query)
      );
    }

    if (platformFilter !== 'all') {
      filtered = filtered.filter(r => r.platform === platformFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (sentimentFilter !== 'all') {
      filtered = filtered.filter(r => r.sentiment === sentimentFilter);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reviews, searchQuery, platformFilter, statusFilter, sentimentFilter]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Neutral': return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'Negative': return 'bg-rose-50 text-rose-600 border-rose-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return <ThumbsUp size={14} />;
      case 'Neutral': return <MessageSquare size={14} />;
      case 'Negative': return <ThumbsDown size={14} />;
      default: return <MessageSquare size={14} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Replied': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Escalated': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'Ignored': return 'bg-slate-50 text-slate-400 border-slate-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const getPlatformIcon = (platform: string) => {
    const className = "text-xs font-bold";
    switch (platform) {
      case 'Google': return <span className={className}>G</span>;
      case 'Facebook': return <span className={className}>f</span>;
      case 'Yelp': return <span className={className}>Y</span>;
      case 'Trustpilot': return <span className={className}>T</span>;
      default: return <MessageSquare size={14} />;
    }
  };

  const handleReply = () => {
    if (!selectedReview || !replyText.trim()) return;

    upsertRecord('reviews', {
      ...selectedReview,
      status: 'Replied',
      replyContent: replyText,
      repliedAt: new Date().toISOString()
    });

    setReplyText('');
    setSelectedReview(null);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marketing</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Reputation Manager</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:border-slate-300 hover:shadow-md transition-all"
          >
            <Filter size={16} />
            Configure
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Reviews</p>
          <p className="text-3xl font-black text-slate-900">{stats.totalReviews}</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Avg Rating</p>
          <p className="text-3xl font-black text-slate-900">{stats.avgRating.toFixed(1)}</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Positive</p>
          <p className="text-3xl font-black text-slate-900">{stats.positiveReviews}</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Negative</p>
          <p className="text-3xl font-black text-slate-900">{stats.negativeReviews}</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pending Reply</p>
          <p className="text-3xl font-black text-slate-900">{stats.pendingReply}</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reply Rate</p>
          <p className="text-3xl font-black text-slate-900">{stats.replyRate.toFixed(0)}%</p>
        </div>
      </div>

      {/* Gatekeeper Workflow Info */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-[25px] p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
              <Zap size={20} className="text-amber-600" />
              Review Gatekeeper Workflow
            </h2>
            <p className="text-sm text-slate-600 mb-4">Automated review collection that protects your reputation</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ThumbsUp size={16} className="text-emerald-600" />
                </div>
                <div>
                  <p className="font-black text-slate-900 mb-1">Positive Response</p>
                  <p className="text-xs text-slate-600">Directs happy customers to Google/Facebook review pages</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ThumbsDown size={16} className="text-rose-600" />
                </div>
                <div>
                  <p className="font-black text-slate-900 mb-1">Negative Response</p>
                  <p className="text-xs text-slate-600">Captures feedback privately to resolve issues internally</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => openModal('automationWorkflows')}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:border-slate-300 hover:shadow-md transition-all"
            >
              <Eye size={16} />
              View
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 p-4 rounded-[25px] shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as PlatformFilter)}
            className="px-4 py-3 bg-slate-50 border-0 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Platforms</option>
            <option value="Google">Google</option>
            <option value="Facebook">Facebook</option>
            <option value="Yelp">Yelp</option>
            <option value="Trustpilot">Trustpilot</option>
            <option value="Internal">Internal</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-4 py-3 bg-slate-50 border-0 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="Replied">Replied</option>
            <option value="Escalated">Escalated</option>
            <option value="Ignored">Ignored</option>
          </select>

          {/* Sentiment Filter */}
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value as SentimentFilter)}
            className="px-4 py-3 bg-slate-50 border-0 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Sentiments</option>
            <option value="Positive">Positive</option>
            <option value="Neutral">Neutral</option>
            <option value="Negative">Negative</option>
          </select>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReviews.map((review, index) => (
          <div
            key={review.id}
            className="bg-white border border-slate-200 rounded-[25px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            onClick={() => setSelectedReview(review)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-600">
                  {review.authorName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{review.authorName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(review.rating)}
                    <span className="text-xs text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                  review.platform === 'Google' ? 'bg-blue-50 text-blue-600' :
                  review.platform === 'Facebook' ? 'bg-indigo-50 text-indigo-600' :
                  review.platform === 'Yelp' ? 'bg-red-50 text-red-600' :
                  'bg-slate-50 text-slate-600'
                }`}>
                  {review.platform}
                </span>
              </div>
            </div>

            {/* Content */}
            <p className="text-sm text-slate-700 mb-4 line-clamp-3">{review.content}</p>

            {/* Reply Status */}
            {review.status === 'Replied' && review.replyContent && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Reply</p>
                <p className="text-xs text-slate-600 line-clamp-2">{review.replyContent}</p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border flex items-center gap-1 ${getSentimentColor(review.sentiment)}`}>
                  {getSentimentIcon(review.sentiment)}
                  {review.sentiment}
                </span>
                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${getStatusColor(review.status)}`}>
                  {review.status}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedReview(review);
                }}
                className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700"
              >
                <Edit3 size={14} />
                Respond
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredReviews.length === 0 && (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-[25px]">
          <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-black text-slate-900 mb-2">No Reviews Found</h3>
          <p className="text-sm text-slate-500">
            {searchQuery || platformFilter !== 'all' || statusFilter !== 'all' || sentimentFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Reviews will appear here as customers provide feedback'}
          </p>
        </div>
      )}

      {/* Review Reply Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[25px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto animate-slide-up">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-600 text-lg">
                    {selectedReview.authorName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900">{selectedReview.authorName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(selectedReview.rating)}
                      <span className="text-xs text-slate-400">
                        {new Date(selectedReview.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedReview(null);
                    setReplyText('');
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase border ${getSentimentColor(selectedReview.sentiment)}`}>
                  {selectedReview.sentiment}
                </span>
                <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase ${
                  selectedReview.platform === 'Google' ? 'bg-blue-50 text-blue-600' :
                  selectedReview.platform === 'Facebook' ? 'bg-indigo-50 text-indigo-600' :
                  'bg-slate-50 text-slate-600'
                }`}>
                  {selectedReview.platform}
                </span>
              </div>
            </div>

            {/* Review Content */}
            <div className="p-8 border-b border-slate-100">
              <p className="text-sm text-slate-700 leading-relaxed">{selectedReview.content}</p>
            </div>

            {/* Existing Reply */}
            {selectedReview.replyContent && (
              <div className="p-8 border-b border-slate-100 bg-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Reply</p>
                <p className="text-sm text-slate-700">{selectedReview.replyContent}</p>
                {selectedReview.repliedAt && (
                  <p className="text-xs text-slate-400 mt-2">
                    Replied on {new Date(selectedReview.repliedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Reply Form */}
            <div className="p-8">
              <label className="text-xs font-black text-slate-600 uppercase tracking-widest mb-3 block">
                {selectedReview.replyContent ? 'Update Reply' : 'Write Reply'}
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your response..."
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm resize-none"
                rows={6}
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setSelectedReview(null);
                    setReplyText('');
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:border-slate-300 hover:shadow-md transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReputationManager;
