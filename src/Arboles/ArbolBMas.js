class ArbolBMas {
    
    constructor(grado){
        this.raiz = null;
        this.grado = grado;
        this.size = 0;
    }

    _encontrarClave(nodo, categoria) {
        let indice = 0;
        while (indice < nodo.numClaves && nodo.claves[indice] < categoria) {
            indice++;
        }
        return indice;
    }

    _insertarNoLlenoPriv(nodo, producto) {
        let i = nodo.numClaves - 1;

        if (nodo.esHoja) {
            // Desplazar para hacer espacio e insertar ordenadamente
            while (i >= 0 && nodo.claves[i] > producto.categoria) {
                nodo.claves[i + 1] = nodo.claves[i];
                nodo.data[i + 1]   = nodo.data[i];
                i--;
            }
            nodo.claves[i + 1] = producto.categoria;
            nodo.data[i + 1]   = producto;
            nodo.numClaves++;
        } else {
            while (i >= 0 && nodo.claves[i] > producto.categoria) {
                i--;
            }
            i++;

            if (nodo.hijo[i].numClaves === 2 * this.grado - 1) {
                this._separarHijoPriv(nodo, i, nodo.hijo[i]);
                if (nodo.claves[i] < producto.categoria) {
                    i++;
                }
            }
            this._insertarNoLlenoPriv(nodo.hijo[i], producto);
        }
    }

    _separarHijoPriv(padre, i, hijo) {
        const nuevoNodo = new BMasNodo(hijo.grado, hijo.esHoja);

        if (hijo.esHoja) {
            // Hoja: copiar mitad derecha al nuevo nodo
            nuevoNodo.numClaves = hijo.numClaves - (this.grado - 1);
            for (let j = 0; j < nuevoNodo.numClaves; j++) {
                nuevoNodo.claves[j] = hijo.claves[j + this.grado - 1];
                nuevoNodo.data[j]   = hijo.data[j + this.grado - 1];
            }
            hijo.numClaves = this.grado - 1;

            // Enlazar hojas
            nuevoNodo.siguiente = hijo.siguiente;
            hijo.siguiente      = nuevoNodo;

            // Hacer espacio en el padre y subir primera clave del nuevo nodo
            for (let j = padre.numClaves; j > i; j--) {
                padre.claves[j]     = padre.claves[j - 1];
                padre.hijo[j + 1]   = padre.hijo[j];
            }
            padre.claves[i]     = nuevoNodo.claves[0];
            padre.hijo[i + 1]   = nuevoNodo;
            padre.numClaves++;

        } else {
            // Nodo interno: la clave del medio sube
            nuevoNodo.numClaves = this.grado - 1;
            for (let j = 0; j < this.grado - 1; j++) {
                nuevoNodo.claves[j] = hijo.claves[j + this.grado];
            }
            for (let j = 0; j < this.grado; j++) {
                nuevoNodo.hijo[j] = hijo.hijo[j + this.grado];
            }
            hijo.numClaves = this.grado - 1;

            // Hacer espacio en el padre
            for (let j = padre.numClaves; j > i; j--) {
                padre.claves[j]   = padre.claves[j - 1];
                padre.hijo[j + 1] = padre.hijo[j];
            }
            padre.claves[i]   = hijo.claves[this.grado - 1];
            padre.hijo[i + 1] = nuevoNodo;
            padre.numClaves++;
        }
    }

    insertar(producto) {
        if (this.raiz === null) {
            this.raiz = new BMasNodo(this.grado, true);
            this.raiz.claves[0]    = producto.categoria;
            this.raiz.data[0]      = producto;
            this.raiz.numClaves    = 1;
            this.size++;
            return true;
        }

        if (this.raiz.numClaves === 2 * this.grado - 1) {
            const nuevaRaiz = new BMasNodo(this.grado, false);
            nuevaRaiz.hijo[0] = this.raiz;
            this._separarHijoPriv(nuevaRaiz, 0, this.raiz);

            let i = 0;
            if (nuevaRaiz.claves[0] < producto.categoria) i++;
            this._insertarNoLlenoPriv(nuevaRaiz.hijo[i], producto);
            this.raiz = nuevaRaiz;
        } else {
            this._insertarNoLlenoPriv(this.raiz, producto);
        }

        this.size++;
        return true;
    }

    buscarPorCategoria(categoria) {
        const resultado = [];
        if (this.raiz === null) return resultado;

        let actual = this.raiz;
        while (!actual.esHoja) {
            const i = this._encontrarClave(actual, categoria);
            actual = actual.hijo[i];
        }

        while (actual !== null) {
            let encontrado = false;
            for (let i = 0; i < actual.numClaves; i++) {
                if (actual.claves[i] === categoria) {
                    resultado.push(actual.data[i]);
                    encontrado = true;
                } else if (actual.claves[i] > categoria) {
                    return resultado;
                }
            }
            if (!encontrado && resultado.length > 0) break;
            actual = actual.siguiente;
        }

        return resultado;
    }

    listarCategorias() {
        const resultado = [];
        if (this.raiz === null) return resultado;

        let actual = this.raiz;
        while (!actual.esHoja) {
            actual = actual.hijo[0];
        }

        while (actual !== null) {
            for (let i = 0; i < actual.numClaves; i++) {
                resultado.push(actual.data[i]);
            }
            actual = actual.siguiente;
        }

        return resultado;
    }

    _removerDeHojaPriv(nodo, indice) {
        for (let i = indice + 1; i < nodo.numClaves; i++) {
            nodo.claves[i - 1] = nodo.claves[i];
            nodo.data[i - 1]   = nodo.data[i];
        }
        nodo.numClaves--;
    }

    _prestarPrevio(nodo, indice) {
        const hijo    = nodo.hijo[indice];
        const hermano = nodo.hijo[indice - 1];

        if (hijo.esHoja) {
            for (let i = hijo.numClaves - 1; i >= 0; i--) {
                hijo.claves[i + 1] = hijo.claves[i];
                hijo.data[i + 1]   = hijo.data[i];
            }
            hijo.claves[0]          = hermano.claves[hermano.numClaves - 1];
            hijo.data[0]            = hermano.data[hermano.numClaves - 1];
            nodo.claves[indice - 1] = hijo.claves[0];
        } else {
            for (let i = hijo.numClaves - 1; i >= 0; i--) {
                hijo.hijo[i + 1] = hijo.hijo[i];
            }
            for (let i = hijo.numClaves - 1; i >= 0; i--) {
                hijo.hijo[i + 1] = hijo.hijo[i];
            }
            hijo.claves[0]          = nodo.claves[indice - 1];
            hijo.hijo[0]            = hermano.hijo[hermano.numClaves];
            nodo.claves[indice - 1] = hermano.claves[hermano.numClaves - 1];
        }
        hijo.numClaves++;
        hermano.numClaves--;
    }

    _prestarSiguiente(nodo, indice) {
        const hijo    = nodo.hijo[indice];
        const hermano = nodo.hijo[indice + 1];

        if (hijo.esHoja) {
            hijo.claves[hijo.numClaves] = hermano.claves[0];
            hijo.data[hijo.numClaves]   = hermano.data[0];
            for (let i = 1; i < hermano.numClaves; i++) {
                hermano.claves[i - 1] = hermano.claves[i];
                hermano.data[i - 1]   = hermano.data[i];
            }
            nodo.claves[indice] = hermano.claves[0];
        } else {
            hijo.claves[hijo.numClaves]       = nodo.claves[indice];
            hijo.hijo[hijo.numClaves + 1]     = hermano.hijo[0];
            nodo.claves[indice]               = hermano.claves[0];
            for (let i = 1; i < hermano.numClaves; i++) {
                hermano.claves[i - 1] = hermano.claves[i];
            }
            for (let i = 1; i <= hermano.numClaves; i++) {
                hermano.hijo[i - 1] = hermano.hijo[i];
            }
        }
        hijo.numClaves++;
        hermano.numClaves--;
    }

    _merge(nodo, indice) {
        const hijo    = nodo.hijo[indice];
        const hermano = nodo.hijo[indice + 1];

        if (hijo.esHoja) {
            for (let i = 0; i < hermano.numClaves; i++) {
                hijo.claves[hijo.numClaves + i] = hermano.claves[i];
                hijo.data[hijo.numClaves + i]   = hermano.data[i];
            }
            hijo.numClaves   += hermano.numClaves;
            hijo.siguiente    = hermano.siguiente;
        } else {
            hijo.claves[hijo.numClaves] = nodo.claves[indice];
            hijo.numClaves++;
            for (let i = 0; i < hermano.numClaves; i++) {
                hijo.claves[hijo.numClaves + i] = hermano.claves[i];
            }
            for (let i = 1; i <= hermano.numClaves; i++) {
                hijo.hijo[hijo.numClaves + i] = hermano.hijo[i];
            }
            hijo.numClaves += hermano.numClaves;
            for (let i = 0; i <= hermano.numClaves; i++) {
                hermano.hijo[i] = null;
            }
        }

        for (let i = indice + 1; i < nodo.numClaves; i++) {
            nodo.claves[i - 1] = nodo.claves[i];
        }
        for (let i = indice + 2; i <= nodo.numClaves; i++) {
            nodo.hijo[i - 1] = nodo.hijo[i];
        }
        nodo.numClaves--;
    }

    _llenar(nodo, indice) {
        if (indice !== 0 && nodo.hijo[indice - 1].numClaves >= this.grado) {
            this._prestarPrevio(nodo, indice);
        } else if (indice !== nodo.numClaves && nodo.hijo[indice + 1].numClaves >= this.grado) {
            this._prestarSiguiente(nodo, indice);
        } else {
            if (indice !== nodo.numClaves) {
                this._merge(nodo, indice);
            } else {
                this._merge(nodo, indice - 1);
            }
        }
    }

    _removerDelNodoPriv(nodo, categoria, codigoBarras) {
        if (nodo.esHoja) {
            for (let i = 0; i < nodo.numClaves; i++) {
                if (nodo.claves[i] === categoria && nodo.data[i].codigoBarras === codigoBarras) {
                    this._removerDeHojaPriv(nodo, i);
                    return;
                }
            }
            return;
        }

        let indice = this._encontrarClave(nodo, categoria);

        if (indice < nodo.numClaves && nodo.claves[indice] === categoria) {
            if (nodo.hijo[indice].numClaves < this.grado) {
                this._llenar(nodo, indice);
            }
            indice = this._encontrarClave(nodo, categoria);
        }

        if (nodo.hijo[indice].numClaves < this.grado) {
            this._llenar(nodo, indice);
        }

        indice = this._encontrarClave(nodo, categoria);
        if (indice > nodo.numClaves) indice = nodo.numClaves;

        this._removerDelNodoPriv(nodo.hijo[indice], categoria, codigoBarras);

        if (indice > 0 && nodo.hijo[indice].esHoja && nodo.hijo[indice].numClaves > 0) {
            nodo.claves[indice - 1] = nodo.hijo[indice].claves[0];
        }
    }

    remover(categoria, codigoBarras) {
        if (this.raiz === null) return false;

        this._removerDelNodoPriv(this.raiz, categoria, codigoBarras);

        if (this.raiz.numClaves === 0) {
            this.raiz = this.raiz.esHoja ? null : this.raiz.hijo[0];
        }

        this.size--;
        return true;
    }

    _generarDotHelper(nodo, lineas, contador) {
        const idActual = contador.id++;

        let label = '';
        for (let i = 0; i < nodo.numClaves; i++) {
            if (i > 0) label += ' | ';
            if (nodo.esHoja) {
                label += `${nodo.claves[i]}: ${nodo.data[i].nombre}`;
            } else {
                label += `<f${i}> ${nodo.claves[i]}`;
            }
        }

        const color = nodo.esHoja ? '#E1F5EE' : '#EEEDFE';
        lineas.push(`    node${idActual} [label="${label}", fillcolor="${color}"];`);

        if (!nodo.esHoja) {
            for (let i = 0; i <= nodo.numClaves; i++) {
                const hijoId = contador.id;
                this._generarDotHelper(nodo.hijo[i], lineas, contador);
                lineas.push(`    node${idActual} -> node${hijoId};`);
            }
        }
    }

    generarDot() {
        const lineas = [];
        lineas.push('digraph BPlusTree {');
        lineas.push('    node [shape=record, style=filled, fillcolor="#EEEDFE"];');
        lineas.push('    rankdir=TB;');
        lineas.push('');

        if (this.raiz === null) {
            lineas.push('    empty [label="Arbol vacio"];');
        } else {
            const contador = { id: 0 };
            this._generarDotHelper(this.raiz, lineas, contador);
        }

        lineas.push('}');
        return lineas.join('\n');
    }

    getSize()   { return this.size; }
    estaVacio() { return this.raiz === null; }
}
