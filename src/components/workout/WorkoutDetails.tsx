"use client";

import { useState } from "react";

export interface ExerciseSet {
  id: string;
  setNumber: number;
  previousWeight?: number;
  weight: number;
  reps: number;
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
  exercises: Exercise[];
  isCompleted: boolean;
}

interface WorkoutDetailsProps {
  workout: WorkoutDetailsData | null;
  onClose: () => void;
  onFinishWorkout: (workoutId: string) => void;
  onUpdateSet: (exerciseId: string, setId: string, field: "weight" | "reps", value: number) => void;
  onAddSet: (exerciseId: string) => void;
}

export default function WorkoutDetails({
  workout,
  onClose,
  onFinishWorkout,
  onUpdateSet,
  onAddSet,
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

  return (
    <aside className="w-full lg:w-[400px] border-l border-white/5 bg-surface-dark overflow-y-auto">
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <h3 className="text-lg lg:text-xl font-display font-bold">Workout Details</h3>
          <button
            onClick={onClose}
            className="text-text-dim hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

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
            const isViewOnly = workout.isCompleted || exercise.isLocked;

            return (
              <div
                key={exercise.id}
                className={`bg-surface-card rounded-2xl p-5 border border-white/5 ${
                  exercise.isLocked && !workout.isCompleted ? "opacity-60" : ""
                }`}
              >
                <div
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => !exercise.isLocked && toggleExercise(exercise.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-white">{exercise.name}</h5>
                      {!exercise.isLocked && (
                        <span className="material-symbols-outlined text-sm text-text-dim">
                          {isExpanded ? "expand_less" : "expand_more"}
                        </span>
                      )}
                    </div>
                    {exercise.lastPerformance && (
                      <p className="text-[10px] text-text-dim font-bold uppercase mt-1">
                        Last: {exercise.lastPerformance}
                      </p>
                    )}
                    {exercise.isLocked && !workout.isCompleted && (
                      <p className="text-[10px] text-text-dim font-bold uppercase mt-1">
                        Next Exercise
                      </p>
                    )}
                  </div>
                  <button className="text-text-dim">
                    {exercise.isLocked && !workout.isCompleted ? (
                      <span className="material-symbols-outlined text-sm">lock</span>
                    ) : (
                      <span className="material-symbols-outlined text-sm">more_vert</span>
                    )}
                  </button>
                </div>

                {isExpanded && !exercise.isLocked && (
                  <div className="mt-4 space-y-2">
                    <div className="grid grid-cols-4 gap-2 text-[10px] font-bold text-text-dim uppercase tracking-tighter px-2">
                      <span>Set</span>
                      <span>Prev</span>
                      <span>Weight</span>
                      <span>Reps</span>
                    </div>

                    {exercise.sets.map((set) => (
                      <div
                        key={set.id}
                        className="grid grid-cols-4 gap-2 items-center bg-background-dark p-2 rounded-lg border border-white/5"
                      >
                        <span className="text-xs font-bold text-text-dim pl-2">
                          {set.setNumber}
                        </span>
                        <span className="text-xs text-white/40">
                          {set.previousWeight ? `${set.previousWeight}kg` : "-"}
                        </span>
                        {isViewOnly ? (
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
                      </div>
                    ))}

                    {!isViewOnly && (
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

        {!workout.isCompleted && (
          <div className="mt-8">
            <button
              onClick={() => onFinishWorkout(workout.id)}
              className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
            >
              FINISH WORKOUT
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
