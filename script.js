const STORAGE_KEY = "pocket-ledger-expenses-v1";
const form = document.querySelector("#expense-form");
const nameInput = document.querySelector("#expense-name");
const amountInput = document.querySelector("#expense-amount");
const categoryInput = document.querySelector("#expense-category");
const dateInput = document.querySelector("#expense-date");
const list = document.querySelector("#expense-list");
const totalElement = document.querySelector("#total");
const countElement = document.querySelector("#expense-count");
const emptyState = document.querySelector("#empty-state");
const errorElement = document.querySelector("#form-error");
const clearAllButton = document.querySelector("#clear-all");

function todayLocal() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
dateInput.value = todayLocal();

function loadExpenses() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}
let expenses = loadExpenses();

function saveExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}
function money(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}
function render() {
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  totalElement.textContent = money(total);
  countElement.textContent = `${expenses.length} transaction${expenses.length === 1 ? "" : "s"}`;
  emptyState.classList.toggle("hidden", expenses.length > 0);
  list.innerHTML = "";

  [...expenses].sort((a, b) => b.date.localeCompare(a.date)).forEach((item) => {
    const row = document.createElement("article");
    row.className = "expense-item";
    row.innerHTML = `
      <div class="category-icon" aria-hidden="true">${escapeHTML(item.category.slice(0, 1))}</div>
      <div class="expense-info">
        <p class="expense-name">${escapeHTML(item.name)}</p>
        <p class="expense-meta">${escapeHTML(item.category)} · ${escapeHTML(item.date)}</p>
      </div>
      <div class="expense-right">
        <p class="expense-amount">${money(item.amount)}</p>
        <button class="remove" type="button" data-delete="${escapeHTML(item.id)}">Remove</button>
      </div>`;
    list.appendChild(row);
  });
}
form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorElement.textContent = "";
  const name = nameInput.value.trim();
  const amount = Number(amountInput.value);
  const date = dateInput.value;
  if (!name || !Number.isFinite(amount) || amount <= 0 || !date) {
    errorElement.textContent = "Enter a description, a positive amount, and a date.";
    return;
  }
  expenses.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name, amount, category: categoryInput.value, date
  });
  saveExpenses();
  render();
  form.reset();
  dateInput.value = todayLocal();
  nameInput.focus();
});
list.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;
  expenses = expenses.filter((item) => item.id !== button.dataset.delete);
  saveExpenses();
  render();
});
clearAllButton.addEventListener("click", () => {
  if (expenses.length === 0) return;
  if (!window.confirm("Delete all expense records from this browser?")) return;
  expenses = [];
  saveExpenses();
  render();
});
render();
