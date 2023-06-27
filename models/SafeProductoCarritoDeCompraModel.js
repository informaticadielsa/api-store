import {  Sequelize } from 'sequelize';
import ControlMestroMultiple from './ControlMaestroMultipleModel';
import Producto from './ProductoModel';
const sequelize = new Sequelize(process.env.POSTGRESQL);


const SafeProductoCarritoDeCompra = sequelize.define('safe_productos_carrito_de_compra', {
    pcdc_producto_carrito_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    pcdc_carrito_de_compra_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    pcdc_precio: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    pcdc_prod_producto_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    pcdc_producto_cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    pcdc_mejor_descuento: {
        type: Sequelize.INTEGER
    },
    pcdc_lista_precio: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    pcdc_precio: {
        type: Sequelize.DECIMAL(10,2),
        field: 'pcdc_precio'
    },
    pcdc_prod_producto_id_regalo: {
        type: Sequelize.INTEGER
    },
    pcdc_cantidad_producto_regalo: {
        type: Sequelize.INTEGER
    },
    pcdc_prod_producto_id_promocion: {
        type: Sequelize.INTEGER
    },
    pcdc_cantidad_producto_promocion: {
        type: Sequelize.INTEGER
    },
    // pcdc_tipo_prmocion_individual: {
    //     type: Sequelize.INTEGER
    // },
    pcdc_descuento_promocion: {
        type: Sequelize.DECIMAL(10,2),
        field: 'pcdc_descuento_promocion'
    },
    pcdc_cupon_aplicado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    pcdc_almacen_surtido: {
        type: Sequelize.INTEGER
    },
    pcdc_no_disponible_para_compra: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    pcdc_back_order: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    pcdc_validado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    pcdc_lote_detail: {
        type: Sequelize.STRING
    },
},
{
    //Options
    tableName: 'safe_productos_carrito_de_compra'
});

// ProductoCarritoDeCompra.belongsTo(Producto,{
//     foreignKey: 'pcdc_prod_producto_id'
// });

// ProductoCarritoDeCompra.belongsTo(ControlMestroMultiple, {
//     foreignKey: 'pcdc_tipo_prmocion_individual',
//     as: 'tipo_promocion'
// })
export default SafeProductoCarritoDeCompra;