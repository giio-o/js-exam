/**
 * NutriPlan - Main Entry Point
 */

import * as mealdb from "./api/mealdb.js";
import * as off from "./api/openfoodfacts.js";
import {
  state,
  GOALS,
  getTodayEntries,
  getTotalsForEntries,
  getWeeklyTotals,
  addFoodLogEntry,
  removeFoodLogEntry,
  clearFoodLog,
  toggleFavorite,
  isFavorite,
} from "./state/appState.js";
import * as ui from "./ui/components.js";
import { NATIONALITIES } from "./data/nationalities.js";

// ---- DOM refs (grabbed once at startup) ----
const els = {};

function cacheDom() {
  els.loadingOverlay = document.getElementById("app-loading-overlay");
  els.sidebar = document.getElementById("sidebar");
  els.sidebarOverlay = document.getElementById("sidebar-overlay");
  els.sidebarCloseBtn = document.getElementById("sidebar-close-btn");
  els.headerMenuBtn = document.getElementById("header-menu-btn");
  els.navLinks = Array.from(document.querySelectorAll(".nav-link"));
  els.headerTitle = document.querySelector("#header h1");
  els.headerSubtitle = document.querySelector("#header p");

  els.searchInput = document.getElementById("search-input");
  els.categoriesGrid = document.getElementById("categories-grid");
  els.recipesGrid = document.getElementById("recipes-grid");
  els.recipesCount = document.getElementById("recipes-count");
  els.gridViewBtn = document.getElementById("grid-view-btn");
  els.listViewBtn = document.getElementById("list-view-btn");
  els.cuisinePillsContainer = document.querySelector("#search-filters-section .flex.items-center.gap-3.overflow-x-auto");
  els.viewAllCategoriesBtn = document.querySelector("#meal-categories-section button");

  els.mealDetailsSection = document.getElementById("meal-details");
  els.backToMealsBtn = document.getElementById("back-to-meals-btn");
  els.logMealBtn = document.getElementById("log-meal-btn");

  els.searchFiltersSection = document.getElementById("search-filters-section");
  els.mealCategoriesSection = document.getElementById("meal-categories-section");
  els.allRecipesSection = document.getElementById("all-recipes-section");
  els.productsSection = document.getElementById("products-section");
  els.foodlogSection = document.getElementById("foodlog-section");

  els.productSearchInput = document.getElementById("product-search-input");
  els.barcodeInput = document.getElementById("barcode-input");
  els.searchProductBtn = document.getElementById("search-product-btn");
  els.lookupBarcodeBtn = document.getElementById("lookup-barcode-btn");
  els.productsGrid = document.getElementById("products-grid");
  els.productsCount = document.getElementById("products-count");
  els.nutriScoreFilters = document.querySelectorAll(".nutri-score-filter");
  els.productCategoryBtns = document.querySelectorAll(".product-category-btn");

  els.foodlogDate = document.getElementById("foodlog-date");
  els.loggedItemsList = document.getElementById("logged-items-list");
  els.clearFoodlogBtn = document.getElementById("clear-foodlog");
  els.weeklyChart = document.getElementById("weekly-chart");
  els.quickLogBtns = document.querySelectorAll(".quick-log-btn");
}

// ---- App bootstrap ----

async function init() {
  cacheDom();
  bindEvents();
  showPage("meals");
  showLoadingOverlay();

  ui.renderCuisinePills(els.cuisinePillsContainer, NATIONALITIES, state.currentArea);

  try {
    state.currentCategory = mealdb.DEFAULT_CATEGORY;
    const [categories, recipes] = await Promise.all([
      mealdb.getCategories(),
      mealdb.getEnrichedCategoryRecipes(mealdb.DEFAULT_CATEGORY),
    ]);
    state.categories = categories;
    state.allRecipes = recipes;
    state.visibleRecipes = recipes;
    renderCategoriesGrid();
    ui.renderRecipes(els.recipesGrid, recipes, { viewMode: state.viewMode });
    ui.updateRecipesCount(els.recipesCount, recipes.length);
  } catch (err) {
    console.error("Failed to load initial meal data", err);
    ui.renderError(els.recipesGrid, "Couldn't load recipes. Please check your connection and refresh.");
  } finally {
    hideLoadingOverlay();
  }

  renderFoodLogPage();
}

