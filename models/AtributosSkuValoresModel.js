import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';
const AtributoSkuValores = sequelize.define('sku_atributos_valores', {
    skuav_sku_atributos_valores_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    skuav_id_sku: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    skuav_id_atributo_producto: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    skuav_valor: {
        type: Sequelize.STRING,
        allowNull: false
    },
    skuav_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    skuav_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    skuav_usu_usuario_modificador_id:{
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


AtributoSkuValores.belongsTo(ControlMestroMultiple, {
    foreignKey: 'skuav_cmm_estatus_id'
});



  
export default AtributoSkuValores;