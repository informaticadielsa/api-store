import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const ProductoPromocion = sequelize.define('producto_promocion', {
    prodprom_producto_promocion_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    prodprom_promdes_promocion_descuento_id:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    prodprom_prod_producto_id:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt:{
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updatedAt:{
        type: Sequelize.DATE
    },
},
{
    //Options
    tableName: 'productos_promociones'
});
export default ProductoPromocion;