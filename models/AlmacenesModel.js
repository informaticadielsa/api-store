import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';
import Usuario from './UsuarioModel';
import Pais from './PaisModel';
import Estado from './EstadoModel';
 
const Almacenes = sequelize.define('almacene',{
    alm_almacen_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    alm_nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    alm_codigo_postal: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    alm_direccion: {
        type: Sequelize.STRING,
        allowNull: false
    },
    alm_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull:false
    },    
    alm_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    alm_usu_usuario_modificado_id:{
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    alm_pais_id : {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    alm_estado_pais_id : {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    alm_tipo_almacen: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    alm_codigoAlmacen: {
        type: Sequelize.STRING,
        allowNull: false
    },
    alm_pickup_stores: {
        type: Sequelize.BOOLEAN
    },
    alm_fisico: {
        type: Sequelize.INTEGER
    }
},
{
    //Options
    tableName: 'almacenes'
});

Almacenes.belongsTo(ControlMestroMultiple,{
    foreignKey: 'alm_cmm_estatus_id',
    as: 'estatusAlmacen'
});

Almacenes.belongsTo(Usuario,{
    foreignKey: 'alm_usu_usuario_creador_id',
    as: 'usuario_creador',
    targetKey: 'usu_usuario_id'
});

Almacenes.belongsTo(Usuario,{
    foreignKey: 'alm_usu_usuario_modificado_id',
    as: 'usuario_modificador',
    targetKey: 'usu_usuario_id'
});


Almacenes.belongsTo(Pais,{
    foreignKey: 'alm_pais_id'
});

Almacenes.belongsTo(Estado,{
    foreignKey: 'alm_estado_pais_id'
});

Almacenes.belongsTo(ControlMestroMultiple,{
    foreignKey: 'alm_tipo_almacen',
    as: 'tipoAlmacen'
});



export default Almacenes;