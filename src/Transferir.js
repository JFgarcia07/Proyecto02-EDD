function construirMatriz(criterio){
    const sucursales = getSucursalesGuardadas();
    const conexiones = getConexionesGuardadas();
    const n = sucursales.length;

    const datosVertice = [];
    for(let i = 0; i < n; i++){
        datosVertice[i] = sucursales[i].id;
    }

    const matriz = [];
    for(let i = 0; i < n; i++){
        matriz[i] = [];
        for(let j = 0; j < n; j++){
            matriz[i][j] = 0;
        }
    }

    for(let k = 0; k < conexiones.length; k++){
        const c = conexiones[k];
        const peso = criterio === 'tiempo' ? c.tiempo : c.costo;
        let origen = -1;
        let destino = -1;

        for(let i = 0; i < n; i++){
            if(datosVertice[i] === c.origen){
                origen = i;
            }
            if(datosVertice[i] === c.destino){
                destino = i;
            }
        }

        if(origen !== -1 && destino !== -1){
            matriz[origen][destino] = peso;
            if(c.bidi){
                matriz[destino][origen] = peso;
            }
        }
    }

    return {matriz, datosVertice, n};
}

function  dijkstra(origenId, destinoId, criterio){
    const { matriz, datosVertice, n } = construirMatriz(criterio);
    let verticeOrigen = -1;
    let verticeDestino = -1;

    for(let i = 0; i < n; i++){
        if(datosVertice[i] === origenId) { verticeOrigen = i; }
        if(datosVertice[i] === destinoId) { verticeDestino = i;}
    }

    if (verticeOrigen === -1 || verticeDestino === -1) {
        return { encontrada: false, ruta: [], total: 0 };
    }

    const INF = 999999999;
    const distancias = [];
    const visitado = [];
    const anterior = [];

    for(let i = 0; i < n; i++){
        distancias[i] = INF;
        visitado[i] = false;
        anterior[i] = -1;
    }
    distancias[verticeOrigen] = 0;

    for(let iteracion = 0; iteracion < n; iteracion++){
        let distanciaMin = INF;
        let u = -1;

        for(let i = 0; i < n; i++){
            if(!visitado[i] && distancias[i] < distanciaMin){
                distanciaMin = distancias[i];
                u = i;
            }
        }

        if(u === -1){ break; }

        visitado[u] = true;

        for(let v = 0; v < n; v++){
            const existeArista = matriz[u][v] !== 0;
            const verticeLibre = !visitado[v];
            const origenAlcanzado = distancias[u] !== INF;

            if(existeArista && verticeLibre && origenAlcanzado){
                const distanciaAlternativa = distancias[u] + matriz[u][v];
                if(distanciaAlternativa < distancias[v]){
                    distancias[v] = distanciaAlternativa;
                    anterior[v] = u;
                }
            }
        }
    }

    if(distancias[verticeDestino] === INF){
        return { encontrada: false, ruta: [], total: 0};
    }

    const rutaIndices = [];
    let actual = verticeDestino;
    while(actual !== -1){
        rutaIndices.unshift(actual);
        actual = anterior[actual];
    }

    const ruta = [];
    for(let i = 0; i < rutaIndices.length; i++){
        ruta[i] = datosVertice[rutaIndices[i]];
    }

    return { encontrada: true, ruta, total: distancias[verticeDestino] };
}

function calcularETA(ruta, criterio){
    const conexiones = getConexionesGuardadas();
    const sucursales = getSucursalesGuardadas();
    let total = 0;

    for(let i = 0; i < ruta.length - 1; i++){
        for(let k = 0; k < conexiones.length; k++){
            const c = conexiones[k];
            if((c.origen === ruta[i] && c.destino === ruta[i + 1]) || (c.bidi && c.origen === ruta[i + 1] && c.destino === ruta[i])){
                total += criterio === 'tiempo' ? c.tiempo : c.costo;
                break;
            }
        }

        if(i > 0){
            for(let k = 0; k < sucursales.length; k++){
                if(sucursales[k].id === ruta[i]){
                    total += sucursales[k].tiempoIngreso + sucursales[k].tiempoPreparacion;
                    break;
                }
            }
        }
    }

    for(let k = 0; k < sucursales.length; k++){
        if(sucursales[k].id === ruta[ruta.length - 1]){
            total += sucursales[k].tiempoIngreso;
            break;
        }
    }

    return total;
}

