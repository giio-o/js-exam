/**
 * NutriPlan - UI Components / Render helpers
 * Pure(ish) DOM-building functions. No fetches happen here.
 */

const CATEGORY_ICONS = {
  Beef: "fa-drumstick-bite",
  Chicken: "fa-drumstick-bite",
  Dessert: "fa-ice-cream",
  Lamb: "fa-bacon",
  Miscellaneous: "fa-utensils",
  Pasta: "fa-bowl-food",
  Pork: "fa-bacon",
  Seafood: "fa-fish",
  Side: "fa-plate-wheat",
  Starter: "fa-bowl-rice",
  Vegan: "fa-leaf",
  Vegetarian: "fa-carrot",
  Breakfast: "fa-egg",
  Goat: "fa-drumstick-bite",
};

function categoryIcon(name) {
  return CATEGORY_ICONS[name] || "fa-utensils";
}

// =========== Loading / Empty states ============

export function renderLoading(container, message = "Loading...") {
  container.innerHTML = `
    <div class="col-span-full flex flex-col items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
      <p class="text-gray-500 text-sm">${escapeHtml(message)}</p>
    </div>
  `;
}

export function renderEmpty(container, title = "Nothing found", subtitle = "Try a different search or filter") {
  container.innerHTML = `
    <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
      </div>
      <p class="text-gray-500 text-lg">${escapeHtml(title)}</p>
      <p class="text-gray-400 text-sm mt-2">${escapeHtml(subtitle)}</p>
    </div>
  `;
}

export function renderError(container, message = "Something went wrong. Please try again.") {
  container.innerHTML = `
    <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
      <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <i class="fa-solid fa-triangle-exclamation text-red-400 text-2xl"></i>
      </div>
      <p class="text-gray-500 text-lg">${escapeHtml(message)}</p>
    </div>
  `;
}

// =========== Categories ============

