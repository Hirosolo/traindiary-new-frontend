import React, { useState } from 'react';
import { CalendarLume } from "@/components/ui/calendar-lume";

export interface WorkoutSession {
  id: string;
  title: string;
  type?: string;
  status: string; 
  note?: string;
  time?: string;
  exercises?: string[];
  gr_score?: number;
}

export interface DayData {
  day: number;
  isCurrentMonth: boolean;
  sessions: WorkoutSession[];
  isToday?: boolean;
  isPR?: boolean;
}

interface WorkoutCalendarProps {
  month: string;
  year: number;
  sessionsCount: number;
  days: DayData[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSessionClick: (session: WorkoutSession, day: number) => void;
  onDateSelect?: (date: Date) => void;
  onMonthYearChange?: (year: number, month: number) => void;
}

export default function WorkoutCalendar({
  month,
  year,
  sessionsCount,
  days,
  onPrevMonth,
  onNextMonth,
  onSessionClick,
  onDateSelect,
  onMonthYearChange,
}: WorkoutCalendarProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarStep, setCalendarStep] = useState<"year" | "month">("year");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = monthNames.indexOf(month);

  const handleDayClick = (dayData: DayData) => {
    if (onDateSelect && dayData.isCurrentMonth) {
       const monthIndex = monthNames.findIndex(m => m.toUpperCase() === month.toUpperCase()) || 0;
       onDateSelect(new Date(year, monthIndex, dayData.day));
    }
    
    // Direct open if session exists
    if (dayData.sessions.length > 0) {
        onSessionClick(dayData.sessions[0], dayData.day);
    }
  };

