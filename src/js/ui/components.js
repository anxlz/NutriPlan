// Category Colors
let CATEGORY_COLORS = [
  { from: "red", to: "rose" },
  { from: "amber", to: "orange" },
  { from: "orange", to: "amber" },
  { from: "pink", to: "rose" },
  { from: "slate", to: "gray" },
  { from: "yellow", to: "amber" },
  { from: "rose", to: "red" },
  { from: "cyan", to: "blue" },
  { from: "green", to: "emerald" },
  { from: "teal", to: "cyan" },
  { from: "emerald", to: "green" },
  { from: "lime", to: "green" },
];

// View Buttons
let listViewButton = document.querySelector("#list-view-btn");
let gridViewButton = document.querySelector("#grid-view-btn");

// View Handlers
let viewHandlersAttached = false;

// Initialize Sidebar
export function initializeSidebar() {
  console.log("sidebar");
  
  // Add styles dynamically
  let styleElement = document.createElement("style");
  styleElement.textContent = `
    @media (max-width: 1024px) {
      #sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease-in-out;
      }
      
      #sidebar.active {
        transform: translateX(0);
      }
      
      #main-content {
        margin-left: 0 !important;
      }
      
      .sidebar-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 35;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
      }
      
      .sidebar-overlay.active {
        opacity: 1;
        visibility: visible;
      }
    }
  `;
  document.head.appendChild(styleElement);
}

// Skeleton Loader
export function skeletonCards(count = 8) {
  console.log("skeleton");
  return Array.from({ length: count })
    .map(
      () => `
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
    `
    )
    .join("");
}

// Show Areas
export function renderAreas(areasList) {
  console.log("areas");
  let areasContainer = document.querySelector("#area-filter");
  let htmlContent = `
    <button class="area-filter-btn px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 hover:text-white transition-all" data-area="">
      All Recipes
    </button>`;

  for (let areaIndex = 0; areaIndex < 10; areaIndex++) {
    htmlContent += `
      <button class="area-filter-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all" 
        data-area="${areasList[areaIndex].name}">
        ${areasList[areaIndex].name}
      </button>`;
  }

  areasContainer.innerHTML = htmlContent;
}

// Show Categories
export function renderCategories(categoriesList) {
  console.log("categories");
  let categoriesContainer = document.querySelector("#categories-grid");
  let htmlContent = "";

  for (let categoryIndex = 0; categoryIndex < 12; categoryIndex++) {
    let randomColorIndex = Math.round(Math.random() * 11);
    let colorScheme = CATEGORY_COLORS[randomColorIndex];

    htmlContent += `
      <div class="category-card bg-gradient-to-br from-${colorScheme.from}-50 to-${colorScheme.to}-50 rounded-xl p-3 border border-${colorScheme.from}-200 hover:border-${colorScheme.from}-400 hover:shadow-md cursor-pointer transition-all group" data-category="${categoriesList[categoryIndex].name}">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 bg-gradient-to-br from-${colorScheme.from}-400 to-${colorScheme.to}-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
            <i class="fas fa-utensils text-sm text-white"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900">${categoriesList[categoryIndex].name}</h3>
          </div>
        </div>
      </div>`;
  }

  categoriesContainer.innerHTML = htmlContent;
}

// Show Meals
export function renderMeals(mealsData) {
  console.log("meals");
  let mealsContainer = document.querySelector("#recipes-grid");
  let mealsCounter = document.querySelector("#recipes-count");
  let htmlContent = "";

  mealsCounter.innerHTML = `Showing ${mealsData.data.length} recipes`;

  mealsContainer.innerHTML = skeletonCards(1);

  for (let mealIndex = 0; mealIndex < mealsData.data.length; mealIndex++) {
    let currentMeal = mealsData.data[mealIndex];

    htmlContent += `
      <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-meal-id="${currentMeal.id}">
        <div class="relative h-48 overflow-hidden">
          <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="${currentMeal.thumbnail}" alt="${currentMeal.name}" loading="lazy"/>
          <div class="absolute bottom-3 left-3 flex gap-2">
            <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">
              ${currentMeal.category}
            </span>
            <span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white">
              ${currentMeal.area}
            </span>
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
            ${currentMeal.name}
          </h3>
          <p class="text-xs text-gray-600 mb-3 line-clamp-2">
            ${currentMeal.instructions.join(" ")}
          </p>
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-gray-900">
              <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
              ${currentMeal.category}
            </span>
            <span class="font-semibold text-gray-500">
              <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
              ${currentMeal.area}
            </span>
          </div>
        </div>
      </div>`;
  }

  if (mealsData.data.length === 0) {
    htmlContent = `
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
        </div>
        <p class="text-gray-500 text-lg">No recipes found</p>
        <p class="text-gray-400 text-sm mt-2">Try searching for something else</p>
      </div>`;
  }

  mealsContainer.innerHTML = htmlContent;
}

