import models from '../models';
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const { Op } = require("sequelize");
import statusControllers from '../mapeos/mapeoControlesMaestrosMultiples';
import request from 'request-promise';



module.exports = {


    EraseShippingMethod: async function (cdc_sn_socio_de_negocio_id) {

        //Buscara si el Socio de negocio tiene un carrito activo.
        const constCarritoDeCompra = await models.CarritoDeCompra.findOne(
        {
            where: {
                cdc_sn_socio_de_negocio_id: cdc_sn_socio_de_negocio_id
            }
        });

        await constCarritoDeCompra.update({
            cdc_costo_envio : null,
            cdc_fletera_id : null,
            cdc_direccion_envio_id : null,
            cdc_cmm_tipo_envio_id: null,
            cdc_alm_almacen_recoleccion : null,
            cdc_forma_pago_codigo : null,
            cdc_cfdi : null,
            updatedAt: Date()
        });
        
        return true
    },





    getBestPromotionForProduct: async function (producto_id) {
        var sqlGetPromotionForProducts = '';

        sqlGetPromotionForProducts = sqlGetPromotionForProducts + `
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
                pp.prodprom_prod_producto_id = `+producto_id+`
                and pd.promdes_estatus_id = 1000059
                and pd.promdes_fecha_inicio_validez <= current_date
                and pd.promdes_fecha_finalizacion_validez >=  current_date
            order by 
                pd.promdes_prioridad asc 
                limit 1
        `;

        const constsqlElementoPromocionInsert = sequelize.query(sqlGetPromotionForProducts,
        { 
            type: sequelize.QueryTypes.SELECT 
        });
        
        return constsqlElementoPromocionInsert
    },
    getBestCuponForProduct: async function (producto_id, cupon_id, sn_id) {
        var sqlGetPromotionForProducts = '';

        sqlGetPromotionForProducts = sqlGetPromotionForProducts + `
            select
                promcup_promociones_cupones_id, 
                promcup_nombre, 
                promcup_estatus_id, 
                promcup_fecha_inicio_validez, 
                promcup_fecha_finalizacion_validez, 
                promcup_tipo_descuento_id,
                promcup_descuento_exacto,
                promcup_cupon_codigo,
                cmm_nombre,
                cmm_valor,
                promcup_aplica_todo_carrito
            from 
                promociones_cupones pd 
                left join productos_cupones pp ON pd.promcup_promociones_cupones_id = pp.prodcup_promcup_promociones_cupones_id 
                left join elementos_cupones ec ON ec.ec_promcup_promociones_cupones_id = pp.prodcup_promcup_promociones_cupones_id 
                left join controles_maestros_multiples cmm ON pd.promcup_tipo_descuento_id = cmm.cmm_control_id 
            where 
                pp.prodcup_prod_producto_id = `+producto_id+`
                and pd.promcup_estatus_id = 1000169
                and pd.promcup_fecha_inicio_validez <= current_date
                and pd.promcup_fecha_finalizacion_validez >=  current_date
                and ec.ec_sn_socios_negocio_id = '`+sn_id+`'
                and pd.promcup_promociones_cupones_id = `+cupon_id+`
            order by 
                pd.promcup_prioridad asc 
                limit 1
        `;

        const constsqlElementoPromocionInsert = sequelize.query(sqlGetPromotionForProducts,
        { 
            type: sequelize.QueryTypes.SELECT 
        });

        return constsqlElementoPromocionInsert
    },
    getCheckout: async function (producto_id) {
        var sqlGetPromotionForProducts = '';

        sqlGetPromotionForProducts = sqlGetPromotionForProducts + `
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
                pp.prodprom_prod_producto_id = `+producto_id+`
                and pd.promdes_estatus_id = 1000059
                and pd.promdes_fecha_inicio_validez <= current_date
                and pd.promdes_fecha_finalizacion_validez >=  current_date
            order by 
                pd.promdes_prioridad asc 
                limit 1
        `;

        const constsqlElementoPromocionInsert = sequelize.query(sqlGetPromotionForProducts,
        { 
            type: sequelize.QueryTypes.SELECT 
        });
        
        return constsqlElementoPromocionInsert
    },





    //Para productos get principalmente
    getHijosFromPadre: async function (rows) {
        try{
            for (var i = 0; i < rows.length; i++) 
            {
                //Obtener hijos de un productoPadre
                const constHijosListaPerProductoPadre = await models.Producto.findAll({
                    where: {
                        prod_prod_producto_padre_sku: rows[i].prod_sku,
                        prod_cmm_estatus_id: statusControllers.ESTATUS_PRODUCTO.ACTIVO,
                        prod_volumen: {[Op.ne] : 0 },
                        prod_peso: {[Op.ne] : 0 },
                        prod_mostrar_en_tienda: true
                    },
                    //attributes: ['prod_producto_id', 'prod_nombre', 'prod_sku', 'prod_viñetas', 'prod_precio', 'prod_dias_resurtimiento', 'prod_es_stock_inactivo', 'prod_tipo_precio_base'],
                    include: [
                        {
                            model: models.ImagenProducto
                        }
                    ],
                    attributes: 
                    {
                        exclude: ['prod_meta_titulo','prod_usu_usuario_creado_id','createdAt','prod_usu_usuario_modificado_id',
                                  'updatedAt','prod_cmm_estatus_id','prod_prod_producto_padre_sku','prod_mar_marca_id',
                                  'prod_meta_titulo','prod_meta_descripcion','prod_is_kit','prod_productos_coleccion_relacionados_id',
                                  'prod_productos_coleccion_accesorios_id','prod_meta_descripcion','prod_is_kit','prod_productos_coleccion_relacionados_id',]
                    }
                })

                rows[i].ListaHijos = constHijosListaPerProductoPadre

                //LISTA PRECIOS
                var ListaPreciosTemp = []
                var ListaStockTemp = []

                for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                {
                    //Obtener precios X hijo
                    const constProductoListaPrecio = await models.ProductoListaPrecio.findAll({
                        where: {
                            pl_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                        }
                    })
                    rows[i].ListaHijos[f].dataValues.ListaPrecios = constProductoListaPrecio

                    //Obtener Stock X hijo
                    const constStockProducto = await models.StockProducto.findAll({
                        where: {
                            sp_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                        }
                    })
                    rows[i].ListaHijos[f].dataValues.ListaStock = constStockProducto
                }
            }
            return rows
        }
        catch(e){
            return "No fue posible obtener la lista de hijos"
        }
    },
    getHijosAtributosFromPadre: async function (rows) {
        try{
            for (var i = 0; i < rows.length; i++) 
            {
                //Obtener hijos de un productoPadre
                const constHijosListaPerProductoPadre = await models.Producto.findAll({
                    where: {
                        prod_prod_producto_padre_sku: rows[i].prod_sku,
                        prod_cmm_estatus_id: statusControllers.ESTATUS_PRODUCTO.ACTIVO,
                        prod_mostrar_en_tienda: true
                    },
                    attributes: ['prod_producto_id'],
                    // attributes: 
                    // {
                    //     exclude: ['prod_meta_titulo','prod_usu_usuario_creado_id','createdAt','prod_usu_usuario_modificado_id',
                    //               'updatedAt','prod_cmm_estatus_id','prod_prod_producto_padre_sku','prod_mar_marca_id',
                    //               'prod_meta_titulo','prod_meta_descripcion','prod_is_kit','prod_productos_coleccion_relacionados_id',
                    //               'prod_productos_coleccion_accesorios_id','prod_meta_descripcion','prod_is_kit','prod_productos_coleccion_relacionados_id',]
                    // }
                })

                rows[i].ListaHijos = constHijosListaPerProductoPadre
            }
            return rows
        }
        catch(e){
            return "No fue posible obtener la lista de hijos"
        }
    },
    getHijosFromPadreOneChild: async function (rows, prod_child_id) {
        try{
            for (var i = 0; i < rows.length; i++) 
            {
                //Obtener hijos de un productoPadre
                const constHijosListaPerProductoPadre = await models.Producto.findAll({
                    where: {
                        prod_producto_id: prod_child_id,
                        prod_cmm_estatus_id: statusControllers.ESTATUS_PRODUCTO.ACTIVO,
                        prod_mostrar_en_tienda: true
                    },
                    //attributes: ['prod_producto_id', 'prod_nombre', 'prod_sku', 'prod_viñetas', 'prod_precio', 'prod_dias_resurtimiento', 'prod_es_stock_inactivo', 'prod_tipo_precio_base'],
                    include: [
                        {
                            model: models.ImagenProducto
                        }
                    ],
                    attributes: 
                    {
                        exclude: ['prod_meta_titulo','prod_usu_usuario_creado_id','createdAt','prod_usu_usuario_modificado_id',
                                  'updatedAt','prod_cmm_estatus_id','prod_prod_producto_padre_sku','prod_mar_marca_id',
                                  'prod_meta_titulo','prod_meta_descripcion','prod_is_kit','prod_productos_coleccion_relacionados_id',
                                  'prod_productos_coleccion_accesorios_id','prod_meta_descripcion','prod_is_kit','prod_productos_coleccion_relacionados_id',]
                    }
                })

                rows[i].ListaHijos = constHijosListaPerProductoPadre

                //LISTA PRECIOS
                var ListaPreciosTemp = []
                var ListaStockTemp = []

                for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                {
                    //Obtener precios X hijo
                    const constProductoListaPrecio = await models.ProductoListaPrecio.findAll({
                        where: {
                            pl_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                        }
                    })
                    rows[i].ListaHijos[f].dataValues.ListaPrecios = constProductoListaPrecio

                    //Obtener Stock X hijo
                    const constStockProducto = await models.StockProducto.findAll({
                        where: {
                            sp_prod_producto_id : rows[i].ListaHijos[f].prod_producto_id
                        }
                    })
                    rows[i].ListaHijos[f].dataValues.ListaStock = constStockProducto
                }
            }
            return rows
        }
        catch(e){
            return "No fue posible obtener la lista de hijos"
        }
    },
    setDiasResurtimientoIsBackOrder: async function (rows) {
        try{
            for (var i = 0; i < rows.length; i++) 
            {
                for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                {
                    if(rows[i].ListaHijos[f].prod_dias_resurtimiento != '0')
                    {
                        rows[i].ListaHijos[f].dataValues.aplicaBackOrder = true
                    }
                    else
                    {
                        rows[i].ListaHijos[f].dataValues.aplicaBackOrder = false
                    }
                }
            }
            return rows
        }
        catch(e){
            return "No fue posible establecer si los hijos tienen backOrder"
        }
    },
    setDiasResurtimientoIsBackOrderOnlyChilds: async function (rows) {
        try{
            for (var i = 0; i < rows.length; i++) 
            {
                if(rows[i].prod_dias_resurtimiento != '0')
                {
                    rows[i].aplicaBackOrder = true
                }
                else
                {
                    rows[i].aplicaBackOrder = false
                }
            }
            return rows
        }
        catch(e){
            return "No fue posible establecer si los hijos tienen backOrder"
        }
    },
    setFiltrarProductsSinImagen: async function(rows){
        try{
            const newRows= [];
            for (var i = 0; i < rows.length; i++)  
            {
               
               
                if (rows[i].imagen_productos.length >=1)
                {
                   
                   newRows.push(rows[i]);
                }
                else
                {
                   
                }
                
            }
            return newRows
        }
        catch(e){
            console.log(e)
            return "No fue posible establecer si tiene imagenes el productos."
        }
    },

    setFiltrarProductsFinImagen: async function(rows){
        try{
            const newRows= [];
            for (var i = 0; i < rows.length; i++)  
            {
               
               
                if (rows[i].imagen_productos.length >=1)
                {
                   
                   
                }
                else
                {
                    newRows.push(rows[i]);
                }
                
            }
            return newRows
        }
        catch(e){
            console.log(e)
            return "No encontramos imagenes con fotos."
        }
    },
    setImagenesOnlyChilds: async function (rows) {
        try{
            //const newRows= [];
            for (var i = 0; i < rows.length; i++) 
            {
                //Validar que sea producto hijo
                const constImagenProducto = await models.ImagenProducto.findAll(
                {
                    where: {
                        imgprod_prod_producto_id: rows[i].prod_producto_id
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']},
                    order: [
                        ['imgprod_nombre_archivo', 'ASC']
                    ],
                });
                
                if(constImagenProducto)
                {
                   rows[i].imagen_productos = constImagenProducto
                 //  newRows.push(rows[i]);
                }
                else
                {
                   rows[i].imagen_productos = {}
                }
                
            }
            return rows
        }
        catch(e){
            console.log(e)
            return "No fue posible establecer si los hijos tienen backOrder"
        }
    },
    getChildsPromotions: async function (rows) {
        try{
            for (var i = 0; i < rows.length; i++) 
            {
                for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                {
                    //Si es stock inactivo no tendra ni revisara descuentos
                    if(rows[i].ListaHijos[f].dataValues.prod_es_stock_inactivo == true)
                    {
                        rows[i].ListaHijos[f].dataValues.promocion = []
                    }
                    else
                    {
                        var promotion = await this.getBestPromotionForProduct(rows[i].ListaHijos[f].dataValues.prod_producto_id)
                        rows[i].ListaHijos[f].dataValues.promocion = promotion
                    }
                }
            }
            return rows
        }
        catch(e){
            return "No fue posible obtener la mejor promocion por hijos"
        }
    },
    getChildsPromotionsOnlyChilds: async function (rows) {
        try{
            for (var i = 0; i < rows.length; i++) 
            {
                //Si es stock inactivo no tendra ni revisara descuentos
                if(rows[i].prod_es_stock_inactivo == true)
                {
                    rows[i].promocion = []
                }
                else
                {
                    var promotion = await this.getBestPromotionForProduct(rows[i].prod_producto_id)
                    rows[i].promocion = promotion
                }
            }
            return rows
        }
        catch(e){
            return "No fue posible obtener la mejor promocion por hijos"
        }
    },
    




    setAttributesToChilds: async function (rows) {
        try{
            for (var i = 0; i < rows.length; i++) 
            {
                for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                {

                    //Validar que sea producto hijo
                    const constProducto = await models.Producto.findOne(
                    {
                        where: {
                            prod_producto_id: rows[i].ListaHijos[f].prod_producto_id,
                            prod_prod_producto_padre_sku: { [Op.ne] : null }
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}
                    });

                    //Si el producto es hijo y existe buscara sus atributos de categoria con valores.
                    if(constProducto)
                    {
                        //Si el producto hijo existe, obtener producto padre id
                        const constProductoIDPadre = await models.Producto.findOne(
                        {
                            where: {
                                prod_sku: constProducto.dataValues.prod_prod_producto_padre_sku
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}
                        });

                        //Busca el total de relaciones que tiene un  en categorias-atributos tabla
                        const constAtributoProductos = await models.AtributoProductos.findAll(
                        {
                            where: {
                                atp_id_producto: constProductoIDPadre.prod_producto_id,
                                atp_cmm_estatus_id: { [Op.ne] : statusControllers.ATRIBUTO_PRODUCTO.ELIMINADA }
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}
                        });

                        //Crear arreglo del total de atributos con valor
                        var arrayAtributosCategorias = [];


                        //Tomara el total de veces que aparesca el id del atributo categoria en la tabla atributos-categorias
                        for (var h = 0; h < constAtributoProductos.length; h++) 
                        {

                            //obtiene los valores 
                            const constAtributoSkuValores = await models.AtributoSkuValores.findOne(
                            {
                                where: {
                                    skuav_id_atributo_producto: constAtributoProductos[h].dataValues.atp_atributo_producto_id,
                                    skuav_id_sku: rows[i].ListaHijos[f].prod_producto_id,
                                },
                                attributes: {exclude: ['createdAt', 'updatedAt', "pav_usu_usuario_creador_id", "pav_usu_usuario_modificador_id"]}
                            });

                            var Valor = '';
                            var ValorID = '';
                            var Creado = false;
                            if(constAtributoSkuValores)
                            {
                                ValorID = constAtributoSkuValores.skuav_sku_atributos_valores_id;
                                Valor = constAtributoSkuValores.skuav_valor;
                                Creado = true;
                            }
                            else
                            {
                                ValorID = '';
                                Valor = '';
                            }

                            //Buscar Atributos datos
                            const constAtributo = await models.Atributo.findOne(
                            {
                                where: {
                                    at_atributo_id: constAtributoProductos[h].dataValues.atp_id_atributo
                                },
                                attributes: {exclude: ['createdAt', 'updatedAt']}
                            });

                            //Variable para Lineas
                            var jsonArray = {
                                "atp_atributo_producto_id": constAtributoProductos[h].atp_atributo_producto_id,
                                "atp_cmm_estatus_id": constAtributoProductos[h].dataValues.atp_cmm_estatus_id,
                                "at_atributo_id": constAtributo.at_atributo_id,
                                "at_nombre": constAtributo.at_nombre,
                                "at_descripcion": constAtributo.at_descripcion,
                                "skuav_id_atributo_producto": ValorID,
                                "skuav_valor": Valor,
                                "sku_valor_validacion_creado": Creado
                            }
                            arrayAtributosCategorias.push(jsonArray);

                        }//fin for relacion valor-producto

                        var responseFinal = {
                            "prod_producto_id_padre": constProductoIDPadre.prod_producto_id,
                            "prod_sku_padre": constProductoIDPadre.prod_sku,
                            "prod_producto_id_hijo": constProducto.prod_producto_id,
                            "prod_sku_hijo": constProducto.prod_sku,
                            "atributos_categorias_lista": arrayAtributosCategorias
                        }

                        rows[i].ListaHijos[f].dataValues.Atributos = responseFinal
                    }
                    else//En caso de que no encuentre el producto padre mandara la variable
                    {
                        rows[i].ListaHijos[f].dataValues.Atributos = {}
                    }

                }
            }
            return rows
        }
        catch(e){
            console.log(e)
            return "No fue posible establecer si los hijos tienen backOrder"
        }
    },

    


    setBestPromotionChildToFather: async function (rows) {
        try{
            for (var i = 0; i < rows.length; i++) 
            {
                //Por cada padre regresara la variable a 0
                var prod_producto_id_con_descuento_exacto = 0
                var prod_producto_id_con_descuento = 0
                var prod_producto_id_con_descuento_precio = 0
                var prod_producto_id_con_descuento_exacto = 0

                for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                {
                    //Si un producto tiene promocion intentara calcular la promocion exacta para luego compararla y ver si es mejor o no
                    if(rows[i].ListaHijos[f].dataValues.promocion.length > 0)
                    {
                        var promocionTotal 

                        //Obtendra el total de promocion en int para comparar
                        if(rows[i].ListaHijos[f].dataValues.promocion[0].cmm_valor == "Monto fijo")
                        {

                            promocionTotal = rows[i].ListaHijos[f].dataValues.promocion[0].promdes_descuento_exacto

                        }
                        else
                        {

                            var precioBase = rows[i].ListaHijos[f].dataValues.prod_precio
                            var descuentoExactoPorcentual = rows[i].ListaHijos[f].dataValues.promocion[0].promdes_descuento_exacto 
                            promocionTotal = (( descuentoExactoPorcentual / 100) * precioBase)
                        }

                        //Si la promocion total es mas alta que la anterior tomara ese id de producto para mostrarlo
                        if(promocionTotal > prod_producto_id_con_descuento_exacto)
                        {
                            prod_producto_id_con_descuento = rows[i].ListaHijos[f].dataValues.prod_producto_id
                            prod_producto_id_con_descuento_precio = rows[i].ListaHijos[f].dataValues.prod_precio
                            prod_producto_id_con_descuento_exacto = promocionTotal
                        }
                    }
                }

                //Cuando termine de recorrer los hijos setteara las variables en el padre
                rows[i].prod_producto_id_con_descuento = prod_producto_id_con_descuento
                rows[i].prod_producto_id_con_descuento_precio = prod_producto_id_con_descuento_precio
                rows[i].prod_producto_id_con_descuento_exacto = prod_producto_id_con_descuento_exacto
            }
            return rows
        }
        catch(e){
            return "No fue obtener el mejor hijo con promocion"
        }
    },
    setBestPromotionChildToFatherWithSNPriceList: async function (rows) {
        try{
            for (var i = 0; i < rows.length; i++) 
            {
                //Por cada padre regresara la variable a 0
                var prod_producto_id_con_descuento_exacto = 0
                var prod_producto_id_con_descuento = 0
                var prod_producto_id_con_descuento_precio = 0
                var prod_producto_id_con_descuento_exacto = 0

                for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                {
                    //Si un producto tiene promocion intentara calcular la promocion exacta para luego compararla y ver si es mejor o no
                    if(rows[i].ListaHijos[f].dataValues.promocion.length > 0)
                    {
                        var promocionTotal 

                        //Obtendra el total de promocion en int para comparar
                        if(rows[i].ListaHijos[f].dataValues.promocion[0].cmm_valor == "Monto fijo")
                        {

                            promocionTotal = rows[i].ListaHijos[f].dataValues.promocion[0].promdes_descuento_exacto

                        }
                        else
                        {

                            var precioBase = rows[i].ListaHijos[f].dataValues.precioBasePorListaPrecio
                            var descuentoExactoPorcentual = rows[i].ListaHijos[f].dataValues.promocion[0].promdes_descuento_exacto 
                            promocionTotal = (( descuentoExactoPorcentual / 100) * precioBase)
                        }

                        //Si la promocion total es mas alta que la anterior tomara ese id de producto para mostrarlo
                        if(promocionTotal > prod_producto_id_con_descuento_exacto)
                        {
                            prod_producto_id_con_descuento = rows[i].ListaHijos[f].dataValues.prod_producto_id
                            prod_producto_id_con_descuento_precio = rows[i].ListaHijos[f].dataValues.precioBasePorListaPrecio
                            prod_producto_id_con_descuento_exacto = promocionTotal
                        }
                    }
                }

                //Cuando termine de recorrer los hijos setteara las variables en el padre
                rows[i].prod_producto_id_con_descuento = prod_producto_id_con_descuento
                rows[i].prod_producto_id_con_descuento_precio = prod_producto_id_con_descuento_precio
                rows[i].prod_producto_id_con_descuento_exacto = prod_producto_id_con_descuento_exacto
            }
            return rows
        }
        catch(e){
            return "No fue obtener el mejor hijo con promocion"
        }
    },
    setBasePricesForChildBySNPriceList: async function (rows, idSocioNegocio) {
        try{
            //Obtener informacion de socio de negocio
            const constSociosNegocio = await models.SociosNegocio.findOne(
            {
                where: {
                    sn_socios_negocio_id: idSocioNegocio
                },
                attributes:  ["sn_socios_negocio_id", "sn_cardcode", "sn_codigo_direccion_facturacion", "sn_lista_precios"]
            });

            var precioTemporal = precioBasePorListaPrecio
            var precioBase = precioBasePorListaPrecio

            var tipoImpuesto = 16

            //Obtener direccion de facturacion para calcular el iva
            const constSociosNegocioDirecciones = await models.SociosNegocioDirecciones.findOne(
            {
                where: {
                    snd_cardcode: constSociosNegocio.sn_cardcode,
                    snd_idDireccion: constSociosNegocio.sn_codigo_direccion_facturacion,
                    snd_tipoDir: "B"
                }
            });

            //Obtendra el valor del impuesto aplicable que tendra el SN para los productos
            if(constSociosNegocioDirecciones.snd_codigo_postal)
            {
                const constCodigosPostales = await models.CodigosPostales.findOne(
                {
                    where: {
                        cp_codigo_postal: constSociosNegocioDirecciones.snd_codigo_postal
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

            var precioBasePorListaPrecio
            for (var i = 0; i < rows.length; i++) 
            {
                for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                {
                    //Obtener precio base para el producto dependiendo de si vendra de lista de precio sn o porque es stock inactivo
                    if(rows[i].ListaHijos[f].dataValues.prod_es_stock_inactivo == true)
                    {
                        //Se dejara el precio base que tenga el producto sin importar que
                        precioBasePorListaPrecio = rows[i].ListaHijos[f].dataValues.prod_precio
                    }
                    else
                    {
                        //Buscar la lista de precio que tenga asignada el SN y buscar el precio que se le dara al carrito
                        const constProductoListaPrecio = await models.ProductoListaPrecio.findOne(
                        {
                            where: {
                                pl_prod_producto_id: rows[i].ListaHijos[f].dataValues.prod_producto_id,
                                pl_listp_lista_de_precio_id: constSociosNegocio.sn_lista_precios
                            }
                        });

                        precioBasePorListaPrecio = constProductoListaPrecio.pl_precio_producto
                    }
                    rows[i].ListaHijos[f].dataValues.precioBasePorListaPrecio = precioBasePorListaPrecio

                    var precioTemporal = precioBasePorListaPrecio
                    //Si existe promocion
                    if(rows[i].ListaHijos[f].dataValues.promocion.length > 0)
                    {
                        //Calcular precio promocion activa
                        if(rows[i].ListaHijos[f].dataValues.promocion[0].cmm_valor == "Porcentaje")
                        {   
                            //Valor de la promocion por porcentaje
                            var cantidadPromocion = rows[i].ListaHijos[f].dataValues.promocion[0].promdes_descuento_exacto
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
                            var cantidadPromocion = rows[i].ListaHijos[f].dataValues.promocion[0].promdes_descuento_exacto
                            precioTemporal = precioTemporal - cantidadPromocion

                            //Si es mejor que 0 se setteara a 0 la variable para que el producto no cueste menos que 0 LOL
                            if(precioTemporal <= 0)
                            {
                                precioTemporal = 0
                            }
                        }
                    }

                    //Sett variable de promocion en el arreglo inicial
                    rows[i].ListaHijos[f].dataValues.precioFinal = precioTemporal
                    rows[i].ListaHijos[f].dataValues.precioFinalMasImpuesto = (precioTemporal * (1 + (tipoImpuesto / 100)))
                    rows[i].ListaHijos[f].dataValues.precioFinalMasImpuesto = parseFloat(rows[i].ListaHijos[f].dataValues.precioFinalMasImpuesto.toFixed(2))
                }

            }
            return rows
        }
        catch(e){
            return "No fue posible establecer las listas de precio en base a un SN"
        }
    },













    //Obtiene los descuentos de grupo (son dos apis, una con SN y otra sin SN asignado)
    getChildsSNDiscounts: async function (rows, id_socio_negocio) {
        try{
            const constSociosNegocio = await models.SociosNegocio.findOne({
                where: {
                    sn_socios_negocio_id : id_socio_negocio
                },
                attributes: ["sn_cardcode", "sn_codigo_grupo", "sn_porcentaje_descuento_total"]
            })

            for (var i = 0; i < rows.length; i++) 
            {
                for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                {
                    //Si es stock inactivo no tendra ni revisara descuentos
                    if(rows[i].ListaHijos[f].dataValues.prod_es_stock_inactivo == true)
                    {
                        rows[i].ListaHijos[f].dataValues.descuentoGrupoBool = false
                        rows[i].ListaHijos[f].dataValues.descuentoGrupo = 0
                        rows[i].ListaHijos[f].dataValues.snDescuento = 0
                    }
                    else
                    {
                        var descuentoGrupo = await this.getSocioNegocioDiscountPerProduct(rows[i].ListaHijos[f].dataValues, constSociosNegocio)
                        if(descuentoGrupo > 0 || constSociosNegocio.sn_porcentaje_descuento_total > 0)
                        {
                            rows[i].ListaHijos[f].dataValues.descuentoGrupoBool = true
                            rows[i].ListaHijos[f].dataValues.descuentoGrupo = descuentoGrupo
                            rows[i].ListaHijos[f].dataValues.snDescuento = parseFloat(constSociosNegocio.sn_porcentaje_descuento_total)
                        }
                        else
                        {
                            rows[i].ListaHijos[f].dataValues.descuentoGrupoBool = false
                            rows[i].ListaHijos[f].dataValues.descuentoGrupo = 0
                            rows[i].ListaHijos[f].dataValues.snDescuento = parseFloat(constSociosNegocio.sn_porcentaje_descuento_total)
                        }
                    }
                }
            }
            return rows
        }
        catch(e){
            console.log("error en get descuentos dielsa")
            return "No fue posible obtener la mejor promocion por hijos"
        }
    },
    getChildsNULLSNDiscounts: async function (rows) {
        try{
            for (var i = 0; i < rows.length; i++) 
            {
                for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                {
                    //Si es stock inactivo no tendra ni revisara descuentos
                    if(rows[i].ListaHijos[f].dataValues.prod_es_stock_inactivo == true)
                    {
                        rows[i].ListaHijos[f].dataValues.descuentoGrupoBool = false
                        rows[i].ListaHijos[f].dataValues.descuentoGrupo = 0
                        rows[i].ListaHijos[f].dataValues.snDescuento = 0
                    }
                    else
                    {
                        var descuentoGrupo = await this.getSocioNegocioDiscountPerProductNullSN(rows[i].ListaHijos[f].dataValues)
                        if(descuentoGrupo > 0)
                        {
                            rows[i].ListaHijos[f].dataValues.descuentoGrupoBool = true
                            rows[i].ListaHijos[f].dataValues.descuentoGrupo = descuentoGrupo
                            rows[i].ListaHijos[f].dataValues.snDescuento = 0
                        }
                        else
                        {
                            rows[i].ListaHijos[f].dataValues.descuentoGrupoBool = false
                            rows[i].ListaHijos[f].dataValues.descuentoGrupo = 0
                            rows[i].ListaHijos[f].dataValues.snDescuento = 0
                        }
                    }
                }
            }
            return rows
        }
        catch(e){
            console.log("error en get descuentos dielsa2")
            return "No fue posible obtener la mejor promocion por hijos"
        }
    },


    getChildsSNDiscountsOnlyChilds: async function (rows, id_socio_negocio) {
        try{
            const constSociosNegocio = await models.SociosNegocio.findOne({
                where: {
                    sn_socios_negocio_id : id_socio_negocio
                },
                attributes: ["sn_cardcode", "sn_codigo_grupo", "sn_porcentaje_descuento_total"]
            })

            for (var i = 0; i < rows.length; i++) 
            {
                //Si es stock inactivo no tendra ni revisara descuentos
                if(rows[i].prod_es_stock_inactivo == true)
                {
                    rows[i].descuentoGrupoBool = false
                    rows[i].descuentoGrupo = 0
                    rows[i].snDescuento = 0
                }
                else
                {
                    var descuentoGrupo = await this.getSocioNegocioDiscountPerProduct(rows[i], constSociosNegocio)
                    if(descuentoGrupo > 0 || constSociosNegocio.sn_porcentaje_descuento_total > 0)
                    {
                        rows[i].descuentoGrupoBool = true
                        rows[i].descuentoGrupo = descuentoGrupo
                        rows[i].snDescuento = parseFloat(constSociosNegocio.sn_porcentaje_descuento_total)
                    }
                    else
                    {
                        rows[i].descuentoGrupoBool = false
                        rows[i].descuentoGrupo = 0
                        rows[i].snDescuento = parseFloat(constSociosNegocio.sn_porcentaje_descuento_total)
                    }
                }
            }
            return rows
        }
        catch(e){
            console.log("error en get descuentos dielsa")
            return "No fue posible obtener la mejor promocion por hijos"
        }
    },
    getChildsNULLSNDiscountsOnlyChilds: async function (rows) {
        try{
            for (var i = 0; i < rows.length; i++) 
            {
                
                //Si es stock inactivo no tendra ni revisara descuentos
                if(rows[i].prod_es_stock_inactivo == true)
                {
                    rows[i].descuentoGrupoBool = false
                    rows[i].descuentoGrupo = 0
                    rows[i].snDescuento = 0
                }
                else
                {
                    var descuentoGrupo = await this.getSocioNegocioDiscountPerProductNullSN(rows[i])
                    if(descuentoGrupo > 0)
                    {
                        rows[i].descuentoGrupoBool = true
                        rows[i].descuentoGrupo = descuentoGrupo
                        rows[i].snDescuento = 0
                    }
                    else
                    {
                        rows[i].descuentoGrupoBool = false
                        rows[i].descuentoGrupo = 0
                        rows[i].snDescuento = 0
                    }
                }
            }
            return rows
        }
        catch(e){
            console.log("error en get descuentos dielsa2")
            return "No fue posible obtener la mejor promocion por hijos"
        }
    },







    getSocioNegocioDiscountPerProduct: async function (costProductoHijo, constSociosNegocio) 
    {
        try{
            var listaCodigosProp = '';

            if(costProductoHijo.prod_codigo_prop_list)
            {
                for (var i = 0; i < costProductoHijo.prod_codigo_prop_list.length; i++) 
                {
                    listaCodigosProp = listaCodigosProp + "'"+  costProductoHijo.prod_codigo_prop_list[i]  + "'"
                    if(i+1 < costProductoHijo.prod_codigo_prop_list.length)
                    {
                        listaCodigosProp = listaCodigosProp + ","
                    }
                }
            }


            if(listaCodigosProp == '')
            {
                listaCodigosProp = "'noitems'";
            }

            var sqlGetPromotionForProducts = `
                select 
                    sndes_porcentaje_descuento
                from 
                    (   
                        select 
                            * 
                        from
                            socios_negocio_descuentos sndes
                        where
                            --buscar por codigo cliente
                            (
                                sndes_tipo = 'Clientes'
                                and sndes_codigo = '`+constSociosNegocio.sn_cardcode+`'
                                and current_date between  sndes_fecha_inicio and sndes_fecha_final
                                and sndes_cmm_estatus_id = 1000175
                            )
                            or
                            --buscar por codigo grupo
                            (
                                sndes_tipo = 'Grupo'
                                and sndes_codigo = '`+constSociosNegocio.sn_codigo_grupo+`'
                                and current_date between  sndes_fecha_inicio and sndes_fecha_final
                                and sndes_cmm_estatus_id = 1000175
                            )
                            or
                            --buscar por codigo TODOS
                            (
                                sndes_tipo = 'CLIENTES'
                                and sndes_codigo = 'TODOS'
                                and current_date between  sndes_fecha_inicio and sndes_fecha_final
                                and sndes_cmm_estatus_id = 1000175
                            )
                    ) as p1
                where 
                    --Del resultado buscar las 4 variantes de busqueda por articulo
                    --SKU
                    (
                        sndes_subtipo = 'Articulos'
                        and sndes_sub_codigo = '`+costProductoHijo.prod_sku+`'
                    )
                    --Marca
                    or
                    (
                        sndes_subtipo = 'Fabricante'
                        and sndes_sub_codigo = '`+costProductoHijo.prod_codigo_marca+`'
                    )
                    --
                    or
                    (
                        sndes_subtipo = 'PropArticulos'
                        and sndes_sub_codigo in (`+listaCodigosProp+`)
                    )
                    --Categoria (grupo)
                    or
                    (
                        sndes_subtipo = 'GrupoArticulos'
                        and sndes_sub_codigo = '`+costProductoHijo.prod_codigo_grupo+`'
                    )
                    order by sndes_porcentaje_descuento desc limit 1
            `;

            const constsqlElementoPromocionInsert = await sequelize.query(sqlGetPromotionForProducts,
            { 
                type: sequelize.QueryTypes.SELECT 
            });

            if(constsqlElementoPromocionInsert.length > 0)
            {
                return constsqlElementoPromocionInsert[0].sndes_porcentaje_descuento
            }
            else
            {
                return 0 
            }

        }
        catch(e){
            console.log(e)
            console.log("error al obtener descuento por producto1")
            return "No fue posible obtener descuento por producto"
        }
    },
    getSocioNegocioDiscountPerProductNullSN: async function (costProductoHijo) 
    {
        try{
            var listaCodigosProp = '';

            if(costProductoHijo.prod_codigo_prop_list)
            {
                for (var i = 0; i < costProductoHijo.prod_codigo_prop_list.length; i++) 
                {
                    listaCodigosProp = listaCodigosProp + "'"+  costProductoHijo.prod_codigo_prop_list[i]  + "'"
                    if(i+1 < costProductoHijo.prod_codigo_prop_list.length)
                    {
                        listaCodigosProp = listaCodigosProp + ","
                    }
                }
            }

            if(listaCodigosProp == '')
            {
                listaCodigosProp = "'noitems'";
            }

            var sqlGetPromotionForProducts = `
                select 
                    sndes_porcentaje_descuento
                from 
                    (   
                        select 
                            * 
                        from
                            socios_negocio_descuentos sndes
                        where
                            --buscar por codigo TODOS
                            (
                                sndes_tipo = 'CLIENTES'
                                and sndes_codigo = 'TODOS'
                                and current_date between  sndes_fecha_inicio and sndes_fecha_final
                                and sndes_cmm_estatus_id = 1000175
                            )
                    ) as p1
                where 
                    --Del resultado buscar las 4 variantes de busqueda por articulo
                    --SKU
                    (
                        sndes_subtipo = 'Articulos'
                        and sndes_sub_codigo = '`+costProductoHijo.prod_sku+`'
                    )
                    --Marca
                    or
                    (
                        sndes_subtipo = 'Fabricante'
                        and sndes_sub_codigo = '`+costProductoHijo.prod_codigo_marca+`'
                    )
                    --
                    or
                    (
                        sndes_subtipo = 'PropArticulos'
                        and sndes_sub_codigo in (`+listaCodigosProp+`)
                    )
                    --Categoria (grupo)
                    or
                    (
                        sndes_subtipo = 'GrupoArticulos'
                        and sndes_sub_codigo = '`+costProductoHijo.prod_codigo_grupo+`'
                    )
                    order by sndes_porcentaje_descuento desc limit 1
            `;

            const constsqlElementoPromocionInsert = await sequelize.query(sqlGetPromotionForProducts,
            { 
                type: sequelize.QueryTypes.SELECT 
            });

            if(constsqlElementoPromocionInsert.length > 0)
            {
                return constsqlElementoPromocionInsert[0].sndes_porcentaje_descuento
            }
            else
            {
                return 0 
            }
        }
        catch(e){
            console.log("error al obtener descuento por producto2")
            return "No fue posible obtener descuento por producto"
        }
    },

    setBasePriceForChildsWithPromotions: async function (rows, idSocioNegocio) {
        try{
            //Calcular IVA
                var tipoImpuesto = 16
                if(idSocioNegocio != null)
                {
                    
                    //Obtener informacion de socio de negocio
                    const constSociosNegocio = await models.SociosNegocio.findOne(
                    {
                        where: {
                            sn_socios_negocio_id: idSocioNegocio
                        },
                        attributes:  ["sn_socios_negocio_id", "sn_cardcode", "sn_codigo_direccion_facturacion", "sn_lista_precios"]
                    });

                    //Obtener direccion de facturacion para calcular el iva
                    const constSociosNegocioDirecciones = await models.SociosNegocioDirecciones.findOne(
                    {
                        where: {
                            snd_cardcode: constSociosNegocio.sn_cardcode,
                            snd_idDireccion: constSociosNegocio.sn_codigo_direccion_facturacion,
                            snd_tipoDir: "B"
                        }
                    });

                    //Obtendra el valor del impuesto aplicable que tendra el SN para los productos
                    if(constSociosNegocioDirecciones.snd_codigo_postal)
                    {
                        const constCodigosPostales = await models.CodigosPostales.findOne(
                        {
                            where: {
                                cp_codigo_postal: constSociosNegocioDirecciones.snd_codigo_postal
                            }
                        });

                        if(constCodigosPostales)
                        {   
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
                    }
                    
                }
            //Fin Calcular IVA




            
            for (var i = 0; i < rows.length; i++) 
            {
                for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                {
                    var precioBasePorListaPrecio
                    var totalPromocion = 0
                    var tipoDescuento = ''

                    //Obtener precio base y dejarlo ahi por si acaso
                    precioBasePorListaPrecio = rows[i].ListaHijos[f].dataValues.prod_precio
                    rows[i].ListaHijos[f].dataValues.precioBasePorListaPrecio = precioBasePorListaPrecio

                    //Precio Temporal
                    var precioTemporal = precioBasePorListaPrecio








                    //Buscar promocion por monto fijo
                    if(rows[i].ListaHijos[f].dataValues.promocion.length > 0)
                    {
                        if(rows[i].ListaHijos[f].dataValues.promocion[0].cmm_valor == "Monto fijo")
                        {   
                            if(totalPromocion < rows[i].ListaHijos[f].dataValues.promocion[0].promdes_descuento_exacto)
                            {
                                totalPromocion = rows[i].ListaHijos[f].dataValues.promocion[0].promdes_descuento_exacto
                                tipoDescuento = "Monto fijo"
                            }
                        }
                    }






                    //Buscar promocion por porcentaje
                    if(rows[i].ListaHijos[f].dataValues.promocion.length > 0)
                    {
                        //Calcular precio promocion activa
                        if(rows[i].ListaHijos[f].dataValues.promocion[0].cmm_valor == "Porcentaje")
                        {   
                            //Valor de la promocion por porcentaje
                            var porcentajePromocion = rows[i].ListaHijos[f].dataValues.promocion[0].promdes_descuento_exacto

                            //base - descuento = total Descuento
                            var totalDescuento = (((porcentajePromocion/100) * precioTemporal).toFixed(2))

                            if(totalPromocion < totalDescuento)
                            {
                                totalPromocion = totalDescuento
                                tipoDescuento = "Porcentaje"
                            }
                            //totalPromocion = rows[i].ListaHijos[f].dataValues.promocion[0].promdes_descuento_exacto
                        }
                    }














                    //Buscar promocion por grupo/marca/dielsa
                    if(rows[i].ListaHijos[f].dataValues.descuentoGrupoBool == true)
                    {
                        //totalTemp es el resultado que queda
                        var totalTemp = 0

                        //Total acumulado es el total de descuento en INT
                        var totalAcumulado = 0


                        //$300   56% descuento   168 total
                        //Descuento por lista de precios grupos
                        if(rows[i].ListaHijos[f].dataValues.descuentoGrupo > 0)
                        {
                            totalTemp = precioTemporal - (((rows[i].ListaHijos[f].dataValues.descuentoGrupo/100) * precioTemporal))
                            totalAcumulado = (((rows[i].ListaHijos[f].dataValues.descuentoGrupo/100) * precioTemporal))
                        }

                        //$300   56% descuento   168 total por grupo y 50% del SN = 84
                        if(rows[i].ListaHijos[f].dataValues.snDescuento > 0)
                        {
                            //Si es mayor que 0 significa que primero tomara el primer descuento y luego este si no solo lo hara directo
                            if(totalAcumulado > 0)
                            {
                                totalAcumulado = totalAcumulado + (((rows[i].ListaHijos[f].dataValues.snDescuento/100) * totalTemp))
                                totalTemp = totalTemp - (((rows[i].ListaHijos[f].dataValues.snDescuento/100) * totalTemp))
                                
                            }
                            else
                            {
                                totalAcumulado = (((rows[i].ListaHijos[f].dataValues.snDescuento/100) * precioTemporal))
                                totalTemp = precioTemporal - (((rows[i].ListaHijos[f].dataValues.snDescuento/100) * precioTemporal))
                                
                            }
                        }

                        //ver si es mayor o menor que la promocion estandar
                        if(totalPromocion < totalAcumulado)
                        {
                            totalPromocion = totalAcumulado
                            tipoDescuento = "Grupos SN"
                        }
                    }







                    //calcular el precio final del producto
                    var precioMenosPromo = precioTemporal-totalPromocion
                    if(precioMenosPromo < 0)
                    {
                        precioMenosPromo = 0
                    }


                    //Precio base final
                    rows[i].ListaHijos[f].dataValues.precioFinal = precioTemporal
                    //Precio base final + impuesto
                    rows[i].ListaHijos[f].dataValues.precioBaseMasImpuesto = parseFloat((precioTemporal * (1 + (tipoImpuesto / 100))).toFixed(2))



                    //Tipo de promocion final
                    rows[i].ListaHijos[f].dataValues.tipoPromocionFinal = tipoDescuento

                    //total de promocion (precio prod - promocion o descuento (sin iva))
                    rows[i].ListaHijos[f].dataValues.totalDescuentoFinal = parseFloat(totalPromocion)
                    

                    //total de promocion (precio prod - promocion o descuento (sin iva))
                    rows[i].ListaHijos[f].dataValues.precioMenosDescuento = parseFloat(precioMenosPromo.toFixed(2))



                    //Precio final menos promocion e + impuestos
                    rows[i].ListaHijos[f].dataValues.precioFinalMasImpuesto = (precioMenosPromo * (1 + (tipoImpuesto / 100)))

                    //Precio Fixed a dos decimales y float parse
                    rows[i].ListaHijos[f].dataValues.precioFinalMasImpuesto = parseFloat(rows[i].ListaHijos[f].dataValues.precioFinalMasImpuesto.toFixed(2))
                }

            }
            return rows
        }
        catch(e){
            console.log(e)
            return "No fue posible establecer las listas de precio en base a un SN"
        }
    },

    setBasePriceForChildsWithPromotionsOnlyChilds: async function (rows, idSocioNegocio) {
        try{
            //Calcular IVA
                var tipoImpuesto = 16
                if(idSocioNegocio != null)
                {
                    
                    //Obtener informacion de socio de negocio
                    const constSociosNegocio = await models.SociosNegocio.findOne(
                    {
                        where: {
                            sn_socios_negocio_id: idSocioNegocio
                        },
                        attributes:  ["sn_socios_negocio_id", "sn_cardcode", "sn_codigo_direccion_facturacion", "sn_lista_precios"]
                    });

                    //Obtener direccion de facturacion para calcular el iva
                    const constSociosNegocioDirecciones = await models.SociosNegocioDirecciones.findOne(
                    {
                        where: {
                            snd_cardcode: constSociosNegocio.sn_cardcode,
                            snd_idDireccion: constSociosNegocio.sn_codigo_direccion_facturacion,
                            snd_tipoDir: "B"
                        }
                    });

                    //Obtendra el valor del impuesto aplicable que tendra el SN para los productos
                    if(constSociosNegocioDirecciones.snd_codigo_postal)
                    {
                        const constCodigosPostales = await models.CodigosPostales.findOne(
                        {
                            where: {
                                cp_codigo_postal: constSociosNegocioDirecciones.snd_codigo_postal
                            }
                        });

                        if(constCodigosPostales)
                        {   
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
                    }
                    
                }
            //Fin Calcular IVA
 



            
            for (var i = 0; i < rows.length; i++) 
            {
                var precioBasePorListaPrecio
                var totalPromocion = 0
                var tipoDescuento = ''

                //Obtener precio base y dejarlo ahi por si acaso
                precioBasePorListaPrecio = rows[i].prod_precio
                rows[i].precioBasePorListaPrecio = precioBasePorListaPrecio

                //Precio Temporal
                var precioTemporal = precioBasePorListaPrecio








                //Buscar promocion por monto fijo
                if(rows[i].promocion.length > 0)
                {
                    if(rows[i].promocion[0].cmm_valor == "Monto fijo")
                    {   
                        if(totalPromocion < rows[i].promocion[0].promdes_descuento_exacto)
                        {
                            totalPromocion = rows[i].promocion[0].promdes_descuento_exacto
                            tipoDescuento = "Monto fijo"
                        }
                    }
                }






                //Buscar promocion por porcentaje
                if(rows[i].promocion.length > 0)
                {
                    //Calcular precio promocion activa
                    if(rows[i].promocion[0].cmm_valor == "Porcentaje")
                    {   
                        //Valor de la promocion por porcentaje
                        var porcentajePromocion = rows[i].promocion[0].promdes_descuento_exacto

                        //base - descuento = total Descuento
                        var totalDescuento = (((porcentajePromocion/100) * precioTemporal).toFixed(2))

                        if(totalPromocion < totalDescuento)
                        {
                            totalPromocion = totalDescuento
                            tipoDescuento = "Porcentaje"
                        }
                        //totalPromocion = rows[i].ListaHijos[f].dataValues.promocion[0].promdes_descuento_exacto
                    }
                }














                //Buscar promocion por grupo/marca/dielsa
                if(rows[i].descuentoGrupoBool == true)
                {
                    //totalTemp es el resultado que queda
                    var totalTemp = 0

                    //Total acumulado es el total de descuento en INT
                    var totalAcumulado = 0


                    //$300   56% descuento   168 total
                    //Descuento por lista de precios grupos
                    if(rows[i].descuentoGrupo > 0)
                    {
                        totalTemp = precioTemporal - (((rows[i].descuentoGrupo/100) * precioTemporal))
                        totalAcumulado = (((rows[i].descuentoGrupo/100) * precioTemporal))
                    }

                    //$300   56% descuento   168 total por grupo y 50% del SN = 84
                    if(rows[i].snDescuento > 0)
                    {
                        //Si es mayor que 0 significa que primero tomara el primer descuento y luego este si no solo lo hara directo
                        if(totalAcumulado > 0)
                        {
                            totalAcumulado = totalAcumulado + (((rows[i].snDescuento/100) * totalTemp))
                            totalTemp = totalTemp - (((rows[i].snDescuento/100) * totalTemp))
                            
                        }
                        else
                        {
                            totalAcumulado = (((rows[i].snDescuento/100) * precioTemporal))
                            totalTemp = precioTemporal - (((rows[i].snDescuento/100) * precioTemporal))
                            
                        }
                    }

                    //ver si es mayor o menor que la promocion estandar
                    if(totalPromocion < totalAcumulado)
                    {
                        totalPromocion = totalAcumulado
                        tipoDescuento = "Grupos SN"
                    }
                }







                //calcular el precio final del producto
                var precioMenosPromo = precioTemporal-totalPromocion
                if(precioMenosPromo < 0)
                {
                    precioMenosPromo = 0
                }


                //Precio base final
                rows[i].precioFinal = precioTemporal
                //Precio base final + impuesto
                rows[i].precioBaseMasImpuesto = parseFloat((precioTemporal * (1 + (tipoImpuesto / 100))).toFixed(2))



                //Tipo de promocion final
                rows[i].tipoPromocionFinal = tipoDescuento

                //total de promocion (precio prod - promocion o descuento (sin iva))
                rows[i].totalDescuentoFinal = parseFloat(totalPromocion)
                

                //total de promocion (precio prod - promocion o descuento (sin iva))
                rows[i].precioMenosDescuento = parseFloat(precioMenosPromo.toFixed(2))



                //Precio final menos promocion e + impuestos
                rows[i].precioFinalMasImpuesto = (precioMenosPromo * (1 + (tipoImpuesto / 100)))

                //Precio Fixed a dos decimales y float parse
                rows[i].precioFinalMasImpuesto = parseFloat(rows[i].precioFinalMasImpuesto.toFixed(2))

            }
            return rows
        }
        catch(e){
            console.log(e)
            console.log("error al obtener precioschilds")
            return "No fue posible establecer las listas de precio en base a un SN"
        }
    },

    setDiscountAmountOverPromotion: async function (rows, idSocioNegocio) {
        try{
            for (var i = 0; i < rows.length; i++) 
            {
                for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                {
                    //verificara si la promocion es mayor que la promocion de sn para dejar un doble promotion (cosas dielsa)
                    var precioPromocionDielsaBool = false
                    var DescuentoSNFijo = 0
                    var tipoDescuento = rows[i].ListaHijos[f].dataValues.tipoPromocionFinal

                    
                    if(rows[i].ListaHijos[f].dataValues.promocion.length > 0 && rows[i].ListaHijos[f].dataValues.descuentoGrupoBool == true)
                    {
                        if(tipoDescuento == "Porcentaje" || tipoDescuento == 'Monto fijo')
                        {
                            precioPromocionDielsaBool = true
                            var DescuentoSNFijo = rows[i].ListaHijos[f].dataValues.prod_precio

                            if(rows[i].ListaHijos[f].dataValues.descuentoGrupo > 0)
                            {
                                DescuentoSNFijo = DescuentoSNFijo - (DescuentoSNFijo * (rows[i].ListaHijos[f].dataValues.descuentoGrupo / 100))
                            }

                            if(rows[i].ListaHijos[f].dataValues.snDescuento > 0)
                            {
                                DescuentoSNFijo = DescuentoSNFijo - (DescuentoSNFijo * (rows[i].ListaHijos[f].dataValues.snDescuento / 100))
                            }
                        }
                    }


                    rows[i].ListaHijos[f].dataValues.precioPromocionDielsaBool = precioPromocionDielsaBool
                    rows[i].ListaHijos[f].dataValues.DescuentoDielsaFijo = DescuentoSNFijo
                }

            }
            return rows
        }
        catch(e){
            console.log(e)
            return "No fue posible establecer las listas de precio en base a un SN"
        }
    },
    setDiscountAmountOverPromotionOnlyChilds: async function (rows, idSocioNegocio) {
        try{
            for (var i = 0; i < rows.length; i++) 
            {
                //verificara si la promocion es mayor que la promocion de sn para dejar un doble promotion (cosas dielsa)
                var precioPromocionDielsaBool = false
                var DescuentoSNFijo = 0
                var tipoDescuento = rows[i].tipoPromocionFinal
                
                if(rows[i].promocion.length > 0 && rows[i].descuentoGrupoBool == true)
                {
                    if(tipoDescuento == "Porcentaje" || tipoDescuento == 'Monto fijo')
                    {
                        precioPromocionDielsaBool = true
                        var DescuentoSNFijo = rows[i].prod_precio

                        if(rows[i].descuentoGrupo > 0)
                        {
                            DescuentoSNFijo = DescuentoSNFijo - (DescuentoSNFijo * (rows[i].descuentoGrupo / 100))
                        }

                        if(rows[i].snDescuento > 0)
                        {
                            DescuentoSNFijo = DescuentoSNFijo - (DescuentoSNFijo * (rows[i].snDescuento / 100))
                        }
                    }
                }

                rows[i].precioPromocionDielsaBool = precioPromocionDielsaBool
                rows[i].DescuentoDielsaFijo = DescuentoSNFijo
            }
            return rows
        }
        catch(e){
            console.log(e)
            return "No fue posible establecer las listas de precio en base a un SN"
        }
    },

    setDielsaPromotionsOverPromotions: async function (rows, idSocioNegocio) {
        try{
            
            for (var i = 0; i < rows.length; i++) 
            {
                for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                {
                    //verificara si la promocion es mayor que la promocion de sn para dejar un doble promotion (cosas dielsa)
                    var precioPromocionDielsaBool = false
                    var DescuentoSNFijo = 0
                    var tipoDescuento = rows[i].ListaHijos[f].dataValues.tipoPromocionFinal

                    if(rows[i].ListaHijos[f].dataValues.promocion.length > 0 && rows[i].ListaHijos[f].dataValues.descuentoGrupoBool == true)
                    {
                        if(tipoDescuento == "Porcentaje" || tipoDescuento == 'Monto fijo')
                        {
                            precioPromocionDielsaBool = true
                            var DescuentoSNFijo = rows[i].ListaHijos[f].dataValues.prod_precio

                            if(rows[i].ListaHijos[f].dataValues.descuentoGrupo > 0)
                            {
                                DescuentoSNFijo = DescuentoSNFijo - (DescuentoSNFijo * (rows[i].ListaHijos[f].dataValues.descuentoGrupo / 100))
                            }

                            if(rows[i].ListaHijos[f].dataValues.snDescuento > 0)
                            {
                                DescuentoSNFijo = DescuentoSNFijo - (DescuentoSNFijo * (rows[i].ListaHijos[f].dataValues.snDescuento / 100))
                            }
                        }
                    }

                    rows[i].ListaHijos[f].dataValues.precioPromocionDielsaBool = precioPromocionDielsaBool
                    rows[i].ListaHijos[f].dataValues.DescuentoDielsaFijo = DescuentoSNFijo
                }

            }
            return rows
        }
        catch(e){
            console.log(e)
            return "No fue posible settear las promociones dielsa cuando la promocion pcp es mayor"
        }
    },


    setBestPromotionChildToFatherV2: async function (rows) {
        try{
            for (var i = 0; i < rows.length; i++) 
            {
                //Por cada padre regresara la variable a 0
                var prod_producto_id_con_descuento_exacto = 0
                var prod_producto_id_con_descuento = 0
                var prod_producto_id_con_descuento_precio = 0
                var prod_producto_id_con_descuento_precio_mas_impuesto = 0
                var prod_producto_id_con_descuento_exacto = 0
                var prod_producto_id_con_descuento_precio_final = 0
                var prod_producto_id_con_descuento_precio_final_mas_impuesto = 0

                var promocionTotal = 0

                for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                {
                    promocionTotal = rows[i].ListaHijos[f].dataValues.totalDescuentoFinal

                    //Si la promocion total es mas alta que la anterior tomara ese id de producto para mostrarlo
                    if(promocionTotal > prod_producto_id_con_descuento_exacto)
                    {
                        prod_producto_id_con_descuento = rows[i].ListaHijos[f].dataValues.prod_producto_id
                        prod_producto_id_con_descuento_precio = rows[i].ListaHijos[f].dataValues.prod_precio
                        prod_producto_id_con_descuento_precio_mas_impuesto = rows[i].ListaHijos[f].dataValues.precioBaseMasImpuesto

                        prod_producto_id_con_descuento_precio_final_mas_impuesto = rows[i].ListaHijos[f].dataValues.precioFinalMasImpuesto
                        prod_producto_id_con_descuento_exacto = promocionTotal

                        prod_producto_id_con_descuento_precio_final = prod_producto_id_con_descuento_precio - promocionTotal
                    }
                }

                //Cuando termine de recorrer los hijos setteara las variables en el padre
                rows[i].prod_producto_id_con_descuento = prod_producto_id_con_descuento
                rows[i].prod_producto_id_con_descuento_precio = prod_producto_id_con_descuento_precio
                rows[i].prod_producto_id_con_descuento_precio_mas_impuesto = prod_producto_id_con_descuento_precio_mas_impuesto
                rows[i].prod_producto_id_con_descuento_precio_final = prod_producto_id_con_descuento_precio_final
                rows[i].prod_producto_id_con_descuento_precio_final_mas_impuesto = prod_producto_id_con_descuento_precio_final_mas_impuesto
                rows[i].prod_producto_id_con_descuento_exacto = prod_producto_id_con_descuento_exacto
            }
            return rows
        }
        catch(e){
            console.log(e)
            return "No fue obtener el mejor hijo con promocion"
        }
    },





    getChildsStocksDetalle: async function (rows) {
        try{
            for (var i = 0; i < rows.length; i++) 
            {
                for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                {

                    //Obtener informacion de socio de negocio
                    const constStockProductoDetalle = await models.StockProductoDetalle.findAll(
                    {
                        where: {
                            spd_prod_producto_id: rows[i].ListaHijos[f].dataValues.prod_producto_id
                        },
                        attributes:  ["spd_prod_producto_id", "spd_alm_almacen_id", "spd_codigo_lote", "spd_disponible"]
                    });






                    

                    //Si trae informacion pondra esa informacion en el detalle del stock del producto
                    if(constStockProductoDetalle)
                    {

                        //Set almacen info
                        for (var g = 0; g < constStockProductoDetalle.length; g++) 
                        {
                            //Obtener informacion de socio de negocio
                            const constAlmacenes = await models.Almacenes.findOne(
                            {
                                where: {
                                    alm_almacen_id: constStockProductoDetalle[g].dataValues.spd_alm_almacen_id
                                },
                                attributes:  ["alm_nombre"]
                            });

                            if(constAlmacenes)
                            {
                                constStockProductoDetalle[g].dataValues.alm_nombre = constAlmacenes.alm_nombre
                            }
                            else
                            {
                                constStockProductoDetalle[g].dataValues.alm_nombre = ""
                            }
                        }


                        rows[i].ListaHijos[f].dataValues.StockProductoDetalle = constStockProductoDetalle
                    }
                    else
                    {
                        rows[i].ListaHijos[f].dataValues.StockProductoDetalle = []
                    }
                }
            }
            return rows
        }
        catch(e){
            return "No fue posible obtener la mejor promocion por hijos"
        }
    },
    setChildsUSDChange: async function (rows) {
        try{
            for (var i = 0; i < rows.length; i++) 
            {
                for (var f = 0; f < rows[i].ListaHijos.length; f++) 
                {

                    //Obtener tipo de cambio
                    const constTipoCambio = await models.ControlMaestroMultiple.findOne(
                    {
                        where: {
                            cmm_nombre: "TIPO_CAMBIO_USD"
                        },
                        attributes: ["cmm_valor"]
                    })
                    var USDValor = constTipoCambio.cmm_valor


                    rows[i].ListaHijos[f].dataValues.prod_precio_base_USB = rows[i].ListaHijos[f].dataValues.prod_precio / USDValor
                    rows[i].ListaHijos[f].dataValues.prod_precio_precioFinal = rows[i].ListaHijos[f].dataValues.precioMenosDescuento / USDValor

                }
            }
            return rows
        }
        catch(e){
            return "No fue posible obtener la mejor promocion por hijos"
        }
    },
    setOnlyChildsUSDChange: async function (rows) {
        try{
            for (var i = 0; i < rows.length; i++) 
            {
                //Obtener tipo de cambio
                const constTipoCambio = await models.ControlMaestroMultiple.findOne(
                {
                    where: {
                        cmm_nombre: "TIPO_CAMBIO_USD"
                    },
                    attributes: ["cmm_valor"]
                })
                var USDValor = constTipoCambio.cmm_valor

                rows[i].prod_precio_base_USD = rows[i].prod_precio / USDValor
                rows[i].prod_precio_precioFinal = rows[i].precioMenosDescuento / USDValor
            }
            return rows
        }
        catch(e){
            return "No fue posible obtener la mejor promocion por hijos"
        }
    },
    getChildsStocksDetalleOnlyChilds: async function (rows) {
        try{
            for (var i = 0; i < rows.length; i++) 
            {
                //Obtener informacion de socio de negocio
                const constStockProductoDetalle = await models.StockProductoDetalle.findAll(
                {
                    where: {
                        spd_prod_producto_id: rows[i].prod_producto_id
                    },
                    attributes:  ["spd_prod_producto_id", "spd_alm_almacen_id", "spd_codigo_lote", "spd_disponible"]
                });

                //Si trae informacion pondra esa informacion en el detalle del stock del producto
                if(constStockProductoDetalle)
                {
                    //Set almacen info
                    for (var g = 0; g < constStockProductoDetalle.length; g++) 
                    {
                        //Obtener informacion de socio de negocio
                        const constAlmacenes = await models.Almacenes.findOne(
                        {
                            where: {
                                alm_almacen_id: constStockProductoDetalle[g].dataValues.spd_alm_almacen_id
                            },
                            attributes:  ["alm_nombre"]
                        });

                        if(constAlmacenes)
                        {
                            constStockProductoDetalle[g].dataValues.alm_nombre = constAlmacenes.alm_nombre
                        }
                        else
                        {
                            constStockProductoDetalle[g].dataValues.alm_nombre = ""
                        }
                    }
                    rows[i].StockProductoDetalle = constStockProductoDetalle
                }
                else
                {
                    rows[i].StockProductoDetalle = []
                }
            }
            return rows
        }
        catch(e){
            console.log(e)
            return "No fue posible obtener la mejor promocion por hijos"
        }
    },



    getChildsFathersIDOnlyChilds: async function (rows) {
        try{

            for (var i = 0; i < rows.length; i++) 
            {
                console.log(rows[i].prod_prod_producto_padre_sku)
                //Buscar padre por su nombre y luego concatenar ID
                const constProducto = await models.Producto.findOne(
                {
                    where: {
                        prod_sku: rows[i].prod_prod_producto_padre_sku
                    }
                });


                if(constProducto)
                {
                    rows[i].productoPadreId = constProducto.prod_producto_id
                }
                
            }
            return rows
        }
        catch(e){
            return "No fue posible obtener la mejor promocion por hijos"
        }
    },
    


    getIfIsOxenProduct: async function (prod_producto_id) {
        try{
            var resultFinal = false

            //Validar que sea producto hijo
            const constProducto = await models.Producto.findOne(
            {
                where: {
                    prod_producto_id: prod_producto_id
                },
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                }
            });

            if(constProducto)
            {
                //Validar que sea producto hijo
                const constMarca = await models.Marca.findOne(
                {
                    where: {
                        mar_marca_id: constProducto.prod_codigo_marca
                    },
                    attributes: {
                        exclude: ['createdAt', 'updatedAt']
                    }
                });

                if(constMarca)
                {
                    if(constMarca.mar_nombre == 'OXEN')
                    {
                        resultFinal = true
                    }
                }
            }


            return resultFinal
        }
        catch(e){
            return false
        }
    },











    // Cotizaciones PASO COT 5
    getSocioNegocioAndProspectoDiscountPerProductForCotizaciones: async function (costProductoHijo, constSociosNegocio) 
    {
        try{
            var listaCodigosProp = '';

            if(costProductoHijo.prod_codigo_prop_list)
            {
                for (var i = 0; i < costProductoHijo.prod_codigo_prop_list.length; i++) 
                {
                    listaCodigosProp = listaCodigosProp + "'"+  costProductoHijo.prod_codigo_prop_list[i]  + "'"
                    if(i+1 < costProductoHijo.prod_codigo_prop_list.length)
                    {
                        listaCodigosProp = listaCodigosProp + ","
                    }
                }
            }


            if(listaCodigosProp == '')
            {
                listaCodigosProp = "'noitems'";
            }

            var sqlGetPromotionForProducts = `
                select 
                    sndes_porcentaje_descuento
                from 
                    (   
                        select 
                            * 
                        from
                            socios_negocio_descuentos sndes
                        where
                            --buscar por codigo cliente
                            (
                                sndes_tipo = 'Clientes'
                                and sndes_codigo = '`+constSociosNegocio.sn_cardcode+`'
                                and current_date between  sndes_fecha_inicio and sndes_fecha_final
                                and sndes_cmm_estatus_id = 1000175
                            )
                            or
                            --buscar por codigo grupo
                            (
                                sndes_tipo = 'Grupo'
                                and sndes_codigo = '`+constSociosNegocio.sn_codigo_grupo+`'
                                and current_date between  sndes_fecha_inicio and sndes_fecha_final
                                and sndes_cmm_estatus_id = 1000175
                            )
                            or
                            --buscar por codigo TODOS
                            (
                                sndes_tipo = 'CLIENTES'
                                and sndes_codigo = 'TODOS'
                                and current_date between  sndes_fecha_inicio and sndes_fecha_final
                                and sndes_cmm_estatus_id = 1000175
                            )
                    ) as p1
                where 
                    --Del resultado buscar las 4 variantes de busqueda por articulo
                    --SKU
                    (
                        sndes_subtipo = 'Articulos'
                        and sndes_sub_codigo = '`+costProductoHijo.prod_sku+`'
                    )
                    --Marca
                    or
                    (
                        sndes_subtipo = 'Fabricante'
                        and sndes_sub_codigo = '`+costProductoHijo.prod_codigo_marca+`'
                    )
                    --
                    or
                    (
                        sndes_subtipo = 'PropArticulos'
                        and sndes_sub_codigo in (`+listaCodigosProp+`)
                    )
                    --Categoria (grupo)
                    or
                    (
                        sndes_subtipo = 'GrupoArticulos'
                        and sndes_sub_codigo = '`+costProductoHijo.prod_codigo_grupo+`'
                    )
                    order by sndes_porcentaje_descuento desc limit 1
            `;

            const constsqlElementoPromocionInsert = await sequelize.query(sqlGetPromotionForProducts,
            { 
                type: sequelize.QueryTypes.SELECT 
            });

            if(constsqlElementoPromocionInsert.length > 0)
            {
                return constsqlElementoPromocionInsert[0].sndes_porcentaje_descuento
            }
            else
            {
                return 0 
            }

        }
        catch(e){
            console.log(e)
            console.log("error al obtener descuento por producto1")
            return "No fue posible obtener descuento por producto"
        }
    },


};


