
function cargarCSVSucursales(input) {
    const archivo = input.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = function(e) {
        const lineas    = e.target.result.split('\n');
        const lista     = getSucursalesGuardadas();
        let   cargadas  = 0;
        let   errores   = [];

        for (let i = 1; i < lineas.length; i++) {
            const linea = lineas[i].replace(/\r$/, '').trim();
            if (!linea) continue;

            const columnas = linea.split(',');
            for (let j = 0; j < columnas.length; j++) {
                columnas[j] = columnas[j].trim().replace(/"/g, '');
            }

            if (columnas.length < 6) {
                errores.push(`Línea ${i + 1}: formato incorrecto`);
                continue;
            }

            const id        = columnas[0];
            const nombre    = columnas[1];
            const ubicacion = columnas[2];
            const tIngreso  = columnas[3];
            const tTraspaso = columnas[4];
            const tDespacho = columnas[5];

            if (!id || !nombre || !ubicacion) {
                errores.push(`Línea ${i + 1}: campos obligatorios vacíos`);
                continue;
            }

            let duplicado = false;
            for (let k = 0; k < lista.length; k++) {
                if (lista[k].id === id) { duplicado = true; break; }
            }
            if (duplicado) {
                errores.push(`Línea ${i + 1}: ID duplicado '${id}'`);
                continue;
            }

            lista.push({
                id,
                nombre,
                ubicacion,
                tiempoIngreso:     parseInt(tIngreso)  || 0,
                tiempoPreparacion: parseInt(tTraspaso) || 0,
                intervaloDespacho: parseInt(tDespacho) || 0
            });
            cargadas++;
        }

        guardarSucursales(lista);
        guardarLogErrores('errores_sucursales.txt', errores);
        mostrarLog('branch-csv-log', cargadas, errores, 0);
    };

    lector.readAsText(archivo);
}

function cargarCSVConexiones(input) {
    const archivo    = input.files[0];
    const sucursales = getSucursalesGuardadas();

    if (!archivo) return;

    if (sucursales.length === 0) {
        mostrarLog('conexion-csv-log', 0, ['Primero debes cargar las sucursales.'], 0);
        return;
    }

    const lector = new FileReader();
    lector.onload = function(e) {
        const lineas   = e.target.result.split('\n');
        const lista    = getConexionesGuardadas();
        let   cargadas = 0;
        let   errores  = [];

        for (let i = 1; i < lineas.length; i++) {
            const linea = lineas[i].replace(/\r$/, '').trim();
            if (!linea) continue;

            const columnas = linea.split(',');
            for (let j = 0; j < columnas.length; j++) {
                columnas[j] = columnas[j].trim().replace(/"/g, '');
            }

            if (columnas.length < 4) {
                errores.push(`Línea ${i + 1}: formato incorrecto`);
                continue;
            }

            const origenId  = columnas[0];
            const destinoId = columnas[1];
            const tiempo    = columnas[2];
            const costo     = columnas[3];

            let origenExiste  = false;
            let destinoExiste = false;
            for (let k = 0; k < sucursales.length; k++) {
                if (sucursales[k].id === origenId)  origenExiste  = true;
                if (sucursales[k].id === destinoId) destinoExiste = true;
            }

            if (!origenExiste) {
                errores.push(`Línea ${i + 1}: sucursal origen '${origenId}' no existe`);
                continue;
            }
            if (!destinoExiste) {
                errores.push(`Línea ${i + 1}: sucursal destino '${destinoId}' no existe`);
                continue;
            }

            let duplicado = false;
            for (let k = 0; k < lista.length; k++) {
                if (lista[k].origen === origenId && lista[k].destino === destinoId) {
                    duplicado = true;
                    break;
                }
            }
            if (duplicado) {
                errores.push(`Línea ${i + 1}: conexión duplicada`);
                continue;
            }

            lista.push({
                origen:  origenId,
                destino: destinoId,
                tiempo:  parseFloat(tiempo) || 0,
                costo:   parseFloat(costo)  || 0,
                bidi:    true
            });
            cargadas++;
        }

        guardarConexiones(lista);
        guardarLogErrores('errores_conexiones.txt', errores);
        mostrarLog('conexion-csv-log', cargadas, errores, 0);
    };

    lector.readAsText(archivo);
}

function cargarCSVProductos(input) {
    const archivo    = input.files[0];
    const sucursales = getSucursalesGuardadas();

    if (!archivo) return;

    if (sucursales.length === 0) {
        mostrarLog('product-csv-log', 0, ['Primero debes cargar las sucursales.'], 0);
        return;
    }

    const lector = new FileReader();
    lector.onload = function(e) {
        const lineas      = e.target.result.split('\n');
        const lista       = getProductosGuardados();
        let   cargados    = 0;
        let   duplicados  = 0;
        let   errores     = [];

        for (let i = 1; i < lineas.length; i++) {
            const linea = lineas[i].replace(/\r$/, '').trim();
            if (!linea) continue;

            const columnas = linea.split(',');
            for (let j = 0; j < columnas.length; j++) {
                columnas[j] = columnas[j].trim().replace(/"/g, '');
            }

            if (columnas.length < 8) {
                errores.push(`Línea ${i + 1}: formato incorrecto`);
                continue;
            }

            const sucursalId     = columnas[0];
            const nombre         = columnas[1];
            const codigoBarra    = columnas[2];
            const categoria      = columnas[3];
            const fechaCaducidad = columnas[4];
            const marca          = columnas[5];
            const precio         = columnas[6];
            const stock          = columnas[7];

            if (!nombre || !codigoBarra || !sucursalId) {
                errores.push(`Línea ${i + 1}: campos obligatorios vacíos`);
                continue;
            }

            if (codigoBarra.length !== 10) {
                errores.push(`Línea ${i + 1}: código de barras '${codigoBarra}' inválido (debe tener 10 caracteres)`);
                continue;
            }

            let sucursalExiste = false;
            for (let k = 0; k < sucursales.length; k++) {
                if (sucursales[k].id === sucursalId) { sucursalExiste = true; break; }
            }
            if (!sucursalExiste) {
                errores.push(`Línea ${i + 1}: sucursal '${sucursalId}' no existe`);
                continue;
            }

            let duplicado = false;
            for (let k = 0; k < lista.length; k++) {
                if (lista[k].codigoBarras === codigoBarra) { duplicado = true; break; }
            }
            if (duplicado) {
                duplicados++;
                errores.push(`Línea ${i + 1}: código duplicado '${codigoBarra}'`);
                continue;
            }

            if (isNaN(parseFloat(precio)) || isNaN(parseInt(stock))) {
                errores.push(`Línea ${i + 1}: precio o stock inválido`);
                continue;
            }

            lista.push({
                nombre,
                codigoBarras:    codigoBarra,
                categoria,
                fechaExpiracion: fechaCaducidad,
                marca,
                precio:          parseFloat(precio),
                stock:           parseInt(stock),
                sucursalId,
                estado:          parseInt(stock) <= 0 ? 'Agotado' : 'Disponible'
            });
            cargados++;
        }

        guardarProductos(lista);
        guardarLogErrores('errores_productos.txt', errores);
        mostrarLog('product-csv-log', cargados, errores, duplicados);
    };

    lector.readAsText(archivo);
}

function guardarLogErrores(nombreArchivo, errores) {
    if (errores.length === 0) return;

    let contenido = `Log de errores — ${new Date().toLocaleString('es-GT')}\n`;
    contenido    += '='.repeat(50) + '\n';

    for (let i = 0; i < errores.length; i++) {
        contenido += errores[i] + '\n';
    }

    const blob   = new Blob([contenido], { type: 'text/plain' });
    const url    = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href     = url;
    enlace.download = nombreArchivo;
    enlace.click();
    URL.revokeObjectURL(url);
}

function mostrarLog(elementoId, cargados, errores, duplicados) {
    const elemento = document.getElementById(elementoId);
    if (!elemento) return;

    let html = `<span class="text-success">✓ ${cargados} registros cargados</span>`;

    if (duplicados > 0) {
        html += `<span class="text-warning ms-3">⚠ ${duplicados} duplicados omitidos</span>`;
    }
    if (errores.length > 0) {
        html += `<span class="text-danger ms-3">✗ ${errores.length} errores — revisa el archivo descargado</span>`;
        html += '<ul class="mt-1 mb-0" style="font-size:11px; max-height:120px; overflow-y:auto">';
        for (let i = 0; i < errores.length; i++) {
            html += `<li class="text-danger">${errores[i]}</li>`;
        }
        html += '</ul>';
    }

    elemento.innerHTML = html;
}