function renderCategoriesGrid() {
  const list = state.showAllCategories
    ? state.categories
    : mealdb.visibleCategories(state.categories);
  ui.renderCategories(els.categoriesGrid, list, state.currentCategory);
  if (els.viewAllCategoriesBtn) {
    els.viewAllCategoriesBtn.innerHTML = state.showAllCategories
      ? `Show Less <i class="fa-solid fa-chevron-up text-xs"></i>`
      : `View All <i class="fa-solid fa-chevron-right text-xs"></i>`;
  }
}

function showLoadingOverlay() {
  if (!els.loadingOverlay) return;
  els.loadingOverlay.classList.remove("loading");
  els.loadingOverlay.style.display = "flex";
  els.loadingOverlay.style.opacity = "1";
}

function hideLoadingOverlay() {
  if (!els.loadingOverlay) return;
  els.loadingOverlay.style.opacity = "0";
  setTimeout(() => {
    els.loadingOverlay.style.display = "none";
    els.loadingOverlay.classList.add("loading");
  }, 300);
}

// ---- Navigation ----

const PAGE_CONFIG = {
  meals: {
    title: "Meals & Recipes",
    subtitle: "Discover delicious and nutritious recipes tailored for you",
  },
  products: {
    title: "Product Scanner",
    subtitle: "Search packaged foods by name or barcode",
  },
  foodlog: {
    title: "Food Log",
    subtitle: "Track your daily nutrition and food intake",
  },
};

