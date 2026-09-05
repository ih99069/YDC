const STORAGE_KEY = 'health-diet-tracker';
const DAILY_GOAL = 1800;

const state = {
  meals: [],
  water: 1.2,
};

const form = document.getElementById('mealForm');
const mealList = document.getElementById('mealList');
const totalCaloriesEl = document.getElementById('totalCalories');
const totalProteinEl = document.getElementById('totalProtein');
const waterAmountEl = document.getElementById('waterAmount');
const remainingCaloriesEl = document.getElementById('remainingCalories');
const progressFillEl = document.getElementById('progressFill');
const progressPercentEl = document.getElementById('progressPercent');
const waterFillEl = document.getElementById('waterFill');

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed.meals)) state.meals = parsed.meals;
    if (typeof parsed.water === 'number') state.water = parsed.water;
  } catch (error) {
    console.error('저장된 데이터 로드 실패:', error);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatCalories(value) {
  return `${Math.round(value).toLocaleString()} kcal`;
}

function formatProtein(value) {
  return `${Math.round(value)} g`;
}

function calculateTotals() {
  const totalCalories = state.meals.reduce((sum, meal) => sum + Number(meal.calories || 0), 0);
  const totalProtein = state.meals.reduce((sum, meal) => sum + Number(meal.protein || 0), 0);
  const remaining = DAILY_GOAL - totalCalories;
  const percent = Math.min((totalCalories / DAILY_GOAL) * 100, 100);

  totalCaloriesEl.textContent = formatCalories(totalCalories);
  totalProteinEl.textContent = formatProtein(totalProtein);
  remainingCaloriesEl.textContent = `${Math.max(remaining, 0).toLocaleString()} kcal`;
  progressFillEl.style.width = `${percent}%`;
  progressPercentEl.textContent = `${Math.round(percent)}%`;

  const waterPercent = Math.min((state.water / 2) * 100, 100);
  waterFillEl.style.height = `${waterPercent}%`;
  waterAmountEl.textContent = `${state.water.toFixed(1)} L`;
}

function renderMeals() {
  if (!state.meals.length) {
    mealList.innerHTML = '<li class="empty-state">아직 등록된 식단이 없습니다. 오늘의 식단을 추가해보세요.</li>';
    return;
  }

  mealList.innerHTML = state.meals
    .map(
      (meal) => `
        <li class="meal-item">
          <div class="meal-meta">
            <strong>${meal.foodName}</strong>
            <span>${meal.mealType} · ${meal.protein}g 단백질</span>
          </div>
          <div class="meal-kcal">${meal.calories} kcal</div>
        </li>
      `
    )
    .join('');
}

function updateDashboard() {
  calculateTotals();
  renderMeals();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const foodName = document.getElementById('foodName').value.trim();
  const mealType = document.getElementById('mealType').value;
  const calories = Number(document.getElementById('calories').value);
  const protein = Number(document.getElementById('protein').value);
  const water = Number(document.getElementById('water').value || 0);

  if (!foodName || Number.isNaN(calories) || Number.isNaN(protein)) {
    return;
  }

  state.meals.push({
    foodName,
    mealType,
    calories,
    protein,
  });

  if (water > 0) {
    state.water = Number((state.water + water).toFixed(1));
  }

  form.reset();
  saveState();
  updateDashboard();
});

const addWaterBtn = document.getElementById('addWaterBtn');
const removeWaterBtn = document.getElementById('removeWaterBtn');
const resetDataBtn = document.getElementById('resetDataBtn');

addWaterBtn.addEventListener('click', () => {
  state.water = Number((state.water + 0.5).toFixed(1));
  saveState();
  updateDashboard();
});

removeWaterBtn.addEventListener('click', () => {
  state.water = Math.max(0, Number((state.water - 0.5).toFixed(1)));
  saveState();
  updateDashboard();
});

resetDataBtn.addEventListener('click', () => {
  state.meals = [];
  state.water = 0;
  localStorage.removeItem(STORAGE_KEY);
  updateDashboard();
});

loadState();
updateDashboard();
