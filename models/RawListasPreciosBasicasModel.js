import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const RawListasPreciosBasicas = sequelize.define('raw_listas_precios_basicas', {
    raw_listas_precios_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    codigoArticulo: {
        type: Sequelize.STRING
    },
    nombreArticulo: {
        type: Sequelize.STRING
    },
    codigoListaPrecios: {
        type: Sequelize.STRING
    },
    factor: {
        type: Sequelize.INTEGER
    },
    moneda: {
        type: Sequelize.STRING
    },
    nombreListaPrecios: {
        type: Sequelize.STRING
    },
    precio: {
        type: Sequelize.INTEGER
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
    tableName: 'raw_listas_precios_basicas'
});



export default RawListasPreciosBasicas;