// List View
export function enableListView() {
  console.log("list");
  
  if (!viewHandlersAttached) {
    listViewButton.addEventListener("click", function () {
      console.log("switching");
      let mealCards = document.querySelectorAll(".recipe-card");
      
      listViewButton.classList.add("rounded-md", "bg-white", "shadow-sm");
      gridViewButton.classList.remove("rounded-md", "bg-white", "shadow-sm");

      for (let card of mealCards) {
        card.classList.add("flex", "flex-row", "h-40");
        card.querySelector("div").classList.add("h-full");
        card.querySelector("div").querySelector("div").classList.add("hidden");
      }
    });
  }
}

// Grid View
export function enableGridView() {
  console.log("grid");
  
  if (!viewHandlersAttached) {
    gridViewButton.addEventListener("click", function () {
      console.log("switching");
      let mealCards = document.querySelectorAll(".recipe-card");
      
      gridViewButton.classList.add("rounded-md", "bg-white", "shadow-sm");
      listViewButton.classList.remove("rounded-md", "bg-white", "shadow-sm");

      for (let card of mealCards) {
        card.classList.remove("flex", "flex-row", "h-40");
        card.querySelector("div").classList.remove("h-full");
        card.querySelector("div").querySelector("div").classList.remove("hidden");
      }
    });
    
    viewHandlersAttached = true;
  }
}

// Show Spinner
export function showMealsSpinner() {
  console.log("spinner");
  let mealsContainer = document.querySelector("#recipes-grid");
  mealsContainer.innerHTML = skeletonCards(1);
}

// Reset Areas
export function resetAreasStyle() {
  console.log("reset");
  let areaButtons = document.querySelectorAll(".area-filter-btn");

  for (let areaButton of areaButtons) {
    areaButton.classList.remove(
      "bg-emerald-600",
      "text-white",
      "hover:bg-emerald-700",
      "hover:text-white"
    );
    areaButton.classList.add("bg-gray-100", "text-gray-700", "hover:bg-gray-200");
  }
}

// Active Area
export function activateAreaButton(areaName) {
  console.log("active");
  let areaButton = document.querySelector(`.area-filter-btn[data-area="${areaName}"]`);

  areaButton.classList.add(
    "bg-emerald-600",
    "text-white",
    "hover:bg-emerald-700",
    "hover:text-white"
  );
  areaButton.classList.remove("bg-gray-100", "text-gray-700", "hover:bg-gray-200");
}

// Active All
export function activateAllRecipesButton() {
  console.log("all");
  let allRecipesButton = document.querySelector('.area-filter-btn[data-area=""]');
  allRecipesButton.classList.add(
    "bg-emerald-600",
    "text-white",
    "hover:bg-emerald-700",
    "hover:text-white"
  );
  allRecipesButton.classList.remove("bg-gray-100", "text-gray-700", "hover:bg-gray-200");
}

// Show Loader
export function showGeneralLoader() {
  console.log("showing");
  let loader = document.querySelector("#app-loading-overlay");
  loader.classList.remove("hidden");
}

// Hide Loader
export function hideGeneralLoader() {
  console.log("hiding");
  let loader = document.querySelector("#app-loading-overlay");
  loader.classList.add("hidden");
}

// Hide Sections
export function hideAllSections() {
  console.log("hiding");
  let allSections = document.querySelectorAll("section");
  for (let section of allSections) {
    section.classList.add("hidden");
  }

  let sidebarLinks = document.querySelectorAll("#sidebar nav ul li a");
  for (let link of sidebarLinks) {
    link.classList.remove("text-emerald-700", "bg-emerald-50");
    link.classList.add("hover:bg-gray-50", "text-gray-600");
  }
}

