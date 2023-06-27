import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const RawSociosNegocios = sequelize.define('raw_socios_negocios', {
    raw_socios_negocios_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    codigoCliente: {
        type: Sequelize.STRING,
    },
    codigoGrupo: {
        type: Sequelize.STRING,
    },
    codigoListaPrecios: {
        type: Sequelize.STRING,
    },
    condicionesCredito: {
        type: Sequelize.STRING,
    },
    contactos: {
        type: Sequelize.JSON
    },
    creditoDisponible: {
        type: Sequelize.INTEGER
    },
    direcciones: {
        type: Sequelize.JSON
    },
    email: {
        type: Sequelize.STRING
    },
    activo: {
        type: Sequelize.STRING
    },
    limiteCredito: {
        type: Sequelize.INTEGER
    },
    nombreComercial: {
        type: Sequelize.STRING
    },
    nombreGrupo: {
        type: Sequelize.STRING
    },
    nombreListaPrecios: {
        type: Sequelize.STRING
    },
    procentajeDescuentoTotal: {
        type: Sequelize.INTEGER
    },
    codigoVendedor: {
        type: Sequelize.STRING
    },
    nombreVendedor: {
        type: Sequelize.STRING
    },
    razonSocial: {
        type: Sequelize.STRING
    },
    usoCfdi: {
        type: Sequelize.STRING
    },
    rfc: {
        type: Sequelize.STRING
    },
    almacen: {
        type: Sequelize.STRING
    },
    idDireccionS: {
        type: Sequelize.STRING
    },
    idDireccionB: {
        type: Sequelize.STRING
    },
    pais: {
        type: Sequelize.STRING
    },
    estado: {
        type: Sequelize.STRING
    },
    prop1: {
        type: Sequelize.STRING
    },
    prop10: {
        type: Sequelize.STRING
    },
    prop11: {
        type: Sequelize.STRING
    },
    prop12: {
        type: Sequelize.STRING
    },
    prop13: {
        type: Sequelize.STRING
    },
    prop14: {
        type: Sequelize.STRING
    },
    prop15: {
        type: Sequelize.STRING
    },
    prop16: {
        type: Sequelize.STRING
    },
    prop17: {
        type: Sequelize.STRING
    },
    prop18: {
        type: Sequelize.STRING
    },
    prop19: {
        type: Sequelize.STRING
    },
    prop2: {
        type: Sequelize.STRING
    },
    prop20: {
        type: Sequelize.STRING
    },
    prop21: {
        type: Sequelize.STRING
    },
    prop22: {
        type: Sequelize.STRING
    },
    prop23: {
        type: Sequelize.STRING
    },
    prop24: {
        type: Sequelize.STRING
    },
    prop25: {
        type: Sequelize.STRING
    },
    prop26: {
        type: Sequelize.STRING
    },
    prop27: {
        type: Sequelize.STRING
    },
    prop28: {
        type: Sequelize.STRING
    },
    prop29: {
        type: Sequelize.STRING
    },
    prop3: {
        type: Sequelize.STRING
    },
    prop30: {
        type: Sequelize.STRING
    },
    prop31: {
        type: Sequelize.STRING
    },
    prop32: {
        type: Sequelize.STRING
    },
    prop33: {
        type: Sequelize.STRING
    },
    prop34: {
        type: Sequelize.STRING
    },
    prop35: {
        type: Sequelize.STRING
    },
    prop36: {
        type: Sequelize.STRING
    },
    prop37: {
        type: Sequelize.STRING
    },
    prop38: {
        type: Sequelize.STRING
    },
    prop39: {
        type: Sequelize.STRING
    },
    prop4: {
        type: Sequelize.STRING
    },
    prop40: {
        type: Sequelize.STRING
    },
    prop41: {
        type: Sequelize.STRING
    },
    prop42: {
        type: Sequelize.STRING
    },
    prop43: {
        type: Sequelize.STRING
    },
    prop44: {
        type: Sequelize.STRING
    },
    prop45: {
        type: Sequelize.STRING
    },
    prop46: {
        type: Sequelize.STRING
    },
    prop47: {
        type: Sequelize.STRING
    },
    prop48: {
        type: Sequelize.STRING
    },
    prop49: {
        type: Sequelize.STRING
    },
    prop5: {
        type: Sequelize.STRING
    },
    prop50: {
        type: Sequelize.STRING
    },
    prop51: {
        type: Sequelize.STRING
    },
    prop52: {
        type: Sequelize.STRING
    },
    prop53: {
        type: Sequelize.STRING
    },
    prop54: {
        type: Sequelize.STRING
    },
    prop55: {
        type: Sequelize.STRING
    },
    prop56: {
        type: Sequelize.STRING
    },
    prop57: {
        type: Sequelize.STRING
    },
    prop58: {
        type: Sequelize.STRING
    },
    prop59: {
        type: Sequelize.STRING
    },
    prop6: {
        type: Sequelize.STRING
    },
    prop60: {
        type: Sequelize.STRING
    },
    prop61: {
        type: Sequelize.STRING
    },
    prop62: {
        type: Sequelize.STRING
    },
    prop63: {
        type: Sequelize.STRING
    },
    prop64: {
        type: Sequelize.STRING
    },
    prop7: {
        type: Sequelize.STRING
    },
    prop8: {
        type: Sequelize.STRING
    },
    prop9: {
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
    tableName: 'raw_socios_negocios'
});



export default RawSociosNegocios;