// API Imports
import {
  getAreas,
  getCategories,
  getRandomMeals,
  getMealsByArea,
  getMealsByCategory,
  searchMeals,
  getMealById,
  searchProducts,
  getProductByBarcode,
  getProductCategories,
  getProductsByCategory,
  analyzeMealNutrition,
} from "./api/mealdb.js";

// State Import
import { appState } from "./state/appState.js";

// UI Imports
import {
  renderAreas,
  renderCategories,
  renderMeals,
  renderMealDetails,
  renderNutritionCalculations,
  renderProductCategories,
  renderProducts,
  enableListView,
  enableGridView,
  showMealsSpinner,
  resetAreasStyle,
  activateAreaButton,
  activateAllRecipesButton,
  showGeneralLoader,
  hideGeneralLoader,
  hideAllSections,
  navigateToSection,
  activateSidebarLink,
  showServerError,
  showProductsSpinner,
  showSuccessAlert,
  showErrorAlert,
} from "./ui/components.js";

// Initialize App
async function initializeApp() {
  console.log("init");
  
  // Show Loaders
  showGeneralLoader();
  showMealsSpinner();

  // Load Data
  let areasData = await getAreas();
  // console.log(areasData)
  let categoriesData = await getCategories();
  let randomMealsData = await getRandomMeals(25);

  // Render UI
  renderAreas(areasData);
  renderCategories(categoriesData);
  renderMeals(randomMealsData);
  enableListView();
  enableGridView();

  // Bind Events
  bindCategoryEvents();
  bindAreaEvents();
  bindSearchEvents();
  bindSidebarEvents();
  bindMealCardEvents();
  bindProductEvents();
  bindFoodLogEvents();

  // Load Products
  let productCategoriesData = await getProductCategories();
  renderProductCategories(productCategoriesData);
  bindProductCategoryEvents();

  // Hide Loader
  hideGeneralLoader();
}

/* Event Handlers */

// Category Events
function bindCategoryEvents() {
  console.log("binding");
  
  document.addEventListener("click", function (event) {
    let targetCard = event.target.closest(".category-card");

    async function handleCategoryClick() {
      if (targetCard) {
        showMealsSpinner();
        let categoryName = targetCard.getAttribute("data-category");

        let mealsData = await getMealsByCategory(categoryName);

        if (mealsData.status) {
          renderMeals(mealsData);
        } else {
          showServerError(mealsData.message);
        }

        bindMealCardEvents();
      }
    }

    handleCategoryClick();
    enableListView();
    enableGridView();
  });
}

// Area Events
function bindAreaEvents() {
  console.log("binding");
  
  document.addEventListener("click", function (event) {
    let targetButton = event.target.closest(".area-filter-btn");

    async function handleAreaClick() {
      if (targetButton) {
        showMealsSpinner();
        resetAreasStyle();
        let areaName = targetButton.getAttribute("data-area");

        activateAreaButton(areaName);
        let mealsData = await getMealsByArea(areaName);

        if (mealsData.status) {
          renderMeals(mealsData);
        } else {
          showServerError(mealsData.message);
        }
        bindMealCardEvents();
      }
    }

    handleAreaClick();
    enableListView();
    enableGridView();
  });
}

// Search Events
function bindSearchEvents() {
  console.log("binding");
  
  let searchInput = document.querySelector("#search-input");
  searchInput.addEventListener("input", function () {
    showMealsSpinner();
    resetAreasStyle();

    async function handleSearch(searchQuery) {
      let mealsData = await searchMeals(searchQuery);

      if (mealsData.status) {
        renderMeals(mealsData);
      } else {
        showServerError(mealsData.message);
      }
      bindMealCardEvents();
    }

    handleSearch(searchInput.value);
    enableListView();
    enableGridView();
    activateAllRecipesButton();
  });
}

// Sidebar Events
function bindSidebarEvents() {
  console.log("binding");
  
  let sidebarItems = document.querySelectorAll("#sidebar nav ul li");

  for (let item of sidebarItems) {
    item.addEventListener("click", function () {
      hideAllSections();
      navigateToSection(item.getAttribute("data-sections"));
      activateSidebarLink(Array.from(sidebarItems).indexOf(item));
    });
  }
}