export function renderCategories(container, categories, activeCategory = "") {
  if (!categories.length) {
    renderEmpty(container, "No categories available");
    return;
  }
  container.innerHTML = categories
    .map((cat) => {
      const isActive = cat.strCategory === activeCategory;
      return `
        <div
          class="category-card bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all group"
          data-category="${escapeHtml(cat.strCategory)}"
        >
          <div class="flex items-center gap-2.5">
            <div class="text-white w-9 h-9 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <i class="fa-solid ${categoryIcon(cat.strCategory)}"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900">${escapeHtml(cat.strCategory)}</h3>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

// =========== Cuisine pills ============

export function renderCuisinePills(container, nationalities, activeArea = "") {
  const allPill = `
    <button
      class="cuisine-filter-btn px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
        activeArea === "" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }"
      data-area=""
    >All Cuisines</button>
  `;
  const pills = nationalities
    .map(
      (label) => `
        <button
          class="cuisine-filter-btn px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
            activeArea === label ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }"
          data-area="${escapeHtml(label)}"
        >${escapeHtml(label)}</button>
      `
    )
    .join("");
  container.innerHTML = allPill + pills;
}

// =========== Recipes ============

export function renderRecipeCard(meal, { viewMode = "grid" } = {}) {
  const category = meal.strCategory || meal.strArea ? meal.strCategory : "";
  const area = meal.strArea || "";
  if (viewMode === "list") {
    return `
      <div
        class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group flex items-center gap-4 p-3 col-span-full"
        data-meal-id="${escapeHtml(meal.idMeal)}"
      >
        <img
          class="w-24 h-24 rounded-lg object-cover flex-shrink-0"
          src="${escapeHtml(meal.strMealThumb)}"
          alt="${escapeHtml(meal.strMeal)}"
          loading="lazy"
        />
        <div class="min-w-0 flex-1">
          <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
            ${escapeHtml(meal.strMeal)}
          </h3>
          <div class="flex items-center gap-4 text-xs">
            ${category ? `<span class="font-semibold text-gray-900"><i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>${escapeHtml(category)}</span>` : ""}
            ${area ? `<span class="font-semibold text-gray-500"><i class="fa-solid fa-globe text-blue-500 mr-1"></i>${escapeHtml(area)}</span>` : ""}
          </div>
        </div>
        <i class="fa-solid fa-chevron-right text-gray-300"></i>
      </div>
    `;
  }

  return `
    <div
      class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
      data-meal-id="${escapeHtml(meal.idMeal)}"
    >
      <div class="relative h-48 overflow-hidden">
        <img
          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          src="${escapeHtml(meal.strMealThumb)}"
          alt="${escapeHtml(meal.strMeal)}"
          loading="lazy"
        />
        <div class="absolute bottom-3 left-3 flex gap-2">
          ${category ? `<span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-lg text-gray-700"><i class="fa-solid fa-tag mr-1 text-emerald-600"></i>${escapeHtml(category)}</span>` : ""}
          ${area ? `<span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-lg text-gray-700"><i class="fa-solid fa-globe mr-1 text-blue-600"></i>${escapeHtml(area)}</span>` : ""}
        </div>
      </div>
      <div class="p-4">
        <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
          ${escapeHtml(meal.strMeal)}
        </h3>
        <p class="text-xs text-gray-600 mb-3 line-clamp-2">${escapeHtml(meal.strInstructions || "Delicious recipe to try!").slice(0, 145)}${meal.strInstructions ? "..." : ""}</p>
        <div class="flex items-center justify-between text-xs">
          ${category ? `<span class="font-semibold text-gray-900"><i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>${escapeHtml(category)}</span>` : "<span></span>"}
          ${area ? `<span class="font-semibold text-gray-500"><i class="fa-solid fa-globe text-blue-500 mr-1"></i>${escapeHtml(area)}</span>` : ""}
        </div>
      </div>
    </div>
  `;
}

export function renderRecipes(container, recipes, { viewMode = "grid" } = {}) {
  if (!recipes.length) {
    renderEmpty(container, "No recipes found", "Try searching for something else");
    return;
  }
  container.className = viewMode === "list"
    ? "grid grid-cols-1 gap-3"
    : "grid grid-cols-4 gap-5";
  container.innerHTML = recipes.map((meal) => renderRecipeCard(meal, { viewMode })).join("");
}

export function updateRecipesCount(el, count) {
  el.textContent = `Showing ${count} recipe${count === 1 ? "" : "s"}`;
}

// =========== Meal Details ============

export function renderMealDetails({ meal, ingredients, instructions, nutrition, youtubeUrl, isFavorite }) {
  const section = document.getElementById("meal-details");
  if (!section) return;

  const heroImg = section.querySelector(".relative.h-80 img, .relative.md\\:h-96 img");
  const heroTagsContainer = section.querySelector(".absolute.bottom-0.left-0.right-0 .flex.items-center.gap-3.mb-3");
  const heroTitle = section.querySelector(".absolute.bottom-0.left-0.right-0 h1");
  const heroServings = document.getElementById("hero-servings");
  const heroCalories = document.getElementById("hero-calories");
  const logMealBtn = document.getElementById("log-meal-btn");
  const favBtn = document.getElementById("favorite-meal-btn");

  if (heroImg) {
    heroImg.src = meal.strMealThumb;
    heroImg.alt = meal.strMeal;
  }
  if (heroTitle) heroTitle.textContent = meal.strMeal;
  if (heroTagsContainer) {
    const tags = [meal.strCategory, meal.strArea, ...(meal.strTags ? meal.strTags.split(",") : [])].filter(Boolean);
    const colors = ["bg-emerald-500", "bg-blue-500", "bg-purple-500", "bg-amber-500"];
    heroTagsContainer.innerHTML = tags
      .slice(0, 4)
      .map((tag, i) => `<span class="px-3 py-1 ${colors[i % colors.length]} text-white text-sm font-semibold rounded-full">${escapeHtml(tag.trim())}</span>`)
      .join("");
  }
  if (heroServings) heroServings.textContent = `${nutrition.servings} servings`;
  if (heroCalories) heroCalories.textContent = `${nutrition.caloriesPerServing} cal/serving`;
  if (logMealBtn) logMealBtn.setAttribute("data-meal-id", meal.idMeal);
  if (favBtn) {
    favBtn.classList.toggle("text-red-500", isFavorite);
    const icon = favBtn.querySelector("i");
    if (icon) icon.className = isFavorite ? "fa-solid fa-heart" : "fa-regular fa-heart";
  }

  // Cards inside meal-details appear in a fixed order in the markup:
  // [0] Ingredients, [1] Instructions, [2] Video, [3] handled separately (#nutrition-facts-container)
  const cards = section.querySelectorAll(".bg-white.rounded-2xl.shadow-lg.p-6");
  const ingredientsCard = cards[0];
  const instructionsCard = cards[1];
  const videoCard = cards[2];

  if (ingredientsCard) {
    const countLabel = ingredientsCard.querySelector("h2 span");
    if (countLabel) countLabel.textContent = `${ingredients.length} items`;
    const grid = ingredientsCard.querySelector(".grid");
    if (grid) {
      grid.innerHTML = ingredients
        .map(
          (item) => `
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
              <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300" />
              <span class="text-gray-700">
                ${item.measure ? `<span class="font-medium text-gray-900">${escapeHtml(item.measure)}</span>` : ""}
                ${escapeHtml(item.ingredient)}
              </span>
            </div>
          `
        )
        .join("");
    }
  }

  if (instructionsCard) {
    const stepsContainer = instructionsCard.querySelector(".space-y-4");
    if (stepsContainer) {
      stepsContainer.innerHTML = instructions
        .map(
          (step, i) => `
            <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                ${i + 1}
              </div>
              <p class="text-gray-700 leading-relaxed pt-2">${escapeHtml(step)}</p>
            </div>
          `
        )
        .join("");
    }
  }

  if (videoCard) {
    if (youtubeUrl) {
      videoCard.style.display = "";
      const iframe = videoCard.querySelector("iframe");
      if (iframe) iframe.src = youtubeUrl;
    } else {
      videoCard.style.display = "none";
    }
  }

  renderNutritionFacts(document.getElementById("nutrition-facts-container"), nutrition);
}

export function renderNutritionFacts(container, nutrition) {
  if (!container) return;
  const GOALS = { protein: 50, carbs: 250, fat: 65, fiber: 28, sugar: 50 };
  const pct = (val, goal) => Math.min(100, Math.round((val / goal) * 100));

  const macros = [
    { key: "Protein", value: nutrition.protein, unit: "g", color: "emerald", pct: pct(nutrition.protein, GOALS.protein) },
    { key: "Carbs", value: nutrition.carbs, unit: "g", color: "blue", pct: pct(nutrition.carbs, GOALS.carbs) },
    { key: "Fat", value: nutrition.fat, unit: "g", color: "purple", pct: pct(nutrition.fat, GOALS.fat) },
    { key: "Fiber", value: nutrition.fiber, unit: "g", color: "orange", pct: pct(nutrition.fiber, GOALS.fiber) },
    { key: "Sugar", value: nutrition.sugar, unit: "g", color: "pink", pct: pct(nutrition.sugar, GOALS.sugar) },
  ];

  container.innerHTML = `
    <p class="text-sm text-gray-500 mb-4">Per serving</p>
    <div class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl">
      <p class="text-sm text-gray-600">Calories per serving</p>
      <p class="text-4xl font-bold text-emerald-600">${nutrition.caloriesPerServing}</p>
      <p class="text-xs text-gray-500 mt-1">Total: ${nutrition.totalCalories} cal</p>
    </div>
    <div class="space-y-4">
      ${macros
        .map(
          (m) => `
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-${m.color}-500"></div>
                <span class="text-gray-700">${m.key}</span>
              </div>
              <span class="font-bold text-gray-900">${m.value}${m.unit}</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div class="bg-${m.color}-500 h-2 rounded-full" style="width: ${m.pct}%"></div>
            </div>
          `
        )
        .join("")}
    </div>
    <div class="mt-6 pt-6 border-t border-gray-100">
      <h3 class="text-sm font-semibold text-gray-900 mb-3">Vitamins &amp; Minerals (% Daily Value)</h3>
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div class="flex justify-between"><span class="text-gray-600">Vitamin A</span><span class="font-medium">${nutrition.vitaminA}%</span></div>
        <div class="flex justify-between"><span class="text-gray-600">Vitamin C</span><span class="font-medium">${nutrition.vitaminC}%</span></div>
        <div class="flex justify-between"><span class="text-gray-600">Calcium</span><span class="font-medium">${nutrition.calcium}%</span></div>
        <div class="flex justify-between"><span class="text-gray-600">Iron</span><span class="font-medium">${nutrition.iron}%</span></div>
      </div>
    </div>
  `;
}

// =========== Product Scanner ============

export function renderProductCard(product) {
  const scoreColors = {
    a: "bg-green-500",
    b: "bg-lime-500",
    c: "bg-yellow-500",
    d: "bg-orange-500",
    e: "bg-red-500",
  };
  const scoreColor = scoreColors[product.nutriScore] || "bg-gray-400";

  return `
    <div class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-barcode="${escapeHtml(product.barcode)}">
      <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
        <img
          class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
          src="${escapeHtml(product.image || "https://placehold.co/300x300?text=No+Image")}"
          alt="${escapeHtml(product.name)}"
          loading="lazy"
        />
        ${
          product.nutriScore
            ? `<div class="absolute top-2 left-2 ${scoreColor} text-white text-xs font-bold px-2 py-1 rounded uppercase">Nutri-Score ${escapeHtml(product.nutriScore)}</div>`
            : ""
        }
        ${
          product.nova
            ? `<div class="absolute top-2 right-2 bg-lime-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center" title="NOVA ${escapeHtml(String(product.nova))}">${escapeHtml(String(product.nova))}</div>`
            : ""
        }
      </div>
      <div class="p-4">
        <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${escapeHtml(product.brand)}</p>
        <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">${escapeHtml(product.name)}</h3>
        <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
          ${product.quantity ? `<span><i class="fa-solid fa-weight-scale mr-1"></i>${escapeHtml(product.quantity)}</span>` : ""}
          <span><i class="fa-solid fa-fire mr-1"></i>${product.caloriesPer100g} kcal/100g</span>
        </div>
        <div class="grid grid-cols-4 gap-1 text-center">
          <div class="bg-emerald-50 rounded p-1.5"><p class="text-xs font-bold text-emerald-700">${product.protein}g</p><p class="text-[10px] text-gray-500">Protein</p></div>
          <div class="bg-blue-50 rounded p-1.5"><p class="text-xs font-bold text-blue-700">${product.carbs}g</p><p class="text-[10px] text-gray-500">Carbs</p></div>
          <div class="bg-purple-50 rounded p-1.5"><p class="text-xs font-bold text-purple-700">${product.fat}g</p><p class="text-[10px] text-gray-500">Fat</p></div>
          <div class="bg-orange-50 rounded p-1.5"><p class="text-xs font-bold text-orange-700">${product.sugar}g</p><p class="text-[10px] text-gray-500">Sugar</p></div>
        </div>
      </div>
    </div>
  `;
}

export function renderProducts(container, products) {
  const emptyState = document.getElementById("products-empty");
  if (!products.length) {
    renderEmpty(container, "No products found", "Try a different search term or barcode");
    if (emptyState) emptyState.style.display = "none";
    return;
  }
  if (emptyState) emptyState.style.display = "none";
  container.innerHTML = products.map(renderProductCard).join("");
}

export function updateProductsCount(el, count, hasSearched) {
  el.textContent = hasSearched
    ? `Found ${count} product${count === 1 ? "" : "s"}`
    : "Search for products to see results";
}

// =========== Food Log ============

export function renderLoggedItems(container, entries) {
  if (!entries.length) {
    container.innerHTML = `
      <div class="text-center py-12">
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fa-solid fa-utensils text-3xl text-gray-300"></i>
        </div>
        <p class="text-gray-500 font-medium mb-2">No food logged today</p>
        <p class="text-gray-400 text-sm mb-4">Start tracking your nutrition by logging meals or scanning products</p>
        <div class="flex justify-center gap-3">
          <a href="#meals" class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg"><i class="fa-solid fa-plus"></i>Browse Recipes</a>
          <a href="#products" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"><i class="fa-solid fa-barcode"></i>Scan Product</a>
        </div>
      </div>
    `;
    return;
  }
  container.innerHTML = entries
    .slice()
    .reverse()
    .map(
      (item) => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl" data-entry-id="${escapeHtml(item.id)}">
          <div class="min-w-0">
            <p class="font-medium text-gray-900 truncate">${escapeHtml(item.name)}</p>
            <p class="text-xs text-gray-500">${item.calories} kcal &middot; P ${item.protein}g &middot; C ${item.carbs}g &middot; F ${item.fat}g</p>
          </div>
          <button class="remove-log-entry-btn text-gray-400 hover:text-red-500 ml-3 flex-shrink-0" data-entry-id="${escapeHtml(item.id)}" aria-label="Remove">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      `
    )
    .join("");
}

