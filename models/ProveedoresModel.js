import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';
import Producto from './ProductoModel';

const Proveedores = sequelize.define('proveedores', {
    //Properties table
    prv_proveedores_id: {
        type:   Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    prv_nombre: {
        type:   Sequelize.STRING,
        allowNull: false
    },
    prv_cmm_estatus_id: {
        type:   Sequelize.STRING,
        allowNull: false
    },
    prv_usu_usuario_creador_id: {
        type:   Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type:   Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    prv_usu_usuario_modificador_id: {
        type:   Sequelize.INTEGER
    },
    updatedAt: {
        type:   Sequelize.DATE
    }
},
{
    //options
    tableName: 'proveedores'
});





export default Proveedores;