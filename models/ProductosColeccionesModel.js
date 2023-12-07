import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import Colecciones from './ColeccionesModel';

const ProductosColecciones = sequelize.define('ProductosColecciones', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    producto_Sku: {
        type: Sequelize.INTEGER
    },
    idColeccion: {
        type: Sequelize.INTEGER
    },
    estatus: {
        type: Sequelize.INTEGER
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
    tableName: 'productos_coleccion'
});

ProductosColecciones.belongsTo(Colecciones, {
    foreignKey: 'idColeccion'
});

export default ProductosColecciones;
