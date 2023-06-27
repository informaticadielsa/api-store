import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';
const Atributo = sequelize.define('atributos', {
    at_atributo_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    at_nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    at_descripcion: {
        type: Sequelize.STRING,
        allowNull: false
    },
    at_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    at_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    at_usu_usuario_modificador_id:{
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    }
},
{
    //Options
}
);


Atributo.belongsTo(ControlMestroMultiple, {
    foreignKey: 'at_cmm_estatus_id'
});
  
export default Atributo;