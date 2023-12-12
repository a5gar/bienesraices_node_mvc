import express from 'express';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import usuarioRoutes from './routes/usuarioRoutes.js';
import propiedadesRoutes from './routes/propiedadesRoutes.js';
import appRoutes from './routes/appRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import db from './config/db.js';

// Crear la app
const app = express();

// Habilitar la lectura de datos de formularios
app.use(express.urlencoded({extended: true}))

// Habilitar cookie Parser
app.use(cookieParser());

// Habilitar CSRF
app.use(csrf({cookie: true}));

// Conexión a la BD
try {
    await db.authenticate();
    db.sync();
    console.log('Conexión Correcta a la BD')
} catch (error) {
    console.log(error)
}

// Habilitar Pug
app.set('view engine', 'pug');
app.set('views', './views');

// Carpeta publica
app.use(express.static('public'));

// Routing
app.use('/', appRoutes);
app.use('/auth', usuarioRoutes);
app.use('/', propiedadesRoutes);
app.use('/api', apiRoutes);



// Asignamos un puero
const port = process.env.PORT || 3000;

// Escuchamos al puerto
app.listen(port, () => {

});