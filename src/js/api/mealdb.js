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
    console.log("error");
    throw new Error(errorMessage);
  }

  console.log("fetched");
  return response.json();
}

// Generic Fetcher
async function fetchMealsData(url, method = "GET") {
  let resultObject = {};
  try {
    let shouldRetry = true;

    while (shouldRetry) {
      let response = await fetch(url, { method: method });
      let responseData = await response.json();

      resultObject.status = response.ok;
      resultObject.data = [];

      if (response.ok) {
        shouldRetry = false;
        resultObject.message = "";
        resultObject.data = responseData.results;
        console.log("success");
      } else {
        shouldRetry = true;
        resultObject.message = "invalid response";
        console.log("retrying");
      }
    }
  } catch (error) {
    resultObject.message = `Error: ${error}`;
    console.log("failed");
  }

  return resultObject;
}

// Get Areas
export async function getAreas() {
  console.log("areas");
  try {
    let response = await fetch(`${API_BASE_URL}/meals/areas`, {
      method: "GET",
    });
    // console.log('meal DB');
    let responseData = await response.json();

    if (response.ok) return responseData.results;
    else return [];
  } catch (error) {
    console.log("error ==>", error);
    return [];
  }
}

// Get Categories
export async function getCategories() {
  console.log("categories");
  try {
    let response = await fetch(`${API_BASE_URL}/meals/categories`, {
      method: "GET",
    });
    let responseData = await response.json();

    if (response.ok) return responseData.results;
    else return [];
  } catch (error) {
    console.log("error");
    return [];
  }
}

// Random Meals
export async function getRandomMeals(count) {
  console.log("random");
  return fetchMealsData(
    `${API_BASE_URL}/meals/random?count=${count}`,
    "GET"
  );
}

// Filter Area
export async function getMealsByArea(areaName) {
  console.log("filtering");
  return fetchMealsData(
    `${API_BASE_URL}/meals/filter?area=${areaName}&limit=25`,
    "GET"
  );
}

// Filter Category
export async function getMealsByCategory(categoryName) {
  console.log("filtering");
  return fetchMealsData(
    `${API_BASE_URL}/meals/filter?category=${categoryName}&limit=25`,
    "GET"
  );
}

// Search Meals
export async function searchMeals(query) {
  console.log("searching");
  return fetchMealsData(
    `${API_BASE_URL}/meals/search?q=${query}`,
    "GET"
  );
}

// Get Meal
export async function getMealById(mealId) {
  console.log("meal");
  let resultObject = {};
  try {
    let response = await fetch(`${API_BASE_URL}/meals/${mealId}`, {
      method: "GET",
    });
    let responseData = await response.json();

    resultObject.status = response.ok;
    resultObject.data = [];

    if (response.ok) {
      resultObject.data.push(responseData.result);
      resultObject.message = "Success";
      console.log("loaded");
    } else {
      resultObject.message = "invalid response";
      console.log("failed");
    }
  } catch (error) {
    resultObject.message = `Error: ${error}`;
    console.log("error");
  }
  return resultObject;
}

// Search Products
export async function searchProducts(query) {
  console.log("products");
  return apiRequest(`/products/search?q=${query}`);
}

// Get Barcode
export async function getProductByBarcode(barcode) {
  console.log("barcode");
  return apiRequest(`/products/barcode/${encodeURIComponent(barcode)}`);
}

// Product Categories
export async function getProductCategories() {
  console.log("categories");
  return apiRequest(`/products/categories?page=1&limit=12`);
}

// Category Products
export async function getProductsByCategory(categoryName) {
  console.log("filtering");
  return apiRequest(
    `/products/category/${categoryName}?page=1&limit=24`
  );
}

// Analyze Nutrition
export async function analyzeMealNutrition({ title, ingredients } = {}) {
  console.log("analyzing");
  return apiRequest(`/nutrition/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": USDA_API_KEY,
    },
    body: JSON.stringify({ title, ingredients }),
  });
}