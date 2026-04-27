class Grafo {
    constructor(){
        this.sucursales = {};
        this.arista = {};
    }

    agregarSucursal(rama) {
        if (this.sucursales[rama.id]) return false;
        this.sucursales[rama.id] = rama;
        this.aristas[rama.id]    = [];
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
}