// Navigate Section
export function navigateToSection(sectionId) {
  console.log("navigating");
  let sections = document.querySelectorAll(sectionId);
  for (let section of sections) {
    section.classList.remove("hidden");
  }
}

// Active Sidebar
export function activateSidebarLink(linkIndex) {
  console.log("sidebar");
  let sidebarLinks = document.querySelectorAll("#sidebar nav ul li a");
  sidebarLinks[linkIndex].classList.add("text-emerald-700", "bg-emerald-50");
  sidebarLinks[linkIndex].classList.remove("hover:bg-gray-50", "text-gray-600");
}

// Show Error
export function showServerError(errorMessage) {
  console.log("error");
  Swal.fire({
    icon: "error",
    title: "Server Error",
    text: `Server issue: ${errorMessage}`,
    allowOutsideClick: false,
  });
}

// Meal Details
export function renderMealDetails(mealData) {
  console.log("details");
  
  let tagsHtml = "";
  if (mealData.tags !== undefined) {
    tagsHtml = mealData.tags
      .map(
        (tag) =>
          `<span class="px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full">${tag}</span>`
      )
      .join("");
  }

  let ingredientsHtml = mealData.ingredients
    .map(
      (ingredient) => `
      <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
        <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300"/>
        <span class="text-gray-700">
          <span class="font-medium text-gray-900">${ingredient.measure}</span> ${ingredient.ingredient}
        </span>
      </div>`
    )
    .join("");

  let instructionsHtml = mealData.instructions
    .map(
      (step, stepIndex) => `
      <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
        <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
          ${stepIndex + 1}
        </div>
        <p class="text-gray-700 leading-relaxed pt-2">${step}.</p>
      </div>`
    )
    .join("");

  let videoHtml = "";
  if (mealData.youtube !== "") {
    videoHtml = `
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <i class="fa-solid fa-video text-red-500"></i>
          Video Tutorial
        </h2>
        <div class="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
          <iframe src="${mealData.youtube}" class="absolute inset-0 w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>`;
  }

  let detailsHtml = `
    <div class="max-w-7xl mx-auto">
      <button id="back-to-meals-btn" class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors">
        <i class="fa-solid fa-arrow-left"></i>
        <span>Back to Recipes</span>
      </button>

      <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div class="relative h-80 md:h-96">
          <img src="${mealData.thumbnail}" alt="${mealData.name}" class="w-full h-full object-cover"/>
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-8">
            <div class="flex items-center gap-3 mb-3">
              <span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">${mealData.category}</span>
              <span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">${mealData.area}</span>
              ${tagsHtml}
            </div>
            <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">${mealData.name}</h1>
            <div id="meal-tips" class="flex items-center gap-6 text-white/90">
              <span class="flex items-center gap-2">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>calculating ...</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div id="log-meal-btn-container" class="flex flex-wrap gap-3 mb-8">
        <button id="log-meal-btn" class="flex items-center gap-2 px-6 py-3 bg-gray-300 text-black rounded-xl font-semibold transition-all" data-meal-id="${mealData.id}" disabled>
          <i class="fa-solid fa-spinner fa-spin"></i>
          <span>calculating ...</span>
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-8">
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-list-check text-emerald-600"></i>
              Ingredients
              <span class="text-sm font-normal text-gray-500 ml-auto">${mealData.ingredients.length} items</span>
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              ${ingredientsHtml}
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-shoe-prints text-emerald-600"></i>
              Instructions
            </h2>
            <div class="space-y-4">
              ${instructionsHtml}
            </div>
          </div>

          ${videoHtml}
        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-chart-pie text-emerald-600"></i>
              Nutrition Facts
            </h2>
            <div id="nutrition-facts-container">
              ${skeletonCards(1)}
            </div>
          </div>
        </div>
      </div>
    </div>`;

  document.getElementById("meal-details").innerHTML = detailsHtml;
}

