import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';
import Paises from './PaisModel';
import Estados from './EstadoModel';
import SociosNegocio from './SociosNegocioModel';


const SociosNegocioDirecciones = sequelize.define('sociosnegociodireccione',{
    snd_direcciones_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    snd_pais_id: {
        type: Sequelize.STRING
    },
    snd_estado_id: {
        type: Sequelize.STRING
    },
    snd_ciudad: {
        type: Sequelize.STRING
    },
    snd_direccion: {
        type: Sequelize.STRING
    },
    snd_direccion_num_ext: {
        type: Sequelize.STRING
    },
    snd_direccion_num_int: {
        type: Sequelize.STRING
    },
    snd_direccion_telefono: {
        type: Sequelize.STRING
    },
    snd_calle1: {
        type: Sequelize.STRING
    },
    snd_calle2: {
        type: Sequelize.STRING
    },
    snd_cardcode: {
        type: Sequelize.STRING
    },
    snd_idDireccion: {
        type: Sequelize.STRING,
    },
    snd_codigo_postal: {
        type: Sequelize.STRING,
        allowNull: false
    },
    snd_tipoDir: {
        type: Sequelize.STRING,
    },
    snd_colonia: {
        type: Sequelize.STRING,
    },
    snd_cmm_estatus_id: {
        type: Sequelize.INTEGER
    },
    snd_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    snd_usu_usuario_modificado_id:{
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    snd_sn_socio_de_negocio_id: {
        type: Sequelize.INTEGER
    },
    snd_alias: {
        type: Sequelize.STRING
    },
    snd_direccion_envio_default: {
        type: Sequelize.BOOLEAN
    },
    snd_contacto: {
        type: Sequelize.STRING
    },
    snd_telefono: {
        type: Sequelize.STRING
    },
},
{
    //Options
    tableName: 'socios_negocio_direcciones'
});







SociosNegocioDirecciones.belongsTo(ControlMestroMultiple,{
    foreignKey: 'snd_cmm_estatus_id'
});

SociosNegocioDirecciones.belongsTo(Paises,{
    foreignKey: 'snd_pais_id'
});

SociosNegocioDirecciones.belongsTo(Estados,{
    foreignKey: 'snd_estado_id'
});

SociosNegocioDirecciones.belongsTo(SociosNegocio,{
    foreignKey: 'snd_cardcode'
});




export default SociosNegocioDirecciones;