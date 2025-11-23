import React from 'react';
import { Heart, Gem, Flame, Sun, Moon } from 'lucide-react';
import { UserStats } from '../types';

interface TopBarProps {
  stats: UserStats;
  toggleTheme: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ stats, toggleTheme }) => {
  return (
    <div className="sticky top-0 z-50 bg-duo-bg/95 backdrop-blur-md border-b-2 border-duo-gray px-4 py-2 flex justify-between items-center max-w-2xl mx-auto w-full transition-colors duration-500">
      
      {/* Logo Area */}
      <div className="flex items-center space-x-2 mr-2">
        <button 
            onClick={toggleTheme} 
            className="p-2 rounded-xl hover:bg-duo-gray-light text-duo-text-sub transition-colors"
            aria-label="Toggle Theme"
        >
            {stats.theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
        </button>
        <div className="hidden sm:block font-fredoka font-bold text-xl tracking-tight text-duo-green">
            codulingo
        </div>
      </div>

      {/* Stats Container */}
      <div className="flex items-center space-x-3 sm:space-x-6 ml-auto">
        {/* Hearts */}
        <div className="flex items-center space-x-1.5 text-duo-red hover:bg-duo-gray-light px-2 py-1 rounded-xl transition-colors cursor-pointer">
            <Heart fill="currentColor" size={22} className="shrink-0" />
            <span className="text-duo-text font-bold text-lg">{stats.hearts === 999 ? '∞' : stats.hearts}</span>
        </div>

        {/* Streak */}
        <div className="flex items-center space-x-1.5 text-duo-yellow hover:bg-duo-gray-light px-2 py-1 rounded-xl transition-colors cursor-pointer">
            <Flame fill="currentColor" size={22} className="shrink-0" />
            <span className="text-duo-text font-bold text-lg">{stats.streak}</span>
        </div>

        {/* Gems */}
        <div className="flex items-center space-x-1.5 text-duo-blue-accent hover:bg-duo-gray-light px-2 py-1 rounded-xl transition-colors cursor-pointer">
            <Gem fill="currentColor" size={22} className="shrink-0" />
            <span className="text-duo-text font-bold text-lg">{stats.gems}</span>
        </div>
      </div>
    </div>
  );
};