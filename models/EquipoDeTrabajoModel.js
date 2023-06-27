import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';
import MetaEquipoTrabajo from './MetaEquipoTrabajoModel';
import UsuarioEquipoDeTrabajo from './UsuariosEquipoDeTrabajoModel';
import Usuario from './UsuarioModel';
const EquipoDeTrabajo = sequelize.define('equipo_de_trabajo',{
    et_equipo_trabajo_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    et_nombre:{
        type: Sequelize.STRING,
        allowNull: false
    },
    et_descripcion: {
        type: Sequelize.STRING,
        allowNull: false
    },
    et_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull:false
    },
    et_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
        allowNull: null
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    et_usu_usuario_modificado_id:{
        type: Sequelize.INTEGER
    },
    et_usu_usuario_gerente_id:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    updatedAt: {
        type: Sequelize.DATE
    }
},
{
    //options
    tableName: 'equipos_de_trabajo'
});

EquipoDeTrabajo.belongsTo(ControlMestroMultiple,{
    foreignKey: 'et_cmm_estatus_id'
});

EquipoDeTrabajo.belongsTo(Usuario,{
    foreignKey: 'et_usu_usuario_creador_id',
    as: 'usuario_creador'
});

EquipoDeTrabajo.belongsTo(Usuario, {
    foreignKey: 'et_usu_usuario_modificado_id',
    as: 'usuario_modificador'
});

EquipoDeTrabajo.belongsTo(Usuario, {
    foreignKey: 'et_usu_usuario_gerente_id',
    as: 'gerente'
});
EquipoDeTrabajo.hasMany(MetaEquipoTrabajo, {
    foreignKey: 'met_et_equipo_trabajo_id',
    as: 'metas'
});

EquipoDeTrabajo.hasMany(UsuarioEquipoDeTrabajo, {
    foreignKey: 'uedt_et_equipo_de_trabajo_id',
    as: 'usuarios_de_equipo'

});
export default EquipoDeTrabajo;