import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
// import Estado from './EstadoModel';

const PoliticasEnvioAlmacenes = sequelize.define('politicas_envio_almacenes', {
    poew_politicas_envio_almacenes_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    poew_poe_politicas_envio_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    poew_alm_almacen_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    poew_usu_usuario_creador_id: {
        type: Sequelize.INTEGER
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    poew_usu_usuario_modificador_id: {
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    }
},
{
    tableName: 'politicas_envio_almacenes'
});

// CiudadesEstados.belongsTo(Estado, {
//     foreignKey: 'city_estpa_estado_pais_id'
// })

export default PoliticasEnvioAlmacenes;