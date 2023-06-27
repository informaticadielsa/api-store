import {  Sequelize } from 'sequelize';
import ControlMestroMultiple from './ControlMaestroMultipleModel';
import ProductoColeccion from './ProductoColeccionModel';
import Usuario from './UsuarioModel';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const Coleccion = sequelize.define('coleccion', {
    col_coleccion_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    col_nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    col_descripcion: {
        type: Sequelize.STRING,
        allowNull: false
    },
    col_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    col_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    col_usu_usuario_modificador_id: {
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    col_tipo: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
},
{
    //Optioons
    tableName: 'colecciones'
});

Coleccion.belongsTo(ControlMestroMultiple, {
    foreignKey: 'col_cmm_estatus_id',
    as: 'estatus'
});

Coleccion.belongsTo(Usuario, {
    foreignKey: 'col_usu_usuario_creador_id'
})

Coleccion.hasMany(ProductoColeccion, {
    foreignKey: 'prodcol_col_coleccion_id',
    as: 'producto_coleccions'
});

Coleccion.belongsTo(ControlMestroMultiple, {
    foreignKey: 'col_tipo',
    as: 'tipo'
});

export default Coleccion;