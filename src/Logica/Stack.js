class Stack {
    constructor(){
        this.tope = null;
        this.size = 0;
    }

    push(data){
        const nuevo = new StackNodo(data);
        nuevo.anterior = this.tope;
        this.tope = nuevo;
        this.size++;
    }

    pop(){
        if (this.estaVacia()) return null;
        const data = this.tope.data;
        this.tope = this.tope.anterior;
        this.size--;
        return data;
    }

    peek(){
        if (this.estaVacia()) return null;
        return this.tope.data;
    }

    estaVacia(){
        return this.tope === null;
    }
    
    getSize(){
        return this.size;
    }

    toArray() {
        const resultado = [];
        let actual = this.tope;
        while (actual !== null) {
            resultado.push(actual.data);
            actual = actual.anterior;
        }
        return resultado;
    }

    limpiar() {
        this.tope = null;
        this.size = 0;
    }
}