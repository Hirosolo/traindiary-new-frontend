"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  exportWorkoutDayPlanCode,
  createWorkoutDayPlan,
  deleteWorkoutDayPlan,
  fetchExercises,
  fetchWorkoutTypes,
  fetchWorkoutDayPlans,
  importWorkoutDayPlanFromCode,
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
  const [workoutTypes, setWorkoutTypes] = useState<string[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [exerciseLoadError, setExerciseLoadError] = useState<string | null>(null);

  const [mode, setMode] = useState<PlanManagerMode>("list");
  const [selectedPlan, setSelectedPlan] = useState<ApiWorkoutDayPlan | null>(null);

  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [draftExercises, setDraftExercises] = useState<PlanExerciseDraft[]>([]);
  const [importCode, setImportCode] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const WORKOUT_TYPE_ICONS: Record<string, string> = {
    Push: "fitness_center",
    Pull: "rowing",
    Legs: "foot_bones",
    "Full Body": "accessibility_new",
    Upper: "vertical_align_top",
    Lower: "vertical_align_bottom",
    "Upper Body": "vertical_align_top",
    "Lower Body": "vertical_align_bottom",
    Cardio: "directions_run",
  };

  useEffect(() => {
    if (!isOpen) return;

    const loadPlans = async () => {
      setIsLoading(true);
      try {
        const planData = await fetchWorkoutDayPlans();
        setPlans(planData);
      } catch (error) {
        console.error("Failed to load day plans", error);
      } finally {
        setIsLoading(false);
      }
    };

    const loadExercises = async () => {
      setIsLoadingExercises(true);
      setExerciseLoadError(null);
      try {
        const exerciseData = await fetchExercises();
        setExercises(exerciseData);
      } catch (error) {
        console.error("Failed to load exercises", error);
        setExerciseLoadError(error instanceof Error ? error.message : "Unable to load exercises");
        setExercises([]);
      } finally {
        setIsLoadingExercises(false);
      }
    };

    const loadWorkoutTypes = async () => {
      setIsLoadingTypes(true);
      try {
        const typeData = await fetchWorkoutTypes();
        setWorkoutTypes(typeData);
      } catch (error) {
        console.error("Failed to load workout types", error);
        setWorkoutTypes(["Push", "Pull", "Legs", "Cardio", "Full Body"]);
      } finally {
        setIsLoadingTypes(false);
      }
    };

    void loadPlans();
    void loadExercises();
    void loadWorkoutTypes();
    setMode("list");
    setSelectedPlan(null);
  }, [isOpen]);

  const filteredExercises = useMemo(() => {
    const selectedIds = new Set(draftExercises.map((item) => item.exercise_id));
    const query = search.trim().toLowerCase();
    return exercises.filter((item) => {
      if (selectedIds.has(item.exercise_id)) return false;
      const matchesSearch = !query || item.name.toLowerCase().includes(query);
      const itemCategory = item.category || "Uncategorized";
      const matchesCategory = categoryFilter === "All" || itemCategory === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [exercises, search, categoryFilter, draftExercises]);

  const categories = useMemo(() => {
    const cats = new Set(exercises.map((item) => item.category || "Uncategorized"));
    return ["All", ...Array.from(cats)];
  }, [exercises]);

  const selectedPlanCode = useMemo(() => {
    if (!selectedPlan) return "";
    return exportWorkoutDayPlanCode({
      name: selectedPlan.name,
      type: selectedPlan.type,
      notes: selectedPlan.notes,
      exercises: (selectedPlan.exercises || []).map((item, index) => ({
        exercise_id: item.exercise_id,
        planned_sets: item.planned_sets,
        planned_reps: item.planned_reps,
        sort_order: item.sort_order ?? index,
      })),
    });
  }, [selectedPlan]);

  const startCreate = () => {
    setEditingPlanId(null);
    setName("");
    setType("");
    setNotes("");
    setSearch("");
    setCategoryFilter("All");
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
    setCategoryFilter("All");
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
      setCategoryFilter("All");
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

  const handleImportByCode = async () => {
    if (!importCode.trim()) {
      alert("Paste a plan code first");
      return;
    }

    setIsImporting(true);
    try {
      const imported = await importWorkoutDayPlanFromCode(importCode);
      await refreshPlans();
      setImportCode("");
      setSelectedPlan(imported);
      setMode("view");
    } catch (error) {
      console.error("Failed to import by plan code", error);
      alert(error instanceof Error ? error.message : "Failed to import plan code");
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportPlanCode = async () => {
    if (!selectedPlanCode) return;
    await navigator.clipboard.writeText(selectedPlanCode);
    alert("Plan code copied");
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
              <div className="border border-white/10 rounded-xl p-3 bg-surface-card space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-text-dim font-black">Import By Plan Code</p>
                <div className="flex gap-2">
                  <input
                    value={importCode}
                    onChange={(e) => setImportCode(e.target.value)}
                    placeholder="Paste plan code"
                    className="flex-1 bg-surface-dark border border-white/10 rounded-lg px-3 py-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => void handleImportByCode()}
                    disabled={isImporting}
                    className="px-3 py-2 rounded-lg bg-primary text-white text-xs font-black uppercase tracking-widest disabled:opacity-60"
                  >
                    {isImporting ? "Importing" : "Import"}
                  </button>
                </div>
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
                <div className="mt-3 space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-text-dim font-black">Plan Code</p>
                  <div className="flex gap-2">
                    <input readOnly value={selectedPlanCode} className="flex-1 bg-surface-dark border border-white/10 rounded-lg px-3 py-2 text-xs" />
                    <button
                      type="button"
                      onClick={() => void handleExportPlanCode()}
                      className="px-3 py-2 rounded-lg bg-white/10 text-xs font-black uppercase tracking-widest"
                    >
                      Export
                    </button>
                  </div>
                </div>
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
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-text-dim">Workout Type</h4>
                {isLoadingTypes ? (
                  <div className="text-center py-6 text-text-dim">
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {workoutTypes.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setType(item)}
                        className={`bg-surface-card border rounded-xl p-3 text-left relative transition-colors ${
                          type === item ? "border-primary/40" : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        {type === item && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-[14px] text-primary">check</span>
                          </div>
                        )}
                        <span className={`material-symbols-outlined text-base mb-1 ${type === item ? "text-primary" : "text-text-dim"}`}>
                          {WORKOUT_TYPE_ICONS[item] || "fitness_center"}
                        </span>
                        <p className="text-xs font-black uppercase tracking-wide">{item}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2} className="w-full bg-surface-card border border-white/10 rounded-xl px-3 py-2" />

              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-text-dim">Search & Add Exercises</h4>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search exercise..." className="w-full bg-surface-card border border-white/10 rounded-2xl px-3 py-3" />

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        categoryFilter === cat
                          ? "bg-primary/10 border border-primary/20 text-primary"
                          : "bg-surface-card border border-white/5 text-text-dim"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {isLoadingExercises && (
                    <p className="text-sm text-text-dim">Loading exercises...</p>
                  )}
                  {exerciseLoadError && !isLoadingExercises && (
                    <p className="text-xs text-red-400">{exerciseLoadError}</p>
                  )}
                  {!isLoadingExercises && !exerciseLoadError && filteredExercises.length === 0 && (
                    <p className="text-sm text-text-dim">No exercises available. Try another filter.</p>
                  )}
                  {filteredExercises.map((exercise) => (
                    <div
                      key={exercise.exercise_id}
                      className="bg-surface-card border border-white/10 rounded-2xl p-3 flex items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-highlight flex-shrink-0">
                        {exercise.image ? (
                          <Image
                            src={exercise.image}
                            alt={exercise.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                            <span className="material-symbols-outlined text-zinc-600 text-sm">fitness_center</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-xs uppercase tracking-tight truncate">{exercise.name}</p>
                        <p className="text-[10px] text-text-dim truncate">{exercise.description || "No description"}</p>
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary text-[8px] font-bold uppercase">
                          {exercise.category || "Uncategorized"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => addExercise(exercise)}
                        className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-lg">add</span>
                      </button>
                    </div>
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
