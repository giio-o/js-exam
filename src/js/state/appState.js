/**
 * NutriPlan - App State & Persistence
 * Central place for in-memory UI state and localStorage-backed food log.
 */

const FOODLOG_KEY = "nutriplan_foodlog_v1";
const FAVORITES_KEY = "nutriplan_favorites_v1";

// Daily nutrition goals (used for progress bars / % daily value)
export const GOALS = {
  calories: 2000,
  protein: 50,
  carbs: 250,
  fat: 65,
  fiber: 28,
  sugar: 50,
};

// In-memory UI state (not persisted)
export const state = {
  currentPage: "meals", // 'meals' | 'products' | 'foodlog'
  categories: [],
  allRecipes: [],
  visibleRecipes: [],
  currentCategory: "",
  currentArea: "",
  showAllCategories: false,
  searchQuery: "",
  viewMode: "grid", // 'grid' | 'list'
  currentMeal: null,

  products: [],
  filteredProducts: [],
  currentNutriFilter: "",
  currentProductCategory: "",
};

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function getFoodLog() {
  try {
    const raw = localStorage.getItem(FOODLOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to read food log from storage", err);
    return [];
  }
}

function saveFoodLog(log) {
  localStorage.setItem(FOODLOG_KEY, JSON.stringify(log));
}

export function addFoodLogEntry(entry) {
  const log = getFoodLog();
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: todayKey(),
    time: new Date().toISOString(),
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    ...entry,
  };
  log.push(item);
  saveFoodLog(log);
  return log;
}

export function removeFoodLogEntry(id) {
  const log = getFoodLog().filter((item) => item.id !== id);
  saveFoodLog(log);
  return log;
}

export function clearFoodLog() {
  saveFoodLog([]);
}

export function getEntriesForDate(dateKey) {
  return getFoodLog().filter((item) => item.date === dateKey);
}

export function getTodayEntries() {
  return getEntriesForDate(todayKey());
}

export function getTotalsForEntries(entries) {
  return entries.reduce(
    (totals, item) => {
      totals.calories += Number(item.calories) || 0;
      totals.protein += Number(item.protein) || 0;
      totals.carbs += Number(item.carbs) || 0;
      totals.fat += Number(item.fat) || 0;
      return totals;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

// Returns an array of the last `days` days (oldest first) as
// [{ date: 'YYYY-MM-DD', label: 'Mon', calories, protein, carbs, fat }]
export function getWeeklyTotals(days = 7) {
  const log = getFoodLog();
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = todayKey(d);
    const entries = log.filter((item) => item.date === dateKey);
    const totals = getTotalsForEntries(entries);
    result.push({
      date: dateKey,
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      entryCount: entries.length,
      ...totals,
    });
  }
  return result;
}

// ---- Favorites (bonus / Level 4 feature) ----
export function getFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(mealId) {
  const favs = getFavorites();
  const idx = favs.indexOf(mealId);
  if (idx === -1) {
    favs.push(mealId);
  } else {
    favs.splice(idx, 1);
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  return favs;
}

export function isFavorite(mealId) {
  return getFavorites().includes(mealId);
}
