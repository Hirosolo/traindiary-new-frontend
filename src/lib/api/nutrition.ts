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
  totals: ApiNutrient & { water: number };
}

export interface ApiMealsResponse {
  data: ApiMeal[] | ApiDayNutrition[];
  total_count?: number;
}

export async function fetchMeals(
  userId: number,
  date?: string,
  month?: string
): Promise<ApiMealsResponse> {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  if (month) params.append("month", month);
  const url = `/meals?${params.toString()}`;
  console.log("[fetchMeals] request", { userId, date, month, url });
  const data = await apiFetch<ApiMealsResponse>(url);
  console.log("[fetchMeals] response", data);
  return data;
}

export interface NutritionGoal {
  calories_target: number;
  protein_target_g: number;
  carbs_target_g: number;
  fat_target_g: number;
  fiber_target_g: number;
  hydration_target_ml: number;
  start_date: string;
}

export async function fetchNutritionGoal(date: string): Promise<NutritionGoal | null> {
  try {
    return await apiFetch<NutritionGoal>(`/nutrition/goals?date=${date}`);
  } catch (error) {
    return null;
  }
}

export async function saveNutritionGoal(goal: NutritionGoal): Promise<void> {
  await apiFetch(`/nutrition/goals`, {
    method: "POST",
    body: JSON.stringify(goal),
  });
}


/** Single food in GET /meals/[id] response (data.foods[]) */
export interface MealDetailFood {
  meal_detail_id: number;
  food_id: number;
  food_name: string;
  serving_type: string;
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
  amount_grams: number;
  calories_per_serving: number;
  protein_per_serving: number;
  carbs_per_serving: number;
  fat_per_serving: number;
  fiber?: number;
  serving_type?: string;
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
      amount_grams: item.amount_grams || 100,
      calories_per_serving: item.food?.calories_per_serving || 0,
      protein_per_serving: item.food?.protein_per_serving || 0,
      carbs_per_serving: item.food?.carbs_per_serving || 0,
      fat_per_serving: item.food?.fat_per_serving || 0,
      fiber: item.food?.fiber || 0,
      serving_type: item.food?.serving_type || "100g",
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

export async function fetchFoods(searchQuery?: string): Promise<Array<{
  id: string | number;
  name: string;
  protein?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  calories?: number;
  servingSize?: string;
  grams_per_serving?: number;
}>> {
  try {
    const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : "";
    const response = await apiFetch<Array<{
      food_id?: string | number;
      id?: string | number;
      name: string;
      protein_per_serving?: number;
      carbs_per_serving?: number;
      fat_per_serving?: number;
      fiber?: number;
      calories_per_serving?: number;
      serving_type?: string;
      grams_per_serving?: number;
    }>>(`/foods${query}`);
    
    // Transform API response to component format
    // Calculate grams_per_serving from serving_type or use API value
    return response.map((item) => {
      const servingType = item.serving_type ?? "100g";
      
      // Priority: Use API grams_per_serving if provided
      let gramsPerServing = item.grams_per_serving;
      
      if (!gramsPerServing) {
        // Try to extract number from serving_type (e.g., "50g", "100g", "80g")
        const gramsMatch = servingType.match(/^(\d+(?:\.\d+)?)\s*g$/i);
        if (gramsMatch) {
          // serving_type ends with 'g' and has a number
          gramsPerServing = parseFloat(gramsMatch[1]);
        } else {
          // For non-gram units (piece, bagel, egg, etc.), default to 1
          gramsPerServing = 1;
        }
      }
      
      return {
        id: item.food_id ?? item.id ?? item.name,
        name: item.name,
        protein: item.protein_per_serving ?? 0,
        carbs: item.carbs_per_serving ?? 0,
        fats: item.fat_per_serving ?? 0,
        fiber: item.fiber ?? 0,
        calories: item.calories_per_serving ?? 0,
        servingSize: servingType,
        grams_per_serving: gramsPerServing,
      };
    });
  } catch (error) {
    console.warn("Failed to fetch foods from API", error);
    return [];
  }
}
