import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const RawListasPreciosPeriodo = sequelize.define('raw_listas_precios_periodo', {
    raw_listas_precios_periodo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    codigoArticulo: {
        type: Sequelize.STRING
    },
    activo: {
        type: Sequelize.STRING
    },
    codigoListaPrecios: {
        type: Sequelize.STRING
    },
    moneda: {
        type: Sequelize.STRING
    },
    porcentajeDescuento: {
        type: Sequelize.INTEGER
    },
    validoDesde: {
        type: Sequelize.STRING
    },
    validoHasta: {
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
    tableName: 'raw_listas_precios_periodo'
});



export default RawListasPreciosPeriodo;