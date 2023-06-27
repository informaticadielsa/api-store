import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const VehiculoSolicitudDeCredito = sequelize.define('vehiculo_solicitud_de_credito',{
    vsdc_vehiculo_solicitud_de_credito_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    vsdc_marca: {
        type: Sequelize.STRING
    },
    vsdc_tipo: {
        type: Sequelize.STRING
    },
    vsdc_model: {
        type: Sequelize.STRING
    },
    vsdc_sdc_solicitud_de_credito_id: {
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
    tableName: 'vehiculos_solicitud_de_credito'
});
export default VehiculoSolicitudDeCredito;