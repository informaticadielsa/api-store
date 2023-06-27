import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import Producto from './ProductoModel';

const WishListProductos = sequelize.define('wish_list_productos', {
    wlp_wish_list_productos: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    wlp_wish_list_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    wlp_prod_producto_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    wlp_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    // wlp_cantidad: {
    //     type: Sequelize.INTEGER,
    //     allowNull: false
    // },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    wlp_usu_usuario_modificador_id: {
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    }
},
{
    tableName: 'wish_list_productos'
});


// WishListProductos.belongsTo(WishList, {
//     foreignKey: 'wlp_wish_list_id'
// })

WishListProductos.belongsTo(Producto, {
    foreignKey: 'wlp_prod_producto_id'
})

export default WishListProductos;