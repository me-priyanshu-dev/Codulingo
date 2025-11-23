
import React from 'react';
import { BookOpen, X } from 'lucide-react';
import { Unit } from '../types';
import { Button } from './Button';

interface UnitIntroModalProps {
  unit: Unit;
  onClose: () => void;
}

export const UnitIntroModal: React.FC<UnitIntroModalProps> = ({ unit, onClose }) => {
  const colorMap: Record<string, string> = {
    green: 'bg-duo-green',
    blue: 'bg-duo-blue-accent',
    red: 'bg-duo-red',
    yellow: 'bg-duo-yellow',
    purple: 'bg-purple-500',
    teal: 'bg-teal-500'
  };

  const textColorMap: Record<string, string> = {
      green: 'text-duo-green',
      blue: 'text-duo-blue-accent',
      red: 'text-duo-red',
      yellow: 'text-duo-yellow',
      purple: 'text-purple-500',
      teal: 'text-teal-500'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-duo-card w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border-2 border-duo-gray relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className={`${colorMap[unit.color]} p-6 text-center relative`}>
             <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
                <X size={24} />
             </button>
             <h2 className="text-white font-fredoka font-bold text-2xl uppercase tracking-wider mb-1">{unit.title}</h2>
             <p className="text-white/90 font-bold text-lg">{unit.description}</p>
        </div>

        {/* Content */}
        <div className="p-6">
            <div className="flex items-center mb-4">
                <BookOpen size={24} className={`${textColorMap[unit.color]} mr-2`} />
                <span className="text-duo-text font-bold uppercase text-sm tracking-widest">Guidebook</span>
            </div>
            
            <div className="text-duo-text text-lg leading-relaxed whitespace-pre-wrap font-medium">
                {unit.guidebookContent || "Ready to learn? Complete the lessons to master this topic!"}
            </div>

            <div className="mt-8">
                <Button onClick={onClose} variant="primary" fullWidth size="lg">
                    I'M READY
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};
