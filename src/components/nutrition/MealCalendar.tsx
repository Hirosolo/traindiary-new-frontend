"use client";

import { useState } from "react";

export interface Meal {
  id: string;
  name: string;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  calories: number;
  time?: string;
  icon?: string;
  items?: string[];
}

export interface DayData {
  day: number;
  isCurrentMonth: boolean;
  meals: Meal[];
}

interface MealCalendarProps {
  month: string;
  year: number;
  mealsCount: number;
  days: DayData[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onMealClick: (meal: Meal, day: number) => void;
}

export default function MealCalendar({
  month,
  year,
  mealsCount,
  days,
  onPrevMonth,
  onNextMonth,
  onMealClick,
}: MealCalendarProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const handleDayClick = (day: number, hasMeals: boolean) => {
    if (!hasMeals) return;
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
              You've logged {mealsCount} meals this month. Keep tracking.
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
            const hasMeals = dayData.meals.length > 0;
            const isExpanded = expandedDay === dayData.day;

            return (
              <div
                key={index}
                className={`bg-background-dark p-2 lg:p-3 relative group transition-colors ${
                  hasMeals ? "cursor-pointer hover:bg-surface-dark" : ""
                }`}
                style={{ minHeight: isExpanded ? "auto" : "5rem" }}
                onClick={() => handleDayClick(dayData.day, hasMeals)}
              >
                <span
                  className={`text-xs lg:text-sm font-medium ${
                    !dayData.isCurrentMonth
                      ? "text-white/20"
                      : hasMeals
                      ? "text-white"
                      : "text-text-dim"
                  }`}
                >
                  {dayData.day}
                </span>

                {/* Meal indicators when collapsed */}
                {hasMeals && !isExpanded && (
                  <div className="mt-1 lg:mt-2 space-y-1">
                    {dayData.meals.slice(0, 1).map((meal, idx) => (
                      <div
                        key={idx}
                        className={`bg-primary/20 text-primary text-[8px] lg:text-[10px] px-1 lg:px-1.5 py-0.5 rounded font-bold uppercase truncate`}
                      >
                        {meal.name}
                      </div>
                    ))}
                    {dayData.meals.length > 1 && (
                      <div className="text-[7px] lg:text-[9px] text-text-dim font-bold px-1 lg:px-1.5">
                        +{dayData.meals.length - 1} more
                      </div>
                    )}
                  </div>
                )}

                {/* Expanded meal details */}
                {isExpanded && hasMeals && (
                  <div className="mt-2 lg:mt-3 space-y-2 z-20" onClick={(e) => e.stopPropagation()}>
                    {dayData.meals.map((meal) => (
                      <div
                        key={meal.id}
                        onClick={() => onMealClick(meal, dayData.day)}
                        className="bg-surface-card p-2 lg:p-3 rounded-lg border border-white/5 hover:border-primary/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[10px] lg:text-xs font-bold text-white truncate">
                              {meal.name}
                            </h4>
                            {meal.time && (
                              <p className="text-[8px] lg:text-[9px] text-text-dim uppercase font-bold">
                                {meal.time}
                              </p>
                            )}
                          </div>
                          <div className="shrink-0 text-[8px] lg:text-[9px] font-bold px-1.5 lg:px-2 py-0.5 rounded bg-primary/20 text-primary">
                            {meal.calories} kcal
                          </div>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[7px] lg:text-[8px] text-macro-protein font-bold">P: {meal.protein}g</span>
                          <span className="text-[7px] lg:text-[8px] text-macro-carbs font-bold">C: {meal.carbs}g</span>
                          <span className="text-[7px] lg:text-[8px] text-macro-fats font-bold">F: {meal.fats}g</span>
                        </div>
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
