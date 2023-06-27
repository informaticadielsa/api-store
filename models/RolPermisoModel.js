import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import Menu from './MenuModel';
const RolPermiso = sequelize.define('roles_permiso', {
    rol_per_roles_permisos_id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    rol_per_rol_rol_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    rol_per_mu_menu_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    rol_per_ver: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    rol_per_editar: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    rol_per_crear: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    rol_per_eliminar: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE
    }
},{
    //options
});
RolPermiso.belongsTo(Menu, {
    foreignKey: 'rol_per_mu_menu_id'
});
export default RolPermiso;