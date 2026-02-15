import React, { useEffect, useState } from 'react';
import { Attendee, TicketType } from '../types';
import { QrCodeIcon, SparklesIcon } from './Icons';
import { getWelcomeMessage } from '../services/geminiService';

interface TicketCardProps {
  attendee: Attendee;
  onBack: () => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ attendee, onBack }) => {
  const [welcomeMsg, setWelcomeMsg] = useState('');

  useEffect(() => {
    const fetchMsg = async () => {
      if (attendee.aiPersona) {
        const msg = await getWelcomeMessage(attendee.fullName, attendee.aiPersona);
        setWelcomeMsg(msg);
      }
    };
    fetchMsg();
  }, [attendee]);

  const getGradient = (type: TicketType) => {
    switch (type) {
      case TicketType.VIP: return 'from-amber-500 to-red-600';
      case TicketType.SPEAKER: return 'from-cyan-500 to-blue-600';
      case TicketType.PRESS: return 'from-emerald-500 to-teal-600';
      default: return 'from-indigo-500 to-purple-600';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto perspective-1000">
      
      {welcomeMsg && (
        <div className="mb-6 p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg text-center animate-fade-in">
           <p className="text-indigo-300 text-sm flex items-center justify-center gap-2">
             <SparklesIcon className="w-4 h-4" /> AI Concierge
           </p>
           <p className="text-slate-200 mt-1 font-medium">{welcomeMsg}</p>
        </div>
      )}

      {/* Ticket Container */}
      <div className="w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 relative">
        {/* Header Section */}
        <div className={`h-32 bg-gradient-to-r ${getGradient(attendee.ticketType)} p-6 relative`}>
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider border border-white/10">
            {attendee.ticketType}
          </div>
          <h1 className="text-white text-2xl font-bold mt-8 tracking-tight">EVENT HORIZON</h1>
          <p className="text-white/80 text-sm font-mono">2024 GLOBAL SUMMIT</p>
        </div>

        {/* Content Section */}
        <div className="p-8 bg-slate-900 relative">
          {/* Rip Effect */}
          <div className="absolute top-0 left-0 w-full transform -translate-y-1/2 flex justify-between px-2">
             {[...Array(20)].map((_, i) => (
               <div key={i} className="w-3 h-3 bg-slate-900 rounded-full"></div>
             ))}
          </div>

          <div className="text-center space-y-1">
             <h2 className="text-2xl font-bold text-white">{attendee.fullName}</h2>
             <p className="text-slate-400 text-sm">{attendee.role}</p>
             {attendee.aiPersona && (
               <div className="mt-2 inline-block bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 font-bold text-sm tracking-wide">
                    {attendee.aiPersona}
                  </span>
               </div>
             )}
          </div>

          {/* QR Code Area */}
          <div className="mt-8 flex flex-col items-center justify-center space-y-4">
            <div className="bg-white p-4 rounded-xl">
               {/* Simulating QR Code visually */}
               <div className="w-48 h-48 bg-white flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-0.5 opacity-90">
                    {[...Array(36)].map((_, i) => (
                      <div key={i} className={`bg-black ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`}></div>
                    ))}
                 </div>
                 <div className="absolute inset-0 border-4 border-black"></div>
                 <div className="absolute top-4 left-4 w-8 h-8 border-4 border-black bg-black"></div>
                 <div className="absolute top-4 right-4 w-8 h-8 border-4 border-black bg-black"></div>
                 <div className="absolute bottom-4 left-4 w-8 h-8 border-4 border-black bg-black"></div>
                 <div className="z-10 bg-white p-1 rounded">
                    <QrCodeIcon className="w-8 h-8 text-black" />
                 </div>
               </div>
            </div>
            <p className="text-xs text-slate-500 font-mono tracking-widest">{attendee.id}</p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between text-xs text-slate-500 uppercase tracking-widest">
            <div>
              <p className="text-slate-600 mb-1">Date</p>
              <p className="text-slate-300">OCT 15</p>
            </div>
            <div>
              <p className="text-slate-600 mb-1">Gate</p>
              <p className="text-slate-300">04-A</p>
            </div>
            <div>
              <p className="text-slate-600 mb-1">Seat</p>
              <p className="text-slate-300">GEN</p>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        onClick={onBack}
        className="mt-8 text-slate-400 hover:text-white transition-colors text-sm underline underline-offset-4"
      >
        Return to Home
      </button>
    </div>
  );
};

export default TicketCard;
