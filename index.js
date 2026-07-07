import express from 'express';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import usuarioRoutes from './routes/usuarioRoutes.js';
import propiedadesRoutes from './routes/propiedadesRoutes.js';
import appRoutes from './routes/appRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import identificarUsuario from './middleware/identificarUsuario.js';

import db from './config/db.js';

//Crear la app
const app = express();

//Habilitar lectura de datos de formularios
app.use(express.urlencoded({extended: true}))

//Conexión a la base de datos
try {
    await db.authenticate();
    db.sync();
    console.log('Conexión a la base de datos exitosa');
} catch (error) {
    console.error('Error al conectar a la base de datos:', error);
}

//Habilitar cookies parser
app.use(cookieParser());

//Habilitar CSRF
app.use(csrf({cookie: true}));

//Identificar usuario en cada petición
app.use(identificarUsuario);

//Routing

app.use('/', appRoutes)
app.use('/auth', usuarioRoutes)  
app.use('/', propiedadesRoutes)
app.use('/api', apiRoutes)



//Habilitar Pug
app.set('view engine', 'pug');
app.set('views', './views');

//Carpeta publica
app.use(express.static('public'));

//Definir el puerto y arrancar el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});