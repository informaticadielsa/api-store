import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const RawArticulosBomComponentes = sequelize.define('raw_articulos_bom_componentes', {
    raw_articulos_bom_componentes_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    codigoArticulo_padre: {
        type: Sequelize.STRING,
    },
    NumComponente: {
        type: Sequelize.INTEGER,
    },
    cantidad: {
        type: Sequelize.INTEGER,
    },
    codigoArticulo: {
        type: Sequelize.STRING,
    },
    nombreArticulo: {
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
    tableName: 'raw_articulos_bom_componentes'
});



export default RawArticulosBomComponentes;