class BMasNodo {

    constructor(grado, esHoja){
        this.grado = grado;
        this.esHoja = esHoja;
        this.numClaves = 0;
        this.siguiente = null;

        this.claves = new Array(2*grado - 1).fill(null);

        if(esHoja){
            this.data = new Array(2*grado - 1).fill(null);
            this.hijos = null;
        } else {
            this.data = null;
            this.hijo = new Array(2*grado).fill(null);
        }
    }
}