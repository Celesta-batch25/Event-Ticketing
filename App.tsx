import React, { useState } from 'react';
import { Attendee, CheckInStatus } from './types';
import RegistrationForm from './components/RegistrationForm';
import TicketCard from './components/TicketCard';
import AdminDashboard from './components/AdminDashboard';
import { TicketIcon, UsersIcon } from './components/Icons';

type View = 'LANDING' | 'PARTICIPANT_REGISTER' | 'PARTICIPANT_TICKET' | 'ADMIN_DASHBOARD';

const App: React.FC = () => {
  const [view, setView] = useState<View>('LANDING');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [currentTicket, setCurrentTicket] = useState<Attendee | null>(null);

  const handleRegister = (attendee: Attendee) => {
    setAttendees(prev => [...prev, attendee]);
    setCurrentTicket(attendee);
    setView('PARTICIPANT_TICKET');
  };

  const handleCheckIn = (id: string): { success: boolean; message: string; attendee?: Attendee } => {
    const idx = attendees.findIndex(a => a.id === id);
    if (idx === -1) {
      return { success: false, message: 'Ticket ID not found.' };
    }
    
    const attendee = attendees[idx];
    if (attendee.status === CheckInStatus.CHECKED_IN) {
       return { success: false, message: `Attendee ${attendee.fullName} already checked in.`, attendee };
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
      case 'LANDING':
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12 animate-fade-in px-4">
            
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
                EVENT HORIZON
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 font-light">
                The nexus of technology and imagination awaits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mt-8">
              {/* Participant Card */}
              <div 
                onClick={() => setView('PARTICIPANT_REGISTER')}
                className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-indigo-500 rounded-3xl p-8 cursor-pointer transition-all hover:transform hover:scale-105 hover:bg-slate-800 text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
                    <TicketIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Participant Portal</h3>
                  <p className="text-slate-400">Register for the event, generate your personalized badge, and get your digital ticket.</p>
                  <div className="mt-6 flex items-center text-indigo-400 font-medium group-hover:translate-x-2 transition-transform">
                    Enter Portal &rarr;
                  </div>
                </div>
              </div>

              {/* Organizer Card */}
              <div 
                onClick={() => setView('ADMIN_DASHBOARD')}
                className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-emerald-500 rounded-3xl p-8 cursor-pointer transition-all hover:transform hover:scale-105 hover:bg-slate-800 text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                    <UsersIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Organizing Committee</h3>
                  <p className="text-slate-400">Manage gate entry, scan attendee QR codes, and monitor real-time event analytics.</p>
                  <div className="mt-6 flex items-center text-emerald-400 font-medium group-hover:translate-x-2 transition-transform">
                    Access Dashboard &rarr;
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'PARTICIPANT_REGISTER':
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-slide-up w-full">
            <div className="w-full max-w-md mb-4">
              <button onClick={() => setView('LANDING')} className="text-slate-400 hover:text-white flex items-center gap-2 mb-4 transition-colors">
                &larr; Back to Home
              </button>
            </div>
            <RegistrationForm onRegister={handleRegister} onCancel={() => setView('LANDING')} />
          </div>
        );

      case 'PARTICIPANT_TICKET':
        return currentTicket ? (
          <div className="flex justify-center items-center min-h-[80vh] px-4 animate-slide-up">
            <TicketCard attendee={currentTicket} onBack={() => setView('LANDING')} />
          </div>
        ) : (
          setView('LANDING') as any
        );

      case 'ADMIN_DASHBOARD':
        return (
          <div className="min-h-[80vh] px-4 py-4 animate-fade-in">
            <AdminDashboard attendees={attendees} onCheckIn={handleCheckIn} onBack={() => setView('LANDING')} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500 selection:text-white overflow-x-hidden relative font-inter">
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-emerald-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 container mx-auto p-4 md:p-6">
        {/* Navbar */}
        <nav className="flex justify-between items-center py-6 mb-4">
          <div className="text-xl font-bold tracking-tighter flex items-center gap-2 cursor-pointer select-none" onClick={() => setView('LANDING')}>
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-xs font-bold shadow-lg shadow-indigo-500/30">EH</div>
            EventHorizon
          </div>
          {view !== 'LANDING' && (
             <div className="text-xs font-mono text-slate-500 border border-slate-800 px-2 py-1 rounded bg-slate-900/50">
               {view === 'ADMIN_DASHBOARD' ? 'ADMIN MODE' : 'ATTENDEE MODE'}
             </div>
          )}
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

        /* Hide scrollbar for scanner if needed */
        #reader video {
            object-fit: cover;
            border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default App;
