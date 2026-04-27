const catalogo = new Catalogo();

const SUCURSALES = [
    { id: 'S01', nombre: 'Sucursal Central' },
    { id: 'S02', nombre: 'Sucursal Norte' },
    { id: 'S03', nombre: 'Sucursal Sur' },
    { id: 'S04', nombre: 'Sucursal Este' },
    { id: 'S05', nombre: 'Sucursal Oeste' },
];

function inicializarSucursales() {
    const selectForm   = document.getElementById('p-branch');
    const selectFilter = document.getElementById('filter-branch');
    if (!selectForm) return;

    SUCURSALES.forEach(s => {
        const optForm = new Option(s.nombre, s.id);
        const optFilter = new Option(s.nombre, s.id);
        selectForm.appendChild(optForm);
        selectFilter.appendChild(optFilter);
    });
}

function renderTabla(productos) {
    const tbody = document.getElementById('product-list');
    const count = document.getElementById('product-count');
    if (!tbody) return;

    count.textContent = productos.length;

    if (productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" class="text-center text-muted py-4">Sin productos registrados</td></tr>`;
        return;
    }

    tbody.innerHTML = productos.map((p, i) => {
        const sucursal = SUCURSALES.find(s => s.id === p.sucursalId) || { nombre: p.sucursalId || '—' };
        const estadoBadge = {
            'Disponible':  'bg-success',
            'En tránsito': 'bg-warning text-dark',
            'Agotado':     'bg-danger',
        }[p.estado] || 'bg-secondary';

        return `<tr>
            <td>${i + 1}</td>
            <td>${p.nombre}</td>
            <td><code>${p.codigoBarras}</code></td>
            <td>${p.categoria}</td>
            <td>${p.marca}</td>
            <td>Q ${parseFloat(p.precio).toFixed(2)}</td>
            <td>${p.stock}</td>
            <td>${p.fechaExpiracion || '—'}</td>
            <td>${sucursal.nombre}</td>
            <td><span class="badge ${estadoBadge}">${p.estado}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-danger py-0"
                    onclick="eliminarProducto('${p.codigoBarras}')">Eliminar</button>
            </td>
        </tr>`;
    }).join('');
}

function actualizarFiltrosCategorias() {
    const sel = document.getElementById('filter-category');
    if (!sel) return;
    const categorias = [...new Set(catalogo.listarTodos().map(p => p.categoria).filter(Boolean))].sort();
    const valorActual = sel.value;
    sel.innerHTML = '<option value="">Todas las categorías</option>';
    categorias.forEach(c => {
        const opt = new Option(c, c);
        sel.appendChild(opt);
    });
    sel.value = valorActual;
}

function mostrarMensaje(texto, tipo = 'success') {
    const el = document.getElementById('product-msg');
    if (!el) return;
    el.innerHTML = `<span class="text-${tipo}">${texto}</span>`;
    setTimeout(() => { el.innerHTML = ''; }, 3000);
}

function addProduct() {
    const nombre          = document.getElementById('p-name').value.trim();
    const codigoBarras    = document.getElementById('p-barcode').value.trim();
    const categoria       = document.getElementById('p-category').value.trim();
    const marca           = document.getElementById('p-brand').value.trim();
    const precio          = document.getElementById('p-price').value;
    const stock           = document.getElementById('p-stock').value;
    const fechaExpiracion = document.getElementById('p-expiry').value;
    const sucursalId      = document.getElementById('p-branch').value;

    if (!nombre || !codigoBarras || !sucursalId) {
        mostrarMensaje('Nombre, código de barra y sucursal son obligatorios.', 'danger');
        return;
    }

    const p = new Producto(nombre, codigoBarras, categoria, fechaExpiracion, marca, precio, stock);
    p.sucursalId = sucursalId;
    p.estado = parseInt(stock) <= 0 ? 'Agotado' : 'Disponible';

    if (!catalogo.agregarProducto(p)) {
        mostrarMensaje(`Código duplicado: "${codigoBarras}" ya existe.`, 'danger');
        return;
    }

    mostrarMensaje(`"${nombre}" agregado correctamente.`);
    actualizarFiltrosCategorias();
    filterProducts();

    ['p-name','p-barcode','p-category','p-brand','p-price','p-stock','p-expiry'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('p-branch').value = '';
}

function undoProduct() {
    const op = catalogo.deshacer();
    if (!op) {
        mostrarMensaje('No hay operaciones para deshacer.', 'warning');
        return;
    }
    const accion = op.accion === 'agregar' ? 'Agregado revertido' : 'Eliminación revertida';
    mostrarMensaje(`${accion}: "${op.producto.nombre}".`);
    actualizarFiltrosCategorias();
    filterProducts();
}

function eliminarProducto(codigoBarras) {
    if (!catalogo.removerProducto(codigoBarras)) {
        mostrarMensaje('No se pudo eliminar el producto.', 'danger');
        return;
    }
    mostrarMensaje('Producto eliminado.');
    actualizarFiltrosCategorias();
    filterProducts();
}

function filterProducts() {
    const texto    = (document.getElementById('filter-search')?.value || '').toLowerCase();
    const cat      = document.getElementById('filter-category')?.value || '';
    const sucursal = document.getElementById('filter-branch')?.value || '';
    const estado   = document.getElementById('filter-status')?.value || '';
    const sortBy   = document.getElementById('sort-by')?.value || 'name';

    let lista = sortBy === 'name'
        ? catalogo.listaPorNombres()
        : catalogo.listarTodos();

    if (texto) {
        lista = lista.filter(p =>
            p.nombre.toLowerCase().includes(texto) ||
            p.codigoBarras.toLowerCase().includes(texto)
        );
    }
    if (cat)      lista = lista.filter(p => p.categoria === cat);
    if (sucursal) lista = lista.filter(p => p.sucursalId === sucursal);
    if (estado)   lista = lista.filter(p => p.estado === estado);

    if (sortBy === 'price')  lista.sort((a, b) => a.precio - b.precio);
    if (sortBy === 'stock')  lista.sort((a, b) => a.stock - b.stock);
    if (sortBy === 'expiry') lista.sort((a, b) => (a.fechaExpiracion || '').localeCompare(b.fechaExpiracion || ''));

    renderTabla(lista);
}

function actualizarReloj() {
    const el = document.getElementById('topbar-clock');
    if (el) el.textContent = new Date().toLocaleTimeString('es-GT');
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarSucursales();
    filterProducts();
    actualizarReloj();
    setInterval(actualizarReloj, 1000);
});
