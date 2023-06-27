import models from '../models';
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const { Op } = require("sequelize");
import statusControllers from '../mapeos/mapeoControlesMaestrosMultiples';

export default{

    getProductForPromotions: async(req, res, next) =>{
        try{
            

            if(req.body.categorias.length > 0 || req.body.marcas.length > 0 || req.body.productos.length > 0)
            {
                //Sql para traer productos que coincidan
                var querySQL = `
                    select 
                        prod_producto_id, 
                        prod_sku, 
                        prod_nombre,
                        prod_descripcion,
                        prod_nombre_extranjero,
                        prod_cat_categoria_id, 
                        prod_mar_marca_id,
                        prod_prod_producto_padre_sku
                    from 
                        productos p 
                    where
                        p.prod_cmm_estatus_id != 1000018
                `;
                

                if(req.body.categorias.length > 0)
                {

                    //Si es solo una categoria no agregara comas y mas al sql
                    if(req.body.categorias.length == 1)
                    {
                        querySQL += 
                        ` 
                            and prod_sku in (
                            select
                                p2.prod_sku 
                            from 
                                productos p2 
                            where
                                prod_prod_producto_padre_sku in (select p3.prod_sku from productos p3 where p3.prod_cmm_estatus_id != 1000018 and p3.prod_cat_categoria_id in(`+req.body.categorias[0].cat_categoria_id+`))
                            )
                        `
                    }
                    //Si es mas de 1 se agregaranm comas y se eliminara la ultima al query de in
                    else
                    {
                        //Metodo que saca solo los id y los concatena para un in en sql
                            var ListaIdsCategorias = '';
                            for (var i = 0; i < req.body.categorias.length; i++) 
                            {
                                ListaIdsCategorias = ListaIdsCategorias + req.body.categorias[i].cat_categoria_id

                                if(i+1 < req.body.categorias.length)
                                {
                                    ListaIdsCategorias = ListaIdsCategorias + ","
                                }
                            }
                        //Fin metodo

                        //Sumar al query in todos los id
                        querySQL += 
                        ` 
                            and prod_sku in (
                            select
                                p2.prod_sku 
                            from 
                                productos p2 
                            where
                                prod_prod_producto_padre_sku in (select p3.prod_sku from productos p3 where p3.prod_cmm_estatus_id != 1000018 and p3.prod_cat_categoria_id in(`+ListaIdsCategorias+`))
                            )
                        `
                    }
                }

                if(req.body.marcas.length > 0)
                {
                    //Si es solo una categoria no agregara comas y mas al sql
                    if(req.body.marcas.length == 1)
                    {
                        querySQL += 
                        ` 

                            and prod_sku in (
                            select
                                p2.prod_sku 
                            from 
                                productos p2 
                            where
                                prod_prod_producto_padre_sku in (select p3.prod_sku from productos p3 where p3.prod_cmm_estatus_id != 1000018 and p3.prod_mar_marca_id in (`+req.body.marcas[0].mar_marca_id+`))
                            ) 
                        `
                    }
                    //Si es mas de 1 se agregaranm comas y se eliminara la ultima al query de in
                    else
                    {
                        //Metodo que saca solo los id y los concatena para un in en sql
                            var ListaIdsMarcas = '';
                            for (var i = 0; i < req.body.marcas.length; i++) 
                            {
                                ListaIdsMarcas = ListaIdsMarcas + req.body.marcas[i].mar_marca_id

                                if(i+1 < req.body.marcas.length)
                                {
                                    ListaIdsMarcas = ListaIdsMarcas + ","
                                }
                            }
                        //Fin metodo

                        //Sumar al query in todos los id
                        querySQL += 
                        ` 
                            and prod_sku in (
                            select
                                p2.prod_sku 
                            from 
                                productos p2 
                            where
                                prod_prod_producto_padre_sku in (select p3.prod_sku from productos p3 where p3.prod_cmm_estatus_id != 1000018 and p3.prod_mar_marca_id in (`+ListaIdsMarcas+`))
                            )
                        `
                    }
                }

                if(req.body.productos.length > 0)
                {


                    //Si solo trae productos sin categorias y marcas la busqueda agregara el and si trae marcas y categorias añade un or
                    if(req.body.marcas.length > 0 || req.body.categorias.length > 0)
                    {
                        querySQL += 
                        ` 
                            or
                        `
                    }
                    else
                    {
                        querySQL += 
                        ` 
                            and
                        `
                    }


                    //Si es solo una categoria no agregara comas y mas al sql
                    if(req.body.productos.length == 1)
                    {
                        querySQL += 
                        ` 
                            p.prod_producto_id in (`+req.body.productos[0].prod_producto_id+`) 
                        `
                    }
                    //Si es mas de 1 se agregaranm comas y se eliminara la ultima al query de in
                    else
                    {
                        //Metodo que saca solo los id y los concatena para un in en sql
                            var ListaIdsProductos = '';
                            for (var i = 0; i < req.body.productos.length; i++) 
                            {
                                ListaIdsProductos = ListaIdsProductos + req.body.productos[i].prod_producto_id

                                if(i+1 < req.body.productos.length)
                                {
                                    ListaIdsProductos = ListaIdsProductos + ","
                                }
                            }
                        //Fin metodo

                        //Sumar al query in todos los id
                        querySQL += 
                        ` 
                            p.prod_producto_id in (`+ListaIdsProductos+`) 
                        `
                    }
                }
                querySQL += 
                ` 
                    order by p.prod_sku
                `

                //Constante con los productos a regresar
                const constGetProductForPromotions = await sequelize.query(querySQL,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });


                //
                res.status(200).send({
                    message: 'Productos para promocion generados con exito',
                    constGetProductForPromotions
                })

            }
            else
            {
                res.status(200).send({
                    message: 'Productos para promocion generados con exito',
                    constGetProductForPromotions: []
                })


            }
            
        }
        catch(e){
            res.status(500).send({
                message: 'Error al listar productos para las promociones',
                e
            });
            next(e);
        }
    },

    //Crear promocion
    createPromocion: async(req, res, next) =>{
        var id_promocion_cupon_borrar_final = 0;
        try{
            var errorBool = false
            var mensajeError = ''
            var sqlElementoPromocionInsert = '';
            var sqlProductosPromocionInsert = '';

            const bodyCreate = {
                "promdes_nombre": req.body.promdes_nombre,
                "promdes_descripcion": req.body.promdes_descripcion,
                "promdes_estatus_id": statusControllers.ESTATUS_PROMOCION.ACTIVA,
                "promdes_fecha_inicio_validez": req.body.promdes_fecha_inicio_validez,
                "promdes_fecha_finalizacion_validez": req.body.promdes_fecha_finalizacion_validez,
                "promdes_tipo_descuento_id": req.body.promdes_tipo_descuento_id,
                "promdes_descuento_exacto": req.body.promdes_descuento_exacto,
                "promdes_valor_minimo_pedido": req.body.promdes_valor_minimo_pedido,
                "promdes_usu_usuario_creado_id": req.body.promdes_usu_usuario_creado_id,
                "promdes_prioridad": req.body.promdes_prioridad
            };
            
            const constPromocionDescuento = await models.PromocionDescuento.create(bodyCreate);

            if(typeof constPromocionDescuento.dataValues.promdes_promocion_descuento_id == 'number')
            {
                id_promocion_cupon_borrar_final = constPromocionDescuento.dataValues.promdes_promocion_descuento_id;

                //ELEMENTOS PROMOSION
                    var idPromocion = constPromocionDescuento.dataValues.promdes_promocion_descuento_id;

                    if(req.body.elemento_promocion.length > 0)
                    {
                        var totalComasParaInsertar = req.body.elemento_promocion.length
                        sqlElementoPromocionInsert = sqlElementoPromocionInsert + `
                            INSERT INTO elementos_promocion (
                                ep_promdes_promocion_descuento_id,
                                ep_cat_categoria_id,
                                ep_mar_marca_id,
                                ep_sn_socios_negocio_id,
                                ep_prod_producto_id,
                                "createdAt" 
                            )
                            VALUES
                        `;

                        for (var i = 0; i < req.body.elemento_promocion.length; i++) 
                        {
                            if(req.body.elemento_promocion[i].ep_cat_categoria_id != null)
                            {
                                sqlElementoPromocionInsert = sqlElementoPromocionInsert + `(
                                    `+idPromocion+`,
                                    `+req.body.elemento_promocion[i].ep_cat_categoria_id+`,
                                    null,
                                    null,
                                    null,
                                    now()
                                )`;
                            }
                            else if(req.body.elemento_promocion[i].ep_mar_marca_id != null)
                            {
                                sqlElementoPromocionInsert = sqlElementoPromocionInsert + `(
                                    `+idPromocion+`,
                                    null,
                                    `+req.body.elemento_promocion[i].ep_mar_marca_id+`,
                                    null,
                                    null,
                                    now()
                                )`;
                            }
                            else if(req.body.elemento_promocion[i].ep_prod_producto_id != null)
                            {
                                sqlElementoPromocionInsert = sqlElementoPromocionInsert + `(
                                    `+idPromocion+`,
                                    null,
                                    null,
                                    null,
                                    `+req.body.elemento_promocion[i].ep_prod_producto_id+`,
                                    now()
                                )`;
                            }
                            else if(req.body.elemento_promocion[i].ep_sn_socios_negocio_id != null)
                            {
                                 sqlElementoPromocionInsert = sqlElementoPromocionInsert + `(
                                    `+idPromocion+`,
                                    null,
                                    null,
                                    `+req.body.elemento_promocion[i].ep_sn_socios_negocio_id+`,
                                    null,
                                    now()
                                    
                                )`;
                            }

                            if(i+1 < totalComasParaInsertar)
                            {
                                sqlElementoPromocionInsert = sqlElementoPromocionInsert + ","
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
                    if(req.body.producto_promocion.length > 0)
                    {
                        var totalComasParaInsertar = req.body.producto_promocion.length
                        sqlProductosPromocionInsert = sqlProductosPromocionInsert + `
                            INSERT INTO productos_promociones (
                                prodprom_promdes_promocion_descuento_id,
                                prodprom_prod_producto_id,
                                "createdAt"
                            )
                            VALUES
                        `;

                        for (var i = 0; i < req.body.producto_promocion.length; i++) 
                        {
                            sqlProductosPromocionInsert = sqlProductosPromocionInsert + `(
                                `+idPromocion+`,
                                `+req.body.producto_promocion[i].prodprom_prod_producto_id+`,
                                now()
                            )`;

                            if(i+1 < totalComasParaInsertar)
                            {
                                sqlProductosPromocionInsert = sqlProductosPromocionInsert + ","
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
                    await models.PromocionDescuento.destroy({
                        where: {
                            promdes_promocion_descuento_id: constPromocionDescuento.dataValues.promdes_promocion_descuento_id
                        }
                    });
                    res.status(500).send({
                        message: mensajeError
                    });
                }
                else
                {
                    const constsqlElementoPromocionInsert = await sequelize.query(sqlElementoPromocionInsert,
                    { 
                        type: sequelize.QueryTypes.SELECT 
                    });

                     const constsqlProductosPromocionInsert = await sequelize.query(sqlProductosPromocionInsert,
                    { 
                        type: sequelize.QueryTypes.SELECT 
                    });

                    res.status(200).send({
                        message: 'Creado con exito'
                    })
                }
            }
        }
        catch(e){
            if(id_promocion_cupon_borrar_final)
            {
                await models.PromocionDescuento.destroy({
                    where: {
                        promdes_promocion_descuento_id: id_promocion_cupon_borrar_final
                    }
                });
            }
            res.status(500).send({
                message: 'Error al crear la promocion',
                e
            });
            next(e);
        }
    },

    //delete promocion
    deletePromocion: async(req, res, next) =>{
        try{

            var id_promocion = req.body.promdes_promocion_descuento_id


            //Validadores de que existe la promocion
            const constPromocionDescuento = await models.PromocionDescuento.findOne(
            {
                where: {
                    promdes_promocion_descuento_id: id_promocion
                } 
            });
            const constElementoPromocion = await models.ElementoPromocion.findAll(
            {
                where: {
                    ep_promdes_promocion_descuento_id: id_promocion
                } 
            });
            const constProductoPromocion = await models.ProductoPromocion.findAll(
            {
                where: {
                    prodprom_promdes_promocion_descuento_id: id_promocion
                } 
            });


            //Si todas las busquedas encontraron algo significa que podra borrar todo
            if(constPromocionDescuento)
            {
            
                await models.ProductoPromocion.destroy({
                    where: {
                        prodprom_promdes_promocion_descuento_id: id_promocion
                    }
                });

                await models.ElementoPromocion.destroy({
                    where: {
                        ep_promdes_promocion_descuento_id: id_promocion
                    }
                });

                await constPromocionDescuento.update({
                    promdes_estatus_id: statusControllers.ESTATUS_PROMOCION.ELIMINADA,
                    promdes_usu_usuario_modificador_id : req.body.promdes_usu_usuario_modificador_id,
                    updatedAt: Date()
                });

                
                // 
                res.status(200).send({
                    message: 'Promocion Borrada con exito'
                })
            }
            else
            {
                res.status(500).send({
                    message: 'Error: No se encontro relacion de productos promocion'
                });
            }
        }
        catch(e){
            res.status(500).send({
                message: 'Error al borrar la promocion',
                e
            });
            next(e);
        }
    },
    
    //get Promocion
    getPromocion: async(req, res, next) =>{
        try{
            var id_promocion = req.params.id_promocion
   
            //Validadores de que existe la promocion
            const constPromocionDescuento = await models.PromocionDescuento.findOne(
            {
                where: {
                    promdes_promocion_descuento_id: id_promocion,
                    promdes_estatus_id: { [Op.ne] : statusControllers.ESTATUS_PROMOCION.ELIMINADA }
                }
            });


            if(constPromocionDescuento)
            {
                //Elementos Promocion
                const constElementoPromocion = await models.ElementoPromocion.findAll(
                {
                    where: {
                        ep_promdes_promocion_descuento_id: id_promocion
                    } 
                });

                
                //Agregar informacion a los elementos de promocion
                for (var j = 0; j < constElementoPromocion.length; j++) 
                {
                    constElementoPromocion[j].dataValues.categorium = null;
                    constElementoPromocion[j].dataValues.marca = null;
                    constElementoPromocion[j].dataValues.sociosnegocio = null;
                    constElementoPromocion[j].dataValues.producto = null;


                    if(constElementoPromocion[j].dataValues.ep_cat_categoria_id != null)
                    {
                        const constCategoria = await models.Categoria.findAll(
                        {
                            where: {
                                cat_categoria_id: constElementoPromocion[j].dataValues.ep_cat_categoria_id
                            } 
                        });
                        constElementoPromocion[j].dataValues.categorium = constCategoria
                    }

                    else if(constElementoPromocion[j].dataValues.ep_mar_marca_id != null)
                    {
                        const constMarca = await models.Marca.findAll(
                        {
                            where: {
                                mar_marca_id: constElementoPromocion[j].dataValues.ep_mar_marca_id
                            } 
                        });
                        constElementoPromocion[j].dataValues.marca = constMarca
                    }

                    else if(constElementoPromocion[j].dataValues.ep_sn_socios_negocio_id != null)
                    {
                        const constSociosNegocio = await models.SociosNegocio.findAll(
                        {
                            where: {
                                sn_socios_negocio_id: constElementoPromocion[j].dataValues.ep_sn_socios_negocio_id
                            } 
                        });
                        constElementoPromocion[j].dataValues.sociosnegocio = constSociosNegocio
                    }

                    else if(constElementoPromocion[j].dataValues.ep_prod_producto_id != null)
                    {
                        const constProducto = await models.Producto.findAll(
                        {
                            where: {
                                prod_producto_id: constElementoPromocion[j].dataValues.ep_prod_producto_id
                            } 
                        });
                        constElementoPromocion[j].dataValues.producto = constProducto
                        
                    }
                }




                //Productos de promocion
                const constProductoPromocion = await models.ProductoPromocion.findAll(
                {
                    where: {
                        prodprom_promdes_promocion_descuento_id: id_promocion
                    } 
                });

                //Add to json
                constPromocionDescuento.dataValues.elemento_promocion = constElementoPromocion
                constPromocionDescuento.dataValues.producto_promocion = constProductoPromocion


                var arrayProductosID = [];
                for (var i = 0; i < constProductoPromocion.length; i++) 
                {
                    arrayProductosID.push(constProductoPromocion[i].prodprom_prod_producto_id)
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
                    message: 'Promocion Obtenida',
                    promocion_descuento: constPromocionDescuento,
                    productos_to_promotion :constProducto
                })
            }
            else
            {
                res.status(200).send({
                    message: 'Promocion No Encontrada'
                })
            }
        }
        catch(e){
            res.status(500).send({
                message: 'Error al borrar la promocion',
                e
            });
            next(e);
        }
    },

    //get Promocion
    updatePromocion: async(req, res, next) =>{
        try{
            var errorBool = false
            var sqlElementoPromocionInsert = '';
            var sqlProductosPromocionInsert = '';
            var idPromocion = req.body.promdes_promocion_descuento_id
   
            //Validadores de que existe la promocion
            const constPromocionDescuento = await models.PromocionDescuento.findOne(
            {
                where: {
                    promdes_promocion_descuento_id: idPromocion,
                    promdes_estatus_id: { [Op.ne] : statusControllers.ESTATUS_PROMOCION.ELIMINADA }
                } 
            });

            //Si la promocion existe
            if(constPromocionDescuento)
            {
                //Promociones elementos
                    if(req.body.elemento_promocion.length > 0)
                    {
                        var totalComasParaInsertar = req.body.elemento_promocion.length
                        sqlElementoPromocionInsert = sqlElementoPromocionInsert + `
                            INSERT INTO elementos_promocion (
                                ep_promdes_promocion_descuento_id,
                                ep_cat_categoria_id,
                                ep_mar_marca_id,
                                ep_sn_socios_negocio_id,
                                ep_prod_producto_id,
                                "createdAt" 
                            )
                            VALUES
                        `;

                        for (var i = 0; i < req.body.elemento_promocion.length; i++) 
                        {
                            if(req.body.elemento_promocion[i].ep_cat_categoria_id != null)
                            {
                                sqlElementoPromocionInsert = sqlElementoPromocionInsert + `(
                                    `+idPromocion+`,
                                    `+req.body.elemento_promocion[i].ep_cat_categoria_id+`,
                                    null,
                                    null,
                                    null,
                                    now()
                                )`;
                            }
                            else if(req.body.elemento_promocion[i].ep_mar_marca_id != null)
                            {
                                sqlElementoPromocionInsert = sqlElementoPromocionInsert + `(
                                    `+idPromocion+`,
                                    null,
                                    `+req.body.elemento_promocion[i].ep_mar_marca_id+`,
                                    null,
                                    null,
                                    now()
                                )`;
                            }
                            else if(req.body.elemento_promocion[i].ep_prod_producto_id != null)
                            {
                                sqlElementoPromocionInsert = sqlElementoPromocionInsert + `(
                                    `+idPromocion+`,
                                    null,
                                    null,
                                    null,
                                    `+req.body.elemento_promocion[i].ep_prod_producto_id+`,
                                    now()
                                )`;
                            }
                            else if(req.body.elemento_promocion[i].ep_sn_socios_negocio_id != null)
                            {
                                 sqlElementoPromocionInsert = sqlElementoPromocionInsert + `(
                                    `+idPromocion+`,
                                    null,
                                    null,
                                    `+req.body.elemento_promocion[i].ep_sn_socios_negocio_id+`,
                                    null,
                                    now()
                                    
                                )`;
                            }

                            if(i+1 < totalComasParaInsertar)
                            {
                                sqlElementoPromocionInsert = sqlElementoPromocionInsert + ","
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
                    if(req.body.producto_promocion.length > 0)
                    {
                        var totalComasParaInsertar = req.body.producto_promocion.length
                        sqlProductosPromocionInsert = sqlProductosPromocionInsert + `
                            INSERT INTO productos_promociones (
                                prodprom_promdes_promocion_descuento_id,
                                prodprom_prod_producto_id,
                                "createdAt"
                            )
                            VALUES
                        `;

                        for (var i = 0; i < req.body.producto_promocion.length; i++) 
                        {
                            sqlProductosPromocionInsert = sqlProductosPromocionInsert + `(
                                `+idPromocion+`,
                                `+req.body.producto_promocion[i].prodprom_prod_producto_id+`,
                                now()
                            )`;

                            if(i+1 < totalComasParaInsertar)
                            {
                                sqlProductosPromocionInsert = sqlProductosPromocionInsert + ","
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
                    if(sqlProductosPromocionInsert != '' && sqlElementoPromocionInsert != '')
                    {
                        //Actualizador
                        await constPromocionDescuento.update({
                            promdes_nombre : !!req.body.promdes_nombre ? req.body.promdes_nombre : constPromocionDescuento.dataValues.promdes_nombre,
                            promdes_descripcion : !!req.body.promdes_descripcion ? req.body.promdes_descripcion : constPromocionDescuento.dataValues.promdes_descripcion,
                            promdes_estatus_id : !!req.body.promdes_estatus_id ? req.body.promdes_estatus_id : constPromocionDescuento.dataValues.promdes_estatus_id,
                            promdes_fecha_inicio_validez : !!req.body.promdes_fecha_inicio_validez ? req.body.promdes_fecha_inicio_validez : constPromocionDescuento.dataValues.promdes_fecha_inicio_validez,
                            promdes_fecha_finalizacion_validez : !!req.body.promdes_fecha_finalizacion_validez ? req.body.promdes_fecha_finalizacion_validez : constPromocionDescuento.dataValues.promdes_fecha_finalizacion_validez,
                            promdes_tipo_descuento_id : !!req.body.promdes_tipo_descuento_id ? req.body.promdes_tipo_descuento_id : constPromocionDescuento.dataValues.promdes_tipo_descuento_id,
                            promdes_descuento_exacto : !!req.body.promdes_descuento_exacto ? req.body.promdes_descuento_exacto : constPromocionDescuento.dataValues.promdes_descuento_exacto,
                            promdes_valor_minimo_pedido : !!req.body.promdes_valor_minimo_pedido ? req.body.promdes_valor_minimo_pedido : constPromocionDescuento.dataValues.promdes_valor_minimo_pedido,
                            promdes_usu_usuario_modificador_id : !!req.body.promdes_usu_usuario_modificador_id ? req.body.promdes_usu_usuario_modificador_id : constPromocionDescuento.dataValues.promdes_usu_usuario_modificador_id,
                            promdes_prioridad : !!req.body.promdes_prioridad ? req.body.promdes_prioridad : constPromocionDescuento.dataValues.promdes_prioridad,
                            updatedAt: Date()
                        });

                        //Elimina los productos de la promocion
                        await models.ProductoPromocion.destroy({
                            where: {
                                prodprom_promdes_promocion_descuento_id: idPromocion
                            }
                        });

                        //Elimina los elementos de la promocion
                        await models.ElementoPromocion.destroy({
                            where: {
                                ep_promdes_promocion_descuento_id: idPromocion
                            }
                        });

                        const constsqlElementoPromocionInsert = await sequelize.query(sqlElementoPromocionInsert,
                        { 
                            type: sequelize.QueryTypes.SELECT 
                        });

                         const constsqlProductosPromocionInsert = await sequelize.query(sqlProductosPromocionInsert,
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
                    message: 'Promocion No Encontrada'
                })
            }
        }
        catch(e){
            res.status(500).send({
                message: 'Error al borrar la promocion',
                e
            });
            next(e);
        }
    },

    //Lista de promociones
    getListPromociones: async(req, res, next) =>{
        try{
            //Validadores de que existe la promocion
            const constPromocionDescuento = await models.PromocionDescuento.findAll(
            {
                where: {
                    promdes_estatus_id: { [Op.ne] : statusControllers.ESTATUS_PROMOCION.ELIMINADA }
                } 
            });

            res.status(200).send({
                message: 'Lista de promociones',
                constPromocionDescuento
            })
        }
        catch(e){
            res.status(500).send({
                message: 'Error al obtener la lista de promociones',
                e
            });
            next(e);
        }
    },

}