# 🔑 Guía del Profesor — Soluciones

> ⚠️ Este archivo es solo para ti. No lo incluyas en el repositorio de los estudiantes.

---

## Bug #1 — Configuración (docker-compose.yml)

**Archivo:** `docker-compose.yml`

**Problema:** La variable de entorno `USUARIOS_URL` apunta a `http://usuarios:3001`,
pero el nombre del servicio en docker-compose es `servicio-usuarios`.
Docker Compose usa el nombre del servicio como hostname interno en la red.

**Síntoma:** El servicio de órdenes no puede conectarse al de usuarios.
Los logs mostrarán algo como: `getaddrinfo ENOTFOUND usuarios`

**Corrección:**
```yaml
# Cambiar esto:
USUARIOS_URL: http://usuarios:3001

# Por esto:
USUARIOS_URL: http://servicio-usuarios:3001
```

---

## Bug #2 — Lógica (servicio-productos/index.js)

**Archivo:** `servicio-productos/index.js`, endpoint `GET /productos/:id/stock`

**Problema:** El `return` está colocado antes de la condición que verifica si hay stock.
Siempre devuelve `disponible: false` sin importar cuánto stock tenga el producto.

**Síntoma:** Ningún producto tiene stock disponible, aunque el catálogo muestre stock > 0.

**Corrección:**
```javascript
// Reemplazar el bloque completo por:
if (producto.stock >= cantidad) {
  res.json({
    disponible: true,
    mensaje: `Stock suficiente. Disponible: ${producto.stock}`,
  });
} else {
  res.json({
    disponible: false,
    mensaje: `Stock insuficiente. Disponible: ${producto.stock}, solicitado: ${cantidad}`,
  });
}
```

---

## Bug #3 — Manejo de errores (servicio-ordenes/index.js)

**Archivo:** `servicio-ordenes/index.js`, endpoint `POST /ordenes`

**Problema:** Después de llamar al servicio de usuarios, no se verifica si la respuesta
fue exitosa (`resUsuario.ok`). Si el usuario no existe, la respuesta es un objeto de error
`{ error: "..." }` pero el código continúa y crea una orden con `nombreUsuario: undefined`.

**Síntoma:** Se pueden crear órdenes con usuarios inexistentes, con `nombreUsuario: undefined`.
Además, si se agrega más lógica que dependa del objeto usuario, puede causar crashes difíciles
de rastrear.

**Corrección:** Agregar validación después de obtener la respuesta del usuario:
```javascript
const resUsuario = await fetch(`${USUARIOS_URL}/usuarios/${usuarioId}`);
const usuario = await resUsuario.json();

// Agregar esto:
if (!resUsuario.ok) {
  return res.status(404).json({ error: `Usuario ${usuarioId} no encontrado` });
}
```

---

## Flujo correcto tras las 3 correcciones

```
POST /ordenes { usuarioId: 2, productoId: 3, cantidad: 1 }
  ↓
servicio-ordenes llama a http://servicio-usuarios:3001/usuarios/2  ✅ (Bug #1 resuelto)
  ↓
Usuario encontrado: Luis Pérez                                      ✅ (Bug #3 resuelto)
  ↓
servicio-ordenes llama a http://servicio-productos:3002/productos/3/stock?cantidad=1
  ↓
Stock disponible: 15 unidades, solicitado: 1 → disponible: true    ✅ (Bug #2 resuelto)
  ↓
Orden creada: { id: 1, nombreUsuario: "Luis Pérez", ... }          ✅
```

---

## Preguntas de reflexión — Respuestas esperadas

**1. ¿Cuál fue el bug más difícil?**
El Bug #3 suele ser el más difícil porque no explota de forma obvia — el sistema
"funciona" pero produce datos incorrectos. Es un buen momento para hablar de
**silent failures** y por qué el manejo explícito de errores es crítico.

**2. ¿Qué agregarías para producción?**
Respuestas válidas incluyen: logging estructurado (Winston, Pino), health checks
con circuit breaker, tracing distribuido (OpenTelemetry), alertas, reintentos con
backoff exponencial.

**3. ¿Qué pasa si usuarios se cae?**
El sistema de órdenes debería implementar un **Circuit Breaker** para evitar
cascada de fallos. También podría cachear usuarios recientes o degradarse
gracefully (aceptar la orden y validar async).
