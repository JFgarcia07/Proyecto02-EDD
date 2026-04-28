class Catalogo {

    constructor(){
        this.listaProductos = new ListaProductos();
        this.listaProductosOrdenada = new ListaProductosOrdenada();
        this.arbolAVL = new ArbolAVL();
        this.tablaHash             = new TablaHash(1009);
        this.arbolB                = new ArbolB(3);
        this.arbolBMas             = new ArbolBMas(3);
        this.totalProductos        = 0;

        this.pilaDeshacer = new Stack();
    }

    agregarProducto(producto) {
        if (this.tablaHash.buscar(producto.codigoBarras) !== null) return false;

        if (!this.listaProductos.insertar(producto)) return false;

        if (!this.listaProductosOrdenada.insertar(producto)) {
            this.listaProductos.remover(producto.codigoBarras);
            return false;
        }

        if (!this.arbolAVL.insertar(producto)) {
            this.listaProductos.remover(producto.codigoBarras);
            this.listaProductosOrdenada.remover(producto.codigoBarras);
            return false;
        }

        if (!this.tablaHash.insertar(producto)) {
            this.listaProductos.remover(producto.codigoBarras);
            this.listaProductosOrdenada.remover(producto.codigoBarras);
            this.arbolAVL.remover(producto.nombre, producto.codigoBarras);
            return false;
        }

        if (!this.arbolB.insertar(producto)) {
            this.listaProductos.remover(producto.codigoBarras);
            this.listaProductosOrdenada.remover(producto.codigoBarras);
            this.arbolAVL.remover(producto.nombre, producto.codigoBarras);
            this.tablaHash.remover(producto.codigoBarras);
            return false;
        }

        this.arbolBMas.insertar(producto);
        this.pilaDeshacer.push({ accion: 'agregar', producto });
        this.totalProductos++;
        return true;
    }

    removerProducto(codigoBarras) {
        const producto = this.tablaHash.buscar(codigoBarras);
        if (producto === null) return false;

        this.pilaDeshacer.push({ accion: 'remover', producto: { ...producto } });

        this.listaProductos.remover(producto.codigoBarras);
        this.listaProductosOrdenada.remover(producto.codigoBarras);
        this.arbolAVL.remover(producto.nombre, producto.codigoBarras);
        this.tablaHash.remover(producto.codigoBarras);
        this.arbolB.remover(producto.fechaExpiracion);
        this.arbolBMas.remover(producto.categoria, producto.codigoBarras);

        this.totalProductos--;
        return true;
    }

    deshacer() {
        if (this.pilaDeshacer.estaVacia()) return null;

        const operacion = this.pilaDeshacer.pop();

        if (operacion.accion === 'agregar') {
            this.listaProductos.remover(operacion.producto.codigoBarras);
            this.listaProductosOrdenada.remover(operacion.producto.codigoBarras);
            this.arbolAVL.remover(operacion.producto.nombre, operacion.producto.codigoBarras);
            this.tablaHash.remover(operacion.producto.codigoBarras);
            this.arbolB.remover(operacion.producto.fechaExpiracion);
            this.arbolBMas.remover(operacion.producto.categoria, operacion.producto.codigoBarras);
            this.totalProductos--;
        } else if (operacion.accion === 'remover') {
            this.agregarProducto(operacion.producto);
        }

        return operacion;
    }

    buscarPorNombre(nombre) {
        return this.arbolAVL.buscar(nombre);
    }

    buscarPorCodigoBarras(codigoBarras) {
        return this.tablaHash.buscar(codigoBarras);
    }

    buscarPorCategoria(categoria) {
        return this.arbolBMas.buscarPorCategoria(categoria);
    }

    buscarPorFechas(fechaInicio, fechaFin) {
        return this.arbolB.rangoBusqueda(fechaInicio, fechaFin);
    }

    listaPorNombres() {
        return this.arbolAVL.inOrden();
    }

    listarTodos() {
        return this.listaProductos.toArray();
    }

    generarArchivosDot() {
        return {
            avl:   this.arbolAVL.generarDot(),
            b:     this.arbolB.generarDot(),
            bMas:  this.arbolBMas.generarDot()
        };
    }

    // Descarga un string DOT como archivo .dot
    descargarDot(contenido, nombreArchivo) {
        const blob = new Blob([contenido], { type: 'text/plain' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = nombreArchivo;
        a.click();
        URL.revokeObjectURL(url);
    }

    getTablaHash()  { return this.tablaHash; }
    getTotal()      { return this.totalProductos; }
    estaVacio()     { return this.totalProductos === 0; }
    getPilaDeshacer() { return this.pilaDeshacer; }
}