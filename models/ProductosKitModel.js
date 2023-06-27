import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';
import Producto from './ProductoModel';

const ProductosKit = sequelize.define('productos_kits', {
    prodkit_productos_kits_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    prodkit_sku: {
        type: Sequelize.STRING,
        allowNull: false
    },
    prodkit_nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    prodkit_cantidad_componentes: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    prodkit_tipo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    prodkit_cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    prodkit_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    prodkit_usu_usuario_creado_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    prodkit_usu_usuario_modificado_id: {
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    }
},
{
    tableName: 'productos_kits'
});

ProductosKit.belongsTo(ControlMestroMultiple, {
    foreignKey: 'prodkit_cmm_estatus_id'
})
ProductosKit.belongsTo(Producto, {
    foreignKey: 'prodkit_sku'
})
export default ProductosKit;