// =========== Loading Spinner Design ============
/*
<div class="flex items-center justify-center py-12">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
</div>
*/

// =========== Empty State Design ============
/*
<div class="flex flex-col items-center justify-center py-12 text-center">
    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
    </div>
    <p class="text-gray-500 text-lg">No recipes found</p>
    <p class="text-gray-400 text-sm mt-2">Try searching for something else</p>
</div>
*/

// Skeleton Loader
export let skeletonCards = (count = 8) =>
  Array.from({ length: count })
    .map(
      () => `
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
    `
    )
    .join("");

// Countries Renderer
export function renderCountries(countriesList) {
  // console.log("countries");
  return (
    `
      <button id="all-recipes-btn" 
        class="px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all"
      >
        All Recipes
      </button>` +
    countriesList
      .map(
        (country) => `
        <button data-area="${escapeHtml(country.name)}"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all"
        >
          ${escapeHtml(country.name)}
        </button>`
      )
      .join("")
  );
}

// Categories Renderer
export function renderCategories(categoriesList) {
  // console.log("categories");
  return categoriesList
    .map(
      (category) => `
  <div class="category-card bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all group"
       data-category="${category.name}">
    <div class="flex items-center gap-2.5">
      <div class="text-white w-9 h-9 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
        <i class="fa-solid fa-utensils"></i>
      </div>
      <div>
        <h3 class="text-sm font-bold text-gray-900">${escapeHtml(category.name)}</h3>
      </div>
    </div>
  </div>`
    )
    .join("");
}

// Meals Grid
export function renderMealsGrid(mealsList) {
  // console.log("meals");
  return mealsList
    .map(
      (meal) => `
  <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
       data-meal-id="${meal.id}">
    <div class="relative h-48 overflow-hidden">
      <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
           src="${meal.thumbnail || "https://via.placeholder.com/300x200?text=No+Image"}"
           alt="${meal.name}"
           loading="lazy" />
      <div class="absolute bottom-3 left-3 flex gap-2">
        <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">
          ${meal.category || "Meal"}
        </span>
        <span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white">
          ${meal.area || "Cuisine"}
        </span>
      </div>
    </div>
    <div class="p-4">
      <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
        ${meal.name}
      </h3>
      <p class="text-xs text-gray-600 mb-3 line-clamp-2">${meal.instructions[0] || "No description available."}</p>
      <div class="flex items-center justify-between text-xs">
        <span class="font-semibold text-gray-900">
          <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
          ${meal.category || "—"}
        </span>
        <span class="font-semibold text-gray-500">
          <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
          ${meal.area || "—"}
        </span>
      </div>
    </div>
  </div>`
    )
    .join("");
}

// Meal Details
export function renderMealDetails(domElements, mealData) {
  // console.log("details");
  
  // Hero Image
  let heroImage = domElements.mealDetails.querySelector("img");
  if (heroImage) heroImage.src = mealData.thumbnail || "";

  // Title
  let heroTitle = domElements.mealDetails.querySelector("h1");
  if (heroTitle) heroTitle.textContent = mealData.name || "";

  // Badges
  let badgeWrapper = domElements.mealDetails.querySelector(".absolute.bottom-0 .flex.items-center.gap-3");
  if (badgeWrapper) {
    badgeWrapper.innerHTML = `
      <span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">${mealData.category || "Meal"}</span>
      <span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">${mealData.area || "Cuisine"}</span>
      <span class="px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full">${(mealData.tags && mealData.tags[0]) || "Recipe"}</span>
    `;
  }

  // Ingredients
  let ingredientsContainer = domElements.mealDetails.querySelector(".grid.grid-cols-1.md\\:grid-cols-2.gap-3");
  if (ingredientsContainer) {
    ingredientsContainer.innerHTML = (mealData.ingredients || [])
      .map(
        (ingredient) => `
      <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
        <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300" />
        <span class="text-gray-700">
          <span class="font-medium text-gray-900">${ingredient.measure || ""}</span>
          ${ingredient.ingredient || ""}
        </span>
      </div>`
      )
      .join("");
  }

  // Ingredients Count
  let ingredientsCountSpan = domElements.mealDetails.querySelector("h2 span.text-sm.font-normal");
  if (ingredientsCountSpan)
    ingredientsCountSpan.textContent = `${(mealData.ingredients || []).length} items`;

  // Instructions
  let stepsWrapper = domElements.mealDetails.querySelector(".space-y-4");
  if (stepsWrapper) {
    stepsWrapper.innerHTML = (mealData.instructions || [])
      .map(
        (step, stepIndex) => `
      <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
        <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
          ${stepIndex + 1}
        </div>
        <p class="text-gray-700 leading-relaxed pt-2">${step}</p>
      </div>`
      )
      .join("");
  }

  // Video
  let videoIframe = domElements.mealDetails.querySelector("iframe");
  if (videoIframe) {
    let youtubeVideoId = extractYoutubeId(mealData.youtube || "");
    videoIframe.src = youtubeVideoId ? `https://www.youtube.com/embed/${youtubeVideoId}` : "";
  }

  // Log Button
  if (domElements.logMealBtn) domElements.logMealBtn.dataset.mealId = mealData.id;
}

