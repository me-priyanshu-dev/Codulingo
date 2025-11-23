
import React from 'react';
import { Button } from './Button';

interface RankUpModalProps {
  newRank: string;
  icon: string;
  onClose: () => void;
}

export const RankUpModal: React.FC<RankUpModalProps> = ({ newRank, icon, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
         
         <div className="relative mb-8 animate-float">
             <div className="text-9xl filter drop-shadow-[0_0_30px_rgba(255,200,0,0.6)]">{icon}</div>
             {/* Confetti Particles (Simulated with div dots) */}
             <div className="absolute top-0 left-0 w-2 h-2 bg-red-500 rounded-full animate-ping" style={{animationDelay: '0.1s'}}></div>
             <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
             <div className="absolute bottom-0 left-10 w-2 h-2 bg-yellow-500 rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
         </div>

         <h2 className="text-duo-yellow font-fredoka font-extrabold text-4xl mb-2 uppercase tracking-wider animate-in zoom-in duration-300">Rank Up!</h2>
         <p className="text-white text-xl font-bold mb-8">You are now a <span className="text-duo-green">{newRank}</span></p>

         <Button onClick={onClose} variant="secondary" fullWidth size="lg">
             AWESOME!
         </Button>
      </div>
    </div>
  );
};
