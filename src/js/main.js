// API Imports
import {
  getCategories,
  getAreas,
  searchMeals,
  filterMeals,
  getMealById,
  searchProducts,
  getProductByBarcode,
  analyzeMealNutrition,
} from "./api/mealdb.js";

// State Import
import { appState } from "./state/appState.js";

// UI Imports
import {
  skeletonCards,
  renderCategories,
  renderCountries,
  renderMealsGrid,
  renderMealDetails,
  renderProductsGrid,
  renderFoodLog,
  renderWeeklyChart,
  escapeHtml,
} from "./ui/components.js";

// DOM Elements
let domElements = {
  loadingOverlay: document.getElementById("app-loading-overlay"),
  sidebar: document.getElementById("sidebar"),
  navLinks: Array.from(document.querySelectorAll(".nav-link")),
  searchFiltersSection: document.getElementById("search-filters-section"),
  mealCategoriesSection: document.getElementById("meal-categories-section"),
  allRecipesSection: document.getElementById("all-recipes-section"),
  mealDetails: document.getElementById("meal-details"),
  productsSection: document.getElementById("products-section"),
  foodlogSection: document.getElementById("foodlog-section"),
  searchInput: document.getElementById("search-input"),
  categoriesGrid: document.getElementById("categories-grid"),
  countriesGrid: document.getElementById("countries-grid"),
  recipesGrid: document.getElementById("recipes-grid"),
  recipesCount: document.getElementById("recipes-count"),
  backToMealsBtn: document.getElementById("back-to-meals-btn"),
  logMealBtn: document.getElementById("log-meal-btn"),
  productSearchInput: document.getElementById("product-search-input"),
  barcodeInput: document.getElementById("barcode-input"),
  searchProductBtn: document.getElementById("search-product-btn"),
  lookupBarcodeBtn: document.getElementById("lookup-barcode-btn"),
  productsGrid: document.getElementById("products-grid"),
  productsCount: document.getElementById("products-count"),
  nutriScoreBtns: Array.from(document.querySelectorAll(".nutri-score-filter")),
  foodlogDate: document.getElementById("foodlog-date"),
  foodlogTodaySection: document.getElementById("foodlog-today-section"),
  loggedItemsList: document.getElementById("logged-items-list"),
  clearFoodlogBtn: document.getElementById("clear-foodlog"),
  weeklyChart: document.getElementById("weekly-chart"),
};

// Nutrition Targets
let NUTRITION_TARGETS = {
  calories: 2000,
  protein: 50,
  carbs: 250,
  fat: 65,
};

// Products State
let productsFilterState = {
  items: [],
  selectedGrade: "",
};

// Hide Loading
function hideLoadingOverlay() {
  if (!domElements.loadingOverlay) return;
  domElements.loadingOverlay.classList.add("opacity-0");
  setTimeout(() => (domElements.loadingOverlay.style.display = "none"), 450);
  // console.log("hidden");
}

// Set Header
function updatePageHeader(titleText, subtitleText) {
  let headerTitle = document.querySelector("#header h1");
  let headerSubtitle = document.querySelector("#header p");
  if (headerTitle) headerTitle.textContent = titleText;
  if (headerSubtitle) headerSubtitle.textContent = subtitleText;
  // console.log("header");
}

// Show Sections
function showOnlySections(sectionsToDisplay = []) {
  let allSections = [
    domElements.searchFiltersSection,
    domElements.mealCategoriesSection,
    domElements.allRecipesSection,
    domElements.mealDetails,
    domElements.productsSection,
    domElements.foodlogSection,
  ];
  
  for (let section of allSections) {
    if (!section) continue;
    section.style.display = sectionsToDisplay.includes(section) ? "" : "none";
  }
  // console.log("sections");
}

// Parse Hash
function parseRouteHash() {
  let hashString = (location.hash || "#/meals").replace("#", "");
  let hashParts = hashString.split("/").filter(Boolean);
  let [routeName, routeParam] = hashParts;
  // console.log("parsed");
  return { route: routeName || "meals", param: routeParam || null };
}

// Navigate
function navigateToHash(hashPath) {
  location.hash = hashPath;
  // console.log("navigated");
}

