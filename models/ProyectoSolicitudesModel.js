import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const ProyectoSolicitudes = sequelize.define('ProyectoSolicitudes', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    contacto: {
        type: Sequelize.STRING
    },
    telefono: {
        type: Sequelize.STRING
    },
    correo: {
        type: Sequelize.STRING
    },
    usuarioFinal: {
        type: Sequelize.STRING
    },
    usuarioFinal: {
        type: Sequelize.STRING
    },
    ciudad: {
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
    cardcode: {
        type: Sequelize.STRING
    }
},
{
    //Options
    tableName: 'proyecto_solicitudes'
});

export default ProyectoSolicitudes;
