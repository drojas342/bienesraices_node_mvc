
const vendedor = (usuarioId, propiedadUsuarioId) => {
    return String(usuarioId) === String(propiedadUsuarioId);
}

const formatoFecha = (fecha) => {
    const nuevaFecha = new Date(fecha).toISOString().slice(0,10);
    const opciones = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    }
    return new Date(nuevaFecha).toLocaleDateString("es-ES", opciones);
}

export {
    vendedor,
    formatoFecha
}