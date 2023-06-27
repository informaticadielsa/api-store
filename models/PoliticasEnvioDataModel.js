import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
// import Estado from './EstadoModel';

const PoliticasEnvioData = sequelize.define('politicas_envio_data', {
    poedata_politicas_envio_data_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    poedata_poe_politicas_envio_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    poedata_pais_pais_id: {
        type: Sequelize.INTEGER,
    },
    poedata_estpa_estado_pais_id: {
        type: Sequelize.INTEGER,
    },
    poedata_city_ciudades_estados_id: {
        type: Sequelize.INTEGER,
    },
    poedata_cp_inicio: {
        type: Sequelize.INTEGER,
    },
    poedata_cp_final: {
        type: Sequelize.INTEGER,
    },
    poedata_usu_usuario_creador_id: {
        type: Sequelize.INTEGER
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    poedata_usu_usuario_modificador_id: {
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    }
},
{
    tableName: 'politicas_envio_data'
});

// CiudadesEstados.belongsTo(Estado, {
//     foreignKey: 'politicas_envio_data'
// })

export default PoliticasEnvioData;