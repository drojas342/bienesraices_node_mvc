import path from 'path'; 

export default {
    mode: 'development',  
    entry: {
        mapa: './src/js/mapa.js',
        agregarImagen: './src/js/agregar-imagen.js',
        mostrarMapa: './src/js/mostrar-mapa.js',
        mapaInicio: './src/js/mapaInicio.js',
        cambiarEstado: './src/js/cambiarEstado.js',
        menu: './src/js/menu.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(  'public/js'),
    }
}