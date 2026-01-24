"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
    setExpandedDay(day);
  };

  const expandedDayData = useMemo(
    () => days.find((d) => d.isCurrentMonth && d.day === expandedDay),
    [days, expandedDay]
  );

  return (
    <>
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
                className={`bg-background-dark p-2 lg:p-3 relative group transition-colors h-[120px] lg:h-[144px] overflow-visible ${
                  hasSessions ? "cursor-pointer hover:bg-surface-dark" : ""
                } ${dayData.isToday ? "ring-2 ring-primary ring-inset" : ""}`}
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
                {hasSessions && (
                  <div
                    className="mt-2 lg:mt-3 grid grid-rows-3 gap-1.5"
                    style={{ height: "calc(100% - 28px)" }}
                  >
                    {dayData.sessions.slice(0, 3).map((session) => (
                      <div
                        key={session.id}
                        className="relative rounded-md overflow-hidden border border-white/5 bg-white/5 h-full"
                      >
                        <div
                          className={`absolute inset-0 transition-all duration-300 ease-out origin-left ${
                            session.status === "complete" ? "bg-primary" : "bg-primary/30"
                          }`}
                          style={{ opacity: 0.85, transform: isExpanded ? "scaleX(1)" : "scaleX(0.98)" }}
                        />
                        <div className="relative flex items-center justify-between px-2 text-[8px] lg:text-[9px] font-semibold text-white/80 h-full">
                          <span className="truncate">{session.title}</span>
                          {session.time && <span className="text-[7px] lg:text-[8px] text-white/60">{session.time}</span>}
                        </div>
                      </div>
                    ))}
                    {dayData.sessions.length > 3 && (
                      <div className="text-[9px] lg:text-[10px] text-text-dim font-bold px-0.5">
                        +{dayData.sessions.length - 3} more hidden
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
    <AnimatePresence>
      {expandedDayData && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center px-4 sm:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70"
            onClick={() => setExpandedDay(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative w-full max-w-xl lg:max-w-3xl bg-surface-card border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
          >
            <div className="flex items-start justify-between gap-3 p-4 lg:p-5 border-b border-white/10">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-text-dim font-bold">
                  {month} {expandedDayData.day}, {year}
                </p>
                <p className="text-lg lg:text-xl font-display font-bold text-white">
                  {expandedDayData.sessions.length} workout{expandedDayData.sessions.length > 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setExpandedDay(null)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="px-4 lg:px-5 py-3 lg:py-4 space-y-3 max-h-[70vh] overflow-y-auto">
              {expandedDayData.sessions.map((session, idx) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, type: "spring", stiffness: 240, damping: 20 }}
                  className="bg-surface-dark/80 rounded-xl border border-white/5 p-3 lg:p-4 shadow-md shadow-black/20 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm lg:text-base font-semibold text-white truncate">{session.title}</p>
                      {session.time && (
                        <p className="text-[11px] lg:text-xs text-text-dim uppercase font-bold">{session.time}</p>
                      )}
                      {session.exercises && session.exercises.length > 0 && (
                        <p className="text-xs lg:text-sm text-text-dim mt-1 line-clamp-2">
                          {session.exercises.slice(0, 4).join(" • ")}
                          {session.exercises.length > 4 ? ` +${session.exercises.length - 4}` : ""}
                        </p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 text-[11px] lg:text-xs font-bold px-2 py-1 rounded-md ${
                        session.status === "complete" ? "bg-primary/20 text-primary" : "bg-white/10 text-text-dim"
                      }`}
                    >
                      {session.status === "complete" ? "Done" : "Pending"}
                    </span>
                  </div>
                  {session.note && (
                    <p className="text-xs lg:text-sm text-text-dim leading-relaxed">{session.note}</p>
                  )}
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        onSessionClick(session, expandedDayData.day);
                        setExpandedDay(null);
                      }}
                      className="text-xs lg:text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      Open details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
