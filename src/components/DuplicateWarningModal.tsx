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

  const entityLabel = entityType.charAt(0).toUpperCase() + entityType.slice(1, -1); // e.g., "Lead", "Contact"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Possible Duplicate Detected</h2>
              <p className="text-sm text-gray-600">
                {matches.length} similar {matches.length === 1 ? 'record' : 'records'} found
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {matches.map((match, index) => (
              <div
                key={match.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-amber-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {getRecordDisplayName(match.record, entityType)}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      ID: {match.record.id}
                    </p>
                  </div>
                  <button
                    onClick={() => onViewDuplicate(match.record.id)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>

                {/* Matched Fields */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Matched Fields
                  </p>
                  <div className="space-y-1">
                    {Object.entries(match.matchedOn).map(([field, value]) => (
                      <div key={field} className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-700 capitalize">
                          {field.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-gray-900">{value}</span>
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
                          <span className="text-gray-500">Company:</span>
                          <span className="ml-2 text-gray-900">{match.record.company}</span>
                        </div>
                      )}
                      {match.record.status && (
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <span className="ml-2 text-gray-900">{match.record.status}</span>
                        </div>
                      )}
                    </>
                  )}
                  {entityType === 'contacts' && (
                    <>
                      {match.record.account_name && (
                        <div>
                          <span className="text-gray-500">Account:</span>
                          <span className="ml-2 text-gray-900">{match.record.account_name}</span>
                        </div>
                      )}
                      {match.record.title && (
                        <div>
                          <span className="text-gray-500">Title:</span>
                          <span className="ml-2 text-gray-900">{match.record.title}</span>
                        </div>
                      )}
                    </>
                  )}
                  {entityType === 'accounts' && (
                    <>
                      {match.record.industry && (
                        <div>
                          <span className="text-gray-500">Industry:</span>
                          <span className="ml-2 text-gray-900">{match.record.industry}</span>
                        </div>
                      )}
                      {match.record.city && (
                        <div>
                          <span className="text-gray-500">City:</span>
                          <span className="ml-2 text-gray-900">{match.record.city}</span>
                        </div>
                      )}
                    </>
                  )}
                  {match.record.created_at && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Created:</span>
                      <span className="ml-2 text-gray-900">
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
        <div className="border-t bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              What would you like to do?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onCreateAnyway}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Check className="w-4 h-4" />
                Create Anyway
              </button>
            </div>
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
