/*
 * Candle Lab web calculators.
 * Same math as the app (candle-lab/app/calculators.tsx) so answers always match.
 * Inputs are remembered in this browser only (localStorage). Nothing is sent anywhere.
 */

// When the app is live, paste the App Store link here and every "Coming soon" button becomes a download link.
const APP_STORE_URL = "";

// Soy wax weighs roughly 0.86 oz per fl oz of jar space (common candle-making rule).
const WAX_OZ_PER_FL_OZ = 0.86;
const STORAGE_KEY = "candlelab_calc_inputs";

const num = (s) => {
  const n = parseFloat(s);
  return isNaN(n) || n < 0 ? 0 : n;
};
const money = (n) => "$" + n.toFixed(2);
const $ = (id) => document.getElementById(id);
const setText = (id, text) => { const el = $(id); if (el) el.textContent = text; };

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}
function save(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

const CALCS = {
  wax(v) {
    const total = num(v.jarFlOz) * num(v.jars) * WAX_OZ_PER_FL_OZ;
    const wax = total / (1 + num(v.wLoad) / 100);
    const oil = total - wax;
    setText("r-wax", wax.toFixed(1) + " oz");
    setText("r-wax-lb", (wax / 16).toFixed(2) + " lb · " + Math.round(wax * 28.3495) + " g");
    setText("r-oil", oil.toFixed(1) + " oz");
    setText("r-total", total.toFixed(1) + " oz");
  },

  fragrance(v) {
    const unit = v.fUnit === "g" ? "g" : "oz";
    const digits = unit === "g" ? 0 : 2;
    const wax = num(v.fWax);
    const oil = wax * (num(v.fLoad) / 100);
    setText("r-oil", oil.toFixed(digits) + " " + unit);
    setText("r-total", (wax + oil).toFixed(digits) + " " + unit);
    setText("u-wax", unit);
    document.querySelectorAll("[data-unit]").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.unit === unit)));
  },

  cost(v) {
    const waxOz = num(v.waxOz);
    const waxCost = (waxOz / 16) * num(v.waxPriceLb);
    const oilOz = waxOz * (num(v.load) / 100);
    const oilCost = oilOz * num(v.oilPriceOz);
    const parts = num(v.wick) + num(v.jar) + num(v.other);
    const total = waxCost + oilCost + parts;
    setText("r-cost", money(total));
    setText("r-wax", money(waxCost));
    setText("r-oil-label", "Fragrance (" + oilOz.toFixed(2) + " oz)");
    setText("r-oil", money(oilCost));
    setText("r-parts", money(parts));
    setText("r-wholesale", money(total * 2));
    setText("r-retail", money(total * 3));
  },
};

function init() {
  // App buttons: "Coming soon" until APP_STORE_URL is filled in.
  document.querySelectorAll("[data-app-link]").forEach((a) => {
    if (APP_STORE_URL) {
      a.href = APP_STORE_URL;
      a.textContent = "Get the app";
      a.classList.remove("soon");
    } else {
      a.removeAttribute("href");
      a.textContent = "Coming soon to iPhone";
      a.classList.add("soon");
    }
  });

  const kind = document.body.dataset.calc;
  const calc = CALCS[kind];
  if (!calc) return;

  const state = load();
  const inputs = document.querySelectorAll("input[data-key]");
  inputs.forEach((input) => {
    const key = input.dataset.key;
    if (state[key] !== undefined) input.value = state[key];
    input.addEventListener("input", () => {
      state[key] = input.value;
      save(state);
      calc(state);
    });
    if (state[key] === undefined) state[key] = input.value;
  });

  document.querySelectorAll("[data-unit]").forEach((b) =>
    b.addEventListener("click", () => {
      state.fUnit = b.dataset.unit;
      save(state);
      calc(state);
    }));

  calc(state);
}

document.addEventListener("DOMContentLoaded", init);
