import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';
const CodigosPostales = sequelize.define('codigos_postales', {
    cp_codigos_postales_id: {        
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    cp_codigo_postal: {
        type: Sequelize.STRING,
        allowNull: false
    },
    cp_estado_pais_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    cp_frontera: {
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
    //options
    tableName: 'codigos_postales'
})


export default CodigosPostales;