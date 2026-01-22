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
  renderFoodLog,
  renderWeeklyChart,
} from "./ui/components.js";

// Initialize App
async function initializeApp() {
  console.log("init");
  
  // Create modal containers
  createModalContainers();
  
  // Show Loaders
  showGeneralLoader();
  showMealsSpinner();

  // Hide sections initially
  hideAllSections();
  
  // Show meals sections only
  navigateToSection("#search-filters-section, #meal-categories-section, #all-recipes-section");
  activateSidebarLink(0);

  // Load Data
  let areasData = await getAreas();
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
      
      let itemIndex = Array.from(sidebarItems).indexOf(item);
      
      // Navigate based on index
      if (itemIndex === 0) {
        // Meals & Recipes
        navigateToSection("#search-filters-section, #meal-categories-section, #all-recipes-section");
      } else if (itemIndex === 1) {
        // Product Scanner
        navigateToSection("#products-section");
      } else if (itemIndex === 2) {
        // Food Log
        navigateToSection("#foodlog-section");
        updateFoodLogDisplay();
      }
      
      activateSidebarLink(itemIndex);
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

          if (nutritionData.status && nutritionData.data) {
            nutritionData.data.id = mealData.id;
            nutritionData.data.recipeName = mealData.data[0].name;
            nutritionData.data.image = mealData.data[0].thumbnail;
            appState.setCurrentNutrition(nutritionData.data);
            renderNutritionCalculations(nutritionData.data);
            bindMealLogEvent();
          } else {
            showServerError(nutritionData.message || "Analysis failed");
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
        navigateToSection("#all-recipes-section, #meal-categories-section, #search-filters-section");
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
    let cancelButton = document.querySelector("#cancel-log-meal");
    
    let handleConfirm = function () {
      let servingsInput = document.getElementById("meal-servings");
      let servingsValue = Number(servingsInput.value);

      let logResult = logMealToStorage(currentNutrition, servingsValue);
      hideMealLogModal();

      if (logResult) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Food Logged Successfully",
          allowOutsideClick: false,
        }).then(() => {
          hideAllSections();
          navigateToSection("#foodlog-section");
          activateSidebarLink(2);
          updateFoodLogDisplay();
        });
      } else {
        showErrorAlert("Failed to log food");
      }
      
      confirmButton.removeEventListener("click", handleConfirm);
      cancelButton.removeEventListener("click", handleCancel);
    };

    let handleCancel = function () {
      hideMealLogModal();
      confirmButton.removeEventListener("click", handleConfirm);
      cancelButton.removeEventListener("click", handleCancel);
    };
    
    confirmButton.addEventListener("click", handleConfirm);
    cancelButton.addEventListener("click", handleCancel);

    document.querySelector("#log-meal-modal").addEventListener("click", function (event) {
      if (event.target.getAttribute("id") === "log-meal-modal") {
        hideMealLogModal();
        confirmButton.removeEventListener("click", handleConfirm);
        cancelButton.removeEventListener("click", handleCancel);
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
      if (!productSearchInput.value.trim()) {
        showErrorAlert("Please enter a product name");
        return;
      }
      
      showProductsSpinner();
      let productsData = await searchProducts(productSearchInput.value);
      
      if (productsData.status) {
        appState.setCurrentProducts(productsData);
        renderProducts(productsData);
        bindProductCardEvents();
      } else {
        showErrorAlert(productsData.message || "Search failed");
      }
    }

    handleProductSearch();
  });

  let barcodeButton = document.querySelector("#lookup-barcode-btn");
  let barcodeInput = document.querySelector("#barcode-input");

  barcodeButton.addEventListener("click", function () {
    async function handleBarcodeSearch() {
      if (!barcodeInput.value.trim()) {
        showErrorAlert("Please enter a barcode");
        return;
      }
      
      showProductsSpinner();
      let productData = await getProductByBarcode(barcodeInput.value);
      
      if (productData.status && productData.result) {
        let productsWrapper = { status: true, data: [productData.result] };
        appState.setCurrentProducts(productsWrapper);
        renderProducts(productsWrapper);
        bindProductCardEvents();
      } else {
        showErrorAlert(productData.message || "Barcode not found");
      }
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
        let categoryName = button.getAttribute("data-category");
        let productsData = await getProductsByCategory(categoryName);
        
        if (productsData.status) {
          appState.setCurrentProducts(productsData);
          renderProducts(productsData);
          bindProductCardEvents();
        } else {
          showErrorAlert("Failed to load products");
        }
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
      let closeButtons = document.querySelectorAll(".close-product-modal");
      
      let handleConfirm = function () {
        let logResult = logProductToStorage(currentProduct);
        hideProductModal();

        if (logResult) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Food Logged Successfully",
            allowOutsideClick: false,
          }).then(() => {
            hideAllSections();
            navigateToSection("#foodlog-section");
            activateSidebarLink(2);
            updateFoodLogDisplay();
          });
        } else {
          showErrorAlert("Failed to log product");
        }
        
        confirmButton.removeEventListener("click", handleConfirm);
        for (let btn of closeButtons) {
          btn.removeEventListener("click", handleClose);
        }
      };
      
      let handleClose = function () {
        hideProductModal();
        confirmButton.removeEventListener("click", handleConfirm);
        for (let btn of closeButtons) {
          btn.removeEventListener("click", handleClose);
        }
      };
      
      confirmButton.addEventListener("click", handleConfirm);
      
      for (let btn of closeButtons) {
        btn.addEventListener("click", handleClose);
      }

      document.querySelector("#product-detail-modal").addEventListener("click", function (event) {
        if (event.target.getAttribute("id") === "product-detail-modal") {
          hideProductModal();
          confirmButton.removeEventListener("click", handleConfirm);
          for (let btn of closeButtons) {
            btn.removeEventListener("click", handleClose);
          }
        }
      });
    });
  }
}

