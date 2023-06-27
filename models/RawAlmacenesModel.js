import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const RawAlmacenes = sequelize.define('raw_almacenes', {
    raw_almacenes_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    bloqueado: {
        type: Sequelize.STRING
    },
    codigoAlmacen: {
        type: Sequelize.STRING
    },
    nombreAlmacen: {
        type: Sequelize.STRING
    },
    calle: {
        type: Sequelize.STRING
    },
    ciudad: {
        type: Sequelize.STRING
    },
    codigoPostal: {
        type: Sequelize.STRING
    },
    colonia: {
        type: Sequelize.STRING
    },
    condado: {
        type: Sequelize.STRING
    },
    estado: {
        type: Sequelize.STRING
    },
    numeroCalle: {
        type: Sequelize.STRING
    },
    pais: {
        type: Sequelize.STRING
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE
    }
},{
    //options
    tableName: 'raw_almacenes'
});



export default RawAlmacenes;