import {  Sequelize } from 'sequelize';
import Producto from './ProductoModel';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const PreProductoCompraFinalizada = sequelize.define('pre_productos_de_compra_finalizada', {
    pcf_producto_compra_finalizada_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    pcf_cf_compra_finalizada_id: {
        type: Sequelize.INTEGER, 
        allowNull: false
    },
    pcf_prod_producto_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    pcf_cantidad_producto: {
        type: Sequelize.INTEGER
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    pcf_descuento_producto: {
        type: Sequelize.INTEGER
    },
    pcf_precio: {
        type: Sequelize.DECIMAL(10,2),
        field: 'pcf_precio'
    },
    pcf_prod_producto_id_regalo: {
        type: Sequelize.INTEGER
    },
    pcf_cantidad_producto_regalo: {
        type: Sequelize.INTEGER
    },
    pcf_descuento_promocion: {
        type: Sequelize.DECIMAL(10,2),
        field: 'pcf_descuento_promocion'
    },
    pcf_prod_producto_id_promocion: {
        type: Sequelize.INTEGER
    },
    pcf_cantidad_producto_promocion: {
        type: Sequelize.INTEGER
    },
    pcf_cupon_aplicado: {
        type: Sequelize.BOOLEAN
    },
    pcf_sumatorio_mas_vendido_validador: {
        type: Sequelize.BOOLEAN
    },
    pcf_almacen_linea: {
        type: Sequelize.STRING
    },
    pcf_is_backorder: {
        type: Sequelize.BOOLEAN
    },
    pcf_dias_resurtimiento: {
        type: Sequelize.INTEGER
    }
},
{
    //Options
    tableName: 'pre_productos_de_compra_finalizada'
});

PreProductoCompraFinalizada.belongsTo(Producto,{
    foreignKey: 'pcf_prod_producto_id'
});
export default PreProductoCompraFinalizada;