import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';

const SapMetodosPago = sequelize.define('sap_metodos_pago', {
    smp_metodos_pago_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    smp_codigo_metodo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    smp_definicion: {
        type: Sequelize.STRING,
    },
    smp_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
},
{
    tableName: 'sap_metodos_pago'
});


SapMetodosPago.belongsTo(ControlMestroMultiple, {
    foreignKey: 'smp_cmm_estatus_id'
})
export default SapMetodosPago;