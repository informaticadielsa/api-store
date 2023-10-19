import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import Proyectos from './ProyectosModel';

const LineasProyectos = sequelize.define('LineasProyectos', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    idProyecto: {
        type: Sequelize.INTEGER
    },
    cantidadAcumulada: {
        type: Sequelize.INTEGER
    },
    codigoArticulo: {
        type: Sequelize.STRING,
    },
    importeAcumulado: {
        type: Sequelize.DECIMAL
    },
    nombreArticulo: {
        type: Sequelize.STRING,
        unique: true
    },
    precio: {
        type: Sequelize.DECIMAL,
    },
},
{
    //Options
    tableName: 'lineas_proyectos'
});

LineasProyectos.belongsTo(Proyectos,{
    foreignKey: 'idProyecto'
});

export default LineasProyectos;
