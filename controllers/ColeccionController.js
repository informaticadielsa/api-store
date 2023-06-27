import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
export default{
    createColeccion: async(req, res, next) =>{
        try{
            const coleccion = await models.Coleccion.create(req.body);

            if(coleccion)
            {
                for (var f = 0; f < req.body.productos_colecciones.length; f++) 
                {
                    
                    const bodyCreate = {
                        "prodcol_col_coleccion_id": coleccion.dataValues.col_coleccion_id,
                        "prodcol_prod_producto_id": req.body.productos_colecciones[f].prodcol_prod_producto_id
                    };
                         
                    await models.ProductoColeccion.create(bodyCreate);
                }

            }




            res.status(200).send({
                message: 'Colección creada correctamente',
                coleccion
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al crear colección',
                e
            });
            next(e);
        }
    },
    updateColeccion: async (req, res, next) =>{
        try{
            const coleccionUpdate = await models.Coleccion.findOne({
                where:{
                    col_coleccion_id: req.body.col_coleccion_id
                },
                include:[
                    {
                        model: models.ProductoColeccion,
                        as: 'producto_coleccions'
                    }
                ]
            });
            coleccionUpdate.update({
                col_nombre : !!req.body.col_nombre ? req.body.col_nombre : coleccionUpdate.dataValues.col_nombre,
                col_descripcion : !!req.body.col_descripcion ? req.body.col_descripcion : coleccionUpdate.dataValues.col_descripcion,
                col_cmm_estatus_id : !!req.body.col_cmm_estatus_id ? req.body.col_cmm_estatus_id : coleccionUpdate.dataValues.col_cmm_estatus_id,
                col_usu_usuario_modificador_id : !!req.body.col_usu_usuario_modificador_id ? req.body.col_usu_usuario_modificador_id : coleccionUpdate.dataValues.col_usu_usuario_modificador_id,
                updatedAt: Date(),
                col_tipo: !!req.body.col_tipo ? req.body.col_tipo : coleccionUpdate.dataValues.col_tipo
            },{
                include: [
                    {
                        model: models.ProductoColeccion,
                        as: 'producto_coleccions'
                    }
                ] 
            });
            await models.ProductoColeccion.destroy({
                where: {
                    prodcol_col_coleccion_id: req.body.col_coleccion_id
                }
            });
            if(!!req.body.producto_coleccions){
                req.body.producto_coleccions.forEach(async function(addproduct, indexAdd){
                    await models.ProductoColeccion.create({
                        prodcol_col_coleccion_id: coleccionUpdate.dataValues.col_coleccion_id,
                        prodcol_prod_producto_id: addproduct.prodcol_prod_producto_id
                    })
                    if((req.body.producto_coleccions.length - 1) == indexAdd){
                        res.status(200).send({
                            message: 'Actualización exitosa'
                        });
                    }
                });
            }else{
                res.status(200).send({
                    message: 'Actualización exitosa'
                });
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al actualizar datos',
                e
            });
            next(e);
        }
    },
    updateProductoColeccionRelacion: async (req, res, next) =>{
        try{
            




            const constProducto = await models.Producto.findOne({
                where:{
                    prod_producto_id: req.body.prod_producto_id
                }
            });



            //Si el producto existe
            if(constProducto)
            {
                //Si el campo de relacion id no es vacio buscara la coleccion para relacionarla y actualizarla
                if(req.body.prod_productos_coleccion_relacionados_id)
                {
                    const constColeccion = await models.Coleccion.findOne({
                        where:{
                            col_coleccion_id: req.body.prod_productos_coleccion_relacionados_id
                        }
                    });

                    if(constColeccion)
                    {
                        const bodyUpdate = {
                            "prod_productos_coleccion_relacionados_id": req.body.prod_productos_coleccion_relacionados_id,
                            updatedAt: Date()
                        }
                        await constProducto.update(bodyUpdate);
                    }

                }
                else
                {
                    const bodyUpdate = {
                        "prod_productos_coleccion_relacionados_id": null,
                        updatedAt: Date()
                    }
                    await constProducto.update(bodyUpdate);

                }


                //Si el campo de relacion id no es vacio buscara la coleccion para relacionarla y actualizarla
                if(req.body.prod_productos_coleccion_accesorios_id)
                {
                    const constColeccion = await models.Coleccion.findOne({
                        where:{
                            col_coleccion_id: req.body.prod_productos_coleccion_accesorios_id
                        }
                    });

                    if(constColeccion)
                    {
                        const bodyUpdate = {
                            "prod_productos_coleccion_accesorios_id": req.body.prod_productos_coleccion_accesorios_id,
                            updatedAt: Date()
                        }
                        await constProducto.update(bodyUpdate);
                    }

                }
                else
                {
                    const bodyUpdate = {
                        "prod_productos_coleccion_accesorios_id": null,
                        updatedAt: Date()
                    }
                    await constProducto.update(bodyUpdate);
                }

            }


            res.status(200).send({
                message: 'Actualización exitosa'
            });


        }catch(e){
            res.status(500).send({
                message: 'Error al actualizar datos',
                e
            });
            next(e);
        }
    },
    deleteColeccion: async (req, res, next) =>{
        try{
            const deleteColeccion = await models.Coleccion.findOne({ where:  { col_coleccion_id: req.body.col_coleccion_id } });
            await deleteColeccion.update({
                col_cmm_estatus_id: statusControles.ESTATUS_COLECCION.ELIMINADA,
                col_usu_usuario_modificador_id: req.body.col_usu_usuario_modificador_id,
                updatedAt: Date()
            });
            try{
                await models.ProductoColeccion.destroy({ where: {prodcol_col_coleccion_id: deleteColeccion.dataValues.col_coleccion_id } });
            }catch(e){
                console.log('No hay nada que eliminar');
            }
            res.status(200).send({
                message: 'Eliminación correcta'
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al eliminar la colección',
                e
            });
            next(e);
        }
    },
    getColeccionById: async(req, res, next) =>{
        try{
            console.log('Ete trae colección');
            const coleccion = await models.Coleccion.findOne({ 
                where: { 
                    col_coleccion_id: req.params.id 
                },
                include: [
                    {
                        model: models.ProductoColeccion,
                        as: 'producto_coleccions',
                        include: [
                            {
                                model: models.Producto
                            }
                        ]
                    },
                    {
                        model: models.ControlMaestroMultiple,
                        as: 'tipo',
                        attributes: {
                            exclude: ['updatedAt', 'createdAt', 'cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','cmm_usu_usuario_modificado_por_id']
                        }
                    }
                ]
            });
            res.status(200).send({
                message: 'Producto recuperado con éxito.',
                coleccion
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al recuperar detalle del producto',
                e
            });
            next(e);
        }
    },
    getListColecciones: async(req, res, next) =>{
        try{
            const colecciones = await models.Coleccion.findAll({
                where: {
                    col_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_COLECCION.ELIMINADA }
                },
                include: [
                    {
                        model: models.ControlMaestroMultiple,
                        as: 'estatus',
                        attributes: {
                            exclude: ['updatedAt', 'createdAt', 'cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','cmm_usu_usuario_modificado_por_id']
                        }
                    },
                    {
                        model: models.ControlMaestroMultiple,
                        as: 'tipo',
                        attributes: {
                            exclude: ['updatedAt', 'createdAt', 'cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','cmm_usu_usuario_modificado_por_id']
                        }
                    }
                ],
                order: [
                    ['col_coleccion_id', 'ASC'],
                ],
            })
            res.status(200).send({
                message: 'Lista obtenida con éxito.',
                colecciones
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al obtener lista de colecciones',
                e
            });
            next(e);
        }
    },
    getListadoColeccionesPublica: async(req, res, next) =>{
        try{
            const colecciones = await models.Coleccion.findAll({
                where: {
                    col_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_COLECCION.ELIMINADA },
                    col_tipo: req.params.tipo
                },
                attributes: {
                    exclude: [
                        'col_usu_usuario_creador_id',
                        'createdAt',
                        'col_usu_usuario_modificador_id',
                        'updatedAt'
                    ]
                },
                include: [
                    {
                        model: models.ControlMaestroMultiple,
                        as: 'estatus',
                        attributes: {
                            exclude: ['updatedAt', 'createdAt', 'cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','cmm_usu_usuario_modificado_por_id']
                        }
                    },
                    {
                        model: models.ControlMaestroMultiple,
                        as: 'tipo',
                        attributes: {
                            exclude: ['updatedAt', 'createdAt', 'cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','cmm_usu_usuario_modificado_por_id']
                        }
                    },
                    {
                        model: models.ProductoColeccion,
                        as: 'producto_coleccions',
                        include: [
                            {
                                model: models.Producto,
                                where:{
                                    prod_cmm_estatus_id: statusControles.ESTATUS_PRODUCTO.ACTIVO
                                },
                                include: [
                                    {
                                        model: models.ImagenProducto
                                    },
                                    {
                                        model: models.Marca,
                                        attributes: ['mar_nombre']
                                    }
                                ],
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
                                        'prod_meta_descripcion'
                                    ]
                                }
                            },
                        ]
                    }
                ],
                order: [
                    ['col_coleccion_id', 'ASC'],
                ],
            });


            console.log('PRO', colecciones);
            colecciones.forEach(async function(coleccion, indexColeccion){
                coleccion.dataValues.producto_coleccions.forEach(async function(producto, indexProducto){
                    const cantidadStock =  await sequelize.query(`
                            select sum(sp_cantidad) from stocks_productos sp  where sp_prod_producto_id = ` + producto.dataValues.prodcol_prod_producto_id + `;`, 
                        { 
                            type: sequelize.QueryTypes.SELECT 
                        });
                    console.log('Producto', producto.dataValues.prodcol_prod_producto_id, cantidadStock[0].sum);
                    producto.dataValues.cantidadStock =  Number(cantidadStock[0].sum);
                    if(((colecciones.length - 1) == indexColeccion) && ((coleccion.dataValues.producto_coleccions.length - 1) == indexProducto) ){
                        res.status(200).send({
                            message: 'Lista obtenida con éxito.',
                            colecciones
                        });
                    }
                });
            });
                    
        }catch(e){
            res.status(500).send({
                message: 'Error al obtener lista de colecciones',
                e
            });
            next(e);
        }
    }
}