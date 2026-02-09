import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Search, Plus, Download, TrendingUp,
  ArrowUp, ArrowDown, ArrowUpDown, Map
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';

type SortField = 'name' | 'jobCount';
type SortDirection = 'asc' | 'desc';

const ZonesPage: React.FC = () => {
  const navigate = useNavigate();
  const { zones, jobs, openModal } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedZones, setSelectedZones] = useState<Set<string>>(new Set());

  // Calculate summary stats
  const stats = useMemo(() => {
    const allZones = zones || [];
    const allJobs = jobs || [];
    return {
      total: allZones.length,
      active: allZones.filter(z => allJobs.some(j => (j as any).zone === z.name)).length,
      totalJobs: allJobs.length,
      avgJobsPerZone: allZones.length > 0 ? Math.round(allJobs.length / allZones.length) : 0,
    };
  }, [zones, jobs]);

  // Filter and sort zones
  const filteredZones = useMemo(() => {
    let filtered = zones || [];

    if (searchQuery) {
      filtered = filtered.filter(z =>
        z.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        z.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return [...filtered].sort((a, b) => {
      let aVal, bVal;

      if (sortField === 'name') {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      } else {
        aVal = (jobs || []).filter(j => (j as any).zone === a.name).length;
        bVal = (jobs || []).filter(j => (j as any).zone === b.name).length;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [zones, jobs, searchQuery, sortField, sortDirection]);

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
    const newSet = new Set(selectedZones);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedZones(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedZones.size === filteredZones.length) {
      setSelectedZones(new Set());
    } else {
      setSelectedZones(new Set(filteredZones.map(z => z.id)));
    }
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Field Services</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Zones</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal('zones')}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all"
          >
            <Plus size={16} />
            Add Zone
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Zones</p>
          <p className="text-3xl font-black text-slate-900">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-1">Service areas defined</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Zones</p>
          <p className="text-3xl font-black text-slate-900">{stats.active}</p>
          <p className="text-xs text-slate-500 mt-1">Zones with active jobs</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Jobs</p>
          <p className="text-3xl font-black text-slate-900">{stats.totalJobs}</p>
          <p className="text-xs text-slate-500 mt-1">Across all zones</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Coverage</p>
          <p className="text-3xl font-black text-slate-900">{stats.avgJobsPerZone}</p>
          <p className="text-xs text-slate-500 mt-1">Avg jobs per zone</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-[25px] shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search zones..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedZones.size > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-4 rounded-[25px] shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between text-white">
            <span className="text-sm font-black uppercase tracking-wide">
              {selectedZones.size} zone{selectedZones.size !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedZones(new Set())}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Zones Table */}
      <div className="bg-white border border-slate-200 rounded-[25px] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left p-4">
                <input
                  type="checkbox"
                  checked={selectedZones.size === filteredZones.length && filteredZones.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th
                className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Zone Name
                  <SortIcon field="name" />
                </div>
              </th>
              <th
                className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort('jobCount')}
              >
                <div className="flex items-center gap-2">
                  Active Jobs
                  <SortIcon field="jobCount" />
                </div>
              </th>
              <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Coverage Area</th>
              <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredZones.map((zone) => {
              const zoneData = zone as any;
              const jobCount = (jobs || []).filter(j => (j as any).zone === zone.name).length;
              const isExpanded = expandedId === zone.id;

              return (
                <React.Fragment key={zone.id}>
                  <tr
                    className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${isExpanded ? 'bg-slate-50' : ''}`}
                    onClick={() => setExpandedId(isExpanded ? null : zone.id)}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedZones.has(zone.id)}
                        onChange={() => toggleSelection(zone.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-black text-sm">
                          {zone.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{zone.name}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID: {zone.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                        jobCount > 0 ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-700 border border-slate-200'
                      }`}>
                        {jobCount} {jobCount === 1 ? 'job' : 'jobs'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-bold text-slate-600">{zoneData.coverage || 'Standard coverage'}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-full border ${
                        jobCount > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {jobCount > 0 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={5} className="px-8 py-0">
                        <div className="py-6 border-b border-slate-200">
                          <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-[25px] p-6 border border-slate-200">
                            <div className="mb-4">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</p>
                              <p className="text-sm text-slate-600">{zoneData.description || 'No description available'}</p>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/zones/${zone.id}`);
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-[20px] text-xs font-bold uppercase tracking-wide shadow-md active:scale-95 transition-all"
                              >
                                View Details
                              </button>
                              <button className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-[20px] text-xs font-bold uppercase tracking-wide border border-slate-200 active:scale-95 transition-all">
                                Edit
                              </button>
                              <button className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-[20px] text-xs font-bold uppercase tracking-wide border border-slate-200 active:scale-95 transition-all">
                                View Jobs
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

        {filteredZones.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={40} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No zones found</h3>
            <p className="text-slate-500 mb-6">
              {searchQuery
                ? 'Try adjusting your search query.'
                : 'Create your first service zone to get started.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZonesPage;
