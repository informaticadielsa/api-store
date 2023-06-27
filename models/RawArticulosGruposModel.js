import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const RawArticulosGrupos = sequelize.define('raw_articulos_grupos', {
    raw_articulos_grupos_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    codigoGrupo: {
        type: Sequelize.STRING,
    },
    nombreGrupo: {
        type: Sequelize.STRING,
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
    tableName: 'raw_articulos_grupos'
});



export default RawArticulosGrupos;