function showPage(page) {
  state.currentPage = page;

  const sections = {
    meals: [els.searchFiltersSection, els.mealCategoriesSection, els.allRecipesSection],
    products: [els.productsSection],
    foodlog: [els.foodlogSection],
  };

  Object.entries(sections).forEach(([key, sectionEls]) => {
    sectionEls.forEach((el) => {
      if (el) el.style.display = key === page ? "" : "none";
    });
  });
  if (els.mealDetailsSection) els.mealDetailsSection.style.display = "none";

  const config = PAGE_CONFIG[page];
  if (config) {
    if (els.headerTitle) els.headerTitle.textContent = config.title;
    if (els.headerSubtitle) els.headerSubtitle.textContent = config.subtitle;
  }

  els.navLinks.forEach((link) => {
    const label = link.querySelector("span")?.textContent?.trim();
    const isActive =
      (page === "meals" && label === "Meals & Recipes") ||
      (page === "products" && label === "Product Scanner") ||
      (page === "foodlog" && label === "Food Log");
    link.classList.toggle("bg-emerald-50", isActive);
    link.classList.toggle("text-emerald-700", isActive);
    link.classList.toggle("text-gray-600", !isActive);
  });

  if (page === "foodlog") renderFoodLogPage();
  closeSidebar();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showMealDetails() {
  [els.searchFiltersSection, els.mealCategoriesSection, els.allRecipesSection].forEach((el) => {
    if (el) el.style.display = "none";
  });
  if (els.mealDetailsSection) els.mealDetailsSection.style.display = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function backToMeals() {
  [els.searchFiltersSection, els.mealCategoriesSection, els.allRecipesSection].forEach((el) => {
    if (el) el.style.display = "";
  });
  if (els.mealDetailsSection) els.mealDetailsSection.style.display = "none";
}

function openSidebar() {
  els.sidebar?.classList.add("open");
  els.sidebarOverlay?.classList.add("active");
}
function closeSidebar() {
  els.sidebar?.classList.remove("open");
  els.sidebarOverlay?.classList.remove("active");
}

// ---- Event wiring ----

function bindEvents() {
  els.headerMenuBtn?.addEventListener("click", openSidebar);
  els.sidebarCloseBtn?.addEventListener("click", closeSidebar);
  els.sidebarOverlay?.addEventListener("click", closeSidebar);

  els.navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const label = link.querySelector("span")?.textContent?.trim();
      if (label === "Meals & Recipes") showPage("meals");
      else if (label === "Product Scanner") showPage("products");
      else if (label === "Food Log") showPage("foodlog");
    });
  });

  // Search (debounced)
  let searchTimer;
  els.searchInput?.addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    const query = e.target.value.trim();
    searchTimer = setTimeout(() => handleSearch(query), 350);
  });

  // Cuisine pills ("All Cuisines" + nationality list), delegated since re-rendered
  els.cuisinePillsContainer?.addEventListener("click", (e) => {
    const btn = e.target.closest(".cuisine-filter-btn");
    if (!btn) return;
    const area = btn.getAttribute("data-area") || "";
    state.currentArea = area;
    ui.renderCuisinePills(els.cuisinePillsContainer, NATIONALITIES, area);
    if (area === "") {
      resetRecipeFilters();
    } else {
      handleAreaFilter(area);
    }
  });

  // Category cards (delegated, since re-rendered)
  els.categoriesGrid?.addEventListener("click", (e) => {
    const card = e.target.closest(".category-card");
    if (!card) return;
    const category = card.getAttribute("data-category");
    handleCategoryFilter(category);
  });

  els.viewAllCategoriesBtn?.addEventListener("click", () => {
    state.showAllCategories = !state.showAllCategories;
    renderCategoriesGrid();
  });

  // Recipe cards (delegated)
  els.recipesGrid?.addEventListener("click", (e) => {
    const card = e.target.closest(".recipe-card");
    if (!card) return;
    const mealId = card.getAttribute("data-meal-id");
    openMealDetails(mealId);
  });

  els.gridViewBtn?.addEventListener("click", () => setViewMode("grid"));
  els.listViewBtn?.addEventListener("click", () => setViewMode("list"));

  els.backToMealsBtn?.addEventListener("click", backToMeals);

  els.logMealBtn?.addEventListener("click", () => {
    if (state.currentMeal) logMealToFoodLog(state.currentMeal);
  });

  els.mealDetailsSection?.addEventListener("click", (e) => {
    const checkbox = e.target.closest(".ingredient-checkbox");
    if (!checkbox) return;
    const row = checkbox.closest("div");
    row?.classList.toggle("opacity-50");
    row?.querySelector("span")?.classList.toggle("line-through");
  });

  // Product scanner
  els.searchProductBtn?.addEventListener("click", handleProductSearch);
  els.productSearchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleProductSearch();
  });
  els.lookupBarcodeBtn?.addEventListener("click", handleBarcodeLookup);
  els.barcodeInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleBarcodeLookup();
  });
  els.nutriScoreFilters?.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.currentNutriFilter = btn.getAttribute("data-grade") || "";
      els.nutriScoreFilters.forEach((b) => b.classList.remove("ring-2", "ring-offset-1", "ring-emerald-400"));
      btn.classList.add("ring-2", "ring-offset-1", "ring-emerald-400");
      applyProductFilters();
    });
  });
  els.productCategoryBtns?.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const label = btn.textContent.trim();
      state.currentProductCategory = label;
      ui.renderLoading(els.productsGrid, `Loading ${label}...`);
      try {
        const raw = await off.searchProductsByCategory(label);
        state.products = raw.map(off.normalizeProduct);
        applyProductFilters();
      } catch (err) {
        console.error(err);
        ui.renderError(els.productsGrid, "Couldn't load that category. Please try again.");
      }
    });
  });

  // Food log
  els.clearFoodlogBtn?.addEventListener("click", handleClearFoodLog);
  els.loggedItemsList?.addEventListener("click", (e) => {
    const btn = e.target.closest(".remove-log-entry-btn");
    if (!btn) return;
    removeFoodLogEntry(btn.getAttribute("data-entry-id"));
    renderFoodLogPage();
  });
  els.quickLogBtns?.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      if (index === 0) showPage("meals");
      else if (index === 1) showPage("products");
      else handleCustomEntry();
    });
  });
}

// ---- Recipes / Meals ----