// Route Handler
async function handleCurrentRoute() {
  let { route, param } = parseRouteHash();
  // console.log("routing");

  // Remove Active
  for (let link of domElements.navLinks) {
    link.classList.remove("bg-emerald-50", "text-emerald-700");
  }

  // Activate Link
  if (route === "meals" || route === "meal") {
    domElements.navLinks[0]?.classList.add("bg-emerald-50", "text-emerald-700");
  } else if (route === "products") {
    domElements.navLinks[1]?.classList.add("bg-emerald-50", "text-emerald-700");
  } else if (route === "foodlog") {
    domElements.navLinks[2]?.classList.add("bg-emerald-50", "text-emerald-700");
  }

  // Meals Page
  if (route === "meals") {
    updatePageHeader(
      "Meals & Recipes",
      "Discover delicious and nutritious recipes tailored for you"
    );
    showOnlySections([
      domElements.searchFiltersSection,
      domElements.mealCategoriesSection,
      domElements.allRecipesSection,
    ]);
    await loadMealsHomePage();
    return;
  }

  // Meal Details
  if (route === "meal" && param) {
    updatePageHeader("Meal Details", "Everything you need to cook and log this meal");
    showOnlySections([domElements.mealDetails]);
    await loadMealDetailsPage(param);
    return;
  }

  // Products Page
  if (route === "products") {
    updatePageHeader(
      "Product Scanner",
      "Search products or lookup barcode to log packaged foods"
    );
    showOnlySections([domElements.productsSection]);
    initializeProductsPage();
    return;
  }

  // Food Log
  if (route === "foodlog") {
    updatePageHeader("Food Log", "Track and monitor your daily nutrition intake");
    showOnlySections([domElements.foodlogSection]);
    initializeFoodLogPage();
    return;
  }

  // Default
  navigateToHash("#/meals");
}

/* Meals Page */

async function loadMealsHomePage() {
  // console.log("loading");
  
  domElements.categoriesGrid.innerHTML = skeletonCards(6);
  domElements.recipesGrid.innerHTML = skeletonCards(8);
  domElements.recipesCount.textContent = "Loading recipes...";

  try {
    let [categoriesResponse, mealsResponse, areasResponse] = await Promise.all([
      getCategories(),
      searchMeals({ q: "", page: 1, limit: 25 }),
      getAreas(),
    ]);

    // Countries
    let countriesData = areasResponse?.results || [];
    if (countriesData.length > 10) {
      countriesData.length = 10;
    }
    domElements.countriesGrid.innerHTML = renderCountries(countriesData);

    // Categories
    let categoriesData = categoriesResponse?.results || [];
    if (categoriesData.length > 12) {
      categoriesData.length = 12;
    }
    domElements.categoriesGrid.innerHTML = renderCategories(categoriesData);

    // Meals
    let mealsData = mealsResponse?.results || [];
    domElements.recipesGrid.innerHTML = renderMealsGrid(mealsData);
    domElements.recipesCount.textContent = `Showing ${mealsData.length} recipes`;

    // Bind Events
    bindAllRecipesButton();
    bindCategoryClickEvents();
    bindCountryClickEvents();
    bindMealCardClickEvents();

    hideLoadingOverlay();
  } catch (error) {
    // console.log("failed");
    domElements.categoriesGrid.innerHTML = "";
    domElements.recipesGrid.innerHTML = "";
    domElements.recipesCount.textContent = "Failed to load recipes";
    hideLoadingOverlay();
  }
}

// All Recipes
function bindAllRecipesButton() {
  let allRecipesButton = document.getElementById("all-recipes-btn");
  allRecipesButton?.addEventListener("click", () => {
    // console.log("all");
    loadMealsHomePage();
  });
}

// Clear Styles
function clearAllRecipesButtonStyles() {
  let allRecipesButton = document.getElementById("all-recipes-btn");
  if (allRecipesButton) {
    allRecipesButton.classList.remove("bg-emerald-600", "text-white");
    allRecipesButton.classList.add("bg-gray-100", "text-gray-700");
  }
}

