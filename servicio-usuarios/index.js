const express = require('express');
const app = express();
app.use(express.json());

const usuarios = [
  { id: 1, nombre: 'Ana García', email: 'ana@tienda.com' },
  { id: 2, nombre: 'Luis Pérez', email: 'luis@tienda.com' },
  { id: 3, nombre: 'María López', email: 'maria@tienda.com' },
];

// GET /usuarios/:id — Devuelve un usuario por ID
app.get('/usuarios/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const usuario = usuarios.find(u => u.id === id);

  if (!usuario) {
    return res.status(404).json({ error: `Usuario con id ${id} no encontrado` });
  }

  res.json(usuario);
});

// GET /usuarios — Lista todos los usuarios
app.get('/usuarios', (req, res) => {
  res.json(usuarios);
});

// GET /health — Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', servicio: 'usuarios' });
});

app.listen(3001, () => {
  console.log('✅ Servicio Usuarios corriendo en puerto 3001');
});
