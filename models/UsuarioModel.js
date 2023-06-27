import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';
import Rol from './RolModel';
// import UsuariosSociosDeNegocios from './UsuariosSociosDeNegocioModel';
const Usuario = sequelize.define('usuario', {
  usu_usuario_id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  usu_nombre: {
    type: Sequelize.STRING,
    allowNull: false
  },
  usu_primer_apellido:{
    type: Sequelize.STRING,
    allowNull: false
  },
  usu_segundo_apellido:{
    type: Sequelize.STRING
  },
  usu_correo_electronico:{
    type: Sequelize.STRING,
    isUnique :true,
    allowNull:false,
    validate:{
        isEmail : true
    }
  },
  usu_contrasenia:{
    type: Sequelize.STRING,
    allowNull: false
  },
  usu_imagen_perfil_id:{
    type: Sequelize.STRING
  },
  usu_rol_rol_id:{
    type: Sequelize.INTEGER,
    allowNull: false
  },
  usu_cmm_estatus_id:{
    type: Sequelize.INTEGER
  },
  usu_usuario_creado_por_id:{
    type: Sequelize.STRING
  },
  createdAt:{
    type: Sequelize.DATE,
    allowNull: false
  },
  usu_usuario_modificado_por_id:{
    type: Sequelize.INTEGER
  },
  usu_codigo_vendedor:{
    type: Sequelize.STRING
  },
  usu_usuario_telefono:{
    type: Sequelize.STRING
  },
  usu_usuario_mobil:{
    type: Sequelize.STRING
  },
  updatedAt: {
    type: Sequelize.DATE
  },
  usu_vendedor_gerente:{
    type: Sequelize.INTEGER
  },
  },{
    //options
    tableName: 'usuarios'
  }
);

Usuario.belongsTo(ControlMestroMultiple, {
  foreignKey: 'usu_cmm_estatus_id',
  as: 'estatus_usuario'
});

Usuario.belongsTo(Rol, {
  foreignKey: 'usu_rol_rol_id'
});


Usuario.belongsTo(Usuario, {
  foreignKey: 'usu_usuario_creado_por_id',
  as: 'creador'
});
export default Usuario;