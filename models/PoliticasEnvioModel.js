import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const PoliticasEnvio = sequelize.define('politicas_envio', {
    poe_politicas_envio_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    poe_nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    poe_monto: {
        type: Sequelize.FLOAT
    },
    poe_dias_minimo: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    poe_dias_maximo: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    poe_cmm_tipo_politica_envio: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    poe_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    poe_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    poe_usu_usuario_modificador_id: {
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    poe_monto_compra_minimo: {
        type: Sequelize.FLOAT
    },
},
{
    tableName: 'politicas_envio'
});

// CiudadesEstados.belongsTo(Estado, {
//     foreignKey: 'city_estpa_estado_pais_id'
// })

export default PoliticasEnvio;