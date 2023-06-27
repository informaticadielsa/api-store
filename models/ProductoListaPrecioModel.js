import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

import Producto from './ProductoModel';
const ProductoListaPrecio = sequelize.define('productos_lista_de_precios', {
    pl_producto_lista_precio_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    pl_prod_producto_id: {
        type: Sequelize.INTEGER
    },
    pl_listp_lista_de_precio_id: {
        type: Sequelize.INTEGER
    },
    pl_precio_producto: {
        type: Sequelize.DECIMAL(10,2),
        field: 'pl_precio_producto'
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    pl_tipo_moneda: {
        type: Sequelize.STRING
    },
    pl_precio_usd: {
        type: Sequelize.DECIMAL(10,2),
        field: 'pl_precio_usd'
    }
},
{
    //Options
    tableName: 'productos_lista_de_precio'
});

ProductoListaPrecio.belongsTo(Producto, {
    foreignKey: 'pl_prod_producto_id'
});

export default ProductoListaPrecio;