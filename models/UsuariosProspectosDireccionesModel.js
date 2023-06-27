import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);




const UsuariosProspectosDirecciones = sequelize.define('usuarios_prospectos_direcciones',{
    upd_direcciones_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    upd_pais_id: {
        type: Sequelize.STRING
    },
    upd_estado_id: {
        type: Sequelize.STRING
    },
    upd_ciudad: {
        type: Sequelize.STRING
    },
    upd_direccion: {
        type: Sequelize.STRING
    },
    upd_direccion_num_ext: {
        type: Sequelize.STRING
    },
    upd_direccion_num_int: {
        type: Sequelize.STRING
    },
    upd_direccion_telefono: {
        type: Sequelize.STRING
    },
    upd_calle1: {
        type: Sequelize.STRING
    },
    upd_calle2: {
        type: Sequelize.STRING
    },
    upd_codigo_postal: {
        type: Sequelize.STRING,
        allowNull: false
    },
    upd_colonia: {
        type: Sequelize.STRING,
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    upd_up_usuarios_prospectos_id: {
        type: Sequelize.INTEGER
    },
    upd_alias: {
        type: Sequelize.STRING
    },
    upd_contacto: {
        type: Sequelize.STRING
    },
    upd_telefono: {
        type: Sequelize.STRING
    },
},
{
    //Options
    tableName: 'usuarios_prospectos_direcciones'
});








export default UsuariosProspectosDirecciones;