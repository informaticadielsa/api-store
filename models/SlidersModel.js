import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';

const Sliders = sequelize.define('sliders', {
    sld_sliders_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sld_identificador: {
        type: Sequelize.STRING,
        allowNull: false
    },
    sld_nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    sld_descripcion: {
        type: Sequelize.STRING,
        allowNull: false
    },
    sld_url_img: {
        type: Sequelize.STRING,
        allowNull: false
    },
    sld_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    sld_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    sld_usu_usuario_modificador_id: {
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    }
},
{
    tableName: 'sliders'
});


Sliders.belongsTo(ControlMestroMultiple, {
    foreignKey: 'sld_cmm_estatus_id'
})
export default Sliders;