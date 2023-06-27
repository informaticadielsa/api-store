import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import CiudadesEstados from './CiudadesEstadosModel';

const CiudadesEstadosCp = sequelize.define('ciudades_estados_cp', {
    citycp_ciudades_estados_cp: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    citycp_city_ciudades_estados_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    citycp_cp: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    citycp_usu_usuario_creador_id: {
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
    tableName: 'ciudades_estados_cp'
});

CiudadesEstadosCp.belongsTo(CiudadesEstados, {
    foreignKey: 'citycp_city_ciudades_estados_id'
})

export default CiudadesEstadosCp;