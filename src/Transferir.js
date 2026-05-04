function construirMatriz(criterio) {
    const sucursales = getSucursalesGuardadas();
    const conexiones = getConexionesGuardadas();
    const n          = sucursales.length;

    const datosVertice = [];
    for (let i = 0; i < n; i++) { datosVertice[i] = sucursales[i].id; }

    const matriz = [];
    for (let i = 0; i < n; i++) {
        matriz[i] = [];
        for (let j = 0; j < n; j++) { matriz[i][j] = 0; }
    }

    for (let k = 0; k < conexiones.length; k++) {
        const c    = conexiones[k];
        const peso = criterio === 'tiempo' ? c.tiempo : c.costo;
        let origen  = -1;
        let destino = -1;
        for (let i = 0; i < n; i++) {
            if (datosVertice[i] === c.origen)  origen  = i;
            if (datosVertice[i] === c.destino) destino = i;
        }
        if (origen !== -1 && destino !== -1) {
            matriz[origen][destino] = peso;
            if (c.bidi) { matriz[destino][origen] = peso; }
        }
    }

    return { matriz, datosVertice, n };
}

function dijkstra(origenId, destinoId, criterio) {
    const { matriz, datosVertice, n } = construirMatriz(criterio);
    let verticeOrigen  = -1;
    let verticeDestino = -1;

    for (let i = 0; i < n; i++) {
        if (datosVertice[i] === origenId)  verticeOrigen  = i;
        if (datosVertice[i] === destinoId) verticeDestino = i;
    }

    if (verticeOrigen === -1 || verticeDestino === -1) {
        return { encontrada: false, ruta: [], total: 0 };
    }

    const INF        = 999999999;
    const distancias = [];
    const visitado   = [];
    const anterior   = [];

    for (let i = 0; i < n; i++) {
        distancias[i] = INF;
        visitado[i]   = false;
        anterior[i]   = -1;
    }
    distancias[verticeOrigen] = 0;

    for (let iteracion = 0; iteracion < n; iteracion++) {
        let distanciaMin = INF;
        let u = -1;
        for (let i = 0; i < n; i++) {
            if (!visitado[i] && distancias[i] < distanciaMin) {
                distanciaMin = distancias[i];
                u = i;
            }
        }
        if (u === -1) break;
        visitado[u] = true;

        for (let v = 0; v < n; v++) {
            if (matriz[u][v] !== 0 && !visitado[v] && distancias[u] !== INF) {
                const alt = distancias[u] + matriz[u][v];
                if (alt < distancias[v]) {
                    distancias[v] = alt;
                    anterior[v]   = u;
                }
            }
        }
    }

    if (distancias[verticeDestino] === INF) {
        return { encontrada: false, ruta: [], total: 0 };
    }

    const rutaIndices = [];
    let actual = verticeDestino;
    while (actual !== -1) {
        rutaIndices.unshift(actual);
        actual = anterior[actual];
    }

    const ruta = [];
    for (let i = 0; i < rutaIndices.length; i++) {
        ruta[i] = datosVertice[rutaIndices[i]];
    }

    return { encontrada: true, ruta, total: distancias[verticeDestino] };
}