function clearCountryButtonStyles() {
  let countryCards = domElements.countriesGrid.querySelectorAll("[data-area]");
  for (let card of countryCards) {
    card.classList.remove("bg-emerald-600", "text-white");
    card.classList.add("bg-gray-100", "text-gray-700");
  }
}

// Category Clicks
function bindCategoryClickEvents() {
  let categoryCards = domElements.categoriesGrid.querySelectorAll("[data-category]");
  for (let card of categoryCards) {
    card.addEventListener("click", async () => {
      let categoryName = card.dataset.category;
      // console.log("category");
      
      domElements.recipesGrid.innerHTML = skeletonCards(8);
      domElements.recipesCount.textContent = `Filtering by ${categoryName}...`;
      
      let response = await filterMeals({ category: categoryName, limit: 25 });
      let mealsData = response?.results || [];
      
      domElements.recipesGrid.innerHTML = renderMealsGrid(mealsData);
      domElements.recipesCount.textContent = `Showing ${mealsData.length} recipes`;
      
      clearCountryButtonStyles();
      clearAllRecipesButtonStyles();
      bindMealCardClickEvents();
    });
  }
}

// Country Clicks
function bindCountryClickEvents() {
  let countryCards = domElements.countriesGrid.querySelectorAll("[data-area]");
  for (let card of countryCards) {
    card.addEventListener("click", async () => {
      clearCountryButtonStyles();
      clearAllRecipesButtonStyles();
      
      let countryName = card.dataset.area;
      // console.log("country");
      
      card.classList.replace("bg-gray-100", "bg-emerald-600");
      card.classList.replace("text-gray-700", "text-white");
      
      domElements.recipesGrid.innerHTML = skeletonCards(8);
      domElements.recipesCount.textContent = `Filtering by ${countryName}...`;
      
      let response = await filterMeals({ area: countryName, limit: 25 });
      let mealsData = response?.results || [];
      
      domElements.recipesGrid.innerHTML = renderMealsGrid(mealsData);
      domElements.recipesCount.textContent = `Showing ${mealsData.length} recipes`;
      
      bindMealCardClickEvents();
    });
  }
}

// Meal Cards
function bindMealCardClickEvents() {
  let mealCards = domElements.recipesGrid.querySelectorAll("[data-meal-id]");
  for (let card of mealCards) {
    card.addEventListener("click", () => {
      let mealId = card.dataset.mealId;
      // console.log("clicked");
      navigateToHash(`#/meal/${mealId}`);
    });
  }
}

// Search Binding
function bindMealsSearchInput() {
  let searchTimeout = null;
  domElements.searchInput?.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      let searchQuery = domElements.searchInput.value.trim();
      // console.log("search");
      
      domElements.recipesGrid.innerHTML = skeletonCards(8);
      domElements.recipesCount.textContent = "Searching...";
      
      try {
        let response = await searchMeals({ q: searchQuery, page: 1, limit: 25 });
        let mealsData = response?.results || [];
        
        domElements.recipesGrid.innerHTML = renderMealsGrid(mealsData);
        domElements.recipesCount.textContent = `Showing ${mealsData.length} recipes`;
        
        bindMealCardClickEvents();
      } catch (error) {
        // console.log("searchfailed");
        Swal.fire("Error", error.message || "Search failed", "error");
      }
    }, 350);
  });
}

/* Meal Details */

// Convert Ingredients
function convertIngredientsToLines(mealData) {
  return (mealData.ingredients || [])
    .map((item) => `${item.measure || ""} ${item.ingredient || ""}`.trim())
    .filter(Boolean);
}

