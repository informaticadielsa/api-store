import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';
import Atributo from './AtributoModel';
const AtributoCategorias = sequelize.define('atributos_categorias', {
    atc_atributos_categorias_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    atc_id_atributo: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    atc_id_categoria: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    atc_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    atc_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    atc_usu_usuario_modificador_id:{
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


AtributoCategorias.belongsTo(ControlMestroMultiple, {
    foreignKey: 'atc_cmm_estatus_id'
});

AtributoCategorias.belongsTo(Atributo, {
    foreignKey: 'atc_id_atributo'
});

  
export default AtributoCategorias;