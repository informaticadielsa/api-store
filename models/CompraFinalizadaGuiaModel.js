import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const ComprasFinalizadasGuias = sequelize.define('compras_finalizadas_guias',{
    cfguias_compras_finalizadas_guias_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    cfguias_cf_compra_finalizada_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    cfguias_carrier: {
        type: Sequelize.STRING,
        allowNull: false
    },
    cfguias_guia: {
        type: Sequelize.STRING,
        allowNull: false
    },
    cfguias_usu_usuario_creador_id: {
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
    },
    cf_promcup_promociones_cupones_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
},
{
    //Options
    tableName: 'compras_finalizadas_guias'
});


export default ComprasFinalizadasGuias;