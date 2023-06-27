import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const SucursalSolicitudDeCredito = sequelize.define('sucursal_solicitud_de_credito',{
    ssdc_sucursal_solicitud_de_credito_id: {
        type: Sequelize.INTEGER,
        allowNull: false, 
        primaryKey: true,
        autoIncrement: true
    },
    ssdc_codigo_postal: {
        type: Sequelize.STRING
    },
    ssdc_calle: {
        type: Sequelize.STRING
    },
    ssdc_numero: {
        type: Sequelize.STRING
    },
    ssdc_colonia: {
        type: Sequelize.STRING
    },
    ssdc_municipio: {
        type: Sequelize.STRING
    },
    ssdc_estado: {
        type: Sequelize.STRING
    },
    ssdc_telefono: {
        type: Sequelize.STRING
    },
    ssdc_correo_electronico: {
        type: Sequelize.STRING
    },
    ssdc_solicitud_de_credito_id: {
        type: Sequelize.INTEGER
    },
    createdAt: {
        type:   Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE
    },
},
{
    //options
    tableName: 'sucursales_solicitud_de_credito'
});
export default SucursalSolicitudDeCredito;