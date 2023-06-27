import {  Sequelize } from 'sequelize';
import ControlMestroMultiple from './ControlMaestroMultipleModel';
import Usuario from './UsuarioModel';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const MetaUsuario = sequelize.define('meta_vendedor',{
    mv_meta_vendedor_id : {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    mv_met_meta_id : {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    mv_usu_usuario_id : {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    mv_cuota : {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt : {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedAt : {
        type: Sequelize.DATE
    },
    mv_cmm_status_id : {
        type: Sequelize.INTEGER,
        allowNull: false
    },
},
{
    //Options
    tableName: 'metas_vendedor'
});

MetaUsuario.belongsTo(ControlMestroMultiple, {
    foreignKey: 'mv_cmm_status_id'
})

MetaUsuario.belongsTo(Usuario, {
    foreignKey: 'mv_usu_usuario_id',
    as: 'vendedor'
});
export default MetaUsuario;