// Meal Card Events
function bindMealCardEvents() {
  console.log("binding");
  
  showGeneralLoader();

  let mealCards = document.querySelectorAll(".recipe-card");

  for (let mealCard of mealCards) {
    mealCard.addEventListener("click", function () {
      async function handleMealClick() {
        bindBackButtonEvent();
        showGeneralLoader();

        let mealId = mealCard.getAttribute("data-meal-id");
        let mealData = await getMealById(mealId);

        hideAllSections();
        navigateToSection("#meal-details");

        if (mealData.status) {
          renderMealDetails(mealData.data[0]);
        } else {
          showServerError(mealData.message);
        }

        activateSidebarLink(0);
        hideGeneralLoader();

        // Get Nutrition
        let nutritionData = {};
        try {
          let ingredientsList = mealData.data[0].ingredients.map(
            (ing) => `${ing.measure} ${ing.ingredient}`
          );

          nutritionData = await analyzeMealNutrition({
            title: mealData.data[0].name,
            ingredients: ingredientsList,
          });

          if (nutritionData.data) {
            nutritionData.data.id = mealData.id;
            nutritionData.data.recipeName = mealData.data[0].name;
            nutritionData.data.image = mealData.data[0].thumbnail;
            appState.setCurrentNutrition(nutritionData.data);
            renderNutritionCalculations(nutritionData.data);
            bindMealLogEvent();
          } else {
            showServerError(nutritionData.message);
          }
        } catch {
          showServerError(nutritionData.message);
        }
      }

      handleMealClick();
    });
  }

  hideGeneralLoader();
}

// Back Button
function bindBackButtonEvent() {
  console.log("binding");
  
  document.addEventListener("click", function (event) {
    let backButton = event.target.closest("#back-to-meals-btn");

    async function handleBackClick() {
      if (backButton) {
        hideAllSections();
        navigateToSection(
          "#all-recipes-section, #meal-categories-section, #search-filters-section"
        );
        activateSidebarLink(0);
      }
    }

    handleBackClick();
  });
}

// Meal Log
function bindMealLogEvent() {
  console.log("binding");
  
  let logMealButton = document.querySelector("#log-meal-btn");

  logMealButton.addEventListener("click", function () {
    let currentNutrition = appState.getCurrentNutrition();
    showMealLogModal(currentNutrition);

    let confirmButton = document.querySelector("#confirm-log-meal");
    confirmButton.addEventListener("click", function () {
      let servingsInput = document.getElementById("meal-servings");
      let servingsValue = Number(servingsInput.value);

      let logResult = logMealToStorage(currentNutrition, servingsValue);
      hideMealLogModal();

      if (logResult) {
        showSuccessAlert("Food Logged Successfully");
      } else {
        showErrorAlert("Failed to log food");
      }
    });

    let cancelButton = document.querySelector("#cancel-log-meal");
    cancelButton.addEventListener("click", function () {
      hideMealLogModal();
    });

    document.querySelector("#log-meal-modal").addEventListener("click", function (event) {
      if (event.target.getAttribute("id") === "log-meal-modal") {
        hideMealLogModal();
      }
    });
  });
}

// Product Events
function bindProductEvents() {
  console.log("binding");
  
  let searchProductButton = document.querySelector("#search-product-btn");
  let productSearchInput = document.querySelector("#product-search-input");

  searchProductButton.addEventListener("click", function () {
    async function handleProductSearch() {
      showProductsSpinner();
      let productsData = await searchProducts(productSearchInput.value);
      appState.setCurrentProducts(productsData);
      renderProducts(productsData);
      bindProductCardEvents();
    }

    handleProductSearch();
  });

  let barcodeButton = document.querySelector("#lookup-barcode-btn");
  let barcodeInput = document.querySelector("#barcode-input");

  barcodeButton.addEventListener("click", function () {
    async function handleBarcodeSearch() {
      showProductsSpinner();
      let productData = await getProductByBarcode(barcodeInput.value);
      let productsWrapper = { data: [productData.result] };
      appState.setCurrentProducts(productsWrapper);
      renderProducts(productsWrapper);
      bindProductCardEvents();
    }

    handleBarcodeSearch();
  });
}

// Product Categories
function bindProductCategoryEvents() {
  console.log("binding");
  
  let categoryButtons = document.querySelectorAll(".product-category-btn");

  for (let button of categoryButtons) {
    button.addEventListener("click", function () {
      async function handleCategoryClick() {
        showProductsSpinner();
        let productsData = await getProductsByCategory(
          button.getAttribute("data-category")
        );
        appState.setCurrentProducts(productsData);
        renderProducts(productsData);
        bindProductCardEvents();
      }

      handleCategoryClick();
    });
  }
}

