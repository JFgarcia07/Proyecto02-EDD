let catalogoViz    = null;
let sucursalActual = null;
let dotStrings     = { avl: '', b: '', bmas: '', grafo: '' };
let vizInstance    = null;

function inicializar() {
    vizInstance = true;

    const sucursales = getSucursalesGuardadas();
    const selector   = document.getElementById('select-sucursal');
    if (!selector) return;

    for (let i = 0; i < sucursales.length; i++) {
        const opcion  = document.createElement('option');
        opcion.value  = sucursales[i].id;
        opcion.text   = sucursales[i].nombre + ' (' + sucursales[i].id + ')';
        selector.appendChild(opcion);
    }
}

function cargarSucursal() {
    const selector   = document.getElementById('select-sucursal');
    const idSucursal = selector?.value;
    if (!idSucursal) return;

    const sucursales = getSucursalesGuardadas();
    for (let i = 0; i < sucursales.length; i++) {
        if (sucursales[i].id === idSucursal) {
            sucursalActual = sucursales[i];
            break;
        }
    }

    catalogoViz = new Catalogo();
    const productos = getProductosGuardados();
    let   total     = 0;

    for (let i = 0; i < productos.length; i++) {
        if (productos[i].sucursalId === idSucursal) {
            const d = productos[i];
            const p = new Producto(d.nombre, d.codigoBarras, d.categoria, d.fechaExpiracion, d.marca, d.precio, d.stock);
            p.sucursalId = d.sucursalId;
            p.estado     = d.estado;
            catalogoViz.agregarProducto(p);
            total++;
        }
    }

    const info = document.getElementById('sucursal-info');
    if (info) {
        info.textContent = sucursalActual.nombre + ' — ' + total + ' productos cargados';
    }

    document.getElementById('seccion-estructuras').style.display = 'block';

    generarDots();
    renderizarTodo();
    dibujarHash();
    dibujarColas();
}

function generarDots() {
    dotStrings.avl  = catalogoViz.arbolAVL.generarDot();
    dotStrings.b    = catalogoViz.arbolB.generarDot();
    dotStrings.bmas = catalogoViz.arbolBMas.generarDot();
    dotStrings.grafo = generarDotGrafo();
}

function generarDotGrafo() {
    const sucursales = getSucursalesGuardadas();
    const conexiones = getConexionesGuardadas();

    // Solo incluir sucursales que participan en al menos una conexión
    const conConexion = {};
    for (let k = 0; k < conexiones.length; k++) {
        conConexion[conexiones[k].origen]  = true;
        conConexion[conexiones[k].destino] = true;
    }

    let dot = 'digraph Red {\n';
    dot    += '    node [shape=ellipse, style=filled, fillcolor="#DBEAFE"];\n';
    dot    += '    rankdir=LR;\n\n';

    for (let i = 0; i < sucursales.length; i++) {
        if (conConexion[sucursales[i].id]) {
            dot += '    "' + sucursales[i].id + '" [label="' + sucursales[i].nombre + '"];\n';
        }
    }

    for (let k = 0; k < conexiones.length; k++) {
        const c   = conexiones[k];
        const dir = c.bidi ? ' dir=both' : '';
        dot      += '    "' + c.origen + '" -> "' + c.destino +
                    '" [label="t:' + c.tiempo + 's c:Q' + c.costo + '"' + dir + '];\n';
    }

    dot += '}\n';
    return dot;
}

function renderizarViz(dotString, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    if (!dotString || dotString.trim() === '') {
        contenedor.innerHTML = '<p class="text-muted text-center py-4" style="font-size:13px">Sin datos</p>';
        return;
    }

    try {
        const svgStr = Viz(dotString);
        contenedor.innerHTML = svgStr;
        const svg = contenedor.querySelector('svg');
        if (svg) { svg.style.maxWidth = '100%'; svg.style.height = 'auto'; }
    } catch (error) {
        contenedor.innerHTML = '<p class="text-danger" style="font-size:12px">Error al renderizar</p>';
    }
}

function renderizarTodo() {
    renderizarViz(dotStrings.avl,  'viz-avl');
    renderizarViz(dotStrings.b,    'viz-b');
    renderizarViz(dotStrings.bmas, 'viz-bmas');
    renderizarViz(dotStrings.grafo,'viz-grafo');
}

