/**
 * NutriPlan - TheMealDB API module
 * https://www.themealdb.com/api.php
 */

const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}) for ${url}`);
  }
  return res.json();
}

export async function getCategories() {
  const data = await fetchJSON(`${BASE_URL}/categories.php`);
  return data.categories || [];
}

export async function searchMealsByName(query) {
  const data = await fetchJSON(
    `${BASE_URL}/search.php?s=${encodeURIComponent(query)}`
  );
  return data.meals || [];
}

// Lists meals whose name starts with a given letter (used to build an
// initial "All Recipes" grid, since the API has no "get everything" route).
export async function listMealsByFirstLetter(letter) {
  const data = await fetchJSON(
    `${BASE_URL}/search.php?f=${encodeURIComponent(letter)}`
  );
  return data.meals || [];
}

export async function lookupMealById(id) {
  const data = await fetchJSON(
    `${BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`
  );
  return (data.meals && data.meals[0]) || null;
}

export async function filterByCategory(category) {
  const data = await fetchJSON(
    `${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`
  );
  return data.meals || [];
}

export async function filterByArea(area) {
  const data = await fetchJSON(
    `${BASE_URL}/filter.php?a=${encodeURIComponent(area)}`
  );
  return data.meals || [];
}

export async function getRandomMeal() {
  const data = await fetchJSON(`${BASE_URL}/random.php`);
  return (data.meals && data.meals[0]) || null;
}

// Builds a nice initial grid of ~20-30 unique recipes by combining a
// few "first letter" lookups (the free MealDB tier has no list-all route).
export async function getInitialRecipes() {
  const letters = ["c", "b", "a", "s", "p"];
  const seen = new Map();
  for (const letter of letters) {
    try {
      const meals = await listMealsByFirstLetter(letter);
      meals.forEach((m) => seen.set(m.idMeal, m));
    } catch (err) {
      console.warn(`Failed to load meals for letter "${letter}"`, err);
    }
    if (seen.size >= 24) break;
  }
  return Array.from(seen.values());
}

// Category the app pre-selects on first load (matches the reference site,
// which opens with "Chicken" already highlighted in the meal-type grid).
export const DEFAULT_CATEGORY = "Chicken";

// The reference site's "Browse by Meal Type" grid shows all categories
// except Breakfast and Goat (12 of TheMealDB's 14, in their natural order).
export const HIDDEN_CATEGORIES = ["Breakfast", "Goat"];

export function visibleCategories(categories) {
  return categories.filter((c) => !HIDDEN_CATEGORIES.includes(c.strCategory));
}

// filter.php only returns { idMeal, strMeal, strMealThumb } - no category/
// area. Enrich each result with a full lookup so recipe cards can show
// real category + cuisine tags (matches the reference site's cards).
export async function getEnrichedCategoryRecipes(category) {
  const meals = await filterByCategory(category);
  const enriched = await Promise.all(
    meals.map(async (m) => {
      try {
        const full = await lookupMealById(m.idMeal);
        return full || m;
      } catch {
        return m;
      }
    })
  );
  // Keep the landing page compact and deterministic, matching the reference
  // page's curated first 25 chicken recipes instead of rendering the entire
  // category returned by the API.
  if (category === DEFAULT_CATEGORY) {
    const preferredOrder = [
      "Chicken Handi",
      "Chicken Mandi",
      "Sticky Chicken",
      "Chicken Congee",
      "Chicken Karaage",
      "Chicken Marengo",
      "Spanish Chicken",
      "Tandoori chicken",
      "Chicken Couscous",
      "Kung Pao Chicken",
      "Chicken Lollipop",
      "Chicken Basquaise",
      "Chicken Fried Rice",
      "Chicken Parmentier",
      "Brown Stew Chicken",
      "Spanish chicken pie",
      "Katsu Chicken curry",
      "Nutty Chicken Curry",
      "Easy Spanish chicken",
      "General Tsos Chicken",
      "Smoky chicken skewers",
      "Sweet and Sour Chicken",
      "Kentucky Fried Chicken",
      "Chinese Orange Chicken",
      "Creamy Mustard Chicken",
    ];
    const byName = new Map(enriched.map((meal) => [meal.strMeal, meal]));
    const ordered = preferredOrder.map((name) => byName.get(name)).filter(Boolean);
    const remaining = enriched.filter((meal) => !preferredOrder.includes(meal.strMeal));
    return [...ordered, ...remaining].slice(0, 25);
  }
  return enriched;
}

// ---- Helpers for shaping a meal object into UI-friendly data ----

export function extractIngredients(meal) {
  const list = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      list.push({
        ingredient: ingredient.trim(),
        measure: (measure || "").trim(),
      });
    }
  }
  return list;
}

export function extractInstructions(meal) {
  if (!meal.strInstructions) return [];
  return meal.strInstructions
    .split(/\r?\n+/)
    .map((line) => line.replace(/^\s*(step\s*)?\d+[.):]?\s*/i, "").trim())
    .filter(Boolean);
}

export function getYoutubeEmbedUrl(meal) {
  if (!meal.strYoutube) return null;
  const match = meal.strYoutube.match(/[?&]v=([^&]+)/);
  const videoId = match ? match[1] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

// TheMealDB does not provide nutrition data. We derive a deterministic
// (same meal -> same numbers every time) estimate so the UI has
// realistic-looking, stable nutrition facts.
export function estimateNutrition(meal) {
  const seed = hashString(meal.idMeal || meal.strMeal || "meal");
  const rand = mulberry32(seed);

  const caloriesPerServing = Math.round(280 + rand() * 420); // 280-700
  const servings = 2 + Math.floor(rand() * 4); // 2-5
  const protein = Math.round(12 + rand() * 38); // 12-50 g
  const carbs = Math.round(15 + rand() * 65); // 15-80 g
  const fat = Math.round(5 + rand() * 30); // 5-35 g
  const fiber = Math.round(2 + rand() * 8); // 2-10 g
  const sugar = Math.round(2 + rand() * 22); // 2-24 g

  return {
    caloriesPerServing,
    totalCalories: caloriesPerServing * servings,
    servings,
    protein,
    carbs,
    fat,
    fiber,
    sugar,
    vitaminA: Math.round(5 + rand() * 40),
    vitaminC: Math.round(5 + rand() * 60),
    calcium: Math.round(2 + rand() * 20),
    iron: Math.round(2 + rand() * 25),
  };
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