// Nutrition Calculations
export function renderNutritionCalculations(nutritionData) {
  console.log("nutrition");
  
  let logButton = document.getElementById("log-meal-btn");

  // Update Button
  logButton.classList.remove("bg-gray-300", "text-black");
  logButton.classList.add("bg-blue-600", "hover:bg-blue-700", "text-white");
  logButton.innerHTML = `
    <i class="fa-solid fa-clipboard-list"></i>
    <span>Log This Meal</span>`;
  logButton.removeAttribute("disabled");

  // Update Tips
  let tipsContainer = document.querySelector("#meal-tips");
  tipsContainer.innerHTML = `
    <span class="flex items-center gap-2">
      <i class="fa-solid fa-clock"></i>
      <span>30 min</span>
    </span>
    <span class="flex items-center gap-2">
      <i class="fa-solid fa-utensils"></i>
      <span id="hero-servings">${nutritionData.servings} servings</span>
    </span>
    <span class="flex items-center gap-2">
      <i class="fa-solid fa-fire"></i>
      <span id="hero-calories">${nutritionData.perServing.calories} cal/serving</span>
    </span>`;

  // Update Nutrition
  let nutritionContainer = document.querySelector("#nutrition-facts-container");
  nutritionContainer.innerHTML = `
    <p class="text-sm text-gray-500 mb-4">Per serving</p>
    <div class="text-center py-4 mb-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
      <p class="text-sm text-gray-600">Calories per serving</p>
      <p class="text-4xl font-bold text-emerald-600">${nutritionData.perServing.calories}</p>
      <p class="text-xs text-gray-500 mt-1">Total: ${nutritionData.perServing.calories} cal</p>
    </div>
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span class="text-gray-700">Protein</span>
        </div>
        <span class="font-bold text-gray-900">${nutritionData.perServing.protein}g</span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-2">
        <div class="bg-emerald-500 h-2 rounded-full" style="width: 84%"></div>
      </div>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-blue-500"></div>
          <span class="text-gray-700">Carbs</span>
        </div>
        <span class="font-bold text-gray-900">${nutritionData.perServing.carbs}g</span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-2">
        <div class="bg-blue-500 h-2 rounded-full" style="width: 17%"></div>
      </div>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-purple-500"></div>
          <span class="text-gray-700">Fat</span>
        </div>
        <span class="font-bold text-gray-900">${nutritionData.perServing.fat}g</span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-2">
        <div class="bg-purple-500 h-2 rounded-full" style="width: 12%"></div>
      </div>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-orange-500"></div>
          <span class="text-gray-700">Fiber</span>
        </div>
        <span class="font-bold text-gray-900">${nutritionData.perServing.fiber}g</span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-2">
        <div class="bg-orange-500 h-2 rounded-full" style="width: 14%"></div>
      </div>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-pink-500"></div>
          <span class="text-gray-700">Sugar</span>
        </div>
        <span class="font-bold text-gray-900">${nutritionData.perServing.sugar}g</span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-2">
        <div class="bg-pink-500 h-2 rounded-full" style="width: 24%"></div>
      </div>
    </div>`;
}

// Product Categories
export function renderProductCategories(categoriesData) {
  console.log("categories");
  let categoriesContainer = document.querySelector("#product-categories");
  categoriesContainer.innerHTML = "";

  for (let category of categoriesData.results) {
    let randomIndex = Math.round(Math.random() * 11);
    let colorScheme = CATEGORY_COLORS[randomIndex];

    categoriesContainer.innerHTML += `
      <button class="product-category-btn flex-shrink-0 px-5 py-3 bg-gradient-to-r from-${colorScheme.to}-500 to-${colorScheme.from}-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all" data-category="${category.name}">
        <i class="fas fa-carrot mr-2"></i>
        ${category.name}
      </button>`;
  }
}

// Product Spinner
export function showProductsSpinner() {
  console.log("spinner");
  let productsContainer = document.querySelector("#products-grid");
  productsContainer.innerHTML = `
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>`;
}

