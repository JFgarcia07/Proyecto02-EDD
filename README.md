# SuperMarket EDD — Gestión de Catálogo de Productos de Supermercado
**Universidad San Carlos de Guatemala — CUNOC**
Laboratorio de Estructura de Datos — Semestre 1, 2026

---

## Descripción general

Sistema web para la gestión de un catálogo de productos distribuido en múltiples sucursales interconectadas. Implementa las siguientes estructuras de datos desde cero:

- Lista enlazada
- Lista enlazada ordenada
- Árbol AVL (búsqueda por nombre)
- Árbol B (búsqueda por rango de fechas)
- Árbol B+ (búsqueda por categoría)
- Tabla Hash (búsqueda por código de barras)
- Cola — Queue (sistema de despacho por sucursal)
- Pila — Stack (rollback de operaciones)
- Grafo ponderado + Dijkstra (red de sucursales y rutas óptimas)

---

## Requisitos

- Navegador web moderno (Chrome, Firefox o Edge)
- Una de las siguientes opciones para ejecutar el servidor local:
  - **Live Server** (extensión de VS Code) — recomendado
  - **Python 3** instalado
  - **Node.js** instalado

---

## Cómo ejecutar

### Opción 1 — Live Server (VS Code)

1. Abrir la carpeta `PROYFASE2EDD/` en VS Code
2. Instalar la extensión **Live Server** si no la tiene
3. Hacer clic derecho sobre `GUI/Principal.html`
4. Seleccionar **Open with Live Server**
5. El sistema abre en `http://127.0.0.1:5500/GUI/Principal.html`

---

### Opción 2 — Python 3

1. Abrir una terminal en la carpeta raíz del proyecto:
```
PROYFASE2EDD/
```

2. Ejecutar:
```bash
python -m http.server 5500
```
o si el comando es `python3`:
```bash
python3 -m http.server 5500
```

3. Abrir en el navegador:
```
http://localhost:5500/GUI/Principal.html
```

4. Para detener el servidor: `Ctrl + C`

---

### Opción 3 — Node.js

1. Instalar http-server:
```bash
npm install -g http-server
```

2. Ejecutar desde la carpeta raíz del proyecto:
```bash
http-server -p 5500
```

3. Abrir en el navegador:
```
http://localhost:5500/GUI/Principal.html
```

> **Importante:** Siempre ejecutar el servidor desde la carpeta raíz `PROYFASE2EDD/`. No abrir el archivo HTML directamente con doble clic.

---

## Flujo de uso recomendado

1. Ejecutar el servidor y abrir `Principal.html`
2. Ir a **Cargar CSV** y cargar los archivos en este orden:
   - `sucursales.csv` primero
   - `conexiones.csv` segundo
   - `productos.csv` tercero
3. Ir a **Productos** para gestionar el inventario
4. Ir a **Transferir** para mover productos entre sucursales
5. Ir a **Estructuras** para visualizar y descargar los árboles y el grafo
6. Ir a **Rendimiento** para comparar el tiempo de las estructuras

---

## Persistencia de datos

El sistema usa `sessionStorage` del navegador para compartir datos entre páginas. Los datos se mantienen mientras el navegador esté abierto y se pierden al cerrarlo.

---

## Visualización de estructuras

La página **Estructuras** usa **Viz.js** para renderizar los archivos DOT de los árboles y el grafo directamente en el navegador. Requiere conexión a internet para cargar la librería desde CDN.

Los archivos generados incluyen el ID de la sucursal en el nombre para evitar sobreescrituras:
- `avl_S001.dot` / `avl_S001.png`
- `b_S001.dot` / `b_S001.png`
- `bplus_S001.dot` / `bplus_S001.png`
- `grafo_S001.dot` / `grafo_S001.png`

---

## Notas importantes

- No se usaron librerías que implementen las estructuras de datos (árboles, colas, hash, etc.)
- Todas las estructuras están implementadas desde cero en JavaScript con POO
- No se permite abrir el HTML directamente sin servidor local
- El sistema funciona completamente en el navegador sin backend

## Autor
Juan Fernando García Natareno
