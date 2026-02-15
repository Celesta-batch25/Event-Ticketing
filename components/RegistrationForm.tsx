import React, { useState } from 'react';
import { TicketType, Attendee, CheckInStatus } from '../types';
import { generateBadgePersona } from '../services/geminiService';
import { SparklesIcon } from './Icons';

interface RegistrationFormProps {
  onRegister: (attendee: Attendee) => void;
  onCancel: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegister, onCancel }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [ticketType, setTicketType] = useState<TicketType>(TicketType.GENERAL);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    // Call AI to generate persona
    const persona = await generateBadgePersona(fullName, role, ticketType);

    const newAttendee: Attendee = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      fullName,
      email,
      role,
      ticketType,
      status: CheckInStatus.REGISTERED,
      aiPersona: persona,
    };

    setIsGenerating(false);
    onRegister(newAttendee);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Secure Your Spot</h2>
        <p className="text-slate-400">Join the event of the century.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            placeholder="Jane Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            placeholder="jane@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Job Role / Title</label>
          <input
            type="text"
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            placeholder="Frontend Engineer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Ticket Tier</label>
          <select
            value={ticketType}
            onChange={(e) => setTicketType(e.target.value as TicketType)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          >
            {Object.values(TicketType).map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className={`w-full py-3 px-4 rounded-lg text-white font-semibold shadow-lg transform transition-all flex items-center justify-center gap-2 ${
            isGenerating 
              ? 'bg-indigo-700 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.02]'
          }`}
        >
          {isGenerating ? (
            <>
              <SparklesIcon className="animate-spin h-5 w-5" />
              <span>Generating Badge...</span>
            </>
          ) : (
            'Complete Registration'
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;
