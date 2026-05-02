function addBranch(){
    const id        = document.getElementById('b-id')?.value.trim();
    const nombre    = document.getElementById('b-name')?.value.trim();
    const ubicacion = document.getElementById('b-location')?.value.trim();
    const ti        = document.getElementById('p-entry')?.value.trim();
    const tp        = document.getElementById('p-transfer')?.value.trim();
    const td        = document.getElementById('b-dispatch')?.value.trim();

    if (!id || !nombre || !ubicacion || !ti || !tp || !td){
        mostrarMensajeBranch('Todos los compos son obligatorios', 'danger');
        return;
    }

    const lista = getSucursalesGuardadas();
    if (lista.some(s => s.id === id)) {
        mostrarMensajeBranch(`Ya existe una sucursal con ID "${id}".`, 'danger');
        return;
    }

    lista.push({
        id, nombre, ubicacion,
        tiempoIngreso:     parseInt(ti),
        tiempoPreparacion: parseInt(tp),
        intervaloDespacho: parseInt(td)
    });

    guardarSucursales(lista);
    mostrarMensajeBranch(`Sucursal "${nombre}" agregada correctamente.`);
    renderBranchTable();
    inicializarSelectsConexion();

    ['b-id','b-name','b-location','p-entry','p-transfer','b-dispatch']
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

function eliminarSucursal(id){
    guardarSucursales(getSucursalesGuardadas().filter(s => s.id !== id));
    guardarConexiones(getConexionesGuardadas().filter(c => c.origen !== id && c.destino !== id));
    renderBranchTable();
    renderConexiones();
    inicializarSelectsConexion();
    mostrarMensajeBranch('Sucursal eliminada.');
}

function renderBranchTable(){
    const tbody = document.getElementById('branch-list');
    const count = document.getElementById('branch-count');

    if(!tbody) return;

    const lista = getSucursalesGuardadas();
    if(count) count.textContent = lista.length;

    if(lista.length === 0){
        tbody.innerHTML = `<tr><td colspan="11" class="text-center text-muted py-4">Sin sucursales registradas</td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map(s => `
        <tr>
            <td><code>${s.id}</code></td>
            <td>${s.nombre}</td>
            <td>${s.ubicacion}</td>
            <td>${s.tiempoIngreso}s</td>
            <td>${s.tiempoPreparacion}s</td>
            <td>${s.intervaloDespacho}s</td>
            <td>—</td><td>—</td><td>—</td><td>—</td>
            <td>
                <button class="btn btn-sm btn-outline-danger py-0"
                    onclick="eliminarSucursal('${s.id}')">Eliminar</button>
            </td>
        </tr>`).join('');
}

function mostrarMensajeBranch(texto, tipo = 'success') {
    const el = document.getElementById('branch-msg');
    if (!el) return;
    el.innerHTML = `<span class="text-${tipo}">${texto}</span>`;
    setTimeout(() => { el.innerHTML = ''; }, 3000);
}

function addConexion() {
    const origen  = document.getElementById('c-origin')?.value;
    const destino = document.getElementById('c-dest')?.value;
    const tiempo  = document.getElementById('c-time')?.value;
    const costo   = document.getElementById('c-cost')?.value;
    const bidi    = document.getElementById('c-bidi')?.value === 'true'; 
    const mostrarMsg = (texto, tipo = 'danger') => {
        const msg = document.getElementById('conexion-msg');
        if (!msg) return;
        msg.innerHTML = `<span class="text-${tipo}">${texto}</span>`;
        setTimeout(() => { msg.innerHTML = ''; }, 3000);
    };

    if (!origen || !destino || !tiempo || !costo) {
        mostrarMsg('Todos los campos son obligatorios.');
        return;
    }
    if (origen === destino) {
        mostrarMsg('Origen y destino deben ser diferentes.');
        return;
    }

    const lista = getConexionesGuardadas();
    if (lista.some(c => c.origen === origen && c.destino === destino)) {
        mostrarMsg('Ya existe esa conexión.');
        return;
    }

    lista.push({ origen, destino, tiempo: parseFloat(tiempo), costo: parseFloat(costo), bidi });
    guardarConexiones(lista);
    mostrarMsg('Conexión agregada correctamente.', 'success');
    renderConexiones();

    ['c-time','c-cost'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

function eliminarConexion(i) {
    const lista = getConexionesGuardadas();
    lista.splice(i, 1);
    guardarConexiones(lista);
    renderConexiones();
}

function renderConexiones() {
    const tbody = document.getElementById('conexion-list');
    const count = document.getElementById('conexion-count');
    if (!tbody) return;

    const sucursales = getSucursalesGuardadas();
    const lista      = getConexionesGuardadas();
    if (count) count.textContent = lista.length;

    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Sin conexiones registradas</td></tr>';
        return;
    }

    tbody.innerHTML = lista.map((c, i) => {
        const origen  = sucursales.find(s => s.id === c.origen)?.nombre  || c.origen;
        const destino = sucursales.find(s => s.id === c.destino)?.nombre || c.destino;
        return `
        <tr>
            <td>${origen}</td>
            <td>${destino}</td>
            <td>${c.tiempo}s</td>
            <td>Q${c.costo}</td>
            <td>${c.bidi ? 'Bidireccional' : 'Unidireccional'}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger py-0"
                    onclick="eliminarConexion(${i})">Eliminar</button>
            </td>
        </tr>`;
    }).join('');
}

function inicializarSelectsConexion() {
    const sucursales = getSucursalesGuardadas();
    ['c-origin','c-dest'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = '<option value="">Seleccionar...</option>';
        sucursales.forEach(s => el.appendChild(new Option(s.nombre, s.id)));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderBranchTable();
    renderConexiones();
    inicializarSelectsConexion();
});
