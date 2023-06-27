import { Sequelize } from 'sequelize';
import SociosNegocio from './SociosNegocioModel';
import Usuario from './UsuarioModel';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const GerentesSocioNegocios = sequelize.define('gerente_socios', {
    gs_gerente_socio_negocio_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    gs_gerente_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    gs_socio_negocio_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    gs_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    gs_usu_usuario_modificado_por_id: {
        type: Sequelize.INTEGER
    },
},{
    tableName: 'gerentes_socios_de_negocio'
});

GerentesSocioNegocios.belongsTo(SociosNegocio, {
    foreignKey: 'gs_socio_negocio_id',
    as: 'socio_de_negocio'
});
GerentesSocioNegocios.belongsTo(Usuario, {
    foreignKey: 'gs_gerente_id',
    as: 'gerente'
});
export default GerentesSocioNegocios;