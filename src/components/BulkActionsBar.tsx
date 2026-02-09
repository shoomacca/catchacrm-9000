import React from 'react';
import { Trash2, RefreshCw, UserPlus, X, CheckSquare } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkDelete: () => void;
  onBulkStatusUpdate?: (status: string) => void;
  onBulkAssign?: (userId: string) => void;
  statusOptions?: string[];
  users?: Array<{ id: string; name: string }>;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBulkDelete,
  onBulkStatusUpdate,
  onBulkAssign,
  statusOptions = [],
  users = []
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-slate-900 text-white rounded-[32px] shadow-2xl border border-slate-700 px-8 py-4 flex items-center gap-6">
        {/* Selection Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <CheckSquare size={20} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider">
              {selectedCount} Selected
            </p>
            <p className="text-[10px] text-slate-400">
              {selectedCount === totalCount ? 'All items' : `of ${totalCount} total`}
            </p>
          </div>
        </div>

        <div className="w-px h-8 bg-slate-700" />

        {/* Select/Deselect All */}
        {selectedCount < totalCount ? (
          <button
            onClick={onSelectAll}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
          >
            <CheckSquare size={14} />
            Select All ({totalCount})
          </button>
        ) : (
          <button
            onClick={onDeselectAll}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
          >
            <X size={14} />
            Deselect All
          </button>
        )}

        {/* Bulk Status Update */}
        {onBulkStatusUpdate && statusOptions.length > 0 && (
          <>
            <div className="w-px h-8 bg-slate-700" />
            <div className="flex items-center gap-2">
              <RefreshCw size={14} className="text-slate-400" />
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    if (confirm(`Update ${selectedCount} records to "${e.target.value}" status?`)) {
                      onBulkStatusUpdate(e.target.value);
                    }
                    e.target.value = '';
                  }
                }}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">Update Status...</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Bulk Assign */}
        {onBulkAssign && users.length > 0 && (
          <>
            <div className="w-px h-8 bg-slate-700" />
            <div className="flex items-center gap-2">
              <UserPlus size={14} className="text-slate-400" />
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    const user = users.find(u => u.id === e.target.value);
                    if (confirm(`Assign ${selectedCount} records to ${user?.name}?`)) {
                      onBulkAssign(e.target.value);
                    }
                    e.target.value = '';
                  }
                }}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">Assign To...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Bulk Delete */}
        <div className="w-px h-8 bg-slate-700" />
        <button
          onClick={() => {
            if (confirm(`Are you sure you want to delete ${selectedCount} record${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`)) {
              onBulkDelete();
            }
          }}
          className="flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
        >
          <Trash2 size={14} />
          Delete ({selectedCount})
        </button>

        {/* Close */}
        <div className="w-px h-8 bg-slate-700" />
        <button
          onClick={onDeselectAll}
          className="flex items-center justify-center w-8 h-8 hover:bg-slate-800 rounded-lg transition-all"
          title="Close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default BulkActionsBar;
