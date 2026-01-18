// API Config
let API_BASE_URL = "https://nutriplan-api.vercel.app/api";
let USDA_API_KEY = "ugVYTdbTbTi0OZC3FuUnlh1jbC8SHBZMeKcpDzeI";

// Request Handler
async function apiRequest(endpoint, options = {}) {
  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      accept: "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `API error: ${response.status}`;
    // console.log("error");
    throw new Error(errorMessage);
  }

//   console.log("fetched");
  return response.json();
}

// Get Categories
export async function getCategories() {
//   console.log("categories");
  return apiRequest(`/meals/categories`);
}

// Get Areas
export async function getAreas() {
//   console.log("areas");
  return apiRequest(`/meals/areas`);
}

// Search Meals
export async function searchMeals({ q = "", page = 1, limit = 25 } = {}) {
  let queryParams = new URLSearchParams();
  if (q) queryParams.set("q", q);
  if (page != null) queryParams.set("page", String(page));
  if (limit != null) queryParams.set("limit", String(limit));
  
//   console.log("searching");
  return apiRequest(`/meals/search?${queryParams.toString()}`);
}

// Filter Meals
export async function filterMeals({
  category,
  area,
  ingredient,
  limit = 25,
} = {}) {
  let queryParams = new URLSearchParams();
  if (category) queryParams.set("category", category);
  if (area) queryParams.set("area", area);
  if (ingredient) queryParams.set("ingredient", ingredient);
  if (limit != null) queryParams.set("limit", String(limit));
  
//   console.log("filtering");
  return apiRequest(`/meals/filter?${queryParams.toString()}`);
}

// Get Meal
export async function getMealById(mealId) {
//   console.log("meal");
  return apiRequest(`/meals/${encodeURIComponent(mealId)}`);
}

// Random Meals
export async function getRandomMeals(count = 1) {
  let queryParams = new URLSearchParams();
  queryParams.set("count", String(count));
  
//   console.log("random");
  return apiRequest(`/meals/random?${queryParams.toString()}`);
}

// Search Products
export async function searchProducts(query) {
  let queryParams = new URLSearchParams();
  queryParams.set("q", query);
  
//   console.log("products");
  return apiRequest(`/products/search?${queryParams.toString()}`);
}

// Get Product
export async function getProductByBarcode(barcode) {
//   console.log("barcode");
  return apiRequest(`/products/barcode/${encodeURIComponent(barcode)}`);
}

// Analyze Nutrition
export async function analyzeMealNutrition({ title, ingredients } = {}) {
//   console.log("analyzing");
  return apiRequest(`/nutrition/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": USDA_API_KEY,
    },
    body: JSON.stringify({ title, ingredients }),
  });
}