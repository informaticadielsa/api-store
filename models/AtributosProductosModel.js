import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';
const AtributoProductos = sequelize.define('atributos_productos', {
    atp_atributo_producto_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    atp_id_atributo: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    atp_id_producto: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    atp_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    atp_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    atp_usu_usuario_modificador_id:{
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


AtributoProductos.belongsTo(ControlMestroMultiple, {
    foreignKey: 'atp_cmm_estatus_id'
});



  
export default AtributoProductos;