// Simula el paso de un producto por las colas de cada sucursal en la ruta.
// Devuelve los pasos del log y el ETA total acumulado.
function simularFlujo(ruta, producto, sucursales, conexiones, criterio) {
    const colas  = getColasGuardadas();
    const pasos  = [];
    let   etaAcc = 0;

    // Asegurar que todas las sucursales tienen entrada en colas
    for (let i = 0; i < sucursales.length; i++) {
        const id = sucursales[i].id;
        if (!colas[id]) {
            colas[id] = { colaIngreso: [], colaTraspaso: [], colaSalida: [] };
        }
    }

    for (let i = 0; i < ruta.length; i++) {
        const idSuc   = ruta[i];
        const esFinal = (i === ruta.length - 1);
        let   suc     = null;
        for (let k = 0; k < sucursales.length; k++) {
            if (sucursales[k].id === idSuc) { suc = sucursales[k]; break; }
        }
        if (!suc) continue;

        // Tiempo de tránsito desde la sucursal anterior
        if (i > 0) {
            const idAnterior = ruta[i - 1];
            let   pesoArista = 0;
            for (let k = 0; k < conexiones.length; k++) {
                const c = conexiones[k];
                const peso = criterio === 'tiempo' ? c.tiempo : c.costo;
                if ((c.origen === idAnterior && c.destino === idSuc) ||
                    (c.bidi && c.origen === idSuc && c.destino === idAnterior)) {
                    pesoArista = peso;
                    break;
                }
            }
            etaAcc += pesoArista;
            pasos.push({
                tipo:  'transito',
                desde: idAnterior,
                hasta: idSuc,
                valor: pesoArista,
                criterio
            });
        }

        // Cola de ingreso — producto llega a la sucursal
        colas[idSuc].colaIngreso.push({ nombre: producto.nombre, codigo: producto.codigoBarras });
        etaAcc += suc.tiempoIngreso;
        pasos.push({
            tipo:    'ingreso',
            sucursal: suc.nombre,
            tiempo:  suc.tiempoIngreso
        });

        if (esFinal) {
            // Destino final: el producto queda en colaIngreso (Disponible)
            pasos.push({ tipo: 'destino', sucursal: suc.nombre });
        } else {
            // Sucursal intermedia: pasa a colaTraspaso y luego a colaSalida

            // Sacar de colaIngreso y poner en colaTraspaso
            colas[idSuc].colaIngreso.pop();
            colas[idSuc].colaTraspaso.push({ nombre: producto.nombre, codigo: producto.codigoBarras });
            etaAcc += suc.tiempoPreparacion;
            pasos.push({
                tipo:    'traspaso',
                sucursal: suc.nombre,
                tiempo:  suc.tiempoPreparacion
            });

            // Sacar de colaTraspaso y poner en colaSalida
            colas[idSuc].colaTraspaso.pop();
            // El intervalo de despacho se multiplica por la posición en colaSalida (FIFO)
            const posicion = colas[idSuc].colaSalida.length;
            colas[idSuc].colaSalida.push({ nombre: producto.nombre, codigo: producto.codigoBarras });
            const espera = suc.intervaloDespacho * (posicion + 1);
            etaAcc += espera;
            pasos.push({
                tipo:     'salida',
                sucursal:  suc.nombre,
                intervalo: suc.intervaloDespacho,
                posicion:  posicion + 1,
                espera
            });
        }
    }

    guardarColas(colas);
    return { pasos, etaAcc };
}

function renderSimulacion(pasos, etaAcc, criterio) {
    const contenedor = document.getElementById('simulacion-pasos');
    if (!contenedor) return;

    let html = '';
    for (let i = 0; i < pasos.length; i++) {
        const p = pasos[i];
        if (p.tipo === 'transito') {
            const unidad = p.criterio === 'tiempo' ? 's' : ' Q';
            html += `<div class="sim-paso sim-transito">
                        Tránsito <strong>${p.desde}</strong> → <strong>${p.hasta}</strong>
                        &nbsp;+${p.valor}${unidad}
                     </div>`;
        } else if (p.tipo === 'ingreso') {
            html += `<div class="sim-paso sim-ingreso">
                        <strong>${p.sucursal}</strong> — Cola de ingreso
                        &nbsp;<span class="sim-badge">+${p.tiempo}s</span>
                     </div>`;
        } else if (p.tipo === 'traspaso') {
            html += `<div class="sim-paso sim-traspaso">
                        <strong>${p.sucursal}</strong> — Cola de preparación de traspaso
                        &nbsp;<span class="sim-badge">+${p.tiempo}s</span>
                     </div>`;
        } else if (p.tipo === 'salida') {
            html += `<div class="sim-paso sim-salida">
                        <strong>${p.sucursal}</strong> — Cola de salida
                        &nbsp;(posición ${p.posicion}, intervalo ${p.intervalo}s)
                        &nbsp;<span class="sim-badge">+${p.espera}s</span>
                     </div>`;
        } else if (p.tipo === 'destino') {
            html += `<div class="sim-paso sim-destino">
                        <strong>${p.sucursal}</strong> — Destino final alcanzado
                     </div>`;
        }
    }

    html += `<div class="sim-eta">
                ETA total: <strong>${etaAcc}${criterio === 'tiempo' ? 's' : ' Q'}</strong>
             </div>`;

    contenedor.innerHTML = html;
}