// Food Log
function bindFoodLogEvents() {
  console.log("binding");
  
  let clearButton = document.querySelector("#clear-foodlog");
  if (clearButton) {
    clearButton.addEventListener("click", function () {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then((result) => {
        if (result.isConfirmed) {
          appState.clearDayLog();
          updateFoodLogDisplay();
          Swal.fire({
            title: "Deleted!",
            text: "All items have been cleared.",
            icon: "success"
          });
        }
      });
    });
  }

  // Delete buttons
  document.addEventListener("click", function (event) {
    let deleteButton = event.target.closest("[data-action='delete-log']");
    if (deleteButton) {
      let itemId = deleteButton.getAttribute("data-id");
      appState.deleteFromDayLog(itemId);
      updateFoodLogDisplay();
    }
  });
}

// Update Food Log
function updateFoodLogDisplay() {
  console.log("updating");
  
  let todayItems = appState.getDayLog();
  let weeklyData = appState.getLast7DaysSummary();

  let totals = todayItems.reduce(
    (sum, item) => ({
      calories: sum.calories + Number(item.calories || 0),
      protein: sum.protein + Number(item.protein || 0),
      carbs: sum.carbs + Number(item.carbs || 0),
      fat: sum.fat + Number(item.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  let targets = {
    calories: 2000,
    protein: 50,
    carbs: 250,
    fat: 65,
  };

  renderFoodLog(
    {
      foodlogTodaySection: document.querySelector("#foodlog-today-section"),
      clearFoodlogBtn: document.querySelector("#clear-foodlog"),
      loggedItemsList: document.querySelector("#logged-items-list"),
    },
    { items: todayItems, totals, targets }
  );

  renderWeeklyChart("weekly-chart", weeklyData);
}

/* Helper Functions */

// Create Modals
function createModalContainers() {
  console.log("modals");
  
  // Meal Log Modal
  if (!document.querySelector("#log-meal-modal")) {
    let mealModal = document.createElement("div");
    mealModal.id = "log-meal-modal";
    mealModal.className = "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center hidden";
    document.body.appendChild(mealModal);
  }
  
  // Product Detail Modal
  if (!document.querySelector("#product-detail-modal")) {
    let productModal = document.createElement("div");
    productModal.id = "product-detail-modal";
    productModal.className = "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center hidden";
    document.body.appendChild(productModal);
  }
}

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
  modalElement.classList.remove("hidden");
  modalElement.innerHTML = `
    <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
      <div class="flex items-center gap-4 mb-6">
        <img src="${nutritionData.image}" alt="${nutritionData.recipeName}" class="w-16 h-16 rounded-xl object-cover">
        <div>
          <h3 class="text-xl font-bold text-gray-900">Log This Meal</h3>
          <p class="text-gray-500 text-sm">${nutritionData.recipeName}</p>
        </div>
      </div>
      
      <div class="mb-6">
        <label class="block text-sm font-semibold text-gray-700 mb-2">Number of Servings</label>
        <div class="flex items-center gap-3">
          <input type="number" id="meal-servings" value="1" min="0.5" max="10" step="0.5" class="w-20 text-center text-xl font-bold border-2 border-gray-200 rounded-lg py-2">
        </div>
      </div>
      
      <div class="bg-emerald-50 rounded-xl p-4 mb-6">
        <p class="text-sm text-gray-600 mb-2">Estimated nutrition per serving:</p>
        <div class="grid grid-cols-4 gap-2 text-center">
          <div>
            <p class="text-lg font-bold text-emerald-600">${nutritionData.perServing.calories}</p>
            <p class="text-xs text-gray-500">Calories</p>
          </div>
          <div>
            <p class="text-lg font-bold text-blue-600">${nutritionData.perServing.protein}g</p>
            <p class="text-xs text-gray-500">Protein</p>
          </div>
          <div>
            <p class="text-lg font-bold text-amber-600">${nutritionData.perServing.carbs}g</p>
            <p class="text-xs text-gray-500">Carbs</p>
          </div>
          <div>
            <p class="text-lg font-bold text-purple-600">${nutritionData.perServing.fat}g</p>
            <p class="text-xs text-gray-500">Fat</p>
          </div>
        </div>
      </div>
      
      <div class="flex gap-3">
        <button id="cancel-log-meal" class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
          Cancel
        </button>
        <button id="confirm-log-meal" class="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">
          <i class="fa-solid fa-clipboard-list mr-2"></i>Log Meal
        </button>
      </div>
    </div>`;
}

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
