import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const Cotizaciones = sequelize.define('cotizaciones', {
    cot_cotizacion_id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    cot_numero_orden: {
        type: Sequelize.STRING
        // allowNull: false
    },
    cot_sn_socios_negocio_id: {
        type: Sequelize.INTEGER,
    },
    cot_total_cotizacion: {
        type: Sequelize.DECIMAL(10,2),
        field: 'cot_total_cotizacion'
    },
    cot_referencia: {
        type: Sequelize.STRING
    },
    cot_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    cot_usu_usuario_vendedor_id: {
        type: Sequelize.INTEGER
    },
    cot_motivo_cancelacion: {
        type: Sequelize.STRING
    },
    cot_fecha_vencimiento: {
        type: Sequelize.DATE,
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
    cot_usu_usuario_modificador_id:{
        type: Sequelize.INTEGER
    },
    cot_cmm_tipo_envio_id: {
        type: Sequelize.INTEGER,
    },
    cot_direccion_envio_id: {
        type: Sequelize.INTEGER,
    },
    cot_alm_almacen_recoleccion: {
        type: Sequelize.INTEGER,
    },
    cot_cmm_tipo_compra_id: {
        type: Sequelize.INTEGER,
    },
    cot_fletera_id: {
        type: Sequelize.INTEGER,
    },
    cot_costo_envio: {
        type: Sequelize.INTEGER,
    },
    cot_promcup_promociones_cupones_id: {
        type: Sequelize.INTEGER,
    },
    cot_forma_pago_codigo: {
        type: Sequelize.INTEGER,
    },
    cot_cfdi: {
        type: Sequelize.INTEGER,
    },

    cot_tratamiento: {
        type: Sequelize.STRING
    },
    cot_prospecto: {
        type: Sequelize.BOOLEAN
    },
    cot_up_usuarios_prospectos_id: {
        type: Sequelize.INTEGER,
    },

    cot_surtir_un_almacen: {
        type: Sequelize.BOOLEAN
    },
    cot_tipo_politica_envio: {
        type: Sequelize.STRING
    },
    cot_aplica_politica_envio: {
        type: Sequelize.BOOLEAN
    },

    cot_iva: {
        type: Sequelize.INTEGER,
    },
    cot_descuento_total: {
        type: Sequelize.DECIMAL(10,2),
        field: 'cot_descuento_total'
    },
    cot_total_base: {
        type: Sequelize.DECIMAL(10,2),
        field: 'cot_total_base'
    },
    cot_total_promocion: {
        type: Sequelize.DECIMAL(10,2),
        field: 'cot_total_promocion'
    },

    cot_mantener_copia: {
        type: Sequelize.STRING
    },
    cot_iva_cantidad: {
        type: Sequelize.DECIMAL(10,2),
        field: 'cot_iva_cantidad'
    },
    cot_descuento_porcentaje: {
        type: Sequelize.DECIMAL(10,2),
        field: 'cot_descuento_porcentaje'
    },
    cot_terminos_y_condiciones: {
        type: Sequelize.STRING
    },

},
{
    //options
});

export default Cotizaciones;