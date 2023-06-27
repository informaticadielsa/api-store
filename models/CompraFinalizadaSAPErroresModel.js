import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';




const CompraFinalizadaSAPErrores = sequelize.define('compras_finalizadas_sap_errores', {
    cfse_compras_finalizadas_sap_errores_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cfse_cf_compra_numero_orden: {
        type: Sequelize.STRING,
    },
    cfse_cf_mensajeov: {
        type: Sequelize.STRING,
    },
    cfse_solucion: {
        type: Sequelize.STRING,
    },
    cfse_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    cfse_cf_usu_usuario_modifica: {
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    }
},
{
    tableName: 'compras_finalizadas_sap_errores'
});


export default CompraFinalizadaSAPErrores;