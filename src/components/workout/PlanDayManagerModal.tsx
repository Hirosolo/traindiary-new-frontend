"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createWorkoutDayPlan,
  deleteWorkoutDayPlan,
  fetchExercises,
  fetchWorkoutDayPlans,
  updateWorkoutDayPlan,
  type ApiExercise,
  type ApiWorkoutDayPlan,
} from "@/lib/api/workouts";

type PlanExerciseDraft = {
  exercise_id: number;
  name: string;
  category?: string;
  planned_sets: number;
  planned_reps: number;
};

type PlanManagerMode = "list" | "view" | "edit" | "create";

interface PlanDayManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlanDayManagerModal({ isOpen, onClose }: PlanDayManagerModalProps) {
  const [plans, setPlans] = useState<ApiWorkoutDayPlan[]>([]);
  const [exercises, setExercises] = useState<ApiExercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [mode, setMode] = useState<PlanManagerMode>("list");
  const [selectedPlan, setSelectedPlan] = useState<ApiWorkoutDayPlan | null>(null);

  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [draftExercises, setDraftExercises] = useState<PlanExerciseDraft[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const [planData, exerciseData] = await Promise.all([fetchWorkoutDayPlans(), fetchExercises()]);
        setPlans(planData);
        setExercises(exerciseData);
      } catch (error) {
        console.error("Failed to load day plan manager data", error);
      } finally {
        setIsLoading(false);
      }
    };

    load();
    setMode("list");
    setSelectedPlan(null);
  }, [isOpen]);

  const filteredExercises = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return exercises;
    return exercises.filter((item) => item.name.toLowerCase().includes(query));
  }, [exercises, search]);

  const startCreate = () => {
    setEditingPlanId(null);
    setName("");
    setType("");
    setNotes("");
    setSearch("");
    setDraftExercises([]);
    setMode("create");
  };

  const startEdit = (plan: ApiWorkoutDayPlan) => {
    setEditingPlanId(plan.plan_id);
    setName(plan.name || "");
    setType(plan.type || "");
    setNotes(plan.notes || "");
    setDraftExercises(
      (plan.exercises || []).map((item) => ({
        exercise_id: item.exercise_id,
        name: item.exercise?.name || `Exercise ${item.exercise_id}`,
        category: item.exercise?.category,
        planned_sets: item.planned_sets,
        planned_reps: item.planned_reps,
      }))
    );
    setMode("edit");
  };

  const openView = (plan: ApiWorkoutDayPlan) => {
    setSelectedPlan(plan);
    setMode("view");
  };

  const addExercise = (exercise: ApiExercise) => {
    setDraftExercises((prev) => {
      if (prev.some((item) => item.exercise_id === exercise.exercise_id)) return prev;
      return [
        ...prev,
        {
          exercise_id: exercise.exercise_id,
          name: exercise.name,
          category: exercise.category,
          planned_sets: 3,
          planned_reps: 10,
        },
      ];
    });
  };

  const updateDraftExercise = (exerciseId: number, patch: Partial<PlanExerciseDraft>) => {
    setDraftExercises((prev) => prev.map((item) => (item.exercise_id === exerciseId ? { ...item, ...patch } : item)));
  };

  const removeDraftExercise = (exerciseId: number) => {
    setDraftExercises((prev) => prev.filter((item) => item.exercise_id !== exerciseId));
  };

  const refreshPlans = async () => {
    const latest = await fetchWorkoutDayPlans();
    setPlans(latest);
    if (selectedPlan) {
      const refreshed = latest.find((item) => item.plan_id === selectedPlan.plan_id) || null;
      setSelectedPlan(refreshed);
    }
  };

  const savePlan = async () => {
    if (!name.trim()) {
      alert("Please provide a plan name");
      return;
    }
    if (draftExercises.length === 0) {
      alert("Please add at least one exercise");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        type: type.trim() || null,
        notes: notes.trim() || null,
        exercises: draftExercises.map((item, index) => ({
          exercise_id: item.exercise_id,
          planned_sets: item.planned_sets,
          planned_reps: item.planned_reps,
          sort_order: index,
        })),
      };

      if (editingPlanId) {
        await updateWorkoutDayPlan(editingPlanId, payload);
      } else {
        await createWorkoutDayPlan(payload);
      }

      await refreshPlans();
      setMode("list");
      setSelectedPlan(null);
      setEditingPlanId(null);
      setName("");
      setType("");
      setNotes("");
      setSearch("");
      setDraftExercises([]);
    } catch (error) {
      console.error("Failed to save day plan", error);
      alert(error instanceof Error ? error.message : "Failed to save day plan");
    } finally {
      setIsSaving(false);
    }
  };

  const removePlan = async (planId: number) => {
    if (!confirm("Delete this day plan?")) return;
    try {
      await deleteWorkoutDayPlan(planId);
      await refreshPlans();
      if (editingPlanId === planId) {
        setMode("list");
        setEditingPlanId(null);
      }
      if (selectedPlan?.plan_id === planId) setSelectedPlan(null);
    } catch (error) {
      console.error("Failed to delete day plan", error);
      alert(error instanceof Error ? error.message : "Failed to delete day plan");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center">
      <div className="w-full max-w-5xl max-h-[90vh] bg-surface-dark border border-white/10 rounded-3xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold uppercase tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">calendar_month</span>
              Plan Day Manager
            </h2>
            <p className="text-text-dim text-[10px] uppercase tracking-widest mt-1">Template only: no date, no set status, no weight logging</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-surface-card border border-white/10">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {mode === "list" && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-text-dim">Saved Plans</h3>
                <button onClick={startCreate} className="text-xs font-black uppercase tracking-widest text-primary">Create</button>
              </div>
              <div className="space-y-2">
                {isLoading && <p className="text-sm text-text-dim">Loading plans...</p>}
                {!isLoading && plans.length === 0 && <p className="text-sm text-text-dim">No day plans yet.</p>}
                {plans.map((plan) => (
                  <button
                    key={plan.plan_id}
                    onClick={() => openView(plan)}
                    className="w-full text-left border border-white/10 rounded-xl p-3 bg-surface-card hover:border-white/20 transition-colors"
                  >
                    <p className="font-bold text-sm">{plan.name}</p>
                    <p className="text-[10px] text-text-dim uppercase tracking-wider mt-1">{plan.type || "General"} · {plan.exercises?.length || 0} exercises</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {mode === "view" && selectedPlan && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <button onClick={() => setMode("list")} className="text-xs uppercase font-black text-text-dim">Back</button>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(selectedPlan)} className="text-xs uppercase font-black text-primary">Edit</button>
                  <button onClick={() => void removePlan(selectedPlan.plan_id)} className="text-xs uppercase font-black text-red-400">Delete</button>
                </div>
              </div>
              <div className="border border-white/10 rounded-xl p-4 bg-surface-card">
                <h3 className="text-lg font-bold">{selectedPlan.name}</h3>
                <p className="text-[11px] text-text-dim uppercase tracking-wider mt-1">{selectedPlan.type || "General"}</p>
                {selectedPlan.notes ? <p className="text-sm text-text-dim mt-2">{selectedPlan.notes}</p> : null}
              </div>
              <div className="space-y-2">
                {(selectedPlan.exercises || []).map((item) => (
                  <div key={item.plan_exercise_id} className="border border-white/10 rounded-xl p-3 bg-surface-card flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{item.exercise?.name || `Exercise ${item.exercise_id}`}</p>
                      <p className="text-[10px] text-text-dim uppercase">{item.exercise?.category || "General"}</p>
                    </div>
                    <p className="text-[11px] text-text-dim uppercase tracking-wider">{item.planned_sets} sets · {item.planned_reps} reps</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(mode === "edit" || mode === "create") && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-text-dim">{mode === "create" ? "Create Plan" : "Edit Plan"}</h3>
                <button onClick={() => setMode("list")} className="text-xs uppercase font-black text-text-dim">Back</button>
              </div>

              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Plan name" className="w-full bg-surface-card border border-white/10 rounded-xl px-3 py-2" />
              <input value={type} onChange={(e) => setType(e.target.value)} placeholder="Workout type (optional)" className="w-full bg-surface-card border border-white/10 rounded-xl px-3 py-2" />
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2} className="w-full bg-surface-card border border-white/10 rounded-xl px-3 py-2" />

              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-text-dim">Search & Add Exercises</h4>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search exercise..." className="w-full bg-surface-card border border-white/10 rounded-xl px-3 py-2" />
                <div className="max-h-36 overflow-y-auto border border-white/10 rounded-xl p-2 space-y-1">
                  {filteredExercises.slice(0, 40).map((exercise) => (
                    <button
                      key={exercise.exercise_id}
                      type="button"
                      onClick={() => addExercise(exercise)}
                      className="w-full text-left px-2 py-2 rounded-lg hover:bg-white/5 flex items-center justify-between"
                    >
                      <span className="text-sm">{exercise.name}</span>
                      <span className="text-[10px] uppercase text-text-dim">{exercise.category || "General"}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {draftExercises.map((item) => (
                  <div key={item.exercise_id} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center border border-white/10 rounded-xl p-2">
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-[10px] text-text-dim uppercase">{item.category || "General"}</p>
                    </div>
                    <input
                      type="number"
                      min={1}
                      value={item.planned_sets}
                      onChange={(e) => updateDraftExercise(item.exercise_id, { planned_sets: Math.max(1, Number(e.target.value) || 1) })}
                      className="w-14 bg-surface-card border border-white/10 rounded-lg px-2 py-1 text-center"
                    />
                    <input
                      type="number"
                      min={0}
                      value={item.planned_reps}
                      onChange={(e) => updateDraftExercise(item.exercise_id, { planned_reps: Math.max(0, Number(e.target.value) || 0) })}
                      className="w-14 bg-surface-card border border-white/10 rounded-lg px-2 py-1 text-center"
                    />
                    <button onClick={() => removeDraftExercise(item.exercise_id)} className="text-xs text-red-400">Del</button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => {
                  if (mode === "create") {
                    startCreate();
                  } else if (selectedPlan) {
                    startEdit(selectedPlan);
                  }
                }} className="px-3 py-2 rounded-lg bg-surface-card border border-white/10 text-xs uppercase font-black">Reset</button>
                <button onClick={() => void savePlan()} disabled={isSaving} className="px-3 py-2 rounded-lg bg-primary text-white text-xs uppercase font-black">
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
