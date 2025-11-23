
export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  FILL_BLANK = 'FILL_BLANK',
  REARRANGE = 'REARRANGE',
  MATCHING = 'MATCHING'
}

export interface Pair {
  id: string;
  left: string;
  right: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  codeSnippet?: string;
  options?: string[]; // Used for MC, Rearrange, Fill
  pairs?: Pair[]; // Used for Matching
  correctAnswer?: string | string[]; 
  explanation: string;
}

export type LessonSegmentType = 'EXPLANATION' | 'CHALLENGE';

export type CharacterType = 'owl' | 'robot' | 'cat' | 'bug';

export interface LessonSegment {
  id: string;
  type: LessonSegmentType;
  title?: string; // For header
  content?: string; // For explanation text
  codeSnippet?: string; // Explicit field for visual preview code
  character?: CharacterType; // Character to display
  question?: Question; // If type is CHALLENGE
}

export interface Level {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  segments: LessonSegment[];
  isUnlocked: boolean;
  isCompleted: boolean;
  stars: number;
  isBossLevel?: boolean;
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  guidebookContent?: string; // Short intro/tips for the modal
  color: 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'teal';
  levels: Level[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  condition: (stats: UserStats) => boolean;
}

export interface DailyQuest {
    id: string;
    description: string;
    target: number;
    current: number;
    reward: number;
    isClaimed: boolean;
    type: 'XP' | 'LESSONS' | 'PERFECT';
}

export interface UserStats {
  name: string;
  hearts: number;
  gems: number;
  xp: number;
  streak: number;
  joinedDate: string;
  lastActiveDate: string;
  lastHeartRefill: string; // ISO Date for automatic refilling
  theme: 'light' | 'dark';
  isPro: boolean;
  rank: string;
  achievements: string[]; // IDs of unlocked achievements
  wagerActive: boolean; // Double or nothing wager
  dailyQuests: DailyQuest[];
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string; 
  effect: 'HEART_REFILL' | 'STREAK_FREEZE' | 'PRO_PLAN' | 'STREAK_REPAIR' | 'WAGER' | 'SKIN_DARK';
}

export interface GameState {
  currentView: 'ONBOARDING' | 'HOME' | 'LESSON' | 'PROFILE' | 'SHOP' | 'AI_CHAT';
  activeLevelId: string | null;
  activeUnitId: string | null;
  stats: UserStats;
  units: Unit[];
  showRankUpModal?: boolean;
  showUnitIntro?: string; // Unit ID
}
