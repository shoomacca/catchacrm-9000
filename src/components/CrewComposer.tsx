import React, { useState } from 'react';
import { X, Users, User, Palette, Tag } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Crew } from '../types';

interface CrewComposerProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Crew>;
  mode?: 'create' | 'edit';
}

export const CrewComposer: React.FC<CrewComposerProps> = ({
  isOpen,
  onClose,
  initialData,
  mode = 'create'
}) => {
  const { upsertRecord, users } = useCRM();

  const [name, setName] = useState(initialData?.name || '');
  const [leaderId, setLeaderId] = useState(initialData?.leaderId || '');
  const [memberIds, setMemberIds] = useState<string[]>(initialData?.memberIds || []);
  const [color, setColor] = useState(initialData?.color || '#3B82F6');
  const [specialty, setSpecialty] = useState(initialData?.specialty || '');
  const [status, setStatus] = useState(initialData?.status || 'Active');

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Please enter a crew name');
      return;
    }
    if (!leaderId) {
      alert('Please select a crew leader');
      return;
    }

    const crew: Partial<Crew> = {
      ...(initialData?.id && { id: initialData.id }),
      name: name.trim(),
      leaderId,
      memberIds,
      color,
      specialty: specialty.trim() || undefined,
      status,
    };

    upsertRecord('crews', crew);
    onClose();
  };

  const toggleMember = (userId: string) => {
    if (memberIds.includes(userId)) {
      setMemberIds(memberIds.filter(id => id !== userId));
    } else {
      setMemberIds([...memberIds, userId]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[45px] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Users size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                {mode === 'create' ? 'New Crew' : 'Edit Crew'}
              </h2>
              <p className="text-white/80 font-bold text-sm mt-1">
                {mode === 'create' ? 'Create a field service crew' : 'Update crew details'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Crew Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alpha Team, Beta Crew, etc."
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Crew Leader *
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={leaderId}
                    onChange={(e) => setLeaderId(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                    required
                  >
                    <option value="">Select Leader</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Specialty
                </label>
                <div className="relative">
                  <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="HVAC, Plumbing, Electrical..."
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Color
                </label>
                <div className="relative">
                  <Palette size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-[52px] pl-12 pr-6 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Crew Members
              </label>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 max-h-48 overflow-y-auto">
                {users.map(user => (
                  <div key={user.id} className="flex items-center gap-3 py-2">
                    <input
                      type="checkbox"
                      id={`member-${user.id}`}
                      checked={memberIds.includes(user.id)}
                      onChange={() => toggleMember(user.id)}
                      className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor={`member-${user.id}`} className="text-sm font-bold text-slate-700 cursor-pointer flex-1">
                      {user.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/20"
          >
            {mode === 'create' ? 'Create Crew' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
