class LectorCSV {

    constructor(){
        this.errores = [];
        this.cargados = 0;
        this.duplicados = 0;
        this.totalLineas = 0;
    }

    _quitarComillas(entrada){
        let resultado = entrada.trim();
        if(resultado.startsWith('"') && resultado.endsWith('"')){
            resultado = resultado.slice(1,-1);
        }
        return resultado;
    }

    _parsearLinea(linea) {
        const campos   = [];
        let actual     = '';
        let conComillas = false;

        for (let i = 0; i < linea.length; i++) {
            const c = linea[i];
            if (c === '"') {
                conComillas = !conComillas;
                actual += c;
            } else if (c === ',' && !conComillas) {
                campos.push(actual);
                actual = '';
            } else {
                actual += c;
            }
        }
        campos.push(actual); // último campo

        if (campos.length !== 7) return null;

        const nombre          = this._quitarComillas(campos[0]);
        const codigoBarras    = this._quitarComillas(campos[1]);
        const categoria       = this._quitarComillas(campos[2]);
        const fechaExpiracion = this._quitarComillas(campos[3]);
        const marca           = this._quitarComillas(campos[4]);
        const precioStr       = this._quitarComillas(campos[5]);
        const stockStr        = this._quitarComillas(campos[6]);

        const precio = parseFloat(precioStr);
        const stock  = parseInt(stockStr);

        if (isNaN(precio) || isNaN(stock)) return null;

        const producto = new Producto(nombre, codigoBarras, categoria, fechaExpiracion, marca, precio, stock);
        return producto;
    }

    _validar(producto, numLinea) {
        if (!producto.nombre) {
            return `Línea ${numLinea}: nombre vacío`;
        }
        if (!producto.codigoBarras) {
            return `Línea ${numLinea}: código de barras vacío`;
        }
        if (!producto.categoria) {
            return `Línea ${numLinea}: categoría vacía`;
        }
        if (!producto.fechaExpiracion || producto.fechaExpiracion.length !== 10) {
            return `Línea ${numLinea}: fecha inválida '${producto.fechaExpiracion}'`;
        }
        if (producto.precio < 0) {
            return `Línea ${numLinea}: precio negativo`;
        }
        if (producto.stock < 0) {
            return `Línea ${numLinea}: stock negativo`;
        }
        return null; 
    }

    cargar(file, catalogo) {
        return new Promise((resolve, reject) => {

            this.errores     = [];
            this.cargados    = 0;
            this.duplicados  = 0;
            this.totalLineas = 0;

            const reader = new FileReader();

            reader.onload = (e) => {
                const contenido = e.target.result;
                
                // Separar líneas y limpiar \r
                const lineas = contenido
                    .split('\n')
                    .map(l => l.replace(/\r$/, ''));

                // Saltar la primera línea (cabecera)
                let lineaNum = 0;
                for (let i = 1; i < lineas.length; i++) {
                    lineaNum = i + 1;
                    const linea = lineas[i].trim();

                    if (!linea) continue;

                    this.totalLineas++;

                    const producto = this._parsearLinea(linea);
                    if (!producto) {
                        this.errores.push(`Línea ${lineaNum}: formato malformado — ${linea}`);
                        continue;
                    }

                    const errorMsg = this._validar(producto, lineaNum);
                    if (errorMsg) {
                        this.errores.push(errorMsg);
                        continue;
                    }

                    const insertado = catalogo.agregarProducto(producto);
                    if (insertado) {
                        this.cargados++;
                    } else {
                        this.duplicados++;
                        this.errores.push(
                            `Línea ${lineaNum}: código duplicado '${producto.codigoBarras}'`
                        );
                    }
                }

                resolve(this.getResumen());
            };

            reader.onerror = () => reject('Error al leer el archivo'); 
            reader.readAsText(file);
        });
    }

    getResumen() {
        return {
            totalLineas: this.totalLineas,
            cargados:    this.cargados,
            duplicados:  this.duplicados,
            errores:     this.errores.length,
            detalleErrores: this.errores
        };
    }
}