import React from 'react';
import { Timer, Target, BarChart2 } from 'lucide-react';
import { soundFx } from '../../audio/synthAudio';

export type MainTabType = 'timer' | 'goals' | 'stats';

interface NavigationBarProps {
  activeTab: MainTabType;
  onChangeTab: (tab: MainTabType) => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const tabs = [
    { id: 'timer' as const, label: 'Fokus Timer', icon: <Timer size={16} /> },
    { id: 'goals' as const, label: 'Identitas & Goal', icon: <Target size={16} /> },
    { id: 'stats' as const, label: 'Statistik & Map', icon: <BarChart2 size={16} /> },
  ];

  return (
    <nav className="w-full bg-[#181528] border-b-2 border-black sticky top-0 z-30 shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
      <div className="max-w-6xl mx-auto flex items-center justify-center overflow-x-auto px-2 py-1.5 gap-2 sm:gap-3 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                onChangeTab(tab.id);
              }}
              className={`relative px-3 sm:px-5 py-2 font-silkscreen text-xs uppercase cursor-pointer flex items-center gap-2 border-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#00f0ff] text-black border-black font-bold shadow-[2px_2px_0px_#000] -translate-y-0.5'
                  : 'bg-[#120f20] text-[#9f97ba] border-[#2b2545] hover:text-[#f0edf6] hover:border-[#3b335c]'
              }`}
            >
              <span className={isActive ? 'text-black' : 'text-[#00f0ff]'}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