function renderQueuesVis() {
    const contenedor = document.getElementById('queues-vis');
    if (!contenedor) return;

    const sucursales = getSucursalesGuardadas();
    const colas      = getColasGuardadas();

    if (sucursales.length === 0) {
        contenedor.innerHTML = '<p class="text-muted" style="font-size:13px">No hay sucursales registradas</p>';
        return;
    }

    let html = '';
    for (let i = 0; i < sucursales.length; i++) {
        const s  = sucursales[i];
        const cq = colas[s.id] || { colaIngreso: [], colaTraspaso: [], colaSalida: [] };

        html += `<div class="mb-3 pb-3" style="border-bottom:1px solid #f3f4f6">
            <div style="font-weight:500; font-size:13px; margin-bottom:6px">
                ${s.nombre} <code style="font-size:11px">${s.id}</code>
                <span class="text-muted ms-2" style="font-size:11px">
                    ingreso:${s.tiempoIngreso}s &nbsp;traspaso:${s.tiempoPreparacion}s &nbsp;despacho:${s.intervaloDespacho}s
                </span>
            </div>
            <div class="row g-2">
                <div class="col-md-4">
                    <div style="font-size:11px; color:#6b7280; margin-bottom:4px">Cola de ingreso (${cq.colaIngreso.length})</div>
                    <div class="queue-container">${renderItemsCola(cq.colaIngreso)}</div>
                </div>
                <div class="col-md-4">
                    <div style="font-size:11px; color:#6b7280; margin-bottom:4px">Cola de traspaso (${cq.colaTraspaso.length})</div>
                    <div class="queue-container">${renderItemsCola(cq.colaTraspaso)}</div>
                </div>
                <div class="col-md-4">
                    <div style="font-size:11px; color:#6b7280; margin-bottom:4px">Cola de salida (${cq.colaSalida.length})</div>
                    <div class="queue-container">${renderItemsCola(cq.colaSalida)}</div>
                </div>
            </div>
        </div>`;
    }

    contenedor.innerHTML = html;
}

function renderItemsCola(items) {
    if (!items || items.length === 0) {
        return '<span style="font-size:11px; color:#9ca3af">vacía</span>';
    }
    let html = '';
    for (let i = 0; i < items.length; i++) {
        html += `<div class="queue-item">${items[i].nombre}</div>`;
        if (i < items.length - 1) html += '<span class="queue-arrow">→</span>';
    }
    return html;
}

function transfer() {
    const pIdx     = document.getElementById('t-product')?.value;
    const origenId = document.getElementById('t-origin')?.value;
    const destId   = document.getElementById('t-dest')?.value;
    const criterio = document.getElementById('t-criteria')?.value || 'tiempo';

    const routeResult = document.getElementById('route-result');
    const routePath   = document.getElementById('route-path');
    const routeDetail = document.getElementById('route-detail');

    if (!pIdx || !origenId || !destId) {
        alert('Completar todos los campos');
        return;
    }
    if (origenId === destId) {
        alert('Origen y destino deben de ser diferentes');
        return;
    }

    const productos = getProductosGuardados();
    const producto  = productos[parseInt(pIdx)];
    if (!producto) return;

    if (producto.sucursalId !== origenId) {
        const sucursales = getSucursalesGuardadas();
        let   nombreSuc  = origenId;
        for (let k = 0; k < sucursales.length; k++) {
            if (sucursales[k].id === producto.sucursalId) { nombreSuc = sucursales[k].nombre; break; }
        }
        alert(`El producto "${producto.nombre}" pertenece a la sucursal "${nombreSuc}". Selecciónala como origen.`);
        return;
    }

    const resultado = dijkstra(origenId, destId, criterio);

    if (routeResult) routeResult.style.display = 'block';

    if (!resultado.encontrada) {
        routePath.innerHTML   = '<span class="text-danger">No existe ruta entre las sucursales seleccionadas.</span>';
        routeDetail.innerHTML = '';
        document.getElementById('simulacion-pasos').innerHTML = '';
        renderQueuesVis();
        return;
    }

    const sucursales = getSucursalesGuardadas();
    const conexiones = getConexionesGuardadas();

    // Construir nombres para mostrar la ruta
    let rutaHtml = '';
    for (let i = 0; i < resultado.ruta.length; i++) {
        let nombreSuc = resultado.ruta[i];
        for (let k = 0; k < sucursales.length; k++) {
            if (sucursales[k].id === resultado.ruta[i]) { nombreSuc = sucursales[k].nombre; break; }
        }
        rutaHtml += `<span class="route-node">
            <span class="node-badge">${nombreSuc}</span>
            ${i < resultado.ruta.length - 1 ? '<span class="node-arrow">→</span>' : ''}
        </span>`;
    }
    routePath.innerHTML = rutaHtml;

    // Simular flujo por colas
    const { pasos, etaAcc } = simularFlujo(resultado.ruta, producto, sucursales, conexiones, criterio);

    routeDetail.innerHTML = `
        <strong>Criterio:</strong> ${criterio === 'tiempo' ? 'Tiempo mínimo' : 'Menor costo'} &nbsp;|&nbsp;
        <strong>Costo ruta:</strong> ${resultado.total}${criterio === 'tiempo' ? 's' : ' Q'} &nbsp;|&nbsp;
        <strong>ETA total (con colas):</strong> ${etaAcc}${criterio === 'tiempo' ? 's' : ' Q'}
        &nbsp;|&nbsp; <strong>Paradas:</strong> ${resultado.ruta.length}`;

    renderSimulacion(pasos, etaAcc, criterio);
    animarPasos(pasos, criterio);

    // Actualizar estado del producto
    producto.estado          = 'En tránsito';
    productos[parseInt(pIdx)] = producto;
    guardarProductos(productos);

    // Guardar historial
    const historial  = getHistorialGuardado();
    let   nomOrigen  = origenId;
    let   nomDestino = destId;
    for (let k = 0; k < sucursales.length; k++) {
        if (sucursales[k].id === origenId) nomOrigen  = sucursales[k].nombre;
        if (sucursales[k].id === destId)   nomDestino = sucursales[k].nombre;
    }
    historial.unshift({
        producto: producto.nombre,
        origen:   nomOrigen,
        destino:  nomDestino,
        criterio: criterio === 'tiempo' ? 'Tiempo mínimo' : 'Menor costo',
        eta:      etaAcc + (criterio === 'tiempo' ? 's' : ' Q'),
        hora:     new Date().toLocaleTimeString('es-GT')
    });
    guardarHistorial(historial);
    renderHistorial();
    renderQueuesVis();
}

