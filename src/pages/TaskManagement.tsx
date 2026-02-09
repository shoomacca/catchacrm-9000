
import React from 'react';
import { 
  CheckSquare, Plus, CheckCircle2,
  Calendar as CalendarIcon, Link as LinkIcon, Filter, Search, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';

const TaskManagement: React.FC = () => {
  const { tasks, toggleTask, searchQuery, openModal } = useCRM();

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    task.relatedToId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityColor = (p: string, isOverdue: boolean) => {
    if (isOverdue) return 'text-rose-700 bg-rose-100 border-rose-200';
    switch(p) {
      case 'High': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Low': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-[1400px] mx-auto pb-20">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Execution</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Task Queue</h1>
        </div>
        <button 
          onClick={() => openModal('tasks')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-xs font-black transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-[35px] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={16} />
              <input 
                type="text" 
                placeholder="Filter tasks..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none w-64" 
                value={searchQuery}
                readOnly
              />
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase">All Tasks</button>
              <button className="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100 transition-all">Overdue</button>
              <button className="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100 transition-all">Assigned to me</button>
            </div>
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-900"><Filter size={18} /></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/20 text-slate-400 border-b border-slate-100">
                <th className="px-8 py-4 font-black uppercase tracking-widest text-[9px] w-12 text-center">Done</th>
                <th className="px-8 py-4 font-black uppercase tracking-widest text-[9px]">Task Definition</th>
                <th className="px-8 py-4 font-black uppercase tracking-widest text-[9px]">Related Record</th>
                <th className="px-8 py-4 font-black uppercase tracking-widest text-[9px]">Assignee</th>
                <th className="px-8 py-4 font-black uppercase tracking-widest text-[9px]">Due Date</th>
                <th className="px-8 py-4 font-black uppercase tracking-widest text-[9px]">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map((task) => {
                const isOverdue = task.status !== 'Completed' && new Date(task.dueDate) < new Date();
                return (
                  <tr key={task.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer" onClick={() => openModal('tasks', task)}>
                    <td className="px-8 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => toggleTask(task.id)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.status === 'Completed' ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 bg-white hover:border-blue-500'}`}>
                        {task.status === 'Completed' && <CheckCircle2 size={14} />}
                      </button>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-black ${task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{task.title}</p>
                          {/* Corrected: Wrap Lucide icon in a span to use the title attribute for a tooltip, as Lucide icons do not support title prop directly */}
                          {isOverdue && <span title="Overdue"><AlertCircle size={14} className="text-rose-600" /></span>}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">TASK-ID-{task.id}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5" onClick={(e) => e.stopPropagation()}>
                      {task.relatedToId ? (
                        <Link to={`/${task.relatedToType}/${task.relatedToId}`} className="flex items-center gap-2 text-xs font-black text-blue-600 hover:underline">
                          <LinkIcon size={12} />
                          {task.relatedToId}
                        </Link>
                      ) : (
                        <span className="text-[10px] text-slate-300 uppercase font-black">Unlinked</span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assigneeId}`} className="w-6 h-6 rounded-lg shadow-sm bg-slate-50" alt="" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{task.assigneeId}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`flex items-center gap-2 font-bold text-xs ${isOverdue ? 'text-rose-600' : 'text-slate-500'}`}>
                        <CalendarIcon size={12} />
                        {new Date(task.dueDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getPriorityColor(task.priority, isOverdue)}`}>
                        {isOverdue ? 'Overdue' : task.priority}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-black uppercase text-xs tracking-[0.2em]">No tasks found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaskManagement;
