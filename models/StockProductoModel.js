import {  Sequelize } from 'sequelize';
import Producto from './ProductoModel';
import Almacen from './AlmacenesModel';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const StockProducto = sequelize.define('stocks_productos', {
    //Properties table
    sp_stock_producto_id: {
        type:   Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    sp_prod_producto_id: {
        type:   Sequelize.INTEGER,
        allowNull: false,
        references: {
            foreignKey: 'prod_producto_id',
            model: Producto
        }
    },
    sp_fecha_ingreso: {
        type:   Sequelize.DATE,
        allowNull: false
    },
    sp_cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    sp_usu_usuario_creador_id: {
        type:   Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type:   Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type:   Sequelize.DATE
    },
    sp_almacen_id : {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    sp_comprometido : {
        type: Sequelize.INTEGER
    },
},
{
    //options
    tableName: 'stocks_productos'
});

StockProducto.belongsTo(Almacen,{
    foreignKey: 'sp_almacen_id'
});


export default StockProducto;