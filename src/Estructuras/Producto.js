class Producto {

    constructor(
        nombre          = '',
        codigoBarras    = '',
        categoria       = '',
        fechaExpiracion = '',
        marca           = '',
        precio          = 0.0,
        stock           = 0,
    ){
        this.nombre = nombre;
        this.codigoBarras = codigoBarras;
        this.categoria = categoria;
        this.fechaExpiracion = fechaExpiracion;
        this.marca = marca;
        this.precio = parseFloat(precio);
        this.stock = parseInt(stock);
        this.estado = 'Disponible';
        this.sucursalID = null;
    }

    equals(entrada){ return this.nombre === entrada.nombre; } 
    menorA(entrada){ return this.nombre < entrada.nombre; }
    mayorA(entrada){ return this.nombre > entrada.nombre; }

    estaAgotado() {
        return this.stock <= 0;
    }

    toJSON() {
        return {
            nombre:          this.nombre,
            codigoBarras:    this.codigoBarras,
            categoria:       this.categoria,
            fechaExpiracion: this.fechaExpiracion,
            marca:           this.marca,
            precio:          this.precio,
            stock:           this.stock,
            estado:          this.estado,
            sucursalId:      this.sucursalId
        };
    }

    static fromCSV(linea) {
        const cols = linea.split(',').map(c => c.trim().replace(/"/g, ''));
        if (cols.length < 8) return null;
        const [sucursalId, nombre, codigoBarras, categoria,
            fechaExpiracion, marca, precio, stock] = cols;
        const p = new Producto(nombre, codigoBarras, categoria, fechaExpiracion, marca, precio, stock);
        p.sucursalId = sucursalId;
        return p;
    }

    static fromForm() {
        const nombre          = document.getElementById('p-name').value.trim();
        const codigoBarras    = document.getElementById('p-barcode').value.trim();
        const categoria       = document.getElementById('p-category').value.trim();
        const marca           = document.getElementById('p-brand').value.trim();
        const precio          = document.getElementById('p-price').value;
        const stock           = document.getElementById('p-stock').value;
        const fechaExpiracion = document.getElementById('p-expiry').value;
        const sucursalId      = document.getElementById('p-branch').value;

        if (!nombre || !codigoBarras || !sucursalId) return null;

        const p = new Producto(nombre, codigoBarras, categoria, fechaExpiracion, marca, precio, stock);
        p.sucursalId = sucursalId;
        return p;
    }
}