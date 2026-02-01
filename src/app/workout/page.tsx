"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import NavBar from "@/components/ui/navbar";
import ActivityOverview from "@/components/workout/ActivityOverview";
import WorkoutCalendar, {
  WorkoutSession,
  DayData,
} from "@/components/workout/WorkoutCalendar";
import WorkoutDetails, {
  WorkoutDetailsData,
  Exercise,
  ExerciseSet,
} from "@/components/workout/WorkoutDetails";
import LogWorkoutModal, { NewWorkoutSession } from "@/components/workout/LogWorkoutModal";
import AddExerciseModal, { ExerciseToAdd } from "@/components/workout/AddExerciseModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  completeWorkoutSession,
  createWorkoutSession,
  fetchWorkoutSessionById,
  fetchWorkoutSessions,
  ApiWorkoutSession,
  ApiSessionDetail,
  ApiWorkoutSessionsResponse,
  deleteWorkoutSession,
  deleteSessionDetail,
  deleteExerciseLog,
  updateExerciseLog,
  logExerciseSet,
  fetchProgress,
  fetchSummary,
  addPlannedExercises,
} from "@/lib/api/workouts";
import { motion, AnimatePresence } from "framer-motion";

export default function WorkoutPage() {
  const { user } = useAuth();
  const userId = user?.user_id ?? user?.id ?? 1;
  const now = new Date();
  
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutDetailsData | null>(null);
  const [isLogWorkoutModalOpen, setIsLogWorkoutModalOpen] = useState(false);
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isSavingWorkout, setIsSavingWorkout] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [grScore, setGrScore] = useState(0);
  const [grScoreChange, setGrScoreChange] = useState(0);
  const [muscleSplit, setMuscleSplit] = useState<any[]>([
    { name: 'Legs', value: 40, color: '#3b82f6' },
    { name: 'Push', value: 35, color: '#ef4444' },
    { name: 'Pull', value: 25, color: '#10b981' },
  ]);

  const [workoutSessions, setWorkoutSessions] = useState<Record<string, WorkoutSession[]>>({});
  const [workoutDetailsMap, setWorkoutDetailsMap] = useState<Record<string, WorkoutDetailsData>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [longestStreak, setLongestStreak] = useState(0);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // currentStreak will be replaced with longestStreak from API
  const currentStreak = longestStreak;

  // Calculate days for calendar
  const calendarDays = useMemo(() => {
    const year = selectedYear;
    const month = selectedMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const today = new Date();

    let startDay = firstDay.getDay() - 1; // Monday = 0
    if (startDay < 0) startDay = 6;

    const days: DayData[] = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, isCurrentMonth: false, sessions: [] });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const sessions = workoutSessions[day.toString()] || [];
      const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      days.push({ day, isCurrentMonth: true, sessions, isToday });
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({ day, isCurrentMonth: false, sessions: [] });
    }
    return days;
  }, [selectedYear, selectedMonth, workoutSessions]);

  // Day Picker Logic (One week around selected date)
  const weekDays = useMemo(() => {
    const days = [];
    const start = new Date(selectedDate);
    start.setDate(selectedDate.getDate() - 3);
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        days.push(d);
    }
    return days;
  }, [selectedDate]);

  const handleMonthYearChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  const parseSessionDate = (date: string | undefined) => {
    if (!date) return new Date();
    const trimmed = date.trim();
    const [datePart, timePart] = trimmed.split(/[T ]/);
    const [yearStr, monthStr, dayStr] = (datePart || "").split("-");
    const year = Number(yearStr);
    const month = Number(monthStr) - 1;
    const day = Number(dayStr);
    let hours = 0, minutes = 0, seconds = 0;
    if (timePart) {
      const [h, m, s] = timePart.split(":");
      hours = Number(h) || 0;
      minutes = Number(m) || 0;
      seconds = Number(s) || 0;
    }
    const parsed = new Date(year, month, day, hours, minutes, seconds);
    return Number.isNaN(parsed.getTime()) ? new Date(trimmed) : parsed;
  };

  const mapSessionDetailToExercise = useCallback((detail: ApiSessionDetail): Exercise => {
    const logs = detail.exercise_logs ?? [];
    const plannedSets = detail.planned_sets ?? logs.length ?? 0;
    const sets: ExerciseSet[] = logs.length > 0
        ? logs.map((log, index) => ({
            id: (log.set_id ?? log.log_id ?? `${detail.session_detail_id ?? detail.exercise_id}-log-${index}`).toString(),
            setNumber: index + 1,
            weight: log.weight_kg ?? 0,
            reps: log.reps ?? log.actual_reps ?? log.rep ?? 0,
            status: typeof log.status === 'string' ? log.status === 'COMPLETED' : (log.status ?? false),
          }))
        : Array.from({ length: plannedSets }, (_, index) => ({
            id: `${detail.session_detail_id ?? detail.exercise_id ?? "planned"}-${index}`,
            setNumber: index + 1,
            weight: 0,
            reps: detail.planned_reps ?? 0,
            status: false,
          }));

    return {
      id: (detail.session_detail_id ?? detail.exercise_id ?? `exercise-${Date.now()}`).toString(),
      exercise_id: detail.exercise_id,
      name: detail.exercises?.name ?? "Workout Exercise",
      category: detail.exercises?.category,
      sets,
    };
  }, []);

  const buildWorkoutDetails = useCallback((session: ApiWorkoutSession, fallback?: WorkoutDetailsData): WorkoutDetailsData => {
      const dateObj = parseSessionDate(session.scheduled_date);
      const displayDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const displayTime = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

      // Determine Status
      // Determine Status
      let status: WorkoutDetailsData["status"] = "PENDING";
      
      if (session.status) {
          // Map backend status to frontend status
          if (session.status === 'COMPLETED') status = "COMPLETED";
          else if (session.status === 'IN_PROGRESS') status = "IN_PROGRESS";
          else if (session.status === 'PENDING') status = "PENDING";
          else status = "PENDING";
      } else if (session.completed) {
          status = "COMPLETED";
      } else {
          const anySetDone = session.session_details?.some(d => d.exercise_logs?.some(l => typeof l.status === 'string' ? l.status === 'COMPLETED' : l.status));
          if (anySetDone) status = "IN_PROGRESS";
      }

      return {
        id: (session.session_id ?? fallback?.id ?? `session-${Date.now()}`).toString(),
        title: session.notes || session.type || "Training Block",
        date: displayDate,
        time: displayTime,
        note: session.notes ?? null,
        isCompleted: status === 'COMPLETED' || Boolean(session.completed),
        status,
        exercises: (session.session_details ?? []).map(mapSessionDetailToExercise),
      };
    }, [mapSessionDetailToExercise]);

  const mapSessionsToDays = useCallback((sessions: ApiWorkoutSession[]) => {
    const record: Record<string, WorkoutSession[]> = {};
    sessions.forEach((session, index) => {
      const sessionDate = parseSessionDate(session.scheduled_date);
      if (Number.isNaN(sessionDate.getTime())) return;
      const dayKey = sessionDate.getDate().toString();
      const sessionId = (session.session_id ?? `session-${index}`).toString();
      
      const mapped: WorkoutSession = {
        id: sessionId,
        title: session.notes || session.type || "Training Block",
        type: session.type || undefined,
        status: session.status || (session.completed ? "COMPLETED" : "PENDING"),
        time: sessionDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
        exercises: session.session_details?.map(d => d.exercises?.name).filter(Boolean) as string[],
      };
      record[dayKey] = [...(record[dayKey] || []), mapped];
    });
    return record;
  }, []);

  const refreshSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    try {
      const monthParam = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
      const response = await fetchWorkoutSessions(userId, monthParam);
      const sessionsArray = Array.isArray(response) ? response : (response as any).sessions || [];
      setWorkoutSessions(mapSessionsToDays(sessionsArray));

      // Fetch Dashboard Stats
      const periodStart = `${selectedYear}-${String(selectedMonth+1).padStart(2, '0')}-01`;
      const summary = await fetchSummary(userId, 'monthly', periodStart);
      
      setGrScore(summary.gr_score || 0);
      setGrScoreChange(summary.gr_score_change || 0);
      setLongestStreak(summary.longest_streak || 0);

      if (summary.muscle_split && Array.isArray(summary.muscle_split)) {
          const colors: Record<string, string> = {
            'Legs': '#3b82f6', 'Push': '#ef4444', 'Pull': '#10b981',
            'Chest': '#ec4899', 'Back': '#8b5cf6', 'Arms': '#f59e0b'
          };
          const split = summary.muscle_split.map((m: any) => ({
              ...m,
              color: colors[m.name] || '#64748b'
          }));
          setMuscleSplit(split);
      }
    } catch (error) {
      console.error("Failed to load workout data", error);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [userId, selectedMonth, selectedYear, mapSessionsToDays]);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  const handleSessionClick = async (session: WorkoutSession, day: number) => {
    setIsDetailsLoading(true);
    setSelectedDate(new Date(selectedYear, selectedMonth, day));
    try {
      const detailed = await fetchWorkoutSessionById(session.id);
      if (detailed) {
        const details = buildWorkoutDetails(detailed);
        setWorkoutDetailsMap(prev => ({ ...prev, [session.id]: details }));
        setSelectedWorkout(details);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDetailsLoading(false);
      setHasUnsavedChanges(false);
    }
  };

  const handleUpdateSet = (exerciseId: string, setId: string, field: string, value: any) => {
    if (!selectedWorkout) return;
    const updated = {
      ...selectedWorkout,
      exercises: selectedWorkout.exercises.map(ex => ex.id === exerciseId 
        ? { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s) }
        : ex
      )
    };
    setSelectedWorkout(updated);
    setHasUnsavedChanges(true);
  };

  const handleAddSet = (exerciseId: string) => {
    if (!selectedWorkout) return;
    const updated = {
      ...selectedWorkout,
      exercises: selectedWorkout.exercises.map(ex => {
        if (ex.id === exerciseId) {
          const lastSet = ex.sets[ex.sets.length - 1];
          return {
            ...ex,
            sets: [...ex.sets, { id: `new-${Date.now()}`, setNumber: ex.sets.length + 1, weight: lastSet?.weight ?? 0, reps: lastSet?.reps ?? 0, status: false }]
          };
        }
        return ex;
      })
    };
    setSelectedWorkout(updated);
    setHasUnsavedChanges(true);
  };

  const handleSaveWorkout = async () => {
    if (!selectedWorkout) return;
    setIsSavingWorkout(true);
    try {
      // Sync sets logic (simplified for brevity, mirroring previous robust version)
      for (const ex of selectedWorkout.exercises) {
          for (const set of ex.sets) {
              const numericId = Number(set.id);
              if (Number.isFinite(numericId)) {
                  await updateExerciseLog({ logId: numericId, actualReps: set.reps, weight_kg: set.weight, status: set.status });
              } else {
                  await logExerciseSet({ sessionDetailId: Number(ex.id), actualReps: set.reps, weight_kg: set.weight, status: set.status });
              }
          }
      }

      // Check if all done
      const allDone = selectedWorkout.exercises.every(ex => ex.sets.every(s => s.status));
      if (allDone && !selectedWorkout.isCompleted) {
          await completeWorkoutSession(selectedWorkout.id);
      }

      await refreshSessions();
      const fresh = await fetchWorkoutSessionById(selectedWorkout.id);
      if (fresh) setSelectedWorkout(buildWorkoutDetails(fresh));
      setHasUnsavedChanges(false);
    } catch (e) {
      setErrorMessage("Sync failed. Check connection.");
    } finally {
      setIsSavingWorkout(false);
    }
  };

  const handleAddExercise = () => {
      setIsAddExerciseModalOpen(true);
  };

  const handleLogWorkoutSubmit = async (data: NewWorkoutSession) => {
      try {
          const exercisesPayload = data.exercises.flatMap(ex => ex.reps.map(r => ({ exercise_id: ex.id, actual_sets: 1, actual_reps: r.rep, weight_kg: r.weight_kg ?? 0 })));
          await createWorkoutSession({ userId, scheduledDate: data.date, type: data.type, notes: data.note, exercises: exercisesPayload });
          await refreshSessions();
          setIsLogWorkoutModalOpen(false);
      } catch (e) {
          setErrorMessage("Failed to create session");
      }
  };

  const handleAddExerciseSubmit = async (exercises: ExerciseToAdd[]) => {
      if (!selectedWorkout) return;
      try {
          await addPlannedExercises({
              sessionId: selectedWorkout.id,
              exercises: exercises.map(ex => ({ exercise_id: ex.id, planned_sets: ex.sets, planned_reps: ex.reps }))
          });
          const fresh = await fetchWorkoutSessionById(selectedWorkout.id);
          if (fresh) setSelectedWorkout(buildWorkoutDetails(fresh));
          setIsAddExerciseModalOpen(false);
      } catch (e) {
          setErrorMessage("Failed to add exercises");
      }
  };

  const currentSessions = workoutSessions[selectedDate.getDate().toString()] || [];

  return (
    <div className="bg-background-dark text-white min-h-screen font-body flex flex-col">
      <NavBar className="hidden lg:block shrink-0" />

      <main className="flex-1 flex overflow-hidden pt-16 lg:pt-20">
        <ActivityOverview
          currentStreak={currentStreak}
          grScore={grScore}
          grScoreChange={grScoreChange}
          muscleSplit={muscleSplit}
          onLogWorkout={() => setIsLogWorkoutModalOpen(true)}
        />

        <div className="flex-1 flex flex-col bg-background-dark relative">
          {/* TOP CALENDAR (Mobile Day Picker) */}
          <div className="lg:hidden p-4 border-b border-white/5 bg-surface-dark/50 backdrop-blur-md sticky top-0 z-20">
             <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar pb-2">
                {weekDays.map((d, i) => {
                    const isSelected = d.toDateString() === selectedDate.toDateString();
                    const hasData = workoutSessions[d.getDate().toString()]?.length > 0;
                    return (
                        <button 
                            key={i} 
                            onClick={() => setSelectedDate(d)}
                            className={`flex flex-col items-center min-w-[50px] p-3 rounded-2xl transition-all ${isSelected ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-white/5 text-text-dim'}`}
                        >
                            <span className="text-[8px] font-black uppercase tracking-widest">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            <span className="text-sm font-black mt-1">{d.getDate()}</span>
                            {hasData && !isSelected && <div className="w-1 h-1 rounded-full bg-primary mt-1" />}
                        </button>
                    )
                })}
             </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {/* Main Calendar View Toggle or Hybrid */}
            <div className="p-4 lg:p-8 max-w-5xl mx-auto w-full">
                {/* Dashboard Stats (Tablet/Mobile Only) */}
                <div className="lg:hidden grid grid-cols-2 gap-4 mb-8">
                   <div className="bg-surface-card p-5 rounded-3xl border border-white/5">
                        <span className="text-[8px] font-black text-primary uppercase tracking-widest block mb-2">My GR</span>
                        <p className="text-3xl font-display font-bold">{grScore.toLocaleString()}</p>
                   </div>
                   <div className="bg-surface-card p-5 rounded-3xl border border-white/5">
                        <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest block mb-2">Streak</span>
                        <p className="text-3xl font-display font-bold">{currentStreak}D</p>
                   </div>
                </div>

                <WorkoutCalendar
                    month={monthNames[selectedMonth]}
                    year={selectedYear}
                    sessionsCount={Object.values(workoutSessions).flat().length}
                    days={calendarDays}
                    onPrevMonth={() => handleMonthYearChange(selectedYear, selectedMonth === 0 ? 11 : selectedMonth - 1)}
                    onNextMonth={() => handleMonthYearChange(selectedYear, selectedMonth === 11 ? 0 : selectedMonth + 1)}
                    onSessionClick={handleSessionClick}
                    onDateSelect={(d) => setSelectedDate(d)}
                    onMonthYearChange={handleMonthYearChange}
                />
            </div>
          </div>
        </div>

        {/* DETAILS PANEL */}
        <AnimatePresence>
            {selectedWorkout && (
                <WorkoutDetails
                    workout={selectedWorkout}
                    onClose={() => setSelectedWorkout(null)}
                    onFinishWorkout={handleSaveWorkout}
                    onUpdateSet={handleUpdateSet}
                    onAddSet={handleAddSet}
                    onAddExercise={handleAddExercise}
                    onDeleteExercise={async (id) => {
                        if (!selectedWorkout) return;
                        
                        try {
                          // Find the exercise to get its session_detail_id
                          const exercise = selectedWorkout.exercises.find(e => e.id === id);
                          if (exercise?.id) {
                            // Call API to delete from database
                            await deleteSessionDetail(selectedWorkout.id, exercise.id);
                                
                            // Update local state
                            setSelectedWorkout(prev => prev ? { ...prev, exercises: prev.exercises.filter(e => e.id !== id) } : null);
                          }
                        } catch (error) {
                          console.error('Failed to delete exercise:', error);
                          alert('Failed to delete exercise. Please try again.');
                        }
                    }}
                    onDeleteSet={(exId, sId) => {
                        setSelectedWorkout(prev => prev ? { ...prev, exercises: prev.exercises.map(e => e.id === exId ? { ...e, sets: e.sets.filter(s => s.id !== sId) } : e) } : null);
                        setHasUnsavedChanges(true);
                    }}
                    onDeleteSession={async (id) => {
                        await deleteWorkoutSession(id);
                        setSelectedWorkout(null);
                        refreshSessions();
                    }}
                    hasUnsavedChanges={hasUnsavedChanges}
                    isLoading={isSavingWorkout || isDetailsLoading}
                />
            )}
        </AnimatePresence>
      </main>

      <LogWorkoutModal
        isOpen={isLogWorkoutModalOpen}
        onClose={() => setIsLogWorkoutModalOpen(false)}
        onSubmit={handleLogWorkoutSubmit}
      />
      
      <AddExerciseModal
        isOpen={isAddExerciseModalOpen}
        onClose={() => setIsAddExerciseModalOpen(false)}
        onSubmit={handleAddExerciseSubmit}
        existingExerciseIds={selectedWorkout?.exercises.map(ex => ex.exercise_id).filter(Boolean) as (string | number)[] || []}
      />
      
      {/* ERROR TOAST */}
      <AnimatePresence>
          {errorMessage && (
              <motion.div 
                initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-red-500 text-white px-6 py-3 rounded-2xl shadow-2xl font-black text-[10px] uppercase tracking-widest"
              >
                  {errorMessage}
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
