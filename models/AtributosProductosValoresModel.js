import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';
const AtributoProductosValores = sequelize.define('productos_atributos_valores', {
    pav_productos_atributos_valores_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    pav_id_producto: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    pav_atributo_categoria: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    pav_valor: {
        type: Sequelize.STRING,
        allowNull: false
    },
    pav_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    pav_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    pav_usu_usuario_modificador_id:{
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

AtributoProductosValores.belongsTo(ControlMestroMultiple, {
    foreignKey: 'pav_cmm_estatus_id'
});


export default AtributoProductosValores;