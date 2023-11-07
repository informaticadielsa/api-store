import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const Proyectos = sequelize.define('Proyectos', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    CodigoEjecutivo: {
        type: Sequelize.INTEGER
    },
    NombreEjecutivo: {
        type: Sequelize.STRING
    },
    codigoCliente: {
        type: Sequelize.STRING,
    },
    estatus: {
        type: Sequelize.STRING
    },
    fechaInicio: {
        type: Sequelize.STRING,
        unique: true
    },
    fechaVencimiento: {
        type: Sequelize.STRING
    },
    moneda: {
        type: Sequelize.STRING
    },
    nombreCliente: {
        type: Sequelize.STRING
    },
    nombreProyecto: {
        type: Sequelize.STRING
    },
    recordatorio: {
        type: Sequelize.INTEGER
    },
    referenciaFabrica: {
        type: Sequelize.STRING
    },
    renovacion: {
        type: Sequelize.STRING
    },
    total: {
        type: Sequelize.DECIMAL
    },
    unidadesRecordatorio: {
        type: Sequelize.STRING
    },
    idProyecto: {
        type: Sequelize.STRING
    },
    activo: {
        type: Sequelize.INTEGER
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
    },
},
{
    //Options
    tableName: 'proyectos'
});

export default Proyectos;