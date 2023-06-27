import models from '../models';
import status from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
export default{
    createPromotion: async(req, res, next) =>{
        try{
            console.log(req.body.producto_promocion);
            if(req.body.promdes_tipo_descuento_id == status.TIPO_PROMOCION['2 X 1'] || 
                req.body.promdes_tipo_descuento_id == status.TIPO_PROMOCION['3 X 2'] || 
                req.body.promdes_tipo_descuento_id == status.TIPO_PROMOCION.Porcentaje || 
                req.body.promdes_tipo_descuento_id == status.TIPO_PROMOCION['Monto fijo'] ||
                req.body.promdes_tipo_descuento_id == status.TIPO_PROMOCION.Regalo){
                if(!!req.body.producto_promocion && req.body.producto_promocion.length > 0){
                    let idsProductos = [];
                    req.body.producto_promocion.forEach(async function(id, indexId){
                        idsProductos.push(id.prodprom_prod_producto_id);
                        if((req.body.producto_promocion.length -1) == indexId){
                            let consulta = await ((req.body.promdes_tipo_descuento_id == status.TIPO_PROMOCION.Porcentaje) || 
                            (req.body.promdes_tipo_descuento_id == status.TIPO_PROMOCION['Monto fijo'])) ? `
                            select 
                            *
                            from(
                            select 
                                pd.promdes_fecha_inicio_validez, 
                                pd.promdes_fecha_finalizacion_validez,
                                pp.prodprom_prod_producto_id
                            from promociones_descuentos pd
                            left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                            where 
                                (promdes_tipo_descuento_id = ` + req.body.promdes_tipo_descuento_id + `)
                                and
                                    promdes_estatus_id  = ` + status.ESTATUS_PROMOCION.ACTIVA + `
                                and
                                (promdes_fecha_inicio_validez between '` + req.body.promdes_fecha_inicio_validez +  `' and '` + req.body.promdes_fecha_inicio_validez + `')
                                or
                                (promdes_fecha_finalizacion_validez between '` + req.body.promdes_fecha_inicio_validez +  `' and '` + req.body.promdes_fecha_inicio_validez + `') 
                                and
                                (promdes_carrito_articulo  is true)
                            )productos
                            where productos.prodprom_prod_producto_id in (` + idsProductos + `);`
                                    : 
                            `select 
                                    *
                                    from(
                                    select 
                                        pd.promdes_fecha_inicio_validez, 
                                        pd.promdes_fecha_finalizacion_validez,
                                        pp.prodprom_prod_producto_id
                                    from promociones_descuentos pd
                                    left join productos_promociones pp  on pp.prodprom_promdes_promocion_descuento_id  = pd.promdes_promocion_descuento_id 
                                    where 
                                        (promdes_tipo_descuento_id = ` + req.body.promdes_tipo_descuento_id + `)
                                        and
                                            promdes_estatus_id  = ` + status.ESTATUS_PROMOCION.ACTIVA + `
                                        and
                                        (promdes_fecha_inicio_validez between '` + req.body.promdes_fecha_inicio_validez +  `' and '` + req.body.promdes_fecha_inicio_validez + `')
                                        or
                                        (promdes_fecha_finalizacion_validez between '` + req.body.promdes_fecha_inicio_validez +  `' and '` + req.body.promdes_fecha_inicio_validez + `') 
                            )productos
                            where productos.prodprom_prod_producto_id in (` + idsProductos + `);`
                            const validarDisponibilidadDeCreacion =  await sequelize.query(
                                consulta
                            , 
                            { 
                                type: sequelize.QueryTypes.SELECT 
                            });
                            console.log('Consulta', validarDisponibilidadDeCreacion, ((req.body.promdes_tipo_descuento_id == status.TIPO_PROMOCION.Porcentaje) || 
                            (req.body.promdes_tipo_descuento_id == status.TIPO_PROMOCION['Monto fijo'])));
                            if(validarDisponibilidadDeCreacion.length > 0){
                                res.status(300).send({
                                    message: 'No es posible crear la promoción existen productos que causan problemas'
                                })
                            }else{
                                const promocion_descuento = await models.PromocionDescuento.create(req.body,{
                                    include: [
                                        {
                                            model: models.ElementoPromocion,
                                            as: 'elemento_promocion'
                                        },
                                        {
                                            model: models.ProductoPromocion,
                                            as: 'producto_promocion'
                                        }
                                    ]
                                });
                                res.status(200).send({
                                    message: 'Promoción creada correctamente',
                                    promocion_descuento
                                });
                            }
                        }
                    });
                }else{
                    res.status(300).send({
                        message: 'Error, al crear promoción, no esposible debido a que no cuenta con productos'
                    });
                }
            }else{
                const promocion_descuento = await models.PromocionDescuento.create(req.body,{
                    include: [
                        {
                            model: models.ElementoPromocion,
                            as: 'elemento_promocion'
                        },
                        {
                            model: models.ProductoPromocion,
                            as: 'producto_promocion'
                        }
                    ]
                });
                res.status(200).send({
                    message: 'Petición correcta.',
                    promocion_descuento
                });
            }
        }catch(e){
            res.status(500).send({
                message:'Error, en la petición',
                e
            }),
            next(e);
        }
    },
    updatePromotion: async(req, res, next) =>{
        try{
            const promocion_descuento = await models.PromocionDescuento.findOne({
                where: {
                    promdes_promocion_descuento_id: req.body.promdes_promocion_descuento_id
                }
            });
            promocion_descuento.update({
                promdes_nombre: !!req.body.promdes_nombre ? req.body.promdes_nombre : promocion_descuento.dataValues.promdes_nombre,
                promdes_descripcion: !!req.body.promdes_descripcion ? req.body.promdes_descripcion : promocion_descuento.dataValues.promdes_descripcion,
                promdes_estatus_id: !!req.body.promdes_estatus_id ? req.body.promdes_estatus_id : promocion_descuento.dataValues.promdes_estatus_id,
                promdes_fecha_inicio_validez: !!req.body.promdes_fecha_inicio_validez ? req.body.promdes_fecha_inicio_validez : promocion_descuento.dataValues.promdes_fecha_inicio_validez,
                promdes_fecha_finalizacion_validez: !!req.body.promdes_fecha_finalizacion_validez ? req.body.promdes_fecha_finalizacion_validez : promocion_descuento.dataValues.promdes_fecha_finalizacion_validez,
                promdes_tipo_descuento_id: !!req.body.promdes_tipo_descuento_id ? req.body.promdes_tipo_descuento_id : promocion_descuento.dataValues.promdes_tipo_descuento_id,
                promdes_descuento_exacto: !!req.body.promdes_descuento_exacto ? req.body.promdes_descuento_exacto : promocion_descuento.dataValues.promdes_descuento_exacto,
                promdes_valor_minimo_pedido: !!req.body.promdes_valor_minimo_pedido ? req.body.promdes_valor_minimo_pedido : promocion_descuento.dataValues.promdes_valor_minimo_pedido,
                promdes_usu_usuario_modificador_id: req.body.promdes_usu_usuario_modificador_id,
                promdes_cupon_descuento: !!req.body.promdes_cupon_descuento ? req.body.promdes_cupon_descuento : promocion_descuento.dataValues.promdes_cupon_descuento,
                promdes_sku_gift: !!req.body.promdes_sku_gift ? req.body.promdes_sku_gift : promocion_descuento.dataValues.promdes_sku_gift
            });
            if(!!req.body.elemento_promocion){
                await models.ElementoPromocion.destroy({
                    where: {
                        ep_promdes_promocion_descuento_id: promocion_descuento.dataValues.promdes_promocion_descuento_id
                    }
                });
                req.body.elemento_promocion.forEach(async function(insert){
                    await models.ElementoPromocion.create({
                        ep_promdes_promocion_descuento_id: promocion_descuento.dataValues.promdes_promocion_descuento_id,
                        ep_cat_categoria_id: insert.ep_cat_categoria_id,
                        ep_mar_marca_id: insert.ep_mar_marca_id,
                        ep_col_coleleccion_id: insert.ep_col_coleleccion_id,
                        ep_sn_socios_negocio_id: insert.ep_sn_socios_negocio_id
                    });
                });
            }
            if(!!req.body.producto_promocion){
                await models.ProductoPromocion.destroy({
                    where: {
                        prodprom_promdes_promocion_descuento_id: promocion_descuento.dataValues.promdes_promocion_descuento_id
                    }
                });
                req.body.producto_promocion.forEach(async function(insert) {
                    await models.ProductoPromocion.create({
                        prodprom_promdes_promocion_descuento_id: promocion_descuento.dataValues.promdes_promocion_descuento_id,
                        prodprom_prod_producto_id: insert.prodprom_prod_producto_id
                    });
                });
            }
            res.status(200).send({
                message: 'Petición correcta.'
            });
        }catch(e){
            res.status(500).send({
                message:'Error, en la petición',
                e
            }),
            next(e);
        }
    },
    deletePromotion: async(req, res, next) =>{
        try{
            const promocion_descuento = await models.PromocionDescuento.findOne({
                where: {
                    promdes_promocion_descuento_id: req.body.promdes_promocion_descuento_id
                }
            });
            promocion_descuento.update({
                promdes_usu_usuario_modificador_id: req.body.promdes_usu_usuario_modificador_id,
                promdes_estatus_id: status.ESTATUS_PROMOCION.ELIMINADA,
                promdes_cupon_descuento: null,
                updatedAt: Date()
            });
            await models.ElementoPromocion.destroy({
                where: {
                    ep_promdes_promocion_descuento_id:  req.body.promdes_promocion_descuento_id
                }
            });
            await models.ProductoPromocion.destroy({
                where: {
                    prodprom_promdes_promocion_descuento_id: req.body.promdes_promocion_descuento_id
                }
            })
            res.status(200).send({
                message: 'Eliminación de la promoción, correctamente'
            });
        }catch(e){
            res.status(500).send({
                message:'Error, en la petición',
                e
            }),
            next(e);
        }
    },
    getListPromotios: async(req, res, next) =>{
        try{
            const promociones_descuentos = await models.PromocionDescuento.findAll({
                where: {
                    promdes_estatus_id: { [Op.ne]: status.ESTATUS_PROMOCION.ELIMINADA }
                },
                attributes: {
                    exclude: ['promdes_usu_usuario_creado_id','createdAt','promdes_usu_usuario_modificador_id','updatedAt']
                }
            });
            res.status(200).send({
                message: 'Petición correcta.',
                promociones_descuentos
            });
        }catch(e){
            res.status(500).send({
                message:'Error, en la petición',
                e
            }),
            next(e);
        }
    },
    getPromocionById: async (req, res, next)=>{
        try{
            const promocion_descuento = await models.PromocionDescuento.findOne({
                where: {
                    promdes_promocion_descuento_id: req.params.id
                },
                include: [
                    {
                        model: models.ElementoPromocion,
                        as: 'elemento_promocion',
                        include: [
                            {
                                model: models.Categoria
                            },
                            {
                                model: models.Marca
                            },
                            {
                                model: models.Coleccion
                            },
                            {
                                model: models.SociosNegocio
                            },
                            {
                                model: models.Producto
                            },
                        ]
                    },
                    {
                        model: models.ProductoPromocion,
                        as: 'producto_promocion'
                    },{
                        model: models.Producto,
                        as: 'producto_regalo'
                    }
                ]
            });
            const categorias = [];
            const colecciones = [];
            const marcas = [];
            const productosIds = [];
            if(!!promocion_descuento.dataValues.elemento_promocion){
                promocion_descuento.dataValues.elemento_promocion.forEach(async function(elementos, indexProdutos){
                    if(!!elementos.dataValues.ep_cat_categoria_id){
                        categorias.push(elementos.dataValues.ep_cat_categoria_id);
                    }else{
                        categorias.push(0);
                    }
                    if(!!elementos.dataValues.ep_mar_marca_id){
                        marcas.push(elementos.dataValues.ep_mar_marca_id);
                    }else{
                        marcas.push(0);
                    }
                    if(!!elementos.dataValues.ep_col_coleleccion_id){
                        colecciones.push(elementos.dataValues.ep_col_coleleccion_id);
                    }else{
                        colecciones.push(0);
                    }
                    if(!!elementos.dataValues.ep_prod_producto_id){
                        productosIds.push(elementos.dataValues.ep_prod_producto_id);
                    }else{
                        productosIds.push(0)
                    }
                    if((promocion_descuento.dataValues.elemento_promocion.length - 1) == indexProdutos){
                        if(colecciones.length > 0 || marcas.length > 0 || categorias.length > 0 || productosIds.length > 0){
                            console.log('COLECCIONES', colecciones, '\nMArcas', marcas, '\n Categoria', categorias, '\n Productos', productosIds);
                            const idsProductos =  await sequelize.query(
                                `select  
                                    distinct(producto.prod_producto_id)  
                                from(  
                                    select  
                                        distinct(p.prod_producto_id)  
                                    from productos_colecciones pc   
                                    left join productos p on p.prod_producto_id  = pc.prodcol_prod_producto_id   
                                    where pc.prodcol_col_coleccion_id  in (` + colecciones  +` ) and p.prod_prod_producto_padre_sku  notnull and  
                                    p.prod_cmm_estatus_id !=  `+ status.ESTATUS_PRODUCTO.ELIMINADO +`    
                                    union  
                                    select   
                                        distinct(p.prod_producto_id)  
                                    from productos p   
                                    where p.prod_mar_marca_id in ( `+ marcas +`) and p.prod_prod_producto_padre_sku  notnull and  
                                    p.prod_cmm_estatus_id !=   `+ status.ESTATUS_PRODUCTO.ELIMINADO +`   
                                    union  
                                    select   
                                        distinct(p.prod_producto_id)  
                                    from productos p   
                                    where p.prod_cat_categoria_id in (` + categorias + `) and p.prod_prod_producto_padre_sku  notnull and  
                                    p.prod_cmm_estatus_id !=  `+ status.ESTATUS_PRODUCTO.ELIMINADO + `
                                    union  
                                    select  
                                        distinct (p.prod_producto_id)  
                                    from productos p  
                                    where  p.prod_producto_id in ( ` + productosIds  +  ` ) and p.prod_prod_producto_padre_sku  notnull and  
                                    p.prod_cmm_estatus_id !=  `+ status.ESTATUS_PRODUCTO.ELIMINADO + `  
                                )producto 
                                order by producto.prod_producto_id asc;`
                                ,{ 
                                    type: sequelize.QueryTypes.SELECT 
                                });
                            if(idsProductos.length > 0){
                                let finalId = [];
                                idsProductos.forEach(async function(prod_producto, indexId){
                                    console.log('FOR PROD_PRODUCTO', prod_producto);
                                    finalId.push(prod_producto.prod_producto_id);
                                    if((idsProductos.length -1) == indexId){
                                        const productos_to_promotion = await models.Producto.findAll({
                                            where: {
                                                prod_producto_id: finalId,
                                                prod_cmm_estatus_id: { [Op.ne]: status.ESTATUS_PRODUCTO.ELIMINADO },
                                                prod_prod_producto_padre_sku: { [Op.ne] : null }
                                            }
                                        });
                                        res.status(200).send({
                                            message: 'Promoción, obtenida con exito.',
                                            promocion_descuento,
                                            productos_to_promotion
                                        });

                                    }
                                });
                            }else{
                                console.log('No se ejectua bien la consulta');
                                res.status(200).send({
                                    message: 'Promoción, obtenida con exito.',
                                    promocion_descuento
                                });
                            }
                        }else{
                            res.status(200).send({
                                message: 'Promoción, obtenida con exito.',
                                productos_to_promotion
                            });
                        }
                    }
                });
            }else{
                const productos_to_promotion = await models.Producto.findAll({
                    where: {
                        prod_producto_id: seleccionados,
                        prod_cmm_estatus_id: { [Op.ne]: status.ESTATUS_PRODUCTO.ELIMINADO },
                        prod_prod_producto_padre_sku: { [Op.ne] : null }
                    }
                });
                res.status(200).send({
                    message: 'Promoción, obtenida con exito.',
                    promocion_descuento,
                    productos_to_promotion
                });

            }
        }catch(e){
            res.status(500).send({
                message: 'Error, al obtener la información',
                e
            });
            next(e);
        }
    },
    getArticulosPromociones: async(req, res, next)=>{
        try{
            if(req.body.colecciones.length > 0 || req.body.marcas.length > 0 || req.body.categorias.length> 0 || req.body.productos.length > 0){
                let colecciones = [] = await req.body.colecciones.length > 0 ? req.body.colecciones : [0];
                let marcas = [] = await req.body.marcas.length > 0 ? req.body.marcas : [0];
                let categorias = [] = await req.body.categorias.length > 0 ? req.body.categorias : [0];
                let producto = [] = await  req.body.productos.length > 0 ? req.body.productos : [0];
                console.log(producto);
                const idsProductos =  await sequelize.query(
                    `select  
                        distinct(producto.prod_producto_id)  
                    from(  
                        select  
                            distinct(p.prod_producto_id)  
                        from productos_colecciones pc   
                        left join productos p on p.prod_producto_id  = pc.prodcol_prod_producto_id   
                        where pc.prodcol_col_coleccion_id  in (` + colecciones   +` ) and p.prod_prod_producto_padre_sku  notnull and  
                        p.prod_cmm_estatus_id !=  `+ status.ESTATUS_PRODUCTO.ELIMINADO +`    
                        union  
                        select   
                            distinct(p.prod_producto_id)  
                        from productos p   
                        where p.prod_mar_marca_id in ( `+ marcas +`) and p.prod_prod_producto_padre_sku  notnull and  
                        p.prod_cmm_estatus_id !=   `+ status.ESTATUS_PRODUCTO.ELIMINADO +`   
                        union  
                        select   
                            distinct(p.prod_producto_id)  
                        from productos p   
                        where p.prod_cat_categoria_id in (` + categorias  + `) and p.prod_prod_producto_padre_sku  notnull and  
                        p.prod_cmm_estatus_id !=  `+ status.ESTATUS_PRODUCTO.ELIMINADO +`   
                        union  
                        select  
                            distinct (p.prod_producto_id)  
                        from productos p  
                        where  p.prod_producto_id in ( ` +  producto  +  ` ) and p.prod_prod_producto_padre_sku  notnull and  
                        p.prod_cmm_estatus_id !=  `+ status.ESTATUS_PRODUCTO.ELIMINADO +`  
                    )producto 
                    order by producto.prod_producto_id asc;`
                    ,{ 
                        type: sequelize.QueryTypes.SELECT 
                    });
                if(idsProductos.length > 0){
                    let seleccionados = [];
                    idsProductos.forEach(async function(prod_producto, indexId){
                        seleccionados.push(prod_producto.prod_producto_id);
                        if((idsProductos.length -1) == indexId){
                            const productos_to_promotion = await models.Producto.findAll({
                                where: {
                                    prod_producto_id: seleccionados,
                                    prod_cmm_estatus_id: { [Op.ne]: status.ESTATUS_PRODUCTO.ELIMINADO },
                                    prod_prod_producto_padre_sku: { [Op.ne] : null }
                                }
                            });
                            res.status(200).send({
                                message: 'Promoción, obtenida con exito.',
                                seleccionados,
                                productos_to_promotion
                            });

                        }
                    });
                }else{
                    res.status(200).send({
                        message: 'Promoción, obtenida con exito.',
                        productos_to_promotion
                    });
                }
            }else{
                res.status(200).send({
                    message: 'Promoción, obtenida con exito.',
                    productos_to_promotion
                });
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al obtener la información requerida',
                e
            });
            next(e);
        }
    }
}