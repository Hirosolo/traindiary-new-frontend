import { NextResponse } from "next/server";

const apiHost = process.env.NEXT_PUBLIC_API_HOST;

const messageResponse = (description: string, example?: string) => ({
  description,
  schema: {
    type: "object",
    properties: {
      message: { type: "string", example },
    },
  },
});

const errorResponse = (description: string, example?: string) => ({
  description,
  schema: {
    type: "object",
    properties: {
      message: { type: "string", example },
    },
  },
});

const spec = {
  swagger: "2.0",
  info: {
    title: "Train Diary API",
    version: "1.0.0",
    description: "API documentation for Train Diary application",
  },
  // --- EDITED SECTION: Conditionally set host or omit it ---
  // If apiHost is set, remove the scheme. If not set (e.g., in a local dev environment), omit the host
  // property entirely to use relative paths, which often resolves 'Failed to fetch' in same-origin environments.
  ...(apiHost ? { host: apiHost.replace(/^https?:\/\//, "") } : {}),
  basePath: "/api",
  schemes: ["https", "http"],
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [
    {
      name: "Auth",
      description: "User authentication and authorization operations",
    },
  ],
  paths: {
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Logs in a user and returns a JWT token",
        description:
          "Authenticates a user using email and password, issuing a time-limited JSON Web Token (JWT).",
        parameters: [
          {
            name: "Login Credentials",
            in: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                email: {
                  type: "string",
                  format: "email",
                  example: "testuser@example.com",
                  description: "User's email address.",
                },
                password: {
                  type: "string",
                  format: "password",
                  example: "password123",
                  description: "User's password.",
                },
              },
              required: ["email", "password"],
            },
          },
        ],
        responses: {
          200: {
            description: "Successful login and JWT token retrieval",
            schema: {
              type: "object",
              properties: {
                token: {
                  type: "string",
                  description:
                    "The authentication JWT. This should be stored securely and used for subsequent requests.",
                },
                user: {
                  type: "object",
                  properties: {
                    user_id: { type: "string", example: "uuid-12345" },
                    username: { type: "string", example: "testuser" },
                    email: {
                      type: "string",
                      format: "email",
                      example: "testuser@example.com",
                    },
                  },
                },
              },
            },
          },
          400: errorResponse(
            "Bad Request: Missing email or password.",
            "Email and password required."
          ),
          401: errorResponse(
            "Unauthorized: Invalid credentials.",
            "User not found. "
          ),
          403: errorResponse(
            "Unauthorized: Invalid credentials.",
            "Wrong password."
          ),
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registers a new user account",
        description:
          "Creates a new user account by accepting a username, email, password, and optional phone number. The password is hashed before storage.",
        parameters: [
          {
            name: "Registration Data",
            in: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                username: {
                  type: "string",
                  example: "newuser",
                  description: "Desired username.",
                },
                email: {
                  type: "string",
                  format: "email",
                  example: "newuser@example.com",
                  description: "User's unique email address.",
                },
                password: {
                  type: "string",
                  format: "password",
                  example: "securePassword123",
                  description: "Desired password.",
                },
                phone: {
                  type: "string",
                  example: "+1234567890",
                  description: "Optional: User's phone number. Will be stored in phone_number column.",
                },
              },
              required: ["username", "email", "password"],
            },
          },
        ],
        responses: {
          "201": {
            description: "User registered successfully.",
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "User registered successfully.",
                },
              },
            },
          },
          "400": {
            description: "Bad Request: Missing required fields.",
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "All fields are required.",
                },
              },
            },
          },
          "409": {
            description: "Conflict: Email already in use.",
            schema: {
              type: "object",
              properties: {
                message: { type: "string", example: "Email already in use." },
              },
            },
          },
          "500": {
            description: "Internal Server Error: Registration failed.",
            schema: {
              type: "object",
              properties: {
                message: { type: "string", example: "Registration failed." },
                error: {
                  type: "string",
                  description: "Database or server error message.",
                },
              },
            },
          },
        },
      },
    },
    "/exercises": {
      get: {
        tags: ["Exercises"],
        summary: "Retrieve all available exercises",
        description: "Fetches a list of all exercises stored in the database.",
        responses: {
          200: {
            description: "A list of exercises.",
            schema: {
              type: "array",
              items: {
                $ref: "#/definitions/Exercise",
              },
            },
          },
          500: errorResponse(
            "Internal Server Error: Failed to fetch data.",
            "Failed to fetch exercises."
          ),
        },
      },
      post: {
        tags: ["Exercises"],
        summary: "Add a new exercise",
        description:
          "Creates and stores a new exercise definition. Exercise name must be unique.",
        parameters: [
          {
            name: "New Exercise Object",
            in: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  example: "Deadlift",
                  description: "Name of the exercise (required).",
                },
                category: {
                  type: "string",
                  example: "Back/Hamstrings",
                  description: "Muscle group.",
                },
                default_sets: {
                  type: "integer",
                  example: 5,
                  description: "Suggested sets.",
                },
                default_reps: {
                  type: "integer",
                  example: 5,
                  description: "Suggested reps.",
                },
                description: {
                  type: "string",
                  description: "Instructions for the exercise.",
                },
              },
              required: ["name"],
            },
          },
        ],
        responses: {
          201: {
            description: "Exercise successfully added.",
            schema: {
              type: "object",
              properties: {
                exercise_id: { type: "string", example: "uuid-new-789" },
                message: { type: "string", example: "Exercise added." },
              },
            },
          },
          400: errorResponse(
            "Bad Request: Missing required field.",
            "Exercise name is required."
          ),
          409: errorResponse(
            "Conflict: Exercise name already exists.",
            "Exercise with this name already exists."
          ),
          500: errorResponse(
            "Internal Server Error: Failed to add exercise.",
            "Failed to add exercise."
          ),
        },
      },
      delete: {
        tags: ["Exercises"],
        summary: "Delete an exercise by ID",
        description:
          "Deletes a single exercise from the database using its unique ID.",
        parameters: [
          {
            name: "Exercise ID",
            in: "body",
            required: true,
            schema: {
              type: "string",
              example: "uuid-12345",
              description:
                "The unique ID of the exercise to delete (JSON body).",
            },
          },
        ],
        responses: {
          200: messageResponse(
            "Exercise successfully deleted.",
            "Exercise deleted."
          ),
          400: errorResponse(
            "Bad Request: Missing ID.",
            "Exercise ID is required."
          ),
          404: errorResponse(
            "Not Found: Exercise does not exist.",
            "Exercise not found."
          ),
          500: errorResponse(
            "Internal Server Error: Failed to delete exercise.",
            "Failed to delete exercise."
          ),
        },
      },
    },
    "/food-logs": {
      get: {
        tags: ["Food Logs"],
        summary: "Retrieve user's meal logs",
        description:
          "Fetches meal logs for a specific user, optionally filtered by meal ID or date.",
        parameters: [
          {
            name: "user_id",
            in: "query",
            required: true,
            type: "integer",
            description: "The ID of the user whose logs to retrieve.",
            example: 1,
          },
          {
            name: "meal_id",
            in: "query",
            required: false,
            type: "integer",
            description: "Optional: Filter for a specific meal ID.",
            example: 50,
          },
          {
            name: "date",
            in: "query",
            required: false,
            type: "string",
            format: "date",
            description:
              "Optional: Filter logs for a specific date (YYYY-MM-DD).",
            example: "2024-05-15",
          },
        ],
        responses: {
          200: {
            description: "A list of meal logs.",
            schema: {
              type: "array",
              items: {
                $ref: "#/definitions/UserMeal",
              },
            },
          },
          500: errorResponse(
            "Internal Server Error: Failed to fetch meals.",
            "Failed to fetch meals."
          ),
        },
      },
      post: {
        tags: ["Food Logs"],
        summary: "Log a new meal",
        description:
          "Creates a new meal log for a user, including the date, meal type, and associated food items with their amounts.",
        parameters: [
          {
            name: "New Meal Log",
            in: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                user_id: {
                  type: "integer",
                  example: 1,
                  description: "ID of the user logging the meal (required).",
                },
                meal_type: {
                  type: "string",
                  example: "Lunch",
                  description: "Type of meal (e.g., Breakfast) (required).",
                },
                log_date: {
                  type: "string",
                  format: "date",
                  example: "2024-05-15",
                  description: "Date of the meal (YYYY-MM-DD) (required).",
                },
                foods: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      food_id: {
                        type: "integer",
                        example: 1,
                        description: "ID of the food item.",
                      },
                      amount_grams: {
                        type: "number",
                        example: 150,
                        description: "Amount consumed in grams.",
                      },
                    },
                    required: ["food_id", "amount_grams"],
                  },
                  description:
                    "List of foods consumed in the meal (required, must not be empty).",
                },
              },
              required: ["user_id", "meal_type", "log_date", "foods"],
            },
          },
        ],
        responses: {
          200: messageResponse(
            "Food log created successfully.",
            "Food log created successfully."
          ),
          400: errorResponse(
            "Bad Request: Missing required field or invalid user.",
            "Missing required fields: user_id, meal_type, log_date, or foods."
          ),
          500: errorResponse(
            "Internal Server Error: Failed to create log.",
            "Failed to create meal log."
          ),
        },
      },
      put: {
        tags: ["Food Logs"],
        summary: "Update an existing meal log",
        description:
          "Updates the meal type, date, and/or replaces the entire list of foods associated with a specific meal ID. Foods array, if present, completely overwrites existing details.",
        parameters: [
          {
            name: "Update Meal Log",
            in: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                meal_id: {
                  type: "integer",
                  example: 50,
                  description: "ID of the meal log to update (required).",
                },
                meal_type: {
                  type: "string",
                  example: "Dinner",
                  description: "New meal type (optional).",
                },
                log_date: {
                  type: "string",
                  format: "date",
                  example: "2024-05-16",
                  description: "New log date (optional).",
                },
                foods: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      food_id: {
                        type: "integer",
                        example: 2,
                        description: "ID of the new food item.",
                      },
                      amount_grams: {
                        type: "number",
                        example: 200,
                        description: "Amount consumed in grams.",
                      },
                    },
                  },
                  description:
                    "New list of foods (optional; completely replaces old food details if provided).",
                },
              },
              required: ["meal_id"],
            },
          },
        ],
        responses: {
          200: messageResponse(
            "Food log updated successfully.",
            "Food log updated successfully."
          ),
          400: errorResponse(
            "Bad Request: Missing meal ID.",
            "Missing meal_id for update."
          ),
          404: errorResponse(
            "Not Found: Meal does not exist.",
            "Meal not found."
          ),
          500: errorResponse(
            "Internal Server Error: Failed to update log.",
            "Failed to update meal log."
          ),
        },
      },
      delete: {
        tags: ["Food Logs"],
        summary: "Delete a meal log",
        description:
          "Deletes a meal log and all its associated food details by meal ID.",
        parameters: [
          {
            name: "Meal ID",
            in: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                meal_id: {
                  type: "integer",
                  example: 50,
                  description: "ID of the meal log to delete (required).",
                },
              },
              required: ["meal_id"],
            },
          },
        ],
        responses: {
          200: messageResponse(
            "Food log deleted successfully.",
            "Food log deleted successfully."
          ),
          400: errorResponse(
            "Bad Request: Missing meal ID.",
            "Missing meal_id for delete."
          ),
          404: errorResponse(
            "Not Found: Meal does not exist.",
            "Meal not found."
          ),
          500: errorResponse(
            "Internal Server Error: Failed to delete log.",
            "Failed to delete meal log."
          ),
        },
      },
    },
    "/food-logs/daily-intake": {
      get: {
        tags: ["Food Logs"],
        summary: "Calculate daily total macronutrients and calories",
        description:
          "Calculates the total caloric and macronutrient intake (Protein, Carbs, Fat) for a specific user on a given date.",
        parameters: [
          {
            name: "user_id",
            in: "query",
            required: true,
            type: "integer",
            description: "The ID of the user for whom to calculate intake.",
            example: 1,
          },
          {
            name: "date",
            in: "query",
            required: true,
            type: "string",
            format: "date",
            description: "The date for the calculation (YYYY-MM-DD).",
            example: "2024-05-15",
          },
        ],
        responses: {
          200: {
            description: "Daily intake totals summary.",
            schema: {
              $ref: "#/definitions/DailyIntakeSummary",
            },
          },
          400: errorResponse(
            "Bad Request: Missing user_id or date.",
            "user_id and date are required."
          ),
          500: errorResponse(
            "Internal Server Error: Failed to calculate intake.",
            "Failed to calculate daily intake."
          ),
        },
      },
    },
    "/foods": {
      get: {
        tags: ["Foods"],
        summary: "Retrieve all food items or a specific food item",
        description:
          "Fetches a list of all available food items. Can be filtered by a specific food_id using a query parameter.",
        parameters: [
          {
            name: "food_id",
            in: "query",
            required: false,
            type: "integer",
            description: "Optional: ID of a specific food item to retrieve.",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "A list of food items or a single food item.",
            schema: {
              type: "array",
              items: {
                $ref: "#/definitions/Food",
              },
            },
          },
          404: errorResponse(
            "Not Found: Food item not found.",
            "Food not found."
          ),
          500: errorResponse(
            "Internal Server Error: Failed to fetch data.",
            "Failed to fetch foods."
          ),
        },
      },
      post: {
        tags: ["Foods"],
        summary: "Add a new food item",
        description:
          "Creates and stores a new food item definition with nutritional information.",
        parameters: [
          {
            name: "New Food Item",
            in: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  example: "Salmon Fillet",
                  description: "Name of the food (required).",
                },
                calories_per_serving: {
                  type: "number",
                  example: 208,
                  description: "Calories per 100g serving (required).",
                },
                protein_per_serving: {
                  type: "number",
                  example: 20,
                  description: "Protein grams per 100g serving (required).",
                },
                carbs_per_serving: {
                  type: "number",
                  example: 0,
                  description:
                    "Carbohydrate grams per 100g serving (required).",
                },
                fat_per_serving: {
                  type: "number",
                  example: 13,
                  description: "Fat grams per 100g serving (required).",
                },
                serving_type: {
                  type: "string",
                  example: "100 g",
                  description: "Unit used for serving sizes (required).",
                },
                image: {
                  type: "string",
                  format: "url",
                  description: "Optional URL for a food image.",
                },
              },
              required: [
                "name",
                "calories_per_serving",
                "protein_per_serving",
                "carbs_per_serving",
                "fat_per_serving",
                "serving_type",
              ],
            },
          },
        ],
        responses: {
          201: {
            description: "Food item successfully added.",
            schema: {
              type: "object",
              properties: {
                food_id: { type: "integer", example: 5 },
                message: {
                  type: "string",
                  example: "Food added successfully.",
                },
              },
            },
          },
          400: errorResponse(
            "Bad Request: Missing required field.",
            "Food name and nutritional details are required."
          ),
          409: errorResponse(
            "Conflict: Food name already exists.",
            "Food with this name already exists."
          ),
          500: errorResponse(
            "Internal Server Error: Failed to add food.",
            "Failed to add food."
          ),
        },
      },
      put: {
        tags: ["Foods"],
        summary: "Update an existing food item",
        description:
          "Updates details of an existing food item by ID. Any field not provided will remain unchanged.",
        parameters: [
          {
            name: "Update Food Item",
            in: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                food_id: {
                  type: "integer",
                  example: 1,
                  description: "ID of the food item to update (required).",
                },
                name: { type: "string", example: "Chicken Breast (Cooked)" },
                calories_per_serving: { type: "number", example: 180 },
                protein_per_serving: { type: "number", example: 34 },
                // ... other optional fields
              },
              required: ["food_id"],
            },
          },
        ],
        responses: {
          200: messageResponse(
            "Food item updated successfully.",
            "Food updated successfully."
          ),
          400: errorResponse(
            "Bad Request: Missing food ID.",
            "Missing food_id for update."
          ),
          404: errorResponse(
            "Not Found: Food does not exist.",
            "Food not found."
          ),
          500: errorResponse(
            "Internal Server Error: Failed to update food.",
            "Failed to update food."
          ),
        },
      },
      delete: {
        tags: ["Foods"],
        summary: "Delete a food item by ID",
        description:
          "Deletes a single food item from the database using its unique ID.",
        parameters: [
          {
            name: "Food ID",
            in: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                food_id: {
                  type: "integer",
                  example: 1,
                  description:
                    "The unique ID of the food item to delete (JSON body).",
                },
              },
              required: ["food_id"],
            },
          },
        ],
        responses: {
          200: messageResponse(
            "Food item successfully deleted.",
            "Food deleted successfully."
          ),
          400: errorResponse(
            "Bad Request: Missing ID.",
            "Food ID is required."
          ),
          404: errorResponse(
            "Not Found: Food does not exist.",
            "Food not found."
          ),
          500: errorResponse(
            "Internal Server Error: Failed to delete food.",
            "Failed to delete food."
          ),
        },
      },
    },
    "/meal-details": {
      get: {
        tags: ["Meal Details"],
        summary: "Retrieve a specific food entry within a meal log",
        description:
          "Fetches a single Meal Detail (individual food item log) using its unique ID, including full food information.",
        parameters: [
          {
            name: "meal_id",
            in: "query",
            required: true,
            type: "integer",
            description: "The unique ID of the meal detail entry to retrieve.",
            example: 101,
          },
        ],
        responses: {
          200: {
            description: "The requested meal detail entry.",
            schema: {
              type: "object",
              description:
                "A detailed entry for a single food item logged within a meal.",
              properties: {
                meal_detail_id: {
                  type: "integer",
                  example: 101,
                  description:
                    "Unique identifier for this specific food entry (meal detail).",
                },
                meal_id: {
                  type: "integer",
                  example: 50,
                  description: "The ID of the parent meal log.",
                },
                amount_grams: {
                  type: "number",
                  format: "float",
                  example: 150.5,
                  description:
                    "The amount of the food item consumed, in grams.",
                },
                food: {
                  type: "object",
                  description: "Details of the associated food item.",
                  properties: {
                    food_id: {
                      type: "integer",
                      example: 1,
                      description:
                        "Unique ID of the food item in the master 'foods' table.",
                    },
                    name: {
                      type: "string",
                      example: "Chicken Breast",
                      description: "Name of the food.",
                    },
                    calories_per_serving: {
                      type: "number",
                      format: "float",
                      example: 165,
                      description:
                        "Calories per serving (based on the serving_type).",
                    },
                    protein_per_serving: {
                      type: "number",
                      format: "float",
                      example: 31,
                      description: "Protein (g) per serving.",
                    },
                    carbs_per_serving: {
                      type: "number",
                      format: "float",
                      example: 0,
                      description: "Carbohydrates (g) per serving.",
                    },
                    fat_per_serving: {
                      type: "number",
                      format: "float",
                      example: 3.6,
                      description: "Fat (g) per serving.",
                    },
                    serving_type: {
                      type: "string",
                      example: "100 g",
                      description:
                        "Description of the serving size (e.g., '100 g', '1 cup').",
                    },
                    image: {
                      type: "string",
                      description: "Optional image URL for the food item.",
                      example: "https://example.com/chicken.jpg",
                    },
                  },
                  required: [
                    "name",
                    "calories_per_serving",
                    "protein_per_serving",
                    "carbs_per_serving",
                    "fat_per_serving",
                  ],
                },
              },
              required: ["meal_detail_id", "meal_id", "amount_grams", "food"],
            }, // Using the full inline schema defined above
          },
          400: errorResponse(
            "Bad Request: Missing ID.",
            "meal_detail_id is required."
          ),
          404: errorResponse(
            "Not Found: Meal detail not found.",
            "Meal detail not found."
          ),
          500: errorResponse(
            "Internal Server Error: Failed to fetch data.",
            "Failed to fetch meal detail."
          ),
        },
      },
    },
    "/meal-details/nutrition": {
      get: {
        tags: ["Meal Details"],
        summary: "Calculate and retrieve food-level nutrition for a meal",
        description:
          "Calculates the Calories, Protein, Carbs, and Fat for each food item logged in a specific meal, based on the amount consumed (amount_grams) and the food's serving details.",
        parameters: [
          {
            name: "meal_id",
            in: "query",
            required: true,
            type: "integer",
            description:
              "The ID of the meal log for which to calculate nutrition.",
            example: 50,
          },
        ],
        responses: {
          200: {
            description:
              "Nutritional breakdown for each food item in the meal.",
            schema: {
              type: "object",
              properties: {
                meal_id: {
                  type: "integer",
                  example: 50,
                  description: "The ID of the meal.",
                },
                foods: {
                  type: "array",
                  description:
                    "A list of food items in the meal with calculated nutrition.",
                  items: {
                    type: "object",
                    properties: {
                      meal_detail_id: {
                        type: "integer",
                        example: 101,
                        description: "The unique ID of the food entry.",
                      },
                      food_id: {
                        type: "integer",
                        example: 1,
                        description: "ID of the food item.",
                      },
                      name: {
                        type: "string",
                        example: "Chicken Breast",
                        description: "Name of the food item.",
                      },
                      amount_grams: {
                        type: "number",
                        format: "float",
                        example: 150.5,
                        description: "Amount consumed in grams.",
                      },
                      calories: {
                        type: "number",
                        format: "float",
                        example: 248.33,
                        description: "Calculated total calories.",
                      },
                      protein: {
                        type: "number",
                        format: "float",
                        example: 46.66,
                        description: "Calculated total protein (g).",
                      },
                      carbs: {
                        type: "number",
                        format: "float",
                        example: 0,
                        description: "Calculated total carbohydrates (g).",
                      },
                      fat: {
                        type: "number",
                        format: "float",
                        example: 5.42,
                        description: "Calculated total fat (g).",
                      },
                      serving_type: {
                        type: "string",
                        example: "100 g",
                        description: "Serving size used for base calculation.",
                      },
                    },
                    required: [
                      "meal_detail_id",
                      "food_id",
                      "name",
                      "amount_grams",
                      "calories",
                      "protein",
                      "carbs",
                      "fat",
                    ],
                  },
                },
              },
            },
          },
          400: errorResponse(
            "Bad Request: Missing meal_id.",
            "meal_id is required."
          ),
          404: errorResponse("Not Found: Meal not found.", "Meal not found."),
          500: errorResponse(
            "Internal Server Error: Failed to fetch data.",
            "Failed to fetch meal nutrition."
          ),
        },
      },
    },
    "/progress": {
      get: {
        tags: ["Progress"],
        summary:
          "Retrieve user progress summaries or daily GR scores for a month",
        description:
          "If `user_id`, `year`, and `month` are provided, calculates and returns the daily Growth Rate (GR) score for each completed workout session within that month. Otherwise, it returns the aggregated user progress summaries.",
        parameters: [
          {
            name: "user_id",
            in: "query",
            required: false,
            type: "integer",
            description:
              "The ID of the user. Required when fetching daily GR scores.",
            example: 1,
          },
          {
            name: "year",
            in: "query",
            required: false,
            type: "integer",
            description:
              "The year for which to retrieve daily GR scores (e.g., 2024). Requires `user_id` and `month`.",
            example: 2024,
          },
          {
            name: "month",
            in: "query",
            required: false,
            type: "integer",
            description:
              "The month (1-12) for which to retrieve daily GR scores. Requires `user_id` and `year`.",
            example: 5,
          },
        ],
        responses: {
          200: {
            description:
              "Daily GR scores for the specified month OR a list of all user progress summaries.",
            schema: {
              type: "array",
              items: {
                oneOf: [
                  {
                    description: "Daily GR Score (if year/month provided)",
                    type: "object",
                    properties: {
                      date: {
                        type: "string",
                        format: "date",
                        example: "2024-05-15",
                        description: "The date of the completed workout.",
                      },
                      gr_score: {
                        type: "integer",
                        example: 4500,
                        description: "The calculated daily Growth Rate score.",
                      },
                    },
                  },
                  {
                    description: "Progress Summary (if no date/month provided)",
                    // Assuming a Progress Summary definition exists or is simple:
                    type: "object",
                    properties: {
                      summary_id: { type: "integer" },
                      user_id: { type: "integer" },
                      period_start: { type: "string", format: "date" },
                      total_volume_lifted: { type: "number" },
                      // ... other summary fields
                    },
                  },
                ],
              },
            },
          },
          400: errorResponse(
            "Bad Request: Invalid parameters.",
            "Invalid user_id, year, or month. Month should be 1-12."
          ),
          404: errorResponse("Not Found: User not found.", "User not found."),
          500: errorResponse(
            "Internal Server Error: Failed to fetch data.",
            "Failed to fetch workouts."
          ),
        },
      },
    },
    "/summary": {
      get: {
        tags: ["Progress"],
        summary: "Retrieve user's fitness and nutrition summary for a period",
        description:
          "Calculates and returns a comprehensive summary of a user's fitness and nutrition metrics (workouts, calories, macros, GR score) for a specified weekly or monthly period. The summary is freshly generated by default.",
        parameters: [
          {
            name: "user_id",
            in: "query",
            required: true,
            type: "integer",
            description: "The ID of the user.",
            example: 1,
          },
          {
            name: "period_type",
            in: "query",
            required: true,
            type: "string",
            enum: ["weekly", "monthly"],
            description:
              "The duration of the summary period ('weekly' or 'monthly').",
            example: "weekly",
          },
          {
            name: "period_start",
            in: "query",
            required: true,
            type: "string",
            format: "date",
            description: "The start date of the period (YYYY-MM-DD).",
            example: "2024-05-01",
          },
        ],
        responses: {
          200: {
            description: "A comprehensive summary of user progress.",
            schema: {
              $ref: "#/definitions/SummaryPayload",
            },
          },
          400: errorResponse(
            "Bad Request: Missing required parameters.",
            "user_id, period_type, and period_start are required."
          ),
          404: errorResponse("Not Found: User not found.", "User not found."),
          500: errorResponse(
            "Internal Server Error: Failed to generate summary.",
            "Failed to get summary."
          ),
        },
      },
      post: {
        tags: ["Progress"],
        summary: "Generate and save a new user summary for a period",
        description:
          "Triggers the calculation, generation, and storage of a user's summary for a specified period (weekly or monthly). The generated summary is also returned.",
        parameters: [
          {
            name: "Summary Generation Request",
            in: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                user_id: {
                  type: "integer",
                  example: 1,
                  description: "The ID of the user (required).",
                },
                period_type: {
                  type: "string",
                  enum: ["weekly", "monthly"],
                  example: "monthly",
                  description: "The duration of the summary period (required).",
                },
                period_start: {
                  type: "string",
                  format: "date",
                  example: "2024-05-01",
                  description:
                    "The start date of the period (YYYY-MM-DD) (required).",
                },
              },
              required: ["user_id", "period_type", "period_start"],
            },
          },
        ],
        responses: {
          201: {
            description: "Summary generated and saved successfully.",
            schema: {
              $ref: "#/definitions/SummaryPayload",
            },
          },
          400: errorResponse(
            "Bad Request: Missing required fields.",
            "user_id, period_type, and period_start are required."
          ),
          404: errorResponse("Not Found: User not found.", "User not found."),
          500: errorResponse(
            "Internal Server Error: Failed to generate summary.",
            "Failed to generate summary."
          ),
        },
      },
    },
    "/users": {
      get: {
        tags: ["Auth"],
        summary: "Get logged in user information",
        description:
          "Retrieves the current authenticated user's information based on the JWT token provided in the Authorization header. Returns user details excluding sensitive information like password hash.",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            type: "string",
            description: "Bearer token (JWT) for authentication.",
            example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
        ],
        responses: {
          200: {
            description: "User information retrieved successfully.",
            schema: {
              type: "object",
              properties: {
                user_id: {
                  type: "integer",
                  example: 1,
                  description: "Unique ID of the user.",
                },
                username: {
                  type: "string",
                  example: "john_doe",
                  description: "The user's username.",
                },
                email: {
                  type: "string",
                  format: "email",
                  example: "john.doe@example.com",
                  description: "The user's email address.",
                },
                phone_number: {
                  type: "string",
                  example: "+1234567890",
                  description: "The user's phone number (optional).",
                },
                created_at: {
                  type: "string",
                  format: "date-time",
                  example: "2024-01-15T10:30:00Z",
                  description: "Timestamp of user account creation.",
                },
              },
              required: ["user_id", "username", "email"],
            },
          },
          401: errorResponse(
            "Unauthorized: Missing or invalid token.",
            "Authorization token required."
          ),
          404: errorResponse(
            "Not Found: User does not exist.",
            "User not found."
          ),
          500: errorResponse(
            "Internal Server Error: Failed to fetch data.",
            "An unexpected error occurred while fetching user information."
          ),
        },
      },
      put: {
        tags: ["Auth"],
        summary: "Update user information",
        description:
          "Updates the authenticated user's information. Allows updating username, email, and/or phone_number. All fields are optional, but at least one must be provided. Email and phone_number must be unique if provided.",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            type: "string",
            description: "Bearer token (JWT) for authentication.",
            example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
          {
            name: "User Update Data",
            in: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                username: {
                  type: "string",
                  example: "updated_username",
                  description: "Optional: New username.",
                },
                email: {
                  type: "string",
                  format: "email",
                  example: "newemail@example.com",
                  description: "Optional: New email address. Must be unique.",
                },
                phone_number: {
                  type: "string",
                  example: "+1234567890",
                  description:
                    "Optional: New phone number. Must be unique. Can be set to empty string or null to clear.",
                },
              },
            },
          },
        ],
        responses: {
          200: {
            description: "User information updated successfully.",
            schema: {
              type: "object",
              properties: {
                user_id: {
                  type: "integer",
                  example: 1,
                  description: "Unique ID of the user.",
                },
                username: {
                  type: "string",
                  example: "updated_username",
                  description: "The user's username.",
                },
                email: {
                  type: "string",
                  format: "email",
                  example: "newemail@example.com",
                  description: "The user's email address.",
                },
                phone_number: {
                  type: "string",
                  example: "+1234567890",
                  description: "The user's phone number (optional).",
                },
                created_at: {
                  type: "string",
                  format: "date-time",
                  example: "2024-01-15T10:30:00Z",
                  description: "Timestamp of user account creation.",
                },
              },
              required: ["user_id", "username", "email"],
            },
          },
          400: errorResponse(
            "Bad Request: No fields provided for update.",
            "At least one field (username, email, or phone_number) must be provided."
          ),
          401: errorResponse(
            "Unauthorized: Missing or invalid token.",
            "Authorization token required."
          ),
          404: errorResponse(
            "Not Found: User does not exist.",
            "User not found."
          ),
          409: {
            description: "Conflict: Email or phone number already in use.",
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  examples: [
                    "Email already in use.",
                    "Phone number already in use.",
                  ],
                },
              },
            },
          },
          500: errorResponse(
            "Internal Server Error: Failed to update user.",
            "An unexpected error occurred while updating user information."
          ),
        },
      },
    },
    "/users/password": {
      put: {
        tags: ["Auth"],
        summary: "Change user password",
        description:
          "Updates the password for the authenticated user. Requires the current password for verification and a new password. The new password must be at least 6 characters long and different from the current password.",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            type: "string",
            description: "Bearer token (JWT) for authentication.",
            example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
          {
            name: "Password Change Request",
            in: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                old_password: {
                  type: "string",
                  format: "password",
                  example: "currentPassword123",
                  description: "The user's current password for verification.",
                },
                new_password: {
                  type: "string",
                  format: "password",
                  example: "newSecurePassword456",
                  description:
                    "The new password. Must be at least 6 characters long and different from the old password.",
                },
              },
              required: ["old_password", "new_password"],
            },
          },
        ],
        responses: {
          200: {
            description: "Password updated successfully.",
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Password updated successfully.",
                },
              },
            },
          },
          400: {
            description: "Bad Request: Validation error.",
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  examples: [
                    "Old password and new password are required.",
                    "New password must be at least 6 characters long.",
                    "New password must be different from the old password.",
                  ],
                },
              },
            },
          },
          401: {
            description: "Unauthorized: Invalid token or incorrect password.",
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  examples: [
                    "Authorization token required.",
                    "Invalid or expired token.",
                    "Old password is incorrect.",
                  ],
                },
              },
            },
          },
          404: errorResponse(
            "Not Found: User does not exist.",
            "User not found."
          ),
          500: errorResponse(
            "Internal Server Error: Failed to update password.",
            "An unexpected error occurred while changing password."
          ),
        },
      },
    },
    "/workout-plans": {
      get: {
        tags: ["Exercises"],
        summary: "Retrieve all workout plans or a specific plan's details",
        description:
          "If no `plan_id` is provided, returns a list of all available workout plans with their names, descriptions, and number of days. If a `plan_id` is provided, returns the single, detailed plan including all exercises.",
        parameters: [
          {
            name: "plan_id",
            in: "query",
            required: false,
            type: "integer",
            description:
              "Optional: ID of a specific workout plan to retrieve detailed information for.",
            example: 1,
          },
        ],
        responses: {
          200: {
            description:
              "A list of summarized workout plans (if no plan_id) or a single detailed workout plan.",
            // This schema represents the single, detailed workout plan structure.
            // When listing all plans, the response is an array of objects containing only plan_id, name, description, and an array of plan_days with only day_number.
            schema: {
              type: "array",
              items: {
                type: "object",
                description: "A detailed workout plan object.",
                properties: {
                  plan_id: { type: "integer", example: 1 },
                  name: { type: "string", example: "5x5 Strength Program" },
                  description: {
                    type: "string",
                    example: "A classic full-body strength routine.",
                  },
                  plan_days: {
                    type: "array",
                    description: "Details for each day in the plan.",
                    items: {
                      type: "object",
                      properties: {
                        plan_day_id: { type: "integer", example: 101 },
                        day_number: {
                          type: "integer",
                          example: 1,
                          description:
                            "The order of the day in the plan (1-7).",
                        },
                        day_type: {
                          type: "string",
                          nullable: true,
                          example: "Workout A",
                        },
                        plan_day_exercises: {
                          type: "array",
                          description: "Exercises scheduled for this day.",
                          items: {
                            type: "object",
                            properties: {
                              plan_day_exercise_id: {
                                type: "integer",
                                example: 501,
                              },
                              exercise_id: { type: "integer", example: 2 },
                              sets: {
                                type: "integer",
                                nullable: true,
                                example: 5,
                              },
                              reps: {
                                type: "integer",
                                nullable: true,
                                example: 5,
                              },
                              exercises: {
                                type: "object",
                                description:
                                  "Details of the associated exercise.",
                                properties: {
                                  exercise_id: { type: "integer", example: 2 },
                                  name: { type: "string", example: "Squat" },
                                  category: { type: "string", example: "Legs" },
                                  description: { type: "string" },
                                },
                                required: ["exercise_id", "name", "category"],
                              },
                            },
                            required: ["exercise_id", "sets", "reps"],
                          },
                        },
                      },
                      required: ["plan_day_id", "day_number"],
                    },
                  },
                },
                required: ["plan_id", "name", "description"],
              },
            },
          },
          400: errorResponse(
            "Bad Request: Invalid plan_id.",
            "Invalid plan_id provided."
          ),
          404: errorResponse(
            "Not Found: Workout plan does not exist.",
            "Workout plan not found."
          ),
          500: errorResponse(
            "Internal Server Error: Failed to fetch data.",
            "Failed to fetch workout plans."
          ),
        },
      },
      post: {
        tags: ["Exercises"],
        summary: "Apply a workout plan to a user's schedule",
        description:
          "Creates scheduled workout sessions for a user, based on a specified `plan_id`, starting on a given `start_date` and spanning the duration of the plan.",
        parameters: [
          {
            name: "Apply Plan Request",
            in: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                user_id: {
                  type: "integer",
                  example: 1,
                  description:
                    "The ID of the user to apply the plan to (required).",
                },
                plan_id: {
                  type: "integer",
                  example: 1,
                  description: "The ID of the plan to apply (required).",
                },
                start_date: {
                  type: "string",
                  format: "date",
                  example: "2024-06-01",
                  description:
                    "The date the plan should start (YYYY-MM-DD) (required).",
                },
              },
              required: ["user_id", "plan_id", "start_date"],
            },
          },
        ],
        responses: {
          200: messageResponse(
            "Plan successfully applied and sessions created.",
            "Workout plan successfully applied, 3 sessions created starting 2024-06-01."
          ),
          400: errorResponse(
            "Bad Request: Missing required fields.",
            "user_id, plan_id, and start_date are required."
          ),
          404: errorResponse(
            "Not Found: User or Plan not found.",
            "User or workout plan not found."
          ),
          500: errorResponse(
            "Internal Server Error: Failed to create sessions.",
            "Failed to create workout sessions from plan."
          ),
        },
      },
    },
    "/workout-sessions": {
      get: {
        tags: ["Exercises"],
        summary: "Retrieve a list of sessions or a single detailed session",
        description:
          "Fetches a list of workout sessions for a user, optionally filtered by month (YYYY-MM), or a single, detailed session by `session_id`. The detailed session includes all exercises and logs.",
        parameters: [
          {
            name: "user_id",
            in: "query",
            required: false,
            type: "integer",
            description:
              "ID of the user to retrieve sessions for. Required if session_id is not provided.",
            example: 1,
          },
          {
            name: "session_id",
            in: "query",
            required: false,
            type: "integer",
            description:
              "ID of a specific session to retrieve details for. Overrides user_id/month filter.",
            example: 101,
          },
          {
            name: "month",
            in: "query",
            required: false,
            type: "string",
            format: "YYYY-MM",
            description:
              "Optional filter to restrict sessions to a specific month (e.g., '2024-05'). Requires user_id.",
            example: "2024-05",
          },
        ],
        responses: {
          200: {
            description:
              "A single detailed workout session or a list of sessions.",
            schema: {
              type: "array",
              description: "Array of workout sessions.",
              items: {
                type: "object",
                properties: {
                  session_id: { type: "integer", example: 101 },
                  user_id: { type: "integer", example: 1 },
                  scheduled_date: {
                    type: "string",
                    format: "date",
                    example: "2024-05-20",
                    description: "The planned date for the workout.",
                  },
                  completed: {
                    type: "boolean",
                    example: true,
                    description:
                      "True if the session has been marked complete.",
                  },
                  notes: {
                    type: "string",
                    example: "Plan day 1",
                    description:
                      "Notes or source of the session (e.g., Plan day X).",
                  },
                  session_details: {
                    type: "array",
                    description:
                      "List of exercises planned/executed in the session.",
                    items: {
                      type: "object",
                      properties: {
                        session_detail_id: { type: "integer", example: 501 },
                        exercise_id: { type: "integer", example: 2 },
                        planned_sets: { type: "integer", example: 5 },
                        planned_reps: { type: "integer", example: 5 },
                        exercises: {
                          type: "object",
                          description: "Details of the associated exercise.",
                          properties: {
                            exercise_id: { type: "integer", example: 2 },
                            name: { type: "string", example: "Squat" },
                            category: { type: "string", example: "Legs" },
                          },
                          required: ["exercise_id", "name", "category"],
                        },
                        exercise_logs: {
                          type: "array",
                          description:
                            "Logs of actual sets/reps/weight performed.",
                          items: {
                            type: "object",
                            properties: {
                              log_id: { type: "integer", example: 901 },
                              actual_sets: { type: "integer", example: 5 },
                              actual_reps: { type: "integer", example: 5 },
                              weight_kg: { type: "number", example: 100.5 },
                              log_timestamp: {
                                type: "string",
                                format: "date-time",
                              },
                            },
                            required: ["log_id", "actual_sets", "actual_reps"],
                          },
                        },
                      },
                      required: ["session_detail_id", "exercise_id"],
                    },
                  },
                },
                required: [
                  "session_id",
                  "user_id",
                  "scheduled_date",
                  "completed",
                ],
              },
            },
          },
          400: errorResponse(
            "Bad Request: Missing ID.",
            "user_id or session_id required."
          ),
          404: errorResponse(
            "Not Found: Session(s) not found.",
            "No sessions found for user/id."
          ),
          500: errorResponse(
            "Internal Server Error: Failed to fetch data.",
            "Failed to fetch workout sessions."
          ),
        },
      },
      post: {
        tags: ["Exercises"],
        summary: "Get session details, create a session, add an exercise, or log a set/rep",
        description:
          "Handles four operations: 1. Get session details with exercises and logs (`session_id` only in body). 2. Creating a new empty workout session (`user_id` and `scheduled_date`). 3. Adding a planned exercise to an existing session (`session_id`, `exercises` array). 4. Logging a set/rep for an exercise slot (`session_detail_id`, `log` object).",
        parameters: [
          {
            name: "Workout Operation",
            in: "body",
            required: true,
            schema: {
              type: "object",
              description:
                "Input fields depend on the operation (get session details, create session, add exercise, or log set).",
              properties: {
                // Used for getting session details
                session_id: {
                  type: "integer",
                  example: 72,
                  description:
                    "ID of the session to retrieve details for. When provided alone (without exercises or log), returns session details with exercises and logs.",
                },
                // Used for creating a new session
                user_id: {
                  type: "integer",
                  example: 1,
                  description: "Required for creating a new session.",
                },
                scheduled_date: {
                  type: "string",
                  format: "date",
                  example: "2024-05-25",
                  description: "Required for creating a new session.",
                },
                type: {
                  type: "string",
                  example: "Full Body",
                  description: "Optional workout type for new session.",
                },
                notes: {
                  type: "string",
                  example: "Plan day 1",
                  description: "Optional notes for new session.",
                },
                // Used for adding exercises to a session
                exercises: {
                  type: "array",
                  description:
                    "Array of exercises to add to session. Requires session_id.",
                  items: {
                    type: "object",
                    properties: {
                      exercise_id: { type: "integer", example: 2 },
                      planned_sets: { type: "integer", example: 3 },
                      planned_reps: { type: "integer", example: 8 },
                    },
                    required: ["exercise_id"],
                  },
                },
                // Used for logging a set/rep
                session_detail_id: {
                  type: "integer",
                  example: 501,
                  description: "Required for logging a workout.",
                },
                log: {
                  type: "object",
                  description: "Log data for a workout.",
                  properties: {
                    actual_sets: { type: "integer", example: 1 },
                    actual_reps: { type: "integer", example: 8 },
                    weight_kg: { type: "number", format: "float", example: 50.5 },
                    duration_seconds: { type: "integer", example: 300 },
                    notes: { type: "string", example: "Felt strong" },
                  },
                  required: ["actual_sets", "actual_reps"],
                },
              },
            },
          },
        ],
        responses: {
          200: {
            description:
              "Session details retrieved successfully (when session_id is provided alone).",
            schema: {
              type: "object",
              properties: {
                details: {
                  type: "array",
                  description:
                    "Array of session details (exercises planned for the session).",
                  items: {
                    type: "object",
                    properties: {
                      session_detail_id: {
                        type: "integer",
                        example: 181,
                        description: "Unique ID of the session detail.",
                      },
                      session_id: {
                        type: "integer",
                        example: 72,
                        description: "ID of the parent workout session.",
                      },
                      exercise_id: {
                        type: "integer",
                        example: 2,
                        description: "ID of the exercise.",
                      },
                      planned_sets: {
                        type: "integer",
                        example: 3,
                        description: "Number of sets planned.",
                      },
                      planned_reps: {
                        type: "integer",
                        example: 12,
                        description: "Number of reps planned per set.",
                      },
                      exercises: {
                        type: "object",
                        description: "Details of the associated exercise.",
                        properties: {
                          name: {
                            type: "string",
                            example: "Incline Barbell Bench Press",
                            description: "Name of the exercise.",
                          },
                          category: {
                            type: "string",
                            example: "Chest",
                            description: "Muscle group category.",
                          },
                          description: {
                            type: "string",
                            example:
                              "Emphasizes upper chest and front deltoids.",
                            description: "Exercise description.",
                          },
                        },
                        required: ["name", "category"],
                      },
                    },
                    required: [
                      "session_detail_id",
                      "session_id",
                      "exercise_id",
                      "exercises",
                    ],
                  },
                },
                logs: {
                  type: "array",
                  description:
                    "Array of exercise logs (actual sets/reps/weight performed).",
                  items: {
                    type: "object",
                    properties: {
                      log_id: {
                        type: "integer",
                        example: 901,
                        description: "Unique ID of the log entry.",
                      },
                      session_detail_id: {
                        type: "integer",
                        example: 181,
                        description:
                          "ID of the session detail this log belongs to.",
                      },
                      actual_sets: {
                        type: "integer",
                        example: 3,
                        description: "Number of sets actually performed.",
                      },
                      actual_reps: {
                        type: "integer",
                        example: 12,
                        description: "Number of reps actually performed.",
                      },
                      weight_kg: {
                        type: "number",
                        example: 100.5,
                        description: "Weight used in kilograms (optional).",
                      },
                      duration_seconds: {
                        type: "integer",
                        example: 300,
                        description:
                          "Duration of the exercise in seconds (optional).",
                      },
                      notes: {
                        type: "string",
                        example: "Felt strong today",
                        description: "Optional notes for this log entry.",
                      },
                    },
                    required: [
                      "log_id",
                      "session_detail_id",
                      "actual_sets",
                      "actual_reps",
                    ],
                  },
                },
              },
              required: ["details", "logs"],
            },
          },
          201: messageResponse(
            "Operation successful.",
            "Session created/Exercise added/Set logged successfully."
          ),
          400: errorResponse(
            "Bad Request: Missing or invalid fields.",
            "Missing required fields for the specified operation."
          ),
          404: errorResponse(
            "Not Found: Entity not found.",
            "User, session, or session detail not found."
          ),
          500: errorResponse(
            "Internal Server Error: Failed to save data.",
            "Failed to create session/add exercise/log set."
          ),
        },
      },
      put: {
        tags: ["Exercises"],
        summary: "Update session status, session detail status, or exercise details",
        description:
          "Handles three operations: 1. Mark a workout session as completed (`session_id`). 2. Update session detail status (`session_detail_id` and `status`). 3. Update planned sets/reps for a specific exercise (`session_detail_id`, `planned_sets`, `planned_reps`).",
        parameters: [
          {
            name: "Update Session/Detail",
            in: "body",
            required: true,
            schema: {
              type: "object",
              description:
                "Must contain either session_id for completion, session_detail_id with status for status update, or session_detail_id with planned_sets/reps for exercise update.",
              properties: {
                // Used for marking a session complete
                session_id: {
                  type: "integer",
                  example: 101,
                  description: "ID of the session to mark as completed.",
                },
                // Used for updating session detail status
                session_detail_id: {
                  type: "integer",
                  example: 501,
                  description:
                    "ID of the session detail to update. Use with status to update status, or with planned_sets/reps to update exercise details.",
                },
                status: {
                  type: "boolean",
                  example: true,
                  description:
                    "Status value for the session detail (true or false). Default is false. Used with session_detail_id.",
                },
                // Used for updating planned reps/sets of an exercise detail
                planned_sets: {
                  type: "integer",
                  example: 4,
                  description: "New planned set count. Used with session_detail_id.",
                },
                planned_reps: {
                  type: "integer",
                  example: 6,
                  description: "New planned rep count. Used with session_detail_id.",
                },
              },
            },
          },
        ],
        responses: {
          200: {
            description: "Update successful.",
            schema: {
              oneOf: [
                {
                  type: "object",
                  description: "Response when updating session detail status",
                  properties: {
                    message: {
                      type: "string",
                      example: "Session detail status updated successfully.",
                    },
                    status: {
                      type: "boolean",
                      example: true,
                      description: "The updated status value.",
                    },
                  },
                },
                {
                  type: "object",
                  description: "Response when marking session complete",
                  properties: {
                    message: {
                      type: "string",
                      example: "Session marked as completed successfully.",
                    },
                  },
                },
              ],
            },
          },
          400: errorResponse(
            "Bad Request: Missing ID or update field.",
            "session_id or session_detail_id with status/planned_sets/planned_reps are required."
          ),
          404: errorResponse(
            "Not Found: Session/Detail not found.",
            "Workout session or detail not found."
          ),
          500: errorResponse(
            "Internal Server Error: Failed to update.",
            "Failed to update workout session/detail."
          ),
        },
      },
      delete: {
        tags: ["Exercises"],
        summary: "Delete a session, session detail, or a single log",
        description:
          "Deletes a full workout session (`session_id`), a specific session detail/exercise within a session (`session_detail_id`), or a single set/rep log (`log_id`). When deleting a session detail, all associated exercise logs are also deleted. Only one ID should be provided in the request body.",
        parameters: [
          {
            name: "Delete Request",
            in: "body",
            required: true,
            schema: {
              type: "object",
              description:
                "Must contain one of: session_id, session_detail_id, or log_id.",
              properties: {
                session_id: {
                  type: "integer",
                  example: 101,
                  description:
                    "ID of the full workout session to delete. This will delete the session, all its session details, and all associated exercise logs.",
                },
                session_detail_id: {
                  type: "integer",
                  example: 501,
                  description:
                    "ID of the session detail (exercise) to delete from the session. This will delete the session detail and all associated exercise logs.",
                },
                log_id: {
                  type: "integer",
                  example: 901,
                  description: "ID of a single exercise log entry to delete.",
                },
              },
            },
          },
        ],
        responses: {
          200: {
            description: "Deletion successful.",
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  examples: [
                    "Session deleted successfully.",
                    "Session detail deleted successfully.",
                    "Log deleted successfully.",
                  ],
                },
              },
            },
          },
          400: errorResponse(
            "Bad Request: Missing ID.",
            "One of session_id, session_detail_id, or log_id is required."
          ),
          404: errorResponse(
            "Not Found: Entity not found.",
            "Session detail not found."
          ),
          500: errorResponse(
            "Internal Server Error: Failed to delete.",
            "Failed to delete entity."
          ),
        },
      },
    },
    "/workout-sessions/types": {
      get: {
        tags: ["Exercises"],
        summary: "Get all unique workout types",
        description:
          "Retrieves a list of all unique workout types from the workout_sessions table. Returns a sorted array of distinct workout type values, excluding null or empty values.",
        responses: {
          200: {
            description: "List of unique workout types retrieved successfully.",
            schema: {
              type: "object",
              properties: {
                types: {
                  type: "array",
                  description: "Array of unique workout types, sorted alphabetically.",
                  items: {
                    type: "string",
                  },
                  example: ["Cardio", "Full Body", "Legs", "Upper Body"],
                },
              },
              required: ["types"],
            },
          },
          500: errorResponse(
            "Internal Server Error: Failed to fetch workout types.",
            "An unexpected error occurred while fetching workout types."
          ),
        },
      },
    },
  },
};

export async function GET() {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Train Diary API Documentation</title>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
          <style>
            .swagger-ui .examples-select { margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div id="swagger-ui"></div>
          <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js" crossorigin></script>
          <script>
            window.onload = () => {
              window.ui = SwaggerUIBundle({
                spec: ${JSON.stringify(spec)},
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                  SwaggerUIBundle.presets.apis,
                  SwaggerUIBundle.SwaggerUIStandalonePreset
                ],
              });
            };
          </script>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error generating Swagger UI:", error);
    return NextResponse.json(
      { error: `Failed to generate API documentation: ${message}` },
      { status: 500 }
    );
  }
}
