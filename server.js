const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const products = [
  { id: 1, name: "Polera básica", category: "Poleras", price: 8990, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80", tag: "Básico" },
  { id: 2, name: "Chaqueta urbana", category: "Chaquetas", price: 32990, image: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=80", tag: "Tendencia" },
  { id: 3, name: "Jeans rectos", category: "Pantalones", price: 24990, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80", tag: "Favorito" },
  { id: 4, name: "Vestido casual", category: "Vestidos", price: 21990, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80", tag: "Nuevo" },
  { id: 5, name: "Polerón cómodo", category: "Polerones", price: 27990, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80", tag: "Cómodo" },
  { id: 6, name: "Zapatillas casuales", category: "Calzado", price: 39990, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80", tag: "Popular" },
  { id: 7, name: "Blusa elegante", category: "Blusas", price: 18990, image: "https://images.unsplash.com/photo-1564257577-7a1f1c8f7a8a?auto=format&fit=crop&w=800&q=80", tag: "Nuevo" },
  { id: 8, name: "Bolso diario", category: "Accesorios", price: 16990, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80", tag: "Esencial" }
];

app.get("/api/products", (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const category = String(req.query.category || "");
  const result = products.filter(p =>
    (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) &&
    (!category || category === "Todos" || p.category === category)
  );
  res.json(result);
});

app.post("/api/orders", (req, res) => {
  const { items, customer } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "El carrito está vacío." });
  }
  if (!customer || !customer.name || !customer.email) {
    return res.status(400).json({ error: "Ingresa tu nombre y correo electrónico." });
  }
  const total = items.reduce((sum, item) => {
    const product = products.find(p => p.id === Number(item.id));
    const quantity = Math.max(0, Math.min(99, Number(item.quantity) || 0));
    return sum + (product ? product.price * quantity : 0);
  }, 0);
  if (!total) return res.status(400).json({ error: "No hay productos válidos en el pedido." });
  // Demo: no se procesa un pago ni se guarda la orden en una base de datos.
  res.status(201).json({ message: "Pedido de demostración recibido.", orderNumber: "MM-" + Date.now().toString().slice(-8), total });
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, "0.0.0.0", () => console.log(`Moda Market disponible en http://localhost:${PORT}`));