async function loadMealDetailsPage(mealId) {
  // console.log("mealdetails");
  
  try {
    let response = await getMealById(mealId);
    let mealData = response?.result;
    if (!mealData) throw new Error("Meal not found");
    
    renderMealDetails(domElements, mealData);
    
    // Back Button
    domElements.backToMealsBtn?.addEventListener("click", () => navigateToHash("#/meals"));
    
    // Log Button
    domElements.logMealBtn?.addEventListener("click", async () => {
      try {
        let nutritionResponse = await analyzeMealNutrition({
          title: mealData.name,
          ingredients: convertIngredientsToLines(mealData),
        });
        
        let nutritionData = nutritionResponse?.data || {};
        let nutrients = nutritionData.perServing || nutritionData.totals || {};
        
        appState.addToDayLog({
          type: "meal",
          refId: mealData.id,
          name: mealData.name,
          calories: Number(nutrients.calories || 0),
          protein: Number(nutrients.protein || 0),
          carbs: Number(nutrients.carbs || 0),
          fat: Number(nutrients.fat || 0),
          meta: {
            thumbnail: mealData.thumbnail,
            category: mealData.category,
            area: mealData.area,
            servings: nutritionData.servings,
            totalWeight: nutritionData.totalWeight,
            fiber: nutrients.fiber,
            sugar: nutrients.sugar,
            sodium: nutrients.sodium,
          },
        });

        navigateToHash("#/foodlog");
        activateNavigationLink(domElements.navLinks[2]);
      } catch (error) {
        // console.log("analyzefailed");
        Swal.fire("Error", error.message || "Failed to analyze nutrition", "error");
      }
    });
  } catch (error) {
    // console.log("loadfailed");
    Swal.fire("Error", error.message || "Failed to load meal details", "error");
    navigateToHash("#/meals");
    activateNavigationLink(domElements.navLinks[0]);
  }
}

/* Products Page */

function initializeProductsPage() {
  // console.log("products");
  
  domElements.productsGrid.innerHTML = `
  <div class="w-full flex flex-col items-center justify-center text-center py-16">
    <div class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-5">
      <i class="fa-solid fa-box-open text-gray-400 text-xl"></i>
    </div>

    <h3 class="text-2xl font-semibold text-gray-800">
      No products to display
    </h3>
    <p class="mt-2 text-sm text-gray-400">
      Search for a product or browse by category
    </p>
  </div>
`;
  domElements.productsCount.textContent = "Search for products to see results";

  domElements.searchProductBtn?.addEventListener("click", handleProductSearch);
  domElements.lookupBarcodeBtn?.addEventListener("click", handleBarcodeLookup);

  // Nutri-Score Filters
  for (let filterButton of domElements.nutriScoreBtns) {
    filterButton.addEventListener("click", () => {
      for (let btn of domElements.nutriScoreBtns) {
        btn.classList.remove("bg-emerald-600", "text-white");
      }
      filterButton.classList.add("bg-emerald-600", "text-white");
      productsFilterState.selectedGrade = (filterButton.dataset.grade || "").toLowerCase();
      applyNutriScoreFilter();
    });
  }
}

// Product Search
async function handleProductSearch() {
  let searchQuery = domElements.productSearchInput.value.trim();
  if (!searchQuery) return;

  // console.log("searching");
  domElements.productsGrid.innerHTML = skeletonCards(8);
  domElements.productsCount.textContent = "Searching products...";

  try {
    let response = await searchProducts(searchQuery);
    productsFilterState.items = response?.results || [];

    domElements.productsGrid.innerHTML = renderProductsGrid(productsFilterState.items);
    domElements.productsCount.textContent = `Showing ${productsFilterState.items.length} products`;

    bindProductCardClickEvents();
    applyNutriScoreFilter();
  } catch (error) {
    // console.log("failed");
    domElements.productsGrid.innerHTML = "";
    domElements.productsCount.textContent = "Failed to load products";
    Swal.fire("Error", error.message || "Product search failed", "error");
  }
}

// Barcode Lookup
async function handleBarcodeLookup() {
  let barcodeValue = domElements.barcodeInput.value.trim();
  if (!barcodeValue) return;

  // console.log("lookup");
  domElements.productsGrid.innerHTML = skeletonCards(4);
  domElements.productsCount.textContent = "Looking up barcode...";

  try {
    let response = await getProductByBarcode(barcodeValue);
    let productData = response?.result;
    if (!productData) throw new Error("No product found");

    productsFilterState.items = [productData];
    domElements.productsGrid.innerHTML = renderProductsGrid(productsFilterState.items);
    domElements.productsCount.textContent = "Showing 1 product";

    bindProductCardClickEvents();
    applyNutriScoreFilter();
  } catch (error) {
    // console.log("notfound");
    domElements.productsGrid.innerHTML = "";
    domElements.productsCount.textContent = "No product found";
    Swal.fire("Error", error.message || "Barcode lookup failed", "error");
  }
}

