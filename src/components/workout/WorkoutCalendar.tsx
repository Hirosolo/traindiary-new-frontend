"use client";

import { useState } from "react";

export interface WorkoutSession {
  id: string;
  title: string;
  status: "complete" | "incomplete";
  note?: string;
  time?: string;
  exercises?: string[];
}

export interface DayData {
  day: number;
  isCurrentMonth: boolean;
  sessions: WorkoutSession[];
  isToday?: boolean;
}

interface WorkoutCalendarProps {
  month: string;
  year: number;
  sessionsCount: number;
  days: DayData[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSessionClick: (session: WorkoutSession, day: number) => void;
}

export default function WorkoutCalendar({
  month,
  year,
  sessionsCount,
  days,
  onPrevMonth,
  onNextMonth,
  onSessionClick,
}: WorkoutCalendarProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const handleDayClick = (day: number, hasSessions: boolean) => {
    if (!hasSessions) return;
    setExpandedDay(expandedDay === day ? null : day);
  };

  return (
    <main className="flex-1 bg-background-dark overflow-y-auto p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-display font-bold">
              {month} {year}
            </h2>
            <p className="text-text-dim text-sm lg:text-base">
              You've hit {sessionsCount} sessions this month. Keep pushing.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onPrevMonth}
              className="p-2 rounded-lg bg-surface-card border border-white/5 hover:bg-surface-highlight"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              onClick={onNextMonth}
              className="p-2 rounded-lg bg-surface-card border border-white/5 hover:bg-surface-highlight"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="bg-surface-dark py-2 lg:py-3 text-center text-[9px] lg:text-[10px] font-bold text-text-dim uppercase tracking-widest border-b border-white/5"
            >
              {d}
            </div>
          ))}

          {/* Days */}
          {days.map((dayData, index) => {
            const hasSessions = dayData.sessions.length > 0;
            const isExpanded = expandedDay === dayData.day;
            const completedSessions = dayData.sessions.filter(
              (s) => s.status === "complete"
            ).length;

            return (
              <div
                key={index}
                className={`bg-background-dark p-2 lg:p-3 relative group transition-colors ${
                  hasSessions ? "cursor-pointer hover:bg-surface-dark" : ""
                } ${dayData.isToday ? "ring-2 ring-primary ring-inset" : ""}`}
                style={{ minHeight: isExpanded ? "auto" : "5rem" }}
                onClick={() => handleDayClick(dayData.day, hasSessions)}
              >
                <span
                  className={`text-xs lg:text-sm font-medium ${
                    !dayData.isCurrentMonth
                      ? "text-white/20"
                      : dayData.isToday
                      ? "text-primary"
                      : hasSessions
                      ? "text-white"
                      : "text-text-dim"
                  }`}
                >
                  {dayData.day}
                </span>

                {/* Session indicators when collapsed */}
                {hasSessions && !isExpanded && (
                  <div className="mt-1 lg:mt-2 space-y-1">
                    {completedSessions > 0 && (
                      <div className="w-full h-0.5 lg:h-1 bg-primary rounded-full"></div>
                    )}
                    {dayData.sessions.slice(0, 1).map((session, idx) => (
                      <div
                        key={idx}
                        className={`${
                          session.status === "complete"
                            ? "bg-primary text-white"
                            : "bg-primary/20 text-primary"
                        } text-[8px] lg:text-[10px] px-1 lg:px-1.5 py-0.5 rounded font-bold uppercase truncate ${
                          dayData.isPR ? "shadow-lg shadow-primary/20" : ""
                        }`}
                      >
                        {session.title}
                      </div>
                    ))}
                    {dayData.sessions.length > 1 && (
                      <div className="text-[7px] lg:text-[9px] text-text-dim font-bold px-1 lg:px-1.5">
                        +{dayData.sessions.length - 1} more
                      </div>
                    )}
                  </div>
                )}

                {/* Expanded session details */}
                {isExpanded && hasSessions && (
                  <div className="mt-2 lg:mt-3 space-y-2 z-20" onClick={(e) => e.stopPropagation()}>
                    {dayData.sessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => onSessionClick(session, dayData.day)}
                        className="bg-surface-card p-2 lg:p-3 rounded-lg border border-white/5 hover:border-primary/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[10px] lg:text-xs font-bold text-white truncate">
                              {session.title}
                            </h4>
                            {session.time && (
                              <p className="text-[8px] lg:text-[9px] text-text-dim uppercase font-bold">
                                {session.time}
                              </p>
                            )}
                            {session.exercises && session.exercises.length > 0 && (
                              <p className="text-[9px] lg:text-[10px] text-text-dim mt-1 line-clamp-2">
                                {session.exercises.slice(0, 3).join(" • ")}
                                {session.exercises.length > 3 ? ` +${session.exercises.length - 3}` : ""}
                              </p>
                            )}
                          </div>
                          <div
                            className={`shrink-0 text-[8px] lg:text-[9px] font-bold px-1.5 lg:px-2 py-0.5 rounded ${
                              session.status === "complete"
                                ? "bg-primary/20 text-primary"
                                : "bg-white/5 text-text-dim"
                            }`}
                          >
                            {session.status === "complete" ? "✓ Done" : "Pending"}
                          </div>
                        </div>
                        {session.note && (
                          <p className="text-[9px] lg:text-[10px] text-text-dim mt-1 line-clamp-2">
                            {session.note}
                          </p>
                        )}
                      </div>
                    ))}
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