function renderHistorial() {
    const tbody = document.getElementById('activity-log');
    if (!tbody) return;

    const historial = getHistorialGuardado();

    if (historial.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">Sin transferencias aún</td></tr>';
        return;
    }

    let html = '';
    for (let i = 0; i < historial.length; i++) {
        const h = historial[i];
        html += `<tr>
            <td>${h.producto}</td>
            <td>${h.origen}</td>
            <td>${h.destino}</td>
            <td>${h.criterio}</td>
            <td><span class="badge bg-warning text-dark">En tránsito</span></td>
            <td>${h.eta || '—'}</td>
            <td>${h.hora}</td>
        </tr>`;
    }
    tbody.innerHTML = html;
}

function inicializarSelectsTransferencia() {
    const sucursales = getSucursalesGuardadas();
    const productos  = getProductosGuardados();

    const selOrigen = document.getElementById('t-origin');
    const selDest   = document.getElementById('t-dest');

    if (selOrigen) {
        selOrigen.innerHTML = '<option value="">Seleccionar...</option>';
        for (let i = 0; i < sucursales.length; i++) {
            selOrigen.appendChild(new Option(sucursales[i].nombre, sucursales[i].id));
        }
    }
    if (selDest) {
        selDest.innerHTML = '<option value="">Seleccionar...</option>';
        for (let i = 0; i < sucursales.length; i++) {
            selDest.appendChild(new Option(sucursales[i].nombre, sucursales[i].id));
        }
    }

    const selProd = document.getElementById('t-product');
    if (selProd) {
        selProd.innerHTML = '<option value="">Seleccionar producto...</option>';
        for (let i = 0; i < productos.length; i++) {
            const p      = productos[i];
            let   nomSuc = p.sucursalId;
            for (let k = 0; k < sucursales.length; k++) {
                if (sucursales[k].id === p.sucursalId) { nomSuc = sucursales[k].nombre; break; }
            }
            selProd.appendChild(new Option(`${p.nombre} — ${nomSuc}`, i));
        }
    }
}

const ESCALA = 0.1;
function animarPasos(pasos, criterio){
    let tiempoAcumulado = 0;

    for(let i = 0; i < pasos.length; i++){
        const paso = pasos[i];

        if(paso.tipo === 'transito'){
            tiempoAcumulado += paso.valor;
        } else if (paso.tipo === 'ingreso') {
            tiempoAcumulado += paso.tiempo;
        } else if (paso.tipo === 'traspaso') {
            tiempoAcumulado += paso.tiempo;
        } else if (paso.tipo === 'salida') {
            tiempoAcumulado += paso.espera;
        }

        (function(t, p) {
            setTimeout(function() {
                resaltarPasoEnUI(p);
                renderQueuesVis();
            }, t * 1000 * ESCALA);
        })(tiempoAcumulado, paso);
    }
}

function resaltarPasoEnUI(paso) {
    const pasosDivs = document.querySelectorAll('.sim-paso');
    pasosDivs.forEach(d => d.classList.remove('sim-activo'));

    const tipos = {
        'transito': 'sim-transito',
        'ingreso':  'sim-ingreso',
        'traspaso': 'sim-traspaso',
        'salida':   'sim-salida',
        'destino':  'sim-destino'
    };

    const divs = document.querySelectorAll('.' + tipos[paso.tipo]);
    if (divs.length > 0) {
        divs[divs.length - 1].classList.add('sim-activo');
        divs[divs.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarSelectsTransferencia();
    renderHistorial();
    renderQueuesVis();
});
