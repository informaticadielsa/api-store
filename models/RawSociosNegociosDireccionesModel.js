import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const RawSociosNegociosDirecciones = sequelize.define('raw_socios_negocios_direcciones', {
    raw_socios_negocios_direcciones_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    calle: {
        type: Sequelize.STRING
    },
    ciudad: {
        type: Sequelize.STRING
    },
    codigoPostal: {
        type: Sequelize.STRING
    },
    colonia: {
        type: Sequelize.STRING
    },
    estado: {
        type: Sequelize.STRING
    },
    idDireccion: {
        type: Sequelize.STRING
    },
    numInterior: {
        type: Sequelize.STRING
    },
    pais: {
        type: Sequelize.STRING
    },
    tipoDir: {
        type: Sequelize.STRING
    },
    codigoClientePadre: {
        type: Sequelize.STRING
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE
    }
},{
    //options
    tableName: 'raw_socios_negocios_direcciones'
});



export default RawSociosNegociosDirecciones;