function dibujarHash() {
    const canvas = document.getElementById('canvas-hash');
    if (!canvas || !catalogoViz) return;

    const ctx = canvas.getContext('2d');
    canvas.width  = canvas.offsetWidth;
    canvas.height = 220;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const hash = catalogoViz.tablaHash;

    if (hash.estaVacia()) {
        ctx.fillStyle    = '#9CA3AF';
        ctx.font         = '13px Segoe UI';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Sin productos en la Tabla Hash', canvas.width / 2, canvas.height / 2);
        return;
    }

    const mostrar    = Math.min(hash.capacidad, 53);
    const anchoBloque = canvas.width / mostrar;
    let   maxLongitud = 1;

    for (let i = 0; i < mostrar; i++) {
        let longitud = 0;
        let nodo     = hash.tabla[i];
        while (nodo !== null) { longitud++; nodo = nodo.siguiente; }
        if (longitud > maxLongitud) maxLongitud = longitud;
    }

    const alturaMax = 180;

    for (let i = 0; i < mostrar; i++) {
        let longitud = 0;
        let nodo     = hash.tabla[i];
        while (nodo !== null) { longitud++; nodo = nodo.siguiente; }

        const altura = longitud > 0 ? (longitud / maxLongitud) * alturaMax : 2;
        const x      = i * anchoBloque;
        const y      = canvas.height - altura - 20;

        ctx.fillStyle = longitud > 1 ? '#FCA5A5' : longitud === 1 ? '#6EE7B7' : '#E5E7EB';
        ctx.fillRect(x + 1, y, anchoBloque - 2, altura);
    }

    ctx.fillStyle    = '#374151';
    ctx.font         = '10px Segoe UI';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Verde = 1 elemento  |  Rojo = colisión  |  Gris = vacío', 4, canvas.height - 2);

    const stats = hash.getEstadisticas();
    const el    = document.getElementById('hash-stats');
    if (el) {
        el.innerHTML =
            'Capacidad: <strong>' + stats.capacidad + '</strong> &nbsp;|&nbsp; ' +
            'Elementos: <strong>' + stats.elementos + '</strong> &nbsp;|&nbsp; ' +
            'Factor de carga: <strong>' + parseFloat(stats.factorCarga).toFixed(3) + '</strong> &nbsp;|&nbsp; ' +
            'Buckets usados: <strong>' + stats.cubosUsados + '</strong> &nbsp;|&nbsp; ' +
            'Cadena más larga: <strong>' + stats.cadenaMax + '</strong>';
    }
}

function dibujarColas() {
    const contenedor = document.getElementById('colas-vis');
    const productos  = getProductosGuardados();
    const sucursales = getSucursalesGuardadas();
    if (!contenedor) return;

    let html = '';

    for (let i = 0; i < sucursales.length; i++) {
        const s          = sucursales[i];
        const enTransito = [];

        for (let j = 0; j < productos.length; j++) {
            if (productos[j].sucursalId === s.id && productos[j].estado === 'En tránsito') {
                enTransito.push(productos[j]);
            }
        }

        let itemsCola = '<span style="font-size:11px; color:#9ca3af">vacía</span>';
        if (enTransito.length > 0) {
            itemsCola = '';
            for (let k = 0; k < enTransito.length; k++) {
                itemsCola += '<div class="queue-item">' + enTransito[k].nombre + '</div>';
                if (k < enTransito.length - 1) {
                    itemsCola += '<span class="queue-arrow">→</span>';
                }
            }
        }

        html +=
            '<div class="mb-3 pb-3" style="border-bottom:1px solid #f3f4f6">' +
                '<div style="font-weight:500; font-size:13px; margin-bottom:6px">' +
                    s.nombre + ' <code style="font-size:11px">' + s.id + '</code>' +
                '</div>' +
                '<div class="row g-2">' +
                    '<div class="col-md-4">' +
                        '<div style="font-size:11px; color:#6b7280; margin-bottom:4px">Cola de ingreso</div>' +
                        '<div class="queue-container"><span style="font-size:11px; color:#9ca3af">vacía</span></div>' +
                    '</div>' +
                    '<div class="col-md-4">' +
                        '<div style="font-size:11px; color:#6b7280; margin-bottom:4px">Cola de traspaso</div>' +
                        '<div class="queue-container">' + itemsCola + '</div>' +
                    '</div>' +
                    '<div class="col-md-4">' +
                        '<div style="font-size:11px; color:#6b7280; margin-bottom:4px">Cola de salida</div>' +
                        '<div class="queue-container"><span style="font-size:11px; color:#9ca3af">vacía</span></div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    }

    contenedor.innerHTML = html || '<p class="text-muted" style="font-size:13px">Sin sucursales registradas</p>';
}

function descargarDot(tipo) {
    if (!sucursalActual) return;

    const contenido = dotStrings[tipo];
    if (!contenido) { alert('Sin datos para generar el archivo.'); return; }

    const nombre = tipo + '_' + sucursalActual.id + '.dot';
    const blob   = new Blob([contenido], { type: 'text/plain' });
    const url    = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href     = url;
    enlace.download = nombre;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
}

function descargarPng(tipo) {
    if (!sucursalActual) return;

    const dotString = dotStrings[tipo];
    if (!dotString) { alert('Sin datos para generar la imagen.'); return; }

    const nombre = tipo + '_' + sucursalActual.id + '.png';

    // Forzar dimensiones en px al SVG para que el canvas no quede en 0×0
    // (Viz.js emite dimensiones en puntos "pt" que los navegadores no siempre resuelven)
    let svgStr = Viz(dotString);
    svgStr = svgStr.replace(/^<svg /, '<svg width="1200" height="900" ');

    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const img  = new Image();

    img.onload = function () {
        const W = 1200;
        const H = 900;
        const canvas = document.createElement('canvas');
        canvas.width  = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, W, H);
        ctx.drawImage(img, 0, 0, W, H);
        URL.revokeObjectURL(url);

        const dataURL = canvas.toDataURL('image/png');
        const enlace  = document.createElement('a');
        enlace.href     = dataURL;
        enlace.download = nombre;
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
    };

    img.onerror = function () {
        URL.revokeObjectURL(url);
        alert('No se pudo generar la imagen PNG.');
    };

    img.src = url;
}

function descargarTodo() {
    if (!sucursalActual) { alert('Selecciona una sucursal primero.'); return; }

    // Separar cada descarga para que el navegador no las bloquee como popups
    const tipos = ['avl', 'b', 'bmas', 'grafo'];
    tipos.forEach(function(t, i) {
        setTimeout(function() { descargarDot(t); }, i * 300);
    });
    tipos.forEach(function(t, i) {
        setTimeout(function() { descargarPng(t); }, 1500 + i * 800);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    inicializar();
});