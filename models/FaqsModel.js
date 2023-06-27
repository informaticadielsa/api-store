import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';
const Faqs = sequelize.define('faqs', {
    //Properties table
    faqs_faqs_id: {
        type:   Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    faqs_identificador: {
        type:   Sequelize.STRING,
        allowNull: false
    },
    faqs_pregunta: {
        type:   Sequelize.STRING,
        allowNull: false
    },
    faqs_respuesta: {
        type: Sequelize.STRING,
        allowNull: false
    },
    faqs_orden: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    faqs_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    faqs_usu_usuario_creado_id: {
        type:   Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type:   Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    faqs_usu_usuario_modificado_id: {
        type:   Sequelize.INTEGER
    },
    updatedAt: {
        type:   Sequelize.DATE
    }
},
{
    //options
    tableName: 'faqs'
});


export default Faqs;