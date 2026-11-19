# Útiles Express — React + Go

Prototipo local de ventas e inventario. Frontend React/TypeScript y backend Go (biblioteca estándar).

## Requisitos
- Go 1.22 o superior
- Node.js compatible con Vite 8 (Node 20.19+ o 22.12+)

## Inicio
```bash
npm install
npm run dev
```
Abre http://localhost:3000. El servidor Go escucha en 127.0.0.1:3001.

## Producción local de demostración
```bash
npm run build
go run ./backend
```
Abre http://localhost:3001.

## Datos
Se conserva exactamente el archivo `backend/data/store.json` del proyecto anterior, con las mismas colecciones: users, products, sales y stockMovements. **No existe MySQL en el proyecto de origen.** `DATA_DIR` permite cambiar la carpeta.

## Aviso de seguridad
**Solo prototipo local.** Usa una contraseña compartida de demostración (`DEMO_PASSWORD`, por defecto `demo123`), guarda datos en JSON y permite reemplazar el estado sin autorización por sesión. No publicar en internet ni usar con datos reales. La migración de lenguaje no implica cumplimiento de las 26 historias de usuario.

## Pruebas
```bash
go test ./...
npm run lint
npm run build
```
