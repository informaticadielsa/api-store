import {  Sequelize } from 'sequelize';
import ControlMestroMultiple from './ControlMaestroMultipleModel';
import MetaUsuario from './MetaUsuarioModel';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const MetaEquipoTrabajo = sequelize.define('meta_equipo_trabajo',{
    met_meta_equipo_trabajo_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    met_et_equipo_trabajo_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    met_fecha_apertura: {
        type: Sequelize.DATE,
        allowNull: null
    },
    met_fecha_finalizacion: {
        type: Sequelize.DATE,
        allowNull: null
    },
    met_meta_equipo: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    met_usu_usuario_por_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: null,
        defaultValue: Sequelize.NOW
    },
    met_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    met_usu_modificado_por_id: {
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    }
},
{
    //options
    tableName: 'metas_equipo_trabajo'
});

MetaEquipoTrabajo.belongsTo(ControlMestroMultiple, {
    foreignKey: 'met_cmm_estatus_id',
    as: 'estatus'
});

MetaEquipoTrabajo.hasMany(MetaUsuario, {
    foreignKey: 'mv_met_meta_id'
});
export default MetaEquipoTrabajo;