function transfer(){
    const pIdx     = document.getElementById('t-product')?.value;
    const origenId = document.getElementById('t-origin')?.value;
    const destId   = document.getElementById('t-dest')?.value;
    const criterio = document.getElementById('t-criteria')?.value || 'tiempo';

    const routeResult = document.getElementById('route-result');
    const routePath   = document.getElementById('route-path');
    const routeDetail = document.getElementById('route-detail');

    if(!pIdx || !origenId || !destId){
        alert('Completar todos los campos');
        return;
    }
    if(origenId === destId){
        alert('Origen y destino deben de ser diferentes');
        return;
    }

    const productos = getProductosGuardados();
    const producto = productos[parseInt(pIdx)];

    if(!producto) return;

    if(producto.sucursalId !== origenId){
        const sucursales = getSucursalesGuardadas();
        const nombreSuc = sucursales.find(s => s.id === producto.sucursalId)?.nombre || producto.sucursalId;
        alert(`El producto "${producto.nombre}" pertenece a la sucursal "${nombreSuc}". Selecciónala como origen.`);
        return;
    }

    const resultado = dijkstra(origenId, destId, criterio);

    if(routeResult){
        routeResult.style.display = 'block';
    }

    if (!resultado.encontrada) {
        routePath.innerHTML   = '<span class="text-danger">No existe ruta entre las sucursales seleccionadas.</span>';
        routeDetail.innerHTML = '';
        return;
    }

    const sucursales = getSucursalesGuardadas();
    const eta = calcularETA(resultado.ruta, criterio);

    let rutaHtml = '';

    for (let i = 0; i < resultado.ruta.length; i++) {
        let nombreSuc = resultado.ruta[i];
        for (let k = 0; k < sucursales.length; k++) {
            if (sucursales[k].id === resultado.ruta[i]) {
                nombreSuc = sucursales[k].nombre;
                break;
            }
        }
        rutaHtml += `<span class="route-node">
            <span class="node-badge">${nombreSuc}</span>
            ${i < resultado.ruta.length - 1 ? '<span class="node-arrow">→</span>' : ''}
        </span>`;
    }
    routePath.innerHTML = rutaHtml;

    routeDetail.innerHTML = `
        <strong>Criterio:</strong> ${criterio === 'tiempo' ? 'Tiempo mínimo' : 'Menor costo'} &nbsp;|&nbsp;
        <strong>${criterio === 'tiempo' ? 'Tiempo total' : 'Costo total'}:</strong>
        ${resultado.total}${criterio === 'tiempo' ? 's' : ' Q'} &nbsp;|&nbsp;
        <strong>ETA:</strong> ${eta}s`;

    producto.estado         = 'En tránsito';
    productos[parseInt(pIdx)] = producto;
    guardarProductos(productos);

    const historial = getHistorialGuardado();
    let   nombreOrigen  = origenId;
    let   nombreDestino = destId;
    for (let k = 0; k < sucursales.length; k++) {
        if (sucursales[k].id === origenId)  nombreOrigen  = sucursales[k].nombre;
        if (sucursales[k].id === destId)    nombreDestino = sucursales[k].nombre;
    }

    historial.unshift({
        producto: producto.nombre,
        origen:   nombreOrigen,
        destino:  nombreDestino,
        criterio: criterio === 'tiempo' ? 'Tiempo mínimo' : 'Menor costo',
        hora:     new Date().toLocaleTimeString('es-GT')
    });
    guardarHistorial(historial);
    renderHistorial();
}

function renderHistorial() {
    const tbody = document.getElementById('activity-log');
    if (!tbody) return;

    const historial = getHistorialGuardado();

    if (historial.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Sin transferencias aún</td></tr>';
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
                if (sucursales[k].id === p.sucursalId) {
                    nomSuc = sucursales[k].nombre;
                    break;
                }
            }
            selProd.appendChild(new Option(`${p.nombre} — ${nomSuc}`, i));
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarSelectsTransferencia();
    renderHistorial();
});