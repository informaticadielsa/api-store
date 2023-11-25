import models from '../models';
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import cotizarCarritoFunction from "../services/cotizarCarritoFunctions";
const { Op } = require("sequelize");
import statusControllers from '../mapeos/mapeoControlesMaestrosMultiples';
import request from 'request-promise';
import getCheckout from "../services/checkoutAPI";
import productosUtils from "../services/productosUtils";
import date_and_time from 'date-and-time';




module.exports = {


    //Api servicio de update de cotizaciones para usar en otras partes
    cotizacionesUpdateAutomaticoService: async function (cotizacion_id, bodyEditarTemp, isEditar) {
        try
        {   
            //Las configuración permite cambios de precios en cotizaciones? Validacion 4 de los CMM nuevos
            const constControlMaestroMultiple4 = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_nombre: "COT_CONFIG_CAMBIAR_PRECIOS_O_DESCUENTOS"
                },
            });

            var Permitir_Cambiar_Precios_O_Descuentos = false
            if(constControlMaestroMultiple4.cmm_valor == "TRUE")
            {
                Permitir_Cambiar_Precios_O_Descuentos = true
            }

            console.log("Permitir_Cambiar_Precios_O_Descuentos: " + Permitir_Cambiar_Precios_O_Descuentos)

            const oldCotizaciones = await models.Cotizaciones.findOne(
            {
                where: {
                    cot_cotizacion_id: cotizacion_id
                },
            });

            //Cotizacion productos
            const oldCotizacionesProductos = await models.CotizacionesProductos.findAll(
            {
                where: {
                    cotp_cotizacion_id: oldCotizaciones.cot_cotizacion_id
                },
                order: [
                    ['cotp_cotizaciones_productos_id', 'ASC']
                ],
            });



            //Get cotizacion, info actualizada
            var body
            var productos
            //Si es SN el que cotizo obtener su informacion apartir de la cotizacion
            if(oldCotizaciones.cot_prospecto == false)
            {
                body = {
                    "cdc_sn_socio_de_negocio_id": oldCotizaciones.cot_sn_socios_negocio_id,
                    "up_usuarios_prospectos_id": null,
                    "cot_prospecto": false,
                    
                    "snd_direcciones_id": oldCotizaciones.cot_direccion_envio_id,
                    "upd_direcciones_id": null,
                    "recoleccion_almacen_id": oldCotizaciones.cot_alm_almacen_recoleccion,

                    "tipo_envio": oldCotizaciones.cot_cmm_tipo_envio_id,

                    "cot_referencia": oldCotizaciones.cot_referencia,
                    "cot_usu_usuario_vendedor_id":  oldCotizaciones.cot_usu_usuario_vendedor_id,
                    //Esto tambien posiblemente sea por linea
                    "cotp_usu_descuento_cotizacion": 0,
                    "cot_cot_tratamiento": oldCotizaciones.cot_tratamiento,
                    
                    "cot_productos": null,

                    //Esto es por linea
                    "cotp_porcentaje_descuento_vendedor": 0
                }
            }
            else
            {
                body = {
                    "cdc_sn_socio_de_negocio_id": null,
                    "up_usuarios_prospectos_id": oldCotizaciones.cot_up_usuarios_prospectos_id,
                    "cot_prospecto": true,
                    
                    "snd_direcciones_id": null,
                    "upd_direcciones_id": oldCotizaciones.cot_direccion_envio_id,
                    "recoleccion_almacen_id": oldCotizaciones.cot_alm_almacen_recoleccion,

                    "tipo_envio": oldCotizaciones.cot_cmm_tipo_envio_id,

                    "cot_referencia": oldCotizaciones.cot_referencia,
                    "cot_usu_usuario_vendedor_id":  oldCotizaciones.cot_usu_usuario_vendedor_id,
                    //Esto tambien posiblemente sea por linea
                    "cotp_usu_descuento_cotizacion": 0,
                    "cot_cot_tratamiento": oldCotizaciones.cot_tratamiento,
                    
                    "cot_productos": null,

                    //Esto es por linea
                    "cotp_porcentaje_descuento_vendedor": 0
                }
            }

            console.log(body)

            // var productos
            // PASO 1 - Validar cambios en precios (UPDATE) cotizaciones (Obtener productos desde la cotizacion y no del carrito o arreglo que se pide)
            console.log("/////////// Comienza PASO 1 ///////////")
            //Obtener productos de cotizaciones tabla y cotizaciones productos tabla

                productos = await this.cotizacionesObtenerProductosCotizacionesCambios(body, cotizacion_id);

                //Si es editar va a buscar los id de productos y setteara las cantidades
                if(isEditar == true)
                {
                    for (var h = 0; h < bodyEditarTemp.length; h++) 
                    {
                        for (var m = 0; m < productos.length; m++) 
                        {
                            if(bodyEditarTemp[h].prod_producto_id == productos[m].prod_producto_id)
                            {
                                productos[m].cantidad = bodyEditarTemp[h].cantidad
                            }
                        }
                    }
                }
            //Fin obtener mismo formato productos
            console.log("/////////// FIN PASO 1 ///////////")

            
            //PASO COT 2
            console.log("/////////// Comienza PASO 2 ///////////")
            //Obtener la informacion de los productos (Antes de separar lineas/backorder/stockinactivo/hastaagotarexistencia/precioLista)
                console.log(productos)
                productos = await this.cotizacionesObtenerInfoBaseProductos(body, productos);
                console.log(productos)
            //Fin obtener productos base
            console.log("/////////// FIN PASO 2 ///////////")


            //PASO COT 3
            console.log("/////////// Comienza PASO 3 ///////////")
            //Mandar obtener lineas para saber de que almacen se surtiran y obtener si es precio lista, precio hae o si
                var lineasProductos = await this.cotizacionesObtenerLineasProductos(body, productos);
                // console.log(lineasProductos)
            //Final Mandar obtener lineas para saber de que almacen se surtiran y obtener si es precio lista, precio hae o si
            console.log("/////////// FIN PASO 3 ///////////")


            //PASO COT 4
            console.log("/////////// Comienza PASO 4 ///////////")
            //Recalcular productos base en base a la informacion de las lineas (obtener productos en back etc~)
                productos = await this.cotizacionesObtenerInformacionDeLineas(body, productos, lineasProductos);
            //FIN Recalcular productos base en base a la informacion de las lineas (obtener productos en back etc~)
            console.log("/////////// FIN PASO 4 ///////////")

            //PASO COT 5
            console.log("/////////// Comienza PASO 5 ///////////")
            //Obtener promociones a partir de las lineas generadas (Aplicara Backorders tralados etc~)
                productos = await this.cotizacionesObtenerPromocionesProductos(body, productos, lineasProductos);
            //FIN Obtener promociones a partir de las lineas generadas
            console.log("/////////// FIN PASO 5 ///////////")


            //PASO COT 6
            console.log("/////////// Comienza PASO 6 ///////////")
            //Obtener totales de cotizacion
                var TotalFinal = await this.cotizacionesObtenerTotalesProductos(body, productos, lineasProductos);
            //FIN Obtener totales de cotizacion
            console.log("/////////// FIN PASO 6 ///////////")


            //PASO COT 7
            console.log("/////////// Comienza PASO 7 ///////////")
            //Obtener costos envios
                var cotizacionCarritoEnvioPoliticas = await cotizarCarritoFunction.CotizarCarritoFunctionForCotizacionesFunction(body, productos, TotalFinal);
                // console.log(cotizacionCarritoEnvioPoliticas)
            //FIN Obtener costos envios
            console.log("/////////// FIN PASO 7 ///////////")


            //PASO COT 8
            console.log("/////////// Comienza PASO 8 ///////////")
            //Crear fechas de envio
                productos = await this.cotizacionesObtenerFechasEnvio(body, productos, TotalFinal, cotizacionCarritoEnvioPoliticas);
            //FIN Crear fechas de envio
            console.log("/////////// FIN PASO 8 ///////////")



            //Validar si existen nuevas lineas dentro de productos
            var General_Lineas_Nuevos = false
            for (var i = 0; i < productos.length; i++) 
            {
                var tempNum = 0
                for (var j = 0; j < oldCotizacionesProductos.length; j++) 
                {
                    //Si coincide Prod ID, almacen y backorden en almenos 1 significa que no es linea nueva
                    console.log(productos[i].dataValues.prod_producto_id + " === " + oldCotizacionesProductos[j].dataValues.cotp_prod_producto_id)
                    console.log(productos[i].dataValues.pcf_almacen_linea + " === " + oldCotizacionesProductos[j].dataValues.cotp_almacen_linea)
                    console.log(productos[i].dataValues.pcf_is_backorder + " === " + oldCotizacionesProductos[j].dataValues.cotp_back_order)
                    
                    if(productos[i].dataValues.prod_producto_id == oldCotizacionesProductos[j].dataValues.cotp_prod_producto_id
                        && productos[i].dataValues.pcf_almacen_linea == oldCotizacionesProductos[j].dataValues.cotp_almacen_linea
                        && productos[i].dataValues.pcf_is_backorder == oldCotizacionesProductos[j].dataValues.cotp_back_order)
                    {
                        tempNum = tempNum+1
                        console.log("ES IDENTICO Linea nueva")
                    }
                    console.log("--------------------")
                }
                //Si es 0 significa que no coincidio ninguna vez, por lo tanto es linea nueva
                if(tempNum == 0)
                {
                    General_Lineas_Nuevos = true
                    productos[i].dataValues.prod_is_linea_nueva = true
                }
                else
                {
                    productos[i].dataValues.prod_is_linea_nueva = false
                }
            }



            //Validar si alguna linea de las cotizaciones va a ser eliminada
            var General_Lineas_Eliminada = false
            for (var i = 0; i < oldCotizacionesProductos.length; i++) 
            {
                var tempNum = 0
                for (var j = 0; j < productos.length; j++) 
                {
                    //Si coincide Prod ID, almacen y backorden en almenos 1 significa que la linea continua existiendo y no fue eliminada
                    console.log(productos[j].dataValues.prod_producto_id + " === " + oldCotizacionesProductos[i].dataValues.cotp_prod_producto_id)
                    console.log(productos[j].dataValues.pcf_almacen_linea + " === " + oldCotizacionesProductos[i].dataValues.cotp_almacen_linea)
                    console.log(productos[j].dataValues.pcf_is_backorder + " === " + oldCotizacionesProductos[i].dataValues.cotp_back_order)
                    
                    if(productos[j].dataValues.prod_producto_id == oldCotizacionesProductos[i].dataValues.cotp_prod_producto_id
                        && productos[j].dataValues.pcf_almacen_linea == oldCotizacionesProductos[i].dataValues.cotp_almacen_linea
                        && productos[j].dataValues.pcf_is_backorder == oldCotizacionesProductos[i].dataValues.cotp_back_order)
                    {
                        tempNum = tempNum+1
                        console.log("ES IDENTICO Linea eliminada")
                    }
                    console.log("--------------------")
                }
                //Si es 0 significa que no coincidio ninguna vez, por lo tanto es linea nueva
                if(tempNum > 0)
                {
                    oldCotizacionesProductos[i].dataValues.prod_is_linea_eliminada = false
                }
                else
                {
                    General_Lineas_Eliminada = true
                    oldCotizacionesProductos[i].dataValues.prod_is_linea_eliminada = true
                }
            }



            //Validar las cantidades por linea y ver si cambiaron
            var General_Lineas_Cantidad_Cambiaron = false
            for (var i = 0; i < productos.length; i++) 
            {
                if(productos[i].dataValues.prod_is_linea_nueva == false)
                {
                    for (var j = 0; j < oldCotizacionesProductos.length; j++) 
                    {
                        //Si coincide el id almacen y que no es prod significa que es la misma linea y seria validar las cantidades
                        console.log(productos[i].dataValues.prod_producto_id + " === " + oldCotizacionesProductos[j].dataValues.cotp_prod_producto_id)
                        console.log(productos[i].dataValues.pcf_almacen_linea + " === " + oldCotizacionesProductos[j].dataValues.cotp_almacen_linea)
                        console.log(productos[i].dataValues.pcf_is_backorder + " === " + oldCotizacionesProductos[j].dataValues.cotp_back_order)

                        if(productos[i].dataValues.prod_producto_id == oldCotizacionesProductos[j].dataValues.cotp_prod_producto_id
                            && productos[i].dataValues.pcf_almacen_linea == oldCotizacionesProductos[j].dataValues.cotp_almacen_linea
                            && productos[i].dataValues.pcf_is_backorder == oldCotizacionesProductos[j].dataValues.cotp_back_order)
                        {
                            console.log("ES IDENTICO Cantidades")
                            if(productos[i].dataValues.cantidad == oldCotizacionesProductos[j].dataValues.cotp_producto_cantidad)
                            {
                                productos[i].dataValues.prod_cantidad_cambio = false
                            }
                            else
                            {
                                productos[i].dataValues.prod_cantidad_cambio = true
                                General_Lineas_Cantidad_Cambiaron = true
                            }
                        }
                        console.log("--------------------")
                    }
                }
                else
                {
                    productos[i].dataValues.prod_cantidad_cambio = false
                }
            }



            //Validar Cambio de tipo de lista
            var General_Lineas_Cambio_Tipo_Lista_Precio = false
            for (var i = 0; i < productos.length; i++) 
            {
                if(productos[i].dataValues.prod_is_linea_nueva == false)
                {
                    for (var j = 0; j < oldCotizacionesProductos.length; j++) 
                    {
                        //Si coincide el id almacen y que no es prod significa que es la misma linea y seria validar las cantidades
                        console.log(productos[i].dataValues.prod_producto_id + " === " + oldCotizacionesProductos[j].dataValues.cotp_prod_producto_id)
                        console.log(productos[i].dataValues.pcf_almacen_linea + " === " + oldCotizacionesProductos[j].dataValues.cotp_almacen_linea)
                        console.log(productos[i].dataValues.pcf_is_backorder + " === " + oldCotizacionesProductos[j].dataValues.cotp_back_order)

                        if(productos[i].dataValues.prod_producto_id == oldCotizacionesProductos[j].dataValues.cotp_prod_producto_id
                            && productos[i].dataValues.pcf_almacen_linea == oldCotizacionesProductos[j].dataValues.cotp_almacen_linea
                            && productos[i].dataValues.pcf_is_backorder == oldCotizacionesProductos[j].dataValues.cotp_back_order)
                        {
                            console.log("ES IDENTICO tipo de lista de precio")
                            if(productos[i].dataValues.prod_tipo_precio_base == oldCotizacionesProductos[j].dataValues.cotp_tipo_precio_lista)
                            {
                                productos[i].dataValues.prod_cambio_tipo_lista_precio = false
                            }
                            else
                            {
                                productos[i].dataValues.prod_cambio_tipo_lista_precio = true
                                General_Lineas_Cambio_Tipo_Lista_Precio = true
                            }
                        }
                        console.log("--------------------")
                    }
                }
                else
                {
                    productos[i].dataValues.prod_cambio_tipo_lista_precio = false
                }
            }



            //Validar Cambio en Precio base
            var General_Lineas_Cambio_Precio_Base = false
            for (var i = 0; i < productos.length; i++) 
            {
                if(productos[i].dataValues.prod_is_linea_nueva == false)
                {
                    for (var j = 0; j < oldCotizacionesProductos.length; j++) 
                    {
                        //Si coincide el id almacen y que no es prod significa que es la misma linea y seria validar las cantidades
                        console.log(productos[i].dataValues.prod_producto_id + " === " + oldCotizacionesProductos[j].dataValues.cotp_prod_producto_id)
                        console.log(productos[i].dataValues.pcf_almacen_linea + " === " + oldCotizacionesProductos[j].dataValues.cotp_almacen_linea)
                        console.log(productos[i].dataValues.pcf_is_backorder + " === " + oldCotizacionesProductos[j].dataValues.cotp_back_order)

                        if(productos[i].dataValues.prod_producto_id == oldCotizacionesProductos[j].dataValues.cotp_prod_producto_id
                            && productos[i].dataValues.pcf_almacen_linea == oldCotizacionesProductos[j].dataValues.cotp_almacen_linea
                            && productos[i].dataValues.pcf_is_backorder == oldCotizacionesProductos[j].dataValues.cotp_back_order)
                        {
                            console.log("ES IDENTICO el precio base")
                            if(productos[i].dataValues.prod_precio == oldCotizacionesProductos[j].dataValues.cotp_precio_base_lista)
                            {
                                productos[i].dataValues.prod_cambio_precio_base = false
                                productos[i].dataValues.prod_cambio_precio_base_anterior_valor = oldCotizacionesProductos[j].dataValues.cotp_precio_base_lista
                                productos[i].dataValues.prod_cambio_precio_base_nuevo_valor = productos[i].dataValues.prod_precio

                            }
                            else
                            {
                                productos[i].dataValues.prod_cambio_precio_base = true
                                General_Lineas_Cambio_Precio_Base = true
                                productos[i].dataValues.prod_cambio_precio_base_anterior_valor = oldCotizacionesProductos[j].dataValues.cotp_precio_base_lista
                                productos[i].dataValues.prod_cambio_precio_base_nuevo_valor = productos[i].dataValues.prod_precio
                            }
                        }
                        console.log("--------------------")
                    }
                }
                else
                {
                    productos[i].dataValues.prod_cambio_precio_base = false
                    productos[i].dataValues.prod_cambio_precio_base_anterior_valor = productos[i].dataValues.prod_precio
                    productos[i].dataValues.prod_cambio_precio_base_nuevo_valor = productos[i].dataValues.prod_precio
                }
            }




            //Validar Cambio en Precio Promocion/Final
            var General_Lineas_Cambio_Precio_Promocion = false
            for (var i = 0; i < productos.length; i++) 
            {
                if(productos[i].dataValues.prod_is_linea_nueva == false)
                {
                    for (var j = 0; j < oldCotizacionesProductos.length; j++) 
                    {
                        //Si coincide el id almacen y que no es prod significa que es la misma linea y seria validar las cantidades
                        console.log(productos[i].dataValues.prod_producto_id + " === " + oldCotizacionesProductos[j].dataValues.cotp_prod_producto_id)
                        console.log(productos[i].dataValues.pcf_almacen_linea + " === " + oldCotizacionesProductos[j].dataValues.cotp_almacen_linea)
                        console.log(productos[i].dataValues.pcf_is_backorder + " === " + oldCotizacionesProductos[j].dataValues.cotp_back_order)

                        if(productos[i].dataValues.prod_producto_id == oldCotizacionesProductos[j].dataValues.cotp_prod_producto_id
                            && productos[i].dataValues.pcf_almacen_linea == oldCotizacionesProductos[j].dataValues.cotp_almacen_linea
                            && productos[i].dataValues.pcf_is_backorder == oldCotizacionesProductos[j].dataValues.cotp_back_order)
                        {
                            console.log("ES IDENTICO el precio base")
                            if(productos[i].dataValues.precioFinal == oldCotizacionesProductos[j].dataValues.cotp_precio_menos_promociones)
                            {
                                productos[i].dataValues.prod_cambio_precio_promocion = false
                                productos[i].dataValues.prod_cambio_precio_promocion_anterior_valor = oldCotizacionesProductos[j].dataValues.cotp_precio_menos_promociones
                                productos[i].dataValues.prod_cambio_precio_promocion_nuevo_valor = productos[i].dataValues.precioFinal

                            }
                            else
                            {
                                productos[i].dataValues.prod_cambio_precio_promocion = true
                                General_Lineas_Cambio_Precio_Promocion = true
                                productos[i].dataValues.prod_cambio_precio_promocion_anterior_valor = oldCotizacionesProductos[j].dataValues.cotp_precio_menos_promociones
                                productos[i].dataValues.prod_cambio_precio_promocion_nuevo_valor = productos[i].dataValues.precioFinal
                            }
                        }
                        console.log("--------------------")
                    }
                }
                else
                {
                    productos[i].dataValues.prod_cambio_precio_promocion= false
                    productos[i].dataValues.prod_cambio_precio_promocion_anterior_valor = productos[i].dataValues.precioFinal
                    productos[i].dataValues.prod_cambio_precio_promocion_nuevo_valor = productos[i].dataValues.precioFinal
                }
            }





            //PASO COT 9.1 Insertar Nuevas Lineas en caso de que existan
            console.log("/////////// Comienza PASO 9.1 ///////////")
            if(General_Lineas_Nuevos == true)
            {
                for (var i = 0; i < productos.length; i++) 
                {
                    if(productos[i].dataValues.prod_is_linea_nueva == true)
                    {
                        var porcentajeDescuentoVendedor = req.body.cotp_porcentaje_descuento_vendedor ? req.body.cotp_porcentaje_descuento_vendedor : 0
                        const constCotizacionesProductosInserted = await models.CotizacionesProductos.create({
                            cotp_prod_producto_id: productos[i].dataValues.prod_producto_id,
                            cotp_cotizacion_id: oldCotizaciones.dataValues.cot_cotizacion_id,
                            cotp_producto_cantidad: productos[i].dataValues.cantidad,
                            cotp_precio_base_lista: productos[i].dataValues.prod_precio,
                            cotp_precio_menos_promociones: productos[i].dataValues.precioFinal,
                            cotp_porcentaje_descuento_vendedor: 0,
                            // cotp_precio_descuento_vendedor: (porcentajeDescuentoVendedor*productos[i].dataValues.precioFinal)/100,
                            cotp_precio_descuento_vendedor: 0,
                            cotp_usu_descuento_cotizacion: null,
                            cotp_back_order: productos[i].dataValues.pcf_is_backorder,
                            cotp_tipo_precio_lista: productos[i].dataValues.pcf_tipo_precio_lista,
                            cotp_dias_resurtimiento: productos[i].dataValues.pcf_dias_resurtimiento,
                            cotp_almacen_linea: productos[i].dataValues.pcf_almacen_linea,
                            cotp_recoleccion_resurtimiento: productos[i].dataValues.pcf_recoleccion_resurtimiento,
                            cotp_fecha_entrega: productos[i].dataValues.dateFinal,
                            cotp_backorder_precio_lista: productos[i].dataValues.pcf_backorder_precio_lista,
                            cotp_descuento_porcentual: productos[i].dataValues.totalDescuentoPorcentual,
                        });
                    }
                }
            }
            console.log("/////////// FIN Comienza PASO 9.1 ///////////")






            //PASO COT 9.2 Eliminar Lineas que ya no van a existir
            console.log("/////////// Comienza PASO 9.2 ///////////")
            if(General_Lineas_Eliminada == true)
            {
                for (var i = 0; i < oldCotizacionesProductos.length; i++) 
                {
                    if(oldCotizacionesProductos[i].dataValues.prod_is_linea_eliminada == true)
                    {
                        await models.CotizacionesProductos.destroy(
                        {
                            where: {
                                cotp_cotizaciones_productos_id: oldCotizacionesProductos[i].dataValues.cotp_cotizaciones_productos_id
                            }
                        });
                    }
                }
            }
            console.log("/////////// FIN Comienza PASO 9.2 ///////////")




            //PASO COT 9.3 Actualizar las cantidades de las lineas que lo requieran
            console.log("/////////// Comienza PASO 9.3 ///////////")
            if(General_Lineas_Cantidad_Cambiaron == true)
            {
                for (var i = 0; i < productos.length; i++) 
                {
                    if(productos[i].dataValues.prod_cantidad_cambio == true)
                    {
                        console.log("Linea actualizada con el [i]: " + i)
                        //Cotizacion productos actualizar const
                        const updateLineaCotizacionesProductos = await models.CotizacionesProductos.findOne(
                        {
                            where: {
                                cotp_cotizacion_id: oldCotizaciones.dataValues.cot_cotizacion_id,
                                cotp_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                cotp_almacen_linea: productos[i].dataValues.pcf_almacen_linea,
                                cotp_backorder_precio_lista: productos[i].dataValues.pcf_is_backorder
                            }
                        });
                        console.log("Linea actualizada con id: " + updateLineaCotizacionesProductos.cotp_cotizaciones_productos_id)

                        const bodyUpdate = {
                            cotp_producto_cantidad: productos[i].dataValues.cantidad,
                            updatedAt: Date()
                        };
                        
                        await updateLineaCotizacionesProductos.update(bodyUpdate);
                    }
                }
            }
            console.log("/////////// FIN Comienza PASO 9.3 ///////////")



            //PASO COT 9.4 Actualizar las lineas les cambio el tipo de lista de precio de HAE y SI y Precio de lista
            console.log("/////////// Comienza PASO 9.4 ///////////")
            if(General_Lineas_Cambio_Tipo_Lista_Precio == true)
            {
                for (var i = 0; i < productos.length; i++) 
                {
                    if(productos[i].dataValues.prod_cambio_tipo_lista_precio == true)
                    {
                        console.log("Linea actualizada con el [i]: " + i)
                        //Cotizacion productos actualizar const
                        const updateLineaCotizacionesProductos = await models.CotizacionesProductos.findOne(
                        {
                            where: {
                                cotp_cotizacion_id: oldCotizaciones.dataValues.cot_cotizacion_id,
                                cotp_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                cotp_almacen_linea: productos[i].dataValues.pcf_almacen_linea,
                                cotp_backorder_precio_lista: productos[i].dataValues.pcf_is_backorder
                            }
                        });
                        console.log("Linea actualizada con id: " + updateLineaCotizacionesProductos.cotp_cotizaciones_productos_id)

                        const bodyUpdate = {
                            cotp_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                            updatedAt: Date()
                        };
                        
                        await updateLineaCotizacionesProductos.update(bodyUpdate);
                    }
                }
            }
            console.log("/////////// FIN Comienza PASO 9.4 ///////////")




            //PASO COT 9.5 Actualizar el precio base que puedan tener las lineas
            console.log("/////////// Comienza PASO 9.5 ///////////")
            if(General_Lineas_Cambio_Precio_Base == true)
            {
                for (var i = 0; i < productos.length; i++) 
                {
                    if(productos[i].dataValues.prod_cambio_precio_base == true)
                    {
                        console.log("Linea actualizada con el [i]: " + i)
                        //Cotizacion productos actualizar const
                        const updateLineaCotizacionesProductos = await models.CotizacionesProductos.findOne(
                        {
                            where: {
                                cotp_cotizacion_id: oldCotizaciones.dataValues.cot_cotizacion_id,
                                cotp_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                cotp_almacen_linea: productos[i].dataValues.pcf_almacen_linea,
                                cotp_backorder_precio_lista: productos[i].dataValues.pcf_is_backorder
                            }
                        });
                        console.log("Linea actualizada con id: " + updateLineaCotizacionesProductos.cotp_cotizaciones_productos_id)

                        const bodyUpdate = {
                            cotp_precio_base_lista: productos[i].dataValues.prod_precio,
                            updatedAt: Date()
                        };
                        
                        await updateLineaCotizacionesProductos.update(bodyUpdate);
                    }
                }
            }
            console.log("/////////// FIN Comienza PASO 9.5 ///////////")



            //PASO COT 9.6 Actualizar el precio promocion que puedan tener las lineas
            console.log("/////////// Comienza PASO 9.6 ///////////")
            if(General_Lineas_Cambio_Precio_Base == true)
            {
                for (var i = 0; i < productos.length; i++) 
                {
                    if(productos[i].dataValues.prod_cambio_precio_promocion == true)
                    {
                        console.log("Linea actualizada con el [i]: " + i)
                        //Cotizacion productos actualizar const
                        const updateLineaCotizacionesProductos = await models.CotizacionesProductos.findOne(
                        {
                            where: {
                                cotp_cotizacion_id: oldCotizaciones.dataValues.cot_cotizacion_id,
                                cotp_prod_producto_id: productos[i].dataValues.prod_producto_id,
                                cotp_almacen_linea: productos[i].dataValues.pcf_almacen_linea,
                                cotp_backorder_precio_lista: productos[i].dataValues.pcf_is_backorder
                            }
                        });
                        console.log("Linea actualizada con id: " + updateLineaCotizacionesProductos.cotp_cotizaciones_productos_id)

                        const bodyUpdate = {
                            cotp_precio_menos_promociones: productos[i].dataValues.precioFinal,
                            updatedAt: Date()
                        };
                        
                        await updateLineaCotizacionesProductos.update(bodyUpdate);
                    }
                }
            }
            console.log("/////////// FIN Comienza PASO 9.6 ///////////")

            var cotizacionSetReturn = await this.cotizacionSetTotalsByID(oldCotizaciones.dataValues.cot_cotizacion_id);


            const Cotizaciones = await models.Cotizaciones.findOne(
            {
                where: {
                    cot_cotizacion_id: cotizacion_id
                },
            });

            //Cotizacion productos
            const CotizacionesProductos = await models.CotizacionesProductos.findAll(
            {
                where: {
                    cotp_cotizacion_id: oldCotizaciones.cot_cotizacion_id
                },
                order: [
                    ['cotp_cotizaciones_productos_id', 'ASC']
                ],
            });



            var responde = {
                General_Lineas_Nuevos: General_Lineas_Nuevos,
                General_Lineas_Eliminada: General_Lineas_Eliminada,
                General_Lineas_Cantidad_Cambiaron: General_Lineas_Cantidad_Cambiaron,
                General_Lineas_Cambio_Tipo_Lista_Precio: General_Lineas_Cambio_Tipo_Lista_Precio,
                General_Lineas_Cambio_Precio_Base: General_Lineas_Cambio_Precio_Base,
                General_Lineas_Cambio_Precio_Promocion: General_Lineas_Cambio_Precio_Promocion,
                cotizacionSetReturn: cotizacionSetReturn,
                productos: productos,
                oldCotizaciones: oldCotizaciones,
                oldCotizacionesProductos: oldCotizacionesProductos,
                Cotizaciones: Cotizaciones,
                CotizacionesProductos: CotizacionesProductos
            }

            return responde
        }
        catch(e)
        {
            console.log(e)
            return "Error al obtener productos para cotizaciones"
        }
    },





    getPriceForCheaperProduct: async(socio_negocio_id, idCotizacion, prodSKU, cantidadProd) => {
        // Obtenemos el porcentaje de descuento para ese producto y cliente
        const discountPercentage = await sequelize.query(`
            SELECT * FROM
            ((
                SELECT
                    pd.promdes_descuento_exacto,
                    (CASE WHEN pd.promdes_tipo_descuento_id = 1000063 THEN
                        CAST(prod.prod_precio AS numeric) - ((CAST(prod.prod_precio AS numeric) / 100) * CAST(pd.promdes_descuento_exacto AS numeric))
                    ELSE
                        CAST(prod.prod_precio AS numeric) - (CAST(pd.promdes_descuento_exacto AS numeric))
                    END) as discount,
                    
                    (CASE WHEN pd.promdes_tipo_descuento_id = 1000063 THEN 1 ELSE 0 END) AS percent,
                    'Promo' AS sndes_tipo
                FROM productos_promociones pp
                    JOIN productos prod on prod.prod_sku = '${prodSKU}'
                    JOIN promociones_descuentos pd on pd.promdes_promocion_descuento_id = pp.prodprom_promdes_promocion_descuento_id
                where pp.prodprom_prod_producto_id = prod.prod_producto_id AND CURRENT_DATE BETWEEN pd.promdes_fecha_inicio_validez AND pd.promdes_fecha_finalizacion_validez
                AND pd.promdes_estatus_id = 1000059
            )
            UNION
            (
                SELECT 
                    snd.sndes_porcentaje_descuento as promdes_descuento_exacto,
                    CAST(prod.prod_precio AS numeric) - ((CAST(prod.prod_precio AS numeric) / 100) * CAST(snd.sndes_porcentaje_descuento AS numeric)) AS discount,
                    1 AS percent,
                    snd.sndes_tipo
                FROM socios_negocio AS sn
                JOIN socios_negocio_descuentos AS snd ON snd.sndes_cmm_estatus_id = 1000175
                AND current_date between  snd.sndes_fecha_inicio and snd.sndes_fecha_final
                AND sn.sn_cardcode = snd.sndes_codigo

                or (snd.sndes_tipo = 'Clientes' and snd.sndes_codigo = sn.sn_cardcode)
                or (snd.sndes_tipo = 'Grupo' and snd.sndes_codigo = sn.sn_codigo_grupo)
                or (snd.sndes_tipo = 'CLIENTES' and snd.sndes_codigo = 'TODOS')
                JOIN productos AS prod ON prod.prod_sku = '${prodSKU}'

                    WHERE sn.sn_socios_negocio_id = ${socio_negocio_id}
                    AND ((snd.sndes_subtipo = 'Articulos' AND snd.sndes_sub_codigo = prod.prod_sku)
                    OR (snd.sndes_subtipo = 'Fabricante' AND snd.sndes_sub_codigo = prod.prod_codigo_marca)
                    OR (snd.sndes_subtipo = 'PropArticulos' AND snd.sndes_sub_codigo in (
                        select (
                            SELECT string_agg(value::text, ', ') 
                            FROM json_array_elements_text(prod_codigo_prop_list) AS value
                        ) from productos where prod_sku = '${prodSKU}'
                        ))
                    OR (snd.sndes_subtipo = 'GrupoArticulos' AND snd.sndes_sub_codigo = prod.prod_codigo_grupo))
                order by snd.sndes_porcentaje_descuento desc limit 1
            )) AS discounts ORDER BY discount ASC LIMIT 1;
        `,
        {
        type: sequelize.QueryTypes.SELECT 
        });

        const discountPercent = discountPercentage[0] ? discountPercentage[0].promdes_descuento_exacto : 0;
        // Obtenemos el precio del producto y precio de lista
        const dataProduct = await sequelize.query(`
            (
                SELECT
                    prod.prod_producto_id,
                    round(CAST(prod.prod_precio AS numeric), 2) AS prod_precio,
                    
                    (CASE WHEN pro.moneda = 'USD' THEN
                        round(CAST(lpro.precio AS numeric) * CAST(cmm.cmm_valor AS numeric), 2)
                    ELSE
                        round(CAST(lpro.precio AS numeric), 2)
                    END) precioFinal,
                    
                    prod.prod_sku,
                    prod.prod_nombre,
                    
                    ( CASE WHEN ${cantidadProd} > prod.prod_total_stock
                        AND prod.prod_tipo_precio_base != 'Precio de Lista'
                        AND prod.prod_dias_resurtimiento > 0 THEN
                            prod.prod_total_stock
                        ELSE
                            ${cantidadProd}
                        END ) AS cantidad,
                    prod.prod_total_stock,
                    
                    ( CASE WHEN prod.prod_dias_resurtimiento > 0 THEN TRUE ELSE FALSE END ) AS aplicaBackOrder,
                    prod.prod_tipo_precio_base,
                    prod.prod_dias_resurtimiento,
                    
                    ( CASE WHEN 1 > prod.prod_total_stock
                        AND prod.prod_tipo_cambio_base != 'Precio de Lista'
                        AND prod.prod_dias_resurtimiento > 0 THEN
                            FALSE
                        ELSE
                            TRUE
                        END ) AS backOrderPrecioLista,
                    pro."idProyecto"
                    
                FROM socios_negocio AS sn
                JOIN proyectos AS pro ON pro."codigoCliente" = sn.sn_cardcode 
                    AND pro.estatus in ('Autorizado','Aprobado')
                    AND CURRENT_DATE < "date"(pro."fechaVencimiento")
                JOIN lineas_proyectos AS lpro ON lpro."idProyecto" = pro."id" AND lpro."codigoArticulo" = '${prodSKU}'
                JOIN controles_maestros_multiples AS cmm ON cmm.cmm_nombre = 'TIPO_CAMBIO_USD'
                JOIN productos AS prod ON prod.prod_sku = lpro."codigoArticulo"
                WHERE sn.sn_socios_negocio_id = 66
            )
            UNION
            ----------------------------- Consulta que busca los precios de lista -------------------------------
            (SELECT
                prod.prod_producto_id,
                
                round(CAST(prod.prod_precio AS numeric), 2) AS prod_precio,
                
                (CASE WHEN 
                        (CASE WHEN pldp.pl_tipo_moneda = 'USD' THEN
                            round(CAST(pldp.pl_precio_usd AS numeric) * CAST(cmm.cmm_valor AS numeric), 2)
                        ELSE
                            round(CAST(pldp.pl_precio_producto AS numeric), 2)
                        END) 
                            <
                        round(CAST(prod.prod_precio AS numeric), 2)
                    THEN
                        (CASE WHEN pldp.pl_tipo_moneda = 'USD' THEN
                            round(CAST(pldp.pl_precio_usd AS numeric) * CAST(cmm.cmm_valor AS numeric), 2)
                    ELSE
                        round(CAST(pldp.pl_precio_producto AS numeric), 2)
                    END)
                ELSE
                    round(CAST(prod.prod_precio AS numeric), 2)
                END) AS precioFinal,
                
                prod.prod_sku,
                prod.prod_nombre,
                
                ( CASE WHEN ${cantidadProd} > prod.prod_total_stock 
                    AND prod.prod_tipo_precio_base != 'Precio de Lista' 
                    AND prod.prod_dias_resurtimiento > 0 THEN
                        prod.prod_total_stock 
                    ELSE
                        ${cantidadProd}
                    END ) AS cantidad,
                prod.prod_total_stock,
                
                ( CASE WHEN prod.prod_dias_resurtimiento > 0 THEN TRUE ELSE FALSE END ) AS aplicaBackOrder,
                prod.prod_tipo_precio_base,
                prod.prod_dias_resurtimiento,
                
                ( CASE WHEN ${cantidadProd} > prod.prod_total_stock 
                    AND prod.prod_tipo_cambio_base != 'Precio de Lista' 
                    AND prod.prod_dias_resurtimiento > 0 THEN 
                        FALSE 
                    ELSE 
                        TRUE
                    END ) AS backOrderPrecioLista,

                null AS idProyecto
            FROM
                productos AS prod
                JOIN listas_de_precios AS ldp ON ldp.listp_nombre = prod.prod_tipo_precio_base
                JOIN productos_lista_de_precio AS pldp ON pldp.pl_listp_lista_de_precio_id = ldp.listp_lista_de_precio_id 
                    AND pldp.pl_prod_producto_id = prod.prod_producto_id
                JOIN controles_maestros_multiples AS cmm ON cmm.cmm_nombre = 'TIPO_CAMBIO_USD'

            WHERE
                prod_sku = '${prodSKU}')  
        `,
        {
            type: sequelize.QueryTypes.SELECT 
        });
        
        const filteredPrice = dataProduct.map((item) => {
            const precioFinal = (item.idProyecto
                ? Number(item.preciofinal)
                : Number(item.preciofinal) - ((Number(item.preciofinal)/100) * discountPercent))
                    .toFixed(2);
            const precioDescuento = (item.idProyecto
                ? 0
                : ((Number(item.preciofinal)/100) * discountPercent))
                    .toFixed(2);
            const porcentajeDescuento = item.idProyecto ? 0 : discountPercent;
            return {
                ...item, prod_precio: Number(item.prod_precio),
                preciofinal: Number(precioFinal),
                precioDescuento: Number(precioDescuento),
                porcentajeDescuento,
            }
        });

        const filteredPriceLow = filteredPrice.reduce((min, obj) => 
            (obj.preciofinal < min.preciofinal ? obj : min),
            filteredPrice[0]);

        return filteredPriceLow;
    },






    // PASO 1
    cotizacionesObtenerProductos: async function (body) {
        try
        {
            var productosArray
            if(body.cot_prospecto == false)
            {
                const constCarritoDeCompra = await models.CarritoDeCompra.findOne(
                {
                    where: {
                        cdc_sn_socio_de_negocio_id: body.cdc_sn_socio_de_negocio_id
                    }
                });

                const constProductoCarritoDeCompra = await models.ProductoCarritoDeCompra.findAll(
                {
                    where: {
                        pcdc_carrito_de_compra_id: constCarritoDeCompra.cdc_carrito_de_compra_id
                    }
                });

                if(constProductoCarritoDeCompra)
                {
                    var arrayProductosID = []
                    for (var f = 0; f < constProductoCarritoDeCompra.length; f++) 
                    {
                        var temp = 
                        {
                            prod_producto_id: constProductoCarritoDeCompra[f].dataValues.pcdc_prod_producto_id,
                            cantidad: constProductoCarritoDeCompra[f].dataValues.pcdc_producto_cantidad
                        }

                        arrayProductosID.push(temp)
                    }
                    productosArray = arrayProductosID
                }
                else
                {
                    productosArray = null

                }
            }
            else
            {
                productosArray = body.cot_productos
            }

            return productosArray
        }
        catch(e)
        {
            console.log(e)
            return "Error al obtener productos para cotizaciones"
        }
    },

    // PASO 1 - Validar cambios en precios (UPDATE) cotizaciones (Obtener productos desde la cotizacion y no del carrito o arreglo que se pide)
    cotizacionesObtenerProductosCotizacionesCambios: async function (body, cot_cotizacion_id) {
        try
        {
            var productosArray

            const tempConstCotizacionesProductos = await models.CotizacionesProductos.findAll(
            {
                where: {
                    cotp_cotizacion_id: cot_cotizacion_id
                },
                attributes: ['cotp_prod_producto_id', [sequelize.fn('sum', sequelize.col('cotp_producto_cantidad')), 'cotp_producto_cantidad']],
                group: ['cotp_prod_producto_id']
            });


            // console.log(tempConstCotizacionesProductos)

            var arrayProductosID = []
            for (var f = 0; f < tempConstCotizacionesProductos.length; f++) 
            {
                var temp = 
                {
                    prod_producto_id: tempConstCotizacionesProductos[f].dataValues.cotp_prod_producto_id,
                    cantidad: tempConstCotizacionesProductos[f].dataValues.cotp_producto_cantidad
                }

                arrayProductosID.push(temp)
            }
            productosArray = arrayProductosID

            return productosArray
        }
        catch(e)
        {
            console.log(e)
            return "Error al obtener productos para cotizaciones"
        }
    },


    // PASO 2
    cotizacionesObtenerInfoBaseProductos: async function (body, productos) {
        try
        {
            if(productos.length > 0)
            {
                //Obtener precios base y final con descuento de grupo
                var productosForInt = productos.length
                for (var i = 0; i < productosForInt; i++) 
                {
                    var cantidad = productos[i].cantidad
                    //Informacion base de productos sustituye el id del producto por toda la informacion del producto
                    const constProducto = await models.Producto.findOne(
                    {
                        where: {
                            prod_producto_id: productos[i].prod_producto_id
                        }
                    });

                    //Settear cantidades solicitadas
                    constProducto.dataValues.cantidad = cantidad

                    //Settear Aplica BackOrder
                    if(constProducto.prod_dias_resurtimiento > 0){
                        constProducto.dataValues.aplicaBackOrder = true
                    }
                    else{
                        constProducto.dataValues.aplicaBackOrder = false
                    }

                    //Settear si el backOrderSeraListaDePrecioSiEsStockInactivoOHastaAgotarExistencia
                    //Comparar stock y ver si es diferente de lista de precios y si es backorder
                    if(constProducto.dataValues.cantidad > constProducto.dataValues.prod_total_stock
                        && constProducto.dataValues.prod_tipo_precio_base != 'Precio de Lista'
                         && constProducto.dataValues.prod_dias_resurtimiento > 0)
                    {
                        var cantidadOriginal = constProducto.dataValues.cantidad
                        constProducto.dataValues.backOrderPrecioLista = false
                        constProducto.dataValues.cantidad = constProducto.dataValues.prod_total_stock

                        const newElemento = await models.Producto.findOne(
                        {
                            where: {
                                prod_producto_id: productos[i].prod_producto_id
                            }
                        });

                        var newCantidad = constProducto.dataValues.prod_total_stock - cantidadOriginal
                        if(newCantidad < 0)
                        {
                            newCantidad = newCantidad*-1
                        }
                        //Settear Aplica BackOrder para el nuevo elemento
                        if(newElemento.prod_dias_resurtimiento > 0){
                            newElemento.dataValues.aplicaBackOrder = true
                        }
                        else{
                            newElemento.dataValues.aplicaBackOrder = false
                        }

                        newElemento.dataValues.cantidad = newCantidad
                        newElemento.dataValues.backOrderPrecioLista = true
                        newElemento.dataValues.prod_tipo_precio_base = 'Precio de Lista'

                        productos.push(newElemento)
                    }
                    else
                    {
                        constProducto.dataValues.backOrderPrecioLista = false
                    }
                    productos[i] = constProducto
                }   //End for
            }

            return productos
        }
        catch(e)
        {
            console.log(e)
            return "Error al obtener la informacion base de los productos para cotizaciones"
        }
    },


    // PASO 3
    cotizacionesObtenerLineasProductos: async function (body, productos) {
        try
        {
            var lineasProductos
            if(body.cot_prospecto == false)
            {
                lineasProductos = await getCheckout.getCotizacionLineasProductosDividirSIyHAEtoPrecioLista(
                    body.cot_prospecto,
                    body.cdc_sn_socio_de_negocio_id,
                    body.tipo_envio,
                    body.snd_direcciones_id,
                    body.recoleccion_almacen_id,
                    3,
                    productos
                );
            }
            else
            {
                lineasProductos = await getCheckout.getCotizacionLineasProductosDividirSIyHAEtoPrecioLista(
                    body.cot_prospecto,
                    body.up_usuarios_prospectos_id,
                    body.tipo_envio,
                    body.upd_direcciones_id,
                    body.recoleccion_almacen_id,
                    3,
                    productos
                );
            }

            return lineasProductos
        }
        catch(e)
        {
            console.log(e)
            return "Error al obtener la informacion base de los productos para cotizaciones"
        }
    },




    // PASO 4
    cotizacionesObtenerInformacionDeLineas: async function (body, productos, lineasProductos) {
        try
        {
            if(lineasProductos.length > 0)
            {
                //Obtener precios base y final con descuento de grupo
                for (var i = 0; i < lineasProductos.length; i++) 
                {
                    var cantidad = lineasProductos[i].pcf_cantidad_producto

                    //Informacion base de productos sustituye el id del producto por toda la informacion del producto
                    const constProducto = await models.Producto.findOne(
                    {
                        where: {
                            prod_producto_id: lineasProductos[i].pcf_prod_producto_id
                        }
                    });

                    //Settear cantidades solicitadas
                    constProducto.dataValues.cantidad = cantidad

                    //Settear Aplica BackOrder
                    if(constProducto.prod_dias_resurtimiento > 0){
                        constProducto.dataValues.aplicaBackOrder = true
                    }
                    else{
                        constProducto.dataValues.aplicaBackOrder = false
                    }

                    constProducto.dataValues.pcf_prod_producto_id = lineasProductos[i].pcf_prod_producto_id
                    constProducto.dataValues.pcf_cantidad_producto = lineasProductos[i].pcf_cantidad_producto
                    constProducto.dataValues.pcf_almacen_linea = lineasProductos[i].pcf_almacen_linea
                    constProducto.dataValues.pcf_recoleccion_resurtimiento = lineasProductos[i].pcf_recoleccion_resurtimiento
                    constProducto.dataValues.pcf_is_backorder = lineasProductos[i].pcf_is_backorder
                    constProducto.dataValues.pcf_dias_resurtimiento = lineasProductos[i].pcf_dias_resurtimiento
                    constProducto.dataValues.pcf_backorder_precio_lista = lineasProductos[i].pcf_backorder_precio_lista
                    constProducto.dataValues.pcf_tipo_precio_lista = lineasProductos[i].pcf_tipo_precio_lista
                    constProducto.dataValues.pcf_backorder_fecha_envio_pendiente = lineasProductos[i].pcf_backorder_fecha_envio_pendiente

                    //Obtener Precio Real y settearlo
                    if(lineasProductos[i].pcf_tipo_precio_lista == 'Precio de Lista' && lineasProductos[i].pcf_backorder_precio_lista == true)
                    {
                        const constListaPrecio = await models.ListaPrecio.findOne(
                        {
                            where: {
                                listp_nombre: lineasProductos[i].pcf_tipo_precio_lista
                            }
                        });

                        if(constListaPrecio)
                        {
                            const constProductoListaPrecio = await models.ProductoListaPrecio.findOne(
                            {
                                where: {
                                    pl_listp_lista_de_precio_id: constListaPrecio.listp_lista_de_precio_id,
                                    pl_prod_producto_id: lineasProductos[i].pcf_prod_producto_id
                                }
                            });

                            if(constProductoListaPrecio)
                            {
                                constProducto.dataValues.pcf_precio_base_venta = constProductoListaPrecio.pl_precio_producto
                                constProducto.dataValues.prod_precio = constProductoListaPrecio.pl_precio_producto
                                constProducto.dataValues.prod_tipo_precio_base = 'Precio de Lista'
                            }
                        }
                    }
                    else
                    {   
                        constProducto.dataValues.pcf_precio_base_venta = constProducto.dataValues.prod_precio
                    }
                    productos[i] = constProducto

                }   //End for

                return productos
            }   //end if productos lenght
            else
            {
                return "Esta vacio obtener informacion de productos 2"
            }

            
        }
        catch(e)
        {
            console.log(e)
            return "Error al obtener la informacion base de los productos para cotizaciones"
        }
    },



    //PASO 5
    cotizacionesObtenerPromocionesProductos: async function (body, productos, lineasProductos, socio_de_negocio_id) {
        try
        {
            const { cmm_valor: USDValor } = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_nombre: "TIPO_CAMBIO_USD"
                },
                attributes: ["cmm_valor"]
            });
            console.log('USDValor ---> ', USDValor);
            // console.log(1111)
            // console.log(productos.length)
            // console.log(2222)
            var tipoImpuesto = 16
            //Obtener informacion de impuesto de SN o Prospecto
                if(body.cot_prospecto == false)
                {
                    //Si es SN y envio a domicilio
                    if(body.tipo_envio == 16)
                    {
                        
                        const constSociosNegocio = await models.SociosNegocio.findOne(
                        {
                            where: {
                                sn_socios_negocio_id: body.cdc_sn_socio_de_negocio_id
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
                    }
                    else
                    {
                        tipoImpuesto = 16
                    }
                }
                else
                {
                    //Si es prospecto y envio a domicilio
                    if(body.tipo_envio == 16)
                    {
                        //Informacion Socio de negocio / Direccoin facturacion para impuestos
                        const constDireccionProspecto = await models.UsuariosProspectosDirecciones.findOne(
                        {
                            where: {
                                upd_direcciones_id: body.upd_direcciones_id
                            }
                        });

                        if(constDireccionProspecto)
                        {
                            const constCodigosPostales = await models.CodigosPostales.findOne(
                            {
                                where: {
                                    cp_codigo_postal: constDireccionProspecto.upd_codigo_postal
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
                    }
                    else
                    {
                        tipoImpuesto = 16
                    }
                }
            //Fin Obtener informacion de impuesto de SN o Prospecto

            //Obtener precios base y final con descuento de grupo
            for (var i = 0; i < productos.length; i++) 
            {
                const dataProduct = await sequelize.query(`
                    SELECT lpro.*, pro.moneda, pro."idProyecto" FROM socios_negocio AS sn
                    INNER JOIN proyectos AS pro ON pro."codigoCliente" = sn.sn_cardcode
                    INNER JOIN lineas_proyectos AS lpro ON lpro."idProyecto" = pro."id"
                    WHERE sn.sn_socios_negocio_id = '${socio_de_negocio_id}'
                    AND lpro."codigoArticulo" = '${productos[i].dataValues.prod_sku}'
                    AND pro.estatus in ('Autorizado','Aprobado') AND CURRENT_DATE < "date"(pro."fechaVencimiento")`,
                {
                    type: sequelize.QueryTypes.SELECT 
                });
                console.log('dataProduct ---> ', dataProduct);
                // console.log(888888777)
                // console.log(productos[i])
                //--NO GENERA PRECIOS FINALES
                //PROMOCION
                    //Si es stock inactivo no tendra ni revisara descuentos
                    if(productos[i].dataValues.prod_es_stock_inactivo == true)
                    {
                        productos[i].dataValues.promocion = []
                    }
                    else
                    {
                        //Obtener Mejor Promocion y precio final
                        var mejorPromocionPrecio = await productosUtils.getBestPromotionForProduct(productos[i].dataValues.prod_producto_id);

                        // //Sett variable de promocion en el arreglo inicial
                        productos[i].dataValues.promocion = mejorPromocionPrecio
                    }
                //END PROMOCION

                //--NO GENERA PRECIOS FINALES
                //DESCUENTOS SN/GRUPO/DIELSA
                    //Si es stock inactivo no tendra ni revisara descuentos
                    if(productos[i].dataValues.prod_es_stock_inactivo == true)
                    {
                        productos[i].dataValues.descuentoGrupoBool = false
                        productos[i].dataValues.descuentoGrupo = 0
                        productos[i].dataValues.snDescuento = 0
                    }
                    //Si es cliente ID buscara descuentos de grupo
                    else
                    {
                        var constSociosNegocio = ''
                        var infoUsuarioForDiscount = {
                            "sn_socios_negocio_id": '',
                            "sn_cardcode": '',
                            "sn_codigo_direccion_facturacion": '',
                            "sn_lista_precios": '',
                            "sn_codigo_grupo": '',
                            "sn_porcentaje_descuento_total": ''
                        }

                        if(body.cot_prospecto == false)
                        {
                            //Obtener info SN
                            constSociosNegocio = await models.SociosNegocio.findOne(
                            {
                                where: {
                                    sn_socios_negocio_id: body.cdc_sn_socio_de_negocio_id
                                },
                                attributes:  ["sn_socios_negocio_id", "sn_cardcode", "sn_codigo_direccion_facturacion", "sn_lista_precios", "sn_codigo_grupo",
                                "sn_porcentaje_descuento_total"]
                            });
                            // console.log(constSociosNegocio)

                            if(constSociosNegocio)
                            {
                                infoUsuarioForDiscount = {
                                    "sn_socios_negocio_id": constSociosNegocio.sn_socios_negocio_id,
                                    "sn_cardcode": constSociosNegocio.sn_cardcode,
                                    "sn_codigo_direccion_facturacion": constSociosNegocio.sn_codigo_direccion_facturacion,
                                    "sn_lista_precios": constSociosNegocio.sn_lista_precios,
                                    "sn_codigo_grupo": constSociosNegocio.sn_codigo_grupo,
                                    "sn_porcentaje_descuento_total": constSociosNegocio.sn_porcentaje_descuento_total
                                }
                            }
                        }
                        

                        //
                        var descuentoGrupo = await productosUtils.getSocioNegocioAndProspectoDiscountPerProductForCotizaciones(productos[i].dataValues, infoUsuarioForDiscount);

                        if(body.cot_prospecto == false)
                        {
                            // console.log(99999888888888)
                            // console.log(descuentoGrupo)
                            if(descuentoGrupo > 0 || constSociosNegocio.sn_porcentaje_descuento_total > 0)
                            {
                                productos[i].dataValues.descuentoGrupoBool = true
                                productos[i].dataValues.descuentoGrupo = descuentoGrupo
                                productos[i].dataValues.snDescuento = parseFloat(constSociosNegocio.sn_porcentaje_descuento_total)
                            }
                            else
                            {
                                productos[i].dataValues.descuentoGrupoBool = false
                                productos[i].dataValues.descuentoGrupo = 0
                                productos[i].dataValues.snDescuento = parseFloat(constSociosNegocio.sn_porcentaje_descuento_total)
                            }
                        }
                        else
                        {
                            if(descuentoGrupo > 0)
                            {
                                productos[i].dataValues.descuentoGrupoBool = true
                                productos[i].dataValues.descuentoGrupo = descuentoGrupo
                                productos[i].dataValues.snDescuento = 0
                            }
                            else
                            {
                                productos[i].dataValues.descuentoGrupoBool = false
                                productos[i].dataValues.descuentoGrupo = 0
                                productos[i].dataValues.snDescuento = 0
                            }
                        }


                        var totalPromocion = 0
                        var tipoDescuento = ''

                        var precioTemporal = productos[i].dataValues.prod_precio

                        //Si tiene descuento de SN se generara ese descuento
                        if(productos[i].dataValues.descuentoGrupoBool == true)
                        {
                            //totalTemp es el resultado que queda
                            var totalTemp = 0

                            //Total acumulado es el total de descuento en INT
                            var totalAcumulado = 0

                            //$300   56% descuento   168 total
                            //Descuento por lista de precios grupos
                            if(productos[i].dataValues.descuentoGrupo > 0)
                            {
                                totalTemp = precioTemporal - (((productos[i].dataValues.descuentoGrupo/100) * precioTemporal))
                                totalAcumulado = (((productos[i].dataValues.descuentoGrupo/100) * precioTemporal))
                            }

                            //$300   56% descuento   168 total por grupo y 50% del SN = 84
                            if(productos[i].dataValues.snDescuento > 0)
                            {
                                //Si es mayor que 0 significa que primero tomara el primer descuento y luego este si no solo lo hara directo
                                if(totalAcumulado > 0)
                                {
                                    totalAcumulado = totalAcumulado + (((productos[i].dataValues.snDescuento/100) * totalTemp))
                                    totalTemp = totalTemp - (((productos[i].dataValues.snDescuento/100) * totalTemp))
                                }
                                else
                                {
                                    totalAcumulado = (((productos[i].dataValues.snDescuento/100) * precioTemporal))
                                    totalTemp = precioTemporal - (((productos[i].dataValues.snDescuento/100) * precioTemporal))
                                }
                            }

                            if(totalPromocion < totalAcumulado)
                            {
                                totalPromocion = totalAcumulado
                                tipoDescuento = "Grupos SN"
                            }
                            else
                            {
                                totalPromocion = 0
                                tipoDescuento = "Precio Base"
                            }

                        }
                        else
                        {
                            totalPromocion = 0
                            tipoDescuento = "Precio Base"
                        }

                        productos[i].dataValues.totalPromocion = totalPromocion
                        productos[i].dataValues.tipoDescuento = tipoDescuento
                        productos[i].dataValues.precioBaseMenosDescuentoGrupo = productos[i].dataValues.prod_precio - totalPromocion
                    }
                //END DESCUENTOS SN/GRUPO/DIELSA




                //Totales finales
                var precioTotal = 0
                var precioFinalTotal = 0

                //total de descuentos en todos los productos
                var totalDescuentosPromociones = 0

                //Precio Base
                // console.log(productos[i].dataValues.prod_precio)
                // console.log(999888)
                var precioBase = productos[i].dataValues.prod_precio
                var precioTemporal = productos[i].dataValues.prod_precio
                var totalDescuentoTemporal = 0
                //Dejar cupon vacio para errores
                productos[i].dataValues.cupon = []

                // console.log("HAST AQUI TODO BIEN")

                //Si tiene promocion, descuento o cupon activo el producto calculara el precio
                if(productos[i].dataValues.promocion.length > 0 || (productos[i].dataValues.cupon.length > 0 || productos[i].dataValues.cupon.promcup_aplica_todo_carrito == false) || productos[i].dataValues.descuentoGrupoBool == true)
                {   
                    // console.log(111111)
                    //V4
                    var totalPromocion = 0
                    var tipoDescuento = ''
                    var totalDescuentoPorcentual = 0

                    //BUSCAR PROMOCION ACTIVA PCC MONTO FIJO
                    if(productos[i].dataValues.promocion.length > 0)
                    {
                        if(productos[i].dataValues.promocion[0].cmm_valor == "Monto fijo")
                        {   
                            if(totalPromocion < productos[i].dataValues.promocion[0].promdes_descuento_exacto)
                            {
                                totalPromocion = productos[i].dataValues.promocion[0].promdes_descuento_exacto
                                tipoDescuento = "Monto fijo"
                            }
                        }
                    }


                    // console.log(22222)
                    //BUSCAR PROMOCION ACTIVA PCC PORCENTUAL
                    if(productos[i].dataValues.promocion.length > 0)
                    {
                        //Calcular precio promocion activa
                        if(productos[i].dataValues.promocion[0].cmm_valor == "Porcentaje")
                        {   
                            //Valor de la promocion por porcentaje
                            var porcentajePromocion = productos[i].dataValues.promocion[0].promdes_descuento_exacto

                            //base - descuento = total Descuento
                            var totalDescuento = (((porcentajePromocion/100) * precioTemporal).toFixed(2))

                            if(totalPromocion < totalDescuento)
                            {
                                totalPromocion = totalDescuento
                                tipoDescuento = "Porcentaje"
                            }
                        }
                    }

                    // console.log(33333)
                    //BUSCAR DESCUENTOS grupo/marca/dielsa
                    if(productos[i].dataValues.descuentoGrupoBool == true)
                    {
                        //totalTemp es el resultado que queda
                        var totalTemp = 0

                        //Total acumulado es el total de descuento en INT
                        var totalAcumulado = 0


                        //$300   56% descuento   168 total
                        //Descuento por lista de precios grupos
                        if(productos[i].dataValues.descuentoGrupo > 0)
                        {
                            totalTemp = precioTemporal - (((productos[i].dataValues.descuentoGrupo/100) * precioTemporal))
                            totalAcumulado = (((productos[i].dataValues.descuentoGrupo/100) * precioTemporal))
                        }

                        //$300   56% descuento   168 total por grupo y 50% del SN = 84
                        if(productos[i].dataValues.snDescuento > 0)
                        {
                            //Si es mayor que 0 significa que primero tomara el primer descuento y luego este si no solo lo hara directo
                            if(totalAcumulado > 0)
                            {
                                totalAcumulado = totalAcumulado + (((productos[i].dataValues.snDescuento/100) * totalTemp))
                                totalTemp = totalTemp - (((productos[i].dataValues.snDescuento/100) * totalTemp))
                                
                            }
                            else
                            {
                                totalAcumulado = (((productos[i].dataValues.snDescuento/100) * precioTemporal))
                                totalTemp = precioTemporal - (((productos[i].dataValues.snDescuento/100) * precioTemporal))
                            }
                        }

                        //OBTENER CUAL PROMOCION ES MEJOR SI PCC O DESCUENTO GRUPO DIELSA
                        if(totalPromocion < totalAcumulado)
                        {
                            totalPromocion = totalAcumulado
                            tipoDescuento = "Grupos SN"
                        }
                    }


                    // console.log(44444)
                    //Calcular precio final base
                    var precioMenosPromo = precioTemporal-totalPromocion
                    if(precioMenosPromo < 0)
                    {
                        precioMenosPromo = 0
                    }


                    //TOTAL PROMOCION
                    //Valores de promocion/descuento antes de cupon
                    var cantidadPromocion = totalPromocion
                    precioTemporal = precioMenosPromo
                    console.log('precioMenosPromo ---> ', precioMenosPromo);
                    productos[i].dataValues.precioDespuesDePromocion = precioTemporal.toFixed(2)
                    productos[i].dataValues.cantidadDescuentoPromocion = cantidadPromocion

                    //Calculara el total de descuentos por promocion
                    totalDescuentoTemporal = totalDescuentoTemporal + cantidadPromocion
                    totalDescuentosPromociones = totalDescuentosPromociones + (cantidadPromocion * productos[i].dataValues.pcdc_producto_cantidad)






                    // console.log(55555)
                    //Verificara si la promocion es mayor que la promocion de sn para dejar un doble promotion (cosas dielsa)
                    var precioPromocionDielsaBool = false
                    var DescuentoSNFijo = 0
                    if(productos[i].dataValues.promocion.length > 0 && productos[i].dataValues.descuentoGrupoBool == true)
                    {
                        if(tipoDescuento == "Porcentaje" || tipoDescuento == 'Monto fijo')
                        {
                            precioPromocionDielsaBool = true
                            var DescuentoSNFijo = productos[i].dataValues.prod_precio

                            if(productos[i].dataValues.descuentoGrupo > 0)
                            {
                                DescuentoSNFijo = DescuentoSNFijo - (DescuentoSNFijo * (productos[i].dataValues.descuentoGrupo / 100))
                            }

                            if(productos[i].dataValues.snDescuento > 0)
                            {
                                DescuentoSNFijo = DescuentoSNFijo - (DescuentoSNFijo * (productos[i].dataValues.snDescuento / 100))
                            }
                        }
                    }
                    productos[i].dataValues.precioPromocionDielsaBool = precioPromocionDielsaBool
                    productos[i].dataValues.DescuentoDielsaFijo = DescuentoSNFijo

                    // console.log(6666)
                    //variables tipo v4
                    //Tipo de promocion final
                    productos[i].dataValues.tipoPromocionFinal = tipoDescuento

                    //total de promocion (precio prod - promocion o descuento (sin iva))
                    productos[i].dataValues.totalDescuentoFinal = parseFloat(totalPromocion)

                    //envio + 3%
                    // if(constCarritoDeCompra.cdc_forma_pago_codigo == "28" || constCarritoDeCompra.cdc_forma_pago_codigo == "04")
                    if(false)
                    {
                        productos[i].dataValues.precioFinal = parseFloat((precioTemporal * 1.03).toFixed(2))
                    }
                    else
                    {
                        if(dataProduct[0]) {
                            if(dataProduct[0].precio < precioTemporal 
                            || precioTemporal == 0) {
                                precioTemporal = dataProduct[0].moneda === 'MXP'
                                    ? Number(dataProduct[0].precio)
                                    : Number(dataProduct[0].precio) * USDValor;
                            }
                        }
                        productos[i].dataValues.precioFinal = parseFloat((precioTemporal).toFixed(2))
                    }
                    
                    // console.log(77777)
                    productos[i].dataValues.precioFinalMasImpuesto = (productos[i].dataValues.precioFinal * (1 + (tipoImpuesto / 100)))
                    productos[i].dataValues.precioFinalMasImpuesto = parseFloat(productos[i].dataValues.precioFinalMasImpuesto.toFixed(2))
                    productos[i].dataValues.totalDescuento = parseFloat(totalDescuentoTemporal)
                }
                //si no tiene promocion solo calculara plano
                else
                {
                    // console.log(999999)
                    // //envio + 3%
                    // if(constCarritoDeCompra.cdc_forma_pago_codigo == "28" || constCarritoDeCompra.cdc_forma_pago_codigo == "04")
                    if(false)
                    {
                        productos[i].dataValues.precioFinal = parseFloat((precioBase * 1.03).toFixed(2))
                    }
                    else
                    {
                        if(dataProduct[0]) {
                            if(dataProduct[0].precio < precioBase 
                            || precioBase == 0) {
                                precioBase = dataProduct[0].moneda === 'MXP'
                                    ? Number(dataProduct[0].precio)
                                    : Number(dataProduct[0].precio) * USDValor;
                            }
                        }
                        productos[i].dataValues.precioFinal = parseFloat((precioBase).toFixed(2))
                    }
                    productos[i].dataValues.precioFinalMasImpuesto = (productos[i].dataValues.precioFinal * (1 + (tipoImpuesto / 100)))
                    productos[i].dataValues.precioFinalMasImpuesto = parseFloat(productos[i].dataValues.precioFinalMasImpuesto.toFixed(2))
                    productos[i].dataValues.totalDescuento = 0
                }

                // console.log(888888)

                // V5?
                var tempPrecioBase = productos[i].dataValues.prod_precio
                var tempPrecioFinal = productos[i].dataValues.precioFinal

                var porcentajeDescuentoTemporal = 100-((tempPrecioFinal*100)/tempPrecioBase)

                productos[i].dataValues.totalDescuentoPorcentual = parseFloat(porcentajeDescuentoTemporal.toFixed(2))

                console.log('tempPrecioBase ---> ', tempPrecioBase);
                console.log('tempPrecioFinal ---> ', tempPrecioFinal);











                //CALCULAR USD
                const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
                {
                    where: {
                        cmm_nombre: "TIPO_CAMBIO_USD"
                    }
                });
                var USDValor = constControlMaestroMultiple.cmm_valor


                if(productos[i].dataValues.prod_precio > 0)
                {
                    productos[i].dataValues.precioBaseFinal_USD = parseFloat((productos[i].dataValues.prod_precio/USDValor).toFixed(2))
                }
                else
                {
                    productos[i].dataValues.precioBaseFinal_USD = 0
                }

                if(productos[i].dataValues.totalDescuento > 0)
                {
                    productos[i].dataValues.totalDescuento_USD = parseFloat((productos[i].dataValues.totalDescuento/USDValor).toFixed(2))
                }
                else
                {
                    productos[i].dataValues.totalDescuento_USD = 0
                }

                if(productos[i].dataValues.DescuentoDielsaFijo > 0)
                {
                    productos[i].dataValues.DescuentoDielsaFijo_USD = parseFloat((productos[i].dataValues.DescuentoDielsaFijo/USDValor).toFixed(2))
                }
                else
                {
                    productos[i].dataValues.DescuentoDielsaFijo_USD = 0
                }

                if(productos[i].dataValues.precioFinal > 0)
                {
                    productos[i].dataValues.precioFinal_USD = parseFloat((productos[i].dataValues.precioFinal/USDValor).toFixed(2))
                }
                else
                {
                    productos[i].dataValues.precioFinal_USD = 0
                }


            }

            return productos
            
        }
        catch(e)
        {
            console.log(e)
            return "Error al obtener la informacion base de los productos para cotizaciones"
        }
    },
    cotizacionesObtenerPromocionesProductosOneProductCotInicio: async function (body, productos, lineasProductos) {
        try
        {
            console.log(1111)
            console.log(productos)
            console.log(2222)
            var tipoImpuesto = 16
            //Obtener informacion de impuesto de SN o Prospecto
                if(body.cot_prospecto == false)
                {
                    //Si es SN y envio a domicilio
                    if(body.tipo_envio == 16)
                    {
                        
                        const constSociosNegocio = await models.SociosNegocio.findOne(
                        {
                            where: {
                                sn_socios_negocio_id: body.cdc_sn_socio_de_negocio_id
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
                    }
                    else
                    {
                        tipoImpuesto = 16
                    }
                }
                else
                {
                    //Si es prospecto y envio a domicilio
                    if(body.tipo_envio == 16)
                    {
                        //Informacion Socio de negocio / Direccoin facturacion para impuestos
                        const constDireccionProspecto = await models.UsuariosProspectosDirecciones.findOne(
                        {
                            where: {
                                upd_direcciones_id: body.upd_direcciones_id
                            }
                        });

                        if(constDireccionProspecto)
                        {
                            const constCodigosPostales = await models.CodigosPostales.findOne(
                            {
                                where: {
                                    cp_codigo_postal: constDireccionProspecto.upd_codigo_postal
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
                    }
                    else
                    {
                        tipoImpuesto = 16
                    }
                }
            //Fin Obtener informacion de impuesto de SN o Prospecto

            //Obtener precios base y final con descuento de grupo
            for (var i = 0; i < 1; i++) 
            {
                console.log(888888777)
                console.log(productos)
                //--NO GENERA PRECIOS FINALES
                //PROMOCION
                    //Si es stock inactivo no tendra ni revisara descuentos
                    if(productos.dataValues.cotp_tipo_precio_lista != 'Precio de Lista')
                    {
                        productos.dataValues.promocion = []
                    }
                    else
                    {
                        //Obtener Mejor Promocion y precio final
                        var mejorPromocionPrecio = await productosUtils.getBestPromotionForProduct(productos.dataValues.cotp_prod_producto_id);

                        // //Sett variable de promocion en el arreglo inicial
                        productos.dataValues.promocion = mejorPromocionPrecio
                    }
                //END PROMOCION

                console.log(7777777)
                console.log("PASO PROMOCIONES")

                //--NO GENERA PRECIOS FINALES
                //DESCUENTOS SN/GRUPO/DIELSA
                    //Si es stock inactivo no tendra ni revisara descuentos
                    if(productos.dataValues.cotp_tipo_precio_lista != 'Precio de Lista')
                    {
                        productos.dataValues.descuentoGrupoBool = false
                        productos.dataValues.descuentoGrupo = 0
                        productos.dataValues.snDescuento = 0
                    }
                    //Si es cliente ID buscara descuentos de grupo
                    else
                    {
                        var constSociosNegocio = ''
                        var infoUsuarioForDiscount = {
                            "sn_socios_negocio_id": '',
                            "sn_cardcode": '',
                            "sn_codigo_direccion_facturacion": '',
                            "sn_lista_precios": '',
                            "sn_codigo_grupo": '',
                            "sn_porcentaje_descuento_total": ''
                        }

                        if(body.cot_prospecto == false)
                        {
                            //Obtener info SN
                            constSociosNegocio = await models.SociosNegocio.findOne(
                            {
                                where: {
                                    sn_socios_negocio_id: body.cdc_sn_socio_de_negocio_id
                                },
                                attributes:  ["sn_socios_negocio_id", "sn_cardcode", "sn_codigo_direccion_facturacion", "sn_lista_precios", "sn_codigo_grupo",
                                "sn_porcentaje_descuento_total"]
                            });
                            console.log(constSociosNegocio)

                            if(constSociosNegocio)
                            {
                                infoUsuarioForDiscount = {
                                    "sn_socios_negocio_id": constSociosNegocio.sn_socios_negocio_id,
                                    "sn_cardcode": constSociosNegocio.sn_cardcode,
                                    "sn_codigo_direccion_facturacion": constSociosNegocio.sn_codigo_direccion_facturacion,
                                    "sn_lista_precios": constSociosNegocio.sn_lista_precios,
                                    "sn_codigo_grupo": constSociosNegocio.sn_codigo_grupo,
                                    "sn_porcentaje_descuento_total": constSociosNegocio.sn_porcentaje_descuento_total
                                }
                            }
                        }
                        

                        //
                        var descuentoGrupo = await productosUtils.getSocioNegocioAndProspectoDiscountPerProductForCotizaciones(productos.dataValues, infoUsuarioForDiscount);
                        console.log(descuentoGrupo)


                        if(body.cot_prospecto == false)
                        {
                            console.log(99999888888888)
                            console.log(descuentoGrupo)
                            if(descuentoGrupo > 0 || constSociosNegocio.sn_porcentaje_descuento_total > 0)
                            {
                                productos.dataValues.descuentoGrupoBool = true
                                productos.dataValues.descuentoGrupo = descuentoGrupo
                                productos.dataValues.snDescuento = parseFloat(constSociosNegocio.sn_porcentaje_descuento_total)
                            }
                            else
                            {
                                productos.dataValues.descuentoGrupoBool = false
                                productos.dataValues.descuentoGrupo = 0
                                productos.dataValues.snDescuento = parseFloat(constSociosNegocio.sn_porcentaje_descuento_total)
                            }
                        }
                        else
                        {
                            if(descuentoGrupo > 0)
                            {
                                productos.dataValues.descuentoGrupoBool = true
                                productos.dataValues.descuentoGrupo = descuentoGrupo
                                productos.dataValues.snDescuento = 0
                            }
                            else
                            {
                                productos.dataValues.descuentoGrupoBool = false
                                productos.dataValues.descuentoGrupo = 0
                                productos.dataValues.snDescuento = 0
                            }
                        }


                        var totalPromocion = 0
                        var tipoDescuento = ''

                        var precioTemporal = productos.dataValues.prod_precio

                        //Si tiene descuento de SN se generara ese descuento
                        if(productos.dataValues.descuentoGrupoBool == true)
                        {
                            //totalTemp es el resultado que queda
                            var totalTemp = 0

                            //Total acumulado es el total de descuento en INT
                            var totalAcumulado = 0

                            //$300   56% descuento   168 total
                            //Descuento por lista de precios grupos
                            if(productos.dataValues.descuentoGrupo > 0)
                            {
                                totalTemp = precioTemporal - (((productos.dataValues.descuentoGrupo/100) * precioTemporal))
                                totalAcumulado = (((productos.dataValues.descuentoGrupo/100) * precioTemporal))
                            }

                            //$300   56% descuento   168 total por grupo y 50% del SN = 84
                            if(productos.dataValues.snDescuento > 0)
                            {
                                //Si es mayor que 0 significa que primero tomara el primer descuento y luego este si no solo lo hara directo
                                if(totalAcumulado > 0)
                                {
                                    totalAcumulado = totalAcumulado + (((productos.dataValues.snDescuento/100) * totalTemp))
                                    totalTemp = totalTemp - (((productos.dataValues.snDescuento/100) * totalTemp))
                                }
                                else
                                {
                                    totalAcumulado = (((productos.dataValues.snDescuento/100) * precioTemporal))
                                    totalTemp = precioTemporal - (((productos.dataValues.snDescuento/100) * precioTemporal))
                                }
                            }

                            if(totalPromocion < totalAcumulado)
                            {
                                totalPromocion = totalAcumulado
                                tipoDescuento = "Grupos SN"
                            }
                            else
                            {
                                totalPromocion = 0
                                tipoDescuento = "Precio Base"
                            }

                        }
                        else
                        {
                            totalPromocion = 0
                            tipoDescuento = "Precio Base"
                        }

                        productos.dataValues.totalPromocion = totalPromocion
                        productos.dataValues.tipoDescuento = tipoDescuento
                        productos.dataValues.precioBaseMenosDescuentoGrupo = productos.dataValues.prod_precio - totalPromocion
                    }
                //END DESCUENTOS SN/GRUPO/DIELSA




                //Totales finales
                var precioTotal = 0
                var precioFinalTotal = 0

                //total de descuentos en todos los productos
                var totalDescuentosPromociones = 0

                //Precio Base
                console.log(productos.dataValues.prod_precio)
                console.log(999888)
                var precioBase = productos.dataValues.prod_precio
                var precioTemporal = productos.dataValues.prod_precio
                var totalDescuentoTemporal = 0
                //Dejar cupon vacio para errores
                productos.dataValues.cupon = []

                console.log("HAST AQUI TODO BIEN")

                //Si tiene promocion, descuento o cupon activo el producto calculara el precio
                if(productos.dataValues.promocion.length > 0 || (productos.dataValues.cupon.length > 0 || productos.dataValues.cupon.promcup_aplica_todo_carrito == false) || productos.dataValues.descuentoGrupoBool == true)
                {   
                    console.log(111111)
                    //V4
                    var totalPromocion = 0
                    var tipoDescuento = ''
                    var totalDescuentoPorcentual = 0

                    //BUSCAR PROMOCION ACTIVA PCC MONTO FIJO
                    if(productos.dataValues.promocion.length > 0)
                    {
                        if(productos.dataValues.promocion[0].cmm_valor == "Monto fijo")
                        {   
                            if(totalPromocion < productos.dataValues.promocion[0].promdes_descuento_exacto)
                            {
                                totalPromocion = productos.dataValues.promocion[0].promdes_descuento_exacto
                                tipoDescuento = "Monto fijo"
                            }
                        }
                    }


                    console.log(22222)
                    //BUSCAR PROMOCION ACTIVA PCC PORCENTUAL
                    if(productos.dataValues.promocion.length > 0)
                    {
                        //Calcular precio promocion activa
                        if(productos.dataValues.promocion[0].cmm_valor == "Porcentaje")
                        {   
                            //Valor de la promocion por porcentaje
                            var porcentajePromocion = productos.dataValues.promocion[0].promdes_descuento_exacto

                            //base - descuento = total Descuento
                            var totalDescuento = (((porcentajePromocion/100) * precioTemporal).toFixed(2))

                            if(totalPromocion < totalDescuento)
                            {
                                totalPromocion = totalDescuento
                                tipoDescuento = "Porcentaje"
                            }
                        }
                    }

                    console.log(33333)
                    //BUSCAR DESCUENTOS grupo/marca/dielsa
                    if(productos.dataValues.descuentoGrupoBool == true)
                    {
                        //totalTemp es el resultado que queda
                        var totalTemp = 0

                        //Total acumulado es el total de descuento en INT
                        var totalAcumulado = 0


                        //$300   56% descuento   168 total
                        //Descuento por lista de precios grupos
                        if(productos.dataValues.descuentoGrupo > 0)
                        {
                            totalTemp = precioTemporal - (((productos.dataValues.descuentoGrupo/100) * precioTemporal))
                            totalAcumulado = (((productos.dataValues.descuentoGrupo/100) * precioTemporal))
                        }

                        //$300   56% descuento   168 total por grupo y 50% del SN = 84
                        if(productos.dataValues.snDescuento > 0)
                        {
                            //Si es mayor que 0 significa que primero tomara el primer descuento y luego este si no solo lo hara directo
                            if(totalAcumulado > 0)
                            {
                                totalAcumulado = totalAcumulado + (((productos.dataValues.snDescuento/100) * totalTemp))
                                totalTemp = totalTemp - (((productos.dataValues.snDescuento/100) * totalTemp))
                                
                            }
                            else
                            {
                                totalAcumulado = (((productos.dataValues.snDescuento/100) * precioTemporal))
                                totalTemp = precioTemporal - (((productos.dataValues.snDescuento/100) * precioTemporal))
                            }
                        }

                        //OBTENER CUAL PROMOCION ES MEJOR SI PCC O DESCUENTO GRUPO DIELSA
                        if(totalPromocion < totalAcumulado)
                        {
                            totalPromocion = totalAcumulado
                            tipoDescuento = "Grupos SN"
                        }
                    }


                    console.log(44444)
                    //Calcular precio final base
                    var precioMenosPromo = precioTemporal-totalPromocion
                    if(precioMenosPromo < 0)
                    {
                        precioMenosPromo = 0
                    }


                    //TOTAL PROMOCION
                    //Valores de promocion/descuento antes de cupon
                    var cantidadPromocion = totalPromocion
                    precioTemporal = precioMenosPromo

                    productos.dataValues.precioDespuesDePromocion = precioTemporal.toFixed(2)
                    productos.dataValues.cantidadDescuentoPromocion = cantidadPromocion

                    //Calculara el total de descuentos por promocion
                    totalDescuentoTemporal = totalDescuentoTemporal + cantidadPromocion
                    totalDescuentosPromociones = totalDescuentosPromociones + (cantidadPromocion * productos.dataValues.pcdc_producto_cantidad)






                    console.log(55555)
                    //Verificara si la promocion es mayor que la promocion de sn para dejar un doble promotion (cosas dielsa)
                    var precioPromocionDielsaBool = false
                    var DescuentoSNFijo = 0
                    if(productos.dataValues.promocion.length > 0 && productos.dataValues.descuentoGrupoBool == true)
                    {
                        if(tipoDescuento == "Porcentaje" || tipoDescuento == 'Monto fijo')
                        {
                            precioPromocionDielsaBool = true
                            var DescuentoSNFijo = productos.dataValues.prod_precio

                            if(productos.dataValues.descuentoGrupo > 0)
                            {
                                DescuentoSNFijo = DescuentoSNFijo - (DescuentoSNFijo * (productos.dataValues.descuentoGrupo / 100))
                            }

                            if(productos.dataValues.snDescuento > 0)
                            {
                                DescuentoSNFijo = DescuentoSNFijo - (DescuentoSNFijo * (productos.dataValues.snDescuento / 100))
                            }
                        }
                    }
                    productos.dataValues.precioPromocionDielsaBool = precioPromocionDielsaBool
                    productos.dataValues.DescuentoDielsaFijo = DescuentoSNFijo

                    console.log(6666)
                    //variables tipo v4
                    //Tipo de promocion final
                    productos.dataValues.tipoPromocionFinal = tipoDescuento

                    //total de promocion (precio prod - promocion o descuento (sin iva))
                    productos.dataValues.totalDescuentoFinal = parseFloat(totalPromocion)

                    //envio + 3%
                    // if(constCarritoDeCompra.cdc_forma_pago_codigo == "28" || constCarritoDeCompra.cdc_forma_pago_codigo == "04")
                    if(false)
                    {
                        productos.dataValues.precioFinal = parseFloat((precioTemporal * 1.03).toFixed(2))
                    }
                    else
                    {
                        productos.dataValues.precioFinal = parseFloat((precioTemporal).toFixed(2))
                    }
                    
                    console.log(77777)
                    productos.dataValues.precioFinalMasImpuesto = (productos.dataValues.precioFinal * (1 + (tipoImpuesto / 100)))
                    productos.dataValues.precioFinalMasImpuesto = parseFloat(productos.dataValues.precioFinalMasImpuesto.toFixed(2))
                    productos.dataValues.totalDescuento = parseFloat(totalDescuentoTemporal)
                }
                //si no tiene promocion solo calculara plano
                else
                {
                    console.log(999999)
                    // //envio + 3%
                    // if(constCarritoDeCompra.cdc_forma_pago_codigo == "28" || constCarritoDeCompra.cdc_forma_pago_codigo == "04")
                    if(false)
                    {
                        productos.dataValues.precioFinal = parseFloat((precioBase * 1.03).toFixed(2))
                    }
                    else
                    {
                        productos.dataValues.precioFinal = parseFloat((precioBase).toFixed(2))
                    }
                    productos.dataValues.precioFinalMasImpuesto = (productos.dataValues.precioFinal * (1 + (tipoImpuesto / 100)))
                    productos.dataValues.precioFinalMasImpuesto = parseFloat(productos.dataValues.precioFinalMasImpuesto.toFixed(2))
                    productos.dataValues.totalDescuento = 0
                }

                console.log(888888)

                // V5?
                var tempPrecioBase = productos.dataValues.prod_precio
                var tempPrecioFinal = productos.dataValues.precioFinal

                var porcentajeDescuentoTemporal = 100-((tempPrecioFinal*100)/tempPrecioBase)

                productos.dataValues.totalDescuentoPorcentual = parseFloat(porcentajeDescuentoTemporal.toFixed(2))














                //CALCULAR USD
                const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
                {
                    where: {
                        cmm_nombre: "TIPO_CAMBIO_USD"
                    }
                });
                var USDValor = constControlMaestroMultiple.cmm_valor


                if(productos.dataValues.prod_precio > 0)
                {
                    productos.dataValues.precioBaseFinal_USD = parseFloat((productos.dataValues.prod_precio/USDValor).toFixed(2))
                }
                else
                {
                    productos.dataValues.precioBaseFinal_USD = 0
                }

                if(productos.dataValues.totalDescuento > 0)
                {
                    productos.dataValues.totalDescuento_USD = parseFloat((productos.dataValues.totalDescuento/USDValor).toFixed(2))
                }
                else
                {
                    productos.dataValues.totalDescuento_USD = 0
                }

                if(productos.dataValues.DescuentoDielsaFijo > 0)
                {
                    productos.dataValues.DescuentoDielsaFijo_USD = parseFloat((productos.dataValues.DescuentoDielsaFijo/USDValor).toFixed(2))
                }
                else
                {
                    productos.dataValues.DescuentoDielsaFijo_USD = 0
                }

                if(productos.dataValues.precioFinal > 0)
                {
                    productos.dataValues.precioFinal_USD = parseFloat((productos.dataValues.precioFinal/USDValor).toFixed(2))
                }
                else
                {
                    productos.dataValues.precioFinal_USD = 0
                }


            }

            return productos
            
        }
        catch(e)
        {
            console.log(e)
            return "Error al obtener la informacion base de los productos para cotizaciones"
        }
    },



    //PASO 6
    cotizacionesObtenerTotalesProductos: async function (body, productos, lineasProductos) {
        try
        {
            var tipoImpuesto = 16
            //Obtener informacion de impuesto de SN o Prospecto
                if(body.cot_prospecto == false)
                {
                    //Si es SN y envio a domicilio
                    if(body.tipo_envio == 16)
                    {
                        
                        const constSociosNegocio = await models.SociosNegocio.findOne(
                        {
                            where: {
                                sn_socios_negocio_id: body.cdc_sn_socio_de_negocio_id
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
                    }
                    else
                    {
                        tipoImpuesto = 16
                    }
                }
                else
                {
                    //Si es prospecto y envio a domicilio
                    if(body.tipo_envio == 16)
                    {
                        //Informacion Socio de negocio / Direccoin facturacion para impuestos
                        const constDireccionProspecto = await models.UsuariosProspectosDirecciones.findOne(
                        {
                            where: {
                                upd_direcciones_id: body.upd_direcciones_id
                            }
                        });

                        if(constDireccionProspecto)
                        {
                            const constCodigosPostales = await models.CodigosPostales.findOne(
                            {
                                where: {
                                    cp_codigo_postal: constDireccionProspecto.upd_codigo_postal
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
                    }
                    else
                    {
                        tipoImpuesto = 16
                    }
                }
            //Fin Obtener informacion de impuesto de SN o Prospecto

            //Totales finales
            var precioTotal = 0
            var precioFinalTotal = 0
            for (var i = 0; i < productos.length; i++) 
            {
                precioFinalTotal = precioFinalTotal + (productos[i].dataValues.precioFinal * productos[i].dataValues.cantidad)
            }
            precioFinalTotal = precioFinalTotal.toFixed(2)
            var TotalImpuesto = precioFinalTotal * (tipoImpuesto / 100)
            var precioFinalTotalMasImpuestos = (precioFinalTotal * (1 + (tipoImpuesto / 100))).toFixed(2)
            var TotalFinal = parseFloat(precioFinalTotalMasImpuestos)
            TotalFinal = parseFloat(TotalFinal.toFixed(2))

            return TotalFinal
        }
        catch(e)
        {
            console.log(e)
            return "Error al obtener la informacion base de los productos para cotizaciones"
        }
    },


    //PASO 6.1
    cotizacionesObtenerTotalesBaseYDescuentos: async function (body, productos, lineasProductos) {
        try
        {
            //Totales finales
            var totalBase = 0
            var totalDescuentos = 0
            var totalPromocion = 0
            for (var i = 0; i < productos.length; i++) 
            {
                totalBase = totalBase + (productos[i].dataValues.prod_precio * productos[i].dataValues.cantidad)
                totalDescuentos = totalDescuentos + (productos[i].dataValues.totalDescuento * productos[i].dataValues.cantidad)
                totalPromocion = totalPromocion + (productos[i].dataValues.precioFinal * productos[i].dataValues.cantidad)
            }


            totalBase = parseFloat(totalBase.toFixed(2))
            totalDescuentos = parseFloat(totalDescuentos.toFixed(2))
            totalPromocion = parseFloat(totalPromocion.toFixed(2))

            var descuentoEnPorcentaje = (totalDescuentos*100)/totalBase
            descuentoEnPorcentaje = parseFloat(descuentoEnPorcentaje.toFixed(2))


            var totales = {
                totalBase: totalBase,
                totalDescuentos: totalDescuentos,
                totalPromocion: totalPromocion,
                descuentoEnPorcentaje: descuentoEnPorcentaje
            }

            return totales
        }
        catch(e)
        {
            console.log(e)
            return "Error al obtener la informacion base de los productos para cotizaciones"
        }
    },





    //PASO 7 -> es cotizar envios con otra api


    //PASO 8
    cotizacionesObtenerFechasEnvio: async function (body, productos, lineasProductos, cotizacionCarritoEnvioPoliticas) {
        try
        {
            for (var i = 0; i < productos.length; i++) 
                {
                    //Fecha de entrega informacion
                    var dateFinal
                    var day = new Date()

                    //Se ejecuta cuando es recoleccion y se ocupa hacer resurtimiento de almacen
                    if(productos[i].dataValues.pcf_recoleccion_resurtimiento == true)
                    {
                        // console.log(1111111)
                        var dayLetters = date_and_time.format(day, "dddd")

                        var AddingsDays = 0
                        switch(dayLetters)
                        {
                            case "Monday":
                                AddingsDays = 9
                            break;

                            case "Tuesday":
                                AddingsDays = 8
                            break;

                            case "Wednesday":
                                AddingsDays = 7
                            break;

                            case "Thursday":
                                AddingsDays = 6
                            break;

                            case "Friday":
                                AddingsDays = 5
                            break;

                            case "Saturday":
                                AddingsDays = 4
                            break;

                            case "Sunday":
                                AddingsDays = 3
                            break;
                        }
                        var nuevoDia = date_and_time.addDays(day, (AddingsDays))
                        nuevoDia = date_and_time.addHours(nuevoDia, -5)

                        dateFinal = date_and_time.format(nuevoDia, "YYYY/MM/DD")
                    }
                    else if(productos[i].dataValues.pcf_dias_resurtimiento > 0)
                    {
                        // console.log(22222)
                        var nuevoDia = date_and_time.addDays(day, (productos[i].dataValues.pcf_dias_resurtimiento+1))
                        nuevoDia = date_and_time.addHours(nuevoDia, -5)

                        dateFinal = date_and_time.format(nuevoDia, "YYYY/MM/DD")
                    }
                    else if(cotizacionCarritoEnvioPoliticas.CotizacionResult.suertirUnSoloAlmacen == false && cotizacionCarritoEnvioPoliticas.CotizacionResult.politicaNombre != null)
                    {
                        // console.log(999999)
                        var dayLetters = date_and_time.format(day, "dddd")

                        var AddingsDays = 0
                        switch(dayLetters)
                        {
                            case "Monday":
                                AddingsDays = 9
                            break;

                            case "Tuesday":
                                AddingsDays = 8
                            break;

                            case "Wednesday":
                                AddingsDays = 7
                            break;

                            case "Thursday":
                                AddingsDays = 13
                            break;

                            case "Friday":
                                AddingsDays = 12
                            break;

                            case "Saturday":
                                AddingsDays = 11
                            break;

                            case "Sunday":
                                AddingsDays = 10
                            break;
                        }
                        var nuevoDia = date_and_time.addDays(day, (AddingsDays))
                        nuevoDia = date_and_time.addHours(nuevoDia, -5)

                        dateFinal = date_and_time.format(nuevoDia, "YYYY/MM/DD")
                    }
                    else
                    {
                        // console.log(333333)
                        var nuevoDia = date_and_time.addDays(day, 1)
                        nuevoDia = date_and_time.addHours(nuevoDia, -5)

                        dateFinal = date_and_time.format(nuevoDia, "YYYY/MM/DD")
                    }

                    // console.log(dateFinal)
                    productos[i].dataValues.dateFinal = dateFinal
                }

            return productos
        }
        catch(e)
        {
            console.log(e)
            return "Error al obtener la informacion base de los productos para cotizaciones"
        }
    },








    //Calcular totales a partir de una cotizacion ID
    cotizacionSetTotalsByID: async function (cotizacion_id) {
        try
        {

            const constCotizaciones = await models.Cotizaciones.findOne(
            {
                where: {
                    cot_cotizacion_id: cotizacion_id
                },
            });

            //Cotizacion productos
            const constCotizacionesProductos = await models.CotizacionesProductos.findAll(
            {
                where: {
                    cotp_cotizacion_id: constCotizaciones.cot_cotizacion_id
                },
                order: [
                    ['cotp_cotizaciones_productos_id', 'ASC']
                ],
            });


            //Total Final base
            var cot_total_base = 0
            
            //Total Final de precio promocion
            var cot_total_promocion = 0

            

            for (var i = 0; i < constCotizacionesProductos.length; i++) 
            {
                // var totalDescuentoPerProductTemp = constCotizacionesProductos[i].dataValues.cotp_precio_base_lista-cotp_precio_menos_promociones
                cot_total_base = cot_total_base + (constCotizacionesProductos[i].dataValues.cotp_precio_base_lista * constCotizacionesProductos[i].dataValues.cotp_producto_cantidad)
                // cot_total_promocion = cot_total_promocion + (totalDescuentoPerProductTemp * constCotizacionesProductos[i].dataValues.cotp_producto_cantidad)
                cot_total_promocion = cot_total_promocion + (constCotizacionesProductos[i].dataValues.cotp_precio_menos_promociones * constCotizacionesProductos[i].dataValues.cotp_producto_cantidad)
            }





            

            var cot_descuento_total = cot_total_base - cot_total_promocion

            var ivaMultiplicador = 0

            if(constCotizaciones.cot_iva == 16)
            {
                ivaMultiplicador = 1.16
            }
            else
            {
                ivaMultiplicador = 1.08
            }

            //Final FINAL
            var cot_total_cotizacion = cot_total_promocion * ivaMultiplicador

            var cot_iva_cantidad = cot_total_cotizacion - cot_total_promocion
            var cot_descuento_porcentaje = (cot_descuento_total * 100)/cot_total_base




            cot_total_base = parseFloat(cot_total_base.toFixed(2))
            cot_total_promocion = parseFloat(cot_total_promocion.toFixed(2))
            cot_descuento_total = parseFloat(cot_descuento_total.toFixed(2))
            cot_iva_cantidad = parseFloat(cot_iva_cantidad.toFixed(2))
            cot_descuento_porcentaje = parseFloat(cot_descuento_porcentaje.toFixed(2))
            cot_total_cotizacion = parseFloat(cot_total_cotizacion.toFixed(2))


            const bodyUpdate = {
                "cot_total_cotizacion": cot_total_cotizacion,
                "cot_descuento_total": cot_descuento_total,
                "cot_total_base": cot_total_base,
                "cot_total_promocion": cot_total_promocion,
                "cot_iva_cantidad": cot_iva_cantidad,
                "cot_descuento_porcentaje": cot_descuento_porcentaje,
                updatedAt: Date()
            }
            var result = await constCotizaciones.update(bodyUpdate);




            return result
        }
        catch(e)
        {
            console.log(e)
            return "Error calcular totales de cotizacion"
        }
    },
    
};


