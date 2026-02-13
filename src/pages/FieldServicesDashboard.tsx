import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Users, MapPin, TrendingUp, Clock, CheckCircle2,
  AlertTriangle, Calendar, DollarSign, Package, Wrench, Activity,
  Download, Search, ChevronDown, Edit2, Trash2, ArrowUp, ArrowDown,
  ArrowUpDown, Filter, Zap
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';

type FilterStatus = 'all' | 'scheduled' | 'inprogress' | 'completed';
type SortField = 'date' | 'priority' | 'zone';
type SortDirection = 'asc' | 'desc';

const FieldServicesDashboard: React.FC = () => {
  const { jobs, crews, zones, equipment, users, settings, dataSource } = useCRM();

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const currencySymbol = settings?.localization?.currencySymbol || '$';

  // Job Statistics
  const jobStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const scheduledToday = jobs.filter(j => j.scheduledDate?.startsWith(today));
    const inProgress = jobs.filter(j => j.status === 'InProgress');
    const completed = jobs.filter(j => j.status === 'Completed');
    const emergency = jobs.filter(j => j.jobType === 'Emergency' && j.status !== 'Completed');
    const scheduled = jobs.filter(j => j.status === 'Scheduled');
    const onHold = jobs.filter(j => j.status === 'OnHold');

    return {
      total: jobs.length,
      scheduledToday: scheduledToday.length,
      inProgress: inProgress.length,
      completed: completed.length,
      emergency: emergency.length,
      scheduled: scheduled.length,
      onHold: onHold.length,
      completionRate: jobs.length > 0 ? ((completed.length / jobs.length) * 100).toFixed(1) : '0'
    };
  }, [jobs]);

  // Crew Statistics
  const crewStats = useMemo(() => {
    const activeCrews = crews.filter(c =>
      jobs.some(j => j.crewId === c.id && j.status === 'InProgress')
    );
    const availableCrews = crews.filter(c =>
      !jobs.some(j => j.crewId === c.id && j.status === 'InProgress')
    );

    return {
      total: crews.length,
      active: activeCrews.length,
      available: availableCrews.length,
      utilization: crews.length > 0 ? ((activeCrews.length / crews.length) * 100).toFixed(0) : '0'
    };
  }, [crews, jobs]);

  // Equipment Statistics
  const equipmentStats = useMemo(() => {
    const needsService = equipment.filter(e => {
      if (!e.nextServiceDate) return false;
      const nextService = new Date(e.nextServiceDate);
      const today = new Date();
      const daysUntil = Math.ceil((nextService.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7;
    });

    const assigned = equipment.filter(e => e.assignedTo);
    const damaged = equipment.filter(e => e.condition === 'Damaged' || e.condition === 'Poor');

    return {
      total: equipment.length,
      needsService: needsService.length,
      assigned: assigned.length,
      damaged: damaged.length,
      utilization: equipment.length > 0 ? ((assigned.length / equipment.length) * 100).toFixed(0) : '0'
    };
  }, [equipment]);

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let filtered = [...jobs];

    // Status filter
    if (filterStatus !== 'all') {
      const statusMap = {
        scheduled: 'Scheduled',
        inprogress: 'InProgress',
        completed: 'Completed'
      };
      filtered = filtered.filter(j => j.status === statusMap[filterStatus]);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(j =>
        j.subject?.toLowerCase().includes(q) ||
        j.zone?.toLowerCase().includes(q) ||
        j.jobType?.toLowerCase().includes(q)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortField) {
        case 'date':
          aVal = new Date(a.scheduledDate || a.createdAt).getTime();
          bVal = new Date(b.scheduledDate || b.createdAt).getTime();
          break;
        case 'priority':
          const priorityMap = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
          aVal = priorityMap[a.priority as keyof typeof priorityMap] || 0;
          bVal = priorityMap[b.priority as keyof typeof priorityMap] || 0;
          break;
        case 'zone':
          aVal = a.zone?.toLowerCase() || '';
          bVal = b.zone?.toLowerCase() || '';
          break;
        default:
          return 0;
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
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredJobs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredJobs.map(j => j.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Job #', 'Subject', 'Type', 'Zone', 'Priority', 'Status'];
    const rows = filteredJobs.map(job => [
      new Date(job.scheduledDate || job.createdAt).toLocaleDateString(),
      job.jobNumber || job.id,
      job.subject || 'Untitled',
      job.jobType,
      job.zone || 'N/A',
      job.priority,
      job.status
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `field-jobs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'InProgress': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Scheduled': return 'bg-violet-50 text-violet-600 border-violet-100';
      case 'OnHold': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Cancelled': return 'bg-slate-50 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Urgent': return <AlertTriangle size={12} className="text-rose-600" />;
      case 'High': return <Zap size={12} className="text-orange-600" />;
      case 'Medium': return <Clock size={12} className="text-amber-600" />;
      default: return <Activity size={12} className="text-slate-400" />;
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

  if (dataSource === 'loading') {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none mb-1">Field Services</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Operations Command Center</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            <Download size={14} /> Export CSV
          </button>
          <Link
            to="/jobs/new"
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            <Briefcase size={14} /> New Job
          </Link>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <Calendar size={20} className="text-blue-600" />
            <h3 className="text-sm font-black text-slate-700">Today's Jobs</h3>
          </div>
          <p className="text-3xl font-black text-blue-600">{jobStats.scheduledToday}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            Scheduled for today
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <Activity size={20} className="text-emerald-600" />
            <h3 className="text-sm font-black text-slate-700">In Progress</h3>
          </div>
          <p className="text-3xl font-black text-emerald-600">{jobStats.inProgress}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            Active now
          </p>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-red-50 border border-rose-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle size={20} className="text-rose-600" />
            <h3 className="text-sm font-black text-slate-700">Emergency Jobs</h3>
          </div>
          <p className="text-3xl font-black text-rose-600">{jobStats.emergency}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {jobStats.emergency > 0 ? 'Requires attention' : 'All clear'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 size={20} className="text-violet-600" />
            <h3 className="text-sm font-black text-slate-700">Completion Rate</h3>
          </div>
          <p className="text-3xl font-black text-violet-600">{jobStats.completionRate}%</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {jobStats.completed} completed
          </p>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Job Status Breakdown */}
        <div className="bg-white border border-slate-200 rounded-[35px] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase size={20} className="text-blue-600" />
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Job Status</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl">
              <span className="text-sm font-bold text-violet-700">Scheduled</span>
              <span className="text-2xl font-black text-violet-600">{jobStats.scheduled}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
              <span className="text-sm font-bold text-blue-700">In Progress</span>
              <span className="text-2xl font-black text-blue-600">{jobStats.inProgress}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl">
              <span className="text-sm font-bold text-emerald-700">Completed</span>
              <span className="text-2xl font-black text-emerald-600">{jobStats.completed}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl">
              <span className="text-sm font-bold text-amber-700">On Hold</span>
              <span className="text-2xl font-black text-amber-600">{jobStats.onHold}</span>
            </div>
          </div>
        </div>

        {/* Crew Utilization */}
        <div className="bg-white border border-slate-200 rounded-[35px] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Users size={20} className="text-emerald-600" />
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Crew Status</h3>
          </div>
          <div className="text-center mb-6">
            <p className="text-5xl font-black text-emerald-600 mb-2">{crewStats.utilization}%</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Utilization</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl text-center border border-blue-100">
              <p className="text-2xl font-black text-blue-600">{crewStats.active}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Active</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl text-center border border-slate-200">
              <p className="text-2xl font-black text-slate-600">{crewStats.available}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Available</p>
            </div>
          </div>
        </div>

        {/* Equipment Status */}
        <div className="bg-white border border-slate-200 rounded-[35px] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Wrench size={20} className="text-violet-600" />
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Equipment</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <span className="text-sm font-bold text-slate-600">Total Units</span>
              <span className="text-xl font-black text-slate-900">{equipmentStats.total}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
              <span className="text-sm font-bold text-blue-600">Assigned</span>
              <span className="text-xl font-black text-blue-600">{equipmentStats.assigned}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl">
              <span className="text-sm font-bold text-amber-600">Needs Service</span>
              <span className="text-xl font-black text-amber-600">{equipmentStats.needsService}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl">
              <span className="text-sm font-bold text-rose-600">Damaged</span>
              <span className="text-xl font-black text-rose-600">{equipmentStats.damaged}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 p-6 rounded-[35px] shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'scheduled', 'inprogress', 'completed'] as FilterStatus[]).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filterStatus === status
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'all' ? `All (${jobStats.total})` :
                 status === 'scheduled' ? `Scheduled (${jobStats.scheduled})` :
                 status === 'inprogress' ? `In Progress (${jobStats.inProgress})` :
                 `Completed (${jobStats.completed})`}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 border border-blue-700 p-4 rounded-[25px] shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle2 size={18} className="text-white" />
            </div>
            <span className="text-white font-black">
              {selectedIds.size} job{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/30 transition-all backdrop-blur-sm">
              Assign Crew
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-4 py-2 bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/30 transition-all backdrop-blur-sm"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Jobs Table */}
      <div className="bg-white border border-slate-200 rounded-[45px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 border-b border-slate-100">
                <th className="px-6 py-5">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredJobs.length && filteredJobs.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th
                  className="px-8 py-5 font-black uppercase tracking-widest text-[9px] cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    Date
                    <SortIcon field="date" />
                  </div>
                </th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Job</th>
                <th
                  className="px-8 py-5 font-black uppercase tracking-widest text-[9px] cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => handleSort('zone')}
                >
                  <div className="flex items-center gap-2">
                    Zone
                    <SortIcon field="zone" />
                  </div>
                </th>
                <th
                  className="px-8 py-5 font-black uppercase tracking-widest text-[9px] cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center gap-2">
                    Priority
                    <SortIcon field="priority" />
                  </div>
                </th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Status</th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJobs.map(job => {
                const isExpanded = expandedId === job.id;
                const crew = crews.find(c => c.id === job.crewId);

                return (
                  <React.Fragment key={job.id}>
                    <tr
                      className={`hover:bg-slate-50 transition-all ${isExpanded ? 'bg-blue-50/30' : ''} ${selectedIds.has(job.id) ? 'bg-blue-50/20' : ''}`}
                    >
                      <td className="px-6 py-5" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(job.id)}
                          onChange={() => handleSelectOne(job.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-8 py-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : job.id)}>
                        <span className="font-bold text-sm text-slate-900">
                          {new Date(job.scheduledDate || job.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-8 py-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : job.id)}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Briefcase size={14} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900">{job.subject || 'Untitled Job'}</p>
                            <p className="text-xs text-slate-500">{job.jobType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : job.id)}>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border bg-slate-50 text-slate-600 border-slate-200">
                          <MapPin size={10} />
                          {job.zone || 'N/A'}
                        </span>
                      </td>
                      <td className="px-8 py-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : job.id)}>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                          {getPriorityIcon(job.priority)}
                          {job.priority}
                        </span>
                      </td>
                      <td className="px-8 py-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : job.id)}>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/jobs/${job.id}`}
                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
                            title="View"
                          >
                            <Edit2 size={14} />
                          </Link>
                          <ChevronDown
                            size={16}
                            className={`text-slate-400 transition-transform cursor-pointer ${isExpanded ? 'rotate-180' : ''}`}
                            onClick={() => setExpandedId(isExpanded ? null : job.id)}
                          />
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="px-8 py-0">
                          <div className="py-6 border-b border-slate-200">
                            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-[25px] p-6 border border-slate-200">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Assigned Crew</p>
                                  <p className="text-sm font-bold text-slate-900">{crew?.name || 'Unassigned'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Scheduled Time</p>
                                  <p className="text-sm font-bold text-slate-900">
                                    {job.scheduledDate ? new Date(job.scheduledDate).toLocaleString() : 'Not scheduled'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Job Type</p>
                                  <p className="text-sm font-bold text-slate-900">{job.jobType}</p>
                                </div>
                              </div>
                              {job.notes && (
                                <div className="mt-4">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</p>
                                  <p className="text-sm text-slate-600">{job.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredJobs.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Briefcase size={48} className="text-slate-200" />
                      <p className="text-slate-400 font-black uppercase text-xs">No jobs found</p>
                      <p className="text-slate-300 text-sm">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FieldServicesDashboard;
