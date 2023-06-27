import { Sequelize } from 'sequelize';
import ControlMestroMultiple from './ControlMaestroMultipleModel';
import ProductoCotizacionProyecto from './ProductosCotizacionProyectoModel';
import SociosNegocio from './SociosNegocioModel';
import Usuario from './UsuarioModel';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const CotizacionProyecto = sequelize.define('cotizacion_proyecto',
{
    cot_cotizacion_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    cot_numero_orden: {
        type: Sequelize.STRING,
        allowNull: false
    },
    cot_proyecto_nombre: {
        type: Sequelize.STRING
    },
    cot_cmm_tipo_id: {
        type: Sequelize.INTEGER,
        allowNull: null
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    cot_usu_usuario_modificador_id: {
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    cot_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    cot_sn_socios_negocio_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    cot_usu_usuario_vendedor_id: {
        type: Sequelize.INTEGER
    },
    cot_fecha_vencimiento: {
        type: Sequelize.DATE,
        allowNull: false
    },
    cot_comentario: {
        type: Sequelize.STRING
    },
    cot_descuento: {
        type: Sequelize.INTEGER
    },
    cot_correo_electronico: {
        type: Sequelize.STRING,
        validate:{
            isEmail: true
        }
    },
    cot_total_cotizacion: {
        type: Sequelize.DECIMAL(10,2),
        field: 'cot_total_cotizacion'
    },
    cot_fecha_envio: {
        type: Sequelize.DATE
    },
    cot_motivo_cancelacion: {
        type: Sequelize.STRING
    }
},
{
    //Options
    tableName: 'cotizaciones_proyectos'
});

CotizacionProyecto.hasMany(ProductoCotizacionProyecto, {
    foreignKey: 'pc_cot_cotizacion_id'
});

CotizacionProyecto.belongsTo(ControlMestroMultiple, {
    foreignKey: 'cot_cmm_tipo_id',
    as: 'tipo_cotizacion'
});

CotizacionProyecto.belongsTo(ControlMestroMultiple, {
    foreignKey: 'cot_cmm_estatus_id',
    as: 'estatus_cotizacion'
});

CotizacionProyecto.belongsTo(SociosNegocio, {
    foreignKey: 'cot_sn_socios_negocio_id'
});

CotizacionProyecto.belongsTo(Usuario, {
    foreignKey: 'cot_usu_usuario_vendedor_id',
    as: 'vendedor_id'
});
export default CotizacionProyecto;