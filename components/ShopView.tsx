import React from 'react';
import { ShopItem, UserStats } from '../types';
import { SHOP_ITEMS } from '../constants';
import { Gem, Heart, Lock } from 'lucide-react';
import { Button } from './Button';

interface ShopViewProps {
  stats: UserStats;
  buyItem: (item: ShopItem) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ stats, buyItem }) => {
  return (
    <div className="p-6 pb-32 max-w-2xl mx-auto w-full animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-fredoka font-extrabold text-duo-text mb-2">Shop</h1>
        <p className="text-duo-text-sub font-bold">Spend your gems on power-ups!</p>
      </div>

      {/* Gem Balance Banner */}
      <div className="sticky top-20 z-10 bg-white/90 backdrop-blur border-b-4 border-duo-gray p-4 mb-8 -mx-6 px-6 flex justify-between items-center">
         <span className="font-extrabold text-lg text-duo-text uppercase tracking-wide">Balance</span>
         <div className="flex items-center space-x-2 bg-duo-gray-light px-4 py-2 rounded-xl">
            <Gem className="text-duo-blue-accent" fill="currentColor" />
            <span className="text-2xl font-black text-duo-blue-accent">{stats.gems}</span>
         </div>
      </div>

      {/* Items Grid */}
      <div className="grid gap-6">
        {SHOP_ITEMS.map((item) => {
            const canAfford = stats.gems >= item.cost;
            let isDisabled = !canAfford;
            let btnText: React.ReactNode = <><span className="font-bold mr-1">{item.cost}</span><Gem size={16} fill="currentColor" /></>;
            let borderClass = "border-duo-gray";

            if (item.effect === 'HEART_REFILL') {
                if (stats.hearts >= 5) {
                    isDisabled = true;
                    btnText = 'FULL';
                }
            } else if (item.effect === 'PRO_PLAN') {
                borderClass = "border-duo-yellow bg-gradient-to-br from-white to-yellow-50";
                if (stats.isPro) {
                    isDisabled = true;
                    btnText = 'OWNED';
                }
            } else if (item.effect === 'STREAK_REPAIR') {
                 if (stats.streak > 0) {
                     isDisabled = true;
                     btnText = 'ACTIVE';
                 }
            } else if (item.effect === 'SKIN_DARK') {
                // Toggle text
                 btnText = stats.theme === 'dark' ? 'DISABLE' : <>{item.cost} <Gem size={16} fill="currentColor"/></>;
                 if (stats.theme === 'dark') isDisabled = false;
            }

            return (
                <div key={item.id} className={`bg-duo-card border-2 ${borderClass} rounded-2xl p-5 flex items-center justify-between group hover:bg-duo-gray-light/50 transition-colors`}>
                    <div className="flex items-center space-x-5">
                        <div className="text-5xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                            {item.icon}
                        </div>
                        <div>
                            <h3 className="font-extrabold text-duo-text text-lg flex items-center gap-2">
                                {item.name}
                                {item.effect === 'PRO_PLAN' && <span className="bg-duo-yellow text-white text-[10px] px-2 py-0.5 rounded-lg uppercase tracking-widest font-black">VIP</span>}
                            </h3>
                            <p className="text-sm text-duo-text-sub font-medium leading-tight mt-1 max-w-[200px]">{item.description}</p>
                        </div>
                    </div>
                    
                    <Button 
                        size="md"
                        variant={isDisabled && btnText !== 'OWNED' && btnText !== 'ACTIVE' && btnText !== 'FULL' ? 'outline' : 'secondary'}
                        disabled={isDisabled}
                        onClick={() => buyItem(item)}
                        className="min-w-[110px]"
                    >
                        {btnText}
                    </Button>
                </div>
            );
        })}
      </div>
    </div>
  );
};