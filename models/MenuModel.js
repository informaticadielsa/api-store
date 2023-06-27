import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';
const Menu = sequelize.define('menu', {
    mn_menu_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    mn_nombre:{
        type: Sequelize.STRING,
        allowNull: false
    },
    mn_ruta: {
        type: Sequelize.STRING,
        allowNull: false
    },
    mn_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    mn_usu_usuario_creado_por_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt:{
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    cm_usu_usuario_modificado_id:{
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    }
},
{
    //Options
});
    
Menu.belongsTo(ControlMestroMultiple, {
    foreignKey: 'mn_cmm_estatus_id'
});  
export default Menu;