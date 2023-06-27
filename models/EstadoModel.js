import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const Estado = sequelize.define('estado',{
    estpa_estado_pais_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    estpa_pais_pais_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    estpa_estado_nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    estpa_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    estpa_codigo_estado: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    estpa_usu_usuario_modificador_id: {
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    },
},
{
    tableName: 'estados_paises'
});
export default Estado;