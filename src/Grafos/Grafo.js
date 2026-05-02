class Grafo {
    constructor(){
        this.sucursales = {};
        this.aristas = {};
    }

    agregarSucursal(rama) {
        if (this.sucursales[rama.id]) return false;
        this.sucursales[rama.id] = rama;
        this.aristas[rama.id]    = [];
        return true;
    }

    agregarConexion(origenId, destinoId, tiempo, costo, bidireccional = true) {
        if (!this.sucursales[origenId] || !this.sucursales[destinoId]) return false;
        if (this.existeConexion(origenId, destinoId)) return false;

        this.aristas[origenId].push(new Arista(destinoId, tiempo, costo, bidireccional));
        if (bidireccional) {
            this.aristas[destinoId].push(new Arista(origenId, tiempo, costo, bidireccional));
        }
        return true;
    }

    removerSucursal(id) {
        if (!this.sucursales[id]) return false;

        delete this.sucursales[id];
        delete this.aristas[id];

        for (const origen in this.aristas) {
            this.aristas[origen] = this.aristas[origen].filter(a => a.destino !== id);
        }
        return true;
    }

    removerConexion(origenId, destinoId) {
        if (!this.aristas[origenId]) return false;
        this.aristas[origenId]  = this.aristas[origenId].filter(a => a.destino !== destinoId);
        this.aristas[destinoId] = this.aristas[destinoId].filter(a => a.destino !== origenId);
        return true;
    }

    getSucursal(id)     { return this.sucursales[id] || null; }
    getSucursales()     { return Object.values(this.sucursales); }
    getConexiones(id)   { return this.aristas[id] || []; }

    existeConexion(origenId, destinoId) {
        if (!this.aristas[origenId]) return false;
        return this.aristas[origenId].some(a => a.destino === destinoId);
    }

    dijkstra(origenId, destinoId, criterio = 'tiempo') {
        const ids = Object.keys(this.sucursales);

        const dist     = {};
        const prev     = {};
        const visitado = new Set();

        ids.forEach(id => { dist[id] = Infinity; prev[id] = null; });
        dist[origenId] = 0;

        const cola = [{ id: origenId, d: 0 }];

        while (cola.length > 0) {
            cola.sort((a, b) => a.d - b.d);
            const { id: actual } = cola.shift();

            if (visitado.has(actual)) continue;
            visitado.add(actual);

            if (actual === destinoId) break;

            for (const arista of (this.aristas[actual] || [])) {
                const peso      = criterio === 'tiempo' ? arista.tiempo : arista.costo;
                const nuevaDist = dist[actual] + peso;

                if (nuevaDist < dist[arista.destino]) {
                    dist[arista.destino] = nuevaDist;
                    prev[arista.destino] = actual;
                    cola.push({ id: arista.destino, d: nuevaDist });
                }
            }
        }

        if (dist[destinoId] === Infinity) {
            return { ruta: [], total: Infinity, encontrada: false };
        }

        const ruta   = [];
        let actual   = destinoId;
        while (actual !== null) {
            ruta.unshift(actual);
            actual = prev[actual];
        }

        return { ruta, total: dist[destinoId], encontrada: true, criterio };
    }

    calcularETA(ruta, criterio = 'tiempo') {
        if (ruta.length === 0) return 0;
        let total = 0;

        for (let i = 0; i < ruta.length - 1; i++) {
            const arista = this.aristas[ruta[i]]?.find(a => a.destino === ruta[i + 1]);
            if (arista) total += criterio === 'tiempo' ? arista.tiempo : arista.costo;

            const sucursal = this.sucursales[ruta[i]];
            if (sucursal && i > 0) {
                total += sucursal.tiempoIngreso + sucursal.tiempoPreparacion;
            }
        }
        return total;
    }

    transferirProducto(producto, origenId, destinoId, criterio = 'tiempo') {
        const resultado = this.dijkstra(origenId, destinoId, criterio);

        if (!resultado.encontrada) {
            return { exito: false, mensaje: 'No existe ruta entre las sucursales' };
        }

        const { ruta } = resultado;
        producto.estado = 'En tránsito';

        for (let i = 0; i < ruta.length; i++) {
            const sucursal = this.sucursales[ruta[i]];
            if (!sucursal) continue;

            if (i === 0) {
                sucursal.removerProducto(producto.codigoBarras);
                sucursal.prepararEnvio(producto);
                sucursal.pasarTraspasoASalida();
            } else if (i === ruta.length - 1) {
                sucursal.recibirProducto(producto);
            } else {
                sucursal.colaIngreso.enqueue(producto);
                sucursal.prepararEnvio(producto);
                sucursal.pasarTraspasoASalida();
            }
        }

        const eta        = this.calcularETA(ruta, criterio);
        const nombreRuta = ruta.map(id => this.sucursales[id]?.nombre || id).join(' → ');

        return { exito: true, ruta, nombreRuta, total: resultado.total, eta, criterio };
    }

    conexionFromCSV(linea) {
        const cols = linea.split(',').map(c => c.trim().replace(/"/g, ''));
        if (cols.length < 4) return false;
        const [origenId, destinoId, tiempo, costo, bidi = 'true'] = cols;
        return this.agregarConexion(origenId, destinoId, tiempo, costo, bidi === 'true');
    }

    generarDot() {
        const lineas = [];
        lineas.push('digraph Red {');
        lineas.push('    node [shape=ellipse, style=filled, fillcolor="#D6EAF8"];');
        lineas.push('    rankdir=LR;');
        lineas.push('');

        for (const id in this.sucursales) {
            lineas.push(`    "${id}" [label="${this.sucursales[id].nombre}"];`);
        }

        const yaAgregadas = new Set();
        for (const origenId in this.aristas) {
            for (const arista of this.aristas[origenId]) {
                const clave = [origenId, arista.destino].sort().join('-');
                if (arista.bidireccional && yaAgregadas.has(clave)) continue;
                yaAgregadas.add(clave);
                const dir   = arista.bidireccional ? ' dir=both' : '';
                const label = `t:${arista.tiempo}s c:Q${arista.costo}`;
                lineas.push(`    "${origenId}" -> "${arista.destino}" [label="${label}"${dir}];`);
            }
        }

        lineas.push('}');
        return lineas.join('\n');
    }

    getTotalSucursales() { return Object.keys(this.sucursales).length; }
    estaVacio()          { return this.getTotalSucursales() === 0; }
}