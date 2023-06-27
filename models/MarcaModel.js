import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';

const Marca = sequelize.define('marca', {
    mar_marca_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mar_nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    mar_abreviatura: {
        type: Sequelize.STRING,
        allowNull: false
    },
    mar_descripcion: {
        type: Sequelize.STRING,
        allowNull: false
    },
    mar_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    mar_usu_usuario_creado_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    mar_usu_usuario_modificado_id: {
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    mar_descuento: {
        type: Sequelize.INTEGER
    },
    mar_limitante: {
        type: Sequelize.BOOLEAN
    },
    mar_importe: {
        type: Sequelize.DECIMAL(10,2),
        field: 'mar_importe'
    },
    mar_propiedades_extras: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    mar_cantidad_producto: {
        type: Sequelize.INTEGER
    },
    mar_meta_titulo: {
        type: Sequelize.STRING
    },
    mar_meta_descripcion: {
        type: Sequelize.STRING
    },
    mar_marca_link: {
        type: Sequelize.STRING
    },
},
{
    tableName: 'marcas'
});


Marca.belongsTo(ControlMestroMultiple, {
    foreignKey: 'mar_cmm_estatus_id'
})
export default Marca;