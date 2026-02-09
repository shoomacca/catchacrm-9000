import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Search, Plus, Download, UserCheck, UserX,
  TrendingUp, Award, Clock, ArrowUp, ArrowDown, ArrowUpDown,
  Phone, Mail, MapPin
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';

type SortField = 'name' | 'role' | 'status';
type SortDirection = 'asc' | 'desc';
type FilterStatus = 'all' | 'active' | 'inactive';

const CrewsPage: React.FC = () => {
  const navigate = useNavigate();
  const { crews, openModal } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCrews, setSelectedCrews] = useState<Set<string>>(new Set());

  // Calculate summary stats
  const stats = useMemo(() => {
    const allCrews = crews || [];
    return {
      total: allCrews.length,
      active: allCrews.filter(c => (c as any).status === 'Active').length,
      inactive: allCrews.filter(c => (c as any).status === 'Inactive').length,
      leads: allCrews.filter(c => (c as any).role === 'Lead').length,
      techs: allCrews.filter(c => (c as any).role === 'Tech').length,
      utilization: allCrews.length > 0 ? Math.round((allCrews.filter(c => (c as any).status === 'Active').length / allCrews.length) * 100) : 0,
    };
  }, [crews]);

  // Filter and sort crews
  const filteredCrews = useMemo(() => {
    let filtered = crews || [];

    // Status filter
    if (filterStatus !== 'all') {
      const statusMap: Record<FilterStatus, string> = {
        active: 'Active',
        inactive: 'Inactive',
        all: ''
      };
      filtered = filtered.filter(c => (c as any).status === statusMap[filterStatus]);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ((c as any).role || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'role':
          aVal = (a as any).role || '';
          bVal = (b as any).role || '';
          break;
        case 'status':
          aVal = (a as any).status || '';
          bVal = (b as any).status || '';
          break;
        default:
          aVal = '';
          bVal = '';
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [crews, filterStatus, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
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
    const newSet = new Set(selectedCrews);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedCrews(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedCrews.size === filteredCrews.length) {
      setSelectedCrews(new Set());
    } else {
      setSelectedCrews(new Set(filteredCrews.map(c => c.id)));
    }
  };

  const exportToCSV = () => {
    const crewsToExport = selectedCrews.size > 0
      ? filteredCrews.filter(c => selectedCrews.has(c.id))
      : filteredCrews;

    const headers = ['ID', 'Name', 'Role', 'Status', 'Phone', 'Email'];
    const rows = crewsToExport.map(c => [
      c.id,
      c.name,
      (c as any).role || '',
      (c as any).status || '',
      (c as any).phone || '',
      (c as any).email || ''
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crews-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const configs: Record<string, { bg: string; text: string; border: string }> = {
      'Active': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      'Inactive': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
    };

    const config = configs[status] || configs['Active'];

    return (
      <span className={`px-3 py-1 ${config.bg} ${config.text} text-[9px] font-black uppercase tracking-wider rounded-full border ${config.border}`}>
        {status}
      </span>
    );
  };

  const RoleBadge = ({ role }: { role: string }) => {
    const configs: Record<string, { bg: string; text: string; border: string }> = {
      'Lead': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
      'Tech': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      'Admin': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    };

    const config = configs[role] || configs['Tech'];

    return (
      <span className={`px-3 py-1 ${config.bg} ${config.text} text-[9px] font-black uppercase tracking-wider rounded-full border ${config.border}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Field Services</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Crews</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:border-slate-300 hover:shadow-md transition-all"
          >
            <Download size={16} />
            Export {selectedCrews.size > 0 ? `(${selectedCrews.size})` : ''}
          </button>
          <button
            onClick={() => openModal('crews')}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all"
          >
            <Plus size={16} />
            Add Crew
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Crew</p>
          <p className="text-3xl font-black text-slate-900">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-1">Team members</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active</p>
          <p className="text-3xl font-black text-slate-900">{stats.active}</p>
          <p className="text-xs text-slate-500 mt-1">Currently working</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Team Leads</p>
          <p className="text-3xl font-black text-slate-900">{stats.leads}</p>
          <p className="text-xs text-slate-500 mt-1">Crew leaders</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Utilization</p>
          <p className="text-3xl font-black text-slate-900">{stats.utilization}%</p>
          <p className="text-xs text-slate-500 mt-1">Active/Total ratio</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-[25px] shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search crew members..."
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
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider ${
              filterStatus === 'active'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            } transition-all`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterStatus('inactive')}
            className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider ${
              filterStatus === 'inactive'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            } transition-all`}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCrews.size > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-4 rounded-[25px] shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between text-white">
            <span className="text-sm font-black uppercase tracking-wide">
              {selectedCrews.size} crew member{selectedCrews.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all">
                Assign Job
              </button>
              <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all">
                Update Status
              </button>
              <button
                onClick={() => setSelectedCrews(new Set())}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crews Table */}
      <div className="bg-white border border-slate-200 rounded-[25px] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left p-4">
                <input
                  type="checkbox"
                  checked={selectedCrews.size === filteredCrews.length && filteredCrews.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th
                className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Crew Member
                  <SortIcon field="name" />
                </div>
              </th>
              <th
                className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort('role')}
              >
                <div className="flex items-center gap-2">
                  Role
                  <SortIcon field="role" />
                </div>
              </th>
              <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
              <th
                className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  Status
                  <SortIcon field="status" />
                </div>
              </th>
              <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Assignment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCrews.map((crew) => {
              const crewData = crew as any;
              const isExpanded = expandedId === crew.id;

              return (
                <React.Fragment key={crew.id}>
                  <tr
                    className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${isExpanded ? 'bg-slate-50' : ''}`}
                    onClick={() => setExpandedId(isExpanded ? null : crew.id)}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedCrews.has(crew.id)}
                        onChange={() => toggleSelection(crew.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-black">
                          {crew.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{crew.name}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID: {crew.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <RoleBadge role={crewData.role || 'Tech'} />
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {crewData.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone size={10} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-600">{crewData.phone}</span>
                          </div>
                        )}
                        {crewData.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail size={10} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-600">{crewData.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={crewData.status || 'Active'} />
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-bold text-slate-600">{crewData.currentJob || 'None'}</span>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={6} className="px-8 py-0">
                        <div className="py-6 border-b border-slate-200">
                          <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-[25px] p-6 border border-slate-200">
                            <div className="grid grid-cols-3 gap-6 mb-6">
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Specialization</p>
                                <p className="text-sm font-bold text-slate-900">{crewData.specialization || 'General'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Certifications</p>
                                <p className="text-sm font-bold text-slate-900">{crewData.certifications || 'None listed'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Last Active</p>
                                <div className="flex items-center gap-2">
                                  <Clock size={14} className="text-emerald-600" />
                                  <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/crews/${crew.id}`);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-[20px] text-xs font-bold uppercase tracking-wide shadow-md active:scale-95 transition-all"
                              >
                                View Profile
                              </button>
                              <button className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-[20px] text-xs font-bold uppercase tracking-wide border border-slate-200 active:scale-95 transition-all">
                                Edit
                              </button>
                              <button className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-[20px] text-xs font-bold uppercase tracking-wide border border-slate-200 active:scale-95 transition-all">
                                Assign to Job
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

        {filteredCrews.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={40} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No crew members found</h3>
            <p className="text-slate-500 mb-6">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your filters or search query.'
                : 'Add your first crew member to get started.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrewsPage;
