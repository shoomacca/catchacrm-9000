import React from 'react';
import { X, AlertTriangle, Eye, Check } from 'lucide-react';
import { DuplicateMatch } from '../services/duplicateDetection';
import { EntityType } from '../types';

interface DuplicateWarningModalProps {
  isOpen: boolean;
  entityType: EntityType;
  matches: DuplicateMatch[];
  onCreateAnyway: () => void;
  onViewDuplicate: (duplicateId: string) => void;
  onCancel: () => void;
}

const DuplicateWarningModal: React.FC<DuplicateWarningModalProps> = ({
  isOpen,
  entityType,
  matches,
  onCreateAnyway,
  onViewDuplicate,
  onCancel
}) => {
  if (!isOpen) return null;

  const entityLabel = entityType.charAt(0).toUpperCase() + entityType.slice(1, -1);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[35px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black">Possible Duplicate Detected</h2>
                <p className="text-amber-100 text-sm font-medium">
                  {matches.length} similar {matches.length === 1 ? 'record' : 'records'} found
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.id}
                className="border-2 border-slate-100 rounded-2xl p-5 hover:border-amber-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {getRecordDisplayName(match.record, entityType)}
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      ID: {match.record.id}
                    </p>
                  </div>
                  <button
                    onClick={() => onViewDuplicate(match.record.id)}
                    className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <Eye size={14} />
                    View
                  </button>
                </div>

                {/* Matched Fields */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Matched Fields
                  </p>
                  <div className="space-y-1">
                    {Object.entries(match.matchedOn).map(([field, value]) => (
                      <div key={field} className="flex items-center gap-2 text-sm">
                        <span className="font-bold text-slate-600 capitalize">
                          {field.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-slate-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  {entityType === 'leads' && (
                    <>
                      {match.record.company && (
                        <div>
                          <span className="text-slate-400 text-xs font-bold">Company:</span>
                          <span className="ml-2 text-slate-900">{match.record.company}</span>
                        </div>
                      )}
                      {match.record.status && (
                        <div>
                          <span className="text-slate-400 text-xs font-bold">Status:</span>
                          <span className="ml-2 text-slate-900">{match.record.status}</span>
                        </div>
                      )}
                    </>
                  )}
                  {entityType === 'contacts' && (
                    <>
                      {match.record.account_name && (
                        <div>
                          <span className="text-slate-400 text-xs font-bold">Account:</span>
                          <span className="ml-2 text-slate-900">{match.record.account_name}</span>
                        </div>
                      )}
                      {match.record.title && (
                        <div>
                          <span className="text-slate-400 text-xs font-bold">Title:</span>
                          <span className="ml-2 text-slate-900">{match.record.title}</span>
                        </div>
                      )}
                    </>
                  )}
                  {entityType === 'accounts' && (
                    <>
                      {match.record.industry && (
                        <div>
                          <span className="text-slate-400 text-xs font-bold">Industry:</span>
                          <span className="ml-2 text-slate-900">{match.record.industry}</span>
                        </div>
                      )}
                      {match.record.city && (
                        <div>
                          <span className="text-slate-400 text-xs font-bold">City:</span>
                          <span className="ml-2 text-slate-900">{match.record.city}</span>
                        </div>
                      )}
                    </>
                  )}
                  {match.record.created_at && (
                    <div className="col-span-2">
                      <span className="text-slate-400 text-xs font-bold">Created:</span>
                      <span className="ml-2 text-slate-900">
                        {new Date(match.record.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-6">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onCreateAnyway}
              className="flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 rounded-2xl transition-colors shadow-lg shadow-blue-500/20"
            >
              <Check size={14} />
              Create Anyway
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Helper: Get display name for a record based on entity type
 */
function getRecordDisplayName(record: any, entityType: EntityType): string {
  switch (entityType) {
    case 'leads':
      return `${record.first_name || ''} ${record.last_name || ''}`.trim() ||
             record.email ||
             record.phone ||
             'Unnamed Lead';
    case 'contacts':
      return `${record.first_name || ''} ${record.last_name || ''}`.trim() ||
             record.email ||
             'Unnamed Contact';
    case 'accounts':
      return record.name || record.website || 'Unnamed Account';
    default:
      return record.name || record.title || 'Unnamed Record';
  }
}

export default DuplicateWarningModal;
