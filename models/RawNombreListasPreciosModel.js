import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const RawNombreListasPrecios = sequelize.define('raw_nombre_listas_precios', {
    raw_nombre_listas_precios_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    codigoListaPrecios: {
        type: Sequelize.STRING
    },
    factor: {
        type: Sequelize.INTEGER
    },
    nombreListaPrecios: {
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
    tableName: 'raw_nombre_listas_precios'
});



export default RawNombreListasPrecios;