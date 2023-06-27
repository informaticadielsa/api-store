import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const RawArticulosPropiedades = sequelize.define('raw_articulos_propiedades', {
    raw_articulos_propiedades_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    descripcion: {
        type: Sequelize.STRING,
    },
    propiedad: {
        type: Sequelize.STRING,
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
    tableName: 'raw_articulos_propiedades'
});



export default RawArticulosPropiedades;