// Products Grid
export function renderProductsGrid(productsList = []) {
  // console.log("products");
  return productsList
    .map((product) => {
      let nutritionGrade = (product.nutritionGrade || "").toUpperCase();
      let nutrients = product.nutrients || {};
      let productImage = product.image || "https://via.placeholder.com/150?text=No+Image";

      return `
      <div class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
           data-barcode="${product.barcode}"
           data-grade="${(product.nutritionGrade || "").toLowerCase()}">
        <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
          <img class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
               src="${productImage}" alt="${product.name}" loading="lazy" />
          ${nutritionGrade ? `<div class="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded uppercase">Nutri-Score ${nutritionGrade}</div>` : ""}
        </div>

        <div class="p-4">
          <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">Packaged</p>
          <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            ${product.name || "Product"}
          </h3>

          <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span><i class="fa-solid fa-barcode mr-1"></i>${product.barcode}</span>
            <span><i class="fa-solid fa-fire mr-1"></i>${Number(nutrients.calories || 0)} kcal</span>
          </div>

          <div class="grid grid-cols-4 gap-1 text-center">
            <div class="bg-emerald-50 rounded p-1.5">
              <p class="text-xs font-bold text-emerald-700">${Number(nutrients.protein || 0).toFixed(1)}g</p>
              <p class="text-[10px] text-gray-500">Protein</p>
            </div>
            <div class="bg-blue-50 rounded p-1.5">
              <p class="text-xs font-bold text-blue-700">${Number(nutrients.carbs || 0).toFixed(1)}g</p>
              <p class="text-[10px] text-gray-500">Carbs</p>
            </div>
            <div class="bg-purple-50 rounded p-1.5">
              <p class="text-xs font-bold text-purple-700">${Number(nutrients.fat || 0).toFixed(1)}g</p>
              <p class="text-[10px] text-gray-500">Fat</p>
            </div>
            <div class="bg-orange-50 rounded p-1.5">
              <p class="text-xs font-bold text-orange-700">${Number(nutrients.calories || 0).toFixed(0)}</p>
              <p class="text-[10px] text-gray-500">Calories</p>
            </div>
          </div>
        </div>
      </div>
      `;
    })
    .join("");
}

// Food Log
export function renderFoodLog(domElements, { items, totals, targets }) {
  // console.log("foodlog");
  
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

                <button
                  class="p-2 rounded-lg hover:bg-gray-50 text-gray-500"
                  data-action="delete-log"
                  data-id="${logItem.id}"
                  title="Delete"
                >
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

// YouTube Helper
function extractYoutubeId(videoUrl) {
  if (!videoUrl) return "";
  try {
    let urlObject = new URL(videoUrl);
    if (urlObject.hostname.includes("youtu.be")) return urlObject.pathname.replace("/", "");
    return urlObject.searchParams.get("v") || "";
  } catch {
    let match = videoUrl.match(/v=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : "";
  }
}

// Weekly Chart
export function renderWeeklyChart(containerId, weekData = []) {
  // console.log("chart");
  
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

// HTML Escape
export function escapeHtml(htmlString) {
  return String(htmlString ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}