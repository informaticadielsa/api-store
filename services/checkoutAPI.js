import models from '../models';
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const { Op } = require("sequelize");
import request from 'request-promise';
import statusControllers from '../mapeos/mapeoControlesMaestrosMultiples';
import productosUtils from "../services/productosUtils";
import cotizarCarritoFunction from "../services/cotizarCarritoFunctions";
import Producto from '../models/ProductoModel';

module.exports = {
    getCheckoutAPI: async function (cdc_sn_socio_de_negocio_id) {
        try{

            //Obtener tipo de cambio
            const constTipoCambio = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_nombre: "TIPO_CAMBIO_USD"
                },
                attributes: ["cmm_valor"]
            })
            var USDValor = constTipoCambio.cmm_valor



            var tipoImpuesto = 16

            //SN Carrito Activo
            const constCarritoDeCompra = await models.CarritoDeCompra.findOne(
            { 
                where: {
                    cdc_sn_socio_de_negocio_id: cdc_sn_socio_de_negocio_id
                },
                
            });


            //Productos de Carrito Activo
            let constProductoCarritoDeCompra = await models.ProductoCarritoDeCompra.findAll(
            {
                where: {
                    pcdc_carrito_de_compra_id: constCarritoDeCompra.cdc_carrito_de_compra_id
                },
                include: [
                    {
                        model: models.Producto
                    }
                ],
                attributes: {
                    exclude: ['createdAt','updatedAt','pcdc_lista_precio','pcdc_precio','pcdc_prod_producto_id_regalo','pcdc_cantidad_producto_regalo',
                    'pcdc_descuento_promocion', 'pcdc_prod_producto_id_promocion', 'pcdc_cantidad_producto_promocion', 'pcdc_cupon_aplicado',
                    'pcdc_mejor_descuento', 'pcdc_almacen_surtido', 'pcdc_no_disponible_para_compra', 'pcdc_back_order', 'pcdc_validado']
                },
                order: [
                    ['pcdc_producto_carrito_id', 'ASC']
                ]
            });


            //Buscar si tiene productos que sean Stock inactivo o Hasta agotar existencia con backorder
            var prodCarritoLenght = constProductoCarritoDeCompra.length
            for (var z = 0; z < prodCarritoLenght; z++) 
            {
                //Consultar tabla productos stock general por producto
                const constTieneStockGeneral = await models.Producto.findOne(
                {
                    where: {
                        prod_producto_id: constProductoCarritoDeCompra[z].dataValues.pcdc_prod_producto_id
                    },
                    attributes: ['prod_total_stock', 'prod_tipo_precio_base', 'prod_dias_resurtimiento']
                    
                });

                //Si existe el producto
                if(constTieneStockGeneral)
                {
                    //Comparar stock y ver si es diferente de lista de precios y si es backorder
                    if(constProductoCarritoDeCompra[z].dataValues.pcdc_producto_cantidad > constTieneStockGeneral.prod_total_stock  
                        && constTieneStockGeneral.prod_tipo_precio_base != 'Precio de Lista'
                         && constTieneStockGeneral.prod_dias_resurtimiento > 0)
                    {
                        //Settear el arreglo actual como que no sera backorder  (cambiar si es o eliminarlo del objecto completo)
                        // constProductoCarritoDeCompra[z].dataValues.backOrderPrecioLista = true




                        //Nuevo objeto que sera para backorder
                        // var clone = Object.assign({}, constProductoCarritoDeCompra[z]);
                        // console.log(clone)
                        // const newObject = Object.create(constProductoCarritoDeCompra[z]);
                        // newObject.dataValues.backOrderPrecioLista = true
                        
                        // newObject.dataValues.pcdc_producto_cantidad = newCantidad

                        //Agregar nuevo objeto
                        // constProductoCarritoDeCompra.push(constProductoCarritoDeCompra[z])
                        // Object.assign(constProductoCarritoDeCompra, newObject)


                        var cantidadOriginal = constProductoCarritoDeCompra[z].dataValues.pcdc_producto_cantidad
                        console.log(cantidadOriginal)
                        constProductoCarritoDeCompra[z].dataValues.backOrderPrecioLista = false
                        constProductoCarritoDeCompra[z].dataValues.pcdc_producto_cantidad = constTieneStockGeneral.prod_total_stock

                        //Buscar nuevo elemento a agregar
                        const newElemento = await models.ProductoCarritoDeCompra.findOne(
                        {
                            where: {
                                pcdc_carrito_de_compra_id: constCarritoDeCompra.cdc_carrito_de_compra_id,
                                pcdc_prod_producto_id: constProductoCarritoDeCompra[z].dataValues.pcdc_prod_producto_id
                            },
                            attributes: {
                                exclude: ['createdAt','updatedAt','pcdc_lista_precio','pcdc_precio','pcdc_prod_producto_id_regalo','pcdc_cantidad_producto_regalo',
                                'pcdc_descuento_promocion', 'pcdc_prod_producto_id_promocion', 'pcdc_cantidad_producto_promocion', 'pcdc_cupon_aplicado',
                                'pcdc_mejor_descuento', 'pcdc_almacen_surtido', 'pcdc_no_disponible_para_compra', 'pcdc_back_order', 'pcdc_validado']
                            },
                            order: [
                                ['pcdc_producto_carrito_id', 'ASC']
                            ]
                        });

                        const dataProductFilter = constProductoCarritoDeCompra
                            .filter((item) => item.dataValues.producto.prod_producto_id == constProductoCarritoDeCompra[z].dataValues.pcdc_prod_producto_id);

                        // console.log('dataProductFilter ', dataProductFilter);
                        var newCantidad = constTieneStockGeneral.prod_total_stock - cantidadOriginal
                        console.log(newCantidad)
                        if(newCantidad < 0)
                        {
                            newCantidad = newCantidad*-1
                        }
                        newElemento.dataValues.pcdc_producto_cantidad = newCantidad
                        newElemento.dataValues.backOrderPrecioLista = false
                        newElemento.dataValues.producto = dataProductFilter[0].dataValues.producto;

                        constProductoCarritoDeCompra.push(newElemento)
                    }
                    else
                    {
                        constProductoCarritoDeCompra[z].dataValues.backOrderPrecioLista = false
                    }
                }
            }



            //Set false el nuevo campo del backorder de productospreciolistanew
            // console.log(constProductoCarritoDeCompra.length)
            // constProductoCarritoDeCompra[0].dataValues.afsa = 0
            // for (var f = 0; f < prodCarritoLenght; f++) 
            // {
            //     console.log(constProductoCarritoDeCompra[f].dataValues)
            //     constProductoCarritoDeCompra[f].dataValues.backOrderPrecioLista = false
            // }


            


            //Informacion Socio de negocio / Direccoin facturacion para impuestos
                const constSociosNegocio = await models.SociosNegocio.findOne(
                {
                    where: {
                        sn_socios_negocio_id: cdc_sn_socio_de_negocio_id
                    },
                    attributes:  ["sn_socios_negocio_id", "sn_cardcode", "sn_codigo_direccion_facturacion", "sn_lista_precios", "sn_codigo_grupo",
                    "sn_porcentaje_descuento_total"]
                });

                
                //obtener direccion de facturacion
                const constSociosNegocioDirecciones = await models.SociosNegocioDirecciones.findOne(
                {
                    where: {
                        snd_cardcode: constSociosNegocio.sn_cardcode,
                        snd_idDireccion: constSociosNegocio.sn_codigo_direccion_facturacion,
                        snd_tipoDir: "B"
                    }
                    // ,
                    // attributes:  ["sn_socios_negocio_id", "sn_cardcode", "sn_codigo_direccion_facturacion"]
                });

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
                else
                {
                    tipoImpuesto = 16
                }  
            // Fin informacion SN e Impuesto 












            //Asignar stocks por producto
            for (var f = 0; f < constProductoCarritoDeCompra.length; f++) 
            {
                //Obtener Stock X hijo
                const constStockProducto = await models.StockProducto.findAll({
                    where: {
                        sp_prod_producto_id : constProductoCarritoDeCompra[f].dataValues.pcdc_prod_producto_id
                    }
                })
                constProductoCarritoDeCompra[f].dataValues.ListaStock = constStockProducto
            }





            //Generar promociones y cupones (no calcula totales aun)
            for (var i = 0; i < constProductoCarritoDeCompra.length; i++) 
            {
                var precioBaseFinal = 0

                //Informacion base de productos
                const constProducto = await models.Producto.findOne(
                {
                    where: {
                        prod_producto_id: constProductoCarritoDeCompra[i].dataValues.pcdc_prod_producto_id
                    }
                });

                constProductoCarritoDeCompra[i].dataValues.prod_sku = constProducto.prod_sku
                constProductoCarritoDeCompra[i].dataValues.prod_nombre = constProducto.prod_nombre

                constProductoCarritoDeCompra[i].dataValues.prod_prod_producto_padre_sku = constProducto.prod_prod_producto_padre_sku

                //Agregar producto padre ID al carrito para la pagina de producto
                const constProductoPadreID = await models.Producto.findOne(
                {
                    where: {
                        prod_sku: constProducto.prod_prod_producto_padre_sku
                    }
                });


                if(constProducto)
                {
                    constProductoCarritoDeCompra[i].dataValues.productoPadreId = constProductoPadreID.prod_producto_id
                }

                
                constProductoCarritoDeCompra[i].dataValues.prod_precio = constProducto.prod_precio
                constProductoCarritoDeCompra[i].dataValues.prod_total_stock = constProducto.prod_total_stock
                constProductoCarritoDeCompra[i].dataValues.prod_nombre_extranjero = constProducto.prod_nombre_extranjero
                constProductoCarritoDeCompra[i].dataValues.prod_tipo_precio_base = constProducto.prod_tipo_precio_base
                constProductoCarritoDeCompra[i].dataValues.prod_dias_resurtimiento = constProducto.prod_dias_resurtimiento
                constProductoCarritoDeCompra[i].dataValues.prod_tipo_precio_base = constProducto.prod_tipo_precio_base
                constProductoCarritoDeCompra[i].dataValues.prod_es_stock_inactivo = constProducto.prod_es_stock_inactivo
                constProductoCarritoDeCompra[i].dataValues.prod_tipo_cambio_base = constProducto.prod_tipo_cambio_base

                //V4 values
                constProductoCarritoDeCompra[i].dataValues.prod_codigo_grupo = constProducto.prod_codigo_grupo
                constProductoCarritoDeCompra[i].dataValues.prod_codigo_marca = constProducto.prod_codigo_marca
                constProductoCarritoDeCompra[i].dataValues.prod_codigo_prop_list = constProducto.prod_codigo_prop_list



                if(constProductoCarritoDeCompra[i].dataValues.backOrderPrecioLista == true)
                {
                    constProductoCarritoDeCompra[i].dataValues.prod_tipo_precio_base = "Precio de Lista"

                    //Informacion base de productos
                    const newPriceProductoListaPrecio = await models.ProductoListaPrecio.findOne(
                    {
                        where: {
                            pl_listp_lista_de_precio_id: 1,
                            pl_prod_producto_id: constProductoCarritoDeCompra[i].dataValues.pcdc_prod_producto_id
                        }
                    });
                    constProductoCarritoDeCompra[i].dataValues.prod_precio = newPriceProductoListaPrecio.pl_precio_producto
                    constProductoCarritoDeCompra[i].dataValues.prod_es_stock_inactivo = false
                }














                //Agregar aplica backorder bool
                    if(constProductoCarritoDeCompra[i].dataValues.prod_dias_resurtimiento != '0')
                    {
                        constProductoCarritoDeCompra[i].dataValues.aplicaBackOrder = true
                    }
                    else
                    {
                        constProductoCarritoDeCompra[i].dataValues.aplicaBackOrder = false
                    }
                //




                // Buscar precio por SN en caso de que no sea stock inactivo (precio base final)
                    //El precio base siempre sera la misma variable porque ya no se usara lo de listas de precios de SN
                    if(constProductoCarritoDeCompra[i].dataValues.backOrderPrecioLista == true)
                    {
                        constProductoCarritoDeCompra[i].dataValues.precioBaseFinal = constProductoCarritoDeCompra[i].dataValues.prod_precio
                    }
                    else
                    {
                        precioBaseFinal = constProducto.prod_precio
                        constProductoCarritoDeCompra[i].dataValues.precioBaseFinal = precioBaseFinal
                    }
                    
                    // if(constProducto.prod_es_stock_inactivo == true)
                    // {
                        //Se dejara el precio base que tenga el producto sin importar que
                        // precioBaseFinal = constProducto.prod_precio
                    // }
                    // else
                    // {
                    //     //Buscar la lista de precio que tenga asignada el SN y buscar el precio que se le dara al carrito
                    //     const constProductoListaPrecio = await models.ProductoListaPrecio.findOne(
                    //     {
                    //         where: {
                    //             pl_prod_producto_id: constProductoCarritoDeCompra[i].dataValues.pcdc_prod_producto_id,
                    //             pl_listp_lista_de_precio_id: constSociosNegocio.sn_lista_precios
                    //         }
                    //     });

                    //     precioBaseFinal = constProductoListaPrecio.pl_precio_producto
                    // }
                    
                    

                    













                //PROMOCION
                    //Si es stock inactivo no tendra ni revisara descuentos
                    if(constProductoCarritoDeCompra[i].dataValues.prod_es_stock_inactivo == true)
                    {
                        constProductoCarritoDeCompra[i].dataValues.promocion = []
                    }
                    else
                    {
                        //Obtener Mejor Promocion y precio final
                        var mejorPromocionPrecio = await productosUtils.getBestPromotionForProduct(constProductoCarritoDeCompra[i].dataValues.pcdc_prod_producto_id);

                        // //Sett variable de promocion en el arreglo inicial
                        constProductoCarritoDeCompra[i].dataValues.promocion = mejorPromocionPrecio
                    }
                //END PROMOCION






                //DESCUENTOS SN/GRUPO/DIELSA
                    //Este codigo se repite desde la util getChildsSNDiscounts
                    //Si es stock inactivo no tendra ni revisara descuentos
                    if(constProductoCarritoDeCompra[i].dataValues.prod_es_stock_inactivo == true)
                    {
                        constProductoCarritoDeCompra[i].dataValues.descuentoGrupoBool = false
                        constProductoCarritoDeCompra[i].dataValues.descuentoGrupo = 0
                        constProductoCarritoDeCompra[i].dataValues.snDescuento = 0
                    }
                    else
                    {
                        //Obtener Mejor Promocion y precio final
                        var descuentoGrupo = await productosUtils.getSocioNegocioDiscountPerProduct(constProductoCarritoDeCompra[i].dataValues, constSociosNegocio);

                        if(descuentoGrupo > 0 || constSociosNegocio.sn_porcentaje_descuento_total > 0)
                        {
                            constProductoCarritoDeCompra[i].dataValues.descuentoGrupoBool = true
                            constProductoCarritoDeCompra[i].dataValues.descuentoGrupo = descuentoGrupo
                            constProductoCarritoDeCompra[i].dataValues.snDescuento = parseFloat(constSociosNegocio.sn_porcentaje_descuento_total)
                        }
                        else
                        {
                            constProductoCarritoDeCompra[i].dataValues.descuentoGrupoBool = false
                            constProductoCarritoDeCompra[i].dataValues.descuentoGrupo = 0
                            constProductoCarritoDeCompra[i].dataValues.snDescuento = parseFloat(constSociosNegocio.sn_porcentaje_descuento_total)
                        }
                    }
                //END DESCUENTOS SN/GRUPO/DIELSA




                //CUPON
                    if(constProductoCarritoDeCompra[i].dataValues.prod_es_stock_inactivo == true)
                    {
                        constProductoCarritoDeCompra[i].dataValues.cupon = []
                    }
                    else
                    {
                        //Obtener Mejor Promocion y precio final
                        var mejorCuponPrecio = await productosUtils.getBestCuponForProduct(constProductoCarritoDeCompra[i].dataValues.pcdc_prod_producto_id, constCarritoDeCompra.cdc_promcup_promociones_cupones_id, cdc_sn_socio_de_negocio_id);
                    
                        //Set cupones
                        constProductoCarritoDeCompra[i].dataValues.cupon = mejorCuponPrecio
                    }
                //ENDCUPON


                //Concatenar imagenes
                const constImagenProducto = await models.ImagenProducto.findOne(
                {
                    where: {
                        imgprod_prod_producto_id: constProductoCarritoDeCompra[i].dataValues.pcdc_prod_producto_id
                    },
                    attributes: {
                        exclude: ['createdAt','updatedAt','imgprod_usu_usuario_creador_id']
                    },
                    order: [
                        ['imgprod_nombre_archivo', 'ASC']
                    ],
                });
                constProductoCarritoDeCompra[i].dataValues.imagenes = constImagenProducto
            }//Fin generar promociones



            //Totales finales
            var precioTotal = 0
            var precioFinalTotal = 0

            //total de descuentos en todos los productos
            var totalDescuentosPromociones = 0
            var totalDescuentosCupones = 0












            // const seenNew = {};

            //Calcular totales por producto
            for (var j = 0; j < constProductoCarritoDeCompra.length; j++) 
            {
                const dataProduct = await sequelize.query(`
                    SELECT lpro.*, pro.moneda, pro."idProyecto" FROM socios_negocio AS sn
                    INNER JOIN proyectos AS pro ON pro."codigoCliente" = sn.sn_cardcode
                    INNER JOIN lineas_proyectos AS lpro ON lpro."idProyecto" = pro."id"
                    WHERE sn.sn_socios_negocio_id = '${cdc_sn_socio_de_negocio_id}'
                    AND lpro."codigoArticulo" = '${constProductoCarritoDeCompra[j].dataValues.producto.dataValues.prod_sku}'
                    AND pro.estatus in ('Autorizado','Aprobado') AND CURRENT_DATE < "date"(pro."fechaVencimiento")`,
                {
                    type: sequelize.QueryTypes.SELECT 
                });

                //Precio Base
                var precioBase = constProductoCarritoDeCompra[j].dataValues.precioBaseFinal
                var precioTemporal = constProductoCarritoDeCompra[j].dataValues.precioBaseFinal
                var totalDescuentoTemporal = 0


                //Si tiene promocion, descuento o cupon activo el producto calculara el precio
                if(constProductoCarritoDeCompra[j].dataValues.promocion.length > 0 || (constProductoCarritoDeCompra[j].dataValues.cupon.length > 0 || constProductoCarritoDeCompra[j].dataValues.cupon.promcup_aplica_todo_carrito == false) || constProductoCarritoDeCompra[j].dataValues.descuentoGrupoBool == true)
                {   



                    //V4
                    var totalPromocion = 0
                    var tipoDescuento = ''
                    var totalDescuentoPorcentual = 0



                    //Buscar promocion por monto fijo
                    if(constProductoCarritoDeCompra[j].dataValues.promocion.length > 0)
                    {
                        if(constProductoCarritoDeCompra[j].dataValues.promocion[0].cmm_valor == "Monto fijo")
                        {   
                            if(totalPromocion < constProductoCarritoDeCompra[j].dataValues.promocion[0].promdes_descuento_exacto)
                            {
                                totalPromocion = constProductoCarritoDeCompra[j].dataValues.promocion[0].promdes_descuento_exacto
                                tipoDescuento = "Monto fijo"
                            }
                        }
                    }


                    //Buscar promocion por porcentaje
                    if(constProductoCarritoDeCompra[j].dataValues.promocion.length > 0)
                    {
                        //Calcular precio promocion activa
                        if(constProductoCarritoDeCompra[j].dataValues.promocion[0].cmm_valor == "Porcentaje")
                        {   
                            //Valor de la promocion por porcentaje
                            var porcentajePromocion = constProductoCarritoDeCompra[j].dataValues.promocion[0].promdes_descuento_exacto

                            //base - descuento = total Descuento
                            var totalDescuento = (((porcentajePromocion/100) * precioTemporal).toFixed(2))

                            if(totalPromocion < totalDescuento)
                            {
                                totalPromocion = totalDescuento
                                tipoDescuento = "Porcentaje"
                            }
                        }
                    }


                    //Buscar promocion por grupo/marca/dielsa
                    if(constProductoCarritoDeCompra[j].dataValues.descuentoGrupoBool == true)
                    {
                        //totalTemp es el resultado que queda
                        var totalTemp = 0

                        //Total acumulado es el total de descuento en INT
                        var totalAcumulado = 0


                        //$300   56% descuento   168 total
                        //Descuento por lista de precios grupos
                        if(constProductoCarritoDeCompra[j].dataValues.descuentoGrupo > 0)
                        {
                            totalTemp = precioTemporal - (((constProductoCarritoDeCompra[j].dataValues.descuentoGrupo/100) * precioTemporal))
                            totalAcumulado = (((constProductoCarritoDeCompra[j].dataValues.descuentoGrupo/100) * precioTemporal))
                        }

                        //$300   56% descuento   168 total por grupo y 50% del SN = 84
                        if(constProductoCarritoDeCompra[j].dataValues.snDescuento > 0)
                        {
                            //Si es mayor que 0 significa que primero tomara el primer descuento y luego este si no solo lo hara directo
                            if(totalAcumulado > 0)
                            {
                                totalAcumulado = totalAcumulado + (((constProductoCarritoDeCompra[j].dataValues.snDescuento/100) * totalTemp))
                                totalTemp = totalTemp - (((constProductoCarritoDeCompra[j].dataValues.snDescuento/100) * totalTemp))
                                
                            }
                            else
                            {
                                totalAcumulado = (((constProductoCarritoDeCompra[j].dataValues.snDescuento/100) * precioTemporal))
                                totalTemp = precioTemporal - (((constProductoCarritoDeCompra[j].dataValues.snDescuento/100) * precioTemporal))
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




                    // totalPromocion
                    // constProductoCarritoDeCompra[j].dataValues.totalDescuentoPorcentual = totalPromocion



                    //Valores de promocion/descuento antes de cupon
                    var cantidadPromocion = totalPromocion
                    precioTemporal = precioMenosPromo

                    constProductoCarritoDeCompra[j].dataValues.precioDespuesDePromocion = precioTemporal.toFixed(2)
                    constProductoCarritoDeCompra[j].dataValues.cantidadDescuentoPromocion = cantidadPromocion

                    let asignarPromocionBool = false;
                    if(dataProduct[0]) {
                        const precioProdProyect = dataProduct[0].moneda === 'MXP' 
                            ? Number(dataProduct[0].prod_precio)
                            : Number(dataProduct[0].prod_precio) * USDValor
                        if(precioProdProyect < (constProductoCarritoDeCompra[j].dataValues.prod_precio + cantidadPromocion)
                            || !constProductoCarritoDeCompra[j].dataValues.prod_precio
                            || constProductoCarritoDeCompra[j].dataValues.prod_precio == 0) {
                                asignarPromocionBool = true;
                        }
                    }
                    //Calculara el total de descuentos por promocion
                    totalDescuentoTemporal = totalDescuentoTemporal + cantidadPromocion
                    totalDescuentosPromociones = totalDescuentosPromociones + (asignarPromocionBool ? 0 : (cantidadPromocion * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad))







                    //verificara si la promocion es mayor que la promocion de sn para dejar un doble promotion (cosas dielsa)
                    var precioPromocionDielsaBool = false
                    var DescuentoSNFijo = 0
                    if(constProductoCarritoDeCompra[j].dataValues.promocion.length > 0 && constProductoCarritoDeCompra[j].dataValues.descuentoGrupoBool == true)
                    {
                        if(tipoDescuento == "Porcentaje" || tipoDescuento == 'Monto fijo')
                        {
                            precioPromocionDielsaBool = true
                            var DescuentoSNFijo = constProductoCarritoDeCompra[j].dataValues.prod_precio

                            if(constProductoCarritoDeCompra[j].dataValues.descuentoGrupo > 0)
                            {
                                DescuentoSNFijo = DescuentoSNFijo - (DescuentoSNFijo * (constProductoCarritoDeCompra[j].dataValues.descuentoGrupo / 100))
                            }

                            if(constProductoCarritoDeCompra[j].dataValues.snDescuento > 0)
                            {
                                DescuentoSNFijo = DescuentoSNFijo - (DescuentoSNFijo * (constProductoCarritoDeCompra[j].dataValues.snDescuento / 100))
                            }
                        }
                    }


                    constProductoCarritoDeCompra[j].dataValues.precioPromocionDielsaBool = precioPromocionDielsaBool
                    constProductoCarritoDeCompra[j].dataValues.DescuentoDielsaFijo = DescuentoSNFijo









                    //variables tipo v4
                    //Tipo de promocion final
                    constProductoCarritoDeCompra[j].dataValues.tipoPromocionFinal = tipoDescuento

                    //total de promocion (precio prod - promocion o descuento (sin iva))
                    constProductoCarritoDeCompra[j].dataValues.totalDescuentoFinal = parseFloat(totalPromocion)











                    //V3
                    // //Si existe promocion
                    // if(constProductoCarritoDeCompra[j].dataValues.promocion.length > 0)
                    // {
                    //     //Calcular precio promocion activa
                    //     if(constProductoCarritoDeCompra[j].dataValues.promocion[0].cmm_valor == "Porcentaje")
                    //     {   
                    //         //Valor de la promocion por porcentaje
                    //         var cantidadPromocion = constProductoCarritoDeCompra[j].dataValues.promocion[0].promdes_descuento_exacto
                    //         precioTemporal = precioTemporal-(((cantidadPromocion/ 100) * precioTemporal).toFixed(2))

                    //         if(precioTemporal <= 0)
                    //         {
                    //             precioTemporal = 0
                    //         }

                    //         constProductoCarritoDeCompra[j].dataValues.promocion[0].precioDespuesDePromocion = precioTemporal.toFixed(2)
                    //         constProductoCarritoDeCompra[j].dataValues.promocion[0].cantidadDescuentoPromocion = ((cantidadPromocion/ 100) * precioBase).toFixed(2)

                    //         totalDescuentoTemporal = totalDescuentoTemporal + ((cantidadPromocion/ 100) * precioBase)
                    //         totalDescuentosPromociones = totalDescuentosPromociones + (((cantidadPromocion/ 100) * precioBase) * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)
                    //     }
                    //     //Si es monto fijo
                    //     else
                    //     {
                    //         //Valor de la promocion de procentaje o fijo
                    //         var cantidadPromocion = constProductoCarritoDeCompra[j].dataValues.promocion[0].promdes_descuento_exacto
                    //         precioTemporal = precioTemporal - cantidadPromocion

                    //         //Si es mejor que 0 se setteara a 0 la variable para que el producto no cueste menos que 0 LOL
                    //         if(precioTemporal <= 0)
                    //         {
                    //             precioTemporal = 0
                    //         }

                    //         constProductoCarritoDeCompra[j].dataValues.promocion[0].precioDespuesDePromocion = precioTemporal.toFixed(2)
                    //         constProductoCarritoDeCompra[j].dataValues.promocion[0].cantidadDescuentoPromocion = cantidadPromocion.toFixed(2)

                    //         //Calculara el total de descuentos por promocion
                    //         totalDescuentoTemporal = totalDescuentoTemporal + cantidadPromocion
                    //         totalDescuentosPromociones = totalDescuentosPromociones + (cantidadPromocion * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)
                    //     }
                    // }
                    














                    //calcular total + cupones
                    if(constProductoCarritoDeCompra[j].dataValues.cupon.length > 0 && constProductoCarritoDeCompra[j].dataValues.cupon[0].promcup_aplica_todo_carrito == false)
                    {
                        //calcular precio cupon activo
                        if(constProductoCarritoDeCompra[j].dataValues.cupon[0].cmm_valor == "Porcentaje")
                        {   
                            let asignarPromocionBool = false;
                            if(dataProduct[0]) {
                                const precioProdProyect = dataProduct[0].moneda === 'MXP' 
                                    ? Number(dataProduct[0].precio)
                                    : Number(dataProduct[0].precio) * USDValor
                                if(precioProdProyect < constProductoCarritoDeCompra[j].dataValues.precioFinal
                                    || constProductoCarritoDeCompra[j].dataValues.precioFinal == 0) {
                                        asignarPromocionBool = true;
                                }
                            }
                            //Valor del cupon de procentaje
                            var cantidadPromocion = asignarPromocionBool ? 0 : constProductoCarritoDeCompra[j].dataValues.cupon[0].promcup_descuento_exacto

                            //Cantidad de descuento del cupon una vez que la promocion surtio efecto en el precio base
                            constProductoCarritoDeCompra[j].dataValues.cantidadDescuentoCupon = ((cantidadPromocion/ 100) * precioTemporal).toFixed(2)
                            totalDescuentoTemporal = totalDescuentoTemporal + ((cantidadPromocion/ 100) * precioTemporal)
                            
                            //variable general que ira calculando el total
                            totalDescuentosCupones = totalDescuentosCupones + (((cantidadPromocion/ 100) * precioTemporal) * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)





                            precioTemporal = precioTemporal-(((cantidadPromocion/ 100) * precioTemporal))
                            if(precioTemporal <= 0)
                            {
                                precioTemporal = 0
                            }

                            //Precio despues del cupon
                            constProductoCarritoDeCompra[j].dataValues.precioDespuesDeCupon = precioTemporal.toFixed(2)
                        }
                        else
                        {
                            let asignarPromocionBool = false;
                            if(dataProduct[0]) {
                                const precioProdProyect = dataProduct[0].moneda === 'MXP' 
                                    ? Number(dataProduct[0].precio)
                                    : Number(dataProduct[0].precio) * USDValor
                                if(precioProdProyect < constProductoCarritoDeCompra[j].dataValues.precioFinal
                                    || constProductoCarritoDeCompra[j].dataValues.precioFinal == 0) {
                                        asignarPromocionBool = true;
                                }
                            }
                            //Valor del cupon de procentaje
                            var cantidadPromocion = constProductoCarritoDeCompra[j].dataValues.cupon[0].promcup_descuento_exacto


                            constProductoCarritoDeCompra[j].dataValues.cantidadDescuentoCupon = cantidadPromocion
                            totalDescuentoTemporal = totalDescuentoTemporal + cantidadPromocion

                            //variable general que ira calculando el total
                            totalDescuentosCupones = totalDescuentosCupones + (cantidadPromocion * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)

                            precioTemporal = precioTemporal-cantidadPromocion

                            //Si es mejor que 0 se setteara a 0 la variable para que el producto no cueste menos que 0 LOL
                            if(precioTemporal <= 0)
                            {
                                precioTemporal = 0
                            }

                            constProductoCarritoDeCompra[j].dataValues.precioDespuesDeCupon = precioTemporal.toFixed(2)
                            

                            //Calculara el total de descuentos por promocion
                            
                            
                        }
                    }


















                    //envio + 3%
                    if(constCarritoDeCompra.cdc_forma_pago_codigo == "28" || constCarritoDeCompra.cdc_forma_pago_codigo == "04")
                    {
                        constProductoCarritoDeCompra[j].dataValues.precioFinal = parseFloat((precioTemporal * 1.03).toFixed(2))
                    }
                    else
                    {
                        constProductoCarritoDeCompra[j].dataValues.precioFinal = parseFloat((precioTemporal).toFixed(2))
                    }
                    


                    constProductoCarritoDeCompra[j].dataValues.precioFinalMasImpuesto = (constProductoCarritoDeCompra[j].dataValues.precioFinal * (1 + (tipoImpuesto / 100)))
                    constProductoCarritoDeCompra[j].dataValues.precioFinalMasImpuesto = parseFloat(constProductoCarritoDeCompra[j].dataValues.precioFinalMasImpuesto.toFixed(2))
                    

                    constProductoCarritoDeCompra[j].dataValues.totalDescuento = parseFloat(totalDescuentoTemporal)

                    let totalAsignado = false;
                    let precioProdProyect = 0;
                    if(dataProduct[0]) {
                        precioProdProyect = dataProduct[0].moneda === 'MXP' 
                            ? Number(dataProduct[0].precio)
                            : Number(dataProduct[0].precio) * USDValor
                        if(precioProdProyect < constProductoCarritoDeCompra[j].dataValues.precioFinal
                            || constProductoCarritoDeCompra[j].dataValues.precioFinal == 0) {
                            totalAsignado = true;
                        }
                    }

                    //Precio total sin promociones
                    precioTotal = precioTotal + ((totalAsignado ? precioProdProyect : constProductoCarritoDeCompra[j].dataValues.precioFinal) * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)


                    //Precio total con promociones calculado por producto

                    precioFinalTotal = precioFinalTotal + ((totalAsignado ? precioProdProyect : constProductoCarritoDeCompra[j].dataValues.precioFinal) * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)



                }
                //si no tiene promocion solo calculara plano
                else
                {
                    //envio + 3%
                    if(constCarritoDeCompra.cdc_forma_pago_codigo == "28" || constCarritoDeCompra.cdc_forma_pago_codigo == "04")
                    {
                        constProductoCarritoDeCompra[j].dataValues.precioFinal = parseFloat((precioBase * 1.03).toFixed(2))
                    }
                    else
                    {
                        constProductoCarritoDeCompra[j].dataValues.precioFinal = parseFloat((precioBase).toFixed(2))
                    }


                    constProductoCarritoDeCompra[j].dataValues.precioFinalMasImpuesto = (constProductoCarritoDeCompra[j].dataValues.precioFinal * (1 + (tipoImpuesto / 100)))
                    constProductoCarritoDeCompra[j].dataValues.precioFinalMasImpuesto = parseFloat(constProductoCarritoDeCompra[j].dataValues.precioFinalMasImpuesto.toFixed(2))
                    constProductoCarritoDeCompra[j].dataValues.totalDescuento = 0

                    let totalAsignado = false;
                    let precioProdProyect = 0;
                    if(dataProduct[0]) {
                        precioProdProyect = dataProduct[0].moneda === 'MXP' 
                            ? Number(dataProduct[0].precio)
                            : Number(dataProduct[0].precio) * USDValor
                        if(precioProdProyect < constProductoCarritoDeCompra[j].dataValues.precioFinal
                            || constProductoCarritoDeCompra[j].dataValues.precioFinal == 0) {
                            totalAsignado = true;
                        }
                    }
                    //Precio total sin promociones
                    precioTotal = precioTotal + ((totalAsignado ? precioProdProyect : constProductoCarritoDeCompra[j].dataValues.precioFinal) * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)

                    //Precio total con promociones calculado por producto
                    // precioFinalTotal = precioFinalTotal + (constProductoCarritoDeCompra[j].dataValues.precioBaseFinal * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)
                    precioFinalTotal = precioFinalTotal + ((totalAsignado ? precioProdProyect : constProductoCarritoDeCompra[j].dataValues.precioFinal) * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)
                }


                // V5?
                var tempPrecioBase = constProductoCarritoDeCompra[j].dataValues.prod_precio 
                var tempPrecioFinal = constProductoCarritoDeCompra[j].dataValues.precioFinal 

                var porcentajeDescuentoTemporal = 100-((tempPrecioFinal*100)/tempPrecioBase)

                constProductoCarritoDeCompra[j].dataValues.totalDescuentoPorcentual = parseFloat(porcentajeDescuentoTemporal.toFixed(2))

            }


















            //Set precios nuevos y resumen
            constCarritoDeCompra.dataValues.tipoImpuesto = tipoImpuesto + "%"
            constCarritoDeCompra.dataValues.totalDescuentosPromociones = totalDescuentosPromociones.toFixed(2)
            constCarritoDeCompra.dataValues.totalDescuentosCupones = totalDescuentosCupones.toFixed(2)
            constCarritoDeCompra.dataValues.totalDescuentos = (totalDescuentosCupones+totalDescuentosPromociones).toFixed(2)
            constCarritoDeCompra.dataValues.precioTotal = precioTotal.toFixed(2)
            constCarritoDeCompra.dataValues.precioFinalTotal = precioFinalTotal.toFixed(2)

            
            // constCarritoDeCompra.dataValues.TotalImpuesto = (precioFinalTotal - (totalDescuentosCupones+totalDescuentosPromociones)).toFixed(2) * (tipoImpuesto / 100)
            constCarritoDeCompra.dataValues.TotalImpuesto = (precioFinalTotal).toFixed(2) * (tipoImpuesto / 100)
            constCarritoDeCompra.dataValues.TotalImpuestoProductos = (constCarritoDeCompra.dataValues.TotalImpuesto).toFixed(2)
            constCarritoDeCompra.dataValues.precioFinalTotalMasImpuestos = (precioFinalTotal + constCarritoDeCompra.dataValues.TotalImpuesto).toFixed(2);




            //envio + 3%
            if(constCarritoDeCompra.cdc_forma_pago_codigo == "28" || constCarritoDeCompra.cdc_forma_pago_codigo == "04")
            {
                constCarritoDeCompra.dataValues.cdc_costo_envio = constCarritoDeCompra.dataValues.cdc_costo_envio * 1.03
            }
            else
            {
                constCarritoDeCompra.dataValues.cdc_costo_envio = constCarritoDeCompra.dataValues.cdc_costo_envio
            }

            constCarritoDeCompra.dataValues.costoEnvioMasImpuesto = constCarritoDeCompra.cdc_costo_envio * (1 + (tipoImpuesto / 100))
            constCarritoDeCompra.dataValues.costoEnvioMasImpuesto = parseFloat(constCarritoDeCompra.dataValues.costoEnvioMasImpuesto.toFixed(2))

            constCarritoDeCompra.dataValues.costoEnvioIVA = constCarritoDeCompra.cdc_costo_envio * ((tipoImpuesto / 100))
            constCarritoDeCompra.dataValues.costoEnvioIVA = parseFloat(constCarritoDeCompra.dataValues.costoEnvioIVA.toFixed(2))


            constCarritoDeCompra.dataValues.TotalImpuesto = constCarritoDeCompra.dataValues.TotalImpuesto + constCarritoDeCompra.dataValues.costoEnvioIVA
            constCarritoDeCompra.dataValues.TotalImpuesto = parseFloat(constCarritoDeCompra.dataValues.TotalImpuesto.toFixed(2))

            constCarritoDeCompra.dataValues.TotalFinal = parseFloat(constCarritoDeCompra.dataValues.precioFinalTotalMasImpuestos) + constCarritoDeCompra.dataValues.costoEnvioMasImpuesto
            constCarritoDeCompra.dataValues.TotalFinal = parseFloat(constCarritoDeCompra.dataValues.TotalFinal.toFixed(2))

            constCarritoDeCompra.dataValues.productos = constProductoCarritoDeCompra









            const { cmm_valor: USDValor } = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_nombre: "TIPO_CAMBIO_USD"
                },
                attributes: ["cmm_valor"]
            });

            const seen = {};
            const duplicates = [];


            //Agregar valores finales en USD de productos
            for (var y = 0; y < constCarritoDeCompra.dataValues.productos.length; y++) 
            {
                if(constCarritoDeCompra.dataValues.productos[y].dataValues.precioBaseFinal > 0)
                {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.precioBaseFinal_USD = parseFloat((constCarritoDeCompra.dataValues.productos[y].dataValues.precioBaseFinal/USDValor).toFixed(2))
                }
                else
                {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.precioBaseFinal_USD = 0
                }

                if(constCarritoDeCompra.dataValues.productos[y].dataValues.totalDescuento > 0)
                {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.totalDescuento_USD = parseFloat((constCarritoDeCompra.dataValues.productos[y].dataValues.totalDescuento/USDValor).toFixed(2))
                }
                else
                {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.totalDescuento_USD = 0
                }

                if(constCarritoDeCompra.dataValues.productos[y].dataValues.DescuentoDielsaFijo > 0)
                {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.DescuentoDielsaFijo_USD = parseFloat((constCarritoDeCompra.dataValues.productos[y].dataValues.DescuentoDielsaFijo/USDValor).toFixed(2))
                }
                else
                {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.DescuentoDielsaFijo_USD = 0
                }

                if(constCarritoDeCompra.dataValues.productos[y].dataValues.precioFinal > 0)
                {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.precioFinal_USD = parseFloat((constCarritoDeCompra.dataValues.productos[y].dataValues.precioFinal/USDValor).toFixed(2))
                }
                else
                {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.precioFinal_USD = 0
                }

                const dataProduct = await sequelize.query(`
                    SELECT lpro.*, pro.moneda, pro."idProyecto" FROM socios_negocio AS sn
                    INNER JOIN proyectos AS pro ON pro."codigoCliente" = sn.sn_cardcode
                    INNER JOIN lineas_proyectos AS lpro ON lpro."idProyecto" = pro."id"
                    WHERE sn.sn_socios_negocio_id = '${cdc_sn_socio_de_negocio_id}'
                    AND lpro."codigoArticulo" = '${constCarritoDeCompra.dataValues.productos[y].dataValues.prod_sku}'
                    AND pro.estatus in ('Autorizado','Aprobado') AND CURRENT_DATE < "date"(pro."fechaVencimiento")`,
                {
                    type: sequelize.QueryTypes.SELECT 
                });
                
                if(dataProduct[0]) {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.projectProducNoAcuerdo = dataProduct[0].idProyecto;
                    constCarritoDeCompra.dataValues.productos[y].dataValues.projectProductPrice = dataProduct[0].moneda === 'MXP' 
                        ? Number(dataProduct[0].precio)
                        : Number(dataProduct[0].precio) * USDValor;
                    constCarritoDeCompra.dataValues.productos[y].dataValues.projectProductPriceUSD = dataProduct[0].moneda === 'USD' 
                    ? Number(dataProduct[0].precio)
                    : Number(dataProduct[0].precio) / USDValor;
                    constCarritoDeCompra.dataValues.productos[y].dataValues.projectProductCoinBase = dataProduct[0].moneda;
                    constCarritoDeCompra.dataValues.productos[y].dataValues.projectProduct = true;
                } else {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.projectProducNoAcuerdo = null;
                    constCarritoDeCompra.dataValues.productos[y].dataValues.projectProductPrice = 0;
                    constCarritoDeCompra.dataValues.productos[y].dataValues.projectProductCoin = null;
                    constCarritoDeCompra.dataValues.productos[y].dataValues.projectProduct = false;
                }

                if (seen[constCarritoDeCompra.dataValues.productos[y].dataValues.pcdc_prod_producto_id]) {
                    duplicates.push(constCarritoDeCompra.dataValues.productos[y].dataValues);
                } else {
                    seen[constCarritoDeCompra.dataValues.productos[y].dataValues.pcdc_prod_producto_id] = true;
                }
            }

            //Retorna el id del carrito segun el id del SN

            return constCarritoDeCompra
        }
        catch(e){
            console.log(e)
            return "error"
        }
    },
    getCheckoutAPI2: async function (cdc_sn_socio_de_negocio_id) {
        try{

            //Obtener tipo de cambio
            const constTipoCambio = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_nombre: "TIPO_CAMBIO_USD"
                },
                attributes: ["cmm_valor"]
            })
            var USDValor = constTipoCambio.cmm_valor



            var tipoImpuesto = 16

            //SN Carrito Activo
            const constCarritoDeCompra = await models.CarritoDeCompra.findOne(
            { 
                where: {
                    cdc_sn_socio_de_negocio_id: cdc_sn_socio_de_negocio_id
                },
                
            });


            //Productos de Carrito Activo
            let constProductoCarritoDeCompra = await models.ProductoCarritoDeCompra.findAll(
            {
                where: {
                    pcdc_carrito_de_compra_id: constCarritoDeCompra.cdc_carrito_de_compra_id
                },
                include: [
                    {
                        model: models.Producto
                    }
                ],
                attributes: {
                    exclude: ['createdAt','updatedAt','pcdc_lista_precio','pcdc_precio','pcdc_prod_producto_id_regalo','pcdc_cantidad_producto_regalo',
                    'pcdc_descuento_promocion', 'pcdc_prod_producto_id_promocion', 'pcdc_cantidad_producto_promocion', 'pcdc_cupon_aplicado',
                    'pcdc_mejor_descuento', 'pcdc_almacen_surtido', 'pcdc_no_disponible_para_compra', 'pcdc_back_order', 'pcdc_validado']
                },
                order: [
                    ['pcdc_producto_carrito_id', 'ASC']
                ]
            });
            
            let newProductsProyects = []
          

               
          for (var s=0; s<constProductoCarritoDeCompra.length; s++){
           // pruebaTester( constProductoCarritoDeCompra[s].dataValues.producto.prod_precio + ' sku:' + constProductoCarritoDeCompra[s].dataValues.producto.prod_sku)
                const data = await sequelize.query(`
                SELECT lpro.*, pro.moneda, pro."idProyecto" FROM socios_negocio AS sn
                INNER JOIN proyectos AS pro ON pro."codigoCliente" = sn.sn_cardcode
                INNER JOIN lineas_proyectos AS lpro ON lpro."idProyecto" = pro."id"
                WHERE sn.sn_socios_negocio_id = '${cdc_sn_socio_de_negocio_id}'
                AND lpro."codigoArticulo" = '${constProductoCarritoDeCompra[s].dataValues.producto.prod_sku}'
                AND pro.estatus in ('Autorizado','Aprobado') AND CURRENT_DATE < "date"(pro."fechaVencimiento")`,
            {
                type: sequelize.QueryTypes.SELECT 
            });
             
                 const newProductProyect =data[0];

                 constProductoCarritoDeCompra[s].dataValues.producto.prod_precio = (newProductProyect && (newProductProyect.precio < constProductoCarritoDeCompra[s].dataValues.producto.prod_precio || constProductoCarritoDeCompra[s].dataValues.producto.prod_precio ===0)? Number(newProductProyect.precio*USDValor) : constProductoCarritoDeCompra[s].dataValues.producto.prod_precio )

                //pruebaTester( constProductoCarritoDeCompra[s].dataValues.producto.prod_precio + ' sku:' + constProductoCarritoDeCompra[s].dataValues.producto.prod_sku)
               newProductsProyects.push(constProductoCarritoDeCompra[s])
           }
            //constProductoCarritoDeCompra = newProductsProyects;
            constProductoCarritoDeCompra = newProductsProyects.filter((item) =>
                item.dataValues.producto.prod_peso > 0 && item.dataValues.producto.prod_volumen > 0 && item.dataValues.producto.prod_precio);
              

              
            //Buscar si tiene productos que sean Stock inactivo o Hasta agotar existencia con backorder
            var prodCarritoLenght = constProductoCarritoDeCompra.length
            for (var z = 0; z < prodCarritoLenght; z++) 
            {
                //Ver que estamos filtrando
                let cardK = String(constProductoCarritoDeCompra[z].dataValues.pcdc_prod_producto_id)
                 //  pruebaTester(cardK +' : ' + constProductoCarritoDeCompra[z].dataValues.producto.prod_precio)
                   
                //Consultar tabla productos stock general por producto
                const constTieneStockGeneral = await models.Producto.findOne(
                {
                    where: {
                        prod_producto_id: constProductoCarritoDeCompra[z].dataValues.pcdc_prod_producto_id
                    },
                    attributes: ['prod_total_stock', 'prod_tipo_precio_base', 'prod_dias_resurtimiento']
                    
                });

                //Si existe el producto
                if(constTieneStockGeneral)
                {
                    //Comparar stock y ver si es diferente de lista de precios y si es backorder
                    if(constProductoCarritoDeCompra[z].dataValues.pcdc_producto_cantidad > constTieneStockGeneral.prod_total_stock  
                        && constTieneStockGeneral.prod_tipo_precio_base != 'Precio de Lista'
                         && constTieneStockGeneral.prod_dias_resurtimiento > 0)
                    {
                        //Settear el arreglo actual como que no sera backorder  (cambiar si es o eliminarlo del objecto completo)
                        // constProductoCarritoDeCompra[z].dataValues.backOrderPrecioLista = true




                        //Nuevo objeto que sera para backorder
                        // var clone = Object.assign({}, constProductoCarritoDeCompra[z]);
                        // console.log(clone)
                        // const newObject = Object.create(constProductoCarritoDeCompra[z]);
                        // newObject.dataValues.backOrderPrecioLista = true
                        
                        // newObject.dataValues.pcdc_producto_cantidad = newCantidad

                        //Agregar nuevo objeto
                        // constProductoCarritoDeCompra.push(constProductoCarritoDeCompra[z])
                        // Object.assign(constProductoCarritoDeCompra, newObject)


                        var cantidadOriginal = constProductoCarritoDeCompra[z].dataValues.pcdc_producto_cantidad
                        console.log(cantidadOriginal)
                        constProductoCarritoDeCompra[z].dataValues.backOrderPrecioLista = false
                        constProductoCarritoDeCompra[z].dataValues.pcdc_producto_cantidad = constTieneStockGeneral.prod_total_stock

                        //Buscar nuevo elemento a agregar
                        const newElemento = await models.ProductoCarritoDeCompra.findOne(
                        {
                            where: {
                                pcdc_carrito_de_compra_id: constCarritoDeCompra.cdc_carrito_de_compra_id,
                                pcdc_prod_producto_id: constProductoCarritoDeCompra[z].dataValues.pcdc_prod_producto_id
                            },
                            attributes: {
                                exclude: ['createdAt','updatedAt','pcdc_lista_precio','pcdc_precio','pcdc_prod_producto_id_regalo','pcdc_cantidad_producto_regalo',
                                'pcdc_descuento_promocion', 'pcdc_prod_producto_id_promocion', 'pcdc_cantidad_producto_promocion', 'pcdc_cupon_aplicado',
                                'pcdc_mejor_descuento', 'pcdc_almacen_surtido', 'pcdc_no_disponible_para_compra', 'pcdc_back_order', 'pcdc_validado']
                            },
                            order: [
                                ['pcdc_producto_carrito_id', 'ASC']
                            ]
                        });

                        const dataProductFilter = constProductoCarritoDeCompra
                            .filter((item) => item.dataValues.producto.prod_producto_id == constProductoCarritoDeCompra[z].dataValues.pcdc_prod_producto_id);

                        // console.log('dataProductFilter ', dataProductFilter);
                        var newCantidad = constTieneStockGeneral.prod_total_stock - cantidadOriginal
                        console.log(newCantidad)
                        if(newCantidad < 0)
                        {
                            newCantidad = newCantidad*-1
                        }
                        newElemento.dataValues.pcdc_producto_cantidad = newCantidad
                        newElemento.dataValues.backOrderPrecioLista = false
                        newElemento.dataValues.producto = dataProductFilter[0].dataValues.producto;

                        constProductoCarritoDeCompra.push(newElemento)
                    }
                    else
                    {
                        constProductoCarritoDeCompra[z].dataValues.backOrderPrecioLista = false
                    }
                }
            }



            //Set false el nuevo campo del backorder de productospreciolistanew
            // console.log(constProductoCarritoDeCompra.length)
            // constProductoCarritoDeCompra[0].dataValues.afsa = 0
            // for (var f = 0; f < prodCarritoLenght; f++) 
            // {
            //     console.log(constProductoCarritoDeCompra[f].dataValues)
            //     constProductoCarritoDeCompra[f].dataValues.backOrderPrecioLista = false
            // }


            


            //Informacion Socio de negocio / Direccoin facturacion para impuestos
                const constSociosNegocio = await models.SociosNegocio.findOne(
                {
                    where: {
                        sn_socios_negocio_id: cdc_sn_socio_de_negocio_id
                    },
                    attributes:  ["sn_socios_negocio_id", "sn_cardcode", "sn_codigo_direccion_facturacion", "sn_lista_precios", "sn_codigo_grupo",
                    "sn_porcentaje_descuento_total"]
                });

                
                //obtener direccion de facturacion
                const constSociosNegocioDirecciones = await models.SociosNegocioDirecciones.findOne(
                {
                    where: {
                        snd_cardcode: constSociosNegocio.sn_cardcode,
                        snd_idDireccion: constSociosNegocio.sn_codigo_direccion_facturacion,
                        snd_tipoDir: "B"
                    }
                    // ,
                    // attributes:  ["sn_socios_negocio_id", "sn_cardcode", "sn_codigo_direccion_facturacion"]
                });

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
                else
                {
                    tipoImpuesto = 16
                }  
            // Fin informacion SN e Impuesto 












            //Asignar stocks por producto
            for (var f = 0; f < constProductoCarritoDeCompra.length; f++) 
            {
                //Obtener Stock X hijo
                const constStockProducto = await models.StockProducto.findAll({
                    where: {
                        sp_prod_producto_id : constProductoCarritoDeCompra[f].dataValues.pcdc_prod_producto_id
                    }
                })
                constProductoCarritoDeCompra[f].dataValues.ListaStock = constStockProducto
            }





            //Generar promociones y cupones (no calcula totales aun)
            for (var i = 0; i < constProductoCarritoDeCompra.length; i++) 
            {
                var precioBaseFinal = 0

                //Informacion base de productos
                const constProducto = await models.Producto.findOne(
                {
                    where: {
                        prod_producto_id: constProductoCarritoDeCompra[i].dataValues.pcdc_prod_producto_id
                    }
                });

                constProductoCarritoDeCompra[i].dataValues.prod_sku = constProducto.prod_sku
                constProductoCarritoDeCompra[i].dataValues.prod_nombre = constProducto.prod_nombre

                constProductoCarritoDeCompra[i].dataValues.prod_prod_producto_padre_sku = constProducto.prod_prod_producto_padre_sku

                //Agregar producto padre ID al carrito para la pagina de producto
                const constProductoPadreID = await models.Producto.findOne(
                {
                    where: {
                        prod_sku: constProducto.prod_prod_producto_padre_sku
                    }
                });


                if(constProducto)
                {
                    constProductoCarritoDeCompra[i].dataValues.productoPadreId = constProductoPadreID.prod_producto_id
                }

                
                constProductoCarritoDeCompra[i].dataValues.prod_precio = constProducto.prod_precio
                constProductoCarritoDeCompra[i].dataValues.prod_total_stock = constProducto.prod_total_stock
                constProductoCarritoDeCompra[i].dataValues.prod_nombre_extranjero = constProducto.prod_nombre_extranjero
                constProductoCarritoDeCompra[i].dataValues.prod_tipo_precio_base = constProducto.prod_tipo_precio_base
                constProductoCarritoDeCompra[i].dataValues.prod_dias_resurtimiento = constProducto.prod_dias_resurtimiento
                constProductoCarritoDeCompra[i].dataValues.prod_tipo_precio_base = constProducto.prod_tipo_precio_base
                constProductoCarritoDeCompra[i].dataValues.prod_es_stock_inactivo = constProducto.prod_es_stock_inactivo
                constProductoCarritoDeCompra[i].dataValues.prod_tipo_cambio_base = constProducto.prod_tipo_cambio_base

                //V4 values
                constProductoCarritoDeCompra[i].dataValues.prod_codigo_grupo = constProducto.prod_codigo_grupo
                constProductoCarritoDeCompra[i].dataValues.prod_codigo_marca = constProducto.prod_codigo_marca
                constProductoCarritoDeCompra[i].dataValues.prod_codigo_prop_list = constProducto.prod_codigo_prop_list



                if(constProductoCarritoDeCompra[i].dataValues.backOrderPrecioLista == true)
                {
                    constProductoCarritoDeCompra[i].dataValues.prod_tipo_precio_base = "Precio de Lista"

                    //Informacion base de productos
                    const newPriceProductoListaPrecio = await models.ProductoListaPrecio.findOne(
                    {
                        where: {
                            pl_listp_lista_de_precio_id: 1,
                            pl_prod_producto_id: constProductoCarritoDeCompra[i].dataValues.pcdc_prod_producto_id
                        }
                    });
                    constProductoCarritoDeCompra[i].dataValues.prod_precio = newPriceProductoListaPrecio.pl_precio_producto
                    constProductoCarritoDeCompra[i].dataValues.prod_es_stock_inactivo = false
                }














                //Agregar aplica backorder bool
                    if(constProductoCarritoDeCompra[i].dataValues.prod_dias_resurtimiento != '0')
                    {
                        constProductoCarritoDeCompra[i].dataValues.aplicaBackOrder = true
                    }
                    else
                    {
                        constProductoCarritoDeCompra[i].dataValues.aplicaBackOrder = false
                    }
                //




                // Buscar precio por SN en caso de que no sea stock inactivo (precio base final)
                    //El precio base siempre sera la misma variable porque ya no se usara lo de listas de precios de SN
                    if(constProductoCarritoDeCompra[i].dataValues.backOrderPrecioLista == true)
                    {
                        constProductoCarritoDeCompra[i].dataValues.precioBaseFinal = constProductoCarritoDeCompra[i].dataValues.prod_precio
                    }
                    else
                    {
                        precioBaseFinal = constProducto.prod_precio
                        constProductoCarritoDeCompra[i].dataValues.precioBaseFinal = precioBaseFinal
                    }
                    
                    // if(constProducto.prod_es_stock_inactivo == true)
                    // {
                        //Se dejara el precio base que tenga el producto sin importar que
                        // precioBaseFinal = constProducto.prod_precio
                    // }
                    // else
                    // {
                    //     //Buscar la lista de precio que tenga asignada el SN y buscar el precio que se le dara al carrito
                    //     const constProductoListaPrecio = await models.ProductoListaPrecio.findOne(
                    //     {
                    //         where: {
                    //             pl_prod_producto_id: constProductoCarritoDeCompra[i].dataValues.pcdc_prod_producto_id,
                    //             pl_listp_lista_de_precio_id: constSociosNegocio.sn_lista_precios
                    //         }
                    //     });

                    //     precioBaseFinal = constProductoListaPrecio.pl_precio_producto
                    // }
                    
                    

                    













                //PROMOCION
                    //Si es stock inactivo no tendra ni revisara descuentos
                    if(constProductoCarritoDeCompra[i].dataValues.prod_es_stock_inactivo == true)
                    {
                        constProductoCarritoDeCompra[i].dataValues.promocion = []
                    }
                    else
                    {
                        //Obtener Mejor Promocion y precio final
                        var mejorPromocionPrecio = await productosUtils.getBestPromotionForProduct(constProductoCarritoDeCompra[i].dataValues.pcdc_prod_producto_id);

                        // //Sett variable de promocion en el arreglo inicial
                        constProductoCarritoDeCompra[i].dataValues.promocion = mejorPromocionPrecio
                    }
                //END PROMOCION






                //DESCUENTOS SN/GRUPO/DIELSA
                    //Este codigo se repite desde la util getChildsSNDiscounts
                    //Si es stock inactivo no tendra ni revisara descuentos
                    if(constProductoCarritoDeCompra[i].dataValues.prod_es_stock_inactivo == true)
                    {
                        constProductoCarritoDeCompra[i].dataValues.descuentoGrupoBool = false
                        constProductoCarritoDeCompra[i].dataValues.descuentoGrupo = 0
                        constProductoCarritoDeCompra[i].dataValues.snDescuento = 0
                    }
                    else
                    {
                        //Obtener Mejor Promocion y precio final
                        var descuentoGrupo = await productosUtils.getSocioNegocioDiscountPerProduct(constProductoCarritoDeCompra[i].dataValues, constSociosNegocio);

                        if(descuentoGrupo > 0 || constSociosNegocio.sn_porcentaje_descuento_total > 0)
                        {
                            constProductoCarritoDeCompra[i].dataValues.descuentoGrupoBool = true
                            constProductoCarritoDeCompra[i].dataValues.descuentoGrupo = descuentoGrupo
                            constProductoCarritoDeCompra[i].dataValues.snDescuento = parseFloat(constSociosNegocio.sn_porcentaje_descuento_total)
                        }
                        else
                        {
                            constProductoCarritoDeCompra[i].dataValues.descuentoGrupoBool = false
                            constProductoCarritoDeCompra[i].dataValues.descuentoGrupo = 0
                            constProductoCarritoDeCompra[i].dataValues.snDescuento = parseFloat(constSociosNegocio.sn_porcentaje_descuento_total)
                        }
                    }
                //END DESCUENTOS SN/GRUPO/DIELSA




                //CUPON
                    if(constProductoCarritoDeCompra[i].dataValues.prod_es_stock_inactivo == true)
                    {
                        constProductoCarritoDeCompra[i].dataValues.cupon = []
                    }
                    else
                    {
                        //Obtener Mejor Promocion y precio final
                        var mejorCuponPrecio = await productosUtils.getBestCuponForProduct(constProductoCarritoDeCompra[i].dataValues.pcdc_prod_producto_id, constCarritoDeCompra.cdc_promcup_promociones_cupones_id, cdc_sn_socio_de_negocio_id);
                    
                        //Set cupones
                        constProductoCarritoDeCompra[i].dataValues.cupon = mejorCuponPrecio
                    }
                //ENDCUPON


                //Concatenar imagenes
                const constImagenProducto = await models.ImagenProducto.findOne(
                {
                    where: {
                        imgprod_prod_producto_id: constProductoCarritoDeCompra[i].dataValues.pcdc_prod_producto_id
                    },
                    attributes: {
                        exclude: ['createdAt','updatedAt','imgprod_usu_usuario_creador_id']
                    },
                    order: [
                        ['imgprod_nombre_archivo', 'ASC']
                    ],
                });
                constProductoCarritoDeCompra[i].dataValues.imagenes = constImagenProducto
            }//Fin generar promociones



            //Totales finales
            var precioTotal = 0
            var precioFinalTotal = 0

            //total de descuentos en todos los productos
            var totalDescuentosPromociones = 0
            var totalDescuentosCupones = 0














            //Calcular totales por producto
            for (var j = 0; j < constProductoCarritoDeCompra.length; j++) 
            {
                //Precio Base
                var precioBase = constProductoCarritoDeCompra[j].dataValues.precioBaseFinal
                var precioTemporal = constProductoCarritoDeCompra[j].dataValues.precioBaseFinal
                var totalDescuentoTemporal = 0


                //Si tiene promocion, descuento o cupon activo el producto calculara el precio
                if(constProductoCarritoDeCompra[j].dataValues.promocion.length > 0 || (constProductoCarritoDeCompra[j].dataValues.cupon.length > 0 || constProductoCarritoDeCompra[j].dataValues.cupon.promcup_aplica_todo_carrito == false) || constProductoCarritoDeCompra[j].dataValues.descuentoGrupoBool == true)
                {   



                    //V4
                    var totalPromocion = 0
                    var tipoDescuento = ''
                    var totalDescuentoPorcentual = 0



                    //Buscar promocion por monto fijo
                    if(constProductoCarritoDeCompra[j].dataValues.promocion.length > 0)
                    {
                        if(constProductoCarritoDeCompra[j].dataValues.promocion[0].cmm_valor == "Monto fijo")
                        {   
                            if(totalPromocion < constProductoCarritoDeCompra[j].dataValues.promocion[0].promdes_descuento_exacto)
                            {
                                totalPromocion = constProductoCarritoDeCompra[j].dataValues.promocion[0].promdes_descuento_exacto
                                tipoDescuento = "Monto fijo"
                            }
                        }
                    }


                    //Buscar promocion por porcentaje
                    if(constProductoCarritoDeCompra[j].dataValues.promocion.length > 0)
                    {
                        //Calcular precio promocion activa
                        if(constProductoCarritoDeCompra[j].dataValues.promocion[0].cmm_valor == "Porcentaje")
                        {   
                            //Valor de la promocion por porcentaje
                            var porcentajePromocion = constProductoCarritoDeCompra[j].dataValues.promocion[0].promdes_descuento_exacto

                            //base - descuento = total Descuento
                            var totalDescuento = (((porcentajePromocion/100) * precioTemporal).toFixed(2))

                            if(totalPromocion < totalDescuento)
                            {
                                totalPromocion = totalDescuento
                                tipoDescuento = "Porcentaje"
                            }
                        }
                    }


                    //Buscar promocion por grupo/marca/dielsa
                    if(constProductoCarritoDeCompra[j].dataValues.descuentoGrupoBool == true)
                    {
                        //totalTemp es el resultado que queda
                        var totalTemp = 0

                        //Total acumulado es el total de descuento en INT
                        var totalAcumulado = 0


                        //$300   56% descuento   168 total
                        //Descuento por lista de precios grupos
                        if(constProductoCarritoDeCompra[j].dataValues.descuentoGrupo > 0)
                        {
                            totalTemp = precioTemporal - (((constProductoCarritoDeCompra[j].dataValues.descuentoGrupo/100) * precioTemporal))
                            totalAcumulado = (((constProductoCarritoDeCompra[j].dataValues.descuentoGrupo/100) * precioTemporal))
                        }

                        //$300   56% descuento   168 total por grupo y 50% del SN = 84
                        if(constProductoCarritoDeCompra[j].dataValues.snDescuento > 0)
                        {
                            //Si es mayor que 0 significa que primero tomara el primer descuento y luego este si no solo lo hara directo
                            if(totalAcumulado > 0)
                            {
                                totalAcumulado = totalAcumulado + (((constProductoCarritoDeCompra[j].dataValues.snDescuento/100) * totalTemp))
                                totalTemp = totalTemp - (((constProductoCarritoDeCompra[j].dataValues.snDescuento/100) * totalTemp))
                                
                            }
                            else
                            {
                                totalAcumulado = (((constProductoCarritoDeCompra[j].dataValues.snDescuento/100) * precioTemporal))
                                totalTemp = precioTemporal - (((constProductoCarritoDeCompra[j].dataValues.snDescuento/100) * precioTemporal))
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




                    // totalPromocion
                    // constProductoCarritoDeCompra[j].dataValues.totalDescuentoPorcentual = totalPromocion



                    //Valores de promocion/descuento antes de cupon
                    var cantidadPromocion = totalPromocion
                    precioTemporal = precioMenosPromo

                    constProductoCarritoDeCompra[j].dataValues.precioDespuesDePromocion = precioTemporal.toFixed(2)
                    constProductoCarritoDeCompra[j].dataValues.cantidadDescuentoPromocion = cantidadPromocion

                    //Calculara el total de descuentos por promocion
                    totalDescuentoTemporal = totalDescuentoTemporal + cantidadPromocion
                    totalDescuentosPromociones = totalDescuentosPromociones + (cantidadPromocion * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)







                    //verificara si la promocion es mayor que la promocion de sn para dejar un doble promotion (cosas dielsa)
                    var precioPromocionDielsaBool = false
                    var DescuentoSNFijo = 0
                    if(constProductoCarritoDeCompra[j].dataValues.promocion.length > 0 && constProductoCarritoDeCompra[j].dataValues.descuentoGrupoBool == true)
                    {
                        if(tipoDescuento == "Porcentaje" || tipoDescuento == 'Monto fijo')
                        {
                            precioPromocionDielsaBool = true
                            var DescuentoSNFijo = constProductoCarritoDeCompra[j].dataValues.prod_precio

                            if(constProductoCarritoDeCompra[j].dataValues.descuentoGrupo > 0)
                            {
                                DescuentoSNFijo = DescuentoSNFijo - (DescuentoSNFijo * (constProductoCarritoDeCompra[j].dataValues.descuentoGrupo / 100))
                            }

                            if(constProductoCarritoDeCompra[j].dataValues.snDescuento > 0)
                            {
                                DescuentoSNFijo = DescuentoSNFijo - (DescuentoSNFijo * (constProductoCarritoDeCompra[j].dataValues.snDescuento / 100))
                            }
                        }
                    }


                    constProductoCarritoDeCompra[j].dataValues.precioPromocionDielsaBool = precioPromocionDielsaBool
                    constProductoCarritoDeCompra[j].dataValues.DescuentoDielsaFijo = DescuentoSNFijo









                    //variables tipo v4
                    //Tipo de promocion final
                    constProductoCarritoDeCompra[j].dataValues.tipoPromocionFinal = tipoDescuento

                    //total de promocion (precio prod - promocion o descuento (sin iva))
                    constProductoCarritoDeCompra[j].dataValues.totalDescuentoFinal = parseFloat(totalPromocion)











                    //V3
                    // //Si existe promocion
                    // if(constProductoCarritoDeCompra[j].dataValues.promocion.length > 0)
                    // {
                    //     //Calcular precio promocion activa
                    //     if(constProductoCarritoDeCompra[j].dataValues.promocion[0].cmm_valor == "Porcentaje")
                    //     {   
                    //         //Valor de la promocion por porcentaje
                    //         var cantidadPromocion = constProductoCarritoDeCompra[j].dataValues.promocion[0].promdes_descuento_exacto
                    //         precioTemporal = precioTemporal-(((cantidadPromocion/ 100) * precioTemporal).toFixed(2))

                    //         if(precioTemporal <= 0)
                    //         {
                    //             precioTemporal = 0
                    //         }

                    //         constProductoCarritoDeCompra[j].dataValues.promocion[0].precioDespuesDePromocion = precioTemporal.toFixed(2)
                    //         constProductoCarritoDeCompra[j].dataValues.promocion[0].cantidadDescuentoPromocion = ((cantidadPromocion/ 100) * precioBase).toFixed(2)

                    //         totalDescuentoTemporal = totalDescuentoTemporal + ((cantidadPromocion/ 100) * precioBase)
                    //         totalDescuentosPromociones = totalDescuentosPromociones + (((cantidadPromocion/ 100) * precioBase) * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)
                    //     }
                    //     //Si es monto fijo
                    //     else
                    //     {
                    //         //Valor de la promocion de procentaje o fijo
                    //         var cantidadPromocion = constProductoCarritoDeCompra[j].dataValues.promocion[0].promdes_descuento_exacto
                    //         precioTemporal = precioTemporal - cantidadPromocion

                    //         //Si es mejor que 0 se setteara a 0 la variable para que el producto no cueste menos que 0 LOL
                    //         if(precioTemporal <= 0)
                    //         {
                    //             precioTemporal = 0
                    //         }

                    //         constProductoCarritoDeCompra[j].dataValues.promocion[0].precioDespuesDePromocion = precioTemporal.toFixed(2)
                    //         constProductoCarritoDeCompra[j].dataValues.promocion[0].cantidadDescuentoPromocion = cantidadPromocion.toFixed(2)

                    //         //Calculara el total de descuentos por promocion
                    //         totalDescuentoTemporal = totalDescuentoTemporal + cantidadPromocion
                    //         totalDescuentosPromociones = totalDescuentosPromociones + (cantidadPromocion * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)
                    //     }
                    // }
                    














                    //calcular total + cupones
                    if(constProductoCarritoDeCompra[j].dataValues.cupon.length > 0 && constProductoCarritoDeCompra[j].dataValues.cupon[0].promcup_aplica_todo_carrito == false)
                    {
                        //calcular precio cupon activo
                        if(constProductoCarritoDeCompra[j].dataValues.cupon[0].cmm_valor == "Porcentaje")
                        {   
                            //Valor del cupon de procentaje
                            var cantidadPromocion = constProductoCarritoDeCompra[j].dataValues.cupon[0].promcup_descuento_exacto

                            //Cantidad de descuento del cupon una vez que la promocion surtio efecto en el precio base
                            constProductoCarritoDeCompra[j].dataValues.cantidadDescuentoCupon = ((cantidadPromocion/ 100) * precioTemporal).toFixed(2)
                            totalDescuentoTemporal = totalDescuentoTemporal + ((cantidadPromocion/ 100) * precioTemporal)
                            
                            //variable general que ira calculando el total
                            totalDescuentosCupones = totalDescuentosCupones + (((cantidadPromocion/ 100) * precioTemporal) * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)





                            precioTemporal = precioTemporal-(((cantidadPromocion/ 100) * precioTemporal))
                            if(precioTemporal <= 0)
                            {
                                precioTemporal = 0
                            }

                            //Precio despues del cupon
                            constProductoCarritoDeCompra[j].dataValues.precioDespuesDeCupon = precioTemporal.toFixed(2)
                        }
                        else
                        {
                            //Valor del cupon de procentaje
                            var cantidadPromocion = constProductoCarritoDeCompra[j].dataValues.cupon[0].promcup_descuento_exacto


                            constProductoCarritoDeCompra[j].dataValues.cantidadDescuentoCupon = cantidadPromocion
                            totalDescuentoTemporal = totalDescuentoTemporal + cantidadPromocion

                            //variable general que ira calculando el total
                            totalDescuentosCupones = totalDescuentosCupones + (cantidadPromocion * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)

                            precioTemporal = precioTemporal-cantidadPromocion

                            //Si es mejor que 0 se setteara a 0 la variable para que el producto no cueste menos que 0 LOL
                            if(precioTemporal <= 0)
                            {
                                precioTemporal = 0
                            }

                            constProductoCarritoDeCompra[j].dataValues.precioDespuesDeCupon = precioTemporal.toFixed(2)
                            

                            //Calculara el total de descuentos por promocion
                            
                            
                        }
                    }


















                    //envio + 3%
                    if(constCarritoDeCompra.cdc_forma_pago_codigo == "28" || constCarritoDeCompra.cdc_forma_pago_codigo == "04")
                    {
                        constProductoCarritoDeCompra[j].dataValues.precioFinal = parseFloat((precioTemporal * 1.03).toFixed(2))
                    }
                    else
                    {
                        constProductoCarritoDeCompra[j].dataValues.precioFinal = parseFloat((precioTemporal).toFixed(2))
                    }
                    


                    constProductoCarritoDeCompra[j].dataValues.precioFinalMasImpuesto = (constProductoCarritoDeCompra[j].dataValues.precioFinal * (1 + (tipoImpuesto / 100)))
                    constProductoCarritoDeCompra[j].dataValues.precioFinalMasImpuesto = parseFloat(constProductoCarritoDeCompra[j].dataValues.precioFinalMasImpuesto.toFixed(2))
                    

                    constProductoCarritoDeCompra[j].dataValues.totalDescuento = parseFloat(totalDescuentoTemporal)


                    //Precio total sin promociones
                    precioTotal = precioTotal + (constProductoCarritoDeCompra[j].dataValues.precioBaseFinal * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)


                    //Precio total con promociones calculado por producto

                    precioFinalTotal = precioFinalTotal + (constProductoCarritoDeCompra[j].dataValues.precioFinal * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)



                }
                //si no tiene promocion solo calculara plano
                else
                {
                    //envio + 3%
                    if(constCarritoDeCompra.cdc_forma_pago_codigo == "28" || constCarritoDeCompra.cdc_forma_pago_codigo == "04")
                    {
                        constProductoCarritoDeCompra[j].dataValues.precioFinal = parseFloat((precioBase * 1.03).toFixed(2))
                    }
                    else
                    {
                        constProductoCarritoDeCompra[j].dataValues.precioFinal = parseFloat((precioBase).toFixed(2))
                    }


                    constProductoCarritoDeCompra[j].dataValues.precioFinalMasImpuesto = (constProductoCarritoDeCompra[j].dataValues.precioFinal * (1 + (tipoImpuesto / 100)))
                    constProductoCarritoDeCompra[j].dataValues.precioFinalMasImpuesto = parseFloat(constProductoCarritoDeCompra[j].dataValues.precioFinalMasImpuesto.toFixed(2))
                    constProductoCarritoDeCompra[j].dataValues.totalDescuento = 0

                    //Precio total sin promociones
                    precioTotal = precioTotal + (constProductoCarritoDeCompra[j].dataValues.precioBaseFinal * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)

                    //Precio total con promociones calculado por producto
                    // precioFinalTotal = precioFinalTotal + (constProductoCarritoDeCompra[j].dataValues.precioBaseFinal * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)
                    precioFinalTotal = precioFinalTotal + (constProductoCarritoDeCompra[j].dataValues.precioFinal * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)
                }


                // V5?
                var tempPrecioBase = constProductoCarritoDeCompra[j].dataValues.prod_precio
                var tempPrecioFinal = constProductoCarritoDeCompra[j].dataValues.precioFinal

                var porcentajeDescuentoTemporal = 100-((tempPrecioFinal*100)/tempPrecioBase)

                constProductoCarritoDeCompra[j].dataValues.totalDescuentoPorcentual = parseFloat(porcentajeDescuentoTemporal.toFixed(2))

            }


















            //Set precios nuevos y resumen
            constCarritoDeCompra.dataValues.tipoImpuesto = tipoImpuesto + "%"
            constCarritoDeCompra.dataValues.totalDescuentosPromociones = totalDescuentosPromociones.toFixed(2)
            constCarritoDeCompra.dataValues.totalDescuentosCupones = totalDescuentosCupones.toFixed(2)
            constCarritoDeCompra.dataValues.totalDescuentos = (totalDescuentosCupones+totalDescuentosPromociones).toFixed(2)
            constCarritoDeCompra.dataValues.precioTotal = precioTotal.toFixed(2)
            constCarritoDeCompra.dataValues.precioFinalTotal = precioFinalTotal.toFixed(2)


            constCarritoDeCompra.dataValues.TotalImpuesto = precioFinalTotal * (tipoImpuesto / 100)
            constCarritoDeCompra.dataValues.TotalImpuestoProductos = (constCarritoDeCompra.dataValues.TotalImpuesto).toFixed(2)
            constCarritoDeCompra.dataValues.precioFinalTotalMasImpuestos = (precioFinalTotal * (1 + (tipoImpuesto / 100))).toFixed(2)




            //envio + 3%
            if(constCarritoDeCompra.cdc_forma_pago_codigo == "28" || constCarritoDeCompra.cdc_forma_pago_codigo == "04")
            {
                constCarritoDeCompra.dataValues.cdc_costo_envio = constCarritoDeCompra.dataValues.cdc_costo_envio * 1.03
            }
            else
            {
                constCarritoDeCompra.dataValues.cdc_costo_envio = constCarritoDeCompra.dataValues.cdc_costo_envio
            }

            constCarritoDeCompra.dataValues.costoEnvioMasImpuesto = constCarritoDeCompra.cdc_costo_envio * (1 + (tipoImpuesto / 100))
            constCarritoDeCompra.dataValues.costoEnvioMasImpuesto = parseFloat(constCarritoDeCompra.dataValues.costoEnvioMasImpuesto.toFixed(2))

            constCarritoDeCompra.dataValues.costoEnvioIVA = constCarritoDeCompra.cdc_costo_envio * ((tipoImpuesto / 100))
            constCarritoDeCompra.dataValues.costoEnvioIVA = parseFloat(constCarritoDeCompra.dataValues.costoEnvioIVA.toFixed(2))


            constCarritoDeCompra.dataValues.TotalImpuesto = constCarritoDeCompra.dataValues.TotalImpuesto + constCarritoDeCompra.dataValues.costoEnvioIVA
            constCarritoDeCompra.dataValues.TotalImpuesto = parseFloat(constCarritoDeCompra.dataValues.TotalImpuesto.toFixed(2))

            constCarritoDeCompra.dataValues.TotalFinal = parseFloat(constCarritoDeCompra.dataValues.precioFinalTotalMasImpuestos) + constCarritoDeCompra.dataValues.costoEnvioMasImpuesto
            constCarritoDeCompra.dataValues.TotalFinal = parseFloat(constCarritoDeCompra.dataValues.TotalFinal.toFixed(2))


            constCarritoDeCompra.dataValues.productos = constProductoCarritoDeCompra









            const { cmm_valor: USDValor } = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_nombre: "TIPO_CAMBIO_USD"
                },
                attributes: ["cmm_valor"]
            });

            const seen = {};
            const duplicates = [];



            //Agregar valores finales en USD de productos
            for (var y = 0; y < constCarritoDeCompra.dataValues.productos.length; y++) 
            {
                if(constCarritoDeCompra.dataValues.productos[y].dataValues.precioBaseFinal > 0)
                {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.precioBaseFinal_USD = parseFloat((constCarritoDeCompra.dataValues.productos[y].dataValues.precioBaseFinal/USDValor).toFixed(2))
                }
                else
                {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.precioBaseFinal_USD = 0
                }

                if(constCarritoDeCompra.dataValues.productos[y].dataValues.totalDescuento > 0)
                {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.totalDescuento_USD = parseFloat((constCarritoDeCompra.dataValues.productos[y].dataValues.totalDescuento/USDValor).toFixed(2))
                }
                else
                {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.totalDescuento_USD = 0
                }

                if(constCarritoDeCompra.dataValues.productos[y].dataValues.DescuentoDielsaFijo > 0)
                {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.DescuentoDielsaFijo_USD = parseFloat((constCarritoDeCompra.dataValues.productos[y].dataValues.DescuentoDielsaFijo/USDValor).toFixed(2))
                }
                else
                {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.DescuentoDielsaFijo_USD = 0
                }

                if(constCarritoDeCompra.dataValues.productos[y].dataValues.precioFinal > 0)
                {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.precioFinal_USD = parseFloat((constCarritoDeCompra.dataValues.productos[y].dataValues.precioFinal/USDValor).toFixed(2))
                }
                else
                {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.precioFinal_USD = 0
                }

                const dataProduct = await sequelize.query(`
                    SELECT lpro.*, pro.moneda, pro."idProyecto" FROM socios_negocio AS sn
                    INNER JOIN proyectos AS pro ON pro."codigoCliente" = sn.sn_cardcode
                    INNER JOIN lineas_proyectos AS lpro ON lpro."idProyecto" = pro."id"
                    WHERE sn.sn_socios_negocio_id = '${cdc_sn_socio_de_negocio_id}'
                    AND lpro."codigoArticulo" = '${constCarritoDeCompra.dataValues.productos[y].dataValues.prod_sku}'
                    AND pro.estatus = 'Aprobado' AND CURRENT_DATE < "date"(pro."fechaVencimiento")`,
                {
                    type: sequelize.QueryTypes.SELECT 
                });
                
                if(dataProduct[0]) {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.projectProducNoAcuerdo = dataProduct[0].idProyecto;
                    constCarritoDeCompra.dataValues.productos[y].dataValues.projectProductPrice = dataProduct[0].moneda === 'MXN' 
                        ? Number(dataProduct[0].precio)
                        : Number(dataProduct[0].precio) * USDValor;
                    constCarritoDeCompra.dataValues.productos[y].dataValues.projectProductPriceUSD = dataProduct[0].moneda === 'USD' 
                    ? Number(dataProduct[0].precio)
                    : Number(dataProduct[0].precio) / USDValor;
                    constCarritoDeCompra.dataValues.productos[y].dataValues.projectProductCoinBase = dataProduct[0].moneda;
                    constCarritoDeCompra.dataValues.productos[y].dataValues.projectProduct = true;
                } else {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.projectProducNoAcuerdo = null;
                    constCarritoDeCompra.dataValues.productos[y].dataValues.projectProductPrice = 0;
                    constCarritoDeCompra.dataValues.productos[y].dataValues.projectProductCoin = null;
                    constCarritoDeCompra.dataValues.productos[y].dataValues.projectProduct = false;
                }

                if (seen[constCarritoDeCompra.dataValues.productos[y].dataValues.pcdc_prod_producto_id]) {
                    duplicates.push(constCarritoDeCompra.dataValues.productos[y].dataValues);
                } else {
                    seen[constCarritoDeCompra.dataValues.productos[y].dataValues.pcdc_prod_producto_id] = true;
                }
            }




            //Retorna el id del carrito segun el id del SN

            return constCarritoDeCompra
        }
        catch(e){
            console.log(e)
            return "error"
        }
    },
    getCheckoutAPIAntesDelBackOrderSINACTIVO: async function (cdc_sn_socio_de_negocio_id) {
        try{


            //Obtener tipo de cambio
            const constTipoCambio = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_nombre: "TIPO_CAMBIO_USD"
                },
                attributes: ["cmm_valor"]
            })
            var USDValor = constTipoCambio.cmm_valor



            var tipoImpuesto = 16

            //Buscara si el Socio de negocio tiene un carrito activo.
            const constCarritoDeCompra = await models.CarritoDeCompra.findOne(
            {
                where: {
                    cdc_sn_socio_de_negocio_id: cdc_sn_socio_de_negocio_id
                }
            });


            //Carrito de compra
            const constProductoCarritoDeCompra = await models.ProductoCarritoDeCompra.findAll(
            {
                where: {
                    pcdc_carrito_de_compra_id: constCarritoDeCompra.cdc_carrito_de_compra_id
                },
                attributes: {
                    exclude: ['createdAt','updatedAt','pcdc_lista_precio','pcdc_precio','pcdc_prod_producto_id_regalo','pcdc_cantidad_producto_regalo',
                    'pcdc_descuento_promocion', 'pcdc_prod_producto_id_promocion', 'pcdc_cantidad_producto_promocion', 'pcdc_cupon_aplicado',
                    'pcdc_mejor_descuento', 'pcdc_almacen_surtido', 'pcdc_no_disponible_para_compra', 'pcdc_back_order', 'pcdc_validado']
                },
                order: [
                    ['pcdc_producto_carrito_id', 'ASC']
                ]
            });


            


            //Informacion Socio de negocio / Direccoin facturacion para impuestos
                const constSociosNegocio = await models.SociosNegocio.findOne(
                {
                    where: {
                        sn_socios_negocio_id: cdc_sn_socio_de_negocio_id
                    },
                    attributes:  ["sn_socios_negocio_id", "sn_cardcode", "sn_codigo_direccion_facturacion", "sn_lista_precios", "sn_codigo_grupo",
                    "sn_porcentaje_descuento_total"]
                });

                
                //obtener direccion de facturacion
                const constSociosNegocioDirecciones = await models.SociosNegocioDirecciones.findOne(
                {
                    where: {
                        snd_cardcode: constSociosNegocio.sn_cardcode,
                        snd_idDireccion: constSociosNegocio.sn_codigo_direccion_facturacion,
                        snd_tipoDir: "B"
                    }
                    // ,
                    // attributes:  ["sn_socios_negocio_id", "sn_cardcode", "sn_codigo_direccion_facturacion"]
                });

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
                else
                {
                    tipoImpuesto = 16
                }  
            // Fin informacion SN e Impuesto 



            for (var f = 0; f < constProductoCarritoDeCompra.length; f++) 
            {
                //Obtener Stock X hijo
                const constStockProducto = await models.StockProducto.findAll({
                    where: {
                        sp_prod_producto_id : constProductoCarritoDeCompra[f].dataValues.pcdc_prod_producto_id
                    }
                })
                constProductoCarritoDeCompra[f].dataValues.ListaStock = constStockProducto
            }





            //Generar promociones y cupones (no calcula totales aun)
            for (var i = 0; i < constProductoCarritoDeCompra.length; i++) 
            {
                var precioBaseFinal = 0

                //Informacion base de productos
                const constProducto = await models.Producto.findOne(
                {
                    where: {
                        prod_producto_id: constProductoCarritoDeCompra[i].dataValues.pcdc_prod_producto_id
                    }
                });

                constProductoCarritoDeCompra[i].dataValues.prod_sku = constProducto.prod_sku
                constProductoCarritoDeCompra[i].dataValues.prod_nombre = constProducto.prod_nombre
                constProductoCarritoDeCompra[i].dataValues.prod_precio = constProducto.prod_precio
                constProductoCarritoDeCompra[i].dataValues.prod_total_stock = constProducto.prod_total_stock
                constProductoCarritoDeCompra[i].dataValues.prod_nombre_extranjero = constProducto.prod_nombre_extranjero
                constProductoCarritoDeCompra[i].dataValues.prod_tipo_precio_base = constProducto.prod_tipo_precio_base
                constProductoCarritoDeCompra[i].dataValues.prod_dias_resurtimiento = constProducto.prod_dias_resurtimiento
                constProductoCarritoDeCompra[i].dataValues.prod_tipo_precio_base = constProducto.prod_tipo_precio_base
                constProductoCarritoDeCompra[i].dataValues.prod_es_stock_inactivo = constProducto.prod_es_stock_inactivo
                constProductoCarritoDeCompra[i].dataValues.prod_tipo_cambio_base = constProducto.prod_tipo_cambio_base

                //V4 values
                constProductoCarritoDeCompra[i].dataValues.prod_codigo_grupo = constProducto.prod_codigo_grupo
                constProductoCarritoDeCompra[i].dataValues.prod_codigo_marca = constProducto.prod_codigo_marca
                constProductoCarritoDeCompra[i].dataValues.prod_codigo_prop_list = constProducto.prod_codigo_prop_list




                //Agregar aplica backorder bool
                    if(constProductoCarritoDeCompra[i].dataValues.prod_dias_resurtimiento != '0')
                    {
                        constProductoCarritoDeCompra[i].dataValues.aplicaBackOrder = true
                    }
                    else
                    {
                        constProductoCarritoDeCompra[i].dataValues.aplicaBackOrder = false
                    }
                //




                // Buscar precio por SN en caso de que no sea stock inactivo (precio base final)
                    //El precio base siempre sera la misma variable porque ya no se usara lo de listas de precios de SN
                    precioBaseFinal = constProducto.prod_precio
                    // if(constProducto.prod_es_stock_inactivo == true)
                    // {
                        //Se dejara el precio base que tenga el producto sin importar que
                        // precioBaseFinal = constProducto.prod_precio
                    // }
                    // else
                    // {
                    //     //Buscar la lista de precio que tenga asignada el SN y buscar el precio que se le dara al carrito
                    //     const constProductoListaPrecio = await models.ProductoListaPrecio.findOne(
                    //     {
                    //         where: {
                    //             pl_prod_producto_id: constProductoCarritoDeCompra[i].dataValues.pcdc_prod_producto_id,
                    //             pl_listp_lista_de_precio_id: constSociosNegocio.sn_lista_precios
                    //         }
                    //     });

                    //     precioBaseFinal = constProductoListaPrecio.pl_precio_producto
                    // }
                    
                    constProductoCarritoDeCompra[i].dataValues.precioBaseFinal = precioBaseFinal

                    













                //PROMOCION
                    //Si es stock inactivo no tendra ni revisara descuentos
                    if(constProductoCarritoDeCompra[i].dataValues.prod_es_stock_inactivo == true)
                    {
                        constProductoCarritoDeCompra[i].dataValues.promocion = []
                    }
                    else
                    {
                        //Obtener Mejor Promocion y precio final
                        var mejorPromocionPrecio = await productosUtils.getBestPromotionForProduct(constProductoCarritoDeCompra[i].dataValues.pcdc_prod_producto_id);

                        // //Sett variable de promocion en el arreglo inicial
                        constProductoCarritoDeCompra[i].dataValues.promocion = mejorPromocionPrecio
                    }
                //END PROMOCION






                //DESCUENTOS SN/GRUPO/DIELSA
                    //Este codigo se repite desde la util getChildsSNDiscounts
                    //Si es stock inactivo no tendra ni revisara descuentos
                    if(constProductoCarritoDeCompra[i].dataValues.prod_es_stock_inactivo == true)
                    {
                        constProductoCarritoDeCompra[i].dataValues.descuentoGrupoBool = false
                        constProductoCarritoDeCompra[i].dataValues.descuentoGrupo = 0
                        constProductoCarritoDeCompra[i].dataValues.snDescuento = 0
                    }
                    else
                    {
                        //Obtener Mejor Promocion y precio final
                        var descuentoGrupo = await productosUtils.getSocioNegocioDiscountPerProduct(constProductoCarritoDeCompra[i].dataValues, constSociosNegocio);

                        if(descuentoGrupo > 0 || constSociosNegocio.sn_porcentaje_descuento_total > 0)
                        {
                            constProductoCarritoDeCompra[i].dataValues.descuentoGrupoBool = true
                            constProductoCarritoDeCompra[i].dataValues.descuentoGrupo = descuentoGrupo
                            constProductoCarritoDeCompra[i].dataValues.snDescuento = parseFloat(constSociosNegocio.sn_porcentaje_descuento_total)
                        }
                        else
                        {
                            constProductoCarritoDeCompra[i].dataValues.descuentoGrupoBool = false
                            constProductoCarritoDeCompra[i].dataValues.descuentoGrupo = 0
                            constProductoCarritoDeCompra[i].dataValues.snDescuento = parseFloat(constSociosNegocio.sn_porcentaje_descuento_total)
                        }
                    }
                //END DESCUENTOS SN/GRUPO/DIELSA




                //CUPON
                    if(constProductoCarritoDeCompra[i].dataValues.prod_es_stock_inactivo == true)
                    {
                        constProductoCarritoDeCompra[i].dataValues.cupon = []
                    }
                    else
                    {
                        //Obtener Mejor Promocion y precio final
                        var mejorCuponPrecio = await productosUtils.getBestCuponForProduct(constProductoCarritoDeCompra[i].dataValues.pcdc_prod_producto_id, constCarritoDeCompra.cdc_promcup_promociones_cupones_id, cdc_sn_socio_de_negocio_id);
                    
                        //Set cupones
                        constProductoCarritoDeCompra[i].dataValues.cupon = mejorCuponPrecio
                    }
                //ENDCUPON


                //Concatenar imagenes
                const constImagenProducto = await models.ImagenProducto.findOne(
                {
                    where: {
                        imgprod_prod_producto_id: constProductoCarritoDeCompra[i].dataValues.pcdc_prod_producto_id
                    },
                    attributes: {
                        exclude: ['createdAt','updatedAt','imgprod_usu_usuario_creador_id']
                    },
                    order: [
                        ['imgprod_nombre_archivo', 'ASC']
                    ],
                });
                constProductoCarritoDeCompra[i].dataValues.imagenes = constImagenProducto
            }//Fin generar promociones



            //Totales finales
            var precioTotal = 0
            var precioFinalTotal = 0

            //total de descuentos en todos los productos
            var totalDescuentosPromociones = 0
            var totalDescuentosCupones = 0














            //Calcular totales por producto
            for (var j = 0; j < constProductoCarritoDeCompra.length; j++) 
            {
                //Precio Base
                var precioBase = constProductoCarritoDeCompra[j].dataValues.precioBaseFinal
                var precioTemporal = constProductoCarritoDeCompra[j].dataValues.precioBaseFinal
                var totalDescuentoTemporal = 0


                //Si tiene promocion, descuento o cupon activo el producto calculara el precio
                if(constProductoCarritoDeCompra[j].dataValues.promocion.length > 0 || constProductoCarritoDeCompra[j].dataValues.cupon.length > 0 || constProductoCarritoDeCompra[j].dataValues.descuentoGrupoBool == true)
                {   



                    //V4
                    var totalPromocion = 0
                    var tipoDescuento = ''



                    //Buscar promocion por monto fijo
                    if(constProductoCarritoDeCompra[j].dataValues.promocion.length > 0)
                    {
                        if(constProductoCarritoDeCompra[j].dataValues.promocion[0].cmm_valor == "Monto fijo")
                        {   
                            if(totalPromocion < constProductoCarritoDeCompra[j].dataValues.promocion[0].promdes_descuento_exacto)
                            {
                                totalPromocion = constProductoCarritoDeCompra[j].dataValues.promocion[0].promdes_descuento_exacto
                                tipoDescuento = "Monto fijo"
                            }
                        }
                    }


                    //Buscar promocion por porcentaje
                    if(constProductoCarritoDeCompra[j].dataValues.promocion.length > 0)
                    {
                        //Calcular precio promocion activa
                        if(constProductoCarritoDeCompra[j].dataValues.promocion[0].cmm_valor == "Porcentaje")
                        {   
                            //Valor de la promocion por porcentaje
                            var porcentajePromocion = constProductoCarritoDeCompra[j].dataValues.promocion[0].promdes_descuento_exacto

                            //base - descuento = total Descuento
                            var totalDescuento = (((porcentajePromocion/100) * precioTemporal).toFixed(2))

                            if(totalPromocion < totalDescuento)
                            {
                                totalPromocion = totalDescuento
                                tipoDescuento = "Porcentaje"
                            }
                        }
                    }


                    //Buscar promocion por grupo/marca/dielsa
                    if(constProductoCarritoDeCompra[j].dataValues.descuentoGrupoBool == true)
                    {
                        //totalTemp es el resultado que queda
                        var totalTemp = 0

                        //Total acumulado es el total de descuento en INT
                        var totalAcumulado = 0


                        //$300   56% descuento   168 total
                        //Descuento por lista de precios grupos
                        if(constProductoCarritoDeCompra[j].dataValues.descuentoGrupo > 0)
                        {
                            totalTemp = precioTemporal - (((constProductoCarritoDeCompra[j].dataValues.descuentoGrupo/100) * precioTemporal))
                            totalAcumulado = (((constProductoCarritoDeCompra[j].dataValues.descuentoGrupo/100) * precioTemporal))
                        }

                        //$300   56% descuento   168 total por grupo y 50% del SN = 84
                        if(constProductoCarritoDeCompra[j].dataValues.snDescuento > 0)
                        {
                            //Si es mayor que 0 significa que primero tomara el primer descuento y luego este si no solo lo hara directo
                            if(totalAcumulado > 0)
                            {
                                totalAcumulado = totalAcumulado + (((constProductoCarritoDeCompra[j].dataValues.snDescuento/100) * totalTemp))
                                totalTemp = totalTemp - (((constProductoCarritoDeCompra[j].dataValues.snDescuento/100) * totalTemp))
                                
                            }
                            else
                            {
                                totalAcumulado = (((constProductoCarritoDeCompra[j].dataValues.snDescuento/100) * precioTemporal))
                                totalTemp = precioTemporal - (((constProductoCarritoDeCompra[j].dataValues.snDescuento/100) * precioTemporal))
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









                    //Valores de promocion/descuento antes de cupon
                    var cantidadPromocion = totalPromocion
                    precioTemporal = precioMenosPromo

                    constProductoCarritoDeCompra[j].dataValues.precioDespuesDePromocion = precioTemporal.toFixed(2)
                    constProductoCarritoDeCompra[j].dataValues.cantidadDescuentoPromocion = cantidadPromocion

                    //Calculara el total de descuentos por promocion
                    totalDescuentoTemporal = totalDescuentoTemporal + cantidadPromocion
                    totalDescuentosPromociones = totalDescuentosPromociones + (cantidadPromocion * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)







                    //verificara si la promocion es mayor que la promocion de sn para dejar un doble promotion (cosas dielsa)
                    var precioPromocionDielsaBool = false
                    var DescuentoSNFijo = 0
                    if(constProductoCarritoDeCompra[j].dataValues.promocion.length > 0 && constProductoCarritoDeCompra[j].dataValues.descuentoGrupoBool == true)
                    {
                        if(tipoDescuento == "Porcentaje" || tipoDescuento == 'Monto fijo')
                        {
                            precioPromocionDielsaBool = true
                            var DescuentoSNFijo = constProductoCarritoDeCompra[j].dataValues.prod_precio

                            if(constProductoCarritoDeCompra[j].dataValues.descuentoGrupo > 0)
                            {
                                DescuentoSNFijo = DescuentoSNFijo - (DescuentoSNFijo * (constProductoCarritoDeCompra[j].dataValues.descuentoGrupo / 100))
                            }

                            if(constProductoCarritoDeCompra[j].dataValues.snDescuento > 0)
                            {
                                DescuentoSNFijo = DescuentoSNFijo - (DescuentoSNFijo * (constProductoCarritoDeCompra[j].dataValues.snDescuento / 100))
                            }
                        }
                    }


                    constProductoCarritoDeCompra[j].dataValues.precioPromocionDielsaBool = precioPromocionDielsaBool
                    constProductoCarritoDeCompra[j].dataValues.DescuentoDielsaFijo = DescuentoSNFijo









                    //variables tipo v4
                    //Tipo de promocion final
                    constProductoCarritoDeCompra[j].dataValues.tipoPromocionFinal = tipoDescuento

                    //total de promocion (precio prod - promocion o descuento (sin iva))
                    constProductoCarritoDeCompra[j].dataValues.totalDescuentoFinal = parseFloat(totalPromocion)











                    //V3
                    // //Si existe promocion
                    // if(constProductoCarritoDeCompra[j].dataValues.promocion.length > 0)
                    // {
                    //     //Calcular precio promocion activa
                    //     if(constProductoCarritoDeCompra[j].dataValues.promocion[0].cmm_valor == "Porcentaje")
                    //     {   
                    //         //Valor de la promocion por porcentaje
                    //         var cantidadPromocion = constProductoCarritoDeCompra[j].dataValues.promocion[0].promdes_descuento_exacto
                    //         precioTemporal = precioTemporal-(((cantidadPromocion/ 100) * precioTemporal).toFixed(2))

                    //         if(precioTemporal <= 0)
                    //         {
                    //             precioTemporal = 0
                    //         }

                    //         constProductoCarritoDeCompra[j].dataValues.promocion[0].precioDespuesDePromocion = precioTemporal.toFixed(2)
                    //         constProductoCarritoDeCompra[j].dataValues.promocion[0].cantidadDescuentoPromocion = ((cantidadPromocion/ 100) * precioBase).toFixed(2)

                    //         totalDescuentoTemporal = totalDescuentoTemporal + ((cantidadPromocion/ 100) * precioBase)
                    //         totalDescuentosPromociones = totalDescuentosPromociones + (((cantidadPromocion/ 100) * precioBase) * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)
                    //     }
                    //     //Si es monto fijo
                    //     else
                    //     {
                    //         //Valor de la promocion de procentaje o fijo
                    //         var cantidadPromocion = constProductoCarritoDeCompra[j].dataValues.promocion[0].promdes_descuento_exacto
                    //         precioTemporal = precioTemporal - cantidadPromocion

                    //         //Si es mejor que 0 se setteara a 0 la variable para que el producto no cueste menos que 0 LOL
                    //         if(precioTemporal <= 0)
                    //         {
                    //             precioTemporal = 0
                    //         }

                    //         constProductoCarritoDeCompra[j].dataValues.promocion[0].precioDespuesDePromocion = precioTemporal.toFixed(2)
                    //         constProductoCarritoDeCompra[j].dataValues.promocion[0].cantidadDescuentoPromocion = cantidadPromocion.toFixed(2)

                    //         //Calculara el total de descuentos por promocion
                    //         totalDescuentoTemporal = totalDescuentoTemporal + cantidadPromocion
                    //         totalDescuentosPromociones = totalDescuentosPromociones + (cantidadPromocion * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)
                    //     }
                    // }
                    















                    //calcular total + cupones
                    if(constProductoCarritoDeCompra[j].dataValues.cupon.length > 0)
                    {
                        //calcular precio cupon activo
                        if(constProductoCarritoDeCompra[j].dataValues.cupon[0].cmm_valor == "Porcentaje")
                        {   
                            //Valor del cupon de procentaje
                            var cantidadPromocion = constProductoCarritoDeCompra[j].dataValues.cupon[0].promcup_descuento_exacto

                            //Cantidad de descuento del cupon una vez que la promocion surtio efecto en el precio base
                            constProductoCarritoDeCompra[j].dataValues.cantidadDescuentoCupon = ((cantidadPromocion/ 100) * precioTemporal).toFixed(2)
                            totalDescuentoTemporal = totalDescuentoTemporal + ((cantidadPromocion/ 100) * precioTemporal)
                            
                            //variable general que ira calculando el total
                            totalDescuentosCupones = totalDescuentosCupones + (((cantidadPromocion/ 100) * precioTemporal) * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)





                            precioTemporal = precioTemporal-(((cantidadPromocion/ 100) * precioTemporal))
                            if(precioTemporal <= 0)
                            {
                                precioTemporal = 0
                            }

                            //Precio despues del cupon
                            constProductoCarritoDeCompra[j].dataValues.precioDespuesDeCupon = precioTemporal.toFixed(2)
                        }
                        else
                        {
                            //Valor del cupon de procentaje
                            var cantidadPromocion = constProductoCarritoDeCompra[j].dataValues.cupon[0].promcup_descuento_exacto


                            constProductoCarritoDeCompra[j].dataValues.cantidadDescuentoCupon = cantidadPromocion
                            totalDescuentoTemporal = totalDescuentoTemporal + cantidadPromocion

                            //variable general que ira calculando el total
                            totalDescuentosCupones = totalDescuentosCupones + (cantidadPromocion * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)

                            precioTemporal = precioTemporal-cantidadPromocion

                            //Si es mejor que 0 se setteara a 0 la variable para que el producto no cueste menos que 0 LOL
                            if(precioTemporal <= 0)
                            {
                                precioTemporal = 0
                            }

                            constProductoCarritoDeCompra[j].dataValues.precioDespuesDeCupon = precioTemporal.toFixed(2)
                            

                            //Calculara el total de descuentos por promocion
                            
                            
                        }
                    }


















                    //envio + 3%
                    if(constCarritoDeCompra.cdc_forma_pago_codigo == "28" || constCarritoDeCompra.cdc_forma_pago_codigo == "04")
                    {
                        constProductoCarritoDeCompra[j].dataValues.precioFinal = parseFloat((precioTemporal * 1.03).toFixed(2))
                    }
                    else
                    {
                        constProductoCarritoDeCompra[j].dataValues.precioFinal = parseFloat((precioTemporal).toFixed(2))
                    }
                    


                    constProductoCarritoDeCompra[j].dataValues.precioFinalMasImpuesto = (constProductoCarritoDeCompra[j].dataValues.precioFinal * (1 + (tipoImpuesto / 100)))
                    constProductoCarritoDeCompra[j].dataValues.precioFinalMasImpuesto = parseFloat(constProductoCarritoDeCompra[j].dataValues.precioFinalMasImpuesto.toFixed(2))
                    

                    constProductoCarritoDeCompra[j].dataValues.totalDescuento = parseFloat(totalDescuentoTemporal)


                    //Precio total sin promociones
                    precioTotal = precioTotal + (constProductoCarritoDeCompra[j].dataValues.precioBaseFinal * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)


                    //Precio total con promociones calculado por producto

                    precioFinalTotal = precioFinalTotal + (constProductoCarritoDeCompra[j].dataValues.precioFinal * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)



                }
                //si no tiene promocion solo calculara plano
                else
                {
                    //envio + 3%
                    if(constCarritoDeCompra.cdc_forma_pago_codigo == "28" || constCarritoDeCompra.cdc_forma_pago_codigo == "04")
                    {
                        constProductoCarritoDeCompra[j].dataValues.precioFinal = parseFloat((precioBase * 1.03).toFixed(2))
                    }
                    else
                    {
                        constProductoCarritoDeCompra[j].dataValues.precioFinal = parseFloat((precioBase).toFixed(2))
                    }


                    constProductoCarritoDeCompra[j].dataValues.precioFinalMasImpuesto = (constProductoCarritoDeCompra[j].dataValues.precioFinal * (1 + (tipoImpuesto / 100)))
                    constProductoCarritoDeCompra[j].dataValues.precioFinalMasImpuesto = parseFloat(constProductoCarritoDeCompra[j].dataValues.precioFinalMasImpuesto.toFixed(2))
                    constProductoCarritoDeCompra[j].dataValues.totalDescuento = 0

                    //Precio total sin promociones
                    precioTotal = precioTotal + (constProductoCarritoDeCompra[j].dataValues.precioBaseFinal * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)

                    //Precio total con promociones calculado por producto
                    // precioFinalTotal = precioFinalTotal + (constProductoCarritoDeCompra[j].dataValues.precioBaseFinal * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)
                    precioFinalTotal = precioFinalTotal + (constProductoCarritoDeCompra[j].dataValues.precioFinal * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)
                }

            }


















            //Set precios nuevos y resumen
            constCarritoDeCompra.dataValues.tipoImpuesto = tipoImpuesto + "%"
            constCarritoDeCompra.dataValues.totalDescuentosPromociones = totalDescuentosPromociones.toFixed(2)
            constCarritoDeCompra.dataValues.totalDescuentosCupones = totalDescuentosCupones.toFixed(2)
            constCarritoDeCompra.dataValues.totalDescuentos = (totalDescuentosCupones+totalDescuentosPromociones).toFixed(2)
            constCarritoDeCompra.dataValues.precioTotal = precioTotal.toFixed(2)
            constCarritoDeCompra.dataValues.precioFinalTotal = precioFinalTotal.toFixed(2)


            constCarritoDeCompra.dataValues.TotalImpuesto = precioFinalTotal * (tipoImpuesto / 100)
            constCarritoDeCompra.dataValues.TotalImpuestoProductos = (constCarritoDeCompra.dataValues.TotalImpuesto).toFixed(2)
            constCarritoDeCompra.dataValues.precioFinalTotalMasImpuestos = (precioFinalTotal * (1 + (tipoImpuesto / 100))).toFixed(2)




            //envio + 3%
            if(constCarritoDeCompra.cdc_forma_pago_codigo == "28" || constCarritoDeCompra.cdc_forma_pago_codigo == "04")
            {
                constCarritoDeCompra.dataValues.cdc_costo_envio = constCarritoDeCompra.dataValues.cdc_costo_envio * 1.03
            }
            else
            {
                constCarritoDeCompra.dataValues.cdc_costo_envio = constCarritoDeCompra.dataValues.cdc_costo_envio
            }

            constCarritoDeCompra.dataValues.costoEnvioMasImpuesto = constCarritoDeCompra.cdc_costo_envio * (1 + (tipoImpuesto / 100))
            constCarritoDeCompra.dataValues.costoEnvioMasImpuesto = parseFloat(constCarritoDeCompra.dataValues.costoEnvioMasImpuesto.toFixed(2))

            constCarritoDeCompra.dataValues.costoEnvioIVA = constCarritoDeCompra.cdc_costo_envio * ((tipoImpuesto / 100))
            constCarritoDeCompra.dataValues.costoEnvioIVA = parseFloat(constCarritoDeCompra.dataValues.costoEnvioIVA.toFixed(2))


            constCarritoDeCompra.dataValues.TotalImpuesto = constCarritoDeCompra.dataValues.TotalImpuesto + constCarritoDeCompra.dataValues.costoEnvioIVA
            constCarritoDeCompra.dataValues.TotalImpuesto = parseFloat(constCarritoDeCompra.dataValues.TotalImpuesto.toFixed(2))

            constCarritoDeCompra.dataValues.TotalFinal = parseFloat(constCarritoDeCompra.dataValues.precioFinalTotalMasImpuestos) + constCarritoDeCompra.dataValues.costoEnvioMasImpuesto
            constCarritoDeCompra.dataValues.TotalFinal = parseFloat(constCarritoDeCompra.dataValues.TotalFinal.toFixed(2))


            constCarritoDeCompra.dataValues.productos = constProductoCarritoDeCompra













            //Agregar valores finales en USD de productos
            for (var y = 0; y < constCarritoDeCompra.dataValues.productos.length; y++) 
            {
                if(constCarritoDeCompra.dataValues.productos[y].dataValues.precioBaseFinal > 0)
                {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.precioBaseFinal_USD = parseFloat((constCarritoDeCompra.dataValues.productos[y].dataValues.precioBaseFinal/USDValor).toFixed(2))
                }
                else
                {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.precioBaseFinal_USD = 0
                }

                if(constCarritoDeCompra.dataValues.productos[y].dataValues.totalDescuento > 0)
                {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.totalDescuento_USD = parseFloat((constCarritoDeCompra.dataValues.productos[y].dataValues.totalDescuento/USDValor).toFixed(2))
                }
                else
                {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.totalDescuento_USD = 0
                }

                if(constCarritoDeCompra.dataValues.productos[y].dataValues.DescuentoDielsaFijo > 0)
                {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.DescuentoDielsaFijo_USD = parseFloat((constCarritoDeCompra.dataValues.productos[y].dataValues.DescuentoDielsaFijo/USDValor).toFixed(2))
                }
                else
                {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.DescuentoDielsaFijo_USD = 0
                }

                if(constCarritoDeCompra.dataValues.productos[y].dataValues.precioFinal > 0)
                {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.precioFinal_USD = parseFloat((constCarritoDeCompra.dataValues.productos[y].dataValues.precioFinal/USDValor).toFixed(2))
                }
                else
                {
                    constCarritoDeCompra.dataValues.productos[y].dataValues.precioFinal_USD = 0
                }
            }




            //Retorna el id del carrito segun el id del SN

            return constCarritoDeCompra
            // res.status(200).send({
            //     message: 'Checkout Obtenido',
            //     cdc_carrito_de_compra_id: constCarritoDeCompra
            // })

        }
        catch(e){
            console.log(e)
            // res.status(500).send({
            //     message: 'Error al obtener Checkout',
            //     e
            // });
            // next(e);


            return "error"
        }
    },
    getCartAPI: async function (cdc_sn_socio_de_negocio_id) {
        try{

            //Buscara si el Socio de negocio tiene un carrito activo.
            const constCarritoDeCompra = await models.CarritoDeCompra.findOne(
            {
              
                where: {
                    cdc_sn_socio_de_negocio_id: cdc_sn_socio_de_negocio_id
                },
                
            });


            var tipoImpuesto = 16

            //Informacion Socio de negocio / Direccoin facturacion para impuestos
                const constSociosNegocio = await models.SociosNegocio.findOne(
                {
                    where: {
                        sn_socios_negocio_id: cdc_sn_socio_de_negocio_id
                    },
                  
                    attributes:  ["sn_socios_negocio_id", "sn_cardcode", "sn_codigo_direccion_facturacion", "sn_lista_precios", "sn_codigo_grupo",
                    "sn_porcentaje_descuento_total"]
                });

                
                //obtener direccion de facturacion
                const constSociosNegocioDirecciones = await models.SociosNegocioDirecciones.findOne(
                {
                    where: {
                        snd_cardcode: constSociosNegocio.sn_cardcode,
                        snd_idDireccion: constSociosNegocio.sn_codigo_direccion_facturacion,
                        snd_tipoDir: "B"
                    }
                    // ,
                    // attributes:  ["sn_socios_negocio_id", "sn_cardcode", "sn_codigo_direccion_facturacion"]
                });

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
                else
                {
                    tipoImpuesto = 16
                }  
            // Fin informacion SN e Impuesto 


            if(constCarritoDeCompra)
            {

                const constProductoCarritoDeCompra = await models.ProductoCarritoDeCompra.findAll(
                {
                    where: {
                        pcdc_carrito_de_compra_id: constCarritoDeCompra.cdc_carrito_de_compra_id
                    },
                    include: [
                        {
                            model: models.Producto
                        }
                    ],
                    attributes: {
                        exclude: ['createdAt','updatedAt','pcdc_lista_precio','pcdc_precio','pcdc_prod_producto_id_regalo','pcdc_cantidad_producto_regalo',
                        'pcdc_descuento_promocion', 'pcdc_prod_producto_id_promocion', 'pcdc_cantidad_producto_promocion', 'pcdc_cupon_aplicado',
                        'pcdc_mejor_descuento', 'pcdc_almacen_surtido', 'pcdc_no_disponible_para_compra', 'pcdc_back_order', 'pcdc_validado']
                    },
                    order: [
                        ['createdAt', 'ASC']
                    ],
                });

                for (var i = 0; i < constProductoCarritoDeCompra.length; i++) 
                {
                    const constProducto = await models.Producto.findOne(
                    {
                        where: {
                            prod_producto_id: constProductoCarritoDeCompra[i].dataValues.pcdc_prod_producto_id
                        }
                    });

                    const constImagenProducto = await models.ImagenProducto.findOne(
                    {
                        where: {
                            imgprod_prod_producto_id: constProductoCarritoDeCompra[i].dataValues.pcdc_prod_producto_id
                        },
                        attributes: {
                            exclude: ['createdAt','updatedAt','imgprod_usu_usuario_creador_id']
                        }
                    });

                    constProductoCarritoDeCompra[i].dataValues.imagenes = constImagenProducto
                    constProductoCarritoDeCompra[i].dataValues.prod_sku = constProducto.prod_sku



                    constProductoCarritoDeCompra[i].dataValues.prod_prod_producto_padre_sku = constProducto.prod_prod_producto_padre_sku

                    //Agregar producto padre ID al carrito para la pagina de producto
                    const constProductoPadreID = await models.Producto.findOne(
                    {
                        where: {
                            prod_sku: constProducto.prod_prod_producto_padre_sku
                        }
                    });


                    if(constProducto)
                    {
                        constProductoCarritoDeCompra[i].dataValues.productoPadreId = constProductoPadreID.prod_producto_id
                    }

                    constProductoCarritoDeCompra[i].dataValues.prod_nombre = constProducto.prod_nombre
                    constProductoCarritoDeCompra[i].dataValues.prod_precio = constProducto.prod_precio
                    constProductoCarritoDeCompra[i].dataValues.prod_total_stock = constProducto.prod_total_stock
                    constProductoCarritoDeCompra[i].dataValues.prod_nombre_extranjero = constProducto.prod_nombre_extranjero
                    constProductoCarritoDeCompra[i].dataValues.prod_tipo_precio_base = constProducto.prod_tipo_precio_base
                    constProductoCarritoDeCompra[i].dataValues.prod_dias_resurtimiento = constProducto.prod_dias_resurtimiento
                    constProductoCarritoDeCompra[i].dataValues.prod_es_stock_inactivo = constProducto.prod_es_stock_inactivo

                    //V4 values
                    constProductoCarritoDeCompra[i].dataValues.prod_codigo_grupo = constProducto.prod_codigo_grupo
                    constProductoCarritoDeCompra[i].dataValues.prod_codigo_marca = constProducto.prod_codigo_marca
                    constProductoCarritoDeCompra[i].dataValues.prod_codigo_prop_list = constProducto.prod_codigo_prop_list



                    //Agregar aplica backorder bool
                        if(constProductoCarritoDeCompra[i].dataValues.prod_dias_resurtimiento != '0')
                        {
                            constProductoCarritoDeCompra[i].dataValues.aplicaBackOrder = true
                        }
                        else
                        {
                            constProductoCarritoDeCompra[i].dataValues.aplicaBackOrder = false
                        }
                    //

                    var precioBaseFinal = 0
                    var precioBaseFinal = constProducto.prod_precio
                    constProductoCarritoDeCompra[i].dataValues.precioBaseFinal = precioBaseFinal



                    //PROMOCION
                        //Si es stock inactivo no tendra ni revisara descuentos
                        if(constProductoCarritoDeCompra[i].dataValues.prod_es_stock_inactivo == true)
                        {
                            constProductoCarritoDeCompra[i].dataValues.promocion = []
                        }
                        else
                        {
                            //Obtener Mejor Promocion y precio final
                            var mejorPromocionPrecio = await productosUtils.getBestPromotionForProduct(constProductoCarritoDeCompra[i].dataValues.pcdc_prod_producto_id);

                            // //Sett variable de promocion en el arreglo inicial
                            constProductoCarritoDeCompra[i].dataValues.promocion = mejorPromocionPrecio
                        }
                    //END PROMOCION





                    //DESCUENTOS SN/GRUPO/DIELSA
                        //Este codigo se repite desde la util getChildsSNDiscounts
                        //Si es stock inactivo no tendra ni revisara descuentos
                        if(constProductoCarritoDeCompra[i].dataValues.prod_es_stock_inactivo == true)
                        {
                            constProductoCarritoDeCompra[i].dataValues.descuentoGrupoBool = false
                            constProductoCarritoDeCompra[i].dataValues.descuentoGrupo = 0
                            constProductoCarritoDeCompra[i].dataValues.snDescuento = 0
                        }
                        else
                        {
                            //Obtener Mejor Promocion y precio final
                            var descuentoGrupo = await productosUtils.getSocioNegocioDiscountPerProduct(constProductoCarritoDeCompra[i].dataValues, constSociosNegocio);

                            if(descuentoGrupo > 0 || constSociosNegocio.sn_porcentaje_descuento_total > 0)
                            {
                                constProductoCarritoDeCompra[i].dataValues.descuentoGrupoBool = true
                                constProductoCarritoDeCompra[i].dataValues.descuentoGrupo = descuentoGrupo
                                constProductoCarritoDeCompra[i].dataValues.snDescuento = parseFloat(constSociosNegocio.sn_porcentaje_descuento_total)
                            }
                            else
                            {
                                constProductoCarritoDeCompra[i].dataValues.descuentoGrupoBool = false
                                constProductoCarritoDeCompra[i].dataValues.descuentoGrupo = 0
                                constProductoCarritoDeCompra[i].dataValues.snDescuento = parseFloat(constSociosNegocio.sn_porcentaje_descuento_total)
                            }
                        }
                    //END DESCUENTOS SN/GRUPO/DIELSA

                }

                constCarritoDeCompra.dataValues.productos = constProductoCarritoDeCompra
                
                //Totales finales
                var precioTotal = 0
                var precioFinalTotal = 0

                var totalDescuentosPromociones = 0
                var totalDescuentosCupones = 0


                //Calcular totales por producto
                for (var j = 0; j < constProductoCarritoDeCompra.length; j++) 
                {
                    //total de descuentos en todos los productos
                    var precioBase = constProductoCarritoDeCompra[j].dataValues.precioBaseFinal
                    var precioTemporal = constProductoCarritoDeCompra[j].dataValues.precioBaseFinal
                    var totalDescuentoTemporal = 0

                    //Si tiene promocion, descuento o cupon activo el producto calculara el precio
                    if(constProductoCarritoDeCompra[j].dataValues.promocion.length > 0 || constProductoCarritoDeCompra[j].dataValues.descuentoGrupoBool == true)
                    {   

                        //V4
                        var totalPromocion = 0
                        var tipoDescuento = ''

                        //Buscar promocion por monto fijo
                        if(constProductoCarritoDeCompra[j].dataValues.promocion.length > 0)
                        {
                            if(constProductoCarritoDeCompra[j].dataValues.promocion[0].cmm_valor == "Monto fijo")
                            {   
                                if(totalPromocion < constProductoCarritoDeCompra[j].dataValues.promocion[0].promdes_descuento_exacto)
                                {
                                    totalPromocion = constProductoCarritoDeCompra[j].dataValues.promocion[0].promdes_descuento_exacto
                                    tipoDescuento = "Monto fijo"
                                }
                            }
                        }

                        //Buscar promocion por porcentaje
                        if(constProductoCarritoDeCompra[j].dataValues.promocion.length > 0)
                        {
                            //Calcular precio promocion activa
                            if(constProductoCarritoDeCompra[j].dataValues.promocion[0].cmm_valor == "Porcentaje")
                            {   
                                //Valor de la promocion por porcentaje
                                var porcentajePromocion = constProductoCarritoDeCompra[j].dataValues.promocion[0].promdes_descuento_exacto

                                //base - descuento = total Descuento
                                var totalDescuento = (((porcentajePromocion/100) * precioTemporal).toFixed(2))

                                if(totalPromocion < totalDescuento)
                                {
                                    totalPromocion = totalDescuento
                                    tipoDescuento = "Porcentaje"
                                }
                            }
                        }

                        //Buscar promocion por grupo/marca/dielsa
                        if(constProductoCarritoDeCompra[j].dataValues.descuentoGrupoBool == true)
                        {
                            //totalTemp es el resultado que queda
                            var totalTemp = 0

                            //Total acumulado es el total de descuento en INT
                            var totalAcumulado = 0


                            //$300   56% descuento   168 total
                            //Descuento por lista de precios grupos
                            if(constProductoCarritoDeCompra[j].dataValues.descuentoGrupo > 0)
                            {
                                totalTemp = precioTemporal - (((constProductoCarritoDeCompra[j].dataValues.descuentoGrupo/100) * precioTemporal))
                                totalAcumulado = (((constProductoCarritoDeCompra[j].dataValues.descuentoGrupo/100) * precioTemporal))
                            }

                            //$300   56% descuento   168 total por grupo y 50% del SN = 84
                            if(constProductoCarritoDeCompra[j].dataValues.snDescuento > 0)
                            {
                                //Si es mayor que 0 significa que primero tomara el primer descuento y luego este si no solo lo hara directo
                                if(totalAcumulado > 0)
                                {
                                    totalAcumulado = totalAcumulado + (((constProductoCarritoDeCompra[j].dataValues.snDescuento/100) * totalTemp))
                                    totalTemp = totalTemp - (((constProductoCarritoDeCompra[j].dataValues.snDescuento/100) * totalTemp))
                                    
                                }
                                else
                                {
                                    totalAcumulado = (((constProductoCarritoDeCompra[j].dataValues.snDescuento/100) * precioTemporal))
                                    totalTemp = precioTemporal - (((constProductoCarritoDeCompra[j].dataValues.snDescuento/100) * precioTemporal))
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



                        //Valores de promocion/descuento antes de cupon
                        var cantidadPromocion = totalPromocion
                        precioTemporal = precioMenosPromo

                        constProductoCarritoDeCompra[j].dataValues.precioDespuesDePromocion = precioTemporal.toFixed(2)
                        constProductoCarritoDeCompra[j].dataValues.cantidadDescuentoPromocion = cantidadPromocion

                        //Calculara el total de descuentos por promocion
                        totalDescuentoTemporal = totalDescuentoTemporal + cantidadPromocion
                        totalDescuentosPromociones = totalDescuentosPromociones + (cantidadPromocion * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)


                        //variables tipo v4
                        //Tipo de promocion final
                        constProductoCarritoDeCompra[j].dataValues.tipoPromocionFinal = tipoDescuento

                        //total de promocion (precio prod - promocion o descuento (sin iva))
                        constProductoCarritoDeCompra[j].dataValues.totalDescuentoFinal = parseFloat(totalPromocion)





                        //verificara si la promocion es mayor que la promocion de sn para dejar un doble promotion (cosas dielsa)
                        var precioPromocionDielsaBool = false
                        var DescuentoSNFijo = 0
                        if(constProductoCarritoDeCompra[j].dataValues.promocion.length > 0 && constProductoCarritoDeCompra[j].dataValues.descuentoGrupoBool == true)
                        {
                            if(tipoDescuento == "Porcentaje" || tipoDescuento == 'Monto fijo')
                            {
                                precioPromocionDielsaBool = true
                                var DescuentoSNFijo = constProductoCarritoDeCompra[j].dataValues.prod_precio

                                if(constProductoCarritoDeCompra[j].dataValues.descuentoGrupo > 0)
                                {
                                    DescuentoSNFijo = DescuentoSNFijo - (DescuentoSNFijo * (constProductoCarritoDeCompra[j].dataValues.descuentoGrupo / 100))
                                }

                                if(constProductoCarritoDeCompra[j].dataValues.snDescuento > 0)
                                {
                                    DescuentoSNFijo = DescuentoSNFijo - (DescuentoSNFijo * (constProductoCarritoDeCompra[j].dataValues.snDescuento / 100))
                                }
                            }
                        }


                        constProductoCarritoDeCompra[j].dataValues.precioPromocionDielsaBool = precioPromocionDielsaBool
                        constProductoCarritoDeCompra[j].dataValues.DescuentoDielsaFijo = DescuentoSNFijo






                        //Precio Final
                        constProductoCarritoDeCompra[j].dataValues.precioFinal = parseFloat((precioTemporal).toFixed(2))
                        constProductoCarritoDeCompra[j].dataValues.precioFinalMasImpuesto = (constProductoCarritoDeCompra[j].dataValues.precioFinal * (1 + (tipoImpuesto / 100)))
                        constProductoCarritoDeCompra[j].dataValues.precioFinalMasImpuesto = parseFloat(constProductoCarritoDeCompra[j].dataValues.precioFinalMasImpuesto.toFixed(2))
                        

                        constProductoCarritoDeCompra[j].dataValues.totalDescuento = parseFloat(totalDescuentoTemporal)


                        //Precio total sin promociones
                        precioTotal = precioTotal + (constProductoCarritoDeCompra[j].dataValues.precioBaseFinal * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)


                        //Precio total con promociones calculado por producto
                        precioFinalTotal = precioFinalTotal + (precioTemporal * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)
                    }
                    //si no tiene promocion solo calculara plano
                    else
                    {
                        //Precio Final
                        constProductoCarritoDeCompra[j].dataValues.precioFinal = parseFloat((precioBase).toFixed(2))
                        constProductoCarritoDeCompra[j].dataValues.precioFinalMasImpuesto = (constProductoCarritoDeCompra[j].dataValues.precioFinal * (1 + (tipoImpuesto / 100)))
                        constProductoCarritoDeCompra[j].dataValues.precioFinalMasImpuesto = parseFloat(constProductoCarritoDeCompra[j].dataValues.precioFinalMasImpuesto.toFixed(2))
                        constProductoCarritoDeCompra[j].dataValues.totalDescuento = 0

                        //Precio total sin promociones
                        precioTotal = precioTotal + (constProductoCarritoDeCompra[j].dataValues.precioBaseFinal * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)

                        //Precio total con promociones calculado por producto
                        precioFinalTotal = precioFinalTotal + (constProductoCarritoDeCompra[j].dataValues.precioBaseFinal * constProductoCarritoDeCompra[j].dataValues.pcdc_producto_cantidad)
                    }

                }




                //Set precios nuevos y resumen
                constCarritoDeCompra.dataValues.tipoImpuesto = tipoImpuesto + "%"
                constCarritoDeCompra.dataValues.totalDescuentosPromociones = totalDescuentosPromociones.toFixed(2)
                constCarritoDeCompra.dataValues.totalDescuentosCupones = totalDescuentosCupones.toFixed(2)
                constCarritoDeCompra.dataValues.totalDescuentos = (totalDescuentosCupones+totalDescuentosPromociones).toFixed(2)
                constCarritoDeCompra.dataValues.precioTotal = precioTotal.toFixed(2)
                constCarritoDeCompra.dataValues.precioFinalTotal = precioFinalTotal.toFixed(2)


                constCarritoDeCompra.dataValues.TotalImpuesto = precioFinalTotal * (tipoImpuesto / 100)
                constCarritoDeCompra.dataValues.TotalImpuestoProductos = (constCarritoDeCompra.dataValues.TotalImpuesto).toFixed(2)
                constCarritoDeCompra.dataValues.precioFinalTotalMasImpuestos = (precioFinalTotal * (1 + (tipoImpuesto / 100))).toFixed(2)


                constCarritoDeCompra.dataValues.costoEnvioMasImpuesto = constCarritoDeCompra.cdc_costo_envio * (1 + (tipoImpuesto / 100))
                constCarritoDeCompra.dataValues.costoEnvioMasImpuesto = parseFloat(constCarritoDeCompra.dataValues.costoEnvioMasImpuesto.toFixed(2))

                constCarritoDeCompra.dataValues.costoEnvioIVA = constCarritoDeCompra.cdc_costo_envio * ((tipoImpuesto / 100))
                constCarritoDeCompra.dataValues.costoEnvioIVA = parseFloat(constCarritoDeCompra.dataValues.costoEnvioIVA.toFixed(2))


                constCarritoDeCompra.dataValues.TotalImpuesto = constCarritoDeCompra.dataValues.TotalImpuesto + constCarritoDeCompra.dataValues.costoEnvioIVA
                constCarritoDeCompra.dataValues.TotalImpuesto = parseFloat(constCarritoDeCompra.dataValues.TotalImpuesto.toFixed(2))

                constCarritoDeCompra.dataValues.TotalFinal = parseFloat(constCarritoDeCompra.dataValues.precioFinalTotalMasImpuestos) + constCarritoDeCompra.dataValues.costoEnvioMasImpuesto
                constCarritoDeCompra.dataValues.TotalFinal = parseFloat(constCarritoDeCompra.dataValues.TotalFinal.toFixed(2))


                constCarritoDeCompra.dataValues.productos = constProductoCarritoDeCompra



























                // //Retorna el id del carrito segun el id del SN
                // res.status(200).send({
                //     message: 'Carrito Obtenido Con Exito',
                //     cdc_carrito_de_compra_id: constCarritoDeCompra
                // })

                return constCarritoDeCompra
            }
            else
            {
                //var con el numero de orden (generador)
                // const orden_carrito = String(Date.now()) + String(!!cdc_sn_socio_de_negocio_id ? cdc_sn_socio_de_negocio_id : 0 ) + String(0);

                //Buscara si el Socio de negocio tiene un carrito activo.
                var ultimoRowNum = 0
                const constCartLast = await models.CarritoDeCompra.findOne(
                {
                    order: [
                        ['cdc_carrito_de_compra_id', 'DESC']
                    ],
                    limit: 1
                });


                if(constCartLast)
                {
                    ultimoRowNum = constCartLast.cdc_carrito_de_compra_id
                }

                const orden_carrito = String(Date.now())+String(ultimoRowNum+1)
                
                //JSON con la informacion para grear un carrito basico
                const bodyCreate = {
                    "cdc_numero_orden": orden_carrito,
                    "cdc_sn_socio_de_negocio_id": cdc_sn_socio_de_negocio_id
                };
                
                //Const que genera el id del sn
                const exito = await models.CarritoDeCompra.create(bodyCreate)






                //Buscara si el Socio de negocio tiene un carrito activo.
                const constCarritoDeCompraRecienCreado = await models.CarritoDeCompra.findOne(
                {
                    where: {
                        cdc_sn_socio_de_negocio_id: cdc_sn_socio_de_negocio_id
                    }
                });


                //Buscar productos de carrito (vacio)
                const constProductoCarritoDeCompraRecienCreado = await models.ProductoCarritoDeCompra.findAll(
                {
                    where: {
                        pcdc_carrito_de_compra_id: constCarritoDeCompraRecienCreado.cdc_carrito_de_compra_id
                    },
                    attributes: {
                        exclude: ['createdAt','updatedAt','pcdc_lista_precio','pcdc_precio','pcdc_prod_producto_id_regalo','pcdc_cantidad_producto_regalo',
                        'pcdc_descuento_promocion', 'pcdc_prod_producto_id_promocion', 'pcdc_cantidad_producto_promocion', 'pcdc_cupon_aplicado',
                        'pcdc_mejor_descuento', 'pcdc_almacen_surtido', 'pcdc_no_disponible_para_compra', 'pcdc_back_order', 'pcdc_validado']
                    }
                });

                constCarritoDeCompraRecienCreado.dataValues.productos = constProductoCarritoDeCompraRecienCreado

                // //Retornara el id del nuevo carrito
                // res.status(200).send({
                //     message: 'Carrito Obtenido Con Exito',
                //     constCarritoDeCompraRecienCreado
                // })

                return constCarritoDeCompraRecienCreado
            }








            return constCarritoDeCompra
        }
        catch(e){
            console.log(e)
            // res.status(500).send({
            //     message: 'Error al obtener Checkout',
            //     e
            // });
            // next(e);


            return "error"
        }
    },
    getLineasProductosComprasFinalizadas: async function (checkoutJson, id_orden) {
        try{
            var productos = checkoutJson.dataValues.productos
            var almacenCodigoPrincipal
            var almacenCodigoSecundario

            var lineasArray = [];


            console.log(checkoutJson.cdc_cmm_tipo_envio_id)


            //obtener tipo impuesto cmm
            const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_control_id: checkoutJson.cdc_cmm_tipo_envio_id
                }
            })


            //Envio a domicilio si el ID es 16 de tipo envio
            if(constControlMaestroMultiple.cmm_valor == "Envío domicilio")
            {
                //Obtener almacen asignado al cliente (primario)
                const constSociosNegocioDirecciones = await models.SociosNegocioDirecciones.findOne(
                {
                    where: {
                        snd_direcciones_id: checkoutJson.dataValues.cdc_direccion_envio_id
                    }
                });

                if(constSociosNegocioDirecciones)
                {
                    //Obtener Estado Nombre
                    const constEstado2 = await models.Estado.findOne(
                    {
                        where: {
                            estpa_estado_pais_id: constSociosNegocioDirecciones.snd_estado_id
                        }
                    });
                    var estadoValor2 = constEstado2.dataValues.estpa_estado_nombre

                    //Obtener almacen de logistica
                    const AlmacenesLogistica = await models.AlmacenesLogistica.findOne(
                    {
                        where: {
                            almlog_estpa_estado_pais_nombre: estadoValor2
                        }
                    });

                    //Obtener almacen de logistica
                    const constAlmacenes = await models.Almacenes.findOne(
                    {
                        where: {
                            alm_codigoAlmacen: AlmacenesLogistica.almlog_almacen_codigo
                        }
                    });
             
                    if(constAlmacenes.alm_nombre == "Mexico")
                    {
                        //Obtener almacen de logistica
                        const constAlmacenesSecundario = await models.Almacenes.findOne(
                        {
                            where: {
                                alm_nombre: "Monterrey"
                            }
                        });

                        almacenCodigoPrincipal = constAlmacenes.alm_almacen_id
                        almacenCodigoSecundario = constAlmacenesSecundario.alm_almacen_id
                    }
                    else
                    {
                        //Obtener almacen de logistica
                        const constAlmacenesSecundario = await models.Almacenes.findOne(
                        {
                            where: {
                                alm_nombre: "Mexico"
                            }
                        });

                        almacenCodigoPrincipal = constAlmacenes.alm_almacen_id
                        almacenCodigoSecundario = constAlmacenesSecundario.alm_almacen_id
                    }
                }


                //Obtener lineas
                for (var i = 0; i < productos.length; i++) 
                {
                    // if(productos[i].dataValues.prod_precio > 0
                    //     && productos[i].dataValues.producto.prod_volumen > 0
                    //     && productos[i].dataValues.producto.prod_peso > 0) {
                        
                    //     }
                    var aplicaBackOrder = productos[i].dataValues.aplicaBackOrder
                    var inventarioFaltante = productos[i].dataValues.pcdc_producto_cantidad
                    // console.log('inventarioFaltante ----------------------> ', i, inventarioFaltante);
                    var breaker = 0;
                    var stockDisponible = productos[i].dataValues.prod_total_stock
                    var stockPrimarioDisponible = true
                    var stockSecundarioDisponible = true

                    while(inventarioFaltante > 0)
                    {
                        //Stock disponible total 
                        if(stockDisponible > 0 && productos[i].dataValues.backOrderPrecioLista == false)
                        {

                            //Buscar primero en almacen primario
                            if(stockPrimarioDisponible == true)
                            {
                                //Obtener almacen de logistica
                                const constStockPrimario = await models.StockProducto.findOne(
                                {
                                    where: {
                                        sp_prod_producto_id: productos[i].dataValues.pcdc_prod_producto_id,
                                        sp_almacen_id: almacenCodigoPrincipal
                                    }
                                })

                                var cantidadDisponible = constStockPrimario.sp_cantidad
                                //Si hay inventario intentara tomarlo para hacer la primer linea
                                if(cantidadDisponible > 0)
                                {
                                    //Surtir toda la linea de producto desde aqui
                                    if(inventarioFaltante < cantidadDisponible)
                                    {
                                        var linea = {
                                            pcf_cf_compra_finalizada_id: id_orden,
                                            pcf_prod_producto_id: productos[i].dataValues.pcdc_prod_producto_id,
                                            pcf_cantidad_producto: inventarioFaltante,
                                            pcf_descuento_producto: null,
                                            pcf_precio: (productos[i].dataValues.projectProduct 
                                                && (productos[i].dataValues.projectProductPrice < productos[i].dataValues.precioFinal || productos[i].dataValues.precioFinal===0) 
                                                ? productos[i].dataValues.projectProductPrice  
                                                : productos[i].dataValues.precioFinal),
                                            pcf_prod_producto_id_regalo: null,
                                            pcf_cantidad_producto_regalo: null,
                                            pcf_descuento_promocion: productos[i].dataValues.totalDescuento,
                                            pcf_prod_producto_id_promocion: null,
                                            pcf_cantidad_producto_promocion: null,
                                            pcf_cupon_aplicado: null,
                                            pcf_almacen_linea: almacenCodigoPrincipal,
                                            pcf_is_backorder: false,
                                            pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                            pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                            pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                            pcf_descuento_porcentual: productos[i].dataValues.totalDescuentoPorcentual
                                        }

                                        lineasArray.push(linea);

                                        cantidadDisponible = 0
                                        inventarioFaltante = 0
                                        stockDisponible = 0
                                    }
                                    //Surtir parcial 
                                    else
                                    {
                                        var linea = {
                                            pcf_cf_compra_finalizada_id: id_orden,
                                            pcf_prod_producto_id: productos[i].dataValues.pcdc_prod_producto_id,
                                            pcf_cantidad_producto: cantidadDisponible,
                                            pcf_descuento_producto: null,
                                            pcf_precio: (productos[i].dataValues.projectProduct 
                                                && (productos[i].dataValues.projectProductPrice < productos[i].dataValues.precioFinal || productos[i].dataValues.precioFinal===0) 
                                                ? productos[i].dataValues.projectProductPrice 
                                                : productos[i].dataValues.precioFinal),
                                            pcf_prod_producto_id_regalo: null,
                                            pcf_cantidad_producto_regalo: null,
                                            pcf_descuento_promocion: productos[i].dataValues.totalDescuento,
                                            pcf_prod_producto_id_promocion: null,
                                            pcf_cantidad_producto_promocion: null,
                                            pcf_cupon_aplicado: null,
                                            pcf_almacen_linea: almacenCodigoPrincipal,
                                            pcf_is_backorder: false,
                                            pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                            pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                            pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                            pcf_descuento_porcentual: productos[i].dataValues.totalDescuentoPorcentual
                                        }

                                        lineasArray.push(linea);

                                        stockDisponible = stockDisponible - cantidadDisponible
                                        inventarioFaltante = inventarioFaltante - cantidadDisponible
                                        stockPrimarioDisponible = false
                                    }
                                }
                                else
                                {
                                    stockPrimarioDisponible = false
                                }
                            }
                            else
                            {
                                //Obtener almacen de logistica
                                const constStockSecundario = await models.StockProducto.findOne(
                                {
                                    where: {
                                        sp_prod_producto_id: productos[i].dataValues.pcdc_prod_producto_id,
                                        sp_almacen_id: almacenCodigoSecundario
                                    }
                                })

                                var cantidadDisponible = constStockSecundario.sp_cantidad
                                //Si hay inventario intentara tomarlo para hacer la primer linea
                                if(cantidadDisponible > 0)
                                {
                                    //Surtir toda la linea de producto desde aqui
                                    if(inventarioFaltante < cantidadDisponible)
                                    {
                                        var linea = {
                                            pcf_cf_compra_finalizada_id: id_orden,
                                            pcf_prod_producto_id: productos[i].dataValues.pcdc_prod_producto_id,
                                            pcf_cantidad_producto: inventarioFaltante,
                                            pcf_descuento_producto: null,
                                            pcf_precio: (productos[i].dataValues.projectProduct 
                                                && (productos[i].dataValues.projectProductPrice < productos[i].dataValues.precioFinal ||  productos[i].dataValues.precioFinal===0) 
                                                ? productos[i].dataValues.projectProductPrice 
                                                : productos[i].dataValues.precioFinal),
                                            pcf_prod_producto_id_regalo: null,
                                            pcf_cantidad_producto_regalo: null,
                                            pcf_descuento_promocion: productos[i].dataValues.totalDescuento,
                                            pcf_prod_producto_id_promocion: null,
                                            pcf_cantidad_producto_promocion: null,
                                            pcf_cupon_aplicado: null,
                                            pcf_almacen_linea: almacenCodigoSecundario,
                                            pcf_is_backorder: false,
                                            pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                            pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                            pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                            pcf_descuento_porcentual: productos[i].dataValues.totalDescuentoPorcentual
                                        }

                                        lineasArray.push(linea);

                                        cantidadDisponible = 0
                                        inventarioFaltante = 0
                                        stockDisponible = 0
                                    }
                                    //Surtir parcial 
                                    else
                                    {
                                        var linea = {
                                            pcf_cf_compra_finalizada_id: id_orden,
                                            pcf_prod_producto_id: productos[i].dataValues.pcdc_prod_producto_id,
                                            pcf_cantidad_producto: cantidadDisponible,
                                            pcf_descuento_producto: null,
                                            pcf_precio: (productos[i].dataValues.projectProduct 
                                                && (productos[i].dataValues.projectProductPrice < productos[i].dataValues.precioFinal || productos[i].dataValues.precioFinal===0 ) 
                                                ? productos[i].dataValues.projectProductPrice 
                                                : productos[i].dataValues.precioFinal),
                                            pcf_prod_producto_id_regalo: null,
                                            pcf_cantidad_producto_regalo: null,
                                            pcf_descuento_promocion: productos[i].dataValues.totalDescuento,
                                            pcf_prod_producto_id_promocion: null,
                                            pcf_cantidad_producto_promocion: null,
                                            pcf_cupon_aplicado: null,
                                            pcf_almacen_linea: almacenCodigoSecundario,
                                            pcf_is_backorder: false,
                                            pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                            pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                            pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                            pcf_descuento_porcentual: productos[i].dataValues.totalDescuentoPorcentual
                                        }

                                        lineasArray.push(linea);

                                        stockDisponible = stockDisponible - cantidadDisponible
                                        inventarioFaltante = inventarioFaltante - cantidadDisponible
                                        stockSecundarioDisponible = false
                                    }
                                }
                                else
                                {
                                    stockSecundarioDisponible = false
                                }
                            }
                        }
                        //Backorder si aplica?
                        else if(aplicaBackOrder == true)
                        {
                            //default is false
                            var isOxen = await productosUtils.getIfIsOxenProduct(productos[i].dataValues.pcdc_prod_producto_id);

                            if(productos[i].dataValues.prod_tipo_precio_base != 'Precio de Lista')
                            {

                                const constProductoListaPrecio = await models.ProductoListaPrecio.findOne(
                                {
                                    where: {
                                        pl_prod_producto_id: productos[i].dataValues.pcdc_prod_producto_id,
                                        pl_listp_lista_de_precio_id: 1
                                    }
                                });

                                productos[i].dataValues.precioFinal = constProductoListaPrecio.pl_precio_producto

                            }

                            //Si no es oxen hara todo normal
                            if(isOxen == false)
                            {
                                var linea = {
                                    pcf_cf_compra_finalizada_id: id_orden,
                                    pcf_prod_producto_id: productos[i].dataValues.pcdc_prod_producto_id,
                                    pcf_cantidad_producto: inventarioFaltante,
                                    pcf_descuento_producto: null,
                                    pcf_precio: (productos[i].dataValues.projectProduct 
                                        && (productos[i].dataValues.projectProductPrice < productos[i].dataValues.precioFinal || productos[i].dataValues.precioFinal===0) 
                                        ? productos[i].dataValues.projectProductPrice 
                                        : productos[i].dataValues.precioFinal),
                                    pcf_prod_producto_id_regalo: null,
                                    pcf_cantidad_producto_regalo: null,
                                    pcf_descuento_promocion: productos[i].dataValues.totalDescuento,
                                    pcf_prod_producto_id_promocion: null,
                                    pcf_cantidad_producto_promocion: null,
                                    pcf_cupon_aplicado: null,
                                    pcf_almacen_linea: almacenCodigoPrincipal,
                                    pcf_is_backorder: true,
                                    pcf_dias_resurtimiento: productos[i].dataValues.prod_dias_resurtimiento,
                                    pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                    pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                    pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                    pcf_descuento_porcentual: productos[i].dataValues.totalDescuentoPorcentual
                                }
                            }
                            else
                            {
                                var linea = {
                                    pcf_cf_compra_finalizada_id: id_orden,
                                    pcf_prod_producto_id: productos[i].dataValues.pcdc_prod_producto_id,
                                    pcf_cantidad_producto: inventarioFaltante,
                                    pcf_descuento_producto: null,
                                    pcf_precio: (productos[i].dataValues.projectProduct 
                                        && (productos[i].dataValues.projectProductPrice < productos[i].dataValues.precioFinal || productos[i].dataValues.precioFinal ===0) 
                                        ? productos[i].dataValues.projectProductPrice 
                                        : productos[i].dataValues.precioFinal),
                                    pcf_prod_producto_id_regalo: null,
                                    pcf_cantidad_producto_regalo: null,
                                    pcf_descuento_promocion: productos[i].dataValues.totalDescuento,
                                    pcf_prod_producto_id_promocion: null,
                                    pcf_cantidad_producto_promocion: null,
                                    pcf_cupon_aplicado: null,
                                    pcf_almacen_linea: 1,
                                    pcf_is_backorder: true,
                                    pcf_dias_resurtimiento: productos[i].dataValues.prod_dias_resurtimiento,
                                    pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                    pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                    pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                    pcf_descuento_porcentual: productos[i].dataValues.totalDescuentoPorcentual
                                }


                            }

                            lineasArray.push(linea);
                            inventarioFaltante = 0



                        }

                        breaker++
                        if(breaker == 50)
                        {
                            break
                        } 
                    }
                }


            }
            //Si el tipo de envio es 17 es recoleccion
            else if(constControlMaestroMultiple.cmm_valor == "Recolección")
            {

                //Obtener almacen de logistica
                const constAlmacenes = await models.Almacenes.findOne(
                {
                    where: {
                        alm_almacen_id: checkoutJson.cdc_alm_almacen_recoleccion
                    }
                });



                //Se necesita para saber cuantos articulos
                if(constAlmacenes.alm_nombre == "Mexico")
                {
                    //Obtener almacen de logistica
                    const constAlmacenesSecundario = await models.Almacenes.findOne(
                    {
                        where: {
                            alm_nombre: "Monterrey"
                        }
                    });

                    almacenCodigoPrincipal = constAlmacenes.alm_almacen_id
                    almacenCodigoSecundario = constAlmacenesSecundario.alm_almacen_id
                }
                else
                {
                    //Obtener almacen de logistica
                    const constAlmacenesSecundario = await models.Almacenes.findOne(
                    {
                        where: {
                            alm_nombre: "Mexico"
                        }
                    });

                    almacenCodigoPrincipal = constAlmacenes.alm_almacen_id
                    almacenCodigoSecundario = constAlmacenesSecundario.alm_almacen_id
                }

                //Id de almacen
                console.log(constAlmacenes.alm_codigoAlmacen)

                //Obtener lineas
                for (var i = 0; i < productos.length; i++) 
                {
                    // if(productos[i].dataValues.prod_precio > 0
                    //     && productos[i].dataValues.producto.prod_volumen > 0
                    //     && productos[i].dataValues.producto.prod_peso > 0) {

                            
                    //         console.log('Resultado de arreglo global ____________________________________________________ ', lineasArray);
                    //     }
                    var aplicaBackOrder = productos[i].dataValues.aplicaBackOrder
                    var inventarioFaltante = productos[i].dataValues.pcdc_producto_cantidad

                    var breaker = 0;
                    var stockDisponible = productos[i].dataValues.prod_total_stock
                    var stockPrimarioDisponible = true
                    var stockSecundarioDisponible = true
                    // console.log('inventarioFaltante ----------------------> ', i, inventarioFaltante, stockDisponible);
    
                    while(inventarioFaltante > 0)
                    {
                        // console.log('esta es la iteracion de inventario faltante =============> ', inventarioFaltante);
                        //Stock disponible total 
                        if(stockDisponible > 0 && productos[i].dataValues.backOrderPrecioLista == false)
                        {

                            //Buscar primero en almacen primario
                            if(stockPrimarioDisponible == true)
                            {
                                //Obtener almacen de logistica
                                const constStockPrimario = await models.StockProducto.findOne(
                                {
                                    where: {
                                        sp_prod_producto_id: productos[i].dataValues.pcdc_prod_producto_id,
                                        sp_almacen_id: almacenCodigoPrincipal
                                    }
                                })

                                var cantidadDisponible = constStockPrimario.sp_cantidad
                                //Si hay inventario intentara tomarlo para hacer la primer linea
                                if(cantidadDisponible > 0)
                                {
                                    //Surtir toda la linea de producto desde aqui
                                    if(inventarioFaltante < cantidadDisponible)
                                    {
                                        var linea = {
                                            pcf_cf_compra_finalizada_id: id_orden,
                                            pcf_prod_producto_id: productos[i].dataValues.pcdc_prod_producto_id,
                                            pcf_cantidad_producto: inventarioFaltante,
                                            pcf_descuento_producto: null,
                                            pcf_precio: (productos[i].dataValues.projectProduct 
                                                && (productos[i].dataValues.projectProductPrice < productos[i].dataValues.precioFinal || productos[i].dataValues.precioFinal===0) 
                                                ? productos[i].dataValues.projectProductPrice 
                                                : productos[i].dataValues.precioFinal),
                                            pcf_prod_producto_id_regalo: null,
                                            pcf_cantidad_producto_regalo: null,
                                            pcf_descuento_promocion: productos[i].dataValues.totalDescuento,
                                            pcf_prod_producto_id_promocion: null,
                                            pcf_cantidad_producto_promocion: null,
                                            pcf_cupon_aplicado: null,
                                            pcf_almacen_linea: constAlmacenes.alm_codigoAlmacen,
                                            pcf_is_backorder: false,
                                            pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                            pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                            pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                            pcf_descuento_porcentual: productos[i].dataValues.totalDescuentoPorcentual
                                        }

                                        lineasArray.push(linea);

                                        cantidadDisponible = 0
                                        inventarioFaltante = 0
                                        stockDisponible = 0
                                    }
                                    //Surtir parcial 
                                    else
                                    {
                                        var linea = {
                                            pcf_cf_compra_finalizada_id: id_orden,
                                            pcf_prod_producto_id: productos[i].dataValues.pcdc_prod_producto_id,
                                            pcf_cantidad_producto: cantidadDisponible,
                                            pcf_descuento_producto: null,
                                            pcf_precio: (productos[i].dataValues.projectProduct 
                                                && (productos[i].dataValues.projectProductPrice < productos[i].dataValues.precioFinal || productos[i].dataValues.precioFinal===0) 
                                                ? productos[i].dataValues.projectProductPrice 
                                                : productos[i].dataValues.precioFinal),
                                            pcf_prod_producto_id_regalo: null,
                                            pcf_cantidad_producto_regalo: null,
                                            pcf_descuento_promocion: productos[i].dataValues.totalDescuento,
                                            pcf_prod_producto_id_promocion: null,
                                            pcf_cantidad_producto_promocion: null,
                                            pcf_cupon_aplicado: null,
                                            pcf_almacen_linea: constAlmacenes.alm_codigoAlmacen,
                                            pcf_is_backorder: false,
                                            pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                            pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                            pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                            pcf_descuento_porcentual: productos[i].dataValues.totalDescuentoPorcentual
                                        }

                                        lineasArray.push(linea);

                                        stockDisponible = stockDisponible - cantidadDisponible
                                        inventarioFaltante = inventarioFaltante - cantidadDisponible
                                        stockPrimarioDisponible = false
                                    }
                                }
                                else
                                {
                                    stockPrimarioDisponible = false
                                }
                            }
                            else
                            {
                                //Obtener almacen de logistica
                                const constStockSecundario = await models.StockProducto.findOne(
                                {
                                    where: {
                                        sp_prod_producto_id: productos[i].dataValues.pcdc_prod_producto_id,
                                        sp_almacen_id: almacenCodigoSecundario
                                    }
                                })

                                var cantidadDisponible = constStockSecundario.sp_cantidad
                                //Si hay inventario intentara tomarlo para hacer la primer linea
                                if(cantidadDisponible > 0)
                                {
                                    //Surtir toda la linea de producto desde aqui
                                    if(inventarioFaltante < cantidadDisponible)
                                    {
                                        var linea = {
                                            pcf_cf_compra_finalizada_id: id_orden,
                                            pcf_prod_producto_id: productos[i].dataValues.pcdc_prod_producto_id,
                                            pcf_cantidad_producto: inventarioFaltante,
                                            pcf_descuento_producto: null,
                                            pcf_precio: (productos[i].dataValues.projectProduct 
                                                && (productos[i].dataValues.projectProductPrice < productos[i].dataValues.precioFinal || productos[i].dataValues.precioFinal===0) 
                                                ? productos[i].dataValues.projectProductPrice 
                                                : productos[i].dataValues.precioFinal),
                                            pcf_prod_producto_id_regalo: null,
                                            pcf_cantidad_producto_regalo: null,
                                            pcf_descuento_promocion: productos[i].dataValues.totalDescuento,
                                            pcf_prod_producto_id_promocion: null,
                                            pcf_cantidad_producto_promocion: null,
                                            pcf_cupon_aplicado: null,
                                            pcf_almacen_linea: constAlmacenes.alm_codigoAlmacen,
                                            pcf_recoleccion_resurtimiento: true,
                                            pcf_is_backorder: false,
                                            pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                            pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                            pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                            pcf_descuento_porcentual: productos[i].dataValues.totalDescuentoPorcentual
                                        }

                                        lineasArray.push(linea);

                                        cantidadDisponible = 0
                                        inventarioFaltante = 0
                                        stockDisponible = 0
                                    }
                                    //Surtir parcial 
                                    else
                                    {
                                        var linea = {
                                            pcf_cf_compra_finalizada_id: id_orden,
                                            pcf_prod_producto_id: productos[i].dataValues.pcdc_prod_producto_id,
                                            pcf_cantidad_producto: cantidadDisponible,
                                            pcf_descuento_producto: null,
                                            pcf_precio: (productos[i].dataValues.projectProduct 
                                                && (productos[i].dataValues.projectProductPrice < productos[i].dataValues.precioFinal || productos[i].dataValues.precioFinal===0) 
                                                ? productos[i].dataValues.projectProductPrice 
                                                : productos[i].dataValues.precioFinal),
                                            pcf_prod_producto_id_regalo: null,
                                            pcf_cantidad_producto_regalo: null,
                                            pcf_descuento_promocion: productos[i].dataValues.totalDescuento,
                                            pcf_prod_producto_id_promocion: null,
                                            pcf_cantidad_producto_promocion: null,
                                            pcf_cupon_aplicado: null,
                                            pcf_almacen_linea: constAlmacenes.alm_codigoAlmacen,
                                            pcf_recoleccion_resurtimiento: true,
                                            pcf_is_backorder: false,
                                            pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                            pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                            pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                            pcf_descuento_porcentual: productos[i].dataValues.totalDescuentoPorcentual
                                        }

                                        lineasArray.push(linea);

                                        stockDisponible = stockDisponible - cantidadDisponible
                                        inventarioFaltante = inventarioFaltante - cantidadDisponible
                                        stockSecundarioDisponible = false
                                    }
                                }
                                else
                                {
                                    stockSecundarioDisponible = false
                                }
                            }
                        }
                        //Backorder si aplica?
                        else if(aplicaBackOrder == true)
                        {

                            if(productos[i].dataValues.prod_tipo_precio_base != 'Precio de Lista')
                            {

                                const constProductoListaPrecio = await models.ProductoListaPrecio.findOne(
                                {
                                    where: {
                                        pl_prod_producto_id: productos[i].dataValues.pcdc_prod_producto_id,
                                        pl_listp_lista_de_precio_id: 1
                                    }
                                });

                                productos[i].dataValues.precioFinal = constProductoListaPrecio.pl_precio_producto
                            }

                            var linea = {
                                pcf_cf_compra_finalizada_id: id_orden,
                                pcf_prod_producto_id: productos[i].dataValues.pcdc_prod_producto_id,
                                pcf_cantidad_producto: inventarioFaltante,
                                pcf_descuento_producto: null,
                                pcf_precio: (productos[i].dataValues.projectProduct 
                                    && (productos[i].dataValues.projectProductPrice < productos[i].dataValues.precioFinal || productos[i].dataValues.precioFinal===0) 
                                    ? productos[i].dataValues.projectProductPrice 
                                    : productos[i].dataValues.precioFinal),
                                pcf_prod_producto_id_regalo: null,
                                pcf_cantidad_producto_regalo: null,
                                pcf_descuento_promocion: productos[i].dataValues.totalDescuento,
                                pcf_prod_producto_id_promocion: null,
                                pcf_cantidad_producto_promocion: null,
                                pcf_cupon_aplicado: null,
                                pcf_almacen_linea: constAlmacenes.alm_codigoAlmacen,
                                pcf_is_backorder: true,
                                pcf_dias_resurtimiento: productos[i].dataValues.prod_dias_resurtimiento,
                                pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                pcf_descuento_porcentual: productos[i].dataValues.totalDescuentoPorcentual
                            }

                            lineasArray.push(linea);
                            inventarioFaltante = 0
                        }

                        breaker++
                        if(breaker == 50)
                        {
                            break
                        } 
                    }
                }
            }

            return lineasArray
        }
        catch(e){
            return "No fue posible regresar las lineas de productos para dividir la orden en almacenes"
        }
    },
    validarLineasIfDividirOrdenUSDExchage: async function (lineas, lineasProducts = null,tipoCambio= null) {
        try{
            //Variable que se regresara al final
            var validarReturn = false

            var lineasArrayFinal = []
            var lineasArrayPrincipal = [];
            var lineasArraySecundaria = [];

            //Obtener lineas
            for (var i = 0; i < lineas.length; i++) 
            {
                //SQL que devuelve el id de la lista de precios que tenga el producto
                var sql =  
                `
                    select 
                        p.prod_producto_id,
                        ldp.listp_lista_de_precio_id
                    from
                        productos p 
                        left join listas_de_precios ldp on p.prod_tipo_precio_base = ldp.listp_nombre 
                    where 
                        p.prod_producto_id = `+lineas[i].pcf_prod_producto_id+`
                `;

                var sqlResult = await sequelize.query(sql,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });

                const constProductoListaPrecio = await models.ProductoListaPrecio.findOne(
                {
                    where: { 
                        pl_prod_producto_id: sqlResult[0].prod_producto_id,
                        pl_listp_lista_de_precio_id: sqlResult[0].listp_lista_de_precio_id
                    }
                })
                if(lineasProducts!= null){

                    if (constProductoListaPrecio.pl_tipo_moneda ==="USD" && 
                     lineasProducts.moneda ==="USD"
                    ){ 
                        let prec = Number(constProductoListaPrecio.pl_precio_usd/tipoCambio)
                        if (lineasProducts.precio < prec||  constProductoListaPrecio.pl_precio_usd ===0){
                            constProductoListaPrecio.pl_precio_usd = lineasProducts.precio;
                            constProductoListaPrecio.pl_tipo_moneda ="USD"
                        }else{
                            constProductoListaPrecio.pl_precio_usd =  constProductoListaPrecio.pl_precio_usd
                            constProductoListaPrecio.pl_tipo_moneda="USD"
                        }
                    }else if(constProductoListaPrecio.pl_tipo_moneda === null && 
                    lineasProducts.moneda ==="USD"){
                        constProductoListaPrecio.pl_precio_usd = lineasProducts.precio;
                        constProductoListaPrecio.pl_tipo_moneda="USD"
                    }else{
                        if (lineasProducts.precio <  constProductoListaPrecio.pl_precio_producto ||  constProductoListaPrecio.pl_precio_producto ===0){
                            constProductoListaPrecio.pl_precio_producto = lineasProducts.precio;
                            constProductoListaPrecio.pl_tipo_moneda="MXN"
                        }else{
                            constProductoListaPrecio.pl_precio_producto =  constProductoListaPrecio.pl_precio_producto
                            constProductoListaPrecio.pl_tipo_moneda="MXN"
                        }
                    }

                //constProductoListaPrecio.pl_tipo_moneda ==  () ?   lineasProducts.moneda
                //constProductoListaPrecio.pl_precio_usd == lineas.precio

                }

                if(constProductoListaPrecio.pl_tipo_moneda == 'USD' )
                {
                    lineasArraySecundaria.push(lineas[i])
                }
                else
                {
                    lineasArrayPrincipal.push(lineas[i])
                }
            } 

            // console.log(lineasArrayPrincipal)
            // console.log(lineasArraySecundaria)


            lineasArrayFinal = 
            [
                {
                    "principal": lineasArrayPrincipal,
                    "secundario": {}
                },
                {
                    "principal": {},
                    "secundario": lineasArraySecundaria
                }
            ]

            // lineasArrayFinal.push(lineasArrayPrincipal)

            // if(lineasArraySecundaria.length > 0)
            // {
            //     lineasArrayFinal.push(lineasArraySecundaria)
            // }

            return lineasArrayFinal
        }
        catch(e){
            return e
        }
    },
    validarStockCarrito: async function (constProductoCarritoDeCompra) {
        try{
            //Variable que se regresara al final
            var validarReturn = true

            //Obtener lineas
            for (var i = 0; i < constProductoCarritoDeCompra.length; i++) 
            {

                //Obtener almacen asignado al cliente (primario)
                const constProducto = await models.Producto.findOne(
                {
                    where: {
                        prod_producto_id: constProductoCarritoDeCompra[i].dataValues.pcdc_prod_producto_id
                    },
                    attributes: ["prod_total_stock", "prod_dias_resurtimiento"]
                })
                var aplicaBackOrder = false

                //Si aplica backorder bool
                if(constProducto.prod_dias_resurtimiento > 0)
                {
                    aplicaBackOrder = true
                }

                // validacion que se dara cuenta si no hay stock
                if(constProductoCarritoDeCompra[i].dataValues.pcdc_producto_cantidad > constProducto.prod_total_stock && aplicaBackOrder == false)
                {
                    validarReturn = false
                }
            }

            return validarReturn
        }
        catch(e){
            return false
        }
    },
    getPriceProductInProject: async function(socio_de_negocio_id, producto) {

        const { cmm_valor: USDValor } = await models.ControlMaestroMultiple.findOne(
        {
            where: {
                cmm_nombre: "TIPO_CAMBIO_USD"
            },
            attributes: ["cmm_valor"]
        });
        
        const data = await sequelize.query(`
            SELECT lpro.*, pro.moneda, pro."idProyecto" FROM socios_negocio AS sn
            INNER JOIN proyectos AS pro ON pro."codigoCliente" = sn.sn_cardcode
            INNER JOIN lineas_proyectos AS lpro ON lpro."idProyecto" = pro."id"
            WHERE sn.sn_socios_negocio_id = '${socio_de_negocio_id}'
            AND lpro."codigoArticulo" = '${producto.producto.dataValues.prod_sku}'
            AND pro.estatus in ('Autorizado','Aprobado') AND CURRENT_DATE < "date"(pro."fechaVencimiento")`,
        {
            type: sequelize.QueryTypes.SELECT 
        });

        let newData = null;
        if(data[0]) {
            newData = {
                ...data[0],
                precio: data[0].moneda === 'MXP'
                    ? Number(data[0].precio)
                    : Number(data[0].precio)  * USDValor,
                precioUSD: data[0].moneda === 'USD' 
                    ? Number(data[0].precio)
                    : Number(data[0].precio) / USDValor,

            };
        }

        return newData;
    },
    getCheckoutResumenDetalle: async function (cdc_sn_socio_de_negocio_id) {
        try{
            var checkoutJson = await this.getCheckoutAPI(cdc_sn_socio_de_negocio_id);

            checkoutJson.dataValues.cdc_forma_pago_codigo
            
            var jsonMXN = []
            var jsonUSD = []


            //Obtener tipo de cambio
            const constTipoCambio = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_nombre: "TIPO_CAMBIO_USD"
                },
                attributes: ["cmm_valor"]
            })
            var USDValor = constTipoCambio.cmm_valor


            var precioTotal = 0
            var totalDescuentos = 0
            var precioFinalTotal = 0
            var cdc_costo_envio = 0
            var TotalImpuesto = 0
            var TotalFinal = 0


            var precioTotal_usd = 0
            var totalDescuentos_usd = 0
            var precioFinalTotal_usd = 0
            var cdc_costo_envio_usd = 0
            var TotalImpuesto_usd = 0
            var TotalFinal_usd = 0

            var precioTotalTemp

            const lengthData = checkoutJson.dataValues.productos.length;
            for (var i = 0; i < lengthData; i++) 
            {

                if((checkoutJson.dataValues.productos[i].dataValues.prod_total_stock > 0
                    || checkoutJson.dataValues.productos[i].dataValues.aplicaBackOrder === true)
                    // && checkoutJson.dataValues.productos[i].dataValues.prod_precio > 0
                    && checkoutJson.dataValues.productos[i].dataValues.producto.prod_peso > 0
                    && checkoutJson.dataValues.productos[i].dataValues.producto.prod_volumen > 0
                )
                {
                    let projectProduct = await this.getPriceProductInProject(cdc_sn_socio_de_negocio_id, checkoutJson.dataValues.productos[i].dataValues);

                    let totalCantidadProducto = 
                        (checkoutJson.dataValues.productos[i].dataValues.pcdc_producto_cantidad > checkoutJson.dataValues.productos[i].dataValues.prod_total_stock
                        && checkoutJson.dataValues.productos[i].dataValues.aplicaBackOrder === false)
                        ? checkoutJson.dataValues.productos[i].dataValues.prod_total_stock
                        : checkoutJson.dataValues.productos[i].dataValues.pcdc_producto_cantidad;

                    let precioFinalProduct = checkoutJson.dataValues.productos[i].dataValues.precioBaseFinal;
                    let discountAmount = checkoutJson.dataValues.productos[i].dataValues.totalDescuento;

                    if(projectProduct) {
                        if(projectProduct.precio < 
                            (checkoutJson.dataValues.productos[i].dataValues.precioBaseFinal - checkoutJson.dataValues.productos[i].dataValues.totalDescuento)
                        || checkoutJson.dataValues.productos[i].dataValues.precioBaseFinal == 0) {
                            precioFinalProduct = projectProduct.precio
                            discountAmount = 0;
                        }
                    }
                    if(checkoutJson.dataValues.cdc_forma_pago_codigo == 99)
                    {
                        // if(prod_tipo_cambio_base)
                        if(checkoutJson.dataValues.productos[i].dataValues.prod_tipo_cambio_base == "USD")
                        {
    
                            //Variable que saca el total subtotal (cantidad x precio base)
                            precioTotalTemp = (totalCantidadProducto * precioFinalProduct)/USDValor
                            precioTotal_usd += precioTotalTemp
    
                            //Calculara el total de descuentos
                            totalDescuentos_usd += ((totalCantidadProducto * discountAmount)/USDValor)
    
                            let precioTotalTemp1 = totalCantidadProducto * precioFinalProduct;
                            precioTotal += precioTotalTemp1;
                            totalDescuentos += totalCantidadProducto * discountAmount;
                        }
                        else
                        {
                            let precioTotalTemp1 = (totalCantidadProducto * precioFinalProduct)/USDValor;
                            precioTotal_usd += precioTotalTemp1;
                            totalDescuentos_usd += (totalCantidadProducto * discountAmount)/USDValor;
    
                            //Variable que saca el total subtotal (cantidad x precio base)
                            precioTotalTemp = totalCantidadProducto * precioFinalProduct;
                            precioTotal += precioTotalTemp
    
                            //Calculara el total de descuentos
                            totalDescuentos += totalCantidadProducto * discountAmount
                        }
    
                    }
                    else
                    {
                        // Conversión peso a dolar
                        precioTotal_usd += (totalCantidadProducto * precioFinalProduct)/USDValor;
                        totalDescuentos_usd += (totalCantidadProducto * precioFinalProduct/USDValor);
    
                        //Variable que saca el total subtotal (cantidad x precio base)
                        precioTotalTemp = totalCantidadProducto * precioFinalProduct;
                        precioTotal += precioTotalTemp;
                        
    
                        //Calculara el total de descuentos
                        totalDescuentos += totalCantidadProducto * discountAmount;
                    }
                }
            }


            precioFinalTotal_usd += precioTotal_usd-totalDescuentos_usd
            var cantidadImpuesto
            if(checkoutJson.dataValues.tipoImpuesto == "16%")
            {
                cantidadImpuesto = 16/100
            }   
            else
            {
                cantidadImpuesto = 8/100
            }

            console.log(cantidadImpuesto)

            TotalImpuesto_usd = parseFloat(((precioFinalTotal_usd)*cantidadImpuesto).toFixed(2))
            TotalFinal_usd = parseFloat((precioFinalTotal_usd+TotalImpuesto_usd).toFixed(2))


            var jsonArrayUSD = {
                "precioTotal_usd": precioTotal_usd,
                "totalDescuentos_usd": totalDescuentos_usd,
                "precioFinalTotal_usd": precioFinalTotal_usd,
                "cdc_costo_envio_usd": cdc_costo_envio_usd,
                "TotalImpuesto_usd": TotalImpuesto_usd,
                "TotalFinal_usd": TotalFinal_usd
            }







            precioFinalTotal = precioTotal-totalDescuentos

            if(checkoutJson.dataValues.cdc_forma_pago_codigo == "04" || checkoutJson.dataValues.cdc_forma_pago_codigo == "28")
            {
                precioFinalTotal = parseFloat((precioFinalTotal*1.03).toFixed(2))
            }

            
            cdc_costo_envio = checkoutJson.dataValues.cdc_costo_envio

            TotalImpuesto = parseFloat(((precioFinalTotal+cdc_costo_envio)*cantidadImpuesto).toFixed(2))

            TotalFinal = parseFloat(((precioFinalTotal+cdc_costo_envio)+TotalImpuesto).toFixed(2))

            // if(checkoutJson.dataValues.cdc_forma_pago_codigo == "04" || checkoutJson.dataValues.cdc_forma_pago_codigo == "28")
            // {
            //     precioTotal = parseFloat((precioTotal*1.03).toFixed(2))
            //     totalDescuentos = parseFloat((totalDescuentos*1.03).toFixed(2))
            //     precioFinalTotal = parseFloat((precioFinalTotal*1.03).toFixed(2))
            //     TotalImpuesto = parseFloat((TotalImpuesto*1.03).toFixed(2))
            //     TotalFinal = parseFloat((TotalFinal*1.03).toFixed(2))
            // }




            var jsonArray = {
                "precioTotal": precioTotal,
                "totalDescuentos": totalDescuentos,
                "precioFinalTotal": precioFinalTotal,
                "cdc_costo_envio": cdc_costo_envio,
                "TotalImpuesto": TotalImpuesto,
                "TotalFinal": TotalFinal
            }


            var jsonFinal = []
            jsonFinal.push(jsonArrayUSD)
            jsonFinal.push(jsonArray)


            return jsonFinal
        }
        catch(e){
            console.log(e)
            return "No fue posible obtener el resumen"
        }
    },






    removerLineasCantidadCeroDeStockInactivo: async function (constProductoCarritoDeCompra) {
        try{
            //Obtener lineas
            for (var i = 0; i < constProductoCarritoDeCompra.length; i++) 
            {
                if(constProductoCarritoDeCompra[i].dataValues.pcdc_producto_cantidad == 0)
                {
                    constProductoCarritoDeCompra.splice(i, 1); // Tim is now removed from "users"
                }
            }

            return constProductoCarritoDeCompra
        }
        catch(e){
            return false
        }
    },
    



    //COTIZACIONES UTILS
    //Se usara para obtener las lineas de cotizaciones al crear cotizacion
    cotizacionesLineasProductosFechasEntregas: async function (productoArray, tipoEnvio, direccionID, almacenID, isProspecto) {
        try{
            var productos = productoArray
            var almacenCodigoPrincipal
            var almacenCodigoSecundario

            var lineasArray = [];

            //obtener tipo impuesto cmm
            const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_control_id: tipoEnvio
                }
            })

            //Envio a domicilio si el ID es 16 de tipo envio
            if(constControlMaestroMultiple.cmm_valor == "Envío domicilio")
            {
                var constDireccion

                if(isProspecto == true)
                {
                    //Obtener almacen asignado al cliente (primario)
                    const constUsuariosProspectosDirecciones = await models.UsuariosProspectosDirecciones.findOne(
                    {
                        where: {
                            upd_direcciones_id: direccionID
                        }
                    });

                    constDireccion = constUsuariosProspectosDirecciones
                }
                else
                {
                    //Obtener almacen asignado al cliente (primario)
                    const constSociosNegocioDirecciones = await models.SociosNegocioDirecciones.findOne(
                    {
                        where: {
                            snd_direcciones_id: direccionID
                        }
                    });

                    constDireccion = constSociosNegocioDirecciones
                }

                





                if(constDireccion)
                {
                    var constEstado2 
                    if(isProspecto == true)
                    {
                        //Obtener Estado Nombre
                        constEstado2 = await models.Estado.findOne(
                        {
                            where: {
                                estpa_estado_pais_id: constDireccion.upd_estado_id
                            }
                        });
                    }
                    else
                    {
                        //Obtener Estado Nombre
                        constEstado2 = await models.Estado.findOne(
                        {
                            where: {
                                estpa_estado_pais_id: constDireccion.snd_estado_id
                            }
                        });
                    }

                    var estadoValor2 = constEstado2.dataValues.estpa_estado_nombre

                    //Obtener almacen de logistica
                    const AlmacenesLogistica = await models.AlmacenesLogistica.findOne(
                    {
                        where: {
                            almlog_estpa_estado_pais_nombre: estadoValor2
                        }
                    });

                    //Obtener almacen de logistica
                    const constAlmacenes = await models.Almacenes.findOne(
                    {
                        where: {
                            alm_codigoAlmacen: AlmacenesLogistica.almlog_almacen_codigo
                        }
                    });
             
                    if(constAlmacenes.alm_nombre == "Mexico")
                    {
                        //Obtener almacen de logistica
                        const constAlmacenesSecundario = await models.Almacenes.findOne(
                        {
                            where: {
                                alm_nombre: "Monterrey"
                            }
                        });

                        almacenCodigoPrincipal = constAlmacenes.alm_almacen_id
                        almacenCodigoSecundario = constAlmacenesSecundario.alm_almacen_id
                    }
                    else
                    {
                        //Obtener almacen de logistica
                        const constAlmacenesSecundario = await models.Almacenes.findOne(
                        {
                            where: {
                                alm_nombre: "Mexico"
                            }
                        });

                        almacenCodigoPrincipal = constAlmacenes.alm_almacen_id
                        almacenCodigoSecundario = constAlmacenesSecundario.alm_almacen_id
                    }
                }



                //Obtener lineas
                for (var i = 0; i < 1; i++) 
                {
                    //Agregar aplica backorder bool
                    var aplicaBackOrder
                    if(productos.dataValues.prod_dias_resurtimiento != '0')
                    {
                        aplicaBackOrder = true
                    }
                    else
                    {
                        aplicaBackOrder = false
                    }
                    var inventarioFaltante = productos.dataValues.cantidad

                    var breaker = 0;
                    var stockDisponible = productos.dataValues.prod_total_stock
                    var stockPrimarioDisponible = true
                    var stockSecundarioDisponible = true

                    while(inventarioFaltante > 0)
                    {
                        //Stock disponible total 
                        if(stockDisponible > 0)
                        {

                            //Buscar primero en almacen primario
                            if(stockPrimarioDisponible == true)
                            {
                                //Obtener almacen de logistica
                                const constStockPrimario = await models.StockProducto.findOne(
                                {
                                    where: {
                                        sp_prod_producto_id: productos.dataValues.prod_producto_id,
                                        sp_almacen_id: almacenCodigoPrincipal
                                    }
                                })

                                var cantidadDisponible = constStockPrimario.sp_cantidad
                                //Si hay inventario intentara tomarlo para hacer la primer linea
                                if(cantidadDisponible > 0)
                                {
                                    //Surtir toda la linea de producto desde aqui
                                    if(inventarioFaltante < cantidadDisponible)
                                    {
                                        var linea = {
                                            pcf_prod_producto_id: productos.dataValues.prod_producto_id,
                                            pcf_cantidad_producto: inventarioFaltante,
                                            pcf_almacen_linea: almacenCodigoPrincipal,
                                            pcf_is_backorder: false
                                        }

                                        lineasArray.push(linea);

                                        cantidadDisponible = 0
                                        inventarioFaltante = 0
                                        stockDisponible = 0
                                    }
                                    //Surtir parcial 
                                    else
                                    {
                                        var linea = {
                                            pcf_prod_producto_id: productos.dataValues.prod_producto_id,
                                            pcf_cantidad_producto: cantidadDisponible,
                                            pcf_almacen_linea: almacenCodigoPrincipal,
                                            pcf_is_backorder: false
                                        }

                                        lineasArray.push(linea);

                                        stockDisponible = stockDisponible - cantidadDisponible
                                        inventarioFaltante = inventarioFaltante - cantidadDisponible
                                        stockPrimarioDisponible = false
                                    }
                                }
                                else
                                {
                                    stockPrimarioDisponible = false
                                }
                            }
                            else
                            {
                                //Obtener almacen de logistica
                                const constStockSecundario = await models.StockProducto.findOne(
                                {
                                    where: {
                                        sp_prod_producto_id: productos.dataValues.prod_producto_id,
                                        sp_almacen_id: almacenCodigoSecundario
                                    }
                                })

                                var cantidadDisponible = constStockSecundario.sp_cantidad
                                //Si hay inventario intentara tomarlo para hacer la primer linea
                                if(cantidadDisponible > 0)
                                {
                                    //Surtir toda la linea de producto desde aqui
                                    if(inventarioFaltante < cantidadDisponible)
                                    {
                                        var linea = {
                                            pcf_prod_producto_id: productos.dataValues.prod_producto_id,
                                            pcf_cantidad_producto: inventarioFaltante,
                                            pcf_almacen_linea: almacenCodigoSecundario,
                                            pcf_is_backorder: false
                                        }

                                        lineasArray.push(linea);

                                        cantidadDisponible = 0
                                        inventarioFaltante = 0
                                        stockDisponible = 0
                                    }
                                    //Surtir parcial 
                                    else
                                    {
                                        var linea = {
                                            pcf_prod_producto_id: productos.dataValues.prod_producto_id,
                                            pcf_cantidad_producto: cantidadDisponible,
                                            pcf_almacen_linea: almacenCodigoSecundario,
                                            pcf_is_backorder: false
                                        }

                                        lineasArray.push(linea);

                                        stockDisponible = stockDisponible - cantidadDisponible
                                        inventarioFaltante = inventarioFaltante - cantidadDisponible
                                        stockSecundarioDisponible = false
                                    }
                                }
                                else
                                {
                                    stockSecundarioDisponible = false
                                }
                            }
                        }
                        //Backorder si aplica?
                        else if(aplicaBackOrder == true)
                        {
                            //default is false
                            var isOxen = await productosUtils.getIfIsOxenProduct(productos.dataValues.prod_producto_id);

                            //Si no es oxen hara todo normal
                            if(isOxen == false)
                            {

                                var linea = {
                                    pcf_prod_producto_id: productos.dataValues.prod_producto_id,
                                    pcf_cantidad_producto: inventarioFaltante,
                                    pcf_almacen_linea: almacenCodigoPrincipal,
                                    pcf_is_backorder: true,
                                    pcf_dias_resurtimiento: productos.dataValues.prod_dias_resurtimiento
                                }
                            }
                            else
                            {
                                var linea = {
                                    pcf_prod_producto_id: productos.dataValues.prod_producto_id,
                                    pcf_cantidad_producto: inventarioFaltante,
                                    pcf_almacen_linea: 1,
                                    pcf_is_backorder: true,
                                    pcf_dias_resurtimiento: productos.dataValues.prod_dias_resurtimiento
                                }
                            }

                            lineasArray.push(linea);
                            inventarioFaltante = 0
                        }

                        breaker++
                        if(breaker == 50)
                        {
                            break
                        } 
                    }
                }
            }
            //Si el tipo de envio es 17 es recoleccion
            else if(constControlMaestroMultiple.cmm_valor == "Recolección")
            {
                //Obtener almacen de logistica
                const constAlmacenes = await models.Almacenes.findOne(
                {
                    where: {
                        alm_almacen_id: almacenID
                    }
                });

                //Se necesita para saber cuantos articulos
                if(constAlmacenes.alm_nombre == "Mexico")
                {
                    //Obtener almacen de logistica
                    const constAlmacenesSecundario = await models.Almacenes.findOne(
                    {
                        where: {
                            alm_nombre: "Monterrey"
                        }
                    });

                    almacenCodigoPrincipal = constAlmacenes.alm_almacen_id
                    almacenCodigoSecundario = constAlmacenesSecundario.alm_almacen_id
                }
                else
                {
                    //Obtener almacen de logistica
                    const constAlmacenesSecundario = await models.Almacenes.findOne(
                    {
                        where: {
                            alm_nombre: "Mexico"
                        }
                    });

                    almacenCodigoPrincipal = constAlmacenes.alm_almacen_id
                    almacenCodigoSecundario = constAlmacenesSecundario.alm_almacen_id
                }

                //Obtener lineas
                for (var i = 0; i < 1; i++) 
                {
                    var aplicaBackOrder
                    if(productos.dataValues.prod_dias_resurtimiento != '0')
                    {
                        aplicaBackOrder = true
                    }
                    else
                    {
                        aplicaBackOrder = false
                    }
                    var inventarioFaltante = productos.dataValues.cantidad

                    var breaker = 0;
                    var stockDisponible = productos.dataValues.prod_total_stock
                    var stockPrimarioDisponible = true
                    var stockSecundarioDisponible = true

                    while(inventarioFaltante > 0)
                    {
                        //Stock disponible total 
                        if(stockDisponible > 0)
                        {
                            //Buscar primero en almacen primario
                            if(stockPrimarioDisponible == true)
                            {
                                //Obtener almacen de logistica
                                const constStockPrimario = await models.StockProducto.findOne(
                                {
                                    where: {
                                        sp_prod_producto_id: productos.dataValues.prod_producto_id,
                                        sp_almacen_id: almacenCodigoPrincipal
                                    }
                                })

                                var cantidadDisponible = constStockPrimario.sp_cantidad
                                //Si hay inventario intentara tomarlo para hacer la primer linea
                                if(cantidadDisponible > 0)
                                {
                                    //Surtir toda la linea de producto desde aqui
                                    if(inventarioFaltante < cantidadDisponible)
                                    {
                                        var linea = {
                                            pcf_prod_producto_id: productos.dataValues.prod_producto_id,
                                            pcf_cantidad_producto: inventarioFaltante,
                                            pcf_almacen_linea: constAlmacenes.alm_codigoAlmacen,
                                            pcf_is_backorder: false
                                        }

                                        lineasArray.push(linea);

                                        cantidadDisponible = 0
                                        inventarioFaltante = 0
                                        stockDisponible = 0
                                    }
                                    //Surtir parcial 
                                    else
                                    {
                                        var linea = {
                                            pcf_prod_producto_id: productos.dataValues.prod_producto_id,
                                            pcf_cantidad_producto: cantidadDisponible,
                                            pcf_almacen_linea: constAlmacenes.alm_codigoAlmacen,
                                            pcf_is_backorder: false
                                        }

                                        lineasArray.push(linea);

                                        stockDisponible = stockDisponible - cantidadDisponible
                                        inventarioFaltante = inventarioFaltante - cantidadDisponible
                                        stockPrimarioDisponible = false
                                    }
                                }
                                else
                                {
                                    stockPrimarioDisponible = false
                                }
                            }
                            else
                            {
                                //Obtener almacen de logistica
                                const constStockSecundario = await models.StockProducto.findOne(
                                {
                                    where: {
                                        sp_prod_producto_id: productos.dataValues.prod_producto_id,
                                        sp_almacen_id: almacenCodigoSecundario
                                    }
                                })

                                var cantidadDisponible = constStockSecundario.sp_cantidad
                                //Si hay inventario intentara tomarlo para hacer la primer linea
                                if(cantidadDisponible > 0)
                                {
                                    //Surtir toda la linea de producto desde aqui
                                    if(inventarioFaltante < cantidadDisponible)
                                    {
                                        var linea = {
                                            pcf_prod_producto_id: productos.dataValues.prod_producto_id,
                                            pcf_cantidad_producto: inventarioFaltante,
                                            pcf_almacen_linea: constAlmacenes.alm_codigoAlmacen,
                                            pcf_recoleccion_resurtimiento: true,
                                            pcf_is_backorder: false
                                        }

                                        lineasArray.push(linea);

                                        cantidadDisponible = 0
                                        inventarioFaltante = 0
                                        stockDisponible = 0
                                    }
                                    //Surtir parcial 
                                    else
                                    {
                                        var linea = {
                                            pcf_prod_producto_id: productos.dataValues.prod_producto_id,
                                            pcf_cantidad_producto: cantidadDisponible,
                                            pcf_almacen_linea: constAlmacenes.alm_codigoAlmacen,
                                            pcf_recoleccion_resurtimiento: true,
                                            pcf_is_backorder: false
                                        }

                                        lineasArray.push(linea);

                                        stockDisponible = stockDisponible - cantidadDisponible
                                        inventarioFaltante = inventarioFaltante - cantidadDisponible
                                        stockSecundarioDisponible = false
                                    }
                                }
                                else
                                {
                                    stockSecundarioDisponible = false
                                }
                            }
                        }
                        //Backorder si aplica?
                        else if(aplicaBackOrder == true)
                        {
                            var linea = {
                                pcf_prod_producto_id: productos.dataValues.prod_producto_id,
                                pcf_cantidad_producto: inventarioFaltante,
                                pcf_almacen_linea: constAlmacenes.alm_codigoAlmacen,
                                pcf_is_backorder: true,
                                pcf_dias_resurtimiento: productos.dataValues.prod_dias_resurtimiento
                            }

                            lineasArray.push(linea);
                            inventarioFaltante = 0
                        }

                        breaker++
                        if(breaker == 50)
                        {
                            break
                        } 
                    }
                }
            }

            return lineasArray
        }
        catch(e){
            console.log(e)
            return "No fue posible regresar las lineas de productos para dividir la orden en almacenes"
        }
    },





    //PASO COT 3
    // getCotizacionLineasProductosComprasFinalizadas: async function (checkoutJson, id_orden) {
    getCotizacionLineasProductosDividirSIyHAEtoPrecioLista: async function (isProspecto, SnProsID, tipoEnvio, direccionEnvioID, almacenID, fleteraID, productos) {
        try{
            var almacenCodigoPrincipal
            var almacenCodigoSecundario

            var lineasArray = [];

            //obtener tipo impuesto cmm
            const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_control_id: tipoEnvio
                }
            })

            //Envio a domicilio si el ID es 16 de tipo envio
            if(constControlMaestroMultiple.cmm_valor == "Envío domicilio")
            {
                //Obtener almacenes principal y secundario dependiendo de si es SN o Prospecto
                    if(isProspecto == false)
                    {
                        //Obtener almacen asignado al cliente (primario)
                        const constSociosNegocioDirecciones = await models.SociosNegocioDirecciones.findOne(
                        {
                            where: {
                                snd_direcciones_id: direccionEnvioID
                            }
                        });

                        if(constSociosNegocioDirecciones)
                        {
                            //Obtener Estado Nombre
                            const constEstado2 = await models.Estado.findOne(
                            {
                                where: {
                                    estpa_estado_pais_id: constSociosNegocioDirecciones.snd_estado_id
                                }
                            });
                            var estadoValor2 = constEstado2.dataValues.estpa_estado_nombre

                            //Obtener almacen de logistica
                            const AlmacenesLogistica = await models.AlmacenesLogistica.findOne(
                            {
                                where: {
                                    almlog_estpa_estado_pais_nombre: estadoValor2
                                }
                            });

                            //Obtener almacen de logistica
                            const constAlmacenes = await models.Almacenes.findOne(
                            {
                                where: {
                                    alm_codigoAlmacen: AlmacenesLogistica.almlog_almacen_codigo
                                }
                            });
                     
                            if(constAlmacenes.alm_nombre == "Mexico")
                            {
                                //Obtener almacen de logistica
                                const constAlmacenesSecundario = await models.Almacenes.findOne(
                                {
                                    where: {
                                        alm_nombre: "Monterrey"
                                    }
                                });

                                almacenCodigoPrincipal = constAlmacenes.alm_almacen_id
                                almacenCodigoSecundario = constAlmacenesSecundario.alm_almacen_id
                            }
                            else
                            {
                                //Obtener almacen de logistica
                                const constAlmacenesSecundario = await models.Almacenes.findOne(
                                {
                                    where: {
                                        alm_nombre: "Mexico"
                                    }
                                });

                                almacenCodigoPrincipal = constAlmacenes.alm_almacen_id
                                almacenCodigoSecundario = constAlmacenesSecundario.alm_almacen_id
                            }
                        }
                    }
                    else
                    {
                        //Obtener almacen asignado al cliente (primario)
                        const constUsuariosProspectosDirecciones = await models.UsuariosProspectosDirecciones.findOne(
                        {
                            where: {
                                upd_direcciones_id: direccionEnvioID
                            }
                        });

                        if(constUsuariosProspectosDirecciones)
                        {
                            //Obtener Estado Nombre
                            const constEstado2 = await models.Estado.findOne(
                            {
                                where: {
                                    estpa_estado_pais_id: constUsuariosProspectosDirecciones.upd_estado_id
                                }
                            });
                            var estadoValor2 = constEstado2.dataValues.estpa_estado_nombre

                            //Obtener almacen de logistica
                            const AlmacenesLogistica = await models.AlmacenesLogistica.findOne(
                            {
                                where: {
                                    almlog_estpa_estado_pais_nombre: estadoValor2
                                }
                            });

                            //Obtener almacen de logistica
                            const constAlmacenes = await models.Almacenes.findOne(
                            {
                                where: {
                                    alm_codigoAlmacen: AlmacenesLogistica.almlog_almacen_codigo
                                }
                            });
                     
                            if(constAlmacenes.alm_nombre == "Mexico")
                            {
                                //Obtener almacen de logistica
                                const constAlmacenesSecundario = await models.Almacenes.findOne(
                                {
                                    where: {
                                        alm_nombre: "Monterrey"
                                    }
                                });

                                almacenCodigoPrincipal = constAlmacenes.alm_almacen_id
                                almacenCodigoSecundario = constAlmacenesSecundario.alm_almacen_id
                            }
                            else
                            {
                                //Obtener almacen de logistica
                                const constAlmacenesSecundario = await models.Almacenes.findOne(
                                {
                                    where: {
                                        alm_nombre: "Mexico"
                                    }
                                });

                                almacenCodigoPrincipal = constAlmacenes.alm_almacen_id
                                almacenCodigoSecundario = constAlmacenesSecundario.alm_almacen_id
                            }
                        }
                    }
                    // console.log(almacenCodigoPrincipal)
                    // console.log(almacenCodigoSecundario)
                //Fin Obtener Prospecto

                // console.log(productos.length)
                //Obtener lineas
                for (var i = 0; i < productos.length; i++) 
                {
                    var aplicaBackOrder = productos[i].dataValues.aplicaBackOrder
                    var inventarioFaltante = productos[i].dataValues.cantidad
                    var breaker = 0;
                    var stockDisponible = productos[i].dataValues.prod_total_stock
                    var stockPrimarioDisponible = true
                    var stockSecundarioDisponible = true

                    // console.log("aplicaBackOrder: " + aplicaBackOrder)
                    // console.log("inventarioFaltante: " + inventarioFaltante)
                    // console.log("stockDisponible: " + stockDisponible)

                    // console.log("llegoqui")

                    // console.log("productos[i].dataValues.backOrderPrecioLista: " + productos[i].dataValues.backOrderPrecioLista)

                    while(inventarioFaltante > 0)
                    {
                        //Stock disponible total 
                        if(stockDisponible > 0 && productos[i].dataValues.backOrderPrecioLista == false)
                        {
                            //Buscar primero en almacen primario
                            if(stockPrimarioDisponible == true)
                            {
                                //Obtener almacen de logistica
                                const constStockPrimario = await models.StockProducto.findOne(
                                {
                                    where: {
                                        sp_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                        sp_almacen_id: almacenCodigoPrincipal
                                    }
                                })

                                var cantidadDisponible = constStockPrimario.sp_cantidad
                                //Si hay inventario intentara tomarlo para hacer la primer linea
                                if(cantidadDisponible > 0)
                                {
                                    //Surtir toda la linea de producto desde aqui
                                    if(inventarioFaltante < cantidadDisponible)
                                    {
                                        var linea = {
                                            pcf_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                            pcf_cantidad_producto: inventarioFaltante,
                                            pcf_almacen_linea: almacenCodigoPrincipal,
                                            pcf_recoleccion_resurtimiento: false,
                                            pcf_is_backorder: false,
                                            pcf_dias_resurtimiento: 0,
                                            pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                            pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                            pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                            pcf_backorder_fecha_envio_pendiente: false,
                                        }

                                        lineasArray.push(linea);

                                        cantidadDisponible = 0
                                        inventarioFaltante = 0
                                        stockDisponible = 0
                                    }
                                    //Surtir parcial 
                                    else
                                    {
                                        var linea = {
                                            pcf_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                            pcf_cantidad_producto: cantidadDisponible,
                                            pcf_almacen_linea: almacenCodigoPrincipal,
                                            pcf_recoleccion_resurtimiento: false,
                                            pcf_is_backorder: false,
                                            pcf_dias_resurtimiento: 0,
                                            pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                            pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                            pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                            pcf_backorder_fecha_envio_pendiente: false,
                                        }

                                        lineasArray.push(linea);

                                        stockDisponible = stockDisponible - cantidadDisponible
                                        inventarioFaltante = inventarioFaltante - cantidadDisponible
                                        stockPrimarioDisponible = false
                                    }
                                }
                                else
                                {
                                    stockPrimarioDisponible = false
                                }
                            }
                            else
                            {
                                //Obtener almacen de logistica
                                const constStockSecundario = await models.StockProducto.findOne(
                                {
                                    where: {
                                        sp_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                        sp_almacen_id: almacenCodigoSecundario
                                    }
                                })

                                var cantidadDisponible = constStockSecundario.sp_cantidad
                                //Si hay inventario intentara tomarlo para hacer la primer linea
                                if(cantidadDisponible > 0)
                                {
                                    //Surtir toda la linea de producto desde aqui
                                    if(inventarioFaltante < cantidadDisponible)
                                    {
                                        var linea = {
                                            pcf_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                            pcf_cantidad_producto: inventarioFaltante,
                                            pcf_almacen_linea: almacenCodigoSecundario,
                                            pcf_recoleccion_resurtimiento: false,
                                            pcf_is_backorder: false,
                                            pcf_dias_resurtimiento: 0,
                                            pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                            pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                            pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                            pcf_backorder_fecha_envio_pendiente: false,
                                        }

                                        lineasArray.push(linea);

                                        cantidadDisponible = 0
                                        inventarioFaltante = 0
                                        stockDisponible = 0
                                    }
                                    //Surtir parcial 
                                    else
                                    {
                                        var linea = {
                                            pcf_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                            pcf_cantidad_producto: cantidadDisponible,
                                            pcf_almacen_linea: almacenCodigoSecundario,
                                            pcf_recoleccion_resurtimiento: false,
                                            pcf_is_backorder: false,
                                            pcf_dias_resurtimiento: 0,
                                            pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                            pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                            pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                            pcf_backorder_fecha_envio_pendiente: false,
                                        }

                                        lineasArray.push(linea);

                                        stockDisponible = stockDisponible - cantidadDisponible
                                        inventarioFaltante = inventarioFaltante - cantidadDisponible
                                        stockSecundarioDisponible = false
                                    }
                                }
                                else
                                {
                                    stockSecundarioDisponible = false
                                }
                            }
                        }
                        //Backorder si aplica?
                        else if(aplicaBackOrder == true)
                        {
                            //default is false
                            var isOxen = await productosUtils.getIfIsOxenProduct(productos[i].dataValues.prod_producto_id);

                            // var finalPrecioListaBackorder = 'Precio de Lista'
                            var precioBasePrecioDeLista = 999999;
                            if(productos[i].dataValues.prod_tipo_precio_base != 'Precio de Lista')
                            {

                                const constProductoListaPrecio = await models.ProductoListaPrecio.findOne(
                                {
                                    where: {
                                        pl_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                        pl_listp_lista_de_precio_id: 1
                                    }
                                });

                                // productos[i].dataValues.precioFinal = constProductoListaPrecio.pl_precio_producto
                                precioBasePrecioDeLista = constProductoListaPrecio.pl_precio_producto
                            }




                            //Si no es oxen hara todo normal
                            if(isOxen == false)
                            {
                                var linea = {
                                    pcf_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                    pcf_cantidad_producto: inventarioFaltante,
                                    pcf_almacen_linea: almacenCodigoPrincipal,
                                    pcf_recoleccion_resurtimiento: false,
                                    pcf_is_backorder: true,
                                    pcf_dias_resurtimiento: productos[i].dataValues.prod_dias_resurtimiento,
                                    // pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                    pcf_backorder_precio_lista: true,
                                    // pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                    pcf_tipo_precio_lista: 'Precio de Lista',
                                    // pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                    pcf_precio_base_venta: precioBasePrecioDeLista,
                                    pcf_backorder_fecha_envio_pendiente: false,
                                }
                            }
                            else
                            {
                                var linea = {
                                    pcf_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                    pcf_cantidad_producto: inventarioFaltante,
                                    pcf_almacen_linea: 1,
                                    pcf_recoleccion_resurtimiento: false,
                                    pcf_is_backorder: true,
                                    pcf_dias_resurtimiento: productos[i].dataValues.prod_dias_resurtimiento,
                                    // pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                    pcf_backorder_precio_lista: true,
                                    // pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                    pcf_tipo_precio_lista: 'Precio de Lista',
                                    // pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                    pcf_precio_base_venta: precioBasePrecioDeLista,
                                    pcf_backorder_fecha_envio_pendiente: false,
                                }


                            }

                            lineasArray.push(linea);
                            inventarioFaltante = 0



                        }
                        //Backorder fecha envio pendiente (COSA DE COTIZACIONES)
                        else if(aplicaBackOrder == false)
                        {
                            //default is false
                            var isOxen = await productosUtils.getIfIsOxenProduct(productos[i].dataValues.prod_producto_id);

                            var precioBasePrecioDeLista = 999999;
                            if(productos[i].dataValues.prod_tipo_precio_base != 'Precio de Lista')
                            {

                                const constProductoListaPrecio = await models.ProductoListaPrecio.findOne(
                                {
                                    where: {
                                        pl_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                        pl_listp_lista_de_precio_id: 1
                                    }
                                });

                                // productos[i].dataValues.precioFinal = constProductoListaPrecio.pl_precio_producto
                                precioBasePrecioDeLista = constProductoListaPrecio.pl_precio_producto
                            }

                            //Si no es oxen hara todo normal
                            if(isOxen == false)
                            {
                                var linea = {
                                    pcf_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                    pcf_cantidad_producto: inventarioFaltante,
                                    pcf_almacen_linea: almacenCodigoPrincipal,
                                    pcf_recoleccion_resurtimiento: false,
                                    pcf_is_backorder: true,
                                    pcf_dias_resurtimiento: productos[i].dataValues.prod_dias_resurtimiento,
                                    // pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                    pcf_backorder_precio_lista: true,
                                    // pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                    pcf_tipo_precio_lista: 'Precio de Lista',
                                    // pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                    pcf_precio_base_venta: precioBasePrecioDeLista,
                                    pcf_backorder_fecha_envio_pendiente: true,
                                }
                            }
                            else
                            {
                                var linea = {
                                    pcf_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                    pcf_cantidad_producto: inventarioFaltante,
                                    pcf_almacen_linea: 1,
                                    pcf_recoleccion_resurtimiento: false,
                                    pcf_is_backorder: true,
                                    pcf_dias_resurtimiento: productos[i].dataValues.prod_dias_resurtimiento,
                                    // pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                    pcf_backorder_precio_lista: true,
                                    // pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                    pcf_tipo_precio_lista: 'Precio de Lista',
                                    // pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                    pcf_precio_base_venta: precioBasePrecioDeLista,
                                    pcf_backorder_fecha_envio_pendiente: true,
                                }
                            }

                            lineasArray.push(linea);
                            inventarioFaltante = 0

                        }

                        breaker++
                        if(breaker == 50)
                        {
                            // console.log(99999999999)
                            // console.log("!!!!!!!!!!!!!!!ENTRO AL WHILE Y SALIO POR BRAKE!!!!!!!!!")
                            // console.log(99999999999)
                            break
                        } 
                    }
                }
            }
            //Si el tipo de envio es 17 es recoleccion
            else if(constControlMaestroMultiple.cmm_valor == "Recolección")
            {
                //Obtener almacen de logistica
                const constAlmacenes = await models.Almacenes.findOne(
                {
                    where: {
                        alm_almacen_id: almacenID
                    }
                });

                //Se necesita para saber cuantos articulos
                if(constAlmacenes.alm_nombre == "Mexico")
                {
                    //Obtener almacen de logistica
                    const constAlmacenesSecundario = await models.Almacenes.findOne(
                    {
                        where: {
                            alm_nombre: "Monterrey"
                        }
                    });

                    almacenCodigoPrincipal = constAlmacenes.alm_almacen_id
                    almacenCodigoSecundario = constAlmacenesSecundario.alm_almacen_id
                }
                else
                {
                    //Obtener almacen de logistica
                    const constAlmacenesSecundario = await models.Almacenes.findOne(
                    {
                        where: {
                            alm_nombre: "Mexico"
                        }
                    });

                    almacenCodigoPrincipal = constAlmacenes.alm_almacen_id
                    almacenCodigoSecundario = constAlmacenesSecundario.alm_almacen_id
                }

                //Id de almacen
                console.log(constAlmacenes.alm_codigoAlmacen)

                //Obtener lineas
                for (var i = 0; i < productos.length; i++) 
                {
                    var aplicaBackOrder = productos[i].dataValues.aplicaBackOrder
                    var inventarioFaltante = productos[i].dataValues.cantidad

                    var breaker = 0;
                    var stockDisponible = productos[i].dataValues.prod_total_stock
                    var stockPrimarioDisponible = true
                    var stockSecundarioDisponible = true

                    while(inventarioFaltante > 0)
                    {
                        //Stock disponible total 
                        if(stockDisponible > 0 && productos[i].dataValues.backOrderPrecioLista == false)
                        {

                            //Buscar primero en almacen primario
                            if(stockPrimarioDisponible == true)
                            {
                                //Obtener almacen de logistica
                                const constStockPrimario = await models.StockProducto.findOne(
                                {
                                    where: {
                                        sp_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                        sp_almacen_id: almacenCodigoPrincipal
                                    }
                                })

                                var cantidadDisponible = constStockPrimario.sp_cantidad
                                //Si hay inventario intentara tomarlo para hacer la primer linea
                                if(cantidadDisponible > 0)
                                {
                                    //Surtir toda la linea de producto desde aqui
                                    if(inventarioFaltante < cantidadDisponible)
                                    {
                                        var linea = {
                                            pcf_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                            pcf_cantidad_producto: inventarioFaltante,
                                            pcf_almacen_linea: constAlmacenes.alm_codigoAlmacen,
                                            pcf_recoleccion_resurtimiento: false,
                                            pcf_is_backorder: false,
                                            pcf_dias_resurtimiento: 0,
                                            pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                            pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                            pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                            pcf_backorder_fecha_envio_pendiente: false,
                                        }

                                        lineasArray.push(linea);

                                        cantidadDisponible = 0
                                        inventarioFaltante = 0
                                        stockDisponible = 0
                                    }
                                    //Surtir parcial 
                                    else
                                    {
                                        var linea = {
                                            pcf_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                            pcf_cantidad_producto: cantidadDisponible,
                                            pcf_almacen_linea: constAlmacenes.alm_codigoAlmacen,
                                            pcf_recoleccion_resurtimiento: false,
                                            pcf_is_backorder: false,
                                            pcf_dias_resurtimiento: 0,
                                            pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                            pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                            pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                            pcf_backorder_fecha_envio_pendiente: false,
                                        }

                                        lineasArray.push(linea);

                                        stockDisponible = stockDisponible - cantidadDisponible
                                        inventarioFaltante = inventarioFaltante - cantidadDisponible
                                        stockPrimarioDisponible = false
                                    }
                                }
                                else
                                {
                                    stockPrimarioDisponible = false
                                }
                            }
                            else
                            {
                                //Obtener almacen de logistica
                                const constStockSecundario = await models.StockProducto.findOne(
                                {
                                    where: {
                                        sp_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                        sp_almacen_id: almacenCodigoSecundario
                                    }
                                })

                                var cantidadDisponible = constStockSecundario.sp_cantidad
                                //Si hay inventario intentara tomarlo para hacer la primer linea
                                if(cantidadDisponible > 0)
                                {
                                    //Surtir toda la linea de producto desde aqui
                                    if(inventarioFaltante < cantidadDisponible)
                                    {
                                        var linea = {
                                            pcf_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                            pcf_cantidad_producto: inventarioFaltante,
                                            pcf_almacen_linea: constAlmacenes.alm_codigoAlmacen,
                                            pcf_recoleccion_resurtimiento: true,
                                            pcf_is_backorder: false,
                                            pcf_dias_resurtimiento: 0,
                                            pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                            pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                            pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                            pcf_backorder_fecha_envio_pendiente: false,
                                        }

                                        lineasArray.push(linea);

                                        cantidadDisponible = 0
                                        inventarioFaltante = 0
                                        stockDisponible = 0
                                    }
                                    //Surtir parcial 
                                    else
                                    {
                                        var linea = {
                                            pcf_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                            pcf_cantidad_producto: cantidadDisponible,
                                            pcf_almacen_linea: constAlmacenes.alm_codigoAlmacen,
                                            pcf_recoleccion_resurtimiento: true,
                                            pcf_is_backorder: false,
                                            pcf_dias_resurtimiento: 0,
                                            pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                            pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                            pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                            pcf_backorder_fecha_envio_pendiente: false,
                                        }

                                        lineasArray.push(linea);

                                        stockDisponible = stockDisponible - cantidadDisponible
                                        inventarioFaltante = inventarioFaltante - cantidadDisponible
                                        stockSecundarioDisponible = false
                                    }
                                }
                                else
                                {
                                    stockSecundarioDisponible = false
                                }
                            }
                        }
                        //Backorder si aplica?
                        else if(aplicaBackOrder == true)
                        {

                            var precioBasePrecioDeLista = 999999;
                            if(productos[i].dataValues.prod_tipo_precio_base != 'Precio de Lista')
                            {
                                const constProductoListaPrecio = await models.ProductoListaPrecio.findOne(
                                {
                                    where: {
                                        pl_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                        pl_listp_lista_de_precio_id: 1
                                    }
                                });

                                productos[i].dataValues.precioFinal = constProductoListaPrecio.pl_precio_producto
                                precioBasePrecioDeLista = constProductoListaPrecio.pl_precio_producto
                            }


                            var linea = {
                                pcf_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                pcf_cantidad_producto: inventarioFaltante,
                                pcf_almacen_linea: constAlmacenes.alm_codigoAlmacen,
                                pcf_recoleccion_resurtimiento: false,
                                pcf_is_backorder: true,
                                pcf_dias_resurtimiento: productos[i].dataValues.prod_dias_resurtimiento,
                                // pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                pcf_backorder_precio_lista: true,
                                // pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                pcf_tipo_precio_lista: 'Precio de Lista',
                                // pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                pcf_precio_base_venta: precioBasePrecioDeLista,
                                pcf_backorder_fecha_envio_pendiente: false,
                            }
                            lineasArray.push(linea);
                            inventarioFaltante = 0
                        }
                        //Backorder fecha envio pendiente (COSA DE COTIZACIONES)
                        else if(aplicaBackOrder == false)
                        {
                            var precioBasePrecioDeLista = 999999;
                            if(productos[i].dataValues.prod_tipo_precio_base != 'Precio de Lista')
                            {
                                const constProductoListaPrecio = await models.ProductoListaPrecio.findOne(
                                {
                                    where: {
                                        pl_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                        pl_listp_lista_de_precio_id: 1
                                    }
                                });

                                productos[i].dataValues.precioFinal = constProductoListaPrecio.pl_precio_producto
                                precioBasePrecioDeLista = constProductoListaPrecio.pl_precio_producto
                            }

                            var linea = {
                                pcf_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                pcf_cantidad_producto: inventarioFaltante,
                                pcf_almacen_linea: constAlmacenes.alm_codigoAlmacen,
                                pcf_recoleccion_resurtimiento: false,
                                pcf_is_backorder: true,
                                pcf_dias_resurtimiento: productos[i].dataValues.prod_dias_resurtimiento,
                                // pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                pcf_backorder_precio_lista: true,
                                // pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                pcf_tipo_precio_lista: 'Precio de Lista',
                                // pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                pcf_precio_base_venta: precioBasePrecioDeLista,
                                pcf_backorder_fecha_envio_pendiente: true,
                            }
                            lineasArray.push(linea);
                            inventarioFaltante = 0
                        }

                        breaker++
                        if(breaker == 50)
                        {
                            break
                        } 
                    }
                }
            }

            return lineasArray
        }
        catch(e)
        {
            console.log(e)
            return "No fue posible regresar las lineas de productos para dividir la orden en almacenes"
        }
    },

};


