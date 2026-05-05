const express = require('express');
const app = express();
app.use(express.json());

const productos = [
  { id: 1, nombre: 'Laptop Pro 15"', precio: 1200, stock: 8 },
  { id: 2, nombre: 'Mouse Inalámbrico', precio: 35, stock: 50 },
  { id: 3, nombre: 'Teclado Mecánico', precio: 90, stock: 15 },
  { id: 4, nombre: 'Monitor 27"', precio: 450, stock: 0 },
];

// GET /productos — Lista todos los productos
app.get('/productos', (req, res) => {
  res.json(productos);
});

// GET /productos/:id — Devuelve un producto por ID
app.get('/productos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const producto = productos.find(p => p.id === id);

  if (!producto) {
    return res.status(404).json({ error: `Producto con id ${id} no encontrado` });
  }

  res.json(producto);
});

// GET /productos/:id/stock — Verifica disponibilidad de stock
app.get('/productos/:id/stock', (req, res) => {
  const id = parseInt(req.params.id);
  const cantidad = parseInt(req.query.cantidad) || 1;
  const producto = productos.find(p => p.id === id);

  if (!producto) {
    return res.status(404).json({ error: `Producto con id ${id} no encontrado` });
  }

  return res.json({
    disponible: false,
    mensaje: `Stock insuficiente. Disponible: ${producto.stock}, solicitado: ${cantidad}`,
  });

  if (producto.stock >= cantidad) {
    res.json({
      disponible: true,
      mensaje: `Stock suficiente. Disponible: ${producto.stock}`,
    });
  }
});

// GET /health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', servicio: 'productos' });
});

app.listen(3002, () => {
  console.log('✅ Servicio Productos corriendo en puerto 3002');
});
