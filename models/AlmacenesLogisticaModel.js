import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const AlmacenesLogistica = sequelize.define('almacenes_logistica',{
    almlog_almacenes_logistica_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    almlog_pais_pais_id_origen: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    almlog_estpa_estado_pais_nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    almlog_almacen_codigo: {
        type: Sequelize.STRING,
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
},
{
    //Options
    tableName: 'almacenes_logistica'
});

export default AlmacenesLogistica;