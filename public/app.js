const money = value => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(value);
const state = { products: [], category: "Todos", query: "", cart: JSON.parse(localStorage.getItem("moda-market-cart") || "[]") };
const $ = selector => document.querySelector(selector);

async function loadProducts() {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  if (state.category !== "Todos") params.set("category", state.category);
  try {
    const response = await fetch("/api/products?" + params.toString());
    if (!response.ok) throw new Error("No fue posible cargar los productos");
    state.products = await response.json();
    renderProducts();
  } catch {
    $("#products").innerHTML = '<p class="empty">No se pudieron cargar los productos. Recarga la página para intentarlo otra vez.</p>';
  }
}
function renderProducts() {
  const grid = $("#products");
  if (!state.products.length) { grid.innerHTML = '<p class="empty">No encontramos productos con esa búsqueda.</p>'; return; }
  grid.innerHTML = state.products.map(p => `<article class="product-card">
    <div class="product-image"><img src="${p.image}" alt="${p.name}" loading="lazy"><span class="product-tag">${p.tag}</span><button class="add-button" data-add="${p.id}">Añadir a la bolsa +</button></div>
    <div class="product-info"><div><h3>${p.name}</h3><p>${p.category}</p></div><span class="price">${money(p.price)}</span></div>
  </article>`).join("");
}
function saveCart() { localStorage.setItem("moda-market-cart", JSON.stringify(state.cart)); renderCart(); }
function renderCart() {
  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  $("#cart-count").textContent = count;
  $("#cart-items").innerHTML = state.cart.length ? state.cart.map(item => {
    const p = item.product;
    return `<div class="cart-row"><img src="${p.image}" alt=""><div><h3>${p.name}</h3><p>${money(p.price)}</p><div class="quantity"><button data-qty="${p.id}" data-delta="-1" aria-label="Quitar una unidad">−</button><span>${item.quantity}</span><button data-qty="${p.id}" data-delta="1" aria-label="Agregar una unidad">+</button></div></div><button class="remove-item" data-remove="${p.id}">Quitar</button></div>`;
  }).join("") : '<p class="empty">Tu bolsa está esperando algo bonito.</p>';
  $("#cart-total").textContent = money(state.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0));
}
function addToCart(id) {
  const product = state.products.find(p => p.id === Number(id)) || state.cart.find(item => item.product.id === Number(id))?.product;
  if (!product) return;
  const existing = state.cart.find(item => item.product.id === product.id);
  if (existing) existing.quantity = Math.min(99, existing.quantity + 1);
  else state.cart.push({ product, quantity: 1 });
  saveCart(); openCart();
}
function openCart() { $("#cart-drawer").classList.add("open"); $("#cart-drawer").setAttribute("aria-hidden", "false"); $("#cart-overlay").hidden = false; }
function closeCart() { $("#cart-drawer").classList.remove("open"); $("#cart-drawer").setAttribute("aria-hidden", "true"); $("#cart-overlay").hidden = true; }
$("#products").addEventListener("click", event => { const button = event.target.closest("[data-add]"); if (button) addToCart(button.dataset.add); });
$("#categories").addEventListener("click", event => {
  const button = event.target.closest("[data-category]"); if (!button) return;
  state.category = button.dataset.category;
  document.querySelectorAll(".category").forEach(el => el.classList.toggle("active", el === button));
  loadProducts();
});
let searchTimer;
$("#search").addEventListener("input", event => { clearTimeout(searchTimer); state.query = event.target.value.trim(); searchTimer = setTimeout(loadProducts, 180); });
$("#open-cart").addEventListener("click", openCart);
$("#close-cart").addEventListener("click", closeCart);
$("#cart-overlay").addEventListener("click", closeCart);
$("#cart-items").addEventListener("click", event => {
  const qty = event.target.closest("[data-qty]"), remove = event.target.closest("[data-remove]");
  if (qty) {
    const item = state.cart.find(item => item.product.id === Number(qty.dataset.qty));
    if (item) item.quantity += Number(qty.dataset.delta);
    state.cart = state.cart.filter(item => item.quantity > 0);
    saveCart();
  }
  if (remove) { state.cart = state.cart.filter(item => item.product.id !== Number(remove.dataset.remove)); saveCart(); }
});
$("#checkout").addEventListener("click", () => {
  if (!state.cart.length) { $("#cart-items").innerHTML = '<p class="empty">Agrega al menos un producto antes de continuar.</p>'; return; }
  closeCart(); $("#checkout-modal").hidden = false; $("#checkout-message").textContent = "";
});
$("#close-modal").addEventListener("click", () => { $("#checkout-modal").hidden = true; });
$("#checkout-modal").addEventListener("click", event => { if (event.target.id === "checkout-modal") $("#checkout-modal").hidden = true; });
$("#checkout-form").addEventListener("submit", async event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const customer = { name: form.get("name"), email: form.get("email"), address: form.get("address") };
  const button = event.currentTarget.querySelector('button[type="submit"]');
  button.disabled = true; button.textContent = "Enviando...";
  try {
    const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customer, items: state.cart.map(item => ({ id: item.product.id, quantity: item.quantity })) }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "No se pudo crear el pedido.");
    $("#checkout-message").textContent = `¡Listo! Pedido demo ${result.orderNumber}. Total: ${money(result.total)}. No se realizó ningún cobro.`;
    state.cart = []; saveCart(); event.currentTarget.reset();
  } catch (error) { $("#checkout-message").textContent = error.message; }
  finally { button.disabled = false; button.textContent = "Confirmar pedido demo ↗"; }
});
document.addEventListener("keydown", event => { if (event.key === "Escape") { closeCart(); $("#checkout-modal").hidden = true; } });
renderCart(); loadProducts();
