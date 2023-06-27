import { Sequelize } from 'sequelize';
import SociosNegocio from './SociosNegocioModel';
import Usuario from './UsuarioModel';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const UsuariosSociosDeNegocios = sequelize.define('usuario_socio_de_negocio', {
    usn_usuario_socio_de_negocio_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    usn_usu_usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    usn_sn_socio_de_negocio_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    usn_usu_usuario_asignado_por_id:  {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE
    }
},{
    tableName: 'usuarios_socios_de_negocio'
});

UsuariosSociosDeNegocios.belongsTo(Usuario,{
    foreignKey: 'usn_usu_usuario_id',
    as: 'vendedor',
    targetKey: 'usu_usuario_id'
});

UsuariosSociosDeNegocios.belongsTo(SociosNegocio, {
    foreignKey: 'usn_sn_socio_de_negocio_id',
    as: 'socio_de_negocio',
    targetKey: 'sn_socios_negocio_id'
})
export default UsuariosSociosDeNegocios;