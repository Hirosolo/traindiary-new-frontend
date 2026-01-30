"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export interface ExerciseSet {
  id: string;
  setNumber: number;
  previousWeight?: number;
  weight: number;
  reps: number;
  status?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  category?: string;
  lastPerformance?: string;
  sets: ExerciseSet[];
  isLocked?: boolean;
}

export interface WorkoutDetailsData {
  id: string;
  title: string;
  date: string;
  time: string;
  note?: string | null;
  exercises: Exercise[];
  isCompleted: boolean;
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "UNFINISHED" | "MISSED";
}

interface WorkoutDetailsProps {
  workout: WorkoutDetailsData | null;
  onClose: () => void;
  onFinishWorkout: (workoutId: string) => void;
  onUpdateSet: (exerciseId: string, setId: string, field: "weight" | "reps" | "status", value: number | boolean) => void;
  onAddSet: (exerciseId: string) => void;
  onAddExercise?: () => void;
  onDeleteExercise?: (exerciseId: string) => void;
  onDeleteSet?: (exerciseId: string, setId: string) => void;
  onDeleteSession?: (sessionId: string) => void;
  hasUnsavedChanges?: boolean;
  isLoading?: boolean;
}

export default function WorkoutDetails({
  workout,
  onClose,
  onFinishWorkout,
  onUpdateSet,
  onAddSet,
  onAddExercise,
  onDeleteExercise,
  onDeleteSet,
  onDeleteSession,
  hasUnsavedChanges = false,
  isLoading = false,
}: WorkoutDetailsProps) {
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Use current workout status if available, fallback to basic logic
  const sessionStatus = useMemo(() => {
    if (!workout) return "PENDING";
    if (workout.isCompleted) return "COMPLETED";
    
    const anySetDone = workout.exercises.some(ex => ex.sets.some(s => s.status === true));
    if (anySetDone) return "IN_PROGRESS";
    
    return "PENDING";
  }, [workout]);

  if (!workout) return null;

  const toggleExercise = (exerciseId: string) => {
    const newExpanded = new Set(expandedExercises);
    if (newExpanded.has(exerciseId)) {
      newExpanded.delete(exerciseId);
    } else {
      newExpanded.add(exerciseId);
    }
    setExpandedExercises(newExpanded);
  };

  const allSetsCompleted = (exercise: Exercise) => 
    exercise.sets.length > 0 && exercise.sets.every(set => set.status === true);

  const allExercisesDone = workout.exercises.length > 0 && 
    workout.exercises.every(ex => allSetsCompleted(ex));

  const canMarkComplete = allExercisesDone && !hasUnsavedChanges;

  const isReadOnly = workout.isCompleted;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "text-emerald-500 bg-emerald-500/10";
      case "IN_PROGRESS": return "text-blue-500 bg-blue-500/10";
      case "PENDING": return "text-zinc-500 bg-white/5";
      default: return "text-zinc-500 bg-white/5";
    }
  };

  return (
    <motion.aside 
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="w-full lg:w-[450px] border-l border-white/5 bg-surface-dark overflow-y-auto z-30"
    >
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${getStatusColor(sessionStatus)}`}>
              {sessionStatus}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {onDeleteSession && (
              <button
                onClick={() => {
                  setConfirmDialog({
                    isOpen: true,
                    title: "Delete Training Block",
                    message: "Are you sure you want to delete this entire training session? This action cannot be undone and all exercise data will be permanently lost.",
                    onConfirm: () => onDeleteSession(workout.id),
                  });
                }}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 text-text-dim hover:text-red-500 transition-colors"
                disabled={isLoading}
              >
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10 transition-colors"
              disabled={isLoading}
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-dim">Synching Data...</span>
          </div>
        ) : (
          <>
            <header className="mb-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-text-dim uppercase tracking-[0.2em]">
                  {workout.date} • {workout.time}
                </span>
              </div>
              <h1 className="text-3xl font-display font-bold text-white uppercase italic tracking-tighter leading-tight">
                {workout.title}
              </h1>
              {workout.note && (
                <p className="mt-4 text-sm text-text-dim leading-relaxed border-l-2 border-white/10 pl-4 py-1 italic">
                  "{workout.note}"
                </p>
              )}
            </header>

            <div className="space-y-8">
              {workout.exercises.map((exercise, exerciseIndex) => {
                const isExpanded = expandedExercises.has(exercise.id);
                const isDone = allSetsCompleted(exercise);

                return (
                  <div
                    key={exercise.id}
                    className={`relative rounded-3xl transition-all duration-300 ${
                      isDone ? "bg-emerald-500/5 ring-1 ring-emerald-500/20" : ""
                    }`}
                  >
                    <div
                      className="p-5 lg:p-6 cursor-pointer group"
                      onClick={() => toggleExercise(exercise.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                             <span className="text-[9px] font-black text-text-dim uppercase tracking-widest">Exercise 0{exerciseIndex + 1}</span>
                             {isDone && (
                                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Done</span>
                             )}
                          </div>
                          <h3 className={`text-xl font-display font-bold uppercase truncate transition-colors ${
                              isDone ? "text-emerald-500" : "text-white group-hover:text-primary"
                            }`}>
                            {exercise.name}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-2">
                           {!isReadOnly && onDeleteExercise && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDialog({
                                    isOpen: true,
                                    title: "Remove Exercise",
                                    message: `Are you sure you want to remove "${exercise.name}" from this session? All sets for this exercise will be deleted.`,
                                    onConfirm: () => onDeleteExercise(exercise.id),
                                  });
                                }}
                                className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                           )}
                           <span className={`material-symbols-outlined text-text-dim transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                              expand_more
                           </span>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-white/[0.02]"
                        >
                          <div className="px-5 lg:px-6 pb-6 pt-2 space-y-3">
                            <div className="grid grid-cols-5 gap-2 text-[8px] font-black text-text-dim uppercase tracking-[0.2em] px-2 mb-2">
                              <span>Set</span>
                              <span>Prev</span>
                              <span>Weight</span>
                              <span>Reps</span>
                              <span className="text-right">Action</span>
                            </div>

                            {exercise.sets.map((set) => (
                              <div
                                key={set.id}
                                className={`grid grid-cols-5 gap-2 items-center p-3 rounded-2xl border transition-all ${
                                  set.status ? "bg-emerald-500/10 border-emerald-500/20" : "bg-black/20 border-white/5"
                                } group/set`}
                              >
                                <span className="text-[11px] font-black text-text-dim pl-2 uppercase italic">
                                  S{set.setNumber}
                                </span>
                                
                                <span className="text-[10px] font-bold text-white/30 truncate">
                                  {set.previousWeight ? `${set.previousWeight}KG` : "—"}
                                </span>

                                {isReadOnly ? (
                                  <div className="col-span-2 flex items-center gap-4">
                                     <span className="text-xs font-black text-primary italic">{set.weight} KG</span>
                                     <span className="text-xs font-black text-white italic">{set.reps} REPS</span>
                                  </div>
                                ) : (
                                  <>
                                    <div className="relative">
                                       <input
                                          className="w-full bg-white/5 border-none rounded-xl text-xs py-2 px-1 text-center font-black text-primary focus:ring-1 focus:ring-primary placeholder:text-white/5"
                                          type="number"
                                          value={set.weight || ""}
                                          onChange={(e) => onUpdateSet(exercise.id, set.id, "weight", parseFloat(e.target.value) || 0)}
                                          placeholder="0"
                                       />
                                    </div>
                                    <div className="relative">
                                       <input
                                          className="w-full bg-white/5 border-none rounded-xl text-xs py-2 px-1 text-center font-black text-white focus:ring-1 focus:ring-primary placeholder:text-white/5"
                                          type="number"
                                          value={set.reps || ""}
                                          onChange={(e) => onUpdateSet(exercise.id, set.id, "reps", parseInt(e.target.value) || 0)}
                                          placeholder="0"
                                       />
                                    </div>
                                  </>
                                )}

                                <div className="flex items-center justify-end gap-2">
                                  {!isReadOnly && (
                                    <button
                                      onClick={() => onUpdateSet(exercise.id, set.id, "status", !set.status)}
                                      className={`w-7 h-7 flex items-center justify-center rounded-xl transition-all ${
                                        set.status 
                                          ? "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]" 
                                          : "bg-white/5 text-text-dim hover:bg-white/10"
                                      }`}
                                    >
                                      <span className="material-symbols-outlined text-sm font-bold">
                                        {set.status ? "check" : "circle"}
                                      </span>
                                    </button>
                                  )}
                                  
                                  {isReadOnly && set.status && (
                                     <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
                                  )}

                                  {!isReadOnly && onDeleteSet && (
                                    <button
                                      onClick={() => onDeleteSet(exercise.id, set.id)}
                                      className="opacity-0 group-hover/set:opacity-100 text-text-dim hover:text-red-500 transition-all ml-1"
                                    >
                                      <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}

                            {!isReadOnly && (
                              <button
                                onClick={() => onAddSet(exercise.id)}
                                className="w-full mt-4 py-4 border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-text-dim hover:text-white hover:border-primary/50 transition-all hover:bg-primary/5"
                              >
                                + ADD PERFORMANCE SET
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {!isReadOnly && (
              <div className="mt-12 space-y-4">
                <button
                   onClick={onAddExercise}
                   className="w-full py-4 border-2 border-white/5 rounded-3xl flex items-center justify-center gap-3 hover:bg-white/5 hover:border-white/10 transition-all group"
                >
                   <span className="material-symbols-outlined text-text-dim group-hover:text-primary transition-colors">add_box</span>
                   <span className="text-[11px] font-black uppercase tracking-widest text-text-dim group-hover:text-white transition-colors">Append Exercise</span>
                </button>

                <div className="pt-4 space-y-4">
                   <button
                    onClick={() => onFinishWorkout(workout.id)}
                    disabled={isLoading}
                    className="w-full bg-white text-black font-black py-5 rounded-[2.5rem] shadow-2xl transition-all active:scale-[0.98] hover:bg-primary hover:text-white flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>PROCESSING...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">verified</span>
                        <span className="uppercase tracking-widest">{canMarkComplete ? "FINALISE SESSION" : "SYNC PROGRESS"}</span>
                      </>
                    )}
                  </button>
                  
                  {!allExercisesDone && (
                    <p className="text-[9px] text-center text-text-dim font-bold uppercase tracking-widest">
                      Mark all sets as <span className="text-emerald-500">done</span> to unlock finalise
                    </p>
                  )}
                </div>
              </div>
            )}

            {isReadOnly && (
              <div className="mt-12 p-8 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 text-center relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500 opacity-5 rounded-full blur-3xl" />
                <span className="material-symbols-outlined text-emerald-500 text-4xl mb-4">auto_awesome</span>
                <h4 className="text-xl font-display font-bold text-white uppercase italic tracking-tighter">Mission Accomplished</h4>
                <p className="text-[10px] text-emerald-500/80 font-black uppercase tracking-widest mt-2">Training block successfully archived</p>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        isDangerous={true}
      />
    </motion.aside>
  );
}
