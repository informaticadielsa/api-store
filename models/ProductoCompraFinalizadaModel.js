import {  Sequelize } from 'sequelize';
import Producto from './ProductoModel';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const ProductoCompraFinalizada = sequelize.define('producto_de_compra_finalizada', {
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
    },
    pcf_order_dividida_sap: {
        type: Sequelize.BOOLEAN
    },
    pcf_numero_orden_usd_sap: {
        type: Sequelize.STRING
    },
    pcf_linea_estatus_sap: {
        type: Sequelize.STRING
    },
    pcf_recoleccion_resurtimiento: {
        type: Sequelize.BOOLEAN
    },
    pcf_linea_num_sap: {
        type: Sequelize.INTEGER
    },
    pcf_fecha_entrega: {
        type: Sequelize.DATE
    },
    pcf_cantidad_entregada: {
        type: Sequelize.DECIMAL(10,2),
        field: 'pcf_cantidad_entregada'
    },
    pcf_backorder_precio_lista: {
        type: Sequelize.BOOLEAN
    },
    pcf_tipo_precio_lista: {
        type: Sequelize.STRING
    },
    pcf_precio_base_venta: {
        type: Sequelize.DECIMAL(10,2),
        field: 'pcf_precio_base_venta'
    },
    pcf_descuento_porcentual: {
        type: Sequelize.DECIMAL(10,2),
        field: 'pcf_descuento_porcentual'
    },
},
{
    //Options
    tableName: 'productos_de_compra_finalizada'
});

ProductoCompraFinalizada.belongsTo(Producto,{
    foreignKey: 'pcf_prod_producto_id'
});
export default ProductoCompraFinalizada;