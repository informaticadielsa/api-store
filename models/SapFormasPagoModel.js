import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';

const SapFormasPago = sequelize.define('sap_formas_pago', {
    sfp_sap_formas_pago_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sfp_clave: {
        type: Sequelize.STRING,
        allowNull: false
    },
    sfp_descripcion: {
        type: Sequelize.STRING,
    },
    sfp_cmm_estatus_id: {
        type: Sequelize.INTEGER,
    },
},
{
    tableName: 'sap_formas_pago'
});


SapFormasPago.belongsTo(ControlMestroMultiple, {
    foreignKey: 'sfp_cmm_estatus_id'
})
export default SapFormasPago;