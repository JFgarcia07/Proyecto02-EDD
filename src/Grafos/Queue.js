class QueueNode {
    constructor(data) {
        this.data      = data;
        this.siguiente = null;
    }
}

class Queue {

    constructor() {
        this.frente = null;
        this.fin    = null;
        this.size   = 0;
    }

    enqueue(data) {
        const nuevo = new QueueNode(data);
        if (this.fin === null) {
            this.frente = nuevo;
            this.fin    = nuevo;
        } else {
            this.fin.siguiente = nuevo;
            this.fin           = nuevo;
        }
        this.size++;
    }

    dequeue() {
        if (this.estaVacia()) return null;
        const data  = this.frente.data;
        this.frente = this.frente.siguiente;
        if (this.frente === null) this.fin = null;
        this.size--;
        return data;
    }

    peek() {
        if (this.estaVacia()) return null;
        return this.frente.data;
    }

    estaVacia() {
        return this.frente === null;
    }

    getSize() {
        return this.size;
    }

    toArray() {
        const resultado = [];
        let actual = this.frente;
        while (actual !== null) {
            resultado.push(actual.data);
            actual = actual.siguiente;
        }
        return resultado;
    }

    limpiar() {
        this.frente = null;
        this.fin    = null;
        this.size   = 0;
    }
}