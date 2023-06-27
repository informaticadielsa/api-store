import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMaestroMultiple from './ControlMaestroMultipleModel';
const ArchivosDeInicio = sequelize.define('archivo_de_inicio',{
    adi_archivo_de_inicio_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    adi_nombre_archivo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    adi_ruta_archivo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    adi_ruta_archivo_2: {
        type: Sequelize.STRING
        // allowNull: false
    },
    adi_titulo: {
        type: Sequelize.STRING
    },
    adi_titulo_2: {
        type: Sequelize.STRING
    },
    adi_descripcion: {
        type: Sequelize.STRING
    },
    adi_url: {
        type: Sequelize.STRING
    },
    adi_cmm_tipo_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    adi_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    adi_usu_usuario_creador_id: {
        type: Sequelize.INTEGER
    },
    adi_usu_usuario_modificador_id: {
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
    adi_order: {
        type: Sequelize.INTEGER
    },
    adi_sn_socio_de_negocio_id: {
        type: Sequelize.INTEGER
    },
    adi_sdc_solicitud_de_credito_id: {
        type: Sequelize.INTEGER
    }
},
{
    //Options
    tableName: 'archivos_de_inicio'
});


ArchivosDeInicio.belongsTo(ControlMaestroMultiple, {
    foreignKey: 'adi_cmm_tipo_id',
    as: 'tipo_archivo_id'
});
ArchivosDeInicio.belongsTo(ControlMaestroMultiple, {
    foreignKey: 'adi_cmm_estatus_id',
    as: 'estatus_id'
});
export default ArchivosDeInicio;