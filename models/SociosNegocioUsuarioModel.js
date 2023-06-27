import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';
import SociosNegocio from './SociosNegocioModel';
import Rol from './RolModel';
const SociosNegocioUsuario = sequelize.define('sociosnegociousuario',{
    snu_usuario_snu_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    snu_cardcode: {
        type: Sequelize.STRING
    },
    snu_nombre: {
        type: Sequelize.STRING
    },
    snu_primer_apellido: {
        type: Sequelize.STRING,
    },
    snu_segundo_apellido: {
        type: Sequelize.STRING
    },
    snu_correo_electronico: {
        type: Sequelize.STRING,
        unique: true
    },
    snu_direccion: {
        type: Sequelize.STRING
    },
    snu_telefono: {
        type: Sequelize.STRING
    },
    snu_usuario: {
        type: Sequelize.STRING
    },
    snu_contrasenia: {
        type: Sequelize.STRING
    },
    snu_genero: {
        type: Sequelize.STRING
    },
    snu_cmm_estatus_id: {
        type: Sequelize.INTEGER
    },
    snu_usu_usuario_creador_id: {
        type: Sequelize.INTEGER
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    snu_usu_usuario_modificado_id:{
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    snu_sn_socio_de_negocio_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    snu_snu_usuario_snu_creador_id: {
        type: Sequelize.INTEGER
    },
    snu_super_usuario: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    snu_menu_roles: {
        type: Sequelize.STRING
    },
    snu_area: {
        type: Sequelize.STRING
    },
    snu_puesto: {
        type: Sequelize.STRING
    }
},
{
    //Options
    tableName: 'socios_negocio_usuario'
});

SociosNegocioUsuario.belongsTo(ControlMestroMultiple,{
    foreignKey: 'snu_cmm_estatus_id'
});

SociosNegocioUsuario.belongsTo(SociosNegocio,{
    foreignKey: 'snu_cardcode'
});


SociosNegocioUsuario.belongsTo(SociosNegocioUsuario, {
    foreignKey: 'snu_snu_usuario_snu_creador_id',
    as: 'creado_por'
});
export default SociosNegocioUsuario;