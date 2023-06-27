import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const SociosNegocioDescuentos = sequelize.define('socios_negocio_descuentos', {
    sndes_socios_negocio_descuentos_id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    sndes_codigo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    sndes_tipo: {
        type: Sequelize.STRING
    },
    sndes_fecha_inicio: {
        type: Sequelize.DATE,
        allowNull: false
    },
    sndes_fecha_final: {
        type: Sequelize.DATE,
        allowNull: false
    },
    sndes_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    sndes_porcentaje_descuento: {
        type: Sequelize.DECIMAL(10,2),
        field: 'sndes_porcentaje_descuento'
    },
    sndes_sub_codigo: {
        type: Sequelize.STRING
    },
    sndes_subtipo: {
        type: Sequelize.STRING
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE
    }
},
{
    //Options
    tableName: 'socios_negocio_descuentos'
});


export default SociosNegocioDescuentos;