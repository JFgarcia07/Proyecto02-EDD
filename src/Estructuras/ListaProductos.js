class ListaProductos {

    constructor(){
        this.cabeza = null;
        this.size = 0;
    }

    insertar(producto){
        const nuevo = new Nodo(producto);
        nuevo.siguiente = this.cabeza;
        this.cabeza = nuevo;
        this.size++;
        return true;
    }

    obtenerPorNombre(nombre){
        let actual = this.cabeza;
        while (actual !== null){
            if(actual.data.nombre === nombre){
                return actual.data;
            }
            actual = actual.siguiente;
        }
        return null;
    }

    obtenerPorBarra(codigoBarra) {
        let actual = this.cabeza;
        while (actual !== null) {
            if (actual.data.codigoBarras === codigoBarra) {
                return actual.data;
            }
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

        // Caso: está en el resto de la lista
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

    /**METODOS PARA EL FRONEND */
    toArray() {
        const resultado = [];
        let actual = this.cabeza;
        while (actual !== null) {
            resultado.push(actual.data);
            actual = actual.siguiente;
        }
        return resultado;
    }

    /**GETTERS */
    getSize()   { return this.size; }
    estaVacia() { return this.cabeza === null; }
    getCabeza() { return this.cabeza; }


    limpiar() {
        this.cabeza = null;
        this.size   = 0;
    }
}