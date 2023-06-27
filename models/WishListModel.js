import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';
import WishListProductos from './WishListProductosModel';

const WishList = sequelize.define('wish_list', {
    wl_wish_list_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    wl_nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    wl_sn_socios_negocio_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    wl_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    wl_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    wl_usu_usuario_modificador_id: {
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    }
},
{
    tableName: 'wish_list'
});


WishList.belongsTo(ControlMestroMultiple, {
    foreignKey: 'wl_cmm_estatus_id'
})

WishList.belongsTo(WishListProductos,{
    foreignKey: 'wl_wish_list_id',
    targetKey: 'wlp_wish_list_id'
});


export default WishList;