import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';

const ConektaPagos = sequelize.define('conekta_pagos', {
    cnk_conekta_pagos: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cnk_cdc_numero_orden: {
        type: Sequelize.STRING,
        allowNull: false
    },
    cnk_respuesta: {
        type: Sequelize.JSON,
        allowNull: false
    },
    cnk_estatus_pago: {
        type: Sequelize.STRING,
        allowNull: false
    },
    cnk_conekta_order_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    cnk_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    cnk_amount_devolucion: {
        type: Sequelize.INTEGER
    },
},
{
    tableName: 'conekta_pagos'
});


export default ConektaPagos;