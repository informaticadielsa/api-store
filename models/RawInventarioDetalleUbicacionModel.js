import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const RawInventarioDetalleUbicacion = sequelize.define('raw_inventario_detalle_ubicacion', {
    raw_inventario_detalle_ubicacion_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    codigoAlmacen: {
        type: Sequelize.STRING
    },
    codigoArticulo: {
        type: Sequelize.STRING
    },
    codigoLote: {
        type: Sequelize.STRING
    },
    cantidad: {
        type: Sequelize.INTEGER
    },
    codigoUbicacion: {
        type: Sequelize.STRING
    },
    disponible: {
        type: Sequelize.INTEGER
    },
    nombreUbicacion: {
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
    tableName: 'raw_inventario_detalle_ubicacion'
});



export default RawInventarioDetalleUbicacion;