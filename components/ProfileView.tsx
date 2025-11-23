import React from 'react';
import { UserStats } from '../types';
import { Flame, Zap, Clock, Calendar, Trophy } from 'lucide-react';
import { ACHIEVEMENTS } from '../constants';

interface ProfileViewProps {
  stats: UserStats;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ stats }) => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = new Date().getDay(); 
  const todayIdx = today === 0 ? 6 : today - 1;

  return (
    <div className="p-6 pb-32 max-w-2xl mx-auto w-full animate-in fade-in duration-500">
      
      {/* Header Profile Card */}
      <div className="flex items-center space-x-6 mb-8 p-4">
         <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold border-4 shadow-lg ${stats.isPro ? 'bg-duo-yellow text-black border-white ring-4 ring-duo-yellow/30' : 'bg-duo-blue-accent text-white border-duo-blue-dark'}`}>
            {stats.name.charAt(0).toUpperCase()}
         </div>
         <div>
            <h1 className="text-3xl font-extrabold text-duo-text mb-1 font-fredoka flex items-center gap-2">
                {stats.name}
                {stats.isPro && <Trophy size={24} className="text-duo-yellow" fill="currentColor"/>}
            </h1>
            <p className="text-duo-text-sub font-bold flex items-center">
                <Clock size={16} className="mr-1.5"/> Joined {new Date(stats.joinedDate).toLocaleDateString()}
            </p>
         </div>
      </div>

      <hr className="border-t-2 border-duo-gray mb-8" />

      {/* Stats Grid */}
      <h3 className="font-bold text-xl font-fredoka text-duo-text mb-4">Statistics</h3>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-duo-card border-2 border-duo-gray p-4 rounded-2xl flex items-center space-x-4 shadow-sm">
            <div className="p-3 bg-white border-2 border-duo-gray rounded-xl">
                <Flame size={24} className="text-duo-yellow" fill="currentColor" />
            </div>
            <div>
                <div className="text-2xl font-extrabold text-duo-text">{stats.streak}</div>
                <div className="text-xs text-duo-text-sub font-bold uppercase tracking-wide">Day Streak</div>
            </div>
        </div>
        <div className="bg-duo-card border-2 border-duo-gray p-4 rounded-2xl flex items-center space-x-4 shadow-sm">
            <div className="p-3 bg-white border-2 border-duo-gray rounded-xl">
                <Zap size={24} className="text-duo-yellow" fill="currentColor" />
            </div>
            <div>
                <div className="text-2xl font-extrabold text-duo-text">{stats.xp}</div>
                <div className="text-xs text-duo-text-sub font-bold uppercase tracking-wide">Total XP</div>
            </div>
        </div>
      </div>

      {/* Streak Calendar */}
      <div className="bg-duo-card border-2 border-duo-gray rounded-2xl p-6 mb-8 shadow-sm">
         <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl font-fredoka text-duo-text">Activity</h3>
            <Calendar className="text-duo-gray" size={24}/>
         </div>
         <div className="flex justify-between">
            {days.map((d, i) => {
                const isActive = i <= todayIdx; 
                // Simple logic for illustration: Active usually implies 'did a lesson', here we just highlight past days
                return (
                    <div key={i} className="flex flex-col items-center space-y-2">
                        <span className="text-xs font-bold text-duo-text-sub">{d}</span>
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all
                            ${isActive ? 'bg-duo-yellow text-white shadow-sm' : 'bg-transparent border-2 border-duo-gray text-duo-gray'}
                        `}>
                            {isActive && <Flame size={14} fill="currentColor"/>}
                        </div>
                    </div>
                )
            })}
         </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-duo-card border-2 border-duo-gray rounded-2xl p-6 mb-8 shadow-sm">
         <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl font-fredoka text-duo-text">Achievements</h3>
            <Trophy className="text-duo-gray" size={24}/>
         </div>
         <div className="grid gap-4">
             {ACHIEVEMENTS.map(ach => {
                 const isUnlocked = ach.condition(stats);
                 return (
                     <div key={ach.id} className={`flex items-center p-4 rounded-2xl border-2 ${isUnlocked ? 'bg-white border-duo-yellow' : 'bg-duo-gray-light border-transparent'}`}>
                         <div className={`text-4xl mr-4 ${!isUnlocked && 'grayscale opacity-50'}`}>{ach.icon}</div>
                         <div>
                             <h4 className={`font-bold text-base ${isUnlocked ? 'text-duo-text' : 'text-duo-text-sub'}`}>{ach.title}</h4>
                             <p className="text-xs text-duo-text-sub font-bold mt-1">{ach.description}</p>
                         </div>
                     </div>
                 )
             })}
         </div>
      </div>

    </div>
  );
};