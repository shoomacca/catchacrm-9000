import React, { useState } from 'react';
import { X, User, Mail, Shield, Users } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: Array<{ id: string; name: string; role: string; email?: string; team?: string; managerId?: string }>;
  editingUser?: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'agent' | 'technician';
    managerId?: string;
    team?: string;
  };
  onCreateUser: (user: {
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'agent' | 'technician';
    managerId?: string;
    team?: string;
  }) => void;
  onUpdateUser?: (userId: string, updates: {
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'agent' | 'technician';
    managerId?: string;
    team?: string;
  }) => void;
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  users,
  editingUser,
  onCreateUser,
  onUpdateUser,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'agent' | 'technician'>('agent');
  const [managerId, setManagerId] = useState('');
  const [team, setTeam] = useState('');

  // Initialize form with editing user data
  React.useEffect(() => {
    if (editingUser) {
      setName(editingUser.name);
      setEmail(editingUser.email);
      setRole(editingUser.role);
      setManagerId(editingUser.managerId || '');
      setTeam(editingUser.team || '');
    } else {
      setName('');
      setEmail('');
      setRole('agent');
      setManagerId('');
      setTeam('');
    }
  }, [editingUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const userData = {
      name,
      email,
      role,
      managerId: managerId || undefined,
      team: team || undefined,
    };

    if (editingUser && onUpdateUser) {
      onUpdateUser(editingUser.id, userData);
    } else {
      onCreateUser(userData);
    }

    // Reset form
    setName('');
    setEmail('');
    setRole('agent');
    setManagerId('');
    setTeam('');
    onClose();
  };

  const managers = users.filter(u => u.role === 'admin' || u.role === 'manager');

  const roleOptions = [
    { value: 'admin', label: 'Admin', description: 'Full system access' },
    { value: 'manager', label: 'Manager', description: 'Team oversight, approvals' },
    { value: 'agent', label: 'Agent', description: 'Sales & support' },
    { value: 'technician', label: 'Technician', description: 'Field operations' },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[35px] w-full max-w-md shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">{editingUser ? 'Edit User' : 'Add New User'}</h2>
              <p className="text-violet-100 text-sm font-medium">
                {editingUser ? 'Update team member details' : 'Create a new team member'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-violet-500 focus:outline-none font-medium"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@company.com"
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-violet-500 focus:outline-none font-medium"
                required
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Role <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {roleOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  className={`flex flex-col items-start p-3 rounded-xl border-2 transition-all text-left ${
                    role === opt.value
                      ? 'border-violet-500 bg-violet-50 text-violet-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold">{opt.label}</span>
                  <span className="text-[10px] text-slate-400">{opt.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Manager (optional) */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Reports To <span className="text-slate-300">(Optional)</span>
            </label>
            <div className="relative">
              <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-violet-500 focus:outline-none font-medium appearance-none"
              >
                <option value="">No Manager</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Team (optional) */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Team <span className="text-slate-300">(Optional)</span>
            </label>
            <div className="relative">
              <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-violet-500 focus:outline-none font-medium appearance-none"
              >
                <option value="">No Team</option>
                <option value="Sales">Sales</option>
                <option value="Support">Support</option>
                <option value="Field Operations">Field Operations</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Management">Management</option>
                <option value="Engineering">Engineering</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name || !email}
              className="flex-1 px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 text-white rounded-xl font-bold shadow-lg shadow-violet-500/20 transition-all flex items-center justify-center gap-2"
            >
              <User size={18} />
              {editingUser ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
