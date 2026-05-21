import React from 'react';
import { Play } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  key?: React.Key;
  onStartWorkout: () => void;
  hasActiveWorkout: boolean;
  onResumeWorkout: () => void;
}

export function Dashboard({ onStartWorkout, hasActiveWorkout, onResumeWorkout }: DashboardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative flex flex-col items-center justify-center min-h-screen pb-20 px-6 text-center"
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop" 
          alt="Gym" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center mt-20">
        {hasActiveWorkout ? (
          <>
            <div className="w-24 h-24 rounded-full bg-black border-2 border-neon flex items-center justify-center text-neon shadow-[0_0_20px_rgba(57,255,20,0.2)] mb-8">
              <Play fill="currentColor" size={40} className="ml-2" />
            </div>
            
            <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-4 drop-shadow-md">
              MASZ AKTYWNY TRENING
            </h1>
            <p className="text-neutral-300 font-medium text-sm mb-10 px-4 leading-relaxed drop-shadow-md">
              Zakończ lub kontynuuj obecną sesję, zanim rozpoczniesz nową.
            </p>
            
            <button 
              onClick={onResumeWorkout}
              className="w-full bg-neon text-black font-bold uppercase tracking-wider text-sm py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-[0_0_15px_rgba(57,255,20,0.4)]"
            >
              <Play fill="currentColor" size={16} /> Wróć do treningu
            </button>
          </>
        ) : (
          <>
            <div className="w-24 h-24 rounded-full bg-black border-[3px] border-[#050505] flex items-center justify-center text-neon mb-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <Play fill="currentColor" size={40} className="ml-2" />
            </div>
            
            <h1 className="text-[28px] font-black text-white tracking-widest uppercase mb-4 drop-shadow-md">
              ZACZNIJ SESJĘ
            </h1>
            <p className="text-neutral-300 font-medium text-sm mb-12 px-6 leading-relaxed drop-shadow-md">
              Zapisuj swoje serie, powtórzenia i buduj progresywną siłę każdego dnia.
            </p>
            
            <button 
              onClick={onStartWorkout}
              className="w-full bg-[#99f225] hover:bg-neon text-black font-black uppercase tracking-widest text-sm py-4 rounded-[14px] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_0_20px_rgba(153,242,37,0.3)]"
            >
              <Play fill="currentColor" size={16} /> Rozpocznij trening
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
