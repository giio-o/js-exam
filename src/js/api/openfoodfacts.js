/**
 * NutriPlan - Open Food Facts API module
 * https://world.openfoodfacts.org/data
 */

const BASE_URL = "https://world.openfoodfacts.org";

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}) for ${url}`);
  }
  return res.json();
}

export async function searchProductsByName(query, { pageSize = 24 } = {}) {
  const url =
    `${BASE_URL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}` +
    `&search_simple=1&action=process&json=1&page_size=${pageSize}`;
  const data = await fetchJSON(url);
  return data.products || [];
}

export async function searchProductsByCategory(category, { pageSize = 24 } = {}) {
  const url = `${BASE_URL}/category/${encodeURIComponent(
    category.toLowerCase()
  )}.json?page_size=${pageSize}`;
  const data = await fetchJSON(url);
  return data.products || [];
}

export async function getProductByBarcode(barcode) {
  const url = `${BASE_URL}/api/v2/product/${encodeURIComponent(barcode)}.json`;
  const data = await fetchJSON(url);
  if (data.status !== 1 || !data.product) return null;
  return data.product;
}

// Normalizes a raw Open Food Facts product into the shape the UI needs.
export function normalizeProduct(raw) {
  const n = raw.nutriments || {};
  return {
    barcode: raw.code || raw._id || "",
    name: raw.product_name || raw.product_name_en || raw.generic_name || "Unknown Product",
    brand: (raw.brands || "Unknown Brand").split(",")[0].trim(),
    image:
      raw.image_front_small_url ||
      raw.image_small_url ||
      raw.image_url ||
      "",
    quantity: raw.quantity || "",
    nutriScore: (raw.nutrition_grades || raw.nutriscore_grade || "").toLowerCase(),
    nova: raw.nova_group || raw.nova_groups || null,
    caloriesPer100g: round1(n["energy-kcal_100g"] ?? n["energy-kcal"] ?? 0),
    protein: round1(n.proteins_100g),
    carbs: round1(n.carbohydrates_100g),
    fat: round1(n.fat_100g),
    sugar: round1(n.sugars_100g),
    categories: raw.categories || "",
  };
}

function round1(value) {
  return typeof value === "number" && !Number.isNaN(value)
    ? Math.round(value * 10) / 10
    : 0;
}
