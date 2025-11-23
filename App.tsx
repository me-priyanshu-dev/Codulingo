
import React, { useState, useEffect } from 'react';
import { 
  Home, 
  BookOpen, 
  User, 
  Star, 
  Lock, 
  CheckCircle,
  Trophy,
  ShoppingBag,
  MessageCircle,
  Loader2
} from 'lucide-react';
import { INITIAL_UNITS, INITIAL_STATS, RANK_THRESHOLDS } from './constants';
import { GameState, Level, Unit, ShopItem, UserStats, DailyQuest } from './types';
import { TopBar } from './components/TopBar';
import { LessonView } from './components/LessonView';
import { OnboardingView } from './components/OnboardingView';
import { ProfileView } from './components/ProfileView';
import { ShopView } from './components/ShopView';
import { AIChatView } from './components/AIChatView';
import { UnitIntroModal } from './components/UnitIntroModal';
import { RankUpModal } from './components/RankUpModal';
import { generateLevelContent } from './services/geminiService';

interface LevelNodeProps {
  level: Level;
  index: number;
  onStart: (unitId: string, levelId: string) => void;
  unitColor: string;
  unitId: string;
}

const LevelNode: React.FC<LevelNodeProps> = ({ level, index, onStart, unitColor, unitId }) => {
  const offset = Math.sin(index * 1.5) * 60; 
  const isBoss = level.isBossLevel;

  const colorMap: Record<string, string> = {
    green: 'bg-duo-green',
    blue: 'bg-duo-blue-accent',
    red: 'bg-duo-red',
    yellow: 'bg-duo-yellow',
    purple: 'bg-purple-500',
    teal: 'bg-teal-500'
  };
  
  const borderColorMap: Record<string, string> = {
    green: 'border-duo-green-dark',
    blue: 'border-duo-blue-dark',
    red: 'border-duo-red-dark',
    yellow: 'border-duo-yellow-dark',
    purple: 'border-purple-700',
    teal: 'border-teal-700'
  };

  const bgColor = level.isUnlocked ? (colorMap[unitColor] || 'bg-duo-gray') : 'bg-duo-gray-light';
  const borderColor = level.isUnlocked ? (borderColorMap[unitColor] || 'border-duo-gray') : 'border-duo-gray';
  
  const sizeClass = isBoss ? 'w-24 h-24 border-[6px]' : 'w-20 h-20 border-b-[6px] border-x-4 border-t-4';

  return (
    <div 
      className="flex flex-col items-center relative mb-6" 
      style={{ transform: `translateX(${offset}px)` }}
    >
      <div className="relative group">
        <button
          onClick={() => onStart(unitId, level.id)}
          className={`
            relative rounded-full flex items-center justify-center transition-all transform active:translate-y-2 active:border-b-0
            ${sizeClass} ${bgColor} ${borderColor}
            ${level.isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
          `}
        >
          {level.isCompleted ? (
            <div className="relative">
                <CheckCircle className="text-white/40 w-12 h-12" strokeWidth={3} />
                <Star className="text-duo-yellow absolute -top-1 -right-1 w-6 h-6 fill-current animate-pop-in" />
            </div>
          ) : isBoss ? (
            <Trophy className="text-white w-10 h-10 fill-current animate-pulse" />
          ) : level.isUnlocked ? (
            <Star className="text-white w-10 h-10 fill-current" />
          ) : (
            <Lock className="text-duo-gray w-8 h-8" />
          )}
        </button>
        {/* Tooltip */}
        <div className="absolute bottom-full mb-3 hidden group-hover:block w-40 bg-white border-2 border-duo-gray rounded-xl p-3 shadow-xl z-20 text-center -left-10 animate-in fade-in slide-in-from-bottom-2 pointer-events-none">
          <h3 className={`font-bold text-base ${isBoss ? 'text-duo-yellow' : 'text-duo-text'}`}>{level.title}</h3>
          <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-duo-gray rotate-45"></div>
        </div>
      </div>
    </div>
  );
};

