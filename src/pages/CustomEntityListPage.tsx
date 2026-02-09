import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import {
  Plus, Search, Filter, LayoutGrid, List, Edit3, Trash2,
  ChevronRight, Calendar, MapPin, DollarSign, Hash, CheckCircle, XCircle
} from 'lucide-react';

type ViewMode = 'cards' | 'list';

const CustomEntityListPage: React.FC = () => {
  const { entityType } = useParams<{ entityType: string }>();
  const navigate = useNavigate();
  const { activeBlueprint, getCustomEntities, openModal, deleteCustomEntity, searchQuery, setSearchQuery } = useCRM();

  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Get the custom entity definition
  const entityDef = useMemo(() => {
    return activeBlueprint.customEntities?.find(e => e.id === entityType);
  }, [activeBlueprint, entityType]);

  // Get records for this entity
  const records = useMemo(() => {
    if (!entityType) return [];
    return getCustomEntities(entityType);
  }, [entityType, getCustomEntities]);

  // Filter records based on search
  const filteredRecords = useMemo(() => {
    if (!searchQuery) return records;

    const query = searchQuery.toLowerCase();
    return records.filter((record: any) => {
      // Search across all text fields
      return entityDef?.fields.some(field => {
        const value = record[field.id];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        }
        return false;
      });
    });
  }, [records, searchQuery, entityDef]);

  // Apply status filter if there's a status field
  const statusField = entityDef?.fields.find(f => f.id === 'status');
  const finalRecords = useMemo(() => {
    if (statusFilter === 'all' || !statusField) return filteredRecords;
    return filteredRecords.filter((r: any) => r.status === statusFilter);
  }, [filteredRecords, statusFilter, statusField]);

  // Get unique status values for filter
  const statuses = useMemo(() => {
    if (!statusField || !statusField.options) return [];
    return statusField.options;
  }, [statusField]);

  const handleDelete = (id: string) => {
    if (!entityType) return;
    if (confirm(`Delete this ${entityDef?.name || 'record'}?`)) {
      deleteCustomEntity(entityType, id);
    }
  };

  const renderFieldValue = (field: any, value: any) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-slate-300 italic">—</span>;
    }

    if (field.type === 'checkbox') {
      return value ? (
        <CheckCircle className="text-emerald-500" size={16} />
      ) : (
        <XCircle className="text-slate-300" size={16} />
      );
    }

    if (field.type === 'number') {
      if (field.id.toLowerCase().includes('price') || field.id.toLowerCase().includes('amount')) {
        return <span className="font-bold text-emerald-600">${Number(value).toLocaleString()}</span>;
      }
      return <span className="font-mono text-sm">{Number(value).toLocaleString()}</span>;
    }

    if (field.type === 'date') {
      return new Date(value).toLocaleDateString();
    }

    if (field.type === 'select') {
      return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">{value}</span>;
    }

    if (field.id === 'status') {
      return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">{value}</span>;
    }

    return <span className="text-sm text-slate-700">{String(value)}</span>;
  };

  if (!entityDef) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-900 mb-2">Entity Not Found</h2>
          <p className="text-slate-500">This custom entity doesn't exist in the current industry blueprint.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-slate-100 z-10">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-2xl">{entityDef.icon}</span>
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900">{entityDef.namePlural}</h1>
                <p className="text-sm text-slate-500 mt-0.5">{records.length} total records</p>
              </div>
            </div>
            <button
              onClick={() => openModal(entityType as any)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-sm hover:shadow-xl hover:shadow-blue-500/30 transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              Create {entityDef.name}
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${entityDef.namePlural.toLowerCase()}...`}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {statusField && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            )}

            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {finalRecords.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl opacity-50">{entityDef.icon}</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No {entityDef.namePlural} Found</h3>
            <p className="text-slate-500 mb-6">Get started by creating your first {entityDef.name.toLowerCase()}.</p>
            <button
              onClick={() => openModal(entityType as any)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-sm hover:shadow-xl hover:shadow-blue-500/30 transition-all inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Create {entityDef.name}
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {finalRecords.map((record: any) => {
              // Get first 4 important fields to show
              const displayFields = entityDef.fields.slice(0, 4);

              return (
                <div
                  key={record.id}
                  className="bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group"
                  onClick={() => navigate(`/custom/${entityType}/${record.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                        <span className="text-xl">{entityDef.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-sm">
                          {record[entityDef.fields[0]?.id] || 'Untitled'}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); openModal(entityType as any, record); }}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit3 size={14} className="text-blue-600" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} className="text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {displayFields.slice(1).map(field => (
                      <div key={field.id} className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{field.label}</span>
                        <div>{renderFieldValue(field, record[field.id])}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-xs text-slate-400">ID: {record.id.slice(-8)}</span>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {entityDef.fields.slice(0, 6).map(field => (
                      <th key={field.id} className="px-6 py-4 text-left">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {field.label}
                        </span>
                      </th>
                    ))}
                    <th className="px-6 py-4 text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {finalRecords.map((record: any) => (
                    <tr
                      key={record.id}
                      className="border-b border-slate-50 hover:bg-blue-50/30 cursor-pointer transition-colors"
                      onClick={() => navigate(`/custom/${entityType}/${record.id}`)}
                    >
                      {entityDef.fields.slice(0, 6).map(field => (
                        <td key={field.id} className="px-6 py-4">
                          {renderFieldValue(field, record[field.id])}
                        </td>
                      ))}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); openModal(entityType as any, record); }}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Edit3 size={14} className="text-blue-600" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomEntityListPage;
