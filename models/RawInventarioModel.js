import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const RawInventario = sequelize.define('raw_inventario', {
    raw_inventario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    codigoArticulo: {
        type: Sequelize.STRING
    },
    cantidad: {
        type: Sequelize.INTEGER
    },
    codigoAlmacen: {
        type: Sequelize.STRING
    },
    disponible: {
        type: Sequelize.STRING
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    comprometido: {
        type: Sequelize.INTEGER
    },
},{
    //options
    tableName: 'raw_inventario'
});



export default RawInventario;