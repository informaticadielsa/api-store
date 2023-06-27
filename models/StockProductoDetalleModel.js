import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const StockProductoDetalle = sequelize.define('stocks_productos_detalle', {
    spd_stocks_productos_detalle_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    spd_prod_producto_id: {
        type: Sequelize.INTEGER
    },
    spd_alm_almacen_id: {
        type: Sequelize.INTEGER
    },
    spd_codigo_lote: {
        type: Sequelize.STRING
    },
    spd_disponible: {
        type: Sequelize.DECIMAL(10,2),
        field: 'spd_disponible'
    },
    spd_apartado: {
        type: Sequelize.DECIMAL(10,2),
        field: 'spd_apartado'
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
    tableName: 'stocks_productos_detalle'
});



export default StockProductoDetalle;