// Category (meal type) and cuisine (area) filters are independent, like on
// the reference site - both a category card and a cuisine pill can be
// active at once, and results are the intersection of the two.
async function refreshRecipes() {
  ui.renderLoading(els.recipesGrid, "Loading recipes...");
  try {
    let meals;
    if (state.currentArea) {
      const [byCategory, byArea] = await Promise.all([
        mealdb.filterByCategory(state.currentCategory),
        mealdb.filterByArea(state.currentArea),
      ]);
      const areaIds = new Set(byArea.map((m) => m.idMeal));
      meals = byCategory.filter((m) => areaIds.has(m.idMeal));
    } else {
      meals = await mealdb.filterByCategory(state.currentCategory);
    }
    // Enrich with full lookups so cards show real category + cuisine tags.
    const enriched = await Promise.all(
      meals.map((m) => mealdb.lookupMealById(m.idMeal).catch(() => m))
    );
    state.visibleRecipes = enriched.filter(Boolean);
    ui.renderRecipes(els.recipesGrid, state.visibleRecipes, { viewMode: state.viewMode });
    ui.updateRecipesCount(els.recipesCount, state.visibleRecipes.length);
  } catch (err) {
    console.error(err);
    ui.renderError(els.recipesGrid, "Couldn't load these recipes. Please try again.");
  }
}

function resetRecipeFilters() {
  state.currentArea = "";
  state.searchQuery = "";
  els.searchInput.value = "";
  refreshRecipes();
}

async function handleSearch(query) {
  state.searchQuery = query;
  if (!query) {
    refreshRecipes();
    return;
  }
  ui.renderLoading(els.recipesGrid, "Searching recipes...");
  try {
    const meals = await mealdb.searchMealsByName(query);
    state.visibleRecipes = meals;
    ui.renderRecipes(els.recipesGrid, meals, { viewMode: state.viewMode });
    ui.updateRecipesCount(els.recipesCount, meals.length);
  } catch (err) {
    console.error(err);
    ui.renderError(els.recipesGrid, "Search failed. Please try again.");
  }
}

function handleCategoryFilter(category) {
  state.currentCategory = category;
  state.searchQuery = "";
  els.searchInput.value = "";
  renderCategoriesGrid();
  refreshRecipes();
}

function handleAreaFilter(area) {
  state.currentArea = area;
  refreshRecipes();
}

function setViewMode(mode) {
  state.viewMode = mode;
  els.gridViewBtn.classList.toggle("bg-white", mode === "grid");
  els.gridViewBtn.classList.toggle("shadow-sm", mode === "grid");
  els.listViewBtn.classList.toggle("bg-white", mode === "list");
  els.listViewBtn.classList.toggle("shadow-sm", mode === "list");
  ui.renderRecipes(els.recipesGrid, state.visibleRecipes, { viewMode: mode });
}

async function openMealDetails(mealId) {
  showMealDetails();
  els.mealDetailsSection.style.opacity = "0.5";
  try {
    const meal = await mealdb.lookupMealById(mealId);
    if (!meal) throw new Error("Meal not found");
    state.currentMeal = meal;
    const ingredients = mealdb.extractIngredients(meal);
    const instructions = mealdb.extractInstructions(meal);
    const nutrition = mealdb.estimateNutrition(meal);
    const youtubeUrl = mealdb.getYoutubeEmbedUrl(meal);
    ui.renderMealDetails({
      meal,
      ingredients,
      instructions,
      nutrition,
      youtubeUrl,
      isFavorite: isFavorite(meal.idMeal),
    });
  } catch (err) {
    console.error(err);
    notify("error", "Couldn't load this recipe. Please try again.");
    backToMeals();
  } finally {
    els.mealDetailsSection.style.opacity = "1";
  }
}

function logMealToFoodLog(meal) {
  const nutrition = mealdb.estimateNutrition(meal);
  addFoodLogEntry({
    name: meal.strMeal,
    source: "meal",
    sourceId: meal.idMeal,
    calories: nutrition.caloriesPerServing,
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    fat: nutrition.fat,
  });
  notify("success", `${meal.strMeal} logged to your Food Log!`);
  renderFoodLogPage();
}

// ---- Product Scanner ----

async function handleProductSearch() {
  const query = els.productSearchInput.value.trim();
  if (!query) return;
  state.currentProductCategory = "";
  ui.renderLoading(els.productsGrid, "Searching products...");
  try {
    const raw = await off.searchProductsByName(query);
    state.products = raw.map(off.normalizeProduct);
    applyProductFilters();
  } catch (err) {
    console.error(err);
    ui.renderError(els.productsGrid, "Product search failed. Please try again.");
  }
}

