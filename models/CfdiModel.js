import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const Cfdi = sequelize.define('cfdi',{
    cfdi_cfdi_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    cfdi_codigo: {
        type: Sequelize.STRING,
    },
    cfdi_texto: {
        type: Sequelize.STRING,
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE
    },
},
{
    tableName: 'cfdi'
});
export default Cfdi;