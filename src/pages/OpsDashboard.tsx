import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CheckSquare, Ticket, Clock, AlertCircle,
  Calendar, Users, UserPlus, MoreHorizontal, FileText, ChevronRight, Plus,
  ArrowUpRight, ArrowDownRight, Briefcase, Wrench, MapPin, Activity,
  TrendingUp, Package, ShieldAlert
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';

const OpsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    opsStats, tasks, tickets, jobs, crews, zones, equipment,
    openModal, toggleTask
  } = useCRM();

  // Field Service Stats
  const fieldServiceStats = useMemo(() => {
    const inProgress = jobs.filter(j => j.status === 'InProgress');
    const scheduled = jobs.filter(j => j.status === 'Scheduled');
    const emergency = jobs.filter(j => j.jobType === 'Emergency' && j.status !== 'Completed');
    const activeCrews = crews.filter(c =>
      jobs.some(j => j.crewId === c.id && j.status === 'InProgress')
    );
    const needsService = equipment.filter(e => {
      if (!e.nextServiceDate) return false;
      const nextService = new Date(e.nextServiceDate);
      const today = new Date();
      const daysUntil = Math.ceil((nextService.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7;
    });

    return {
      inProgress: inProgress.length,
      scheduled: scheduled.length,
      emergency: emergency.length,
      activeCrews: activeCrews.length,
      totalCrews: crews.length,
      needsService: needsService.length
    };
  }, [jobs, crews, equipment]);

  // Generate dynamic week days for the workflow strip
  const getWeekDays = () => {
    const start = new Date();
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(start.setDate(diff));

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      return {
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        num: d.getDate(),
        isToday: d.toDateString() === new Date().toDateString(),
        date: d
      };
    });
  };

  const weekDays = getWeekDays();

  const activeTickets = tickets
    .filter(t => t.status !== 'Resolved' && t.status !== 'Closed')
    .sort((a, b) => new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime());

  const tacticalTasks = tasks
    .filter(t => t.status !== 'Completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const recentJobs = useMemo(() =>
    [...jobs]
      .sort((a, b) => new Date(b.scheduledDate || b.createdAt).getTime() - new Date(a.scheduledDate || a.createdAt).getTime())
      .slice(0, 5),
    [jobs]
  );

  return (
    <div className="space-y-8 animate-slide-up pb-20">
      {/* Header */}
      <div>
        <h1 className="text-5xl font-black text-slate-900 mb-2 tracking-tight">Operations Hub</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Internal Execution & Service Delivery Command</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Efficiency Saved"
          value={`${opsStats.efficiencySaved.toFixed(1)} hrs`}
          icon={TrendingUp}
          color="bg-blue-600"
          trend={opsStats.trends.efficiency >= 0 ? `+${opsStats.trends.efficiency}%` : `${opsStats.trends.efficiency}%`}
          onClick={() => navigate('/tasks')}
        />
        <MetricCard
          label="Active Tickets"
          value={opsStats.activeTickets}
          icon={Ticket}
          color="bg-rose-600"
          trend={`${opsStats.urgentTickets} urgent`}
          onClick={() => navigate('/tickets')}
        />
        <MetricCard
          label="Field Jobs"
          value={fieldServiceStats.inProgress}
          icon={Briefcase}
          color="bg-emerald-600"
          trend={`${fieldServiceStats.scheduled} scheduled`}
          onClick={() => navigate('/jobs')}
        />
        <MetricCard
          label="Active Crews"
          value={`${fieldServiceStats.activeCrews}/${fieldServiceStats.totalCrews}`}
          icon={Users}
          color="bg-violet-600"
          trend={`${((fieldServiceStats.activeCrews / fieldServiceStats.totalCrews) * 100).toFixed(0)}% utilization`}
          onClick={() => navigate('/crews')}
        />
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Operations Status */}
        <div className="bg-white border border-slate-200 rounded-[35px] p-8 shadow-sm">
          <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Activity size={14} className="text-blue-600"/> Operations Status
          </h3>
          <div className="space-y-4">
            <StatusRow label="Overdue Tasks" value={opsStats.overdueTasksCount} color="rose" />
            <StatusRow label="Completed Projects" value={opsStats.projectsCompleted} color="emerald" />
            <StatusRow label="Emergency Jobs" value={fieldServiceStats.emergency} color="amber" />
            <StatusRow label="Equipment Service Due" value={fieldServiceStats.needsService} color="violet" />
          </div>
        </div>

        {/* Field Service Breakdown */}
        <div className="bg-white border border-slate-200 rounded-[35px] p-8 shadow-sm">
          <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Wrench size={14} className="text-emerald-600"/> Field Services
          </h3>
          <div className="text-center mb-6">
            <p className="text-5xl font-black text-emerald-600 mb-2">{fieldServiceStats.inProgress}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Progress</p>
          </div>
          <div className="flex justify-between text-center">
            <div>
              <p className="text-2xl font-black text-blue-600">{fieldServiceStats.scheduled}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scheduled</p>
            </div>
            <div>
              <p className="text-2xl font-black text-rose-600">{fieldServiceStats.emergency}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Emergency</p>
            </div>
          </div>
        </div>

        {/* Zone Coverage */}
        <div className="bg-white border border-slate-200 rounded-[35px] p-8 shadow-sm">
          <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <MapPin size={14} className="text-indigo-600"/> Zone Coverage
          </h3>
          <div className="space-y-3">
            {zones.slice(0, 4).map(zone => {
              const zoneJobs = jobs.filter(j => j.zone === zone.name && j.status !== 'Completed');
              return (
                <Link
                  key={zone.id}
                  to={`/zones/${zone.id}`}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl hover:bg-blue-50 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: zone.color || '#94a3b8' }}
                    ></div>
                    <p className="text-sm font-black text-slate-900">{zone.name}</p>
                  </div>
                  <span className="text-lg font-black text-blue-600">{zoneJobs.length}</span>
                </Link>
              );
            })}
            {zones.length === 0 && (
              <p className="text-center text-slate-400 py-4 text-[10px] font-black uppercase">No zones defined</p>
            )}
          </div>
        </div>
      </div>

      {/* Alerts Row */}
      {(fieldServiceStats.emergency > 0 || opsStats.overdueTasksCount > 0 || fieldServiceStats.needsService > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {fieldServiceStats.emergency > 0 && (
            <div className="bg-rose-50 border-2 border-rose-200 rounded-[35px] p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white">
                    <ShieldAlert size={24}/>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-rose-900">{fieldServiceStats.emergency}</p>
                    <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Emergency Jobs</p>
                  </div>
                </div>
                <Link
                  to="/jobs"
                  className="bg-rose-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all"
                >
                  View →
                </Link>
              </div>
            </div>
          )}

          {opsStats.overdueTasksCount > 0 && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-[35px] p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center text-white">
                    <AlertCircle size={24}/>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-amber-900">{opsStats.overdueTasksCount}</p>
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Overdue Tasks</p>
                  </div>
                </div>
                <Link
                  to="/tasks"
                  className="bg-amber-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all"
                >
                  Review →
                </Link>
              </div>
            </div>
          )}

          {fieldServiceStats.needsService > 0 && (
            <div className="bg-violet-50 border-2 border-violet-200 rounded-[35px] p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center text-white">
                    <Wrench size={24}/>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-violet-900">{fieldServiceStats.needsService}</p>
                    <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">Equipment Service Due</p>
                  </div>
                </div>
                <Link
                  to="/equipment"
                  className="bg-violet-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 transition-all"
                >
                  View →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Workflow & Recent Jobs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Week View */}
          <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black flex items-center gap-2">
                <Calendar size={20} className="text-blue-600" />
                Daily Workflow
              </h3>
              <button onClick={() => navigate('/calendar')} className="text-xs font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest">Full Schedule</button>
            </div>

            <div className="grid grid-cols-7 gap-3">
              {weekDays.map((day) => (
                <div
                  key={day.label}
                  onClick={() => navigate('/calendar')}
                  className={`flex flex-col items-center py-3 rounded-2xl transition-all cursor-pointer border ${day.isToday ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-100 hover:border-blue-200 text-slate-400'}`}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1">{day.label}</p>
                  <p className={`text-lg font-black ${day.isToday ? 'text-white' : 'text-slate-900'}`}>{day.num}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black flex items-center gap-2">
                <Briefcase size={20} className="text-emerald-600" />
                Recent Field Jobs
              </h3>
              <Link
                to="/jobs"
                className="text-xs font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest"
              >
                View All →
              </Link>
            </div>

            <div className="space-y-4">
              {recentJobs.map((job) => {
                const isEmergency = job.jobType === 'Emergency';
                const isInProgress = job.status === 'InProgress';
                return (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className="flex items-center gap-6 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl group hover:bg-white hover:shadow-lg transition-all"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                      isInProgress ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400'
                    }`}>
                      <Wrench size={20}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors truncate">{job.subject}</p>
                        {isEmergency && (
                          <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-full text-[8px] font-black uppercase border border-rose-100 flex items-center gap-1">
                            <ShieldAlert size={10}/> Emergency
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {job.jobType} • {job.zone || 'No zone'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                      job.status === 'InProgress' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      job.status === 'Scheduled' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {job.status}
                    </span>
                  </Link>
                );
              })}
              {recentJobs.length === 0 && (
                <p className="text-center text-slate-400 py-10 font-bold uppercase text-xs">No recent jobs</p>
              )}
            </div>
          </div>

          {/* Active Tickets */}
          <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black flex items-center gap-2">
                <Ticket size={20} className="text-rose-600" />
                Active Support Tickets
              </h3>
              <Link
                to="/tickets"
                className="text-xs font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest"
              >
                View All →
              </Link>
            </div>

            <div className="space-y-4">
              {activeTickets.slice(0, 5).map((ticket) => {
                const isUrgent = new Date(ticket.slaDeadline) < new Date(Date.now() + 2 * 3600 * 1000);
                return (
                  <div
                    key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className="flex items-center gap-6 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl group hover:bg-white hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="text-center min-w-[100px]">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">SLA</p>
                      <div className={`w-1.5 h-8 rounded-full ${isUrgent ? 'bg-rose-500 animate-pulse' : 'bg-blue-500'} mx-auto my-1`}></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">TARGET</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">{ticket.subject}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white border border-slate-100 ${isUrgent ? 'text-rose-500' : 'text-slate-500'}`}>{ticket.status}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(ticket.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} deadline</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                );
              })}
              {activeTickets.length === 0 && <p className="text-center text-slate-400 py-10 font-bold uppercase text-xs">No active support requests.</p>}
            </div>
          </div>
        </div>

        {/* Tactical Task List */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm">
          <h3 className="text-xl font-black mb-8 flex items-center gap-2">
            <FileText size={20} className="text-amber-500" />
            Tactical Task List
          </h3>

          <div className="space-y-4">
            {tacticalTasks.slice(0, 8).map((task) => {
              const isOverdue = new Date(task.dueDate) < new Date();
              return (
                <div key={task.id} className={`flex gap-4 p-5 rounded-3xl border transition-all cursor-pointer group ${isOverdue ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-transparent hover:border-blue-100'}`}>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors bg-white ${isOverdue ? 'border-rose-300 hover:bg-rose-500 hover:border-rose-500' : 'border-slate-300 hover:bg-blue-500 hover:border-blue-500'} hover:text-white`}
                  >
                    <CheckSquare size={12} className="opacity-0 group-hover:opacity-100" />
                  </button>
                  <div className="min-w-0 flex-1" onClick={() => openModal('tasks', task)}>
                    <p className={`text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate`}>{task.title}</p>
                    <p className={`text-[11px] font-bold mt-1 leading-tight ${isOverdue ? 'text-rose-500' : 'text-slate-500'}`}>
                      {isOverdue ? 'OVERDUE' : task.priority.toUpperCase()} • {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
            {tacticalTasks.length === 0 && <p className="text-center text-slate-400 py-10 font-bold uppercase text-xs">Queue cleared!</p>}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100">
            <button
              onClick={() => openModal('tasks')}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-3xl font-black text-xs shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
            >
              <Plus size={16} /> New Task Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, color, trend, onClick }: any) => (
  <div
    onClick={onClick}
    className="bg-white border border-slate-200 rounded-[35px] p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 ${color} text-white rounded-2xl flex items-center justify-center shadow-lg`}>
        <Icon size={24} />
      </div>
    </div>
    <p className="text-4xl font-black text-slate-900 mb-2">{value}</p>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
    <p className="text-[10px] font-bold text-slate-400">{trend}</p>
  </div>
);

const StatusRow = ({ label, value, color }: { label: string; value: number; color: string }) => {
  const colorClasses = {
    violet: 'bg-violet-500',
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-400'
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}></div>
        <span className="text-xs font-bold text-slate-600">{label}</span>
      </div>
      <span className="text-lg font-black text-slate-900">{value}</span>
    </div>
  );
};

export default OpsDashboard;
