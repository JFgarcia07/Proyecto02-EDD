class Rama {
    constructor(id, nombre, ubicacion, tiempoIngreso, tiempoPreparacion, intervaloDespacho){
        this.id = id;
        this.nombre              = nombre;
        this.ubicacion           = ubicacion;
        this.tiempoIngreso       = parseInt(tiempoIngreso);
        this.tiempoPreparacion   = parseInt(tiempoPreparacion);
        this.intervaloDespacho   = parseInt(intervaloDespacho);
        
        this.colaIngreso    = new Queue();
        this.colaTraspaso   = new Queue();
        this.colaSalida     = new Queue();

        this.catalogo       = new Catalogo();
    }

    agregarProducto(producto){
        return this.catalogo.agregarProducto(producto);
    }

    removerProducto(codigoBarras) {
        return this.catalogo.removerProducto(codigoBarras);
    }

    recibirProducto(producto) {
        producto.estado   = 'Disponible';
        producto.sucursalId = this.id;
        this.colaIngreso.enqueue(producto);
        return this.catalogo.agregarProducto(producto);
    }

    prepararEnvio(producto) {
        producto.estado = 'En tránsito';
        this.colaTraspaso.enqueue(producto);
    }

    despacharProducto() {
        if (this.colaSalida.estaVacia()) return null;
        return this.colaSalida.dequeue();
    }

    pasarTraspasoASalida() {
        if (this.colaTraspaso.estaVacia()) return false;
        const producto = this.colaTraspaso.dequeue();
        this.colaSalida.enqueue(producto);
        return true;
    }

    getEstadoColas() {
        return {
            ingreso:  this.colaIngreso.toArray(),
            traspaso: this.colaTraspaso.toArray(),
            salida:   this.colaSalida.toArray()
        };
    }

    static fromForm() {
        const id       = document.getElementById('b-id').value.trim();
        const nombre   = document.getElementById('b-name').value.trim();
        const ubicacion = document.getElementById('b-location').value.trim();
        const ti       = document.getElementById('b-entry').value.trim();
        const tp       = document.getElementById('b-transfer').value.trim();
        const td       = document.getElementById('b-dispatch').value.trim();

        if (!id || !nombre || !ubicacion || !ti || !tp || !td) return null;

        return new Branch(id, nombre, ubicacion, ti, tp, td);
    }

    static fromCSV(linea) {
        const cols = linea.split(',').map(c => c.trim().replace(/"/g, ''));
        if (cols.length < 6) return null;
        const [id, nombre, ubicacion, ti, tp, td] = cols;
        return new Branch(id, nombre, ubicacion, ti, tp, td);
    }

    toJSON() {
        return {
            id:                this.id,
            nombre:            this.nombre,
            ubicacion:         this.ubicacion,
            tiempoIngreso:     this.tiempoIngreso,
            tiempoPreparacion: this.tiempoPreparacion,
            intervaloDespacho: this.intervaloDespacho
        };
    }
}