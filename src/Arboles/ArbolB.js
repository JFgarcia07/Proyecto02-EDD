class ArbolB {

    constructor(grado) {
        this.raiz = null;
        this.grado = grado;
        this.size = 0;
    }

    _encontrarClave(nodo, fecha){
        let indice = 0;
        while (indice < nodo.numClaves && nodo.claves[indice].fechaExpiracion < fecha){
            indice++;
        }
        return indice;
    }

    _buscarPriv(nodo, fecha){
        const i = this._encontrarClave(nodo, fecha);

        if(i < nodo.numClaves && nodo.claves[i].fechaExpiracion === fecha){
            return nodo.claves[i];
        }

        if(nodo.esHoja) return null;

        return this._buscarPriv(nodo.hijos[i], fecha);
    }

    buscar(fecha) {
        if (this.raiz === null) return null;
        return this._buscarPriv(this.raiz, fecha);
    }

    _rangoBusquedaPriv(nodo, fechaInicio, fechaFinal, resultado) {
        let i = 0;
        for (i = 0; i < nodo.numClaves; i++) {

            if (!nodo.esHoja && nodo.claves[i].fechaExpiracion >= fechaInicio) {
                this._rangoBusquedaPriv(nodo.hijos[i], fechaInicio, fechaFinal, resultado);
            }

            if (nodo.claves[i].fechaExpiracion >= fechaInicio &&
                nodo.claves[i].fechaExpiracion <= fechaFinal) {
                resultado.push(nodo.claves[i]);
            }

            if (nodo.claves[i].fechaExpiracion > fechaFinal) return;
        }

        if (!nodo.esHoja) {
            this._rangoBusquedaPriv(nodo.hijos[nodo.numClaves], fechaInicio, fechaFinal, resultado);
        }
    }

    rangoBusqueda(fechaInicio, fechaFinal) {
        const resultado = [];
        if (this.raiz === null) return resultado;
        this._rangoBusquedaPriv(this.raiz, fechaInicio, fechaFinal, resultado);
        return resultado;
    }

    _insertarNoCompleto(nodo, producto) {
        let i = nodo.numClaves - 1;

        if (nodo.esHoja) {
            // Desplazar claves para hacer espacio
            while (i >= 0 && nodo.claves[i].fechaExpiracion > producto.fechaExpiracion) {
                nodo.claves[i + 1] = nodo.claves[i];
                i--;
            }
            nodo.claves[i + 1] = producto;
            nodo.numClaves++;
        } else {
            // Encontrar el hijo donde debe ir
            while (i >= 0 && nodo.claves[i].fechaExpiracion > producto.fechaExpiracion) {
                i--;
            }
            i++;

            // Si el hijo está lleno, dividirlo
            if (nodo.hijos[i].numClaves === 2 * this.grado - 1) {
                this._separarHijos(nodo, i, nodo.hijos[i]);
                if (nodo.claves[i].fechaExpiracion < producto.fechaExpiracion) {
                    i++;
                }
            }
            this._insertarNoCompleto(nodo.hijos[i], producto);
        }
    }

    _separarHijos(padre, i, hijo) {
        const nuevoNodo = new BNodo(hijo.grado, hijo.esHoja);
        nuevoNodo.numClaves = this.grado - 1;

        // Copiar las últimas t-1 claves del hijo al nuevo nodo
        for (let j = 0; j < this.grado - 1; j++) {
            nuevoNodo.claves[j] = hijo.claves[j + this.grado];
        }

        // Copiar los últimos hijos si no es hoja
        if (!hijo.esHoja) {
            for (let j = 0; j < this.grado; j++) {
                nuevoNodo.hijos[j] = hijo.hijos[j + this.grado];
            }
        }

        hijo.numClaves = this.grado - 1;

        // Hacer espacio para el nuevo hijo en el padre
        for (let j = padre.numClaves; j >= i + 1; j--) {
            padre.hijos[j + 1] = padre.hijos[j];
        }
        padre.hijos[i + 1] = nuevoNodo;

        // Hacer espacio para la nueva clave en el padre
        for (let j = padre.numClaves - 1; j >= i; j--) {
            padre.claves[j + 1] = padre.claves[j];
        }

        // La clave del medio del hijo sube al padre
        padre.claves[i] = hijo.claves[this.grado - 1];
        padre.numClaves++;
    }

    insertar(producto) {
        if (this.raiz === null) {
            // Árbol vacío, crear raíz
            this.raiz = new BNodo(this.grado, true);
            this.raiz.claves[0] = producto;
            this.raiz.numClaves = 1;
        } else if (this.raiz.numClaves === 2 * this.grado - 1) {
            // Raíz llena, crear nueva y dividir
            const nuevaRaiz = new BNodo(this.grado, false);
            nuevaRaiz.hijos[0] = this.raiz;
            this._separarHijos(nuevaRaiz, 0, this.raiz);

            let i = 0;
            if (nuevaRaiz.claves[0].fechaExpiracion < producto.fechaExpiracion) {
                i++;
            }
            this._insertarNoCompleto(nuevaRaiz.hijos[i], producto);
            this.raiz = nuevaRaiz;
        } else {
            this._insertarNoCompleto(this.raiz, producto);
        }

        this.size++;
        return true;
    }

    _removerDeHoja(nodo, indice) {
        for (let i = indice + 1; i < nodo.numClaves; i++) {
            nodo.claves[i - 1] = nodo.claves[i];
        }
        nodo.numClaves--;
    }

    _getPredecesor(nodo, indice) {
        let actual = nodo.hijos[indice];
        while (!actual.esHoja) {
            actual = actual.hijos[actual.numClaves];
        }
        return actual.claves[actual.numClaves - 1];
    }

    _getSucesor(nodo, indice) {
        let actual = nodo.hijos[indice + 1];
        while (!actual.esHoja) {
            actual = actual.hijos[0];
        }
        return actual.claves[0];
    }

    _removerDeInterno(nodo, indice) {
        const fecha = nodo.claves[indice].fechaExpiracion;

        if (nodo.hijos[indice].numClaves >= this.grado) {
            const pred = this._getPredecesor(nodo, indice);
            nodo.claves[indice] = pred;
            this._removerDelNodo(nodo.hijos[indice], pred.fechaExpiracion);
        }
        
        else if (nodo.hijos[indice + 1].numClaves >= this.grado) {
            const suce = this._getSucesor(nodo, indice);
            nodo.claves[indice] = suce;
            this._removerDelNodo(nodo.hijos[indice + 1], suce.fechaExpiracion);
        }
        
        else {
            this._merge(nodo, indice);
            this._removerDelNodo(nodo.hijos[indice], fecha);
        }
    }

    _prestarPrevio(nodo, indice) {
        const hijo    = nodo.hijos[indice];
        const hermano = nodo.hijos[indice - 1];

        // Desplazar claves del hijo a la derecha
        for (let i = hijo.numClaves - 1; i >= 0; i--) {
            hijo.claves[i + 1] = hijo.claves[i];
        }

        if (!hijo.esHoja) {
            for (let i = hijo.numClaves; i >= 0; i--) {
                hijo.hijos[i + 1] = hijo.hijos[i];
            }
        }

        // Clave del padre baja al hijo
        hijo.claves[0] = nodo.claves[indice - 1];

        // Último hijo del hermano pasa al hijo
        if (!hijo.esHoja) {
            hijo.hijos[0] = hermano.hijos[hermano.numClaves];
        }

        // Última clave del hermano sube al padre
        nodo.claves[indice - 1] = hermano.claves[hermano.numClaves - 1];

        hijo.numClaves++;
        hermano.numClaves--;
    }

    _prestarSiguiente(nodo, indice) {
        const hijo    = nodo.hijos[indice];
        const hermano = nodo.hijos[indice + 1];

        // Clave del padre baja al final del hijo
        hijo.claves[hijo.numClaves] = nodo.claves[indice];

        if (!hijo.esHoja) {
            hijo.hijos[hijo.numClaves + 1] = hermano.hijos[0];
        }

        nodo.claves[indice] = hermano.claves[0];

        // Desplazar claves e hijos del hermano a la izq
        for (let i = 1; i < hermano.numClaves; i++) {
            hermano.claves[i - 1] = hermano.claves[i];
        }
        if (!hermano.esHoja) {
            for (let i = 1; i <= hermano.numClaves; i++) {
                hermano.hijos[i - 1] = hermano.hijos[i];
            }
        }

        hijo.numClaves++;
        hermano.numClaves--;
    }

    _merge(nodo, indice) {
        const hijo    = nodo.hijos[indice];
        const hermano = nodo.hijos[indice + 1];

        // Clave del padre baja al hijo
        hijo.claves[this.grado - 1] = nodo.claves[indice];

        // Copiar claves del hermano al hijo
        for (let i = 0; i < hermano.numClaves; i++) {
            hijo.claves[i + this.grado] = hermano.claves[i];
        }

        // Copiar hijos del hermano al hijo
        if (!hijo.esHoja) {
            for (let i = 0; i <= hermano.numClaves; i++) {
                hijo.hijos[i + this.grado] = hermano.hijos[i];
            }
        }

        // Desplazar claves del padre a la izq
        for (let i = indice + 1; i < nodo.numClaves; i++) {
            nodo.claves[i - 1] = nodo.claves[i];
        }

        // Desplazar hijos del padre a la izq
        for (let i = indice + 2; i <= nodo.numClaves; i++) {
            nodo.hijos[i - 1] = nodo.hijos[i];
        }

        hijo.numClaves += hermano.numClaves + 1;
        nodo.numClaves--;
    }

    _llenar(nodo, indice) {
        if (indice !== 0 && nodo.hijos[indice - 1].numClaves >= this.grado) {
            this._prestarPrevio(nodo, indice);
        } else if (indice !== nodo.numClaves && nodo.hijos[indice + 1].numClaves >= this.grado) {
            this._prestarSiguiente(nodo, indice);
        } else {
            if (indice !== nodo.numClaves) {
                this._merge(nodo, indice);
            } else {
                this._merge(nodo, indice - 1);
            }
        }
    }

    _removerDelNodo(nodo, fecha) {
        const indice = this._encontrarClave(nodo, fecha);

        if (indice < nodo.numClaves && nodo.claves[indice].fechaExpiracion === fecha) {
            if (nodo.esHoja) {
                this._removerDeHoja(nodo, indice);
            } else {
                this._removerDeInterno(nodo, indice);
            }
        } else {
            if (nodo.esHoja) return;

            const ultimoHijo = (indice === nodo.numClaves);

            if (nodo.hijos[indice].numClaves < this.grado) {
                this._llenar(nodo, indice);
            }

            if (ultimoHijo && indice > nodo.numClaves) {
                this._removerDelNodo(nodo.hijos[indice - 1], fecha);
            } else {
                this._removerDelNodo(nodo.hijos[indice], fecha);
            }
        }
    }

    remover(fecha) {
        if (this.raiz === null) return false;
        if (this.buscar(fecha) === null) return false;

        this._removerDelNodo(this.raiz, fecha);

        // Si la raíz quedó vacía
        if (this.raiz.numClaves === 0) {
            this.raiz = this.raiz.esHoja ? null : this.raiz.hijos[0];
        }

        this.size--;
        return true;
    }

    _generarDotHelper(nodo, lineas, contador) {
        const idActual = contador.id++;

        let label = '';
        for (let i = 0; i < nodo.numClaves; i++) {
            if (i > 0) label += ' | ';
            label += `<f${i}> ${nodo.claves[i].fechaExpiracion}`;
        }
        lineas.push(`    node${idActual} [label="${label}"];`);

        if (!nodo.esHoja) {
            for (let i = 0; i <= nodo.numClaves; i++) {
                const childId = contador.id;
                this._generarDotHelper(nodo.hijos[i], lineas, contador);
                lineas.push(`    node${idActual} -> node${childId};`);
            }
        }
    }

    generarDot() {
        const lineas = [];
        lineas.push('digraph BTree {');
        lineas.push('    node [shape=record, style=filled, fillcolor="#E1F5EE"];');
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