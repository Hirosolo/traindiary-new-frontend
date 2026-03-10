const API_BASE = (process.env.NEXT_PUBLIC_API_HOST || "").replace(/\/$/, "");
const API_PREFIX = API_BASE.endsWith("/api") ? API_BASE : `${API_BASE}/api`;

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;
  const token = getAuthToken();
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    let message = result.message || result.errors?.[0]?.message || `Request failed with ${response.status}`;
    throw new Error(message);
  }

  return result.data as T;
}

export interface ApiExercise {
  exercise_id: number;
  name: string;
  category?: string;
  description?: string;
  image?: string;
  type?: string;
  personal_records?: {
    weight_kg: number;
    reps: number;
    achieved_at: string;
  }[];
}

export interface ApiExerciseLog {
  set_id?: number; // New schema uses set_id
  log_id?: number; // Legacy support
  session_detail_id?: number;
  actual_sets?: number;
  actual_reps?: number;
  reps?: number; // New schema uses reps
  duration?: number;
  weight_kg?: number;
  rep?: number; // for creation payload consistency
  status?: boolean | string; // Can be boolean (legacy) or 'COMPLETED'/'UNFINISHED' (new)
  log_timestamp?: string;
  notes?: string;
}

export interface ApiSessionDetail {
  session_detail_id?: number;
  exercise_id?: number;
  planned_sets?: number;
  planned_reps?: number;
  exercises?: ApiExercise;
  exercise_logs?: ApiExerciseLog[];
  personal_record?: {
    weight_kg: number;
    reps: number;
    achieved_at?: string;
  } | null;
}

export interface ApiSessionDetailsResponse {
  details: ApiSessionDetail[];
  logs: ApiExerciseLog[];
}

export interface ApiWorkoutSession {
  session_id?: number;
  user_id?: number;
  scheduled_date: string;
  completed?: boolean;
  status?: string; // e.g. 'PENDING', 'COMPLETED'
  notes?: string | null;
  type?: string | null;
  session_details?: ApiSessionDetail[];
}

export interface ApiWorkoutDayPlanExercise {
  plan_exercise_id: number;
  exercise_id: number;
  planned_sets: number;
  planned_reps: number;
  sort_order?: number;
  exercise?: {
    exercise_id: number;
    name: string;
    category?: string;
    type?: string;
  };
}

export interface ApiWorkoutDayPlan {
  plan_id: number;
  user_id: number;
  name: string;
  type?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  exercises: ApiWorkoutDayPlanExercise[];
}

export type PlanHashPayload = {
  name: string;
  type?: string | null;
  notes?: string | null;
  exercises: Array<{
    exercise_id: number;
    planned_sets: number;
    planned_reps: number;
    sort_order: number;
  }>;
};

export type ApiWorkoutSessionsResponse = ApiWorkoutSession[] | { sessions: ApiWorkoutSession[] };

// ─── Workout Sessions Monthly Cache Helpers ──────────────────────────────────

function workoutsCacheKey(month: string, userId: number | string) {
  return `workouts_month_${month}_${userId}`;
}
function workoutsFetchedKey(month: string, userId: number | string) {
  return `workouts_fetched_${month}_${userId}`;
}

function getTodayDateStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getWorkoutsMonthCache(month: string, userId: number | string): ApiWorkoutSession[] | null {
  if (typeof window === 'undefined') return null;
  const fetched = localStorage.getItem(workoutsFetchedKey(month, userId));
  if (fetched !== getTodayDateStr()) return null;
  const raw = localStorage.getItem(workoutsCacheKey(month, userId));
  if (!raw) return null;
  try { return JSON.parse(raw) as ApiWorkoutSession[]; } catch { return null; }
}

