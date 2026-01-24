const API_BASE = (process.env.NEXT_PUBLIC_API_HOST ?? "http://localhost:3001/api").replace(/\/$/, "");
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

  if (!response.ok) {
    let message = `Request failed with ${response.status}`;
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch (error) {
      // ignore json parsing error
    }
    throw new Error(message);
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    // Some endpoints may not return a body
    return {} as T;
  }
}

export interface ApiExercise {
  exercise_id: number;
  name: string;
  category?: string;
  description?: string;
  image?: string;
}

export interface ApiExerciseLog {
  log_id?: number;
  session_detail_id?: number;
  actual_sets?: number;
  actual_reps?: number;
  weight_kg?: number;
  rep?: number; // for creation payload consistency
  status?: boolean; // set completion status
  log_timestamp?: string;
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
  notes?: string | null;
  type?: string | null;
  session_details?: ApiSessionDetail[];
}

export type ApiWorkoutSessionsResponse = ApiWorkoutSession[] | { sessions: ApiWorkoutSession[] };

export async function fetchWorkoutSessions(
  userId: number,
  month: string
): Promise<ApiWorkoutSessionsResponse> {
  return apiFetch<ApiWorkoutSessionsResponse>(`/workout-sessions?user_id=${userId}&month=${month}`);
}

export async function fetchWorkoutSessionById(
  sessionId: string | number
): Promise<ApiWorkoutSession | null> {
  try {
    // Try POST with body first (session_id in body)
    const response = await apiFetch<ApiSessionDetailsResponse>(`/workout-sessions`, {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId }),
    });

    if (response && Array.isArray(response.details)) {
      // Map details array with corresponding logs
      const sessionDetails = response.details.map((detail) => ({
        ...detail,
        exercise_logs: response.logs.filter(
          (log) => log.session_detail_id === detail.session_detail_id
        ),
      }));

      return {
        session_id: Number(sessionId),
        scheduled_date: new Date().toISOString().split('T')[0], // placeholder date
        session_details: sessionDetails,
      };
    }
  } catch (error) {
    console.warn("Session details POST failed, trying GET fallback", error);
  }

  // Fallback to GET query parameter
  try {
    const sessions = await apiFetch<ApiWorkoutSession[]>(`/workout-sessions?session_id=${sessionId}`);
    if (Array.isArray(sessions) && sessions.length > 0) return sessions[0];
  } catch (error) {
    console.error("Failed to fetch session by ID", error);
  }

  return null;
}

export async function createWorkoutSession(payload: {
  userId: number;
  scheduledDate: string;
  type?: string | null;
  notes?: string | null;
  exercises?: Array<{
    exercise_id: string | number;
    reps: Array<{ rep: number; weight_kg?: number | null }>;
  }>;
}) {
  return apiFetch<{ session_id?: number; id?: number; message?: string }>(`/workout-sessions`, {
    method: "POST",
    body: JSON.stringify({
      user_id: payload.userId,
      scheduled_date: payload.scheduledDate,
      type: payload.type,
      notes: payload.notes,
      exercises: payload.exercises,
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
  weightKg?: number | null;
  logStatus?: boolean;
}) {
  return apiFetch(`/workout-sessions`, {
    method: "PUT",
    body: JSON.stringify({
      log_id: payload.logId,
      actual_reps: payload.actualReps,
      weight_kg: payload.weightKg,
      log_status: payload.logStatus,
    }),
  });
}

export async function logExerciseSet(payload: {
  sessionDetailId: string | number;
  actualSets?: number;
  actualReps?: number;
  weightKg?: number;
  status?: boolean;
}) {
  return apiFetch(`/workout-sessions`, {
    method: "POST",
    body: JSON.stringify({
      session_detail_id: payload.sessionDetailId,
      actual_sets: payload.actualSets,
      actual_reps: payload.actualReps,
      weight_kg: payload.weightKg,
      status: payload.status,
    }),
  });
}

export async function completeWorkoutSession(sessionId: string | number) {
  return apiFetch(`/workout-sessions`, {
    method: "PUT",
    body: JSON.stringify({ session_id: sessionId, completed: true }),
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
  return apiFetch(`/workout-sessions`, {
    method: "DELETE",
    body: JSON.stringify({ session_id: sessionId }),
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
    // Ensure basic types are always included
    return types.length > 0 ? types : BASIC_WORKOUT_TYPES;
  } catch (error) {
    console.warn("Failed to fetch workout types from API, using defaults", error);
    return BASIC_WORKOUT_TYPES;
  }
}