async function handleBarcodeLookup() {
  const barcode = els.barcodeInput.value.trim();
  if (!barcode) return;
  ui.renderLoading(els.productsGrid, "Looking up barcode...");
  try {
    const raw = await off.getProductByBarcode(barcode);
    if (!raw) {
      state.products = [];
      applyProductFilters();
      notify("error", "No product found for that barcode.");
      return;
    }
    state.products = [off.normalizeProduct(raw)];
    applyProductFilters();
  } catch (err) {
    console.error(err);
    ui.renderError(els.productsGrid, "Barcode lookup failed. Please try again.");
  }
}

function applyProductFilters() {
  const filtered = state.currentNutriFilter
    ? state.products.filter((p) => p.nutriScore === state.currentNutriFilter)
    : state.products;
  state.filteredProducts = filtered;
  ui.renderProducts(els.productsGrid, filtered);
  ui.updateProductsCount(els.productsCount, filtered.length, state.products.length > 0);
}

// ---- Food Log ----

function renderFoodLogPage() {
  if (els.foodlogDate) els.foodlogDate.textContent = ui.formatDateHeading();
  const entries = getTodayEntries();
  const totals = getTotalsForEntries(entries);
  ui.renderTodaySummary({ totals, goals: GOALS, entryCount: entries.length });
  ui.renderLoggedItems(els.loggedItemsList, entries);
  if (els.weeklyChart) ui.renderWeeklyChart(els.weeklyChart, getWeeklyTotals(7));
}

function handleClearFoodLog() {
  confirmAction("Clear all logged items for today and your history?", () => {
    clearFoodLog();
    renderFoodLogPage();
    notify("success", "Food log cleared.");
  });
}

function handleCustomEntry() {
  if (window.Swal) {
    window.Swal.fire({
      title: "Custom Food Entry",
      html: `
        <input id="swal-name" class="swal2-input" placeholder="Food name">
        <input id="swal-calories" class="swal2-input" placeholder="Calories (kcal)" type="number">
        <input id="swal-protein" class="swal2-input" placeholder="Protein (g)" type="number">
        <input id="swal-carbs" class="swal2-input" placeholder="Carbs (g)" type="number">
        <input id="swal-fat" class="swal2-input" placeholder="Fat (g)" type="number">
      `,
      confirmButtonText: "Add Entry",
      confirmButtonColor: "#059669",
      showCancelButton: true,
      preConfirm: () => {
        const name = document.getElementById("swal-name").value.trim();
        if (!name) {
          window.Swal.showValidationMessage("Please enter a food name");
          return false;
        }
        return {
          name,
          calories: Number(document.getElementById("swal-calories").value) || 0,
          protein: Number(document.getElementById("swal-protein").value) || 0,
          carbs: Number(document.getElementById("swal-carbs").value) || 0,
          fat: Number(document.getElementById("swal-fat").value) || 0,
        };
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        addFoodLogEntry({ ...result.value, source: "custom" });
        renderFoodLogPage();
        notify("success", "Entry added to your Food Log!");
      }
    });
  } else {
    const name = prompt("Food name?");
    if (!name) return;
    const calories = Number(prompt("Calories?")) || 0;
    addFoodLogEntry({ name, calories, protein: 0, carbs: 0, fat: 0, source: "custom" });
    renderFoodLogPage();
  }
}

// ---- Small helpers ----

function notify(type, message) {
  if (window.Swal) {
    window.Swal.fire({
      toast: true,
      position: "top-end",
      icon: type,
      title: message,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  } else {
    console.log(`[${type}] ${message}`);
  }
}

function confirmAction(message, onConfirm) {
  if (window.Swal) {
    window.Swal.fire({
      title: "Are you sure?",
      text: message,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, clear it",
    }).then((result) => {
      if (result.isConfirmed) onConfirm();
    });
  } else if (confirm(message)) {
    onConfirm();
  }
}

document.addEventListener("DOMContentLoaded", init);
