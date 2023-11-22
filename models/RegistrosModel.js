import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const Registros = sequelize.define('Registros', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true, 
    },
    seccion: {
        type: Sequelize.STRING
    },
    descripcion: {
        type: Sequelize.STRING
    }, 
    sistema: {
        type: Sequelize.STRING
    },
    usuario: {
        type: Sequelize.STRING
    },
    tipoRegistro: {
        type: Sequelize.STRING
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
    },
},
{
    //Options
    tableName: 'registros_logs'
});

export default Registros;