// Product Cards
function bindProductCardEvents() {
  console.log("binding");
  
  let productCards = document.querySelectorAll(".product-card");

  for (let card of productCards) {
    card.addEventListener("click", function () {
      let currentProducts = appState.getCurrentProducts();
      let productBarcode = card.getAttribute("data-barcode");

      let currentProduct = {};
      for (let item of currentProducts.data) {
        if (item.barcode === productBarcode) {
          currentProduct = item;
          break;
        }
      }

      showProductModal(currentProduct);

      let confirmButton = document.querySelector(".add-product-to-log");
      confirmButton.addEventListener("click", function () {
        let logResult = logProductToStorage(currentProduct);
        hideProductModal();

        if (logResult) {
          showSuccessAlert("Food Logged Successfully");
        } else {
          showErrorAlert("Failed to log product");
        }
      });

      let closeButtons = document.querySelectorAll(".close-product-modal");
      for (let btn of closeButtons) {
        btn.addEventListener("click", function () {
          hideProductModal();
        });
      }

      document.querySelector("#product-detail-modal").addEventListener("click", function (event) {
        if (event.target.getAttribute("id") === "product-detail-modal") {
          hideProductModal();
        }
      });
    });
  }
}

// Food Log
function bindFoodLogEvents() {
  console.log("binding");
  // Will implement in next part
}

/* Helper Functions */

// Log Meal
function logMealToStorage(nutritionData, servings) {
  console.log("logging");
  try {
    appState.addToDayLog({
      type: "meal",
      name: nutritionData.recipeName,
      calories: nutritionData.perServing.calories * servings,
      protein: nutritionData.perServing.protein * servings,
      carbs: nutritionData.perServing.carbs * servings,
      fat: nutritionData.perServing.fat * servings,
      meta: {
        thumbnail: nutritionData.image,
        servings: servings,
      },
    });
    return true;
  } catch {
    return false;
  }
}

// Log Product
function logProductToStorage(productData) {
  console.log("logging");
  try {
    appState.addToDayLog({
      type: "product",
      name: productData.name,
      calories: productData.nutrients.calories,
      protein: productData.nutrients.protein,
      carbs: productData.nutrients.carbs,
      fat: productData.nutrients.fat,
      meta: {
        image: productData.image,
        brand: productData.brand,
      },
    });
    return true;
  } catch {
    return false;
  }
}

// Show Modal
function showMealLogModal(nutritionData) {
  console.log("modal");
  let modalElement = document.querySelector("#log-meal-modal");
  console.log(nutritionData);
  modalElement.classList.remove("hidden");
  modalElement.innerHTML = `
    <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
      <h3 class="text-xl font-bold mb-4">{nutritionData.recipeName}</h3>
      <label class="block mb-4">
        <span class="text-sm font-semibold">Servings</span>
        <input type="number" id="meal-servings" value="1" min="0.5" max="10" step="0.5" class="w-full mt-2 px-4 py-2 border rounded-lg"/>
      </label>
      <div class="flex gap-3">
        <button id="cancel-log-meal" class="flex-1 py-3 bg-gray-100 rounded-xl">Cancel</button>
        <button id="confirm-log-meal" class="flex-1 py-3 bg-blue-600 text-white rounded-xl">Log Meal</button>
      </div>
    </div>`;
}
// Meal has been logged

// Hide Modal
function hideMealLogModal() {
  console.log("hiding");
  document.querySelector("#log-meal-modal").classList.add("hidden");
}

// Show Product
function showProductModal(productData) {
  console.log("modal");
  let modalElement = document.querySelector("#product-detail-modal");
  modalElement.classList.remove("hidden");
  modalElement.innerHTML = `
    <div class="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4">
      <h3 class="text-2xl font-bold mb-4">${productData.name}</h3>
      <div class="flex gap-3 mt-6">
        <button class="add-product-to-log flex-1 py-3 bg-emerald-600 text-white rounded-xl">Log This Food</button>
        <button class="close-product-modal flex-1 py-3 bg-gray-100 rounded-xl">Close</button>
      </div>
    </div>`;
}

// Hide Product
function hideProductModal() {
  console.log("hiding");
  document.querySelector("#product-detail-modal").classList.add("hidden");
}

// Start App
initializeApp();