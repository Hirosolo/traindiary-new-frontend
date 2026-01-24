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
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}

export interface ApiUser {
  user_id: number;
  username: string;
  email: string;
  phone?: string;
  avatar_url?: string;
}

export async function fetchMyProfile(): Promise<ApiUser> {
  return apiFetch<ApiUser>("/users/me");
}
