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
}

export interface ApiExerciseLog {
  set_id?: number; // New schema uses set_id
  log_id?: number; // Legacy support
  session_detail_id?: number;
  actual_sets?: number;
  actual_reps?: number;
  reps?: number; // New schema uses reps
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

export type ApiWorkoutSessionsResponse = ApiWorkoutSession[] | { sessions: ApiWorkoutSession[] };

export async function fetchWorkoutSessions(
  userId: number,
  month?: string,
  date?: string
): Promise<ApiWorkoutSessionsResponse> {
  const params = new URLSearchParams();
  if (month) params.append("month", month);
  if (date) params.append("date", date);
  return apiFetch<ApiWorkoutSessionsResponse>(`/workouts?${params.toString()}`);
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
  exercises?: Array<{
    exercise_id: string | number;
    actual_sets: number;
    actual_reps: number;
    weight_kg: number;
  }>;
}) {
  return apiFetch<{ session_id?: number; id?: number }>(`/workouts`, {
    method: "POST",
    body: JSON.stringify({
      scheduled_date: payload.scheduledDate,
      type: payload.type,
      notes: payload.notes,
      exercises: payload.exercises?.map(ex => ({
        exercise_id: Number(ex.exercise_id),
        actual_sets: Number(ex.actual_sets),
        actual_reps: Number(ex.actual_reps),
        weight_kg: Number(ex.weight_kg)
      })),
    }),
  });
}

export async function addPlannedExercises(payload: {
  sessionId: string | number;
  exercises: Array<{
    exercise_id: string | number;
    planned_sets?: number;
    planned_reps?: number;
  }>;
}) {
  return apiFetch(`/workout-sessions`, {
    method: "POST",
    body: JSON.stringify({
      session_id: payload.sessionId,
      exercises: payload.exercises,
    }),
  });
}

export async function updateExerciseLog(payload: {
  logId: string | number;
  actualReps?: number;
  weight_kg?: number | null;
  status?: boolean;
}) {
  return apiFetch(`/workouts/logs`, {
    method: "PUT",
    body: JSON.stringify({
      log_id: Number(payload.logId),
      actual_reps: payload.actualReps,
      weight_kg: payload.weight_kg,
      status: payload.status,
    }),
  });
}

export async function logExerciseSet(payload: {
  sessionDetailId: string | number;
  actualReps?: number;
  weight_kg?: number;
  status?: boolean;
}) {
  return apiFetch(`/workouts/logs`, {
    method: "POST",
    body: JSON.stringify({
      session_detail_id: Number(payload.sessionDetailId),
      actual_reps: payload.actualReps,
      weight_kg: payload.weight_kg,
      status: payload.status,
    }),
  });
}

export async function completeWorkoutSession(sessionId: string | number) {
  return apiFetch(`/workouts/${sessionId}`, {
    method: "PUT",
    body: JSON.stringify({ status: 'COMPLETED' }),
  });
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
  return apiFetch(`/workouts/${sessionId}`, {
    method: "DELETE",
  });
}

export async function deleteSessionDetail(sessionDetailId: string | number) {
  return apiFetch(`/workout-sessions`, {
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

export async function fetchExercises(): Promise<ApiExercise[]> {
  return apiFetch<ApiExercise[]>(`/exercises`);
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
}

export async function fetchSummary(userId: number, periodType: 'weekly' | 'monthly', periodStart: string): Promise<SummaryPayload> {
  return apiFetch<SummaryPayload>(`/summary?user_id=${userId}&period_type=${periodType}&period_start=${periodStart}`);
}

