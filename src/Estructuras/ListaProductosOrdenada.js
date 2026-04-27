class ListaProductosOrdenada {

    constructor() {
        this.cabeza = null; // Nodo*
        this.size   = 0;
    }

    insertar(producto) {
        const nuevo = new Nodo(producto);

        if (this.cabeza === null || producto.nombre < this.cabeza.data.nombre) {
            nuevo.siguiente = this.cabeza;
            this.cabeza = nuevo;
            this.size++;
            return true;
        }

        let actual = this.cabeza;
        while (actual.siguiente !== null && actual.siguiente.data.nombre < producto.nombre) {
            actual = actual.siguiente;
        }
        nuevo.siguiente = actual.siguiente;
        actual.siguiente = nuevo;
        this.size++;
        return true;
    }

    buscarPorNombre(nombre) {
        let actual = this.cabeza;
        while (actual !== null) {
            if (actual.data.nombre === nombre) return actual.data;
            if (actual.data.nombre > nombre)  return null; // ya no puede estar
            actual = actual.siguiente;
        }
        return null;
    }

    buscarPorCodigo(codigoBarra) {
        let actual = this.cabeza;
        while (actual !== null) {
            if (actual.data.codigoBarras === codigoBarra) return actual.data;
            actual = actual.siguiente;
        }
        return null;
    }

    remover(codigoBarra) {
        if (this.cabeza === null) return false;

        // Caso: es el primero
        if (this.cabeza.data.codigoBarras === codigoBarra) {
            this.cabeza = this.cabeza.siguiente;
            this.size--;
            return true;
        }

        // Caso: está en el resto
        let actual = this.cabeza;
        while (actual.siguiente !== null) {
            if (actual.siguiente.data.codigoBarras === codigoBarra) {
                actual.siguiente = actual.siguiente.siguiente;
                this.size--;
                return true;
            }
            actual = actual.siguiente;
        }
        return false;
    }

    toArray() {
        const resultado = [];
        let actual = this.cabeza;
        while (actual !== null) {
            resultado.push(actual.data);
            actual = actual.siguiente;
        }
        return resultado;
    }

    getSize()   { return this.size; }
    estaVacia() { return this.cabeza === null; }
    getCabeza() { return this.cabeza; }

    limpiar() {
        this.cabeza = null;
        this.size   = 0;
    }
}