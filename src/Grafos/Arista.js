class Arista {
    constructor(destino, tiempo, costo, bidireccional = true){
        this.destino = destino;
        this.tiempo        = parseFloat(tiempo);
        this.costo         = parseFloat(costo);
        this.bidireccional = bidireccional;
    }
}