export function renderTodaySummary({ totals, goals, entryCount }) {
  const bars = [
    { key: "calories", label: "Calories", unit: "kcal", color: "emerald" },
    { key: "protein", label: "Protein", unit: "g", color: "blue" },
    { key: "carbs", label: "Carbs", unit: "g", color: "amber" },
    { key: "fat", label: "Fat", unit: "g", color: "purple" },
  ];
  const grid = document.querySelector("#foodlog-today-section > .grid");
  if (grid) {
    grid.innerHTML = bars.map(({ key, unit, color, label }) => {
      const value = Math.round(totals[key] || 0);
      const goal = goals[key];
      const pct = Math.min(100, Math.round((value / goal) * 100));
      return `<div class="bg-gray-50 rounded-xl p-4">
        <div class="flex items-center justify-between mb-2"><span class="text-sm font-medium text-gray-700">${label}</span><span class="text-xs text-${color}-600">${pct}%</span></div>
        <div class="w-full bg-gray-200 rounded-full h-2.5 mb-2"><div class="h-2.5 rounded-full bg-${color}-500" style="width:${pct}%"></div></div>
        <div class="flex items-center justify-between text-xs"><span class="font-bold text-${color}-600">${value} ${unit}</span><span class="text-gray-400">/ ${goal} ${unit}</span></div>
      </div>`;
    }).join("");
  }
  bars.forEach(({ key, unit, color }) => {
    const wrapper = document.querySelector(`#foodlog-today-section .bg-${color}-50`);
    if (!wrapper) return;
    const valueLabel = wrapper.querySelector(".foodlog-value");
    const bar = wrapper.querySelector(`.bg-${color}-500`);
    const value = Math.round(totals[key] || 0);
    const goal = goals[key];
    const pct = Math.min(100, Math.round((value / goal) * 100));
    const pctLabel = wrapper.querySelector(".foodlog-percent");
    if (pctLabel) pctLabel.textContent = `${pct}%`;
    if (valueLabel) valueLabel.textContent = `${value} ${unit}`;
    if (bar) bar.style.width = `${pct}%`;
  });

  const itemsHeading = document.querySelector('#foodlog-today-section h4');
  if (itemsHeading) itemsHeading.textContent = `Logged Items (${entryCount})`;

  const clearBtn = document.getElementById("clear-foodlog");
  if (clearBtn) clearBtn.style.display = entryCount > 0 ? "" : "none";
}

