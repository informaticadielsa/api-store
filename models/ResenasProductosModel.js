import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';

const ResenasProductos = sequelize.define('resenas_productos', {
    //Properties table
    rep_resenas_productos_id: {
        type:   Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    rep_prod_producto_id: {
        type:   Sequelize.INTEGER,
        allowNull: false
    },
    rep_snu_usuario_snu_id: {
        type:   Sequelize.INTEGER,
        allowNull: false
    },
    rep_calificacion: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    rep_comentario: {
        type: Sequelize.STRING,
    },
    rep_aprobado: {
        type: Sequelize.BOOLEAN,
    },
    rep_usu_usuario_creador_id: {
        type:   Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type:   Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    rep_usu_usuario_modificador_id: {
        type:   Sequelize.INTEGER
    },
    updatedAt: {
        type:   Sequelize.DATE
    }
},
{
    //options
    tableName: 'resenas_productos'
});


export default ResenasProductos;