import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const Colecciones = sequelize.define('Colecciones', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
   
    nombre: {
        type: Sequelize.STRING,
    },
    descripcion: {
        type: Sequelize.STRING
    },
    estatus: {
        type: Sequelize.INTEGER
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
    link: {
        type: Sequelize.STRING,
    },
    orden: {
        type: Sequelize.INTEGER
    }
},
{
    //Options
    tableName: 'coleccion'
});

export default Colecciones;