// Filter Products
function applyNutriScoreFilter() {
  let selectedGrade = productsFilterState.selectedGrade;
  let productCards = domElements.productsGrid.querySelectorAll(".product-card");

  let visibleCount = 0;
  for (let card of productCards) {
    let cardGrade = (card.dataset.grade || "").toLowerCase();
    let shouldShow = !selectedGrade || cardGrade === selectedGrade;
    card.style.display = shouldShow ? "" : "none";
    if (shouldShow) visibleCount++;
  }

  if (productsFilterState.items.length) {
    domElements.productsCount.textContent = `Showing ${visibleCount} products`;
  }
  // console.log("filtered");
}

// Product Cards
function bindProductCardClickEvents() {
  // console.log("binding");
  
  domElements.productsGrid?.addEventListener("click", async (event) => {
    let clickedCard = event.target.closest("[data-barcode]");
    if (!clickedCard) return;

    let productBarcode = clickedCard.dataset.barcode;
    let productData = productsFilterState.items.find((item) => item.barcode === productBarcode) || null;
    if (!productData) return;

    let nutrients = productData.nutrients || {};

    let toNumber = (value) => (value == null || Number.isNaN(Number(value)) ? 0 : Number(value));
    let formatValue = (value) => (value == null ? "—" : `${toNumber(value).toFixed(1)}`);
    let gradeText = (productData.nutritionGrade || "").toUpperCase() || "—";
    let novaText = productData.novaGroup ? String(productData.novaGroup) : "—";

    let brandName = productData.brand || productData.brands || "";
    let quantityText = productData.quantity || productData.servingSize || "";
    let imageUrl = productData.image || productData.imageUrl || productData.thumbnail || "";

    let proteinValue = toNumber(nutrients.protein);
    let carbsValue = toNumber(nutrients.carbs);
    let fatValue = toNumber(nutrients.fat);
    let sugarValue = toNumber(nutrients.sugar);
    let saturatedFatValue = toNumber(nutrients.saturatedFat);
    let fiberValue = toNumber(nutrients.fiber);
    let saltValue = toNumber(nutrients.salt);

    let calculateBarWidth = (value, maxValue) =>
      `${Math.max(6, Math.min(100, Math.round((value / maxValue) * 100)))}%`;

    let ingredientsText = productData.ingredientsText || productData.ingredients || "";
    let allergensText = Array.isArray(productData.allergens)
      ? productData.allergens.join(", ")
      : productData.allergens || productData.allergensText || "";

    let confirmResult = await Swal.fire({
      title: "",
      width: 860,
      padding: 0,
      background: "transparent",
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: "Log This Food",
      cancelButtonText: "Close",
      reverseButtons: true,
      customClass: {
        popup: "p-0",
        confirmButton:
          "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl",
        cancelButton:
          "bg-transparent text-gray-700 font-semibold px-6 py-3 rounded-xl",
        actions: "w-full px-8 pb-8 flex justify-between",
      },
      html: `
        <div class="bg-white rounded-3xl shadow-xl overflow-hidden">
          <!-- Header -->
          <div class="p-8 border-b border-gray-100">
            <div class="flex gap-6">
              <div class="w-28 h-28 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
                ${imageUrl ? `<img src="${imageUrl}" class="w-full h-full object-cover" alt="">` : ""}
              </div>

              <div class="min-w-0 flex-1">
                <div class="text-emerald-700 font-semibold text-sm">${brandName || ""}</div>
                <div class="text-3xl font-extrabold text-gray-900 leading-tight">
                  ${escapeHtml(productData.name || "Product")}
                </div>
                <div class="text-sm text-gray-500 mt-1">${escapeHtml(quantityText)}</div>

                <div class="flex gap-3 mt-4">
                  ${createNutriBadge(gradeText)}
                  ${createNovaBadge(novaText)}
                </div>
              </div>
            </div>
          </div>

          <!-- Nutrition Facts -->
          <div class="px-8 pt-6 rounded-2xl bg-emerald-50/50">
            <div class="flex items-center gap-2 text-gray-900 font-bold">
              <span class="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700">🍃</span>
              <div class="text-lg">Nutrition Facts <span class="text-sm text-gray-400 font-semibold">(per 100g)</span></div>
            </div>

            <div class="mt-6 border border-emerald-600 rounded-2xl p-6 bg-emerald-50">
              <div class="text-center mb-4">
                <div class="text-6xl font-extrabold text-gray-900">${Math.round(toNumber(nutrients.calories))}</div>
                <div class="text-gray-500 font-semibold">Calories</div>
              </div>

              <!-- Macros -->
              <div class="grid grid-cols-4 gap-6 mt-8 mb-4">
                ${createMacroBar("Protein", proteinValue, "g", "bg-emerald-500", calculateBarWidth(proteinValue, 30))}
                ${createMacroBar("Carbs", carbsValue, "g", "bg-blue-500", calculateBarWidth(carbsValue, 80))}
                ${createMacroBar("Fat", fatValue, "g", "bg-purple-500", calculateBarWidth(fatValue, 40))}
                ${createMacroBar("Sugar", sugarValue, "g", "bg-orange-500", calculateBarWidth(sugarValue, 40))}
              </div>

              <hr class="my-4 border-t border-emerald-600">

              <!-- Details -->
              <div class="grid grid-cols-3 gap-6 mt-7 pt-6 border-t border-gray-100">
                ${createMiniStat("Saturated Fat", saturatedFatValue)}
                ${createMiniStat("Fiber", fiberValue)}
                ${createMiniStat("Salt", saltValue)}
              </div>
            </div>
          </div>

          <!-- Ingredients -->
          <div class="px-8 pt-6">
            <div class="flex items-center gap-2 font-bold text-gray-900">
              <span class="text-gray-500">≡</span> Ingredients
            </div>
            <div class="mt-3 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              ${escapeHtml(ingredientsText || "—")}
            </div>
          </div>

          <!-- Allergens -->
          <div class="px-8 pt-6 pb-2">
            <div class="bg-red-50 border border-red-100 rounded-2xl p-4">
              <div class="flex items-center gap-2 font-bold text-red-600">
                ⚠️ Allergens
              </div>
              <div class="mt-1 text-sm text-red-600">
                ${escapeHtml(allergensText || "—")}
              </div>
            </div>
          </div>

          <div class="h-4"></div>
        </div>
      `,
    });

    if (!confirmResult.isConfirmed) return;

    appState.addToDayLog({
      type: "product",
      refId: productData.barcode,
      name: productData.name,
      calories: toNumber(nutrients.calories),
      protein: proteinValue,
      carbs: carbsValue,
      fat: fatValue,
      meta: {
        nutritionGrade: productData.nutritionGrade,
        novaGroup: productData.novaGroup,
        quantity: productData.quantity,
        brand: productData.brand,
        image: imageUrl,
        sugar: sugarValue,
        saturatedFat: saturatedFatValue,
        fiber: fiberValue,
        salt: saltValue,
        ingredients: ingredientsText,
        allergens: allergensText,
      },
    });

    navigateToHash("#/foodlog");
    activateNavigationLink(domElements.navLinks[2]);
  });

  // Badge Helpers
  function createNutriBadge(grade) {
    let badgeColor =
      grade === "A"
        ? "bg-emerald-600"
        : grade === "B"
        ? "bg-lime-600"
        : grade === "C"
        ? "bg-amber-500"
        : grade === "D"
        ? "bg-orange-500"
        : grade === "E"
        ? "bg-red-600"
        : "bg-gray-400";

    return `
      <div class="flex items-center gap-3 border border-gray-100 rounded-2xl px-4 py-3">
        <div class="w-10 h-10 rounded-xl ${badgeColor} text-white flex items-center justify-center font-extrabold">
          ${grade}
        </div>
        <div>
          <div class="text-sm font-bold text-gray-900">Nutri-Score</div>
          <div class="text-xs text-gray-500">Good</div>
        </div>
      </div>
    `;
  }

  function createNovaBadge(nova) {
    return `
      <div class="flex items-center gap-3 border border-gray-100 rounded-2xl px-4 py-3">
        <div class="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-extrabold">
          ${escapeHtml(nova)}
        </div>
        <div>
          <div class="text-sm font-bold text-gray-900">NOVA</div>
          <div class="text-xs text-gray-500">Ultra-processed</div>
        </div>
      </div>
    `;
  }

  function createMacroBar(labelText, valueNum, unitText, barColor, widthPercent) {
    return `
      <div>
        <div class="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div class="h-full ${barColor}" style="width:${widthPercent}"></div>
        </div>
        <div class="mt-3 text-center">
          <div class="text-2xl font-extrabold text-gray-900">${valueNum.toFixed(1)}${unitText}</div>
          <div class="text-sm text-gray-500 font-semibold">${labelText}</div>
        </div>
      </div>
    `;
  }

  function createMiniStat(labelText, valueNum) {
    return `
      <div class="text-center">
        <div class="text-lg font-extrabold text-gray-900">${valueNum.toFixed(1)}g</div>
        <div class="text-xs text-gray-500 font-semibold">${labelText}</div>
      </div>
    `;
  }
}

