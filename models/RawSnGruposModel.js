import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const RawSnGrupos = sequelize.define('raw_sngrupos', {
    raw_sngrupos_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    codigoGrupo: {
        type: Sequelize.STRING
    },
    nombreGrupo: {
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
},{
    //options
    tableName: 'raw_sngrupos'
});



export default RawSnGrupos;