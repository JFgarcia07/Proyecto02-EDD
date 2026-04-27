class TablaHash {

    constructor(capacidad){
        this.capacidad = capacidad;
        this.size      = 0;
        this.tabla     = new Array(capacidad).fill(null);
    }

    _funcionHash(llave) {
        let hash = 0;
        for (let i = 0; i < llave.length; i++) {
            hash = (hash * 31 + llave.charCodeAt(i)) % this.capacidad;
        }
        return hash;
    }

    insertar(producto) {
        const indice = this._funcionHash(producto.codigoBarras);

        // Verificar si ya existe
        let actual = this.tabla[indice];
        while (actual !== null) {
            if (actual.producto.codigoBarras === producto.codigoBarras) {
                return false; // Duplicado
            }
            actual = actual.siguiente;
        }

        // Insertar al inicio de la cadena
        const nuevoNodo      = new NodoHash(producto);
        nuevoNodo.siguiente  = this.tabla[indice];
        this.tabla[indice]   = nuevoNodo;
        this.size++;
        return true;
    }

    buscar(codigoBarras) {
        const indice = this._funcionHash(codigoBarras);

        let actual = this.tabla[indice];
        while (actual !== null) {
            if (actual.producto.codigoBarras === codigoBarras) {
                return actual.producto;
            }
            actual = actual.siguiente;
        }
        return null;
    }

    remover(codigoBarras) {
        const indice = this._funcionHash(codigoBarras);

        if (this.tabla[indice] === null) return false;

        // Caso: el nodo a eliminar es el primero en la cadena
        if (this.tabla[indice].producto.codigoBarras === codigoBarras) {
            this.tabla[indice] = this.tabla[indice].siguiente;
            this.size--;
            return true;
        }

        // Buscar en el resto de la cadena
        let actual = this.tabla[indice];
        while (actual.siguiente !== null) {
            if (actual.siguiente.producto.codigoBarras === codigoBarras) {
                actual.siguiente = actual.siguiente.siguiente;
                this.size--;
                return true;
            }
            actual = actual.siguiente;
        }

        return false;
    }

    getEstadisticas() {
        let cubosUsados  = 0;
        let cadenaMax    = 0;
        let totalCadenas = 0;

        for (let i = 0; i < this.capacidad; i++) {
            if (this.tabla[i] !== null) {
                cubosUsados++;
                let longitud = 0;
                let actual   = this.tabla[i];
                while (actual !== null) {
                    longitud++;
                    actual = actual.siguiente;
                }
                if (longitud > cadenaMax) cadenaMax = longitud;
                totalCadenas += longitud;
            }
        }

        return {
            capacidad:       this.capacidad,
            elementos:       this.size,
            factorCarga:     this.getLoadFactor(),
            cubosUsados:     cubosUsados,
            cadenaMax:       cadenaMax,
            cadenaPromedio:  cubosUsados > 0
            ? (totalCadenas / cubosUsados).toFixed(2) : 0
        };
    }

    toArray() {
        const resultado = [];
        for (let i = 0; i < this.capacidad; i++) {
            let actual = this.tabla[i];
            while (actual !== null) {
                resultado.push(actual.producto);
                actual = actual.siguiente;
            }
        }
        return resultado;
    }

    getSize()       { return this.size; }
    getCapacidad()  { return this.capacidad; }
    getLoadFactor() { return this.size / this.capacidad; }
    estaVacia()     { return this.size === 0; }
}