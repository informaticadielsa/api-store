import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';

const Fleteras = sequelize.define('fleteras', {
    flet_fletera_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    flet_nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    flet_codigo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    flet_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    flet_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    flet_usu_usuario_modificado_id: {
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    }
},
{
    tableName: 'fleteras'
});


Fleteras.belongsTo(ControlMestroMultiple, {
    foreignKey: 'flet_cmm_estatus_id'
})
export default Fleteras;