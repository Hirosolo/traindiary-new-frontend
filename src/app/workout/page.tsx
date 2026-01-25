"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import NavBar from "@/components/ui/navbar";
import { CalendarLume } from "@/components/ui/calendar-lume";
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
} from "@/lib/api/workouts";

export default function WorkoutPage() {
  const USER_ID = 1; // TODO: replace with authenticated user id when available
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarStep, setCalendarStep] = useState<"year" | "month">("year");
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutDetailsData | null>(null);
  const [isLogWorkoutModalOpen, setIsLogWorkoutModalOpen] = useState(false);
  const [, setIsLoadingSessions] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isSavingWorkout, setIsSavingWorkout] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleMonthYearChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setIsCalendarOpen(false);
  };

  const parseSessionDate = (date: string | undefined) => {
    if (!date) return new Date();
    const trimmed = date.trim();

    // Split date and time manually to avoid timezone shifts from implicit UTC parsing
    const [datePart, timePart] = trimmed.split(/[T ]/);
    const [yearStr, monthStr, dayStr] = (datePart || "").split("-");
    const year = Number(yearStr);
    const month = Number(monthStr) - 1; // JS months are 0-indexed
    const day = Number(dayStr);

    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    if (timePart) {
      const [h, m, s] = timePart.split(":");
      hours = Number(h) || 0;
      minutes = Number(m) || 0;
      seconds = Number(s) || 0;
    }

    const parsed = new Date(year, month, day, hours, minutes, seconds);
    if (Number.isNaN(parsed.getTime())) {
      // Fallback to native parsing if manual parsing fails
      return new Date(trimmed);
    }
    return parsed;
  };

  const hasTimePart = (date: string | undefined) => {
    if (!date) return false;
    const trimmed = date.trim();
    return trimmed.includes(" ") || trimmed.includes("T") || trimmed.includes(":");
  };

  const [workoutSessions, setWorkoutSessions] = useState<
    Record<string, WorkoutSession[]>
  >({});

  const [workoutDetailsMap, setWorkoutDetailsMap] = useState<
    Record<string, WorkoutDetailsData>
  >({});

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const mapSessionDetailToExercise = useCallback((detail: ApiSessionDetail): Exercise => {
    const logs = detail.exercise_logs ?? [];
    const plannedSets = detail.planned_sets ?? logs.length ?? 0;
    const sets: ExerciseSet[] =
      logs.length > 0
        ? logs.map((log, index) => ({
            id: (log.log_id ?? `${detail.session_detail_id ?? detail.exercise_id}-log-${index}`).toString(),
            setNumber: index + 1,
            weight: log.weight_kg ?? 0,
            reps: log.actual_reps ?? log.rep ?? 0,
            status: log.status ?? false, // Use status from API, default to false
          }))
        : Array.from({ length: plannedSets }, (_, index) => ({
            id: `${detail.session_detail_id ?? detail.exercise_id ?? "planned"}-${index}`,
            setNumber: index + 1,
            weight: 0,
            reps: detail.planned_reps ?? 0,
          }));

    return {
      id: (detail.session_detail_id ?? detail.exercise_id ?? `exercise-${Date.now()}`).toString(),
      name: detail.exercises?.name ?? "Workout Exercise",
      lastPerformance: undefined,
      sets,
    };
  }, []);

  const buildWorkoutDetails = useCallback(
    (session: ApiWorkoutSession, fallback?: WorkoutDetailsData): WorkoutDetailsData => {
      const dateObj = parseSessionDate(session.scheduled_date);
      const displayDate =
        fallback?.date ||
        dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      const hasTimeInfo = hasTimePart(session.scheduled_date);
      const displayTime = fallback?.time
        ? fallback.time
        : hasTimeInfo
        ? parseSessionDate(session.scheduled_date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "Scheduled";

      return {
        id: (session.session_id ?? fallback?.id ?? `session-${Date.now()}`).toString(),
        title: session.notes || session.type || fallback?.title || "Workout Session",
        date: displayDate,
        time: displayTime,
        note: session.notes ?? fallback?.note ?? null,
        isCompleted: Boolean(session.completed),
        exercises: (session.session_details ?? []).map(mapSessionDetailToExercise),
      };
    },
    [mapSessionDetailToExercise]
  );

  const mapSessionsToDays = useCallback((sessions: ApiWorkoutSession[]) => {
    const record: Record<string, WorkoutSession[]> = {};

    if (!Array.isArray(sessions)) {
      console.error("Sessions is not an array:", sessions);
      return record;
    }

    sessions.forEach((session, index) => {
      const sessionDate = parseSessionDate(session.scheduled_date);
      if (Number.isNaN(sessionDate.getTime())) {
        console.warn("Invalid session date", session.scheduled_date, session);
        return;
      }
      const hasTimeInfo = hasTimePart(session.scheduled_date);
      const dayKey = sessionDate.getDate().toString();
      const sessionId = (session.session_id ?? `session-${index}`).toString();

      const exerciseNames = (session.session_details ?? [])
        .map((detail) => detail.exercises?.name)
        .filter(Boolean) as string[];
      
      // Build title from exercises in session_details
      let title = "Workout Session";
      if (session.notes) {
        title = session.notes;
      } else if (session.type) {
        title = session.type;
      } else if (exerciseNames.length > 0) {
        if (exerciseNames.length === 1) {
          title = exerciseNames[0]!;
        } else if (exerciseNames.length === 2) {
          title = exerciseNames.join(" + ");
        } else {
          title = `${exerciseNames[0]} +${exerciseNames.length - 1}`;
        }
      }

      const mapped: WorkoutSession = {
        id: sessionId,
        title,
        status: session.completed ? "complete" : "incomplete",
        time: hasTimeInfo
          ? sessionDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : undefined,
        note: session.notes ?? undefined,
        exercises: exerciseNames,
      };

      record[dayKey] = [...(record[dayKey] || []), mapped];
    });

    return record;
  }, []);

  const normalizeSessions = (response: ApiWorkoutSessionsResponse): ApiWorkoutSession[] => {
    if (Array.isArray(response)) return response;
    if (response && Array.isArray(response.sessions)) return response.sessions;
    return [];
  };

  const refreshSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    setErrorMessage(null);
    try {
      const monthParam = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
      const sessions = await fetchWorkoutSessions(USER_ID, monthParam);
      console.log("Sessions response:", sessions);
      const sessionsArray = normalizeSessions(sessions);
      setWorkoutSessions(mapSessionsToDays(sessionsArray));
    } catch (error) {
      console.error("Failed to load sessions", error);
      setErrorMessage(error instanceof Error ? error.message : "Unable to load workouts");
    } finally {
      setIsLoadingSessions(false);
    }
  }, [USER_ID, mapSessionsToDays, selectedMonth, selectedYear]);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  const loadWorkoutDetailsById = useCallback(
    async (sessionId: string, fallback?: WorkoutDetailsData) => {
      if (workoutDetailsMap[sessionId]) {
        setSelectedWorkout(workoutDetailsMap[sessionId]);
        return;
      }

      setIsDetailsLoading(true);
      try {
        const session = await fetchWorkoutSessionById(sessionId);
        if (session) {
          const details = buildWorkoutDetails(session, fallback);
          setWorkoutDetailsMap((prev) => ({ ...prev, [sessionId]: details }));
          setSelectedWorkout(details);
        } else if (fallback) {
          setSelectedWorkout(fallback);
        }
      } catch (error) {
        console.error("Failed to load session details", error);
        setErrorMessage(error instanceof Error ? error.message : "Unable to load workout details");
        if (fallback) setSelectedWorkout(fallback);
      } finally {
        setIsDetailsLoading(false);
      }
    },
    [buildWorkoutDetails, workoutDetailsMap]
  );

  // Calculate days for calendar
  const calendarDays = useMemo(() => {
    const year = selectedYear;
    const month = selectedMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const today = new Date();

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    let startDay = firstDay.getDay() - 1; // Convert to Monday = 0
    if (startDay < 0) startDay = 6; // Handle Sunday

    const days: DayData[] = [];

    // Add previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        sessions: [],
      });
    }

    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const sessions = workoutSessions[day.toString()] || [];
      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();
      days.push({
        day,
        isCurrentMonth: true,
        sessions,
        isToday,
      });
    }

    // Add next month days to fill the grid
    const remainingDays = 35 - days.length; // Ensure at least 5 rows
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        sessions: [],
      });
    }

    return days;
  }, [selectedYear, selectedMonth, workoutSessions]);

  // Calculate current streak (days with at least 1 completed workout)
  const currentStreak = useMemo(() => {
    let streak = 0;
    Object.values(workoutSessions).forEach((sessions) => {
      if (sessions.some((s) => s.status === "complete")) {
        streak++;
      }
    });
    return streak;
  }, [workoutSessions]);

  // Calculate total workouts
  const totalWorkouts = useMemo(() => {
    return Object.values(workoutSessions).reduce(
      (acc, sessions) => acc + sessions.filter((s) => s.status === "complete").length,
      0
    );
  }, [workoutSessions]);

  const totalSessions = useMemo(() => {
    return Object.values(workoutSessions).reduce(
      (acc, sessions) => acc + sessions.length,
      0
    );
  }, [workoutSessions]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthName = monthNames[selectedMonth];
  const year = selectedYear;

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleSessionClick = (session: WorkoutSession, day: number) => {
    const details = workoutDetailsMap[session.id] || {
      id: session.id,
      title: session.title,
      date: new Date(selectedYear, selectedMonth, day).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: session.time || "N/A",
      note: session.note ?? undefined,
      isCompleted: session.status === "complete",
      exercises: [],
    };

    setSelectedWorkout(details);
    loadWorkoutDetailsById(session.id, details);
    setHasUnsavedChanges(false);
  };

  const handleCloseDetails = () => {
    setSelectedWorkout(null);
  };

  const handleFinishWorkout = async (workoutId: string) => {
    try {
      if (selectedWorkout?.isCompleted) {
        // Already completed, just refresh
        await refreshSessions();
        return;
      }

      // Save all changes and mark as completed
      await handleSaveWorkout();
    } catch (error) {
      console.error("Failed to finish workout", error);
      setErrorMessage(error instanceof Error ? error.message : "Unable to finish workout");
    }
  };

  const handleDeleteExercise = (exerciseId: string) => {
    // Remove from UI only - will be sent to API on save
    setSelectedWorkout((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.filter((ex) => ex.id !== exerciseId),
      };
    });

    // Don't update workoutDetailsMap - keep original state for comparison
    setHasUnsavedChanges(true);
  };

  const handleDeleteSet = (exerciseId: string, setId: string) => {
    // Remove from UI only - will be sent to API on save
    setSelectedWorkout((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map((ex) =>
          ex.id === exerciseId
            ? {
                ...ex,
                sets: ex.sets.filter((s) => s.id !== setId),
              }
            : ex
        ),
      };
    });

    // Don't update workoutDetailsMap - keep original state for comparison
    setHasUnsavedChanges(true);
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteWorkoutSession(sessionId);
      setSelectedWorkout(null);
      await refreshSessions();
    } catch (error) {
      console.error("Failed to delete session", error);
      setErrorMessage(error instanceof Error ? error.message : "Unable to delete session");
    }
  };

  const handleSaveWorkout = async () => {
    if (!selectedWorkout) return;

    setIsSavingWorkout(true);
    setErrorMessage(null);
    try {
      const sessionId = selectedWorkout.id;
      
      // Get original workout details to compare what changed
      const originalDetails = workoutDetailsMap[sessionId];
      
      if (!originalDetails) {
        console.warn("No original details found to compare changes");
      } else {
        // Find deleted exercises and their sets
        const currentExerciseIds = new Set(selectedWorkout.exercises.map(ex => ex.id));
        const originalExerciseIds = new Set(originalDetails.exercises.map(ex => ex.id));
        
        // Track ALL deleted set IDs to delete
        const deletedSetIds: number[] = [];
        
        // For DELETED exercises, collect all their set IDs
        for (const exerciseId of originalExerciseIds) {
          if (!currentExerciseIds.has(exerciseId) && !exerciseId.startsWith("e")) {
            const deletedExercise = originalDetails.exercises.find(ex => ex.id === exerciseId);
            if (deletedExercise) {
              // Collect all sets from this deleted exercise
              for (const set of deletedExercise.sets) {
                const numericLogId = Number(set.id);
                if (Number.isFinite(numericLogId)) {
                  deletedSetIds.push(numericLogId);
                  console.log(`Marked set ${numericLogId} for deletion (exercise deleted)`);
                }
              }
            }
            // Delete the exercise
            try {
              await deleteSessionDetail(exerciseId);
              console.log(`Deleted exercise ${exerciseId}`);
            } catch (e) {
              console.error("Could not delete exercise", exerciseId, e);
              throw e;
            }
          }
        }

        // For EXISTING exercises, find deleted sets
        for (const exercise of selectedWorkout.exercises) {
          const originalExercise = originalDetails.exercises.find(ex => ex.id === exercise.id);
          if (originalExercise) {
            const currentSetIds = new Set(exercise.sets.map(s => s.id));
            const originalSetIds = originalExercise.sets.map(s => s.id);
            
            for (const setId of originalSetIds) {
              if (!currentSetIds.has(setId)) {
                const numericLogId = Number(setId);
                if (Number.isFinite(numericLogId)) {
                  deletedSetIds.push(numericLogId);
                  console.log(`Marked set ${numericLogId} for deletion (set removed from exercise)`);
                }
              }
            }
          }
        }

        // Delete all marked sets
        for (const logId of deletedSetIds) {
          try {
            await deleteExerciseLog(logId);
            console.log(`Successfully deleted exercise log ${logId}`);
          } catch (e) {
            console.error(`Could not delete log ${logId}:`, e);
            throw e;
          }
        }
      }

      // Upsert sets: update existing logs and create new ones
      const updatedExercises = selectedWorkout.exercises.map((exercise) => {
        const sessionDetailId = Number(exercise.id);
        const setsWithIds = [...exercise.sets];

        const syncSets = async () => {
          for (let i = 0; i < setsWithIds.length; i++) {
            const set = setsWithIds[i];
            const numericLogId = Number(set.id);
            const actualReps = set.reps || 0;
            const weightKg = Number.isFinite(set.weight) ? set.weight : 0;
            const logStatus = set.status === true ? true : false;

            if (Number.isFinite(numericLogId)) {
              try {
                await updateExerciseLog({
                  logId: numericLogId,
                  actualReps,
                  weightKg,
                  logStatus,
                });
                console.log(`Updated log ${numericLogId}: reps=${actualReps}, weight=${weightKg}, status=${logStatus}`);
              } catch (e) {
                console.error(`Failed to update exercise log ${numericLogId}:`, e);
                throw e;
              }
            } else if (Number.isFinite(sessionDetailId)) {
              try {
                const created = await logExerciseSet({
                  sessionDetailId,
                  actualReps,
                  weightKg,
                  status: logStatus,
                });
                const newLogId = (created as { log_id?: number }).log_id;
                if (newLogId) {
                  setsWithIds[i] = { ...set, id: newLogId.toString() };
                  console.log(`Created new log with ID ${newLogId}: reps=${actualReps}, weight=${weightKg}, status=${logStatus}`);
                }
              } catch (e) {
                console.error(`Failed to create exercise log for session detail ${sessionDetailId}:`, e);
                throw e;
              }
            }
          }
        };

        return { exercise, syncSets, setsWithIds };
      });

      // Run sync sequentially to preserve order and avoid API collisions per exercise
      for (const { syncSets } of updatedExercises) {
        await syncSets();
      }

      // Fetch fresh data from API to ensure UI displays real data
      console.log("Fetching fresh workout details from API after save...");
      const freshSession = await fetchWorkoutSessionById(sessionId);
      
      if (freshSession) {
        const freshDetails = buildWorkoutDetails(freshSession);
        
        // Update local state with fresh API data
        setSelectedWorkout(freshDetails);
        setWorkoutDetailsMap((prev) => ({
          ...prev,
          [sessionId]: freshDetails,
        }));

        // Check if all exercises are done
        const allExercisesDone = freshDetails.exercises.length > 0 && 
          freshDetails.exercises.every(ex => 
            ex.sets.length > 0 && ex.sets.every(set => set.status === true)
          );
        
        const shouldMarkComplete = allExercisesDone && !freshDetails.isCompleted;

        // Only mark as completed if all conditions are met
        if (shouldMarkComplete) {
          await completeWorkoutSession(sessionId);

          const completedDetails = { ...freshDetails, isCompleted: true };
          
          setSelectedWorkout(completedDetails);
          setWorkoutDetailsMap((prev) => ({
            ...prev,
            [sessionId]: completedDetails,
          }));

          setWorkoutSessions((prev) => {
            const newSessions = { ...prev };
            Object.keys(newSessions).forEach((day) => {
              newSessions[day] = newSessions[day].map((session) =>
                session.id === sessionId ? { ...session, status: "complete" as const } : session
              );
            });
            return newSessions;
          });
        }
      }

      await refreshSessions();
      setHasUnsavedChanges(false);
      setErrorMessage(null);
    } catch (error) {
      console.error("Failed to save workout", error);
      setErrorMessage(error instanceof Error ? error.message : "Unable to save workout");
    } finally {
      setIsSavingWorkout(false);
    }
  };

  const handleUpdateSet = (
    exerciseId: string,
    setId: string,
    field: "weight" | "reps" | "status",
    value: number | boolean
  ) => {
    if (!selectedWorkout) return;

    const updatedWorkout = {
      ...selectedWorkout,
      exercises: selectedWorkout.exercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set) =>
                set.id === setId ? { ...set, [field]: value } : set
              ),
            }
          : ex
      ),
    };

    setSelectedWorkout(updatedWorkout);
    // Don't update workoutDetailsMap - keep original state for comparison
    setHasUnsavedChanges(true);
  };

  const handleAddSet = (exerciseId: string) => {
    if (!selectedWorkout) return;

    const updatedWorkout = {
      ...selectedWorkout,
      exercises: selectedWorkout.exercises.map((ex) => {
        if (ex.id === exerciseId) {
          const newSetNumber = ex.sets.length + 1;
          const lastSet = ex.sets[ex.sets.length - 1];
          return {
            ...ex,
            sets: [
              ...ex.sets,
              {
                id: `s${Date.now()}`,
                setNumber: newSetNumber,
                previousWeight: lastSet?.previousWeight,
                weight: 0,
                reps: 0,
                status: false,
              },
            ],
          };
        }
        return ex;
      }),
    };

    setSelectedWorkout(updatedWorkout);
    // Don't update workoutDetailsMap - keep original state for comparison
    setHasUnsavedChanges(true);
  };

  const handleLogWorkout = () => {
    setIsLogWorkoutModalOpen(true);
  };

  const handleLogWorkoutSubmit = async (newWorkout: NewWorkoutSession) => {
    setIsSavingWorkout(true);
    setErrorMessage(null);

    try {
      const exercisesPayload = newWorkout.exercises.map((ex) => ({
        exercise_id: ex.id,
        reps: ex.reps.map((repObj) => ({
          rep: repObj.rep,
          weight_kg: repObj.weight_kg ?? null,
        })),
      }));

      const created = await createWorkoutSession({
        userId: USER_ID,
        scheduledDate: newWorkout.date,
        type: newWorkout.type,
        notes: newWorkout.note ?? newWorkout.title,
        exercises: exercisesPayload,
      });

      let sessionId = created.session_id ?? created.id;

      if (!sessionId) {
        const monthParam = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
        const sessions = await fetchWorkoutSessions(USER_ID, monthParam);
        const sessionsArray = normalizeSessions(sessions);
        const match = sessionsArray.find((session) =>
          session.scheduled_date?.startsWith(newWorkout.date)
        );
        if (match?.session_id) sessionId = match.session_id;
        setWorkoutSessions(mapSessionsToDays(sessionsArray));
      }

      await refreshSessions();
      if (sessionId) {
        // Reload the session details to get fresh data from API
        await loadWorkoutDetailsById(sessionId.toString());
      }

      setIsLogWorkoutModalOpen(false);
    } catch (error) {
      console.error("Failed to log workout", error);
      setErrorMessage(error instanceof Error ? error.message : "Unable to log workout");
      throw error;
    } finally {
      setIsSavingWorkout(false);
    }
  };

  return (
    <div className="bg-background-dark text-white min-h-screen">
      <NavBar className="hidden lg:block" />

      <main className="pt-16 pb-24 overflow-y-auto">
        <div className="p-5 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold font-display tracking-tight text-white uppercase italic leading-tight">
                Workout
              </h1>
              <p className="text-[11px] text-text-dim mt-0.5 font-medium leading-relaxed">
                Track your training sessions.
              </p>
            </div>

            {/* Period Selector - mobile/tablet only */}
            <div className="relative max-w-xs w-full sm:w-auto lg:hidden">
              <button
                onClick={() => {
                  setCalendarStep("year");
                  setIsCalendarOpen(true);
                }}
                className="w-full bg-surface-card border border-white/5 rounded-xl px-4 py-3 hover:border-white/10 transition-colors text-left flex flex-col items-start gap-1"
              >
                <span className="text-[10px] uppercase tracking-[0.16em] text-text-dim font-bold block mb-1">
                  Select Period
                </span>
                <div className="flex flex-col">
                  <span className="text-sm text-text-dim font-medium">
                    {monthNames[selectedMonth]}
                  </span>
                  <p className="text-2xl font-display font-bold text-white">
                    {selectedYear}
                  </p>
                </div>
              </button>

              {/* Calendar Modal - Fixed Position */}
              {isCalendarOpen && (
                <div className="absolute top-full left-0 mt-3 z-50 animate-in fade-in duration-200">
                  <CalendarLume
                    defaultMonth={selectedMonth}
                    defaultYear={selectedYear}
                    onMonthYearChange={handleMonthYearChange}
                    initialStep={calendarStep}
                    onClose={() => setIsCalendarOpen(false)}
                  />
                </div>
              )}
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-100 text-sm px-4 py-3 rounded-lg">
              {errorMessage}
            </div>
          )}
        </div>

      <div className="flex flex-col lg:flex-row">
        {/* Mobile Activity Overview - Hidden on desktop */}
        <div className="lg:hidden px-4 py-6 border-b border-white/5 bg-surface-dark">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-surface-card p-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-primary mb-1">
                <span className="material-symbols-outlined text-sm">local_fire_department</span>
                <span className="text-[9px] font-bold uppercase tracking-wider">Streak</span>
              </div>
              <p className="text-2xl font-display font-bold">
                {currentStreak} <span className="text-xs text-text-dim font-normal">Days</span>
              </p>
            </div>
            <div className="bg-surface-card p-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-white/50 mb-1">
                <span className="material-symbols-outlined text-sm">fitness_center</span>
                <span className="text-[9px] font-bold uppercase tracking-wider">Total</span>
              </div>
              <p className="text-2xl font-display font-bold">{totalWorkouts}</p>
            </div>
          </div>
          <button
            onClick={handleLogWorkout}
            className="w-full bg-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span className="text-sm uppercase tracking-wider">LOG WORKOUT</span>
          </button>
        </div>

        {/* Desktop Activity Overview - Hidden on mobile */}
        <div className="hidden lg:block">
          <ActivityOverview
            currentStreak={currentStreak}
            totalWorkouts={totalWorkouts}
            monthlyFocusLabel="Strength Phase"
            monthlyFocusProgress={85}
            onLogWorkout={handleLogWorkout}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthYearChange={handleMonthYearChange}
          />
        </div>

        <WorkoutCalendar
          month={monthName}
          year={year}
          sessionsCount={totalSessions}
          days={calendarDays}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onSessionClick={handleSessionClick}
        />

        {/* Desktop Workout Details - Hidden on mobile */}
        {selectedWorkout && (
          <div className="hidden lg:block">
            <WorkoutDetails
              workout={selectedWorkout}
              onClose={handleCloseDetails}
              onFinishWorkout={handleFinishWorkout}
              onUpdateSet={handleUpdateSet}
              onAddSet={handleAddSet}
              onDeleteExercise={handleDeleteExercise}
              onDeleteSet={handleDeleteSet}
              onDeleteSession={handleDeleteSession}
              hasUnsavedChanges={hasUnsavedChanges}
              isLoading={isDetailsLoading || isSavingWorkout}
            />
          </div>
        )}

        {/* Mobile Workout Details Modal */}
        {selectedWorkout && (
          <div className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end">
            <div className="w-full bg-surface-dark rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col animate-slide-up">
              <WorkoutDetails
                workout={selectedWorkout}
                onClose={handleCloseDetails}
                onFinishWorkout={handleFinishWorkout}
                onUpdateSet={handleUpdateSet}
                onAddSet={handleAddSet}
                onDeleteExercise={handleDeleteExercise}
                onDeleteSet={handleDeleteSet}
                onDeleteSession={handleDeleteSession}
                hasUnsavedChanges={hasUnsavedChanges}
                isLoading={isDetailsLoading || isSavingWorkout}
              />
            </div>
          </div>
        )}
      </div>
      </main>

      <LogWorkoutModal
        isOpen={isLogWorkoutModalOpen}
        onClose={() => setIsLogWorkoutModalOpen(false)}
        onSubmit={handleLogWorkoutSubmit}
      />
    </div>
  );
}
