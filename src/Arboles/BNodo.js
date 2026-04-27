class BNodo {
    constructor(grado, esHoja){
        this.grado = grado;
        this.esHoja =  esHoja;
        this.numClaves = 0;

        // Max claves = 2t - 1
        // Max hijos  = 2t
        this.claves = new Array(2 * grado - 1).fill(null); 
        this.hijos  = new Array(2 * grado).fill(null);    
    }
}