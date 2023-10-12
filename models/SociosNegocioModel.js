import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';
import Paises from './PaisModel';
import Estados from './EstadoModel';
import ListaPrecio from './ListaPrecioModel';
import Usuario from './UsuarioModel';

const SociosNegocio = sequelize.define('sociosnegocio',{
    sn_socios_negocio_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    sn_cfdi: {
        type: Sequelize.STRING,
        allowNull: false
    },
    sn_rfc: {
        type: Sequelize.STRING,
        allowNull: false
    },
    sn_cardcode: {
        type: Sequelize.STRING
    },
    sn_credito: {
        type: Sequelize.FLOAT
    },
    sn_moneda: {
        type: Sequelize.STRING
    },
    sn_nombre_empresa: {
        type: Sequelize.STRING
    },
    sn_tax: {
        type: Sequelize.STRING
    },
    sn_direccion_facturacion: {
        type: Sequelize.STRING
    },
    sn_razon_social: {
        type: Sequelize.STRING
    },
    sn_nombre_comercial: {
        type: Sequelize.STRING
    },
    sn_email_facturacion: {
        type: Sequelize.STRING
    },
    sn_telefono_empresa: {
        type: Sequelize.STRING
    },
    sn_pais_id: {
        type: Sequelize.INTEGER
    },
    sn_estado_id: {
        type: Sequelize.INTEGER
    },
    sn_direccion_empresa: {
        type: Sequelize.STRING
    },
    sn_lista_precios: {
        type: Sequelize.INTEGER
    },
    sn_descripcion_empresa: {
        type: Sequelize.STRING
    },
    sn_cmm_estatus_id: {
        type: Sequelize.INTEGER
    },
    sn_almacen_asignado: {
        type: Sequelize.STRING
    },
    sn_usu_usuario_creador_id: {
        type: Sequelize.INTEGER
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    sn_usu_usuario_modificado_id:{
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    sn_cmm_tipo_impuesto:{
        type: Sequelize.INTEGER,
        allowNull: false
    }, 
    sn_credito_disponible: {
        type: Sequelize.DECIMAL(10,2),
        field: 'sn_credito_disponible',
        allowNull: false        
    },
    sn_descuento: {
        type: Sequelize.INTEGER
    },
    sn_vendedor_codigo_sap: {
        type: Sequelize.STRING
    },
    sn_condiciones_credito: {
        type: Sequelize.STRING
    },
    sn_codigo_direccion_facturacion: {
        type: Sequelize.STRING
    },
    sn_datos_b2b: {
        type: Sequelize.STRING
    },
    sn_codigo_grupo: {
        type: Sequelize.STRING
    },
    sn_porcentaje_descuento_total: {
        type: Sequelize.STRING
    }
},
{
    //Options
    tableName: 'socios_negocio'
});

SociosNegocio.belongsTo(Usuario,{
    foreignKey: 'sn_vendedor_codigo_sap',
    targetKey: 'usu_codigo_vendedor'
});

SociosNegocio.belongsTo(ControlMestroMultiple,{
    foreignKey: 'sn_cmm_estatus_id',
    as:'estatus_id'
});

SociosNegocio.belongsTo(Paises,{
    foreignKey: 'sn_pais_id'
});

SociosNegocio.belongsTo(Estados,{
    foreignKey: 'sn_estado_id'
});

SociosNegocio.belongsTo(ControlMestroMultiple,{
    foreignKey: 'sn_cmm_tipo_impuesto',
    as:'tipo_impuesto'
});

SociosNegocio.belongsTo(ListaPrecio,{
    foreignKey: 'sn_lista_precios'
});
export default SociosNegocio;
