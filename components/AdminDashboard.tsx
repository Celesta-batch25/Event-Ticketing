import React, { useState, useMemo } from 'react';
import { Attendee, CheckInStatus } from '../types';
import { CheckCircleIcon, BarChartIcon, UsersIcon } from './Icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface AdminDashboardProps {
  attendees: Attendee[];
  onCheckIn: (id: string) => { success: boolean; message: string; attendee?: Attendee };
  onBack: () => void;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ attendees, onCheckIn, onBack }) => {
  const [ticketId, setTicketId] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const stats = useMemo(() => {
    const total = attendees.length;
    const checkedIn = attendees.filter(a => a.status === CheckInStatus.CHECKED_IN).length;
    const distribution = attendees.reduce((acc, curr) => {
      acc[curr.ticketType] = (acc[curr.ticketType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.keys(distribution).map(key => ({
      name: key,
      value: distribution[key]
    }));

    return { total, checkedIn, chartData };
  }, [attendees]);

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId.trim()) return;

    const result = onCheckIn(ticketId.trim().toUpperCase());
    setStatusMsg({
      type: result.success ? 'success' : 'error',
      text: result.message
    });
    
    if (result.success) setTicketId('');

    // Clear message after 3 seconds
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-3xl font-bold text-white">Gate Control</h2>
           <p className="text-slate-400">Real-time check-in and analytics</p>
        </div>
        <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors border border-slate-700">
          Exit Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Check-In Panel */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 lg:col-span-1 shadow-xl">
           <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
             <CheckCircleIcon className="text-indigo-400" />
             Quick Check-In
           </h3>
           
           <form onSubmit={handleCheckInSubmit} className="space-y-4">
             <div>
               <label className="block text-sm text-slate-400 mb-1">Ticket ID</label>
               <input 
                 type="text" 
                 value={ticketId}
                 onChange={(e) => setTicketId(e.target.value)}
                 className="w-full bg-slate-900 border border-slate-600 text-white text-2xl font-mono tracking-widest text-center py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                 placeholder="ABC-123"
                 autoFocus
               />
             </div>
             <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-indigo-500/20">
               Check Attendee In
             </button>
           </form>

           {statusMsg && (
             <div className={`mt-4 p-4 rounded-lg border text-center font-medium ${
               statusMsg.type === 'success' 
                 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                 : 'bg-red-500/10 border-red-500/20 text-red-400'
             }`}>
               {statusMsg.text}
             </div>
           )}

           <div className="mt-8 pt-8 border-t border-slate-700">
             <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
               <span>Capacity</span>
               <span>{stats.checkedIn} / {stats.total}</span>
             </div>
             <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-emerald-500 transition-all duration-500" 
                 style={{ width: `${stats.total > 0 ? (stats.checkedIn / stats.total) * 100 : 0}%` }}
               ></div>
             </div>
           </div>
        </div>

        {/* Stats Panel */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 lg:col-span-2 shadow-xl flex flex-col">
           <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
             <BarChartIcon className="text-indigo-400" />
             Live Analytics
           </h3>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
             {/* Chart */}
             <div className="h-64 md:h-auto min-h-[250px] relative">
               <h4 className="text-sm text-slate-400 text-center mb-2">Ticket Distribution</h4>
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={stats.chartData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {stats.chartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                     ))}
                   </Pie>
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                   />
                   <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                 </PieChart>
               </ResponsiveContainer>
               {/* Center Text */}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                 <div className="text-center">
                   <p className="text-3xl font-bold text-white">{stats.total}</p>
                   <p className="text-xs text-slate-500 uppercase">Total</p>
                 </div>
               </div>
             </div>

             {/* Recent Check-ins List */}
             <div className="bg-slate-900/50 rounded-xl p-4 overflow-hidden flex flex-col">
               <h4 className="text-sm text-slate-400 mb-4 flex items-center gap-2">
                 <UsersIcon className="w-4 h-4" /> Recent Activity
               </h4>
               <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                 {attendees.filter(a => a.status === CheckInStatus.CHECKED_IN).length === 0 ? (
                   <div className="text-center text-slate-600 text-sm py-8">No check-ins yet.</div>
                 ) : (
                   attendees
                     .filter(a => a.status === CheckInStatus.CHECKED_IN)
                     .slice(0, 5) // Show last 5
                     .reverse()
                     .map(attendee => (
                       <div key={attendee.id} className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700/50">
                         <div>
                           <p className="text-white font-medium text-sm">{attendee.fullName}</p>
                           <p className="text-indigo-400 text-xs">{attendee.ticketType}</p>
                         </div>
                         <div className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-xs">
                           In
                         </div>
                       </div>
                     ))
                 )}
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