function setWorkoutsMonthCache(month: string, userId: number | string, sessions: ApiWorkoutSession[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(workoutsCacheKey(month, userId), JSON.stringify(sessions));
  localStorage.setItem(workoutsFetchedKey(month, userId), getTodayDateStr());
}

export function updateWorkoutsMonthCache(
  month: string,
  userId: number | string,
  updater: (sessions: ApiWorkoutSession[]) => ApiWorkoutSession[]
): void {
  const cached = getWorkoutsMonthCache(month, userId) ?? [];
  setWorkoutsMonthCache(month, userId, updater(cached));
}

export function invalidateWorkoutsMonthCache(month: string, userId: number | string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(workoutsCacheKey(month, userId));
  localStorage.removeItem(workoutsFetchedKey(month, userId));
}

// ─────────────────────────────────────────────────────────────────────────────

export async function fetchWorkoutSessions(
  userId: number,
  month?: string,
  date?: string,
  forceRefresh = false
): Promise<ApiWorkoutSessionsResponse> {
  const targetMonth = month ?? getTodayDateStr().slice(0, 7);

  if (forceRefresh) {
    invalidateWorkoutsMonthCache(targetMonth, userId);
  }

  // Try the daily cache first
  const cached = forceRefresh ? null : getWorkoutsMonthCache(targetMonth, userId);
  if (cached) {
    console.log('[fetchWorkoutSessions] served from cache', { targetMonth, count: cached.length });
    return cached as ApiWorkoutSessionsResponse;
  }

  // Cache miss or stale → fetch full month
  const params = new URLSearchParams();
  params.append('month', targetMonth);
  if (date) params.append('date', date);
  console.log('[fetchWorkoutSessions] fetching from network', { userId, targetMonth });
  const data = await apiFetch<ApiWorkoutSessionsResponse>(`/workouts?${params.toString()}`);

  const sessionsArray: ApiWorkoutSession[] = Array.isArray(data)
    ? data
    : (data as { sessions: ApiWorkoutSession[] }).sessions ?? [];

  setWorkoutsMonthCache(targetMonth, userId, sessionsArray);
  return sessionsArray as ApiWorkoutSessionsResponse;
}

export async function fetchWorkoutSessionById(
  sessionId: string | number
): Promise<ApiWorkoutSession | null> {
  try {
    return await apiFetch<ApiWorkoutSession>(`/workouts/${sessionId}`);
  } catch (error) {
    console.error("Failed to fetch session by ID", error);
    return null;
  }
}

export async function createWorkoutSession(payload: {
  userId: number;
  scheduledDate: string;
  type?: string | null;
  notes?: string | null;
  planId?: number | null;
  exercises?: Array<{
    exercise_id: string | number;
    actual_sets: number;
    actual_reps: number;
    weight_kg: number;
    duration?: number;
  }>;
}) {
  const result = await apiFetch<{ session_id?: number; id?: number }>(`/workouts`, {
    method: "POST",
    body: JSON.stringify({
      scheduled_date: payload.scheduledDate,
      type: payload.type,
      notes: payload.notes,
      plan_id: payload.planId,
      exercises: payload.exercises?.map(ex => ({
        exercise_id: Number(ex.exercise_id),
        actual_sets: Number(ex.actual_sets),
        actual_reps: Number(ex.actual_reps),
        weight_kg: Number(ex.weight_kg),
        duration: ex.duration !== undefined ? Number(ex.duration) : undefined,
      })),
    }),
  });

  // Invalidate summary cache for the month of the scheduled date
  const userId = getUserIdFromToken() ?? 'anon';
  invalidateSummaryCache(payload.scheduledDate.slice(0, 7), userId);

  return result;
}

export async function addPlannedExercises(payload: {
  sessionId: string | number;
  exercises: Array<{
    exercise_id: string | number;
    planned_sets?: number;
    planned_reps?: number;
  }>
}) {
  const result = await apiFetch(`/workouts/${payload.sessionId}/session-details`, {
    method: "POST",
    body: JSON.stringify({
      exercises: payload.exercises,
    }),
  });

  // Invalidate summary cache for today's month (simplest assumption)
  const userId = getUserIdFromToken() ?? 'anon';
  invalidateSummaryCache(getTodayDateStr().slice(0, 7), userId);

  return result;
}

export async function fetchWorkoutDayPlans(): Promise<ApiWorkoutDayPlan[]> {
  const userId = getUserIdFromToken() ?? "anon";
  const cached = getWorkoutDayPlansCache(userId);
  if (cached) {
    return cached;
  }

  const plans = await apiFetch<ApiWorkoutDayPlan[]>('/workout-day-plans');
  setWorkoutDayPlansCache(userId, plans);
  return plans;
}

export async function createWorkoutDayPlan(payload: {
  name: string;
  type?: string | null;
  notes?: string | null;
  exercises: Array<{
    exercise_id: string | number;
    planned_sets: number;
    planned_reps: number;
    sort_order?: number;
  }>;
}): Promise<ApiWorkoutDayPlan> {
  const userId = getUserIdFromToken() ?? "anon";
  const created = await apiFetch<ApiWorkoutDayPlan>('/workout-day-plans', {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name,
      type: payload.type,
      notes: payload.notes,
      exercises: payload.exercises.map((item, index) => ({
        exercise_id: Number(item.exercise_id),
        planned_sets: Number(item.planned_sets),
        planned_reps: Number(item.planned_reps),
        sort_order: item.sort_order ?? index,
      })),
    }),
  });

  updateWorkoutDayPlansCache(userId, (plans) => [created, ...plans]);
  return created;
}

