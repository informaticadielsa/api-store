import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';

const VendedoresSap = sequelize.define('vendedores_sap',{
    vendsap_vendedores_sap_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    vendsap_codigo_vendedor: {
        type: Sequelize.STRING,
        allowNull: false
    },
    vendsap_nombre_vendedor: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    vendsap_email: {
        type: Sequelize.STRING,
    },
    vendsap_cmm_estatus_id: {
        type: Sequelize.INTEGER,
    },    
    vendsap_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    vendsap_usu_usuario_modificado_id:{
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    vendsap_telefono: {
        type: Sequelize.STRING,
    },
    vendsap_mobil: {
        type: Sequelize.STRING,
    }
},
{
    //Options
    tableName: 'vendedores_sap'
});



export default VendedoresSap;