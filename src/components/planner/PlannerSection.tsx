import React from 'react';
import { WeeklyRoadmapCard } from './WeeklyRoadmapCard';
import { PlannerCalendarView } from './PlannerCalendarView';
import { DayPlannerDetail } from './DayPlannerDetail';

interface PlannerSectionProps {
  onLaunchTimer?: () => void;
}

export const PlannerSection: React.FC<PlannerSectionProps> = ({ onLaunchTimer }) => {
  return (
    <div className="space-y-6">
      {/* 1. Weekly Horizon Strip */}
      <WeeklyRoadmapCard />

      {/* 2. Interactive Calendar & Day Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <PlannerCalendarView />
        </div>
        <div className="lg:col-span-5">
          <DayPlannerDetail onLaunchTimer={onLaunchTimer} />
        </div>
      </div>
    </div>
  );
};
