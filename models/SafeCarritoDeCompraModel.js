import {  Sequelize } from 'sequelize';
import ListaPrecio from './ListaPrecioModel';
import ProductoCarritoDeCompra from './ProductoCarritoDeCompraModel';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import SociosNegocio from './SociosNegocioModel';
import Usuario from './UsuarioModel';


const SafeCarritoDeCompra = sequelize.define('safe_carrito_de_compras', {
    cdc_carrito_de_compra_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    cdc_numero_orden: {
        type: Sequelize.STRING,
        allowNull: false
    },
    cdc_usu_usuario_vendedor_id: {
        type: Sequelize.INTEGER
    },
    cdc_sn_socio_de_negocio_id: {
        type: Sequelize.INTEGER
    },
    cdc_descuento_extra: {
        type: Sequelize.INTEGER
    },
    cdc_total_carrito: {
        type: Sequelize.DECIMAL(10,2),
        field: 'cdc_total_carrito'
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    cdc_lista_precio: {
        type: Sequelize.INTEGER
    },
    cdc_project_candidate: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    cdc_from_project: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    cdc_with_coupon: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    cdc_cmm_tipo_envio_id: {
        type: Sequelize.INTEGER
    },
    cdc_direccion_envio_id: {
        type: Sequelize.INTEGER
    },
    cdc_alm_almacen_recoleccion: {
        type: Sequelize.INTEGER
    },
    cdc_cmm_tipo_compra_id: {
        type: Sequelize.INTEGER
    },
    cdc_fletera_id: {
        type: Sequelize.INTEGER
    },
    cdc_costo_envio: {
        type: Sequelize.DECIMAL(10,2),
        field: 'cdc_costo_envio'
    },
    cdc_promcup_promociones_cupones_id: {
        type: Sequelize.INTEGER
    },
    cdc_forma_pago_codigo: {
        type: Sequelize.STRING
    },
    cdc_referencia: {
        type: Sequelize.STRING
    },
    cdc_cfdi: {
        type: Sequelize.STRING
    }
},
{
    //Options
    tableName: 'safe_carrito_de_compras'
});

// CarritoDeCompra.belongsTo(SociosNegocio, {
//     foreignKey: 'cdc_sn_socio_de_negocio_id',
//     targetKey: 'sn_socios_negocio_id'
// });
// CarritoDeCompra.belongsTo(Usuario,{
//     foreignKey: 'cdc_usu_usuario_vendedor_id',
//     targetKey: 'usu_usuario_id'
// });
// CarritoDeCompra.hasMany(ProductoCarritoDeCompra, {
//     foreignKey: 'pcdc_carrito_de_compra_id',
//     targetKey: 'cdc_carrito_de_compra_id'
// });
// CarritoDeCompra.belongsTo(ListaPrecio, {
//     foreignKey: 'cdc_lista_precio',
//     targetKey: 'listp_lista_de_precio_id'
// });
// CarritoDeCompra.hasMany(ProductoCarritoDeCompra, {
//     foreignKey: 'pcdc_carrito_de_compra_id'
// });

export default SafeCarritoDeCompra;