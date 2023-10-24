import {  Sequelize } from 'sequelize';
import Proyectos from './ProyectosModel';
import ProyectoEjecucion from './ProyectoEjecucionModel';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const ProyectoFK = sequelize.define('ProyectoFK', {
    idProyecto: {
        type: Sequelize.INTEGER
    },
    idProyectoEjecucion: {
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
    tableName: 'proyecto_fk'
});

ProyectoFK.belongsTo(Proyectos, {
    foreignKey: 'idProyecto'
});

ProyectoFK.belongsTo(ProyectoEjecucion, {
    foreignKey: 'idProyectoEjecucion'
});

export default ProyectoFK;
