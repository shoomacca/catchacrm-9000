import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Megaphone, TrendingUp, Users, Target, MousePointer2,
  MailOpen, ArrowUpRight, ArrowDownRight, Plus, Activity,
  Star, Gift, FileText, MessageSquare, Calculator,
  AlertCircle, TrendingDown, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCRM } from '../context/CRMContext';

const MetricCard = ({ label, value, icon: Icon, color, alert, onClick }: any) => (
  <div
    onClick={onClick}
    className={`bg-white border ${alert ? 'border-amber-300 shadow-amber-100' : 'border-slate-200'} p-8 rounded-[35px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden group`}
  >
    {alert && (
      <div className="absolute top-3 right-3">
        <AlertCircle size={16} className="text-amber-500" />
      </div>
    )}
    <div className={`w-12 h-12 ${color} bg-opacity-10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      <Icon size={24} className={color} />
    </div>
    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-black text-slate-900">{value}</p>
  </div>
);

const StatusRow = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full bg-${color}-500`} />
      <span className="text-sm font-bold text-slate-700">{label}</span>
    </div>
    <span className="text-lg font-black text-slate-900">{value}</span>
  </div>
);

const MarketingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    marketingStats, openModal, campaigns, leads,
    reviews, referralRewards, inboundForms, chatWidgets, calculators
  } = useCRM();

  const marketingModuleStats = useMemo(() => {
    // Reviews stats
    const totalReviews = reviews.length;
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    const positiveReviews = reviews.filter(r => r.rating >= 4).length;
    const negativeReviews = reviews.filter(r => r.rating <= 2).length;
    const pendingReply = reviews.filter(r => !r.replied).length;

    // Referral Rewards stats
    const activeReferrals = referralRewards.filter(r => r.status === 'Active').length;
    const pendingPayouts = referralRewards.filter(r => r.status === 'Pending Payout').length;
    const completedReferrals = referralRewards.filter(r => r.status === 'Paid').length;
    const totalReferralValue = referralRewards
      .filter(r => r.status === 'Pending Payout' || r.status === 'Paid')
      .reduce((sum, r) => sum + r.rewardAmount, 0);

    // Inbound Forms stats
    const activeForms = inboundForms.filter(f => f.status === 'Active').length;
    const totalSubmissions = inboundForms.reduce((sum, f) => sum + f.submissionCount, 0);
    const avgConversionRate = inboundForms.length > 0
      ? inboundForms.reduce((sum, f) => sum + f.conversionRate, 0) / inboundForms.length
      : 0;

    // Chat Widgets stats
    const activeWidgets = chatWidgets.filter(w => w.status === 'Active').length;
    const totalConversations = chatWidgets.reduce((sum, w) => sum + w.conversations, 0);
    const avgResponseTime = chatWidgets.length > 0
      ? chatWidgets.reduce((sum, w) => sum + w.avgResponseTime, 0) / chatWidgets.length
      : 0;

    // Calculators stats
    const activeCalculators = calculators.filter(c => c.status === 'Active').length;
    const totalCalculations = calculators.reduce((sum, c) => sum + c.usageCount, 0);
    const avgLeadConversion = calculators.length > 0
      ? calculators.reduce((sum, c) => sum + c.leadConversionRate, 0) / calculators.length
      : 0;

    return {
      reviews: { total: totalReviews, avgRating, positive: positiveReviews, negative: negativeReviews, pendingReply },
      referrals: { active: activeReferrals, pending: pendingPayouts, completed: completedReferrals, totalValue: totalReferralValue },
      forms: { active: activeForms, submissions: totalSubmissions, conversionRate: avgConversionRate },
      widgets: { active: activeWidgets, conversations: totalConversations, avgResponseTime },
      calculators: { active: activeCalculators, calculations: totalCalculations, leadConversion: avgLeadConversion }
    };
  }, [reviews, referralRewards, inboundForms, chatWidgets, calculators]);

  const sourceData = (Object.entries(marketingStats.leadsBySource) as [string, number][]).map(([name, leads]) => ({
    name,
    leads
  })).sort((a, b) => b.leads - a.leads);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto animate-slide-up pb-10">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Growth Engine</h1>
          <p className="text-slate-400 font-semibold">Attribution, campaign ROI, lead sourcing, and marketing automation.</p>
        </div>
        <button
          onClick={() => openModal('campaigns')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-sm font-black transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus size={18} /> Launch Campaign
        </button>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          label="Marketing ROI"
          value={`${marketingStats.roi.toFixed(1)}x`}
          icon={TrendingUp}
          color="text-emerald-600"
          onClick={() => navigate('/campaigns')}
        />
        <MetricCard
          label="Lead Sourcing"
          value={marketingStats.totalLeads}
          icon={Target}
          color="text-blue-600"
          onClick={() => navigate('/leads')}
        />
        <MetricCard
          label="Avg Rating"
          value={marketingModuleStats.reviews.avgRating.toFixed(1)}
          icon={Star}
          color="text-amber-600"
          alert={marketingModuleStats.reviews.pendingReply > 0}
          onClick={() => navigate('/reviews')}
        />
        <MetricCard
          label="Active Referrals"
          value={marketingModuleStats.referrals.active}
          icon={Gift}
          color="text-violet-600"
          onClick={() => navigate('/referralRewards')}
        />
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <FileText size={20} className="text-blue-600" />
            <h3 className="text-sm font-black text-slate-700">Inbound Forms</h3>
          </div>
          <p className="text-3xl font-black text-slate-900">{marketingModuleStats.forms.submissions}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            Total Submissions • {marketingModuleStats.forms.conversionRate.toFixed(1)}% Conversion
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare size={20} className="text-green-600" />
            <h3 className="text-sm font-black text-slate-700">Chat Widgets</h3>
          </div>
          <p className="text-3xl font-black text-slate-900">{marketingModuleStats.widgets.conversations}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            Conversations • {marketingModuleStats.widgets.avgResponseTime.toFixed(0)}s Avg Response
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <Calculator size={20} className="text-purple-600" />
            <h3 className="text-sm font-black text-slate-700">Calculators</h3>
          </div>
          <p className="text-3xl font-black text-slate-900">{marketingModuleStats.calculators.calculations}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            Total Uses • {marketingModuleStats.calculators.leadConversion.toFixed(1)}% Lead Gen
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Distribution Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-10 rounded-[45px] shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Activity size={20} className="text-blue-600" />
              Lead Distribution by Source
            </h3>
          </div>
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sourceData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ border: 'none', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'black' }}
                />
                <Area type="monotone" dataKey="leads" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLeads)" strokeWidth={5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign ROI */}
        <div className="bg-white border border-slate-200 rounded-[45px] p-10 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black">Campaign ROI</h3>
            <button onClick={() => navigate('/campaigns')} className="text-slate-400 hover:text-slate-900">
              <ArrowUpRight size={20} />
            </button>
          </div>
          <div className="space-y-8 flex-1">
            {marketingStats.campaignPerformance.slice(0, 5).map((c) => (
              <div key={c.id} className="group cursor-pointer" onClick={() => openModal('campaigns', c)}>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">{c.name}</p>
                  <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    {c.roi.toFixed(1)}x ROI
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-blue-600 transition-all duration-1000`} style={{ width: `${Math.min((c.roi / 5) * 100, 100)}%` }}></div>
                </div>
                <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">
                  <span>Budget: ${c.budget.toLocaleString()}</span>
                  <span>Rev: ${c.revenueGenerated.toLocaleString()}</span>
                </div>
              </div>
            ))}
            {marketingStats.campaignPerformance.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Megaphone size={32} strokeWidth={1} className="mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest text-center">No campaigns launched yet</p>
              </div>
            )}
          </div>
          <Link
            to="/campaigns"
            className="w-full mt-10 py-4 border-2 border-dashed border-slate-100 rounded-[25px] text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50 transition-all tracking-widest text-center"
          >
            View Attribution Insights
          </Link>
        </div>
      </div>

      {/* Reviews & Referrals Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reviews Breakdown */}
        <div className="bg-white border border-slate-200 p-10 rounded-[45px] shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Star size={20} className="text-amber-600" />
              Review Sentiment
            </h3>
            <Link to="/reviews" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="mb-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-[25px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-black text-slate-700">Average Rating</span>
              <div className="flex items-center gap-2">
                <Star size={20} className="text-amber-500 fill-amber-500" />
                <span className="text-2xl font-black text-slate-900">{marketingModuleStats.reviews.avgRating.toFixed(1)}</span>
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Based on {marketingModuleStats.reviews.total} reviews
            </p>
          </div>

          <div className="space-y-4">
            <StatusRow label="Positive (4-5 stars)" value={marketingModuleStats.reviews.positive} color="emerald" />
            <StatusRow label="Negative (1-2 stars)" value={marketingModuleStats.reviews.negative} color="rose" />
            <StatusRow label="Pending Reply" value={marketingModuleStats.reviews.pendingReply} color="amber" />
          </div>

          {marketingModuleStats.reviews.pendingReply > 0 && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-[20px] flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">Action Required</p>
                <p className="text-[10px] font-semibold text-slate-600 mt-1">
                  {marketingModuleStats.reviews.pendingReply} reviews need responses
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Referral Rewards Breakdown */}
        <div className="bg-white border border-slate-200 p-10 rounded-[45px] shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Gift size={20} className="text-violet-600" />
              Referral Program
            </h3>
            <Link to="/referralRewards" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="mb-8 p-6 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-[25px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-black text-slate-700">Pending Payouts</span>
              <span className="text-2xl font-black text-slate-900">
                ${marketingModuleStats.referrals.totalValue.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {marketingModuleStats.referrals.pending} referrals awaiting payment
            </p>
          </div>

          <div className="space-y-4">
            <StatusRow label="Active Referrals" value={marketingModuleStats.referrals.active} color="blue" />
            <StatusRow label="Pending Payout" value={marketingModuleStats.referrals.pending} color="amber" />
            <StatusRow label="Completed & Paid" value={marketingModuleStats.referrals.completed} color="emerald" />
          </div>

          {marketingModuleStats.referrals.pending > 0 && (
            <div className="mt-6 p-4 bg-violet-50 border border-violet-200 rounded-[20px] flex items-start gap-3">
              <Gift size={18} className="text-violet-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">Payouts Ready</p>
                <p className="text-[10px] font-semibold text-slate-600 mt-1">
                  Process {marketingModuleStats.referrals.pending} pending reward payments
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Forms & Widgets Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Form Submissions */}
        <div className="bg-white border border-slate-200 p-10 rounded-[45px] shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              Top Performing Forms
            </h3>
            <Link to="/inboundForms" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="space-y-6">
            {inboundForms.slice(0, 5).map((form) => (
              <Link
                key={form.id}
                to={`/inboundForms/${form.id}`}
                className="block group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{form.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                      {form.type} • {form.fields.length} fields
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900">{form.submissionCount}</p>
                    <p className="text-[9px] font-bold text-emerald-600 uppercase">
                      {form.conversionRate.toFixed(1)}% CVR
                    </p>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 transition-all" style={{ width: `${form.conversionRate}%` }} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Chat Widget Activity */}
        <div className="bg-white border border-slate-200 p-10 rounded-[45px] shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black flex items-center gap-2">
              <MessageSquare size={20} className="text-green-600" />
              Live Chat Performance
            </h3>
            <Link to="/chatWidgets" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="space-y-6">
            {chatWidgets.slice(0, 5).map((widget) => (
              <Link
                key={widget.id}
                to={`/chatWidgets/${widget.id}`}
                className="block group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-black text-slate-900 group-hover:text-green-600 transition-colors">{widget.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                      {widget.page} • {widget.avgResponseTime.toFixed(0)}s response
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${widget.status === 'Active' ? 'bg-green-500' : 'bg-slate-300'}`} />
                    <p className="text-lg font-black text-slate-900">{widget.conversations}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard;
