
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';
// import ElementoPromocion from './ElementosPromocionModel';
// import Producto from './ProductoModel';
// import ProductoPromocion from './ProductoPromocionModel';

const PromocionCupones = sequelize.define('promociones_cupones', {
    promcup_promociones_cupones_id: {
        type: Sequelize.INTEGER,
        allowNull:false,
        primaryKey: true,
        autoIncrement:  true
    },
    promcup_nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    promcup_descripcion: {
        type: Sequelize.STRING,
    },
    promcup_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    promcup_fecha_inicio_validez: {
        type: Sequelize.DATE,
        allowNull: false
    },
    promcup_fecha_finalizacion_validez: {
        type: Sequelize.DATE,
        allowNull: false
    },
    promcup_tipo_descuento_id: {
        type: Sequelize.INTEGER, 
        allowNull: false
    },
    promcup_descuento_exacto: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false,
        field: 'promcup_descuento_exacto'
    },
    promcup_valor_minimo_pedido: {
        type: Sequelize.DECIMAL(10,2),
        field: 'promcup_valor_minimo_pedido'
    },
    promcup_usu_usuario_creado_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    promcup_usu_usuario_modificador_id: {
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    promcup_cupon_codigo: {
        type: Sequelize.STRING
    },
    promcup_prioridad: {
        type: Sequelize.INTEGER
    },
    promcup_aplica_todo_carrito: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
},
{
    //Opciones
    tableName: 'promociones_cupones'
});

// PromocionDescuento.belongsTo(ControlMestroMultiple, {
//     foreignKey: 'promdes_estatus_id',
//     as: 'estatusPromocion'
// });

// PromocionDescuento.belongsTo(ControlMestroMultiple, {
//     foreignKey: 'promdes_tipo_descuento_id',
//     as: 'tipoDescuento'
// });

// PromocionDescuento.hasMany(ElementoPromocion,{
//     foreignKey: 'ep_promdes_promocion_descuento_id',
//     as: 'elemento_promocion'
// });

// PromocionDescuento.hasMany(ProductoPromocion, {
//     foreignKey: 'prodprom_promdes_promocion_descuento_id',
//     as: 'producto_promocion'
// });

// PromocionDescuento.belongsTo(Producto, {
//     foreignKey: 'promdes_sku_gift',
//     as: 'producto_regalo'
// });

export default PromocionCupones;