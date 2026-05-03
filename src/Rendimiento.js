let catalogoBench = null;

function inicializar() {
    catalogoBench    = new Catalogo();
    const productos  = getProductosGuardados();
    const selector   = document.getElementById('bench-producto');

    for (let i = 0; i < productos.length; i++) {
        const d = productos[i];
        const p = new Producto(d.nombre, d.codigoBarras, d.categoria, d.fechaExpiracion, d.marca, d.precio, d.stock);
        p.sucursalId = d.sucursalId;
        p.estado     = d.estado;
        catalogoBench.agregarProducto(p);

        if (selector) {
            const opcion  = document.createElement('option');
            opcion.value  = i;
            opcion.text   = d.nombre + ' — ' + d.codigoBarras;
            selector.appendChild(opcion);
        }
    }
}

function ejecutarBenchmark() {
    if (!catalogoBench || catalogoBench.estaVacio()) {
        alert('No hay productos cargados. Ve a CSV y carga los productos primero.');
        return;
    }

    const iteraciones = parseInt(document.getElementById('bench-iteraciones')?.value) || 1000;
    const indice      = document.getElementById('bench-producto')?.value;

    if (indice === '' || indice === null) {
        alert('Selecciona un producto para buscar.');
        return;
    }

    const productos      = getProductosGuardados();
    const productoPrueba = productos[parseInt(indice)];
    if (!productoPrueba) return;

    const nombre       = productoPrueba.nombre;
    const codigoBarra  = productoPrueba.codigoBarras;

    document.getElementById('seccion-resultados').style.display = 'block';

    benchmarkNombre(nombre, iteraciones);
    benchmarkCodigo(codigoBarra, iteraciones);
    benchmarkInsercion(iteraciones);
    renderResumen();
}

function benchmarkNombre(nombre, iteraciones) {
    let tLista = 0;
    let tAVL   = 0;

    const t0 = performance.now();
    for (let i = 0; i < iteraciones; i++) {
        catalogoBench.listaProductos.obtenerPorNombre(nombre);
    }
    tLista = performance.now() - t0;

    const t1 = performance.now();
    for (let i = 0; i < iteraciones; i++) {
        catalogoBench.arbolAVL.buscar(nombre);
    }
    tAVL = performance.now() - t1;

    const tiempos = [
        { etiqueta: 'Lista enlazada', complejidad: 'O(n)',      tiempo: tLista, color: '#EF4444' },
        { etiqueta: 'Árbol AVL',      complejidad: 'O(log n)',  tiempo: tAVL,   color: '#3B82F6' }
    ];

    renderBarras('resultado-nombre', tiempos, iteraciones);
    guardarResultado('busqueda-nombre', tiempos);
}

function benchmarkCodigo(codigoBarra, iteraciones) {
    let tLista = 0;
    let tHash  = 0;

    const t0 = performance.now();
    for (let i = 0; i < iteraciones; i++) {
        catalogoBench.listaProductos.obtenerPorBarra(codigoBarra);
    }
    tLista = performance.now() - t0;

    const t1 = performance.now();
    for (let i = 0; i < iteraciones; i++) {
        catalogoBench.tablaHash.buscar(codigoBarra);
    }
    tHash = performance.now() - t1;

    const tiempos = [
        { etiqueta: 'Lista enlazada', complejidad: 'O(n)', tiempo: tLista, color: '#EF4444' },
        { etiqueta: 'Tabla Hash',     complejidad: 'O(1)', tiempo: tHash,  color: '#22C55E' }
    ];

    renderBarras('resultado-codigo', tiempos, iteraciones);
    guardarResultado('busqueda-codigo', tiempos);
}

