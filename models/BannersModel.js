import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';

const Banners = sequelize.define('banners', {
    bnr_banners_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    bnr_identificador: {
        type: Sequelize.STRING,
        allowNull: false
    },
    bnr_descripcion: {
        type: Sequelize.STRING,
        allowNull: false
    },
    bnr_url_img: {
        type: Sequelize.STRING,
        allowNull: false
    },
    bnr_nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    bnr_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    bnr_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    bnr_usu_usuario_modificador_id: {
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    }
},
{
    tableName: 'banners'
});


Banners.belongsTo(ControlMestroMultiple, {
    foreignKey: 'bnr_cmm_estatus_id'
})
export default Banners;