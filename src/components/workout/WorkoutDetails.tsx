"use client";

import { useState } from "react";

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
}

interface WorkoutDetailsProps {
  workout: WorkoutDetailsData | null;
  onClose: () => void;
  onFinishWorkout: (workoutId: string) => void;
  onUpdateSet: (exerciseId: string, setId: string, field: "weight" | "reps" | "status", value: number | boolean) => void;
  onAddSet: (exerciseId: string) => void;
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
  onDeleteExercise,
  onDeleteSet,
  onDeleteSession,
  hasUnsavedChanges = false,
  isLoading = false,
}: WorkoutDetailsProps) {
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());

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

  return (
    <aside className="w-full lg:w-[400px] border-l border-white/5 bg-surface-dark overflow-y-auto">
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <h3 className="text-lg lg:text-xl font-display font-bold">Workout Details</h3>
          <div className="flex items-center gap-2">
            {!isReadOnly && onDeleteSession && (
              <button
                onClick={() => {
                  if (window.confirm("Delete this workout session?")) {
                    onDeleteSession(workout.id);
                  }
                }}
                className="text-text-dim hover:text-red-400 transition-colors disabled:opacity-50"
                title="Delete session"
                disabled={isLoading}
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-text-dim hover:text-white transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="mb-6 flex flex-col items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3"></div>
            <p className="text-xs text-text-dim uppercase tracking-wider">Loading...</p>
          </div>
        )}

        {!isLoading && (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
            <span className="text-primary font-bold text-xs uppercase tracking-widest">
              {workout.date}
            </span>
            <span className="text-text-dim text-[10px] uppercase font-bold">
              • {workout.time}
            </span>
          </div>
          <h4 className="text-xl lg:text-2xl font-display font-bold">{workout.title}</h4>
          {workout.note && (
            <p className="mt-2 text-sm text-text-dim leading-relaxed whitespace-pre-line">{workout.note}</p>
          )}
          {workout.isCompleted && (
            <div className="mt-2 inline-flex items-center gap-1 bg-primary/20 text-primary px-2 py-1 rounded text-xs font-bold">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>COMPLETED</span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {workout.exercises.map((exercise, exerciseIndex) => {
            const isExpanded = expandedExercises.has(exercise.id);
            const isDone = allSetsCompleted(exercise);

            return (
              <div
                key={exercise.id}
                className={`bg-surface-card rounded-2xl p-5 border border-white/5 ${
                  isDone ? "border-primary/50" : ""
                }`}
              >
                <div
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => toggleExercise(exercise.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className={`font-bold ${isDone ? "text-primary" : "text-white"}`}>
                        {exercise.name}
                      </h5>
                      <span className="material-symbols-outlined text-sm text-text-dim">
                        {isExpanded ? "expand_less" : "expand_more"}
                      </span>
                    </div>
                    {isDone && (
                      <p className="text-[10px] text-primary font-bold uppercase mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        EXERCISE DONE
                      </p>
                    )}
                    {exercise.lastPerformance && (
                      <p className="text-[10px] text-text-dim font-bold uppercase mt-1">
                        Last: {exercise.lastPerformance}
                      </p>
                    )}
                  </div>
                  {!isReadOnly && onDeleteExercise && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("Delete this exercise?")) {
                          onDeleteExercise(exercise.id);
                        }
                      }}
                      className="text-text-dim hover:text-red-400 transition-colors"
                      title="Delete exercise"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-2">
                    <div className="grid grid-cols-5 gap-2 text-[10px] font-bold text-text-dim uppercase tracking-tighter px-2">
                      <span>Set</span>
                      <span>Prev</span>
                      <span>Weight</span>
                      <span>Reps</span>
                      <span>Done</span>
                    </div>

                    {exercise.sets.map((set) => (
                      <div
                        key={set.id}
                        className="grid grid-cols-5 gap-2 items-center bg-background-dark p-2 rounded-lg border border-white/5 group"
                      >
                        <span className="text-xs font-bold text-text-dim pl-2">
                          {set.setNumber}
                        </span>
                        <span className="text-xs text-white/40">
                          {set.previousWeight ? `${set.previousWeight}kg` : "-"}
                        </span>
                        {isReadOnly ? (
                          <>
                            <span className="text-xs font-bold text-center text-primary">
                              {set.weight}
                            </span>
                            <span className="text-xs font-bold text-center">{set.reps}</span>
                          </>
                        ) : (
                          <>
                            <input
                              className="bg-surface-highlight border-none rounded text-xs p-1 text-center font-bold text-primary focus:ring-1 focus:ring-primary"
                              type="number"
                              value={set.weight || ""}
                              onChange={(e) =>
                                onUpdateSet(
                                  exercise.id,
                                  set.id,
                                  "weight",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder={set.previousWeight?.toString() || ""}
                            />
                            <input
                              className="bg-surface-highlight border-none rounded text-xs p-1 text-center font-bold focus:ring-1 focus:ring-primary"
                              type="number"
                              value={set.reps || ""}
                              onChange={(e) =>
                                onUpdateSet(
                                  exercise.id,
                                  set.id,
                                  "reps",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              placeholder={set.previousWeight ? "5" : ""}
                            />
                          </>
                        )}
                        <div className="flex items-center justify-between gap-1">
                          {!isReadOnly && (
                            <input
                              type="checkbox"
                              checked={set.status === true}
                              onChange={(e) =>
                                onUpdateSet(
                                  exercise.id,
                                  set.id,
                                  "status",
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 cursor-pointer accent-primary"
                              title="Mark set as completed"
                            />
                          )}
                          {isReadOnly && set.status === true && (
                            <span className="material-symbols-outlined text-xs text-primary">check</span>
                          )}
                          {onDeleteSet && !isReadOnly && (
                            <button
                              onClick={() => onDeleteSet(exercise.id, set.id)}
                              className="opacity-0 group-hover:opacity-100 text-text-dim hover:text-red-400 transition-all"
                              title="Delete set"
                            >
                              <span className="material-symbols-outlined text-xs">delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {!isReadOnly && (
                      <button
                        onClick={() => onAddSet(exercise.id)}
                        className="w-full mt-4 py-2 border border-dashed border-white/10 rounded-lg text-xs font-bold text-text-dim hover:text-white hover:border-white/20 transition-colors"
                      >
                        + ADD SET
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

          {!isReadOnly && (
          <div className="mt-8 space-y-3">
            <button
              onClick={() => onFinishWorkout(workout.id)}
              className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title={canMarkComplete ? "Mark workout as completed" : "Save changes to workout"}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  {canMarkComplete ? "COMPLETING..." : "SAVING..."}
                </span>
              ) : (
                canMarkComplete ? "COMPLETE WORKOUT" : "SAVE WORKOUT"
              )}
            </button>
            {!canMarkComplete && allExercisesDone && hasUnsavedChanges && (
              <p className="text-xs text-center text-text-dim">
                Save your changes to complete the workout
              </p>
            )}
            {!allExercisesDone && (
              <p className="text-xs text-center text-text-dim">
                Mark all sets as done to complete the workout
              </p>
            )}
          </div>
        )}
        {isReadOnly && (
          <div className="mt-8 space-y-3 text-center">
            <div className="bg-primary/10 border border-primary/30 text-primary px-4 py-3 rounded-lg text-xs font-bold uppercase">
              <span className="material-symbols-outlined text-sm align-middle">done_all</span>
              This workout is completed
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </aside>
  );
}
