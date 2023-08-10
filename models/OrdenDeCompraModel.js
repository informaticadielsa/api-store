import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const OrdenDeCompra = sequelize.define('orden_de_compra',
{
    odc_orden_de_compra_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    odc_numero_orden: {
        type: Sequelize.STRING,
        allowNull: false
    },
    odc_nombre_archivo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    odc_ruta_archivo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    odc_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
        //allowNull: false
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
    tableName: 'orden_de_compra'
});

// ProductoDataSheet.belongsTo(Usuario, {
//     foreignKey: 'pds_usu_usuario_creador_id',
//     as: 'usuario_creador_id'
// });
export default OrdenDeCompra;