"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import NavBar from "@/components/ui/navbar";
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
import PlanDayManagerModal from "@/components/workout/PlanDayManagerModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  setWorkoutSessionStatus,
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
  updateWorkoutsMonthCache,
  syncWorkoutLogs,
} from "@/lib/api/workouts";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type MuscleSplit = {
  name: string;
  value: number;
  color: string;
};

type ApiMuscleSplit = {
  name: string;
  value: number;
};

export default function WorkoutPage() {
  const { user } = useAuth();
  const userId = user?.user_id ?? user?.id ?? 1;
  const now = new Date();
  
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutDetailsData | null>(null);
  const [isLogWorkoutModalOpen, setIsLogWorkoutModalOpen] = useState(false);
  const [isPlanDayManagerOpen, setIsPlanDayManagerOpen] = useState(false);
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isSavingWorkout, setIsSavingWorkout] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [grScore, setGrScore] = useState(0);
  const [grScoreChange, setGrScoreChange] = useState(0);
  const [muscleSplit, setMuscleSplit] = useState<MuscleSplit[]>([
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
    const isCardio = (detail.exercises?.type || "").toLowerCase() === "cardio";
    const logs = detail.exercise_logs ?? [];
    const plannedSets = detail.planned_sets ?? logs.length ?? 0;
    const sets: ExerciseSet[] = logs.length > 0
        ? logs.map((log, index) => ({
            id: (log.set_id ?? log.log_id ?? `${detail.session_detail_id ?? detail.exercise_id}-log-${index}`).toString(),
            setNumber: index + 1,
            weight: isCardio ? 0 : (log.weight_kg ?? 0),
            reps: isCardio ? 0 : (log.reps ?? log.actual_reps ?? log.rep ?? 0),
            duration: isCardio ? (log.duration ?? 0) : undefined,
            status: typeof log.status === 'string' ? log.status === 'COMPLETED' : (log.status ?? false),
            notes: log.notes,
          }))
        : Array.from({ length: plannedSets }, (_, index) => ({
            id: `${detail.session_detail_id ?? detail.exercise_id ?? "planned"}-${index}`,
            setNumber: index + 1,
            weight: 0,
            reps: isCardio ? 0 : (detail.planned_reps ?? 0),
            duration: isCardio ? (detail.planned_reps ?? 0) : undefined,
            status: false,
          }));

    return {
      id: (detail.session_detail_id ?? detail.exercise_id ?? `exercise-${Date.now()}`).toString(),
      exercise_id: detail.exercise_id,
      name: detail.exercises?.name ?? "Workout Exercise",
      category: detail.exercises?.category,
      type: detail.exercises?.type,
      isCardio,
      sets,
      personalRecord: detail.personal_record,
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

  const refreshSessions = useCallback(async (forceRefresh = false) => {
    setIsLoadingSessions(true);
    try {
      const monthParam = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
      const response = await fetchWorkoutSessions(userId, monthParam, undefined, forceRefresh);
      const sessionsArray = Array.isArray(response) ? response : (response as { sessions: ApiWorkoutSession[] }).sessions || [];
      setWorkoutSessions(mapSessionsToDays(sessionsArray));

      // Fetch Dashboard Stats
      const summary = await fetchSummary(monthParam, forceRefresh);
      
      setGrScore(summary.gr_score || 0);
      setGrScoreChange(summary.gr_score_change || 0);
      setLongestStreak(summary.longest_streak || 0);

      if (summary.muscle_split && Array.isArray(summary.muscle_split)) {
          const colors: Record<string, string> = {
            'Legs': '#3b82f6', 'Push': '#ef4444', 'Pull': '#10b981',
            'Chest': '#ec4899', 'Back': '#8b5cf6', 'Arms': '#f59e0b'
          };
          const split = (summary.muscle_split as ApiMuscleSplit[]).map((m) => ({
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSessions(true);
    } finally {
      setIsRefreshing(false);
    }
  };

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

  const handleUpdateSet = (exerciseId: string, setId: string, field: string, value: number | boolean | undefined) => {
    if (!selectedWorkout) return;
    if (selectedWorkout.status === 'COMPLETED' || selectedWorkout.isCompleted) return;
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
    if (selectedWorkout.status === 'COMPLETED' || selectedWorkout.isCompleted) return;
    const updated = {
      ...selectedWorkout,
      exercises: selectedWorkout.exercises.map(ex => {
        if (ex.id === exerciseId) {
          const lastSet = ex.sets[ex.sets.length - 1];
          return {
            ...ex,
            sets: [...ex.sets, { id: `new-${Date.now()}`, setNumber: ex.sets.length + 1, weight: ex.isCardio ? 0 : (lastSet?.weight ?? 0), reps: ex.isCardio ? 0 : (lastSet?.reps ?? 0), duration: ex.isCardio ? (lastSet?.duration ?? 0) : undefined, status: false }]
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
    if (selectedWorkout.status === 'COMPLETED' || selectedWorkout.isCompleted) return;
    setIsSavingWorkout(true);
    try {
      // 1. Collect all sets from all exercises to sync in one go
      const logsToSync = selectedWorkout.exercises.flatMap(ex => {
        const sid = Number(ex.id);
        const isNewExercise = isNaN(sid);

        return ex.sets.map(set => {
          const numericId = Number(set.id);
          const isNewSet = !Number.isFinite(numericId);
          
          return {
            set_id: isNewSet ? undefined : numericId,
            session_detail_id: isNewExercise ? undefined : sid,
            exercise_id: ex.exercise_id, // Include this for the backend to create session_detail if needed
            actual_reps: ex.isCardio ? undefined : set.reps,
            reps: ex.isCardio ? undefined : set.reps, // Support both field names
            duration: ex.isCardio ? set.duration ?? 0 : undefined,
            weight_kg: ex.isCardio ? 0 : set.weight,
            status: set.status,
            notes: set.notes,
          };
        });
      });

      if (logsToSync.length > 0) {
        await syncWorkoutLogs(selectedWorkout.id, logsToSync);
      }

      // Check if all done
      const allDone =
        selectedWorkout.exercises.length > 0 &&
        selectedWorkout.exercises.every(ex => ex.sets.length > 0 && ex.sets.every(s => s.status));

      if (allDone) {
        await setWorkoutSessionStatus(selectedWorkout.id, 'COMPLETED');
      } else {
        await setWorkoutSessionStatus(selectedWorkout.id, 'PENDING');
      }

      await refreshSessions();
      const fresh = await fetchWorkoutSessionById(selectedWorkout.id);
      if (fresh) setSelectedWorkout(buildWorkoutDetails(fresh));
      
      // Update monthly cache in-place
      const monthParam = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
      updateWorkoutsMonthCache(monthParam, userId, (prev) => 
        prev.map(s => String(s.session_id) === selectedWorkout.id ? (fresh || s) : s)
      );

      setHasUnsavedChanges(false);
    } catch (e) {
      setErrorMessage("Sync failed. Check connection.");
    } finally {
      setIsSavingWorkout(false);
    }
  };

  const handleAddExercise = () => {
      if (selectedWorkout?.status === 'COMPLETED' || selectedWorkout?.isCompleted) return;
      setIsAddExerciseModalOpen(true);
  };

    const handleLogWorkoutSubmit = async (data: NewWorkoutSession) => {
      try {
        const selected = new Date(data.date);
        const isSameMonth = selected.getFullYear() === selectedYear && selected.getMonth() === selectedMonth;
        if (isSameMonth) {
          const dayKey = selected.getDate().toString();
          const existingSessions = workoutSessions[dayKey] || [];
          if (existingSessions.length > 0) {
            setErrorMessage("Only one workout session is allowed per day.");
            return;
          }
        }

        const exercisesPayload = data.exercises.flatMap(ex => {
          const isCardio = (ex.type || "").toLowerCase() === "cardio";
          return ex.reps.map(r => ({
            exercise_id: ex.id,
            actual_sets: 1,
            actual_reps: isCardio ? 0 : (r.rep ?? 0),
            duration: isCardio ? (r.duration ?? 0) : undefined,
            weight_kg: isCardio ? 0 : (r.weight_kg ?? 0),
          }));
        });
        const created = await createWorkoutSession({
          userId,
          scheduledDate: data.date,
          type: data.type,
          notes: data.note,
          planId: data.planId,
          exercises: exercisesPayload,
        });
        
        // Update monthly cache in-place
        const monthParam = data.date.slice(0, 7);
        const newSession: ApiWorkoutSession = {
            session_id: created?.session_id ?? created?.id,
            scheduled_date: data.date,
            type: data.type,
            notes: data.note,
            status: 'PENDING',
            session_details: [],
        };
        updateWorkoutsMonthCache(monthParam, userId, (prev) => [...prev, newSession]);

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
          if (fresh) {
              setSelectedWorkout(buildWorkoutDetails(fresh));
              // Update monthly cache
              const monthParam = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
              updateWorkoutsMonthCache(monthParam, userId, (prev) => 
                prev.map(s => String(s.session_id) === selectedWorkout.id ? fresh : s)
              );
          }
          setIsAddExerciseModalOpen(false);
      } catch (e) {
          setErrorMessage("Failed to add exercises");
      }
  };

  const currentSessions = workoutSessions[selectedDate.getDate().toString()] || [];

  return (
    <div className="bg-background-dark text-white min-h-screen font-body flex flex-col">
      <NavBar className="hidden lg:block shrink-0" />

      <main className="flex-1 overflow-hidden pt-16 lg:pt-20">
        <div className="flex-1 flex flex-col bg-background-dark relative">
          {/* MOBILE HEADER & DAY PICKER */}
          <div className="lg:hidden p-4 border-b border-white/5 bg-surface-dark/50 backdrop-blur-md sticky top-0 z-20">
             <div className="flex justify-between items-center mb-4">
               <h1 className="text-2xl font-display font-bold uppercase italic tracking-tighter">Workout</h1>
             </div>
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
                            {d.toDateString() === now.toDateString() && !isSelected && <div className="w-1 h-1 rounded-full bg-primary mt-1" />}
                        </button>
                    )
                })}
             </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {/* Main Calendar View Toggle or Hybrid */}
            <div className="p-4 lg:p-8 max-w-5xl mx-auto w-full">
                <div className="hidden lg:grid grid-cols-3 gap-4 mb-6">
                   <div className="bg-surface-card p-5 rounded-3xl border border-white/5">
                        <span className="text-[8px] font-black text-primary uppercase tracking-widest block mb-1">GR Score</span>
                        <p className="text-3xl font-display font-bold">{grScore.toLocaleString()}</p>
                        {grScoreChange !== 0 && (
                          <p className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${grScoreChange > 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {grScoreChange > 0 ? "+" : ""}{grScoreChange}% vs last month
                          </p>
                        )}
                   </div>

                   <div className="bg-surface-card p-5 rounded-3xl border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                          <span className="material-symbols-outlined text-4xl text-orange-500">local_fire_department</span>
                        </div>
                        <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest block mb-1">Longest Streak</span>
                        <div className="flex items-end gap-1">
                          <p className="text-3xl font-display font-bold">{currentStreak}</p>
                          <span className="text-[10px] text-text-dim font-bold mb-1 uppercase tracking-wider">Days</span>
                        </div>
                   </div>

                   <div className="bg-surface-card p-5 rounded-3xl border border-white/5">
                        <span className="text-[8px] font-black text-text-dim uppercase tracking-widest block mb-3">Muscle Split (Weekly)</span>
                        <div className="h-24 w-full relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={muscleSplit}
                                cx="50%"
                                cy="50%"
                                innerRadius={20}
                                outerRadius={40}
                                paddingAngle={4}
                                dataKey="value"
                                stroke="none"
                              >
                                {muscleSplit.map((entry, index) => (
                                  <Cell key={`desktop-muscle-cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{ backgroundColor: '#121212' }}
                                itemStyle={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                   </div>
                </div>

                {/* Dashboard Stats (Tablet/Mobile Only) */}
                <div className="lg:hidden grid grid-cols-2 gap-4 mb-8">
                   <div className="bg-surface-card p-5 rounded-3xl border border-white/5">
                        <span className="text-[8px] font-black text-primary uppercase tracking-widest block mb-1">GR Score</span>
                        <p className="text-3xl font-display font-bold">{grScore.toLocaleString()}</p>
                   </div>
                   <div className="bg-surface-card p-5 rounded-3xl border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                          <span className="material-symbols-outlined text-4xl text-orange-500">local_fire_department</span>
                        </div>
                        <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest block mb-1">Streak</span>
                        <div className="flex items-end gap-1">
                          <p className="text-3xl font-display font-bold">{currentStreak}</p>
                          <span className="text-[10px] text-text-dim font-bold mb-1 uppercase tracking-wider">Days</span>
                        </div>
                   </div>

                   {/* Muscle Split Mobile */}
                   {muscleSplit && muscleSplit.length > 0 && (
                     <div className="bg-surface-card p-5 rounded-3xl border border-white/5 col-span-2">
                          <span className="text-[8px] font-black text-text-dim uppercase tracking-widest block mb-4">Muscle Split</span>
                          <div className="flex flex-row items-center justify-between gap-4">
                            <div className="h-24 w-24 relative shrink-0">
                               <ResponsiveContainer width="100%" height="100%">
                                 <PieChart>
                                   <Pie
                                     data={muscleSplit}
                                     cx="50%"
                                     cy="50%"
                                     innerRadius={30}
                                     outerRadius={45}
                                     paddingAngle={5}
                                     dataKey="value"
                                     stroke="none"
                                   >
                                     {muscleSplit.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.color} />
                                     ))}
                                   </Pie>
                                   <Tooltip 
                                     contentStyle={{ backgroundColor: '#121212'}}
                                     itemStyle={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}
                                   />
                                 </PieChart>
                               </ResponsiveContainer>
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-x-2 gap-y-2">
                                {muscleSplit.map((item) => (
                                  <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                                      <span className="text-[9px] font-bold text-text-dim uppercase tracking-wider truncate max-w-[40px]">{item.name}</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-white ml-2">{item.value}%</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                     </div>
                   )}
                </div>

                <WorkoutCalendar
                    month={monthNames[selectedMonth]}
                    year={selectedYear}
                    sessionsCount={Object.values(workoutSessions).flat().length}
                    days={calendarDays}
                    onPrevMonth={() => handleMonthYearChange(selectedYear, selectedMonth === 0 ? 11 : selectedMonth - 1)}
                    onNextMonth={() => handleMonthYearChange(selectedYear, selectedMonth === 11 ? 0 : selectedMonth + 1)}
                    onRefresh={handleRefresh}
                    isRefreshing={isRefreshing}
                    onSessionClick={handleSessionClick}
                    onDateSelect={(d) => setSelectedDate(d)}
                    onMonthYearChange={handleMonthYearChange}
                />
            </div>
          </div>
        </div>

        {/* LOG BUTTON (MOBILE ONLY) */}
            <div className="fixed bottom-24 right-6 z-40">
           <button 
             onClick={() => { setErrorMessage(null); setIsLogWorkoutModalOpen(true); }}
             className="w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all active:scale-95"
             aria-label="Create new session"
           >
              <span className="material-symbols-outlined text-3xl">add</span>
           </button>
        </div>

            <div className="hidden lg:block fixed bottom-44 right-6 z-40">
              <button
               onClick={() => setIsPlanDayManagerOpen(true)}
               className="w-16 h-16 bg-white text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all active:scale-95"
               aria-label="Manage day plans"
              >
                <span className="material-symbols-outlined text-3xl">calendar_month</span>
              </button>
            </div>

        {/* DETAILS PANEL */}
        <AnimatePresence>
            {selectedWorkout && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelectedWorkout(null)}
                  />
                  <WorkoutDetails
                      workout={selectedWorkout}
                      onClose={() => setSelectedWorkout(null)}
                      onFinishWorkout={handleSaveWorkout}
                      onUpdateSet={handleUpdateSet}
                      onAddSet={handleAddSet}
                      onAddExercise={handleAddExercise}
                      onDeleteExercise={async (id) => {
                          if (!selectedWorkout) return;
                        if (selectedWorkout.status === 'COMPLETED' || selectedWorkout.isCompleted) return;
                          
                          try {
                            // Find the exercise to get its session_detail_id
                            const exercise = selectedWorkout.exercises.find(e => e.id === id);
                            if (exercise?.id) {
                              // Call API to delete from database
                              await deleteSessionDetail(selectedWorkout.id, exercise.id);
                                  
                              // Update local state
                              setSelectedWorkout(prev => prev ? { ...prev, exercises: prev.exercises.filter(e => e.id !== id) } : null);

                              // Update monthly cache
                              const monthParam = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
                              updateWorkoutsMonthCache(monthParam, userId, (prev) => 
                                prev.map(s => String(s.session_id) === selectedWorkout.id 
                                  ? { ...s, session_details: s.session_details?.filter(d => String(d.session_detail_id) !== id) } 
                                  : s
                                )
                              );
                            }
                          } catch (error) {
                            console.error('Failed to delete exercise:', error);
                            alert('Failed to delete exercise. Please try again.');
                          }
                      }}
                      onDeleteSet={(exId, sId) => {
                        if (selectedWorkout?.status === 'COMPLETED' || selectedWorkout?.isCompleted) return;
                          setSelectedWorkout(prev => prev ? { ...prev, exercises: prev.exercises.map(e => e.id === exId ? { ...e, sets: e.sets.filter(s => s.id !== sId) } : e) } : null);
                          setHasUnsavedChanges(true);
                      }}
                      onDeleteSession={async (id) => {
                        if (selectedWorkout?.status === 'COMPLETED' || selectedWorkout?.isCompleted) return;
                          await deleteWorkoutSession(id);
                          
                          // Update monthly cache in-place
                          const monthParam = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
                          updateWorkoutsMonthCache(monthParam, userId, (prev) => 
                              prev.filter(s => String(s.session_id) !== id)
                          );

                          setSelectedWorkout(null);
                          refreshSessions();
                      }}
                      hasUnsavedChanges={hasUnsavedChanges}
                      isLoading={isSavingWorkout || isDetailsLoading}
                  />
                </>
            )}
        </AnimatePresence>
      </main>

      <LogWorkoutModal
        isOpen={isLogWorkoutModalOpen}
        onClose={() => setIsLogWorkoutModalOpen(false)}
        onSubmit={handleLogWorkoutSubmit}
      />

      <PlanDayManagerModal
        isOpen={isPlanDayManagerOpen}
        onClose={() => setIsPlanDayManagerOpen(false)}
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
