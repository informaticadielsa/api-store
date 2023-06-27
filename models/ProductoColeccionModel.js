import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import Producto from './ProductoModel';
const ProductoColeccion = sequelize.define('producto_coleccion', {
    prodcol_producto_coleccion_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    prodcol_col_coleccion_id: {
        type: Sequelize.INTEGER
    },
    prodcol_prod_producto_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE
    }
},
{
    //options
    tableName: 'productos_colecciones'
});

ProductoColeccion.belongsTo(Producto, {
    foreignKey: 'prodcol_prod_producto_id'
});
export default ProductoColeccion;