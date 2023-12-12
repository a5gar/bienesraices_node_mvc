import { Sequelize } from "sequelize";
import dotenv from 'dotenv';
dotenv.config({path: '.env'});



const db = new Sequelize(process.env.BD_NOMBRE, process.env.BD_USER, process.env.BD_PASS, {
    host: process.env.BD_HOST,
    port: 3306,
    dialect: 'mysql',
    define: {
        timestamps: true // Añade la fecha y hora cuando se crea un registro
    },
    pool: {
        max: 5, // Cantidad Máxima de conexiones por usuario
        min: 0, // Cantidad Minima de conexiones por usuario
        acquire:30000, // Cantidad de milisegundos (30seg) para intentar realizar la conexion antes de que nos muestre un error
        idle: 10000 // Cantidad de milisegundos (10seg) para que se conecte algun usuario antes de que la conexión finalice
    },
    operatorsAliases: 0 
});

export default db;