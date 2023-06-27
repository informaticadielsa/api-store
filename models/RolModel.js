import {  Sequelize } from 'sequelize';
import ControlMestroMultiple from './ControlMaestroMultipleModel';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import RolPermiso from './RolPermisoModel';
import cmm from '../mapeos/mapeoControlesMaestrosMultiples';

const Rol = sequelize.define('role', { 
    rol_rol_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    rol_nombre: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    rol_descripcion:{
        type: Sequelize.STRING
    },
    rol_cmm_estatus:{
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    rol_usu_usuario_creado_por_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW 
    },
    rol_usu_usuario_modificado_por_id: {
        type: Sequelize.INTEGER
    },
    updatedAt:{
        type: Sequelize.DATE
    },
    rol_tipo_rol_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: cmm.TIPO_ROL_MENU.ADMINISTRADOR
    }
},{
    //options
});

Rol.belongsTo(ControlMestroMultiple, {
    foreignKey: 'rol_cmm_estatus',
    as: 'estatusId'
});
Rol.belongsTo(ControlMestroMultiple, { 
    foreignKey: 'rol_tipo_rol_id', 
    as: 'tipoRol' 
});
Rol.hasMany(RolPermiso, { 
    foreignKey: 'rol_per_rol_rol_id' 
});
export default Rol;