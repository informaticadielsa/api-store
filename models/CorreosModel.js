import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';

const Correos = sequelize.define('correos', {
    cor_correos_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cor_pcf_producto_compra_finalizada_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    cor_cmm_tipo_correo: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    cor_pcf_cf_compra_finalizada_id: {
        type: Sequelize.INTEGER
    },
},
{
    tableName: 'correos'
});


export default Correos;