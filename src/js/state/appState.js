// Storage Key
let STORAGE_KEY = "nutriplan_foodlog_v1";

// Days Array
let DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Date Formatter
function formatDateKey(date = new Date()) {
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, "0");
  let day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Load Database
function loadDatabase() {
  let storedData = localStorage.getItem(STORAGE_KEY);
  console.log("loaded");
  return JSON.parse(storedData) || {};
}

// Save Database
function saveDatabase(database) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
  console.log("saved");
}

// State Manager
export let appState = {
  currentPage: "meals",
  activeMealId: null,
  currentNutrition: null,
  currentProducts: [],

  // Get Key
  getDayKey(date = new Date()) {
    console.log("key");
    return formatDateKey(date);
  },

  // Get Items
  getDayLog(date = new Date()) {
    let database = loadDatabase();
    let dateKey = formatDateKey(date);
    let items = database[dateKey] || [];
    console.log("items");
    return items;
  },

  // Add Item
  addToDayLog(item, date = new Date()) {
    let database = loadDatabase();
    let dateKey = formatDateKey(date);
    let itemsList = database[dateKey] || [];

    let newItem = {
      id: String(Date.now() + Math.random()),
      timestamp: Date.now(),
      ...item,
      calories: Number(item.calories || 0),
      protein: Number(item.protein || 0),
      carbs: Number(item.carbs || 0),
      fat: Number(item.fat || 0),
    };

    itemsList.unshift(newItem);
    database[dateKey] = itemsList;
    saveDatabase(database);
    console.log("added");
    return newItem;
  },

  // Clear Items
  clearDayLog(date = new Date()) {
    let database = loadDatabase();
    let dateKey = formatDateKey(date);
    database[dateKey] = [];
    saveDatabase(database);
    console.log("cleared");
  },

  // Weekly Summary
  getLast7DaysSummary() {
    let database = loadDatabase();
    let weeklyData = [];

    for (let dayIndex = 6; dayIndex >= 0; dayIndex--) {
      let currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - dayIndex);
      let dateKey = formatDateKey(currentDate);
      let dayItems = database[dateKey] || [];

      let dayTotals = dayItems.reduce(
        (totals, item) => {
          totals.calories += Number(item.calories || 0);
          totals.protein += Number(item.protein || 0);
          totals.carbs += Number(item.carbs || 0);
          totals.fat += Number(item.fat || 0);
          return totals;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      weeklyData.push({ date: dateKey, ...dayTotals });
    }

    console.log("weekly");
    return weeklyData;
  },

  // Delete Item
  deleteFromDayLog(itemId, date = new Date()) {
    let database = loadDatabase();
    let dateKey = formatDateKey(date);
    let itemsList = database[dateKey] || [];

    let filteredList = itemsList.filter((item) => item.id !== itemId);

    database[dateKey] = filteredList;
    saveDatabase(database);

    let wasDeleted = filteredList.length !== itemsList.length;
    console.log("deleted");
    return wasDeleted;
  },

  // Set Nutrition
  setCurrentNutrition(nutritionData) {
    this.currentNutrition = nutritionData;
    console.log("nutrition");
  },

  // Get Nutrition
  getCurrentNutrition() {
    console.log("getting");
    return this.currentNutrition;
  },

  // Set Products
  setCurrentProducts(productsData) {
    this.currentProducts = productsData;
    console.log("products");
  },

  // Get Products
  getCurrentProducts() {
    console.log("getting");
    return this.currentProducts;
  },
};