import models from '../models';
const { Op } = require("sequelize");
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
export default {
    createdListaPrecio: async (req, res, next) =>{
        try{
            const lista_precio = await models.ListaPrecio.create(req.body);    
            res.status(200).send({
                message: 'Lista de precios creada correctamente',
                lista_precio
            });
        }catch(e){
            res.status(500).send({
                message: 'Error, al crear lista de precios',
                e
            });
            next(e);
        }
    },
    getListaDePreciosId: async(req, res, next) =>{
        try{
            const listaPrecio = await models.ListaPrecio.findOne({
                where: {
                    listp_lista_de_precio_id: req.params.id
                },
                include: [
                    {
                        model: models.ControlMaestroMultiple,
                        as: 'EstatusControl',
                        attributes: {
                            exclude: ['cmm_control_id','cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt',]
                        }
                    },
                    {
                        model: models.ControlMaestroMultiple,
                        as: 'TipoPrecio',
                        attributes: {
                            exclude: ['cmm_control_id','cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt',]
                        }
                    }
                ]
            });
            res.status(200).send({
                message: 'Lista de precio',
                listaPrecio
            });
        }catch(e){
            res.status(500).send({
                message: 'Error al obtener lista',
                e
            });
            next(e);
        }
    },
    getProductosListaDePrecioPaginados: async (req, res, next) =>{
        try{
            let varlimit = req.body.limite;
            let varoffset = 0 + (req.body.pagina) * varlimit;
            let lista_precio_id = req.body.lista_precio_id;

            let skuSearch = req.body.prod_sku;


            if(skuSearch == null || skuSearch == '')
            {
                const productosToListaPrecio = await models.ProductoListaPrecio.findAndCountAll({
                    where: {
                        pl_listp_lista_de_precio_id: lista_precio_id
                    },
                    limit: varlimit,
                    offset: varoffset,
                    order: [
                        ['pl_prod_producto_id', 'ASC'],
                    ],
                    attributes: {
                        exclude: ['pl_producto_lista_precio_id','createdAt','updatedAt']
                    },
                    include: [
                        {
                            model: models.Producto,
                            where:
                            {
                                prod_prod_producto_padre_sku: { [Op.ne] : null }
                            },
                            attributes: {
                                exclude: [
                                    'prod_usu_usuario_creado_id',
                                    'createdAt',
                                    'prod_usu_usuario_modificado_id',
                                    'updatedAt',
                                    'prod_cmm_estatus_id',
                                    'prod_descripcion_corta',
                                    'prod_unidad_medida_venta',
                                    'prod_altura',
                                    'prod_ancho',
                                    'prod_longitud',
                                    'prod_peso',
                                    'prod_volumen',
                                    'prod_total_stock',
                                    'prod_proveedor_id',
                                    'prod_meta_titulo',
                                    'prod_meta_descripcion',
                                    'prod_is_kit'
                                ]
                            }
                        }
                    ]
                });
                res.status(200).send({
                    message: 'Lista de productos',
                    productosToListaPrecio
                })
            }
            else
            {
                const productosToListaPrecio = await models.ProductoListaPrecio.findAndCountAll({
                    where: {
                        pl_listp_lista_de_precio_id: lista_precio_id
                    },
                    limit: varlimit,
                    offset: varoffset,
                    order: [
                        ['pl_prod_producto_id', 'ASC'],
                    ],
                    attributes: {
                        exclude: ['pl_producto_lista_precio_id','createdAt','updatedAt']
                    },
                    include: [
                        {
                            model: models.Producto,
                            where:
                            {
                                prod_prod_producto_padre_sku: { [Op.ne] : null },
                                prod_nombre_extranjero: {[Op.like]: '%'+skuSearch+'%'}

                            },
                            attributes: {
                                exclude: [
                                    'prod_usu_usuario_creado_id',
                                    'createdAt',
                                    'prod_usu_usuario_modificado_id',
                                    'updatedAt',
                                    'prod_cmm_estatus_id',
                                    'prod_descripcion_corta',
                                    'prod_unidad_medida_venta',
                                    'prod_altura',
                                    'prod_ancho',
                                    'prod_longitud',
                                    'prod_peso',
                                    'prod_volumen',
                                    'prod_total_stock',
                                    'prod_proveedor_id',
                                    'prod_meta_titulo',
                                    'prod_meta_descripcion',
                                    'prod_is_kit'
                                ]
                            }
                        }
                    ]
                });
                res.status(200).send({
                    message: 'Lista de productos',
                    productosToListaPrecio
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
    updateListaDePrecio: async(req, res, next) =>{
        try{
            const listaPrecioUpdate = await models.ListaPrecio.findOne({
                where: {
                    listp_lista_de_precio_id: req.body.listp_lista_de_precio_id
                }
            });
            listaPrecioUpdate.update({
                listp_nombre:!!req.body.listp_nombre ? req.body.listp_nombre : listaPrecioUpdate.dataValues.listp_nombre,
                listp_descripcion:!!req.body.listp_descripcion ? req.body.listp_descripcion : listaPrecioUpdate.dataValues.listp_descripcion,
                listp_cmm_estatus_id:!!req.body.listp_cmm_estatus_id ? req.body.listp_cmm_estatus_id : listaPrecioUpdate.dataValues.listp_cmm_estatus_id,
                listp_usu_usuario_modificador_id:!!req.body.listp_usu_usuario_modificador_id ? req.body.listp_usu_usuario_modificador_id : listaPrecioUpdate.dataValues.listp_usu_usuario_modificador_id,
                updatedAt: Date(),
                listp_tipo_precio:!!req.body.listp_tipo_precio ? req.body.listp_tipo_precio : listaPrecioUpdate.dataValues.listp_tipo_precio,
                listp_descuento: !!req.body.listp_descuento ? req.body.listp_descuento : listaPrecioUpdate.dataValues.listp_descuento
            });
            res.status(200).send({
                message: 'Lista actualizada con exito'
            });
        }catch(e){
            res.status(500).send({
                message: 'Error al actualizar datos',
                e
            });
            next(e);
        }
    },
    updatePrecioLista: async(req, res, next) =>{
        try{
            let precio_producto = await models.ProductoListaPrecio.findOne({
                where: {
                    pl_listp_lista_de_precio_id: req.body.pl_listp_lista_de_precio_id,
                    pl_prod_producto_id: req.body.pl_prod_producto_id
                }
            });
            if(!!precio_producto){
                await precio_producto.update({
                    pl_precio_producto: req.body.pl_precio_producto
                });
                precio_producto = await models.ProductoListaPrecio.findOne({
                    where: {
                        pl_listp_lista_de_precio_id: req.body.pl_listp_lista_de_precio_id,
                        pl_prod_producto_id: req.body.pl_prod_producto_id
                    },
                    include: [
                        {
                            model: models.Producto,
                            attributes: {
                                exclude: [
                                    'prod_usu_usuario_creado_id',
                                    'createdAt',
                                    'prod_usu_usuario_modificado_id',
                                    'updatedAt',
                                    'prod_cmm_estatus_id',
                                    'prod_descripcion_corta',
                                    'prod_unidad_medida_venta',
                                    'prod_altura',
                                    'prod_ancho',
                                    'prod_longitud',
                                    'prod_peso',
                                    'prod_volumen',
                                    'prod_total_stock',
                                    'prod_proveedor_id',
                                    'prod_meta_titulo',
                                    'prod_meta_descripcion',
                                    'prod_is_kit'
                                ]
                            }
                        }
                    ]
                }); 
                res.status(200).send({
                    message: 'Precio actualizado correctamente',
                    precio_producto
                })
            }else{
                res.status(300).send({
                    message: 'Error al actualizar el precio del producto'
                })
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al actualizar el producto',
                e
            });
            next(e);
        }
    },
    getListasDePrecios: async(req, res, next) =>{
        try{
            const listas_de_precios = await models.ListaPrecio.findAll({
                where: {
                    listp_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_LISTA_DE_PRECIO.ELIMINADA }
                }
            });

            res.status(200).send({
                message: 'Listas de precios',
                listas_de_precios
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al obtener lista',
                e
            });
            next(e);
        }
    },
    deleteListaPrecio: async(req, res, next) =>{
        try{
            const listaPrecioUpdate = await models.ListaPrecio.findOne({
                where: {
                    listp_lista_de_precio_id: req.body.listp_lista_de_precio_id
                }
            });
            if(!!listaPrecioUpdate){
                listaPrecioUpdate.update({
                    listp_nombre:!!req.body.listp_nombre ? req.body.listp_nombre : listaPrecioUpdate.dataValues.listp_nombre,
                    listp_cmm_estatus_id: statusControles.ESTATUS_LISTA_DE_PRECIO.ELIMINADA,
                    listp_usu_usuario_modificador_id:!!req.body.listp_usu_usuario_modificador_id ? req.body.listp_usu_usuario_modificador_id : listaPrecioUpdate.dataValues.listp_usu_usuario_modificador_id,
                    updatedAt: Date()
                });
                await models.ProductoListaPrecio.destroy({
                    where: {
                        pl_listp_lista_de_precio_id: listaPrecioUpdate.dataValues.listp_lista_de_precio_id
                    }
                });
                res.status(200).send({
                    message: 'Eliminado exitosamente'
                });
            }else{
                res.status(300).send({
                    message: 'Lista precio no disponible o inactiva'
                })
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al eliminar lista de precio',
                e
            });
            next(e);
        }
    }
}