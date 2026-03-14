const API_BASE = (process.env.NEXT_PUBLIC_API_HOST || "").replace(/\/$/, "");
const API_PREFIX = API_BASE.endsWith("/api") ? API_BASE : `${API_BASE}/api`;

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export function getUserIdFromToken(): number | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("auth_token");
  if (!token) return null;
  
  try {
    // JWT tokens have 3 parts separated by dots: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    return payload.user_id ?? payload.sub ?? payload.id ?? null;
  } catch (error) {
    console.warn("Failed to extract user ID from JWT token", error);
    return null;
  }
}

export interface ApiUser {
  user_id?: number;
  id?: number;
  username?: string;
  email?: string;
  full_name?: string;
  [key: string]: any;
}

export async function fetchCurrentUser(): Promise<ApiUser | null> {
  try {
    const response = await apiFetch<ApiUser>("/users");
    return response;
  } catch (error) {
    console.error("Failed to fetch current user", error);
    return null;
  }
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

export interface ApiNutrient {
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  calories: number;
}

export interface ApiMealItem {
  item_id?: number;
  name: string;
  quantity?: number;
  unit?: string;
}

export interface ApiMeal {
  meal_id?: number;
  user_id?: number;
  meal_date?: string;
  log_date?: string;
  meal_time?: string;
  meal_type: string; // breakfast, lunch, dinner, snack
  name?: string;
  protein?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  calories?: number;
  /** GET /meals response: totals per meal */
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
  total_fibers?: number;
  total_sugars?: number;
  items?: ApiMealItem[];
  user_meal_details?: Array<{
    meal_detail_id?: number;
    amount_grams?: number;
    foods?: {
      name?: string;
      calories_per_serving?: number;
      protein_per_serving?: number;
      carbs_per_serving?: number;
      fat_per_serving?: number;
      fiber?: number;
      [key: string]: any;
    };
  }>;
  notes?: string | null;
}

export interface ApiDayNutrition {
  day: string;
  meals: ApiMeal[];
  totals: ApiNutrient;
}

export interface ApiMealsResponse {
  data: ApiMeal[] | ApiDayNutrition[];
  total_count?: number;
}

// ─── Meals Monthly Cache Helpers ─────────────────────────────────────────────

function mealsCacheKey(month: string, userId: number | string) {
  return `meals_month_${month}_${userId}`;
}
function mealsFetchedKey(month: string, userId: number | string) {
  return `meals_fetched_${month}_${userId}`;
}

function getTodayDateStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getMealsMonthCache(month: string, userId: number | string): ApiMeal[] | null {
  if (typeof window === 'undefined') return null;
  const fetched = localStorage.getItem(mealsFetchedKey(month, userId));
  if (fetched !== getTodayDateStr()) return null; // stale or never fetched today
  const raw = localStorage.getItem(mealsCacheKey(month, userId));
  if (!raw) return null;
  try { return JSON.parse(raw) as ApiMeal[]; } catch { return null; }
}

function setMealsMonthCache(month: string, userId: number | string, meals: ApiMeal[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(mealsCacheKey(month, userId), JSON.stringify(meals));
  localStorage.setItem(mealsFetchedKey(month, userId), getTodayDateStr());
}

export function updateMealsMonthCache(
  month: string,
  userId: number | string,
  updater: (meals: ApiMeal[]) => ApiMeal[]
): void {
  const cached = getMealsMonthCache(month, userId) ?? [];
  setMealsMonthCache(month, userId, updater(cached));
}

export function invalidateMealsMonthCache(month: string, userId: number | string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(mealsCacheKey(month, userId));
  localStorage.removeItem(mealsFetchedKey(month, userId));
}

// ─────────────────────────────────────────────────────────────────────────────

export async function fetchMeals(
  userId: number,
  date?: string,
  month?: string,
  forceRefresh = false
): Promise<ApiMealsResponse> {
  // Derive the month string we need
  const targetMonth = month ?? (date ? date.slice(0, 7) : getTodayDateStr().slice(0, 7));

  if (forceRefresh) {
    invalidateMealsMonthCache(targetMonth, userId);
  }

  // Try the daily cache first
  const cached = forceRefresh ? null : getMealsMonthCache(targetMonth, userId);
  if (cached) {
    const filtered = date ? cached.filter((m) => (m.log_date ?? m.meal_date ?? '').startsWith(date)) : cached;
    console.log('[fetchMeals] served from cache', { targetMonth, date, count: filtered.length });
    return { data: filtered } as ApiMealsResponse;
  }

  // Cache miss or stale → fetch full month
  const params = new URLSearchParams({ month: targetMonth });
  const url = `/meals?${params.toString()}`;
  console.log('[fetchMeals] fetching from network', { userId, targetMonth, url });
  const data = await apiFetch<ApiMealsResponse>(url);

  // Normalise to flat array for caching
  const allMeals: ApiMeal[] = Array.isArray(data) ? data : ((data as any).data ?? []);
  setMealsMonthCache(targetMonth, userId, allMeals);

  // Return the day's slice if a specific date was requested
  const result = date ? allMeals.filter((m) => (m.log_date ?? m.meal_date ?? '').startsWith(date)) : allMeals;
  console.log('[fetchMeals] response', { count: result.length });
  return { data: result } as ApiMealsResponse;
}

// ─────────────────────────────────────────────────────────────────────────────

export interface NutritionGoal {
  goal_id?: number;
  calories_target: number;
  protein_target_g: number;
  carbs_target_g: number;
  fat_target_g: number;
  fiber_target_g: number;
  start_date: string;
}

// ─── Goal Cache Helpers ─────────────────────────────────────────────

function goalCacheKey(date: string, userId: number | string) {
  return `goal_date_${date}_${userId}`;
}
function goalFetchedKey(date: string, userId: number | string) {
  return `goal_fetched_${date}_${userId}`;
}

function getGoalCache(date: string, userId: number | string): NutritionGoal | null {
  if (typeof window === 'undefined') return null;
  const fetched = localStorage.getItem(goalFetchedKey(date, userId));
  if (fetched !== getTodayDateStr()) return null;
  const raw = localStorage.getItem(goalCacheKey(date, userId));
  if (!raw) return null;
  try { return JSON.parse(raw) as NutritionGoal; } catch { return null; }
}

function setGoalCache(date: string, userId: number | string, goal: NutritionGoal): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(goalCacheKey(date, userId), JSON.stringify(goal));
  localStorage.setItem(goalFetchedKey(date, userId), getTodayDateStr());
}

function invalidateGoalCache(date: string, userId: number | string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(goalCacheKey(date, userId));
  localStorage.removeItem(goalFetchedKey(date, userId));
}

// ─────────────────────────────────────────────────────────────────────────────

export async function fetchNutritionGoal(date: string, forceRefresh = false): Promise<NutritionGoal | null> {
  const userId = getUserIdFromToken() ?? 'anon';

  if (forceRefresh) {
    invalidateGoalCache(date, userId);
  }
  
  // Try cache first
  const cached = forceRefresh ? null : getGoalCache(date, userId);
  if (cached) {
    console.log('[fetchNutritionGoal] served from cache', { date });
    return cached;
  }

  try {
    const data = await apiFetch<NutritionGoal>(`/nutrition/goals?date=${date}`);
    if (data) {
      setGoalCache(date, userId, data);
    }
    return data;
  } catch (error) {
    return null;
  }
}

export interface MetricData {
  age: number;
  sex: 'male' | 'female';
  height_cm: number;
  weight_kg: number;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'heavy' | 'athlete';
  body_fat_percentage?: number;
  is_body_fat_estimated?: boolean;
}

export interface GoalCalculationParams extends MetricData {
  goal_type: 'cutting' | 'lean_bulk' | 'maintain' | 'recomposition';
  goal_speed: 'slow' | 'moderate' | 'aggressive';
}

export interface GoalCalculationResult {
  bmr: number;
  tdee: number;
  daily_calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
}

export async function calculateGoalTargets(params: GoalCalculationParams): Promise<GoalCalculationResult> {
  return apiFetch<GoalCalculationResult>("/nutrition/goals/calculate", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function saveNutritionGoal(params: GoalCalculationParams & GoalCalculationResult): Promise<any> {
    const userId = getUserIdFromToken() ?? 'anon';
    const result = await apiFetch("/nutrition/goals", {
        method: "POST",
        body: JSON.stringify({
            ...params,
            calories_target: params.daily_calories,
            protein_target_g: params.protein_g,
            carbs_target_g: params.carbs_g,
            fat_target_g: params.fat_g,
        }),
    });
    
    // Invalidate goal cache for today (or the targeted date if we had one)
    invalidateGoalCache(getTodayDateStr(), userId);
    return result;
}

export async function fetchLatestMetrics(): Promise<MetricData | null> {
  try {
    return await apiFetch<MetricData>("/nutrition/metrics/latest");
  } catch (error) {
    console.error("Failed to fetch latest metrics", error);
    return null;
  }
}

export async function saveUserMetric(metrics: Partial<MetricData>): Promise<void> {
  await apiFetch("/nutrition/metrics", {
    method: "POST",
    body: JSON.stringify(metrics),
  });
}




/** Single food in GET /meals/[id] response (data.foods[]) */
export interface MealDetailFood {
  meal_detail_id: number;
  food_id: number;
  food_name: string;
  unit_type: string;
  image: string | null;
  numbers_of_serving: number;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fibers: number;
  total_sugars?: number;
  total_zincs?: number;
  total_magnesiums?: number;
  total_calciums?: number;
  total_irons?: number;
  total_vitamin_a?: number;
  total_vitamin_c?: number;
  total_vitamin_b12?: number;
  total_vitamin_d?: number;
}

/** GET /meals/[id] response (result.data) */
export interface MealDetailResponse {
  meal_id: number;
  meal_type: string;
  log_date: string;
  foods: MealDetailFood[];
}

export async function fetchMealDetails(mealId: string | number): Promise<MealDetailResponse | null> {
  try {
    console.log("[fetchMealDetails] request", { mealId, url: `/meals/${mealId}` });
    const data = await apiFetch<MealDetailResponse>(`/meals/${mealId}`);
    console.log("[fetchMealDetails] response", data);
    return data;
  } catch (error) {
    console.error("Failed to fetch meal details", error);
    return null;
  }
}

export interface FoodItem {
  meal_detail_id?: number;
  food_id?: number;
  name: string;
  numbers_of_serving?: number;
  calories_per_serving: number;
  protein_per_serving: number;
  carbs_per_serving: number;
  fat_per_serving: number;
  fiber?: number;
  unit_type?: string;
  image?: string;
}

export async function fetchMealFoodItems(mealId: string | number): Promise<FoodItem[]> {
  try {
    const response = await apiFetch<any>(`/meal-details?meal_id=${mealId}`);
    
    // The API returns an array of meal detail entries, each with food information
    if (!Array.isArray(response)) {
      console.warn("Expected meal details to be an array, got:", typeof response);
      return [];
    }

    return response.map((item: any) => ({
      meal_detail_id: item.meal_detail_id,
      food_id: item.food?.food_id || item.food_id,
      name: item.food?.name || item.name || "Unknown Food",
      numbers_of_serving: item.numbers_of_serving || 1,
      calories_per_serving: item.food?.calories_per_serving || 0,
      protein_per_serving: item.food?.protein_per_serving || 0,
      carbs_per_serving: item.food?.carbs_per_serving || 0,
      fat_per_serving: item.food?.fat_per_serving || 0,
      fiber: item.food?.fiber || 0,
      unit_type: item.food?.unit_type || "unit",
      image: item.food?.image,
    }));
  } catch (error) {
    console.error("Failed to fetch meal food items", error);
    return [];
  }
}

export interface MealNutrition {
  meal_id?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  zinc?: number;
  magnesium?: number;
  calcium?: number;
  iron?: number;
}

export async function fetchMealNutritionTotals(mealId: string | number): Promise<MealNutrition | null> {
  try {
    const response = await apiFetch<MealNutrition>(`/meal-details/nutrition?meal_id=${mealId}`);
    return response;
  } catch (error) {
    console.error("Failed to fetch meal nutrition totals", error);
    return null;
  }
}

export async function createMeal(payload: {
  userId: number;
  mealDate: string;
  mealTime?: string;
  mealType: string;
  name?: string;
  items?: Array<{
    name?: string;
    quantity?: number;
    unit?: string;
    food_id?: number | string;
    id?: number | string;
    grams_per_serving?: number;
  }>;
  notes?: string | null;
}) {
  const details = (payload.items || []).map((item) => ({
    food_id: Number(item.food_id ?? item.id),
    numbers_of_serving: Number(item.quantity ?? 1),
  }));

  const mealTypeLower = payload.mealType.toLowerCase();

  return apiFetch<{ meal_id?: number; id?: number }>(`/meals`, {
    method: "POST",
    body: JSON.stringify({
      meal_type: mealTypeLower,
      log_date: payload.mealDate,
      details,
    }),
  });
}

export async function updateMeal(payload: {
  mealId: string | number;
  mealTime?: string;
  name?: string;
  protein?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  calories?: number;
  notes?: string | null;
}) {
  return apiFetch(`/meals/${payload.mealId}`, {
    method: "PUT",
    body: JSON.stringify({
      meal_time: payload.mealTime,
      name: payload.name,
      protein: payload.protein,
      carbs: payload.carbs,
      fats: payload.fats,
      fiber: payload.fiber,
      calories: payload.calories,
      notes: payload.notes,
    }),
  });
}

export async function deleteMeal(mealId: string | number) {
  return apiFetch<{ message?: string }>(`/meals/${mealId}`, {
    method: "DELETE",
  });
}

export async function fetchMealTypes(): Promise<string[]> {
  // Meal types are predefined strings, no API endpoint for types
  return ["Breakfast", "Lunch", "Dinner", "Snack", "Pre-Workout", "Post-Workout"];
}

const FOODS_VERSION_KEY = 'foods_version';
const FOODS_DATA_KEY = 'foods_data';

function getTodayVersion(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = String(now.getFullYear());
  return `${dd}${mm}${yyyy}`;
}

/** Raw food shape returned by GET /foods */
interface RawFood {
  food_id?: string | number;
  id?: string | number;
  name: string;
  protein_per_serving?: number;
  carbs_per_serving?: number;
  fat_per_serving?: number;
  fiber?: number;
  calories_per_serving?: number;
  unit_type?: string;
}

function mapRawFood(item: RawFood) {
  return {
    id: item.food_id ?? item.id ?? item.name,
    name: item.name,
    protein: item.protein_per_serving ?? 0,
    carbs: item.carbs_per_serving ?? 0,
    fats: item.fat_per_serving ?? 0,
    fiber: item.fiber ?? 0,
    calories: item.calories_per_serving ?? 0,
    servingSize: item.unit_type ?? 'unit',
    unit_type: item.unit_type,
  };
}

export async function fetchFoods(searchQuery?: string): Promise<Array<{
  id: string | number;
  name: string;
  protein?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  calories?: number;
  servingSize?: string;
  unit_type?: string;
}>> {
  try {
    // Search queries bypass the cache
    if (searchQuery) {
      const query = `?search=${encodeURIComponent(searchQuery)}`;
      const response = await apiFetch<RawFood[]>(`/foods${query}`);
      return response.map(mapRawFood);
    }

    if (typeof window === 'undefined') {
      const response = await apiFetch<{ data: RawFood[] }>(`/foods`).then(res => res.data);
      return response.map(mapRawFood);
    }

    const storedVersion = localStorage.getItem(FOODS_VERSION_KEY);
    const storedDataStr = localStorage.getItem(FOODS_DATA_KEY);
    let localFoods: any[] = [];

    if (storedDataStr) {
      try {
        localFoods = JSON.parse(storedDataStr);
      } catch {
        localFoods = [];
      }
    }

    // Fetch updates from backend
    const params = storedVersion ? `?version=${storedVersion}` : '';
    const result = await apiFetch<{ changed: 0 | 1; version: string; data?: RawFood[] }>(`/foods${params}`);

    if (result.changed === 1 && result.data) {
      const mappedNew = result.data.map(mapRawFood);
      let updatedFoods: any[];

      if (localFoods.length === 0) {
        updatedFoods = mappedNew;
      } else {
        // Merge delta updates: Replace or add items based on ID
        const foodMap = new Map(localFoods.map(f => [f.id, f]));
        mappedNew.forEach(newFood => {
          foodMap.set(newFood.id, newFood);
        });
        updatedFoods = Array.from(foodMap.values());
      }

      // Sort by name for consistency
      updatedFoods.sort((a, b) => a.name.localeCompare(b.name));

      localStorage.setItem(FOODS_VERSION_KEY, result.version);
      localStorage.setItem(FOODS_DATA_KEY, JSON.stringify(updatedFoods));
      return updatedFoods;
    } else {
      // Data unchanged: just update the version stamp and return local cache
      localStorage.setItem(FOODS_VERSION_KEY, result.version);
      return localFoods;
    }
  } catch (error) {
    console.warn('Failed to fetch foods from API', error);
    return [];
  }
}