function benchmarkInsercion(iteraciones) {
    const lista  = new ListaProductos();
    const avl    = new ArbolAVL();
    const hash   = new TablaHash(1009);
    let   tLista = 0;
    let   tAVL   = 0;
    let   tHash  = 0;

    const t0 = performance.now();
    for (let i = 0; i < iteraciones; i++) {
        const p = new Producto(
            'Producto' + i, 'TEST' + i, 'Cat', '2026-01-01', 'Marca', 10, 5
        );
        lista.insertar(p);
    }
    tLista = performance.now() - t0;

    const t1 = performance.now();
    for (let i = 0; i < iteraciones; i++) {
        const p = new Producto(
            'Producto' + i, 'TEST' + i, 'Cat', '2026-01-01', 'Marca', 10, 5
        );
        avl.insertar(p);
    }
    tAVL = performance.now() - t1;

    const t2 = performance.now();
    for (let i = 0; i < iteraciones; i++) {
        const p = new Producto(
            'Producto' + i, 'TEST' + i, 'Cat', '2026-01-01', 'Marca', 10, 5
        );
        hash.insertar(p);
    }
    tHash = performance.now() - t2;

    const tiempos = [
        { etiqueta: 'Lista enlazada', complejidad: 'O(1)',     tiempo: tLista, color: '#EF4444' },
        { etiqueta: 'Árbol AVL',      complejidad: 'O(log n)', tiempo: tAVL,   color: '#3B82F6' },
        { etiqueta: 'Tabla Hash',     complejidad: 'O(1)',     tiempo: tHash,  color: '#22C55E' }
    ];

    renderBarras('resultado-insercion', tiempos, iteraciones);
    guardarResultado('insercion', tiempos);
}

function renderBarras(elementoId, tiempos, iteraciones) {
    const el = document.getElementById(elementoId);
    if (!el) return;

    let maxTiempo = 0;
    for (let i = 0; i < tiempos.length; i++) {
        if (tiempos[i].tiempo > maxTiempo) maxTiempo = tiempos[i].tiempo;
    }
    if (maxTiempo === 0) maxTiempo = 1;

    let html = '<p style="font-size:11px; color:#6b7280; margin-bottom:12px">' + iteraciones + ' iteraciones — ' + (catalogoBench ? catalogoBench.getTotal() : 0) + ' productos</p>';

    for (let i = 0; i < tiempos.length; i++) {
        const t     = tiempos[i];
        const ancho = Math.round((t.tiempo / maxTiempo) * 100);

        html +=
            '<div class="perf-row">' +
                '<div class="perf-label">' + t.etiqueta + '</div>' +
                '<div style="font-size:11px; color:#9ca3af; width:60px; text-align:center">' +
                    t.complejidad +
                '</div>' +
                '<div class="perf-track">' +
                    '<div class="perf-fill" style="width:' + ancho + '%; background:' + t.color + '"></div>' +
                '</div>' +
                '<div class="perf-time">' + t.tiempo.toFixed(4) + 'ms</div>' +
            '</div>';
    }

    el.innerHTML = html;
}

let resultados = {};

function guardarResultado(operacion, tiempos) {
    resultados[operacion] = tiempos;
}

function renderResumen() {
    const tbody = document.getElementById('tabla-resumen');
    if (!tbody) return;

    const operaciones = [
        { clave: 'busqueda-nombre', nombre: 'Búsqueda por nombre' },
        { clave: 'busqueda-codigo', nombre: 'Búsqueda por código' },
        { clave: 'insercion',       nombre: 'Inserción' }
    ];

    let html = '';

    for (let i = 0; i < operaciones.length; i++) {
        const op      = operaciones[i];
        const tiempos = resultados[op.clave];
        if (!tiempos) continue;

        let minTiempo = tiempos[0].tiempo;
        let minNombre = tiempos[0].etiqueta;
        for (let j = 1; j < tiempos.length; j++) {
            if (tiempos[j].tiempo < minTiempo) {
                minTiempo = tiempos[j].tiempo;
                minNombre = tiempos[j].etiqueta;
            }
        }

        for (let j = 0; j < tiempos.length; j++) {
            const t      = tiempos[j];
            const esMas  = t.etiqueta === minNombre;

            html +=
                '<tr>' +
                    '<td>' + (j === 0 ? op.nombre : '') + '</td>' +
                    '<td>' + t.etiqueta + '</td>' +
                    '<td><code>' + t.complejidad + '</code></td>' +
                    '<td>' + t.tiempo.toFixed(4) + 'ms</td>' +
                    '<td>' + (esMas ? '<span class="badge bg-success">✓ Más rápida</span>' : '') + '</td>' +
                '</tr>';
        }

        html += '<tr><td colspan="5" style="padding:4px"></td></tr>';
    }

    tbody.innerHTML = html || '<tr><td colspan="5" class="text-center text-muted py-4">Sin resultados</td></tr>';
}

function limpiarResultados() {
    resultados = {};
    document.getElementById('seccion-resultados').style.display = 'none';
    document.getElementById('bench-producto').value = '';
}

document.addEventListener('DOMContentLoaded', function() {
    inicializar();
});