import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const Pais = sequelize.define('pais', {
    pais_pais_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    pais_abreviatura: {
        type: Sequelize.STRING,
        allowNull: false
    },
    pais_nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    pais_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    pais_usu_modificado_por_id: {
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    }
},{
    //options
    tableName: 'paises'
});

export default Pais;