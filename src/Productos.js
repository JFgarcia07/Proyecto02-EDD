const catalogo = typeof Catalogo !== 'undefined' ? new Catalogo() : null;

function cargarProductoEnCatalogo(){
    if(!catalogo) return;
    getProductosGuardados().forEach(d => {
        const p = new Producto(d.nombre, d.codigoBarras, d.categoria, d.fechaExpiracion,
            d.marca, d.precio, d.stock);
        p.sucursalId = d.sucursalId;
        p.estado     = d.estado;
        catalogo.agregarProducto(p);
    });
}

function sincronizarProductos() {
    if (!catalogo) return;
    guardarProductos(catalogo.listarTodos());
}

function addProduct(){
    const nombre          = document.getElementById('p-name')?.value.trim();
    const codigoBarras    = document.getElementById('p-barcode')?.value.trim();
    const categoria       = document.getElementById('p-category')?.value.trim();
    const marca           = document.getElementById('p-brand')?.value.trim();
    const precio          = document.getElementById('p-price')?.value;
    const stock           = document.getElementById('p-stock')?.value;
    const fechaExpiracion = document.getElementById('p-expiry')?.value;
    const sucursalId      = document.getElementById('p-branch')?.value;

    if(!nombre || !codigoBarras || !categoria || !marca || !precio || !stock || !fechaExpiracion || !sucursalId){
        mostrarMensajeProducto('Llenar todos los campos para añadir el producto', 'danger');
        return;
    }

    const p = new Producto(nombre, codigoBarras, categoria, fechaExpiracion, marca, precio, stock);
    p.sucursalId = sucursalId;
    catalogo.agregarProducto(p);

    mostrarMensajeProducto(`"${nombre}" agregado correctamente.`);
    sincronizarProductos();
    actualizarFiltrosCategorias();
    filterProducts();

    ['p-name','p-barcode','p-category','p-brand','p-price','p-stock','p-expiry']
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    document.getElementById('p-branch').value = '';
}

function undoProduct() {
    const op = catalogo?.deshacer();
    if (!op) {
        mostrarMensajeProducto('No hay operaciones para deshacer.', 'warning');
        return;
    }
    const accion = op.accion === 'agregar' ? 'Agregado revertido' : 'Eliminación revertida';
    mostrarMensajeProducto(`${accion}: "${op.producto.nombre}".`);
    sincronizarProductos();
    actualizarFiltrosCategorias();
    filterProducts();
}

function filterProducts() {
    if (!catalogo) return;

    const sortBy   = document.getElementById('sort-by')?.value || 'all';
    const texto    = document.getElementById('filter-search')?.value.trim() || '';
    const cat      = document.getElementById('filter-category')?.value || '';
    const sucursal = document.getElementById('filter-branch')?.value || '';
    const estado   = document.getElementById('filter-status')?.value || '';

    const searchCol  = document.getElementById('search-box-col');
    const dateStart  = document.getElementById('date-range-start');
    const dateEnd    = document.getElementById('date-range-end');

    if (sortBy === 'expiry') {
        if (searchCol) searchCol.style.display = 'none';
        if (dateStart) dateStart.style.display = 'block';
        if (dateEnd)   dateEnd.style.display   = 'block';
    } else {
        if (searchCol) searchCol.style.display = 'block';
        if (dateStart) dateStart.style.display = 'none';
        if (dateEnd)   dateEnd.style.display   = 'none';
    }

    let lista      = [];
    let estructura = '';
    const t0       = performance.now();

    if (sortBy === 'name') {
        estructura = 'Árbol AVL — O(log n)';
        if (texto) {
            const r = catalogo.buscarPorNombre(texto);
            lista   = r ? [r] : catalogo.listaPorNombres().filter(p =>
                p.nombre.toLowerCase().includes(texto.toLowerCase())
            );
        } else {
            lista = catalogo.listaPorNombres();
        }
    } else if (sortBy === 'barcode') {
        estructura = 'Tabla Hash — O(1)';
        if (texto) {
            const r = catalogo.buscarPorCodigoBarras(texto);
            lista   = r ? [r] : [];
        }
    } else if (sortBy === 'category') {
        estructura = 'Árbol B+ — O(log n)';
        if (texto) {
            lista = catalogo.buscarPorCategoria(texto);
        }
    } else if (sortBy === 'expiry') {
        estructura    = 'Árbol B — O(log n)';
        const fecha1  = document.getElementById('filter-date1')?.value || '';
        const fecha2  = document.getElementById('filter-date2')?.value || '';
        if (fecha1 && fecha2) {
            lista = catalogo.buscarPorFechas(fecha1, fecha2);
        }
    } else {
        lista = catalogo.listaPorNombres();
    }

    const t1 = performance.now();

    if (cat)      lista = lista.filter(p => p.categoria   === cat);
    if (sucursal) lista = lista.filter(p => p.sucursalId  === sucursal);
    if (estado)   lista = lista.filter(p => p.estado      === estado);

    const searchTime = document.getElementById('search-time');
    if (searchTime && estructura) {
        searchTime.innerHTML = `<span class="text-muted" style="font-size:12px">
            ${lista.length} resultado(s) — ${(t1 - t0).toFixed(4)}ms — ${estructura}
        </span>`;
    }

    renderTablaProductos(lista);
}

