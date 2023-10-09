import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import Estado from './EstadoModel';

const CiudadesEstados = sequelize.define('ciudades_estados', {
    city_ciudades_estados_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    city_ciudad: { 
        type: Sequelize.STRING,
        allowNull: false
    },
    city_estpa_estado_pais_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    city_usu_usuario_creador_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    updatedAt: {
        type: Sequelize.DATE
    }
},
{
    tableName: 'ciudades_estados'
});

CiudadesEstados.belongsTo(Estado, {
    foreignKey: 'city_estpa_estado_pais_id'
})

export default CiudadesEstados;