function getSucursalesGuardadas(){
    try {
        return JSON.parse(sessionStorage.getItem('sucursales') || '[]')
    } catch{
        return [];
    }
}

function guardarSucursales(lista) {
    sessionStorage.setItem('sucursales', JSON.stringify(lista));
}

function getConexionesGuardadas(){
    try {
        return JSON.parse(sessionStorage.getItem('conexiones') || '[]');
    } catch {
        return [];
    }
}

function guardarConexiones(lista){
    sessionStorage.setItem('conexiones', JSON.stringify(lista));
}

function getProductosGuardados(){
    try {
        return JSON.parse(sessionStorage.getItem('productos') || '[]');
    } catch {
        return [];
    }
}

function guardarProductos(lista){
    sessionStorage.setItem('productos', JSON.stringify(lista));
}

function getHistorialGuardado() {
    try { return JSON.parse(sessionStorage.getItem('historial') || '[]'); }
    catch { return []; }
}

function guardarHistorial(lista) {
    sessionStorage.setItem('historial', JSON.stringify(lista));
}

function getColasGuardadas() {
    try { return JSON.parse(sessionStorage.getItem('colas') || '{}'); }
    catch { return {}; }
}

function guardarColas(data) {
    sessionStorage.setItem('colas', JSON.stringify(data));
}

function getColasGuardadas() {
    try { return JSON.parse(sessionStorage.getItem('colas') || '{}'); }
    catch { return {}; }
}

function guardarColas(colas) {
    sessionStorage.setItem('colas', JSON.stringify(colas));
}