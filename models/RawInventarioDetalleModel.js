import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const RawInventarioDetalle = sequelize.define('raw_inventario_detalle', {
    raw_inventario_detalle_id: {
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
    nombreLote: {
        type: Sequelize.STRING
    },
    ubicaciones: {
        type: Sequelize.JSON
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
    tableName: 'raw_inventario_detalle'
});



export default RawInventarioDetalle;