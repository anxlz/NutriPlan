// API Configuration
let baseApiUrl = "https://nutriplan-api.vercel.app/api";

// Generic Fetcher
async function fetchApiData(url, method = "GET") {
  let resultObject = {};
  try {
    let shouldRetry = true;

    while (shouldRetry) {
      let apiResponse = await fetch(url, { method: method });
      let responseData = await apiResponse.json();

      resultObject.status = apiResponse.ok;
      resultObject.data = [];

      if (apiResponse.ok) {
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
    let apiResponse = await fetch(`${baseApiUrl}/meals/areas`, { method: "GET" });
    let responseData = await apiResponse.json();

    if (apiResponse.ok) {
      console.log("success");
      return responseData.results;
    } else {
      console.log("failed");
      return [];
    }
  } catch (error) {
    console.log("error");
    return [];
  }
}

// Get Categories
export async function getCategories() {
  console.log("categories");
  try {
    let apiResponse = await fetch(`${baseApiUrl}/meals/categories`, { method: "GET" });
    let responseData = await apiResponse.json();

    if (apiResponse.ok) {
      console.log("success");
      return responseData.results;
    } else {
      console.log("failed");
      return [];
    }
  } catch (error) {
    console.log("error");
    return [];
  }
}

// Random Meals
export async function getRandomMeals(mealsCount) {
  console.log("random");
  return fetchApiData(`${baseApiUrl}/meals/random?count=${mealsCount}`, "GET");
}

// Filter Area
export async function getMealsByArea(areaName) {
  console.log("filtering");
  return fetchApiData(`${baseApiUrl}/meals/filter?area=${areaName}&limit=25`, "GET");
}

// Filter Category
export async function getMealsByCategory(categoryName) {
  console.log("filtering");
  return fetchApiData(`${baseApiUrl}/meals/filter?category=${categoryName}&limit=25`, "GET");
}

// Search Meals
export async function searchMeals(searchQuery) {
  console.log("searching");
  return fetchApiData(`${baseApiUrl}/meals/search?q=${searchQuery}`, "GET");
}

// Get Meal
export async function getMealById(mealId) {
  console.log("meal");
  let resultObject = {};
  try {
    let apiResponse = await fetch(`${baseApiUrl}/meals/${mealId}`, { method: "GET" });
    let responseData = await apiResponse.json();

    resultObject.status = apiResponse.ok;
    resultObject.data = [];

    if (apiResponse.ok) {
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
export async function searchProducts(searchQuery) {
  console.log("products");
  try {
    let apiResponse = await fetch(`${baseApiUrl}/products/search?q=${searchQuery}`, { method: "GET" });
    let responseData = await apiResponse.json();

    if (apiResponse.ok) {
      console.log("success");
      return { status: true, data: responseData.results };
    } else {
      console.log("failed");
      return { status: false, data: [], message: "Search failed" };
    }
  } catch (error) {
    console.log("error");
    return { status: false, data: [], message: error.message };
  }
}

// Get Barcode
export async function getProductByBarcode(barcode) {
  console.log("barcode");
  try {
    let apiResponse = await fetch(`${baseApiUrl}/products/barcode/${encodeURIComponent(barcode)}`, { method: "GET" });
    let responseData = await apiResponse.json();

    if (apiResponse.ok) {
      console.log("success");
      return { status: true, result: responseData.result };
    } else {
      console.log("failed");
      return { status: false, result: null, message: "Barcode not found" };
    }
  } catch (error) {
    console.log("error");
    return { status: false, result: null, message: error.message };
  }
}

// Product Categories
export async function getProductCategories() {
  console.log("categories");
  try {
    let apiResponse = await fetch(`${baseApiUrl}/products/categories?page=1&limit=12`, { method: "GET" });
    let responseData = await apiResponse.json();

    if (apiResponse.ok) {
      console.log("success");
      return { status: true, results: responseData.results };
    } else {
      console.log("failed");
      return { status: false, results: [] };
    }
  } catch (error) {
    console.log("error");
    return { status: false, results: [] };
  }
}

// Category Products
export async function getProductsByCategory(categoryName) {
  console.log("filtering");
  try {
    let apiResponse = await fetch(`${baseApiUrl}/products/category/${encodeURIComponent(categoryName)}?page=1&limit=24`, { method: "GET" });
    let responseData = await apiResponse.json();

    if (apiResponse.ok) {
      console.log("success");
      return { status: true, data: responseData.results };
    } else {
      console.log("failed");
      return { status: false, data: [] };
    }
  } catch (error) {
    console.log("error");
    return { status: false, data: [] };
  }
}

// Analyze Nutrition
export async function analyzeMealNutrition({ title, ingredients } = {}) {
  console.log("analyzing");
  try {
    let apiResponse = await fetch(`${baseApiUrl}/nutrition/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "ugVYTdbTbTi0OZC3FuUnlh1jbC8SHBZMeKcpDzeI",
      },
      body: JSON.stringify({ title, ingredients }),
    });

    let responseData = await apiResponse.json();

    if (apiResponse.ok) {
      console.log("success");
      return { status: true, data: responseData.data };
    } else {
      console.log("failed");
      return { status: false, data: null, message: responseData.error?.message || "Analysis failed" };
    }
  } catch (error) {
    console.log("error");
    return { status: false, data: null, message: error.message };
  }
}
