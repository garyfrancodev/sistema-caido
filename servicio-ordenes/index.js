const express = require('express');
const app = express();
app.use(express.json());

const USUARIOS_URL = process.env.USUARIOS_URL || 'http://localhost:3001';
const PRODUCTOS_URL = process.env.PRODUCTOS_URL || 'http://localhost:3002';

// Importamos fetch (disponible en Node 18+)
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const ordenes = [];
let contadorId = 1;

// POST /ordenes — Crea una nueva orden
app.post('/ordenes', async (req, res) => {
  const { usuarioId, productoId, cantidad } = req.body;

  if (!usuarioId || !productoId || !cantidad) {
    return res.status(400).json({
      error: 'Faltan campos requeridos: usuarioId, productoId, cantidad',
    });
  }

  // Paso 1: Validar que el usuario existe
  const resUsuario = await fetch(`${USUARIOS_URL}/usuarios/${usuarioId}`);
  const usuario = await resUsuario.json();

  // Paso 2: Verificar stock del producto
  const resStock = await fetch(
    `${PRODUCTOS_URL}/productos/${productoId}/stock?cantidad=${cantidad}`
  );
  const stockInfo = await resStock.json();

  if (!resStock.ok) {
    return res.status(404).json({ error: `Producto ${productoId} no encontrado` });
  }

  if (!stockInfo.disponible) {
    return res.status(409).json({
      error: 'Stock insuficiente',
      detalle: stockInfo.mensaje,
    });
  }

  // Paso 3: Crear la orden
  const nuevaOrden = {
    id: contadorId++,
    usuarioId,
    nombreUsuario: usuario.nombre,   // Puede ser undefined si el usuario no existe
    productoId,
    cantidad,
    estado: 'pendiente',
    creadoEn: new Date().toISOString(),
  };

  ordenes.push(nuevaOrden);

  res.status(201).json({
    mensaje: '✅ Orden creada exitosamente',
    orden: nuevaOrden,
  });
});

// GET /ordenes — Lista todas las órdenes
app.get('/ordenes', (req, res) => {
  res.json(ordenes);
});

// GET /health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', servicio: 'ordenes' });
});

// Manejador global de errores no capturados
app.use((err, req, res, next) => {
  console.error('💥 Error no manejado:', err.message);
  res.status(500).json({ error: 'Error interno del servidor', detalle: err.message });
});

app.listen(3003, () => {
  console.log('✅ Servicio Órdenes corriendo en puerto 3003');
});
