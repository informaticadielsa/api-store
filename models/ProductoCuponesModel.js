import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const ProductoCupones = sequelize.define('productos_cupones', {
    prodcup_producto_cupones_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    prodcup_promcup_promociones_cupones_id:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    prodcup_prod_producto_id:{
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
    tableName: 'productos_cupones'
});
export default ProductoCupones;