import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';
const Facturas = sequelize.define('facturas', {
    //Properties table
    fac_facturas_id: {
        type:   Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    fac_cardcode: {
        type:   Sequelize.STRING,
        allowNull: false
    },
    fac_order_num: {
        type:   Sequelize.STRING,
        allowNull: false
    },
    fac_estatus: {
        type: Sequelize.STRING,
        allowNull: false
    },
    fac_fecha_conta: {
        type: Sequelize.STRING,
        allowNull: false
    },
    fac_fecha_venc: {
        type: Sequelize.STRING,
        allowNull: false
    },
    fac_factura_total: {
        type: Sequelize.STRING,
        allowNull: false
    },
    fac_folio: {
        type: Sequelize.STRING,
        allowNull: false
    },
    fac_folio_interno: {
        type: Sequelize.STRING,
        allowNull: false
    },
    fac_id_portal: {
        type: Sequelize.STRING,
        allowNull: false
    },
    fac_ruta_pdf: {
        type: Sequelize.STRING,
        allowNull: false
    },
    fac_ruta_xml: {
        type: Sequelize.STRING,
        allowNull: false
    },
    fac_total: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    fac_direccion_entrega: {
        type: Sequelize.STRING,
        allowNull: false
    },
    fac_factura_sap: {
        type: Sequelize.STRING,
        allowNull: false
    },
    fac_direccion_factura: {
        type: Sequelize.STRING,
        allowNull: false
    },
    fac_usu_usuario_creador_id: {
        type:   Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type:   Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    fac_usu_usuario_modificador_id: {
        type:   Sequelize.INTEGER
    },
    updatedAt: {
        type:   Sequelize.DATE
    }
},
{
    //options
    tableName: 'facturas'
});


export default Facturas;