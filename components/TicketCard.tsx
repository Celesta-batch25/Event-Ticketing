import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Attendee, TicketType } from '../types';
import { QrCodeIcon, SparklesIcon, WhatsAppIcon } from './Icons';
import { getWelcomeMessage } from '../services/geminiService';

interface TicketCardProps {
  attendee: Attendee;
  onBack: () => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ attendee, onBack }) => {
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const fetchMsg = async () => {
      if (attendee.aiPersona) {
        const msg = await getWelcomeMessage(attendee.fullName, attendee.aiPersona);
        setWelcomeMsg(msg);
      }
    };
    fetchMsg();

    // Generate real QR code
    const generateQR = async () => {
      try {
        const qrData = JSON.stringify({
          id: attendee.id,
          name: attendee.fullName,
          ticketType: attendee.ticketType,
          event: "Event Horizon 2024"
        });
        const url = await QRCode.toDataURL(qrData, { 
          margin: 1, 
          width: 256,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
        setQrCodeUrl(url);
      } catch (err) {
        console.error("Error generating QR code", err);
      }
    };
    generateQR();
  }, [attendee]);

  const getGradient = (type: TicketType) => {
    switch (type) {
      case TicketType.VIP: return 'from-amber-500 to-red-600';
      case TicketType.SPEAKER: return 'from-cyan-500 to-blue-600';
      case TicketType.PRESS: return 'from-emerald-500 to-teal-600';
      default: return 'from-indigo-500 to-purple-600';
    }
  };

  const shareToWhatsApp = () => {
    const text = `🚀 Event Horizon Ticket\n\n👤 Name: ${attendee.fullName}\n🎫 Type: ${attendee.ticketType}\n🆔 Ref: ${attendee.id}\n\nPresent this message or your QR code at the gate!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto perspective-1000 pb-12">
      
      {welcomeMsg && (
        <div className="mb-6 p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg text-center animate-fade-in w-full">
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
            <div className="bg-white p-4 rounded-xl shadow-inner">
               {qrCodeUrl ? (
                 <img src={qrCodeUrl} alt="Ticket QR Code" className="w-48 h-48 object-contain" />
               ) : (
                 <div className="w-48 h-48 bg-slate-100 flex items-center justify-center">
                    <QrCodeIcon className="w-8 h-8 text-slate-300 animate-pulse" />
                 </div>
               )}
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
      
      <div className="flex flex-col gap-3 w-full mt-6">
        <button 
          onClick={shareToWhatsApp}
          className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-transform transform hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <WhatsAppIcon className="w-5 h-5" />
          Send to WhatsApp
        </button>

        <button 
          onClick={onBack}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 px-4 rounded-xl border border-slate-700 transition-colors"
        >
          Back to Portal
        </button>
      </div>
    </div>
  );
};

export default TicketCard;
