# 🕵️ El Sistema Caído

> *"Eres el único ingeniero disponible un viernes a las 5pm. El sistema de una tienda
> online está fallando y los usuarios no pueden comprar. Tienes acceso al código...
> pero algo está mal. Encuéntralo y arréglalo antes de que el negocio pierda más dinero."*

---

## 🏗️ Arquitectura del sistema

```
Cliente
  └──▶ POST /ordenes  (puerto 3003)
            ├──▶ GET /usuarios/:id     (puerto 3001)  ← valida que el usuario existe
            └──▶ GET /productos/:id/stock (puerto 3002) ← verifica stock disponible
```

El sistema tiene **3 microservicios**:

| Servicio | Puerto | Responsabilidad |
|---|---|---|
| `servicio-usuarios` | 3001 | Gestión de usuarios |
| `servicio-productos` | 3002 | Catálogo y stock |
| `servicio-ordenes` | 3003 | Creación de órdenes |

---

## 🚀 Cómo levantar el sistema

```bash
docker compose up --build
```

---

## 🧪 Cómo probar el sistema

Una vez levantado, intenta crear una orden con `curl` o Postman:

```bash
curl -X POST http://localhost:3003/ordenes \
  -H "Content-Type: application/json" \
  -d '{"usuarioId": 1, "productoId": 1, "cantidad": 2}'
```

También puedes consultar cada servicio por separado:

```bash
# Ver usuarios disponibles
curl http://localhost:3001/usuarios

# Ver productos disponibles
curl http://localhost:3002/productos

# Ver stock de un producto
curl "http://localhost:3002/productos/1/stock?cantidad=2"

# Ver órdenes creadas
curl http://localhost:3003/ordenes

# Healthcheck de cada servicio
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
```

---

## 🔍 Tu misión

El sistema tiene **3 bugs**. Cada uno es de un tipo diferente:

1. **Bug de configuración** — algo está mal en cómo los servicios se comunican entre sí
2. **Bug de lógica** — un endpoint devuelve siempre el mismo resultado incorrecto
3. **Bug de manejo de errores** — el sistema no valida correctamente una respuesta de error

### Pasos sugeridos

1. Levanta el sistema y observa qué pasa
2. Revisa los logs: `docker compose logs`
3. Prueba cada endpoint individualmente
4. Lee el código de cada servicio con atención
5. Corrige los bugs uno a uno
6. Verifica que el flujo completo funciona al final

---

## ✅ ¿Cómo sé que lo resolví?

Cuando este comando devuelva una orden creada exitosamente:

```bash
curl -X POST http://localhost:3003/ordenes \
  -H "Content-Type: application/json" \
  -d '{"usuarioId": 2, "productoId": 3, "cantidad": 1}'
```

Respuesta esperada:
```json
{
  "mensaje": "✅ Orden creada exitosamente",
  "orden": {
    "id": 1,
    "usuarioId": 2,
    "nombreUsuario": "Luis Pérez",
    "productoId": 3,
    "cantidad": 1,
    "estado": "pendiente",
    "creadoEn": "..."
  }
}
```

---

## 💬 Reflexión final (responde antes de salir)

1. ¿Cuál de los 3 bugs fue más difícil de encontrar? ¿Por qué?
2. ¿Qué herramientas o prácticas agregarías a este sistema para que sea más fácil detectar errores en producción?
3. ¿Qué pasaría si el servicio de usuarios se cae completamente mientras hay órdenes entrando?
