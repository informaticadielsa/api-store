import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
import PrevisualizacionProductoCategoria from '../models/PrevisualizacionProductoCategoriaModel';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import XLSX from  'xlsx';
import productosUtils from "../services/productosUtils";
import systemLog from "../services/systemLog"
import {integracionEmail} from '../services/integracionEmail'



const sortJSON = function(data, key, orden) {
    return data.sort(function (a, b) {
        var x = a[key],
        y = b[key];

        if (orden === 'asc') {
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        }

        if (orden === 'desc') {
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        }
    });
}


export default {
    createProducto: async(req, res, next) =>{
        try{
            try{
                const  producto = await models.Producto.create(req.body, 
                    {
                        include: [
                            { model: models.PrevisualizacionProductoCategoria },
                            { model: models.StockProducto }
                        ]
                    }
                );
                if(!!req.body.prod_prod_producto_padre_sku){
                    if(!!req.body.productos_colecciones && producto.dataValues){
                        req.body.productos_colecciones.forEach(element => {
                            sequelize.query('INSERT INTO productos_colecciones ' + 
                                            '(' +
                                                'prodcol_col_coleccion_id,' +
                                                'prodcol_prod_producto_id,' +
                                                'prodcol_usu_usuario_creador_id,' +
                                                '"createdAt"' +
                                            ') ' + 
                                            ' values ' +
                                            '( ' +
                                                element.prodcol_col_coleccion_id + ',' +
                                                producto.dataValues.prod_producto_id + ',' + 
                                                req.body.prod_usu_usuario_creado_id + ',' +
                                                'current_date' +
                                            ');');
        
                        });
                    }
                }
                res.status(200).send({
                    message: 'Producto agregado correctamente',
                    producto
                });
            }catch(e){
                res.status(300).send({
                    message: 'Error al crear producto',
                    e
                })
            }    
        }catch(e){
            res.status(200).send({
                message: 'Error al crear producto',
                e
            });
            next(e);
        }
    },
    updateProducto: async(req, res, next) =>{
        try{
            const productoUpdate = await models.Producto.findOne(
            {
                where: 
                {
                    prod_producto_id: req.body.prod_producto_id
                },
                include: [ { model: models.StockProducto}]
            });

            //Si se manda un arreglo de categorías, destruiremos todas las actuales y se crearan las nuevas  -\(-_-)/- 
            if(!!req.body.previsualizacion_producto_categoria)
            {
                await PrevisualizacionProductoCategoria.destroy(
                {
                    where: 
                    {
                        ppc_prod_producto_id: productoUpdate.dataValues.prod_producto_id
                    }
                });
                req.body.previsualizacion_producto_categoria.forEach(element =>
                {
                    sequelize.query(`insert into previsualizacion_productos_categorias ( 
                        ppc_prod_producto_id, 
                        ppc_cat_categoria_id,
                        "createdAt",
                        "updatedAt" 
                        )
                        values
                        (`+
                            productoUpdate.dataValues.prod_producto_id +`,`+
                            element.ppc_cat_categoria_id + `,
                            current_date,
                            current_date
                        );`);
                })
            };
            if(!!req.body.productos_colecciones && productoUpdate.dataValues.prod_prod_producto_padre_sku)
            {
                try{
                    await models.ProductoColeccion.destroy(
                    {
                        where: 
                        {
                            prodcol_prod_producto_id: productoUpdate.dataValues.prod_producto_id
                        }
                    })
                }
                catch(e)
                {
                }
                req.body.productos_colecciones.forEach(element => 
                {
                    sequelize.query('INSERT INTO productos_colecciones ' + 
                                    '(' +
                                        'prodcol_col_coleccion_id,' +
                                        'prodcol_prod_producto_id,' +
                                        'prodcol_usu_usuario_creador_id,' +
                                        '"createdAt"' +
                                    ') ' + 
                                    ' values ' +
                                    '( ' +
                                        element.prodcol_col_coleccion_id + ',' +
                                        productoUpdate.dataValues.prod_producto_id + ',' + 
                                        req.body.prod_usu_usuario_modificado_id + ',' +
                                        'current_date' +
                                    ');');

                });
            }
            if(!!req.body.stocks_productos)
            {
                req.body.stocks_productos.forEach(stock =>
                {
                    console.log(!!stock.sp_stock_producto_id, !stock.sp_stock_producto_id, stock.sp_stock_producto_id)
                    if(!stock.sp_stock_producto_id){
                        console.log('Existiaa', stock);
                        sequelize.query('insert into stocks_productos (sp_prod_producto_id, sp_fecha_ingreso, sp_cantidad, sp_usu_usuario_creador_id, "createdAt", "updatedAt" ) values ' +
                                        ' (' + productoUpdate.dataValues.prod_producto_id + ', current_date, ' + stock.sp_cantidad + ', ' + req.body.prod_usu_usuario_modificado_id + ', current_date, current_date );');
                    }
                })
            }

            var actualizarCategoriasHijos = false
            if(productoUpdate.prod_cat_categoria_id != req.body.prod_cat_categoria_id)
            {
                console.log("entro al update categorias")
                actualizarCategoriasHijos = true
            }


            await productoUpdate.update(
            {
                prod_nombre : !!req.body.prod_nombre ? req.body.prod_nombre : productoUpdate.dataValues.prod_nombre,
                prod_descripcion : !!req.body.prod_descripcion ? req.body.prod_descripcion : productoUpdate.dataValues.prod_descripcion,
                prod_sku : (!!req.body.prod_sku && !!productoUpdate.dataValues.prod_prod_producto_padre_sku) ? req.body.prod_sku : productoUpdate.dataValues.prod_sku,
                prod_cat_categoria_id: !!req.body.prod_cat_categoria_id ? req.body.prod_cat_categoria_id : productoUpdate.dataValues.prod_cat_categoria_id,
                prod_cmm_estatus_id : !!req.body.prod_cmm_estatus_id ? req.body.prod_cmm_estatus_id : productoUpdate.dataValues.prod_cmm_estatus_id,
                prod_meta_titulo : !!req.body.prod_meta_titulo ? req.body.prod_meta_titulo : productoUpdate.dataValues.prod_meta_titulo,
                prod_meta_descripcion : !!req.body.prod_meta_descripcion ? req.body.prod_meta_descripcion : productoUpdate.dataValues.prod_meta_descripcion,
                prod_usu_usuario_modificado_id : req.body.prod_usu_usuario_modificado_id,
                prod_proveedor_id: !!req.body.prod_proveedor_id ? req.body.prod_proveedor_id : productoUpdate.dataValues.prod_proveedor_id,
                prod_mar_marca_id: !!req.body.prod_mar_marca_id ? req.body.prod_mar_marca_id : productoUpdate.dataValues.prod_mar_marca_id,
                updatedAt: Date(),
                prod_descripcion_corta: !!req.body.prod_descripcion_corta ? req.body.prod_descripcion_corta : productoUpdate.dataValues.prod_descripcion_corta,
                prod_precio: !!req.body.prod_precio ? req.body.prod_precio : productoUpdate.dataValues.prod_precio,
                prod_video_url: !!req.body.prod_video_url ? req.body.prod_video_url : productoUpdate.dataValues.prod_video_url,
                prod_productos_coleccion_relacionados_id: !!req.body.prod_productos_coleccion_relacionados_id ? req.body.prod_productos_coleccion_relacionados_id : null,
                prod_productos_coleccion_accesorios_id: !!req.body.prod_productos_coleccion_accesorios_id ? req.body.prod_productos_coleccion_accesorios_id : null,
                prod_disponible_backorder: !!req.body.prod_disponible_backorder ? req.body.prod_disponible_backorder : productoUpdate.dataValues.prod_disponible_backorder,
            },
            {
                include: [ { model: models.StockProducto }] 
            });

            //Actualizara las categorias de los hijos en caso de que la categoria sea diferente a la actual
            if(actualizarCategoriasHijos == true)
            {
                // Buscar todos los hijos para cambiar el codigo_grupo de la tabla productos
                const constProductosHijo = await models.Producto.findAll(
                {
                    where: {
                        prod_prod_producto_padre_sku: productoUpdate.prod_sku
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });


                //Recorrer hijos
                for (var i = 0; i < constProductosHijo.length; i++) 
                {

                    console.log("3490283092")
                    // Buscar todos los hijos para cambiar el codigo_grupo de la tabla productos
                    const constProductoHijoActualizar = await models.Producto.findOne(
                    {
                        where: {
                            prod_producto_id: constProductosHijo[i].dataValues.prod_producto_id
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });

                    if(constProductoHijoActualizar)
                    {
                        await constProductoHijoActualizar.update(
                        {
                            prod_codigo_grupo : req.body.prod_cat_categoria_id
                        })
                    }
                    

                }


            }

            res.status(200).send(
            {
                message: 'Actualización correcta de producto',
                productoUpdate
            })

        }catch(e){
            res.status(500).send({
                message: 'Error al actualizar el producto',
                error: e
            });
            next(e);
        }
    },
    getProductoById: async(req, res, next) =>{
        try{
            const producto = await models.Producto.findOne({
                where: { prod_producto_id: req.params.id },
                include: [
                    {
                        model: models.Categoria,
                        attributes: {exclude: ['cat_usu_usuario_creador_id', 'cat_cmm_estatus_id', 'createdAt', 'cat_usu_usuario_modificador_id', 'updatedAt', 'cat_cat_categoria_padre_id'] },
                        include: [
                            {
                                model: models.ControlMaestroMultiple,
                                attributes: {
                                    exclude: ['cmm_contol_id', 'updatedAt', 'createdAt','cmm_control_id','cmm_nombre','cmm_sistema','cmm_activo']
                                }
                            }
                        ]
                    },
                    {
                        model: models.ControlMaestroMultiple,
                        attributes: {exclude: ['cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']}
                    },
                    {
                        model: models.Marca,
                        attributes: {
                            exclude:  ['mar_descripcion','mar_usu_usuario_creado_id','createdAt','mar_usu_usuario_modificado_id','updatedAt']
                        }
                    }
                ]
            });
            const previsualizacionCategoria = await sequelize.query('select ppc.ppc_cat_categoria_id from previsualizacion_productos_categorias ppc ' +
                                                                    'left join categorias c on c.cat_categoria_id  = ppc.ppc_cat_categoria_id ' + 
                                                                    'left join controles_maestros_multiples cmm on cmm.cmm_control_id = c.cat_cmm_estatus_id ' + 
                                                                    'where ppc.ppc_prod_producto_id = ' + producto.dataValues.prod_producto_id + ' and cmm.cmm_control_id  = ' + statusControles.ESTATUS_CATEGORIA.ACTIVO + ';');
            producto.dataValues.previsualizacion_producto_categoria = previsualizacionCategoria[0];





            const hijos = await models.Producto.findAll({
                where: { prod_prod_producto_padre_sku: producto.dataValues.prod_sku ,
                        prod_cmm_estatus_id: { [Op.ne]: statusControles.ESTATUS_PRODUCTO.ELIMINADO }
                },
                include: [
                    {
                        model: models.Categoria,
                        attributes: {exclude: ['cat_usu_usuario_creador_id', 'cat_cmm_estatus_id', 'createdAt', 'cat_usu_usuario_modificador_id', 'updatedAt', 'cat_cat_categoria_padre_id'] }
                    },
                    {
                        model: models.ControlMaestroMultiple,
                        attributes: {exclude: ['cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']}
                    },
                    { 
                        model: models.StockProducto 
                    },
                    {
                        model: models.Marca,
                        attributes: {
                            exclude:  ['mar_descripcion','mar_usu_usuario_creado_id','createdAt','mar_usu_usuario_modificado_id','updatedAt']
                        }
                    },
                    {
                        model: models.ImagenProducto
                    },
                    {
                        model: models.ProductoDataSheet,
                        as: 'data_sheet'
                    }
                ]
            });

            
            


            for (var dd = 0; dd < hijos.length; dd++) 
            {
                //Agregar aplica backorder bool
                if(hijos[dd].dataValues.prod_dias_resurtimiento != '0')
                {
                    hijos[dd].dataValues.aplicaBackOrder = true
                }
                else
                {
                    hijos[dd].dataValues.aplicaBackOrder = false
                }

            }








            //OBTENER COLECCIONES DE PRODUCTO Relacion
                
                //BUSCAR TODOS LOS PRODUCTOS QUE TENGAN MISMO ID DE PREODUCTO RELACIONADOS EN LA TABLA PRODUCTOS



                var prod_id_relacion = producto.prod_productos_coleccion_relacionados_id

                if(prod_id_relacion == null)
                {
                    prod_id_relacion = -1
                }

                const constProductosRelacionados = await models.Producto.findAll({
                    where: { 
                        prod_productos_coleccion_relacionados_id: prod_id_relacion,
                        prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO
                    },
                    attributes: ['prod_producto_id', 'prod_nombre', 'prod_precio', 'prod_sku', 'prod_calificacion_promedio'],
                    include: [
                        {
                            model: models.Marca,
                            attributes: ['mar_marca_id', 'mar_nombre']
                        },
                        {
                            model: models.ImagenProducto
                        }
                    ]
                });


                //DESPUES OBTENER LA INFORMACION DE CADA UNO DE ELLOS INCLIYENDO LISTAS DE PRECIOS
                for (var i = 0; i < constProductosRelacionados.length; i++) 
                {
                    //console.log(constProductosRelacionados[i].dataValues.prod_sku)
                    
                    const constProdAllSKUS = await models.Producto.findAll({
                        where: { 
                            prod_prod_producto_padre_sku: constProductosRelacionados[i].dataValues.prod_sku,
                            prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO
                        },
                        attributes: ['prod_producto_id', 'prod_nombre', 'prod_sku']
                    });

                    var arrayListasPerSku = []
                    var SKUPerLista = '';


                    //Despues de obtener todos los SKU relacionados a un padre se debera obtener la lista de precios por cada uno
                    for (var j = 0; j < constProdAllSKUS.length; j++) 
                    {
                        //console.log(constProdAllSKUS[i]dataValues.prod_producto_id)
                        SKUPerLista = constProdAllSKUS[j].dataValues.prod_sku

                        const constProdListasPrecios = await models.ProductoListaPrecio.findAll({
                            where: { 
                                pl_prod_producto_id: constProdAllSKUS[j].dataValues.prod_producto_id
                            }
                        });


                        if(constProdListasPrecios)
                        {
                            for (var h = 0; h < constProdListasPrecios.length; h++) 
                            {
                                constProdListasPrecios[h].dataValues.prod_sku = constProdAllSKUS[j].prod_sku

                            }
                        }
                        arrayListasPerSku.push(constProdListasPrecios)
                    }
                    constProductosRelacionados[i].dataValues.ListaPrecios = arrayListasPerSku

                }
            //FIN OBTENER PRODUCTOS RELACIONADOS




            //OBTENER COLECCIONES DE ACCESORIOS DE PRODUCTOS
                
                //BUSCAR TODOS LOS PRODUCTOS QUE TENGAN MISMO ID DE PREODUCTO RELACIONADOS EN LA TABLA PRODUCTOS
                var prod_id_accesorio = producto.prod_productos_coleccion_accesorios_id

                if(prod_id_accesorio == null)
                {
                    prod_id_accesorio = -1
                }
                const constProductosAccesorios = await models.Producto.findAll({
                    where: { 
                        prod_productos_coleccion_accesorios_id: prod_id_accesorio,
                        prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO
                    },
                    attributes: ['prod_producto_id', 'prod_nombre', 'prod_precio', 'prod_sku', 'prod_calificacion_promedio'],
                    include: [
                        {
                            model: models.Marca,
                            attributes: ['mar_marca_id', 'mar_nombre']
                        },
                        {
                            model: models.ImagenProducto
                        }
                    ]
                });


                //DESPUES OBTENER LA INFORMACION DE CADA UNO DE ELLOS INCLIYENDO LISTAS DE PRECIOS
                for (var i = 0; i < constProductosAccesorios.length; i++) 
                {
                    //console.log(constProductosRelacionados[i].dataValues.prod_sku)
                    
                    const constProdAllSKUS = await models.Producto.findAll({
                        where: { 
                            prod_prod_producto_padre_sku: constProductosAccesorios[i].dataValues.prod_sku,
                            prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO
                        },
                        attributes: ['prod_producto_id', 'prod_nombre', 'prod_sku']
                    });

                    var arrayListasPerSku = []
                    var SKUPerLista = '';


                    //Despues de obtener todos los SKU relacionados a un padre se debera obtener la lista de precios por cada uno
                    for (var j = 0; j < constProdAllSKUS.length; j++) 
                    {
                        //console.log(constProdAllSKUS[i]dataValues.prod_producto_id)
                        SKUPerLista = constProdAllSKUS[j].dataValues.prod_sku

                        const constProdListasPrecios = await models.ProductoListaPrecio.findAll({
                            where: { 
                                pl_prod_producto_id: constProdAllSKUS[j].dataValues.prod_producto_id
                            }
                        });


                        if(constProdListasPrecios)
                        {
                            for (var h = 0; h < constProdListasPrecios.length; h++) 
                            {
                                constProdListasPrecios[h].dataValues.prod_sku = constProdAllSKUS[j].prod_sku

                            }
                        }
                        arrayListasPerSku.push(constProdListasPrecios)
                    }
                    constProductosAccesorios[i].dataValues.ListaPrecios = arrayListasPerSku

                }
            //FIN  DE OBTENER ACCESORIOS DE PRODUCTOS




            res.status(200).send({
                message: 'Producto obtenido con exito',
                producto,
                hijos,
                ProductosRelacionados: constProductosRelacionados,
                ProductosAccesorios: constProductosAccesorios
                
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al obtener registro',
                e
            });
            next(e);
        }
    },
    getOnlyById: async(req, res, next) =>{
        try{
            const producto = await models.Producto.findOne({
                where: {
                    prod_producto_id: req.params.id
                },
                include: [
                    {
                        model: models.ControlMaestroMultiple,
                        attributes: {exclude: ['cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']}
                    },
                    {
                        model: models.Categoria,
                        attributes: {exclude: ['cat_usu_usuario_creador_id', 'cat_cmm_estatus_id', 'createdAt', 'cat_usu_usuario_modificador_id', 'updatedAt', 'cat_cat_categoria_padre_id'] },
                        include: [
                            {
                                model: models.ControlMaestroMultiple,
                                attributes: {
                                    exclude: ['cmm_contol_id', 'updatedAt', 'createdAt','cmm_control_id','cmm_nombre','cmm_sistema','cmm_activo']
                                }
                            }
                        ]
                    },
                    { 
                        model: models.StockProducto,
                        include: [
                            {
                                model: models.Almacenes,
                                attributes: {
                                    exclude: [
                                        'alm_codigo_postal',
                                        'alm_cmm_estatus_id',
                                        'alm_usu_usuario_creador_id',
                                        'createdAt',
                                        'alm_usu_usuario_modificado_id',
                                        'updatedAt',
                                        'alm_pais_id',
                                        'alm_estado_pais_id',
                                        'alm_tipo_almacen',
                                        'alm_codigoAlmacen',
                                        'alm_pickup_stores'
                                    ]
                                }

                            }
                        ]
                    },
                    {
                        model: models.Marca,
                        attributes: {
                            exclude:  ['mar_descripcion','mar_usu_usuario_creado_id','createdAt','mar_usu_usuario_modificado_id','updatedAt']
                        }
                    },
                    {
                        model: models.ImagenProducto
                    },
                    
                    // {
                    //     model: models.ProductoDataSheet,
                    //     as: 'data_sheet'
                    // }
                ]
            });   
            const producto_data_sheet = await models.ProductoDataSheet.findAll({
                where:{
                    pds_prod_producto_id: producto.dataValues.prod_producto_id
                }
            });
            if(producto_data_sheet.length > 0){
                producto.dataValues.data_sheet = producto_data_sheet
            }
            else {
                producto.dataValues.data_sheet = []
            }
            const previsualizacionCategoria = await sequelize.query('select ppc.ppc_cat_categoria_id, cmm.cmm_valor from previsualizacion_productos_categorias ppc ' +
                                                                    'left join categorias c on c.cat_categoria_id  = ppc.ppc_cat_categoria_id ' + 
                                                                    'left join controles_maestros_multiples cmm on cmm.cmm_control_id = c.cat_cmm_estatus_id ' + 
                                                                    'where ppc.ppc_prod_producto_id = ' + producto.dataValues.prod_producto_id + ' and cmm.cmm_control_id  != ' + statusControles.ESTATUS_CATEGORIA.ELIMINADO + ';');
            producto.dataValues.previsualizacion_producto_categoria = previsualizacionCategoria[0];
            res.status(200).send({
                message: 'Producto obtenido con exito',
                producto
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al traer producto',
                e
            });
            next(e);
        }
    },
    getListProductos: async(req, res, next) =>{
        try{
            const listaProductos = await models.Producto.findAll({
                where: {
                    prod_cmm_estatus_id : { [Op.ne]: statusControles.ESTATUS_PRODUCTO.ELIMINADO },
                    prod_prod_producto_padre_sku : null
                },
                include: [
                    {
                        model: models.Categoria,
                        attributes: {exclude: ['cat_usu_usuario_creador_id', 'cat_cmm_estatus_id', 'createdAt', 'cat_usu_usuario_modificador_id', 'updatedAt', 'cat_cat_categoria_padre_id'] },
                        include: [
                            {
                                model: models.ControlMaestroMultiple,
                                attributes: {
                                    exclude: ['cmm_contol_id', 'updatedAt', 'createdAt','cmm_control_id','cmm_nombre','cmm_sistema','cmm_activo']
                                }
                            }
                        ]
                    },
                    {
                        model: models.ControlMaestroMultiple,
                        attributes: {exclude: ['cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']}
                    }
                ] 
            });
            res.status(200).send({
                message: 'Lista de productos',
                listaProductos
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    getListaProductosHijos: async (req, res, next) =>{
        try{
            const productosToColecciones = await models.Producto.findAll({
                where: {
                    prod_prod_producto_padre_sku : {[Op.ne] : null },
                    prod_cmm_estatus_id: {[Op.ne]: statusControles.ESTATUS_PRODUCTO.ELIMINADO}
                },
                include: [
                    
                    {
                        model: models.Categoria,
                        attributes: {exclude: ['cat_usu_usuario_creador_id', 'cat_cmm_estatus_id', 'createdAt', 'cat_usu_usuario_modificador_id', 'updatedAt', 'cat_cat_categoria_padre_id'] },
                        include: [
                            {
                                model: models.ControlMaestroMultiple,
                                attributes: {
                                    exclude: ['cmm_contol_id', 'updatedAt', 'createdAt','cmm_control_id','cmm_nombre','cmm_sistema','cmm_activo']
                                }
                            }
                        ]
                    },

                    {
                        model: models.Marca,
                        attributes: {
                            exclude:  ['mar_descripcion','mar_usu_usuario_creado_id','createdAt','mar_usu_usuario_modificado_id','updatedAt']
                        }
                    },
                ]
            })
            res.status(200).send({
                message: 'Lista de productos',
                productosToColecciones
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },
    deleteProducto: async(req, res, next) => {
        try{
            const producto = await models.Producto.findOne({
                where: {
                    prod_producto_id: req.body.prod_producto_id
                }
            });
            if(!!!producto.dataValues.prod_prod_producto_padre_sku){
                await producto.update({
                    prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ELIMINADO,
                    prod_usu_usuario_modificado_id: req.body.prod_usu_usuario_modificado_id,
                    updatedAt: Date()
                });
                const productos_hijos = await models.Producto.findAll({
                    where: {
                        prod_prod_producto_padre_sku: producto.dataValues.prod_sku
                    }
                });
                if(!!productos_hijos){
                    console.log(producto.dataValues.prod_sku);
                    productos_hijos.forEach(async function(hijo, indexHijo){
                        await hijo.update({
                            prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ELIMINADO,
                            prod_usu_usuario_modificado_id: req.body.prod_usu_usuario_modificado_id,
                            updatedAt: Date()   
                        });
                        if((productos_hijos.length -1)  == indexHijo){
                            res.status(200).send({
                                message: 'Producto padre e hijos, eliminados correctamente'
                            });
                        }
                    });
                }else{
                    res.status(200).send({
                        message: 'Producto eliminado correctamente'   
                    })
                }
            }else{
                await producto.update({
                    prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ELIMINADO,
                    prod_usu_usuario_modificado_id: req.body.prod_usu_usuario_modificado_id,
                    updatedAt: Date()
                });
                res.status(200).send({
                    message: 'Eliminado correctamente'
                });
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al eliminar producto',
                e
            });
            next(e);
        }
    },
    mejorDescuentoProducto: async(req, res, next) =>{
        try{

            const socio_negocio = await models.SociosNegocio.findOne({
                where: {
                    sn_socios_negocio_id: req.params.idSocio
                },
                include: [
                    {
                        model: models.ListaPrecio
                    }
                ]
            });

            
            if(!!req.body.productos_id && !!socio_negocio){
                let productos = [];
                req.body.productos_id.forEach(async function(elemento, index){
                    const producto = await models.Producto.findOne({
                        where: {
                            prod_producto_id: elemento
                        },
                        include: [
                            {
                                model: models.Marca
                            }
                        ]
                    });
                    
                    const precios_lista_precios = await models.ProductoListaPrecio.findOne({
                        where: {
                            pl_listp_lista_de_precio_id: socio_negocio.dataValues.sn_lista_precios,
                            pl_prod_producto_id: producto.dataValues.prod_producto_id
                        }
                    });
                    if(!!precios_lista_precios && precios_lista_precios.dataValues.pl_precio_producto > 0){
                        if(precios_lista_precios.dataValues.pl_precio_producto < producto.dataValues.prod_precio){
                            producto.dataValues.prod_precio = precios_lista_precios.dataValues.pl_precio_producto;
                        }
                    }
                    const jsonDescuentos = [
                        {
                            nombre: 'producto', descuento: !!producto.dataValues.prod_descuento ? producto.dataValues.prod_descuento : 0
                        },
                        {
                            nombre: 'marca', descuento: !!producto.dataValues.marca ? producto.dataValues.marca.dataValues.mar_descuento : 0
                        },
                        {
                            nombre: 'socio_negocio', descuento: !!socio_negocio.dataValues.sn_descuento ? socio_negocio.dataValues.sn_descuento : 0
                        },
                        {
                            nombre: 'lista_precio', descuento: !!socio_negocio.dataValues.lista_de_precio ? socio_negocio.dataValues.lista_de_precio.dataValues.listp_descuento : 0
                        }
                    ];
                    var oJSON = JSON.stringify(sortJSON(jsonDescuentos, 'descuento', 'desc'));
                    producto.dataValues.prod_mejor_precio  = producto.dataValues.prod_precio -  (producto.dataValues.prod_precio * parseFloat('0.' + JSON.parse(oJSON)[0]['descuento']));
                    producto.dataValues.prod_mejor_descuento =  String(JSON.parse(oJSON)[0]['descuento'] + '%');
                    productos.push(producto);
                    console.log('index', index, req.body.productos_id.length)
                    if((req.body.productos_id.length - 1) == index){
                        res.status(200).send({
                            message: 'Producto, con el mejor descuento.',
                            productos
                        });
                    }
                })
                
            }else{
                res.status(300).send({
                    message: 'Producto, no dispobible o valido'
                })
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al obtener producto',
                e
            });
            next(e);
        }
    },
    getListProductosPaginada: async(req, res, next) =>{
        try{


            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit



            const listaProductos = await models.Producto.findAndCountAll({
                where: {
                    prod_cmm_estatus_id : { [Op.ne]: statusControles.ESTATUS_PRODUCTO.ELIMINADO },
                    prod_prod_producto_padre_sku : null
                },
                limit: varlimit,
                offset: varoffset,
                order: [
                    ['prod_producto_id', 'ASC'],
                ],
                include: [
                    {
                        model: models.Categoria,
                        attributes: {exclude: ['cat_usu_usuario_creador_id', 'cat_cmm_estatus_id', 'createdAt', 'cat_usu_usuario_modificador_id', 'updatedAt', 'cat_cat_categoria_padre_id'] },
                        include: [
                            {
                                model: models.ControlMaestroMultiple,
                                attributes: {
                                    exclude: ['cmm_contol_id', 'updatedAt', 'createdAt','cmm_control_id','cmm_nombre','cmm_sistema','cmm_activo']
                                }
                            }
                        ]
                    },
                    {
                        model: models.ControlMaestroMultiple,
                        attributes: {exclude: ['cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']}
                    },
                    {
                        model: models.Proveedores,
                        attributes: {exclude: ['createdAt', 'updatedAt']}
                    },
                    {
                        model: models.Marca,
                        attributes: {
                            exclude: [
                                'mar_descripcion',
                                'mar_cmm_estatus_id',
                                'mar_usu_usuario_creado_id',
                                'createdAt',
                                'mar_usu_usuario_modificado_id',
                                'updatedAt',
                                'mar_descuento',
                                'mar_limitante',
                                'mar_importe',
                                'mar_propiedades_extras',
                                'mar_cantidad_producto'
                            ]
                        }
                    }
                ] 
            });
            res.status(200).send({
                message: 'Lista de productos',
                listaProductos
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    getListaProductosHijosPaginada: async (req, res, next) =>{
        try{
            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit


            const productosToColecciones = await models.Producto.findAndCountAll({
                where: {
                    prod_prod_producto_padre_sku : {[Op.ne] : null },
                    prod_cmm_estatus_id: {[Op.ne]: statusControles.ESTATUS_PRODUCTO.ELIMINADO}
                },
                limit: varlimit,
                offset: varoffset,
                order: [
                    ['prod_producto_id', 'ASC'],
                ],
                include: [
                    
                    {
                        model: models.Categoria,
                        attributes: {exclude: ['cat_usu_usuario_creador_id', 'cat_cmm_estatus_id', 'createdAt', 'cat_usu_usuario_modificador_id', 'updatedAt', 'cat_cat_categoria_padre_id'] },
                        include: [
                            {
                                model: models.ControlMaestroMultiple,
                                attributes: {
                                    exclude: ['cmm_contol_id', 'updatedAt', 'createdAt','cmm_control_id','cmm_nombre','cmm_sistema','cmm_activo']
                                }
                            }
                        ]
                    },

                    {
                        model: models.Marca,
                        attributes: {
                            exclude:  ['mar_descripcion','mar_usu_usuario_creado_id','createdAt','mar_usu_usuario_modificado_id','updatedAt']
                        }
                    },
                ]
            })
            res.status(200).send({
                message: 'Lista de productos',
                productosToColecciones
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },
    frontGetProductoMain: async (req, res, next) =>{
        try{

            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit

            var ordenamientoBy = req.body.orderBy
            var ASCDESC = req.body.ASCDESC

            var prod_producto_id_con_descuento = 0
            var prod_producto_id_con_descuento_precio = 0
            var prod_producto_id_con_descuento_exacto = 0

            switch(ordenamientoBy)
            {
                case null: 
                    ordenamientoBy = "normal"
                    break;

                case '': 
                    ordenamientoBy = "normal"
                    break;

                case "precio":
                    ordenamientoBy = "prod_precio"
                    break; 

                case "mas vendido":
                    ordenamientoBy = "mas vendido"
                    break;

                case "mejores valorados":
                    ordenamientoBy = "prod_calificacion_promedio"
                    break;

                case "az-za":
                    ordenamientoBy = "prod_nombre"
                    break;

                case "fecha lanzamienta":
                    ordenamientoBy = "lanzamiento"
                    break;
            }

            if(ordenamientoBy == null)
            {
                ordenamientoBy = "normal"
            }






            //borrar ultimos dos union ( de sku padre e hijos )
            if(ordenamientoBy == 'normal')
            {
                //OBTIENE LOS RESULTADOS LO PAGINA Y LO DEVUELVE
                const rows = await sequelize.query(`
                    select 
                        p5.prod_producto_id,
                        p5.prod_nombre,
                        p5.prod_descripcion,
                        p5.prod_sku,
                        p5.prod_precio,
                        m2.mar_marca_id,
                        m2.mar_nombre,
                        p5.prod_cmm_estatus_id,
                        cmm.cmm_valor,
                        c2.cat_cmm_estatus_id,
                        cmm2.cmm_valor as cat_cmm_valor,
                        c2.cat_nombre,
                        pv.prv_nombre,
                        p5.prod_nombre_extranjero,
                        p5.prod_calificacion_promedio,
                        p5.prod_es_stock_inactivo,
                        p5.prod_tipo_precio_base
                    from 
                        productos p5
                        left join categorias c2 on p5.prod_cat_categoria_id = c2.cat_categoria_id
                        left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                        left join marcas m2 on p5.prod_mar_marca_id = m2.mar_marca_id
                        left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
                    where p5.prod_producto_id in 
                    (
                        select 
                            p1.prod_producto_id
                        from 
                        (
                            (
                                select
                                    p1.prod_producto_id,
                                    case when prod_nombre like '`+req.body.palabraBuscar+`%' then 0.5 else 1 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    prod_nombre like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null 
                            )
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when prod_descripcion like '`+req.body.palabraBuscar+`%' then 1.5 else 2 end 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    prod_descripcion like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null 
                            )
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when c2.cat_nombre like '`+req.body.palabraBuscar+`%' then 2.5 else 3 end 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id  
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    c2.cat_nombre like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null 
                                    and cat_cmm_estatus_id = `+statusControles.ESTATUS_CATEGORIA.ACTIVO+` 
                            )
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when m2.mar_nombre like '`+req.body.palabraBuscar+`%' then 3.5 else 4 end 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    m2.mar_nombre like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null 
                                    and mar_cmm_estatus_id = `+statusControles.ESTATUS_MARCAS.ACTIVA+` 
                            )
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when prod_nombre like '`+req.body.palabraBuscar+`%' then 2.1 else 2.3 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where  
                                    prod_nombre_extranjero like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null  
                            )
                        )  as p1 order by prioridad 
                    )  LIMIT `+varlimit+` OFFSET `+varoffset+` 
                    `,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });
        

                //OBTIENE EL TOTAL DEL COUNT
                const constCount = await sequelize.query(`
                    select 
                        count(p5.prod_producto_id)
                    from 
                        productos p5
                        left join categorias c2 on p5.prod_cat_categoria_id = c2.cat_categoria_id
                        left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                        left join marcas m2 on p5.prod_mar_marca_id = m2.mar_marca_id
                        left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
                    where p5.prod_producto_id in 
                    (
                        select 
                            p1.prod_producto_id
                        from 
                        (
                            (
                                select
                                    p1.prod_producto_id,
                                    case when prod_nombre like '`+req.body.palabraBuscar+`%' then 0.5 else 1 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    prod_nombre like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null 
                            )
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when prod_descripcion like '`+req.body.palabraBuscar+`%' then 1.5 else 2 end 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    prod_descripcion like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null 
                            )
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when c2.cat_nombre like '`+req.body.palabraBuscar+`%' then 2.5 else 3 end 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id  
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    c2.cat_nombre like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null 
                                    and cat_cmm_estatus_id = `+statusControles.ESTATUS_CATEGORIA.ACTIVO+` 
                            )
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when m2.mar_nombre like '`+req.body.palabraBuscar+`%' then 3.5 else 4 end 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    m2.mar_nombre like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null 
                                    and mar_cmm_estatus_id = `+statusControles.ESTATUS_MARCAS.ACTIVA+` 
                            )
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when prod_nombre like '`+req.body.palabraBuscar+`%' then 2.1 else 2.3 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    prod_nombre_extranjero like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null  
                            )
                        )  as p1 order by prioridad 
                    ) 
                    `,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });


                //se regresa un esquema parecido al del pagina nativo de sequalize
                const mainConsultaProductos = {
                    count: parseInt(constCount[0].count),
                    rows
                }

                //obtener hijos de cada row encontrado PRECIOS Y STOCK
                for (var i = 0; i < rows.length; i++) 
                {
                    const constHijosListaPerProductoPadre = await models.Producto.findAll({
                        where: {
                            prod_prod_producto_padre_sku : rows[i].prod_sku,
                            prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO
                        },
                        attributes: ['prod_producto_id', 'prod_nombre', 'prod_sku', 'prod_viñetas', 'prod_precio', "prod_dias_resurtimiento"],
                        include: [
                            {
                                model: models.ImagenProducto
                            }
                        ]
                    })


                    if(constHijosListaPerProductoPadre[0].dataValues.prod_dias_resurtimiento)
                    {
                        constHijosListaPerProductoPadre[0].dataValues.aplicaBackOrder = true
                    }
                    else
                    {
                        constHijosListaPerProductoPadre[0].dataValues.aplicaBackOrder = false
                    }
                    

                    //Si existen hijos de un producto padre se le concatenan
                    var ListaPreciosTemp = []
                    var ListaStockTemp = []
                    if(constHijosListaPerProductoPadre)
                    {
                        //PROMOCIONES
                            //Concatenar Promociones BASE
                            for (var p = 0; p < constHijosListaPerProductoPadre.length; p++) 
                            {

                                const constPromotionChildSQL = await sequelize.query(`
                                    select
                                        pd.promdes_promocion_descuento_id, 
                                        promdes_nombre, 
                                        promdes_estatus_id, 
                                        promdes_fecha_inicio_validez, 
                                        promdes_fecha_finalizacion_validez, 
                                        promdes_tipo_descuento_id,
                                        promdes_descuento_exacto ,
                                        cmm_nombre,
                                        cmm_valor
                                    from 
                                        promociones_descuentos pd 
                                        left join productos_promociones pp ON pd.promdes_promocion_descuento_id = pp.prodprom_promdes_promocion_descuento_id 
                                        left join controles_maestros_multiples cmm ON pd.promdes_tipo_descuento_id = cmm.cmm_control_id 
                                    where 
                                        pp.prodprom_prod_producto_id = `+constHijosListaPerProductoPadre[p].dataValues.prod_producto_id+`
                                        and pd.promdes_estatus_id = 1000059
                                        and pd.promdes_fecha_inicio_validez <= current_date
                                        and pd.promdes_fecha_finalizacion_validez >=  current_date
                                    order by 
                                        pd.promdes_prioridad asc 
                                        limit 1
                                    `,
                                { 
                                    type: sequelize.QueryTypes.SELECT 
                                });

                                if(constPromotionChildSQL.length > 0)
                                {
                                    constHijosListaPerProductoPadre[p].dataValues.PromocionActiva = constPromotionChildSQL
                                }
                                else
                                {
                                    constHijosListaPerProductoPadre[p].dataValues.PromocionActiva = []
                                }
                            }


                            //Concatenar valores nuevos al producto base (padre) del producto con mejor promocion
                            for (var x = 0; x < constHijosListaPerProductoPadre.length; x++) 
                            {
                                //Settear variables nuevas para tomar las promociones y mas
                                if(constHijosListaPerProductoPadre[x].dataValues.PromocionActiva.length > 0)
                                {
                                    if(constHijosListaPerProductoPadre[x].dataValues.PromocionActiva[0].promdes_descuento_exacto > prod_producto_id_con_descuento_exacto)
                                    {
                                        prod_producto_id_con_descuento = constHijosListaPerProductoPadre[x].dataValues.prod_producto_id
                                        prod_producto_id_con_descuento_precio = constHijosListaPerProductoPadre[x].dataValues.prod_precio
                                        prod_producto_id_con_descuento_exacto = constHijosListaPerProductoPadre[x].dataValues.PromocionActiva[0].promdes_descuento_exacto
                                    }
                                }
                            }

                            //Sett varibles on main
                            mainConsultaProductos.rows[i].prod_producto_id_con_descuento = prod_producto_id_con_descuento
                            mainConsultaProductos.rows[i].prod_producto_id_con_descuento_precio = prod_producto_id_con_descuento_precio
                            mainConsultaProductos.rows[i].prod_producto_id_con_descuento_exacto = prod_producto_id_con_descuento_exacto



                        //end promociones



                        //concatenacion
                        rows[i].ListaHijos = constHijosListaPerProductoPadre

                        //LISTA PRECIOS
                        for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                        {

                            const constProductoListaPrecio = await models.ProductoListaPrecio.findAll({
                                where: {
                                    pl_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                                }
                            })
                            ListaPreciosTemp.push(constProductoListaPrecio)
                        }

                        rows[i].ListaPrecios = ListaPreciosTemp


                        //LISTA STOCK
                        for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                        {

                            const constStockProducto = await models.StockProducto.findAll({
                                where: {
                                    sp_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                                }
                            })
                            ListaStockTemp.push(constStockProducto)
                        }

                        rows[i].ListaStock = ListaStockTemp

                    }
                    else
                    {
                        rows[i].ListaHijos = {}
                    }
                }


                
                res.status(200).send({
                    message: 'Lista de productos',
                    mainConsultaProductos
                })

            }
            else if(ordenamientoBy == "mas vendido")
            {
                //OBTIENE LOS RESULTADOS LO PAGINA Y LO DEVUELVE
                const rows = await sequelize.query(`
                    select 
                        p5.prod_producto_id,
                        p5.prod_nombre,
                        p5.prod_descripcion,
                        p5.prod_sku,
                        p5.prod_precio,
                        m2.mar_marca_id,
                        m2.mar_nombre,
                        p5.prod_cmm_estatus_id,
                        cmm.cmm_valor,
                        c2.cat_cmm_estatus_id,
                        cmm2.cmm_valor as cat_cmm_valor,
                        c2.cat_nombre,
                        pv.prv_nombre,
                        p5.prod_nombre_extranjero,
                        p5.prod_calificacion_promedio,
                        p5.prod_es_stock_inactivo,
                        p5.prod_tipo_precio_base,
                        COALESCE(SUM(pdcf.pcf_cantidad_producto),0) as "total_vendidos"
                    from 
                        productos p5
                        left join categorias c2 on p5.prod_cat_categoria_id = c2.cat_categoria_id
                        left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                        left join marcas m2 on p5.prod_mar_marca_id = m2.mar_marca_id
                        left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
                        left join productos_de_compra_finalizada pdcf on p5.prod_producto_id = pdcf.pcf_prod_producto_id 
                    where p5.prod_producto_id in 
                    (
                        select 
                            p1.prod_producto_id
                        from 
                        (
                            (
                                select
                                    p1.prod_producto_id,
                                    case when prod_nombre like '`+req.body.palabraBuscar+`%' then 0.5 else 1 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    prod_nombre like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null 
                            )
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when prod_descripcion like '`+req.body.palabraBuscar+`%' then 1.5 else 2 end 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    prod_descripcion like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null 
                            )
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when c2.cat_nombre like '`+req.body.palabraBuscar+`%' then 2.5 else 3 end 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id  
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    c2.cat_nombre like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null 
                                    and cat_cmm_estatus_id = `+statusControles.ESTATUS_CATEGORIA.ACTIVO+` 
                            )
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when m2.mar_nombre like '`+req.body.palabraBuscar+`%' then 3.5 else 4 end 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    m2.mar_nombre like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null 
                                    and mar_cmm_estatus_id = `+statusControles.ESTATUS_MARCAS.ACTIVA+` 
                            )
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when prod_nombre like '`+req.body.palabraBuscar+`%' then 2.1 else 2.3 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    prod_nombre_extranjero like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null  
                            )
                        )  as p1 order by prioridad 
                    ) group by p5.prod_producto_id, m2.mar_marca_id, cmm.cmm_valor, c2.cat_cmm_estatus_id, cmm2.cmm_valor, c2.cat_nombre, pv.prv_nombre 
                    order by total_vendidos `+ASCDESC+` LIMIT `+varlimit+` OFFSET `+varoffset+` 
                    `,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });
                // order by total_vendidos `+ASCDESC+` LIMIT `+varlimit+` OFFSET `+varoffset+` 


    
                //OBTIENE EL TOTAL DEL COUNT
                const constCount = await sequelize.query(`
                    select 
                        count(p5.prod_producto_id)
                    from 
                        productos p5
                        left join categorias c2 on p5.prod_cat_categoria_id = c2.cat_categoria_id
                        left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                        left join marcas m2 on p5.prod_mar_marca_id = m2.mar_marca_id
                        left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
                    where p5.prod_producto_id in 
                    (
                        select 
                            p1.prod_producto_id
                        from 
                        (
                            (
                                select
                                    p1.prod_producto_id,
                                    case when prod_nombre like '`+req.body.palabraBuscar+`%' then 0.5 else 1 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    prod_nombre like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null 
                            )
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when prod_descripcion like '`+req.body.palabraBuscar+`%' then 1.5 else 2 end 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    prod_descripcion like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null 
                            )
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when c2.cat_nombre like '`+req.body.palabraBuscar+`%' then 2.5 else 3 end 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id  
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    c2.cat_nombre like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null 
                                    and cat_cmm_estatus_id = `+statusControles.ESTATUS_CATEGORIA.ACTIVO+` 
                            )
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when m2.mar_nombre like '`+req.body.palabraBuscar+`%' then 3.5 else 4 end 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    m2.mar_nombre like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null 
                                    and mar_cmm_estatus_id = `+statusControles.ESTATUS_MARCAS.ACTIVA+` 
                            )
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when prod_nombre like '`+req.body.palabraBuscar+`%' then 2.1 else 2.3 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    prod_nombre_extranjero like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null  
                            )
                        )  as p1 order by prioridad 
                    ) 
                    `,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });


                //se regresa un esquema parecido al del pagina nativo de sequalize
                const mainConsultaProductos = {
                    count: parseInt(constCount[0].count),
                    rows
                }


                //obtener hijos de cada row encontrado PRECIOS Y STOCK
                for (var i = 0; i < rows.length; i++) 
                {
                    const constHijosListaPerProductoPadre = await models.Producto.findAll({
                        where: {
                            prod_prod_producto_padre_sku : rows[i].prod_sku,
                            prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO
                        },
                        attributes: ['prod_producto_id', 'prod_nombre', 'prod_sku', 'prod_viñetas', 'prod_precio', 'prod_dias_resurtimiento'],
                        include: [
                            {
                                model: models.ImagenProducto
                            }
                        ]
                    })


                    if(constHijosListaPerProductoPadre[0].dataValues.prod_dias_resurtimiento)
                    {
                        constHijosListaPerProductoPadre[0].dataValues.aplicaBackOrder = true
                    }
                    else
                    {
                        constHijosListaPerProductoPadre[0].dataValues.aplicaBackOrder = false
                    }

                    //Si existen hijos de un producto padre se le concatenan
                    var ListaPreciosTemp = []
                    var ListaStockTemp = []
                    if(constHijosListaPerProductoPadre)
                    {

                        //PROMOCIONES
                            //Concatenar Promociones BASE
                            for (var p = 0; p < constHijosListaPerProductoPadre.length; p++) 
                            {
                                //OBTIENE EL TOTAL DEL COUNT
                                const constPromotionChildSQL = await sequelize.query(`
                                    select
                                        pd.promdes_promocion_descuento_id, 
                                        promdes_nombre, 
                                        promdes_estatus_id, 
                                        promdes_fecha_inicio_validez, 
                                        promdes_fecha_finalizacion_validez, 
                                        promdes_tipo_descuento_id,
                                        promdes_descuento_exacto ,
                                        cmm_nombre,
                                        cmm_valor
                                    from 
                                        promociones_descuentos pd 
                                        left join productos_promociones pp ON pd.promdes_promocion_descuento_id = pp.prodprom_promdes_promocion_descuento_id 
                                        left join controles_maestros_multiples cmm ON pd.promdes_tipo_descuento_id = cmm.cmm_control_id 
                                    where 
                                        pp.prodprom_prod_producto_id = `+constHijosListaPerProductoPadre[p].dataValues.prod_producto_id+`
                                        and pd.promdes_estatus_id = 1000059
                                        and pd.promdes_fecha_inicio_validez <= current_date
                                        and pd.promdes_fecha_finalizacion_validez >=  current_date
                                    order by 
                                        pd.promdes_prioridad asc 
                                        limit 1
                                    `,
                                { 
                                    type: sequelize.QueryTypes.SELECT 
                                });

                                if(constPromotionChildSQL.length > 0)
                                {
                                    constHijosListaPerProductoPadre[p].dataValues.PromocionActiva = constPromotionChildSQL
                                }
                                else
                                {
                                    constHijosListaPerProductoPadre[p].dataValues.PromocionActiva = []
                                }
                            }


                            //Concatenar valores nuevos al producto base (padre) del producto con mejor promocion
                            for (var x = 0; x < constHijosListaPerProductoPadre.length; x++) 
                            {
                                //Settear variables nuevas para tomar las promociones y mas
                                if(constHijosListaPerProductoPadre[x].dataValues.PromocionActiva.length > 0)
                                {
                                    if(constHijosListaPerProductoPadre[x].dataValues.PromocionActiva[0].promdes_descuento_exacto > prod_producto_id_con_descuento_exacto)
                                    {
                                        prod_producto_id_con_descuento = constHijosListaPerProductoPadre[x].dataValues.prod_producto_id
                                        prod_producto_id_con_descuento_precio = constHijosListaPerProductoPadre[x].dataValues.prod_precio
                                        prod_producto_id_con_descuento_exacto = constHijosListaPerProductoPadre[x].dataValues.PromocionActiva[0].promdes_descuento_exacto
                                    }
                                }
                            }
                            //Sett varibles on main
                            //console.log(mainConsultaProductos.rows[0])
                            mainConsultaProductos.rows[i].prod_producto_id_con_descuento = prod_producto_id_con_descuento
                            mainConsultaProductos.rows[i].prod_producto_id_con_descuento_precio = prod_producto_id_con_descuento_precio
                            mainConsultaProductos.rows[i].prod_producto_id_con_descuento_exacto = prod_producto_id_con_descuento_exacto
                        //end promociones

                        //concatenacion
                        rows[i].ListaHijos = constHijosListaPerProductoPadre


                        //LISTA PRECIOS
                        for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                        {

                            const constProductoListaPrecio = await models.ProductoListaPrecio.findAll({
                                where: {
                                    pl_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                                }
                            })
                            ListaPreciosTemp.push(constProductoListaPrecio)
                        }

                        rows[i].ListaPrecios = ListaPreciosTemp


                        //LISTA STOCK
                        for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                        {

                            const constStockProducto = await models.StockProducto.findAll({
                                where: {
                                    sp_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                                }
                            })
                            ListaStockTemp.push(constStockProducto)
                        }

                        rows[i].ListaStock = ListaStockTemp

                    }
                    else
                    {
                        rows[i].ListaHijos = {}
                    }
                }
                
                res.status(200).send({
                    message: 'Lista de productos',
                    mainConsultaProductos
                })
                
            }
            //Cuando se pone el order by se reodenara la busqueda main que ya deberia venir por defecto. precio/az-za/createdAt(lanzamiento)
            else 
            {
                //OBTIENE LOS RESULTADOS LO PAGINA Y LO DEVUELVE
                const rows = await sequelize.query(`
                    select 
                        p5.prod_producto_id,
                        p5.prod_nombre,
                        p5.prod_descripcion,
                        p5.prod_sku,
                        p5.prod_precio,
                        m2.mar_marca_id,
                        m2.mar_nombre,
                        p5.prod_cmm_estatus_id,
                        cmm.cmm_valor,
                        c2.cat_cmm_estatus_id,
                        cmm2.cmm_valor as cat_cmm_valor,
                        c2.cat_nombre,
                        pv.prv_nombre,
                        p5.prod_nombre_extranjero,
                        p5.prod_calificacion_promedio,
                        p5.prod_es_stock_inactivo,
                        p5.prod_tipo_precio_base,
                        p5."createdAt" as "lanzamiento"
                    from 
                        productos p5
                        left join categorias c2 on p5.prod_cat_categoria_id = c2.cat_categoria_id
                        left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                        left join marcas m2 on p5.prod_mar_marca_id = m2.mar_marca_id
                        left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
                    where p5.prod_producto_id in 
                    (
                        select 
                            p1.prod_producto_id
                        from 
                        (
                            (
                                select
                                    p1.prod_producto_id,
                                    case when prod_nombre like '`+req.body.palabraBuscar+`%' then 0.5 else 1 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    prod_nombre like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null 
                            )
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when prod_descripcion like '`+req.body.palabraBuscar+`%' then 1.5 else 2 end 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    prod_descripcion like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null 
                            )
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when c2.cat_nombre like '`+req.body.palabraBuscar+`%' then 2.5 else 3 end 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id  
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    c2.cat_nombre like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null 
                                    and cat_cmm_estatus_id = `+statusControles.ESTATUS_CATEGORIA.ACTIVO+` 
                            )
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when m2.mar_nombre like '`+req.body.palabraBuscar+`%' then 3.5 else 4 end 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    m2.mar_nombre like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null 
                                    and mar_cmm_estatus_id = `+statusControles.ESTATUS_MARCAS.ACTIVA+` 
                            )
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when prod_nombre like '`+req.body.palabraBuscar+`%' then 2.1 else 2.3 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    prod_nombre_extranjero like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null  
                            )
                        )  as p1 order by prioridad 
                    )  order by   `+ordenamientoBy+` `+ASCDESC+` LIMIT `+varlimit+` OFFSET `+varoffset+` 
                    `,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });
                // as p1 order by   `+ordenamientoBy+` `+ASCDESC+`   LIMIT `+varlimit+` OFFSET `+varoffset+` 

                //OBTIENE EL TOTAL DEL COUNT
                const constCount = await sequelize.query(`
                    select 
                        count(p5.prod_producto_id)
                    from 
                        productos p5
                        left join categorias c2 on p5.prod_cat_categoria_id = c2.cat_categoria_id
                        left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                        left join marcas m2 on p5.prod_mar_marca_id = m2.mar_marca_id
                        left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
                    where p5.prod_producto_id in 
                    (
                        select 
                            p1.prod_producto_id
                        from 
                        (
                            (
                                select
                                    p1.prod_producto_id,
                                    case when prod_nombre like '`+req.body.palabraBuscar+`%' then 0.5 else 1 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    prod_nombre like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null 
                            )
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when prod_descripcion like '`+req.body.palabraBuscar+`%' then 1.5 else 2 end 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    prod_descripcion like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null 
                            )
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when c2.cat_nombre like '`+req.body.palabraBuscar+`%' then 2.5 else 3 end 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id  
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    c2.cat_nombre like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null 
                                    and cat_cmm_estatus_id = `+statusControles.ESTATUS_CATEGORIA.ACTIVO+` 
                            )
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when m2.mar_nombre like '`+req.body.palabraBuscar+`%' then 3.5 else 4 end 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    m2.mar_nombre like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null 
                                    and mar_cmm_estatus_id = `+statusControles.ESTATUS_MARCAS.ACTIVA+` 
                            )
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when prod_nombre like '`+req.body.palabraBuscar+`%' then 2.1 else 2.3 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    prod_nombre_extranjero like '%`+req.body.palabraBuscar+`%' 
                                    and prod_cmm_estatus_id = `+statusControles.ESTATUS_PRODUCTO.ACTIVO+` 
                                    and prod_prod_producto_padre_sku is null  
                            )
                        )  as p1 order by prioridad 
                    )
                    `,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });


                //se regresa un esquema parecido al del pagina nativo de sequalize
                const mainConsultaProductos = {
                    count: parseInt(constCount[0].count),
                    rows
                }


                //obtener hijos de cada row encontrado PRECIOS Y STOCK
                for (var i = 0; i < rows.length; i++) 
                {
                    const constHijosListaPerProductoPadre = await models.Producto.findAll({
                        where: {
                            prod_prod_producto_padre_sku : rows[i].prod_sku,
                            prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO
                        },
                        attributes: ['prod_producto_id', 'prod_nombre', 'prod_sku', 'prod_viñetas', 'prod_precio', 'prod_dias_resurtimiento'],
                        include: [
                            {
                                model: models.ImagenProducto
                            }
                        ]
                    })


                    if(constHijosListaPerProductoPadre[0].dataValues.prod_dias_resurtimiento)
                    {
                        constHijosListaPerProductoPadre[0].dataValues.aplicaBackOrder = true
                    }
                    else
                    {
                        constHijosListaPerProductoPadre[0].dataValues.aplicaBackOrder = false
                    }

                    //Si existen hijos de un producto padre se le concatenan
                    var ListaPreciosTemp = []
                    var ListaStockTemp = []
                    if(constHijosListaPerProductoPadre)
                    {

                        //PROMOCIONES
                            //Concatenar Promociones BASE
                            for (var p = 0; p < constHijosListaPerProductoPadre.length; p++) 
                            {
                                //OBTIENE EL TOTAL DEL COUNT
                                const constPromotionChildSQL = await sequelize.query(`
                                    select
                                        pd.promdes_promocion_descuento_id, 
                                        promdes_nombre, 
                                        promdes_estatus_id, 
                                        promdes_fecha_inicio_validez, 
                                        promdes_fecha_finalizacion_validez, 
                                        promdes_tipo_descuento_id,
                                        promdes_descuento_exacto ,
                                        cmm_nombre,
                                        cmm_valor
                                    from 
                                        promociones_descuentos pd 
                                        left join productos_promociones pp ON pd.promdes_promocion_descuento_id = pp.prodprom_promdes_promocion_descuento_id 
                                        left join controles_maestros_multiples cmm ON pd.promdes_tipo_descuento_id = cmm.cmm_control_id 
                                    where 
                                        pp.prodprom_prod_producto_id = `+constHijosListaPerProductoPadre[p].dataValues.prod_producto_id+`
                                        and pd.promdes_estatus_id = 1000059
                                        and pd.promdes_fecha_inicio_validez <= current_date
                                        and pd.promdes_fecha_finalizacion_validez >=  current_date
                                    order by 
                                        pd.promdes_prioridad asc 
                                        limit 1
                                    `,
                                { 
                                    type: sequelize.QueryTypes.SELECT 
                                });

                                if(constPromotionChildSQL.length > 0)
                                {
                                    constHijosListaPerProductoPadre[p].dataValues.PromocionActiva = constPromotionChildSQL
                                }
                                else
                                {
                                    constHijosListaPerProductoPadre[p].dataValues.PromocionActiva = []
                                }
                            }


                            //Concatenar valores nuevos al producto base (padre) del producto con mejor promocion
                            for (var x = 0; x < constHijosListaPerProductoPadre.length; x++) 
                            {
                                //Settear variables nuevas para tomar las promociones y mas
                                if(constHijosListaPerProductoPadre[x].dataValues.PromocionActiva.length > 0)
                                {
                                    if(constHijosListaPerProductoPadre[x].dataValues.PromocionActiva[0].promdes_descuento_exacto > prod_producto_id_con_descuento_exacto)
                                    {
                                        prod_producto_id_con_descuento = constHijosListaPerProductoPadre[x].dataValues.prod_producto_id
                                        prod_producto_id_con_descuento_precio = constHijosListaPerProductoPadre[x].dataValues.prod_precio
                                        prod_producto_id_con_descuento_exacto = constHijosListaPerProductoPadre[x].dataValues.PromocionActiva[0].promdes_descuento_exacto
                                    }
                                }
                            }
                            //Sett varibles on main
                            //console.log(mainConsultaProductos.rows[0])
                            mainConsultaProductos.rows[i].prod_producto_id_con_descuento = prod_producto_id_con_descuento
                            mainConsultaProductos.rows[i].prod_producto_id_con_descuento_precio = prod_producto_id_con_descuento_precio
                            mainConsultaProductos.rows[i].prod_producto_id_con_descuento_exacto = prod_producto_id_con_descuento_exacto
                        //end promociones

                        
                        //concatenacion
                        rows[i].ListaHijos = constHijosListaPerProductoPadre


                        //LISTA PRECIOS
                        for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                        {

                            const constProductoListaPrecio = await models.ProductoListaPrecio.findAll({
                                where: {
                                    pl_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                                }
                            })
                            ListaPreciosTemp.push(constProductoListaPrecio)
                        }

                        rows[i].ListaPrecios = ListaPreciosTemp


                        //LISTA STOCK
                        for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                        {

                            const constStockProducto = await models.StockProducto.findAll({
                                where: {
                                    sp_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                                }
                            })
                            ListaStockTemp.push(constStockProducto)
                        }

                        rows[i].ListaStock = ListaStockTemp

                    }
                    else
                    {
                        rows[i].ListaHijos = {}
                    }
                }

                
                res.status(200).send({
                    message: 'Lista de productos',
                    mainConsultaProductos
                })
            
            }


            
        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },
    frontGetProductoMainV2: async (req, res, next) =>{
        try{

            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit

            var searchBy = req.body.searchBy
            var ASCDESC = req.body.ASCDESC

            var prod_producto_id_con_descuento = 0
            var prod_producto_id_con_descuento_precio = 0
            var prod_producto_id_con_descuento_exacto = 0

            var searchCondition = req.body.palabraBuscar.toUpperCase()
            var orderByFinal = ''
            // order by   `+ordenamientoBy+` `+ASCDESC+` LIMIT `+varlimit+` OFFSET `+varoffset+` 



            var idSocioNegocio


            if(req.body.idSocioNegocio)
            {
                idSocioNegocio = req.body.idSocioNegocio
            }
            else
            {
                idSocioNegocio = null
            }





            var ordenamientoBy = req.body.orderBy
            switch(ordenamientoBy)
            {
                case null: 
                    orderByFinal = `order by prioridad `
                    ordenamientoBy = "normal"
                    break;

                case '': 
                    orderByFinal = `order by prioridad `
                    ordenamientoBy = "normal"
                    break;

                case "precio":
                    orderByFinal = `order by prod_precio `
                    ordenamientoBy = "prod_precio"
                    break; 

                case "mas vendido":
                    orderByFinal = `order by prod_unidades_vendidas `
                    ordenamientoBy = "mas vendido"
                    break;

                case "mejores valorados":
                    orderByFinal = `order by prod_calificacion_promedio `
                    ordenamientoBy = "prod_calificacion_promedio"
                    break;

                case "az-za":
                    orderByFinal = `order by prod_nombre `
                    ordenamientoBy = "prod_nombre"
                    break;

                case "fecha lanzamienta":
                    orderByFinal = `order by lanzamiento `
                    ordenamientoBy = "lanzamiento"
                    break;
            }

            orderByFinal = orderByFinal + ' ' + ASCDESC



            //SQL GENERAl
            var sqlRows = `
                select 
                    p5.prod_producto_id,
                    p5.prod_nombre,
                    p5.prod_descripcion,
                    p5.prod_sku,
                    p5.prod_precio,
                    m2.mar_marca_id,
                    m2.mar_nombre,
                    p5.prod_cmm_estatus_id,
                    cmm.cmm_valor,
                    c2.cat_cmm_estatus_id,
                    cmm2.cmm_valor as cat_cmm_valor,
                    c2.cat_nombre,
                    pv.prv_nombre,
                    p5.prod_nombre_extranjero,
                    p5.prod_calificacion_promedio,
                    p5.prod_es_stock_inactivo,
                    p5.prod_tipo_precio_base,
                    prod_unidades_vendidas,
                    p5."createdAt" as "lanzamiento"
            `;

            //SQL que solo regresara el total del count
            var sqlRowsCount = `
                select 
                    count(p5.prod_producto_id)
            `;

            //Se usara para concatenar mas codigo repetible
            var sqlFrom = `
                from 
                    productos p5
                    left join categorias c2 on p5.prod_cat_categoria_id = c2.cat_categoria_id
                    left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                    left join marcas m2 on p5.prod_mar_marca_id = m2.mar_marca_id
                    left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
            `;

            var sqlBusqueda = ``
            var sqlLimiteAndPage = ` LIMIT `+varlimit+` OFFSET `+varoffset


            
            if(searchBy == 'Marca')
            {
                sqlBusqueda = `
                    where p5.prod_producto_id in 
                    (
                        select 
                            p1.prod_producto_id
                        from 
                        (
                            --Search Fathers by Marca
                            (
                                select
                                    p1.prod_producto_id,
                                    case when m2.mar_nombre like '%`+searchCondition+`%'  then 1.7 else 1.8 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    m2.mar_nombre like '%`+searchCondition+`%' 
                                    and prod_cmm_estatus_id = 1000016
                                    and prod_prod_producto_padre_sku is null 
                            )
                            --Search Fathers by Marca Abreviatura
                            union
                            (
                                select
                                    p1.prod_producto_id,
                                    case when m2.mar_abreviatura like '%`+searchCondition+`%'  then 1.81 else 1.82 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    m2.mar_abreviatura like '%`+searchCondition+`%' 
                                    and prod_cmm_estatus_id = 1000016
                                    and prod_prod_producto_padre_sku is null 
                            )
                        )  as p1 `+orderByFinal+`
                    )
                    `;
            }
            else if(searchBy == 'Categoria')
            {
                sqlBusqueda = `
                    where p5.prod_producto_id in 
                    (
                        select 
                            p1.prod_producto_id
                        from 
                        (
                            --Search Fathers by Marca
                            (
                                select
                                    p1.prod_producto_id,
                                    case when c2.cat_nombre like '%`+searchCondition+`%'  then 1.7 else 1.8 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    c2.cat_nombre like '%`+searchCondition+`%' 
                                    and prod_cmm_estatus_id = 1000016
                                    and prod_prod_producto_padre_sku is null 
                            )
                        )  as p1 `+orderByFinal+`
                    )
                    `;
            }
            else
            {
                sqlBusqueda = `
                    where p5.prod_producto_id in 
                    (
                        select 
                            p1.prod_producto_id
                        from 
                        (
                            --Search Fathers by Name
                            (
                                select
                                    p1.prod_producto_id,
                                    case when prod_nombre like '%`+searchCondition+`%'  then 0.1 else 0.2 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    prod_nombre like '%`+searchCondition+`%' 
                                    and prod_cmm_estatus_id = 1000016
                                    and prod_prod_producto_padre_sku is null 
                            )
                            --Search Child by Name and return Only Fathers
                            union 
                            (
                                select 
                                    p2.prod_producto_id,
                                    case when prod_nombre like '%`+searchCondition+`%'  then 0.3 else 0.4 end as prioridad
                                from(
                                    select
                                        p1.prod_producto_id,
                                        case when prod_nombre like '%`+searchCondition+`%'  then 0.3 else 0.4 end as prioridad,
                                        p1.prod_sku,
                                        p1.prod_prod_producto_padre_sku 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        prod_nombre like '%`+searchCondition+`%'  
                                        and prod_cmm_estatus_id = 1000016 
                                        and prod_prod_producto_padre_sku is not null 
                                    ) temporal 
                                left join productos p2 on temporal.prod_prod_producto_padre_sku = p2.prod_sku 
                                where p2.prod_prod_producto_padre_sku is null
                                group by p2.prod_producto_id, prioridad 
                            )
                            --Search Fathers by Description
                            union
                            (
                                select
                                    p1.prod_producto_id,
                                    case when prod_descripcion like '%`+searchCondition+`%'  then 1.1 else 1.2 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    prod_descripcion like '%`+searchCondition+`%' 
                                    and prod_cmm_estatus_id = 1000016
                                    and prod_prod_producto_padre_sku is null 
                            )
                            --Search Child by Description and return Only Fathers
                            union 
                            (
                                select 
                                    p2.prod_producto_id,
                                    case when prod_descripcion like '%`+searchCondition+`%'  then 1.3 else 1.4 end as prioridad
                                from(
                                    select
                                        p1.prod_producto_id,
                                        case when prod_descripcion like '%`+searchCondition+`%'  then 1.3 else 1.4 end as prioridad,
                                        p1.prod_sku,
                                        p1.prod_prod_producto_padre_sku 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        prod_descripcion like '%`+searchCondition+`%'  
                                        and prod_cmm_estatus_id = 1000016 
                                        and prod_prod_producto_padre_sku is not null 
                                    ) temporal 
                                left join productos p2 on temporal.prod_prod_producto_padre_sku = p2.prod_sku 
                                where p2.prod_prod_producto_padre_sku is null
                                group by p2.prod_producto_id, prioridad 
                            )
                            --Search Fathers by Categoria
                            union
                            (
                                select
                                    p1.prod_producto_id,
                                    case when c2.cat_nombre like '%`+searchCondition+`%'  then 1.5 else 1.6 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    c2.cat_nombre like '%`+searchCondition+`%' 
                                    and prod_cmm_estatus_id = 1000016
                                    and prod_prod_producto_padre_sku is null 
                            )
                            --Search Fathers by Marca
                            union
                            (
                                select
                                    p1.prod_producto_id,
                                    case when m2.mar_nombre like '%`+searchCondition+`%'  then 1.7 else 1.8 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    m2.mar_nombre like '%`+searchCondition+`%' 
                                    and prod_cmm_estatus_id = 1000016
                                    and prod_prod_producto_padre_sku is null 
                            )
                            --Search Fathers by Marca Abreviatura
                            union
                            (
                                select
                                    p1.prod_producto_id,
                                    case when m2.mar_abreviatura like '%`+searchCondition+`%'  then 1.81 else 1.82 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    m2.mar_abreviatura like '%`+searchCondition+`%' 
                                    and prod_cmm_estatus_id = 1000016
                                    and prod_prod_producto_padre_sku is null 
                            )
                            --Search Fathers by Foreing Name
                            union
                            (
                                select
                                    p1.prod_producto_id,
                                    case when p1.prod_nombre_extranjero like '%`+searchCondition+`%'  then 1.9 else 2 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    p1.prod_nombre_extranjero like '%`+searchCondition+`%' 
                                    and prod_cmm_estatus_id = 1000016
                                    and prod_prod_producto_padre_sku is null 
                            )
                            --Search Child by Foreing Name and return Only Fathers
                            union 
                            (
                                select 
                                    p2.prod_producto_id,
                                    case when prod_nombre_extranjero like '%`+searchCondition+`%'  then 2.1 else 2.2 end as prioridad
                                from(
                                    select
                                        p1.prod_producto_id,
                                        case when prod_nombre_extranjero like '%`+searchCondition+`%'  then 2.3 else 2.4 end as prioridad,
                                        p1.prod_sku,
                                        p1.prod_prod_producto_padre_sku 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        prod_nombre_extranjero like '%`+searchCondition+`%'  
                                        and prod_cmm_estatus_id = 1000016 
                                        and prod_prod_producto_padre_sku is not null 
                                    ) temporal 
                                left join productos p2 on temporal.prod_prod_producto_padre_sku = p2.prod_sku 
                                where p2.prod_prod_producto_padre_sku is null
                                group by p2.prod_producto_id, prioridad 
                            )
                            --Search Fathers by SKU
                            union
                            (
                                select
                                    p1.prod_producto_id,
                                    case when p1.prod_sku like '%`+searchCondition+`%'  then 2.5 else 2.6 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    p1.prod_sku like '%`+searchCondition+`%' 
                                    and prod_cmm_estatus_id = 1000016
                                    and prod_prod_producto_padre_sku is null 
                            )
                            --Search Child by SKU and return Only Fathers
                            union 
                            (
                                select 
                                    p2.prod_producto_id,
                                    case when p2.prod_sku like '%`+searchCondition+`%'  then 2.7 else 2.8 end as prioridad
                                from(
                                    select
                                        p1.prod_producto_id,
                                        case when p1.prod_sku like '%`+searchCondition+`%'  then 2.7 else 2.8 end as prioridad,
                                        p1.prod_sku,
                                        p1.prod_prod_producto_padre_sku 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        p1.prod_sku like '%`+searchCondition+`%'  
                                        and prod_cmm_estatus_id = 1000016 
                                        and prod_prod_producto_padre_sku is not null 
                                    ) temporal 
                                left join productos p2 on temporal.prod_prod_producto_padre_sku = p2.prod_sku 
                                where p2.prod_prod_producto_padre_sku is null
                                group by p2.prod_producto_id, prioridad 
                            )
                        )  as p1 
                    ) 
                    `;
            }

            //Variables que concatenan TODO
            var sqlFinalRows = sqlRows + sqlFrom + sqlBusqueda + orderByFinal + sqlLimiteAndPage
            var sqlFinalRowsCount = sqlRowsCount + sqlFrom + sqlBusqueda 

            //Obtener Rows
            const rows = await sequelize.query(sqlFinalRows,
            {
                type: sequelize.QueryTypes.SELECT 
            });

            //Obtener Count de las rows
            const constCount = await sequelize.query(sqlFinalRowsCount,
            { 
                type: sequelize.QueryTypes.SELECT 
            });

            //Se regresa el esquema parecido a las consultas de SEQUALIZE
            const mainConsultaProductos = {
                count: parseInt(constCount[0].count),
                rows
            }

            //obtener hijos de cada row encontrado PRECIOS Y STOCK
            for (var i = 0; i < rows.length; i++) 
            {
                const constHijosListaPerProductoPadre = await models.Producto.findAll({
                    where: {
                        prod_prod_producto_padre_sku : rows[i].prod_sku,
                        prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO
                    },
                    attributes: ['prod_producto_id', 'prod_nombre', 'prod_sku', 'prod_viñetas', 'prod_precio', 'prod_dias_resurtimiento'],
                    include: [
                        {
                            model: models.ImagenProducto
                        }
                    ]
                })

                //Si existen hijos de un producto padre se le concatenan
                var ListaPreciosTemp = []
                var ListaStockTemp = []
                if(constHijosListaPerProductoPadre)
                {
                    //PROMOCIONES
                        //Concatenar Promociones BASE y dias resurtimiento
                        for (var p = 0; p < constHijosListaPerProductoPadre.length; p++) 
                        {
                            if(constHijosListaPerProductoPadre[p].dataValues.prod_dias_resurtimiento != '0')
                            {
                                constHijosListaPerProductoPadre[p].dataValues.aplicaBackOrder = true
                            }
                            else
                            {
                                constHijosListaPerProductoPadre[p].dataValues.aplicaBackOrder = false
                            }




                            //OBTIENE EL TOTAL DEL COUNT
                            const constPromotionChildSQL = await sequelize.query(`
                                select
                                    pd.promdes_promocion_descuento_id, 
                                    promdes_nombre, 
                                    promdes_estatus_id, 
                                    promdes_fecha_inicio_validez, 
                                    promdes_fecha_finalizacion_validez, 
                                    promdes_tipo_descuento_id,
                                    promdes_descuento_exacto ,
                                    cmm_nombre,
                                    cmm_valor
                                from 
                                    promociones_descuentos pd 
                                    left join productos_promociones pp ON pd.promdes_promocion_descuento_id = pp.prodprom_promdes_promocion_descuento_id 
                                    left join controles_maestros_multiples cmm ON pd.promdes_tipo_descuento_id = cmm.cmm_control_id 
                                where 
                                    pp.prodprom_prod_producto_id = `+constHijosListaPerProductoPadre[p].dataValues.prod_producto_id+`
                                    and pd.promdes_estatus_id = 1000059
                                    and pd.promdes_fecha_inicio_validez <= current_date
                                    and pd.promdes_fecha_finalizacion_validez >=  current_date
                                order by 
                                    pd.promdes_prioridad asc 
                                    limit 1
                                `,
                            { 
                                type: sequelize.QueryTypes.SELECT 
                            });

                            if(constPromotionChildSQL.length > 0)
                            {
                                constHijosListaPerProductoPadre[p].dataValues.PromocionActiva = constPromotionChildSQL
                            }
                            else
                            {
                                constHijosListaPerProductoPadre[p].dataValues.PromocionActiva = []
                            }
                        }


                        //Concatenar valores nuevos al producto base (padre) del producto con mejor promocion
                        for (var x = 0; x < constHijosListaPerProductoPadre.length; x++) 
                        {
                            //Settear variables nuevas para tomar las promociones y mas
                            if(constHijosListaPerProductoPadre[x].dataValues.PromocionActiva.length > 0)
                            {
                                if(constHijosListaPerProductoPadre[x].dataValues.PromocionActiva[0].promdes_descuento_exacto > prod_producto_id_con_descuento_exacto)
                                {
                                    prod_producto_id_con_descuento = constHijosListaPerProductoPadre[x].dataValues.prod_producto_id
                                    prod_producto_id_con_descuento_precio = constHijosListaPerProductoPadre[x].dataValues.prod_precio
                                    prod_producto_id_con_descuento_exacto = constHijosListaPerProductoPadre[x].dataValues.PromocionActiva[0].promdes_descuento_exacto
                                }
                            }
                        }
                        //Sett varibles on main
                        //console.log(mainConsultaProductos.rows[0])
                        mainConsultaProductos.rows[i].prod_producto_id_con_descuento = prod_producto_id_con_descuento
                        mainConsultaProductos.rows[i].prod_producto_id_con_descuento_precio = prod_producto_id_con_descuento_precio
                        mainConsultaProductos.rows[i].prod_producto_id_con_descuento_exacto = prod_producto_id_con_descuento_exacto
                    //end promociones

                    //concatenacion
                    rows[i].ListaHijos = constHijosListaPerProductoPadre

                    //LISTA PRECIOS
                    for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                    {

                        const constProductoListaPrecio = await models.ProductoListaPrecio.findAll({
                            where: {
                                pl_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                            }
                        })
                        ListaPreciosTemp.push(constProductoListaPrecio)
                    }

                    rows[i].ListaPrecios = ListaPreciosTemp


                    //LISTA STOCK
                    for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                    {

                        const constStockProducto = await models.StockProducto.findAll({
                            where: {
                                sp_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                            }
                        })
                        ListaStockTemp.push(constStockProducto)
                    }

                    rows[i].ListaStock = ListaStockTemp

                }
                else
                {
                    rows[i].ListaHijos = {}
                }
            }



            //Si se manda el dato del socio de negocio podra asignar precio segun su lista de precio
            if(idSocioNegocio != null)
            {
                //Obtener precio por SN y promocion con iva
                for (var u = 0; u < mainConsultaProductos.rows.length; u++) 
                {
                    for (var k = 0; k < mainConsultaProductos.rows[u].ListaHijos.length; k++) 
                    {
                        //console.log(mainConsultaProductos.rows[u].ListaHijos[k])

                        const constProducto22 = await models.Producto.findOne(
                        {
                            where: {
                                prod_producto_id: mainConsultaProductos.rows[u].ListaHijos[k].prod_producto_id
                            }
                        });


                        console.log(constProducto22)

                        const constSociosNegocio22 = await models.SociosNegocio.findOne(
                        {
                            where: {
                                sn_socios_negocio_id: req.body.idSocioNegocio
                            },
                            attributes:  ["sn_socios_negocio_id", "sn_cardcode", "sn_codigo_direccion_facturacion", "sn_lista_precios"]
                        });




                        var precioBasePorListaPrecio
                        if(constProducto22.prod_es_stock_inactivo == true)
                        {
                            //Se dejara el precio base que tenga el producto sin importar que
                            precioBasePorListaPrecio = constProducto22.prod_precio
                        }
                        else
                        {



                            


                            //Buscar la lista de precio que tenga asignada el SN y buscar el precio que se le dara al carrito
                            const constProductoListaPrecio22 = await models.ProductoListaPrecio.findOne(
                            {
                                where: {
                                    pl_prod_producto_id: mainConsultaProductos.rows[u].ListaHijos[k].prod_producto_id,
                                    pl_listp_lista_de_precio_id: constSociosNegocio22.sn_lista_precios
                                }
                            });

                            precioBasePorListaPrecio = constProductoListaPrecio22.pl_precio_producto
                        }
                        
                        mainConsultaProductos.rows[u].ListaHijos[k].dataValues.precioBasePorListaPrecio = precioBasePorListaPrecio









                        var precioTemporal = precioBasePorListaPrecio
                        var precioBase = precioBasePorListaPrecio
                        var tipoImpuesto = 16
                        //obtener direccion de facturacion
                        const constSociosNegocioDirecciones22 = await models.SociosNegocioDirecciones.findOne(
                        {
                            where: {
                                snd_cardcode: constSociosNegocio22.sn_cardcode,
                                snd_idDireccion: constSociosNegocio22.sn_codigo_direccion_facturacion,
                                snd_tipoDir: "B"
                            }
                            // ,
                            // attributes:  ["sn_socios_negocio_id", "sn_cardcode", "sn_codigo_direccion_facturacion"]
                        });
                        if(constSociosNegocioDirecciones22.snd_codigo_postal)
                        {
                            const constCodigosPostales = await models.CodigosPostales.findOne(
                            {
                                where: {
                                    cp_codigo_postal: constSociosNegocioDirecciones22.snd_codigo_postal
                                }
                            });

                            if(constCodigosPostales.cp_frontera == 1)
                            {
                                tipoImpuesto = 8
                            }
                            else
                            {
                                tipoImpuesto = 16
                            }
                        }
                        else
                        {
                            tipoImpuesto = 16
                        }  
                        //Si existe promocion
                        if(mainConsultaProductos.rows[u].ListaHijos[k].dataValues.PromocionActiva.length > 0)
                        {
                            //Calcular precio promocion activa
                            if(mainConsultaProductos.rows[u].ListaHijos[k].dataValues.PromocionActiva[0].cmm_valor == "Porcentaje")
                            {   
                                //Valor de la promocion por porcentaje
                                var cantidadPromocion = mainConsultaProductos.rows[u].ListaHijos[k].dataValues.PromocionActiva[0].promdes_descuento_exacto
                                precioTemporal = precioTemporal-(((cantidadPromocion/ 100) * precioTemporal).toFixed(2))

                                if(precioTemporal <= 0)
                                {
                                    precioTemporal = 0
                                }
                            }
                            //Si es monto fijo
                            else
                            {
                                //Valor de la promocion de procentaje o fijo
                                var cantidadPromocion = mainConsultaProductos.rows[u].ListaHijos[k].dataValues.PromocionActiva[0].promdes_descuento_exacto
                                precioTemporal = precioTemporal - cantidadPromocion

                                //Si es mejor que 0 se setteara a 0 la variable para que el producto no cueste menos que 0 LOL
                                if(precioTemporal <= 0)
                                {
                                    precioTemporal = 0
                                }
                            }
                        }
                        





                        // //Sett variable de promocion en el arreglo inicial
                        mainConsultaProductos.rows[u].ListaHijos[k].dataValues.precioFinal = precioTemporal
                        mainConsultaProductos.rows[u].ListaHijos[k].dataValues.precioFinalMasImpuesto = (precioTemporal * (1 + (tipoImpuesto / 100)))
                        mainConsultaProductos.rows[u].ListaHijos[k].dataValues.precioFinalMasImpuesto = parseFloat(mainConsultaProductos.rows[u].ListaHijos[k].dataValues.precioFinalMasImpuesto.toFixed(2))


                    }
                    
                }
            }






            res.status(200).send({
                message: 'Lista de productos',
                mainConsultaProductos
            })


        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },

    frontGetProductoAdvancedSearch: async (req, res, next) =>{
        try{
            var prod_producto_id_con_descuento = 0
            var prod_producto_id_con_descuento_precio = 0
            var prod_producto_id_con_descuento_exacto = 0

            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit

            //OBTIENE EL TOTAL DE ROWS DE LA CONSULTA PARA DEVOLVERLO PARA EL PAGINADO
            var queryAdvancedSearch = `
            select
                p1.prod_producto_id,
                p1.prod_nombre,
                p1.prod_descripcion,
                p1.prod_sku,
                p1.prod_precio,
                m2.mar_marca_id,
                m2.mar_nombre,
                p1.prod_es_stock_inactivo,
                p1.prod_tipo_precio_base
            from 
                productos p1 
                left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
            where 
                prod_prod_producto_padre_sku is null 
                and p1.prod_cmm_estatus_id = 1000016 
                `;


            var queryAdvancedSearchCounted = `
            select
                count(p1.*)
            from 
                productos p1 
                left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
            where 
                prod_prod_producto_padre_sku is null 
                and p1.prod_cmm_estatus_id = 1000016 
                `;



            if(req.body.prod_nombre != '')
            {
                queryAdvancedSearchCounted = queryAdvancedSearchCounted + " and p1.prod_nombre like '%"+req.body.prod_nombre+"%' "
                queryAdvancedSearch = queryAdvancedSearch + " and p1.prod_nombre like '%"+req.body.prod_nombre+"%' "
            }

            if(req.body.prod_descripcion != '')
            {
                queryAdvancedSearchCounted = queryAdvancedSearchCounted + " and p1.prod_descripcion like '%"+req.body.prod_descripcion+"%' "
                queryAdvancedSearch = queryAdvancedSearch + " and p1.prod_descripcion like '%"+req.body.prod_descripcion+"%' "
            }

            if(req.body.prod_sku != '')
            {
                queryAdvancedSearchCounted = queryAdvancedSearchCounted + " and p1.prod_sku like '%"+req.body.prod_sku+"%' "
                queryAdvancedSearch = queryAdvancedSearch + " and p1.prod_sku like '%"+req.body.prod_sku+"%' "
            }

            if(req.body.mar_nombre != '')
            {
                queryAdvancedSearchCounted = queryAdvancedSearchCounted + " and m2.mar_nombre like '%"+req.body.mar_nombre+"%' "
                queryAdvancedSearch = queryAdvancedSearch + " and m2.mar_nombre like '%"+req.body.mar_nombre+"%' "
            }

            if(req.body.cat_nombre != '')
            {
                queryAdvancedSearchCounted = queryAdvancedSearchCounted + " and c2.cat_nombre like '%"+req.body.cat_nombre+"%' "
                queryAdvancedSearch = queryAdvancedSearch + " and c2.cat_nombre like '%"+req.body.cat_nombre+"%' "
            }

            queryAdvancedSearch = queryAdvancedSearch + ` LIMIT `+varlimit+` OFFSET `+varoffset 

            //Obtener total de rows
            const rows = await sequelize.query(queryAdvancedSearch,
            { 
                type: sequelize.QueryTypes.SELECT 
            });
    

            //OBTIENE LOS ELEMENTOS BUSCADOS
            const constCount = await sequelize.query(queryAdvancedSearchCounted,
            { 
                type: sequelize.QueryTypes.SELECT 
            });
           
            //se regresa un esquema parecido al del pagina nativo de sequalize
            const mainConsultaProductos = {
                count: parseInt(constCount[0].count),
                rows
            }

            //obtener hijos de cada row encontrado PRECIOS Y STOCK
            for (var i = 0; i < rows.length; i++) 
            {
                const constHijosListaPerProductoPadre = await models.Producto.findAll({
                    where: {
                        prod_prod_producto_padre_sku : rows[i].prod_sku,
                        prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO
                    },
                    attributes: ['prod_producto_id', 'prod_nombre', 'prod_sku', 'prod_viñetas', 'prod_precio'],
                    include: [
                        {
                            model: models.ImagenProducto
                        }
                    ]
                })

                //Si existen hijos de un producto padre se le concatenan
                var ListaPreciosTemp = []
                var ListaStockTemp = []
                if(constHijosListaPerProductoPadre)
                {

                    //PROMOCIONES
                        //Concatenar Promociones BASE
                        for (var p = 0; p < constHijosListaPerProductoPadre.length; p++) 
                        {
                            //OBTIENE EL TOTAL DEL COUNT
                            const constPromotionChildSQL = await sequelize.query(`
                                select
                                    pd.promdes_promocion_descuento_id, 
                                    promdes_nombre, 
                                    promdes_estatus_id, 
                                    promdes_fecha_inicio_validez, 
                                    promdes_fecha_finalizacion_validez, 
                                    promdes_tipo_descuento_id,
                                    promdes_descuento_exacto ,
                                    cmm_nombre,
                                    cmm_valor
                                from 
                                    promociones_descuentos pd 
                                    left join productos_promociones pp ON pd.promdes_promocion_descuento_id = pp.prodprom_promdes_promocion_descuento_id 
                                    left join controles_maestros_multiples cmm ON pd.promdes_tipo_descuento_id = cmm.cmm_control_id 
                                where 
                                    pp.prodprom_prod_producto_id = `+constHijosListaPerProductoPadre[p].dataValues.prod_producto_id+`
                                    and pd.promdes_estatus_id = 1000059
                                    and pd.promdes_fecha_inicio_validez <= current_date
                                    and pd.promdes_fecha_finalizacion_validez >=  current_date
                                order by 
                                    pd.promdes_prioridad asc 
                                    limit 1
                                `,
                            { 
                                type: sequelize.QueryTypes.SELECT 
                            });

                            if(constPromotionChildSQL.length > 0)
                            {
                                constHijosListaPerProductoPadre[p].dataValues.PromocionActiva = constPromotionChildSQL
                            }
                            else
                            {
                                constHijosListaPerProductoPadre[p].dataValues.PromocionActiva = []
                            }
                        }


                        //Concatenar valores nuevos al producto base (padre) del producto con mejor promocion
                        for (var x = 0; x < constHijosListaPerProductoPadre.length; x++) 
                        {
                            //Settear variables nuevas para tomar las promociones y mas
                            if(constHijosListaPerProductoPadre[x].dataValues.PromocionActiva.length > 0)
                            {
                                if(constHijosListaPerProductoPadre[x].dataValues.PromocionActiva[0].promdes_descuento_exacto > prod_producto_id_con_descuento_exacto)
                                {
                                    prod_producto_id_con_descuento = constHijosListaPerProductoPadre[x].dataValues.prod_producto_id
                                    prod_producto_id_con_descuento_precio = constHijosListaPerProductoPadre[x].dataValues.prod_precio
                                    prod_producto_id_con_descuento_exacto = constHijosListaPerProductoPadre[x].dataValues.PromocionActiva[0].promdes_descuento_exacto
                                }
                            }
                        }
                        //Sett varibles on main
                        //console.log(mainConsultaProductos.rows[0])
                        mainConsultaProductos.rows[i].prod_producto_id_con_descuento = prod_producto_id_con_descuento
                        mainConsultaProductos.rows[i].prod_producto_id_con_descuento_precio = prod_producto_id_con_descuento_precio
                        mainConsultaProductos.rows[i].prod_producto_id_con_descuento_exacto = prod_producto_id_con_descuento_exacto
                    //end promociones



                    //concatenacion
                    rows[i].ListaHijos = constHijosListaPerProductoPadre

                    //LISTA PRECIOS
                    for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                    {

                        const constProductoListaPrecio = await models.ProductoListaPrecio.findAll({
                            where: {
                                pl_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                            }
                        })
                        ListaPreciosTemp.push(constProductoListaPrecio)
                    }

                    rows[i].ListaPrecios = ListaPreciosTemp


                    //LISTA STOCK
                    for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                    {

                        const constStockProducto = await models.StockProducto.findAll({
                            where: {
                                sp_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                            }
                        })
                        ListaStockTemp.push(constStockProducto)
                    }

                    rows[i].ListaStock = ListaStockTemp

                }
                else
                {
                    rows[i].ListaHijos = {}
                }
            }
            
            res.status(200).send({
                message: 'Lista de productos',
                mainConsultaProductos
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },
    getListaBySKUHijos: async (req, res, next) =>{
        try{
            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit

            //Obtienes un listado de SKU Hijos apartir de un SKU hijo paginado
            const productosToColecciones = await models.Producto.findAndCountAll({
                where: {
                    prod_prod_producto_padre_sku : {[Op.ne] : null },
                    prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO,
                    prod_sku: {
                        [Op.like]: '%'+req.body.prod_sku+'%'
                    }
                },
                limit: varlimit,
                offset: varoffset
            })
            res.status(200).send({
                message: 'Lista de productos',
                productosToColecciones
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },
    getListaBySKUHijosPromociones: async (req, res, next) =>{
        try{

            //Obtienes un listado de SKU Hijos apartir de un SKU hijo paginado
            const productosToColecciones = await models.Producto.findAndCountAll({
                where: {
                    prod_prod_producto_padre_sku : {[Op.ne] : null },
                    prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO,
                    prod_sku: {
                        [Op.like]: '%'+req.body.prod_sku+'%'
                    }
                },
                attributes: ['prod_producto_id', 'prod_nombre', 'prod_sku', 'prod_nombre']
            })
            res.status(200).send({
                message: 'Lista de productos',
                productosToColecciones
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },
    getProductosByFiltroPadres: async (req, res, next) =>{
        try{
            var prod_producto_id_con_descuento = 0
            var prod_producto_id_con_descuento_precio = 0
            var prod_producto_id_con_descuento_exacto = 0

            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit

            if(req.body.filtro == 'Categoria')     //FILTRO DE CATEGORIAS
            {
                const constProductosFiltrados = await models.Producto.findAndCountAll({
                    where: {
                        prod_prod_producto_padre_sku : null,
                        prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO,
                        prod_cat_categoria_id: req.body.condicion
                    },
                    limit: varlimit,
                    offset: varoffset,
                    order: [
                        ['prod_producto_id', 'ASC'],
                    ],
                    include: 
                    [
                        {
                            model: models.ControlMaestroMultiple,
                            attributes: {
                                exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                            }
                        },
                        {
                            model: models.Categoria,
                            attributes: {
                                exclude: ['cat_usu_usuario_modificador_id','createdAt','cat_cat_categoria_padre_id','updatedAt'],
                            },
                            include: [
                                {
                                    model: models.ControlMaestroMultiple,
                                    attributes: {
                                        exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                    }
                                }
                            ]

                        },
                        {
                            model: models.Proveedores,
                            attributes: {exclude: ['createdAt', 'updatedAt']}
                        }
                    ]
                })

                //var rows = constProductosFiltrados.rows

                //obtener hijos de cada row encontrado PRECIOS Y STOCK
                for (var i = 0; i < constProductosFiltrados.rows.length; i++) 
                {
                    const constHijosListaPerProductoPadre = await models.Producto.findAll({
                        where: {
                            prod_prod_producto_padre_sku : constProductosFiltrados.rows[i].prod_sku,
                            prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO
                        },
                        attributes: ['prod_producto_id', 'prod_nombre', 'prod_sku', 'prod_viñetas', 'prod_precio'],
                        include: [
                            {
                                model: models.ImagenProducto
                            }
                        ]
                    })

                    //Si existen hijos de un producto padre se le concatenan
                    var ListaPreciosTemp = []
                    var ListaStockTemp = []
                    if(constHijosListaPerProductoPadre)
                    {

                        //PROMOCIONES
                            //Concatenar Promociones BASE
                            for (var p = 0; p < constHijosListaPerProductoPadre.length; p++) 
                            {
                                //OBTIENE EL TOTAL DEL COUNT
                                const constPromotionChildSQL = await sequelize.query(`
                                    select
                                        pd.promdes_promocion_descuento_id, 
                                        promdes_nombre, 
                                        promdes_estatus_id, 
                                        promdes_fecha_inicio_validez, 
                                        promdes_fecha_finalizacion_validez, 
                                        promdes_tipo_descuento_id,
                                        promdes_descuento_exacto ,
                                        cmm_nombre,
                                        cmm_valor
                                    from 
                                        promociones_descuentos pd 
                                        left join productos_promociones pp ON pd.promdes_promocion_descuento_id = pp.prodprom_promdes_promocion_descuento_id 
                                        left join controles_maestros_multiples cmm ON pd.promdes_tipo_descuento_id = cmm.cmm_control_id 
                                    where 
                                        pp.prodprom_prod_producto_id = `+constHijosListaPerProductoPadre[p].dataValues.prod_producto_id+`
                                        and pd.promdes_estatus_id = 1000059
                                        and pd.promdes_fecha_inicio_validez <= current_date
                                        and pd.promdes_fecha_finalizacion_validez >=  current_date
                                    order by 
                                        pd.promdes_prioridad asc 
                                        limit 1
                                    `,
                                { 
                                    type: sequelize.QueryTypes.SELECT 
                                });

                                if(constPromotionChildSQL.length > 0)
                                {
                                    constHijosListaPerProductoPadre[p].dataValues.PromocionActiva = constPromotionChildSQL
                                }
                                else
                                {
                                    constHijosListaPerProductoPadre[p].dataValues.PromocionActiva = []
                                }
                            }


                            //Concatenar valores nuevos al producto base (padre) del producto con mejor promocion
                            for (var x = 0; x < constHijosListaPerProductoPadre.length; x++) 
                            {
                                //Settear variables nuevas para tomar las promociones y mas
                                if(constHijosListaPerProductoPadre[x].dataValues.PromocionActiva.length > 0)
                                {
                                    if(constHijosListaPerProductoPadre[x].dataValues.PromocionActiva[0].promdes_descuento_exacto > prod_producto_id_con_descuento_exacto)
                                    {
                                        prod_producto_id_con_descuento = constHijosListaPerProductoPadre[x].dataValues.prod_producto_id
                                        prod_producto_id_con_descuento_precio = constHijosListaPerProductoPadre[x].dataValues.prod_precio
                                        prod_producto_id_con_descuento_exacto = constHijosListaPerProductoPadre[x].dataValues.PromocionActiva[0].promdes_descuento_exacto
                                    }
                                }
                            }
                            //Sett varibles on main
                            //console.log(mainConsultaProductos.rows[0])
                            constProductosFiltrados.rows[i].dataValues.prod_producto_id_con_descuento = prod_producto_id_con_descuento
                            constProductosFiltrados.rows[i].dataValues.prod_producto_id_con_descuento_precio = prod_producto_id_con_descuento_precio
                            constProductosFiltrados.rows[i].dataValues.prod_producto_id_con_descuento_exacto = prod_producto_id_con_descuento_exacto
                        //end promociones



                        //concatenacion
                        //constProductosFiltrados.rows[i].ListaHijos = constHijosListaPerProductoPadre
                        constProductosFiltrados.rows[i].ListaHijos = constHijosListaPerProductoPadre
                        constProductosFiltrados.rows[i].dataValues.ListaHijos = constHijosListaPerProductoPadre


                        //LISTA PRECIOS
                        for (var f = 0; f < constProductosFiltrados.rows[i].ListaHijos.length; f++) 
                        {

                            const constProductoListaPrecio = await models.ProductoListaPrecio.findAll({
                                where: {
                                    pl_prod_producto_id : constProductosFiltrados.rows[i].ListaHijos[f].prod_producto_id
                                }
                            })
                            ListaPreciosTemp.push(constProductoListaPrecio)
                        }

                        constProductosFiltrados.rows[i].dataValues.ListaPrecios = ListaPreciosTemp


                        //LISTA STOCK
                        for (var f = 0; f < constProductosFiltrados.rows[i].ListaHijos.length; f++) 
                        {

                            const constStockProducto = await models.StockProducto.findAll({
                                where: {
                                    sp_prod_producto_id : constProductosFiltrados.rows[i].ListaHijos[f].prod_producto_id
                                }
                            })
                            ListaStockTemp.push(constStockProducto)
                        }

                        constProductosFiltrados.rows[i].dataValues.ListaStock = ListaStockTemp

                    }
                    else
                    {
                        constProductosFiltrados.rows[i].ListaHijos = {}
                    }
                }

                //console.log(constProductosFiltrados)

                res.status(200).send({
                    message: 'Lista de productos',
                    constProductosFiltrados
                })

            }
            else if(req.body.filtro == 'Marca')    //FILTRO DE MARCAS
            {
                const constProductosFiltrados = await models.Producto.findAndCountAll({
                    where: {
                        prod_prod_producto_padre_sku : null,
                        prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO,
                        prod_mar_marca_id: req.body.condicion
                    },
                    limit: varlimit,
                    offset: varoffset,
                    order: [
                        ['prod_producto_id', 'ASC'],
                    ],
                    include: 
                    [
                        {
                            model: models.ControlMaestroMultiple,
                            attributes: {
                                exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                            }
                        },
                        {
                            model: models.Categoria,
                            attributes: {
                                exclude: ['cat_usu_usuario_modificador_id','createdAt','cat_cat_categoria_padre_id','updatedAt'],
                            },
                            include: [
                                {
                                    model: models.ControlMaestroMultiple,
                                    attributes: {
                                        exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                    }
                                }
                            ]

                        },
                        {
                            model: models.Proveedores,
                            attributes: {exclude: ['createdAt', 'updatedAt']}
                        }
                    ]
                })

                //obtener hijos de cada row encontrado PRECIOS Y STOCK
                for (var i = 0; i < constProductosFiltrados.rows.length; i++) 
                {
                    const constHijosListaPerProductoPadre = await models.Producto.findAll({
                        where: {
                            prod_prod_producto_padre_sku : constProductosFiltrados.rows[i].prod_sku,
                            prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO
                        },
                        attributes: ['prod_producto_id', 'prod_nombre', 'prod_sku', 'prod_viñetas', 'prod_precio'],
                        include: [
                            {
                                model: models.ImagenProducto
                            }
                        ]
                    })

                    //Si existen hijos de un producto padre se le concatenan
                    var ListaPreciosTemp = []
                    var ListaStockTemp = []
                    if(constHijosListaPerProductoPadre)
                    {

                        //PROMOCIONES
                            //Concatenar Promociones BASE
                            for (var p = 0; p < constHijosListaPerProductoPadre.length; p++) 
                            {
                                //OBTIENE EL TOTAL DEL COUNT
                                const constPromotionChildSQL = await sequelize.query(`
                                    select
                                        pd.promdes_promocion_descuento_id, 
                                        promdes_nombre, 
                                        promdes_estatus_id, 
                                        promdes_fecha_inicio_validez, 
                                        promdes_fecha_finalizacion_validez, 
                                        promdes_tipo_descuento_id,
                                        promdes_descuento_exacto ,
                                        cmm_nombre,
                                        cmm_valor
                                    from 
                                        promociones_descuentos pd 
                                        left join productos_promociones pp ON pd.promdes_promocion_descuento_id = pp.prodprom_promdes_promocion_descuento_id 
                                        left join controles_maestros_multiples cmm ON pd.promdes_tipo_descuento_id = cmm.cmm_control_id 
                                    where 
                                        pp.prodprom_prod_producto_id = `+constHijosListaPerProductoPadre[p].dataValues.prod_producto_id+`
                                        and pd.promdes_estatus_id = 1000059
                                        and pd.promdes_fecha_inicio_validez <= current_date
                                        and pd.promdes_fecha_finalizacion_validez >=  current_date
                                    order by 
                                        pd.promdes_prioridad asc 
                                        limit 1
                                    `,
                                { 
                                    type: sequelize.QueryTypes.SELECT 
                                });

                                if(constPromotionChildSQL.length > 0)
                                {
                                    constHijosListaPerProductoPadre[p].dataValues.PromocionActiva = constPromotionChildSQL
                                }
                                else
                                {
                                    constHijosListaPerProductoPadre[p].dataValues.PromocionActiva = []
                                }
                            }


                            //Concatenar valores nuevos al producto base (padre) del producto con mejor promocion
                            for (var x = 0; x < constHijosListaPerProductoPadre.length; x++) 
                            {
                                //Settear variables nuevas para tomar las promociones y mas
                                if(constHijosListaPerProductoPadre[x].dataValues.PromocionActiva.length > 0)
                                {
                                    if(constHijosListaPerProductoPadre[x].dataValues.PromocionActiva[0].promdes_descuento_exacto > prod_producto_id_con_descuento_exacto)
                                    {
                                        prod_producto_id_con_descuento = constHijosListaPerProductoPadre[x].dataValues.prod_producto_id
                                        prod_producto_id_con_descuento_precio = constHijosListaPerProductoPadre[x].dataValues.prod_precio
                                        prod_producto_id_con_descuento_exacto = constHijosListaPerProductoPadre[x].dataValues.PromocionActiva[0].promdes_descuento_exacto
                                    }
                                }
                            }
                            //Sett varibles on main
                            //console.log(mainConsultaProductos.rows[0])
                            constProductosFiltrados.rows[i].dataValues.prod_producto_id_con_descuento = prod_producto_id_con_descuento
                            constProductosFiltrados.rows[i].dataValues.prod_producto_id_con_descuento_precio = prod_producto_id_con_descuento_precio
                            constProductosFiltrados.rows[i].dataValues.prod_producto_id_con_descuento_exacto = prod_producto_id_con_descuento_exacto
                        //end promociones



                        //concatenacion
                        //constProductosFiltrados.rows[i].ListaHijos = constHijosListaPerProductoPadre
                        constProductosFiltrados.rows[i].ListaHijos = constHijosListaPerProductoPadre
                        constProductosFiltrados.rows[i].dataValues.ListaHijos = constHijosListaPerProductoPadre


                        //LISTA PRECIOS
                        for (var f = 0; f < constProductosFiltrados.rows[i].ListaHijos.length; f++) 
                        {

                            const constProductoListaPrecio = await models.ProductoListaPrecio.findAll({
                                where: {
                                    pl_prod_producto_id : constProductosFiltrados.rows[i].ListaHijos[f].prod_producto_id
                                }
                            })
                            ListaPreciosTemp.push(constProductoListaPrecio)
                        }

                        constProductosFiltrados.rows[i].dataValues.ListaPrecios = ListaPreciosTemp


                        //LISTA STOCK
                        for (var f = 0; f < constProductosFiltrados.rows[i].ListaHijos.length; f++) 
                        {

                            const constStockProducto = await models.StockProducto.findAll({
                                where: {
                                    sp_prod_producto_id : constProductosFiltrados.rows[i].ListaHijos[f].prod_producto_id
                                }
                            })
                            ListaStockTemp.push(constStockProducto)
                        }

                        constProductosFiltrados.rows[i].dataValues.ListaStock = ListaStockTemp

                    }
                    else
                    {
                        constProductosFiltrados.rows[i].ListaHijos = {}
                    }
                }

                res.status(200).send({
                    message: 'Lista de productos',
                    constProductosFiltrados
                })

            }
            else if(req.body.filtro == 'Proveedores')    //FILTRO DE PROVEEDORES
            {
                const constProductosFiltrados = await models.Producto.findAndCountAll({
                    where: {
                        prod_prod_producto_padre_sku : null,
                        prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO,
                        prod_proveedor_id: req.body.condicion
                    },
                    limit: varlimit,
                    offset: varoffset,
                    order: [
                        ['prod_producto_id', 'ASC'],
                    ],
                    include: 
                    [
                        {
                            model: models.ControlMaestroMultiple,
                            attributes: {
                                exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                            }
                        },
                        {
                            model: models.Categoria,
                            attributes: {
                                exclude: ['cat_usu_usuario_modificador_id','createdAt','cat_cat_categoria_padre_id','updatedAt'],
                            },
                            include: [
                                {
                                    model: models.ControlMaestroMultiple,
                                    attributes: {
                                        exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                    }
                                }
                            ]

                        },
                        {
                            model: models.Proveedores,
                            attributes: {exclude: ['createdAt', 'updatedAt']}
                        }
                    ]
                })

                //obtener hijos de cada row encontrado PRECIOS Y STOCK
                for (var i = 0; i < constProductosFiltrados.rows.length; i++) 
                {
                    const constHijosListaPerProductoPadre = await models.Producto.findAll({
                        where: {
                            prod_prod_producto_padre_sku : constProductosFiltrados.rows[i].prod_sku,
                            prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO
                        },
                        attributes: ['prod_producto_id', 'prod_nombre', 'prod_sku', 'prod_viñetas', 'prod_precio'],
                        include: [
                            {
                                model: models.ImagenProducto
                            }
                        ]
                    })

                    //Si existen hijos de un producto padre se le concatenan
                    var ListaPreciosTemp = []
                    var ListaStockTemp = []
                    if(constHijosListaPerProductoPadre)
                    {

                        //PROMOCIONES
                            //Concatenar Promociones BASE
                            for (var p = 0; p < constHijosListaPerProductoPadre.length; p++) 
                            {
                                //OBTIENE EL TOTAL DEL COUNT
                                const constPromotionChildSQL = await sequelize.query(`
                                    select
                                        pd.promdes_promocion_descuento_id, 
                                        promdes_nombre, 
                                        promdes_estatus_id, 
                                        promdes_fecha_inicio_validez, 
                                        promdes_fecha_finalizacion_validez, 
                                        promdes_tipo_descuento_id,
                                        promdes_descuento_exacto ,
                                        cmm_nombre,
                                        cmm_valor
                                    from 
                                        promociones_descuentos pd 
                                        left join productos_promociones pp ON pd.promdes_promocion_descuento_id = pp.prodprom_promdes_promocion_descuento_id 
                                        left join controles_maestros_multiples cmm ON pd.promdes_tipo_descuento_id = cmm.cmm_control_id 
                                    where 
                                        pp.prodprom_prod_producto_id = `+constHijosListaPerProductoPadre[p].dataValues.prod_producto_id+`
                                        and pd.promdes_estatus_id = 1000059
                                        and pd.promdes_fecha_inicio_validez <= current_date
                                        and pd.promdes_fecha_finalizacion_validez >=  current_date
                                    order by 
                                        pd.promdes_prioridad asc 
                                        limit 1
                                    `,
                                { 
                                    type: sequelize.QueryTypes.SELECT 
                                });

                                if(constPromotionChildSQL.length > 0)
                                {
                                    constHijosListaPerProductoPadre[p].dataValues.PromocionActiva = constPromotionChildSQL
                                }
                                else
                                {
                                    constHijosListaPerProductoPadre[p].dataValues.PromocionActiva = []
                                }
                            }


                            //Concatenar valores nuevos al producto base (padre) del producto con mejor promocion
                            for (var x = 0; x < constHijosListaPerProductoPadre.length; x++) 
                            {
                                //Settear variables nuevas para tomar las promociones y mas
                                if(constHijosListaPerProductoPadre[x].dataValues.PromocionActiva.length > 0)
                                {
                                    if(constHijosListaPerProductoPadre[x].dataValues.PromocionActiva[0].promdes_descuento_exacto > prod_producto_id_con_descuento_exacto)
                                    {
                                        prod_producto_id_con_descuento = constHijosListaPerProductoPadre[x].dataValues.prod_producto_id
                                        prod_producto_id_con_descuento_precio = constHijosListaPerProductoPadre[x].dataValues.prod_precio
                                        prod_producto_id_con_descuento_exacto = constHijosListaPerProductoPadre[x].dataValues.PromocionActiva[0].promdes_descuento_exacto
                                    }
                                }
                            }
                            //Sett varibles on main
                            //console.log(mainConsultaProductos.rows[0])
                            constProductosFiltrados.rows[i].dataValues.prod_producto_id_con_descuento = prod_producto_id_con_descuento
                            constProductosFiltrados.rows[i].dataValues.prod_producto_id_con_descuento_precio = prod_producto_id_con_descuento_precio
                            constProductosFiltrados.rows[i].dataValues.prod_producto_id_con_descuento_exacto = prod_producto_id_con_descuento_exacto
                        //end promociones



                        //concatenacion
                        //constProductosFiltrados.rows[i].ListaHijos = constHijosListaPerProductoPadre
                        constProductosFiltrados.rows[i].ListaHijos = constHijosListaPerProductoPadre
                        constProductosFiltrados.rows[i].dataValues.ListaHijos = constHijosListaPerProductoPadre


                        //LISTA PRECIOS
                        for (var f = 0; f < constProductosFiltrados.rows[i].ListaHijos.length; f++) 
                        {

                            const constProductoListaPrecio = await models.ProductoListaPrecio.findAll({
                                where: {
                                    pl_prod_producto_id : constProductosFiltrados.rows[i].ListaHijos[f].prod_producto_id
                                }
                            })
                            ListaPreciosTemp.push(constProductoListaPrecio)
                        }

                        constProductosFiltrados.rows[i].dataValues.ListaPrecios = ListaPreciosTemp


                        //LISTA STOCK
                        for (var f = 0; f < constProductosFiltrados.rows[i].ListaHijos.length; f++) 
                        {

                            const constStockProducto = await models.StockProducto.findAll({
                                where: {
                                    sp_prod_producto_id : constProductosFiltrados.rows[i].ListaHijos[f].prod_producto_id
                                }
                            })
                            ListaStockTemp.push(constStockProducto)
                        }

                        constProductosFiltrados.rows[i].dataValues.ListaStock = ListaStockTemp

                    }
                    else
                    {
                        constProductosFiltrados.rows[i].ListaHijos = {}
                    }
                }

                res.status(200).send({
                    message: 'Lista de productos',
                    constProductosFiltrados
                })

            }
            else if(req.body.filtro == 'Disponibilidad')    //FILTRO POR DISPONIBILIDAD
            {
                //Si viene 0 significa que solo traera los articulos que no esten disponibles por que tienen inventario 0
                if(req.body.condicion != 0)    //MANDA PRODUCTOS QUE TENGAN STOCK MAYOR A 0
                {
                    const constProductosFiltrados = await models.Producto.findAndCountAll({
                        where: {
                            prod_prod_producto_padre_sku : null,
                            prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO,
                            prod_total_stock: {[Op.gt]: 0}
                        },
                        limit: varlimit,
                        offset: varoffset,
                        order: [
                            ['prod_producto_id', 'ASC'],
                        ],
                        include: 
                        [
                            {
                                model: models.ControlMaestroMultiple,
                                attributes: {
                                    exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                }
                            },
                            {
                                model: models.Categoria,
                                attributes: {
                                    exclude: ['cat_usu_usuario_modificador_id','createdAt','cat_cat_categoria_padre_id','updatedAt'],
                                },
                                include: [
                                    {
                                        model: models.ControlMaestroMultiple,
                                        attributes: {
                                            exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                        }
                                    }
                                ]

                            },
                            {
                                model: models.Proveedores,
                                attributes: {exclude: ['createdAt', 'updatedAt']}
                            }
                        ]
                    })

                    //obtener hijos de cada row encontrado PRECIOS Y STOCK
                    for (var i = 0; i < constProductosFiltrados.rows.length; i++) 
                    {
                        const constHijosListaPerProductoPadre = await models.Producto.findAll({
                            where: {
                                prod_prod_producto_padre_sku : constProductosFiltrados.rows[i].prod_sku,
                                prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO
                            },
                            attributes: ['prod_producto_id', 'prod_nombre', 'prod_sku', 'prod_viñetas', 'prod_precio'],
                            include: [
                                {
                                    model: models.ImagenProducto
                                }
                            ]
                        })

                        //Si existen hijos de un producto padre se le concatenan
                        var ListaPreciosTemp = []
                        var ListaStockTemp = []
                        if(constHijosListaPerProductoPadre)
                        {

                            //PROMOCIONES
                                //Concatenar Promociones BASE
                                for (var p = 0; p < constHijosListaPerProductoPadre.length; p++) 
                                {
                                    //OBTIENE EL TOTAL DEL COUNT
                                    const constPromotionChildSQL = await sequelize.query(`
                                        select
                                            pd.promdes_promocion_descuento_id, 
                                            promdes_nombre, 
                                            promdes_estatus_id, 
                                            promdes_fecha_inicio_validez, 
                                            promdes_fecha_finalizacion_validez, 
                                            promdes_tipo_descuento_id,
                                            promdes_descuento_exacto ,
                                            cmm_nombre,
                                            cmm_valor
                                        from 
                                            promociones_descuentos pd 
                                            left join productos_promociones pp ON pd.promdes_promocion_descuento_id = pp.prodprom_promdes_promocion_descuento_id 
                                            left join controles_maestros_multiples cmm ON pd.promdes_tipo_descuento_id = cmm.cmm_control_id 
                                        where 
                                            pp.prodprom_prod_producto_id = `+constHijosListaPerProductoPadre[p].dataValues.prod_producto_id+`
                                            and pd.promdes_estatus_id = 1000059
                                            and pd.promdes_fecha_inicio_validez <= current_date
                                            and pd.promdes_fecha_finalizacion_validez >=  current_date
                                        order by 
                                            pd.promdes_prioridad asc 
                                            limit 1
                                        `,
                                    { 
                                        type: sequelize.QueryTypes.SELECT 
                                    });

                                    if(constPromotionChildSQL.length > 0)
                                    {
                                        constHijosListaPerProductoPadre[p].dataValues.PromocionActiva = constPromotionChildSQL
                                    }
                                    else
                                    {
                                        constHijosListaPerProductoPadre[p].dataValues.PromocionActiva = []
                                    }
                                }


                                //Concatenar valores nuevos al producto base (padre) del producto con mejor promocion
                                for (var x = 0; x < constHijosListaPerProductoPadre.length; x++) 
                                {
                                    //Settear variables nuevas para tomar las promociones y mas
                                    if(constHijosListaPerProductoPadre[x].dataValues.PromocionActiva.length > 0)
                                    {
                                        if(constHijosListaPerProductoPadre[x].dataValues.PromocionActiva[0].promdes_descuento_exacto > prod_producto_id_con_descuento_exacto)
                                        {
                                            prod_producto_id_con_descuento = constHijosListaPerProductoPadre[x].dataValues.prod_producto_id
                                            prod_producto_id_con_descuento_precio = constHijosListaPerProductoPadre[x].dataValues.prod_precio
                                            prod_producto_id_con_descuento_exacto = constHijosListaPerProductoPadre[x].dataValues.PromocionActiva[0].promdes_descuento_exacto
                                        }
                                    }
                                }
                                //Sett varibles on main
                                //console.log(mainConsultaProductos.rows[0])
                                constProductosFiltrados.rows[i].dataValues.prod_producto_id_con_descuento = prod_producto_id_con_descuento
                                constProductosFiltrados.rows[i].dataValues.prod_producto_id_con_descuento_precio = prod_producto_id_con_descuento_precio
                                constProductosFiltrados.rows[i].dataValues.prod_producto_id_con_descuento_exacto = prod_producto_id_con_descuento_exacto
                            //end promociones



                            //concatenacion
                            //constProductosFiltrados.rows[i].ListaHijos = constHijosListaPerProductoPadre
                            constProductosFiltrados.rows[i].ListaHijos = constHijosListaPerProductoPadre
                            constProductosFiltrados.rows[i].dataValues.ListaHijos = constHijosListaPerProductoPadre


                            //LISTA PRECIOS
                            for (var f = 0; f < constProductosFiltrados.rows[i].ListaHijos.length; f++) 
                            {

                                const constProductoListaPrecio = await models.ProductoListaPrecio.findAll({
                                    where: {
                                        pl_prod_producto_id : constProductosFiltrados.rows[i].ListaHijos[f].prod_producto_id
                                    }
                                })
                                ListaPreciosTemp.push(constProductoListaPrecio)
                            }

                            constProductosFiltrados.rows[i].dataValues.ListaPrecios = ListaPreciosTemp


                            //LISTA STOCK
                            for (var f = 0; f < constProductosFiltrados.rows[i].ListaHijos.length; f++) 
                            {

                                const constStockProducto = await models.StockProducto.findAll({
                                    where: {
                                        sp_prod_producto_id : constProductosFiltrados.rows[i].ListaHijos[f].prod_producto_id
                                    }
                                })
                                ListaStockTemp.push(constStockProducto)
                            }

                            constProductosFiltrados.rows[i].dataValues.ListaStock = ListaStockTemp

                        }
                        else
                        {
                            constProductosFiltrados.rows[i].ListaHijos = {}
                        }
                    }

                    res.status(200).send({
                        message: 'Lista de productos',
                        constProductosFiltrados
                    })
                }
                else                             //Manda los productos que tengan stock en 0
                {
                    const constProductosFiltrados = await models.Producto.findAndCountAll({
                        where: {
                            prod_prod_producto_padre_sku : null,
                            prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO,
                            prod_total_stock: 0
                        },
                        limit: varlimit,
                        offset: varoffset,
                        order: [
                            ['prod_producto_id', 'ASC'],
                        ],
                        include: 
                        [
                            {
                                model: models.ControlMaestroMultiple,
                                attributes: {
                                    exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                }
                            },
                            {
                                model: models.Categoria,
                                attributes: {
                                    exclude: ['cat_usu_usuario_modificador_id','createdAt','cat_cat_categoria_padre_id','updatedAt'],
                                },
                                include: [
                                    {
                                        model: models.ControlMaestroMultiple,
                                        attributes: {
                                            exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                        }
                                    }
                                ]

                            },
                            {
                                model: models.Proveedores,
                                attributes: {exclude: ['createdAt', 'updatedAt']}
                            }
                        ]
                    })

                    //obtener hijos de cada row encontrado PRECIOS Y STOCK
                    for (var i = 0; i < constProductosFiltrados.rows.length; i++) 
                    {
                        const constHijosListaPerProductoPadre = await models.Producto.findAll({
                            where: {
                                prod_prod_producto_padre_sku : constProductosFiltrados.rows[i].prod_sku,
                                prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO
                            },
                            attributes: ['prod_producto_id', 'prod_nombre', 'prod_sku', 'prod_viñetas', 'prod_precio'],
                            include: [
                                {
                                    model: models.ImagenProducto
                                }
                            ]
                        })

                        //Si existen hijos de un producto padre se le concatenan
                        var ListaPreciosTemp = []
                        var ListaStockTemp = []
                        if(constHijosListaPerProductoPadre)
                        {

                            //PROMOCIONES
                                //Concatenar Promociones BASE
                                for (var p = 0; p < constHijosListaPerProductoPadre.length; p++) 
                                {
                                    //OBTIENE EL TOTAL DEL COUNT
                                    const constPromotionChildSQL = await sequelize.query(`
                                        select
                                            pd.promdes_promocion_descuento_id, 
                                            promdes_nombre, 
                                            promdes_estatus_id, 
                                            promdes_fecha_inicio_validez, 
                                            promdes_fecha_finalizacion_validez, 
                                            promdes_tipo_descuento_id,
                                            promdes_descuento_exacto ,
                                            cmm_nombre,
                                            cmm_valor
                                        from 
                                            promociones_descuentos pd 
                                            left join productos_promociones pp ON pd.promdes_promocion_descuento_id = pp.prodprom_promdes_promocion_descuento_id 
                                            left join controles_maestros_multiples cmm ON pd.promdes_tipo_descuento_id = cmm.cmm_control_id 
                                        where 
                                            pp.prodprom_prod_producto_id = `+constHijosListaPerProductoPadre[p].dataValues.prod_producto_id+`
                                            and pd.promdes_estatus_id = 1000059
                                            and pd.promdes_fecha_inicio_validez <= current_date
                                            and pd.promdes_fecha_finalizacion_validez >=  current_date
                                        order by 
                                            pd.promdes_prioridad asc 
                                            limit 1
                                        `,
                                    { 
                                        type: sequelize.QueryTypes.SELECT 
                                    });

                                    if(constPromotionChildSQL.length > 0)
                                    {
                                        constHijosListaPerProductoPadre[p].dataValues.PromocionActiva = constPromotionChildSQL
                                    }
                                    else
                                    {
                                        constHijosListaPerProductoPadre[p].dataValues.PromocionActiva = []
                                    }
                                }


                                //Concatenar valores nuevos al producto base (padre) del producto con mejor promocion
                                for (var x = 0; x < constHijosListaPerProductoPadre.length; x++) 
                                {
                                    //Settear variables nuevas para tomar las promociones y mas
                                    if(constHijosListaPerProductoPadre[x].dataValues.PromocionActiva.length > 0)
                                    {
                                        if(constHijosListaPerProductoPadre[x].dataValues.PromocionActiva[0].promdes_descuento_exacto > prod_producto_id_con_descuento_exacto)
                                        {
                                            prod_producto_id_con_descuento = constHijosListaPerProductoPadre[x].dataValues.prod_producto_id
                                            prod_producto_id_con_descuento_precio = constHijosListaPerProductoPadre[x].dataValues.prod_precio
                                            prod_producto_id_con_descuento_exacto = constHijosListaPerProductoPadre[x].dataValues.PromocionActiva[0].promdes_descuento_exacto
                                        }
                                    }
                                }
                                //Sett varibles on main
                                //console.log(mainConsultaProductos.rows[0])
                                constProductosFiltrados.rows[i].dataValues.prod_producto_id_con_descuento = prod_producto_id_con_descuento
                                constProductosFiltrados.rows[i].dataValues.prod_producto_id_con_descuento_precio = prod_producto_id_con_descuento_precio
                                constProductosFiltrados.rows[i].dataValues.prod_producto_id_con_descuento_exacto = prod_producto_id_con_descuento_exacto
                            //end promociones



                            //concatenacion
                            //constProductosFiltrados.rows[i].ListaHijos = constHijosListaPerProductoPadre
                            constProductosFiltrados.rows[i].ListaHijos = constHijosListaPerProductoPadre
                            constProductosFiltrados.rows[i].dataValues.ListaHijos = constHijosListaPerProductoPadre


                            //LISTA PRECIOS
                            for (var f = 0; f < constProductosFiltrados.rows[i].ListaHijos.length; f++) 
                            {

                                const constProductoListaPrecio = await models.ProductoListaPrecio.findAll({
                                    where: {
                                        pl_prod_producto_id : constProductosFiltrados.rows[i].ListaHijos[f].prod_producto_id
                                    }
                                })
                                ListaPreciosTemp.push(constProductoListaPrecio)
                            }

                            constProductosFiltrados.rows[i].dataValues.ListaPrecios = ListaPreciosTemp


                            //LISTA STOCK
                            for (var f = 0; f < constProductosFiltrados.rows[i].ListaHijos.length; f++) 
                            {

                                const constStockProducto = await models.StockProducto.findAll({
                                    where: {
                                        sp_prod_producto_id : constProductosFiltrados.rows[i].ListaHijos[f].prod_producto_id
                                    }
                                })
                                ListaStockTemp.push(constStockProducto)
                            }

                            constProductosFiltrados.rows[i].dataValues.ListaStock = ListaStockTemp

                        }
                        else
                        {
                            constProductosFiltrados.rows[i].ListaHijos = {}
                        }
                    }

                    res.status(200).send({
                        message: 'Lista de productos',
                        constProductosFiltrados
                    })
                }
            }
            else
            {
                res.status(200).send({
                message: 'Lista de productos',
                    error: 'Filtro no encontrado'
                })
            }

            

            

        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },
    getProductosByFiltroAtributoPadres: async (req, res, next) =>{
        try{
            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit


            // var AtributosArray2 = 

            const AtributosArray = req.body.AtributosArray

            
            if(AtributosArray.length == 1)  //SI SOLO TRAE UN ATRIBUTO A BUSCAR Y UN VALOR
            {
                
                var querySQL = `
                    select 
                        p2.prod_sku
                    from 
                        atributos_categorias ac 
                        left join productos_atributos_valores pav on ac.atc_atributos_categorias_id = pav.pav_atributo_categoria 
                        left join productos p2 on p2.prod_producto_id = pav.pav_id_producto 
                    where
                        atc_cmm_estatus_id = 1000093
                        and ac.atc_id_atributo = `+AtributosArray[0].atc_id_atributo+`
                        and pav.pav_valor = '`+AtributosArray[0].pav_valor+`'
                `;


                //OBTIENE LOS ELEMENTOS BUSCADOS
                const constSKUs = await sequelize.query(querySQL,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });

                console.log(constSKUs)

                var listaSKU = '';
                for (var i = 0; i < constSKUs.length; i++) 
                {
                   
                    listaSKU = listaSKU + "'"+  constSKUs[i].prod_sku  + "'"

                    if(i+1 < constSKUs.length)
                    {
                        listaSKU = listaSKU + ","
                    }
                    else
                    {
                        
                    }

                }

                const constProductosFiltrados = await models.Producto.findAndCountAll({
                    where: {
                        prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO,
                        [Op.or]: [
                            Sequelize.literal("prod_sku in (" + listaSKU + ")"),
                        ]
                    },
                    limit: varlimit,
                    offset: varoffset,
                    order: [
                        ['prod_producto_id', 'ASC'],
                    ],
                    include: 
                    [
                        {
                            model: models.ControlMaestroMultiple,
                            attributes: {
                                exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                            }
                        },
                        {
                            model: models.Categoria,
                            attributes: {
                                exclude: ['cat_usu_usuario_modificador_id','createdAt','cat_cat_categoria_padre_id','updatedAt'],
                            },
                            include: [
                                {
                                    model: models.ControlMaestroMultiple,
                                    attributes: {
                                        exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                    }
                                }
                            ]

                        },
                        {
                            model: models.Proveedores,
                            attributes: {exclude: ['createdAt', 'updatedAt']}
                        }
                    ]
                })



                res.status(200).send({
                    message: 'Buscando 1 atributo',
                    constProductosFiltrados
                })
            }
            else if(AtributosArray.length == 0) //SI LA API NO TRAI NADA EN EL JSON DE ATRIBUTOS
            {
                res.status(200).send({
                    message: 'No se encontro atributos a buscar'
                })
            }
            else
            {

                //Obtener categorias que coincidan con el atributo seleccionado
                    var querySQL = `
                        select atc_id_categoria, count(*) as "conteo"
                        from atributos_categorias ac 
                        where atc_cmm_estatus_id = `+statusControles.ATRIBUTO_CATEGORIAS.ACTIVO+` and (
                    `;

                    for (var i = 0; i < AtributosArray.length; i++) 
                    {
                        //console.log(AtributosArray[i].atc_id_atributo);
                        var atributo_id = AtributosArray[i].atc_id_atributo


                        querySQL = querySQL + `
                            atc_id_atributo = `+ atributo_id +` 
                        `;

                        if(i+1 < AtributosArray.length)
                        {
                            querySQL = querySQL + " or "
                        }
                    }

                    querySQL = querySQL + ` )
                        group by atc_id_categoria
                        HAVING count(*) = `+AtributosArray.length+`
                    `;

                    //console.log("cantidad:"+AtributosArray.length)
                    //OBTIENE LOS ELEMENTOS BUSCADOS
                    const constSKUs = await sequelize.query(querySQL,
                    { 
                        type: sequelize.QueryTypes.SELECT 
                    });
                //FIN Obtener categorias que coincidan con el atributo seleccionado



                //para guardar los sku mas tarde
                // 
                // listaSKU2.push(constSKUs[j].atc_id_categoria)
                // console.log(listaSKU2)




                //Obtener ID que relacion categorias atributos con valores


                
                    //OBTENER ID DE CATEGORIA-ATRIBUTOS
                        var listaSKU2 = []

                        for (var j = 0; j < constSKUs.length; j++) 
                        {   

                            var querySQL2 = `
                                select 
                                    ac.atc_atributos_categorias_id, atc_id_atributo 
                                from 
                                    atributos_categorias ac
                                    left join productos_atributos_valores pav on ac.atc_atributos_categorias_id = pav.pav_atributo_categoria 
                                where atc_cmm_estatus_id = `+statusControles.ATRIBUTO_CATEGORIAS.ACTIVO+` and atc_id_categoria = `+constSKUs[j].atc_id_categoria+` and (

                            `;

                            //OBTENER OR'S DE ATRIBUTOS VAR
                            for (var H = 0; H < AtributosArray.length; H++) 
                            {
                                var atributo_id = AtributosArray[H].atc_id_atributo
                                querySQL2 = querySQL2 + `
                                    atc_id_atributo = `+ atributo_id +` 
                                `;

                                if(H+1 < AtributosArray.length)
                                {
                                    querySQL2 = querySQL2 + " or "
                                }
                            }
                            querySQL2 = querySQL2 + ` )`


                            const constIDCatAtr = await sequelize.query(querySQL2,
                            { 
                                type: sequelize.QueryTypes.SELECT 
                            });





                            var querySQL3 = `
                                select 
                                    pav_id_producto, count(*) as "conteo", p2.prod_sku 
                                from 
                                    productos_atributos_valores pav 
                                    left join productos p2 on pav.pav_id_producto = p2.prod_producto_id 
                                where
                                    pav_cmm_estatus_id = `+statusControles.ATRIBUTO_PRODUCTOS_VALOR.ACTIVO+` and
                            `;


                            //FOR que buscara en base a los atributos id para hacer match con los valores de la api
                            for (var f = 0; f < constIDCatAtr.length; f++) 
                            {  
                                var encontrarValorAtributoFromAPI;


                                for (var t = 0; t < AtributosArray.length; t++) 
                                { 
                                    if(AtributosArray[t].atc_id_atributo == constIDCatAtr[f].atc_id_atributo)
                                    {
                                        encontrarValorAtributoFromAPI = AtributosArray[t].pav_valor
                                    }
                                }

                                querySQL3 = querySQL3 + `
                                    (pav_atributo_categoria = `+constIDCatAtr[f].atc_atributos_categorias_id+` and pav_valor = '`+encontrarValorAtributoFromAPI+`')
                                `;
                                //AGREGA OR's
                                if(f+1 < AtributosArray.length)
                                {
                                    querySQL3 = querySQL3 + " or "
                                }
                            }

                            


                            querySQL3 = querySQL3 + `
                                group by pav_id_producto, prod_sku
                                HAVING count(*) = `+AtributosArray.length+`
                            `
                                

                            const constFinalSKU = await sequelize.query(querySQL3,
                            { 
                                type: sequelize.QueryTypes.SELECT 
                            });

                            console.log(constFinalSKU)

                            for (var z = 0; z < constFinalSKU.length; z++) 
                            {
                                
                                //INCLUYE SOLO SKUS que no esten repetidos
                                if(listaSKU2.includes(constFinalSKU[z].prod_sku))
                                {

                                }
                                else
                                {
                                    listaSKU2.push(constFinalSKU[z].prod_sku)
                                }



                            }


                        }

                    
                    //console.log(listaSKU2)

                //



                //Generar IN para sql
                var ListaFinal = '';
                console.log(listaSKU2)
                for (var u = 0; u < listaSKU2.length; u++) 
                {
                    ListaFinal = ListaFinal + "'"+  listaSKU2[u]  + "'"

                    if(u+1 < listaSKU2.length)
                    {
                        ListaFinal = ListaFinal + ","
                    }
                }

                if(ListaFinal == '')
                {
                    res.status(200).send({
                        message: 'No se han encontrado coincidencias'
                    })
                }
                else
                {
                    //GENERAR SKUS y paginarlos
                    const constProductosFiltrados = await models.Producto.findAndCountAll({
                        where: {
                            prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO,
                            [Op.or]: [
                                Sequelize.literal("prod_sku in (" + ListaFinal + ")"),
                            ]
                        },
                        limit: varlimit,
                        offset: varoffset,
                        order: [
                            ['prod_producto_id', 'ASC'],
                        ],
                        include: 
                        [
                            {
                                model: models.ControlMaestroMultiple,
                                attributes: {
                                    exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                }
                            },
                            {
                                model: models.Categoria,
                                attributes: {
                                    exclude: ['cat_usu_usuario_modificador_id','createdAt','cat_cat_categoria_padre_id','updatedAt'],
                                },
                                include: [
                                    {
                                        model: models.ControlMaestroMultiple,
                                        attributes: {
                                            exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                        }
                                    }
                                ]

                            },
                            {
                                model: models.Proveedores,
                                attributes: {exclude: ['createdAt', 'updatedAt']}
                            }
                        ]
                    })



                    res.status(200).send({
                        message: 'Lista de productos 2 o mas',
                        constProductosFiltrados
                    })
                }

                
            }

        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },


    getPadreDesdeHijo: async (req, res, next) =>{
        try{

            req.params.id

            //Obtener hijo detalle para sacar el father sku
            const constProducto = await models.Producto.findOne({
                where: {
                    prod_producto_id : req.params.id,
                    prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO,
                    prod_prod_producto_padre_sku: {[Op.ne]: null}
                }
            })


            if(constProducto)
            {
                //Obtener hijo detalle para sacar el father sku
                const constProductoFather = await models.Producto.findOne({
                    where: {
                        prod_sku : constProducto.prod_prod_producto_padre_sku,
                        prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO
                    }
                })




                res.status(200).send({
                    message: 'Recuperado con exito',
                    prod_producto_id: constProductoFather.prod_producto_id,
                    prod_sku: constProductoFather.prod_sku
                })
            }
            else
            {
                res.status(500).send({
                    message: 'Producto no activo o no existe'
                });

            }








           
            
            
        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },




    //testing order by sort json
    getProductosByFiltroPadresPaginada: async (req, res, next) =>{
        try{
            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit

            if(req.body.filtro == 'Categoria')     //FILTRO DE CATEGORIAS
            {
                const constProductosFiltrados = await models.Producto.findAndCountAll({
                    where: {
                        prod_prod_producto_padre_sku : null,
                        prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO,
                        prod_cat_categoria_id: req.body.condicion
                    },
                    limit: varlimit,
                    offset: varoffset,
                    order: [
                        ['prod_producto_id', 'ASC'],
                    ],
                    include: 
                    [
                        {
                            model: models.ControlMaestroMultiple,
                            attributes: {
                                exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                            }
                        },
                        {
                            model: models.Categoria,
                            attributes: {
                                exclude: ['cat_usu_usuario_modificador_id','createdAt','cat_cat_categoria_padre_id','updatedAt'],
                            },
                            include: [
                                {
                                    model: models.ControlMaestroMultiple,
                                    attributes: {
                                        exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                    }
                                }
                            ]

                        },
                        {
                            model: models.Proveedores,
                            attributes: {exclude: ['createdAt', 'updatedAt']}
                        }
                    ]
                })
                res.status(200).send({
                    message: 'Lista de productos',
                    constProductosFiltrados
                })

            }
            else if(req.body.filtro == 'Marca')    //FILTRO DE MARCAS
            {
                const constProductosFiltrados = await models.Producto.findAndCountAll({
                    where: {
                        prod_prod_producto_padre_sku : null,
                        prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO,
                        prod_mar_marca_id: req.body.condicion
                    },
                    limit: varlimit,
                    offset: varoffset,
                    order: [
                        ['prod_producto_id', 'ASC'],
                    ],
                    include: 
                    [
                        {
                            model: models.ControlMaestroMultiple,
                            attributes: {
                                exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                            }
                        },
                        {
                            model: models.Categoria,
                            attributes: {
                                exclude: ['cat_usu_usuario_modificador_id','createdAt','cat_cat_categoria_padre_id','updatedAt'],
                            },
                            include: [
                                {
                                    model: models.ControlMaestroMultiple,
                                    attributes: {
                                        exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                    }
                                }
                            ]

                        },
                        {
                            model: models.Proveedores,
                            attributes: {exclude: ['createdAt', 'updatedAt']}
                        }
                    ]
                })

                res.status(200).send({
                    message: 'Lista de productos',
                    constProductosFiltrados
                })

            }
            else if(req.body.filtro == 'Proveedores')    //FILTRO DE PROVEEDORES
            {
                const constProductosFiltrados = await models.Producto.findAndCountAll({
                    where: {
                        prod_prod_producto_padre_sku : null,
                        prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO,
                        prod_proveedor_id: req.body.condicion
                    },
                    limit: varlimit,
                    offset: varoffset,
                    order: [
                        ['prod_producto_id', 'ASC'],
                    ],
                    include: 
                    [
                        {
                            model: models.ControlMaestroMultiple,
                            attributes: {
                                exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                            }
                        },
                        {
                            model: models.Categoria,
                            attributes: {
                                exclude: ['cat_usu_usuario_modificador_id','createdAt','cat_cat_categoria_padre_id','updatedAt'],
                            },
                            include: [
                                {
                                    model: models.ControlMaestroMultiple,
                                    attributes: {
                                        exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                    }
                                }
                            ]

                        },
                        {
                            model: models.Proveedores,
                            attributes: {exclude: ['createdAt', 'updatedAt']}
                        }
                    ]
                })

                res.status(200).send({
                    message: 'Lista de productos',
                    constProductosFiltrados
                })

            }
            else if(req.body.filtro == 'Disponibilidad')    //FILTRO POR DISPONIBILIDAD
            {
                //Si viene 0 significa que solo traera los articulos que no esten disponibles por que tienen inventario 0
                if(req.body.condicion != 0)    //MANDA PRODUCTOS QUE TENGAN STOCK MAYOR A 0
                {
                    const constProductosFiltrados = await models.Producto.findAndCountAll({
                        where: {
                            prod_prod_producto_padre_sku : null,
                            prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO,
                            prod_total_stock: {[Op.gt]: 0}
                        },
                        limit: varlimit,
                        offset: varoffset,
                        order: [
                            ['prod_producto_id', 'ASC'],
                        ],
                        include: 
                        [
                            {
                                model: models.ControlMaestroMultiple,
                                attributes: {
                                    exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                }
                            },
                            {
                                model: models.Categoria,
                                attributes: {
                                    exclude: ['cat_usu_usuario_modificador_id','createdAt','cat_cat_categoria_padre_id','updatedAt'],
                                },
                                include: [
                                    {
                                        model: models.ControlMaestroMultiple,
                                        attributes: {
                                            exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                        }
                                    }
                                ]

                            },
                            {
                                model: models.Proveedores,
                                attributes: {exclude: ['createdAt', 'updatedAt']}
                            }
                        ]
                    })

                    res.status(200).send({
                        message: 'Lista de productos',
                        constProductosFiltrados
                    })
                }
                else                             //Manda los productos que tengan stock en 0
                {
                    const constProductosFiltrados = await models.Producto.findAndCountAll({
                        where: {
                            prod_prod_producto_padre_sku : null,
                            prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO,
                            prod_total_stock: 0
                        },
                        limit: varlimit,
                        offset: varoffset,
                        order: [
                            ['prod_producto_id', 'ASC'],
                        ],
                        include: 
                        [
                            {
                                model: models.ControlMaestroMultiple,
                                attributes: {
                                    exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                }
                            },
                            {
                                model: models.Categoria,
                                attributes: {
                                    exclude: ['cat_usu_usuario_modificador_id','createdAt','cat_cat_categoria_padre_id','updatedAt'],
                                },
                                include: [
                                    {
                                        model: models.ControlMaestroMultiple,
                                        attributes: {
                                            exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                        }
                                    }
                                ]

                            },
                            {
                                model: models.Proveedores,
                                attributes: {exclude: ['createdAt', 'updatedAt']}
                            }
                        ]
                    })

                    res.status(200).send({
                        message: 'Lista de productos',
                        constProductosFiltrados
                    })
                }
            }
            else
            {
                res.status(200).send({
                message: 'Lista de productos',
                    error: 'Filtro no encontrado'
                })
            }

            

            

        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },





    getProductosByFiltroPadres_Front_ST: async (req, res, next) =>{
        try{
            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit

            var ordenamientoBy = req.body.orderBy
            var ASCDESC = req.body.ASCDESC

            switch(ordenamientoBy)
            {
                case null: 
                    ordenamientoBy = "prod_nombre"
                    ASCDESC = ''
                    break;

                case '': 
                    ordenamientoBy = "prod_nombre"
                    ASCDESC = ''
                    break;

                case "precio":
                    ordenamientoBy = "prod_precio"
                    break; 

                case "mas vendido":
                    ordenamientoBy = "total_vendidos"
                    break;

                case "mejores valorados":
                    ordenamientoBy = "prod_calificacion_promedio"
                    break;

                case "az-za":
                    ordenamientoBy = "prod_nombre"
                    break;

                case "fecha lanzamienta":
                    ordenamientoBy = "lanzamiento"
                    break;
            }

            if(ordenamientoBy == null)
            {
                ordenamientoBy = "prod_nombre"
                ASCDESC = ''
            }




            if(req.body.filtro == 'Categoria')     //FILTRO DE CATEGORIAS
            {

                //Obtener count de rows
                    const constProductosFiltrados = await models.Producto.findAndCountAll({
                        where: {
                            prod_prod_producto_padre_sku : null,
                            prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO,
                            prod_cat_categoria_id: req.body.condicion
                        },
                        limit: varlimit,
                        offset: varoffset,
                        attributes: ['prod_producto_id']
                    })

                    var countTotal = constProductosFiltrados.count
                // Solo obtiene el total de rows




                //OBTIENE LOS RESULTADOS LO PAGINA Y LO DEVUELVE
                    const rows = await sequelize.query(`
                        select 
                            p5.prod_producto_id,
                            p5.prod_nombre,
                            p5.prod_descripcion,
                            p5.prod_sku,
                            p5.prod_precio,
                            m2.mar_marca_id,
                            m2.mar_nombre,
                            p5.prod_cmm_estatus_id,
                            cmm.cmm_valor,  
                            c2.cat_cmm_estatus_id,
                            cmm2.cmm_valor as cat_cmm_valor,
                            c2.cat_nombre,
                            pv.prv_nombre,
                            p5.prod_nombre_extranjero,
                            p5.prod_calificacion_promedio,
                            p5."createdAt" as "lanzamiento",
                            COALESCE(SUM(pdcf.pcf_cantidad_producto),0) as "total_vendidos"
                        from 
                            productos p5
                            left join categorias c2 on p5.prod_cat_categoria_id = c2.cat_categoria_id
                            left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                            left join marcas m2 on p5.prod_mar_marca_id = m2.mar_marca_id
                            left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
                            left join productos_de_compra_finalizada pdcf on p5.prod_producto_id = pdcf.pcf_prod_producto_id 
                        where 
                            p5."prod_prod_producto_padre_sku" IS NULL 
                            AND p5."prod_cmm_estatus_id" = 1000016 
                            AND p5."prod_cat_categoria_id" = `+req.body.condicion+`
                        group by p5.prod_producto_id, m2.mar_marca_id, cmm.cmm_valor, c2.cat_cmm_estatus_id, cmm2.cmm_valor, c2.cat_nombre, pv.prv_nombre, "lanzamiento" 
                        order by `+ordenamientoBy+` `+ASCDESC+` LIMIT `+varlimit+` OFFSET `+varoffset+` 
                        `,

                         // 
                    { 
                        type: sequelize.QueryTypes.SELECT 
                    });

                    //obtener hijos de cada row encontrado PRECIOS Y STOCK
                        for (var i = 0; i < rows.length; i++) 
                        {
                            const constHijosListaPerProductoPadre = await models.Producto.findAll({
                                where: {
                                    prod_prod_producto_padre_sku : rows[i].prod_sku,
                                    prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO
                                },
                                attributes: ['prod_producto_id', 'prod_nombre', 'prod_sku', 'prod_viñetas', 'prod_precio'],
                                include: [
                                    {
                                        model: models.ImagenProducto
                                    }
                                ]
                            })

                            //Si existen hijos de un producto padre se le concatenan
                            var ListaPreciosTemp = []
                            var ListaStockTemp = []
                            if(constHijosListaPerProductoPadre)
                            {
                                //concatenacion
                                rows[i].ListaHijos = constHijosListaPerProductoPadre


                                //LISTA PRECIOS
                                for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                                {

                                    const constProductoListaPrecio = await models.ProductoListaPrecio.findAll({
                                        where: {
                                            pl_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                                        }
                                    })
                                    ListaPreciosTemp.push(constProductoListaPrecio)
                                }

                                rows[i].ListaPrecios = ListaPreciosTemp


                                //LISTA STOCK
                                for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                                {

                                    const constStockProducto = await models.StockProducto.findAll({
                                        where: {
                                            sp_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                                        }
                                    })
                                    ListaStockTemp.push(constStockProducto)
                                }

                                rows[i].ListaStock = ListaStockTemp

                            }
                            else
                            {
                                rows[i].ListaHijos = {}
                            }
                        }
                    //Fin obtener informacion adicional


                const mainConsultaProductos = {
                    count: parseInt(countTotal),
                    rows
                }


                res.status(200).send({
                    message: 'Lista de productos',
                    mainConsultaProductos
                })

            }
            else if(req.body.filtro == 'Marca')    //FILTRO DE MARCAS
            {

                //Obtener count de rows
                    const constProductosFiltrados = await models.Producto.findAndCountAll({
                        where: {
                            prod_prod_producto_padre_sku : null,
                            prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO,
                            prod_mar_marca_id: req.body.condicion
                        },
                        limit: varlimit,
                        offset: varoffset,
                        attributes: ['prod_producto_id']
                    })

                    var countTotal = constProductosFiltrados.count
                // Solo obtiene el total de rows

                //OBTIENE LOS RESULTADOS LO PAGINA Y LO DEVUELVE
                    const rows = await sequelize.query(`
                        select 
                            p5.prod_producto_id,
                            p5.prod_nombre,
                            p5.prod_descripcion,
                            p5.prod_sku,
                            p5.prod_precio,
                            m2.mar_marca_id,
                            m2.mar_nombre,
                            p5.prod_cmm_estatus_id,
                            cmm.cmm_valor,  
                            c2.cat_cmm_estatus_id,
                            cmm2.cmm_valor as cat_cmm_valor,
                            c2.cat_nombre,
                            pv.prv_nombre,
                            p5.prod_nombre_extranjero,
                            p5.prod_calificacion_promedio,
                            p5."createdAt" as "lanzamiento",
                            COALESCE(SUM(pdcf.pcf_cantidad_producto),0) as "total_vendidos"
                        from 
                            productos p5
                            left join categorias c2 on p5.prod_cat_categoria_id = c2.cat_categoria_id
                            left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                            left join marcas m2 on p5.prod_mar_marca_id = m2.mar_marca_id
                            left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
                            left join productos_de_compra_finalizada pdcf on p5.prod_producto_id = pdcf.pcf_prod_producto_id 
                        where 
                            p5."prod_prod_producto_padre_sku" IS NULL 
                            AND p5."prod_cmm_estatus_id" = 1000016 
                            AND p5.prod_mar_marca_id = `+req.body.condicion+`
                        group by p5.prod_producto_id, m2.mar_marca_id, cmm.cmm_valor, c2.cat_cmm_estatus_id, cmm2.cmm_valor, c2.cat_nombre, pv.prv_nombre, "lanzamiento" 
                        order by `+ordenamientoBy+` `+ASCDESC+` LIMIT `+varlimit+` OFFSET `+varoffset+` 
                        `,

                         // 
                    { 
                        type: sequelize.QueryTypes.SELECT 
                    });

                    //obtener hijos de cada row encontrado PRECIOS Y STOCK
                        for (var i = 0; i < rows.length; i++) 
                        {
                            const constHijosListaPerProductoPadre = await models.Producto.findAll({
                                where: {
                                    prod_prod_producto_padre_sku : rows[i].prod_sku,
                                    prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO
                                },
                                attributes: ['prod_producto_id', 'prod_nombre', 'prod_sku', 'prod_viñetas', 'prod_precio'],
                                include: [
                                    {
                                        model: models.ImagenProducto
                                    }
                                ]
                            })

                            //Si existen hijos de un producto padre se le concatenan
                            var ListaPreciosTemp = []
                            var ListaStockTemp = []
                            if(constHijosListaPerProductoPadre)
                            {
                                //concatenacion
                                rows[i].ListaHijos = constHijosListaPerProductoPadre


                                //LISTA PRECIOS
                                for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                                {

                                    const constProductoListaPrecio = await models.ProductoListaPrecio.findAll({
                                        where: {
                                            pl_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                                        }
                                    })
                                    ListaPreciosTemp.push(constProductoListaPrecio)
                                }

                                rows[i].ListaPrecios = ListaPreciosTemp


                                //LISTA STOCK
                                for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                                {

                                    const constStockProducto = await models.StockProducto.findAll({
                                        where: {
                                            sp_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                                        }
                                    })
                                    ListaStockTemp.push(constStockProducto)
                                }

                                rows[i].ListaStock = ListaStockTemp

                            }
                            else
                            {
                                rows[i].ListaHijos = {}
                            }
                        }
                    //Fin obtener informacion adicional


                const mainConsultaProductos = {
                    count: parseInt(countTotal),
                    rows
                }



                res.status(200).send({
                    message: 'Lista de productos',
                    mainConsultaProductos
                })

            }
            else if(req.body.filtro == 'Proveedores')    //FILTRO DE PROVEEDORES
            {

                //Obtener count de rows
                    const constProductosFiltrados = await models.Producto.findAndCountAll({
                        where: {
                            prod_prod_producto_padre_sku : null,
                            prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO,
                            prod_proveedor_id: req.body.condicion
                        },
                        limit: varlimit,
                        offset: varoffset,
                        attributes: ['prod_producto_id']
                    })

                    var countTotal = constProductosFiltrados.count
                // Solo obtiene el total de rows


                //OBTIENE LOS RESULTADOS LO PAGINA Y LO DEVUELVE
                    const rows = await sequelize.query(`
                        select 
                            p5.prod_producto_id,
                            p5.prod_nombre,
                            p5.prod_descripcion,
                            p5.prod_sku,
                            p5.prod_precio,
                            m2.mar_marca_id,
                            m2.mar_nombre,
                            p5.prod_cmm_estatus_id,
                            cmm.cmm_valor,  
                            c2.cat_cmm_estatus_id,
                            cmm2.cmm_valor as cat_cmm_valor,
                            c2.cat_nombre,
                            pv.prv_nombre,
                            p5.prod_nombre_extranjero,
                            p5.prod_calificacion_promedio,
                            p5."createdAt" as "lanzamiento",
                            COALESCE(SUM(pdcf.pcf_cantidad_producto),0) as "total_vendidos"
                        from 
                            productos p5
                            left join categorias c2 on p5.prod_cat_categoria_id = c2.cat_categoria_id
                            left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                            left join marcas m2 on p5.prod_mar_marca_id = m2.mar_marca_id
                            left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
                            left join productos_de_compra_finalizada pdcf on p5.prod_producto_id = pdcf.pcf_prod_producto_id 
                        where 
                            p5."prod_prod_producto_padre_sku" IS NULL 
                            AND p5."prod_cmm_estatus_id" = 1000016 
                            AND p5."prod_proveedor_id" = `+req.body.condicion+`
                            group by p5.prod_producto_id, m2.mar_marca_id, cmm.cmm_valor, c2.cat_cmm_estatus_id, cmm2.cmm_valor, c2.cat_nombre, pv.prv_nombre, "lanzamiento" 
                            order by `+ordenamientoBy+` `+ASCDESC+` LIMIT `+varlimit+` OFFSET `+varoffset+` 
                        `,

                         // 
                    { 
                        type: sequelize.QueryTypes.SELECT 
                    });

                    //obtener hijos de cada row encontrado PRECIOS Y STOCK
                        for (var i = 0; i < rows.length; i++) 
                        {
                            const constHijosListaPerProductoPadre = await models.Producto.findAll({
                                where: {
                                    prod_prod_producto_padre_sku : rows[i].prod_sku,
                                    prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO
                                },
                                attributes: ['prod_producto_id', 'prod_nombre', 'prod_sku', 'prod_viñetas', 'prod_precio'],
                                include: [
                                    {
                                        model: models.ImagenProducto
                                    }
                                ]
                            })

                            //Si existen hijos de un producto padre se le concatenan
                            var ListaPreciosTemp = []
                            var ListaStockTemp = []
                            if(constHijosListaPerProductoPadre)
                            {
                                //concatenacion
                                rows[i].ListaHijos = constHijosListaPerProductoPadre


                                //LISTA PRECIOS
                                for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                                {

                                    const constProductoListaPrecio = await models.ProductoListaPrecio.findAll({
                                        where: {
                                            pl_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                                        }
                                    })
                                    ListaPreciosTemp.push(constProductoListaPrecio)
                                }

                                rows[i].ListaPrecios = ListaPreciosTemp


                                //LISTA STOCK
                                for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                                {

                                    const constStockProducto = await models.StockProducto.findAll({
                                        where: {
                                            sp_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                                        }
                                    })
                                    ListaStockTemp.push(constStockProducto)
                                }

                                rows[i].ListaStock = ListaStockTemp

                            }
                            else
                            {
                                rows[i].ListaHijos = {}
                            }
                        }
                    //Fin obtener informacion adicional


                const mainConsultaProductos = {
                    count: parseInt(countTotal),
                    rows
                }

                res.status(200).send({
                    message: 'Lista de productos',
                    mainConsultaProductos
                })

            }
            else if(req.body.filtro == 'Disponibilidad')    //FILTRO POR DISPONIBILIDAD
            {
                //Si viene 0 significa que solo traera los articulos que no esten disponibles por que tienen inventario 0
                //(Trae)
                if(req.body.condicion != 0)    //MANDA PRODUCTOS QUE TENGAN STOCK MAYOR A 0
                {

                    //Obtener count de rows
                        const constProductosFiltrados = await models.Producto.findAndCountAll({
                            where: {
                                prod_prod_producto_padre_sku : null,
                                prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO,
                                prod_total_stock: {[Op.gt]: 0}
                            },
                            limit: varlimit,
                            offset: varoffset,
                            attributes: ['prod_producto_id']
                        })

                        var countTotal = constProductosFiltrados.count
                    // Solo obtiene el total de rows

                    //OBTIENE LOS RESULTADOS LO PAGINA Y LO DEVUELVE
                        const rows = await sequelize.query(`
                            select 
                                p5.prod_producto_id,
                                p5.prod_nombre,
                                p5.prod_descripcion,
                                p5.prod_sku,
                                p5.prod_precio,
                                m2.mar_marca_id,
                                m2.mar_nombre,
                                p5.prod_cmm_estatus_id,
                                cmm.cmm_valor,  
                                c2.cat_cmm_estatus_id,
                                cmm2.cmm_valor as cat_cmm_valor,
                                c2.cat_nombre,
                                pv.prv_nombre,
                                p5.prod_nombre_extranjero,
                                p5.prod_calificacion_promedio,
                                p5."createdAt" as "lanzamiento",
                                COALESCE(SUM(pdcf.pcf_cantidad_producto),0) as "total_vendidos"
                            from 
                                productos p5
                                left join categorias c2 on p5.prod_cat_categoria_id = c2.cat_categoria_id
                                left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                                left join marcas m2 on p5.prod_mar_marca_id = m2.mar_marca_id
                                left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                                left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
                                left join productos_de_compra_finalizada pdcf on p5.prod_producto_id = pdcf.pcf_prod_producto_id 
                            where 
                                p5."prod_prod_producto_padre_sku" IS NULL 
                                AND p5."prod_cmm_estatus_id" = 1000016 
                                AND p5.prod_total_stock != 0 
                            group by p5.prod_producto_id, m2.mar_marca_id, cmm.cmm_valor, c2.cat_cmm_estatus_id, cmm2.cmm_valor, c2.cat_nombre, pv.prv_nombre, "lanzamiento" 
                            order by `+ordenamientoBy+` `+ASCDESC+` LIMIT `+varlimit+` OFFSET `+varoffset+` 
                            `,

                             // 
                        { 
                            type: sequelize.QueryTypes.SELECT 
                        });

                        //obtener hijos de cada row encontrado PRECIOS Y STOCK
                            for (var i = 0; i < rows.length; i++) 
                            {
                                const constHijosListaPerProductoPadre = await models.Producto.findAll({
                                    where: {
                                        prod_prod_producto_padre_sku : rows[i].prod_sku,
                                        prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO
                                    },
                                    attributes: ['prod_producto_id', 'prod_nombre', 'prod_sku', 'prod_viñetas', 'prod_precio'],
                                    include: [
                                        {
                                            model: models.ImagenProducto
                                        }
                                    ]
                                })

                                //Si existen hijos de un producto padre se le concatenan
                                var ListaPreciosTemp = []
                                var ListaStockTemp = []
                                if(constHijosListaPerProductoPadre)
                                {
                                    //concatenacion
                                    rows[i].ListaHijos = constHijosListaPerProductoPadre


                                    //LISTA PRECIOS
                                    for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                                    {

                                        const constProductoListaPrecio = await models.ProductoListaPrecio.findAll({
                                            where: {
                                                pl_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                                            }
                                        })
                                        ListaPreciosTemp.push(constProductoListaPrecio)
                                    }

                                    rows[i].ListaPrecios = ListaPreciosTemp


                                    //LISTA STOCK
                                    for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                                    {

                                        const constStockProducto = await models.StockProducto.findAll({
                                            where: {
                                                sp_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                                            }
                                        })
                                        ListaStockTemp.push(constStockProducto)
                                    }

                                    rows[i].ListaStock = ListaStockTemp

                                }
                                else
                                {
                                    rows[i].ListaHijos = {}
                                }
                            }
                        //Fin obtener informacion adicional


                    const mainConsultaProductos = {
                        count: parseInt(countTotal),
                        rows
                    }



                    res.status(200).send({
                        message: 'Lista de productos',
                        mainConsultaProductos
                    })


                }
                else                             //Manda los productos que tengan stock en 0
                {
                    //Obtener count de rows
                        const constProductosFiltrados = await models.Producto.findAndCountAll({
                            where: {
                                prod_prod_producto_padre_sku : null,
                                prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO,
                                prod_total_stock: 0
                            },
                            limit: varlimit,
                            offset: varoffset,
                            attributes: ['prod_producto_id']
                        })

                        var countTotal = constProductosFiltrados.count
                    // Solo obtiene el total de rows

                    //OBTIENE LOS RESULTADOS LO PAGINA Y LO DEVUELVE
                        const rows = await sequelize.query(`
                            select 
                                p5.prod_producto_id,
                                p5.prod_nombre,
                                p5.prod_descripcion,
                                p5.prod_sku,
                                p5.prod_precio,
                                m2.mar_marca_id,
                                m2.mar_nombre,
                                p5.prod_cmm_estatus_id,
                                cmm.cmm_valor,  
                                c2.cat_cmm_estatus_id,
                                cmm2.cmm_valor as cat_cmm_valor,
                                c2.cat_nombre,
                                pv.prv_nombre,
                                p5.prod_nombre_extranjero,
                                p5.prod_calificacion_promedio,
                                p5."createdAt" as "lanzamiento",
                                COALESCE(SUM(pdcf.pcf_cantidad_producto),0) as "total_vendidos"
                            from 
                                productos p5
                                left join categorias c2 on p5.prod_cat_categoria_id = c2.cat_categoria_id
                                left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                                left join marcas m2 on p5.prod_mar_marca_id = m2.mar_marca_id
                                left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                                left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
                                left join productos_de_compra_finalizada pdcf on p5.prod_producto_id = pdcf.pcf_prod_producto_id 
                            where 
                                p5."prod_prod_producto_padre_sku" IS NULL 
                                AND p5."prod_cmm_estatus_id" = 1000016 
                                AND p5.prod_total_stock = 0 
                            group by p5.prod_producto_id, m2.mar_marca_id, cmm.cmm_valor, c2.cat_cmm_estatus_id, cmm2.cmm_valor, c2.cat_nombre, pv.prv_nombre, "lanzamiento" 
                            order by `+ordenamientoBy+` `+ASCDESC+` LIMIT `+varlimit+` OFFSET `+varoffset+` 
                            `,

                             // 
                        { 
                            type: sequelize.QueryTypes.SELECT 
                        });

                        //obtener hijos de cada row encontrado PRECIOS Y STOCK
                            for (var i = 0; i < rows.length; i++) 
                            {
                                const constHijosListaPerProductoPadre = await models.Producto.findAll({
                                    where: {
                                        prod_prod_producto_padre_sku : rows[i].prod_sku,
                                        prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO
                                    },
                                    attributes: ['prod_producto_id', 'prod_nombre', 'prod_sku', 'prod_viñetas', 'prod_precio'],
                                    include: [
                                        {
                                            model: models.ImagenProducto
                                        }
                                    ]
                                })

                                //Si existen hijos de un producto padre se le concatenan
                                var ListaPreciosTemp = []
                                var ListaStockTemp = []
                                if(constHijosListaPerProductoPadre)
                                {
                                    //concatenacion
                                    rows[i].ListaHijos = constHijosListaPerProductoPadre


                                    //LISTA PRECIOS
                                    for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                                    {

                                        const constProductoListaPrecio = await models.ProductoListaPrecio.findAll({
                                            where: {
                                                pl_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                                            }
                                        })
                                        ListaPreciosTemp.push(constProductoListaPrecio)
                                    }

                                    rows[i].ListaPrecios = ListaPreciosTemp


                                    //LISTA STOCK
                                    for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                                    {

                                        const constStockProducto = await models.StockProducto.findAll({
                                            where: {
                                                sp_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                                            }
                                        })
                                        ListaStockTemp.push(constStockProducto)
                                    }

                                    rows[i].ListaStock = ListaStockTemp

                                }
                                else
                                {
                                    rows[i].ListaHijos = {}
                                }
                            }
                        //Fin obtener informacion adicional


                    const mainConsultaProductos = {
                        count: parseInt(countTotal),
                        rows
                    }



                    res.status(200).send({
                        message: 'Lista de productos',
                        mainConsultaProductos
                    })
















                }
            }
            else
            {
                res.status(200).send({
                message: 'Lista de productos',
                    error: 'Filtro no encontrado'
                })
            }

            

            

        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },

    frontGetProductoAdvancedSearch_Front_ST: async (req, res, next) =>{
        try{

            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit


            var ordenamientoBy = req.body.orderBy
            var ASCDESC = req.body.ASCDESC


            console.log(ASCDESC)
            switch(ordenamientoBy)
            {
                case null: 
                    ordenamientoBy = "prod_nombre"
                    ASCDESC = ''
                    break;

                case '': 
                    ordenamientoBy = "prod_nombre"
                    ASCDESC = ''
                    break;

                case "precio":
                    ordenamientoBy = "prod_precio"
                    break; 

                case "mas vendido":
                    ordenamientoBy = "total_vendidos"
                    break;

                case "mejores valorados":
                    ordenamientoBy = "prod_calificacion_promedio"
                    break;

                case "az-za":
                    ordenamientoBy = "prod_nombre"
                    break;

                case "fecha lanzamienta":
                    ordenamientoBy = "lanzamiento"
                    break;
            }

            if(ordenamientoBy == null)
            {
                ordenamientoBy = "prod_nombre"
                ASCDESC = ''
            }


            //OBTIENE EL TOTAL DE ROWS DE LA CONSULTA PARA DEVOLVERLO PARA EL PAGINADO


            var queryAdvancedSearch = `
            select
                p1.prod_producto_id,
                p1.prod_nombre,
                p1.prod_descripcion,
                p1.prod_sku,
                p1.prod_precio,
                m2.mar_marca_id,
                m2.mar_nombre,
                p1.prod_cmm_estatus_id,
                cmm.cmm_valor,  
                c2.cat_cmm_estatus_id,
                cmm2.cmm_valor as cat_cmm_valor,
                c2.cat_nombre,
                pv.prv_nombre,
                p1.prod_calificacion_promedio,
                p1.prod_nombre_extranjero,
                p1."createdAt" as "lanzamiento",
                COALESCE(SUM(pdcf.pcf_cantidad_producto),0) as "total_vendidos"
            from 
                productos p1
                left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id
                left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id
                left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id
                left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
                left join productos_de_compra_finalizada pdcf on p1.prod_producto_id = pdcf.pcf_prod_producto_id 
            where 
                prod_prod_producto_padre_sku is null 
                and p1.prod_cmm_estatus_id = 1000016 
                `;


            var queryAdvancedSearchCounted = `
            select
                count(p1.prod_producto_id)
                
            from 
                productos p1
                left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id
            where 
                prod_prod_producto_padre_sku is null 
                and p1.prod_cmm_estatus_id = 1000016 
                `;



            if(req.body.prod_nombre != '')
            {
                queryAdvancedSearchCounted = queryAdvancedSearchCounted + " and p1.prod_nombre like '%"+req.body.prod_nombre+"%' "
                queryAdvancedSearch = queryAdvancedSearch + " and p1.prod_nombre like '%"+req.body.prod_nombre+"%' "
            }

            if(req.body.prod_descripcion != '')
            {
                queryAdvancedSearchCounted = queryAdvancedSearchCounted + " and p1.prod_descripcion like '%"+req.body.prod_descripcion+"%' "
                queryAdvancedSearch = queryAdvancedSearch + " and p1.prod_descripcion like '%"+req.body.prod_descripcion+"%' "
            }

            if(req.body.prod_sku != '')
            {
                queryAdvancedSearchCounted = queryAdvancedSearchCounted + " and p1.prod_nombre_extranjero like '%"+req.body.prod_sku+"%' "
                queryAdvancedSearch = queryAdvancedSearch + " and p1.prod_nombre_extranjero like '%"+req.body.prod_sku+"%' "
            }

            if(req.body.mar_nombre != '')
            {
                queryAdvancedSearchCounted = queryAdvancedSearchCounted + " and m2.mar_nombre like '%"+req.body.mar_nombre+"%' "
                queryAdvancedSearch = queryAdvancedSearch + " and m2.mar_nombre like '%"+req.body.mar_nombre+"%' "
            }

            if(req.body.cat_nombre != '')
            {
                queryAdvancedSearchCounted = queryAdvancedSearchCounted + " and c2.cat_nombre like '%"+req.body.cat_nombre+"%' "
                queryAdvancedSearch = queryAdvancedSearch + " and c2.cat_nombre like '%"+req.body.cat_nombre+"%' "
            }


            if(req.body.precioBajo != 0 && req.body.precioAlto != 0)
            {
                queryAdvancedSearchCounted = queryAdvancedSearchCounted + " and p1.prod_precio between "+req.body.precioBajo+" and " + req.body.precioAlto + " "
                queryAdvancedSearch = queryAdvancedSearch + " and p1.prod_precio between "+req.body.precioBajo+" and " + req.body.precioAlto + " "
            }



            queryAdvancedSearch = queryAdvancedSearch + ` group by p1.prod_producto_id, m2.mar_marca_id, cmm.cmm_valor, cmm2.cmm_valor, c2.cat_cmm_estatus_id, c2.cat_nombre, pv.prv_nombre, "lanzamiento"   `




            queryAdvancedSearch = queryAdvancedSearch + ` order by `+ ordenamientoBy +`  `+ ASCDESC +` LIMIT `+varlimit+` OFFSET `+varoffset 











            //Obtener total de rows
            const rows = await sequelize.query(queryAdvancedSearch,
            { 
                type: sequelize.QueryTypes.SELECT 
            });
    

            //OBTIENE LOS ELEMENTOS BUSCADOS
            const constCount = await sequelize.query(queryAdvancedSearchCounted,
            { 
                type: sequelize.QueryTypes.SELECT 
            });
    




            //obtener hijos de cada row encontrado PRECIOS Y STOCK
            for (var i = 0; i < rows.length; i++) 
            {
                const constHijosListaPerProductoPadre = await models.Producto.findAll({
                    where: {
                        prod_prod_producto_padre_sku : rows[i].prod_sku,
                        prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO
                    },
                    attributes: ['prod_producto_id', 'prod_nombre', 'prod_sku', 'prod_viñetas', 'prod_precio'],
                    include: [
                        {
                            model: models.ImagenProducto
                        }
                    ]
                })

                //Si existen hijos de un producto padre se le concatenan
                var ListaPreciosTemp = []
                var ListaStockTemp = []
                if(constHijosListaPerProductoPadre)
                {
                    //concatenacion
                    rows[i].ListaHijos = constHijosListaPerProductoPadre


                    //LISTA PRECIOS
                    for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                    {

                        const constProductoListaPrecio = await models.ProductoListaPrecio.findAll({
                            where: {
                                pl_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                            }
                        })
                        ListaPreciosTemp.push(constProductoListaPrecio)
                    }

                    rows[i].ListaPrecios = ListaPreciosTemp


                    //LISTA STOCK
                    for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                    {

                        const constStockProducto = await models.StockProducto.findAll({
                            where: {
                                sp_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                            }
                        })
                        ListaStockTemp.push(constStockProducto)
                    }

                    rows[i].ListaStock = ListaStockTemp

                }
                else
                {
                    rows[i].ListaHijos = {}
                }
            }


           
            //se regresa un esquema parecido al del pagina nativo de sequalize
            const mainConsultaProductos = {
                count: parseInt(constCount[0].count),
                rows
            }



            
            res.status(200).send({
                message: 'Lista de productos',
                mainConsultaProductos
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },







    //Recuperar viñetas
    addCarritoSKUFromExcel: async(req, res, next) =>{
        try{

            var carrito_id = 22


            const constCarritoDeCompra = await models.CarritoDeCompra.findOne({
                where: {
                    cdc_carrito_de_compra_id: carrito_id
                }
            });

            if(constCarritoDeCompra)
            {
                //Setear nombre de la hoja y buscar su indice
                var workbook = XLSX.readFile('carga_masiva_cart.xlsx');
                var sheet_name_list = workbook.SheetNames;
                


                var NumHojaExcel = 0;
                for (var i = 0; i < sheet_name_list.length; i++) 
                {
                    if(sheet_name_list[i] == "carga_carrito_sku")
                    {
                        NumHojaExcel = i
                        break
                    }
                }

                //buscara la informacion por el indice de la hoja
                var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[NumHojaExcel]]);
                



                // AGREGAR JSONS POR SKU
                for (var i = 0; i < xlData.length; i++) 
                {   
                    const constproductotemp = await models.Producto.findOne({
                        where: {
                            prod_sku: xlData[i].sku
                        }
                    });    

                    //signfiica que el sku existe
                    if(constproductotemp)
                    {
                        const constProductoCarritoDeCompra = await models.ProductoCarritoDeCompra.findOne({
                            where: {
                                pcdc_prod_producto_id: constproductotemp.prod_producto_id
                            }
                        }); 
                        

                        // //Actualizar o crear en  BD
                        if(constProductoCarritoDeCompra) 
                        {
                            var newCantidad = constProductoCarritoDeCompra.pcdc_producto_cantidad + xlData[i].cantidad
                            const bodyUpdate = {
                                "pcdc_producto_cantidad" : newCantidad
                            };
                            
                            await constProductoCarritoDeCompra.update(bodyUpdate);

                        }
                        else //Crear
                        {
                            
                            const bodyCreate = {
                                "pcdc_carrito_de_compra_id" : carrito_id,
                                "pcdc_prod_producto_id" :  constproductotemp.prod_producto_id,
                                "pcdc_producto_cantidad":  xlData[i].cantidad,
                                "pcdc_precio" : constproductotemp.prod_precio
                            };
                                 
                            await models.ProductoCarritoDeCompra.create(bodyCreate);
                        }
                    }
                }
                res.status(200).send({
                    message: "Finalizo con exito"
                })
            }
            else
            {
                res.status(200).send({
                    message: "Carrito no Existe"
                })
            }









        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    //Recuperar viñetas
    cargarProductosMasVendidos: async(req, res, next) =>{
        try{
            //Obtener todos los productos de ordenes
            const constProductoCompraFinalizada = await models.ProductoCompraFinalizada.findAll({
                where: {
                    pcf_sumatorio_mas_vendido_validador: false
                },
                attributes: ['pcf_producto_compra_finalizada_id', 'pcf_prod_producto_id', 'pcf_sumatorio_mas_vendido_validador']
            });

            //Si trae productos procesarlos
            if(constProductoCompraFinalizada)
            {
                for (var i = 0; i < constProductoCompraFinalizada.length; i++) 
                {
                    //OBTIENE EL TOTAL DEL COUNT
                    const constProdPadreSKU = await sequelize.query(`
                        select
                            prod_producto_id,
                            prod_sku
                        from
                            productos p2
                        where
                            p2.prod_sku =
                            (
                                select
                                    p.prod_prod_producto_padre_sku 
                                from
                                    productos p 
                                where
                                    p.prod_producto_id = `+constProductoCompraFinalizada[i].dataValues.pcf_prod_producto_id+`
                            )
                        `,
                    { 
                        type: sequelize.QueryTypes.SELECT 
                    });

                    for (var j = 0; j < constProdPadreSKU.length; j++) 
                    {
                        //obtiene el conteo total por sql de la tabla de productos atravez de un padre que ya se obtubo anteriormente
                        const constTotal = await sequelize.query(`
                            select
                                sum(pcf_cantidad_producto) as total
                            from
                                productos p2
                                left join productos_de_compra_finalizada pdcf on p2.prod_producto_id = pdcf.pcf_producto_compra_finalizada_id 
                            where
                                pdcf.pcf_prod_producto_id in
                                (
                                    --Regresa los ids
                                    select
                                        p.prod_producto_id
                                    from
                                        productos p 
                                    where
                                        p.prod_prod_producto_padre_sku = '`+constProdPadreSKU[j].prod_sku+`'
                                )
                            `,
                        { 
                            type: sequelize.QueryTypes.SELECT 
                        });

                        if(constTotal[0].total)
                        {
                            //Update Productos Table
                            var newCantidad = constTotal[0].total
                            const updateProductWithNewCantidadVendida = await models.Producto.findOne({
                                where: {
                                    prod_sku: constProdPadreSKU[j].prod_sku
                                }
                            }); 

                            const bodyUpdate = {
                                "prod_unidades_vendidas" : newCantidad
                            };
                            await updateProductWithNewCantidadVendida.update(bodyUpdate);

                            //Update productos compras finalizadas table to true on new solds
                            const updateCompraFinalidaProductoCantidadBool = await models.ProductoCompraFinalizada.findOne({
                                where: {
                                    pcf_producto_compra_finalizada_id: constProductoCompraFinalizada[i].pcf_producto_compra_finalizada_id
                                }
                            });

                            const bodyUpdate2 = {
                                "pcf_sumatorio_mas_vendido_validador" : true
                            };
                            await updateCompraFinalidaProductoCantidadBool.update(bodyUpdate2);
                        }
                    }
                }   

                await systemLog.insertLog('Integracion de PRODUCTOS VENDIDOS','Integracion de PRODUCTOS VENDIDOS: correctamente.', '1.-webApi', 'Sistema', 'informative')
                //integracionEmail('Integracion de PRODUCTOS VENDIDOS: correctamente.')
                res.status(200).send({
                    message: "Finalizo con exito"
                })
            }
            else
            {
                await systemLog.insertLog('Integracion de PRODUCTOS VENDIDOS','Integracion de PRODUCTOS VENDIDOS: error.', '1.-webApi', 'Sistema', 'warning')
                integracionEmail('Integracion de PRODUCTOS VENDIDOS: error.')
                res.status(500).send({
                    message: "Error"
                })
            }









        }catch(e){
            await systemLog.insertLog('Integracion de PRODUCTOS VENDIDOS','Integracion de PRODUCTOS VENDIDOS: error en la petición.', '1.-webApi', 'Sistema', 'error')
                integracionEmail('Integracion de PRODUCTOS VENDIDOS: error en la petición.')
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    getProductsAdmin: async (req, res, next) =>{
        try{

            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit

            var searchBy = req.body.searchBy
            var ASCDESC = req.body.ASCDESC

            var prod_producto_id_con_descuento = 0
            var prod_producto_id_con_descuento_precio = 0
            var prod_producto_id_con_descuento_exacto = 0

            var searchCondition = req.body.palabraBuscar.toUpperCase()


            //SQL GENERAl
            var sqlRows = `
                select 
                    p5.prod_producto_id,
                    p5.prod_nombre,
                    p5.prod_descripcion,
                    p5.prod_sku,
                    p5.prod_precio,
                    m2.mar_marca_id,
                    m2.mar_nombre,
                    p5.prod_cmm_estatus_id,
                    cmm.cmm_valor,
                    c2.cat_cmm_estatus_id,
                    cmm2.cmm_valor as cat_cmm_valor,
                    c2.cat_nombre,
                    pv.prv_nombre,
                    p5.prod_nombre_extranjero,
                    p5.prod_calificacion_promedio,
                    p5.prod_es_stock_inactivo,
                    p5.prod_tipo_precio_base
            `;

            //SQL que solo regresara el total del count
            var sqlRowsCount = `
                select 
                    count(p5.prod_producto_id)
            `;

            //Se usara para concatenar mas codigo repetible
            var sqlFrom = `
                from 
                    productos p5
                    left join categorias c2 on p5.prod_cat_categoria_id = c2.cat_categoria_id
                    left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                    left join marcas m2 on p5.prod_mar_marca_id = m2.mar_marca_id
                    left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
            `;

            var sqlBusqueda = ``
            var sqlLimiteAndPage = ` LIMIT `+varlimit+` OFFSET `+varoffset


            
            if(searchBy == 'Marca')
            {
                sqlBusqueda = `
                    where p5.prod_producto_id in 
                    (
                        select 
                            p1.prod_producto_id
                        from 
                        (
                            --Search Fathers by Marca
                            (
                                select
                                    p1.prod_producto_id,
                                    case when m2.mar_nombre like '%`+searchCondition+`%'  then 1.7 else 1.8 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    m2.mar_nombre like '%`+searchCondition+`%' 
                                    and prod_cmm_estatus_id = 1000016
                                    and prod_prod_producto_padre_sku is null 
                            )
                            --Search Fathers by Marca Abreviatura
                            union
                            (
                                select
                                    p1.prod_producto_id,
                                    case when m2.mar_abreviatura like '%`+searchCondition+`%'  then 1.81 else 1.82 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    m2.mar_abreviatura like '%`+searchCondition+`%' 
                                    and prod_cmm_estatus_id = 1000016
                                    and prod_prod_producto_padre_sku is null 
                            )
                        )  as p1 order by prioridad 
                    )
                    `;
            }
            else if(searchBy == 'Categoria')
            {
                sqlBusqueda = `
                    where p5.prod_producto_id in 
                    (
                        select 
                            p1.prod_producto_id
                        from 
                        (
                            --Search Fathers by Marca
                            (
                                select
                                    p1.prod_producto_id,
                                    case when c2.cat_nombre like '%`+searchCondition+`%'  then 1.7 else 1.8 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    c2.cat_nombre like '%`+searchCondition+`%' 
                                    and prod_cmm_estatus_id = 1000016
                                    and prod_prod_producto_padre_sku is null 
                            )
                        )  as p1 order by prioridad 
                    )
                    `;
            }
            else
            {
                sqlBusqueda = `
                    where p5.prod_producto_id in 
                    (
                        select 
                            p1.prod_producto_id
                        from 
                        (
                            --Search Fathers by Name
                            (
                                select
                                    p1.prod_producto_id,
                                    case when prod_nombre like '%`+searchCondition+`%'  then 0.1 else 0.2 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    prod_nombre like '%`+searchCondition+`%' 
                                    and prod_cmm_estatus_id = 1000016
                                    and prod_prod_producto_padre_sku is null 
                            )
                            --Search Child by Name and return Only Fathers
                            union 
                            (
                                select 
                                    p2.prod_producto_id,
                                    case when prod_nombre like '%`+searchCondition+`%'  then 0.3 else 0.4 end as prioridad
                                from(
                                    select
                                        p1.prod_producto_id,
                                        case when prod_nombre like '%`+searchCondition+`%'  then 0.3 else 0.4 end as prioridad,
                                        p1.prod_sku,
                                        p1.prod_prod_producto_padre_sku 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        prod_nombre like '%`+searchCondition+`%'  
                                        and prod_cmm_estatus_id = 1000016 
                                        and prod_prod_producto_padre_sku is not null 
                                    ) temporal 
                                left join productos p2 on temporal.prod_prod_producto_padre_sku = p2.prod_sku 
                                where p2.prod_prod_producto_padre_sku is null
                                group by p2.prod_producto_id, prioridad 
                            )
                            --Search Fathers by Description
                            union
                            (
                                select
                                    p1.prod_producto_id,
                                    case when prod_descripcion like '%`+searchCondition+`%'  then 1.1 else 1.2 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    prod_descripcion like '%`+searchCondition+`%' 
                                    and prod_cmm_estatus_id = 1000016
                                    and prod_prod_producto_padre_sku is null 
                            )
                            --Search Child by Description and return Only Fathers
                            union 
                            (
                                select 
                                    p2.prod_producto_id,
                                    case when prod_descripcion like '%`+searchCondition+`%'  then 1.3 else 1.4 end as prioridad
                                from(
                                    select
                                        p1.prod_producto_id,
                                        case when prod_descripcion like '%`+searchCondition+`%'  then 1.3 else 1.4 end as prioridad,
                                        p1.prod_sku,
                                        p1.prod_prod_producto_padre_sku 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        prod_descripcion like '%`+searchCondition+`%'  
                                        and prod_cmm_estatus_id = 1000016 
                                        and prod_prod_producto_padre_sku is not null 
                                    ) temporal 
                                left join productos p2 on temporal.prod_prod_producto_padre_sku = p2.prod_sku 
                                where p2.prod_prod_producto_padre_sku is null
                                group by p2.prod_producto_id, prioridad 
                            )
                            --Search Fathers by Categoria
                            union
                            (
                                select
                                    p1.prod_producto_id,
                                    case when c2.cat_nombre like '%`+searchCondition+`%'  then 1.5 else 1.6 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    c2.cat_nombre like '%`+searchCondition+`%' 
                                    and prod_cmm_estatus_id = 1000016
                                    and prod_prod_producto_padre_sku is null 
                            )
                            --Search Fathers by Marca
                            union
                            (
                                select
                                    p1.prod_producto_id,
                                    case when m2.mar_nombre like '%`+searchCondition+`%'  then 1.7 else 1.8 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    m2.mar_nombre like '%`+searchCondition+`%' 
                                    and prod_cmm_estatus_id = 1000016
                                    and prod_prod_producto_padre_sku is null 
                            )
                            --Search Fathers by Marca Abreviatura
                            union
                            (
                                select
                                    p1.prod_producto_id,
                                    case when m2.mar_abreviatura like '%`+searchCondition+`%'  then 1.81 else 1.82 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    m2.mar_abreviatura like '%`+searchCondition+`%' 
                                    and prod_cmm_estatus_id = 1000016
                                    and prod_prod_producto_padre_sku is null 
                            )
                            --Search Fathers by Foreing Name
                            union
                            (
                                select
                                    p1.prod_producto_id,
                                    case when p1.prod_nombre_extranjero like '%`+searchCondition+`%'  then 1.9 else 2 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    p1.prod_nombre_extranjero like '%`+searchCondition+`%' 
                                    and prod_cmm_estatus_id = 1000016
                                    and prod_prod_producto_padre_sku is null 
                            )
                            --Search Child by Foreing Name and return Only Fathers
                            union 
                            (
                                select 
                                    p2.prod_producto_id,
                                    case when prod_nombre_extranjero like '%`+searchCondition+`%'  then 2.1 else 2.2 end as prioridad
                                from(
                                    select
                                        p1.prod_producto_id,
                                        case when prod_nombre_extranjero like '%`+searchCondition+`%'  then 2.3 else 2.4 end as prioridad,
                                        p1.prod_sku,
                                        p1.prod_prod_producto_padre_sku 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        prod_nombre_extranjero like '%`+searchCondition+`%'  
                                        and prod_cmm_estatus_id = 1000016 
                                        and prod_prod_producto_padre_sku is not null 
                                    ) temporal 
                                left join productos p2 on temporal.prod_prod_producto_padre_sku = p2.prod_sku 
                                where p2.prod_prod_producto_padre_sku is null
                                group by p2.prod_producto_id, prioridad 
                            )
                            --Search Fathers by SKU
                            union
                            (
                                select
                                    p1.prod_producto_id,
                                    case when p1.prod_sku like '%`+searchCondition+`%'  then 2.5 else 2.6 end as prioridad 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    p1.prod_sku like '%`+searchCondition+`%' 
                                    and prod_cmm_estatus_id = 1000016
                                    and prod_prod_producto_padre_sku is null 
                            )
                            --Search Child by SKU and return Only Fathers
                            union 
                            (
                                select 
                                    p2.prod_producto_id,
                                    case when p2.prod_sku like '%`+searchCondition+`%'  then 2.7 else 2.8 end as prioridad
                                from(
                                    select
                                        p1.prod_producto_id,
                                        case when p1.prod_sku like '%`+searchCondition+`%'  then 2.7 else 2.8 end as prioridad,
                                        p1.prod_sku,
                                        p1.prod_prod_producto_padre_sku 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        p1.prod_sku like '%`+searchCondition+`%'  
                                        and prod_cmm_estatus_id = 1000016 
                                        and prod_prod_producto_padre_sku is not null 
                                    ) temporal 
                                left join productos p2 on temporal.prod_prod_producto_padre_sku = p2.prod_sku 
                                where p2.prod_prod_producto_padre_sku is null
                                group by p2.prod_producto_id, prioridad 
                            )
                        )  as p1 order by prioridad 
                    )
                    `;
            }

            //Variables que concatenan TODO
            var sqlFinalRows = sqlRows + sqlFrom + sqlBusqueda + sqlLimiteAndPage
            var sqlFinalRowsCount = sqlRowsCount + sqlFrom + sqlBusqueda 

            //Obtener Rows
            const rows = await sequelize.query(sqlFinalRows,
            {
                type: sequelize.QueryTypes.SELECT 
            });

            //Obtener Count de las rows
            const constCount = await sequelize.query(sqlFinalRowsCount,
            { 
                type: sequelize.QueryTypes.SELECT 
            });

            //Se regresa el esquema parecido a las consultas de SEQUALIZE
            const mainConsultaProductos = {
                count: parseInt(constCount[0].count),
                rows
            }

            //obtener hijos de cada row encontrado PRECIOS Y STOCK
            for (var i = 0; i < rows.length; i++) 
            {
                const constHijosListaPerProductoPadre = await models.Producto.findAll({
                    where: {
                        prod_prod_producto_padre_sku : rows[i].prod_sku,
                        prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO
                    },
                    attributes: ['prod_producto_id', 'prod_nombre', 'prod_sku', 'prod_viñetas', 'prod_precio'],
                    include: [
                        {
                            model: models.ImagenProducto
                        }
                    ]
                })

                //Si existen hijos de un producto padre se le concatenan
                var ListaPreciosTemp = []
                var ListaStockTemp = []
                if(constHijosListaPerProductoPadre)
                {

                    //PROMOCIONES
                        //Concatenar Promociones BASE
                        for (var p = 0; p < constHijosListaPerProductoPadre.length; p++) 
                        {
                            //OBTIENE EL TOTAL DEL COUNT
                            const constPromotionChildSQL = await sequelize.query(`
                                select
                                    pd.promdes_promocion_descuento_id, 
                                    promdes_nombre, 
                                    promdes_estatus_id, 
                                    promdes_fecha_inicio_validez, 
                                    promdes_fecha_finalizacion_validez, 
                                    promdes_tipo_descuento_id,
                                    promdes_descuento_exacto ,
                                    cmm_nombre,
                                    cmm_valor
                                from 
                                    promociones_descuentos pd 
                                    left join productos_promociones pp ON pd.promdes_promocion_descuento_id = pp.prodprom_promdes_promocion_descuento_id 
                                    left join controles_maestros_multiples cmm ON pd.promdes_tipo_descuento_id = cmm.cmm_control_id 
                                where 
                                    pp.prodprom_prod_producto_id = `+constHijosListaPerProductoPadre[p].dataValues.prod_producto_id+`
                                    and pd.promdes_estatus_id = 1000059
                                    and pd.promdes_fecha_inicio_validez <= current_date
                                    and pd.promdes_fecha_finalizacion_validez >=  current_date
                                order by 
                                    pd.promdes_prioridad asc 
                                    limit 1
                                `,
                            { 
                                type: sequelize.QueryTypes.SELECT 
                            });

                            if(constPromotionChildSQL.length > 0)
                            {
                                constHijosListaPerProductoPadre[p].dataValues.PromocionActiva = constPromotionChildSQL
                            }
                            else
                            {
                                constHijosListaPerProductoPadre[p].dataValues.PromocionActiva = []
                            }
                        }


                        //Concatenar valores nuevos al producto base (padre) del producto con mejor promocion
                        for (var x = 0; x < constHijosListaPerProductoPadre.length; x++) 
                        {
                            //Settear variables nuevas para tomar las promociones y mas
                            if(constHijosListaPerProductoPadre[x].dataValues.PromocionActiva.length > 0)
                            {
                                if(constHijosListaPerProductoPadre[x].dataValues.PromocionActiva[0].promdes_descuento_exacto > prod_producto_id_con_descuento_exacto)
                                {
                                    prod_producto_id_con_descuento = constHijosListaPerProductoPadre[x].dataValues.prod_producto_id
                                    prod_producto_id_con_descuento_precio = constHijosListaPerProductoPadre[x].dataValues.prod_precio
                                    prod_producto_id_con_descuento_exacto = constHijosListaPerProductoPadre[x].dataValues.PromocionActiva[0].promdes_descuento_exacto
                                }
                            }
                        }
                        //Sett varibles on main
                        //console.log(mainConsultaProductos.rows[0])
                        mainConsultaProductos.rows[i].prod_producto_id_con_descuento = prod_producto_id_con_descuento
                        mainConsultaProductos.rows[i].prod_producto_id_con_descuento_precio = prod_producto_id_con_descuento_precio
                        mainConsultaProductos.rows[i].prod_producto_id_con_descuento_exacto = prod_producto_id_con_descuento_exacto
                    //end promociones



                    //concatenacion
                    rows[i].ListaHijos = constHijosListaPerProductoPadre

                    //LISTA PRECIOS
                    for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                    {

                        const constProductoListaPrecio = await models.ProductoListaPrecio.findAll({
                            where: {
                                pl_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                            }
                        })
                        ListaPreciosTemp.push(constProductoListaPrecio)
                    }

                    rows[i].ListaPrecios = ListaPreciosTemp


                    //LISTA STOCK
                    for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                    {

                        const constStockProducto = await models.StockProducto.findAll({
                            where: {
                                sp_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                            }
                        })
                        ListaStockTemp.push(constStockProducto)
                    }

                    rows[i].ListaStock = ListaStockTemp

                }
                else
                {
                    rows[i].ListaHijos = {}
                }
            }

            res.status(200).send({
                message: 'Lista de productos',
                mainConsultaProductos
            })


        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },
    


    
    frontGetProductoMainV3: async (req, res, next) =>{
        try{

            //Obtener paginado
            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit

            //Condiciones de busqueda
            var searchBy = req.body.searchBy
            var ASCDESC = req.body.ASCDESC
            var orderByFinal = ''
            var searchCondition = req.body.palabraBuscar.toUpperCase()

            //Variable en caso de que venga socio de negocio se obtendran precios de su lista de precios
            var idSocioNegocio

            if(req.body.idSocioNegocio)
            {
                idSocioNegocio = req.body.idSocioNegocio
            }
            else
            {
                idSocioNegocio = null
            }


            //Tipo de Order By
            var ordenamientoBy = req.body.orderBy
            switch(ordenamientoBy)
            {
                case null: 
                    orderByFinal = `order by prioridad `
                    ordenamientoBy = "normal"
                    break;

                case '': 
                    orderByFinal = `order by prioridad `
                    ordenamientoBy = "normal"
                    break;

                case "precio":
                    orderByFinal = `order by prod_precio `
                    ordenamientoBy = "prod_precio"
                    break; 

                case "mas vendido":
                    orderByFinal = `order by prod_unidades_vendidas `
                    ordenamientoBy = "mas vendido"
                    break;

                case "mejores valorados":
                    orderByFinal = `order by prod_calificacion_promedio `
                    ordenamientoBy = "prod_calificacion_promedio"
                    break;

                case "az-za":
                    orderByFinal = `order by prod_nombre `
                    ordenamientoBy = "prod_nombre"
                    break;

                case "fecha lanzamienta":
                    orderByFinal = `order by lanzamiento `
                    ordenamientoBy = "lanzamiento"
                    break;
            }

            orderByFinal = orderByFinal + ' ' + ASCDESC




            //Obtener productos BASE para luego obtener mas cosas

                //SQL GENERAl
                var sqlRows = `
                    select 
                        p5.prod_producto_id,
                        p5.prod_nombre,
                        p5.prod_descripcion,
                        p5.prod_sku,
                        p5.prod_precio,
                        m2.mar_marca_id,
                        m2.mar_nombre,
                        p5.prod_cmm_estatus_id,
                        cmm.cmm_valor,
                        c2.cat_cmm_estatus_id,
                        cmm2.cmm_valor as cat_cmm_valor,
                        c2.cat_nombre,
                        pv.prv_nombre,
                        p5.prod_nombre_extranjero,
                        p5.prod_calificacion_promedio,
                        p5.prod_es_stock_inactivo,
                        p5.prod_tipo_precio_base,
                        prod_unidades_vendidas,
                        p5."createdAt" as "lanzamiento"
                `;

                //SQL que solo regresara el total del count
                var sqlRowsCount = `
                    select 
                        count(p5.prod_producto_id)
                `;

                //Se usara para concatenar mas codigo repetible
                var sqlFrom = `
                    from 
                        productos p5
                        left join categorias c2 on p5.prod_cat_categoria_id = c2.cat_categoria_id
                        left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                        left join marcas m2 on p5.prod_mar_marca_id = m2.mar_marca_id
                        left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
                `;

                var sqlBusqueda = ``
                var sqlLimiteAndPage = ` LIMIT `+varlimit+` OFFSET `+varoffset

                if(searchBy == 'Marca')
                {
                    sqlBusqueda = `
                        where p5.prod_producto_id in 
                        (
                            select 
                                p1.prod_producto_id
                            from 
                            (
                                --Search Fathers by Marca
                                union
                                (
                                    select
                                        p1.prod_producto_id,
                                        case when m2.mar_nombre like '%`+searchCondition+`%'  then 1.7 else 1.8 end as prioridad 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        m2.mar_nombre like '%`+searchCondition+`%' 
                                        and prod_cmm_estatus_id = 1000016
                                        and prod_prod_producto_padre_sku is null 
                                        and prod_sku in (
                                                select 
                                                    p6.prod_sku
                                                from 
                                                    productos p3 
                                                    left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku 
                                                where
                                                    p3.prod_prod_producto_padre_sku in 
                                                                                    (
                                                                                        select 
                                                                                            p4.prod_sku 
                                                                                        from
                                                                                            productos p4 
                                                                                            left join marcas m5 on p4.prod_mar_marca_id = m5.mar_marca_id 
                                                                                        where
                                                                                            m5.mar_nombre like '%`+searchCondition+`%' 
                                                                                            and prod_cmm_estatus_id = 1000016
                                                                                            and prod_prod_producto_padre_sku is null
                                                                                    )
                                                    and p3.prod_volumen != 0
                                                    and p3.prod_peso != 0
                                            ) 
                                )
                                --Search Fathers by Marca Abreviatura
                                union
                                (
                                    select
                                        p1.prod_producto_id,
                                        case when m2.mar_abreviatura like '%`+searchCondition+`%'  then 1.81 else 1.82 end as prioridad 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        m2.mar_abreviatura like '%`+searchCondition+`%' 
                                        and prod_cmm_estatus_id = 1000016
                                        and prod_prod_producto_padre_sku is null 
                                        and prod_sku in (
                                                select 
                                                     p6.prod_sku
                                                from 
                                                    productos p3
                                                    left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku  
                                                where
                                                    p3.prod_prod_producto_padre_sku in 
                                                                                    (
                                                                                        select 
                                                                                            p4.prod_sku 
                                                                                        from
                                                                                            productos p4 
                                                                                            left join marcas m5 on p4.prod_mar_marca_id = m5.mar_marca_id 
                                                                                        where
                                                                                            m5.mar_abreviatura like '%`+searchCondition+`%' 
                                                                                            and prod_cmm_estatus_id = 1000016
                                                                                            and prod_prod_producto_padre_sku is null
                                                                                    )
                                                    and p3.prod_volumen != 0
                                                    and p3.prod_peso != 0
                                            ) 
                                )
                            )  as p1 `+orderByFinal+`
                        )
                        `;
                }
                else if(searchBy == 'Categoria')
                {
                    sqlBusqueda = `
                        where p5.prod_producto_id in 
                        (
                            select 
                                p1.prod_producto_id
                            from 
                            (
                                --Search Fathers by Categoria
                                (
                                    select
                                        p1.prod_producto_id,
                                        case when c2.cat_nombre like '%`+searchCondition+`%'  then 1.5 else 1.6 end as prioridad 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        c2.cat_nombre like '%`+searchCondition+`%' 
                                        and prod_cmm_estatus_id = 1000016
                                        and prod_prod_producto_padre_sku is null 
                                        and prod_sku in (
                                                select 
                                                    p6.prod_sku
                                                from 
                                                    productos p3 
                                                    left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku 
                                                where
                                                    p3.prod_prod_producto_padre_sku in 
                                                                                    (
                                                                                        select 
                                                                                            p4.prod_sku 
                                                                                        from
                                                                                            productos p4 
                                                                                            left join categorias c5 on p4.prod_cat_categoria_id = c5.cat_categoria_id
                                                                                        where
                                                                                            c5.cat_nombre like '%`+searchCondition+`%' 
                                                                                            and prod_cmm_estatus_id = 1000016
                                                                                            and prod_prod_producto_padre_sku is null
                                                                                    )
                                                    and p3.prod_volumen != 0
                                                    and p3.prod_peso != 0
                                            )
                                )
                            )  as p1 `+orderByFinal+`
                        )
                        `;
                }
                else
                {
                    sqlBusqueda = `
                        where p5.prod_producto_id in 
                        (
                            select 
                                p1.prod_producto_id
                            from 
                            (
                                --Search Fathers by Name
                                (
                                    select
                                        p1.prod_producto_id,
                                        case when prod_nombre like '%`+searchCondition+`%'  then 0.1 else 0.2 end as prioridad 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        prod_nombre like '%`+searchCondition+`%' 
                                        and prod_cmm_estatus_id = 1000016
                                        and prod_prod_producto_padre_sku is null
                                        and c2.cat_cmm_estatus_id = 1000010 
                                        and prod_sku in (
                                                select 
                                                    p6.prod_sku
                                                from 
                                                    productos p3 
                                                    left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku 
                                                where
                                                    p3.prod_prod_producto_padre_sku in 
                                                                                    (
                                                                                        select 
                                                                                            p4.prod_sku 
                                                                                        from
                                                                                            productos p4 
                                                                                        where
                                                                                            p4.prod_nombre like '%`+searchCondition+`%' 
                                                                                            and prod_cmm_estatus_id = 1000016
                                                                                            and prod_prod_producto_padre_sku is null
                                                                                    )
                                                    and p3.prod_volumen != 0
                                                    and p3.prod_peso != 0
                                                    and p3.prod_mostrar_en_tienda = true
                                            ) 
                                )
                                --Search Child by Name and return Only Fathers
                                union 
                                (
                                    select 
                                        p2.prod_producto_id,
                                        case when prod_nombre like '%`+searchCondition+`%'  then 0.3 else 0.4 end as prioridad
                                    from(
                                        select
                                            p1.prod_producto_id,
                                            case when prod_nombre like '%`+searchCondition+`%'  then 0.3 else 0.4 end as prioridad,
                                            p1.prod_sku,
                                            p1.prod_prod_producto_padre_sku 
                                        from 
                                            productos p1 
                                            left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                            left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                            left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                            left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                        where 
                                            prod_nombre like '%`+searchCondition+`%'  
                                            and prod_cmm_estatus_id = 1000016 
                                            and prod_prod_producto_padre_sku is not null 
                                            and prod_volumen != 0
                                            and prod_peso != 0
                                            and prod_mostrar_en_tienda = true
                                        ) temporal 
                                    left join productos p2 on temporal.prod_prod_producto_padre_sku = p2.prod_sku
                                    left join categorias c3 on p2.prod_cat_categoria_id = c3.cat_categoria_id
                                    where p2.prod_prod_producto_padre_sku is null
                                    and c3.cat_cmm_estatus_id = 1000010 --nueva
                                    group by p2.prod_producto_id, prioridad 
                                )
                                --Search Fathers by Description
                                union
                                (
                                    select
                                        p1.prod_producto_id,
                                        case when prod_descripcion like '%`+searchCondition+`%'  then 1.1 else 1.2 end as prioridad 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        prod_descripcion like '%`+searchCondition+`%' 
                                        and prod_cmm_estatus_id = 1000016
                                        and prod_prod_producto_padre_sku is null 
                                        and c2.cat_cmm_estatus_id = 1000010
                                        and prod_sku in (
                                                select 
                                                    p6.prod_sku
                                                from 
                                                    productos p3
                                                    left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku  
                                                where
                                                    p3.prod_prod_producto_padre_sku in 
                                                                                    (
                                                                                        select 
                                                                                            p4.prod_sku 
                                                                                        from
                                                                                            productos p4 
                                                                                        where
                                                                                            p4.prod_descripcion like '%`+searchCondition+`%' 
                                                                                            and prod_cmm_estatus_id = 1000016
                                                                                            and prod_prod_producto_padre_sku is null
                                                                                    )
                                                    and p3.prod_volumen != 0
                                                    and p3.prod_peso != 0
                                                    and p3.prod_mostrar_en_tienda = true
                                            ) 
                                )
                                --Search Child by Description and return Only Fathers
                                union 
                                (
                                    select 
                                        p2.prod_producto_id,
                                        case when prod_descripcion like '%`+searchCondition+`%'  then 1.3 else 1.4 end as prioridad
                                    from(
                                        select
                                            p1.prod_producto_id,
                                            case when prod_descripcion like '%`+searchCondition+`%'  then 1.3 else 1.4 end as prioridad,
                                            p1.prod_sku,
                                            p1.prod_prod_producto_padre_sku 
                                        from 
                                            productos p1 
                                            left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                            left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                            left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                            left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                        where 
                                            prod_descripcion like '%`+searchCondition+`%'  
                                            and prod_cmm_estatus_id = 1000016 
                                            and prod_prod_producto_padre_sku is not null 
                                            and prod_volumen != 0
                                            and prod_peso != 0
                                            and prod_mostrar_en_tienda = true
                                        ) temporal 
                                    left join productos p2 on temporal.prod_prod_producto_padre_sku = p2.prod_sku
                                    left join categorias c3 on p2.prod_cat_categoria_id = c3.cat_categoria_id 
                                    where p2.prod_prod_producto_padre_sku is null
                                    and c3.cat_cmm_estatus_id = 1000010 --nueva
                                    group by p2.prod_producto_id, prioridad 
                                )
                                --Search Fathers by Categoria
                                union
                                (
                                    select
                                        p1.prod_producto_id,
                                        case when c2.cat_nombre like '%`+searchCondition+`%'  then 1.5 else 1.6 end as prioridad 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        c2.cat_nombre like '%`+searchCondition+`%' 
                                        and prod_cmm_estatus_id = 1000016
                                        and prod_prod_producto_padre_sku is null 
                                        and c2.cat_cmm_estatus_id = 1000010
                                        and prod_sku in (
                                                select 
                                                    p6.prod_sku
                                                from 
                                                    productos p3 
                                                    left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku 
                                                where
                                                    p3.prod_prod_producto_padre_sku in 
                                                                                    (
                                                                                        select 
                                                                                            p4.prod_sku 
                                                                                        from
                                                                                            productos p4 
                                                                                            left join categorias c5 on p4.prod_cat_categoria_id = c5.cat_categoria_id
                                                                                        where
                                                                                            c5.cat_nombre like '%`+searchCondition+`%' 
                                                                                            and prod_cmm_estatus_id = 1000016
                                                                                            and prod_prod_producto_padre_sku is null
                                                                                    )
                                                    and p3.prod_volumen != 0
                                                    and p3.prod_peso != 0
                                                    and p3.prod_mostrar_en_tienda = true
                                            )
                                )
                                --Search Fathers by Marca
                                union
                                (
                                    select
                                        p1.prod_producto_id,
                                        case when m2.mar_nombre like '%`+searchCondition+`%'  then 1.7 else 1.8 end as prioridad 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        m2.mar_nombre like '%`+searchCondition+`%' 
                                        and prod_cmm_estatus_id = 1000016
                                        and prod_prod_producto_padre_sku is null 
                                        and c2.cat_cmm_estatus_id = 1000010
                                        and prod_sku in (
                                                select 
                                                    p6.prod_sku
                                                from 
                                                    productos p3 
                                                    left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku 
                                                where
                                                    p3.prod_prod_producto_padre_sku in 
                                                                                    (
                                                                                        select 
                                                                                            p4.prod_sku 
                                                                                        from
                                                                                            productos p4 
                                                                                            left join marcas m5 on p4.prod_mar_marca_id = m5.mar_marca_id 
                                                                                        where
                                                                                            m5.mar_nombre like '%`+searchCondition+`%' 
                                                                                            and prod_cmm_estatus_id = 1000016
                                                                                            and prod_prod_producto_padre_sku is null
                                                                                    )
                                                    and p3.prod_volumen != 0
                                                    and p3.prod_peso != 0
                                                    and p3.prod_mostrar_en_tienda = true
                                            ) 
                                )
                                --Search Fathers by Marca Abreviatura
                                union
                                (
                                    select
                                        p1.prod_producto_id,
                                        case when m2.mar_abreviatura like '%`+searchCondition+`%'  then 1.81 else 1.82 end as prioridad 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        m2.mar_abreviatura like '%`+searchCondition+`%' 
                                        and prod_cmm_estatus_id = 1000016
                                        and prod_prod_producto_padre_sku is null 
                                        and c2.cat_cmm_estatus_id = 1000010
                                        and prod_sku in (
                                                select 
                                                     p6.prod_sku
                                                from 
                                                    productos p3
                                                    left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku  
                                                where
                                                    p3.prod_prod_producto_padre_sku in 
                                                                                    (
                                                                                        select 
                                                                                            p4.prod_sku 
                                                                                        from
                                                                                            productos p4 
                                                                                            left join marcas m5 on p4.prod_mar_marca_id = m5.mar_marca_id 
                                                                                        where
                                                                                            m5.mar_abreviatura like '%`+searchCondition+`%' 
                                                                                            and prod_cmm_estatus_id = 1000016
                                                                                            and prod_prod_producto_padre_sku is null
                                                                                    )
                                                    and p3.prod_volumen != 0
                                                    and p3.prod_peso != 0
                                                    and p3.prod_mostrar_en_tienda = true
                                            ) 
                                )
                                --Search Fathers by Foreing Name
                                union
                                (
                                    select
                                        p1.prod_producto_id,
                                        case when p1.prod_nombre_extranjero like '%`+searchCondition+`%'  then 1.9 else 2 end as prioridad 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        p1.prod_nombre_extranjero like '%`+searchCondition+`%' 
                                        and prod_cmm_estatus_id = 1000016
                                        and prod_prod_producto_padre_sku is null 
                                        and c2.cat_cmm_estatus_id = 1000010
                                        and prod_sku in (
                                                select 
                                                    p6.prod_sku
                                                from 
                                                    productos p3 
                                                    left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku 
                                                where
                                                    p3.prod_prod_producto_padre_sku in 
                                                                                    (
                                                                                        select 
                                                                                            p4.prod_sku 
                                                                                        from
                                                                                            productos p4 
                                                                                        where
                                                                                            p4.prod_nombre_extranjero like '%`+searchCondition+`%' 
                                                                                            and prod_cmm_estatus_id = 1000016
                                                                                            and prod_prod_producto_padre_sku is null
                                                                                    )
                                                    and p3.prod_volumen != 0
                                                    and p3.prod_peso != 0
                                                    and p3.prod_mostrar_en_tienda = true
                                            ) 
                                )
                                --Search Child by Foreing Name and return Only Fathers
                                union 
                                (
                                    select 
                                        p2.prod_producto_id,
                                        case when prod_nombre_extranjero like '%`+searchCondition+`%'  then 2.1 else 2.2 end as prioridad
                                    from(
                                        select
                                            p1.prod_producto_id,
                                            case when prod_nombre_extranjero like '%`+searchCondition+`%'  then 2.3 else 2.4 end as prioridad,
                                            p1.prod_sku,
                                            p1.prod_prod_producto_padre_sku 
                                        from 
                                            productos p1 
                                            left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                            left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                            left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                            left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                        where 
                                            prod_nombre_extranjero like '%`+searchCondition+`%'  
                                            and prod_cmm_estatus_id = 1000016 
                                            and prod_prod_producto_padre_sku is not null 
                                            and prod_volumen != 0
                                            and prod_peso != 0
                                            and prod_mostrar_en_tienda = true
                                        ) temporal 
                                    left join productos p2 on temporal.prod_prod_producto_padre_sku = p2.prod_sku 
                                    left join categorias c3 on p2.prod_cat_categoria_id = c3.cat_categoria_id
                                    where p2.prod_prod_producto_padre_sku is null
                                    and c3.cat_cmm_estatus_id = 1000010 --nueva
                                    group by p2.prod_producto_id, prioridad 
                                )
                                --Search Fathers by SKU
                                union
                                (
                                    select
                                        p1.prod_producto_id,
                                        case when p1.prod_sku like '%`+searchCondition+`%'  then 2.5 else 2.6 end as prioridad 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        p1.prod_sku like '%`+searchCondition+`%' 
                                        and prod_cmm_estatus_id = 1000016
                                        and prod_prod_producto_padre_sku is null 
                                        and c2.cat_cmm_estatus_id = 1000010
                                        and prod_sku in (
                                                select 
                                                    p6.prod_sku
                                                from 
                                                    productos p3 
                                                    left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku 
                                                where
                                                    p3.prod_prod_producto_padre_sku in 
                                                                                    (
                                                                                        select 
                                                                                            p4.prod_sku 
                                                                                        from
                                                                                            productos p4 
                                                                                        where
                                                                                            p4.prod_sku like '%`+searchCondition+`%' 
                                                                                            and prod_cmm_estatus_id = 1000016
                                                                                            and prod_prod_producto_padre_sku is null
                                                                                    )
                                                    and p3.prod_volumen != 0
                                                    and p3.prod_peso != 0
                                                    and p3.prod_mostrar_en_tienda = true
                                            ) 
                                )
                                --Search Child by SKU and return Only Fathers
                                union 
                                (
                                    select 
                                        p2.prod_producto_id,
                                        case when p2.prod_sku like '%`+searchCondition+`%'  then 2.7 else 2.8 end as prioridad
                                    from(
                                        select
                                            p1.prod_producto_id,
                                            case when p1.prod_sku like '%`+searchCondition+`%'  then 2.7 else 2.8 end as prioridad,
                                            p1.prod_sku,
                                            p1.prod_prod_producto_padre_sku 
                                        from 
                                            productos p1 
                                            left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                            left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                            left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                            left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                        where 
                                            p1.prod_sku like '%`+searchCondition+`%'  
                                            and prod_cmm_estatus_id = 1000016 
                                            and prod_prod_producto_padre_sku is not null 
                                            and prod_volumen != 0
                                            and prod_peso != 0
                                            and prod_mostrar_en_tienda = true
                                        ) temporal 
                                    left join productos p2 on temporal.prod_prod_producto_padre_sku = p2.prod_sku 
                                    left join categorias c3 on p2.prod_cat_categoria_id = c3.cat_categoria_id
                                    where p2.prod_prod_producto_padre_sku is null
                                    and c3.cat_cmm_estatus_id = 1000010 --nueva
                                    group by p2.prod_producto_id, prioridad 
                                )
                            )  as p1 
                        ) 
                        `;
                }

                //Variables que concatenan TODO
                var sqlFinalRows = sqlRows + sqlFrom + sqlBusqueda + orderByFinal + sqlLimiteAndPage
                var sqlFinalRowsCount = sqlRowsCount + sqlFrom + sqlBusqueda 

                //Obtener Rows
                var rows = await sequelize.query(sqlFinalRows,
                {
                    type: sequelize.QueryTypes.SELECT 
                });

                //Obtener Count de las rows
                const constCount = await sequelize.query(sqlFinalRowsCount,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });

                //Se regresa el esquema parecido a las consultas de SEQUALIZE
                const mainConsultaProductos = {
                    count: parseInt(constCount[0].count),
                    rows
                }
            //FIN Obtener productos BASE para luego obtener mas cosas













            //LA VARIABLE rows CONTIENE TODOS LOS PRODUCTOS OBTENIDOS

            //Obtener hijos, Si vienen hijos asignar Lista de precio por hijo y lista de stock por hijo
            rows = await productosUtils.getHijosFromPadre(rows);



            //Obtener si aplica backorder para los hijos
            rows = await productosUtils.setDiasResurtimientoIsBackOrder(rows);

            //Obtener promociones activa y traer la mejor por producto hijo
            rows = await productosUtils.getChildsPromotions(rows);

            






            //Obtener descuento de "marca" dielsa (descuento por grupo listas)
            if(idSocioNegocio != null)
            {
                //Obtener promociones activa y traer la mejor por producto hijo
                rows = await productosUtils.getChildsSNDiscounts(rows, idSocioNegocio);
            }
            else
            {
                //Obtener promociones activa y traer la mejor por producto hijo
                rows = await productosUtils.getChildsNULLSNDiscounts(rows);
            }






            //Obtener la mejor promocion o descuento de sn grupo 
            rows = await productosUtils.setBasePriceForChildsWithPromotions(rows, idSocioNegocio);



            //Pone las variables precioPromocionDielsaBool y DescuentoDielsaFijo que hacen referencia cuando una promocion es mayor al descuento de cliente
            rows = await productosUtils.setDiscountAmountOverPromotion(rows, idSocioNegocio);




            //Obtener y concatenar hijo con mejor promocion al producto padre
            rows = await productosUtils.setBestPromotionChildToFatherV2(rows);





            //obtener stock detalle por hijo
            rows = await productosUtils.getChildsStocksDetalle(rows);



            //setteara el precio final y base en USD en un nuevo campo
            rows = await productosUtils.setChildsUSDChange(rows);
            


            res.status(200).send({
                message: 'Lista de productos',
                mainConsultaProductos
            })

        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },


    

    frontGetProductoByCategoriaV3: async (req, res, next) =>{
        try{

            //Condiciones de busqueda
            var ASCDESC = req.body.ASCDESC
            var orderByFinal = ''
            var cat_categoria_id = req.body.cat_categoria_id.toUpperCase()

            //Variable en caso de que venga socio de negocio se obtendran precios de su lista de precios
            var idSocioNegocio

            if(req.body.idSocioNegocio)
            {
                idSocioNegocio = req.body.idSocioNegocio
            }
            else
            {
                idSocioNegocio = null
            }

            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit

            //Tipo de Order By
            var ordenamientoBy = req.body.orderBy
            switch(ordenamientoBy)
            {
                case null: 
                    orderByFinal = `order by prioridad `
                    ordenamientoBy = "normal"
                    break;

                case '': 
                    orderByFinal = `order by prioridad `
                    ordenamientoBy = "normal"
                    break;

                case "precio":
                    orderByFinal = `order by prod_precio `
                    ordenamientoBy = "prod_precio"
                    break; 

                case "mas vendido":
                    orderByFinal = `order by prod_unidades_vendidas `
                    ordenamientoBy = "mas vendido"
                    break;

                case "mejores valorados":
                    orderByFinal = `order by prod_calificacion_promedio `
                    ordenamientoBy = "prod_calificacion_promedio"
                    break;

                case "az-za":
                    orderByFinal = `order by prod_nombre `
                    ordenamientoBy = "prod_nombre"
                    break;

                case "fecha lanzamienta":
                    orderByFinal = `order by lanzamiento `
                    ordenamientoBy = "lanzamiento"
                    break;
            }
            orderByFinal = orderByFinal + ' ' + ASCDESC


            //Obtener categorias y subcategorias
            var arrayCategoriasIDs = []

            //Agregamos categoria random para que no genere error al no tener categorias el in
            arrayCategoriasIDs.push(parseInt(-10000))

            const constFirstCategoria = await models.Categoria.findOne({
                where: {
                    cat_categoria_id : cat_categoria_id,
                    cat_cmm_estatus_id: statusControles.ESTATUS_CATEGORIA.ACTIVO
                },
                attributes: ["cat_categoria_id"]
            })

            if(constFirstCategoria)
            {
                arrayCategoriasIDs.push(parseInt(cat_categoria_id))
            }
            





            var arrayCategoriasTemporalesIds1 = []
            var arrayCategoriasTemporalesIds2 = []

            arrayCategoriasTemporalesIds1.push(cat_categoria_id)

            var breaker = false
            var seguridadBreaker = 0
            var categoriaTemporal = cat_categoria_id
            //While que creara el arreglo con todos los id de categorias y subcategorias
            while(breaker == false)
            {
                if(arrayCategoriasTemporalesIds1.length > 0)
                {
                    for(var i = 0; i < arrayCategoriasTemporalesIds1.length; i++)
                    {
                        const constCategoria = await models.Categoria.findAll({
                            where: {
                                cat_cat_categoria_padre_id : arrayCategoriasTemporalesIds1[i],
                                cat_cmm_estatus_id: statusControles.ESTATUS_CATEGORIA.ACTIVO
                            },
                            attributes: ["cat_categoria_id"]
                        })

                        //Concatena las nuevas categorias
                        if(constCategoria.length)
                        {
                            for(var j = 0; j < constCategoria.length; j++)
                            {
                                arrayCategoriasTemporalesIds2.push(constCategoria[j].dataValues.cat_categoria_id)
                                arrayCategoriasIDs.push(constCategoria[j].dataValues.cat_categoria_id)
                            }
                        }
                    }
                    //Elimina lo que tiene el arreglo actual para dejarlo vacio para la siguiente iteracion rifarse
                    arrayCategoriasTemporalesIds1.splice(0, arrayCategoriasTemporalesIds1.length)
                }
                else if(arrayCategoriasTemporalesIds2 .length > 0)
                {
                    for(var i = 0; i < arrayCategoriasTemporalesIds2.length; i++)
                    {
                        const constCategoria = await models.Categoria.findAll({
                            where: {
                                cat_cat_categoria_padre_id : arrayCategoriasTemporalesIds2[i],
                                cat_cmm_estatus_id: statusControles.ESTATUS_CATEGORIA.ACTIVO
                            },
                            attributes: ["cat_categoria_id"]
                        })

                        //Concatena las nuevas categorias
                        if(constCategoria.length)
                        {
                            for(var j = 0; j < constCategoria.length; j++)
                            {
                                arrayCategoriasTemporalesIds2.push(constCategoria[j].dataValues.cat_categoria_id)
                                arrayCategoriasIDs.push(constCategoria[j].dataValues.cat_categoria_id)
                            }
                        }
                    }
                    //Elimina lo que tiene el arreglo actual para dejarlo vacio para la siguiente iteracion rifarse
                    arrayCategoriasTemporalesIds2.splice(0, arrayCategoriasTemporalesIds2.length)
                }
                else
                {
                    breaker = true

                }

                //Cierra el while por si queda activo mas de 50 veces (seguridad)
                seguridadBreaker++  
                if(seguridadBreaker == 100)
                {
                    breaker = true
                }
            }


            //SQL GENERAl
            var sqlRows = `
                select 
                    p5.prod_producto_id,
                    p5.prod_nombre,
                    p5.prod_descripcion,
                    p5.prod_sku,
                    p5.prod_precio,
                    m2.mar_marca_id,
                    m2.mar_nombre,
                    p5.prod_cmm_estatus_id,
                    cmm.cmm_valor,
                    c2.cat_cmm_estatus_id,
                    cmm2.cmm_valor as cat_cmm_valor,
                    c2.cat_nombre,
                    pv.prv_nombre,
                    p5.prod_nombre_extranjero,
                    p5.prod_calificacion_promedio,
                    p5.prod_es_stock_inactivo,
                    p5.prod_tipo_precio_base,
                    prod_unidades_vendidas,
                    p5."createdAt" as "lanzamiento"
            `;

            //SQL que solo regresara el total del count
            var sqlRowsCount = `
                select 
                    count(p5.prod_producto_id)
            `;

            //Se usara para concatenar mas codigo repetible
            var sqlFrom = `
                from 
                    productos p5
                    left join categorias c2 on p5.prod_cat_categoria_id = c2.cat_categoria_id
                    left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                    left join marcas m2 on p5.prod_mar_marca_id = m2.mar_marca_id
                    left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
            `;

            var sqlBusqueda = ``
            var sqlLimiteAndPage = ` LIMIT `+varlimit+` OFFSET `+varoffset

            // (
            //     select 
            //         p1.prod_producto_id
            //     from 
            //     (
            //         select
            //             p1.prod_producto_id
            //         from 
            //             productos p1 
            //             left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
            //             left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
            //             left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
            //             left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
            //             left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
            //         where 
            //             c2.cat_categoria_id in (`+arrayCategoriasIDs+`)
            //             and prod_cmm_estatus_id = 1000016
            //             and prod_prod_producto_padre_sku is null 
            //     )  as p1
            // )


            sqlBusqueda = `
                    where p5.prod_producto_id in 
                    (
                        select
                            p1.prod_producto_id
                        from 
                            productos p1 
                            left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                            left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                            left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                            left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                        where 
                            c2.cat_categoria_id in (`+arrayCategoriasIDs+`)
                            and prod_cmm_estatus_id = 1000016
                            and prod_prod_producto_padre_sku is null 
                            and prod_sku in 
                                (
                                    select 
                                        p6.prod_sku
                                    from 
                                        productos p3 
                                        left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku 
                                    where
                                        p3.prod_prod_producto_padre_sku in 
                                                                        (
                                                                            select 
                                                                                p4.prod_sku 
                                                                            from
                                                                                productos p4 
                                                                                left join categorias c5 on p4.prod_cat_categoria_id = c5.cat_categoria_id
                                                                            where
                                                                                c5.cat_categoria_id in (`+arrayCategoriasIDs+`)
                                                                                and prod_cmm_estatus_id = 1000016
                                                                                and prod_prod_producto_padre_sku is null
                                                                        )
                                        and p3.prod_volumen != 0
                                        and p3.prod_peso != 0
                                        and p3.prod_mostrar_en_tienda = true
                                )
                    )
            `;

            // //Variables que concatenan TODO
            var sqlFinalRows = sqlRows + sqlFrom + sqlBusqueda + orderByFinal + sqlLimiteAndPage
            var sqlFinalRowsCount = sqlRowsCount + sqlFrom + sqlBusqueda 

            //Obtener Rows
            var rows = await sequelize.query(sqlFinalRows,
            {
                type: sequelize.QueryTypes.SELECT 
            });

            //Obtener Count de las rows
            const constCount = await sequelize.query(sqlFinalRowsCount,
            { 
                type: sequelize.QueryTypes.SELECT 
            });

            //Se regresa el esquema parecido a las consultas de SEQUALIZE
            const mainConsultaProductos = {
                count: parseInt(constCount[0].count),
                rows
            }


            //LA VARIABLE rows CONTIENE TODOS LOS PRODUCTOS OBTENIDOS
            //Obtener hijos, Si vienen hijos asignar Lista de precio por hijo y lista de stock por hijo
            rows = await productosUtils.getHijosFromPadre(rows);
            
            //Obtener si aplica backorder para los hijos
            rows = await productosUtils.setDiasResurtimientoIsBackOrder(rows);

            //Obtener promociones activa y traer la mejor por producto hijo
            rows = await productosUtils.getChildsPromotions(rows);




            //V3
            //Si la busqueda tiene un id de socio de negocio asignado concatenara un nuevo precio al producto
            // if(idSocioNegocio != null)
            // {
            //     rows = await productosUtils.setBasePricesForChildBySNPriceList(rows, idSocioNegocio);

            //     //Obtener y concatenar hijo con mejor promocion al producto padre
            //     rows = await productosUtils.setBestPromotionChildToFatherWithSNPriceList(rows);
            // }
            // else
            // {
            //     //Obtener y concatenar hijo con mejor promocion al producto padre
            //     rows = await productosUtils.setBestPromotionChildToFather(rows);
            // }


            //V4
            //Obtener descuento de "marca" dielsa (descuento por grupo listas)
            if(idSocioNegocio != null)
            {
                //Obtener promociones activa y traer la mejor por producto hijo
                rows = await productosUtils.getChildsSNDiscounts(rows, idSocioNegocio);
            }
            else
            {
                //Obtener promociones activa y traer la mejor por producto hijo
                rows = await productosUtils.getChildsNULLSNDiscounts(rows);
            }

            //Obtener la mejor promocion o descuento de sn grupo 
            rows = await productosUtils.setBasePriceForChildsWithPromotions(rows, idSocioNegocio);

            //Pone las variables precioPromocionDielsaBool y DescuentoDielsaFijo que hacen referencia cuando una promocion es mayor al descuento de cliente
            rows = await productosUtils.setDiscountAmountOverPromotion(rows, idSocioNegocio);

            //Obtener y concatenar hijo con mejor promocion al producto padre
            rows = await productosUtils.setBestPromotionChildToFatherV2(rows);

            //obtener stock detalle por hijo
            rows = await productosUtils.getChildsStocksDetalle(rows);
            






            res.status(200).send({
                message: 'Lista de productos',
                mainConsultaProductos
            })

        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },

    frontGetProductoByCategoriaV3OnlyChilds: async (req, res, next) =>{
        try{

            //Condiciones de busqueda
            var ASCDESC = req.body.ASCDESC
            var orderByFinal = ''
            var cat_categoria_id = req.body.cat_categoria_id.toUpperCase()

            //Variable en caso de que venga socio de negocio se obtendran precios de su lista de precios
            var idSocioNegocio

            if(req.body.idSocioNegocio)
            {
                idSocioNegocio = req.body.idSocioNegocio
            }
            else
            {
                idSocioNegocio = null
            }

            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit

            //Tipo de Order By
            var ordenamientoBy = req.body.orderBy
            switch(ordenamientoBy)
            {
                case null: 
                    orderByFinal = `order by prioridad `
                    ordenamientoBy = "normal"
                    break;

                case '': 
                    orderByFinal = `order by prioridad `
                    ordenamientoBy = "normal"
                    break;

                case "precio":
                    orderByFinal = `order by prod_precio `
                    ordenamientoBy = "prod_precio"
                    ASCDESC += ', prod_producto_id'
                    break; 

                case "mas vendido":
                    orderByFinal = `order by prod_unidades_vendidas `
                    ordenamientoBy = "mas vendido"
                    break;

                case "mejores valorados":
                    orderByFinal = `order by prod_calificacion_promedio `
                    ordenamientoBy = "prod_calificacion_promedio"
                    break;

                case "az-za":
                    orderByFinal = `order by prod_nombre `
                    ordenamientoBy = "prod_nombre"
                    break;

                case "fecha lanzamienta":
                    orderByFinal = `order by lanzamiento `
                    ordenamientoBy = "lanzamiento"
                    break;
            }
            orderByFinal = orderByFinal + ' ' + ASCDESC


            //Obtener categorias y subcategorias
            var arrayCategoriasIDs = []

            //Agregamos categoria random para que no genere error al no tener categorias el in
            arrayCategoriasIDs.push(parseInt(-10000))

            const constFirstCategoria = await models.Categoria.findOne({
                where: {
                    cat_categoria_id : cat_categoria_id,
                    cat_cmm_estatus_id: statusControles.ESTATUS_CATEGORIA.ACTIVO
                },
                attributes: ["cat_categoria_id"]
            })

            if(constFirstCategoria)
            {
                arrayCategoriasIDs.push(parseInt(cat_categoria_id))
            }
            
            var arrayCategoriasTemporalesIds1 = []
            var arrayCategoriasTemporalesIds2 = []

            arrayCategoriasTemporalesIds1.push(cat_categoria_id)

            var breaker = false
            var seguridadBreaker = 0
            var categoriaTemporal = cat_categoria_id
            //While que creara el arreglo con todos los id de categorias y subcategorias
            while(breaker == false)
            {
                if(arrayCategoriasTemporalesIds1.length > 0)
                {
                    for(var i = 0; i < arrayCategoriasTemporalesIds1.length; i++)
                    {
                        const constCategoria = await models.Categoria.findAll({
                            where: {
                                cat_cat_categoria_padre_id : arrayCategoriasTemporalesIds1[i],
                                cat_cmm_estatus_id: statusControles.ESTATUS_CATEGORIA.ACTIVO
                            },
                            attributes: ["cat_categoria_id"]
                        })

                        //Concatena las nuevas categorias
                        if(constCategoria.length)
                        {
                            for(var j = 0; j < constCategoria.length; j++)
                            {
                                arrayCategoriasTemporalesIds2.push(constCategoria[j].dataValues.cat_categoria_id)
                                arrayCategoriasIDs.push(constCategoria[j].dataValues.cat_categoria_id)
                            }
                        }
                    }
                    //Elimina lo que tiene el arreglo actual para dejarlo vacio para la siguiente iteracion rifarse
                    arrayCategoriasTemporalesIds1.splice(0, arrayCategoriasTemporalesIds1.length)
                }
                else if(arrayCategoriasTemporalesIds2 .length > 0)
                {
                    for(var i = 0; i < arrayCategoriasTemporalesIds2.length; i++)
                    {
                        const constCategoria = await models.Categoria.findAll({
                            where: {
                                cat_cat_categoria_padre_id : arrayCategoriasTemporalesIds2[i],
                                cat_cmm_estatus_id: statusControles.ESTATUS_CATEGORIA.ACTIVO
                            },
                            attributes: ["cat_categoria_id"]
                        })

                        //Concatena las nuevas categorias
                        if(constCategoria.length)
                        {
                            for(var j = 0; j < constCategoria.length; j++)
                            {
                                arrayCategoriasTemporalesIds2.push(constCategoria[j].dataValues.cat_categoria_id)
                                arrayCategoriasIDs.push(constCategoria[j].dataValues.cat_categoria_id)
                            }
                        }
                    }
                    //Elimina lo que tiene el arreglo actual para dejarlo vacio para la siguiente iteracion rifarse
                    arrayCategoriasTemporalesIds2.splice(0, arrayCategoriasTemporalesIds2.length)
                }
                else
                {
                    breaker = true

                }

                //Cierra el while por si queda activo mas de 50 veces (seguridad)
                seguridadBreaker++  
                if(seguridadBreaker == 100)
                {
                    breaker = true
                }
            }


            //SQL GENERAl
            var sqlRows = `
                select 
                    p5.*,
                    m2.mar_marca_id,
                    m2.mar_nombre,
                    cmm.cmm_valor,
                    c2.cat_cmm_estatus_id,
                    cmm2.cmm_valor as cat_cmm_valor,
                    c2.cat_nombre,
                    pv.prv_nombre,
                    prod_unidades_vendidas,
                    p5."createdAt" as "lanzamiento"
            `;

            //SQL que solo regresara el total del count
            var sqlRowsCount = `
                select 
                    count(p5.prod_producto_id)
            `;

            //Se usara para concatenar mas codigo repetible
            var sqlFrom = `
                from 
                    productos p5
                    left join categorias c2 on cast(p5.prod_codigo_grupo as int) = c2.cat_categoria_id
                    left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                    left join marcas m2 on cast(p5.prod_codigo_marca as int) = m2.mar_marca_id
                    left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
            `;

            var sqlBusqueda = ``
            var sqlLimiteAndPage = ` LIMIT `+varlimit+` OFFSET `+varoffset



            sqlBusqueda = `
                    where p5.prod_producto_id in 
                    (
                        select
                            p1.prod_producto_id
                        from 
                            productos p1 
                            left join categorias c2 on cast (p1.prod_codigo_grupo as int) = c2.cat_categoria_id
                            left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                            left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                            left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                        where 
                        cast (p1.prod_codigo_grupo as int) in (`+arrayCategoriasIDs+`)
                            and prod_cmm_estatus_id = 1000016 
                            and prod_prod_producto_padre_sku is not null 
                            and prod_mostrar_en_tienda = true
                    )
            `;

            // //Variables que concatenan TODO
            var sqlFinalRows = sqlRows + sqlFrom + sqlBusqueda + orderByFinal + sqlLimiteAndPage
            var sqlFinalRowsCount = sqlRowsCount + sqlFrom + sqlBusqueda 

            //Obtener Rows
            var rows = await sequelize.query(sqlFinalRows,
            {
                type: sequelize.QueryTypes.SELECT 
            });

            // Obtener el stock de los productos por almacen
            rows = await productosUtils.getStockByStore(rows);
           
            //Obtener Count de las rows
            const constCount = await sequelize.query(sqlFinalRowsCount,
            { 
                type: sequelize.QueryTypes.SELECT 
            });

            var numPaginas = Math.ceil(parseInt(constCount[0].count)/req.body.limite);
               
                if( parseInt(req.body.pagina) == (numPaginas-1)){
                    console.log('Aqui andamos 22:', numPaginas)
                    var sqlFinalRows = sqlRows + sqlFrom + sqlBusqueda + orderByFinal 
                  
                    //Obtener Rows
                     rows = await sequelize.query(sqlFinalRows,
                    {
                        type: sequelize.QueryTypes.SELECT 
                    });

                }

            //Se regresa el esquema parecido a las consultas de SEQUALIZE
            

            console.log("llego al final")

            //LA VARIABLE rows CONTIENE TODOS LOS PRODUCTOS OBTENIDOS

            //Obtener si aplica backorder para los hijos
            rows = await productosUtils.setImagenesOnlyChilds(rows);

            //Obtener si aplica backorder para los hijos
            rows = await productosUtils.setDiasResurtimientoIsBackOrderOnlyChilds(rows);
            
            //Obtener promociones activa y traer la mejor por producto hijo
            rows = await productosUtils.getChildsPromotionsOnlyChilds(rows);


            //Obtener descuento de "marca" dielsa (descuento por grupo listas)
            if(idSocioNegocio != null)
            {
                //Obtener promociones activa y traer la mejor por producto hijo
                rows = await productosUtils.getChildsSNDiscountsOnlyChilds(rows, idSocioNegocio);
            }
            else
            {
                //Obtener promociones activa y traer la mejor por producto hijo
                rows = await productosUtils.getChildsNULLSNDiscountsOnlyChilds(rows);
            }

            //Obtener la mejor promocion o descuento de sn grupo 
            rows = await productosUtils.setBasePriceForChildsWithPromotionsOnlyChilds(rows, idSocioNegocio);

            //Pone las variables precioPromocionDielsaBool y DescuentoDielsaFijo que hacen referencia cuando una promocion es mayor al descuento de cliente
            rows = await productosUtils.setDiscountAmountOverPromotionOnlyChilds(rows, idSocioNegocio);

            // //Obtener y concatenar hijo con mejor promocion al producto padre
            // rows = await productosUtils.setBestPromotionChildToFatherV2(rows);

            //obtener stock detalle por hijo
            rows = await productosUtils.getChildsStocksDetalleOnlyChilds(rows);


            //concatenar producto padre ID a cada hijo
            rows = await productosUtils.getChildsFathersIDOnlyChilds(rows);

            // Obtener el precio del dollar y se hace la conversión
            rows = await productosUtils.getConversionUSD2(rows);

            //Mole
            //rows = await productosUtils.setChildsUSDChange(rows);

            //Arroz
            //rows = await productosUtils.setOnlyChildsUSDChange(rows);

            if(parseInt(req.body.pagina) == (numPaginas-1)  && constCount[0].count != 0  && parseInt(req.body.pagina) !=0 ){  
                rows = await productosUtils.setFiltrarProductsFinImagen(rows);
                }else if( parseInt(req.body.pagina) < (numPaginas-1)  && constCount[0].count != 0 ){     
                rows = await productosUtils.setFiltrarProductsSinImagen(rows);
                }

           

            const mainConsultaProductos = {
                count: parseInt(constCount[0].count),
                rows
            }
            res.status(200).send({
                message: 'Lista de productos',
                mainConsultaProductos
            })

        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },

    frontGetProductoByCategoriaV3OnlyChildsSeguridadLuegoBorrar: async (req, res, next) =>{
        try{

            //Condiciones de busqueda
            var ASCDESC = req.body.ASCDESC
            var orderByFinal = ''
            var cat_categoria_id = req.body.cat_categoria_id.toUpperCase()

            //Variable en caso de que venga socio de negocio se obtendran precios de su lista de precios
            var idSocioNegocio

            if(req.body.idSocioNegocio)
            {
                idSocioNegocio = req.body.idSocioNegocio
            }
            else
            {
                idSocioNegocio = null
            }

            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit

            //Tipo de Order By
            var ordenamientoBy = req.body.orderBy
            switch(ordenamientoBy)
            {
                case null: 
                    orderByFinal = `order by prioridad `
                    ordenamientoBy = "normal"
                    break;

                case '': 
                    orderByFinal = `order by prioridad `
                    ordenamientoBy = "normal"
                    break;

                case "precio":
                    orderByFinal = `order by prod_precio `
                    ordenamientoBy = "prod_precio"
                    break; 

                case "mas vendido":
                    orderByFinal = `order by prod_unidades_vendidas `
                    ordenamientoBy = "mas vendido"
                    break;

                case "mejores valorados":
                    orderByFinal = `order by prod_calificacion_promedio `
                    ordenamientoBy = "prod_calificacion_promedio"
                    break;

                case "az-za":
                    orderByFinal = `order by prod_nombre `
                    ordenamientoBy = "prod_nombre"
                    break;

                case "fecha lanzamienta":
                    orderByFinal = `order by lanzamiento `
                    ordenamientoBy = "lanzamiento"
                    break;
            }
            orderByFinal = orderByFinal + ' ' + ASCDESC


            //Obtener categorias y subcategorias
            var arrayCategoriasIDs = []

            //Agregamos categoria random para que no genere error al no tener categorias el in
            arrayCategoriasIDs.push(parseInt(-10000))

            const constFirstCategoria = await models.Categoria.findOne({
                where: {
                    cat_categoria_id : cat_categoria_id,
                    cat_cmm_estatus_id: statusControles.ESTATUS_CATEGORIA.ACTIVO
                },
                attributes: ["cat_categoria_id"]
            })

            if(constFirstCategoria)
            {
                arrayCategoriasIDs.push(parseInt(cat_categoria_id))
            }
            
            var arrayCategoriasTemporalesIds1 = []
            var arrayCategoriasTemporalesIds2 = []

            arrayCategoriasTemporalesIds1.push(cat_categoria_id)

            var breaker = false
            var seguridadBreaker = 0
            var categoriaTemporal = cat_categoria_id
            //While que creara el arreglo con todos los id de categorias y subcategorias
            while(breaker == false)
            {
                if(arrayCategoriasTemporalesIds1.length > 0)
                {
                    for(var i = 0; i < arrayCategoriasTemporalesIds1.length; i++)
                    {
                        const constCategoria = await models.Categoria.findAll({
                            where: {
                                cat_cat_categoria_padre_id : arrayCategoriasTemporalesIds1[i],
                                cat_cmm_estatus_id: statusControles.ESTATUS_CATEGORIA.ACTIVO
                            },
                            attributes: ["cat_categoria_id"]
                        })

                        //Concatena las nuevas categorias
                        if(constCategoria.length)
                        {
                            for(var j = 0; j < constCategoria.length; j++)
                            {
                                arrayCategoriasTemporalesIds2.push(constCategoria[j].dataValues.cat_categoria_id)
                                arrayCategoriasIDs.push(constCategoria[j].dataValues.cat_categoria_id)
                            }
                        }
                    }
                    //Elimina lo que tiene el arreglo actual para dejarlo vacio para la siguiente iteracion rifarse
                    arrayCategoriasTemporalesIds1.splice(0, arrayCategoriasTemporalesIds1.length)
                }
                else if(arrayCategoriasTemporalesIds2 .length > 0)
                {
                    for(var i = 0; i < arrayCategoriasTemporalesIds2.length; i++)
                    {
                        const constCategoria = await models.Categoria.findAll({
                            where: {
                                cat_cat_categoria_padre_id : arrayCategoriasTemporalesIds2[i],
                                cat_cmm_estatus_id: statusControles.ESTATUS_CATEGORIA.ACTIVO
                            },
                            attributes: ["cat_categoria_id"]
                        })

                        //Concatena las nuevas categorias
                        if(constCategoria.length)
                        {
                            for(var j = 0; j < constCategoria.length; j++)
                            {
                                arrayCategoriasTemporalesIds2.push(constCategoria[j].dataValues.cat_categoria_id)
                                arrayCategoriasIDs.push(constCategoria[j].dataValues.cat_categoria_id)
                            }
                        }
                    }
                    //Elimina lo que tiene el arreglo actual para dejarlo vacio para la siguiente iteracion rifarse
                    arrayCategoriasTemporalesIds2.splice(0, arrayCategoriasTemporalesIds2.length)
                }
                else
                {
                    breaker = true

                }

                //Cierra el while por si queda activo mas de 50 veces (seguridad)
                seguridadBreaker++  
                if(seguridadBreaker == 100)
                {
                    breaker = true
                }
            }


            //SQL GENERAl
            var sqlRows = `
                select 
                    p5.prod_producto_id,
                    p5.prod_prod_producto_padre_sku,
                    p5.prod_nombre,
                    p5.prod_descripcion,
                    p5.prod_sku,
                    p5.prod_precio,
                    p5.prod_total_stock,
                    m2.mar_marca_id,
                    m2.mar_nombre,
                    p5.prod_cmm_estatus_id,
                    cmm.cmm_valor,
                    c2.cat_cmm_estatus_id,
                    cmm2.cmm_valor as cat_cmm_valor,
                    c2.cat_nombre,
                    pv.prv_nombre,
                    p5.prod_nombre_extranjero,
                    p5.prod_calificacion_promedio,
                    p5.prod_es_stock_inactivo,
                    p5.prod_tipo_precio_base,
                    prod_unidades_vendidas,
                    p5."createdAt" as "lanzamiento"
            `;

            //SQL que solo regresara el total del count
            var sqlRowsCount = `
                select 
                    count(p5.prod_producto_id)
            `;

            //Se usara para concatenar mas codigo repetible
            var sqlFrom = `
                from 
                    productos p5
                    left join categorias c2 on cast(p5.prod_codigo_grupo as int) = c2.cat_categoria_id
                    left join marcas m2 on cast(p5.prod_codigo_marca as int) = m2.mar_marca_id
                    left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                    left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
            `;

            var sqlBusqueda = ``
            var sqlLimiteAndPage = ` LIMIT `+varlimit+` OFFSET `+varoffset



            sqlBusqueda = `
                    where p5.prod_producto_id in 
                    (
                        select
                            p1.prod_producto_id
                        from 
                            productos p1 
                            left join categorias c2 on cast (p1.prod_codigo_grupo as int) = c2.cat_categoria_id
                            left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                            left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                            left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                        where 
                        cast (p1.prod_codigo_grupo as int) in (`+arrayCategoriasIDs+`)
                            and prod_cmm_estatus_id = 1000016 
                            and prod_prod_producto_padre_sku is not null 
                            and prod_volumen != 0
                            and prod_peso != 0
                            and prod_mostrar_en_tienda = true
                    )
            `;

            // //Variables que concatenan TODO
            var sqlFinalRows = sqlRows + sqlFrom + sqlBusqueda + orderByFinal + sqlLimiteAndPage
            var sqlFinalRowsCount = sqlRowsCount + sqlFrom + sqlBusqueda 

            //Obtener Rows
            var rows = await sequelize.query(sqlFinalRows,
            {
                type: sequelize.QueryTypes.SELECT 
            });

            
            //Obtener Count de las rows
            const constCount = await sequelize.query(sqlFinalRowsCount,
            { 
                type: sequelize.QueryTypes.SELECT 
            });

            var numPaginas = Math.ceil(parseInt(constCount[0].count)/req.body.limite);
               
                if( parseInt(req.body.pagina) == (numPaginas-1)){
                    var sqlFinalRows = sqlRows + sqlFrom + sqlBusqueda + orderByFinal 
                  
                    //Obtener Rows
                     rows = await sequelize.query(sqlFinalRows,
                    {
                        type: sequelize.QueryTypes.SELECT 
                    });

                }
            //Se regresa el esquema parecido a las consultas de SEQUALIZE
          
            

            //LA VARIABLE rows CONTIENE TODOS LOS PRODUCTOS OBTENIDOS

            //Obtener si aplica backorder para los hijos
            rows = await productosUtils.setImagenesOnlyChilds(rows);

            //Obtener si aplica backorder para los hijos
            rows = await productosUtils.setDiasResurtimientoIsBackOrderOnlyChilds(rows);
            
            //Obtener promociones activa y traer la mejor por producto hijo
            rows = await productosUtils.getChildsPromotionsOnlyChilds(rows);


            //Obtener descuento de "marca" dielsa (descuento por grupo listas)
            if(idSocioNegocio != null)
            {
                //Obtener promociones activa y traer la mejor por producto hijo
                rows = await productosUtils.getChildsSNDiscountsOnlyChilds(rows, idSocioNegocio);
            }
            else
            {
                //Obtener promociones activa y traer la mejor por producto hijo
                rows = await productosUtils.getChildsNULLSNDiscountsOnlyChilds(rows);
            }

            //Obtener la mejor promocion o descuento de sn grupo 
            rows = await productosUtils.setBasePriceForChildsWithPromotionsOnlyChilds(rows, idSocioNegocio);

            //Pone las variables precioPromocionDielsaBool y DescuentoDielsaFijo que hacen referencia cuando una promocion es mayor al descuento de cliente
            rows = await productosUtils.setDiscountAmountOverPromotionOnlyChilds(rows, idSocioNegocio);

            // //Obtener y concatenar hijo con mejor promocion al producto padre
            // rows = await productosUtils.setBestPromotionChildToFatherV2(rows);

            //obtener stock detalle por hijo
            rows = await productosUtils.getChildsStocksDetalleOnlyChilds(rows);


            //concatenar producto padre ID a cada hijo
            rows = await productosUtils.getChildsFathersIDOnlyChilds(rows);

            if(parseInt(req.body.pagina) == (numPaginas-1)  && constCount[0].count != 0  && parseInt(req.body.pagina) !=0 ){  
                rows = await productosUtils.setFiltrarProductsFinImagen(rows);
                }else if( parseInt(req.body.pagina) < (numPaginas-1)  && constCount[0].count != 0 ){     
                rows = await productosUtils.setFiltrarProductsSinImagen(rows);
                }
            

            const mainConsultaProductos = {
                count: parseInt(constCount[0].count),
                rows
            }

            res.status(200).send({
                message: 'Lista de productos',
                mainConsultaProductos
            })

        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },


    frontGetProductoAdvancedSearchV3: async (req, res, next) =>{
        try{

            //Condiciones de busqueda
            var ASCDESC = req.body.ASCDESC
            var orderByFinal = ''
            var prod_nombre = req.body.prod_nombre.toUpperCase()
            var prod_sku = req.body.prod_sku.toUpperCase()
            var prod_nombre_extranjero = req.body.prod_nombre_extranjero.toUpperCase()
            var prod_descripcion = req.body.prod_descripcion.toUpperCase()
            var mar_nombre = req.body.mar_nombre.toUpperCase()
            var cat_nombre = req.body.cat_nombre.toUpperCase()

            //Variable en caso de que venga socio de negocio se obtendran precios de su lista de precios
            var idSocioNegocio

            if(req.body.idSocioNegocio)
            {
                idSocioNegocio = req.body.idSocioNegocio
            }
            else
            {
                idSocioNegocio = null
            }

            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit

            //Tipo de Order By
            var ordenamientoBy = req.body.orderBy
            switch(ordenamientoBy)
            {
                case null: 
                    orderByFinal = `order by prioridad `
                    ordenamientoBy = "normal"
                    break;

                case '': 
                    orderByFinal = `order by prioridad `
                    ordenamientoBy = "normal"
                    break;

                case "precio":
                    orderByFinal = `order by prod_precio `
                    ordenamientoBy = "prod_precio"
                    break; 

                case "mas vendido":
                    orderByFinal = `order by prod_unidades_vendidas `
                    ordenamientoBy = "mas vendido"
                    break;

                case "mejores valorados":
                    orderByFinal = `order by prod_calificacion_promedio `
                    ordenamientoBy = "prod_calificacion_promedio"
                    break;

                case "az-za":
                    orderByFinal = `order by prod_nombre `
                    ordenamientoBy = "prod_nombre"
                    break;

                case "fecha lanzamienta":
                    orderByFinal = `order by lanzamiento `
                    ordenamientoBy = "lanzamiento"
                    break;
            }

            orderByFinal = orderByFinal + ' ' + ASCDESC


            //SQL GENERAl
            var sqlRows = `
                select 
                    p5.prod_producto_id,
                    p5.prod_nombre,
                    p5.prod_descripcion,
                    p5.prod_sku,
                    p5.prod_precio,
                    m2.mar_marca_id,
                    m2.mar_nombre,
                    p5.prod_cmm_estatus_id,
                    cmm.cmm_valor,
                    c2.cat_cmm_estatus_id,
                    cmm2.cmm_valor as cat_cmm_valor,
                    c2.cat_nombre,
                    pv.prv_nombre,
                    p5.prod_nombre_extranjero,
                    p5.prod_calificacion_promedio,
                    p5.prod_es_stock_inactivo,
                    p5.prod_tipo_precio_base,
                    prod_unidades_vendidas,
                    p5."createdAt" as "lanzamiento"
            `;

            //SQL que solo regresara el total del count
            var sqlRowsCount = `
                select 
                    count(p5.prod_producto_id)
            `;

            //Se usara para concatenar mas codigo repetible
            var sqlFrom = `
                from 
                    productos p5
                    left join categorias c2 on p5.prod_cat_categoria_id = c2.cat_categoria_id
                    left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                    left join marcas m2 on p5.prod_mar_marca_id = m2.mar_marca_id
                    left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
            `;

            var sqlBusqueda = ``
            var sqlLimiteAndPage = ` LIMIT `+varlimit+` OFFSET `+varoffset


            //Establecer la base de busqueda donde traiga todos los padres y prevenir error de los intersect haciendo que traiga a todos los padres y lo compare contra esos
            sqlBusqueda += `where p5.prod_producto_id in
                            (
                                select
                                    p1.prod_producto_id
                                from
                                (
                                    --Select null para no tener problemas con los intercect
                                    (
                                        select
                                            prod_producto_id
                                        from
                                            productos p
                                        where
                                            prod_cmm_estatus_id = 1000016
                                            and prod_prod_producto_padre_sku is null
                                    )
            `




            if(req.body.prod_nombre != '')
            {
                sqlBusqueda += `
                                    --Search Product By Name 
                                    intersect 
                                    (
                                        select 
                                            prod_producto_id 
                                        from 
                                            --Search Fathers by Name
                                            (
                                                select
                                                    p1.prod_producto_id
                                                from 
                                                    productos p1 
                                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                                where 
                                                    prod_nombre like '%`+prod_nombre+`%' 
                                                    and prod_cmm_estatus_id = 1000016
                                                    and c2.cat_cmm_estatus_id = 1000010
                                                    and prod_prod_producto_padre_sku is null 
                                                    and prod_sku in (
                                                            select 
                                                                p6.prod_sku
                                                            from 
                                                                productos p3 
                                                                left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku 
                                                            where
                                                                p3.prod_prod_producto_padre_sku in 
                                                                                                (
                                                                                                    select 
                                                                                                        p4.prod_sku 
                                                                                                    from
                                                                                                        productos p4 
                                                                                                    where
                                                                                                        p4.prod_nombre like '%`+prod_nombre+`%' 
                                                                                                        and prod_cmm_estatus_id = 1000016
                                                                                                        and prod_prod_producto_padre_sku is null
                                                                                                )
                                                                and p3.prod_volumen != 0
                                                                and p3.prod_peso != 0
                                                                and p3.prod_mostrar_en_tienda = true
                                                        ) 
                                            ) as p1
                                            --Search Child by Name and return Only Fathers
                                            union 
                                            (
                                                select 
                                                    p2.prod_producto_id
                                                from(
                                                    select
                                                        p1.prod_producto_id,
                                                        p1.prod_sku,
                                                        p1.prod_prod_producto_padre_sku 
                                                    from 
                                                        productos p1 
                                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                                    where 
                                                        prod_nombre like '%`+prod_nombre+`%'  
                                                        and prod_cmm_estatus_id = 1000016 
                                                        and prod_prod_producto_padre_sku is not null 
                                                        and prod_volumen != 0
                                                        and prod_peso != 0
                                                        and prod_mostrar_en_tienda = true
                                                    ) temporal 
                                                left join productos p2 on temporal.prod_prod_producto_padre_sku = p2.prod_sku 
                                                left join categorias c3 on p2.prod_cat_categoria_id = c3.cat_categoria_id
                                                where p2.prod_prod_producto_padre_sku is null
                                                and c3.cat_cmm_estatus_id = 1000010 
                                                group by p2.prod_producto_id
                                            )
                                    )
                                `
            }

            if(req.body.prod_sku != '')
            {
                sqlBusqueda += `
                                    --Search Product By Name SKU
                                    intersect 
                                    (
                                        select 
                                            prod_producto_id 
                                        from 
                                            --Search Fathers by SKU
                                            (
                                                select
                                                    p1.prod_producto_id
                                                from 
                                                    productos p1 
                                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                                where 
                                                    p1.prod_sku like '%`+prod_sku+`%' 
                                                    and prod_cmm_estatus_id = 1000016
                                                    and c2.cat_cmm_estatus_id = 1000010
                                                    and prod_prod_producto_padre_sku is null 
                                                    and prod_sku in (
                                                            select 
                                                                p6.prod_sku
                                                            from 
                                                                productos p3 
                                                                left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku 
                                                            where
                                                                p3.prod_prod_producto_padre_sku in 
                                                                                                (
                                                                                                    select 
                                                                                                        p4.prod_sku 
                                                                                                    from
                                                                                                        productos p4 
                                                                                                    where
                                                                                                        p4.prod_sku like '%`+prod_sku+`%' 
                                                                                                        and prod_cmm_estatus_id = 1000016
                                                                                                        and prod_prod_producto_padre_sku is null
                                                                                                )
                                                                and p3.prod_volumen != 0
                                                                and p3.prod_peso != 0
                                                                and p3.prod_mostrar_en_tienda = true
                                                        ) 
                                            ) as p1
                                            --Search Child by SKU and return Only Fathers
                                            union 
                                            (
                                                select 
                                                    p2.prod_producto_id
                                                from(
                                                    select
                                                        p1.prod_producto_id,
                                                        p1.prod_sku,
                                                        p1.prod_prod_producto_padre_sku 
                                                    from 
                                                        productos p1 
                                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                                    where 
                                                        p1.prod_sku like '%`+prod_sku+`%'  
                                                        and prod_cmm_estatus_id = 1000016 
                                                        and prod_prod_producto_padre_sku is not null 
                                                        and prod_volumen != 0
                                                        and prod_peso != 0
                                                        and prod_mostrar_en_tienda = true
                                                    ) temporal 
                                                left join productos p2 on temporal.prod_prod_producto_padre_sku = p2.prod_sku 
                                                left join categorias c3 on p2.prod_cat_categoria_id = c3.cat_categoria_id
                                                where p2.prod_prod_producto_padre_sku is null
                                                and c3.cat_cmm_estatus_id = 1000010 
                                                group by p2.prod_producto_id
                                            )
                                    )






                `
            }

            if(req.body.prod_nombre_extranjero != '')
            {
                sqlBusqueda += `
                                    --Search Product By Foreing Name
                                    intersect 
                                    (
                                        select 
                                            prod_producto_id 
                                        from 
                                            --Search Fathers by Foreing Name
                                            (
                                                select
                                                    p1.prod_producto_id
                                                from 
                                                    productos p1 
                                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                                where 
                                                    p1.prod_nombre_extranjero like '%`+prod_nombre_extranjero+`%' 
                                                    and prod_cmm_estatus_id = 1000016
                                                    and c2.cat_cmm_estatus_id = 1000010
                                                    and prod_prod_producto_padre_sku is null 
                                                    and prod_sku in (
                                                            select 
                                                                p6.prod_sku
                                                            from 
                                                                productos p3 
                                                                left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku 
                                                            where
                                                                p3.prod_prod_producto_padre_sku in 
                                                                                                (
                                                                                                    select 
                                                                                                        p4.prod_sku 
                                                                                                    from
                                                                                                        productos p4 
                                                                                                    where
                                                                                                        p4.prod_nombre_extranjero like '%`+prod_nombre_extranjero+`%' 
                                                                                                        and prod_cmm_estatus_id = 1000016
                                                                                                        and prod_prod_producto_padre_sku is null
                                                                                                )
                                                                and p3.prod_volumen != 0
                                                                and p3.prod_peso != 0
                                                                and p3.prod_mostrar_en_tienda = true
                                                        ) 
                                            ) as p1
                                            --Search Child by Foreing Name and return Only Fathers
                                            union 
                                            (
                                                select 
                                                    p2.prod_producto_id
                                                from(
                                                    select
                                                        p1.prod_producto_id,
                                                        p1.prod_sku,
                                                        p1.prod_prod_producto_padre_sku 
                                                    from 
                                                        productos p1 
                                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                                    where 
                                                        prod_nombre_extranjero like '%`+prod_nombre_extranjero+`%'  
                                                        and prod_cmm_estatus_id = 1000016 
                                                        and prod_prod_producto_padre_sku is not null 
                                                        and prod_volumen != 0
                                                        and prod_peso != 0
                                                        and prod_mostrar_en_tienda = true
                                                    ) temporal 
                                                left join productos p2 on temporal.prod_prod_producto_padre_sku = p2.prod_sku 
                                                left join categorias c3 on p2.prod_cat_categoria_id = c3.cat_categoria_id
                                                where p2.prod_prod_producto_padre_sku is null
                                                and c3.cat_cmm_estatus_id = 1000010 
                                                group by p2.prod_producto_id
                                            )
                                    )   
                `
            }

            if(req.body.prod_descripcion != '')
            {
                sqlBusqueda += `
                                    --Search Product By Description
                                    intersect 
                                    (
                                        select 
                                            prod_producto_id 
                                        from 
                                            --Search Fathers by Description
                                            (
                                                select
                                                    p1.prod_producto_id
                                                from 
                                                    productos p1 
                                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                                where 
                                                    prod_descripcion like '%`+prod_descripcion+`%' 
                                                    and prod_cmm_estatus_id = 1000016
                                                    and c2.cat_cmm_estatus_id = 1000010
                                                    and prod_prod_producto_padre_sku is null 
                                                    and prod_sku in (
                                                            select 
                                                                p6.prod_sku
                                                            from 
                                                                productos p3
                                                                left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku  
                                                            where
                                                                p3.prod_prod_producto_padre_sku in 
                                                                                                (
                                                                                                    select 
                                                                                                        p4.prod_sku 
                                                                                                    from
                                                                                                        productos p4 
                                                                                                    where
                                                                                                        p4.prod_descripcion like '%`+prod_descripcion+`%' 
                                                                                                        and prod_cmm_estatus_id = 1000016
                                                                                                        and prod_prod_producto_padre_sku is null
                                                                                                )
                                                                and p3.prod_volumen != 0
                                                                and p3.prod_peso != 0
                                                                and p3.prod_mostrar_en_tienda = true
                                                        ) 
                                            ) as p1
                                            --Search Child by Description and return Only Fathers
                                            union 
                                            (
                                                select 
                                                    p2.prod_producto_id
                                                from(
                                                    select
                                                        p1.prod_producto_id,
                                                        p1.prod_sku,
                                                        p1.prod_prod_producto_padre_sku 
                                                    from 
                                                        productos p1 
                                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                                    where 
                                                        prod_descripcion like '%`+prod_descripcion+`%'  
                                                        and prod_cmm_estatus_id = 1000016 
                                                        and prod_prod_producto_padre_sku is not null 
                                                        and prod_volumen != 0
                                                        and prod_peso != 0
                                                        and prod_mostrar_en_tienda = true
                                                    ) temporal 
                                                left join productos p2 on temporal.prod_prod_producto_padre_sku = p2.prod_sku 
                                                left join categorias c3 on p2.prod_cat_categoria_id = c3.cat_categoria_id
                                                where p2.prod_prod_producto_padre_sku is null
                                                and c3.cat_cmm_estatus_id = 1000010 
                                                group by p2.prod_producto_id
                                            )
                                    )
                `
            }

            if(req.body.mar_nombre != '')
            {
                sqlBusqueda += `
                                    --Search Product By Marca (Hijos no tienen Marca)
                                    intersect 
                                    (
                                        select
                                            p1.prod_producto_id
                                        from 
                                            productos p1 
                                            left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                            left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                            left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                            left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                        where 
                                            m2.mar_nombre like '%`+mar_nombre+`%' 
                                            and prod_cmm_estatus_id = 1000016
                                            and c2.cat_cmm_estatus_id = 1000010
                                            and prod_prod_producto_padre_sku is null 
                                            and prod_sku in (
                                                    select 
                                                        p6.prod_sku
                                                    from 
                                                        productos p3 
                                                        left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku 
                                                    where
                                                        p3.prod_prod_producto_padre_sku in 
                                                                                        (
                                                                                            select 
                                                                                                p4.prod_sku 
                                                                                            from
                                                                                                productos p4 
                                                                                                left join marcas m5 on p4.prod_mar_marca_id = m5.mar_marca_id 
                                                                                            where
                                                                                                m5.mar_nombre like '%`+mar_nombre+`%' 
                                                                                                and prod_cmm_estatus_id = 1000016
                                                                                                and prod_prod_producto_padre_sku is null
                                                                                        )
                                                        and p3.prod_volumen != 0
                                                        and p3.prod_peso != 0
                                                        and p3.prod_mostrar_en_tienda = true
                                                ) 
                                    )
                ` 
            }

            if(req.body.cat_nombre != '')
            {
                sqlBusqueda += `
                                    --Search Product By Categoria (Hijos no tienen categoria)
                                    intersect 
                                    (
                                        select
                                            p1.prod_producto_id
                                        from 
                                            productos p1 
                                            left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                            left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                            left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                            left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                        where 
                                            c2.cat_nombre like '%`+cat_nombre+`%' 
                                            and prod_cmm_estatus_id = 1000016
                                            and c2.cat_cmm_estatus_id = 1000010
                                            and prod_prod_producto_padre_sku is null 
                                            and prod_sku in (
                                                    select 
                                                        p6.prod_sku
                                                    from 
                                                        productos p3 
                                                        left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku 
                                                    where
                                                        p3.prod_prod_producto_padre_sku in 
                                                                                        (
                                                                                            select 
                                                                                                p4.prod_sku 
                                                                                            from
                                                                                                productos p4 
                                                                                                left join categorias c5 on p4.prod_cat_categoria_id = c5.cat_categoria_id
                                                                                            where
                                                                                                c5.cat_nombre like '%`+cat_nombre+`%' 
                                                                                                and prod_cmm_estatus_id = 1000016
                                                                                                and prod_prod_producto_padre_sku is null
                                                                                        )
                                                        and p3.prod_volumen != 0
                                                        and p3.prod_peso != 0
                                                        and p3.prod_mostrar_en_tienda = true
                                                )
                                    )
                `
            }



            //Final de la arquitectura SQL para la busqueda
            sqlBusqueda += `
                                )  as p1
                            )
            `

            //Variables que concatenan TODO
            var sqlFinalRows = sqlRows + sqlFrom + sqlBusqueda + orderByFinal + sqlLimiteAndPage
            var sqlFinalRowsCount = sqlRowsCount + sqlFrom + sqlBusqueda 

            //Obtener Rows
            var rows = await sequelize.query(sqlFinalRows,
            {
                type: sequelize.QueryTypes.SELECT 
            });

            //Obtener Count de las rows
            const constCount = await sequelize.query(sqlFinalRowsCount,
            { 
                type: sequelize.QueryTypes.SELECT 
            });


            var numPaginas = Math.ceil(parseInt(constCount[0].count)/req.body.limite);
               
                if( parseInt(req.body.pagina) == (numPaginas-1)){
                    var sqlFinalRows = sqlRows + sqlFrom + sqlBusqueda + orderByFinal 
                  
                    //Obtener Rows
                     rows = await sequelize.query(sqlFinalRows,
                    {
                        type: sequelize.QueryTypes.SELECT 
                    });

                }
            //Se regresa el esquema parecido a las consultas de SEQUALIZE
          
            


            //LA VARIABLE rows CONTIENE TODOS LOS PRODUCTOS OBTENIDOS
            //Obtener hijos, Si vienen hijos asignar Lista de precio por hijo y lista de stock por hijo
            rows = await productosUtils.getHijosFromPadre(rows);
            
            //Obtener si aplica backorder para los hijos
            rows = await productosUtils.setDiasResurtimientoIsBackOrder(rows);

            //Obtener promociones activa y traer la mejor por producto hijo
            rows = await productosUtils.getChildsPromotions(rows);


            //V3
            // //Si la busqueda tiene un id de socio de negocio asignado concatenara un nuevo precio al producto
            // if(idSocioNegocio != null)
            // {
            //     rows = await productosUtils.setBasePricesForChildBySNPriceList(rows, idSocioNegocio);

            //     //Obtener y concatenar hijo con mejor promocion al producto padre
            //     rows = await productosUtils.setBestPromotionChildToFatherWithSNPriceList(rows);
            // }
            // else
            // {
            //     //Obtener y concatenar hijo con mejor promocion al producto padre
            //     rows = await productosUtils.setBestPromotionChildToFather(rows);
            // }




            //V4
            //Obtener descuento de "marca" dielsa (descuento por grupo listas)
            if(idSocioNegocio != null)
            {
                //Obtener promociones activa y traer la mejor por producto hijo
                rows = await productosUtils.getChildsSNDiscounts(rows, idSocioNegocio);
            }
            else
            {
                //Obtener promociones activa y traer la mejor por producto hijo
                rows = await productosUtils.getChildsNULLSNDiscounts(rows);
            }

            //Obtener la mejor promocion o descuento de sn grupo 
            rows = await productosUtils.setBasePriceForChildsWithPromotions(rows, idSocioNegocio);

            //Pone las variables precioPromocionDielsaBool y DescuentoDielsaFijo que hacen referencia cuando una promocion es mayor al descuento de cliente
            rows = await productosUtils.setDiscountAmountOverPromotion(rows, idSocioNegocio);

            //Obtener y concatenar hijo con mejor promocion al producto padre
            rows = await productosUtils.setBestPromotionChildToFatherV2(rows);

            //obtener stock detalle por hijo
            rows = await productosUtils.getChildsStocksDetalle(rows);
            

            if(parseInt(req.body.pagina) == (numPaginas-1)  && constCount[0].count != 0  && parseInt(req.body.pagina) !=0 ){  
                rows = await productosUtils.setFiltrarProductsFinImagen(rows);
                }else if( parseInt(req.body.pagina) < (numPaginas-1)  && constCount[0].count != 0 ){     
                rows = await productosUtils.setFiltrarProductsSinImagen(rows);
                }
            const mainConsultaProductos = {
                count: parseInt(constCount[0].count),
                rows
            }

            res.status(200).send({
                message: 'Lista de productos',
                mainConsultaProductos
            })


        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },




    getProductoFatherDetalleV3: async (req, res, next) =>{
        try{
            //Variable en caso de que venga socio de negocio se obtendran precios de su lista de precios
            var idSocioNegocio

            if(req.body.idSocioNegocio)
            {
                idSocioNegocio = req.body.idSocioNegocio
            }
            else
            {
                idSocioNegocio = null
            }


            //Obtener productos BASE para luego obtener mas cosas
                //SQL GENERAl
                var sqlRows = `
                    select 
                        p5.prod_producto_id,
                        p5.prod_nombre,
                        p5.prod_descripcion,
                        p5.prod_sku,
                        p5.prod_precio,
                        m2.mar_marca_id,
                        m2.mar_nombre,
                        p5.prod_cmm_estatus_id,
                        cmm.cmm_valor,
                        c2.cat_cmm_estatus_id,
                        cmm2.cmm_valor as cat_cmm_valor,
                        c2.cat_nombre,
                        pv.prv_nombre,
                        p5.prod_nombre_extranjero,
                        p5.prod_calificacion_promedio,
                        p5.prod_es_stock_inactivo,
                        p5.prod_tipo_precio_base,
                        prod_unidades_vendidas,
                        p5."createdAt" as "lanzamiento"
                `;

                //SQL que solo regresara el total del count
                var sqlRowsCount = `
                    select 
                        count(p5.prod_producto_id)
                `;

                //Se usara para concatenar mas codigo repetible
                var sqlFrom = `
                    from 
                        productos p5
                        left join categorias c2 on p5.prod_cat_categoria_id = c2.cat_categoria_id
                        left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                        left join marcas m2 on p5.prod_mar_marca_id = m2.mar_marca_id
                        left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
                `;

                var sqlBusqueda = ``

                sqlBusqueda = `
                    where p5.prod_producto_id = `+req.body.prod_producto_id+`
                    and prod_prod_producto_padre_sku is null 
                `;

                //Variables que concatenan TODO
                var sqlFinalRows = sqlRows + sqlFrom + sqlBusqueda
                var sqlFinalRowsCount = sqlRowsCount + sqlFrom + sqlBusqueda 

                //Obtener Rows
                var rows = await sequelize.query(sqlFinalRows,
                {
                    type: sequelize.QueryTypes.SELECT 
                });

                //Obtener Count de las rows
                const constCount = await sequelize.query(sqlFinalRowsCount,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });

                //Se regresa el esquema parecido a las consultas de SEQUALIZE
                const mainConsultaProductos = {
                    count: parseInt(constCount[0].count),
                    rows
                }
            //FIN Obtener productos BASE para luego obtener mas cosas













            //LA VARIABLE rows CONTIENE TODOS LOS PRODUCTOS OBTENIDOS

            //Obtener hijos, Si vienen hijos asignar Lista de precio por hijo y lista de stock por hijo
            rows = await productosUtils.getHijosFromPadre(rows);
            
            // //Funcion exclusiva para detalle traer attributos 
            // rows = await productosUtils.setAttributesToChilds(rows);

            //Obtener si aplica backorder para los hijos
            rows = await productosUtils.setDiasResurtimientoIsBackOrder(rows);


            //Obtener promociones activa y traer la mejor por producto hijo
            rows = await productosUtils.getChildsPromotions(rows);




            // //Si la busqueda tiene un id de socio de negocio asignado concatenara un nuevo precio al producto
            // if(idSocioNegocio != null)
            // {
            //     rows = await productosUtils.setBasePricesForChildBySNPriceList(rows, idSocioNegocio);

            //     //Obtener y concatenar hijo con mejor promocion al producto padre
            //     rows = await productosUtils.setBestPromotionChildToFatherWithSNPriceList(rows);
            // }
            // else
            // {
            //     //Obtener y concatenar hijo con mejor promocion al producto padre
            //     rows = await productosUtils.setBestPromotionChildToFather(rows);
            // }


            //V4
            //Obtener descuento de "marca" dielsa (descuento por grupo listas)
            if(idSocioNegocio != null)
            {
                //Obtener promociones activa y traer la mejor por producto hijo
                rows = await productosUtils.getChildsSNDiscounts(rows, idSocioNegocio);
            }
            else
            {
                //Obtener promociones activa y traer la mejor por producto hijo
                rows = await productosUtils.getChildsNULLSNDiscounts(rows);
            }

            //Obtener la mejor promocion o descuento de sn grupo 
            rows = await productosUtils.setBasePriceForChildsWithPromotions(rows, idSocioNegocio);


            // //Set Dielsa promocion cuando promociones pcp son mejor
            // rows = await productosUtils.setDielsaPromotionsOverPromotions(rows, idSocioNegocio);

            //Pone las variables precioPromocionDielsaBool y DescuentoDielsaFijo que hacen referencia cuando una promocion es mayor al descuento de cliente
            rows = await productosUtils.setDiscountAmountOverPromotion(rows, idSocioNegocio);

            //Obtener y concatenar hijo con mejor promocion al producto padre
            rows = await productosUtils.setBestPromotionChildToFatherV2(rows);

            


            
            //Funcion exclusiva para detalle traer attributos 
            rows = await productosUtils.setAttributesToChilds(rows);



            //obtener stock detalle por hijo
            rows = await productosUtils.getChildsStocksDetalle(rows);
            
             //Mole
             //rows = await productosUtils.setChildsUSDChange(rows);

             //Arroz
             //rows = await productosUtils.setOnlyChildsUSDChange(rows);
            

            rows[0].ListaHijos = await productosUtils.getStockByStore2(rows[0].ListaHijos);
            rows[0].ListaHijos = await productosUtils.getConversionUSD2(rows[0].ListaHijos);

            res.status(200).send({
                message: 'Lista de productos',
                mainConsultaProductos
            })


        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },

    
    getProductoFatherDetalleV3OneChild: async (req, res, next) =>{
        try{
            //Variable en caso de que venga socio de negocio se obtendran precios de su lista de precios
            var idSocioNegocio

            if(req.body.idSocioNegocio)
            {
                idSocioNegocio = req.body.idSocioNegocio
            }
            else
            {
                idSocioNegocio = null
            }


            //Obtener productos BASE para luego obtener mas cosas
                //SQL GENERAl
                var sqlRows = `
                    select 
                        p5.prod_producto_id,
                        p5.prod_nombre,
                        p5.prod_descripcion,
                        p5.prod_prod_producto_padre_sku,
                        p5.prod_sku,
                        p5.prod_precio,
                        m2.mar_marca_id,
                        p5.prod_meta_titulo,
                        p5.prod_meta_descripcion,
                        m2.mar_nombre,
                        p5.prod_cmm_estatus_id,
                        cmm.cmm_valor,
                        c2.cat_cmm_estatus_id,
                        cmm2.cmm_valor as cat_cmm_valor,
                        c2.cat_nombre,
                        c2.cat_categoria_id,
                        c2.cat_nombre_tienda,
                        c2.cat_categoria_link,
                        pv.prv_nombre,
                        p5.prod_nombre_extranjero,
                        p5.prod_calificacion_promedio,
                        p5.prod_es_stock_inactivo,
                        p5.prod_tipo_precio_base,
                        prod_unidades_vendidas,
                        p5."createdAt" as "lanzamiento"
                `;

                //SQL que solo regresara el total del count
                var sqlRowsCount = `
                    select 
                        count(p5.prod_producto_id)
                `;

                //Se usara para concatenar mas codigo repetible
                var sqlFrom = `
                    from 
                        productos p5
                        left join categorias c2 on p5.prod_cat_categoria_id = c2.cat_categoria_id
                        left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                        left join marcas m2 on p5.prod_mar_marca_id = m2.mar_marca_id
                        left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
                `;

                var sqlBusqueda = ``

                sqlBusqueda = `
                    where p5.prod_producto_id = `+req.body.prod_producto_id+`
                    and prod_prod_producto_padre_sku is null 
                `;

                //Variables que concatenan TODO
                var sqlFinalRows = sqlRows + sqlFrom + sqlBusqueda
                var sqlFinalRowsCount = sqlRowsCount + sqlFrom + sqlBusqueda 

                //Obtener Rows
                var rows = await sequelize.query(sqlFinalRows,
                {
                    type: sequelize.QueryTypes.SELECT 
                });
                
                //Crear mas campos para el detalle.

            


                //Obtener Count de las rows
                const constCount = await sequelize.query(sqlFinalRowsCount,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });

                //Se regresa el esquema parecido a las consultas de SEQUALIZE
             

                //aqui Mero


            //FIN Obtener productos BASE para luego obtener mas cosas













            //LA VARIABLE rows CONTIENE TODOS LOS PRODUCTOS OBTENIDOS

            //Obtener hijos, Si vienen hijos asignar Lista de precio por hijo y lista de stock por hijo
            rows = await productosUtils.getHijosFromPadreOneChild(rows, req.body.prod_producto_id_child);
            
            // //Funcion exclusiva para detalle traer attributos 
            // rows = await productosUtils.setAttributesToChilds(rows);

            //Obtener si aplica backorder para los hijos
            rows = await productosUtils.setDiasResurtimientoIsBackOrder(rows);


            //Obtener promociones activa y traer la mejor por producto hijo
            rows = await productosUtils.getChildsPromotions(rows);




            // //Si la busqueda tiene un id de socio de negocio asignado concatenara un nuevo precio al producto
            // if(idSocioNegocio != null)
            // {
            //     rows = await productosUtils.setBasePricesForChildBySNPriceList(rows, idSocioNegocio);

            //     //Obtener y concatenar hijo con mejor promocion al producto padre
            //     rows = await productosUtils.setBestPromotionChildToFatherWithSNPriceList(rows);
            // }
            // else
            // {
            //     //Obtener y concatenar hijo con mejor promocion al producto padre
            //     rows = await productosUtils.setBestPromotionChildToFather(rows);
            // }


            //V4
            //Obtener descuento de "marca" dielsa (descuento por grupo listas)
            if(idSocioNegocio != null)
            {
                //Obtener promociones activa y traer la mejor por producto hijo
                rows = await productosUtils.getChildsSNDiscounts(rows, idSocioNegocio);
            }
            else
            {
                //Obtener promociones activa y traer la mejor por producto hijo
                rows = await productosUtils.getChildsNULLSNDiscounts(rows);
            }

            //Obtener la mejor promocion o descuento de sn grupo 
            rows = await productosUtils.setBasePriceForChildsWithPromotions(rows, idSocioNegocio);


            // //Set Dielsa promocion cuando promociones pcp son mejor
            // rows = await productosUtils.setDielsaPromotionsOverPromotions(rows, idSocioNegocio);

            //Pone las variables precioPromocionDielsaBool y DescuentoDielsaFijo que hacen referencia cuando una promocion es mayor al descuento de cliente
            rows = await productosUtils.setDiscountAmountOverPromotion(rows, idSocioNegocio);

            //Obtener y concatenar hijo con mejor promocion al producto padre
            rows = await productosUtils.setBestPromotionChildToFatherV2(rows);

            


            
            //Funcion exclusiva para detalle traer attributos 
            rows = await productosUtils.setAttributesToChilds(rows);



            //obtener stock detalle por hijo
            rows = await productosUtils.getChildsStocksDetalle(rows);
            
            //es el bueno
            rows = await productosUtils.setChildsUSDChange(rows);

          
           // rows = await productosUtils.setOnlyChildsUSDChange(rows);

           //rows = await productosUtils.setFiltrarProductsSinImagen(rows);

           rows[0].ListaHijos = await productosUtils.getStockByStore2(rows[0].ListaHijos);
           rows[0].ListaHijos = await productosUtils.getConversionUSD(rows[0].ListaHijos);

        // console.log('Este es el contenido del rows ', rows[0].ListaHijos);

           const mainConsultaProductos = {
            count: parseInt(constCount[0].count),
            rows
        }



            res.status(200).send({
                message: 'Lista de productos',
                mainConsultaProductos
            })


        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },
    getProductoFatherDetalleV3OneChildByForeignName: async (req, res, next) =>{
        try{
            //Variable en caso de que venga socio de negocio se obtendran precios de su lista de precios
            var idSocioNegocio

            if(req.body.idSocioNegocio)
            {
                idSocioNegocio = req.body.idSocioNegocio
            }
            else
            {
                idSocioNegocio = null
            }

 
            const constProductoHijo = await models.Producto.findOne(
            {
                where: {
                    prod_nombre_extranjero: req.body.prod_nombre_extranjero,
                    prod_prod_producto_padre_sku: { [Op.ne]: null }
                }
            });

            const constProductoPadre = await models.Producto.findOne(
            {
                where: {
                    prod_sku: constProductoHijo.prod_prod_producto_padre_sku
                }
            });


            //Obtener productos BASE para luego obtener mas cosas
                //SQL GENERAl
                var sqlRows = `
                    select 
                        p5.prod_producto_id,
                        p5.prod_nombre,
                        p5.prod_descripcion,
                        p5.prod_prod_producto_padre_sku,
                        p5.prod_sku,
                        p5.prod_precio,
                        m2.mar_marca_id,
                        p5.prod_meta_titulo,
                        p5.prod_meta_descripcion,
                        m2.mar_nombre,
                        p5.prod_cmm_estatus_id,
                        cmm.cmm_valor,
                        c2.cat_cmm_estatus_id,
                        cmm2.cmm_valor as cat_cmm_valor,
                        c2.cat_nombre,
                        c2.cat_categoria_id,
                        c2.cat_nombre_tienda,
                        c2.cat_categoria_link,
                        pv.prv_nombre,
                        p5.prod_nombre_extranjero,
                        p5.prod_calificacion_promedio,
                        p5.prod_es_stock_inactivo,
                        p5.prod_tipo_precio_base,
                        prod_unidades_vendidas,
                        p5."createdAt" as "lanzamiento"
                `;

                //SQL que solo regresara el total del count
                var sqlRowsCount = `
                    select 
                        count(p5.prod_producto_id)
                `;

                //Se usara para concatenar mas codigo repetible
                var sqlFrom = `
                    from 
                        productos p5
                        left join categorias c2 on p5.prod_cat_categoria_id = c2.cat_categoria_id
                        left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                        left join marcas m2 on cast(p5.prod_codigo_marca as int) = m2.mar_marca_id
                        left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
                `;

                var sqlBusqueda = ``

                sqlBusqueda = `
                    where p5.prod_producto_id = `+constProductoPadre.prod_producto_id+`
                    and prod_prod_producto_padre_sku is null 
                `;

                //Variables que concatenan TODO
                var sqlFinalRows = sqlRows + sqlFrom + sqlBusqueda
                var sqlFinalRowsCount = sqlRowsCount + sqlFrom + sqlBusqueda 

                //Obtener Rows
                var rows = await sequelize.query(sqlFinalRows,
                {
                    type: sequelize.QueryTypes.SELECT 
                });

                //Obtener Count de las rows
                const constCount = await sequelize.query(sqlFinalRowsCount,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });

                //Se regresa el esquema parecido a las consultas de SEQUALIZE
                const mainConsultaProductos = {
                    count: parseInt(constCount[0].count),
                    rows
                }
            //FIN Obtener productos BASE para luego obtener mas cosas













            //LA VARIABLE rows CONTIENE TODOS LOS PRODUCTOS OBTENIDOS

            //Obtener hijos, Si vienen hijos asignar Lista de precio por hijo y lista de stock por hijo
            rows = await productosUtils.getHijosFromPadreOneChild(rows, constProductoHijo.prod_producto_id);
            
            // //Funcion exclusiva para detalle traer attributos 
            // rows = await productosUtils.setAttributesToChilds(rows);

            //Obtener si aplica backorder para los hijos
            rows = await productosUtils.setDiasResurtimientoIsBackOrder(rows);


            //Obtener promociones activa y traer la mejor por producto hijo
            rows = await productosUtils.getChildsPromotions(rows);




            // //Si la busqueda tiene un id de socio de negocio asignado concatenara un nuevo precio al producto
            // if(idSocioNegocio != null)
            // {
            //     rows = await productosUtils.setBasePricesForChildBySNPriceList(rows, idSocioNegocio);

            //     //Obtener y concatenar hijo con mejor promocion al producto padre
            //     rows = await productosUtils.setBestPromotionChildToFatherWithSNPriceList(rows);
            // }
            // else
            // {
            //     //Obtener y concatenar hijo con mejor promocion al producto padre
            //     rows = await productosUtils.setBestPromotionChildToFather(rows);
            // }


            //V4
            //Obtener descuento de "marca" dielsa (descuento por grupo listas)
            if(idSocioNegocio != null)
            {
                //Obtener promociones activa y traer la mejor por producto hijo
                rows = await productosUtils.getChildsSNDiscounts(rows, idSocioNegocio);
            }
            else
            {
                //Obtener promociones activa y traer la mejor por producto hijo
                rows = await productosUtils.getChildsNULLSNDiscounts(rows);
            }

            //Obtener la mejor promocion o descuento de sn grupo 
            rows = await productosUtils.setBasePriceForChildsWithPromotions(rows, idSocioNegocio);


            // //Set Dielsa promocion cuando promociones pcp son mejor
            // rows = await productosUtils.setDielsaPromotionsOverPromotions(rows, idSocioNegocio);

            //Pone las variables precioPromocionDielsaBool y DescuentoDielsaFijo que hacen referencia cuando una promocion es mayor al descuento de cliente
            rows = await productosUtils.setDiscountAmountOverPromotion(rows, idSocioNegocio);

            //Obtener y concatenar hijo con mejor promocion al producto padre
            rows = await productosUtils.setBestPromotionChildToFatherV2(rows);

            


            
            //Funcion exclusiva para detalle traer attributos 
            rows = await productosUtils.setAttributesToChilds(rows);



            //obtener stock detalle por hijo
            rows = await productosUtils.getChildsStocksDetalle(rows);
            
            
           




            res.status(200).send({
                message: 'Lista de productos',
                mainConsultaProductos
            })


        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },

    getProductoFatherDetalleV3OnlyAttributes: async (req, res, next) =>{
        try{
            //Variable en caso de que venga socio de negocio se obtendran precios de su lista de precios
            var idSocioNegocio

            if(req.body.idSocioNegocio)
            {
                idSocioNegocio = req.body.idSocioNegocio
            }
            else
            {
                idSocioNegocio = null
            }


            //Obtener productos BASE para luego obtener mas cosas
                //SQL GENERAl
                var sqlRows = `
                    select 
                        p5.prod_producto_id,
                        p5.prod_nombre,
                        p5.prod_descripcion,
                        p5.prod_prod_producto_padre_sku,
                        p5.prod_sku,
                        p5.prod_precio,
                        m2.mar_marca_id,
                        m2.mar_nombre,
                        p5.prod_cmm_estatus_id,
                        cmm.cmm_valor,
                        c2.cat_cmm_estatus_id,
                        cmm2.cmm_valor as cat_cmm_valor,
                        c2.cat_nombre,
                        pv.prv_nombre,
                        p5.prod_nombre_extranjero,
                        p5.prod_calificacion_promedio,
                        p5.prod_es_stock_inactivo,
                        p5.prod_tipo_precio_base,
                        prod_unidades_vendidas,
                        p5."createdAt" as "lanzamiento"
                `;

                //SQL que solo regresara el total del count
                var sqlRowsCount = `
                    select 
                        count(p5.prod_producto_id)
                `;

                //Se usara para concatenar mas codigo repetible
                var sqlFrom = `
                    from 
                        productos p5
                        left join categorias c2 on p5.prod_cat_categoria_id = c2.cat_categoria_id
                        left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                        left join marcas m2 on p5.prod_mar_marca_id = m2.mar_marca_id
                        left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
                `;

                var sqlBusqueda = ``

                sqlBusqueda = `
                    where p5.prod_producto_id = `+req.body.prod_producto_id+`
                    and prod_prod_producto_padre_sku is null 
                `;

                //Variables que concatenan TODO
                var sqlFinalRows = sqlRows + sqlFrom + sqlBusqueda
                var sqlFinalRowsCount = sqlRowsCount + sqlFrom + sqlBusqueda 

                //Obtener Rows
                var rows = await sequelize.query(sqlFinalRows,
                {
                    type: sequelize.QueryTypes.SELECT 
                });

                //Obtener Count de las rows
                const constCount = await sequelize.query(sqlFinalRowsCount,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });

                //Se regresa el esquema parecido a las consultas de SEQUALIZE
              
            //FIN Obtener productos BASE para luego obtener mas cosas













            //LA VARIABLE rows CONTIENE TODOS LOS PRODUCTOS OBTENIDOS

            //Obtener hijos, Si vienen hijos asignar Lista de precio por hijo y lista de stock por hijo
            rows = await productosUtils.getHijosAtributosFromPadre(rows);
            
            // //Funcion exclusiva para detalle traer attributos 
            // rows = await productosUtils.setAttributesToChilds(rows);

            //Obtener si aplica backorder para los hijos
            // rows = await productosUtils.setDiasResurtimientoIsBackOrder(rows);


            //Obtener promociones activa y traer la mejor por producto hijo
            // rows = await productosUtils.getChildsPromotions(rows);




            // //Si la busqueda tiene un id de socio de negocio asignado concatenara un nuevo precio al producto
            // if(idSocioNegocio != null)
            // {
            //     rows = await productosUtils.setBasePricesForChildBySNPriceList(rows, idSocioNegocio);

            //     //Obtener y concatenar hijo con mejor promocion al producto padre
            //     rows = await productosUtils.setBestPromotionChildToFatherWithSNPriceList(rows);
            // }
            // else
            // {
            //     //Obtener y concatenar hijo con mejor promocion al producto padre
            //     rows = await productosUtils.setBestPromotionChildToFather(rows);
            // }


            //V4
            //Obtener descuento de "marca" dielsa (descuento por grupo listas)
            // if(idSocioNegocio != null)
            // {
            //     //Obtener promociones activa y traer la mejor por producto hijo
            //     rows = await productosUtils.getChildsSNDiscounts(rows, idSocioNegocio);
            // }
            // else
            // {
            //     //Obtener promociones activa y traer la mejor por producto hijo
            //     rows = await productosUtils.getChildsNULLSNDiscounts(rows);
            // }

            //Obtener la mejor promocion o descuento de sn grupo 
            // rows = await productosUtils.setBasePriceForChildsWithPromotions(rows, idSocioNegocio);


            // //Set Dielsa promocion cuando promociones pcp son mejor
            // rows = await productosUtils.setDielsaPromotionsOverPromotions(rows, idSocioNegocio);

            //Pone las variables precioPromocionDielsaBool y DescuentoDielsaFijo que hacen referencia cuando una promocion es mayor al descuento de cliente
            // rows = await productosUtils.setDiscountAmountOverPromotion(rows, idSocioNegocio);

            //Obtener y concatenar hijo con mejor promocion al producto padre
            // rows = await productosUtils.setBestPromotionChildToFatherV2(rows);

            


            
            //Funcion exclusiva para detalle traer attributos 
            rows = await productosUtils.setAttributesToChilds(rows);



            //obtener stock detalle por hijo
            // rows = await productosUtils.getChildsStocksDetalle(rows);
            
            
            const mainConsultaProductos = {
                count: parseInt(constCount[0].count),
                rows
            }



            res.status(200).send({
                message: 'Lista de productos',
                mainConsultaProductos
            })


        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },










    //Version vieja (pone v2 pero es la antigua)
    frontGetProductoMainV3OnlyChildsV2: async (req, res, next) =>{
        try{

            //Obtener paginado
            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit

            //Condiciones de busqueda
            var searchBy = req.body.searchBy
            var ASCDESC = req.body.ASCDESC
            var orderByFinal = ''
            var searchCondition = req.body.palabraBuscar.toUpperCase()

            //Variable en caso de que venga socio de negocio se obtendran precios de su lista de precios
            var idSocioNegocio

            if(req.body.idSocioNegocio)
            {
                idSocioNegocio = req.body.idSocioNegocio
            }
            else
            {
                idSocioNegocio = null
            }


            //Tipo de Order By
            var ordenamientoBy = req.body.orderBy
            switch(ordenamientoBy)
            {
                case null: 
                    orderByFinal = `order by prioridad `
                    ordenamientoBy = "normal"
                    break;

                case '': 
                    orderByFinal = `order by prioridad `
                    ordenamientoBy = "normal"
                    break;

                case "precio":
                    orderByFinal = `order by prod_precio `
                    ordenamientoBy = "prod_precio"
                    break; 

                case "mas vendido":
                    orderByFinal = `order by prod_unidades_vendidas `
                    ordenamientoBy = "mas vendido"
                    break;

                case "mejores valorados":
                    orderByFinal = `order by prod_calificacion_promedio `
                    ordenamientoBy = "prod_calificacion_promedio"
                    break;

                case "az-za":
                    orderByFinal = `order by prod_nombre `
                    ordenamientoBy = "prod_nombre"
                    break;

                case "fecha lanzamienta":
                    orderByFinal = `order by lanzamiento `
                    ordenamientoBy = "lanzamiento"
                    break;
            }

            orderByFinal = orderByFinal + ' ' + ASCDESC




            //Obtener productos BASE para luego obtener mas cosas

                //SQL GENERAl
                // var sqlRows = `
                //     select 
                //         p5.prod_producto_id,
                //         p5.prod_nombre,
                //         p5.prod_descripcion,
                //         p5.prod_sku,
                //         p5.prod_precio,
                //         m2.mar_marca_id,
                //         m2.mar_nombre,
                //         p5.prod_cmm_estatus_id,
                //         cmm.cmm_valor,
                //         c2.cat_cmm_estatus_id,
                //         cmm2.cmm_valor as cat_cmm_valor,
                //         c2.cat_nombre,
                //         pv.prv_nombre,
                //         p5.prod_nombre_extranjero,
                //         p5.prod_calificacion_promedio,
                //         p5.prod_es_stock_inactivo,
                //         p5.prod_tipo_precio_base,
                //         prod_unidades_vendidas,
                //         p5."createdAt" as "lanzamiento"
                // `;
                var sqlRows = `
                    select 
                        p5.*,
                        m2.mar_marca_id,
                        m2.mar_nombre,
                        cmm.cmm_valor,
                        c2.cat_cmm_estatus_id,
                        cmm2.cmm_valor as cat_cmm_valor,
                        c2.cat_nombre,
                        pv.prv_nombre,
                        prod_unidades_vendidas,
                        p5."createdAt" as "lanzamiento"
                `;

                //SQL que solo regresara el total del count
                var sqlRowsCount = `
                    select 
                        count(p5.prod_producto_id)
                `;

                //Se usara para concatenar mas codigo repetible
                var sqlFrom = `
                    from 
                        productos p5
                        left join categorias c2 on cast(p5.prod_codigo_grupo as int) = c2.cat_categoria_id
                        left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                        left join marcas m2 on cast(p5.prod_codigo_marca as int) = m2.mar_marca_id
                        left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
                `;

                var sqlBusqueda = ``
                var sqlLimiteAndPage = ` LIMIT `+varlimit+` OFFSET `+varoffset


                
                sqlBusqueda = `
                    where p5.prod_producto_id in 
                    (
                        select 
                            p1.prod_producto_id
                        from 
                        (
                            --Search Child by Name
                            (
                                
                                select
                                    p1.prod_producto_id,
                                    case when prod_nombre like '%`+searchCondition+`%'  then 0.3 else 0.4 end as prioridad,
                                    p1.prod_sku,
                                    p1.prod_prod_producto_padre_sku 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    prod_nombre like '%`+searchCondition+`%'  
                                    and prod_cmm_estatus_id = 1000016 
                                    and prod_prod_producto_padre_sku is not null 
                                    and prod_volumen != 0
                                    and prod_peso != 0
                                    and prod_mostrar_en_tienda = true
                            )
                            --Search Child by Description
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when prod_descripcion like '%`+searchCondition+`%'  then 1.3 else 1.4 end as prioridad,
                                    p1.prod_sku,
                                    p1.prod_prod_producto_padre_sku 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    prod_descripcion like '%`+searchCondition+`%'  
                                    and prod_cmm_estatus_id = 1000016 
                                    and prod_prod_producto_padre_sku is not null 
                                    and prod_volumen != 0
                                    and prod_peso != 0
                                    and prod_mostrar_en_tienda = true
                            )
                            --Search Child by Categoria
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when c2.cat_nombre like '%`+searchCondition+`%'  then 1.6 else 1.7 end as prioridad,
                                    p1.prod_sku,
                                    p1.prod_prod_producto_padre_sku 
                                from 
                                    productos p1 
                                    left join categorias c2 on cast (p1.prod_codigo_grupo as int) = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    c2.cat_nombre like '%`+searchCondition+`%'  
                                    and prod_cmm_estatus_id = 1000016 
                                    and prod_prod_producto_padre_sku is not null 
                                    and prod_volumen != 0
                                    and prod_peso != 0
                                    and prod_mostrar_en_tienda = true
                            )
                            --Search Child by Marca
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when m2.mar_nombre like '%`+searchCondition+`%'  then 1.8 else 1.9 end as prioridad,
                                    p1.prod_sku,
                                    p1.prod_prod_producto_padre_sku 
                                from 
                                    productos p1 
                                    left join categorias c2 on cast (p1.prod_codigo_grupo as int) = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on cast (p1.prod_codigo_marca as int) = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    m2.mar_nombre like '%`+searchCondition+`%'  
                                    and prod_cmm_estatus_id = 1000016 
                                    and prod_prod_producto_padre_sku is not null 
                                    and prod_volumen != 0
                                    and prod_peso != 0
                                    and prod_mostrar_en_tienda = true
                            )
                            --Search Child by Marca abreviatura
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when m2.mar_abreviatura like '%`+searchCondition+`%'  then 2 else 2.1 end as prioridad,
                                    p1.prod_sku,
                                    p1.prod_prod_producto_padre_sku 
                                from 
                                    productos p1 
                                    left join categorias c2 on cast (p1.prod_codigo_grupo as int) = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on cast (p1.prod_codigo_marca as int) = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    m2.mar_abreviatura like '%`+searchCondition+`%'  
                                    and prod_cmm_estatus_id = 1000016 
                                    and prod_prod_producto_padre_sku is not null 
                                    and prod_volumen != 0
                                    and prod_peso != 0
                                    and prod_mostrar_en_tienda = true
                            )
                            --Search Child by Foreing Name
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when prod_nombre_extranjero like '%`+searchCondition+`%'  then 2.3 else 2.4 end as prioridad,
                                    p1.prod_sku,
                                    p1.prod_prod_producto_padre_sku 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    prod_nombre_extranjero like '%`+searchCondition+`%'  
                                    and prod_cmm_estatus_id = 1000016 
                                    and prod_prod_producto_padre_sku is not null 
                                    and prod_volumen != 0
                                    and prod_peso != 0
                                    and prod_mostrar_en_tienda = true
                            )
                            --Search Child by SKU
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when p1.prod_sku like '%`+searchCondition+`%'  then 2.7 else 2.8 end as prioridad,
                                    p1.prod_sku,
                                    p1.prod_prod_producto_padre_sku 
                                from 
                                    productos p1 
                                    left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    p1.prod_sku like '%`+searchCondition+`%' 
                                    and prod_cmm_estatus_id = 1000016 
                                    and prod_prod_producto_padre_sku is not null 
                                    and prod_volumen != 0
                                    and prod_peso != 0
                                    and prod_mostrar_en_tienda = true
                            )
                        )  as p1 
                    ) 
                    `;
                

                //Variables que concatenan TODO
                var sqlFinalRows = sqlRows + sqlFrom + sqlBusqueda + orderByFinal + sqlLimiteAndPage
                var sqlFinalRowsCount = sqlRowsCount + sqlFrom + sqlBusqueda 


                

                //Obtener Rows
                var rows = await sequelize.query(sqlFinalRows,
                {
                    type: sequelize.QueryTypes.SELECT 
                });

               

                //Obtener Count de las rows
                const constCount = await sequelize.query(sqlFinalRowsCount,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });


                var numPaginas = Math.ceil(parseInt(constCount[0].count)/req.body.limite);
               
                if( parseInt(req.body.pagina) == (numPaginas-1)){
                    var sqlFinalRows = sqlRows + sqlFrom + sqlBusqueda + orderByFinal 
                  
                    //Obtener Rows
                     rows = await sequelize.query(sqlFinalRows,
                    {
                        type: sequelize.QueryTypes.SELECT 
                    });

                }
                //Se regresa el esquema parecido a las consultas de SEQUALIZE
              
            //FIN Obtener productos BASE para luego obtener mas cosas













            //LA VARIABLE rows CONTIENE TODOS LOS PRODUCTOS OBTENIDOS

            // //Obtener hijos, Si vienen hijos asignar Lista de precio por hijo y lista de stock por hijo
            // rows = await productosUtils.getHijosFromPadre(rows);

            //Obtener si aplica backorder para los hijos
            rows = await productosUtils.setImagenesOnlyChilds(rows);

            //Obtener si aplica backorder para los hijos
            rows = await productosUtils.setDiasResurtimientoIsBackOrderOnlyChilds(rows);

            // //Obtener promociones activa y traer la mejor por producto hijo
            rows = await productosUtils.getChildsPromotionsOnlyChilds(rows);

            //Obtener descuento de "marca" dielsa (descuento por grupo listas)
            if(idSocioNegocio != null)
            {
                //Obtener promociones activa y traer la mejor por producto hijo
                rows = await productosUtils.getChildsSNDiscountsOnlyChilds(rows, idSocioNegocio);
            }
            else
            {
                //Obtener promociones activa y traer la mejor por producto hijo
                rows = await productosUtils.getChildsNULLSNDiscountsOnlyChilds(rows);
            }

            //Obtener la mejor promocion o descuento de sn grupo 
            rows = await productosUtils.setBasePriceForChildsWithPromotionsOnlyChilds(rows, idSocioNegocio);

            //Pone las variables precioPromocionDielsaBool y DescuentoDielsaFijo que hacen referencia cuando una promocion es mayor al descuento de cliente
            rows = await productosUtils.setDiscountAmountOverPromotionOnlyChilds(rows, idSocioNegocio);

            // //Obtener y concatenar hijo con mejor promocion al producto padre
            // rows = await productosUtils.setBestPromotionChildToFatherV2(rows);

            //obtener stock detalle por hijo
            rows = await productosUtils.getChildsStocksDetalleOnlyChilds(rows);

            //concatenar producto padre ID a cada hijo
            rows = await productosUtils.getChildsFathersIDOnlyChilds(rows);

            if(parseInt(req.body.pagina) == (numPaginas-1)  && constCount[0].count != 0  && parseInt(req.body.pagina) !=0 ){  
                rows = await productosUtils.setFiltrarProductsFinImagen(rows);
                }else if( parseInt(req.body.pagina) < (numPaginas-1)  && constCount[0].count != 0 ){     
                rows = await productosUtils.setFiltrarProductsSinImagen(rows);
                }
            

            const mainConsultaProductos = {
                count: parseInt(constCount[0].count),
                rows
            }

            res.status(200).send({
                message: 'Lista de productos',
                mainConsultaProductos
            })

        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },

    //GEt
    frontGetProductoMainV3OnlyChilds: async (req, res, next) =>{
        try{

            //Obtener paginado
            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit

            //Condiciones de busqueda
            var searchBy = req.body.searchBy
            var ASCDESC = req.body.ASCDESC
            var orderByFinal = ''
            var searchCondition = req.body.palabraBuscar.toUpperCase()
            searchCondition = searchCondition.trim()


            var searchConditionSQL = searchCondition.replace(/ /g, " & ")
            var searchConditionSQLDinamico = searchCondition.replace(/ /g, " | ")


            //Variable en caso de que venga socio de negocio se obtendran precios de su lista de precios
            var idSocioNegocio

            if(req.body.idSocioNegocio)
            {
                idSocioNegocio = req.body.idSocioNegocio
            }
            else
            {
                idSocioNegocio = null
            }


            //Tipo de Order By
            var ordenamientoBy = req.body.orderBy
            switch(ordenamientoBy)
            {
                case null: 
                    orderByFinal = `order by prioridad `
                    ordenamientoBy = "normal"
                    break;

                case '': 
                    orderByFinal = `order by prioridad `
                    ordenamientoBy = "normal"
                    break;

                case "precio":
                    orderByFinal = `order by prod_precio `
                    ordenamientoBy = "prod_precio"
                    break; 

                case "mas vendido":
                    orderByFinal = `order by prod_unidades_vendidas `
                    ordenamientoBy = "mas vendido"
                    break;

                case "mejores valorados":
                    orderByFinal = `order by prod_calificacion_promedio `
                    ordenamientoBy = "prod_calificacion_promedio"
                    break;

                case "az-za":
                    orderByFinal = `order by prod_nombre `
                    ordenamientoBy = "prod_nombre"
                    break;

                case "fecha lanzamienta":
                    orderByFinal = `order by lanzamiento `
                    ordenamientoBy = "lanzamiento"
                    break;

              case "stock":
                    orderByFinal = `order by prod_total_stock desc, prod_dias_resurtimiento desc `
                    ordenamientoBy = "stock"
                    break;  
            }

            if(ordenamientoBy == "stock")
            {
                orderByFinal = orderByFinal + ' '
            }
            else
            {
                orderByFinal = orderByFinal + ' ' + ASCDESC
            }
            




            //Obtener productos BASE para luego obtener mas cosas
                var sqlRows = `
                    select 
                        p5.*,
                        m2.mar_marca_id,
                        m2.mar_nombre,
                        cmm.cmm_valor,
                        c2.cat_cmm_estatus_id,
                        cmm2.cmm_valor as cat_cmm_valor,
                        c2.cat_nombre,
                        pv.prv_nombre,
                        prod_unidades_vendidas,
                        p5."createdAt" as "lanzamiento"
                `;

                //SQL que solo regresara el total del count
                var sqlRowsCount = `
                    select 
                        count(p5.prod_producto_id)
                `;

                //Se usara para concatenar mas codigo repetible
                var sqlFrom = `
                    from 
                        productos p5
                        left join categorias c2 on cast(p5.prod_codigo_grupo as int) = c2.cat_categoria_id
                        left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                        left join marcas m2 on cast(p5.prod_codigo_marca as int) = m2.mar_marca_id
                        left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
                `;

                var sqlBusqueda = ``
                var sqlBusquedaDinamico = ``
                var sqlLimiteAndPage = ` LIMIT `+varlimit+` OFFSET `+varoffset


                
                sqlBusqueda = `
                    where p5.prod_producto_id in 
                    (
                        select 
                            p1.prod_producto_id
                        from 
                        (
                            --Search Child by Name, Descripcion, Nombre Foraneo, SKU
                            (
                                
                                select
                                    p1.prod_producto_id,
                                    case when prod_nombre != '' then 0.3 else 0.4 end as prioridad,
                                    p1.prod_sku,
                                    p1.prod_prod_producto_padre_sku 
                                from 
                                    productos p1 
                                    left join categorias c2 on cast (p1.prod_codigo_grupo as int) = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    p1.prod_nombre like '`+searchCondition+`%' 
                                    or p1.prod_nombre like '%`+searchCondition+`%'
                                    and prod_cmm_estatus_id = 1000016 
                                    and prod_prod_producto_padre_sku is not null 
                                    and prod_mostrar_en_tienda = true
                                    and c2.cat_cmm_estatus_id = 1000010
                            )
                            --Search Child by Categoria
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when LOWER(c2.cat_nombre) like LOWER('`+searchCondition+`%')  then 1.6 else 1.7 end as prioridad,
                                    p1.prod_sku,
                                    p1.prod_prod_producto_padre_sku 
                                from 
                                    productos p1 
                                    left join categorias c2 on cast (p1.prod_codigo_grupo as int) = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    LOWER(c2.cat_nombre) like LOWER('`+searchCondition+`%')  
                                    and prod_cmm_estatus_id = 1000016 
                                    and prod_prod_producto_padre_sku is not null 
                                    and prod_mostrar_en_tienda = true
                                    and c2.cat_cmm_estatus_id = 1000010
                            )
                            --Search Child by Marca
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when m2.mar_nombre like '`+searchCondition+`%'  then 1.8 else 1.9 end as prioridad,
                                    p1.prod_sku,
                                    p1.prod_prod_producto_padre_sku 
                                from 
                                    productos p1 
                                    left join categorias c2 on cast (p1.prod_codigo_grupo as int) = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on cast (p1.prod_codigo_marca as int) = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    m2.mar_nombre like '`+searchCondition+`%'  
                                    and prod_cmm_estatus_id = 1000016 
                                    and prod_prod_producto_padre_sku is not null 
                                    and prod_mostrar_en_tienda = true
                                    and c2.cat_cmm_estatus_id = 1000010
                            )
                            --Search Child by Marca abreviatura
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when m2.mar_abreviatura like '`+searchCondition+`%'  then 2 else 2.1 end as prioridad,
                                    p1.prod_sku,
                                    p1.prod_prod_producto_padre_sku 
                                from 
                                    productos p1 
                                    left join categorias c2 on cast (p1.prod_codigo_grupo as int) = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on cast (p1.prod_codigo_marca as int) = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    m2.mar_abreviatura like '`+searchCondition+`%'  
                                    and prod_cmm_estatus_id = 1000016 
                                    and prod_prod_producto_padre_sku is not null 
                                    and prod_mostrar_en_tienda = true
                                    and c2.cat_cmm_estatus_id = 1000010
                            )
                        )  as p1 
                    ) 
                    `;
                
                sqlBusquedaDinamico = `
                    where p5.prod_producto_id in 
                    (
                        select 
                            p1.prod_producto_id
                        from 
                        (
                            --Search Child by Name, Descripcion, Nombre Foraneo, SKU
                            (
                                
                                select
                                    p1.prod_producto_id,
                                    case when prod_nombre_extranjero != '' then 0.3 else 0.4 end as prioridad,
                                    p1.prod_sku,
                                    p1.prod_prod_producto_padre_sku 
                                from 
                                    productos p1 
                                    left join categorias c2 on cast (p1.prod_codigo_grupo as int) = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    p1.prod_nombre_extranjero like '`+searchCondition+`%'
                                    and prod_cmm_estatus_id = 1000016 
                                    and prod_prod_producto_padre_sku is not null 
                                    and prod_mostrar_en_tienda = true
                                    and c2.cat_cmm_estatus_id = 1000010
                            )
                            --Search Child by Categoria
                            union
                            (
                                
                                select
                                    p1.prod_producto_id,
                                    case when prod_nombre != '' then 0.3 else 0.4 end as prioridad,
                                    p1.prod_sku,
                                    p1.prod_prod_producto_padre_sku 
                                from 
                                    productos p1 
                                    left join categorias c2 on cast (p1.prod_codigo_grupo as int) = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    p1.prod_nombre like '`+searchCondition+`%'
                                    and prod_cmm_estatus_id = 1000016 
                                    and prod_prod_producto_padre_sku is not null 
                                    and prod_mostrar_en_tienda = true
                                    and c2.cat_cmm_estatus_id = 1000010
                            )
                            --Search Child by description
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when prod_descripcion != '' then 0.3 else 0.4 end as prioridad,
                                    p1.prod_sku,
                                    p1.prod_prod_producto_padre_sku 
                                from 
                                    productos p1 
                                    left join categorias c2 on cast (p1.prod_codigo_grupo as int) = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    (LOWER(p1.prod_descripcion) like LOWER('`+searchCondition+`%')
                                    OR LOWER(p1.prod_descripcion) like LOWER('%`+searchCondition+`%'))
                                    and prod_cmm_estatus_id = 1000016 
                                    and prod_prod_producto_padre_sku is not null 
                                    and prod_mostrar_en_tienda = true
                                    and c2.cat_cmm_estatus_id = 1000010
                            )
                            --Search Child by Categoria
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when LOWER(c2.cat_nombre) like LOWER('`+searchCondition+`%')  then 1.6 else 1.7 end as prioridad,
                                    p1.prod_sku,
                                    p1.prod_prod_producto_padre_sku 
                                from 
                                    productos p1 
                                    left join categorias c2 on cast (p1.prod_codigo_grupo as int) = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    LOWER(c2.cat_nombre) like LOWER('`+searchCondition+`%')  
                                    and prod_cmm_estatus_id = 1000016 
                                    and prod_prod_producto_padre_sku is not null 
                                    and prod_mostrar_en_tienda = true
                                    and c2.cat_cmm_estatus_id = 1000010
                            )
                            --Search Child by Marca
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when m2.mar_nombre like '`+searchCondition+`%'  then 1.8 else 1.9 end as prioridad,
                                    p1.prod_sku,
                                    p1.prod_prod_producto_padre_sku 
                                from 
                                    productos p1 
                                    left join categorias c2 on cast (p1.prod_codigo_grupo as int) = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on cast (p1.prod_codigo_marca as int) = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    m2.mar_nombre like '`+searchCondition+`%'  
                                    and prod_cmm_estatus_id = 1000016 
                                    and prod_prod_producto_padre_sku is not null 
                                    and prod_mostrar_en_tienda = true
                                    and c2.cat_cmm_estatus_id = 1000010
                            )
                            --Search Child by Marca abreviatura
                            union 
                            (
                                select
                                    p1.prod_producto_id,
                                    case when m2.mar_abreviatura like '`+searchCondition+`%'  then 2 else 2.1 end as prioridad,
                                    p1.prod_sku,
                                    p1.prod_prod_producto_padre_sku 
                                from 
                                    productos p1 
                                    left join categorias c2 on cast (p1.prod_codigo_grupo as int) = c2.cat_categoria_id
                                    left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                    left join marcas m2 on cast (p1.prod_codigo_marca as int) = m2.mar_marca_id 
                                    left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                where 
                                    m2.mar_abreviatura like '`+searchCondition+`%'  
                                    and prod_cmm_estatus_id = 1000016 
                                    and prod_prod_producto_padre_sku is not null 
                                    and prod_mostrar_en_tienda = true
                                    and c2.cat_cmm_estatus_id = 1000010
                            ) 
                        )  as p1 
                    ) 
                    `;
                

                //Variables que concatenan TODO
                var sqlFinalRows = sqlRows + sqlFrom + sqlBusqueda + orderByFinal + sqlLimiteAndPage
                var sqlFinalRowsCount = sqlRowsCount + sqlFrom + sqlBusqueda 
  
                //Obtener Rows
                var rows = await sequelize.query(sqlFinalRows,
                {
                    type: sequelize.QueryTypes.SELECT 
                });

            

               // console.log('pagina res', rows2)

                //Obtener Count de las rows
                var constCount = await sequelize.query(sqlFinalRowsCount,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });

                var numPaginas = Math.ceil(parseInt(constCount[0].count)/req.body.limite);
               
                if( parseInt(req.body.pagina) == (numPaginas-1)){
                    var sqlFinalRows = sqlRows + sqlFrom + sqlBusqueda + orderByFinal 
                  
                    //Obtener Rows
                     rows = await sequelize.query(sqlFinalRows,
                    {
                        type: sequelize.QueryTypes.SELECT 
                    });

                }


                if(constCount[0].count == 0)
                {
                    sqlFinalRows = sqlRows + sqlFrom + sqlBusquedaDinamico + orderByFinal + sqlLimiteAndPage
                    sqlFinalRowsCount = sqlRowsCount + sqlFrom + sqlBusquedaDinamico 

                    rows = await sequelize.query(sqlFinalRows,
                    {
                        type: sequelize.QueryTypes.SELECT 
                    });

                    constCount = await sequelize.query(sqlFinalRowsCount,
                    { 
                        type: sequelize.QueryTypes.SELECT 
                    });
                }







                //Se regresa el esquema parecido a las consultas de SEQUALIZE
             
            //FIN Obtener productos BASE para luego obtener mas cosas

            //LA VARIABLE rows CONTIENE TODOS LOS PRODUCTOS OBTENIDOS

            //Obtener si aplica backorder para los hijos
            rows = await productosUtils.setImagenesOnlyChilds(rows);

            //Obtener si aplica backorder para los hijos
            rows = await productosUtils.setDiasResurtimientoIsBackOrderOnlyChilds(rows);

            // //Obtener promociones activa y traer la mejor por producto hijo
            rows = await productosUtils.getChildsPromotionsOnlyChilds(rows);

            //Obtener descuento de "marca" dielsa (descuento por grupo listas)
            if(idSocioNegocio != null)
            {
                //Obtener promociones activa y traer la mejor por producto hijo
                rows = await productosUtils.getChildsSNDiscountsOnlyChilds(rows, idSocioNegocio);
            }
            else
            {
                //Obtener promociones activa y traer la mejor por producto hijo
                rows = await productosUtils.getChildsNULLSNDiscountsOnlyChilds(rows);
            }

            //Obtener la mejor promocion o descuento de sn grupo 
            rows = await productosUtils.setBasePriceForChildsWithPromotionsOnlyChilds(rows, idSocioNegocio);

            //Pone las variables precioPromocionDielsaBool y DescuentoDielsaFijo que hacen referencia cuando una promocion es mayor al descuento de cliente
            rows = await productosUtils.setDiscountAmountOverPromotionOnlyChilds(rows, idSocioNegocio);

            // //Obtener y concatenar hijo con mejor promocion al producto padre
            // rows = await productosUtils.setBestPromotionChildToFatherV2(rows);

            //obtener stock detalle por hijo
            rows = await productosUtils.getChildsStocksDetalleOnlyChilds(rows);

            //concatenar producto padre ID a cada hijo
            rows = await productosUtils.getChildsFathersIDOnlyChilds(rows);

            //setteara el precio final y base en USD en un nuevo campo
            rows = await productosUtils.setOnlyChildsUSDChange(rows);
            
            // Obtener el stock de los productos por almacen
            rows = await productosUtils.getStockByStore(rows);

            // Obtener el precio del dollar y se hace la conversión
            rows = await productosUtils.getConversionUSD(rows);
              
           if(parseInt(req.body.pagina) == (numPaginas-1)  && constCount[0].count != 0  && parseInt(req.body.pagina) !=0 ){  
                rows = await productosUtils.setFiltrarProductsFinImagen(rows);
                }else if( parseInt(req.body.pagina) < (numPaginas-1)  && constCount[0].count != 0){     
                rows = await productosUtils.setFiltrarProductsSinImagen(rows);
                }
            const mainConsultaProductos = {
                count: parseInt(constCount[0].count),
                rows
            }

            res.status(200).send({
                message: 'Lista de productos',
                mainConsultaProductos
            })

        }catch(e){
            console.log('Error: ', e);
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            // next(e);
        }
    },




    frontGetProductoAdvancedSearchV3OnlyChilds: async (req, res, next) =>{
        try{
            //Condiciones de busqueda
            var ASCDESC = req.body.ASCDESC
            var orderByFinal = ''
            var prod_nombre = req.body.prod_nombre.toUpperCase()
            var prod_sku = req.body.prod_sku.toUpperCase()
            var prod_nombre_extranjero = req.body.prod_nombre_extranjero.toUpperCase()
            var prod_descripcion = req.body.prod_descripcion.toUpperCase()
            var mar_nombre = req.body.mar_nombre.toUpperCase()
            var cat_nombre = req.body.cat_nombre.toUpperCase()

            // let dataWhere = {
            //     where: {
            //         prod_mostrar_en_tienda: true,
            //     },
            //     include: [
            //         {
            //             model: models.Categoria,
            //         }
            //     ],
            //     limit: 2
            // }

            // dataWhere.where[Op.and] = [];

            // if(req.body.prod_descripcion != '') {
            //     dataWhere.where[Op.and].push({
            //         prod_descripcion: {
            //             [Op.iLike]: `%${req.body.prod_descripcion}%`
            //         }
            //     });
            // }

            // if(req.body.prod_sku) {
            //     dataWhere.where[Op.and].push({
            //         prod_sku: {
            //             [Op.iLike]: `%${req.body.prod_sku}%`
            //         }
            //     });
            // }

            // console.log('dataWhere =====> ', dataWhere);

            // const newDataProduct = await models.Producto.findAll(dataWhere);
            // console.log('newDataProduct =================>');
            // console.log(newDataProduct.map((item) => {
            //     return item.dataValues;
            // }));

            // res.status(200).send({
            //     message: 'Lista de productos',
            //     row: {
            //         count: newDataProduct.length,
            //         rows: newDataProduct
            //     }
            // })
            // return newDataProduct;

            //Variable en caso de que venga socio de negocio se obtendran precios de su lista de precios
            var idSocioNegocio

            if(req.body.idSocioNegocio)
            {
                idSocioNegocio = req.body.idSocioNegocio
            }
            else
            {
                idSocioNegocio = null
            }

            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit

            //Tipo de Order By
            var ordenamientoBy = req.body.orderBy
            switch(ordenamientoBy)
            {
                case null: 
                    orderByFinal = `order by prioridad `
                    ordenamientoBy = "normal"
                    break;

                case '': 
                    orderByFinal = `order by prioridad `
                    ordenamientoBy = "normal"
                    break;

                case "precio":
                    orderByFinal = `order by prod_precio `
                    ordenamientoBy = "prod_precio"
                    break; 

                case "mas vendido":
                    orderByFinal = `order by prod_unidades_vendidas `
                    ordenamientoBy = "mas vendido"
                    break;

                case "mejores valorados":
                    orderByFinal = `order by prod_calificacion_promedio `
                    ordenamientoBy = "prod_calificacion_promedio"
                    break;

                case "az-za":
                    orderByFinal = `order by prod_nombre `
                    ordenamientoBy = "prod_nombre"
                    break;

                case "fecha lanzamienta":
                    orderByFinal = `order by lanzamiento `
                    ordenamientoBy = "lanzamiento"
                    break;
            }

            orderByFinal = orderByFinal + ' ' + ASCDESC


            //SQL GENERAl
            var sqlRows = `
                select 
                    p5.*,
                    m2.mar_marca_id,
                    m2.mar_nombre,
                    cmm.cmm_valor,
                    c2.cat_cmm_estatus_id,
                    cmm2.cmm_valor as cat_cmm_valor,
                    c2.cat_nombre,
                    pv.prv_nombre,
                    prod_unidades_vendidas,
                    p5."createdAt" as "lanzamiento"
            `;

            //SQL que solo regresara el total del count
            var sqlRowsCount = `
                select 
                    count(p5.prod_producto_id)
            `;

            //Se usara para concatenar mas codigo repetible
            var sqlFrom = `
                from 
                    productos p5
                    left join categorias c2 on cast(p5.prod_codigo_grupo as int) = c2.cat_categoria_id
                    left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                    left join marcas m2 on cast(p5.prod_codigo_marca as int) = m2.mar_marca_id
                    left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
            `;

            var sqlBusqueda = ``
            var sqlLimiteAndPage = ` LIMIT `+varlimit+` OFFSET `+varoffset


            //Establecer la base de busqueda donde traiga todos los padres y prevenir error de los intersect haciendo que traiga a todos los padres y lo compare contra esos
            sqlBusqueda += `where p5.prod_producto_id in
                            (
                                select
                                    p1.prod_producto_id
                                from
                                (
                                    --Select null para no tener problemas con los intercect
                                    (
                                        select
                                            p1.prod_producto_id,
                                            p1.prod_sku,
                                            p1.prod_prod_producto_padre_sku
                                        from
                                            productos p1
                                        where
                                            prod_cmm_estatus_id = 1000016
                                            and prod_prod_producto_padre_sku is not null
                                    )
            `

                                

            if(req.body.prod_nombre != '')
            {
                sqlBusqueda += `
                                    --Search Product By Name 
                                    intersect 
                                    (
                                        select
                                            p1.prod_producto_id,
                                            p1.prod_sku,
                                            p1.prod_prod_producto_padre_sku 
                                        from 
                                            productos p1 
                                            left join categorias c2 on cast (p1.prod_codigo_grupo as int) = c2.cat_categoria_id
                                            left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                            left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                            left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                        where 
                                            -- to_tsvector(p1.prod_nombre)
                                            -- @@ to_tsquery('`+req.body.prod_nombre+`')
                                            p1.prod_nombre like '%`+req.body.prod_nombre+`%'
                                            and prod_cmm_estatus_id = 1000016 
                                            and prod_prod_producto_padre_sku is not null 
                                            and prod_mostrar_en_tienda = true
                                            and c2.cat_cmm_estatus_id = 1000010
                                    )
                                `
            }

            if(req.body.prod_sku != '')
            {
                sqlBusqueda += `
                                    --Search Product By Name SKU
                                    intersect 
                                    (
                                        select
                                            p1.prod_producto_id,
                                            p1.prod_sku,
                                            p1.prod_prod_producto_padre_sku 
                                        from 
                                            productos p1 
                                            left join categorias c2 on cast (p1.prod_codigo_grupo as int) = c2.cat_categoria_id
                                            left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                            left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                            left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                        where 
                                            to_tsvector(p1.prod_sku)
                                            @@ to_tsquery('`+req.body.prod_sku+`')
                                            and prod_cmm_estatus_id = 1000016 
                                            and prod_prod_producto_padre_sku is not null 
                                            and prod_mostrar_en_tienda = true
                                            and c2.cat_cmm_estatus_id = 1000010
                                    )






                `
            }

            if(req.body.prod_nombre_extranjero != '')
            {
                sqlBusqueda += `
                                    --Search Product By Foreing Name
                                    intersect 
                                    (
                                        select
                                            p1.prod_producto_id,
                                            p1.prod_sku,
                                            p1.prod_prod_producto_padre_sku 
                                        from 
                                            productos p1 
                                            left join categorias c2 on cast (p1.prod_codigo_grupo as int) = c2.cat_categoria_id
                                            left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                            left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                            left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                        where 
                                            to_tsvector(p1.prod_nombre_extranjero)
                                            @@ to_tsquery('`+req.body.prod_nombre_extranjero+`')
                                            and prod_cmm_estatus_id = 1000016 
                                            and prod_prod_producto_padre_sku is not null 
                                            and prod_mostrar_en_tienda = true
                                            and c2.cat_cmm_estatus_id = 1000010
                                    )   
                `
            }

            if(req.body.prod_descripcion != '')
            {
                sqlBusqueda += `
                                    --Search Product By Description
                                    intersect 
                                    (
                                        select
                                            p1.prod_producto_id,
                                            p1.prod_sku,
                                            p1.prod_prod_producto_padre_sku 
                                        from 
                                            productos p1 
                                            left join categorias c2 on cast (p1.prod_codigo_grupo as int) = c2.cat_categoria_id
                                            left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                            left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                            left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                        where 
                                            p1.prod_descripcion ILIKE '%`+req.body.prod_descripcion+`%'
                                            and prod_cmm_estatus_id = 1000016 
                                            and prod_prod_producto_padre_sku is not null 
                                            and prod_mostrar_en_tienda = true
                                            and c2.cat_cmm_estatus_id = 1000010
                                    )
                `
            }

            if(req.body.mar_nombre != '')
            {
                sqlBusqueda += `
                                    --Search Product By Marca (Hijos no tienen Marca)
                                    intersect 
                                    (
                                        select
                                            p1.prod_producto_id,
                                            p1.prod_sku,
                                            p1.prod_prod_producto_padre_sku 
                                        from 
                                            productos p1 
                                            left join categorias c2 on cast (p1.prod_codigo_grupo as int) = c2.cat_categoria_id
                                            left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                            left join marcas m2 on cast (p1.prod_codigo_marca as int) = m2.mar_marca_id 
                                            left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                        where 
                                            m2.mar_nombre ILIKE '%`+req.body.mar_nombre+`%'  
                                            and prod_cmm_estatus_id = 1000016 
                                            and prod_prod_producto_padre_sku is not null 
                                            and prod_mostrar_en_tienda = true
                                            and c2.cat_cmm_estatus_id = 1000010
                                    )
                ` 
            }

            if(req.body.cat_nombre != '')
            {
                sqlBusqueda += `
                                    --Search Product By Categoria (Hijos no tienen categoria)
                                    intersect 
                                    (
                                        select
                                            p1.prod_producto_id,
                                            p1.prod_sku,
                                            p1.prod_prod_producto_padre_sku 
                                        from 
                                            productos p1 
                                            left join categorias c2 on cast (p1.prod_codigo_grupo as int) = c2.cat_categoria_id
                                            left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                            left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                            left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                        where 
                                            c2.cat_nombre ILIKE '%`+req.body.cat_nombre+`%'  
                                            and prod_cmm_estatus_id = 1000016 
                                            and prod_prod_producto_padre_sku is not null 
                                            and prod_mostrar_en_tienda = true
                                            and c2.cat_cmm_estatus_id = 1000010
                                    )
                `
            }


 
            //Final de la arquitectura SQL para la busqueda
            sqlBusqueda += `
                                )  as p1
                            )
            `

            //Variables que concatenan TODO
            var sqlFinalRows = sqlRows + sqlFrom + sqlBusqueda + orderByFinal + sqlLimiteAndPage
            var sqlFinalRowsCount = sqlRowsCount + sqlFrom + sqlBusqueda 
          
         
           
            //Obtener Rows
            var rows = await sequelize.query(sqlFinalRows,
            {
                type: sequelize.QueryTypes.SELECT 
            });
          
           
           
            //Obtener Count de las rows
            const constCount = await sequelize.query(sqlFinalRowsCount,
            { 
                type: sequelize.QueryTypes.SELECT 
            });


            var numPaginas = Math.ceil(parseInt(constCount[0].count)/req.body.limite);
               
                if( parseInt(req.body.pagina) == (numPaginas-1)){
                    var sqlFinalRows = sqlRows + sqlFrom + sqlBusqueda + orderByFinal 
                  
                    //Obtener Rows
                     rows = await sequelize.query(sqlFinalRows,
                    {
                        type: sequelize.QueryTypes.SELECT 
                    });

                }

            //Se regresa el esquema parecido a las consultas de SEQUALIZE
          

            
            //LA VARIABLE rows CONTIENE TODOS LOS PRODUCTOS OBTENIDOS

            //Obtener si aplica backorder para los hijos
            rows = await productosUtils.setImagenesOnlyChilds(rows);
            console.log('consulta a base de datos2: ', rows)
            //Obtener si aplica backorder para los hijos
            rows = await productosUtils.setDiasResurtimientoIsBackOrderOnlyChilds(rows);
            
            //Obtener promociones activa y traer la mejor por producto hijo
            rows = await productosUtils.getChildsPromotionsOnlyChilds(rows);


            //Obtener descuento de "marca" dielsa (descuento por grupo listas)
            if(idSocioNegocio != null)
            {
                //Obtener promociones activa y traer la mejor por producto hijo
                rows = await productosUtils.getChildsSNDiscountsOnlyChilds(rows, idSocioNegocio);
            }
            else
            {
                //Obtener promociones activa y traer la mejor por producto hijo
                rows = await productosUtils.getChildsNULLSNDiscountsOnlyChilds(rows);
            }

            //Obtener la mejor promocion o descuento de sn grupo 
            rows = await productosUtils.setBasePriceForChildsWithPromotionsOnlyChilds(rows, idSocioNegocio);

            //Pone las variables precioPromocionDielsaBool y DescuentoDielsaFijo que hacen referencia cuando una promocion es mayor al descuento de cliente
            rows = await productosUtils.setDiscountAmountOverPromotionOnlyChilds(rows, idSocioNegocio);

            // //Obtener y concatenar hijo con mejor promocion al producto padre
            // rows = await productosUtils.setBestPromotionChildToFatherV2(rows);

            //obtener stock detalle por hijo
            rows = await productosUtils.getChildsStocksDetalleOnlyChilds(rows);

            //concatenar producto padre ID a cada hijo
            rows = await productosUtils.getChildsFathersIDOnlyChilds(rows);

            // Obtener el stock de los productos por almacen
            rows = await productosUtils.getStockByStore(rows);

            // Obtener el precio del dollar y se hace la conversión
            rows = await productosUtils.getConversionUSD(rows);
            
            if(parseInt(req.body.pagina) == (numPaginas-1)  && constCount[0].count != 0  && parseInt(req.body.pagina) !=0 ){  
                rows = await productosUtils.setFiltrarProductsFinImagen(rows);
                }else if( parseInt(req.body.pagina) < (numPaginas-1)  && constCount[0].count != 0 ){     
                rows = await productosUtils.setFiltrarProductsSinImagen(rows);
                }
            

            
            const mainConsultaProductos = {
                count: parseInt(constCount[0].count),
                rows
            }
            
            res.status(200).send({
                message: 'Lista de productos',
                mainConsultaProductos
            })


        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },

    frontGetProductoAdvancedSearchV3OnlyChildsSeguridadLuegoBorrar: async (req, res, next) =>{
        try{
            //Condiciones de busqueda
            var ASCDESC = req.body.ASCDESC
            var orderByFinal = ''
            var prod_nombre = req.body.prod_nombre.toUpperCase()
            var prod_sku = req.body.prod_sku.toUpperCase()
            var prod_nombre_extranjero = req.body.prod_nombre_extranjero.toUpperCase()
            var prod_descripcion = req.body.prod_descripcion.toUpperCase()
            var mar_nombre = req.body.mar_nombre.toUpperCase()
            var cat_nombre = req.body.cat_nombre.toUpperCase()

            //Variable en caso de que venga socio de negocio se obtendran precios de su lista de precios
            var idSocioNegocio

            if(req.body.idSocioNegocio)
            {
                idSocioNegocio = req.body.idSocioNegocio
            }
            else
            {
                idSocioNegocio = null
            }

            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit

            //Tipo de Order By
            var ordenamientoBy = req.body.orderBy
            switch(ordenamientoBy)
            {
                case null: 
                    orderByFinal = `order by prioridad `
                    ordenamientoBy = "normal"
                    break;

                case '': 
                    orderByFinal = `order by prioridad `
                    ordenamientoBy = "normal"
                    break;

                case "precio":
                    orderByFinal = `order by prod_precio `
                    ordenamientoBy = "prod_precio"
                    break; 

                case "mas vendido":
                    orderByFinal = `order by prod_unidades_vendidas `
                    ordenamientoBy = "mas vendido"
                    break;

                case "mejores valorados":
                    orderByFinal = `order by prod_calificacion_promedio `
                    ordenamientoBy = "prod_calificacion_promedio"
                    break;

                case "az-za":
                    orderByFinal = `order by prod_nombre `
                    ordenamientoBy = "prod_nombre"
                    break;

                case "fecha lanzamienta":
                    orderByFinal = `order by lanzamiento `
                    ordenamientoBy = "lanzamiento"
                    break;
            }

            orderByFinal = orderByFinal + ' ' + ASCDESC


            //SQL GENERAl
            var sqlRows = `
                select 
                    p5.prod_producto_id,
                    p5.prod_nombre,
                    p5.prod_descripcion,
                    p5.prod_prod_producto_padre_sku,
                    p5.prod_sku,
                    p5.prod_total_stock,
                    p5.prod_precio,
                    m2.mar_marca_id,
                    m2.mar_nombre,
                    p5.prod_cmm_estatus_id,
                    cmm.cmm_valor,
                    c2.cat_cmm_estatus_id,
                    cmm2.cmm_valor as cat_cmm_valor,
                    c2.cat_nombre,
                    pv.prv_nombre,
                    p5.prod_nombre_extranjero,
                    p5.prod_calificacion_promedio,
                    p5.prod_es_stock_inactivo,
                    p5.prod_tipo_precio_base,
                    prod_unidades_vendidas,
                    p5."createdAt" as "lanzamiento"
            `;

            //SQL que solo regresara el total del count
            var sqlRowsCount = `
                select 
                    count(p5.prod_producto_id)
            `;

            //Se usara para concatenar mas codigo repetible
            var sqlFrom = `
                from 
                    productos p5
                    left join categorias c2 on cast(p5.prod_codigo_grupo as int) = c2.cat_categoria_id
                    left join marcas m2 on cast(p5.prod_codigo_marca as int) = m2.mar_marca_id
                    left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                    left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                    left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
            `;

            var sqlBusqueda = ``
            var sqlLimiteAndPage = ` LIMIT `+varlimit+` OFFSET `+varoffset


            //Establecer la base de busqueda donde traiga todos los padres y prevenir error de los intersect haciendo que traiga a todos los padres y lo compare contra esos
            sqlBusqueda += `where p5.prod_producto_id in
                            (
                                select
                                    p1.prod_producto_id
                                from
                                (
                                    --Select null para no tener problemas con los intercect
                                    (
                                        select
                                            p1.prod_producto_id,
                                            p1.prod_sku,
                                            p1.prod_prod_producto_padre_sku
                                        from
                                            productos p1
                                        where
                                            prod_cmm_estatus_id = 1000016
                                            and prod_prod_producto_padre_sku is not null
                                    )
            `

                                

            if(req.body.prod_nombre != '')
            {
                sqlBusqueda += `
                                    --Search Product By Name 
                                    intersect 
                                    (
                                        select
                                            p1.prod_producto_id,
                                            p1.prod_sku,
                                            p1.prod_prod_producto_padre_sku 
                                        from 
                                            productos p1 
                                            left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                            left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                            left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                            left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                        where 
                                            to_tsvector(p1.prod_nombre)
                                            @@ to_tsquery('`+req.body.prod_nombre+`')
                                            and prod_cmm_estatus_id = 1000016 
                                            and prod_prod_producto_padre_sku is not null 
                                            and prod_volumen != 0
                                            and prod_peso != 0
                                            and prod_mostrar_en_tienda = true
                                    )
                                `
            }

            if(req.body.prod_sku != '')
            {
                sqlBusqueda += `
                                    --Search Product By Name SKU
                                    intersect 
                                    (
                                        select
                                            p1.prod_producto_id,
                                            p1.prod_sku,
                                            p1.prod_prod_producto_padre_sku 
                                        from 
                                            productos p1 
                                            left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                            left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                            left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                            left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                        where 
                                            to_tsvector(p1.prod_sku)
                                            @@ to_tsquery('`+req.body.prod_sku+`')
                                            and prod_cmm_estatus_id = 1000016 
                                            and prod_prod_producto_padre_sku is not null 
                                            and prod_volumen != 0
                                            and prod_peso != 0
                                            and prod_mostrar_en_tienda = true
                                    )






                `
            }

            if(req.body.prod_nombre_extranjero != '')
            {
                sqlBusqueda += `
                                    --Search Product By Foreing Name
                                    intersect 
                                    (
                                        select
                                            p1.prod_producto_id,
                                            p1.prod_sku,
                                            p1.prod_prod_producto_padre_sku 
                                        from 
                                            productos p1 
                                            left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                            left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                            left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                            left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                        where 
                                            to_tsvector(p1.prod_nombre_extranjero)
                                            @@ to_tsquery('`+req.body.prod_nombre_extranjero+`')
                                            and prod_cmm_estatus_id = 1000016 
                                            and prod_prod_producto_padre_sku is not null 
                                            and prod_volumen != 0
                                            and prod_peso != 0
                                            and prod_mostrar_en_tienda = true
                                    )   
                `
            }

            if(req.body.prod_descripcion != '')
            {
                sqlBusqueda += `
                                    --Search Product By Description
                                    intersect 
                                    (
                                        select
                                            p1.prod_producto_id,
                                            p1.prod_sku,
                                            p1.prod_prod_producto_padre_sku 
                                        from 
                                            productos p1 
                                            left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                            left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                            left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                            left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                        where 
                                            prod_cmm_estatus_id = 1000016 
                                            and prod_prod_producto_padre_sku is not null 
                                            and prod_mostrar_en_tienda = true
                                            and prod_descripcion ilike '%`+req.body.prod_descripcion+`%'
                                    )
                `
            }

            if(req.body.mar_nombre != '')
            {
                sqlBusqueda += `
                                    --Search Product By Marca (Hijos no tienen Marca)
                                    intersect 
                                    (
                                        select
                                            p1.prod_producto_id,
                                            p1.prod_sku,
                                            p1.prod_prod_producto_padre_sku 
                                        from 
                                            productos p1 
                                            left join categorias c2 on cast (p1.prod_codigo_grupo as int) = c2.cat_categoria_id
                                            left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                            left join marcas m2 on cast (p1.prod_codigo_marca as int) = m2.mar_marca_id 
                                            left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                        where 
                                            m2.mar_nombre like '%`+req.body.mar_nombre+`%'  
                                            and prod_cmm_estatus_id = 1000016 
                                            and prod_prod_producto_padre_sku is not null 
                                            and prod_volumen != 0
                                            and prod_peso != 0
                                            and prod_mostrar_en_tienda = true
                                    )
                ` 
            }

            if(req.body.cat_nombre != '')
            {
                sqlBusqueda += `
                                    --Search Product By Categoria (Hijos no tienen categoria)
                                    intersect 
                                    (
                                        select
                                            p1.prod_producto_id,
                                            p1.prod_sku,
                                            p1.prod_prod_producto_padre_sku 
                                        from 
                                            productos p1 
                                            left join categorias c2 on cast (p1.prod_codigo_grupo as int) = c2.cat_categoria_id
                                            left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                            left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                            left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                        where 
                                            c2.cat_nombre like '%`+req.body.cat_nombre+`%'  
                                            and prod_cmm_estatus_id = 1000016 
                                            and prod_prod_producto_padre_sku is not null 
                                            and prod_volumen != 0
                                            and prod_peso != 0
                                            and prod_mostrar_en_tienda = true
                                    )
                `
            }



            //Final de la arquitectura SQL para la busqueda
            sqlBusqueda += `
                                )  as p1
                            )
            `

            //Variables que concatenan TODO
            var sqlFinalRows = sqlRows + sqlFrom + sqlBusqueda + orderByFinal + sqlLimiteAndPage
            var sqlFinalRowsCount = sqlRowsCount + sqlFrom + sqlBusqueda 

            //Obtener Rows
            var rows = await sequelize.query(sqlFinalRows,
            {
                type: sequelize.QueryTypes.SELECT 
            });
            
            //Obtener Count de las rows
            const constCount = await sequelize.query(sqlFinalRowsCount,
            { 
                type: sequelize.QueryTypes.SELECT 
            });

            var numPaginas = Math.ceil(parseInt(constCount[0].count)/req.body.limite);
               
                if( parseInt(req.body.pagina) == (numPaginas-1)){
                    var sqlFinalRows = sqlRows + sqlFrom + sqlBusqueda + orderByFinal 
                  
                    //Obtener Rows
                     rows = await sequelize.query(sqlFinalRows,
                    {
                        type: sequelize.QueryTypes.SELECT 
                    });

                }

            //Se regresa el esquema parecido a las consultas de SEQUALIZE
           


            //LA VARIABLE rows CONTIENE TODOS LOS PRODUCTOS OBTENIDOS

            //Obtener si aplica backorder para los hijos
            rows = await productosUtils.setImagenesOnlyChilds(rows);

            //Obtener si aplica backorder para los hijos
            rows = await productosUtils.setDiasResurtimientoIsBackOrderOnlyChilds(rows);
            
            //Obtener promociones activa y traer la mejor por producto hijo
            rows = await productosUtils.getChildsPromotionsOnlyChilds(rows);


            //Obtener descuento de "marca" dielsa (descuento por grupo listas)
            if(idSocioNegocio != null)
            {
                //Obtener promociones activa y traer la mejor por producto hijo
                rows = await productosUtils.getChildsSNDiscountsOnlyChilds(rows, idSocioNegocio);
            }
            else
            {
                //Obtener promociones activa y traer la mejor por producto hijo
                rows = await productosUtils.getChildsNULLSNDiscountsOnlyChilds(rows);
            }

            //Obtener la mejor promocion o descuento de sn grupo 
            rows = await productosUtils.setBasePriceForChildsWithPromotionsOnlyChilds(rows, idSocioNegocio);

            //Pone las variables precioPromocionDielsaBool y DescuentoDielsaFijo que hacen referencia cuando una promocion es mayor al descuento de cliente
            rows = await productosUtils.setDiscountAmountOverPromotionOnlyChilds(rows, idSocioNegocio);

            // //Obtener y concatenar hijo con mejor promocion al producto padre
            // rows = await productosUtils.setBestPromotionChildToFatherV2(rows);

            //obtener stock detalle por hijo
            rows = await productosUtils.getChildsStocksDetalleOnlyChilds(rows);

            //concatenar producto padre ID a cada hijo
            rows = await productosUtils.getChildsFathersIDOnlyChilds(rows);
            
            if(parseInt(req.body.pagina) == (numPaginas-1)  && constCount[0].count != 0  && parseInt(req.body.pagina) !=0 ){  
                rows = await productosUtils.setFiltrarProductsFinImagen(rows);
                }else if( parseInt(req.body.pagina) < (numPaginas-1)  && constCount[0].count != 0 ){     
                rows = await productosUtils.setFiltrarProductsSinImagen(rows);
                }

            
            const mainConsultaProductos = {
                count: parseInt(constCount[0].count),
                rows
            }
            
            res.status(200).send({
                message: 'Lista de productos',
                mainConsultaProductos
            })


        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },










    //SIN USO MAYBE
    frontGetProductoMainV4: async (req, res, next) =>{
        try{

            //Obtener paginado
            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit

            //Condiciones de busqueda
            var searchBy = req.body.searchBy
            var ASCDESC = req.body.ASCDESC
            var orderByFinal = ''
            var searchCondition = req.body.palabraBuscar.toUpperCase()

            //Variable en caso de que venga socio de negocio se obtendran precios de su lista de precios
            var idSocioNegocio

            if(req.body.idSocioNegocio)
            {
                idSocioNegocio = req.body.idSocioNegocio
            }
            else
            {
                idSocioNegocio = null
            }


            //Tipo de Order By
            var ordenamientoBy = req.body.orderBy
            switch(ordenamientoBy)
            {
                case null: 
                    orderByFinal = `order by prioridad `
                    ordenamientoBy = "normal"
                    break;

                case '': 
                    orderByFinal = `order by prioridad `
                    ordenamientoBy = "normal"
                    break;

                case "precio":
                    orderByFinal = `order by prod_precio `
                    ordenamientoBy = "prod_precio"
                    break; 

                case "mas vendido":
                    orderByFinal = `order by prod_unidades_vendidas `
                    ordenamientoBy = "mas vendido"
                    break;

                case "mejores valorados":
                    orderByFinal = `order by prod_calificacion_promedio `
                    ordenamientoBy = "prod_calificacion_promedio"
                    break;

                case "az-za":
                    orderByFinal = `order by prod_nombre `
                    ordenamientoBy = "prod_nombre"
                    break;

                case "fecha lanzamienta":
                    orderByFinal = `order by lanzamiento `
                    ordenamientoBy = "lanzamiento"
                    break;
            }

            orderByFinal = orderByFinal + ' ' + ASCDESC




            //Obtener productos BASE para luego obtener mas cosas

                //SQL GENERAl
                var sqlRows = `
                    select 
                        p5.prod_producto_id,
                        p5.prod_nombre,
                        p5.prod_descripcion,
                        p5.prod_sku,
                        p5.prod_precio,
                        m2.mar_marca_id,
                        m2.mar_nombre,
                        p5.prod_cmm_estatus_id,
                        cmm.cmm_valor,
                        c2.cat_cmm_estatus_id,
                        cmm2.cmm_valor as cat_cmm_valor,
                        c2.cat_nombre,
                        pv.prv_nombre,
                        p5.prod_nombre_extranjero,
                        p5.prod_calificacion_promedio,
                        p5.prod_es_stock_inactivo,
                        p5.prod_tipo_precio_base,
                        prod_unidades_vendidas,
                        p5."createdAt" as "lanzamiento"
                `;

                //SQL que solo regresara el total del count
                var sqlRowsCount = `
                    select 
                        count(p5.prod_producto_id)
                `;

                //Se usara para concatenar mas codigo repetible
                var sqlFrom = `
                    from 
                        productos p5
                        left join categorias c2 on p5.prod_cat_categoria_id = c2.cat_categoria_id
                        left join proveedores pv on p5.prod_proveedor_id = pv.prv_proveedores_id
                        left join marcas m2 on p5.prod_mar_marca_id = m2.mar_marca_id
                        left join controles_maestros_multiples cmm on p5.prod_cmm_estatus_id = cmm.cmm_control_id
                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id
                `;

                var sqlBusqueda = ``
                var sqlLimiteAndPage = ` LIMIT `+varlimit+` OFFSET `+varoffset

                if(searchBy == 'Marca')
                {
                    sqlBusqueda = `
                        where p5.prod_producto_id in 
                        (
                            select 
                                p1.prod_producto_id
                            from 
                            (
                                --Search Fathers by Marca
                                union
                                (
                                    select
                                        p1.prod_producto_id,
                                        case when m2.mar_nombre like '%`+searchCondition+`%'  then 1.7 else 1.8 end as prioridad 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        m2.mar_nombre like '%`+searchCondition+`%' 
                                        and prod_cmm_estatus_id = 1000016
                                        and prod_prod_producto_padre_sku is null 
                                        and prod_sku in (
                                                select 
                                                    p6.prod_sku
                                                from 
                                                    productos p3 
                                                    left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku 
                                                where
                                                    p3.prod_prod_producto_padre_sku in 
                                                                                    (
                                                                                        select 
                                                                                            p4.prod_sku 
                                                                                        from
                                                                                            productos p4 
                                                                                            left join marcas m5 on p4.prod_mar_marca_id = m5.mar_marca_id 
                                                                                        where
                                                                                            m5.mar_nombre like '%`+searchCondition+`%' 
                                                                                            and prod_cmm_estatus_id = 1000016
                                                                                            and prod_prod_producto_padre_sku is null
                                                                                    )
                                                    and p3.prod_volumen != 0
                                                    and p3.prod_peso != 0
                                            ) 
                                )
                                --Search Fathers by Marca Abreviatura
                                union
                                (
                                    select
                                        p1.prod_producto_id,
                                        case when m2.mar_abreviatura like '%`+searchCondition+`%'  then 1.81 else 1.82 end as prioridad 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        m2.mar_abreviatura like '%`+searchCondition+`%' 
                                        and prod_cmm_estatus_id = 1000016
                                        and prod_prod_producto_padre_sku is null 
                                        and prod_sku in (
                                                select 
                                                     p6.prod_sku
                                                from 
                                                    productos p3
                                                    left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku  
                                                where
                                                    p3.prod_prod_producto_padre_sku in 
                                                                                    (
                                                                                        select 
                                                                                            p4.prod_sku 
                                                                                        from
                                                                                            productos p4 
                                                                                            left join marcas m5 on p4.prod_mar_marca_id = m5.mar_marca_id 
                                                                                        where
                                                                                            m5.mar_abreviatura like '%`+searchCondition+`%' 
                                                                                            and prod_cmm_estatus_id = 1000016
                                                                                            and prod_prod_producto_padre_sku is null
                                                                                    )
                                                    and p3.prod_volumen != 0
                                                    and p3.prod_peso != 0
                                            ) 
                                )
                            )  as p1 `+orderByFinal+`
                        )
                        `;
                }
                else if(searchBy == 'Categoria')
                {
                    sqlBusqueda = `
                        where p5.prod_producto_id in 
                        (
                            select 
                                p1.prod_producto_id
                            from 
                            (
                                --Search Fathers by Categoria
                                (
                                    select
                                        p1.prod_producto_id,
                                        case when c2.cat_nombre like '%`+searchCondition+`%'  then 1.5 else 1.6 end as prioridad 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        c2.cat_nombre like '%`+searchCondition+`%' 
                                        and prod_cmm_estatus_id = 1000016
                                        and prod_prod_producto_padre_sku is null 
                                        and prod_sku in (
                                                select 
                                                    p6.prod_sku
                                                from 
                                                    productos p3 
                                                    left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku 
                                                where
                                                    p3.prod_prod_producto_padre_sku in 
                                                                                    (
                                                                                        select 
                                                                                            p4.prod_sku 
                                                                                        from
                                                                                            productos p4 
                                                                                            left join categorias c5 on p4.prod_cat_categoria_id = c5.cat_categoria_id
                                                                                        where
                                                                                            c5.cat_nombre like '%`+searchCondition+`%' 
                                                                                            and prod_cmm_estatus_id = 1000016
                                                                                            and prod_prod_producto_padre_sku is null
                                                                                    )
                                                    and p3.prod_volumen != 0
                                                    and p3.prod_peso != 0
                                            )
                                )
                            )  as p1 `+orderByFinal+`
                        )
                        `;
                }
                else
                {
                    sqlBusqueda = `
                        where p5.prod_producto_id in 
                        (
                            select 
                                p1.prod_producto_id
                            from 
                            (
                                --Search Fathers by Name
                                (
                                    select
                                        p1.prod_producto_id,
                                        case when prod_nombre like '%`+searchCondition+`%'  then 0.1 else 0.2 end as prioridad 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        prod_nombre like '%`+searchCondition+`%' 
                                        and prod_cmm_estatus_id = 1000016
                                        and prod_prod_producto_padre_sku is null 
                                        and prod_sku in (
                                                select 
                                                    p6.prod_sku
                                                from 
                                                    productos p3 
                                                    left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku 
                                                where
                                                    p3.prod_prod_producto_padre_sku in 
                                                                                    (
                                                                                        select 
                                                                                            p4.prod_sku 
                                                                                        from
                                                                                            productos p4 
                                                                                        where
                                                                                            p4.prod_nombre like '%`+searchCondition+`%' 
                                                                                            and prod_cmm_estatus_id = 1000016
                                                                                            and prod_prod_producto_padre_sku is null
                                                                                    )
                                                    and p3.prod_volumen != 0
                                                    and p3.prod_peso != 0
                                            ) 
                                )
                                --Search Child by Name and return Only Fathers
                                union 
                                (
                                    select 
                                        p2.prod_producto_id,
                                        case when prod_nombre like '%`+searchCondition+`%'  then 0.3 else 0.4 end as prioridad
                                    from(
                                        select
                                            p1.prod_producto_id,
                                            case when prod_nombre like '%`+searchCondition+`%'  then 0.3 else 0.4 end as prioridad,
                                            p1.prod_sku,
                                            p1.prod_prod_producto_padre_sku 
                                        from 
                                            productos p1 
                                            left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                            left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                            left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                            left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                        where 
                                            prod_nombre like '%`+searchCondition+`%'  
                                            and prod_cmm_estatus_id = 1000016 
                                            and prod_prod_producto_padre_sku is not null 
                                            and prod_volumen != 0
                                            and prod_peso != 0
                                        ) temporal 
                                    left join productos p2 on temporal.prod_prod_producto_padre_sku = p2.prod_sku 
                                    where p2.prod_prod_producto_padre_sku is null
                                    group by p2.prod_producto_id, prioridad 
                                )
                                --Search Fathers by Description
                                union
                                (
                                    select
                                        p1.prod_producto_id,
                                        case when prod_descripcion like '%`+searchCondition+`%'  then 1.1 else 1.2 end as prioridad 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        prod_descripcion like '%`+searchCondition+`%' 
                                        and prod_cmm_estatus_id = 1000016
                                        and prod_prod_producto_padre_sku is null 
                                        and prod_sku in (
                                                select 
                                                    p6.prod_sku
                                                from 
                                                    productos p3
                                                    left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku  
                                                where
                                                    p3.prod_prod_producto_padre_sku in 
                                                                                    (
                                                                                        select 
                                                                                            p4.prod_sku 
                                                                                        from
                                                                                            productos p4 
                                                                                        where
                                                                                            p4.prod_descripcion like '%`+searchCondition+`%' 
                                                                                            and prod_cmm_estatus_id = 1000016
                                                                                            and prod_prod_producto_padre_sku is null
                                                                                    )
                                                    and p3.prod_volumen != 0
                                                    and p3.prod_peso != 0
                                            ) 
                                )
                                --Search Child by Description and return Only Fathers
                                union 
                                (
                                    select 
                                        p2.prod_producto_id,
                                        case when prod_descripcion like '%`+searchCondition+`%'  then 1.3 else 1.4 end as prioridad
                                    from(
                                        select
                                            p1.prod_producto_id,
                                            case when prod_descripcion like '%`+searchCondition+`%'  then 1.3 else 1.4 end as prioridad,
                                            p1.prod_sku,
                                            p1.prod_prod_producto_padre_sku 
                                        from 
                                            productos p1 
                                            left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                            left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                            left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                            left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                        where 
                                            prod_descripcion like '%`+searchCondition+`%'  
                                            and prod_cmm_estatus_id = 1000016 
                                            and prod_prod_producto_padre_sku is not null 
                                            and prod_volumen != 0
                                            and prod_peso != 0
                                        ) temporal 
                                    left join productos p2 on temporal.prod_prod_producto_padre_sku = p2.prod_sku 
                                    where p2.prod_prod_producto_padre_sku is null
                                    group by p2.prod_producto_id, prioridad 
                                )
                                --Search Fathers by Categoria
                                union
                                (
                                    select
                                        p1.prod_producto_id,
                                        case when c2.cat_nombre like '%`+searchCondition+`%'  then 1.5 else 1.6 end as prioridad 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        c2.cat_nombre like '%`+searchCondition+`%' 
                                        and prod_cmm_estatus_id = 1000016
                                        and prod_prod_producto_padre_sku is null 
                                        and prod_sku in (
                                                select 
                                                    p6.prod_sku
                                                from 
                                                    productos p3 
                                                    left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku 
                                                where
                                                    p3.prod_prod_producto_padre_sku in 
                                                                                    (
                                                                                        select 
                                                                                            p4.prod_sku 
                                                                                        from
                                                                                            productos p4 
                                                                                            left join categorias c5 on p4.prod_cat_categoria_id = c5.cat_categoria_id
                                                                                        where
                                                                                            c5.cat_nombre like '%`+searchCondition+`%' 
                                                                                            and prod_cmm_estatus_id = 1000016
                                                                                            and prod_prod_producto_padre_sku is null
                                                                                    )
                                                    and p3.prod_volumen != 0
                                                    and p3.prod_peso != 0
                                            )
                                )
                                --Search Fathers by Marca
                                union
                                (
                                    select
                                        p1.prod_producto_id,
                                        case when m2.mar_nombre like '%`+searchCondition+`%'  then 1.7 else 1.8 end as prioridad 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        m2.mar_nombre like '%`+searchCondition+`%' 
                                        and prod_cmm_estatus_id = 1000016
                                        and prod_prod_producto_padre_sku is null 
                                        and prod_sku in (
                                                select 
                                                    p6.prod_sku
                                                from 
                                                    productos p3 
                                                    left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku 
                                                where
                                                    p3.prod_prod_producto_padre_sku in 
                                                                                    (
                                                                                        select 
                                                                                            p4.prod_sku 
                                                                                        from
                                                                                            productos p4 
                                                                                            left join marcas m5 on p4.prod_mar_marca_id = m5.mar_marca_id 
                                                                                        where
                                                                                            m5.mar_nombre like '%`+searchCondition+`%' 
                                                                                            and prod_cmm_estatus_id = 1000016
                                                                                            and prod_prod_producto_padre_sku is null
                                                                                    )
                                                    and p3.prod_volumen != 0
                                                    and p3.prod_peso != 0
                                            ) 
                                )
                                --Search Fathers by Marca Abreviatura
                                union
                                (
                                    select
                                        p1.prod_producto_id,
                                        case when m2.mar_abreviatura like '%`+searchCondition+`%'  then 1.81 else 1.82 end as prioridad 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        m2.mar_abreviatura like '%`+searchCondition+`%' 
                                        and prod_cmm_estatus_id = 1000016
                                        and prod_prod_producto_padre_sku is null 
                                        and prod_sku in (
                                                select 
                                                     p6.prod_sku
                                                from 
                                                    productos p3
                                                    left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku  
                                                where
                                                    p3.prod_prod_producto_padre_sku in 
                                                                                    (
                                                                                        select 
                                                                                            p4.prod_sku 
                                                                                        from
                                                                                            productos p4 
                                                                                            left join marcas m5 on p4.prod_mar_marca_id = m5.mar_marca_id 
                                                                                        where
                                                                                            m5.mar_abreviatura like '%`+searchCondition+`%' 
                                                                                            and prod_cmm_estatus_id = 1000016
                                                                                            and prod_prod_producto_padre_sku is null
                                                                                    )
                                                    and p3.prod_volumen != 0
                                                    and p3.prod_peso != 0
                                            ) 
                                )
                                --Search Fathers by Foreing Name
                                union
                                (
                                    select
                                        p1.prod_producto_id,
                                        case when p1.prod_nombre_extranjero like '%`+searchCondition+`%'  then 1.9 else 2 end as prioridad 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        p1.prod_nombre_extranjero like '%`+searchCondition+`%' 
                                        and prod_cmm_estatus_id = 1000016
                                        and prod_prod_producto_padre_sku is null 
                                        and prod_sku in (
                                                select 
                                                    p6.prod_sku
                                                from 
                                                    productos p3 
                                                    left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku 
                                                where
                                                    p3.prod_prod_producto_padre_sku in 
                                                                                    (
                                                                                        select 
                                                                                            p4.prod_sku 
                                                                                        from
                                                                                            productos p4 
                                                                                        where
                                                                                            p4.prod_nombre_extranjero like '%`+searchCondition+`%' 
                                                                                            and prod_cmm_estatus_id = 1000016
                                                                                            and prod_prod_producto_padre_sku is null
                                                                                    )
                                                    and p3.prod_volumen != 0
                                                    and p3.prod_peso != 0
                                            ) 
                                )
                                --Search Child by Foreing Name and return Only Fathers
                                union 
                                (
                                    select 
                                        p2.prod_producto_id,
                                        case when prod_nombre_extranjero like '%`+searchCondition+`%'  then 2.1 else 2.2 end as prioridad
                                    from(
                                        select
                                            p1.prod_producto_id,
                                            case when prod_nombre_extranjero like '%`+searchCondition+`%'  then 2.3 else 2.4 end as prioridad,
                                            p1.prod_sku,
                                            p1.prod_prod_producto_padre_sku 
                                        from 
                                            productos p1 
                                            left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                            left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                            left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                            left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                        where 
                                            prod_nombre_extranjero like '%`+searchCondition+`%'  
                                            and prod_cmm_estatus_id = 1000016 
                                            and prod_prod_producto_padre_sku is not null 
                                            and prod_volumen != 0
                                            and prod_peso != 0
                                        ) temporal 
                                    left join productos p2 on temporal.prod_prod_producto_padre_sku = p2.prod_sku 
                                    where p2.prod_prod_producto_padre_sku is null
                                    group by p2.prod_producto_id, prioridad 
                                )
                                --Search Fathers by SKU
                                union
                                (
                                    select
                                        p1.prod_producto_id,
                                        case when p1.prod_sku like '%`+searchCondition+`%'  then 2.5 else 2.6 end as prioridad 
                                    from 
                                        productos p1 
                                        left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                        left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                        left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                        left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                        left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                    where 
                                        p1.prod_sku like '%`+searchCondition+`%' 
                                        and prod_cmm_estatus_id = 1000016
                                        and prod_prod_producto_padre_sku is null 
                                        and prod_sku in (
                                                select 
                                                    p6.prod_sku
                                                from 
                                                    productos p3 
                                                    left join productos p6 on p6.prod_sku = p3.prod_prod_producto_padre_sku 
                                                where
                                                    p3.prod_prod_producto_padre_sku in 
                                                                                    (
                                                                                        select 
                                                                                            p4.prod_sku 
                                                                                        from
                                                                                            productos p4 
                                                                                        where
                                                                                            p4.prod_sku like '%`+searchCondition+`%' 
                                                                                            and prod_cmm_estatus_id = 1000016
                                                                                            and prod_prod_producto_padre_sku is null
                                                                                    )
                                                    and p3.prod_volumen != 0
                                                    and p3.prod_peso != 0
                                            ) 
                                )
                                --Search Child by SKU and return Only Fathers
                                union 
                                (
                                    select 
                                        p2.prod_producto_id,
                                        case when p2.prod_sku like '%`+searchCondition+`%'  then 2.7 else 2.8 end as prioridad
                                    from(
                                        select
                                            p1.prod_producto_id,
                                            case when p1.prod_sku like '%`+searchCondition+`%'  then 2.7 else 2.8 end as prioridad,
                                            p1.prod_sku,
                                            p1.prod_prod_producto_padre_sku 
                                        from 
                                            productos p1 
                                            left join categorias c2 on p1.prod_cat_categoria_id = c2.cat_categoria_id
                                            left join proveedores pv on p1.prod_proveedor_id = pv.prv_proveedores_id 
                                            left join marcas m2 on p1.prod_mar_marca_id = m2.mar_marca_id 
                                            left join controles_maestros_multiples cmm on p1.prod_cmm_estatus_id = cmm.cmm_control_id 
                                            left join controles_maestros_multiples cmm2 on c2.cat_cmm_estatus_id = cmm2.cmm_control_id 
                                        where 
                                            p1.prod_sku like '%`+searchCondition+`%'  
                                            and prod_cmm_estatus_id = 1000016 
                                            and prod_prod_producto_padre_sku is not null 
                                            and prod_volumen != 0
                                            and prod_peso != 0
                                        ) temporal 
                                    left join productos p2 on temporal.prod_prod_producto_padre_sku = p2.prod_sku 
                                    where p2.prod_prod_producto_padre_sku is null
                                    group by p2.prod_producto_id, prioridad 
                                )
                            )  as p1 
                        ) 
                        `;
                }

                //Variables que concatenan TODO
                var sqlFinalRows = sqlRows + sqlFrom + sqlBusqueda + orderByFinal + sqlLimiteAndPage
                var sqlFinalRowsCount = sqlRowsCount + sqlFrom + sqlBusqueda 

                //Obtener Rows
                var rows = await sequelize.query(sqlFinalRows,
                {
                    type: sequelize.QueryTypes.SELECT 
                });

                //Obtener Count de las rows
                const constCount = await sequelize.query(sqlFinalRowsCount,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });

                //Se regresa el esquema parecido a las consultas de SEQUALIZE
                const mainConsultaProductos = {
                    count: parseInt(constCount[0].count),
                    rows
                }
            //FIN Obtener productos BASE para luego obtener mas cosas













            //LA VARIABLE rows CONTIENE TODOS LOS PRODUCTOS OBTENIDOS

            //Obtener hijos, Si vienen hijos asignar Lista de precio por hijo y lista de stock por hijo
            rows = await productosUtils.getHijosFromPadre(rows);
            
            //Obtener si aplica backorder para los hijos
            rows = await productosUtils.setDiasResurtimientoIsBackOrder(rows);

            //Obtener promociones activa y traer la mejor por producto hijo
            rows = await productosUtils.getChildsPromotions(rows);



            //Si la busqueda tiene un id de socio de negocio asignado concatenara un nuevo precio al producto
            if(idSocioNegocio != null)
            {
                rows = await productosUtils.setBasePricesForChildBySNPriceList(rows, idSocioNegocio);

                //Obtener y concatenar hijo con mejor promocion al producto padre
                rows = await productosUtils.setBestPromotionChildToFatherWithSNPriceList(rows);
            }
            else
            {
                //Obtener y concatenar hijo con mejor promocion al producto padre
                rows = await productosUtils.setBestPromotionChildToFather(rows);
            }






            res.status(200).send({
                message: 'Lista de productos',
                mainConsultaProductos
            })


        }catch(e){
            res.status(500).send({
                message: 'Error al traer lista productos',
                e
            });
            next(e);
        }
    },

}