import React from 'react';
import { Timer, Target, BarChart2, Scroll, ShoppingBag } from 'lucide-react';
import { soundFx } from '../../audio/synthAudio';

export type MainTabType = 'timer' | 'goals' | 'stats' | 'quests' | 'shop';

interface NavigationBarProps {
  activeTab: MainTabType;
  onChangeTab: (tab: MainTabType) => void;
  questBadgeCount?: number;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeTab,
  onChangeTab,
  questBadgeCount = 0,
}) => {
  const tabs = [
    { id: 'timer' as const, label: 'Fokus Timer', icon: <Timer size={16} /> },
    { id: 'goals' as const, label: 'Identitas & Goal', icon: <Target size={16} /> },
    { id: 'stats' as const, label: 'Statistik & Map', icon: <BarChart2 size={16} /> },
    {
      id: 'quests' as const,
      label: 'Quest Board',
      icon: <Scroll size={16} />,
      badge: questBadgeCount,
    },
    { id: 'shop' as const, label: 'Pixel Armory', icon: <ShoppingBag size={16} /> },
  ];

  return (
    <nav className="w-full bg-[#181528] border-b-2 border-black sticky top-0 z-30 shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
      <div className="max-w-6xl mx-auto flex items-center justify-start sm:justify-center overflow-x-auto px-2 py-1.5 gap-2 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                onChangeTab(tab.id);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 font-silkscreen text-xs uppercase cursor-pointer border-2 transition-all whitespace-nowrap relative shrink-0 ${
                isActive
                  ? 'bg-[#ff0055] text-white border-black shadow-[2px_2px_0px_#000] font-bold'
                  : 'bg-[#120f20] text-[#9f97ba] border-[#2c2444] hover:text-white hover:border-[#423766]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {Boolean(tab.badge && tab.badge > 0) && (
                <span className="w-4 h-4 bg-[#ffd700] text-black text-[9px] font-pixel rounded-full flex items-center justify-center animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

