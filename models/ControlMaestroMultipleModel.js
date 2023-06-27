import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const ControlMestroMultiple = sequelize.define('controles_maestros_multiple', { 
    cmm_control_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    cmm_nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    cmm_valor: {
        type: Sequelize.STRING,
        allowNull: false
    },
    cmm_sistema:  {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    cmm_activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    cmm_usu_usuario_creado_por_id:  {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt:{
      type: Sequelize.DATE,
      allowNull: false
    },
    cmm_usu_usuario_modificado_por_id:  {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    updatedAt: {
      type: Sequelize.DATE
    }
},
{
    //options
}
);

export default ControlMestroMultiple;