function renderTablaProductos(productos) {
    const tbody = document.getElementById('product-list');
    const count = document.getElementById('product-count');
    if (!tbody) return;

    const sucursales = getSucursalesGuardadas();
    if (count) count.textContent = productos.length;

    if (productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" class="text-center text-muted py-4">Sin productos registrados</td></tr>`;
        return;
    }

    tbody.innerHTML = productos.map((p, i) => {
        const suc = sucursales.find(s => s.id === p.sucursalId)?.nombre || p.sucursalId || '—';
        const badgeClase = {
            'Disponible':  'bg-success',
            'En tránsito': 'bg-warning text-dark',
            'Agotado':     'bg-danger'
        }[p.estado] || 'bg-secondary';

        return `
        <tr>
            <td>${i + 1}</td>
            <td>${p.nombre}</td>
            <td><code>${p.codigoBarras}</code></td>
            <td>${p.categoria}</td>
            <td>${p.marca}</td>
            <td>Q${parseFloat(p.precio).toFixed(2)}</td>
            <td>${p.stock}</td>
            <td>${p.fechaExpiracion || '—'}</td>
            <td>${suc}</td>
            <td><span class="badge ${badgeClase}">${p.estado}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-danger py-0"
                    onclick="eliminarProducto('${p.codigoBarras}')">Eliminar</button>
            </td>
        </tr>`;
    }).join('');
}

function actualizarFiltrosCategorias() {
    const sel = document.getElementById('filter-category');
    if (!sel || !catalogo) return;
    const cats        = [...new Set(catalogo.listarTodos().map(p => p.categoria).filter(Boolean))].sort();
    const valorActual = sel.value;
    sel.innerHTML     = '<option value="">Todas las categorías</option>';
    cats.forEach(c => sel.appendChild(new Option(c, c)));
    sel.value = valorActual;
}

function inicializarSelectSucursales() {
    const sucursales = getSucursalesGuardadas();
    ['p-branch','filter-branch'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const placeholder = id === 'p-branch' ? 'Seleccionar sucursal...' : 'Todas las sucursales';
        el.innerHTML = `<option value="">${placeholder}</option>`;
        sucursales.forEach(s => el.appendChild(new Option(s.nombre, s.id)));
    });
}

function mostrarMensajeProducto(texto, tipo = 'success') {
    const el = document.getElementById('product-msg');
    if (!el) return;
    el.innerHTML = `<span class="text-${tipo}">${texto}</span>`;
    setTimeout(() => { el.innerHTML = ''; }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarSelectSucursales();
    cargarProductoEnCatalogo();
    actualizarFiltrosCategorias();
    filterProducts();
});