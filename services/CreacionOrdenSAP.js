import models from '../models';
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const { Op } = require("sequelize");
import request from 'request-promise';
import statusControllers from '../mapeos/mapeoControlesMaestrosMultiples';
import productosUtils from "../services/productosUtils";
import cotizarCarritoFunction from "../services/cotizarCarritoFunctions";
import date_and_time from 'date-and-time';

module.exports = {
    CreacionOrdenSAP: async function (cdc_sn_socio_de_negocio_id, cf_compra_finalizada_id, cdc_politica_envio_surtir_un_solo_almacen, cdc_politica_envio_nombre) {
        try{
 

            console.log('Inicia sesion')
            //console.log(cdc_politica_envio_surtir_un_solo_almacen)
            //console.log(cdc_politica_envio_nombre)
            //Obtener Fecha
            var obtenerFecha = await this.obtenerFecha()
            var direccionFacturacion
            var direccionEntrega
            var DireccionJson = []
            var isRecoleccion = false

            //Si la fecha se genero correctamente
            if(obtenerFecha.status == true)
            {

                console.log("Prueba 1")
                //Cargar informacion de la orden (compra finalizada)
                const constCompraFinalizada = await models.CompraFinalizada.findOne(
                {
                    where: {
                        cf_compra_finalizada_id: cf_compra_finalizada_id
                    }
                });

                //Cargar informacion de los productos de la orden (productos compra finalizada)
                const constProductoCompraFinalizada = await models.ProductoCompraFinalizada.findAll(
                {
                    where: {
                        pcf_cf_compra_finalizada_id: constCompraFinalizada.cf_compra_finalizada_id
                    }
                });







                //obtener tipo de envio
                const constControlMaestroMultipleTipoEnvio = await models.ControlMaestroMultiple.findOne(
                {
                    where: {
                        cmm_control_id: constCompraFinalizada.cf_cmm_tipo_envio_id
                    }
                })
                if(constControlMaestroMultipleTipoEnvio.cmm_valor == "Recolección")
                {
                    isRecoleccion = true
                }



                



                //Si ambas parte de la orden existen

                console.log('pruebas 3')
                if(constCompraFinalizada && constProductoCompraFinalizada)
                {
                    //Obtener informacion del Socio de Negocio
                    const constSociosNegocio = await models.SociosNegocio.findOne(
                    {
                        where: {
                            sn_socios_negocio_id: constCompraFinalizada.cf_vendido_a_socio_negocio_id
                        }
                    });

                    if(constSociosNegocio)
                    {
                        console.log("-------------------------------Prueba-----------------------------------")
                        //Obtener direccion facturacion (campo sap)
                        var obtenerDireccionFacturacion = await this.obtenerDireccionFacturacion(constSociosNegocio)

                        if(obtenerDireccionFacturacion.status == true)
                        {
                            //variable de direccion de facturacion
                            direccionFacturacion = obtenerDireccionFacturacion.data

                            var obtenerInformacionEnvio
                            //Obtener informacion de envio (campos sap)
                            obtenerInformacionEnvio = await this.obtenerInformacionEnvio(constCompraFinalizada, constSociosNegocio)
                            // if(isRecoleccion == false)
                            // {
                            //     obtenerInformacionEnvio = await this.obtenerInformacionEnvio(constCompraFinalizada, constSociosNegocio)
                            // }
                            // else
                            // {
                            //     obtenerInformacionEnvio = {
                            //         "status": true
                            //     }
                            // }

                            if(obtenerInformacionEnvio.status == true)
                            {
                                // if(isRecoleccion == false)
                                // {
                                //     direccionEntrega = obtenerInformacionEnvio.data.direccionEnvio
                                //     DireccionJson.push(obtenerInformacionEnvio.data.direccionEnvio)
                                // }


                                // direccionEntrega = obtenerInformacionEnvio.data.direccionEnvio
                                DireccionJson.push(obtenerInformacionEnvio.data.direccionEnvio)
                                DireccionJson.push(obtenerDireccionFacturacion.data)

                                var status = {
                                    "status": true,
                                    "codigoStatus": 200
                                }

                                //Validar informacion del SN
                                if(constSociosNegocio.sn_razon_social == '' || constSociosNegocio.sn_razon_social == null)
                                {
                                    status = {
                                        "status": false,
                                        "codigoStatus": 300,
                                        "error": "El socio de negocio no cuenta con una razon social"
                                    }
                                }
                                else if(constSociosNegocio.sn_rfc == '' || constSociosNegocio.sn_rfc == null)
                                {
                                    status = {
                                        "status": false,
                                        "codigoStatus": 300,
                                        "error": "El socio de negocio no cuenta con un rfc"
                                    }
                                }
                                else if(constCompraFinalizada.dataValues.cf_cfdi == '' || constCompraFinalizada.dataValues.cf_cfdi == null)
                                {
                                    status = {
                                        "status": false,
                                        "codigoStatus": 300,
                                        "error": "No se asigno un cfdi a la orden"
                                    }
                                }


                                if(status.status == true)
                                {
                                    var lineas = await this.validarLineas(constCompraFinalizada, constProductoCompraFinalizada, cdc_politica_envio_surtir_un_solo_almacen, cdc_politica_envio_nombre)
                                    console.log(222222)
                                    console.log(lineas)

                                    if(isRecoleccion == false)
                                    {
                                        lineas = await this.agregarLineaEnvio(constCompraFinalizada, constProductoCompraFinalizada, lineas, false)
                                    }


                                    if(lineas.status == true)
                                    {
                                        //Obtener codigo vendedor final
                                        const constVendedorCodigo = await models.Usuario.findOne(
                                        {
                                            where: {
                                                usu_usuario_id: constCompraFinalizada.dataValues.cf_vendido_por_usu_usuario_id
                                            }
                                        })

                                        //JSON BODY que se mandara al crear la peticion
                                        const dataCreateOrder = 
                                        {
                                            "codigoCliente": constSociosNegocio.dataValues.sn_cardcode,
                                            "idPortal": constCompraFinalizada.dataValues.cf_compra_numero_orden,
                                            "razonSocial": constSociosNegocio.dataValues.sn_razon_social,
                                            "rfc": constSociosNegocio.dataValues.sn_rfc,
                                            "email": constSociosNegocio.dataValues.sn_email_facturacion,
                                            "comentarios": "",
                                            "fechaContabilizacion": obtenerFecha.data,
                                            "fechaVencimiento": obtenerFecha.data,
                                            "fechaReferencia": obtenerFecha.data,
                                            "referencia": constCompraFinalizada.dataValues.cf_compra_numero_orden,
                                            "moneda": "MXP",
                                            "fletera": constCompraFinalizada.dataValues.cf_fletera_id,
                                            // "direccionEntrega": direccionEntrega,
                                            // "direccionFactura": direccionFacturacion,
                                            "direcciones": DireccionJson,
                                            "metodoPago": constCompraFinalizada.dataValues.cf_sap_metodos_pago_codigo,
                                            "formaPago": constCompraFinalizada.dataValues.cf_sap_forma_pago_codigo,
                                            "usoCfdi": constCompraFinalizada.dataValues.cf_cfdi,
                                            "codigoVendedor": constVendedorCodigo.usu_codigo_vendedor,
                                            "lineas": lineas.data
                                        }

                                        console.log(dataCreateOrder)


                                        const bodyUpdate2 = {
                                            "cf_sap_json_creacion" :  dataCreateOrder
                                        };
                                        await constCompraFinalizada.update(bodyUpdate2);


                                            console.log("Integrar 100000000000000")
                                            //INTEGRAR
                                            var options = {
                                                'method': 'POST',
                                                'timeout': 7000,
                                                'url': process.env.INTEGRATIONS_URL + '/Service1.svc/OrdenVenta',
                                                'headers': 
                                                {
                                                    'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid',
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify(dataCreateOrder)
                                            };

                                            var result = await request(options, function (error, response) 
                                            {
                                                //if (error) throw new Error(error);
                                            });

                                            var resultJson = JSON.parse(result);
                                                console.log('OJO de DIOS')
                                                console.log(resultJson)
                                            if(resultJson)
                                            {
                                                if(resultJson.descripcion == "ERROR - Este documento ya ha sido creado en SAP")
                                                {
                                                    resultJson.estatus = 2
                                                }
                                                const bodyUpdate = {
                                                    "cf_descripcion_sap" :  resultJson.descripcion,
                                                    "cf_estatus_creacion_sap" :  resultJson.estatus,
                                                    "cf_sap_json_creacion" :  dataCreateOrder
                                                };
                                                await constCompraFinalizada.update(bodyUpdate);
                                            }
                                            else
                                            {
                                                const bodyUpdate = {
                                                    "cf_descripcion_sap" :  "se genero un error al momento de crear la orden JSON",
                                                    "cf_estatus_creacion_sap" :  "-1"
                                                };
                                                await constCompraFinalizada.update(bodyUpdate);
                                            }
                                        





                                        // console.log(options)

                                        // var SAPInactivoBool = false
                                        // var result = await request(options, function (error, response) 
                                        // {
                                        //     console.log("entro aqui")
                                        //     SAPInactivoBool = true
                                        //     //if (error) throw new Error(error);
                                        // });



                                        // if(SAPInactivoBool == false)
                                        // {
                                        //     var resultJson = JSON.parse(result);
                                        //     console.log(resultJson)

                                        //     if(resultJson)
                                        //     {
                                        //         if(resultJson.descripcion == "ERROR - Este documento ya ha sido creado en SAP")
                                        //         {
                                        //             resultJson.estatus = 2
                                        //         }
                                        //         const bodyUpdate = {
                                        //             "cf_descripcion_sap" :  resultJson.descripcion,
                                        //             "cf_estatus_creacion_sap" :  resultJson.estatus,
                                        //         };
                                        //         // console.log(bodyUpdate)
                                        //         await constCompraFinalizada.update(bodyUpdate);
                                        //     }

                                        // }
                                        // else
                                        // {
                                        //     const bodyUpdate = {
                                        //         "cf_descripcion_sap" :  "SAP NO DISPONIBLE",
                                        //         "cf_estatus_creacion_sap" :  "-1",
                                        //     };
                                        //     // console.log(bodyUpdate)
                                        //     await constCompraFinalizada.update(bodyUpdate);

                                        // }



                                        var status = {
                                            "status": true,
                                            "codigoStatus": 200,
                                            "data": dataCreateOrder
                                        }
                                        return status


                                    }
                                    else
                                    {
                                        return lineas
                                    }
                                }
                                else
                                {
                                    return status
                                }
                            }
                            else
                            {
                                var status = {
                                    "status": false,
                                    "codigoStatus": 300,
                                    "error": obtenerInformacionEnvio.data
                                }
                                return status
                            }
                        }
                        else
                        {
                            var status = {
                                "status": false,
                                "codigoStatus": 300,
                                "error": obtenerDireccionFacturacion.data
                            }
                            return status
                        }
                    }
                    else
                    {
                        var status = {
                            "status": false,
                            "codigoStatus": 300,
                            "error": 'No fue posible obtener la informacion del socio de negocio'
                        }
                        return status
                    }
                }
                else
                {
                    var status = {
                        "status": false,
                        "codigoStatus": 300,
                        "error": 'No fue posible obtener la informacion de la orden generada'
                    }
                    return status
                }
            }
            else
            {
                var status = {
                    "status": false,
                    "codigoStatus": 300,
                    "error": 'No fue posible generar la fecha de la orden'
                }
                return status
            }
        }
        catch(e){
            console.log(e)
            var status = {
                "status": false,
                "codigoStatus": 500,
                "error": 'Error al intentar prevalidar orden',
                "error_description": e
            }

            return status
        }
    },
    CreacionOrdenSAPDivididaUSD: async function (cdc_sn_socio_de_negocio_id, cf_compra_finalizada_id, cdc_politica_envio_surtir_un_solo_almacen, cdc_politica_envio_nombre) {
        try{
            //Obtener Fecha
            var obtenerFecha = await this.obtenerFecha()
            var direccionFacturacion
            var direccionEntrega
            var isRecoleccion = false

            var DireccionJson = []
            //Si la fecha se genero correctamente
            if(obtenerFecha.status == true)
            {
                //Cargar informacion de la orden (compra finalizada)
                const constCompraFinalizada = await models.CompraFinalizada.findOne(
                {
                    where: {
                        cf_compra_finalizada_id: cf_compra_finalizada_id
                    }
                });

                //Cargar informacion de los productos de la orden (productos compra finalizada)
                const constProductoCompraFinalizada = await models.ProductoCompraFinalizada.findAll(
                {
                    where: {
                        pcf_cf_compra_finalizada_id: constCompraFinalizada.cf_compra_finalizada_id
                    }
                });





                //obtener tipo de envio
                const constControlMaestroMultipleTipoEnvio = await models.ControlMaestroMultiple.findOne(
                {
                    where: {
                        cmm_control_id: constCompraFinalizada.cf_cmm_tipo_envio_id
                    }
                })
                if(constControlMaestroMultipleTipoEnvio.cmm_valor == "Recolección")
                {
                    isRecoleccion = true
                }













                //Si ambas parte de la orden existen
                if(constCompraFinalizada && constProductoCompraFinalizada)
                {
                    //Obtener informacion del Socio de Negocio
                    const constSociosNegocio = await models.SociosNegocio.findOne(
                    {
                        where: {
                            sn_socios_negocio_id: constCompraFinalizada.cf_vendido_a_socio_negocio_id
                        }
                    });

                    if(constSociosNegocio)
                    {
                        //Obtener direccion facturacion (campo sap)
                        var obtenerDireccionFacturacion = await this.obtenerDireccionFacturacion(constSociosNegocio)

                        if(obtenerDireccionFacturacion.status == true)
                        {
                            //variable de direccion de facturacion
                            direccionFacturacion = obtenerDireccionFacturacion.data
                            
                            //Obtener informacion de envio (campos sap)
                            var obtenerInformacionEnvio

                            //Obtener informacion de envio (campos sap)
                            obtenerInformacionEnvio = await this.obtenerInformacionEnvio(constCompraFinalizada, constSociosNegocio)
                            // if(isRecoleccion == false)
                            // {
                            //     obtenerInformacionEnvio = await this.obtenerInformacionEnvio(constCompraFinalizada, constSociosNegocio)
                            // }
                            // else
                            // {
                            //     obtenerInformacionEnvio = {
                            //         "status": true
                            //     }
                            // }













                            if(obtenerInformacionEnvio.status == true)
                            {
                                // if(isRecoleccion == false)
                                // {
                                //     direccionEntrega = obtenerInformacionEnvio.data.direccionEnvio
                                //     DireccionJson.push(obtenerInformacionEnvio.data.direccionEnvio)
                                // }

                                DireccionJson.push(obtenerInformacionEnvio.data.direccionEnvio)
                                DireccionJson.push(obtenerDireccionFacturacion.data)

                                var status = {
                                    "status": true,
                                    "codigoStatus": 200
                                }

                                //Validar informacion del SN
                                if(constSociosNegocio.sn_razon_social == '' || constSociosNegocio.sn_razon_social == null)
                                {
                                    status = {
                                        "status": false,
                                        "codigoStatus": 300,
                                        "error": "El socio de negocio no cuenta con una razon social"
                                    }
                                }
                                else if(constSociosNegocio.sn_rfc == '' || constSociosNegocio.sn_rfc == null)
                                {
                                    status = {
                                        "status": false,
                                        "codigoStatus": 300,
                                        "error": "El socio de negocio no cuenta con un rfc"
                                    }
                                }
                                else if(constCompraFinalizada.cf_cfdi == '' || constCompraFinalizada.cf_cfdi == null)
                                {
                                    status = {
                                        "status": false,
                                        "codigoStatus": 300,
                                        "error": "No se asigno un cfdi a la orden"
                                    }
                                }

                                if(status.status == true)
                                {



                                    var dataCreateOrderMXN = ''
                                    var dataCreateOrderUSD = ''


                                    //Cargar informacion de los productos de la orden (productos compra finalizada)
                                    const constProductoCompraFinalizadaNoUSD = await models.ProductoCompraFinalizada.findAll(
                                    {
                                        where: {
                                            pcf_cf_compra_finalizada_id: constCompraFinalizada.cf_compra_finalizada_id,
                                            pcf_order_dividida_sap: false
                                        }
                                    })

                                    //Variable que servira para mandar el costo de envio en USD en caso de que no tenga productos en MXN una orden
                                    // var CostoEnvioEnUSDBool = true

                                    //Buscara los productos que no son USD para mandarlos a SAP
                                    if(constProductoCompraFinalizadaNoUSD.length > 0 || isRecoleccion == false)
                                    {
                                        var lineas = await this.validarLineas(constCompraFinalizada, constProductoCompraFinalizadaNoUSD, cdc_politica_envio_surtir_un_solo_almacen, cdc_politica_envio_nombre)

                                        if(isRecoleccion == false)
                                        {
                                            lineas = await this.agregarLineaEnvio(constCompraFinalizada, constProductoCompraFinalizada, lineas, false)
                                            // CostoEnvioEnUSDBool = false
                                        }


                                        if(lineas.status == true)
                                        {

                                            //Obtener codigo vendedor final
                                            const constVendedorCodigo = await models.Usuario.findOne(
                                            {
                                                where: {
                                                    usu_usuario_id: constCompraFinalizada.dataValues.cf_vendido_por_usu_usuario_id
                                                }
                                            })

                                            //JSON BODY que se mandara al crear la  peticion
                                            const dataCreateOrder = 
                                            {
                                                "codigoCliente": constSociosNegocio.dataValues.sn_cardcode,
                                                "idPortal": constCompraFinalizada.dataValues.cf_compra_numero_orden,
                                                "razonSocial": constSociosNegocio.dataValues.sn_razon_social,
                                                "rfc": constSociosNegocio.dataValues.sn_rfc,
                                                "email": constSociosNegocio.dataValues.sn_email_facturacion,
                                                "comentarios": "",
                                                "fechaContabilizacion": obtenerFecha.data,
                                                "fechaVencimiento": obtenerFecha.data,
                                                "fechaReferencia": obtenerFecha.data,
                                                "referencia": constCompraFinalizada.dataValues.cf_compra_numero_orden,
                                                "moneda": "MXP",
                                                "fletera": constCompraFinalizada.dataValues.cf_fletera_id,
                                                // "direccionEntrega": direccionEntrega,
                                                // "direccionFactura": direccionFacturacion,
                                                "direcciones": DireccionJson,
                                                "metodoPago": constCompraFinalizada.dataValues.cf_sap_metodos_pago_codigo,
                                                "formaPago": constCompraFinalizada.dataValues.cf_sap_forma_pago_codigo,
                                                "usoCfdi": constCompraFinalizada.dataValues.cf_cfdi,
                                                "codigoVendedor": constVendedorCodigo.usu_codigo_vendedor,
                                                "lineas": lineas.data
                                            }

                                            dataCreateOrderMXN = dataCreateOrder

                                            


                                            var status = {
                                                "status": true,
                                                "codigoStatus": 200,
                                            }
                                        }
                                        else
                                        {
                                            var status = {
                                                "status": true,
                                                "codigoStatus": 300,
                                                "data": "no se pudo crear lineas orden normal"
                                            }
                                        }

                                    }














                                    //Cargara los productos con precio USD
                                    const constProductoCompraFinalizadaUSD = await models.ProductoCompraFinalizada.findAll(
                                    {
                                        where: {
                                            pcf_cf_compra_finalizada_id: constCompraFinalizada.cf_compra_finalizada_id,
                                            pcf_order_dividida_sap: true
                                        }
                                    })

                                    //Mandara los productos en precio USD a SAP
                                    if(constProductoCompraFinalizadaUSD.length > 0)
                                    {
                                        var lineas = await this.validarLineasDivididaUSD(constCompraFinalizada, constProductoCompraFinalizadaUSD, cdc_politica_envio_surtir_un_solo_almacen, cdc_politica_envio_nombre)

                                        // if(isRecoleccion == false && CostoEnvioEnUSDBool == true)
                                        // {
                                        //     lineas = await this.agregarLineaEnvio(constCompraFinalizada, constProductoCompraFinalizada, lineas, CostoEnvioEnUSDBool)
                                        // }



                                        if(lineas.status == true)
                                        {
                                            //Obtener codigo vendedor final
                                            const constVendedorCodigo2 = await models.Usuario.findOne(
                                            {
                                                where: {
                                                    usu_usuario_id: constCompraFinalizada.dataValues.cf_vendido_por_usu_usuario_id
                                                }
                                            })

                                            //JSON BODY que se mandara al crear la  peticion
                                            const dataCreateOrder = 
                                            {
                                                "codigoCliente": constSociosNegocio.dataValues.sn_cardcode,
                                                "idPortal": constCompraFinalizada.dataValues.cf_orden_dividida_sap,
                                                "razonSocial": constSociosNegocio.dataValues.sn_razon_social,
                                                "rfc": constSociosNegocio.dataValues.sn_rfc,
                                                "email": constSociosNegocio.dataValues.sn_email_facturacion,
                                                "comentarios": "",
                                                "fechaContabilizacion": obtenerFecha.data,
                                                "fechaVencimiento": obtenerFecha.data,
                                                "fechaReferencia": obtenerFecha.data,
                                                "referencia": constCompraFinalizada.dataValues.cf_compra_numero_orden,
                                                "moneda": "USD",
                                                "fletera": constCompraFinalizada.dataValues.cf_fletera_id,
                                                // "direccionEntrega": direccionEntrega,
                                                // "direccionFactura": direccionFacturacion,
                                                "direcciones": DireccionJson,
                                                "metodoPago": constCompraFinalizada.dataValues.cf_sap_metodos_pago_codigo,
                                                "formaPago": constCompraFinalizada.dataValues.cf_sap_forma_pago_codigo,
                                                "usoCfdi": constCompraFinalizada.dataValues.cf_cfdi,
                                                "codigoVendedor": constVendedorCodigo2.usu_codigo_vendedor,
                                                "lineas": lineas.data
                                            }

                                            dataCreateOrderUSD = dataCreateOrder


                                            

                                            var status = {
                                                "status": true,
                                                "codigoStatus": 200
                                            }
                                        }
                                        else
                                        {
                                            var status = {
                                                "status": true,
                                                "codigoStatus": 300,
                                                "data": "no se pudo crear lineas orden USD"
                                            }
                                        }
                                    }

















































                                    if(dataCreateOrderMXN != '')
                                    {
                                        

                                            const bodyUpdate2 = {
                                                "cf_sap_json_creacion" :  dataCreateOrderMXN
                                            };
                                            await constCompraFinalizada.update(bodyUpdate2);

                                            //INTEGRAR
                                            var options = {
                                                'method': 'POST',
                                                'url': process.env.INTEGRATIONS_URL + '/Service1.svc/OrdenVenta',
                                                'headers': 
                                                {
                                                    'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid',
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify(dataCreateOrderMXN)
                                            };

                                            var result = await request(options, function (error, response) 
                                            {
                                                //if (error) throw new Error(error);
                                            });

                                            var resultJson = JSON.parse(result);

                                            if(resultJson)
                                            {
                                                if(resultJson.descripcion == "ERROR - Este documento ya ha sido creado en SAP")
                                                {
                                                    resultJson.estatus = 2
                                                }
                                                const bodyUpdate = {
                                                    "cf_descripcion_sap" :  resultJson.descripcion,
                                                    "cf_estatus_creacion_sap" :  resultJson.estatus,
                                                    "cf_sap_json_creacion" :  dataCreateOrderMXN
                                                };
                                                await constCompraFinalizada.update(bodyUpdate);
                                            }
                                            else
                                            {
                                                const bodyUpdate = {
                                                    "cf_descripcion_sap" :  "se genero un error al momento de crear la orden JSON",
                                                    "cf_estatus_creacion_sap" :  "-1"
                                                };
                                                await constCompraFinalizada.update(bodyUpdate);
                                            }
                                        
                                    }




                                    




















































                                    if(dataCreateOrderUSD != '')
                                    {
                                        const bodyUpdate2 = {
                                            "cf_sap_json_creacion_usd" :  dataCreateOrderUSD
                                        };
                                        await constCompraFinalizada.update(bodyUpdate2);

                                        
                                            //INTEGRAR
                                            var options = {
                                                'method': 'POST',
                                                'url': process.env.INTEGRATIONS_URL + '/Service1.svc/OrdenVenta',
                                                'headers': 
                                                {
                                                    'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid',
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify(dataCreateOrderUSD)
                                            };

                                            var result = await request(options, function (error, response) 
                                            {
                                                // if (error) throw new Error(error);
                                            });

                                            var resultJson = JSON.parse(result);

                                            if(resultJson)
                                            {
                                                if(resultJson.descripcion == "ERROR - Este documento ya ha sido creado en SAP")
                                                {
                                                    resultJson.estatus = 2
                                                }
                                                const bodyUpdate = {
                                                    "cf_descripcion_sap_usd" :  resultJson.descripcion,
                                                    "cf_estatus_creacion_sap_usd" :  resultJson.estatus,
                                                    "cf_sap_json_creacion_usd" :  dataCreateOrderUSD
                                                };
                                                await constCompraFinalizada.update(bodyUpdate);
                                            }
                                            else
                                            {
                                                const bodyUpdate = {
                                                    "cf_descripcion_sap_usd" :  "se genero un error al momento de crear la orden JSON",
                                                    "cf_estatus_creacion_sap_usd" :  "-1"
                                                };
                                                await constCompraFinalizada.update(bodyUpdate);
                                            }
                                        
                                    }


                                    






































































                                    var status = {
                                        "status": true,
                                        "codigoStatus": 200
                                    }
                                    return status
                                }
                                else
                                {
                                    return status
                                }
                            }
                            else
                            {
                                var status = {
                                    "status": false,
                                    "codigoStatus": 300,
                                    "error": obtenerInformacionEnvio.data
                                }
                                return status
                            }
                        }
                        else
                        {
                            var status = {
                                "status": false,
                                "codigoStatus": 300,
                                "error": obtenerDireccionFacturacion.data
                            }
                            return status
                        }
                    }
                    else
                    {
                        var status = {
                            "status": false,
                            "codigoStatus": 300,
                            "error": 'No fue posible obtener la informacion del socio de negocio'
                        }
                        return status
                    }
                }
                else
                {
                    var status = {
                        "status": false,
                        "codigoStatus": 300,
                        "error": 'No fue posible obtener la informacion de la orden generada'
                    }
                    return status
                }
            }
            else
            {
                var status = {
                    "status": false,
                    "codigoStatus": 300,
                    "error": 'No fue posible generar la fecha de la orden'
                }
                return status
            }
        }
        catch(e){
            console.log(e)
            var status = {
                "status": false,
                "codigoStatus": 500,
                "error": 'Error al intentar prevalidar orden',
                "error_description": e
            }

            return status
        }
    },
    preValidarCreacionOrdenSAP: async function (cdc_sn_socio_de_negocio_id, cf_compra_finalizada_id) {
        try{
            //Obtener Fecha
            var obtenerFecha = await this.obtenerFecha()
            var direccionFacturacion
            var direccionEntrega

            //Si la fecha se genero correctamente
            if(obtenerFecha.status == true)
            {

                //Cargar informacion de la orden (compra finalizada)
                const constPreCompraFinalizada = await models.PreCompraFinalizada.findOne(
                {
                    where: {
                        cf_compra_finalizada_id: cf_compra_finalizada_id
                    }
                });

                //Cargar informacion de los productos de la orden (productos compra finalizada)
                const constPreProductoCompraFinalizada = await models.PreProductoCompraFinalizada.findAll(
                {
                    where: {
                        pcf_cf_compra_finalizada_id: constPreCompraFinalizada.cf_compra_finalizada_id
                    }
                });

                //Si ambas parte de la orden existen
                if(constPreCompraFinalizada && constPreProductoCompraFinalizada)
                {
                    //Obtener informacion del Socio de Negocio
                    const constSociosNegocio = await models.SociosNegocio.findOne(
                    {
                        where: {
                            sn_socios_negocio_id: constPreCompraFinalizada.cf_vendido_a_socio_negocio_id
                        }
                    });

                    if(constSociosNegocio)
                    {
                        //Obtener direccion facturacion (campo sap)
                        var obtenerDireccionFacturacion = await this.obtenerDireccionFacturacion(constSociosNegocio)

                        if(obtenerDireccionFacturacion.status == true)
                        {
                            //variable de direccion de facturacion
                            direccionFacturacion = obtenerDireccionFacturacion.data
                            


                            //Obtener informacion de envio (campos sap)
                            var obtenerInformacionEnvio = await this.obtenerInformacionEnvio(constPreCompraFinalizada, constSociosNegocio)



                            if(obtenerInformacionEnvio.status == true)
                            {
                                direccionEntrega = obtenerInformacionEnvio.data.direccionEnvio

                                var status = {
                                    "status": true,
                                    "codigoStatus": 200
                                }

                                //Validar informacion del SN
                                if(constSociosNegocio.sn_razon_social == '' || constSociosNegocio.sn_razon_social == null)
                                {
                                    status = {
                                        "status": false,
                                        "codigoStatus": 300,
                                        "error": "El socio de negocio no cuenta con una razon social"
                                    }
                                }
                                else if(constSociosNegocio.sn_rfc == '' || constSociosNegocio.sn_rfc == null)
                                {
                                    status = {
                                        "status": false,
                                        "codigoStatus": 300,
                                        "error": "El socio de negocio no cuenta con un rfc"
                                    }
                                }
                                else if(constPreCompraFinalizada.cf_cfdi == '' || constPreCompraFinalizada.cf_cfdi == null)
                                {
                                    status = {
                                        "status": false,
                                        "codigoStatus": 300,
                                        "error": "La orden no tiene un CFDI asignado"
                                    }
                                }


                                if(status.status == true)
                                {
                                    var lineas = await this.validarLineas(constPreCompraFinalizada, constPreProductoCompraFinalizada)

                                    if(lineas.status == true)
                                    {

                                        //JSON BODY que se mandara al crear la peticion
                                        const dataCreateOrder = 
                                        {
                                            "codigoCliente": constSociosNegocio.dataValues.sn_cardcode,
                                            "idPortal": constPreCompraFinalizada.dataValues.cf_compra_numero_orden,
                                            "razonSocial": constSociosNegocio.dataValues.sn_razon_social,
                                            "rfc": constSociosNegocio.dataValues.sn_rfc,
                                            "email": constSociosNegocio.dataValues.sn_email_facturacion,
                                            "comentarios": "",
                                            "fechaContabilizacion": obtenerFecha.data,
                                            "fechaVencimiento": obtenerFecha.data,
                                            "fechaReferencia": obtenerFecha.data,
                                            "referencia": constPreCompraFinalizada.dataValues.cf_compra_numero_orden,
                                            "moneda": "MXP",
                                            "fletera": constPreCompraFinalizada.dataValues.cf_fletera_id,
                                            // "direccionEntrega": direccionEntrega,
                                            // "direccionFactura": direccionFacturacion,
                                            "metodoPago": constPreCompraFinalizada.dataValues.cf_sap_metodos_pago_codigo,
                                            "formaPago": constPreCompraFinalizada.dataValues.cf_sap_forma_pago_codigo,
                                            "usoCfdi":constSociosNegocio.dataValues.sn_cfdi,
                                            "lineas": lineas.data
                                        }

                                        console.log(dataCreateOrder)

                                        var status = {
                                            "status": true,
                                            "codigoStatus": 200,
                                            "data": dataCreateOrder
                                        }
                                        return status


                                    }
                                    else
                                    {
                                        return lineas
                                    }
                                }
                                else
                                {
                                    return status
                                }
                            }
                            else
                            {
                                var status = {
                                    "status": false,
                                    "codigoStatus": 300,
                                    "error": obtenerInformacionEnvio.data
                                }
                                return status
                            }
                        }
                        else
                        {
                            var status = {
                                "status": false,
                                "codigoStatus": 300,
                                "error": obtenerDireccionFacturacion.data
                            }
                            return status
                        }
                    }
                    else
                    {
                        var status = {
                            "status": false,
                            "codigoStatus": 300,
                            "error": 'No fue posible obtener la informacion del socio de negocio'
                        }
                        return status
                    }
                }
                else
                {
                    var status = {
                        "status": false,
                        "codigoStatus": 300,
                        "error": 'No fue posible obtener la informacion de la orden generada'
                    }
                    return status
                }
            }
            else
            {
                var status = {
                    "status": false,
                    "codigoStatus": 300,
                    "error": 'No fue posible generar la fecha de la orden'
                }
                return status
            }
        }
        catch(e){
            var status = {
                "status": false,
                "codigoStatus": 500,
                "error": 'Error al intentar prevalidar orden'
            }

            return status
        }
    },
    obtenerFecha: async function () {
        try{

            // var d = new Date();
            // var dia = d.getDate();
            // var mes = d.getMonth() + 1;
            // var año = d.getYear() + 1900;

            // if(mes < 10)
            // {
            //     mes = "0"+mes;
            // }
            // if(dia < 10)
            // {
            //     dia = "0"+dia;
            // }

            // var fechaTotal = año.toString()+mes.toString()+dia.toString();



            const now = new Date();
            const five_hour_ago = date_and_time.addHours(now, -5);
            // var anio = date_and_time.format(five_hour_ago, 'YYYY')
            // var mes = date_and_time.format(five_hour_ago, 'MM')
            // var dia = date_and_time.format(five_hour_ago, 'DD')
            var totalraw = date_and_time.format(five_hour_ago, 'YYYYMMDD')

            // var totalFecha = anio+mes+dia

            // console.log(now)
            // console.log(five_hour_ago)
            // console.log(totalraw)
            // console.log(totalFecha)



            var status = {
                "status": true,
                "data": totalraw
            }
            return status
        }
        catch(e){
            var status = {
                "status": false,
                "error": e
            }
            return status
        }
    },
    obtenerDireccionFacturacion: async function (constSociosNegocio) {
        try{
            var status = true

            var estadoValorFacturacion
            var paisValorFacturacion
            var direccionFacturacion
            var direccionFacturacionJson


            var estadoCodigo
            //Crear Direccion Facturacion
            const constSociosNegocioDireccionesFacturacion = await models.SociosNegocioDirecciones.findOne(
            {
                where: {
                    snd_tipoDir: "B",
                    snd_cardcode: constSociosNegocio.dataValues.sn_cardcode,
                    snd_idDireccion: constSociosNegocio.dataValues.sn_codigo_direccion_facturacion
                }
            });

            //Si existe el estado ID
            if(constSociosNegocioDireccionesFacturacion.snd_estado_id)
            {

                const constEstadoFacturacion = await models.Estado.findOne(
                {
                    where: {
                        estpa_estado_pais_id: constSociosNegocioDireccionesFacturacion.snd_estado_id
                    }
                });

                if(constEstadoFacturacion)
                {
                    estadoValorFacturacion = constEstadoFacturacion.dataValues.estpa_estado_nombre
                    estadoCodigo = constEstadoFacturacion.dataValues.estpa_codigo_estado
                }
            }
            else
            {
                status = {
                    "status": false,
                    "data": "No fue posible obtener el id nombre del estado de la direccion de facturacion"
                }
            }

            //Si existe el pais ID
            if(constSociosNegocioDireccionesFacturacion.snd_pais_id)
            {

                const constPaisFacturacion = await models.Pais.findOne(
                {
                    where: {
                        pais_pais_id: constSociosNegocioDireccionesFacturacion.snd_pais_id
                    }
                });

                if(constPaisFacturacion)
                {
                    paisValorFacturacion = constPaisFacturacion.dataValues.pais_nombre
                }
                else
                {
                    status = {
                        "status": false,
                        "data": "No fue posible obtener el id del pais de la direccion de facturacion"
                    }
                }
            }
            else
            {
                status = {
                    "status": false,
                    "data": "No fue posible obtener el id del pais de la direccion de facturacion"
                }
            }
            

            if(estadoValorFacturacion != '' && paisValorFacturacion != '')
            {

                var constSNDFacturacion = constSociosNegocioDireccionesFacturacion.dataValues

                direccionFacturacionJson = {
                    "tipo": "B",
                    "calle": constSNDFacturacion.snd_calle1 + " " + constSNDFacturacion.snd_calle2,
                    "numeroExterior": constSNDFacturacion.snd_direccion_num_ext,
                    "numeroInterior": constSNDFacturacion.snd_direccion_num_int,
                    "ciudad": constSNDFacturacion.snd_ciudad,
                    "municipio": constSNDFacturacion.snd_ciudad,
                    "colonia": constSNDFacturacion.snd_colonia,
                    "estado": estadoCodigo,
                    "codigoPostal": constSNDFacturacion.snd_codigo_postal,
                    "codigoPais": "MX",
                }

            }
            else
            {
                status = {
                    "status": false,
                    "data": "El nombre de estado o pais esta vacio"
                }
            }


            if(status == true)
            {
                status = {
                    "status": true,
                    "data": direccionFacturacionJson
                }

                return status
            }
            else
            {
                return status
            }
        }
        catch(e){
            console.log(e)
            var status = {
                "status": false,
                "error": e
            }
            return status
        }
    },
    obtenerInformacionEnvio: async function (constPreCompraFinalizada, constSociosNegocio) {
        try{
            var status = true

            var estadoValor
            var paisValor

            var direccionEnvio = null
            var codigoFleteraSap = null

            var direccionEnvioJson
            var estadoCodigo

            //Buscar el nombre del cmm de tipo de envio
            const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_control_id: constPreCompraFinalizada.cf_cmm_tipo_envio_id
                }
            });


            if(constControlMaestroMultiple.cmm_valor == "Envío domicilio")
            {
                //Generar Direccin de envio
                if(constPreCompraFinalizada.cf_direccion_envio_id)
                {
                    //Buscar direccion de envio
                    const constSociosNegocioDirecciones = await models.SociosNegocioDirecciones.findOne(
                    {
                        where: {
                            snd_direcciones_id: constPreCompraFinalizada.cf_direccion_envio_id
                        }
                    })

                    //Si existe el estado ID
                    if(constSociosNegocioDirecciones.snd_estado_id)
                    {

                        const constEstado = await models.Estado.findOne(
                        {
                            where: {
                                estpa_estado_pais_id: constSociosNegocioDirecciones.snd_estado_id
                            }
                        });

                        if(constEstado)
                        {
                            estadoValor = constEstado.dataValues.estpa_estado_nombre
                            estadoCodigo = constEstado.dataValues.estpa_codigo_estado
                        }

                    }
                    else
                    {
                        status = {
                            "status": false,
                            "data": "No fue posible obtener el id del estado de envio"
                        }
                    }

                    //Si existe el pais ID
                    if(constSociosNegocioDirecciones.snd_pais_id)
                    {
                        const constPais = await models.Pais.findOne(
                        {
                            where: {
                                pais_pais_id: constSociosNegocioDirecciones.snd_pais_id
                            }
                        });

                        if(constPais)
                        {
                            paisValor = constPais.dataValues.pais_nombre
                        }
                        else
                        {
                            status = {
                                "status": false,
                                "data": "No fue posible obtener el id del pais de la direccion de envio"
                            }
                        }
                    }
                    else
                    {
                        status = {
                            "status": false,
                            "data": "No fue posible obtener el id del pais de la direccion de envio"
                        }
                    }
                    

                    if(estadoValor != '' && paisValor != '')
                    {
                        var constDireccionEnvio = constSociosNegocioDirecciones.dataValues

                        direccionEnvioJson = {
                            "tipo": "S",
                            "calle": constDireccionEnvio.snd_calle1 + " " + constDireccionEnvio.snd_calle2,
                            "numeroExterior": constDireccionEnvio.snd_direccion_num_ext,
                            "numeroInterior": constDireccionEnvio.snd_direccion_num_int,
                            "ciudad": constDireccionEnvio.snd_ciudad,
                            "municipio": constDireccionEnvio.snd_ciudad,
                            "colonia": constDireccionEnvio.snd_colonia,
                            "estado": estadoCodigo,
                            "codigoPostal": constDireccionEnvio.snd_codigo_postal,
                            "codigoPais": "MX",
                            "contacto": constDireccionEnvio.snd_contacto,
                            "telefono": constDireccionEnvio.snd_telefono
                        }


                    }
                    else
                    {
                        status = {
                            "status": false,
                            "data": "El nombre de estado o pais esta vacio"
                        }
                    }
                }
                else
                {
                    status = {
                        "status": false,
                        "data": "La orden no tiene asignado una direccion de envio"
                    }
                }




                //Generar fletera codigo
                if(constPreCompraFinalizada.cf_fletera_id)
                {
                    //Obtener fletera
                    const constFleteras = await models.Fleteras.findOne(
                    {
                        where: {
                            flet_fletera_id: constPreCompraFinalizada.cf_fletera_id
                        }
                    })

                    if(constFleteras)
                    {
                        codigoFleteraSap = constFleteras.flet_codigo
                    }
                    else
                    {
                        status = {
                            "status": false,
                            "data": "No fue posible obtener el codigo de fletera de la orden"
                        }
                    }
                }
                else
                {
                    status = {
                        "status": false,
                        "data": "No fue posible obtener la fletera de la orden"
                    }
                }

                

            }











































            //Si es recoleccion
            else
            {
                //Generar direccion envio que realmente es recoleccion
                if(constPreCompraFinalizada.cf_alm_almacen_recoleccion)
                {
                    //Buscar direccion de entrega recoleccion
                    const constAlmacenes = await models.Almacenes.findOne(
                    {
                        where: {
                            alm_almacen_id: constPreCompraFinalizada.cf_alm_almacen_recoleccion
                        }
                    })

                    if(constAlmacenes)
                    {

                        // if(constAlmacenes.alm_direccion)
                        // {
                        //     direccionEnvio = constAlmacenes.alm_direccion
                        // }
                        //Todo lo comentado no se usara por que la direccion del almacen ya se genero desde integracion en la tabla almacen
                        //Si existe el estado ID

                        console.log(constAlmacenes)

                        if(constAlmacenes.alm_estado_pais_id)
                        {

                            const constEstado = await models.Estado.findOne(
                            {
                                where: {
                                    estpa_estado_pais_id: constAlmacenes.alm_estado_pais_id
                                }
                            })

                            if(constEstado)
                            {
                                estadoValor = constEstado.dataValues.estpa_estado_nombre
                                estadoCodigo = constEstado.dataValues.estpa_codigo_estado
                            }
                        }
                        else
                        {
                            status = {
                                "status": false,
                                "data": "No fue posible obtener el id del almacen de recoleccion"
                            }
                        }

                        //Si existe el pais ID
                        if(constAlmacenes.alm_pais_id)
                        {

                            const constPais = await models.Pais.findOne(
                            {
                                where: {
                                    pais_pais_id: constAlmacenes.alm_pais_id
                                }
                            })

                            if(constPais)
                            {
                                paisValor = constPais.dataValues.pais_nombre
                            }
                            else
                            {
                                status = {
                                    "status": false,
                                    "data": "No fue posible obtener el id del pais de la direccion de envio"
                                }
                            }
                        }
                        else
                        {
                            status = {
                                "status": false,
                                "data": "No fue posible obtener el id del pais de la direccion de envio"
                            }
                        }

                        //Buscar informacion de almacen desde la tabla raw
                        const constRawAlmacenes = await models.RawAlmacenes.findOne(
                        {
                            where: {
                                codigoAlmacen: constAlmacenes.alm_codigoAlmacen
                            }
                        })


                        direccionEnvioJson = {
                            "tipo": "S",
                            "calle": constRawAlmacenes.calle,
                            "numeroExterior": constRawAlmacenes.numeroCalle,
                            "numeroInterior": "",
                            "ciudad": constRawAlmacenes.ciudad,
                            "municipio": constRawAlmacenes.condado,
                            "colonia": constRawAlmacenes.colonia,
                            "estado": estadoCodigo,
                            "codigoPostal": constRawAlmacenes.codigoPostal,
                            "codigoPais": "MX",
                            "contacto": "",
                            "telefono": ""
                        }

                        if(constPreCompraFinalizada.cf_alm_almacen_recoleccion == 1)
                        {
                            codigoFleteraSap = 8
                        }
                        else
                        {
                            codigoFleteraSap = 9
                        }

                    }
                    else
                    {
                        status = {
                            "status": false,
                            "data": "No fue posible obtener la informacion del almacenes de recoleccion"
                        }
                    }

                }
                else
                {
                    status = {
                        "status": false,
                        "data": "No fue posible obtener el id de almacen de envio"
                    }
                }
            }

            if(status == true)
            {
                var data = {
                    "tipo_envio": constControlMaestroMultiple.cmm_valor,
                    "direccionEnvio": direccionEnvioJson,
                    "codigoFleteraSap": codigoFleteraSap
                }

                status = {
                    "status": true,
                    data
                }

                return status
            }
            else
            {
                return status
            }
        }
        catch(e){
            console.log(e)
            var status = {
                "status": false,
                "error": e
            }
            return status
        }
    },
    agregarLineaEnvio: async function (constCompraFinalizada, constProductoCompraFinalizada, lineas, CostoEnvioEnUSDBool) {
        try{

            if(constCompraFinalizada.dataValues.cf_cmm_tipo_envio_id == 16)
            {
                // Buscar el nombre del cmm de tipo de envio
                const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
                {
                    where: {
                        cmm_control_id: constCompraFinalizada.dataValues.cf_cmm_tipo_impuesto
                    }
                })

                var ImpuestoFinal = "IVAP16"
                if(constControlMaestroMultiple.cmm_valor == "16%")
                {
                    ImpuestoFinal = "IVAP16"
                }
                else
                {
                    ImpuestoFinal = "IVAP8"
                }

                var dateFinal
                var day = new Date()
                var nuevoDia = date_and_time.addDays(day, 1)
                nuevoDia = date_and_time.addHours(nuevoDia, -5)

                dateFinal = date_and_time.format(nuevoDia, "DD/MM/YYYY HH:mm:ss")


                if(CostoEnvioEnUSDBool == true)
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

                    constCompraFinalizada.dataValues.cf_orden_gastos_envio = constCompraFinalizada.dataValues.cf_orden_gastos_envio/USDValor
                }


                var jsonArray = {
                    "codigoArticulo": "SER00003",
                    "codigoAlmacen": "01",
                    "descuento": 0,
                    "fechaEntrega": dateFinal,
                    "precioUnitario": constCompraFinalizada.dataValues.cf_orden_gastos_envio,
                    "codigoImpuesto": ImpuestoFinal,
                    "cantidad": 1
                }
                lineas.data.push(jsonArray);

                return lineas
            }

            
        }
        catch(e){
            console.log(9999999999)
            console.log(e)
            var status = {
                "status": false,
                "error": ''
            }
            return status
        }
    },
    validarLineas: async function (constPreCompraFinalizada, constPreProductoCompraFinalizada, cdc_politica_envio_surtir_un_solo_almacen, cdc_politica_envio_nombre) {
        try{
            var array = []

            //Obtener Lineas
            for (var i = 0; i < constPreProductoCompraFinalizada.length; i++) 
            {

                //Busca el SKU de los productos que se mandara
                const constProducto = await models.Producto.findOne(
                {
                    where: {
                        prod_producto_id: constPreProductoCompraFinalizada[i].dataValues.pcf_prod_producto_id
                    }
                });

                const constAlmacenes = await models.Almacenes.findOne(
                {
                    where: {
                        alm_almacen_id: constPreProductoCompraFinalizada[i].dataValues.pcf_almacen_linea
                    }
                });

                //Buscar el nombre del cmm de tipo de envio
                const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
                {
                    where: {
                        cmm_control_id: constPreCompraFinalizada.cf_cmm_tipo_impuesto
                    }
                })
                var ImpuestoFinal = "IVAP16"
                if(constControlMaestroMultiple.cmm_valor == "16%")
                {
                    ImpuestoFinal = "IVAP16"
                }
                else
                {
                    ImpuestoFinal = "IVAP8"
                }



                var precioBase = constPreProductoCompraFinalizada[i].dataValues.pcf_precio_base_venta
                var precioFinal = constPreProductoCompraFinalizada[i].dataValues.pcf_precio

                var descuentoFinalPorcentual = ((precioFinal * 100) / precioBase)
                descuentoFinalPorcentual = parseFloat((100 - descuentoFinalPorcentual).toFixed(2))


                //Fecha de entrega informacion
                var dateFinal
                var dateFinal2
                var day = new Date()

                // console.log(constPreProductoCompraFinalizada[i])
                // console.log(cdc_politica_envio_surtir_un_solo_almacen)

                //Calcular dias de envio x resurtimiento
                if(constPreProductoCompraFinalizada[i].dataValues.pcf_recoleccion_resurtimiento == true)
                {
                    console.log(11112222)
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

                    console.log("dias agregados: " + AddingsDays)

                    var nuevoDia = date_and_time.addDays(day, (AddingsDays))
                    nuevoDia = date_and_time.addHours(nuevoDia, -5)

                    dateFinal = date_and_time.format(nuevoDia, "DD/MM/YYYY HH:mm:ss")

                    dateFinal2 = date_and_time.format(nuevoDia, "YYYY/MM/DD")

                    console.log(nuevoDia)
                }
                else if(constPreProductoCompraFinalizada[i].dataValues.pcf_dias_resurtimiento > 0)
                {
                    console.log(3333344444)
                    var nuevoDia = date_and_time.addDays(day, (constPreProductoCompraFinalizada[i].dataValues.pcf_dias_resurtimiento+1))
                    nuevoDia = date_and_time.addHours(nuevoDia, -5)

                    dateFinal = date_and_time.format(nuevoDia, "DD/MM/YYYY HH:mm:ss")
                    dateFinal2 = date_and_time.format(nuevoDia, "YYYY/MM/DD")
                }
                else if(cdc_politica_envio_surtir_un_solo_almacen == false && cdc_politica_envio_nombre != null)
                {
                    console.log(5555556666)
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
                    console.log("dias agregados: " + AddingsDays)

                    var nuevoDia = date_and_time.addDays(day, (AddingsDays))
                    nuevoDia = date_and_time.addHours(nuevoDia, -5)

                    dateFinal = date_and_time.format(nuevoDia, "DD/MM/YYYY HH:mm:ss")

                    dateFinal2 = date_and_time.format(nuevoDia, "YYYY/MM/DD")

                    console.log(nuevoDia)
                }
                else
                {
                    console.log(7777788888)
                    var nuevoDia = date_and_time.addDays(day, 1)
                    nuevoDia = date_and_time.addHours(nuevoDia, -5)

                    dateFinal = date_and_time.format(nuevoDia, "DD/MM/YYYY HH:mm:ss")
                    dateFinal2 = date_and_time.format(nuevoDia, "YYYY/MM/DD")
                }





                //Cargar informacion de los productos de la orden (productos compra finalizada)
                const ActualizarLineaYEntrega = await models.ProductoCompraFinalizada.findOne(
                {
                    where: {
                        pcf_producto_compra_finalizada_id: constPreProductoCompraFinalizada[i].dataValues.pcf_producto_compra_finalizada_id
                    }
                });


                if(ActualizarLineaYEntrega)
                {
                    // var dateFinal2 = date_and_time.format(dateFinal, "YYYY/MM/DD")
                    await ActualizarLineaYEntrega.update({
                        pcf_linea_num_sap: i,
                        pcf_linea_estatus_sap: "Pendiente de confirmar",
                        pcf_fecha_entrega: dateFinal2,

                        updatedAt: Date()
                    });
                }

                //Variable para Lineas
                var jsonArray = {
                    "codigoArticulo": constProducto.dataValues.prod_sku,
                    "codigoAlmacen": constAlmacenes.alm_codigoAlmacen,
                    "precioUnitario": precioBase,
                    "codigoImpuesto": ImpuestoFinal,
                    "descuento": constPreProductoCompraFinalizada[i].dataValues.pcf_descuento_porcentual,
                    "fechaEntrega": dateFinal,
                    "cantidad": constPreProductoCompraFinalizada[i].dataValues.pcf_cantidad_producto,
                    "acuerdoG": null
                }

                array.push(jsonArray);
            }

            var status = {
                "status": true,
                "data": array
            }

            return status
        }
        catch(e){
            console.log(e)
            var status = {
                "status": false,
                "error": ''
            }
            return status
        }
    },
    validarLineasDivididaUSD: async function (constPreCompraFinalizada, constPreProductoCompraFinalizada, cdc_politica_envio_surtir_un_solo_almacen, cdc_politica_envio_nombre) {
        try{
            var array = []

            //Buscar el nombre del cmm de tipo de envio
            const constTipoCambio = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_nombre: "TIPO_CAMBIO_USD"
                },
                attributes: ["cmm_valor"]
            })

            var USDValor = constTipoCambio.cmm_valor

            //Obtener Lineas
            for (var i = 0; i < constPreProductoCompraFinalizada.length; i++) 
            {


                //Busca el SKU de los productos que se mandara
                const constProducto = await models.Producto.findOne(
                {
                    where: {
                        prod_producto_id: constPreProductoCompraFinalizada[i].dataValues.pcf_prod_producto_id
                    }
                });

                const constAlmacenes = await models.Almacenes.findOne(
                {
                    where: {
                        alm_almacen_id: constPreProductoCompraFinalizada[i].dataValues.pcf_almacen_linea
                    }
                });

                //Buscar el nombre del cmm de tipo de envio
                const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
                {
                    where: {
                        cmm_control_id: constPreCompraFinalizada.cf_cmm_tipo_impuesto
                    }
                })

                
                var ImpuestoFinal = "IVAP16"
                if(constControlMaestroMultiple.cmm_valor == "16%")
                {
                    ImpuestoFinal = "IVAP16"
                }
                else
                {
                    ImpuestoFinal = "IVAP8"
                }



                var precioMXNtoUSD = parseFloat((constPreProductoCompraFinalizada[i].dataValues.pcf_precio/USDValor).toFixed(2))

                // // var precioMXNtoUSD = parseFloat(constPreProductoCompraFinalizada[i].dataValues.pcf_precio)
                // console.log(23904238094)

                // //Variable para Lineas
                // var jsonArray = {
                //     "codigoArticulo": constProducto.dataValues.prod_sku,
                //     "codigoAlmacen": constAlmacenes.alm_codigoAlmacen,
                //     "precioUnitario": precioMXNtoUSD,
                //     "codigoImpuesto": ImpuestoFinal,
                //     "cantidad": constPreProductoCompraFinalizada[i].dataValues.pcf_cantidad_producto
                // }




                var precioBase = parseFloat((constPreProductoCompraFinalizada[i].dataValues.pcf_precio_base_venta/USDValor).toFixed(2))
                console.log(precioBase)


                var precioFinal = parseFloat((constPreProductoCompraFinalizada[i].dataValues.pcf_precio).toFixed(2))
                console.log(precioFinal)


                var descuentoFinalPorcentual = parseFloat(((precioFinal * 100) / precioBase).toFixed(2))
                descuentoFinalPorcentual = parseFloat((100 - descuentoFinalPorcentual).toFixed(2))
                console.log(descuentoFinalPorcentual)




                //Fecha de entrega informacion
                var dateFinal
                var dateFinal2
                var day = new Date()

                if(constPreProductoCompraFinalizada[i].dataValues.pcf_recoleccion_resurtimiento == true)
                {
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

                    console.log("dias agregados: " + AddingsDays)

                    var nuevoDia = date_and_time.addDays(day, (AddingsDays))
                    nuevoDia = date_and_time.addHours(nuevoDia, -5)

                    dateFinal = date_and_time.format(nuevoDia, "DD/MM/YYYY HH:mm:ss")
                    dateFinal2 = date_and_time.format(nuevoDia, "YYYY/MM/DD")
                    console.log(nuevoDia)
                }
                else if(constPreProductoCompraFinalizada[i].dataValues.pcf_dias_resurtimiento > 0)
                {
                    var nuevoDia = date_and_time.addDays(day, (constPreProductoCompraFinalizada[i].dataValues.pcf_dias_resurtimiento+1))
                    nuevoDia = date_and_time.addHours(nuevoDia, -5)

                    dateFinal = date_and_time.format(nuevoDia, "DD/MM/YYYY HH:mm:ss")
                    dateFinal2 = date_and_time.format(nuevoDia, "YYYY/MM/DD")
                }
                else if(cdc_politica_envio_surtir_un_solo_almacen == false && cdc_politica_envio_nombre != null)
                {
                    console.log(5555556666)
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
                    console.log("dias agregados: " + AddingsDays)

                    var nuevoDia = date_and_time.addDays(day, (AddingsDays))
                    nuevoDia = date_and_time.addHours(nuevoDia, -5)

                    dateFinal = date_and_time.format(nuevoDia, "DD/MM/YYYY HH:mm:ss")

                    dateFinal2 = date_and_time.format(nuevoDia, "YYYY/MM/DD")

                    console.log(nuevoDia)
                }
                else
                {
                    var nuevoDia = date_and_time.addDays(day, 1)
                    nuevoDia = date_and_time.addHours(nuevoDia, -5)

                    dateFinal = date_and_time.format(nuevoDia, "DD/MM/YYYY HH:mm:ss")
                    dateFinal2 = date_and_time.format(nuevoDia, "YYYY/MM/DD")
                }

                


                //Cargar informacion de los productos de la orden (productos compra finalizada)
                const ActualizarLineaYEntrega = await models.ProductoCompraFinalizada.findOne(
                {
                    where: {
                        pcf_producto_compra_finalizada_id: constPreProductoCompraFinalizada[i].dataValues.pcf_producto_compra_finalizada_id
                    }
                });


                if(ActualizarLineaYEntrega)
                {
                    // var dateFinal2 = date_and_time.format(dateFinal, "YYYY/MM/DD")
                    await ActualizarLineaYEntrega.update({
                        pcf_linea_num_sap: i,
                        pcf_fecha_entrega: dateFinal2,
                        pcf_linea_estatus_sap: "Pendiente de confirmar",
                        updatedAt: Date()
                    });
                }



                //Variable para Lineas
                var jsonArray = {
                    "codigoArticulo": constProducto.dataValues.prod_sku,
                    "codigoAlmacen": constAlmacenes.alm_codigoAlmacen,
                    "precioUnitario": precioBase,
                    "codigoImpuesto": ImpuestoFinal,
                    "descuento": constPreProductoCompraFinalizada[i].dataValues.pcf_descuento_porcentual,
                    "fechaEntrega": dateFinal,
                    "cantidad": constPreProductoCompraFinalizada[i].dataValues.pcf_cantidad_producto,
                    "acuerdoG": null
                }




















                array.push(jsonArray);
            }

            var status = {
                "status": true,
                "data": array
            }

            return status
        }
        catch(e){
            console.log(e)
            var status = {
                "status": false,
                "error": ''
            }
            return status
        }
    },
    validarCreditoDisponible: async function (codigo_forma_pago, id_socio_negocio, totalCarrito) {
        try{
            //obtener tipo impuesto cmm
            const constSapFormasPago = await models.SapFormasPago.findOne(
            {
                where: {
                    sfp_clave: codigo_forma_pago
                }
            })

            if(constSapFormasPago.sfp_descripcion == "Por definir")
            {
                console.log("entro l por definir")
                //obtener tipo impuesto cmm
                const constSociosNegocio = await models.SociosNegocio.findOne(
                {
                    where: {
                        sn_socios_negocio_id: id_socio_negocio
                    }
                })


                var creditoInt = constSociosNegocio.sn_credito_disponible
                
                creditoInt = creditoInt-totalCarrito
                if(creditoInt < 0)
                {
                    creditoInt = 0
                }

                await constSociosNegocio.update({
                    sn_credito_disponible : creditoInt,
                    updatedAt: Date()
                });
            }

            var status = {
                "status": true,
                "data": "Correcto"
            }

            return status
        }
        catch(e){
            console.log(e)
            var status = {
                "status": false,
                "error": ''
            }
            return status
        }
    },
    CreaLineasNumSAP: async function (order_id) {
        try{

            //Cargar informacion de los productos de la orden (productos compra finalizada)
            const constProductoCompraFinalizadaNoUSD = await models.ProductoCompraFinalizada.findAll(
            {
                where: {
                    pcf_cf_compra_finalizada_id: order_id,
                    pcf_order_dividida_sap: false
                }
            })

            //Busca los productos NO USD para ponerles una linea y que hagan match con sap al actualizar
            if(constProductoCompraFinalizadaNoUSD.length > 0)
            {
                for (var i = 0; i < constProductoCompraFinalizadaNoUSD.length; i++) 
                {
                    //Cargar informacion de los productos de la orden (productos compra finalizada)
                    const constActualizarProductoCompraFinalizada = await models.ProductoCompraFinalizada.findOne(
                    {
                        where: {
                            pcf_producto_compra_finalizada_id: constProductoCompraFinalizadaNoUSD[i].dataValues.pcf_producto_compra_finalizada_id
                        }
                    })





                    //Fecha de entrega informacion
                    var dateFinal
                    var day = new Date()


                    if(constProductoCompraFinalizadaNoUSD[i].dataValues.pcf_recoleccion_resurtimiento == true)
                    {
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

                        console.log("dias agregados: " + AddingsDays)

                        var nuevoDia = date_and_time.addDays(day, (AddingsDays))
                        nuevoDia = date_and_time.addHours(nuevoDia, -5)

                        dateFinal = date_and_time.format(nuevoDia, "YYYY/MM/DD")

                        console.log(nuevoDia)
                    }
                    else if(constProductoCompraFinalizadaNoUSD[i].dataValues.pcf_dias_resurtimiento > 0)
                    {
                        var nuevoDia = date_and_time.addDays(day, (constProductoCompraFinalizadaNoUSD[i].dataValues.pcf_dias_resurtimiento+1))
                        nuevoDia = date_and_time.addHours(nuevoDia, -5)

                        dateFinal = date_and_time.format(nuevoDia, "YYYY/MM/DD")
                    }
                    else
                    {
                        var nuevoDia = date_and_time.addDays(day, 1)
                        nuevoDia = date_and_time.addHours(nuevoDia, -5)

                        dateFinal = date_and_time.format(nuevoDia, "YYYY/MM/DD")
                    }



                    console.log(230989432324348)
                    console.log(dateFinal)
                    await constActualizarProductoCompraFinalizada.update({
                        pcf_linea_num_sap: i,
                        pcf_fecha_entrega: dateFinal,
                        updatedAt: Date()
                    });
                }
            }
























































            //Cargar informacion de los productos de la orden (productos compra finalizada)
            const constProductoCompraFinalizadaUSD = await models.ProductoCompraFinalizada.findAll(
            {
                where: {
                    pcf_cf_compra_finalizada_id: order_id,
                    pcf_order_dividida_sap: true
                }
            })

            //Busca los productos USD para ponerles una linea y que hagan match con sap al actualizar
            if(constProductoCompraFinalizadaUSD.length > 0)
            {
                for (var i = 0; i < constProductoCompraFinalizadaUSD.length; i++) 
                {
                    //Cargar informacion de los productos de la orden (productos compra finalizada)
                    const constActualizarProductoCompraFinalizada = await models.ProductoCompraFinalizada.findOne(
                    {
                        where: {
                            pcf_producto_compra_finalizada_id: constProductoCompraFinalizadaUSD[i].dataValues.pcf_producto_compra_finalizada_id
                        }
                    })



                    //Fecha de entrega informacion
                    var dateFinal
                    var day = new Date()


                    if(constProductoCompraFinalizadaUSD[i].dataValues.pcf_recoleccion_resurtimiento == true)
                    {
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

                        console.log("dias agregados: " + AddingsDays)

                        var nuevoDia = date_and_time.addDays(day, (AddingsDays))
                        nuevoDia = date_and_time.addHours(nuevoDia, -5)

                        dateFinal = date_and_time.format(nuevoDia, "YYYY/MM/DD")

                        console.log(nuevoDia)
                    }
                    else if(constProductoCompraFinalizadaUSD[i].dataValues.pcf_dias_resurtimiento > 0)
                    {
                        var nuevoDia = date_and_time.addDays(day, (constProductoCompraFinalizadaUSD[i].dataValues.pcf_dias_resurtimiento+1))
                        nuevoDia = date_and_time.addHours(nuevoDia, -5)

                        dateFinal = date_and_time.format(nuevoDia, "YYYY/MM/DD")
                    }
                    else
                    {
                        var nuevoDia = date_and_time.addDays(day, 1)
                        nuevoDia = date_and_time.addHours(nuevoDia, -5)

                        dateFinal = date_and_time.format(nuevoDia, "YYYY/MM/DD")
                    }


                    console.log(dateFinal)






                    await constActualizarProductoCompraFinalizada.update({
                        pcf_linea_num_sap : i,
                        pcf_fecha_entrega: dateFinal,
                        updatedAt: Date()
                    });
                }
            }


            console.log("finalizo")

            var status = {
                "status": true
            }

            return status
        }
        catch(e){
            console.log(e)
            var status = {
                "status": false,
                "error": ''
            }
            return status
        }
    },
    test2: async function (cdc_sn_socio_de_negocio_id) {
        try{
            var status = {
                "status": true,
                "data": ''
            }

            return status
        }
        catch(e){
            var status = {
                "status": false,
                "error": ''
            }
            return status
        }
    },
    validarCreditoDisponibleCot: async function (codigo_forma_pago, id_socio_negocio, totalCarrito) {
        try{
            //obtener tipo impuesto cmm
            const constSapFormasPago = await models.SapFormasPago.findOne(
            {
                where: {
                    sfp_clave: codigo_forma_pago
                }
            })

            if(constSapFormasPago.sfp_descripcion == "Por definir")
            {
                //obtener tipo impuesto cmm
                const constSociosNegocio = await models.SociosNegocio.findOne(
                {
                    where: {
                        sn_socios_negocio_id: id_socio_negocio
                    }
                })

                var creditoInt = constSociosNegocio.sn_credito_disponible
                
                creditoInt = creditoInt-totalCarrito
                if(creditoInt < 0)
                {
                    creditoInt = 0
                }

                await constSociosNegocio.update({
                    sn_credito_disponible : creditoInt,
                    updatedAt: Date()
                });
            }

            var status = {
                "status": true,
                "data": "Correcto"
            }

            return status
        }
        catch(e){
            console.log(e)
            var status = {
                "status": false,
                "error": ''
            }
            return status
        }
    },
};


