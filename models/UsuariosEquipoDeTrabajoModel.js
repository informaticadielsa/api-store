import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import Usuario from './UsuarioModel';
const UsuarioEquipoDeTrabajo = sequelize.define('usuario_equipo_de_trabajo',{
    uedt_usuario_equipo_de_trabajo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    uedt_et_equipo_de_trabajo_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    uedt_usu_usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE
    }
},
{
    //Options
    tableName: 'usuarios_equipo_de_trabajo'
});

UsuarioEquipoDeTrabajo.belongsTo(Usuario, {
    foreignKey: 'uedt_usu_usuario_id',
    as: 'vendedor',
    targetKey: 'usu_usuario_id'
});
export default UsuarioEquipoDeTrabajo;