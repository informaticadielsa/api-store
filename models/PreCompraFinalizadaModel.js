import {  Sequelize } from 'sequelize';
import Almacenes from './AlmacenesModel';
import ControlMestroMultiple from './ControlMaestroMultipleModel';
import ProductoCompraFinalizada from './ProductoCompraFinalizadaModel';
import SociosNegocioDirecciones from './SociosNegocioDireccionesModel';
import Facturas from './FacturasModel';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const PreCompraFinalizada = sequelize.define('pre_compras_finalizadas',{
    cf_compra_finalizada_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    cf_compra_numero_orden: {
        type: Sequelize.STRING,
        allowNull: false
    },
    cf_compra_fecha: {
        type: Sequelize.DATE,
        allowNull: false
    },
    cf_vendido_por_usu_usuario_id: {
        type: Sequelize.INTEGER
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    cf_cmm_tipo_compra_id: {
        type: Sequelize.INTEGER
    },
    cf_vendido_a_socio_negocio_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    cf_cmm_tipo_envio_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    cf_direccion_envio_id:{
        type: Sequelize.INTEGER
    },
    cf_cmm_tipo_impuesto: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    cf_alm_almacen_recoleccion: {
        type: Sequelize.INTEGER
    },
    cf_total_compra: {
        type: Sequelize.DECIMAL(10,2),
        field: 'cf_total_compra'
    },
    cf_estatus_orden: {
        type: Sequelize.INTEGER
    },
    cf_fletera_id: {
        type: Sequelize.INTEGER
    },
    cf_sap_metodos_pago_codigo: {
        type: Sequelize.STRING
    },
    cf_sap_forma_pago_codigo: {
        type: Sequelize.STRING
    },
    cf_estatus_creacion_sap: {
        type: Sequelize.INTEGER
    },
    cf_descripcion_sap: {
        type: Sequelize.STRING
    },
    cf_referencia: {
        type: Sequelize.STRING
    },
    cf_promcup_promociones_cupones_id: {
        type: Sequelize.INTEGER
    },
    cf_cfdi: {
        type: Sequelize.STRING
    },
    
},
{
    //options
    tableName: 'pre_compras_finalizadas'
});

PreCompraFinalizada.belongsTo(ControlMestroMultiple, {
    foreignKey: 'cf_cmm_tipo_compra_id',
    as: 'tipo_compra_id'
});
PreCompraFinalizada.belongsTo(ControlMestroMultiple, {
    foreignKey: 'cf_cmm_tipo_envio_id',
    as: 'tipo_envio_id'
});

PreCompraFinalizada.belongsTo(SociosNegocioDirecciones, {
    foreignKey: 'cf_direccion_envio_id'
});

PreCompraFinalizada.hasMany(ProductoCompraFinalizada,{
    foreignKey: 'pcf_cf_compra_finalizada_id'
});

PreCompraFinalizada.belongsTo(ControlMestroMultiple, {
    foreignKey: 'cf_cmm_tipo_impuesto',
    as: 'tipo_impuesto'
})

PreCompraFinalizada.belongsTo(ControlMestroMultiple, {
    foreignKey: 'cf_estatus_orden',
    as: 'estatus_orden'
})

PreCompraFinalizada.belongsTo(Almacenes, {
    foreignKey: 'cf_alm_almacen_recoleccion',
    as: 'almacen_recoleccion'
})

PreCompraFinalizada.belongsTo(Facturas, {
    foreignKey: 'cf_compra_numero_orden',
    targetKey: 'fac_order_num'
});

PreCompraFinalizada.hasMany(ProductoCompraFinalizada, {
    foreignKey: 'pcf_cf_compra_finalizada_id',
    as: 'productos'
});

export default PreCompraFinalizada;