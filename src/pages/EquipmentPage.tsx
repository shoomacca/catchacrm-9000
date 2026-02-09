import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench, Search, Plus, Download, CheckCircle, AlertTriangle,
  TrendingUp, Settings, Calendar, ArrowUp, ArrowDown, ArrowUpDown,
  Clock, DollarSign
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';

type SortField = 'name' | 'condition' | 'lastService';
type SortDirection = 'asc' | 'desc';
type FilterCondition = 'all' | 'excellent' | 'good' | 'needsmaintenance';

const EquipmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { equipment, openModal } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCondition, setFilterCondition] = useState<FilterCondition>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Set<string>>(new Set());

  // Calculate summary stats
  const stats = useMemo(() => {
    const allEquipment = equipment || [];
    return {
      total: allEquipment.length,
      excellent: allEquipment.filter(e => (e as any).condition === 'Excellent').length,
      good: allEquipment.filter(e => (e as any).condition === 'Good').length,
      needsMaintenance: allEquipment.filter(e => (e as any).condition === 'Needs Maintenance').length,
      totalValue: allEquipment.reduce((sum, e) => sum + ((e as any).value || 0), 0),
      utilizationRate: allEquipment.length > 0 ? Math.round((allEquipment.filter(e => (e as any).inUse).length / allEquipment.length) * 100) : 0,
    };
  }, [equipment]);

  // Filter and sort equipment
  const filteredEquipment = useMemo(() => {
    let filtered = equipment || [];

    // Condition filter
    if (filterCondition !== 'all') {
      const conditionMap: Record<FilterCondition, string> = {
        excellent: 'Excellent',
        good: 'Good',
        needsmaintenance: 'Needs Maintenance',
        all: ''
      };
      filtered = filtered.filter(e => (e as any).condition === conditionMap[filterCondition]);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(e =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ((e as any).type || '').toLowerCase().includes(searchQuery.toLowerCase())
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
        case 'condition':
          const conditionOrder = { 'Excellent': 3, 'Good': 2, 'Needs Maintenance': 1 };
          aVal = conditionOrder[(a as any).condition as keyof typeof conditionOrder] || 0;
          bVal = conditionOrder[(b as any).condition as keyof typeof conditionOrder] || 0;
          break;
        case 'lastService':
          aVal = new Date((a as any).lastService || 0).getTime();
          bVal = new Date((b as any).lastService || 0).getTime();
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
  }, [equipment, filterCondition, searchQuery, sortField, sortDirection]);

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
    const newSet = new Set(selectedEquipment);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedEquipment(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedEquipment.size === filteredEquipment.length) {
      setSelectedEquipment(new Set());
    } else {
      setSelectedEquipment(new Set(filteredEquipment.map(e => e.id)));
    }
  };

  const exportToCSV = () => {
    const equipmentToExport = selectedEquipment.size > 0
      ? filteredEquipment.filter(e => selectedEquipment.has(e.id))
      : filteredEquipment;

    const headers = ['ID', 'Name', 'Type', 'Condition', 'Last Service', 'Value'];
    const rows = equipmentToExport.map(e => [
      e.id,
      e.name,
      (e as any).type || '',
      (e as any).condition || '',
      (e as any).lastService || '',
      (e as any).value || 0
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equipment-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const ConditionBadge = ({ condition }: { condition: string }) => {
    const configs: Record<string, { bg: string; text: string; border: string }> = {
      'Excellent': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      'Good': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      'Needs Maintenance': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    };

    const config = configs[condition] || configs['Good'];

    return (
      <span className={`px-3 py-1 ${config.bg} ${config.text} text-[9px] font-black uppercase tracking-wider rounded-full border ${config.border}`}>
        {condition}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Field Services</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Equipment</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:border-slate-300 hover:shadow-md transition-all"
          >
            <Download size={16} />
            Export {selectedEquipment.size > 0 ? `(${selectedEquipment.size})` : ''}
          </button>
          <button
            onClick={() => openModal('equipment')}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all"
          >
            <Plus size={16} />
            Add Equipment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Equipment</p>
          <p className="text-3xl font-black text-slate-900">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-1">Units tracked</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Excellent</p>
          <p className="text-3xl font-black text-slate-900">{stats.excellent}</p>
          <p className="text-xs text-slate-500 mt-1">Pristine condition</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Needs Service</p>
          <p className="text-3xl font-black text-slate-900">{stats.needsMaintenance}</p>
          <p className="text-xs text-slate-500 mt-1">
            {stats.needsMaintenance > 0 ? 'Requires attention' : 'All equipment serviced'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Value</p>
          <p className="text-3xl font-black text-slate-900">${stats.totalValue.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Equipment assets</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-[25px] shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search equipment..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            onClick={() => setFilterCondition('all')}
            className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider ${
              filterCondition === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            } transition-all`}
          >
            All
          </button>
          <button
            onClick={() => setFilterCondition('excellent')}
            className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider ${
              filterCondition === 'excellent'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            } transition-all`}
          >
            Excellent
          </button>
          <button
            onClick={() => setFilterCondition('good')}
            className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider ${
              filterCondition === 'good'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            } transition-all`}
          >
            Good
          </button>
          <button
            onClick={() => setFilterCondition('needsmaintenance')}
            className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider ${
              filterCondition === 'needsmaintenance'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            } transition-all`}
          >
            Needs Service
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedEquipment.size > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-4 rounded-[25px] shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between text-white">
            <span className="text-sm font-black uppercase tracking-wide">
              {selectedEquipment.size} item{selectedEquipment.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all">
                Schedule Maintenance
              </button>
              <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all">
                Update Status
              </button>
              <button
                onClick={() => setSelectedEquipment(new Set())}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Table */}
      <div className="bg-white border border-slate-200 rounded-[25px] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left p-4">
                <input
                  type="checkbox"
                  checked={selectedEquipment.size === filteredEquipment.length && filteredEquipment.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th
                className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Equipment
                  <SortIcon field="name" />
                </div>
              </th>
              <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
              <th
                className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort('condition')}
              >
                <div className="flex items-center gap-2">
                  Condition
                  <SortIcon field="condition" />
                </div>
              </th>
              <th
                className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort('lastService')}
              >
                <div className="flex items-center gap-2">
                  Last Service
                  <SortIcon field="lastService" />
                </div>
              </th>
              <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEquipment.map((equip) => {
              const equipData = equip as any;
              const isExpanded = expandedId === equip.id;

              return (
                <React.Fragment key={equip.id}>
                  <tr
                    className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${isExpanded ? 'bg-slate-50' : ''}`}
                    onClick={() => setExpandedId(isExpanded ? null : equip.id)}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedEquipment.has(equip.id)}
                        onChange={() => toggleSelection(equip.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{equip.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID: {equip.id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <Settings size={12} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-600">{equipData.type || 'General'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <ConditionBadge condition={equipData.condition || 'Good'} />
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">
                          {equipData.lastService ? new Date(equipData.lastService).toLocaleDateString() : 'Never'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {equipData.lastService && new Date(equipData.lastService).getTime() < Date.now() - 90 * 24 * 60 * 60 * 1000 ? (
                            <span className="text-amber-600">Due for service</span>
                          ) : (
                            'Up to date'
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-slate-900">${(equipData.value || 0).toLocaleString()}</span>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={6} className="px-8 py-0">
                        <div className="py-6 border-b border-slate-200">
                          <div className="bg-gradient-to-br from-slate-50 to-orange-50/30 rounded-[25px] p-6 border border-slate-200">
                            <div className="grid grid-cols-3 gap-6 mb-6">
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Serial Number</p>
                                <p className="text-sm font-bold text-slate-900">{equipData.serialNumber || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assigned To</p>
                                <p className="text-sm font-bold text-slate-900">{equipData.assignedTo || 'Unassigned'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Next Service Due</p>
                                <div className="flex items-center gap-2">
                                  <Calendar size={14} className="text-orange-600" />
                                  <p className="text-sm font-bold text-slate-900">{equipData.nextService || 'TBD'}</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/equipment/${equip.id}`);
                                }}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-[20px] text-xs font-bold uppercase tracking-wide shadow-md active:scale-95 transition-all"
                              >
                                View Details
                              </button>
                              <button className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-[20px] text-xs font-bold uppercase tracking-wide border border-slate-200 active:scale-95 transition-all">
                                Edit
                              </button>
                              <button className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-[20px] text-xs font-bold uppercase tracking-wide border border-slate-200 active:scale-95 transition-all">
                                Schedule Service
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

        {filteredEquipment.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench size={40} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No equipment found</h3>
            <p className="text-slate-500 mb-6">
              {searchQuery || filterCondition !== 'all'
                ? 'Try adjusting your filters or search query.'
                : 'Add your first equipment to get started.'}
            </p>
          </div>
        )}
      </div>

      {/* Maintenance Alert */}
      {stats.needsMaintenance > 0 && (
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6 rounded-[25px] shadow-lg shadow-amber-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <AlertTriangle size={24} className="text-white" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white uppercase tracking-wide">Maintenance Required</h4>
                <p className="text-sm text-amber-100 font-semibold">{stats.needsMaintenance} equipment item{stats.needsMaintenance !== 1 ? 's' : ''} need{stats.needsMaintenance === 1 ? 's' : ''} servicing</p>
              </div>
            </div>
            <button className="bg-white hover:bg-amber-50 text-amber-600 px-6 py-3 rounded-xl font-black uppercase tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Schedule All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentPage;