const STORAGE_KEY = 'codulingo_v10_final';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentView: 'ONBOARDING',
    activeLevelId: null,
    activeUnitId: null,
    stats: { ...INITIAL_STATS, theme: 'light' },
    units: INITIAL_UNITS
  });
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGeneratingLevel, setIsGeneratingLevel] = useState(false);

  // --- Theme Effect ---
  useEffect(() => {
    const body = document.body;
    if (gameState.stats.theme === 'dark') {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
    }
  }, [gameState.stats.theme]);

  // --- Initialization & Loop ---
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.units && parsed.stats) { 
                
                // 1. Streak Logic
                const lastActive = new Date(parsed.stats.lastActiveDate);
                const today = new Date();
                const diffTime = Math.abs(today.getTime() - lastActive.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                let newStreak = parsed.stats.streak;
                
                // If diffDays > 2 (missed yesterday and day before), reset streak
                if (diffDays > 2) { 
                    newStreak = 0; 
                }

                // 2. Heart Refill Logic (1 heart every 30 mins)
                let newHearts = parsed.stats.hearts;
                const lastRefill = new Date(parsed.stats.lastHeartRefill || Date.now());
                const minsSinceRefill = (today.getTime() - lastRefill.getTime()) / (1000 * 60);
                
                if (newHearts < 5 && minsSinceRefill >= 30) {
                    const heartsToGain = Math.floor(minsSinceRefill / 30);
                    newHearts = Math.min(5, newHearts + heartsToGain);
                    // Update refill time
                    parsed.stats.lastHeartRefill = new Date().toISOString();
                }

                // 3. Daily Quests Check (Reset daily)
                const isNewDay = today.getDate() !== lastActive.getDate();
                let quests = parsed.stats.dailyQuests || [];
                if (isNewDay || quests.length === 0) {
                    quests = [
                        { id: 'xp', description: 'Earn 30 XP', target: 30, current: 0, reward: 20, isClaimed: false, type: 'XP' },
                        { id: 'lesson', description: 'Finish 2 Lessons', target: 2, current: 0, reward: 20, isClaimed: false, type: 'LESSONS' },
                        { id: 'perfect', description: '1 Perfect Lesson', target: 1, current: 0, reward: 50, isClaimed: false, type: 'PERFECT' }
                    ];
                }

                setGameState({
                    ...parsed,
                    currentView: 'HOME',
                    activeLevelId: null,
                    activeUnitId: null,
                    stats: { 
                        ...parsed.stats, 
                        streak: newStreak,
                        hearts: newHearts,
                        dailyQuests: quests,
                        theme: parsed.stats.theme || 'light' 
                    }
                });
            }
        } catch (e) {
            console.error("Failed to load save state", e);
        }
    }
    setIsLoaded(true);
  }, []);

  // --- Auto Save ---
  useEffect(() => {
    if (isLoaded && gameState.currentView !== 'ONBOARDING') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }
  }, [gameState, isLoaded]);

  // --- Helper Functions ---
  const getCurrentRank = (xp: number) => {
      for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
          if (xp >= RANK_THRESHOLDS[i].minXp) return RANK_THRESHOLDS[i];
      }
      return RANK_THRESHOLDS[0];
  };

  const checkDailyQuests = (type: 'XP' | 'LESSONS' | 'PERFECT', amount: number, currentStats: UserStats): DailyQuest[] => {
      return currentStats.dailyQuests.map(q => {
          if (q.type === type && !q.isClaimed) {
              return { ...q, current: Math.min(q.target, q.current + amount) };
          }
          return q;
      });
  };

  const handleOnboardingComplete = (name: string) => {
    setGameState(prev => ({
        ...prev,
        currentView: 'HOME',
        stats: { ...prev.stats, name: name }
    }));
  };

  const handleUnitClick = (unitId: string) => {
      setGameState(prev => ({ ...prev, showUnitIntro: unitId }));
  };

  const startLevel = async (unitId: string, levelId: string) => {
    const unit = gameState.units.find(u => u.id === unitId);
    const level = unit?.levels.find(l => l.id === levelId);
    if (!unit || !level || !level.isUnlocked) return;
    
    if (gameState.stats.hearts === 0 && !gameState.stats.isPro) {
      alert("Out of hearts! Wait for a refill or visit the shop.");
      return;
    }

    // AI Check
    if (!level.segments || level.segments.length === 0) {
        setIsGeneratingLevel(true);
        const generatedSegments = await generateLevelContent(level.title, level.description, gameState.stats.xp);
        
        setGameState(prev => {
            const newUnits = [...prev.units];
            const uIdx = newUnits.findIndex(u => u.id === unitId);
            const lIdx = newUnits[uIdx].levels.findIndex(l => l.id === levelId);
            newUnits[uIdx].levels[lIdx].segments = generatedSegments;
            return { ...prev, units: newUnits };
        });
        setIsGeneratingLevel(false);
    }

    setGameState(prev => ({
      ...prev,
      currentView: 'LESSON',
      activeLevelId: levelId,
      activeUnitId: unitId
    }));
  };

  const handleLessonComplete = (score: number) => {
    const unitIndex = gameState.units.findIndex(u => u.id === gameState.activeUnitId);
    if (unitIndex === -1) return;

    const newUnits = JSON.parse(JSON.stringify(gameState.units)) as Unit[];
    const currentUnit = newUnits[unitIndex];
    const levelIndex = currentUnit.levels.findIndex(l => l.id === gameState.activeLevelId);
    
    currentUnit.levels[levelIndex].isCompleted = true;
    currentUnit.levels[levelIndex].stars = score === 100 ? 3 : 2; // Simple star logic

    // Unlock next
    const isLastLevelInUnit = levelIndex === currentUnit.levels.length - 1;
    if (!isLastLevelInUnit) {
        currentUnit.levels[levelIndex + 1].isUnlocked = true;
    } else if (unitIndex < newUnits.length - 1) {
        newUnits[unitIndex + 1].levels[0].isUnlocked = true;
    }

    // Stats Update
    const oldXp = gameState.stats.xp;
    const newXp = oldXp + 15;
    const oldRank = getCurrentRank(oldXp);
    const newRank = getCurrentRank(newXp);
    
    // Check Rank Up
    const rankUpOccurred = newRank.name !== oldRank.name;

    // Check Quests
    let updatedQuests = checkDailyQuests('LESSONS', 1, gameState.stats);
    updatedQuests = updatedQuests.map(q => {
        if (q.type === 'XP' && !q.isClaimed) return { ...q, current: Math.min(q.target, q.current + 15) };
        return q;
    });
    if (score === 100) {
        updatedQuests = updatedQuests.map(q => {
             if (q.type === 'PERFECT' && !q.isClaimed) return { ...q, current: Math.min(q.target, q.current + 1) };
             return q;
        });
    }

    // Auto claim quest rewards? (Simplification: just add Gems if complete immediately for now, or let user claim)
    // Let's just auto-add gems for completed quests to keep it smooth
    let gemsGained = 10;
    updatedQuests.forEach(q => {
        if (q.current >= q.target && !q.isClaimed) {
            gemsGained += q.reward;
            q.isClaimed = true;
        }
    });

    setGameState(prev => ({
      ...prev,
      currentView: 'HOME',
      activeLevelId: null,
      activeUnitId: null,
      showRankUpModal: rankUpOccurred,
      units: newUnits,
      stats: {
        ...prev.stats,
        xp: newXp,
        gems: prev.stats.gems + gemsGained,
        hearts: prev.stats.isPro ? 5 : Math.min(prev.stats.hearts + 1, 5),
        lastActiveDate: new Date().toISOString(),
        streak: prev.stats.streak + 1,
        rank: newRank.name,
        dailyQuests: updatedQuests
      }
    }));
  };

  const handleLoseHeart = () => {
    if (gameState.stats.isPro) return;
    setGameState(prev => ({
      ...prev,
      stats: { ...prev.stats, hearts: Math.max(prev.stats.hearts - 1, 0) }
    }));
  };
  
  const handleBuyItem = (item: ShopItem) => {
      if (gameState.stats.gems < item.cost) return;
      
      const newStats = { ...gameState.stats, gems: gameState.stats.gems - item.cost };
      
      if (item.effect === 'HEART_REFILL') {
          newStats.hearts = 5;
      } else if (item.effect === 'PRO_PLAN') {
          newStats.isPro = true;
          newStats.hearts = 999; 
      } else if (item.effect === 'STREAK_REPAIR') {
          newStats.streak += 1; 
      } else if (item.effect === 'SKIN_DARK') {
          newStats.theme = newStats.theme === 'dark' ? 'light' : 'dark';
      } else if (item.effect === 'WAGER') {
          newStats.wagerActive = true;
      }
      
      setGameState(prev => ({ ...prev, stats: newStats }));
  };

  if (!isLoaded) return <div className="bg-duo-bg h-screen w-screen"></div>;

  if (gameState.currentView === 'ONBOARDING') {
    return <OnboardingView onComplete={handleOnboardingComplete} />;
  }
  
  if (isGeneratingLevel) {
      return (
          <div className="h-screen w-screen bg-duo-bg flex flex-col items-center justify-center p-8 text-center">
              <div className="relative">
                  <div className="text-6xl animate-bounce">🤖</div>
                  <Loader2 className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-duo-green animate-spin w-10 h-10" />
              </div>
              <h2 className="text-2xl font-fredoka font-bold text-duo-text mt-8 mb-2">Creating Lesson...</h2>
              <p className="text-duo-text-sub font-bold">Duo-Code is writing fresh code just for you.</p>
          </div>
      )
  }

  if (gameState.currentView === 'LESSON' && gameState.activeLevelId && gameState.activeUnitId) {
    const activeUnit = gameState.units.find(u => u.id === gameState.activeUnitId)!;
    const activeLevel = activeUnit.levels.find(l => l.id === gameState.activeLevelId)!;
    return (
      <LessonView 
        level={activeLevel} 
        onComplete={handleLessonComplete}
        onExit={() => setGameState(prev => ({ ...prev, currentView: 'HOME' }))}
        loseHeart={handleLoseHeart}
        hearts={gameState.stats.isPro ? 999 : gameState.stats.hearts}
      />
    );
  }

  const currentRank = getCurrentRank(gameState.stats.xp);
  const nextRank = RANK_THRESHOLDS[RANK_THRESHOLDS.indexOf(currentRank) + 1];
  const rankProgress = nextRank 
    ? ((gameState.stats.xp - currentRank.minXp) / (nextRank.minXp - currentRank.minXp)) * 100 
    : 100;

  return (
    <div className="bg-duo-bg min-h-[100dvh] flex flex-col font-sans text-duo-text select-none overflow-hidden transition-colors duration-300">
      
      {/* Unit Intro Modal */}
      {gameState.showUnitIntro && (
          <UnitIntroModal 
             unit={gameState.units.find(u => u.id === gameState.showUnitIntro)!} 
             onClose={() => setGameState(prev => ({ ...prev, showUnitIntro: undefined }))}
          />
      )}

      {/* Rank Up Modal */}
      {gameState.showRankUpModal && (
          <RankUpModal 
             newRank={gameState.stats.rank}
             icon={getCurrentRank(gameState.stats.xp).icon}
             onClose={() => setGameState(prev => ({ ...prev, showRankUpModal: false }))}
          />
      )}

      <TopBar 
        stats={gameState.stats} 
        toggleTheme={() => setGameState(prev => ({ ...prev, stats: { ...prev.stats, theme: prev.stats.theme === 'dark' ? 'light' : 'dark' } }))} 
      />

      <div className="flex-1 overflow-y-auto w-full pb-24">
        
        {/* VIEW: HOME */}
        {gameState.currentView === 'HOME' && (
             <div className="max-w-2xl mx-auto pt-6 px-4 flex flex-col items-center">
                
                {/* Rank Banner */}
                <div className="w-full bg-duo-card border-2 border-duo-gray rounded-2xl p-4 mb-6 flex items-center justify-between shadow-sm">
                    <div className="flex items-center">
                        <span className="text-3xl mr-3">{currentRank.icon}</span>
                        <div>
                            <h3 className="font-bold text-duo-text uppercase text-xs tracking-widest">Current Rank</h3>
                            <p className="font-fredoka font-bold text-xl text-duo-blue-accent">{currentRank.name}</p>
                        </div>
                    </div>
                    {nextRank && (
                        <div className="w-32">
                            <div className="flex justify-between text-xs font-bold text-duo-text-sub mb-1">
                                <span>XP</span>
                                <span>{nextRank.minXp - gameState.stats.xp} to go</span>
                            </div>
                            <div className="h-3 bg-duo-gray rounded-full overflow-hidden">
                                <div className="h-full bg-duo-yellow transition-all duration-500" style={{ width: `${rankProgress}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>

                {gameState.units.map((unit, uIdx) => (
                    <div key={unit.id} className="w-full mb-8">
                        <button 
                            onClick={() => handleUnitClick(unit.id)}
                            className={`
                            w-full text-white p-5 rounded-3xl mb-8 flex justify-between items-center shadow-lg transform transition-transform active:scale-95 border-b-4 hover:brightness-110
                            ${unit.color === 'green' ? 'bg-duo-green border-duo-green-dark' : 
                              unit.color === 'purple' ? 'bg-purple-500 border-purple-700' :
                              unit.color === 'teal' ? 'bg-teal-500 border-teal-700' : 
                              unit.color === 'red' ? 'bg-duo-red border-duo-red-dark' :
                              unit.color === 'yellow' ? 'bg-duo-yellow border-duo-yellow-dark' : 'bg-duo-blue-accent border-duo-blue-dark'}
                        `}>
                            <div className="text-left">
                                <h2 className="text-2xl font-extrabold font-fredoka uppercase tracking-wide">Unit {uIdx + 1}</h2>
                                <p className="text-lg font-bold opacity-90">{unit.description}</p>
                            </div>
                            <BookOpen size={32} className="opacity-60" strokeWidth={3} />
                        </button>

                        <div className="flex flex-col items-center space-y-2">
                            {unit.levels.map((level, lIdx) => (
                                <LevelNode 
                                    key={level.id} 
                                    level={level} 
                                    index={lIdx + (uIdx * 10)} 
                                    onStart={startLevel}
                                    unitColor={unit.color}
                                    unitId={unit.id}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* VIEW: PROFILE */}
        {gameState.currentView === 'PROFILE' && <ProfileView stats={gameState.stats} />}
        
        {/* VIEW: SHOP */}
        {gameState.currentView === 'SHOP' && <ShopView stats={gameState.stats} buyItem={handleBuyItem} />}
        
        {/* VIEW: CHAT */}
        {gameState.currentView === 'AI_CHAT' && <AIChatView />}

      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full bg-duo-bg border-t-2 border-duo-gray py-2 z-40">
        <div className="flex justify-around items-center w-full max-w-2xl mx-auto">
            <NavBtn 
                icon={<Home size={28} strokeWidth={2.5} />} 
                label="Learn" 
                active={gameState.currentView === 'HOME'} 
                onClick={() => setGameState(prev => ({ ...prev, currentView: 'HOME' }))} 
            />
            <NavBtn 
                icon={<MessageCircle size={28} strokeWidth={2.5} />} 
                label="Doubt" 
                active={gameState.currentView === 'AI_CHAT'} 
                onClick={() => setGameState(prev => ({ ...prev, currentView: 'AI_CHAT' }))} 
            />
            <NavBtn 
                icon={<ShoppingBag size={28} strokeWidth={2.5} />} 
                label="Shop" 
                active={gameState.currentView === 'SHOP'} 
                onClick={() => setGameState(prev => ({ ...prev, currentView: 'SHOP' }))} 
            />
            <NavBtn 
                icon={<User size={28} strokeWidth={2.5} />} 
                label="Profile" 
                active={gameState.currentView === 'PROFILE'} 
                onClick={() => setGameState(prev => ({ ...prev, currentView: 'PROFILE' }))} 
            />
        </div>
      </div>
    </div>
  );
};

const NavBtn = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`p-2 w-20 flex flex-col items-center justify-center transition-all rounded-xl active:bg-duo-gray-light ${active ? 'text-duo-blue-accent' : 'text-duo-text-sub hover:text-duo-text'}`}
    >
        {icon}
        <span className={`text-[11px] font-extrabold uppercase mt-1 tracking-wide ${active ? 'text-duo-blue-accent' : ''}`}>{label}</span>
    </button>
);

export default App;