export async function updateWorkoutDayPlan(
  planId: number | string,
  payload: {
    name: string;
    type?: string | null;
    notes?: string | null;
    exercises: Array<{
      exercise_id: string | number;
      planned_sets: number;
      planned_reps: number;
      sort_order?: number;
    }>;
  }
): Promise<ApiWorkoutDayPlan> {
  const userId = getUserIdFromToken() ?? "anon";
  const updated = await apiFetch<ApiWorkoutDayPlan>(`/workout-day-plans/${planId}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: payload.name,
      type: payload.type,
      notes: payload.notes,
      exercises: payload.exercises.map((item, index) => ({
        exercise_id: Number(item.exercise_id),
        planned_sets: Number(item.planned_sets),
        planned_reps: Number(item.planned_reps),
        sort_order: item.sort_order ?? index,
      })),
    }),
  });

  updateWorkoutDayPlansCache(userId, (plans) => {
    const next = plans.map((plan) =>
      Number(plan.plan_id) === Number(updated.plan_id) ? updated : plan
    );

    if (next.some((plan) => Number(plan.plan_id) === Number(updated.plan_id))) {
      return next;
    }

    return [updated, ...next];
  });
  return updated;
}

export async function deleteWorkoutDayPlan(planId: number | string): Promise<{ plan_id: number }> {
  const userId = getUserIdFromToken() ?? "anon";
  const deleted = await apiFetch<{ plan_id: number }>(`/workout-day-plans/${planId}`, {
    method: 'DELETE',
  });

  updateWorkoutDayPlansCache(userId, (plans) =>
    plans.filter((plan) => Number(plan.plan_id) !== Number(deleted.plan_id))
  );
  return deleted;
}

function fnv1aHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function toBase64Url(input: string): string {
  if (typeof window === "undefined") return "";
  const encoded = btoa(unescape(encodeURIComponent(input)));
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return decodeURIComponent(escape(atob(padded)));
}

export function buildWorkoutDayPlanHash(plan: {
  name: string;
  type?: string | null;
  notes?: string | null;
  exercises: Array<{
    exercise_id: number;
    planned_sets: number;
    planned_reps: number;
    sort_order?: number;
  }>;
}): string {
  const payload: PlanHashPayload = {
    name: plan.name,
    type: plan.type ?? null,
    notes: plan.notes ?? null,
    exercises: plan.exercises
      .map((item, index) => ({
        exercise_id: Number(item.exercise_id),
        planned_sets: Number(item.planned_sets),
        planned_reps: Number(item.planned_reps),
        sort_order: Number(item.sort_order ?? index),
      }))
      .sort((a, b) => a.sort_order - b.sort_order),
  };

  const payloadStr = JSON.stringify(payload);
  const checksum = fnv1aHash(payloadStr);
  return `tdp1.${checksum}.${toBase64Url(payloadStr)}`;
}

export function parseWorkoutDayPlanHash(hash: string): PlanHashPayload | null {
  const input = hash.trim();
  if (!input.startsWith("tdp1.")) return null;
  const parts = input.split(".");
  if (parts.length !== 3) return null;

  const checksum = parts[1];
  const payloadStr = fromBase64Url(parts[2]);
  if (fnv1aHash(payloadStr) !== checksum) return null;

  const parsed = JSON.parse(payloadStr) as PlanHashPayload;
  if (!parsed?.name || !Array.isArray(parsed.exercises)) return null;
  return parsed;
}

export async function importWorkoutDayPlanFromHash(hash: string): Promise<ApiWorkoutDayPlan> {
  const parsed = parseWorkoutDayPlanHash(hash);
  if (!parsed) {
    throw new Error("Invalid plan code");
  }

  return createWorkoutDayPlan({
    name: parsed.name,
    type: parsed.type ?? null,
    notes: parsed.notes ?? null,
    exercises: parsed.exercises,
  });
}

export function exportWorkoutDayPlanCode(plan: {
  name: string;
  type?: string | null;
  notes?: string | null;
  exercises: Array<{
    exercise_id: number;
    planned_sets: number;
    planned_reps: number;
    sort_order?: number;
  }>;
}): string {
  return buildWorkoutDayPlanHash(plan);
}

export function parseWorkoutDayPlanCode(code: string): PlanHashPayload | null {
  return parseWorkoutDayPlanHash(code);
}

export async function importWorkoutDayPlanFromCode(code: string): Promise<ApiWorkoutDayPlan> {
  return importWorkoutDayPlanFromHash(code);
}

export async function updateExerciseLog(payload: {
  logId: string | number;
  actualReps?: number;
  duration?: number;
  weight_kg?: number | null;
  status?: boolean;
}) {
  const result = await apiFetch(`/workouts/logs`, {
    method: "PUT",
    body: JSON.stringify({
      log_id: Number(payload.logId),
      actual_reps: payload.actualReps,
      duration: payload.duration,
      weight_kg: payload.weight_kg,
      status: payload.status,
    }),
  });

  // Invalidate summary cache
  const userId = getUserIdFromToken() ?? 'anon';
  invalidateSummaryCache(getTodayDateStr().slice(0, 7), userId);

  return result;
}

export async function logExerciseSet(payload: {
  sessionDetailId: string | number;
  actualReps?: number;
  duration?: number;
  weight_kg?: number;
  status?: boolean;
}) {
  const result = await apiFetch(`/workouts/logs`, {
    method: "POST",
    body: JSON.stringify({
      session_detail_id: Number(payload.sessionDetailId),
      actual_reps: payload.actualReps,
      duration: payload.duration,
      weight_kg: payload.weight_kg,
    }),
  });

  // Invalidate summary cache
  const userId = getUserIdFromToken() ?? 'anon';
  invalidateSummaryCache(getTodayDateStr().slice(0, 7), userId);

  return result;
}

export async function syncWorkoutLogs(sessionId: string | number, logs: any[]) {
  const result = await apiFetch(`/workouts/logs/sync`, {
    method: "POST",
    body: JSON.stringify({ sessionId, logs }),
  });
  
  // Invalidate summary cache for today's month
  const userId = getUserIdFromToken() ?? 'anon';
  invalidateSummaryCache(getTodayDateStr().slice(0, 7), userId);
  
  return result;
}

export async function completeWorkoutSession(sessionId: string | number) {
  const result = await apiFetch(`/workouts/${sessionId}`, {
    method: "PUT",
    body: JSON.stringify({ status: 'COMPLETED' }),
  });

  // Invalidate summary cache for today's month
  const userId = getUserIdFromToken() ?? 'anon';
  invalidateSummaryCache(getTodayDateStr().slice(0, 7), userId);

  return result;
}

export async function setWorkoutSessionStatus(
  sessionId: string | number,
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'UNFINISHED' | 'MISSED'
) {
  const result = await apiFetch(`/workouts/${sessionId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

  const userId = getUserIdFromToken() ?? 'anon';
  invalidateSummaryCache(getTodayDateStr().slice(0, 7), userId);

  return result;
}

export async function updateSessionDetailStatus(
  sessionDetailId: string | number,
  status: boolean
) {
  return apiFetch(`/workout-sessions`, {
    method: "PUT",
    body: JSON.stringify({ session_detail_id: sessionDetailId, status }),
  });
}

export async function updateSessionDetailPlannedSets(
  sessionDetailId: string | number,
  plannedSets: number,
  plannedReps: number
) {
  return apiFetch(`/workout-sessions`, {
    method: "PUT",
    body: JSON.stringify({ 
      session_detail_id: sessionDetailId, 
      planned_sets: plannedSets,
      planned_reps: plannedReps 
    }),
  });
}

export async function deleteWorkoutSession(sessionId: string | number) {
  const result = await apiFetch(`/workouts/${sessionId}`, {
    method: "DELETE",
  });

  // Invalidate summary cache for today's month
  const userId = getUserIdFromToken() ?? 'anon';
  invalidateSummaryCache(getTodayDateStr().slice(0, 7), userId);

  return result;
}

export async function deleteSessionDetail(sessionId: string | number, sessionDetailId: string | number) {
  return apiFetch(`/workouts/${sessionId}/session-details`, {
    method: "DELETE",
    body: JSON.stringify({ session_detail_id: sessionDetailId }),
  });
}

export async function deleteExerciseLog(logId: string | number) {
  return apiFetch(`/workout-sessions`, {
    method: "DELETE",
    body: JSON.stringify({ log_id: logId }),
  });
}

const EXERCISES_VERSION_KEY = 'exercises_version';
const EXERCISES_DATA_KEY = 'exercises_data';
const PERSONAL_RECORDS_CACHE_KEY = 'personal_records_cache';
const PERSONAL_RECORDS_FETCHED_KEY = 'personal_records_fetched';
const WORKOUT_DAY_PLANS_CACHE_KEY = 'workout_day_plans_cache';
const WORKOUT_DAY_PLANS_FETCHED_KEY = 'workout_day_plans_fetched';

function getTodayVersion(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = String(now.getFullYear());
  return `${dd}${mm}${yyyy}`;
}

function setPersonalRecordsCache(exercises: ApiExercise[]): void {
  if (typeof window === 'undefined') return;

  const recordMap: Record<string, { weight_kg: number; reps: number; achieved_at?: string }> = {};
  exercises.forEach((exercise) => {
    const top = (exercise.personal_records || [])[0];
    if (!top) return;
    recordMap[String(exercise.exercise_id)] = {
      weight_kg: Number(top.weight_kg || 0),
      reps: Number(top.reps || 0),
      achieved_at: top.achieved_at,
    };
  });

  localStorage.setItem(PERSONAL_RECORDS_CACHE_KEY, JSON.stringify(recordMap));
  localStorage.setItem(PERSONAL_RECORDS_FETCHED_KEY, getTodayDateStr());
}

export function getCachedPersonalRecord(exerciseId: number | string): { weight_kg: number; reps: number; achieved_at?: string } | null {
  if (typeof window === 'undefined') return null;
  const fetched = localStorage.getItem(PERSONAL_RECORDS_FETCHED_KEY);
  if (fetched !== getTodayDateStr()) return null;

  const raw = localStorage.getItem(PERSONAL_RECORDS_CACHE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Record<string, { weight_kg: number; reps: number; achieved_at?: string }>;
    return parsed[String(exerciseId)] ?? null;
  } catch {
    return null;
  }
}

function getWorkoutDayPlansCache(userId: number | string): ApiWorkoutDayPlan[] | null {
  if (typeof window === 'undefined') return null;
  const fetched = localStorage.getItem(`${WORKOUT_DAY_PLANS_FETCHED_KEY}_${userId}`);
  if (fetched !== getTodayDateStr()) return null;

  const raw = localStorage.getItem(`${WORKOUT_DAY_PLANS_CACHE_KEY}_${userId}`);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ApiWorkoutDayPlan[];
  } catch {
    return null;
  }
}

function setWorkoutDayPlansCache(userId: number | string, plans: ApiWorkoutDayPlan[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${WORKOUT_DAY_PLANS_CACHE_KEY}_${userId}`, JSON.stringify(plans));
  localStorage.setItem(`${WORKOUT_DAY_PLANS_FETCHED_KEY}_${userId}`, getTodayDateStr());
}

function updateWorkoutDayPlansCache(
  userId: number | string,
  updater: (plans: ApiWorkoutDayPlan[]) => ApiWorkoutDayPlan[]
): void {
  const current = getWorkoutDayPlansCache(userId) ?? [];
  setWorkoutDayPlansCache(userId, updater(current));
}

export function invalidateWorkoutDayPlansCache(userId: number | string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${WORKOUT_DAY_PLANS_CACHE_KEY}_${userId}`);
  localStorage.removeItem(`${WORKOUT_DAY_PLANS_FETCHED_KEY}_${userId}`);
}

export async function fetchExercises(): Promise<ApiExercise[]> {
  if (typeof window === 'undefined') {
    const raw = await apiFetch<unknown>(`/exercises`);
    if (Array.isArray(raw)) return raw as ApiExercise[];
    if (raw && typeof raw === 'object') {
      const nested = (raw as Record<string, unknown>).data;
      if (Array.isArray(nested)) return nested as ApiExercise[];
    }
    return [];
  }

  const storedVersion = localStorage.getItem(EXERCISES_VERSION_KEY);
  const storedDataStr = localStorage.getItem(EXERCISES_DATA_KEY);
  let localExercises: ApiExercise[] = [];

  if (storedDataStr) {
    try {
      localExercises = JSON.parse(storedDataStr);
    } catch {
      localExercises = [];
    }
  }

  // Fetch updates from backend
  const params = storedVersion ? `?version=${storedVersion}` : '';
  const result = await apiFetch<{ changed: 0 | 1; version: string; data?: ApiExercise[] }>(`/exercises${params}`);

  if (result.changed === 1 && result.data) {
    let updatedExercises: ApiExercise[];

    if (localExercises.length === 0) {
      // First time loading - take all data
      updatedExercises = result.data;
    } else {
      // Merge delta updates: Replace or add items based on exercise_id
      const exerciseMap = new Map(localExercises.map(ex => [ex.exercise_id, ex]));
      result.data.forEach(newEx => {
        exerciseMap.set(newEx.exercise_id, newEx);
      });
      updatedExercises = Array.from(exerciseMap.values());
    }

    // Sort by name for consistency
    updatedExercises.sort((a, b) => a.name.localeCompare(b.name));

    localStorage.setItem(EXERCISES_VERSION_KEY, result.version);
    localStorage.setItem(EXERCISES_DATA_KEY, JSON.stringify(updatedExercises));
    setPersonalRecordsCache(updatedExercises);
    return updatedExercises;
  } else {
    // Data unchanged: if local cache is empty, perform full fetch to avoid blank state.
    if (localExercises.length === 0) {
      const full = await apiFetch<unknown>(`/exercises`);
      let resolved: ApiExercise[] = [];

      if (Array.isArray(full)) {
        resolved = full as ApiExercise[];
      } else if (full && typeof full === 'object') {
        const nested = (full as Record<string, unknown>).data;
        if (Array.isArray(nested)) resolved = nested as ApiExercise[];
      }

      resolved.sort((a, b) => a.name.localeCompare(b.name));
      localStorage.setItem(EXERCISES_VERSION_KEY, result.version);
      localStorage.setItem(EXERCISES_DATA_KEY, JSON.stringify(resolved));
      setPersonalRecordsCache(resolved);
      return resolved;
    }

    localStorage.setItem(EXERCISES_VERSION_KEY, result.version);
    setPersonalRecordsCache(localExercises);
    return localExercises;
  }
}

const BASIC_WORKOUT_TYPES = ["Push", "Pull", "Legs", "Cardio", "Full Body"];

export async function fetchWorkoutTypes(): Promise<string[]> {
  try {
    const response = await apiFetch<{ types: string[] }>(`/workout-sessions/types`);
    const types = response.types ?? [];
    // Always include basic types plus any unique values from API
    const merged = Array.from(new Set([...BASIC_WORKOUT_TYPES, ...types.filter(Boolean)]));
    return merged.length > 0 ? merged : BASIC_WORKOUT_TYPES;
  } catch (error) {
    console.warn("Failed to fetch workout types from API, using defaults", error);
    return BASIC_WORKOUT_TYPES;
  }
}

export interface GrScore {
  date: string;
  gr_score: number;
}

export async function fetchProgress(userId: number, year: number, month: number): Promise<GrScore[]> {
  return apiFetch<GrScore[]>(`/progress?user_id=${userId}&year=${year}&month=${month}`);
}

export interface SummaryPayload {
  total_workouts: number;
  total_volume?: number;
  avg_intensity?: number;
  gr_score: number;
  gr_score_change?: number;
  longest_streak?: number;
  muscle_split?: Array<{ name: string; value: number }>;
  calories_avg?: number;
  protein_avg?: number;
  carbs_avg?: number;
  fats_avg?: number;
  daily_data?: any[];
  exercise_data?: Array<{ 
    name: string; 
    count: number; 
    volume: number;
    history: Array<{ date: string; weight: number; reps: number }>;
  }>;
}

// ─── Summary Monthly Cache Helpers ───────────────────────────────────────────

function summaryCacheKey(month: string, userId: number | string) {
  return `summary_month_${month}_${userId}`;
}
function summaryFetchedKey(month: string, userId: number | string) {
  return `summary_fetched_${month}_${userId}`;
}

function getSummaryCache(month: string, userId: number | string): SummaryPayload | null {
  if (typeof window === 'undefined') return null;
  const fetched = localStorage.getItem(summaryFetchedKey(month, userId));
  if (fetched !== getTodayDateStr()) return null;
  const raw = localStorage.getItem(summaryCacheKey(month, userId));
  if (!raw) return null;
  try { return JSON.parse(raw) as SummaryPayload; } catch { return null; }
}

function setSummaryCache(month: string, userId: number | string, summary: SummaryPayload): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(summaryCacheKey(month, userId), JSON.stringify(summary));
  localStorage.setItem(summaryFetchedKey(month, userId), getTodayDateStr());
}

export function invalidateSummaryCache(month: string, userId: number | string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(summaryCacheKey(month, userId));
  localStorage.removeItem(summaryFetchedKey(month, userId));
}

// ─────────────────────────────────────────────────────────────────────────────

export async function fetchSummary(month: string, forceRefresh = false): Promise<SummaryPayload> {
  const userId = getUserIdFromToken() ?? 'anon';

  if (forceRefresh) {
    invalidateSummaryCache(month, userId);
  }
  
  const cached = forceRefresh ? null : getSummaryCache(month, userId);
  if (cached) {
    console.log('[fetchSummary] served from cache', { month });
    return cached;
  }

  const data = await apiFetch<SummaryPayload>(`/summary?month=${month}`);
  if (data) {
    setSummaryCache(month, userId, data);
  }
  return data;
}

function getUserIdFromToken(): number | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("auth_token");
  if (!token) return null;
  
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload.user_id ?? payload.sub ?? payload.id ?? null;
  } catch (error) {
    return null;
  }
}

