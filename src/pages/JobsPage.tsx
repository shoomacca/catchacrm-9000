import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Search, Plus, Download, Filter, Calendar,
  MapPin, Clock, CheckCircle2, AlertCircle, TrendingUp,
  Users, DollarSign, ArrowUp, ArrowDown, ArrowUpDown,
  Wrench, FileText
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { JobComposer } from '../components/JobComposer';

type SortField = 'date' | 'priority' | 'status' | 'value';
type SortDirection = 'asc' | 'desc';
type FilterStatus = 'all' | 'scheduled' | 'inprogress' | 'completed' | 'cancelled';

const JobsPage: React.FC = () => {
  const navigate = useNavigate();
  const { jobs, openModal } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [showJobComposer, setShowJobComposer] = useState(false);

  // Calculate summary stats
  const stats = useMemo(() => {
    const allJobs = jobs || [];
    return {
      total: allJobs.length,
      scheduled: allJobs.filter(j => (j as any).status === 'Scheduled').length,
      inProgress: allJobs.filter(j => (j as any).status === 'In Progress').length,
      completed: allJobs.filter(j => (j as any).status === 'Completed').length,
      cancelled: allJobs.filter(j => (j as any).status === 'Cancelled').length,
      totalValue: allJobs.reduce((sum, j) => sum + ((j as any).value || 0), 0),
      avgValue: allJobs.length > 0 ? allJobs.reduce((sum, j) => sum + ((j as any).value || 0), 0) / allJobs.length : 0,
    };
  }, [jobs]);

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let filtered = jobs || [];

    // Status filter
    if (filterStatus !== 'all') {
      const statusMap: Record<FilterStatus, string> = {
        scheduled: 'Scheduled',
        inprogress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled',
        all: ''
      };
      filtered = filtered.filter(j => (j as any).status === statusMap[filterStatus]);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(j =>
        (j.name || j.subject || j.jobNumber).toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ((j as any).zone || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case 'date':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case 'priority':
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          aVal = priorityOrder[(a as any).priority as keyof typeof priorityOrder] || 0;
          bVal = priorityOrder[(b as any).priority as keyof typeof priorityOrder] || 0;
          break;
        case 'status':
          aVal = (a as any).status || '';
          bVal = (b as any).status || '';
          break;
        case 'value':
          aVal = (a as any).value || 0;
          bVal = (b as any).value || 0;
          break;
        default:
          aVal = 0;
          bVal = 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [jobs, filterStatus, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="text-slate-300" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} className="text-blue-600" />
    ) : (
      <ArrowDown size={12} className="text-blue-600" />
    );
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedJobs);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedJobs(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedJobs.size === filteredJobs.length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(filteredJobs.map(j => j.id)));
    }
  };

  const exportToCSV = () => {
    const jobsToExport = selectedJobs.size > 0
      ? filteredJobs.filter(j => selectedJobs.has(j.id))
      : filteredJobs;

    const headers = ['ID', 'Name', 'Status', 'Priority', 'Zone', 'Date', 'Value'];
    const rows = jobsToExport.map(j => [
      j.id,
      j.name || j.subject || j.jobNumber,
      (j as any).status || '',
      (j as any).priority || '',
      (j as any).zone || '',
      new Date(j.createdAt).toLocaleDateString(),
      (j as any).value || 0
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobs-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const configs: Record<string, { bg: string; text: string; border: string }> = {
      'Scheduled': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      'In Progress': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      'Completed': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      'Cancelled': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    };

    const config = configs[status] || configs['Scheduled'];

    return (
      <span className={`px-3 py-1 ${config.bg} ${config.text} text-[9px] font-black uppercase tracking-wider rounded-full border ${config.border}`}>
        {status}
      </span>
    );
  };

  const PriorityBadge = ({ priority }: { priority: string }) => {
    const configs: Record<string, { bg: string; text: string; border: string }> = {
      'High': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
      'Medium': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      'Low': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
    };

    const config = configs[priority] || configs['Medium'];

    return (
      <span className={`px-3 py-1 ${config.bg} ${config.text} text-[9px] font-black uppercase tracking-wider rounded-full border ${config.border}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Field Services</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Jobs</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:border-slate-300 hover:shadow-md transition-all"
          >
            <Download size={16} />
            Export {selectedJobs.size > 0 ? `(${selectedJobs.size})` : ''}
          </button>
          <button
            onClick={() => setShowJobComposer(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all"
          >
            <Plus size={16} />
            New Job
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Jobs</p>
          <p className="text-3xl font-black text-slate-900">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-1">Across all zones</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">In Progress</p>
          <p className="text-3xl font-black text-slate-900">{stats.inProgress}</p>
          <p className="text-xs text-slate-500 mt-1">Active work orders</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Completed</p>
          <p className="text-3xl font-black text-slate-900">{stats.completed}</p>
          <p className="text-xs text-slate-500 mt-1">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% completion rate</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Value</p>
          <p className="text-3xl font-black text-slate-900">${stats.totalValue.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Avg ${Math.round(stats.avgValue).toLocaleString()} per job</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-[25px] shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search jobs..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            } transition-all`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('scheduled')}
            className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider ${
              filterStatus === 'scheduled'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            } transition-all`}
          >
            Scheduled
          </button>
          <button
            onClick={() => setFilterStatus('inprogress')}
            className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider ${
              filterStatus === 'inprogress'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            } transition-all`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider ${
              filterStatus === 'completed'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            } transition-all`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedJobs.size > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-4 rounded-[25px] shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between text-white">
            <span className="text-sm font-black uppercase tracking-wide">
              {selectedJobs.size} job{selectedJobs.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button disabled title="Coming soon" className="bg-white/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all opacity-50 cursor-not-allowed">
                Assign Crew
              </button>
              <button disabled title="Coming soon" className="bg-white/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all opacity-50 cursor-not-allowed">
                Update Status
              </button>
              <button
                onClick={() => setSelectedJobs(new Set())}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jobs Table */}
      <div className="bg-white border border-slate-200 rounded-[25px] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left p-4">
                <input
                  type="checkbox"
                  checked={selectedJobs.size === filteredJobs.length && filteredJobs.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th
                className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-2">
                  Date
                  <SortIcon field="date" />
                </div>
              </th>
              <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Details</th>
              <th
                className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center gap-2">
                  Priority
                  <SortIcon field="priority" />
                </div>
              </th>
              <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Zone</th>
              <th
                className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  Status
                  <SortIcon field="status" />
                </div>
              </th>
              <th
                className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort('value')}
              >
                <div className="flex items-center gap-2">
                  Value
                  <SortIcon field="value" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredJobs.map((job) => {
              const jobData = job as any;
              const isExpanded = expandedId === job.id;

              return (
                <React.Fragment key={job.id}>
                  <tr
                    className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${isExpanded ? 'bg-slate-50' : ''}`}
                    onClick={() => setExpandedId(isExpanded ? null : job.id)}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedJobs.has(job.id)}
                        onChange={() => toggleSelection(job.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{new Date(job.createdAt).toLocaleDateString()}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(job.createdAt).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{job.name || job.subject || job.jobNumber}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID: {job.id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <PriorityBadge priority={jobData.priority || 'Medium'} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-600">{jobData.zone || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={jobData.status || 'Scheduled'} />
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-slate-900">${(jobData.value || 0).toLocaleString()}</span>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={7} className="px-8 py-0">
                        <div className="py-6 border-b border-slate-200">
                          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-[25px] p-6 border border-slate-200">
                            <div className="grid grid-cols-3 gap-6 mb-6">
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Crew Assigned</p>
                                <div className="flex items-center gap-2">
                                  <Users size={14} className="text-blue-600" />
                                  <p className="text-sm font-bold text-slate-900">{jobData.crew || 'Not assigned'}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Equipment</p>
                                <div className="flex items-center gap-2">
                                  <Wrench size={14} className="text-blue-600" />
                                  <p className="text-sm font-bold text-slate-900">{jobData.equipment || 'None'}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Scheduled Time</p>
                                <div className="flex items-center gap-2">
                                  <Clock size={14} className="text-blue-600" />
                                  <p className="text-sm font-bold text-slate-900">{jobData.scheduledTime || 'TBD'}</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/jobs/${jobData.id}`);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-[20px] text-xs font-bold uppercase tracking-wide shadow-md active:scale-95 transition-all"
                              >
                                View Details
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModal('jobs', jobData);
                                }}
                                className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-[20px] text-xs font-bold uppercase tracking-wide border border-slate-200 active:scale-95 transition-all"
                              >
                                Edit
                              </button>
                              <button disabled title="Coming soon" className="bg-white text-slate-400 px-4 py-2 rounded-[20px] text-xs font-bold uppercase tracking-wide border border-slate-200 opacity-50 cursor-not-allowed">
                                Assign Crew
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {filteredJobs.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase size={40} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No jobs found</h3>
            <p className="text-slate-500 mb-6">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your filters or search query.'
                : 'Create your first job to get started.'}
            </p>
          </div>
        )}
      </div>

      {/* Job Composer Modal */}
      <JobComposer
        isOpen={showJobComposer}
        onClose={() => setShowJobComposer(false)}
        mode="create"
      />
    </div>
  );
};

export default JobsPage;
