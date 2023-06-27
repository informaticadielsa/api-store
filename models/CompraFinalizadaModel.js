import {  Sequelize } from 'sequelize';
import Almacenes from './AlmacenesModel';
import ControlMestroMultiple from './ControlMaestroMultipleModel';
import ProductoCompraFinalizada from './ProductoCompraFinalizadaModel';
import SociosNegocioDirecciones from './SociosNegocioDireccionesModel';
import Facturas from './FacturasModel';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const CompraFinalizada = sequelize.define('compra_finalizada',{
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
    cf_orden_subtotal: {
        type: Sequelize.DECIMAL(10,2),
        field: 'cf_orden_subtotal'
    },
    cf_orden_descuento: {
        type: Sequelize.DECIMAL(10,2),
        field: 'cf_orden_descuento'
    },
    cf_orden_subtotal_aplicado: {
        type: Sequelize.DECIMAL(10,2),
        field: 'cf_orden_subtotal_aplicado'
    },
    cf_orden_gastos_envio: {
        type: Sequelize.DECIMAL(10,2),
        field: 'cf_orden_gastos_envio'
    },
    cf_order_iva: {
        type: Sequelize.DECIMAL(10,2),
        field: 'cf_order_iva'
    },
    cf_orden_dividida_sap: {
        type: Sequelize.STRING
    },
    cf_estatus_creacion_sap_usd: {
        type: Sequelize.INTEGER
    },
    cf_descripcion_sap_usd: {
        type: Sequelize.STRING
    },
    cf_cfdi: {
        type: Sequelize.STRING
    },
    cf_mensajeov: {
        type: Sequelize.STRING
    },
    cf_mensajeov_usd: {
        type: Sequelize.STRING
    },
    cf_sap_json_creacion: {
        type: Sequelize.JSON
    },
    cf_sap_json_creacion_usd: {
        type: Sequelize.JSON
    },
    cf_sap_entregado: {
        type: Sequelize.STRING
    },
    cf_sap_entregado_usd: {
        type: Sequelize.STRING
    },
    cf_estatus_orden_usd: {
        type: Sequelize.INTEGER
    },
    cf_resume_mxn: {
        type: Sequelize.JSON
    },
    cf_resume_usd: {
        type: Sequelize.JSON
    },
    cf_politica_envio_nombre: {
        type: Sequelize.STRING
    },
    cf_snu_usuario_snu_id: {
        type: Sequelize.INTEGER
    },
    cf_generado_en: {
        type: Sequelize.STRING
    },
},
{
    //options
    tableName: 'compras_finalizadas'
});

CompraFinalizada.belongsTo(ControlMestroMultiple, {
    foreignKey: 'cf_cmm_tipo_compra_id',
    as: 'tipo_compra_id'
});
CompraFinalizada.belongsTo(ControlMestroMultiple, {
    foreignKey: 'cf_cmm_tipo_envio_id',
    as: 'tipo_envio_id'
});

CompraFinalizada.belongsTo(SociosNegocioDirecciones, {
    foreignKey: 'cf_direccion_envio_id'
});

CompraFinalizada.hasMany(ProductoCompraFinalizada,{
    foreignKey: 'pcf_cf_compra_finalizada_id'
});

CompraFinalizada.belongsTo(ControlMestroMultiple, {
    foreignKey: 'cf_cmm_tipo_impuesto',
    as: 'tipo_impuesto'
})

CompraFinalizada.belongsTo(ControlMestroMultiple, {
    foreignKey: 'cf_estatus_orden',
    as: 'estatus_orden'
})

CompraFinalizada.belongsTo(Almacenes, {
    foreignKey: 'cf_alm_almacen_recoleccion',
    as: 'almacen_recoleccion'
})

CompraFinalizada.belongsTo(Facturas, {
    foreignKey: 'cf_compra_numero_orden',
    targetKey: 'fac_order_num'
});

CompraFinalizada.hasMany(ProductoCompraFinalizada, {
    foreignKey: 'pcf_cf_compra_finalizada_id',
    as: 'productos'
});

export default CompraFinalizada;