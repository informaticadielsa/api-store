
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';
import ElementoPromocion from './ElementosPromocionModel';
import Producto from './ProductoModel';
import ProductoPromocion from './ProductoPromocionModel';
const PromocionDescuento = sequelize.define('promocion_descuento', {
    promdes_promocion_descuento_id: {
        type: Sequelize.INTEGER,
        allowNull:false,
        primaryKey: true,
        autoIncrement:  true
    },
    promdes_nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    promdes_descripcion: {
        type: Sequelize.STRING,
    },
    promdes_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    promdes_fecha_inicio_validez: {
        type: Sequelize.DATE,
        allowNull: false
    },
    promdes_fecha_finalizacion_validez: {
        type: Sequelize.DATE,
        allowNull: false
    },
    promdes_tipo_descuento_id: {
        type: Sequelize.INTEGER, 
        allowNull: false
    },
    promdes_descuento_exacto: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false,
        field: 'promdes_descuento_exacto'
    },
    promdes_valor_minimo_pedido: {
        type: Sequelize.DECIMAL(10,2),
        field: 'promdes_valor_minimo_pedido'
    },
    promdes_usu_usuario_creado_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    promdes_usu_usuario_modificador_id: {
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    promdes_cupon_descuento: {
        type: Sequelize.STRING
    },
    promdes_sku_gift: {
        type: Sequelize.INTEGER
    },
    promdes_carrito_articulo: {
        type: Sequelize.BOOLEAN
    },
    promdes_prioridad: {
        type: Sequelize.INTEGER
    },
},
{
    //Opciones
    tableName: 'promociones_descuentos'
});

PromocionDescuento.belongsTo(ControlMestroMultiple, {
    foreignKey: 'promdes_estatus_id',
    as: 'estatusPromocion'
});

PromocionDescuento.belongsTo(ControlMestroMultiple, {
    foreignKey: 'promdes_tipo_descuento_id',
    as: 'tipoDescuento'
});

PromocionDescuento.hasMany(ElementoPromocion,{
    foreignKey: 'ep_promdes_promocion_descuento_id',
    as: 'elemento_promocion'
});

PromocionDescuento.hasMany(ProductoPromocion, {
    foreignKey: 'prodprom_promdes_promocion_descuento_id',
    as: 'producto_promocion'
});

PromocionDescuento.belongsTo(Producto, {
    foreignKey: 'promdes_sku_gift',
    as: 'producto_regalo'
});

export default PromocionDescuento;