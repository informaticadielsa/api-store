import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';
import Usuario from './UsuarioModel';
import Categoria from './CategoriaModel';
import PrevisualizacionProductoCategoria from './PrevisualizacionProductoCategoriaModel';
import StockProducto from './StockProductoModel';
import Marca from './MarcaModel';
import ImagenProducto from  './ImagenProductoModel';
import ProductoDataSheet from './ProductoDataSheetModel';
import Proveedores from  './ProveedoresModel';
const Producto = sequelize.define('productos', {
    prod_producto_id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    prod_sku: {
        type: Sequelize.STRING,
        allowNull: false
    },
    prod_nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    prod_descripcion: {
        type: Sequelize.STRING,
        allowNull: false
    },
    prod_cat_categoria_id: {
        type: Sequelize.INTEGER,
    },
    prod_usu_usuario_creado_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    prod_usu_usuario_modificado_id:{
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    prod_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    prod_prod_producto_padre_sku: {
        type: Sequelize.STRING,
        hierarchy: true
    },
    prod_mar_marca_id: {
        type: Sequelize.INTEGER,
    },
    prod_precio: {
        type: Sequelize.DECIMAL(10,2),
        field: 'prod_precio'
    },
    prod_descripcion_corta: {
        type: Sequelize.STRING
    },
    prod_descuento: {
        type: Sequelize.INTEGER
    },
    prod_unidad_medida_venta: {
        type: Sequelize.INTEGER
    },
    prod_altura: {
        type: Sequelize.INTEGER
    },
    prod_ancho: {
        type: Sequelize.INTEGER
    },
    prod_longitud: {
        type: Sequelize.INTEGER
    },
    prod_peso: {
        type: Sequelize.INTEGER
    },
    prod_volumen: {
        type: Sequelize.INTEGER
    },
    prod_total_stock: {
        type: Sequelize.INTEGER
    },
    prod_proveedor_id: {
        type: Sequelize.INTEGER
    },
    prod_meta_titulo: {
        type: Sequelize.STRING
    },
    prod_meta_descripcion: {
        type: Sequelize.STRING
    },
    prod_is_kit: {
        type: Sequelize.STRING
    },
    prod_viñetas: {
        type: Sequelize.JSON
    },
    prod_calificacion_promedio: {
        type: Sequelize.JSON
    },
    prod_productos_coleccion_relacionados_id: {
        type: Sequelize.INTEGER
    },
    prod_productos_coleccion_accesorios_id: {
        type: Sequelize.INTEGER
    },
    prod_nombre_extranjero: {
        type: Sequelize.STRING
    },
    prod_caracteristicas_tecnicas: {
        type: Sequelize.JSON
    },
    prod_video_url: {
        type: Sequelize.STRING
    },
    prod_disponible_backorder: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    prod_mostrar_en_tienda: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    prod_es_stock_inactivo: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    prod_tipo_precio_base: {
        type: Sequelize.STRING
    },
    prod_dias_resurtimiento: {
        type: Sequelize.INTEGER
    },
    prod_unidades_vendidas: {
        type: Sequelize.FLOAT
    },
    prod_codigo_grupo: {
        type: Sequelize.STRING
    },
    prod_codigo_marca: {
        type: Sequelize.STRING
    },
    prod_codigo_prop_list: {
        type: Sequelize.JSON
    },
    prod_tipo_cambio_base: {
        type: Sequelize.STRING
    },
},
{
    //options
});

Producto.belongsTo(Usuario,{
    foreignKey : 'prod_usu_usuario_creado_id',
    as: 'usuario_creador_id'
});
Producto.belongsTo(Usuario,{
    foreignKey : 'prod_usu_usuario_modificado_id',
    as: 'usuario_modificador_id'
});
Producto.belongsTo(ControlMestroMultiple, {
    foreignKey: 'prod_cmm_estatus_id'
});

Producto.belongsTo(Categoria, {
    foreignKey: 'prod_cat_categoria_id'
});

Producto.hasMany(PrevisualizacionProductoCategoria,{
    foreignKey: 'ppc_prod_producto_id'
});

Producto.hasMany(StockProducto,{
    foreignKey: 'sp_prod_producto_id'
});

Producto.belongsTo(Marca, {
    foreignKey: 'prod_mar_marca_id'
});

Producto.hasMany(ImagenProducto, {
    foreignKey: 'imgprod_prod_producto_id'
});

Producto.hasOne(ProductoDataSheet, {
    foreignKey: 'pds_prod_producto_id',
    as: 'data_sheet'
});
Producto.belongsTo(Proveedores,{
    foreignKey: 'prod_proveedor_id',
    targetKey: 'prv_proveedores_id'
});

export default Producto;