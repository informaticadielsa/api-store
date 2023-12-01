import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const CotizacionesProductos = sequelize.define('cotizaciones_productos', {
    cotp_cotizaciones_productos_id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    cotp_prod_producto_id: {
        type: Sequelize.INTEGER,
    },
    cotp_cotizacion_id: {
        type: Sequelize.INTEGER,
    },
    cotp_producto_cantidad: {
        type: Sequelize.INTEGER,
    },
    cotp_precio_base_lista: {
        type: Sequelize.DECIMAL(10,2),
        field: 'cotp_precio_base_lista'
    },
    cotp_precio_menos_promociones: {
        type: Sequelize.DECIMAL(10,2),
        field: 'cotp_precio_menos_promociones'
    },
    cotp_porcentaje_descuento_vendedor: {
        type: Sequelize.DECIMAL(10,2),
        field: 'cotp_porcentaje_descuento_vendedor',
        defaultValue: 0
    },
    cotp_precio_descuento_vendedor: {
        type: Sequelize.DECIMAL(10,2),
        field: 'cotp_precio_descuento_vendedor'
    },
    cotp_usu_descuento_cotizacion: {
        type: Sequelize.INTEGER,
    },
    cotp_disponible_para_compra: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    cotp_back_order: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    cotp_usu_usuario_modificado_id:{
        type: Sequelize.INTEGER
    },

    
    cotp_tipo_precio_lista: {
        type: Sequelize.STRING
    },
    cotp_dias_resurtimiento:{
        type: Sequelize.INTEGER
    },
    cotp_almacen_linea:{
        type: Sequelize.INTEGER
    },
    cotp_recoleccion_resurtimiento: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    cotp_fecha_entrega: {
        type: Sequelize.DATE,
        allowNull: false
    },
    cotp_backorder_precio_lista: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    cotp_descuento_porcentual:{
        type: Sequelize.INTEGER
    },

    cotp_backorder_fecha_envio_pendiente: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    cotp_flag_compra:{
        type: Sequelize.INTEGER  
    }

},
{
    //options
});

export default CotizacionesProductos;