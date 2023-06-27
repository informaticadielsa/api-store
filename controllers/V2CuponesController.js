import models from '../models';
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const { Op } = require("sequelize");
import statusControllers from '../mapeos/mapeoControlesMaestrosMultiples';

export default{

    //Crear Cupon
    createCupon: async(req, res, next) =>{
        var id_promocion_cupon_borrar_final = 0;
        try{

            //Valida si el cupon ya existe o si existe y esta "eliminado"
            const ValidarPromocionCupones = await models.PromocionCupones.findOne(
            {
                where: {
                    promcup_cupon_codigo: req.body.promcup_cupon_codigo,
                    promcup_estatus_id: { [Op.ne] : statusControllers.ESTATUS_CUPONES.ELIMINADA }
                } 
            });


            if(ValidarPromocionCupones)
            {
                res.status(500).send({
                    message: 'EL CUPON YA EXISTE'
                });
            }
            else
            {
                var errorBool = false
                var mensajeError = ''
                var sqlElementoCuponInsert = '';
                var sqlProductosCuponInsert = '';

                const bodyCreate = {
                    "promcup_nombre": req.body.promcup_nombre,
                    "promcup_descripcion": req.body.promcup_descripcion,
                    "promcup_estatus_id": statusControllers.ESTATUS_CUPONES.ACTIVO,
                    "promcup_fecha_inicio_validez": req.body.promcup_fecha_inicio_validez,
                    "promcup_fecha_finalizacion_validez": req.body.promcup_fecha_finalizacion_validez,
                    "promcup_tipo_descuento_id": req.body.promcup_tipo_descuento_id,
                    "promcup_descuento_exacto": req.body.promcup_descuento_exacto,
                    "promcup_valor_minimo_pedido": req.body.promcup_valor_minimo_pedido,
                    "promcup_usu_usuario_creado_id": req.body.promcup_usu_usuario_creado_id,
                    "promcup_cupon_codigo": req.body.promcup_cupon_codigo,
                    "promcup_prioridad": req.body.promcup_prioridad
                };
                     
                const constPromocionCupones = await models.PromocionCupones.create(bodyCreate);

                if(typeof constPromocionCupones.dataValues.promcup_promociones_cupones_id == 'number')
                {
                    id_promocion_cupon_borrar_final = constPromocionCupones.dataValues.promcup_promociones_cupones_id
                    //ELEMENTOS PROMOSION
                        var idPromocion = constPromocionCupones.dataValues.promcup_promociones_cupones_id;

                        if(req.body.elemento_cupones.length > 0)
                        {
                            var totalComasParaInsertar = req.body.elemento_cupones.length
                            sqlElementoCuponInsert = sqlElementoCuponInsert + `
                                INSERT INTO elementos_cupones (
                                    ec_promcup_promociones_cupones_id,
                                    ec_cat_categoria_id,
                                    ec_mar_marca_id,
                                    ec_sn_socios_negocio_id,
                                    ec_prod_producto_id,
                                    "createdAt" 
                                )
                                VALUES
                            `;

                            for (var i = 0; i < req.body.elemento_cupones.length; i++) 
                            {
                                if(req.body.elemento_cupones[i].ec_cat_categoria_id != null)
                                {
                                    sqlElementoCuponInsert = sqlElementoCuponInsert + `(
                                        `+idPromocion+`,
                                        `+req.body.elemento_cupones[i].ec_cat_categoria_id+`,
                                        null,
                                        null,
                                        null,
                                        now()
                                    )`;
                                }
                                else if(req.body.elemento_cupones[i].ec_mar_marca_id != null)
                                {
                                    sqlElementoCuponInsert = sqlElementoCuponInsert + `(
                                        `+idPromocion+`,
                                        null,
                                        `+req.body.elemento_cupones[i].ec_mar_marca_id+`,
                                        null,
                                        null,
                                        now()
                                    )`;
                                }
                                else if(req.body.elemento_cupones[i].ec_prod_producto_id != null)
                                {
                                    sqlElementoCuponInsert = sqlElementoCuponInsert + `(
                                        `+idPromocion+`,
                                        null,
                                        null,
                                        null,
                                        `+req.body.elemento_cupones[i].ec_prod_producto_id+`,
                                        now()
                                    )`;
                                }
                                else if(req.body.elemento_cupones[i].ec_sn_socios_negocio_id != null)
                                {
                                     sqlElementoCuponInsert = sqlElementoCuponInsert + `(
                                        `+idPromocion+`,
                                        null,
                                        null,
                                        `+req.body.elemento_cupones[i].ec_sn_socios_negocio_id+`,
                                        null,
                                        now()
                                        
                                    )`;
                                }

                                if(i+1 < totalComasParaInsertar)
                                {
                                    sqlElementoCuponInsert = sqlElementoCuponInsert + ","
                                }
                            }
                        }
                        else
                        {
                            mensajeError = 'Error: No existe una lista de elementos promocion'
                            errorBool = true
                        }
                    //Fin elementos promocion




                    //Productos Promocion
                        if(req.body.producto_cupones.length > 0)
                        {
                            var totalComasParaInsertar = req.body.producto_cupones.length
                            sqlProductosCuponInsert = sqlProductosCuponInsert + `
                                INSERT INTO productos_cupones (
                                    prodcup_promcup_promociones_cupones_id,
                                    prodcup_prod_producto_id,
                                    "createdAt"
                                )
                                VALUES
                            `;

                            for (var i = 0; i < req.body.producto_cupones.length; i++) 
                            {
                                sqlProductosCuponInsert = sqlProductosCuponInsert + `(
                                    `+idPromocion+`,
                                    `+req.body.producto_cupones[i].prodcup_prod_producto_id+`,
                                    now()
                                )`;

                                if(i+1 < totalComasParaInsertar)
                                {
                                    sqlProductosCuponInsert = sqlProductosCuponInsert + ","
                                }
                            }
                        }
                        else
                        {
                            mensajeError = 'Error: No fue posible obtener los productos con descuento en especifico'
                            errorBool = true
                        }
                    //Fin Productos Promocion


                    if(errorBool == true)
                    {
                        await models.PromocionCupones.destroy({
                            where: {
                                promcup_promociones_cupones_id: constPromocionCupones.dataValues.promcup_promociones_cupones_id
                            }
                        });
                        res.status(500).send({
                            message: mensajeError
                        });
                    }
                    else
                    {
                        const constsqlElementoCuponInsert = await sequelize.query(sqlElementoCuponInsert,
                        { 
                            type: sequelize.QueryTypes.SELECT 
                        });

                         const constsqlProductosCuponInsert = await sequelize.query(sqlProductosCuponInsert,
                        { 
                            type: sequelize.QueryTypes.SELECT 
                        });

                        res.status(200).send({
                            message: 'Creado con exito'
                        })
                    }
                }
            }
        }
        catch(e){
            if(id_promocion_cupon_borrar_final != 0)
            {
                await models.PromocionCupones.destroy({
                    where: {
                        promcup_promociones_cupones_id: id_promocion_cupon_borrar_final
                    }
                });
            }
            

            res.status(500).send({
                message: 'Error al crear Cupon',
                e
            });
            next(e);
        }
    },

    //delete promocion
    deleteCupon: async(req, res, next) =>{
        try{

            var id_promocion = req.body.promcup_promociones_cupones_id


            //Validadores de que existe la promocion
            const constPromocionCupones = await models.PromocionCupones.findOne(
            {
                where: {
                    promcup_promociones_cupones_id: id_promocion
                } 
            });
            const constElementosCupones = await models.ElementosCupones.findAll(
            {
                where: {
                    ec_promcup_promociones_cupones_id: id_promocion
                } 
            });
            const constProductoCupones = await models.ProductoCupones.findAll(
            {
                where: {
                    prodcup_promcup_promociones_cupones_id: id_promocion
                } 
            });


            //Si todas las busquedas encontraron algo significa que podra borrar todo
            if(constPromocionCupones)
            {
            
                await models.ProductoCupones.destroy({
                    where: {
                        prodcup_promcup_promociones_cupones_id: id_promocion
                    }
                });

                await models.ElementosCupones.destroy({
                    where: {
                        ec_promcup_promociones_cupones_id: id_promocion
                    }
                });

                await constPromocionCupones.update({
                    promcup_estatus_id: statusControllers.ESTATUS_CUPONES.ELIMINADA,
                    promcup_usu_usuario_modificador_id : req.body.promcup_usu_usuario_modificador_id,
                    updatedAt: Date()
                });

                
                // Retornara el id del nuevo carrito
                res.status(200).send({
                    message: 'Cupon Eliminada con exito'
                })
            }
            else
            {
                res.status(500).send({
                    message: 'No se encontro el cupon'
                });
            }
        }
        catch(e){
            res.status(500).send({
                message: 'Error al borrar el cupon',
                e
            });
            next(e);
        }
    },

    //get Cupon
    getCupon: async(req, res, next) =>{
        try{
            var id_promocion = req.params.id_promocion
   
            //Validadores de que existe la promocion
            const constPromocionCupones = await models.PromocionCupones.findOne(
            {
                where: {
                    promcup_promociones_cupones_id: id_promocion,
                    promcup_estatus_id: { [Op.ne] : statusControllers.ESTATUS_CUPONES.ELIMINADA }
                }
            });

            if(constPromocionCupones)
            {
                //Elementos Promocion
                const constElementosCupones = await models.ElementosCupones.findAll(
                {
                    where: {
                        ec_promcup_promociones_cupones_id: id_promocion
                    }
                });

                //Agregar informacion a los elementos de promocion
                for (var j = 0; j < constElementosCupones.length; j++) 
                {
                    constElementosCupones[j].dataValues.categorium = null;
                    constElementosCupones[j].dataValues.marca = null;
                    constElementosCupones[j].dataValues.sociosnegocio = null;
                    constElementosCupones[j].dataValues.producto = null;


                    if(constElementosCupones[j].dataValues.ec_cat_categoria_id != null)
                    {
                        const constCategoria = await models.Categoria.findAll(
                        {
                            where: {
                                cat_categoria_id: constElementosCupones[j].dataValues.ec_cat_categoria_id
                            } 
                        });
                        constElementosCupones[j].dataValues.categorium = constCategoria
                    }

                    else if(constElementosCupones[j].dataValues.ec_mar_marca_id != null)
                    {
                        const constMarca = await models.Marca.findAll(
                        {
                            where: {
                                mar_marca_id: constElementosCupones[j].dataValues.ec_mar_marca_id
                            } 
                        });
                        constElementosCupones[j].dataValues.marca = constMarca
                    }

                    else if(constElementosCupones[j].dataValues.ec_sn_socios_negocio_id != null)
                    {
                        const constSociosNegocio = await models.SociosNegocio.findAll(
                        {
                            where: {
                                sn_socios_negocio_id: constElementosCupones[j].dataValues.ec_sn_socios_negocio_id
                            } 
                        });
                        constElementosCupones[j].dataValues.sociosnegocio = constSociosNegocio
                    }

                    else if(constElementosCupones[j].dataValues.ec_prod_producto_id != null)
                    {
                        const constProducto = await models.Producto.findAll(
                        {
                            where: {
                                prod_producto_id: constElementosCupones[j].dataValues.ec_prod_producto_id
                            } 
                        });
                        constElementosCupones[j].dataValues.producto = constProducto
                        
                    }
                }

                //Productos de promocion
                const constProductoCupones = await models.ProductoCupones.findAll(
                {
                    where: {
                        prodcup_promcup_promociones_cupones_id: id_promocion
                    } 
                });

                //Add to json
                constPromocionCupones.dataValues.elemento_promocion = constElementosCupones
                constPromocionCupones.dataValues.producto_promocion = constProductoCupones


                var arrayProductosID = [];
                for (var i = 0; i < constProductoCupones.length; i++) 
                {
                    arrayProductosID.push(constProductoCupones[i].prodcup_prod_producto_id)
                }

                //Productos de promocion
                const constProducto = await models.Producto.findAll(
                {
                    where: 
                    {
                        prod_producto_id: 
                        {
                            [Op.in]: arrayProductosID
                        }
                    }
                });

                res.status(200).send({
                    message: 'Cupon Obtenido',
                    promocion_cupon: constPromocionCupones,
                    productos_to_cupon :constProducto
                })
            }
            else
            {
                res.status(200).send({
                    message: 'Cupon No Encontrada'
                })
            }
        }
        catch(e){
            res.status(500).send({
                message: 'Error al obtener el cupon',
                e
            });
            next(e);
        }
    },

    //update Cupon
    updateCupon: async(req, res, next) =>{
        try{
            var errorBool = false
            var sqlElementoCuponInsert = '';
            var sqlProductosCuponInsert = '';
            var idPromocion = req.body.promcup_promociones_cupones_id
            var cuponOkEditable = true;

            console.log(idPromocion)
   
            //Validadores de que existe la promocion
            const constPromocionCupones = await models.PromocionCupones.findOne(
            {
                where: {
                    promcup_promociones_cupones_id: idPromocion,
                    promcup_estatus_id: { [Op.ne] : statusControllers.ESTATUS_CUPONES.ELIMINADA }
                } 
            });


            if(req.body.promcup_cupon_codigo != constPromocionCupones.promcup_cupon_codigo)
            {
                //Validar que el cupon "nuevo" no exista ya
                const constPromocionCupones = await models.PromocionCupones.findOne(
                {
                    where: {
                        promcup_cupon_codigo: req.body.promcup_cupon_codigo,
                        promcup_promociones_cupones_id: { [Op.ne] : req.body.promcup_promociones_cupones_id },
                        promcup_estatus_id: { [Op.ne] : statusControllers.ESTATUS_CUPONES.ELIMINADA }
                    }
                });

                
                if(constPromocionCupones)
                {
                    cuponOkEditable = false
                }
            }




            //Si la promocion existe
            if(constPromocionCupones && cuponOkEditable == true)
            {
                //Promociones elementos
                    if(req.body.elemento_cupones.length > 0)
                    {
                        var totalComasParaInsertar = req.body.elemento_cupones.length
                        sqlElementoCuponInsert = sqlElementoCuponInsert + `
                            INSERT INTO elementos_cupones (
                                ec_promcup_promociones_cupones_id,
                                ec_cat_categoria_id,
                                ec_mar_marca_id,
                                ec_sn_socios_negocio_id,
                                ec_prod_producto_id,
                                "createdAt" 
                            )
                            VALUES
                        `;

                        for (var i = 0; i < req.body.elemento_cupones.length; i++) 
                        {
                            if(req.body.elemento_cupones[i].ec_cat_categoria_id != null)
                            {
                                sqlElementoCuponInsert = sqlElementoCuponInsert + `(
                                    `+idPromocion+`,
                                    `+req.body.elemento_cupones[i].ec_cat_categoria_id+`,
                                    null,
                                    null,
                                    null,
                                    now()
                                )`;
                            }
                            else if(req.body.elemento_cupones[i].ec_mar_marca_id != null)
                            {
                                sqlElementoCuponInsert = sqlElementoCuponInsert + `(
                                    `+idPromocion+`,
                                    null,
                                    `+req.body.elemento_cupones[i].ec_mar_marca_id+`,
                                    null,
                                    null,
                                    now()
                                )`;
                            }
                            else if(req.body.elemento_cupones[i].ec_prod_producto_id != null)
                            {
                                sqlElementoCuponInsert = sqlElementoCuponInsert + `(
                                    `+idPromocion+`,
                                    null,
                                    null,
                                    null,
                                    `+req.body.elemento_cupones[i].ec_prod_producto_id+`,
                                    now()
                                )`;
                            }
                            else if(req.body.elemento_cupones[i].ec_sn_socios_negocio_id != null)
                            {
                                 sqlElementoCuponInsert = sqlElementoCuponInsert + `(
                                    `+idPromocion+`,
                                    null,
                                    null,
                                    `+req.body.elemento_cupones[i].ec_sn_socios_negocio_id+`,
                                    null,
                                    now()
                                    
                                )`;
                            }

                            if(i+1 < totalComasParaInsertar)
                            {
                                sqlElementoCuponInsert = sqlElementoCuponInsert + ","
                            }
                        }
                    }
                    else
                    {
                        mensajeError = 'Error: No existe una lista de elementos cupones'
                        errorBool = true
                    }
                //Fin elementos promocion

                //Productos Promocion
                    if(req.body.producto_cupon.length > 0)
                    {
                        var totalComasParaInsertar = req.body.producto_cupon.length
                        sqlProductosCuponInsert = sqlProductosCuponInsert + `
                            INSERT INTO productos_cupones (
                                prodcup_promcup_promociones_cupones_id,
                                prodcup_prod_producto_id,
                                "createdAt"
                            )
                            VALUES
                        `;

                        for (var i = 0; i < req.body.producto_cupon.length; i++) 
                        {
                            sqlProductosCuponInsert = sqlProductosCuponInsert + `(
                                `+idPromocion+`,
                                `+req.body.producto_cupon[i].prodcup_prod_producto_id+`,
                                now()
                            )`;

                            if(i+1 < totalComasParaInsertar)
                            {
                                sqlProductosCuponInsert = sqlProductosCuponInsert + ","
                            }
                        }
                    }
                    else
                    {
                        mensajeError = 'Error: No fue posible obtener los productos con descuento en especifico'
                        errorBool = true
                    }
                //Fin Productos Promocion


                if(errorBool == true)
                {
                    res.status(500).send({
                        message: "No se genero correctamente los elementos o los productos con promocion"
                    });
                }
                else
                {
                    //Si se generaron los sql correctamente intentara hacer update a la promocion
                    if(sqlProductosCuponInsert != '' && sqlElementoCuponInsert != '')
                    {
                        //Actualizador
                        await constPromocionCupones.update({
                            promcup_nombre : !!req.body.promcup_nombre ? req.body.promcup_nombre : constPromocionCupones.dataValues.promcup_nombre,
                            promcup_descripcion : !!req.body.promcup_descripcion ? req.body.promcup_descripcion : constPromocionCupones.dataValues.promcup_descripcion,
                            promcup_estatus_id : !!req.body.promcup_estatus_id ? req.body.promcup_estatus_id : constPromocionCupones.dataValues.promcup_estatus_id,
                            promcup_fecha_inicio_validez : !!req.body.promcup_fecha_inicio_validez ? req.body.promcup_fecha_inicio_validez : constPromocionCupones.dataValues.promcup_fecha_inicio_validez,
                            promcup_fecha_finalizacion_validez : !!req.body.promcup_fecha_finalizacion_validez ? req.body.promcup_fecha_finalizacion_validez : constPromocionCupones.dataValues.promcup_fecha_finalizacion_validez,
                            promcup_tipo_descuento_id : !!req.body.promcup_tipo_descuento_id ? req.body.promcup_tipo_descuento_id : constPromocionCupones.dataValues.promcup_tipo_descuento_id,
                            promcup_descuento_exacto : !!req.body.promcup_descuento_exacto ? req.body.promcup_descuento_exacto : constPromocionCupones.dataValues.promcup_descuento_exacto,
                            promcup_valor_minimo_pedido : !!req.body.promcup_valor_minimo_pedido ? req.body.promcup_valor_minimo_pedido : constPromocionCupones.dataValues.promcup_valor_minimo_pedido,
                            promcup_usu_usuario_modificador_id : !!req.body.promcup_usu_usuario_modificador_id ? req.body.promcup_usu_usuario_modificador_id : constPromocionCupones.dataValues.promcup_usu_usuario_modificador_id,
                            promcup_cupon_codigo : !!req.body.promcup_cupon_codigo ? req.body.promcup_cupon_codigo : constPromocionCupones.dataValues.promcup_cupon_codigo,
                            promcup_prioridad : !!req.body.promcup_prioridad ? req.body.promcup_prioridad : constPromocionCupones.dataValues.promcup_prioridad,
                            updatedAt: Date()
                        });

                        //Elimina los productos de la promocion
                        await models.ProductoCupones.destroy({
                            where: {
                                prodcup_promcup_promociones_cupones_id: idPromocion
                            }
                        });

                        //Elimina los elementos de la promocion
                        await models.ElementosCupones.destroy({
                            where: {
                                ec_promcup_promociones_cupones_id: idPromocion
                            }
                        });

                        const constsqlElementoCuponInsert = await sequelize.query(sqlElementoCuponInsert,
                        { 
                            type: sequelize.QueryTypes.SELECT 
                        });

                         const constsqlProductosCuponInsert = await sequelize.query(sqlProductosCuponInsert,
                        { 
                            type: sequelize.QueryTypes.SELECT 
                        });

                        //Respuesa final
                        res.status(200).send({
                            message: 'Se actualizo con exito.'
                        })
                    }
                    else
                    {
                        res.status(200).send({
                            message: 'No se genero correctamente la busqueda de elementos.'
                        })
                    }
                }
            }
            else
            {
                res.status(200).send({
                    message: 'Cupon No Encontrado o codigo cupon ya existe'
                })
            }
        }
        catch(e){
            res.status(500).send({
                message: 'Error al actualizar el cupon',
                e
            });
            next(e);
        }
    },

    //Lista de promociones
    getListCupones: async(req, res, next) =>{
        try{
            //Validadores de que existe la promocion
            const constPromocionCupones = await models.PromocionCupones.findAll(
            {
                where: {
                    promcup_estatus_id: { [Op.ne] : statusControllers.ESTATUS_CUPONES.ELIMINADA }
                } 
            });

            res.status(200).send({
                message: 'Lista de cupones',
                constPromocionCupones
            })
        }
        catch(e){
            res.status(500).send({
                message: 'Error al obtener la lista de cupones',
                e
            });
            next(e);
        }
    },

    //update Cupon
    updateCuponStatus: async(req, res, next) =>{
        try{
            const constPromocionCupones = await models.PromocionCupones.findOne({
                where: {
                    promcup_promociones_cupones_id: req.body.promcup_promociones_cupones_id
                }
            });

            constPromocionCupones.update({
                promcup_estatus_id: !!req.body.promcup_estatus_id ? req.body.promcup_estatus_id : promocion_descuento.dataValues.promcup_estatus_id,
                promcup_usu_usuario_modificador_id: !!req.body.promcup_usu_usuario_modificador_id ? req.body.promcup_usu_usuario_modificador_id : promocion_descuento.dataValues.promcup_usu_usuario_modificador_id
            });
            
            res.status(200).send({
                message: 'Cupon Actualizado con exito'
            })
        }
        catch(e){
            res.status(500).send({
                message: 'Error al actualizar el cupon',
                e
            });
            next(e);
        }
    },



    
}