/* Food Log */

// Number Helper
let convertToNumber = (value) => Number(String(value).replace(/[^\d.]/g, "")) || 0;

function initializeFoodLogPage() {
  // console.log("foodlog");
  
  if (domElements.foodlogDate) {
    domElements.foodlogDate.textContent = new Date().toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "2-digit",
    });
  }

  let loggedItems = appState.getDayLog(new Date());
  let nutritionTotals = loggedItems.reduce(
    (totals, item) => {
      totals.calories += convertToNumber(item.calories || 0);
      totals.protein += convertToNumber(item.protein || 0);
      totals.carbs += convertToNumber(item.carbs || 0);
      totals.fat += convertToNumber(item.fat || 0);
      return totals;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  renderFoodLog(domElements, { items: loggedItems, totals: nutritionTotals, targets: NUTRITION_TARGETS });

  // Clear Button
  domElements.clearFoodlogBtn?.addEventListener("click", async () => {
    let confirmation = await Swal.fire({
      title: "Clear all items?",
      text: "This will remove today's logged items.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Clear",
      cancelButtonText: "Cancel",
    });

    if (!confirmation.isConfirmed) return;
    appState.clearDayLog(new Date());
    initializeFoodLogPage();
    // console.log("cleared");
  });

  // Weekly Chart
  let weeklyData = appState.getLast7DaysSummary();
  renderWeeklyChart("weekly-chart", weeklyData);
  
  bindFoodLogDeleteButtons();
}

// Delete Buttons
function bindFoodLogDeleteButtons() {
  if (!domElements.loggedItemsList) return;

  domElements.loggedItemsList.addEventListener("click", async (event) => {
    let deleteButton = event.target.closest('[data-action="delete-log"]');
    if (!deleteButton) return;

    let itemId = deleteButton.dataset.id;
    if (!itemId) return;

    let confirmation = await Swal.fire({
      title: "Delete item?",
      text: "This item will be removed from your food log.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    });

    if (!confirmation.isConfirmed) return;

    let wasDeleted = appState.deleteFromDayLog(itemId, new Date());
    // console.log("deleted");

    initializeFoodLogPage();
  });
}

/* Navigation */

function bindNavigationLinks() {
  for (let navLink of domElements.navLinks) {
    navLink.addEventListener("click", (event) => {
      event.preventDefault();
      let linkHref = navLink.getAttribute("href");
      navigateToHash(linkHref);
      activateNavigationLink(event.currentTarget);
      // console.log("nav");
    });
  }
}

function activateNavigationLink(linkElement) {
  for (let link of domElements.navLinks) {
    link.classList.remove("text-emerald-600");
    link.classList.add("text-gray-600");
  }

  linkElement.classList.add("text-emerald-600");
  linkElement.classList.remove("text-gray-600");
}

/* Initialize */

function initializeApp() {
  // console.log("init");
  
  bindNavigationLinks();
  bindMealsSearchInput();

  window.addEventListener("hashchange", handleCurrentRoute);
  handleCurrentRoute();
  
  window.addEventListener("pageshow", () => {
    navigateToHash("#/meals");
    activateNavigationLink(domElements.navLinks[0]);
  });
}

initializeApp();