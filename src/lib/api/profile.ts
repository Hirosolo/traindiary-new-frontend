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

export interface ApiUser {
  id: number;
  user_id: number;
  username: string;
  email: string;
  phone?: string;
  avatar_url?: string;
}

export async function fetchMyProfile(): Promise<ApiUser> {
  return apiFetch<ApiUser>("/users/me");
}
