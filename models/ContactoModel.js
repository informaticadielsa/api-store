import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const Contacto = sequelize.define('contacto',{
    c_contacto_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    c_nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    c_correo_electronico: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    c_empresa: {
        type: Sequelize.STRING
    },
    c_mensaje: {
        type: Sequelize.STRING,
        allowNull: false
    },
    c_telefono: {
        type: Sequelize.STRING,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.now
    },
    updatedAt: {
        type: Sequelize.DATE
    },
},
{
    //options
    tableName: 'contactos'
});
export default Contacto;