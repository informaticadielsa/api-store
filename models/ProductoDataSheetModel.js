import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import Usuario from './UsuarioModel';
const ProductoDataSheet = sequelize.define('data_sheet',
{
    pds_producto_data_sheet_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    pds_prod_producto_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    pds_nombre_data_sheet: {
        type: Sequelize.STRING,
        allowNull: false
    },
    pds_ruta_archivo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    pds_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    updatedAt: {
        type: Sequelize.DATE
    },
},
{
    //Options
    tableName: 'productos_data_sheet'
});

// ProductoDataSheet.belongsTo(Usuario, {
//     foreignKey: 'pds_usu_usuario_creador_id',
//     as: 'usuario_creador_id'
// });
export default ProductoDataSheet;