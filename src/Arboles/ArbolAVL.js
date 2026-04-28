class ArbolAVL {

    constructor() {
        this.raiz = null; 
        this.size = 0;
    }

    _getAltura(nodo){
        if (nodo == null)  return 0;
        return nodo.altura;
    }

    _getBalance(nodo){
        if (nodo == null) return 0;
        return this._getAltura(nodo.izquierda) - this._getAltura(nodo.derecha);
    }

    _max(a, b){
        return a > b ? a : b;
    }

    _rotacionIzquierda(x) {
        const y = x.derecha;
        const T2 = y.izquierda;

        y.izquierda = x;
        x.derecha = T2;

        x.altura = this._max(this._getAltura(x.izquierda), this._getAltura(x.derecha)) + 1;
        y.altura = this._max(this._getAltura(y.izquierda), this._getAltura(y.derecha)) + 1;

        return y;
    }

    _rotacionDerecha(y) {
        const x  = y.izquierda;
        const T2 = x.derecha;

        x.derecha    = y;
        y.izquierda  = T2;

        y.altura = this._max(this._getAltura(y.izquierda), this._getAltura(y.derecha)) + 1;
        x.altura = this._max(this._getAltura(x.izquierda), this._getAltura(x.derecha)) + 1;

        return x;
    }

    _insertarPriv(nodo, producto, resultado) {
        if (nodo === null) {
            resultado.aprobado = true;
            return new AVLNodo(producto);
        }

        if (producto.nombre < nodo.data.nombre) {
            nodo.izquierda = this._insertarPriv(nodo.izquierda, producto, resultado);
        } else if (producto.nombre > nodo.data.nombre) {
            nodo.derecha = this._insertarPriv(nodo.derecha, producto, resultado);
        } else {
            // Mismo nombre: usar codigoBarras como desempate
            if (producto.codigoBarras < nodo.data.codigoBarras) {
                nodo.izquierda = this._insertarPriv(nodo.izquierda, producto, resultado);
            } else if (producto.codigoBarras > nodo.data.codigoBarras) {
                nodo.derecha = this._insertarPriv(nodo.derecha, producto, resultado);
            } else {
                resultado.aprobado = false;
                return nodo;
            }
        }

        // Actualizar altura
        nodo.altura = this._max(this._getAltura(nodo.izquierda), this._getAltura(nodo.derecha)) + 1;

        // Factor de balance
        const balance = this._getBalance(nodo);

        // Caso LL
        if (balance > 1 && producto.nombre < nodo.izquierda.data.nombre)
            return this._rotacionDerecha(nodo);

        // Caso RR
        if (balance < -1 && producto.nombre > nodo.derecha.data.nombre)
            return this._rotacionIzquierda(nodo);

        // Caso RL
        if (balance < -1 && producto.nombre < nodo.derecha.data.nombre) {
            nodo.derecha = this._rotacionDerecha(nodo.derecha);
            return this._rotacionIzquierda(nodo);
        }

        // Caso LR
        if (balance > 1 && producto.nombre > nodo.izquierda.data.nombre) {
            nodo.izquierda = this._rotacionIzquierda(nodo.izquierda);
            return this._rotacionDerecha(nodo);
        }

        return nodo;
    }

    insertar(producto) {
        // Usamos objeto para simular el bool& por referencia de C++
        const resultado = { aprobado: false };
        this.raiz = this._insertarPriv(this.raiz, producto, resultado);
        if (resultado.aprobado) this.size++;
        return resultado.aprobado;
    }

    _buscarPriv(nodo, nombre) {
        if (nodo === null) return null;

        if (nombre === nodo.data.nombre) return nodo.data;
        if (nombre  <  nodo.data.nombre) return this._buscarPriv(nodo.izquierda, nombre);
        return this._buscarPriv(nodo.derecha, nombre);
    }

    buscar(nombre) {
        return this._buscarPriv(this.raiz, nombre);
    }

    _getNodoMinimoPriv(nodo) {
        let actual = nodo;
        while (actual.izquierda !== null) {
            actual = actual.izquierda;
        }
        return actual;
    }

    _removerPriv(nodo, nombre, codigoBarras, resultado) {
        if (nodo === null) {
            resultado.aprobado = false;
            return null;
        }

        if (nombre < nodo.data.nombre) {
            nodo.izquierda = this._removerPriv(nodo.izquierda, nombre, codigoBarras, resultado);
        } else if (nombre > nodo.data.nombre) {
            nodo.derecha = this._removerPriv(nodo.derecha, nombre, codigoBarras, resultado);
        } else if (codigoBarras < nodo.data.codigoBarras) {
            nodo.izquierda = this._removerPriv(nodo.izquierda, nombre, codigoBarras, resultado);
        } else if (codigoBarras > nodo.data.codigoBarras) {
            nodo.derecha = this._removerPriv(nodo.derecha, nombre, codigoBarras, resultado);
        } else {
            resultado.aprobado = true;

            if (nodo.izquierda === null || nodo.derecha === null) {
                const temporal = nodo.izquierda ? nodo.izquierda : nodo.derecha;

                if (temporal === null) {
                    nodo = null;
                } else {
                    nodo.data      = temporal.data;
                    nodo.izquierda = temporal.izquierda;
                    nodo.derecha   = temporal.derecha;
                    nodo.altura    = temporal.altura;
                }
            } else {
                const sucesor = this._getNodoMinimoPriv(nodo.derecha);
                nodo.data = sucesor.data;
                nodo.derecha = this._removerPriv(nodo.derecha, sucesor.data.nombre, sucesor.data.codigoBarras, resultado);
                resultado.aprobado = true;
            }
        }

        if (nodo === null) return null;

        // Actualizar altura
        nodo.altura = this._max(this._getAltura(nodo.izquierda), this._getAltura(nodo.derecha)) + 1;

        const balance = this._getBalance(nodo);

        // Caso LL
        if (balance > 1 && this._getBalance(nodo.izquierda) >= 0)
            return this._rotacionDerecha(nodo);

        // Caso LR
        if (balance > 1 && this._getBalance(nodo.izquierda) < 0) {
            nodo.izquierda = this._rotacionIzquierda(nodo.izquierda);
            return this._rotacionDerecha(nodo);
        }

        // Caso RR
        if (balance < -1 && this._getBalance(nodo.derecha) <= 0)
            return this._rotacionIzquierda(nodo);

        // Caso RL
        if (balance < -1 && this._getBalance(nodo.derecha) > 0) {
            nodo.derecha = this._rotacionDerecha(nodo.derecha);
            return this._rotacionIzquierda(nodo);
        }

        return nodo;
    }

    remover(nombre, codigoBarras) {
        const resultado = { aprobado: false };
        this.raiz = this._removerPriv(this.raiz, nombre, codigoBarras, resultado);
        if (resultado.aprobado) this.size--;
        return resultado.aprobado;
    }

    _inOrdenPriv(nodo, lista) {
        if (nodo === null) return;
        this._inOrdenPriv(nodo.izquierda, lista);
        lista.push(nodo.data);
        this._inOrdenPriv(nodo.derecha, lista);
    }

    inOrden() {
        const lista = [];
        this._inOrdenPriv(this.raiz, lista);
        return lista;
    }

    _generarDotPriv(nodo, lineas) {
        if (nodo === null) return;

        lineas.push(`    "${nodo.data.nombre}" [label="${nodo.data.nombre}\\n(h:${nodo.altura})"];`);

        if (nodo.izquierda) {
            lineas.push(`    "${nodo.data.nombre}" -> "${nodo.izquierda.data.nombre}";`);
            this._generarDotPriv(nodo.izquierda, lineas);
        }
        if (nodo.derecha) {
            lineas.push(`    "${nodo.data.nombre}" -> "${nodo.derecha.data.nombre}";`);
            this._generarDotPriv(nodo.derecha, lineas);
        }
    }

    generarDot() {
        const lineas = [];
        lineas.push('digraph ArbolAVL {');
        lineas.push('    node [shape=ellipse, style=filled, fillcolor="#D6EAF8"];');
        lineas.push('');

        if (this.raiz === null) {
            lineas.push('    empty [label="Arbol vacio"];');
        } else {
            this._generarDotPriv(this.raiz, lineas);
        }

        lineas.push('}');
        return lineas.join('\n');
    }

    getSize()    { return this.size; }
    estaVacio()  { return this.raiz === null; }
    getRaiz()    { return this.raiz; }
}