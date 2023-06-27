import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const RawListasPreciosGrupo = sequelize.define('raw_listas_precios_grupo', {
    raw_listas_precios_grupo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    activo: {
        type: Sequelize.STRING
    },
    codigo: {
        type: Sequelize.STRING
    },
    porcentajeDescuento: {
        type: Sequelize.INTEGER
    },
    subCodigo: {
        type: Sequelize.STRING
    },
    subTipo: {
        type: Sequelize.STRING
    },
    tipo: {
        type: Sequelize.STRING
    },
    validoDesde: {
        type: Sequelize.STRING
    },
    validoHasta: {
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
    tableName: 'raw_listas_precios_grupo'
});



export default RawListasPreciosGrupo;