import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';

const ProductosKitComponentes = sequelize.define('productos_kits_componentes', {
    prodkitcomp_productos_kits_componentes_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    prodkitcomp_sku: {
        type: Sequelize.STRING,
        allowNull: false
    },
    prodkitcomp_cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    prodkitcomp_num_componente: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    prodkitcomp_id_kit_padre: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    prodkitcomp_usu_usuario_creado_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    prodkitcomp_usu_usuario_modificado_id: {
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    }
},
{
    tableName: 'productos_kits_componentes'
});


// ProductosKitComponentes.belongsTo(ControlMestroMultiple, {
//     foreignKey: 'mar_cmm_estatus_id'
// })
export default ProductosKitComponentes;