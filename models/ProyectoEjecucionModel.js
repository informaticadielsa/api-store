import {  Sequelize } from 'sequelize';
import TipoEjecucion from './TipoEjecucionModel';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const ProyectoEjecucion = sequelize.define('ProyectoEjecucion', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    estructuraEjecucion: {
        type: Sequelize.STRING
    },
    tipoEjecucion: {
        type: Sequelize.INTEGER
    },
    ejecutado: {
        type: Sequelize.INTEGER,
    },
    fechaEjecucion: {
        type: Sequelize.DATE
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
    },
},
{
    //Options
    tableName: 'proyecto_ejecucion'
});

ProyectoEjecucion.belongsTo(TipoEjecucion, {
    foreignKey: 'tipoEjecucion'
});

export default ProyectoEjecucion;
