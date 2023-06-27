import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const RawArticulosBom = sequelize.define('raw_articulos_bom', {
    raw_articulos_bom_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    cantidad: {
        type: Sequelize.INTEGER,
    },
    codigoArticulo: {
        type: Sequelize.STRING,
    },
    componentes: {
        type: Sequelize.JSON,
    },
    nombreArticulo: {
        type: Sequelize.STRING,
    },
    tipo: {
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
    tableName: 'raw_articulos_bom'
});



export default RawArticulosBom;