export function renderWeeklyChart(container, weeklyTotals) {
  const weeklyPanel = container.parentElement;
  const pageContent = weeklyPanel.parentElement;
  pageContent.querySelector(".weekly-quick-stats")?.remove();
  const average = weeklyTotals.length ? Math.round(weeklyTotals.reduce((sum, day) => sum + day.calories, 0) / weeklyTotals.length) : 0;
  const totalItems = weeklyTotals.reduce((sum, day) => sum + (day.entryCount || 0), 0);
  const today = weeklyTotals[weeklyTotals.length - 1]?.date;
  container.className = "grid grid-cols-7 gap-2";
  container.innerHTML = weeklyTotals.map((day) => `<div class="text-center ${day.date === today ? "bg-indigo-100 rounded-xl" : ""}">
    <p class="text-xs text-gray-500 mb-1">${day.label}</p><p class="text-sm font-medium text-gray-900">${new Date(`${day.date}T00:00:00`).getDate()}</p>
    <div class="mt-2 text-gray-300"><p class="text-lg font-bold">${Math.round(day.calories)}</p><p class="text-xs">kcal</p></div>
  </div>`).join("");
  const stats = document.createElement("div");
  stats.className = "weekly-quick-stats";
  stats.innerHTML = `<div><i class="fa-solid fa-chart-line"></i><span><small>Weekly Average</small><strong>${average} kcal</strong></span></div><div><i class="fa-solid fa-utensils"></i><span><small>Total Items This Week</small><strong>${totalItems} items</strong></span></div><div><i class="fa-solid fa-bullseye"></i><span><small>Days On Goal</small><strong>0 / 7</strong></span></div>`;
  weeklyPanel.insertAdjacentElement("afterend", stats);
}

export function formatDateHeading(date = new Date()) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

// =========== Utils ============

export function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
