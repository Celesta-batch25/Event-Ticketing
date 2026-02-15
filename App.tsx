import React, { useState } from 'react';
import { Attendee, CheckInStatus } from './types';
import RegistrationForm from './components/RegistrationForm';
import TicketCard from './components/TicketCard';
import AdminDashboard from './components/AdminDashboard';
import { TicketIcon } from './components/Icons';

type View = 'HOME' | 'REGISTER' | 'TICKET' | 'ADMIN';

const App: React.FC = () => {
  const [view, setView] = useState<View>('HOME');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [currentTicket, setCurrentTicket] = useState<Attendee | null>(null);

  const handleRegister = (attendee: Attendee) => {
    setAttendees(prev => [...prev, attendee]);
    setCurrentTicket(attendee);
    setView('TICKET');
  };

  const handleCheckIn = (id: string): { success: boolean; message: string; attendee?: Attendee } => {
    const idx = attendees.findIndex(a => a.id === id);
    if (idx === -1) {
      return { success: false, message: 'Ticket ID not found.' };
    }
    
    const attendee = attendees[idx];
    if (attendee.status === CheckInStatus.CHECKED_IN) {
       return { success: false, message: 'Already checked in.', attendee };
    }

    const updatedAttendees = [...attendees];
    updatedAttendees[idx] = { 
      ...attendee, 
      status: CheckInStatus.CHECKED_IN,
      checkInTime: new Date().toISOString()
    };
    
    setAttendees(updatedAttendees);
    return { success: true, message: `Welcome, ${attendee.fullName}!`, attendee: updatedAttendees[idx] };
  };

  const renderContent = () => {
    switch (view) {
      case 'HOME':
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8 animate-fade-in px-4">
            <div className="relative group cursor-pointer" onClick={() => setView('REGISTER')}>
               <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt filter blur-lg"></div>
               <div className="relative w-24 h-24 bg-black rounded-full flex items-center justify-center border border-white/10">
                 <TicketIcon className="w-10 h-10 text-white" />
               </div>
            </div>
            
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
                EVENT HORIZON
              </h1>
              <p className="text-xl text-slate-400">
                Experience the nexus of technology and imagination.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
              <button 
                onClick={() => setView('REGISTER')}
                className="flex-1 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-all transform hover:scale-105 shadow-xl shadow-white/10"
              >
                Get Ticket
              </button>
              <button 
                onClick={() => setView('ADMIN')}
                className="flex-1 px-8 py-4 bg-slate-800 text-white font-semibold rounded-xl border border-slate-700 hover:bg-slate-700 transition-all"
              >
                Gate Admin
              </button>
            </div>
          </div>
        );
      
      case 'REGISTER':
        return (
          <div className="flex justify-center items-center min-h-[80vh] px-4 animate-slide-up">
            <RegistrationForm onRegister={handleRegister} onCancel={() => setView('HOME')} />
          </div>
        );

      case 'TICKET':
        return currentTicket ? (
          <div className="flex justify-center items-center min-h-[80vh] px-4 animate-slide-up">
            <TicketCard attendee={currentTicket} onBack={() => setView('HOME')} />
          </div>
        ) : (
          setView('HOME') as any
        );

      case 'ADMIN':
        return (
          <div className="min-h-[80vh] px-4 py-8">
            <AdminDashboard attendees={attendees} onCheckIn={handleCheckIn} onBack={() => setView('HOME')} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500 selection:text-white overflow-x-hidden relative">
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 container mx-auto p-4">
        {/* Navbar */}
        <nav className="flex justify-between items-center py-6 mb-4">
          <div className="text-xl font-bold tracking-tighter flex items-center gap-2 cursor-pointer" onClick={() => setView('HOME')}>
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg"></div>
            EventHorizon
          </div>
        </nav>

        {renderContent()}
      </div>

      <style>{`
        @keyframes tilt {
          0%, 50%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(1deg); }
          75% { transform: rotate(-1deg); }
        }
        .animate-tilt { animation: tilt 10s infinite linear; }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;
