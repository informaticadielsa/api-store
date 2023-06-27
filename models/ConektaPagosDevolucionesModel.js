import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';

const ConektaPagosDevoluciones = sequelize.define('conekta_pagos_devoluciones', {
    cnkd_conekta_pagos_devoluciones: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cnkd_cdc_numero_orden: {
        type: Sequelize.STRING,
        allowNull: false
    },
    cnkd_respuesta: {
        type: Sequelize.JSON,
        allowNull: false
    },
    cnkd_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    cnkd_conekta_error_message: {
        type: Sequelize.STRING
    },
    cnkd_conekta_status: {
        type: Sequelize.STRING
    },
},
{
    tableName: 'conekta_pagos_devoluciones'
});


export default ConektaPagosDevoluciones;