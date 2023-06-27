import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';
import ProductoListaPrecio from './ProductoListaPrecioModel';
const ListaPrecio = sequelize.define('lista_de_precio', {
    listp_lista_de_precio_id: {        
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    listp_nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    listp_descripcion: {
        type: Sequelize.STRING,
        allowNull: false
    },
    listp_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    listp_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    listp_usu_usuario_modificador_id: {
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    listp_tipo_precio: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    listp_descuento: {
        type: Sequelize.INTEGER
    }
},{
    //options
    tableName: 'listas_de_precios'
})

ListaPrecio.belongsTo(ControlMestroMultiple, {
    foreignKey: 'listp_cmm_estatus_id',
    as: 'EstatusControl'
});

ListaPrecio.belongsTo(ControlMestroMultiple, {
    foreignKey: 'listp_tipo_precio',
    as: 'TipoPrecio'
});

ListaPrecio.hasMany(ProductoListaPrecio, {
    foreignKey: 'pl_listp_lista_de_precio_id'
});
export default ListaPrecio;