  const getStatusColor = (status: string) => {
      const s = status?.toUpperCase() || 'PENDING';
      switch (s) {
          case 'COMPLETED': return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]';
          case 'IN_PROGRESS': return 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]';
          case 'MISSED': return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]';
          case 'UNFINISHED': return 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]';
          default: return 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]';
      }
  };

  // Icons matching LogWorkoutModal exactly
  const WORKOUT_TYPE_ICONS: Record<string, string> = {
    "push": "fitness_center",
    "pull": "rowing",
    "legs": "foot_bones",
    "full body": "accessibility_new",
    "cardio": "directions_run",
    "upper": "vertical_align_top",
    "lower": "vertical_align_bottom",
    "upper body": "vertical_align_top",
    "lower body": "vertical_align_bottom",
  };

  const getCategoryIcon = (type?: string, title?: string) => {
      const t = (type || title || '').toLowerCase().trim();
      
      // 1. Direct lookup (most accurate)
      if (WORKOUT_TYPE_ICONS[t]) {
          return WORKOUT_TYPE_ICONS[t];
      }

      // 2. Fuzzy matching for variations
      if (t.includes('push')) return WORKOUT_TYPE_ICONS['push'];
      if (t.includes('pull')) return WORKOUT_TYPE_ICONS['pull'];
      if (t.includes('leg')) return WORKOUT_TYPE_ICONS['legs'];
      if (t.includes('cardio')) return WORKOUT_TYPE_ICONS['cardio'];
      if (t.includes('full') && t.includes('body')) return WORKOUT_TYPE_ICONS['full body'];
      if (t.includes('upper')) return WORKOUT_TYPE_ICONS['upper'];
      if (t.includes('lower')) return WORKOUT_TYPE_ICONS['lower'];
      
      // 3. Specific Fallbacks
      if (t.includes('back')) return 'accessibility_new';
      if (t.includes('chest')) return 'fitness_center';
      if (t.includes('arm')) return 'fitness_center';
      
      // 4. Default generic
      return 'fitness_center';
  };

  return (
    <main className="flex-1 bg-background-dark overflow-y-auto p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-4">
          <div className="relative">
            <button 
              onClick={() => {
                setCalendarStep("year");
                setIsCalendarOpen(true);
              }}
              className="group flex flex-col items-start transition-all hover:opacity-80"
            >
              <span className="text-[10px] uppercase tracking-[0.2em] text-text-dim font-bold block mb-1 group-hover:text-primary transition-colors">
                Select Period
              </span>
              <div className="flex items-center gap-2 sm:gap-3">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold uppercase italic tracking-tighter text-white leading-none">
                  {month} {year}
                </h2>
                <span className="material-symbols-outlined text-text-dim group-hover:text-white transition-colors text-lg sm:text-xl">
                  calendar_month
                </span>
              </div>
              <p className="text-text-dim text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mt-1.5 sm:mt-2">
                {sessionsCount} SESSIONS <span className="hidden xs:inline">LOGGED</span> • <span className="text-primary">CONSISTENCY</span>
              </p>
            </button>

            {/* Calendar Modal */}
            {isCalendarOpen && onMonthYearChange && (
              <div className="absolute top-full left-0 mt-3 z-50 animate-in fade-in zoom-in-95 duration-200">
                <CalendarLume
                  defaultMonth={monthIndex >= 0 ? monthIndex : 0}
                  defaultYear={year}
                  onMonthYearChange={(y, m) => {
                    onMonthYearChange(y, m);
                    setIsCalendarOpen(false);
                  }}
                  initialStep={calendarStep}
                  onClose={() => setIsCalendarOpen(false)}
                />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onPrevMonth}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-card border border-white/5 hover:border-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <button
              onClick={onNextMonth}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-card border border-white/5 hover:border-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="bg-surface-dark py-4 text-center text-[9px] font-black text-text-dim uppercase tracking-widest border-b border-white/5"
            >
              {d}
            </div>
          ))}

          {/* Days */}
          {days.map((dayData, index) => {
            const hasSessions = dayData.sessions.length > 0;
            const session = hasSessions ? dayData.sessions[0] : null;
            
            return (
              <div
                key={index}
                className={`bg-background-dark p-1.5 sm:p-3 relative group transition-all duration-300 h-[80px] sm:h-[100px] lg:h-[130px] overflow-visible border-r border-b border-white/5 ${
                  hasSessions ? "cursor-pointer hover:bg-surface-dark/50" : "cursor-pointer hover:bg-white/5"
                } ${dayData.isToday ? "bg-primary/5" : ""}`}
                onClick={() => handleDayClick(dayData)}
              >
                <div className="flex justify-between items-start mb-1 sm:mb-2">
                  <span
                    className={`text-[10px] sm:text-xs font-bold ${
                      !dayData.isCurrentMonth
                        ? "text-white/10"
                        : dayData.isToday
                        ? "text-primary scale-110 sm:scale-125"
                        : hasSessions
                        ? "text-white"
                        : "text-text-dim"
                    }`}
                  >
                    {dayData.day}
                  </span>
                  {dayData.isToday && (
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </div>

                {/* SESSION CONTENT */}
                {session && (
                  <div className="absolute inset-x-1 sm:inset-x-3 top-6 sm:top-8 bottom-1.5 sm:bottom-3 flex flex-col items-center justify-between">
                        {/* LARGE CENTERED ICON */}
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10 transition-transform group-hover:scale-110 ${session.status === 'COMPLETED' ? 'text-emerald-500 border-emerald-500/30' : 'text-text-dim'}`}>
                             <span className="material-symbols-outlined text-base sm:text-xl lg:text-2xl">
                                {getCategoryIcon(session.type, session.title)}
                             </span>
                        </div>

                        {/* BOTTOM INFO */}
                        <div className="w-full flex flex-col gap-1 sm:gap-1.5">
                            <div 
                              className={`h-0.5 sm:h-1 rounded-full w-full ${getStatusColor(session.status)} transition-all duration-500`}
                            />
                            <p className="hidden sm:block text-[8px] font-black text-white/40 uppercase truncate text-center tracking-widest">
                                {session.title}
                            </p>
                        </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
