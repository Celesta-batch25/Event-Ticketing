import React, { useState, useMemo, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Attendee, CheckInStatus } from '../types';
import { CheckCircleIcon, BarChartIcon, UsersIcon, CameraIcon, XIcon } from './Icons';
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
  const [isScanning, setIsScanning] = useState(false);

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

  // Handle Scan Logic
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isScanning) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      const onScanSuccess = (decodedText: string) => {
        try {
          // Attempt to parse JSON from QR
          const data = JSON.parse(decodedText);
          const id = data.id || decodedText; // Fallback if regular text
          processCheckIn(id);
          setIsScanning(false); // Stop scanning on success
        } catch (e) {
          // If not JSON, try generic text
          processCheckIn(decodedText);
          setIsScanning(false);
        }
      };

      const onScanFailure = (error: any) => {
        // console.warn(`Code scan error = ${error}`);
      };

      scanner.render(onScanSuccess, onScanFailure);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(error => console.error("Failed to clear html5-qrcode scanner. ", error));
      }
    };
  }, [isScanning]);

  const processCheckIn = (id: string) => {
    const result = onCheckIn(id.trim().toUpperCase());
    setStatusMsg({
      type: result.success ? 'success' : 'error',
      text: result.message
    });
    // Clear message after 3 seconds
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId.trim()) return;
    processCheckIn(ticketId);
    setTicketId('');
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-6">
        <div>
           <h2 className="text-3xl font-bold text-white">Gate Control</h2>
           <p className="text-slate-400">Organizing Committee Dashboard</p>
        </div>
        <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors border border-slate-700 text-sm">
          Log Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Check-In Panel */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 lg:col-span-1 shadow-xl flex flex-col">
           <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
             <CheckCircleIcon className="text-indigo-400" />
             Check-In Ops
           </h3>
           
           {/* Scanner Toggle */}
           <div className="mb-6">
             {isScanning ? (
               <div className="relative bg-black rounded-lg overflow-hidden border-2 border-indigo-500">
                 <div id="reader" className="w-full h-64"></div>
                 <button 
                   onClick={() => setIsScanning(false)}
                   className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full shadow-lg z-10"
                 >
                   <XIcon className="w-5 h-5" />
                 </button>
               </div>
             ) : (
                <button 
                  onClick={() => setIsScanning(true)}
                  className="w-full py-6 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-indigo-400 hover:border-indigo-500 hover:bg-slate-700/30 transition-all gap-2 group"
                >
                  <CameraIcon className="w-10 h-10 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Launch Scanner</span>
                </button>
             )}
           </div>

           <div className="text-center text-slate-500 text-sm my-2 separator relative flex items-center justify-center">
             <span className="bg-slate-800 px-2 z-10">OR MANUAL ENTRY</span>
             <div className="absolute w-full h-px bg-slate-700 top-1/2 left-0"></div>
           </div>
           
           <form onSubmit={handleCheckInSubmit} className="space-y-4 mt-2">
             <div>
               <input 
                 type="text" 
                 value={ticketId}
                 onChange={(e) => setTicketId(e.target.value)}
                 className="w-full bg-slate-900 border border-slate-600 text-white text-xl font-mono tracking-widest text-center py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase placeholder:text-slate-600"
                 placeholder="ENTER ID"
               />
             </div>
             <button type="submit" className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-all">
               Verify ID
             </button>
           </form>

           {statusMsg && (
             <div className={`mt-4 p-4 rounded-lg border text-center font-medium animate-fade-in ${
               statusMsg.type === 'success' 
                 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                 : 'bg-red-500/10 border-red-500/20 text-red-400'
             }`}>
               {statusMsg.text}
             </div>
           )}

           <div className="mt-auto pt-8">
             <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
               <span>Event Capacity</span>
               <span className="font-mono">{stats.checkedIn} / {stats.total}</span>
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
                   <p className="text-xs text-slate-500 uppercase">Registered</p>
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
                   <div className="text-center text-slate-600 text-sm py-8">Waiting for first arrival...</div>
                 ) : (
                   attendees
                     .filter(a => a.status === CheckInStatus.CHECKED_IN)
                     .slice(0, 5) // Show last 5
                     .reverse()
                     .map(attendee => (
                       <div key={attendee.id} className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700/50 animate-slide-up">
                         <div>
                           <p className="text-white font-medium text-sm">{attendee.fullName}</p>
                           <p className="text-indigo-400 text-xs font-mono">{attendee.id}</p>
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="text-xs text-slate-500">{new Date(attendee.checkInTime || '').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                           <div className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-xs">
                             In
                           </div>
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
