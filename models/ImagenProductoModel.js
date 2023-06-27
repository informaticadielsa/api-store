import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const ImagenProducto = sequelize.define('imagen_producto',{
    imgprod_imagen_producto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    imgprod_prod_producto_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    imgprod_nombre_archivo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    imgprod_ruta_archivo:{
        type: Sequelize.STRING,
        allowNull: false
    },
    imgprod_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue:  Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE
    }
},
{
    tableName: 'imagenes_producto'
});
export default ImagenProducto;