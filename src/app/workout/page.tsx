"use client";

import { useState, useMemo } from "react";
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

export default function WorkoutPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2023, 9, 1)); // October 2023
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutDetailsData | null>(null);
  const [isLogWorkoutModalOpen, setIsLogWorkoutModalOpen] = useState(false);

  // Mock data - replace with API calls later
  const [workoutSessions, setWorkoutSessions] = useState<
    Record<string, WorkoutSession[]>
  >({
    "1": [
      {
        id: "w1",
        title: "Pull Session",
        status: "incomplete",
        time: "9:00 AM",
        note: "Focus on form today",
      },
    ],
    "3": [
      {
        id: "w2",
        title: "Legs A",
        status: "complete",
        time: "10:00 AM",
      },
    ],
    "5": [
      {
        id: "w3",
        title: "Push B",
        status: "incomplete",
        time: "8:30 AM",
      },
    ],
    "7": [
      {
        id: "w4",
        title: "PR Day: Squat",
        status: "complete",
        time: "10:45 AM",
        note: "Hit new PR on squat!",
      },
    ],
  });

  const [workoutDetailsMap, setWorkoutDetailsMap] = useState<
    Record<string, WorkoutDetailsData>
  >({
    w4: {
      id: "w4",
      title: "Lower Body: Strength A",
      date: "Oct 7, 2023",
      time: "10:45 AM",
      isCompleted: false,
      exercises: [
        {
          id: "ex1",
          name: "Barbell Back Squat",
          lastPerformance: "140kg x 5",
          sets: [
            {
              id: "s1",
              setNumber: 1,
              previousWeight: 135,
              weight: 145,
              reps: 5,
            },
            {
              id: "s2",
              setNumber: 2,
              previousWeight: 135,
              weight: 145,
              reps: 5,
            },
          ],
        },
        {
          id: "ex2",
          name: "Romanian Deadlift",
          lastPerformance: "100kg x 8",
          isLocked: true,
          sets: [],
        },
      ],
    },
  });

  // Calculate days for calendar
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

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
      days.push({
        day,
        isCurrentMonth: true,
        sessions,
        isPR: day === 7, // Mock PR day
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
  }, [currentDate, workoutSessions]);

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

  const monthName = currentDate.toLocaleString("en-US", { month: "long" });
  const year = currentDate.getFullYear();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleSessionClick = (session: WorkoutSession, day: number) => {
    // Load workout details - in real app, this would fetch from API
    const details = workoutDetailsMap[session.id] || {
      id: session.id,
      title: session.title,
      date: `${monthName} ${day}, ${year}`,
      time: session.time || "N/A",
      isCompleted: session.status === "complete",
      exercises: [],
    };
    setSelectedWorkout(details);
  };

  const handleCloseDetails = () => {
    setSelectedWorkout(null);
  };

  const handleFinishWorkout = (workoutId: string) => {
    // Mark workout as completed
    setWorkoutDetailsMap((prev) => ({
      ...prev,
      [workoutId]: {
        ...prev[workoutId],
        isCompleted: true,
      },
    }));

    // Update session status
    setWorkoutSessions((prev) => {
      const newSessions = { ...prev };
      Object.keys(newSessions).forEach((day) => {
        newSessions[day] = newSessions[day].map((session) =>
          session.id === workoutId ? { ...session, status: "complete" as const } : session
        );
      });
      return newSessions;
    });

    setSelectedWorkout((prev) =>
      prev ? { ...prev, isCompleted: true } : null
    );
  };

  const handleUpdateSet = (
    exerciseId: string,
    setId: string,
    field: "weight" | "reps",
    value: number
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
    setWorkoutDetailsMap((prev) => ({
      ...prev,
      [selectedWorkout.id]: updatedWorkout,
    }));
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
              },
            ],
          };
        }
        return ex;
      }),
    };

    setSelectedWorkout(updatedWorkout);
    setWorkoutDetailsMap((prev) => ({
      ...prev,
      [selectedWorkout.id]: updatedWorkout,
    }));
  };

  const handleLogWorkout = () => {
    setIsLogWorkoutModalOpen(true);
  };

  const handleLogWorkoutSubmit = (newWorkout: NewWorkoutSession) => {
    // Parse the date to get day number
    const workoutDate = new Date(newWorkout.date);
    const day = workoutDate.getDate();

    // Create new session
    const sessionId = `w${Date.now()}`;
    const newSession: WorkoutSession = {
      id: sessionId,
      title: newWorkout.title,
      status: "incomplete",
      time: newWorkout.time,
      note: newWorkout.note,
    };

    // Create workout details with exercises
    const workoutDetails: WorkoutDetailsData = {
      id: sessionId,
      title: newWorkout.title,
      date: workoutDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: newWorkout.time,
      isCompleted: false,
      exercises: newWorkout.exercises.map((ex, idx) => ({
        id: `ex${Date.now()}_${idx}`,
        name: ex.name,
        sets: Array.from({ length: ex.sets }, (_, setIdx) => ({
          id: `s${Date.now()}_${idx}_${setIdx}`,
          setNumber: setIdx + 1,
          weight: 0,
          reps: ex.reps,
        })),
      })),
    };

    // Update workout sessions
    setWorkoutSessions((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), newSession],
    }));

    // Update workout details map
    setWorkoutDetailsMap((prev) => ({
      ...prev,
      [sessionId]: workoutDetails,
    }));

    // Close modal and open the new workout details
    setIsLogWorkoutModalOpen(false);
    setSelectedWorkout(workoutDetails);
  };

  return (
    <div className="bg-background-dark text-white min-h-screen">
      <NavBar />

      <div className="flex flex-col lg:flex-row h-screen pt-16">
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
          />
        </div>

        <WorkoutCalendar
          month={monthName}
          year={year}
          sessionsCount={totalWorkouts}
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
              />
            </div>
          </div>
        )}
      </div>

      <LogWorkoutModal
        isOpen={isLogWorkoutModalOpen}
        onClose={() => setIsLogWorkoutModalOpen(false)}
        onSubmit={handleLogWorkoutSubmit}
      />
    </div>
  );
}
