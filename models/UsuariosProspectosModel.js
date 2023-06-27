import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';

const UsuariosProspectos = sequelize.define('usuarios_prospectos',{
    up_usuarios_prospectos_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    up_razon_social: {
        type: Sequelize.STRING
    },
    up_nombre_comercial: {
        type: Sequelize.STRING
    },
    up_rfc: {
        type: Sequelize.STRING
    },
    up_email_facturacion: {
        type: Sequelize.STRING
    },
    up_direccion_facturacion: {
        type: Sequelize.STRING
    },
    up_codigo_postal: {
        type: Sequelize.STRING
    },
    up_direccion: {
        type: Sequelize.STRING
    },
    up_direccion_num_ext: {
        type: Sequelize.STRING
    },
    up_colonia: {
        type: Sequelize.STRING
    },
    up_ciudad: {
        type: Sequelize.STRING
    },
    up_pais_id: {
        type: Sequelize.STRING
    },
    up_estado_id: {
        type: Sequelize.STRING
    },
    up_cfdi: {
        type: Sequelize.STRING
    },
    up_datos_b2b: {
        type: Sequelize.JSON
    },
    up_sitio_web: {
        type: Sequelize.STRING
    },
    up_numero_cuenta_banco: {
        type: Sequelize.STRING
    },
    up_nombre_banco: {
        type: Sequelize.STRING
    },
    up_forma_pago: {
        type: Sequelize.STRING
    },
    up_medio_pago: {
        type: Sequelize.STRING
    },
    up_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    up_usu_usuario_modificado_id:{
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    up_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull:false
    },    
},
{
    //Options
    tableName: 'usuarios_prospectos'
});

export default UsuariosProspectos;