// Show Products
export function renderProducts(productsData) {
  console.log("products");
  let productsContainer = document.querySelector("#products-grid");
  productsContainer.innerHTML = "";

  for (let product of productsData.data) {
    let gradeColor = product.nutritionGrade
      ? product.nutritionGrade === "a"
        ? "green"
        : product.nutritionGrade === "b"
        ? "green"
        : product.nutritionGrade === "c"
        ? "yellow"
        : product.nutritionGrade === "d"
        ? "red"
        : "lime"
      : "lime";

    let novaColor = product.novaGroup
      ? product.novaGroup === "1"
        ? "lime"
        : product.novaGroup === "2"
        ? "lime"
        : product.novaGroup === "3"
        ? "yellow"
        : product.novaGroup === "4"
        ? "red"
        : "gray hidden"
      : "gray hidden";

    productsContainer.innerHTML += `
      <div class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-barcode="${product.barcode}">
        <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
          <img class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" src="${product.image}" alt="Product" loading="lazy"/>
          <div class="absolute top-2 left-2 bg-${gradeColor}-500 text-white text-xs font-bold px-2 py-1 rounded uppercase">
            Nutri-Score ${product.nutritionGrade.toUpperCase()}
          </div>
          <div class="absolute top-2 right-2 bg-${novaColor}-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center" title="NOVA">
            ${product.novaGroup ? product.novaGroup : ""}
          </div>
        </div>
        <div class="p-4">
          <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${product.brand}</p>
          <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            ${product.name}
          </h3>
          <div class="grid grid-cols-4 gap-1 text-center">
            <div class="bg-emerald-50 rounded p-1.5">
              <p class="text-xs font-bold text-emerald-700">${product.nutrients.protein}g</p>
              <p class="text-[10px] text-gray-500">Protein</p>
            </div>
            <div class="bg-blue-50 rounded p-1.5">
              <p class="text-xs font-bold text-blue-700">${product.nutrients.carbs}g</p>
              <p class="text-[10px] text-gray-500">Carbs</p>
            </div>
            <div class="bg-purple-50 rounded p-1.5">
              <p class="text-xs font-bold text-purple-700">${product.nutrients.fat}g</p>
              <p class="text-[10px] text-gray-500">Fat</p>
            </div>
            <div class="bg-orange-50 rounded p-1.5">
              <p class="text-xs font-bold text-orange-700">${product.nutrients.sugar}g</p>
              <p class="text-[10px] text-gray-500">Sugar</p>
            </div>
          </div>
        </div>
      </div>`;
  }

  if (productsData.data.length === 0) {
    productsContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
        </div>
        <p class="text-gray-500 text-lg">No products found</p>
        <p class="text-gray-400 text-sm mt-2">Try searching for something else</p>
      </div>`;
  }
}

// Show Success
export function showSuccessAlert(message) {
  console.log("success");
  Swal.fire({
    icon: "success",
    title: message,
    allowOutsideClick: false,
  });
}

// Show Failure
export function showErrorAlert(message) {
  console.log("error");
  Swal.fire({
    icon: "error",
    title: "Error",
    text: message,
    allowOutsideClick: false,
  });
}

// Food Log
export function renderFoodLog(domElements, { items, totals, targets }) {
  console.log("foodlog");
  
  // Header
  let headerElement = domElements.foodlogTodaySection?.querySelector("h4.text-sm.font-semibold");
  if (headerElement) headerElement.textContent = `Logged Items (${items.length})`;

  // Clear Button
  if (domElements.clearFoodlogBtn) {
    domElements.clearFoodlogBtn.style.display = items.length ? "" : "none";
  }

  // Items List
  if (domElements.loggedItemsList) {
    if (!items.length) {
      domElements.loggedItemsList.innerHTML = `
        <div class="text-center py-10 text-gray-500">
          <i class="fa-solid fa-utensils text-4xl mb-3 text-gray-300"></i>
          <p class="font-medium">No items logged today</p>
          <p class="text-sm">Add meals from the Meals page, scan products, or add a custom entry</p>
        </div>
      `;
    } else {
      domElements.loggedItemsList.innerHTML = items
        .map((logItem) => {
          let timeString = new Date(logItem.timestamp || logItem.ts).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          let itemTypeLabel =
            String(logItem.type || "").toLowerCase() === "meal"
              ? "Recipe"
              : String(logItem.type || "").toLowerCase() === "product"
              ? "Product"
              : "Custom";

          let thumbnailUrl =
            logItem?.meta?.thumbnail || logItem?.meta?.image || logItem?.thumbnail || "";

          let servingsText = logItem?.meta?.servings
            ? `${logItem.meta.servings} serving`
            : "1 serving";

          return `
            <div class="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                  ${thumbnailUrl ? `<img src="${thumbnailUrl}" alt="${logItem.name}" class="w-full h-full object-cover" />` : ""}
                </div>
                <div class="min-w-0">
                  <div class="font-semibold text-gray-900 text-sm truncate">${logItem.name}</div>
                  <div class="text-xs text-gray-500">
                    ${servingsText} &nbsp;•&nbsp; ${itemTypeLabel}
                  </div>
                  <div class="text-xs text-gray-400">${timeString}</div>
                </div>
              </div>
              <div class="flex items-center gap-6 text-xs text-gray-600">
                <div class="text-right">
                  <div class="font-semibold text-emerald-700">${Number(logItem.calories || 0)}</div>
                  <div class="text-[11px] text-gray-400">kcal</div>
                </div>
                <div class="text-right">
                  <div class="font-semibold text-gray-800">${Number(logItem.protein || 0)}<span class="text-[11px] text-gray-400">g</span></div>
                  <div class="text-[11px] text-gray-400">P</div>
                </div>
                <div class="text-right">
                  <div class="font-semibold text-gray-800">${Number(logItem.carbs || 0)}<span class="text-[11px] text-gray-400">g</span></div>
                  <div class="text-[11px] text-gray-400">C</div>
                </div>
                <div class="text-right">
                  <div class="font-semibold text-gray-800">${Number(logItem.fat || 0)}<span class="text-[11px] text-gray-400">g</span></div>
                  <div class="text-[11px] text-gray-400">F</div>
                </div>
                <button class="p-2 rounded-lg hover:bg-gray-50 text-gray-500" data-action="delete-log" data-id="${logItem.id}" title="Delete">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          `;
        })
        .join("");
    }
  }

  // Progress Cards
  let progressCards = domElements.foodlogTodaySection?.querySelectorAll(".grid > div");
  if (progressCards && progressCards.length >= 4) {
    updateProgressCard(progressCards[0], "Calories", totals.calories, targets.calories, "kcal");
    updateProgressCard(progressCards[1], "Protein", totals.protein, targets.protein, "g");
    updateProgressCard(progressCards[2], "Carbs", totals.carbs, targets.carbs, "g");
    updateProgressCard(progressCards[3], "Fat", totals.fat, targets.fat, "g");
  }
}

// Progress Card
function updateProgressCard(cardElement, labelText, currentValue, targetValue, unitText) {
  let topRow = cardElement.querySelector(".flex.items-center.justify-between");
  let progressBar = cardElement.querySelector(".w-full.bg-gray-200 > div");

  let titleElement = cardElement.querySelector("h5, .font-semibold, .text-sm.font-semibold");
  if (titleElement) titleElement.textContent = labelText;

  let valueNum = Number(currentValue) || 0;
  let targetNum = Number(targetValue) || 0;

  if (topRow) {
    let rightSpan = topRow.querySelector("span.text-sm.text-gray-500");
    if (rightSpan) rightSpan.textContent = `${Math.round(valueNum)} / ${targetNum} ${unitText}`;
  }

  if (progressBar) {
    let percentage = targetNum > 0 ? Math.min(100, Math.round((valueNum / targetNum) * 100)) : 0;
    progressBar.style.width = `${percentage}%`;
  }
}

// Weekly Chart
export function renderWeeklyChart(containerId, weekData = []) {
  console.log("chart");
  
  let chartElement =
    typeof containerId === "string"
      ? document.getElementById(containerId)
      : containerId;

  if (!chartElement || !weekData.length || typeof Plotly === "undefined") return;

  let dateLabels = weekData.map((day) => day.date);
  Plotly.newPlot(
    chartElement,
    [
      { x: dateLabels, y: weekData.map((day) => day.calories), name: "Calories", type: "bar" },
      { x: dateLabels, y: weekData.map((day) => day.protein), name: "Protein", type: "bar" },
      { x: dateLabels, y: weekData.map((day) => day.carbs), name: "Carbs", type: "bar" },
      { x: dateLabels, y: weekData.map((day) => day.fat), name: "Fat", type: "bar" },
    ],
    {
      margin: { t: 20, r: 10, l: 40, b: 40 },
      barmode: "group",
      showlegend: true,
    },
    { displayModeBar: false, responsive: true }
  );
}
