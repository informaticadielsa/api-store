import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import getCheckout from "../services/checkoutAPI";
import cotizarCarritoFunction from "../services/cotizarCarritoFunctions";
import CreacionOrdenSAP from "../services/CreacionOrdenSAP";
const {ordenCreadaEmail} = require('../services/ordenCreadaEmail');
const { cotizacionEnviar } = require('../services/cotizacionEnviar');


const {ordenAbiertaCreadaEmail} = require('../services/ordenAbiertaCreadaEmail');
import productosUtils from "../services/productosUtils";
import cotizacionesUtils from "../services/cotizacionesUtils";
import date_and_time from 'date-and-time';

const groupBy = function (miarray, prop) {
    return miarray.reduce(function(groups, item) {
        var val = item[prop];
        groups[val] = groups[val] || { prod_marca: item.prod_marca, car_total: 0};
        groups[val].car_total += item.car_total;
        return groups;
    }, {});
}

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

const sumarDias = function(fecha, dias){
    fecha.setDate(fecha.getDate() + dias);
    return fecha;
}




export default {
    //Cotizaciones anteriores
    crearCotizacion: async (req, res, next)  =>{
        var order_id_catch = 0
        try{
            var validacion1 = false
            var validacion2 = false

            //Get cart api sin cupones activos
            var getCart = await getCheckout.getCartAPI(req.body.cdc_sn_socio_de_negocio_id);

            order_id_catch = getCart.dataValues.cdc_numero_orden

            //Obtener tiempo de caducidad cotizacion
            const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_nombre: "TIEMPO_CADUCIDAD_COTIZACIONES"
                }
            });

            var FechaVencimiento = new Date(Date.now() + constControlMaestroMultiple.cmm_valor*24*60*60*1000);

            //Crear cotizaciones
            const constCotizaciones = await models.Cotizaciones.create({
                cot_numero_orden: getCart.cdc_numero_orden,
                cot_sn_socios_negocio_id: req.body.cdc_sn_socio_de_negocio_id,
                cot_total_cotizacion: 0,
                cot_referencia: req.body.cot_referencia,
                cot_cmm_estatus_id: statusControles.ESTATUS_COTIZACION.ACTIVO,
                cot_motivo_cancelacion: null,
                cot_usu_usuario_vendedor_id: req.body.cot_usu_usuario_vendedor_id,
                cot_fecha_vencimiento: FechaVencimiento
            });


            if(constCotizaciones)
            {   
                validacion1 = true
                //Insertar cada producto en la tabla de cotizaciones productos
                for (var i = 0; i < getCart.dataValues.productos.length; i++) 
                {
                    //var porcentajeDescuento =  (getCart.dataValues.productos[i].dataValues.precioFinal * 100) /  getCart.dataValues.productos[i].dataValues.prod_precio


                    //Si tiene stock significa que esta disponible
                    var tieneStockBool = false
                    if(getCart.dataValues.productos[i].dataValues.prod_total_stock > 0)
                    {
                        tieneStockBool = true
                    }

                    //Crear cotizaciones
                    const constCotizacionesProductos = await models.CotizacionesProductos.create({
                        cotp_cotizacion_id: constCotizaciones.dataValues.cot_cotizacion_id,
                        cotp_prod_producto_id: getCart.dataValues.productos[i].dataValues.pcdc_prod_producto_id,
                        cotp_producto_cantidad: getCart.dataValues.productos[i].dataValues.pcdc_producto_cantidad,
                        cotp_precio_base: getCart.dataValues.productos[i].dataValues.prod_precio,
                        cotp_precio_mejor_descuento: getCart.dataValues.productos[i].dataValues.precioFinal,
                        cotp_descuento_porcentaje_cotizacion: req.body.cotp_descuento_porcentaje_cotizacion ? req.body.cotp_descuento_porcentaje_cotizacion : 0,
                        cotp_precio_descuento_cotizacion: req.body.cotp_descuento_porcentaje_cotizacion ? ( getCart.dataValues.productos[i].dataValues.precioFinal - ( getCart.dataValues.productos[i].dataValues.precioFinal * (req.body.cotp_descuento_porcentaje_cotizacion/100))) : getCart.dataValues.productos[i].dataValues.precioFinal,
                        cotp_usu_descuento_cotizacion: req.body.cotp_usu_descuento_cotizacion ? req.body.cotp_usu_descuento_cotizacion : null,
                        cotp_disponible_para_compra: tieneStockBool,
                        cotp_back_order: getCart.dataValues.productos[i].dataValues.aplicaBackOrder
                    });
                }


                validacion2 = true

                //Eliminar carrito pero cuando es ENV que no lo borre para no volver a generarlo de 0
                if(validacion1 == true && validacion2 == true)
                {

                    //borrar despues el if y dejar solo codigo, Cuando se hace desde ENV no borra carrito
                    if(process.env.PORT != 5000)
                    {
                        //Borrar carrito actual
                        await models.ProductoCarritoDeCompra.destroy(
                        {
                            where: {
                                pcdc_carrito_de_compra_id: getCart.dataValues.cdc_carrito_de_compra_id
                            }
                        });

                        await models.CarritoDeCompra.destroy(
                        {
                            where: {
                                cdc_carrito_de_compra_id: getCart.dataValues.cdc_carrito_de_compra_id
                            }
                        });
                        
                    }
                    else
                    {
                        //Actualizar carrito tal vez?
                        // var newNumeroOrden =  parseInt(constCarritoDeCompra.cdc_numero_orden)+1
                        // newNumeroOrden = "0000000" + newNumeroOrden

                         
                        // const bodyUpdate = {
                        //     "cdc_numero_orden": newNumeroOrden,
                        //     updatedAt: Date()
                        // };
                        
                        // await constCarritoDeCompra.update(bodyUpdate);

                    }




                    




                }


                res.status(200).send({
                    message: 'Cotizacion Creada con exito',
                    constCotizaciones,
                    getCart
                });

            }
            else
            {
                res.status(500).send({
                    message: 'No fue posible crear la cotizacion'
                })
            }







        }catch(e){
            //borrar todo lo de cotizaciones en caso de que se creo
            if(order_id_catch != 0)
            {
                //Obtener tiempo de caducidad cotizacion
                const constCotizaciones2 = await models.Cotizaciones.findOne(
                {
                    where: {
                        cot_numero_orden: order_id_catch
                    }
                })

                if(constCotizaciones2)
                {
                    //Borrar cotizacion por si se creo
                    await models.CotizacionesProductos.destroy({
                        where: {
                            cotp_cotizacion_id: constCotizaciones2.cot_cotizacion_id
                        }
                    });
                    
                    await models.Cotizaciones.destroy({
                        where: {
                            cot_cotizacion_id: constCotizaciones2.cot_cotizacion_id
                        }
                    });
                }
            }

            res.status(200).send({
                message: 'Error, al generar la cotización',
                e
            });
            next(e);
        }
    },
    cancelarCotizacion: async(req, res, next) =>{
        try{
            const constCotizaciones = await models.Cotizaciones.findOne({
                where: {
                    cot_cotizacion_id: req.body.cot_cotizacion_id
                }
            });


            await constCotizaciones.update(
            {
                cot_cmm_estatus_id : statusControles.ESTATUS_COTIZACION.CANCELADA,
                cot_usu_usuario_modificador_id: req.body.cot_usu_usuario_modificador_id,
                updatedAt: Date()
            })


            res.status(200).send({
              message: 'Cotizacion Cancelada Correctamente'
            });

            
            }catch(e){
            res.status(500).send({
              message: 'Error al cancelar cotizacion',
              e
            });
            next(e);
        }
    },
    getCotizacionesBySN: async(req, res, next) =>{
        try{
            const constCotizaciones = await models.Cotizaciones.findAll(
            {
                where: {
                    cot_sn_socios_negocio_id: req.params.id
                },
            });


            res.status(200).send({
                message: 'Lista de Cotizaciones por SN',
                constCotizaciones
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    updateCotizacionesLinea: async(req, res, next) =>{
        try{
            const constCotizacionesProductos = await models.CotizacionesProductos.findOne(
            {
                where: {
                    cotp_cotizaciones_productos_id: req.body.cotp_prod_producto_id,
                    cotp_cotizacion_id: req.body.cotp_cotizacion_id
                },
            });

            //Variable con el descuento que le asigne el vendedor
            var cotp_descuento_porcentaje_cotizacion = 0
            if(req.body.cotp_descuento_porcentaje_cotizacion)
            {
                cotp_descuento_porcentaje_cotizacion = req.body.cotp_descuento_porcentaje_cotizacion
            }

            console.log(req.body.cotp_usu_usuario_modificado_id)

            var cotp_precio_descuento_cotizacion = constCotizacionesProductos.cotp_precio_mejor_descuento
            //Si tiene descuento calculara el nuevo valor final del producto
            if(cotp_descuento_porcentaje_cotizacion > 0 )
            {
                cotp_precio_descuento_cotizacion = cotp_precio_descuento_cotizacion - (cotp_precio_descuento_cotizacion*(cotp_descuento_porcentaje_cotizacion/100))
            }

            await constCotizacionesProductos.update({
                cotp_producto_cantidad : !!req.body.cotp_producto_cantidad ? req.body.cotp_producto_cantidad : constCotizacionesProductos.dataValues.cotp_producto_cantidad,
                cotp_descuento_porcentaje_cotizacion : cotp_descuento_porcentaje_cotizacion,
                cotp_precio_descuento_cotizacion : cotp_precio_descuento_cotizacion,
                cotp_usu_descuento_cotizacion : !!req.body.cotp_usu_descuento_cotizacion ? req.body.cotp_usu_descuento_cotizacion : constCotizacionesProductos.dataValues.cotp_usu_descuento_cotizacion,
                cotp_usu_usuario_modificado_id : !!req.body.cotp_usu_usuario_modificado_id ? req.body.cotp_usu_usuario_modificado_id : constCotizacionesProductos.dataValues.cotp_usu_usuario_modificado_id,
                updatedAt: Date()
            });


            res.status(200).send({
                message: 'Actualización correcta'
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al actualizar',
                error: e
            });
            next(e);
        }
    },
    setCotShippingDetail: async(req, res, next) =>{
        try{
            var cot_cotizacion_id = req.body.cot_cotizacion_id
            var cot_cmm_tipo_envio_id = req.body.cot_cmm_tipo_envio_id
            var cot_direccion_envio_id = req.body.cot_direccion_envio_id
            var cot_alm_almacen_recoleccion = req.body.cot_alm_almacen_recoleccion
            var cot_fletera_id = req.body.cot_fletera_id

            //obtener tipo impuesto cmm
            const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_control_id: cot_cmm_tipo_envio_id
                }
            })

            //Envio a domicilio si el ID es 16 de tipo envio
            if(constControlMaestroMultiple.cmm_valor == "Envío domicilio")
            {
                //usara la function de cotizador
                var mejorPromocionPrecio = await cotizarCarritoFunction.CotizarCotizacionFunction(cot_cotizacion_id, cot_cmm_tipo_envio_id, cot_direccion_envio_id, cot_alm_almacen_recoleccion, cot_fletera_id);

                //Si trai valor mayor o igual a 0 significa que cotizo
                if(mejorPromocionPrecio == 0 || mejorPromocionPrecio > 0)
                {
                    //Obtener cot id
                    const constCotizaciones = await models.Cotizaciones.findOne(
                    {
                        where: {
                            cot_cotizacion_id: cot_cotizacion_id
                        }
                    });

                    //Actualizar carrito
                    await constCotizaciones.update({
                        cot_cmm_tipo_envio_id: cot_cmm_tipo_envio_id,
                        cot_direccion_envio_id: cot_direccion_envio_id,
                        cot_alm_almacen_recoleccion: cot_alm_almacen_recoleccion,
                        cot_fletera_id: cot_fletera_id,
                        cot_costo_envio: mejorPromocionPrecio,
                        updatedAt: Date()
                    });

                    res.status(200).send({
                        message: 'Cotizado con exito',
                        costoEnvio: mejorPromocionPrecio
                    })
                }
                else
                {
                    //Obtener cot id
                    const constCotizaciones = await models.Cotizaciones.findOne(
                    {
                        where: {
                            cot_cotizacion_id: cot_cotizacion_id
                        }
                    });

                    //Actualizar carrito
                    await constCarritoDeCompra.update({
                        cot_cmm_tipo_envio_id: null,
                        cot_direccion_envio_id: null,
                        cot_alm_almacen_recoleccion: null,
                        cot_fletera_id: null,
                        cot_costo_envio: null,
                        updatedAt: Date()
                    });

                    res.status(500).send({
                        message: 'No fue posible obtener el costo de envio',
                        e: mejorPromocionPrecio
                    })
                }
            }












            //Si el tipo de envio es 17 es recoleccion
            else if(constControlMaestroMultiple.cmm_valor == "Recolección")
            {
                //Obtener cot id
                const constCotizaciones = await models.Cotizaciones.findOne(
                {
                    where: {
                        cot_cotizacion_id: cot_cotizacion_id
                    }
                });

                var fleteraRecoleccion
                if(cot_alm_almacen_recoleccion == 1)
                {
                    fleteraRecoleccion = 8
                }
                else
                {
                    fleteraRecoleccion = 9
                }

                //Actualizar carrito
                await constCotizaciones.update({
                    cot_cmm_tipo_envio_id: cot_cmm_tipo_envio_id,
                    cot_direccion_envio_id: null,
                    cot_alm_almacen_recoleccion: cot_alm_almacen_recoleccion,
                    cot_fletera_id: fleteraRecoleccion,
                    cot_costo_envio: 0,
                    updatedAt: Date()
                });

                res.status(200).send({
                    message: 'Cotizado con exito',
                    costoEnvio: 0
                })
            }



        }
        catch(e){
            res.status(500).send({
                message: 'error al cotizar y actualizar carrito',
                e
            });
            next(e);
        }
    },
    asignCotCFDI: async(req, res, next) =>{
        try{
            var cot_cotizacion_id = req.body.cot_cotizacion_id

            //Obtener cot id
            const constCotizaciones = await models.Cotizaciones.findOne(
            {
                where: {
                    cot_cotizacion_id: cot_cotizacion_id
                }
            });

            await constCotizaciones.update({
                cot_cfdi: req.body.cot_cfdi,
                updatedAt: Date()
            });

            res.status(200).send({
                message: 'CFDI Actualizada'
            })
        }
        catch(e){
            res.status(500).send({
                message: 'Error al asignar cupon al carrito',
                e
            });
            next(e);
        }
    },
    setCotTipoCompra: async(req, res, next) =>{
        try{

            var cot_cotizacion_id = req.body.cot_cotizacion_id
            var sfp_sap_formas_pago_id = req.body.sfp_sap_formas_pago_id
           
            //Obtener cot id
            const constCotizaciones = await models.Cotizaciones.findOne(
            {
                where: {
                    cot_cotizacion_id: cot_cotizacion_id
                }
            });

            //buscar carrito para actualizar
            const constSapFormasPago = await models.SapFormasPago.findOne(
            {
                where: {
                    sfp_sap_formas_pago_id: sfp_sap_formas_pago_id
                }
            });

            //Actualizar carrito
            await constCotizaciones.update({
                cot_forma_pago_codigo: constSapFormasPago.sfp_clave,
                updatedAt: Date()
            });

            res.status(200).send({
                message: 'Se actualizo correctamente'
            })

        }
        catch(e){
            res.status(500).send({
                message: 'error al actualizar',
                e
            });
            next(e);
        }
    }, 
    V2finalizarCompraCot: async(req, res, next) =>{
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


            //variable de socio de negocio
            var cdc_sn_socio_de_negocio_id = req.body.cdc_sn_socio_de_negocio_id
            var cot_cotizacion_id = req.body.cot_cotizacion_id



            // //Guardar carrito por seguridad
            //     const safeconstCarritoDeCompra = await models.CarritoDeCompra.findOne(
            //     {
            //         where: {
            //             cdc_sn_socio_de_negocio_id: cdc_sn_socio_de_negocio_id
            //         }
            //     })

            //     //Productos del carrito de compra
            //     const safeconstProductoCarritoDeCompra = await models.ProductoCarritoDeCompra.findAll(
            //     {
            //         where: {
            //             pcdc_carrito_de_compra_id: safeconstCarritoDeCompra.cdc_carrito_de_compra_id
            //         }
            //     })


            //     //Crear carritos al ionternet insertar por seguridad
            //     if(safeconstCarritoDeCompra && safeconstProductoCarritoDeCompra)
            //     {
            //         console.log(safeconstCarritoDeCompra)
            //         await models.SafeCarritoDeCompra.create(safeconstCarritoDeCompra.dataValues)

            //         for (var u = 0; u < safeconstProductoCarritoDeCompra.length; u++) 
            //         {
            //             await models.SafeProductoCarritoDeCompra.create(safeconstProductoCarritoDeCompra[u].dataValues)
            //         }

            //     }
            // //Fin guardar carrito




            //Obtener cot id
            const constCotizaciones = await models.Cotizaciones.findOne(
            {
                where: {
                    cot_cotizacion_id: cot_cotizacion_id
                }
            });


            //GetCotizacionCheckout
                if(constCotizaciones)
                {

                    // //get socio negocio detalle
                    // const constSociosNegocio = await models.SociosNegocio.findOne(
                    // {
                    //     where: {
                    //         sn_socios_negocio_id: constCotizaciones.cot_sn_socios_negocio_id
                    //     },
                    // });

                    // //get socio negocio detalle
                    // const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
                    // {
                    //     where: {
                    //         cmm_control_id: constSociosNegocio.sn_cmm_tipo_impuesto
                    //     },
                    // });

                    // //get vendedor detalle
                    // const constUsuario = await models.Usuario.findOne(
                    // {
                    //     where: {
                    //         usu_usuario_id: constCotizaciones.cot_usu_usuario_vendedor_id
                    //     },
                    //     attributes: 
                    //     {
                    //         exclude: ['usu_contrasenia', 'usu_correo_electronico', 'usu_codigo_vendedor', 'usu_usuario_modificado_por_id', 'usu_usuario_creado_por_id', 'usu_imagen_perfil_id','usu_rol_rol_id', 'usu_cmm_estatus_id',     
                    //                     'createdAt','updatedAt']
                    //     }
                    // });

                    // constCotizaciones.dataValues.SociosNegocio = constSociosNegocio
                    // constCotizaciones.dataValues.Vendedor = constUsuario

                    // //Cotizacion productos
                    // const constCotizacionesProductos = await models.CotizacionesProductos.findAll(
                    // {
                    //     where: {
                    //         cotp_cotizacion_id: constCotizaciones.cot_cotizacion_id
                    //     },
                    // });

                    // //envio + 3%
                    // if(constCotizaciones.cot_forma_pago_codigo == "28" || constCotizaciones.cot_forma_pago_codigo == "04")
                    // {
                    //     constCotizaciones.cot_costo_envio = parseFloat((constCotizaciones.cot_costo_envio * 1.03).toFixed(2))
                    // }

                    // //Variables Totales
                    // var precioTotal = 0         //Total precio base                     Subtotal 
                    // var precioFinalTotal = 0    //Total con descuentos de SN o promos   Subtotal Tras Descuento
                    // var totalDescuentos = 0     //Total del descuento                   Descuento
                    // var TotalImpuestoProductos = 0 //Total Impuestos                    IVA 16%
                    // var precioFinalTotalMasImpuestos = 0 //TOTAL FINAL TOTAL            Total

                    // for (var i = 0; i < constCotizacionesProductos.length; i++) 
                    // {
                    //     //envio + 3%
                    //     if(constCotizaciones.cot_forma_pago_codigo == "28" || constCotizaciones.cot_forma_pago_codigo == "04")
                    //     {
                    //         constCotizacionesProductos[i].dataValues.cotp_precio_mejor_descuento = parseFloat((constCotizacionesProductos[i].dataValues.cotp_precio_mejor_descuento * 1.03).toFixed(2))
                    //     }

                    //     //Set total descuento por producto (cambiable)
                    //     var totalDescuentoIndividual = constCotizacionesProductos[i].dataValues.cotp_precio_base - constCotizacionesProductos[i].dataValues.cotp_precio_mejor_descuento
                    //     constCotizacionesProductos[i].dataValues.totalDescuento = totalDescuentoIndividual


                    //     //Cotizacion productos
                    //     const constProducto = await models.Producto.findOne(
                    //     {
                    //         where: {
                    //             prod_producto_id: constCotizacionesProductos[i].dataValues.cotp_prod_producto_id
                    //         },
                    //     });

                    //     constCotizacionesProductos[i].dataValues.Producto = constProducto

                    //     //Obtener total de la cotizacion
                    //     precioFinalTotal += constCotizacionesProductos[i].dataValues.cotp_precio_mejor_descuento * constCotizacionesProductos[i].dataValues.cotp_producto_cantidad
                    //     precioTotal += constCotizacionesProductos[i].dataValues.cotp_producto_cantidad * constProducto.prod_precio

                    // }   //Fin For



                    // constCotizaciones.dataValues.CotizacionesProductos = constCotizacionesProductos


                    // //Total + impuesto
                    // var valorImpuesto = 16
                    // if(constControlMaestroMultiple.cmm_valor == '8%')
                    // {
                    //     valorImpuesto = 8
                    // }
                    // TotalImpuestoProductos += (valorImpuesto/100)*precioFinalTotal
                    

                    // //PrecioMasImpuestos FINAL
                    // precioFinalTotalMasImpuestos += TotalImpuestoProductos+precioFinalTotal


                    // totalDescuentos += parseFloat((precioTotal-precioFinalTotal).toFixed(2))

                    // constCotizaciones.dataValues.precioTotal = precioTotal
                    // constCotizaciones.dataValues.precioFinalTotal = precioFinalTotal
                    // constCotizaciones.dataValues.totalDescuentos = totalDescuentos
                    // constCotizaciones.dataValues.TotalImpuestoProductos = TotalImpuestoProductos
                    // constCotizaciones.dataValues.precioFinalTotalMasImpuestos = precioFinalTotalMasImpuestos
















                    // var jsonMXN = []
                    // var jsonUSD = []

                    // //Obtener tipo de cambio
                    // const constTipoCambio = await models.ControlMaestroMultiple.findOne(
                    // {
                    //     where: {
                    //         cmm_nombre: "TIPO_CAMBIO_USD"
                    //     },
                    //     attributes: ["cmm_valor"]
                    // })
                    // var USDValor = constTipoCambio.cmm_valor


                    // var precioTotal = 0
                    // var totalDescuentos = 0
                    // var precioFinalTotal = 0
                    // var cdc_costo_envio = 0
                    // var TotalImpuesto = 0
                    // var TotalFinal = 0


                    // var precioTotal_usd = 0
                    // var totalDescuentos_usd = 0
                    // var precioFinalTotal_usd = 0
                    // var cdc_costo_envio_usd = 0
                    // var TotalImpuesto_usd = 0
                    // var TotalFinal_usd = 0

                    // var precioTotalTemp


                    // for (var i = 0; i < constCotizacionesProductos.length; i++) 
                    // {
                    //     // if(prod_tipo_cambio_base)
                    //     if(constCotizacionesProductos[i].dataValues.Producto.prod_tipo_cambio_base == "USD")
                    //     {
                    //         //Variable que saca el total subtotal (cantidad x precio base)
                    //         precioTotalTemp = (constCotizacionesProductos[i].dataValues.cotp_producto_cantidad * constCotizacionesProductos[i].dataValues.cotp_precio_base)/USDValor
                    //         precioTotal_usd += precioTotalTemp

                    //         //Calculara el total de descuentos
                    //         totalDescuentos_usd += (constCotizacionesProductos[i].dataValues.cotp_producto_cantidad * (constCotizacionesProductos[i].dataValues.cotp_precio_base - constCotizacionesProductos[i].dataValues.cotp_precio_mejor_descuento))/USDValor

                    //     }
                    //     else
                    //     {
                    //         //Variable que saca el total subtotal (cantidad x precio base)
                    //         precioTotalTemp = constCotizacionesProductos[i].dataValues.cotp_producto_cantidad * constCotizacionesProductos[i].dataValues.cotp_precio_base
                    //         precioTotal += precioTotalTemp

                    //         //Calculara el total de descuentos
                    //         totalDescuentos += constCotizacionesProductos[i].dataValues.cotp_producto_cantidad * (constCotizacionesProductos[i].dataValues.cotp_precio_base - constCotizacionesProductos[i].dataValues.cotp_precio_mejor_descuento)
                    //     }
                        
                    // }


                    // precioFinalTotal_usd += precioTotal_usd-totalDescuentos_usd
                    // var cantidadImpuesto = valorImpuesto

                    // TotalImpuesto_usd = parseFloat(((precioFinalTotal_usd)*(cantidadImpuesto/100)).toFixed(2))
                    // TotalFinal_usd = parseFloat((precioFinalTotal_usd+TotalImpuesto_usd).toFixed(2))


                    // var jsonArrayUSD = {
                    //     "precioTotal_usd": precioTotal_usd,
                    //     "totalDescuentos_usd": totalDescuentos_usd,
                    //     "precioFinalTotal_usd": precioFinalTotal_usd,
                    //     "cdc_costo_envio_usd": cdc_costo_envio_usd,
                    //     "TotalImpuesto_usd": TotalImpuesto_usd,
                    //     "TotalFinal_usd": TotalFinal_usd
                    // }

                    // precioFinalTotal = precioTotal-totalDescuentos
                    // cdc_costo_envio = constCotizaciones.cot_costo_envio

                    // TotalImpuesto = parseFloat(((precioFinalTotal+cdc_costo_envio)*(cantidadImpuesto/100)).toFixed(2))
                    // TotalFinal = parseFloat(((precioFinalTotal+cdc_costo_envio)+TotalImpuesto).toFixed(2))

                    // var jsonArray = {
                    //     "precioTotal": precioTotal,
                    //     "totalDescuentos": totalDescuentos,
                    //     "precioFinalTotal": precioFinalTotal,
                    //     "cdc_costo_envio": cdc_costo_envio,
                    //     "TotalImpuesto": TotalImpuesto,
                    //     "TotalFinal": TotalFinal
                    // }


                    // var jsonFinal = []
                    // jsonFinal.push(jsonArrayUSD)
                    // jsonFinal.push(jsonArray)
                    //get socio negocio detalle
                    const constSociosNegocio = await models.SociosNegocio.findOne(
                    {
                        where: {
                            sn_socios_negocio_id: constCotizaciones.cot_sn_socios_negocio_id
                        },
                    });

                    //get socio negocio detalle
                    const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
                    {
                        where: {
                            cmm_control_id: constSociosNegocio.sn_cmm_tipo_impuesto
                        },
                    });

                    //get vendedor detalle
                    const constUsuario = await models.Usuario.findOne(
                    {
                        where: {
                            usu_usuario_id: constCotizaciones.cot_usu_usuario_vendedor_id
                        },
                        attributes: 
                        {
                            exclude: ['usu_contrasenia', 'usu_correo_electronico', 'usu_codigo_vendedor', 'usu_usuario_modificado_por_id', 'usu_usuario_creado_por_id', 'usu_imagen_perfil_id','usu_rol_rol_id', 'usu_cmm_estatus_id',     
                                        'createdAt','updatedAt']
                        }
                    });

                    constCotizaciones.dataValues.SociosNegocio = constSociosNegocio
                    constCotizaciones.dataValues.Vendedor = constUsuario

                    //Cotizacion productos
                    const constCotizacionesProductos = await models.CotizacionesProductos.findAll(
                    {
                        where: {
                            cotp_cotizacion_id: constCotizaciones.cot_cotizacion_id
                        },
                    });



                    //envio + 3%
                    if(constCotizaciones.cot_forma_pago_codigo == "28" || constCotizaciones.cot_forma_pago_codigo == "04")
                    {
                        constCotizaciones.cot_costo_envio = parseFloat((constCotizaciones.cot_costo_envio * 1.03).toFixed(2))
                    }



                    //Variables Totales
                    var precioTotal = 0         //Total precio base                     Subtotal 
                    var precioFinalTotal = 0    //Total con descuentos de SN o promos   Subtotal Tras Descuento
                    var totalDescuentos = 0     //Total del descuento                   Descuento
                    var TotalImpuestoProductos = 0 //Total Impuestos                    IVA 16%
                    var precioFinalTotalMasImpuestos = 0 //TOTAL FINAL TOTAL            Total

                    var preciobase = 0
                    var precioDescontado = 0
                    for (var i = 0; i < constCotizacionesProductos.length; i++) 
                    {



                        //Set total descuento por producto (cambiable)
                        var totalDescuentoIndividual = constCotizacionesProductos[i].dataValues.cotp_precio_base - constCotizacionesProductos[i].dataValues.cotp_precio_mejor_descuento
                        constCotizacionesProductos[i].dataValues.totalDescuento = totalDescuentoIndividual


                        preciobase += constCotizacionesProductos[i].dataValues.cotp_precio_base * constCotizacionesProductos[i].dataValues.cotp_producto_cantidad
                        precioDescontado += constCotizacionesProductos[i].dataValues.cotp_precio_mejor_descuento * constCotizacionesProductos[i].dataValues.cotp_producto_cantidad


                        //envio + 3%
                        if(constCotizaciones.cot_forma_pago_codigo == "28" || constCotizaciones.cot_forma_pago_codigo == "04")
                        {
                            constCotizacionesProductos[i].dataValues.cotp_precio_descuento_cotizacion = parseFloat((constCotizacionesProductos[i].dataValues.cotp_precio_descuento_cotizacion * 1.03).toFixed(2))
                        }

                        //Cotizacion productos
                        const constProducto = await models.Producto.findOne(
                        {
                            where: {
                                prod_producto_id: constCotizacionesProductos[i].dataValues.cotp_prod_producto_id
                            },
                        });

                        constCotizacionesProductos[i].dataValues.Producto = constProducto

                        //Obtener total de la cotizacion
                        precioFinalTotal += constCotizacionesProductos[i].dataValues.cotp_precio_descuento_cotizacion * constCotizacionesProductos[i].dataValues.cotp_producto_cantidad
                        precioTotal += constCotizacionesProductos[i].dataValues.cotp_producto_cantidad * constProducto.prod_precio

                    }   //Fin For



                    constCotizaciones.dataValues.CotizacionesProductos = constCotizacionesProductos


                    //Total + impuesto
                    var valorImpuesto = 16
                    if(constControlMaestroMultiple.cmm_valor == '8%')
                    {
                        valorImpuesto = 8
                    }
                    TotalImpuestoProductos += (valorImpuesto/100)*precioFinalTotal
                    

                    //PrecioMasImpuestos FINAL
                    precioFinalTotalMasImpuestos += parseFloat((TotalImpuestoProductos+precioFinalTotal+(((valorImpuesto/100)*constCotizaciones.dataValues.cot_costo_envio)+constCotizaciones.dataValues.cot_costo_envio)).toFixed(2))


                    totalDescuentos += parseFloat((preciobase-precioDescontado).toFixed(2))



                    constCotizaciones.dataValues.precioTotal = precioTotal
                    constCotizaciones.dataValues.precioFinalTotal = parseFloat(precioFinalTotal.toFixed(2))
                    constCotizaciones.dataValues.totalDescuentos = totalDescuentos
                    constCotizaciones.dataValues.TotalImpuestoProductos = parseFloat(TotalImpuestoProductos.toFixed(2))
                    constCotizaciones.dataValues.precioFinalTotalMasImpuestos = precioFinalTotalMasImpuestos



                    precioFinalTotal = precioTotal-totalDescuentos
                    cdc_costo_envio = constCotizaciones.cot_costo_envio















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

                    for (var i = 0; i < constCotizacionesProductos.length; i++) 
                    {
                        // if(prod_tipo_cambio_base)
                        if(constCotizacionesProductos[i].dataValues.Producto.prod_tipo_cambio_base == "USD")
                        {
                            //Variable que saca el total subtotal (cantidad x precio base)
                            precioTotalTemp = (constCotizacionesProductos[i].dataValues.cotp_producto_cantidad * constCotizacionesProductos[i].dataValues.cotp_precio_base)/USDValor
                            precioTotal_usd += precioTotalTemp

                            //Calculara el total de descuentos
                            totalDescuentos_usd += (constCotizacionesProductos[i].dataValues.cotp_producto_cantidad * (constCotizacionesProductos[i].dataValues.cotp_precio_base - constCotizacionesProductos[i].dataValues.cotp_precio_mejor_descuento))/USDValor

                        }
                        else
                        {
                            //Variable que saca el total subtotal (cantidad x precio base)
                            precioTotalTemp = constCotizacionesProductos[i].dataValues.cotp_producto_cantidad * constCotizacionesProductos[i].dataValues.cotp_precio_base
                            precioTotal += precioTotalTemp

                            //Calculara el total de descuentos
                            totalDescuentos += constCotizacionesProductos[i].dataValues.cotp_producto_cantidad * (constCotizacionesProductos[i].dataValues.cotp_precio_base - constCotizacionesProductos[i].dataValues.cotp_precio_mejor_descuento)
                        }
                    }


                    precioFinalTotal_usd += precioTotal_usd-totalDescuentos_usd
                    var cantidadImpuesto = valorImpuesto

                    TotalImpuesto_usd = parseFloat(((precioFinalTotal_usd)*(cantidadImpuesto/100)).toFixed(2))
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
                    cdc_costo_envio = constCotizaciones.cot_costo_envio
                    // cdc_costo_envio = 0

                    TotalImpuesto = parseFloat(((precioFinalTotal+cdc_costo_envio)*(cantidadImpuesto/100)).toFixed(2))
                    TotalFinal = parseFloat(((precioFinalTotal+cdc_costo_envio)+TotalImpuesto).toFixed(2))

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


                    constCotizaciones.dataValues.ResumenDivicion = jsonFinal
                }
            //End GetCotizacionCheckout

































            //Cotizacion productos
            const constCotizacionesProductos = await models.CotizacionesProductos.findAll(
            {
                where: {
                    cotp_cotizacion_id: constCotizaciones.cot_cotizacion_id
                },
            });



            //informacion Vendedor
            var cf_vendido_por_usu_usuario_id
            if(req.body.cf_vendido_por_usu_usuario_id)
            {
                cf_vendido_por_usu_usuario_id = req.body.cf_vendido_por_usu_usuario_id
            }
            else
            {
                //Obtener carrito
                const constSociosNegocioVendedor = await models.SociosNegocio.findOne(
                {
                    where: {
                        sn_socios_negocio_id: constCotizaciones.cot_sn_socios_negocio_id
                    }
                })

                cf_vendido_por_usu_usuario_id = constSociosNegocioVendedor.sn_vendedor_codigo_sap
            }
            console.log(cf_vendido_por_usu_usuario_id)



            

            //Obtener Checkout
            // var checkoutJson = await getCheckout.getCheckoutAPI(req.body.cdc_sn_socio_de_negocio_id);

            //Validar si el carrito es de tipo credito forma de pago y si lo es restar el credito y pasar la orden
            var creditoResult = await CreacionOrdenSAP.validarCreditoDisponible(constCotizaciones.cot_forma_pago_codigo, constCotizaciones.cot_sn_socios_negocio_id, constCotizaciones.precioFinalTotalMasImpuestos);

            //obtener tipo impuesto cmm
            const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_control_id: constCotizaciones.dataValues.SociosNegocio.dataValues.sn_cmm_tipo_impuesto
                }
            })

            //Obtener resumenes divididos
            var resumenDividido = constCotizaciones.dataValues.ResumenDivicion



            //Crear compra finalizada en tabla preValidadora
            const constCompraFinalizada = await models.CompraFinalizada.create({
                cf_compra_numero_orden: constCotizaciones.dataValues.cot_numero_orden,
                cf_compra_fecha: Date(),
                cf_vendido_por_usu_usuario_id: cf_vendido_por_usu_usuario_id,
                cf_cmm_tipo_compra_id: null, //no aplica, porque existe el campo forma de pago
                cf_vendido_a_socio_negocio_id: constCotizaciones.dataValues.cot_sn_socios_negocio_id,
                cf_cmm_tipo_envio_id: constCotizaciones.dataValues.cot_cmm_tipo_envio_id, 
                cf_direccion_envio_id: constCotizaciones.dataValues.cot_direccion_envio_id,
                cf_cmm_tipo_impuesto: constControlMaestroMultiple.cmm_control_id, 
                cf_alm_almacen_recoleccion: constCotizaciones.dataValues.cot_alm_almacen_recoleccion,
                cf_total_compra: constCotizaciones.dataValues.precioFinalTotalMasImpuestos,
                cf_estatus_orden: 1000107,
                cf_fletera_id: constCotizaciones.dataValues.cot_fletera_id,
                cf_sap_metodos_pago_codigo: /*!!req.body.cdc_forma_pago_codigo ? req.body.cdc_forma_pago_codigo : null,*/ "PUE", //pago unico
                cf_sap_forma_pago_codigo: constCotizaciones.dataValues.cot_forma_pago_codigo ? constCotizaciones.dataValues.cot_forma_pago_codigo : null,
                cf_estatus_creacion_sap: null,
                cf_descripcion_sap: null,
                cf_referencia: constCotizaciones.dataValues.cot_referencia, 
                cf_promcup_promociones_cupones_id: null,
                cf_orden_subtotal: constCotizaciones.dataValues.precioTotal,
                cf_orden_descuento: constCotizaciones.dataValues.totalDescuentos,
                cf_orden_subtotal_aplicado: constCotizaciones.dataValues.precioFinalTotal,
                cf_orden_gastos_envio: parseFloat(constCotizaciones.dataValues.cot_costo_envio.toFixed(2)),
                cf_order_iva: constCotizaciones.dataValues.TotalImpuestoProductos + parseFloat((constCotizaciones.dataValues.cot_costo_envio*0.16).toFixed(2)),
                cf_cfdi: constCotizaciones.dataValues.cot_cfdi,
                cf_estatus_orden_usd: 1000107,
                cf_resume_mxn: resumenDividido[1],
                cf_resume_usd: resumenDividido[0]
            });





            if(constCompraFinalizada)
            {
                //Obtener Lineas para insertar en la tabla productos compra finalizada y para sap
                var lineasTemporales = await getCheckout.getCotizacionLineasProductosComprasFinalizadas(constCotizaciones, constCompraFinalizada.dataValues.cf_compra_finalizada_id);
                console.log(lineasTemporales)

                //Pago con credito dielsa
                if(constCotizaciones.dataValues.cot_forma_pago_codigo == 99)
                {
                    //Si regresa true significa que dividira la orden en dos partes una para USD y otra para MXN (no regresa true XD)
                    var ordernDividida = await getCheckout.validarLineasIfDividirOrdenUSDExchage(lineasTemporales)
                    var ordenDivididaBool = false

                    //la orden puede estar dividida en dos
                    for (var j = 0; j < ordernDividida.length; j++)
                    {
                        if(ordernDividida[j].principal.length > 0)
                        {
                            //Insertar cada producto en la tabla de productos compras finalizadas
                            for (var i = 0; i < ordernDividida[j].principal.length; i++) 
                            {
                                ordernDividida[j].principal[i].pcf_order_dividida_sap = false
                                ordernDividida[j].principal[i].pcf_numero_orden_usd_sap = null
                                await models.ProductoCompraFinalizada.create(ordernDividida[j].principal[i]);
                            }
                        }
                        else if(ordernDividida[j].secundario.length > 0)
                        {
                            //Insertar cada producto en la tabla de productos compras finalizadas
                            for (var i = 0; i < ordernDividida[j].secundario.length; i++) 
                            {
                                ordernDividida[j].secundario[i].pcf_order_dividida_sap = true
                                ordernDividida[j].secundario[i].pcf_precio = parseFloat((ordernDividida[j].secundario[i].pcf_precio / USDValor).toFixed(2))
                                ordernDividida[j].secundario[i].pcf_descuento_promocion = parseFloat((ordernDividida[j].secundario[i].pcf_descuento_promocion / USDValor).toFixed(2))
                                ordernDividida[j].secundario[i].pcf_numero_orden_usd_sap = constCotizaciones.dataValues.cot_numero_orden + '-01'
                                await models.ProductoCompraFinalizada.create(ordernDividida[j].secundario[i]);
                            }
                            ordenDivididaBool = true
                        }
                    }

                    if(ordenDivididaBool == true)
                    {
                        await constCompraFinalizada.update({
                            cf_orden_dividida_sap : constCotizaciones.dataValues.cot_numero_orden + '-01',
                            updatedAt: Date()
                        });
                    }

                    //Crear Num lineas para sap a la tabla productos compra finalizada
                    var lineaNum = await CreacionOrdenSAP.CreaLineasNumSAP(constCompraFinalizada.dataValues.cf_compra_finalizada_id);

                    var jsonSAP = await CreacionOrdenSAP.CreacionOrdenSAPDivididaUSD(constCotizaciones.cot_sn_socios_negocio_id, constCompraFinalizada.dataValues.cf_compra_finalizada_id);
                }
                else
                {
                    //Insertar cada producto en la tabla de productos compras finalizadas
                    for (var i = 0; i < lineasTemporales.length; i++) 
                    {
                        await models.ProductoCompraFinalizada.create(lineasTemporales[i]);
                    }

                    // //Obtener Lineas para insertar en la tabla productos compra finalizada y para sap
                    // var lineasTemporales = await CreacionOrdenSAP.CreacionOrdenSAP(checkoutJson, constCompraFinalizada.dataValues.cf_compra_finalizada_id);

                    //Crear Num lineas para sap a la tabla productos compra finalizada
                    var lineaNum = await CreacionOrdenSAP.CreaLineasNumSAP(constCompraFinalizada.dataValues.cf_compra_finalizada_id);

                    //Crear Orden Sap
                    var jsonSAP = await CreacionOrdenSAP.CreacionOrdenSAP(constCotizaciones.cot_sn_socios_negocio_id, constCompraFinalizada.dataValues.cf_compra_finalizada_id);
                }



                //borrar despues el if y dejar solo codigo, Cuando se hace desde ENV no borra carrito
                if(process.env.PORT != 5000)
                {
                    //Borrar carrito actual
                    await models.CotizacionesProductos.destroy({
                        where: {
                            cotp_cotizacion_id: constCotizaciones.cot_cotizacion_id
                        }
                    });

                    await models.Cotizaciones.destroy({
                        where: {
                            cot_cotizacion_id: cot_cotizacion_id
                        }
                    });
                }
                else
                {
                    var newNumeroOrden =  parseInt(constCotizaciones.cot_numero_orden)+1
                    newNumeroOrden = "0000000" + newNumeroOrden
                     
                    const bodyUpdate = {
                        "cot_numero_orden": newNumeroOrden,
                        updatedAt: Date()
                    };
                    
                    await constCotizaciones.update(bodyUpdate);
                }

                await ordenCreadaEmail(constCompraFinalizada.dataValues.cf_compra_finalizada_id);

                // //Validar el json de sap
                // var validarOrdenSAP = await CreacionOrdenSAP.preValidarCreacionOrdenSAP(req.body.cdc_sn_socio_de_negocio_id, constCompraFinalizada.dataValues.cf_compra_finalizada_id);

                res.status(200).send({
                    message: 'Orden creada con exito',
                    cf_compra_finalizada_id: constCompraFinalizada.dataValues.cf_compra_finalizada_id
                })
            }  
            else
            {
                res.status(500).send({
                    message: 'No fue posible crear la orden'
                })
            }

        }
        catch(e){
            console.log(e)
            res.status(500).send({
                message: 'No fue posible crear la orden',
                e
            });
            next(e);
        }
    },
    //Fin cotizaciones anteriores









    //V3 Cotizaciones 19 septiembre 2022 ++
    
    updateCotizacionEstatus: async(req, res, next) =>
    {
        try{
            const constCotizaciones = await models.Cotizaciones.findOne({
                where: {
                    cot_cotizacion_id: req.body.cot_cotizacion_id
                }
            });

            await constCotizaciones.update(
            {
              cot_cmm_estatus_id : req.body.cot_cmm_estatus_id,
              cot_usu_usuario_modificador_id: req.body.cot_usu_usuario_modificador_id,
              cot_motivo_cancelacion: req.body.cot_motivo_cancelacion,
              updatedAt: Date()
            })

            const constCotizaciones2 = await models.Cotizaciones.findOne({
                where: {
                    cot_cotizacion_id: req.body.cot_cotizacion_id
                }
            });

            res.status(200).send({
              message: 'Actualizado correctamente',
              constCotizaciones2
            });
            }catch(e){
            res.status(500).send({
              message: 'Error',
              e
            });
            next(e);
        }
    },












    V3crearCotizacionOriginal: async (req, res, next)  =>{
        try{
            var productos = null
            var productosArray

            
            //PASO COT 1
            console.log("/////////// Comienza PASO 1 ///////////")
            //Obtener productos ya sea de carrito id o del array de prospectos solo regresar id de productos en mismo formato
                if(req.body.cot_prospecto == false)
                {
                    const constCarritoDeCompra = await models.CarritoDeCompra.findOne(
                    {
                        where: {
                            cdc_sn_socio_de_negocio_id: req.body.cdc_sn_socio_de_negocio_id
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
                    productosArray = req.body.cot_productos
                }
            //Fin obtener mismo formato productos
            console.log("/////////// FIN PASO 1 ///////////")




            //PASO COT 2
            console.log("/////////// Comienza PASO 2 ///////////")
            //Obtener la informacion de los productos (Antes de separar lineas/backorder/stockinactivo/hastaagotarexistencia/precioLista)
                if(productosArray.length > 0)
                {
                    productos = productosArray

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
                }   //end if productos lenght
            //Fin obtener productos base
            console.log("/////////// FIN PASO 2 ///////////")




            //PASO COT 3
            console.log("/////////// Comienza PASO 3 ///////////")
            //Mandar obtener lineas para saber de que almacen se surtiran y obtener si es precio lista, precio hae o si
                var lineasProductos
                if(req.body.cot_prospecto == false)
                {
                    lineasProductos = await getCheckout.getCotizacionLineasProductosDividirSIyHAEtoPrecioLista(
                        req.body.cot_prospecto,
                        req.body.cdc_sn_socio_de_negocio_id,
                        req.body.tipo_envio,
                        req.body.snd_direcciones_id,
                        req.body.recoleccion_almacen_id,
                        3,
                        productos
                    );
                }
                else
                {
                    lineasProductos = await getCheckout.getCotizacionLineasProductosDividirSIyHAEtoPrecioLista(
                        req.body.cot_prospecto,
                        req.body.up_usuarios_prospectos_id,
                        req.body.tipo_envio,
                        req.body.upd_direcciones_id,
                        req.body.recoleccion_almacen_id,
                        3,
                        productos
                    );
                }
                console.log(lineasProductos)
            //Final Mandar obtener lineas para saber de que almacen se surtiran y obtener si es precio lista, precio hae o si
            console.log("/////////// FIN PASO 3 ///////////")





            //PASO COT 4
            console.log("/////////// Comienza PASO 4 ///////////")
            //Recalcular productos base en base a la informacion de las lineas (obtener productos en back etc~)
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
                }   //end if productos lenght
            //FIN Recalcular productos base en base a la informacion de las lineas (obtener productos en back etc~)
            console.log("/////////// FIN PASO 4 ///////////")

            


            //PASO COT 5
            console.log("/////////// Comienza PASO 5 ///////////")
            //Obtener promociones a partir de las lineas generadas (Aplicara Backorders tralados etc~)
                var tipoImpuesto = 16
                //Obtener informacion de impuesto de SN o Prospecto
                    if(req.body.cot_prospecto == false)
                    {
                        //Si es SN y envio a domicilio
                        if(req.body.tipo_envio == 16)
                        {
                            
                            const constSociosNegocio = await models.SociosNegocio.findOne(
                            {
                                where: {
                                    sn_socios_negocio_id: req.body.cdc_sn_socio_de_negocio_id
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
                        if(req.body.tipo_envio == 16)
                        {
                            //Informacion Socio de negocio / Direccoin facturacion para impuestos
                            const constDireccionProspecto = await models.UsuariosProspectosDirecciones.findOne(
                            {
                                where: {
                                    upd_direcciones_id: req.body.upd_direcciones_id
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

                            if(req.body.cot_prospecto == false)
                            {
                                //Obtener info SN
                                constSociosNegocio = await models.SociosNegocio.findOne(
                                {
                                    where: {
                                        sn_socios_negocio_id: req.body.cdc_sn_socio_de_negocio_id
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
                            var descuentoGrupo = await productosUtils.getSocioNegocioAndProspectoDiscountPerProductForCotizaciones(productos[i].dataValues, infoUsuarioForDiscount);

                            if(req.body.cot_prospecto == false)
                            {
                                console.log(99999888888888)
                                console.log(descuentoGrupo)
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
                    var precioBase = productos[i].dataValues.prod_precio
                    var precioTemporal = productos[i].dataValues.prod_precio
                    var totalDescuentoTemporal = 0
                    //Dejar cupon vacio para errores
                    productos[i].dataValues.cupon = []

                    console.log("HAST AQUI TODO BIEN")

                    //Si tiene promocion, descuento o cupon activo el producto calculara el precio
                    if(productos[i].dataValues.promocion.length > 0 || (productos[i].dataValues.cupon.length > 0 || productos[i].dataValues.cupon.promcup_aplica_todo_carrito == false) || productos[i].dataValues.descuentoGrupoBool == true)
                    {   
                        console.log(111111)
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


                        console.log(22222)
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

                        console.log(33333)
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

                        productos[i].dataValues.precioDespuesDePromocion = precioTemporal.toFixed(2)
                        productos[i].dataValues.cantidadDescuentoPromocion = cantidadPromocion

                        //Calculara el total de descuentos por promocion
                        totalDescuentoTemporal = totalDescuentoTemporal + cantidadPromocion
                        totalDescuentosPromociones = totalDescuentosPromociones + (cantidadPromocion * productos[i].dataValues.pcdc_producto_cantidad)






                        console.log(55555)
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

                        console.log(6666)
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
                            productos[i].dataValues.precioFinal = parseFloat((precioTemporal).toFixed(2))
                        }
                        
                        console.log(77777)
                        productos[i].dataValues.precioFinalMasImpuesto = (productos[i].dataValues.precioFinal * (1 + (tipoImpuesto / 100)))
                        productos[i].dataValues.precioFinalMasImpuesto = parseFloat(productos[i].dataValues.precioFinalMasImpuesto.toFixed(2))
                        productos[i].dataValues.totalDescuento = parseFloat(totalDescuentoTemporal)
                    }
                    //si no tiene promocion solo calculara plano
                    else
                    {
                        console.log(999999)
                        // //envio + 3%
                        // if(constCarritoDeCompra.cdc_forma_pago_codigo == "28" || constCarritoDeCompra.cdc_forma_pago_codigo == "04")
                        if(false)
                        {
                            productos[i].dataValues.precioFinal = parseFloat((precioBase * 1.03).toFixed(2))
                        }
                        else
                        {
                            productos[i].dataValues.precioFinal = parseFloat((precioBase).toFixed(2))
                        }
                        productos[i].dataValues.precioFinalMasImpuesto = (productos[i].dataValues.precioFinal * (1 + (tipoImpuesto / 100)))
                        productos[i].dataValues.precioFinalMasImpuesto = parseFloat(productos[i].dataValues.precioFinalMasImpuesto.toFixed(2))
                        productos[i].dataValues.totalDescuento = 0
                    }

                    console.log(888888)

                    // V5?
                    var tempPrecioBase = productos[i].dataValues.prod_precio
                    var tempPrecioFinal = productos[i].dataValues.precioFinal

                    var porcentajeDescuentoTemporal = 100-((tempPrecioFinal*100)/tempPrecioBase)

                    productos[i].dataValues.totalDescuentoPorcentual = parseFloat(porcentajeDescuentoTemporal.toFixed(2))














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
            //FIN Obtener promociones a partir de las lineas generadas
            console.log("/////////// FIN PASO 5 ///////////")

                




            //PASO COT 6
            console.log("/////////// Comienza PASO 6 ///////////")
            //Obtener totales de cotizacion
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
            //FIN Obtener totales de cotizacion
            console.log("/////////// FIN PASO 6 ///////////")








            //PASO COT 7
            console.log("/////////// Comienza PASO 7 ///////////")
            //Obtener costos envios
                var cotizacionCarritoEnvioPoliticas = await cotizarCarritoFunction.CotizarCarritoFunctionForCotizacionesFunction(req.body, productos, TotalFinal);
                console.log(cotizacionCarritoEnvioPoliticas)
            //FIN Obtener costos envios
            console.log("/////////// FIN PASO 7 ///////////")


         
                



            //PASO COT 8
            console.log("/////////// Comienza PASO 8 ///////////")
            //Crear fechas de envio
                for (var i = 0; i < productos.length; i++) 
                {
                    //Fecha de entrega informacion
                    var dateFinal
                    var day = new Date()

                    //Se ejecuta cuando es recoleccion y se ocupa hacer resurtimiento de almacen
                    if(productos[i].dataValues.pcf_recoleccion_resurtimiento == true)
                    {
                        console.log(1111111)
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
                        console.log(22222)
                        var nuevoDia = date_and_time.addDays(day, (productos[i].dataValues.pcf_dias_resurtimiento+1))
                        nuevoDia = date_and_time.addHours(nuevoDia, -5)

                        dateFinal = date_and_time.format(nuevoDia, "YYYY/MM/DD")
                    }
                    else if(cotizacionCarritoEnvioPoliticas.CotizacionResult.suertirUnSoloAlmacen == false && cotizacionCarritoEnvioPoliticas.CotizacionResult.politicaNombre != null)
                    {
                        console.log(999999)
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
                        console.log(333333)
                        var nuevoDia = date_and_time.addDays(day, 1)
                        nuevoDia = date_and_time.addHours(nuevoDia, -5)

                        dateFinal = date_and_time.format(nuevoDia, "YYYY/MM/DD")
                    }

                    console.log(dateFinal)
                    productos[i].dataValues.dateFinal = dateFinal
                }
            //FIN Crear fechas de envio
            console.log("/////////// FIN PASO 8 ///////////")






            //PASO COT 9
            console.log("/////////// Comienza PASO 9 ///////////")
            //Insertar Cotizacion



                //Get cart api sin cupones activos
                // var getCart = await getCheckout.getCartAPI(req.body.cdc_sn_socio_de_negocio_id);
                // order_id_catch = getCart.dataValues.cdc_numero_orden


                //FROM v2CarritoDeCompra Get cart API
                // const newOrderNumber = String(Date.now())+String(ultimoRowNum+1)



                //Obtener tiempo de caducidad cotizacion
                const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
                {
                    where: {
                        cmm_nombre: "TIEMPO_CADUCIDAD_COTIZACIONES"
                    }
                });
                var FechaVencimiento = new Date(Date.now() + constControlMaestroMultiple.cmm_valor*24*60*60*1000);


                // if(cotizacionCarritoEnvioPoliticas.CotizacionResult.suertirUnSoloAlmacen)

                var constCotizacionesResult = ''
                var constCotizacionesProductosResult = []
                if(req.body.cot_prospecto == false)
                {

                    const constCarritoDeCompraOrder = await models.CarritoDeCompra.findOne({
                        where: {
                            cdc_sn_socio_de_negocio_id : req.body.cdc_sn_socio_de_negocio_id
                        }
                    });

                    var orderID = "Q-"+constCarritoDeCompraOrder.cdc_numero_orden

                    //Crear cotizaciones
                    constCotizacionesResult = await models.Cotizaciones.create({
                        cot_numero_orden: orderID,
                        cot_sn_socios_negocio_id: req.body.cdc_sn_socio_de_negocio_id,

                        //Total sin impuestos
                        cot_total_cotizacion: TotalFinal,
                        cot_referencia: req.body.cot_referencia,
                        cot_cmm_estatus_id: statusControles.ESTATUS_COTIZACION.ACTIVO,
                        cot_motivo_cancelacion: null,
                        cot_usu_usuario_vendedor_id: req.body.cot_usu_usuario_vendedor_id,
                        cot_fecha_vencimiento: FechaVencimiento,
                        cot_cmm_tipo_envio_id: req.body.tipo_envio,
                        cot_direccion_envio_id: req.body.snd_direcciones_id,
                        cot_alm_almacen_recoleccion: req.body.recoleccion_almacen_id,

                        // Este campo posiblemente sea el tipo de pago
                        // cot_cmm_tipo_compra_id: algo

                        cot_fletera_id: cotizacionCarritoEnvioPoliticas.CotizacionResult.fleteraID,
                        cot_costo_envio: cotizacionCarritoEnvioPoliticas.CotizacionResult.totalFinal,
                        cot_promcup_promociones_cupones_id: null,

                        cot_forma_pago_codigo: null,
                        cot_cfdi: null,
                        cot_tratamiento: req.body.cot_cot_tratamiento,
                        cot_prospecto: req.body.cot_prospecto,
                        cot_up_usuarios_prospectos_id: req.body.up_usuarios_prospectos_id,

                        cot_surtir_un_almacen: cotizacionCarritoEnvioPoliticas.CotizacionResult.suertirUnSoloAlmacen,
                        cot_tipo_politica_envio: cotizacionCarritoEnvioPoliticas.CotizacionResult.politicaNombre,
                        cot_aplica_politica_envio: cotizacionCarritoEnvioPoliticas.CotizacionResult.politicaBool
                    });
                }
                else
                {
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
                    var orderID = "Q-"+String(Date.now())+String(ultimoRowNum+1)

                    //Crear cotizaciones
                    constCotizacionesResult = await models.Cotizaciones.create({
                        cot_numero_orden: orderID,
                        cot_up_usuarios_prospectos_id: req.body.up_usuarios_prospectos_id,

                        //Total sin impuestos
                        cot_total_cotizacion: TotalFinal,
                        cot_referencia: req.body.cot_referencia,
                        cot_cmm_estatus_id: statusControles.ESTATUS_COTIZACION.ACTIVO,
                        cot_motivo_cancelacion: null,
                        cot_usu_usuario_vendedor_id: req.body.cot_usu_usuario_vendedor_id,
                        cot_fecha_vencimiento: FechaVencimiento,
                        cot_cmm_tipo_envio_id: req.body.tipo_envio,
                        cot_direccion_envio_id: req.body.upd_direcciones_id,
                        cot_alm_almacen_recoleccion: req.body.recoleccion_almacen_id,

                        // Este campo posiblemente sea el tipo de pago
                        // cot_cmm_tipo_compra_id: algo

                        cot_fletera_id: cotizacionCarritoEnvioPoliticas.CotizacionResult.fleteraID,
                        cot_costo_envio: cotizacionCarritoEnvioPoliticas.CotizacionResult.totalFinal,
                        cot_promcup_promociones_cupones_id: null,

                        cot_forma_pago_codigo: null,
                        cot_cfdi: null,
                        cot_tratamiento: req.body.cot_cot_tratamiento,
                        cot_prospecto: req.body.cot_prospecto,
                        cot_up_usuarios_prospectos_id: req.body.up_usuarios_prospectos_id,
                        cot_surtir_un_almacen: cotizacionCarritoEnvioPoliticas.CotizacionResult.suertirUnSoloAlmacen,
                        cot_tipo_politica_envio: cotizacionCarritoEnvioPoliticas.CotizacionResult.politicaNombre,
                        cot_aplica_politica_envio: cotizacionCarritoEnvioPoliticas.CotizacionResult.politicaBool
                    });
                }


                

                //Si se inserto correctamente la cotizacion insertara ahora los productos
                if(constCotizacionesResult != '')
                {   
                    // validacion1 = true
                    // //Insertar cada producto en la tabla de cotizaciones productos
                    for (var i = 0; i < productos.length; i++) 
                    {
                        //var porcentajeDescuento =  (getCart.dataValues.productos[i].dataValues.precioFinal * 100) /  getCart.dataValues.productos[i].dataValues.prod_precio

                        // //Si tiene stock significa que esta disponible
                        // var tieneStockBool = false
                        // if(getCart.dataValues.productos[i].dataValues.prod_total_stock > 0)
                        // {
                        //     tieneStockBool = true
                        // }

                        //Crear cotizaciones
                        var porcentajeDescuentoVendedor = req.body.cotp_porcentaje_descuento_vendedor ? req.body.cotp_porcentaje_descuento_vendedor : 0

                        const constCotizacionesProductosInserted = await models.CotizacionesProductos.create({
                            cotp_prod_producto_id: productos[i].dataValues.prod_producto_id,
                            cotp_cotizacion_id: constCotizacionesResult.dataValues.cot_cotizacion_id,
                            cotp_producto_cantidad: productos[i].dataValues.cantidad,
                            cotp_precio_base_lista: productos[i].dataValues.prod_precio,
                            cotp_precio_menos_promociones: productos[i].dataValues.precioFinal,
                            cotp_porcentaje_descuento_vendedor: porcentajeDescuentoVendedor,
                            cotp_precio_descuento_vendedor: (porcentajeDescuentoVendedor*productos[i].dataValues.precioFinal)/100,
                            cotp_usu_descuento_cotizacion: null,
                            cotp_back_order: productos[i].dataValues.pcf_is_backorder,
                            cotp_tipo_precio_lista: productos[i].dataValues.pcf_tipo_precio_lista,
                            cotp_dias_resurtimiento: productos[i].dataValues.pcf_dias_resurtimiento,
                            cotp_almacen_linea: productos[i].dataValues.pcf_almacen_linea,
                            cotp_recoleccion_resurtimiento: productos[i].dataValues.pcf_recoleccion_resurtimiento,
                            cotp_fecha_entrega: productos[i].dataValues.dateFinal,
                            cotp_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                            cotp_descuento_porcentual: productos[i].dataValues.totalDescuentoPorcentual,
                        });


                        constCotizacionesProductosResult.push(constCotizacionesProductosInserted)


                    }


                    // validacion2 = true

                    // //Eliminar carrito pero cuando es ENV que no lo borre para no volver a generarlo de 0
                    // if(validacion1 == true && validacion2 == true)
                    // {

                    //     //borrar despues el if y dejar solo codigo, Cuando se hace desde ENV no borra carrito
                    //     if(process.env.PORT != 5000)
                    //     {
                    //         //Borrar carrito actual
                    //         await models.ProductoCarritoDeCompra.destroy(
                    //         {
                    //             where: {
                    //                 pcdc_carrito_de_compra_id: getCart.dataValues.cdc_carrito_de_compra_id
                    //             }
                    //         });

                    //         await models.CarritoDeCompra.destroy(
                    //         {
                    //             where: {
                    //                 cdc_carrito_de_compra_id: getCart.dataValues.cdc_carrito_de_compra_id
                    //             }
                    //         });
                            
                    //     }
                    //     else
                    //     {
                    //         //Actualizar carrito tal vez?
                    //         // var newNumeroOrden =  parseInt(constCarritoDeCompra.cdc_numero_orden)+1
                    //         // newNumeroOrden = "0000000" + newNumeroOrden

                             
                    //         // const bodyUpdate = {
                    //         //     "cdc_numero_orden": newNumeroOrden,
                    //         //     updatedAt: Date()
                    //         // };
                            
                    //         // await constCarritoDeCompra.update(bodyUpdate);

                    //     }

                    // }
                }
            //FIN Insertar Cotizacion
            console.log("/////////// FIN PASO 9 ///////////")































            res.status(200).send({
                message: 'Creado con exito',
                precioFinalTotal,
                TotalImpuesto, 
                TotalFinal,
                cotizacionCarritoEnvioPoliticas,
                constCotizacionesResult,
                constCotizacionesProductosResult,
                productos
            })




        }catch(e){
            res.status(200).send({
                message: 'Error, al generar la cotización',
                e
            });
            next(e);
        }
    },
    //Modulado
    
    V3UpdateLineasCantidadesCotizacion: async (req, res, next)  =>{
        try{
            var body
            var productos

            //Obtener cotizacion
            const constCotizaciones = await models.Cotizaciones.findOne(
            {
                where: {
                    cot_cotizacion_id: req.body.cot_cotizacion_id
                }
            });

            //Si es SN el que cotizo obtener su informacion apartir de la cotizacion
            if(constCotizaciones.cot_prospecto == false)
            {
                body = {
                    "cdc_sn_socio_de_negocio_id": constCotizaciones.cot_sn_socios_negocio_id,
                    "up_usuarios_prospectos_id": null,
                    "cot_prospecto": false,
                    
                    "snd_direcciones_id": constCotizaciones.cot_direccion_envio_id,
                    "upd_direcciones_id": null,
                    "recoleccion_almacen_id": constCotizaciones.cot_alm_almacen_recoleccion,

                    "tipo_envio": constCotizaciones.cot_cmm_tipo_envio_id,

                    "cot_referencia": constCotizaciones.cot_referencia,
                    "cot_usu_usuario_vendedor_id":  constCotizaciones.cot_usu_usuario_vendedor_id,
                    //Esto tambien posiblemente sea por linea
                    "cotp_usu_descuento_cotizacion": 0,
                    "cot_cot_tratamiento": constCotizaciones.cot_tratamiento,
                    
                    "cot_productos": req.body.cot_productos,

                    //Esto es por linea
                    "cotp_porcentaje_descuento_vendedor": 0
                }
            }
            else
            {
                body = {
                    "cdc_sn_socio_de_negocio_id": null,
                    "up_usuarios_prospectos_id": constCotizaciones.cot_up_usuarios_prospectos_id,
                    "cot_prospecto": true,
                    
                    "snd_direcciones_id": null,
                    "upd_direcciones_id": constCotizaciones.cot_direccion_envio_id,
                    "recoleccion_almacen_id": constCotizaciones.cot_alm_almacen_recoleccion,

                    "tipo_envio": constCotizaciones.cot_cmm_tipo_envio_id,

                    "cot_referencia": constCotizaciones.cot_referencia,
                    "cot_usu_usuario_vendedor_id":  constCotizaciones.cot_usu_usuario_vendedor_id,
                    //Esto tambien posiblemente sea por linea
                    "cotp_usu_descuento_cotizacion": 0,
                    "cot_cot_tratamiento": constCotizaciones.cot_tratamiento,
                    
                    "cot_productos": req.body.cot_productos,

                    //Esto es por linea
                    "cotp_porcentaje_descuento_vendedor": 0
                }
            }

            //PASO COT 1
            console.log("/////////// Comienza PASO 1 ///////////")
            //Obtener productos ya sea de carrito id o del array de prospectos solo regresar id de productos en mismo formato
                // productos = await cotizacionesUtils.cotizacionesObtenerProductos(body);
                productos = req.body.cot_productos
            //Fin obtener mismo formato productos
            console.log("/////////// FIN PASO 1 ///////////")


            //PASO COT 2
            console.log("/////////// Comienza PASO 2 ///////////")
            //Obtener la informacion de los productos (Antes de separar lineas/backorder/stockinactivo/hastaagotarexistencia/precioLista)
                productos = await cotizacionesUtils.cotizacionesObtenerInfoBaseProductos(body, productos);
            //Fin obtener productos base
            console.log("/////////// FIN PASO 2 ///////////")


            //PASO COT 3
            console.log("/////////// Comienza PASO 3 ///////////")
            //Mandar obtener lineas para saber de que almacen se surtiran y obtener si es precio lista, precio hae o si
                var lineasProductos = await cotizacionesUtils.cotizacionesObtenerLineasProductos(body, productos);
                // console.log(lineasProductos)
            //Final Mandar obtener lineas para saber de que almacen se surtiran y obtener si es precio lista, precio hae o si
            console.log("/////////// FIN PASO 3 ///////////")


            //PASO COT 4
            console.log("/////////// Comienza PASO 4 ///////////")
            //Recalcular productos base en base a la informacion de las lineas (obtener productos en back etc~)
                productos = await cotizacionesUtils.cotizacionesObtenerInformacionDeLineas(body, productos, lineasProductos);
            //FIN Recalcular productos base en base a la informacion de las lineas (obtener productos en back etc~)
            console.log("/////////// FIN PASO 4 ///////////")


            //PASO COT 5
            console.log("/////////// Comienza PASO 5 ///////////")
            //Obtener promociones a partir de las lineas generadas (Aplicara Backorders tralados etc~)
                productos = await cotizacionesUtils.cotizacionesObtenerPromocionesProductos(body, productos, lineasProductos);
            //FIN Obtener promociones a partir de las lineas generadas
            console.log("/////////// FIN PASO 5 ///////////")


            //PASO COT 6
            console.log("/////////// Comienza PASO 6 ///////////")
            //Obtener totales de cotizacion
                var TotalFinal = await cotizacionesUtils.cotizacionesObtenerTotalesProductos(body, productos, lineasProductos);
            //FIN Obtener totales de cotizacion
            console.log("/////////// FIN PASO 6 ///////////")


            //PASO COT 7
            console.log("/////////// Comienza PASO 7 ///////////")
            //Obtener costos envios
                var cotizacionCarritoEnvioPoliticas = await cotizarCarritoFunction.CotizarCarritoFunctionForCotizacionesFunction(body, productos, TotalFinal);
                console.log(cotizacionCarritoEnvioPoliticas)
            //FIN Obtener costos envios
            console.log("/////////// FIN PASO 7 ///////////")


            //PASO COT 8
            console.log("/////////// Comienza PASO 8 ///////////")
            //Crear fechas de envio
                productos = await cotizacionesUtils.cotizacionesObtenerFechasEnvio(body, productos, TotalFinal, cotizacionCarritoEnvioPoliticas);
            //FIN Crear fechas de envio
            console.log("/////////// FIN PASO 8 ///////////")



            //PASO COT 9 Actualizar cotizacion y cotizacion productos
                console.log("/////////// Comienza PASO 9 ///////////")
                const bodyUpdate = {
                    "cot_total_cotizacion": TotalFinal,
                    "cot_costo_envio": cotizacionCarritoEnvioPoliticas.CotizacionResult.totalFinal,
                    "cot_surtir_un_almacen": cotizacionCarritoEnvioPoliticas.CotizacionResult.suertirUnSoloAlmacen,
                    "cot_tipo_politica_envio": cotizacionCarritoEnvioPoliticas.CotizacionResult.politicaNombre,
                    "cot_aplica_politica_envio": cotizacionCarritoEnvioPoliticas.CotizacionResult.politicaNombre,
                    updatedAt: Date()
                }

                console.log(bodyUpdate)
                
                var ActualizadoExito = await constCotizaciones.update(bodyUpdate);


                if(ActualizadoExito)
                {
                    await models.CotizacionesProductos.destroy({
                        where: {
                            cotp_cotizacion_id: req.body.cot_cotizacion_id
                        }
                    });

                    console.log(productos.length)
                    var constCotizacionesProductosResult = []
                    for (var i = 0; i < productos.length; i++) 
                    {
                        //var porcentajeDescuento =  (getCart.dataValues.productos[i].dataValues.precioFinal * 100) /  getCart.dataValues.productos[i].dataValues.prod_precio

                        // //Si tiene stock significa que esta disponible
                        // var tieneStockBool = false
                        // if(getCart.dataValues.productos[i].dataValues.prod_total_stock > 0)
                        // {
                        //     tieneStockBool = true
                        // }

                        //Crear cotizaciones
                        var porcentajeDescuentoVendedor = req.body.cotp_porcentaje_descuento_vendedor ? req.body.cotp_porcentaje_descuento_vendedor : 0

                        const constCotizacionesProductosInserted = await models.CotizacionesProductos.create({
                            cotp_prod_producto_id: productos[i].dataValues.prod_producto_id,
                            cotp_cotizacion_id: constCotizaciones.dataValues.cot_cotizacion_id,
                            cotp_producto_cantidad: productos[i].dataValues.cantidad,
                            cotp_precio_base_lista: productos[i].dataValues.prod_precio,
                            cotp_precio_menos_promociones: productos[i].dataValues.precioFinal,
                            cotp_porcentaje_descuento_vendedor: porcentajeDescuentoVendedor,
                            cotp_precio_descuento_vendedor: (porcentajeDescuentoVendedor*productos[i].dataValues.precioFinal)/100,
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




            console.log("/////////// FIN PASO 9 ///////////")

















            



            res.status(200).send({
                message: 'Obtener cambios en cotizacion',
                TotalFinal,
                cotizacionCarritoEnvioPoliticas,
                constCotizaciones,
                productos
            })
            



        }catch(e){
            res.status(200).send({
                message: 'Error, al generar la cotización',
                e
            });
            next(e);
        }
    },

    //
        //Obtiene cosas posiblemente usarlo bajo otro esquema
        // V3UpdateLineasDescuentosVendedoresCotizacion: async (req, res, next)  =>{
        //     try{
        //         var body
        //         var productos

        //         //Obtener cotizacion
        //         const constCotizaciones = await models.Cotizaciones.findOne(
        //         {
        //             where: {
        //                 cot_cotizacion_id: req.body.cot_cotizacion_id
        //             }
        //         });

        //         //Si es SN el que cotizo obtener su informacion apartir de la cotizacion
        //         if(constCotizaciones.cot_prospecto == false)
        //         {
        //             body = {
        //                 "cdc_sn_socio_de_negocio_id": constCotizaciones.cot_sn_socios_negocio_id,
        //                 "up_usuarios_prospectos_id": null,
        //                 "cot_prospecto": false,
                        
        //                 "snd_direcciones_id": constCotizaciones.cot_direccion_envio_id,
        //                 "upd_direcciones_id": null,
        //                 "recoleccion_almacen_id": constCotizaciones.cot_alm_almacen_recoleccion,

        //                 "tipo_envio": constCotizaciones.cot_cmm_tipo_envio_id,

        //                 "cot_referencia": constCotizaciones.cot_referencia,
        //                 "cot_usu_usuario_vendedor_id":  constCotizaciones.cot_usu_usuario_vendedor_id,
        //                 //Esto tambien posiblemente sea por linea
        //                 "cotp_usu_descuento_cotizacion": 0,
        //                 "cot_cot_tratamiento": constCotizaciones.cot_tratamiento,
                        
        //                 "cot_productos": req.body.cot_productos,

        //                 //Esto es por linea
        //                 "cotp_porcentaje_descuento_vendedor": 0
        //             }
        //         }
        //         else
        //         {
        //             body = {
        //                 "cdc_sn_socio_de_negocio_id": null,
        //                 "up_usuarios_prospectos_id": constCotizaciones.cot_up_usuarios_prospectos_id,
        //                 "cot_prospecto": true,
                        
        //                 "snd_direcciones_id": null,
        //                 "upd_direcciones_id": constCotizaciones.cot_direccion_envio_id,
        //                 "recoleccion_almacen_id": constCotizaciones.cot_alm_almacen_recoleccion,

        //                 "tipo_envio": constCotizaciones.cot_cmm_tipo_envio_id,

        //                 "cot_referencia": constCotizaciones.cot_referencia,
        //                 "cot_usu_usuario_vendedor_id":  constCotizaciones.cot_usu_usuario_vendedor_id,
        //                 //Esto tambien posiblemente sea por linea
        //                 "cotp_usu_descuento_cotizacion": 0,
        //                 "cot_cot_tratamiento": constCotizaciones.cot_tratamiento,
                        
        //                 "cot_productos": req.body.cot_productos,

        //                 //Esto es por linea
        //                 "cotp_porcentaje_descuento_vendedor": 0
        //             }
        //         }

        //         //PASO COT 1
        //         console.log("/////////// Comienza PASO 1 ///////////")
        //         //Obtener productos ya sea de carrito id o del array de prospectos solo regresar id de productos en mismo formato
        //             // productos = await cotizacionesUtils.cotizacionesObtenerProductos(body);
        //             productos = req.body.cot_productos
        //         //Fin obtener mismo formato productos
        //         console.log("/////////// FIN PASO 1 ///////////")


        //         //PASO COT 2
        //         console.log("/////////// Comienza PASO 2 ///////////")
        //         //Obtener la informacion de los productos (Antes de separar lineas/backorder/stockinactivo/hastaagotarexistencia/precioLista)
        //             productos = await cotizacionesUtils.cotizacionesObtenerInfoBaseProductos(body, productos);
        //         //Fin obtener productos base
        //         console.log("/////////// FIN PASO 2 ///////////")


        //         //PASO COT 3
        //         console.log("/////////// Comienza PASO 3 ///////////")
        //         //Mandar obtener lineas para saber de que almacen se surtiran y obtener si es precio lista, precio hae o si
        //             var lineasProductos = await cotizacionesUtils.cotizacionesObtenerLineasProductos(body, productos);
        //             // console.log(lineasProductos)
        //         //Final Mandar obtener lineas para saber de que almacen se surtiran y obtener si es precio lista, precio hae o si
        //         console.log("/////////// FIN PASO 3 ///////////")


        //         //PASO COT 4
        //         console.log("/////////// Comienza PASO 4 ///////////")
        //         //Recalcular productos base en base a la informacion de las lineas (obtener productos en back etc~)
        //             productos = await cotizacionesUtils.cotizacionesObtenerInformacionDeLineas(body, productos, lineasProductos);
        //         //FIN Recalcular productos base en base a la informacion de las lineas (obtener productos en back etc~)
        //         console.log("/////////// FIN PASO 4 ///////////")


        //         //PASO COT 5
        //         console.log("/////////// Comienza PASO 5 ///////////")
        //         //Obtener promociones a partir de las lineas generadas (Aplicara Backorders tralados etc~)
        //             productos = await cotizacionesUtils.cotizacionesObtenerPromocionesProductos(body, productos, lineasProductos);
        //         //FIN Obtener promociones a partir de las lineas generadas
        //         console.log("/////////// FIN PASO 5 ///////////")


        //         //PASO COT 6
        //         console.log("/////////// Comienza PASO 6 ///////////")
        //         //Obtener totales de cotizacion
        //             var TotalFinal = await cotizacionesUtils.cotizacionesObtenerTotalesProductos(body, productos, lineasProductos);
        //         //FIN Obtener totales de cotizacion
        //         console.log("/////////// FIN PASO 6 ///////////")


        //         //PASO COT 7
        //         console.log("/////////// Comienza PASO 7 ///////////")
        //         //Obtener costos envios
        //             var cotizacionCarritoEnvioPoliticas = await cotizarCarritoFunction.CotizarCarritoFunctionForCotizacionesFunction(body, productos, TotalFinal);
        //             console.log(cotizacionCarritoEnvioPoliticas)
        //         //FIN Obtener costos envios
        //         console.log("/////////// FIN PASO 7 ///////////")


        //         //PASO COT 8
        //         console.log("/////////// Comienza PASO 8 ///////////")
        //         //Crear fechas de envio
        //             productos = await cotizacionesUtils.cotizacionesObtenerFechasEnvio(body, productos, TotalFinal, cotizacionCarritoEnvioPoliticas);
        //         //FIN Crear fechas de envio
        //         console.log("/////////// FIN PASO 8 ///////////")



        //         //PASO COT 9 Actualizar cotizacion y cotizacion productos
        //             console.log("/////////// Comienza PASO 9 ///////////")
        //             const bodyUpdate = {
        //                 "cot_total_cotizacion": TotalFinal,
        //                 "cot_costo_envio": cotizacionCarritoEnvioPoliticas.CotizacionResult.totalFinal,
        //                 "cot_surtir_un_almacen": cotizacionCarritoEnvioPoliticas.CotizacionResult.suertirUnSoloAlmacen,
        //                 "cot_tipo_politica_envio": cotizacionCarritoEnvioPoliticas.CotizacionResult.politicaNombre,
        //                 "cot_aplica_politica_envio": cotizacionCarritoEnvioPoliticas.CotizacionResult.politicaNombre,
        //                 updatedAt: Date()
        //             }

        //             console.log(bodyUpdate)
                    
        //             var ActualizadoExito = await constCotizaciones.update(bodyUpdate);


        //             if(ActualizadoExito)
        //             {
        //                 await models.CotizacionesProductos.destroy({
        //                     where: {
        //                         cotp_cotizacion_id: req.body.cot_cotizacion_id
        //                     }
        //                 });

        //                 console.log(productos.length)
        //                 var constCotizacionesProductosResult = []
        //                 for (var i = 0; i < productos.length; i++) 
        //                 {
        //                     //var porcentajeDescuento =  (getCart.dataValues.productos[i].dataValues.precioFinal * 100) /  getCart.dataValues.productos[i].dataValues.prod_precio

        //                     // //Si tiene stock significa que esta disponible
        //                     // var tieneStockBool = false
        //                     // if(getCart.dataValues.productos[i].dataValues.prod_total_stock > 0)
        //                     // {
        //                     //     tieneStockBool = true
        //                     // }

        //                     //Crear cotizaciones
        //                     var porcentajeDescuentoVendedor = req.body.cotp_porcentaje_descuento_vendedor ? req.body.cotp_porcentaje_descuento_vendedor : 0

        //                     const constCotizacionesProductosInserted = await models.CotizacionesProductos.create({
        //                         cotp_prod_producto_id: productos[i].dataValues.prod_producto_id,
        //                         cotp_cotizacion_id: constCotizaciones.dataValues.cot_cotizacion_id,
        //                         cotp_producto_cantidad: productos[i].dataValues.cantidad,
        //                         cotp_precio_base_lista: productos[i].dataValues.prod_precio,
        //                         cotp_precio_menos_promociones: productos[i].dataValues.precioFinal,
        //                         cotp_porcentaje_descuento_vendedor: porcentajeDescuentoVendedor,
        //                         cotp_precio_descuento_vendedor: (porcentajeDescuentoVendedor*productos[i].dataValues.precioFinal)/100,
        //                         cotp_usu_descuento_cotizacion: null,
        //                         cotp_back_order: productos[i].dataValues.pcf_is_backorder,
        //                         cotp_tipo_precio_lista: productos[i].dataValues.pcf_tipo_precio_lista,
        //                         cotp_dias_resurtimiento: productos[i].dataValues.pcf_dias_resurtimiento,
        //                         cotp_almacen_linea: productos[i].dataValues.pcf_almacen_linea,
        //                         cotp_recoleccion_resurtimiento: productos[i].dataValues.pcf_recoleccion_resurtimiento,
        //                         cotp_fecha_entrega: productos[i].dataValues.dateFinal,
        //                         cotp_backorder_precio_lista: productos[i].dataValues.pcf_backorder_precio_lista,
        //                         cotp_descuento_porcentual: productos[i].dataValues.totalDescuentoPorcentual,
        //                     });
        //                 }
        //             }




        //         console.log("/////////// FIN PASO 9 ///////////")

















                



        //         res.status(200).send({
        //             message: 'Obtener cambios en cotizacion',
        //             TotalFinal,
        //             cotizacionCarritoEnvioPoliticas,
        //             constCotizaciones,
        //             productos
        //         })
                



        //     }catch(e){
        //         res.status(200).send({
        //             message: 'Error, al generar la cotización',
        //             e
        //         });
        //         next(e);
        //     }
        // },
    //

    //Solo actualizar lineas con id y su descuento de vendedor promocion
    V3UpdateLineasDescuentosVendedoresCotizacion: async (req, res, next)  =>{
        try{
            var body
            var productos = req.body.cot_productos

            for (var i = 0; i < productos.length; i++) 
            {
                const constCotizacionesProductos = await models.CotizacionesProductos.findOne(
                {
                    where: {
                        cotp_cotizaciones_productos_id: productos[i].cotp_cotizaciones_productos_id
                    }
                });

                if(constCotizacionesProductos)
                {
                    var precioFinalPromocion = constCotizacionesProductos.cotp_precio_menos_promociones
                    var descuentoTotalDeVendedorCantidad = (precioFinalPromocion*productos[i].cotp_porcentaje_descuento_vendedor)/100
                    var PrecioFinalVendedor = constCotizacionesProductos.cotp_precio_menos_promociones - descuentoTotalDeVendedorCantidad

                    //Actualizar el tipo de cambio valor
                    await constCotizacionesProductos.update({
                        cotp_porcentaje_descuento_vendedor: productos[i].cotp_porcentaje_descuento_vendedor,
                        cotp_precio_descuento_vendedor: PrecioFinalVendedor,
                        updatedAt: Date()
                    });
                }

            }
            





            // const bodyUpdate = {
            //     "cot_total_cotizacion": TotalFinal,
            //     "cot_costo_envio": cotizacionCarritoEnvioPoliticas.CotizacionResult.totalFinal,
            //     "cot_surtir_un_almacen": cotizacionCarritoEnvioPoliticas.CotizacionResult.suertirUnSoloAlmacen,
            //     "cot_tipo_politica_envio": cotizacionCarritoEnvioPoliticas.CotizacionResult.politicaNombre,
            //     "cot_aplica_politica_envio": cotizacionCarritoEnvioPoliticas.CotizacionResult.politicaNombre,
            //     updatedAt: Date()
            // }

            // console.log(bodyUpdate)
            
            // var ActualizadoExito = await constCotizaciones.update(bodyUpdate);


            // if(ActualizadoExito)
            // {
            //     var constCotizacionesProductosResult = []
            //     for (var i = 0; i < productos.length; i++) 
            //     {

            //         //Crear cotizaciones
            //         var porcentajeDescuentoVendedor = req.body.cotp_porcentaje_descuento_vendedor ? req.body.cotp_porcentaje_descuento_vendedor : 0

            //         const constCotizacionesProductosInserted = await models.CotizacionesProductos.create({
            //             cotp_prod_producto_id: productos[i].dataValues.prod_producto_id,
            //             cotp_cotizacion_id: constCotizaciones.dataValues.cot_cotizacion_id,
            //             cotp_producto_cantidad: productos[i].dataValues.cantidad,
            //             cotp_precio_base_lista: productos[i].dataValues.prod_precio,
            //             cotp_precio_menos_promociones: productos[i].dataValues.precioFinal,
            //             cotp_porcentaje_descuento_vendedor: porcentajeDescuentoVendedor,
            //             cotp_precio_descuento_vendedor: (porcentajeDescuentoVendedor*productos[i].dataValues.precioFinal)/100,
            //             cotp_usu_descuento_cotizacion: null,
            //             cotp_back_order: productos[i].dataValues.pcf_is_backorder,
            //             cotp_tipo_precio_lista: productos[i].dataValues.pcf_tipo_precio_lista,
            //             cotp_dias_resurtimiento: productos[i].dataValues.pcf_dias_resurtimiento,
            //             cotp_almacen_linea: productos[i].dataValues.pcf_almacen_linea,
            //             cotp_recoleccion_resurtimiento: productos[i].dataValues.pcf_recoleccion_resurtimiento,
            //             cotp_fecha_entrega: productos[i].dataValues.dateFinal,
            //             cotp_backorder_precio_lista: productos[i].dataValues.pcf_backorder_precio_lista,
            //             cotp_descuento_porcentual: productos[i].dataValues.totalDescuentoPorcentual,
            //         });
            //     }
            // }





















            



            res.status(200).send({
                message: 'Actualizada con exito'
            })


        }catch(e){
            res.status(200).send({
                message: 'Error, al generar la cotización',
                e
            });
            next(e);
        }
    },










    //Modulado
    V3GetCotizacionCambiosPrecios: async (req, res, next)  =>{
        try{
            var body
            var productos

            //Obtener cotizacion
            const constCotizaciones = await models.Cotizaciones.findOne(
            {
                where: {
                    cot_cotizacion_id: req.body.cot_cotizacion_id
                }
            });

            //Obtener productos de cotizacion
            const constCotizacionesProductos = await models.CotizacionesProductos.findAll(
            {
                where: {
                    cotp_cotizacion_id: req.body.cot_cotizacion_id
                }
            });

            //Si es SN el que cotizo obtener su informacion apartir de la cotizacion
            if(constCotizaciones.cot_prospecto == false)
            {
                body = {
                    "cdc_sn_socio_de_negocio_id": constCotizaciones.cot_sn_socios_negocio_id,
                    "up_usuarios_prospectos_id": null,
                    "cot_prospecto": false,
                    
                    "snd_direcciones_id": constCotizaciones.cot_direccion_envio_id,
                    "upd_direcciones_id": null,
                    "recoleccion_almacen_id": constCotizaciones.cot_alm_almacen_recoleccion,

                    "tipo_envio": constCotizaciones.cot_cmm_tipo_envio_id,

                    "cot_referencia": constCotizaciones.cot_referencia,
                    "cot_usu_usuario_vendedor_id":  constCotizaciones.cot_usu_usuario_vendedor_id,
                    //Esto tambien posiblemente sea por linea
                    "cotp_usu_descuento_cotizacion": 0,
                    "cot_cot_tratamiento": constCotizaciones.cot_tratamiento,
                    
                    "cot_productos": null,

                    //Esto es por linea
                    "cotp_porcentaje_descuento_vendedor": 0
                }
            }
            else
            {
                body = {
                    "cdc_sn_socio_de_negocio_id": null,
                    "up_usuarios_prospectos_id": constCotizaciones.cot_up_usuarios_prospectos_id,
                    "cot_prospecto": true,
                    
                    "snd_direcciones_id": null,
                    "upd_direcciones_id": constCotizaciones.cot_direccion_envio_id,
                    "recoleccion_almacen_id": constCotizaciones.cot_alm_almacen_recoleccion,

                    "tipo_envio": constCotizaciones.cot_cmm_tipo_envio_id,

                    "cot_referencia": constCotizaciones.cot_referencia,
                    "cot_usu_usuario_vendedor_id":  constCotizaciones.cot_usu_usuario_vendedor_id,
                    //Esto tambien posiblemente sea por linea
                    "cotp_usu_descuento_cotizacion": 0,
                    "cot_cot_tratamiento": constCotizaciones.cot_tratamiento,
                    
                    "cot_productos": null,

                    //Esto es por linea
                    "cotp_porcentaje_descuento_vendedor": 0
                }
            }

            // var productos
            // PASO 1 - Validar cambios en precios (UPDATE) cotizaciones (Obtener productos desde la cotizacion y no del carrito o arreglo que se pide)
            console.log("/////////// Comienza PASO 1 ///////////")
            //Obtener productos de cotizaciones tabla y cotizaciones productos tabla
                productos = await cotizacionesUtils.cotizacionesObtenerProductosCotizacionesCambios(body, req.body.cot_cotizacion_id);
            //Fin obtener mismo formato productos
            console.log("/////////// FIN PASO 1 ///////////")


            //PASO COT 2
            console.log("/////////// Comienza PASO 2 ///////////")
            //Obtener la informacion de los productos (Antes de separar lineas/backorder/stockinactivo/hastaagotarexistencia/precioLista)
                productos = await cotizacionesUtils.cotizacionesObtenerInfoBaseProductos(body, productos);
            //Fin obtener productos base
            console.log("/////////// FIN PASO 2 ///////////")


            //PASO COT 3
            console.log("/////////// Comienza PASO 3 ///////////")
            //Mandar obtener lineas para saber de que almacen se surtiran y obtener si es precio lista, precio hae o si
                var lineasProductos = await cotizacionesUtils.cotizacionesObtenerLineasProductos(body, productos);
                // console.log(lineasProductos)
            //Final Mandar obtener lineas para saber de que almacen se surtiran y obtener si es precio lista, precio hae o si
            console.log("/////////// FIN PASO 3 ///////////")


            //PASO COT 4
            console.log("/////////// Comienza PASO 4 ///////////")
            //Recalcular productos base en base a la informacion de las lineas (obtener productos en back etc~)
                productos = await cotizacionesUtils.cotizacionesObtenerInformacionDeLineas(body, productos, lineasProductos);
            //FIN Recalcular productos base en base a la informacion de las lineas (obtener productos en back etc~)
            console.log("/////////// FIN PASO 4 ///////////")


            //PASO COT 5
            console.log("/////////// Comienza PASO 5 ///////////")
            //Obtener promociones a partir de las lineas generadas (Aplicara Backorders tralados etc~)
                productos = await cotizacionesUtils.cotizacionesObtenerPromocionesProductos(body, productos, lineasProductos);
            //FIN Obtener promociones a partir de las lineas generadas
            console.log("/////////// FIN PASO 5 ///////////")


            //PASO COT 6
            console.log("/////////// Comienza PASO 6 ///////////")
            //Obtener totales de cotizacion
                var TotalFinal = await cotizacionesUtils.cotizacionesObtenerTotalesProductos(body, productos, lineasProductos);
            //FIN Obtener totales de cotizacion
            console.log("/////////// FIN PASO 6 ///////////")


            //PASO COT 7
            console.log("/////////// Comienza PASO 7 ///////////")
            //Obtener costos envios
                var cotizacionCarritoEnvioPoliticas = await cotizarCarritoFunction.CotizarCarritoFunctionForCotizacionesFunction(body, productos, TotalFinal);
                console.log(cotizacionCarritoEnvioPoliticas)
            //FIN Obtener costos envios
            console.log("/////////// FIN PASO 7 ///////////")


            //PASO COT 8
            console.log("/////////// Comienza PASO 8 ///////////")
            //Crear fechas de envio
                productos = await cotizacionesUtils.cotizacionesObtenerFechasEnvio(body, productos, TotalFinal, cotizacionCarritoEnvioPoliticas);
            //FIN Crear fechas de envio
            console.log("/////////// FIN PASO 8 ///////////")


















            //Empezar a comparar producto por producto para ver si existen por varias variables
            //validacion general con que una condicion no se cumpla se reflejara que una linea tiene cambios
            var CotizacionTieneCambios = false
            console.log(constCotizacionesProductos.length)
            console.log(productos.length)
            for (var i = 0; i < constCotizacionesProductos.length; i++) 
            {
                var LineaExiste = false
                var PrecioIgual = false
                var CantidadIgual = false


                var validarQueExistaUnaVez = 0

                //Buscar en el arreglo de productos "nuevos" si existe la regla cotizada vs posiblemente un cambio de precios/cantidades/lineas
                for (var j = 0; j < productos.length; j++) 
                {
                    // console.log(987987987897)
                    // // console.log(productos)
                    // console.log(constCotizacionesProductos[i].dataValues.cotp_prod_producto_id)
                    // console.log(productos[j].prod_producto_id)
                    // console.log(constCotizacionesProductos[i].dataValues.cotp_tipo_precio_lista)
                    // console.log(productos[j].prod_tipo_precio_base)
                    // console.log(constCotizacionesProductos[i].dataValues.cotp_almacen_linea)
                    // console.log(productos[j].dataValues.pcf_almacen_linea)
                    // console.log(constCotizacionesProductos[i].dataValues.cotp_backorder_precio_lista)
                    // console.log(productos[j].dataValues.pcf_backorder_precio_lista)
                    // console.log(654654654654)


                    if(constCotizacionesProductos[i].dataValues.cotp_prod_producto_id == productos[j].prod_producto_id 
                        && constCotizacionesProductos[i].dataValues.cotp_tipo_precio_lista == productos[j].prod_tipo_precio_base
                        && constCotizacionesProductos[i].dataValues.cotp_almacen_linea == productos[j].dataValues.pcf_almacen_linea
                        && constCotizacionesProductos[i].dataValues.cotp_backorder_precio_lista == productos[j].dataValues.pcf_backorder_precio_lista)
                    {
                        // console.log(11111111)
                        validarQueExistaUnaVez = validarQueExistaUnaVez+1
                        LineaExiste = true

                        //Validar ahora que la cantidad sea la misma, si no es igual significa que tiene cambios la cot
                        if(constCotizacionesProductos[i].dataValues.cotp_producto_cantidad == productos[j].dataValues.cantidad)
                        {
                            CantidadIgual = true
                        }
                        else
                        {
                            console.log("ENTRO AL 1")
                            CotizacionTieneCambios = true
                        }

                        //Validar ahora que el precio sea el mismo, si no es igual significa que tiene cambios la cot
                        if(constCotizacionesProductos[i].dataValues.cotp_precio_menos_promociones == productos[j].dataValues.precioFinal)
                        {
                            PrecioIgual = true
                        }
                        else
                        {
                            console.log("ENTRO AL 2")
                            CotizacionTieneCambios = true
                        }
                    }

                    constCotizacionesProductos[i].dataValues.LineaExiste = LineaExiste
                    constCotizacionesProductos[i].dataValues.PrecioIgual = PrecioIgual
                    constCotizacionesProductos[i].dataValues.CantidadIgual = CantidadIgual
                }
                
                //Si la linea no existe ninguna vez significa que hay cambios en el carrito Si es 0 es que ninguna linea coincide
                if(validarQueExistaUnaVez == 0)
                {
                    console.log("ENTRO AL 0 no existe")
                    CotizacionTieneCambios = true
                }
            }


























            



            res.status(200).send({
                message: 'Obtener cambios en cotizacion',
                CotizacionTieneCambios,
                constCotizacionesProductos,
                productos
            })
            



        }catch(e){
            res.status(200).send({
                message: 'Error, al generar la cotización',
                e
            });
            next(e);
        }
    },
    V3GetCotizacionCambiosCantidadesProductos: async (req, res, next)  =>{
        try{
            var body
            var productos

            //Obtener cotizacion
            const constCotizaciones = await models.Cotizaciones.findOne(
            {
                where: {
                    cot_cotizacion_id: req.body.cot_cotizacion_id
                }
            });

            //Si es SN el que cotizo obtener su informacion apartir de la cotizacion
            if(constCotizaciones.cot_prospecto == false)
            {
                body = {
                    "cdc_sn_socio_de_negocio_id": constCotizaciones.cot_sn_socios_negocio_id,
                    "up_usuarios_prospectos_id": null,
                    "cot_prospecto": false,
                    
                    "snd_direcciones_id": constCotizaciones.cot_direccion_envio_id,
                    "upd_direcciones_id": null,
                    "recoleccion_almacen_id": constCotizaciones.cot_alm_almacen_recoleccion,

                    "tipo_envio": constCotizaciones.cot_cmm_tipo_envio_id,

                    "cot_referencia": constCotizaciones.cot_referencia,
                    "cot_usu_usuario_vendedor_id":  constCotizaciones.cot_usu_usuario_vendedor_id,
                    //Esto tambien posiblemente sea por linea
                    "cotp_usu_descuento_cotizacion": 0,
                    "cot_cot_tratamiento": constCotizaciones.cot_tratamiento,
                    
                    "cot_productos": req.body.cot_productos,

                    //Esto es por linea
                    "cotp_porcentaje_descuento_vendedor": 0
                }
            }
            else
            {
                body = {
                    "cdc_sn_socio_de_negocio_id": null,
                    "up_usuarios_prospectos_id": constCotizaciones.cot_up_usuarios_prospectos_id,
                    "cot_prospecto": true,
                    
                    "snd_direcciones_id": null,
                    "upd_direcciones_id": constCotizaciones.cot_direccion_envio_id,
                    "recoleccion_almacen_id": constCotizaciones.cot_alm_almacen_recoleccion,

                    "tipo_envio": constCotizaciones.cot_cmm_tipo_envio_id,

                    "cot_referencia": constCotizaciones.cot_referencia,
                    "cot_usu_usuario_vendedor_id":  constCotizaciones.cot_usu_usuario_vendedor_id,
                    //Esto tambien posiblemente sea por linea
                    "cotp_usu_descuento_cotizacion": 0,
                    "cot_cot_tratamiento": constCotizaciones.cot_tratamiento,
                    
                    "cot_productos": req.body.cot_productos,

                    //Esto es por linea
                    "cotp_porcentaje_descuento_vendedor": 0
                }
            }

            //PASO COT 1
            console.log("/////////// Comienza PASO 1 ///////////")
            //Obtener productos ya sea de carrito id o del array de prospectos solo regresar id de productos en mismo formato
                // productos = await cotizacionesUtils.cotizacionesObtenerProductos(body);
                productos = req.body.cot_productos
            //Fin obtener mismo formato productos
            console.log("/////////// FIN PASO 1 ///////////")


            //PASO COT 2
            console.log("/////////// Comienza PASO 2 ///////////")
            //Obtener la informacion de los productos (Antes de separar lineas/backorder/stockinactivo/hastaagotarexistencia/precioLista)
                productos = await cotizacionesUtils.cotizacionesObtenerInfoBaseProductos(body, productos);
            //Fin obtener productos base
            console.log("/////////// FIN PASO 2 ///////////")


            //PASO COT 3
            console.log("/////////// Comienza PASO 3 ///////////")
            //Mandar obtener lineas para saber de que almacen se surtiran y obtener si es precio lista, precio hae o si
                var lineasProductos = await cotizacionesUtils.cotizacionesObtenerLineasProductos(body, productos);
                // console.log(lineasProductos)
            //Final Mandar obtener lineas para saber de que almacen se surtiran y obtener si es precio lista, precio hae o si
            console.log("/////////// FIN PASO 3 ///////////")


            //PASO COT 4
            console.log("/////////// Comienza PASO 4 ///////////")
            //Recalcular productos base en base a la informacion de las lineas (obtener productos en back etc~)
                productos = await cotizacionesUtils.cotizacionesObtenerInformacionDeLineas(body, productos, lineasProductos);
            //FIN Recalcular productos base en base a la informacion de las lineas (obtener productos en back etc~)
            console.log("/////////// FIN PASO 4 ///////////")


            //PASO COT 5
            console.log("/////////// Comienza PASO 5 ///////////")
            //Obtener promociones a partir de las lineas generadas (Aplicara Backorders tralados etc~)
                productos = await cotizacionesUtils.cotizacionesObtenerPromocionesProductos(body, productos, lineasProductos);
            //FIN Obtener promociones a partir de las lineas generadas
            console.log("/////////// FIN PASO 5 ///////////")


            //PASO COT 6
            console.log("/////////// Comienza PASO 6 ///////////")
            //Obtener totales de cotizacion
                var TotalFinal = await cotizacionesUtils.cotizacionesObtenerTotalesProductos(body, productos, lineasProductos);
            //FIN Obtener totales de cotizacion
            console.log("/////////// FIN PASO 6 ///////////")


            //PASO COT 7
            console.log("/////////// Comienza PASO 7 ///////////")
            //Obtener costos envios
                var cotizacionCarritoEnvioPoliticas = await cotizarCarritoFunction.CotizarCarritoFunctionForCotizacionesFunction(body, productos, TotalFinal);
                console.log(cotizacionCarritoEnvioPoliticas)
            //FIN Obtener costos envios
            console.log("/////////// FIN PASO 7 ///////////")


            //PASO COT 8
            console.log("/////////// Comienza PASO 8 ///////////")
            //Crear fechas de envio
                productos = await cotizacionesUtils.cotizacionesObtenerFechasEnvio(body, productos, TotalFinal, cotizacionCarritoEnvioPoliticas);
            //FIN Crear fechas de envio
            console.log("/////////// FIN PASO 8 ///////////")


























            



            res.status(200).send({
                message: 'Obtener cambios en cotizacion',
                TotalFinal,
                cotizacionCarritoEnvioPoliticas,
                constCotizaciones,
                productos
            })
            



        }catch(e){
            res.status(200).send({
                message: 'Error, al generar la cotización',
                e
            });
            next(e);
        }
    },
















    getTotalesCotizacionesPorFechas: async (req, res, next)  =>{
        try{
            //obtener total1
            const queryResult1 = await sequelize.query(`
                select
                    SUM(cot_total_cotizacion) as "Total"
                from 
                    cotizaciones c 
                where 
                    "createdAt" BETWEEN NOW() - INTERVAL '1 MONTH' AND NOW()
                `,
            { 
                type: sequelize.QueryTypes.SELECT 
            });

            console.log(queryResult1[0].Total)

            if(queryResult1[0].Total == null)
            {
                queryResult1[0].Total = 0
            }

            //obtener total1
            const queryResult2 = await sequelize.query(`
                select
                    SUM(cot_total_cotizacion) as "Total"
                from 
                    cotizaciones c 
                where 
                    "createdAt" BETWEEN NOW() - INTERVAL '3 MONTH' AND NOW() - INTERVAL '1 MONTH'
                `,
            { 
                type: sequelize.QueryTypes.SELECT 
            });

            console.log(queryResult2[0].Total)

            if(queryResult2[0].Total == null)
            {
                queryResult2[0].Total = 0
            }

            //obtener total1
            const queryResult3 = await sequelize.query(`
                select
                    SUM(cot_total_cotizacion) as "Total"
                from 
                    cotizaciones c 
                where 
                    "createdAt" <  NOW() - INTERVAL '3 MONTH' 
                `,
            { 
                type: sequelize.QueryTypes.SELECT 
            });

            console.log(queryResult3[0].Total)

            if(queryResult3[0].Total == null)
            {
                queryResult3[0].Total = 0
            }
            

         



            res.status(200).send({
                message: 'Obtenido correctamente',
                Total1: queryResult1[0].Total,
                Total2: queryResult2[0].Total,
                Total3: queryResult3[0].Total
            });


        }
        catch(e)
        {
            res.status(200).send({
                message: 'Error, al generar la cotización',
                e
            });
            next(e);
        }
    },
    cotizarCostoEnvioSNPros: async (req, res, next)  =>{
        try{

            var productos
            
            //PASO COT 1
            console.log("/////////// Comienza PASO 1 ///////////")
            //Obtener productos ya sea de carrito id o del array de prospectos solo regresar id de productos en mismo formato
                productos = await cotizacionesUtils.cotizacionesObtenerProductos(req.body);
            //Fin obtener mismo formato productos
            console.log("/////////// FIN PASO 1 ///////////")






            //PASO COT 2
            console.log("/////////// Comienza PASO 2 ///////////")
            //Obtener la informacion de los productos (Antes de separar lineas/backorder/stockinactivo/hastaagotarexistencia/precioLista)
                productos = await cotizacionesUtils.cotizacionesObtenerInfoBaseProductos(req.body, productos);
            //Fin obtener productos base
            console.log("/////////// FIN PASO 2 ///////////")




            //PASO COT 3
            console.log("/////////// Comienza PASO 3 ///////////")
            //Mandar obtener lineas para saber de que almacen se surtiran y obtener si es precio lista, precio hae o si
                var lineasProductos = await cotizacionesUtils.cotizacionesObtenerLineasProductos(req.body, productos);
                // console.log(lineasProductos)
            //Final Mandar obtener lineas para saber de que almacen se surtiran y obtener si es precio lista, precio hae o si
            console.log("/////////// FIN PASO 3 ///////////")





            //PASO COT 4
            console.log("/////////// Comienza PASO 4 ///////////")
            //Recalcular productos base en base a la informacion de las lineas (obtener productos en back etc~)
                productos = await cotizacionesUtils.cotizacionesObtenerInformacionDeLineas(req.body, productos, lineasProductos);
            //FIN Recalcular productos base en base a la informacion de las lineas (obtener productos en back etc~)
            console.log("/////////// FIN PASO 4 ///////////")

            


            //PASO COT 5
            console.log("/////////// Comienza PASO 5 ///////////")
            //Obtener promociones a partir de las lineas generadas (Aplicara Backorders tralados etc~)
                productos = await cotizacionesUtils.cotizacionesObtenerPromocionesProductos(req.body, productos, lineasProductos);
            //FIN Obtener promociones a partir de las lineas generadas
            console.log("/////////// FIN PASO 5 ///////////")

                




            //PASO COT 6
            console.log("/////////// Comienza PASO 6 ///////////")
            //Obtener totales de cotizacion
                var TotalFinal = await cotizacionesUtils.cotizacionesObtenerTotalesProductos(req.body, productos, lineasProductos);
            //FIN Obtener totales de cotizacion
            console.log("/////////// FIN PASO 6 ///////////")








            //PASO COT 7
            console.log("/////////// Comienza PASO 7 ///////////")
            //Obtener costos envios
                var cotizacionCarritoEnvioPoliticas = await cotizarCarritoFunction.CotizarCarritoFunctionForCotizacionesFunction(req.body, productos, TotalFinal);
                console.log(cotizacionCarritoEnvioPoliticas)
            //FIN Obtener costos envios
            console.log("/////////// FIN PASO 7 ///////////")


         



            res.status(200).send({
                message: 'Cotizacion carrito aplica politicas de envio exitoso',
                cotizacionCarritoEnvioPoliticas: cotizacionCarritoEnvioPoliticas
            });


        }
        catch(e)
        {
            res.status(200).send({
                message: 'Error, al generar la cotización',
                e
            });
            next(e);
        }
    },
    getAllCotizaciones: async(req, res, next) =>{
        try{
            const constCotizaciones = await models.Cotizaciones.findAll(
            {
            });


            for (var i = 0; i < constCotizaciones.length; i++) 
            {
                var clienteInformacion
                var vendedorInfo

                if(constCotizaciones[i].dataValues.cot_prospecto == true)
                {
                    const constUsuariosProspectos = await models.UsuariosProspectos.findOne(
                    {
                        where: {
                            up_usuarios_prospectos_id: constCotizaciones[i].dataValues.cot_up_usuarios_prospectos_id
                        }
                    });
                    clienteInformacion = constUsuariosProspectos
                }
                else
                {
                    const constSociosNegocio = await models.SociosNegocio.findOne(
                    {
                        where: {
                            sn_socios_negocio_id: constCotizaciones[i].dataValues.cot_sn_socios_negocio_id
                        }
                    });
                    clienteInformacion = constSociosNegocio
                }

                const constUsuario = await models.Usuario.findOne(
                {
                    where: {
                        usu_usuario_id: constCotizaciones[i].dataValues.cot_usu_usuario_vendedor_id
                    },
                    attributes: ["usu_usuario_id", "usu_nombre", "usu_primer_apellido", "usu_segundo_apellido", "usu_correo_electronico"]
                });

                vendedorInfo = constUsuario

                constCotizaciones[i].dataValues.clienteInformacion = clienteInformacion
                constCotizaciones[i].dataValues.vendedorInfo = vendedorInfo
            }



            res.status(200).send({
                message: 'Lista de Cotizaciones',
                constCotizaciones
            })

        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    









    V3getCotizacionFromSN: async(req, res, next) =>{
        try{

            const constCotizaciones = await models.Cotizaciones.findAll(
            {
                where: {
                    cot_sn_socios_negocio_id: req.body.cot_sn_socios_negocio_id
                },
            });

            res.status(200).send({
                message: 'todo bien',
                constCotizaciones
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },











    V2getCotizacionesDetalle: async(req, res, next) =>{
        try{


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

            console.log(Permitir_Cambiar_Precios_O_Descuentos)





            //Get detalle cotizacion base
                const constCotizaciones = await models.Cotizaciones.findOne(
                {
                    where: {
                        cot_cotizacion_id: req.params.id
                    },
                });

                //Cotizacion productos
                const constCotizacionesProductos = await models.CotizacionesProductos.findAll(
                {
                    where: {
                        cotp_cotizacion_id: constCotizaciones.cot_cotizacion_id
                    },
                });
            //fin Get detalle cotizacion base






            //Get cotizacion, info actualizada
                var body
                var productos
                //Si es SN el que cotizo obtener su informacion apartir de la cotizacion
                if(constCotizaciones.cot_prospecto == false)
                {
                    body = {
                        "cdc_sn_socio_de_negocio_id": constCotizaciones.cot_sn_socios_negocio_id,
                        "up_usuarios_prospectos_id": null,
                        "cot_prospecto": false,
                        
                        "snd_direcciones_id": constCotizaciones.cot_direccion_envio_id,
                        "upd_direcciones_id": null,
                        "recoleccion_almacen_id": constCotizaciones.cot_alm_almacen_recoleccion,

                        "tipo_envio": constCotizaciones.cot_cmm_tipo_envio_id,

                        "cot_referencia": constCotizaciones.cot_referencia,
                        "cot_usu_usuario_vendedor_id":  constCotizaciones.cot_usu_usuario_vendedor_id,
                        //Esto tambien posiblemente sea por linea
                        "cotp_usu_descuento_cotizacion": 0,
                        "cot_cot_tratamiento": constCotizaciones.cot_tratamiento,
                        
                        "cot_productos": null,

                        //Esto es por linea
                        "cotp_porcentaje_descuento_vendedor": 0
                    }
                }
                else
                {
                    body = {
                        "cdc_sn_socio_de_negocio_id": null,
                        "up_usuarios_prospectos_id": constCotizaciones.cot_up_usuarios_prospectos_id,
                        "cot_prospecto": true,
                        
                        "snd_direcciones_id": null,
                        "upd_direcciones_id": constCotizaciones.cot_direccion_envio_id,
                        "recoleccion_almacen_id": constCotizaciones.cot_alm_almacen_recoleccion,

                        "tipo_envio": constCotizaciones.cot_cmm_tipo_envio_id,

                        "cot_referencia": constCotizaciones.cot_referencia,
                        "cot_usu_usuario_vendedor_id":  constCotizaciones.cot_usu_usuario_vendedor_id,
                        //Esto tambien posiblemente sea por linea
                        "cotp_usu_descuento_cotizacion": 0,
                        "cot_cot_tratamiento": constCotizaciones.cot_tratamiento,
                        
                        "cot_productos": null,

                        //Esto es por linea
                        "cotp_porcentaje_descuento_vendedor": 0
                    }
                }

                // var productos
                // PASO 1 - Validar cambios en precios (UPDATE) cotizaciones (Obtener productos desde la cotizacion y no del carrito o arreglo que se pide)
                console.log("/////////// Comienza PASO 1 ///////////")
                //Obtener productos de cotizaciones tabla y cotizaciones productos tabla
                    productos = await cotizacionesUtils.cotizacionesObtenerProductosCotizacionesCambios(body, req.params.id);
                //Fin obtener mismo formato productos
                console.log("/////////// FIN PASO 1 ///////////")


                //PASO COT 2
                console.log("/////////// Comienza PASO 2 ///////////")
                //Obtener la informacion de los productos (Antes de separar lineas/backorder/stockinactivo/hastaagotarexistencia/precioLista)
                    productos = await cotizacionesUtils.cotizacionesObtenerInfoBaseProductos(body, productos);
                //Fin obtener productos base
                console.log("/////////// FIN PASO 2 ///////////")


                //PASO COT 3
                console.log("/////////// Comienza PASO 3 ///////////")
                //Mandar obtener lineas para saber de que almacen se surtiran y obtener si es precio lista, precio hae o si
                    var lineasProductos = await cotizacionesUtils.cotizacionesObtenerLineasProductos(body, productos);
                    // console.log(lineasProductos)
                //Final Mandar obtener lineas para saber de que almacen se surtiran y obtener si es precio lista, precio hae o si
                console.log("/////////// FIN PASO 3 ///////////")


                //PASO COT 4
                console.log("/////////// Comienza PASO 4 ///////////")
                //Recalcular productos base en base a la informacion de las lineas (obtener productos en back etc~)
                    productos = await cotizacionesUtils.cotizacionesObtenerInformacionDeLineas(body, productos, lineasProductos);
                //FIN Recalcular productos base en base a la informacion de las lineas (obtener productos en back etc~)
                console.log("/////////// FIN PASO 4 ///////////")


                //PASO COT 5
                console.log("/////////// Comienza PASO 5 ///////////")
                //Obtener promociones a partir de las lineas generadas (Aplicara Backorders tralados etc~)
                    productos = await cotizacionesUtils.cotizacionesObtenerPromocionesProductos(body, productos, lineasProductos);
                //FIN Obtener promociones a partir de las lineas generadas
                console.log("/////////// FIN PASO 5 ///////////")


                //PASO COT 6
                console.log("/////////// Comienza PASO 6 ///////////")
                //Obtener totales de cotizacion
                    var TotalFinal = await cotizacionesUtils.cotizacionesObtenerTotalesProductos(body, productos, lineasProductos);
                //FIN Obtener totales de cotizacion
                console.log("/////////// FIN PASO 6 ///////////")


                //PASO COT 7
                console.log("/////////// Comienza PASO 7 ///////////")
                //Obtener costos envios
                    var cotizacionCarritoEnvioPoliticas = await cotizarCarritoFunction.CotizarCarritoFunctionForCotizacionesFunction(body, productos, TotalFinal);
                    console.log(cotizacionCarritoEnvioPoliticas)
                //FIN Obtener costos envios
                console.log("/////////// FIN PASO 7 ///////////")


                //PASO COT 8
                console.log("/////////// Comienza PASO 8 ///////////")
                //Crear fechas de envio
                    productos = await cotizacionesUtils.cotizacionesObtenerFechasEnvio(body, productos, TotalFinal, cotizacionCarritoEnvioPoliticas);
                //FIN Crear fechas de envio
                console.log("/////////// FIN PASO 8 ///////////")












                //Obtener si la cotizacion base tiene precios especial HAE o SI y sigue vigente, sino actualizar
                for (var i = 0; i < constCotizacionesProductos.length; i++) 
                {
                    //Precio Especial Activo significa que la linea fue creada con precio especial
                    var PrecioEspecialActivo = false
                    //Precio Por Especial actualizado significa que el precio fue actualizado por el actual, que deberia ser de lista
                    var PrecioPorEspecialActualizado = false

                    if(constCotizacionesProductos[i].dataValues.cotp_tipo_precio_lista != 'Precio de Lista')
                    {
                        PrecioEspecialActivo = true

                        //Buscar producto para ver si sigue en precio especial, si no actualizarlo ahora si
                        const constProductoCompararPrecioEspecial = await models.Producto.findOne(
                        {
                            where: {
                                prod_producto_id: constCotizacionesProductos[i].dataValues.cotp_prod_producto_id
                            },
                        });

                        if(constCotizacionesProductos[i].dataValues.cotp_tipo_precio_lista != constProductoCompararPrecioEspecial.prod_tipo_precio_base)
                        {
                            //Dar bandera de nuevo precio especial
                            constCotizacionesProductos[i].dataValues.PrecioPorEspecialActualizado = true




                            //Si el precio es otro tipo especial se tomara directo, si no se intentara recalcular el precio promocion
                            if(constProductoCompararPrecioEspecial.prod_tipo_precio_base != 'Precio de Lista')
                            {
                                //Obtener linea para actualizar
                                const constCotizacionesProductosUpdateLinea = await models.CotizacionesProductos.findOne(
                                {
                                    where: {
                                        cotp_cotizaciones_productos_id: constCotizacionesProductos[i].dataValues.cotp_cotizaciones_productos_id
                                    },
                                });

                                //Establecer precio especial que no sea de lista "nuevo"
                                const bodyUpdate = {
                                    "cotp_precio_base_lista": constProductoCompararPrecioEspecial.prod_precio,
                                    "cotp_precio_menos_promociones": constProductoCompararPrecioEspecial.prod_precio,
                                    "cotp_tipo_precio_lista": constProductoCompararPrecioEspecial.prod_tipo_precio_base,
                                    updatedAt: Date()
                                }
                                
                                console.log(bodyUpdate)
                                // await constCotizacionesProductosUpdateLinea.update(bodyUpdate);
                            }
                            //Actualizar producto de precio lista con su mejor promocion
                            else
                            {
                                console.log(constCotizacionesProductos[i].dataValues.cotp_prod_producto_id)
                                var mejorPromocionPrecio = await productosUtils.getBestPromotionForProduct(constCotizacionesProductos[i].dataValues.cotp_prod_producto_id);
                                console.log(mejorPromocionPrecio)
                                //AQUI
                            }






                        }
                        else
                        {
                            constCotizacionesProductos[i].dataValues.PrecioPorEspecialActualizado = false


                        }
                    }
                    else
                    {
                        constCotizacionesProductos[i].dataValues.PrecioPorEspecialActualizado = false
                    }




                    // //Buscar en el arreglo de productos "nuevos" si existe la regla cotizada vs posiblemente un cambio de precios/cantidades/lineas
                    // for (var j = 0; j < productos.length; j++) 
                    // {




                    //     // console.log(987987987897)
                    //     // // console.log(productos)
                    //     // console.log(constCotizacionesProductos[i].dataValues.cotp_prod_producto_id)
                    //     // console.log(productos[j].prod_producto_id)
                    //     // console.log(constCotizacionesProductos[i].dataValues.cotp_tipo_precio_lista)
                    //     // console.log(productos[j].prod_tipo_precio_base)
                    //     // console.log(constCotizacionesProductos[i].dataValues.cotp_almacen_linea)
                    //     // console.log(productos[j].dataValues.pcf_almacen_linea)
                    //     // console.log(constCotizacionesProductos[i].dataValues.cotp_backorder_precio_lista)
                    //     // console.log(productos[j].dataValues.pcf_backorder_precio_lista)
                    //     // console.log(654654654654)


                    //     // if(constCotizacionesProductos[i].dataValues.cotp_prod_producto_id == productos[j].prod_producto_id 
                    //     //     && constCotizacionesProductos[i].dataValues.cotp_tipo_precio_lista == productos[j].prod_tipo_precio_base
                    //     //     && constCotizacionesProductos[i].dataValues.cotp_almacen_linea == productos[j].dataValues.pcf_almacen_linea
                    //     //     && constCotizacionesProductos[i].dataValues.cotp_backorder_precio_lista == productos[j].dataValues.pcf_backorder_precio_lista)
                    //     // {
                    //     //     // console.log(11111111)
                    //     //     validarQueExistaUnaVez = validarQueExistaUnaVez+1
                    //     //     LineaExiste = true

                    //     //     //Validar ahora que la cantidad sea la misma, si no es igual significa que tiene cambios la cot
                    //     //     if(constCotizacionesProductos[i].dataValues.cotp_producto_cantidad == productos[j].dataValues.cantidad)
                    //     //     {
                    //     //         CantidadIgual = true
                    //     //     }
                    //     //     else
                    //     //     {
                    //     //         console.log("ENTRO AL 1")
                    //     //         CotizacionTieneCambios = true
                    //     //     }

                    //     //     //Validar ahora que el precio sea el mismo, si no es igual significa que tiene cambios la cot
                    //     //     if(constCotizacionesProductos[i].dataValues.cotp_precio_menos_promociones == productos[j].dataValues.precioFinal)
                    //     //     {
                    //     //         PrecioIgual = true
                    //     //     }
                    //     //     else
                    //     //     {
                    //     //         console.log("ENTRO AL 2")
                    //     //         CotizacionTieneCambios = true
                    //     //     }
                    //     // }

                    //     // constCotizacionesProductos[i].dataValues.LineaExiste = LineaExiste
                    //     // constCotizacionesProductos[i].dataValues.PrecioIgual = PrecioIgual
                    //     // constCotizacionesProductos[i].dataValues.CantidadIgual = CantidadIgual
                    // }

                    // if(LineaExiste == false)
                    // {
                    //     lineasAEliminarArray.push(constCotizacionesProductos[i].dataValues.cotp_cotizaciones_productos_id)

                    // }
                    
                    // //Si la linea no existe ninguna vez significa que hay cambios en el carrito Si es 0 es que ninguna linea coincide
                    // if(validarQueExistaUnaVez == 0)
                    // {
                    //     console.log("ENTRO AL 0 no existe")
                    //     CotizacionTieneCambios = true
                    // }
                }


































                // //Empezar a comparar producto por producto para ver si existen por varias variables
                // //validacion general con que una condicion no se cumpla se reflejara que una linea tiene cambios
                // var CotizacionTieneCambios = false
                // console.log(constCotizacionesProductos.length)
                // console.log(productos.length)

                // var lineasAEliminarArray = []

                // for (var i = 0; i < constCotizacionesProductos.length; i++) 
                // {
                //     var LineaExiste = false
                //     var PrecioIgual = false
                //     var CantidadIgual = false


                //     var validarQueExistaUnaVez = 0

                //     //Buscar en el arreglo de productos "nuevos" si existe la regla cotizada vs posiblemente un cambio de precios/cantidades/lineas
                //     for (var j = 0; j < productos.length; j++) 
                //     {
                //         console.log(987987987897)
                //         // console.log(productos)
                //         console.log(constCotizacionesProductos[i].dataValues.cotp_prod_producto_id)
                //         console.log(productos[j].prod_producto_id)
                //         console.log(constCotizacionesProductos[i].dataValues.cotp_tipo_precio_lista)
                //         console.log(productos[j].prod_tipo_precio_base)
                //         console.log(constCotizacionesProductos[i].dataValues.cotp_almacen_linea)
                //         console.log(productos[j].dataValues.pcf_almacen_linea)
                //         console.log(constCotizacionesProductos[i].dataValues.cotp_backorder_precio_lista)
                //         console.log(productos[j].dataValues.pcf_backorder_precio_lista)
                //         console.log(654654654654)


                //         if(constCotizacionesProductos[i].dataValues.cotp_prod_producto_id == productos[j].prod_producto_id 
                //             && constCotizacionesProductos[i].dataValues.cotp_tipo_precio_lista == productos[j].prod_tipo_precio_base
                //             && constCotizacionesProductos[i].dataValues.cotp_almacen_linea == productos[j].dataValues.pcf_almacen_linea
                //             && constCotizacionesProductos[i].dataValues.cotp_backorder_precio_lista == productos[j].dataValues.pcf_backorder_precio_lista)
                //         {
                //             // console.log(11111111)
                //             validarQueExistaUnaVez = validarQueExistaUnaVez+1
                //             LineaExiste = true

                //             //Validar ahora que la cantidad sea la misma, si no es igual significa que tiene cambios la cot
                //             if(constCotizacionesProductos[i].dataValues.cotp_producto_cantidad == productos[j].dataValues.cantidad)
                //             {
                //                 CantidadIgual = true
                //             }
                //             else
                //             {
                //                 console.log("ENTRO AL 1")
                //                 CotizacionTieneCambios = true
                //             }

                //             //Validar ahora que el precio sea el mismo, si no es igual significa que tiene cambios la cot
                //             if(constCotizacionesProductos[i].dataValues.cotp_precio_menos_promociones == productos[j].dataValues.precioFinal)
                //             {
                //                 PrecioIgual = true
                //             }
                //             else
                //             {
                //                 console.log("ENTRO AL 2")
                //                 CotizacionTieneCambios = true
                //             }
                //         }

                //         constCotizacionesProductos[i].dataValues.LineaExiste = LineaExiste
                //         constCotizacionesProductos[i].dataValues.PrecioIgual = PrecioIgual
                //         constCotizacionesProductos[i].dataValues.CantidadIgual = CantidadIgual
                //     }

                //     if(LineaExiste == false)
                //     {
                //         lineasAEliminarArray.push(constCotizacionesProductos[i].dataValues.cotp_cotizaciones_productos_id)

                //     }
                    
                //     //Si la linea no existe ninguna vez significa que hay cambios en el carrito Si es 0 es que ninguna linea coincide
                //     if(validarQueExistaUnaVez == 0)
                //     {
                //         console.log("ENTRO AL 0 no existe")
                //         CotizacionTieneCambios = true
                //     }
                // }

                // console.log(lineasAEliminarArray)


            //fin Get cotizacion, info actualizada












            if(Permitir_Cambiar_Precios_O_Descuentos == true)
            {



            }







            res.status(200).send({
                message: 'todo bien',
                Permitir_Cambiar_Precios_O_Descuentos,
                constCotizaciones,
                constCotizacionesProductos
            })




            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },


    //API actualizar cantidades (1 linea puede afectar hasta a 4 lineas con el mismo producto)
    V3cotizacionesPermitirActualizarPrecios: async(req, res, next) =>{
        try{
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

            res.status(200).send({
                message: 'Actualización correcta',
                Permitir_Cambiar_Precios_O_Descuentos
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    

    





    //API actualizar cantidades (1 linea puede afectar hasta a 4 lineas con el mismo producto)
    V3updateCotizacionLineaCantidad: async(req, res, next) =>{
        try{
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

            //Get detalle cotizacion base
            const constCotizaciones = await models.Cotizaciones.findOne(
            {
                where: {
                    cot_cotizacion_id: req.body.cot_cotizacion_id
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
            //fin Get detalle cotizacion base

            if(Permitir_Cambiar_Precios_O_Descuentos == true)
            {
                
                
                











                res.status(200).send({
                    message: 'Actualizado con exito'
                })
            }
            else
            {
                res.status(200).send({
                    message: 'No se permite la actualizacion de precios'
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



































    //10 Mayo 2023
    //Obtiene la informacion de un prospecto segun su correo electronico
    getProspectoInfo: async(req, res, next) =>{
        try
        {
            const constUsuariosProspectos = await models.UsuariosProspectos.findOne(
            {
                where: {
                    up_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_USUARIOS_PROSPECTOS.ELIMINADA },
                    up_email_facturacion: req.body.up_email_facturacion
                }
            });
            if(constUsuariosProspectos)
            {
                res.status(200).send(
                {
                    message: 'Obtenido con exito',
                    constUsuariosProspectos
                })
            }
            else
            {   
                res.status(200).send(
                {
                    message: 'Prospecto no encontrado',
                    constUsuariosProspectos: null
                })
            }
        }
        catch(e)
        {
            res.status(500).send(
            {
              message: 'Error al obtener informacion',
              e
            });
            next(e);
        }
    },

    // Crea direccion de prospecto para poder cotizar siendo prospecto
    createProspectoDireccion: async(req, res, next) =>{
        try
        {
            const constUsuariosProspectos = await models.UsuariosProspectos.findOne(
            {
                where: {
                    up_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_USUARIOS_PROSPECTOS.ELIMINADA },
                    up_usuarios_prospectos_id: req.body.up_usuarios_prospectos_id
                }
            });

            if(constUsuariosProspectos)
            {
                var bodyCreate = {
                    "upd_up_usuarios_prospectos_id": req.body.up_usuarios_prospectos_id,
                    "upd_pais_id": req.body.up_pais_id,
                    "upd_estado_id": req.body.up_estado_id,
                    "upd_ciudad": req.body.up_ciudad,
                    "upd_direccion": req.body.up_direccion,
                    "upd_direccion_num_ext": req.body.up_direccion_num_ext,
                    "upd_direccion_num_int": req.body.upd_direccion_num_int,
                    "upd_calle1": req.body.upd_calle1,
                    "upd_calle2": req.body.upd_calle2,
                    "upd_codigo_postal": req.body.up_codigo_postal,
                    "upd_colonia": req.body.up_colonia,
                    "upd_alias": req.body.upd_alias,
                    "upd_contacto": req.body.upd_contacto,
                    "upd_telefono": req.body.upd_telefono
                };
                     
                const constUsuariosProspectosDirecciones = await models.UsuariosProspectosDirecciones.create(bodyCreate);

                res.status(200).send(
                {
                    message: 'Prospecto creado con exito',
                    constUsuariosProspectosDirecciones
                })
            }
            else
            {   
                res.status(500).send(
                {
                    message: 'Prospecto No existe'
                })
            }
        }
        catch(e)
        {
            await models.UsuariosProspectos.destroy({
                where: {
                    up_usuarios_prospectos_id: borrarUsuarioProspectoEnCasoDeFallo
                }
            });

            res.status(500).send(
            {
              message: 'Error al crear Prospecto',
              e
            });

            next(e);
        }
    },

    //Crea la cotizacion de SN o Prospecto
    V3crearCotizacion: async (req, res, next)  =>{
        var cotizacionIDEliminarEnCasoDeFallo = 0
        var cotizacionIDEliminarEnCasoDeFalloBool = false
        try{
            var productos
            var tipoImpuesto = 16
            var multiplicadorImpuesto = 1.16

            //PASO 00 Obtener iva
            console.log("/////////// Comienza PASO 0 ///////////")
            //Obtener productos ya sea de carrito id o del array de prospectos solo regresar id de productos en mismo formato
                //Obtener informacion de impuesto de SN o Prospecto
                    if(req.body.cot_prospecto == false)
                    {
                        //Si es SN y envio a domicilio
                        if(req.body.tipo_envio == 16)
                        {
                            
                            const constSociosNegocio = await models.SociosNegocio.findOne(
                            {
                                where: { 
                                    sn_socios_negocio_id: req.body.cdc_sn_socio_de_negocio_id
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
                                    multiplicadorImpuesto = 1.08
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
                        if(req.body.tipo_envio == 16)
                        {
                            //Informacion Socio de negocio / Direccoin facturacion para impuestos
                            const constDireccionProspecto = await models.UsuariosProspectosDirecciones.findOne(
                            {
                                where: {
                                    upd_direcciones_id: req.body.upd_direcciones_id
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
                                    multiplicadorImpuesto = 1.08
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
            //Fin obtener informacion de iva
            console.log("/////////// FIN PASO 0 ///////////")

            //PASO COT 1
            console.log("/////////// Comienza PASO 1 ///////////")
            //Obtener productos ya sea de carrito id o del array de prospectos solo regresar id de productos en mismo formato
                productos = await cotizacionesUtils.cotizacionesObtenerProductos(req.body);
            //Fin obtener mismo formato productos
            console.log("/////////// FIN PASO 1 ///////////")

            //PASO COT 2
            console.log("/////////// Comienza PASO 2 ///////////")
            //Obtener la informacion de los productos (Antes de separar lineas/backorder/stockinactivo/hastaagotarexistencia/precioLista)
                productos = await cotizacionesUtils.cotizacionesObtenerInfoBaseProductos(req.body, productos);
            //Fin obtener productos base
            console.log("/////////// FIN PASO 2 ///////////")

            //PASO COT 3
            console.log("/////////// Comienza PASO 3 ///////////")
            //Mandar obtener lineas para saber de que almacen se surtiran y obtener si es precio lista, precio hae o si
                var lineasProductos = await cotizacionesUtils.cotizacionesObtenerLineasProductos(req.body, productos);
                // console.log(lineasProductos)
            //Final Mandar obtener lineas para saber de que almacen se surtiran y obtener si es precio lista, precio hae o si
            console.log("/////////// FIN PASO 3 ///////////")

            //PASO COT 4
            console.log("/////////// Comienza PASO 4 ///////////")
            //Recalcular productos base en base a la informacion de las lineas (obtener productos en back etc~)
                productos = await cotizacionesUtils.cotizacionesObtenerInformacionDeLineas(req.body, productos, lineasProductos);
            //FIN Recalcular productos base en base a la informacion de las lineas (obtener productos en back etc~)
            console.log("/////////// FIN PASO 4 ///////////")

            //PASO COT 5
            console.log("/////////// Comienza PASO 5 ///////////")
            //Obtener promociones a partir de las lineas generadas (Aplicara Backorders tralados etc~)
                productos = await cotizacionesUtils.cotizacionesObtenerPromocionesProductos(req.body, productos, lineasProductos);
            //FIN Obtener promociones a partir de las lineas generadas
            console.log("/////////// FIN PASO 5 ///////////")

            //PASO COT 6
            console.log("/////////// Comienza PASO 6 ///////////")
            //Obtener totales de cotizacion
                var TotalFinal = await cotizacionesUtils.cotizacionesObtenerTotalesProductos(req.body, productos, lineasProductos);
            //FIN Obtener totales de cotizacion
            console.log("/////////// FIN PASO 6 ///////////")

            //PASO COT 6.1
            console.log("/////////// Comienza PASO 6.1 ///////////")
            //Obtener totales Base y totales Descuentos
                var TotalBaseYDescuentos = await cotizacionesUtils.cotizacionesObtenerTotalesBaseYDescuentos(req.body, productos, lineasProductos);
            //FIN Obtener totales de cotizacion
            console.log("/////////// FIN PASO 6.1 ///////////")

            console.log(TotalBaseYDescuentos.totalBase)

            //PASO COT 7
            console.log("/////////// Comienza PASO 7 ///////////")
            //Obtener costos envios
                var cotizacionCarritoEnvioPoliticas = await cotizarCarritoFunction.CotizarCarritoFunctionForCotizacionesFunction(req.body, productos, TotalFinal);
                console.log(cotizacionCarritoEnvioPoliticas)
            //FIN Obtener costos envios
            console.log("/////////// FIN PASO 7 ///////////")

            //PASO COT 8
            console.log("/////////// Comienza PASO 8 ///////////")
            //Crear fechas de envio
                productos = await cotizacionesUtils.cotizacionesObtenerFechasEnvio(req.body, productos, TotalFinal, cotizacionCarritoEnvioPoliticas);
            //FIN Crear fechas de envio
            console.log("/////////// FIN PASO 8 ///////////")

            //PASO COT 9
            console.log("/////////// Comienza PASO 9 ///////////")
            //Insertar Cotizacion

                //Obtener tiempo de caducidad cotizacion
                const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
                {
                    where: {
                        cmm_nombre: "TIEMPO_CADUCIDAD_COTIZACIONES"
                    }
                });
                var FechaVencimiento = new Date(Date.now() + constControlMaestroMultiple.cmm_valor*24*60*60*1000);

                var constCotizacionesResult = ''
                var constCotizacionesProductosResult = []
                if(req.body.cot_prospecto == false)
                {
                    const constCarritoDeCompraOrder = await models.CarritoDeCompra.findOne({
                        where: {
                            cdc_sn_socio_de_negocio_id : req.body.cdc_sn_socio_de_negocio_id
                        }
                    });

                    var orderID = "Q-"+constCarritoDeCompraOrder.cdc_numero_orden

                    //Crear cotizaciones
                    constCotizacionesResult = await models.Cotizaciones.create(
                    {
                        cot_numero_orden: orderID,
                        cot_sn_socios_negocio_id: req.body.cdc_sn_socio_de_negocio_id,

                        //Total sin impuestos
                        cot_total_cotizacion: TotalFinal,
                        cot_referencia: req.body.cot_referencia,
                        cot_cmm_estatus_id: statusControles.ESTATUS_COTIZACION.ACTIVO,
                        cot_motivo_cancelacion: null,
                        cot_usu_usuario_vendedor_id: req.body.cot_usu_usuario_vendedor_id,
                        cot_fecha_vencimiento: FechaVencimiento,
                        cot_cmm_tipo_envio_id: req.body.tipo_envio,
                        cot_direccion_envio_id: req.body.snd_direcciones_id,
                        cot_alm_almacen_recoleccion: req.body.recoleccion_almacen_id,

                        // Este campo posiblemente sea el tipo de pago
                        // cot_cmm_tipo_compra_id: algo

                        cot_fletera_id: cotizacionCarritoEnvioPoliticas.CotizacionResult.fleteraID,
                        cot_costo_envio: cotizacionCarritoEnvioPoliticas.CotizacionResult.totalFinal,
                        cot_promcup_promociones_cupones_id: null,

                        cot_forma_pago_codigo: null,
                        cot_cfdi: null,
                        cot_tratamiento: req.body.cot_cot_tratamiento,
                        cot_prospecto: req.body.cot_prospecto,
                        cot_up_usuarios_prospectos_id: req.body.up_usuarios_prospectos_id,

                        cot_surtir_un_almacen: cotizacionCarritoEnvioPoliticas.CotizacionResult.suertirUnSoloAlmacen,
                        cot_tipo_politica_envio: cotizacionCarritoEnvioPoliticas.CotizacionResult.politicaNombre,
                        cot_aplica_politica_envio: cotizacionCarritoEnvioPoliticas.CotizacionResult.politicaBool,


                        cot_iva: tipoImpuesto,
                        cot_descuento_total: TotalBaseYDescuentos.totalDescuentos,
                        cot_total_base: TotalBaseYDescuentos.totalBase,
                        cot_total_promocion: TotalBaseYDescuentos.totalPromocion,

                        cot_mantener_copia: req.body.cot_mantener_copia,
                        cot_descuento_porcentaje: TotalBaseYDescuentos.descuentoEnPorcentaje,
                        cot_iva_cantidad: parseFloat(((TotalBaseYDescuentos.totalPromocion*multiplicadorImpuesto)-TotalBaseYDescuentos.totalPromocion).toFixed(2))

                    });
                }
                else
                {
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
                    var orderID = "Q-"+String(Date.now())+String(ultimoRowNum+1)

                    //Crear cotizaciones
                    constCotizacionesResult = await models.Cotizaciones.create(
                    {
                        cot_numero_orden: orderID,
                        cot_up_usuarios_prospectos_id: req.body.up_usuarios_prospectos_id,

                        //Total sin impuestos
                        cot_total_cotizacion: TotalFinal,
                        cot_referencia: req.body.cot_referencia,
                        cot_cmm_estatus_id: statusControles.ESTATUS_COTIZACION.ACTIVO,
                        cot_motivo_cancelacion: null,
                        cot_usu_usuario_vendedor_id: req.body.cot_usu_usuario_vendedor_id,
                        cot_fecha_vencimiento: FechaVencimiento,
                        cot_cmm_tipo_envio_id: req.body.tipo_envio,
                        cot_direccion_envio_id: req.body.upd_direcciones_id,
                        cot_alm_almacen_recoleccion: req.body.recoleccion_almacen_id,

                        // Este campo posiblemente sea el tipo de pago
                        // cot_cmm_tipo_compra_id: algo

                        cot_fletera_id: cotizacionCarritoEnvioPoliticas.CotizacionResult.fleteraID,
                        cot_costo_envio: cotizacionCarritoEnvioPoliticas.CotizacionResult.totalFinal,
                        cot_promcup_promociones_cupones_id: null,

                        cot_forma_pago_codigo: null,
                        cot_cfdi: null,
                        cot_tratamiento: req.body.cot_cot_tratamiento,
                        cot_prospecto: req.body.cot_prospecto,
                        cot_up_usuarios_prospectos_id: req.body.up_usuarios_prospectos_id,
                        cot_surtir_un_almacen: cotizacionCarritoEnvioPoliticas.CotizacionResult.suertirUnSoloAlmacen,
                        cot_tipo_politica_envio: cotizacionCarritoEnvioPoliticas.CotizacionResult.politicaNombre,
                        cot_aplica_politica_envio: cotizacionCarritoEnvioPoliticas.CotizacionResult.politicaBool,


                        cot_iva: tipoImpuesto,
                        cot_descuento_total: TotalBaseYDescuentos.totalDescuentos,
                        cot_total_base: TotalBaseYDescuentos.totalBase,
                        cot_total_promocion: TotalBaseYDescuentos.totalPromocion,

                        cot_mantener_copia: req.body.cot_mantener_copia,
                        cot_descuento_porcentaje: TotalBaseYDescuentos.descuentoEnPorcentaje,
                        cot_iva_cantidad: parseFloat(((TotalBaseYDescuentos.totalPromocion*multiplicadorImpuesto)-TotalBaseYDescuentos.totalPromocion).toFixed(2))
                    });
                }

                console.log('hj: ', constCotizacionesResult)
                //Si se inserto correctamente la cotizacion insertara ahora los productos
                if(constCotizacionesResult != '')
                {   
                    cotizacionIDEliminarEnCasoDeFalloBool = true
                    cotizacionIDEliminarEnCasoDeFallo = constCotizacionesResult.dataValues.cot_cotizacion_id
                    // //Insertar cada producto en la tabla de cotizaciones productos
                    for (var i = 0; i < productos.length; i++) 
                    {
                        //Crear cotizaciones
                        var porcentajeDescuentoVendedor = req.body.cotp_porcentaje_descuento_vendedor ? req.body.cotp_porcentaje_descuento_vendedor : 0

                        const constCotizacionesProductosInserted = await models.CotizacionesProductos.create({
                            cotp_prod_producto_id: productos[i].dataValues.prod_producto_id,
                            cotp_cotizacion_id: constCotizacionesResult.dataValues.cot_cotizacion_id,
                            cotp_producto_cantidad: productos[i].dataValues.cantidad,
                            cotp_precio_base_lista: productos[i].dataValues.prod_precio,
                            cotp_precio_menos_promociones: productos[i].dataValues.precioFinal,
                            cotp_porcentaje_descuento_vendedor: porcentajeDescuentoVendedor,
                            cotp_precio_descuento_vendedor: (porcentajeDescuentoVendedor*productos[i].dataValues.precioFinal)/100,
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

                        constCotizacionesProductosResult.push(constCotizacionesProductosInserted)
                    }

                    //Eliminar carrito pero cuando es ENV que no lo borre para no volver a generarlo de 0
                    if( req.body.cot_prospecto == false)
                    {

                        const constCarritoDeCompraBorrar = await models.CarritoDeCompra.findOne(
                        {
                            where: {
                                cdc_sn_socio_de_negocio_id: req.body.cdc_sn_socio_de_negocio_id
                            }
                        });

                        //Borrar carrito actual
                        await models.ProductoCarritoDeCompra.destroy(
                        {
                            where: {
                                pcdc_carrito_de_compra_id: constCarritoDeCompraBorrar.cdc_carrito_de_compra_id
                            }
                        });
                        await models.CarritoDeCompra.destroy(
                        {
                            where: {
                                cdc_carrito_de_compra_id: constCarritoDeCompraBorrar.cdc_carrito_de_compra_id
                            }
                        });
                    }
                    else
                    {
                        //Actualizar carrito tal vez?
                        // var newNumeroOrden =  parseInt(constCarritoDeCompra.cdc_numero_orden)+1
                        // newNumeroOrden = "0000000" + newNumeroOrden
                         
                        // const bodyUpdate = {
                        //     "cdc_numero_orden": newNumeroOrden,
                        //     updatedAt: Date()
                        // };
                        
                        // await constCarritoDeCompra.update(bodyUpdate);
                    }
                }
            //FIN Insertar Cotizacion
            console.log("/////////// FIN PASO 9 ///////////")
            //Enviar Cotizacion
            if(req.body.cot_prospecto == false)
            {
              
                    const constSociosNegocioUsuario = await models.SociosNegocioUsuario.findOne({
                        where: {
                            snu_sn_socio_de_negocio_id: req.body.cdc_sn_socio_de_negocio_id,
                            snu_super_usuario: true
                        }
                    });
                     console.log('enviar correo:'+constSociosNegocioUsuario.snu_correo_electronico+' cotizacion :'+constCotizacionesResult.cot_cotizacion_id)
            await cotizacionEnviar(constSociosNegocioUsuario.snu_correo_electronico,constCotizacionesResult.cot_cotizacion_id, req.body.cot_referencia);
            //constCotizacionesResult.cot_cotizacion_id
            }else{
               
                const infoCliente = await models.UsuariosProspectos.findOne(
                    {
                        where: {
                            up_usuarios_prospectos_id: req.body.up_usuarios_prospectos_id
                        },
                    });

                    console.log(infoCliente)
                    console.log('enviar correo'+infoCliente.up_email_facturacion+' cotizacion:'+constCotizacionesResult.cot_cotizacion_id)

               await cotizacionEnviar(infoCliente.up_email_facturacion,constCotizacionesResult.cot_cotizacion_id,  req.body.cot_referencia);
            }


            res.status(200).send({
                message: 'Creado con exito',
                TotalFinal,
                cotizacionCarritoEnvioPoliticas,
                constCotizacionesResult,
                constCotizacionesProductosResult,
                productos
            })

        }catch(e){
            if(cotizacionIDEliminarEnCasoDeFalloBool == true)
            {
                await models.CotizacionesProductos.destroy(
                {
                    where: {
                        cotp_cotizacion_id: cotizacionIDEliminarEnCasoDeFallo
                    }
                });
                await models.Cotizaciones.destroy(
                {
                    where: {
                        cot_cotizacion_id: cotizacionIDEliminarEnCasoDeFallo
                    }
                });
            }
            
            res.status(200).send({
                message: 'Error, al generar la cotización',
                e
            });
            next(e);
        }
    },

    //Obtiene el detalle basico de la cotizacion
    getCotizacionesDetalle: async(req, res, next) =>{
        try{
            //cotizacion general
            const constCotizaciones = await models.Cotizaciones.findOne(
            {
                where: {
                    cot_cotizacion_id: req.params.id
                },
            });

            if(constCotizaciones)
            {
                var infoCliente
                var infoDireccion

                if(constCotizaciones.cot_prospecto == false)
                {
                    //Informacion de SN
                    infoCliente = await models.SociosNegocio.findOne(
                    {
                        where: {
                            sn_socios_negocio_id: constCotizaciones.cot_sn_socios_negocio_id
                        },
                    });

                    //Informacion de direccion de envio o recoleccion
                    if(constCotizaciones.cot_cmm_tipo_envio_id == 16)
                    {
                        infoDireccion = await models.SociosNegocioDirecciones.findOne(
                        {
                            where: {
                                snd_direcciones_id: constCotizaciones.cot_direccion_envio_id
                            },
                        });
                    }
                    else
                    {
                        infoDireccion = await models.Almacenes.findOne(
                        {
                            where: {
                                alm_almacen_id: constCotizaciones.cot_alm_almacen_recoleccion
                            },
                        });
                    }
                }
                else
                {
                    infoCliente = await models.UsuariosProspectos.findOne(
                    {
                        where: {
                            up_usuarios_prospectos_id: constCotizaciones.cot_up_usuarios_prospectos_id
                        },
                    });

                    //Informacion de direccion de envio o recoleccion
                    if(constCotizaciones.cot_cmm_tipo_envio_id == 16)
                    {
                        infoDireccion = await models.UsuariosProspectosDirecciones.findOne(
                        {
                            where: {
                                upd_direcciones_id: constCotizaciones.cot_direccion_envio_id
                            },
                        });
                    }
                    else
                    {
                        infoDireccion = await models.Almacenes.findOne(
                        {
                            where: {
                                alm_almacen_id: constCotizaciones.cot_alm_almacen_recoleccion
                            },
                        });
                    }
                }

                //get vendedor detalle
                const InfoVendedor = await models.Usuario.findOne(
                {
                    where: {
                        usu_usuario_id: constCotizaciones.cot_usu_usuario_vendedor_id
                    },
                    attributes: 
                    {
                        exclude: ['usu_contrasenia', 'usu_correo_electronico', 'usu_codigo_vendedor', 'usu_usuario_modificado_por_id', 'usu_usuario_creado_por_id', 'usu_imagen_perfil_id','usu_rol_rol_id', 'usu_cmm_estatus_id',     
                                    'createdAt','updatedAt']
                    }
                });

                constCotizaciones.dataValues.InformacionCliente = infoCliente
                constCotizaciones.dataValues.InformacionDireccion = infoDireccion
                constCotizaciones.dataValues.Vendedor = InfoVendedor

                //Cotizacion productos
                const constCotizacionesProductos = await models.CotizacionesProductos.findAll(
                {
                    where: {
                        cotp_cotizacion_id: constCotizaciones.cot_cotizacion_id
                    },
                });

                //Obtener informacion del producto
                for (var i = 0; i < constCotizacionesProductos.length; i++) 
                {
                    //Cotizacion productos
                    const constProducto = await models.Producto.findOne(
                    {
                        where: {
                            prod_producto_id: constCotizacionesProductos[i].dataValues.cotp_prod_producto_id
                        },
                    });

                    constCotizacionesProductos[i].dataValues.prod_sku = constProducto.prod_sku
                    constCotizacionesProductos[i].dataValues.prod_prod_producto_padre_sku = constProducto.prod_prod_producto_padre_sku
                    constCotizacionesProductos[i].dataValues.prod_nombre_extranjero = constProducto.prod_nombre_extranjero
                    constCotizacionesProductos[i].dataValues.prod_nombre = constProducto.prod_nombre
                    constCotizacionesProductos[i].dataValues.prod_descripcion = constProducto.prod_descripcion

                    //Cotizacion productos
                    const constImagenProducto = await models.ImagenProducto.findAll(
                    {
                        where: {
                            imgprod_prod_producto_id: constCotizacionesProductos[i].dataValues.cotp_prod_producto_id
                        },
                    });

                    constCotizacionesProductos[i].dataValues.imagenes = constImagenProducto
                }

                res.status(200).send({
                    message: 'Detalle de cotizacion correcta',
                    constCotizaciones,
                    constCotizacionesProductos
                })
            }
            else
            {
                res.status(500).send({
                    message: 'cotizacion no encontrada'
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

    //Hace update a la cotizacion en general (informacion)
    V3updateCotizacionGeneral: async(req, res, next) =>{
        try{
            const constCotizacion = await models.Cotizaciones.findOne({
                where: {
                    cot_cotizacion_id: req.body.cot_cotizacion_id
                }
            });

            var actualizacion = await constCotizacion.update({
                cot_referencia : !!req.body.cot_referencia ? req.body.cot_referencia : constCotizacion.dataValues.cot_referencia,
                cot_cmm_estatus_id : !!req.body.cot_cmm_estatus_id ? req.body.cot_cmm_estatus_id : constCotizacion.dataValues.cot_cmm_estatus_id,
                cot_motivo_cancelacion : !!req.body.cot_motivo_cancelacion ? req.body.cot_motivo_cancelacion : constCotizacion.dataValues.cot_motivo_cancelacion,
                cot_fecha_vencimiento: !!req.body.cot_fecha_vencimiento ? req.body.cot_fecha_vencimiento : constCotizacion.dataValues.cot_fecha_vencimiento,
                cot_usu_usuario_vendedor_id : !!req.body.cot_usu_usuario_vendedor_id ? req.body.cot_usu_usuario_vendedor_id : constCotizacion.dataValues.cot_usu_usuario_vendedor_id,
                cot_usu_usuario_modificador_id : !!req.body.cot_usu_usuario_modificador_id ? req.body.cot_usu_usuario_modificador_id : constCotizacion.dataValues.cot_usu_usuario_modificador_id,
                cot_cmm_tipo_envio_id : !!req.body.cot_cmm_tipo_envio_id ? req.body.cot_cmm_tipo_envio_id : constCotizacion.dataValues.cot_cmm_tipo_envio_id,
                cot_direccion_envio_id: !!req.body.cot_direccion_envio_id ? req.body.cot_direccion_envio_id : constCotizacion.dataValues.cot_direccion_envio_id,
                cot_alm_almacen_recoleccion: !!req.body.cot_alm_almacen_recoleccion ? req.body.cot_alm_almacen_recoleccion : constCotizacion.dataValues.cot_alm_almacen_recoleccion,
                cot_cmm_tipo_compra_id: !!req.body.cot_cmm_tipo_compra_id ? req.body.cot_cmm_tipo_compra_id : constCotizacion.dataValues.cot_cmm_tipo_compra_id,
                cot_fletera_id: !!req.body.cot_fletera_id ? req.body.cot_fletera_id : constCotizacion.dataValues.cot_fletera_id,
                cot_costo_envio: !!req.body.cot_costo_envio ? req.body.cot_costo_envio : constCotizacion.dataValues.cot_costo_envio,
                cot_promcup_promociones_cupones_id: !!req.body.cot_promcup_promociones_cupones_id ? req.body.cot_promcup_promociones_cupones_id : constCotizacion.dataValues.cot_promcup_promociones_cupones_id,
                cot_forma_pago_codigo: !!req.body.cot_forma_pago_codigo ? req.body.cot_forma_pago_codigo : constCotizacion.dataValues.cot_forma_pago_codigo,
                cot_cfdi: !!req.body.cot_cfdi ? req.body.cot_cfdi : constCotizacion.dataValues.cot_cfdi,
                cot_tratamiento: !!req.body.cot_tratamiento ? req.body.cot_tratamiento : constCotizacion.dataValues.cot_tratamiento,
                cot_mantener_copia: !!req.body.cot_mantener_copia ? req.body.cot_mantener_copia : constCotizacion.dataValues.cot_mantener_copia,
                cot_terminos_y_condiciones: !!req.body.cot_terminos_y_condiciones ? req.body.cot_terminos_y_condiciones : constCotizacion.dataValues.cot_terminos_y_condiciones,
                updatedAt: Date()
            });

            res.status(200).send({
                message: 'Actualización correcta',
                Cotizaciones
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    //Actualiza las lineas de una cotizacion al consultarla para ver si cambiaron precios, inventarios tipo de listas (VERSION VIEJA POSIBLEMENTE NO SE USE)
    V3updateCotizacionesInicio: async(req, res, next) =>{
        try{
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

            //Get detalle cotizacion base
                const constCotizaciones = await models.Cotizaciones.findOne(
                {
                    where: {
                        cot_cotizacion_id: req.params.id
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
            //Fin Get detalle cotizacion base



            //
                // //Get cotizacion, info actualizada
                    var body
                    var productos
                    //Si es SN el que cotizo obtener su informacion apartir de la cotizacion
                    if(constCotizaciones.cot_prospecto == false)
                    {
                        body = {
                            "cdc_sn_socio_de_negocio_id": constCotizaciones.cot_sn_socios_negocio_id,
                            "up_usuarios_prospectos_id": null,
                            "cot_prospecto": false,
                            
                            "snd_direcciones_id": constCotizaciones.cot_direccion_envio_id,
                            "upd_direcciones_id": null,
                            "recoleccion_almacen_id": constCotizaciones.cot_alm_almacen_recoleccion,

                            "tipo_envio": constCotizaciones.cot_cmm_tipo_envio_id,

                            "cot_referencia": constCotizaciones.cot_referencia,
                            "cot_usu_usuario_vendedor_id":  constCotizaciones.cot_usu_usuario_vendedor_id,
                            //Esto tambien posiblemente sea por linea
                            "cotp_usu_descuento_cotizacion": 0,
                            "cot_cot_tratamiento": constCotizaciones.cot_tratamiento,
                            
                            "cot_productos": null,

                            //Esto es por linea
                            "cotp_porcentaje_descuento_vendedor": 0
                        }
                    }
                    else
                    {
                        body = {
                            "cdc_sn_socio_de_negocio_id": null,
                            "up_usuarios_prospectos_id": constCotizaciones.cot_up_usuarios_prospectos_id,
                            "cot_prospecto": true,
                            
                            "snd_direcciones_id": null,
                            "upd_direcciones_id": constCotizaciones.cot_direccion_envio_id,
                            "recoleccion_almacen_id": constCotizaciones.cot_alm_almacen_recoleccion,

                            "tipo_envio": constCotizaciones.cot_cmm_tipo_envio_id,

                            "cot_referencia": constCotizaciones.cot_referencia,
                            "cot_usu_usuario_vendedor_id":  constCotizaciones.cot_usu_usuario_vendedor_id,
                            //Esto tambien posiblemente sea por linea
                            "cotp_usu_descuento_cotizacion": 0,
                            "cot_cot_tratamiento": constCotizaciones.cot_tratamiento,
                            
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
                        productos = await cotizacionesUtils.cotizacionesObtenerProductosCotizacionesCambios(body, req.params.id);
                    //Fin obtener mismo formato productos
                    console.log("/////////// FIN PASO 1 ///////////")


                    //PASO COT 2
                    console.log("/////////// Comienza PASO 2 ///////////")
                    //Obtener la informacion de los productos (Antes de separar lineas/backorder/stockinactivo/hastaagotarexistencia/precioLista)
                        productos = await cotizacionesUtils.cotizacionesObtenerInfoBaseProductos(body, productos);
                    //Fin obtener productos base
                    console.log("/////////// FIN PASO 2 ///////////")


                    //PASO COT 3
                    console.log("/////////// Comienza PASO 3 ///////////")
                    //Mandar obtener lineas para saber de que almacen se surtiran y obtener si es precio lista, precio hae o si
                        var lineasProductos = await cotizacionesUtils.cotizacionesObtenerLineasProductos(body, productos);
                        // console.log(lineasProductos)
                    //Final Mandar obtener lineas para saber de que almacen se surtiran y obtener si es precio lista, precio hae o si
                    console.log("/////////// FIN PASO 3 ///////////")


                    //PASO COT 4
                    console.log("/////////// Comienza PASO 4 ///////////")
                    //Recalcular productos base en base a la informacion de las lineas (obtener productos en back etc~)
                        productos = await cotizacionesUtils.cotizacionesObtenerInformacionDeLineas(body, productos, lineasProductos);
                    //FIN Recalcular productos base en base a la informacion de las lineas (obtener productos en back etc~)
                    console.log("/////////// FIN PASO 4 ///////////")

















































                //     //PASO COT 5
                //     console.log("/////////// Comienza PASO 5 ///////////")
                //     //Obtener promociones a partir de las lineas generadas (Aplicara Backorders tralados etc~)
                //         productos = await cotizacionesUtils.cotizacionesObtenerPromocionesProductos(body, productos, lineasProductos);
                //     //FIN Obtener promociones a partir de las lineas generadas
                //     console.log("/////////// FIN PASO 5 ///////////")


                //     //PASO COT 6
                //     console.log("/////////// Comienza PASO 6 ///////////")
                //     //Obtener totales de cotizacion
                //         var TotalFinal = await cotizacionesUtils.cotizacionesObtenerTotalesProductos(body, productos, lineasProductos);
                //     //FIN Obtener totales de cotizacion
                //     console.log("/////////// FIN PASO 6 ///////////")


                //     //PASO COT 7
                //     console.log("/////////// Comienza PASO 7 ///////////")
                //     //Obtener costos envios
                //         var cotizacionCarritoEnvioPoliticas = await cotizarCarritoFunction.CotizarCarritoFunctionForCotizacionesFunction(body, productos, TotalFinal);
                //         console.log(cotizacionCarritoEnvioPoliticas)
                //     //FIN Obtener costos envios
                //     console.log("/////////// FIN PASO 7 ///////////")


                //     //PASO COT 8
                //     console.log("/////////// Comienza PASO 8 ///////////")
                //     //Crear fechas de envio
                //         productos = await cotizacionesUtils.cotizacionesObtenerFechasEnvio(body, productos, TotalFinal, cotizacionCarritoEnvioPoliticas);
                //     //FIN Crear fechas de envio
                //     console.log("/////////// FIN PASO 8 ///////////")


            //









            //Niveles de stock nos permiten cumplir las condiciones originales de la cotización (Solo setea informacion)
            //Paso 0.1
            var General_nivelStockCumpleCondiciones = true
            if(Permitir_Cambiar_Precios_O_Descuentos == true)
            {
                //validar por linea si se pueden surtir las mismas comparando 1-1 contra la tabla de stocks
                for (var j = 0; j < constCotizacionesProductos.length; j++) 
                {
                    var prod_nivelStockCumpleCondiciones = true
                    var prod_surtirParcialPosible = null
                    var prod_lineaEliminadaPorStock = false
                    var prod_surtirParcialPosibleCantidad = 0
                    var prod_lineaBackorderTieneCambio = false


                    //Si no es backorder la linea
                    if(constCotizacionesProductos[j].dataValues.cotp_backorder_precio_lista == false)
                    {
                        const constStockProducto = await models.StockProducto.findOne(
                        {
                            where: {
                                sp_prod_producto_id: constCotizacionesProductos[j].dataValues.cotp_prod_producto_id,
                                sp_almacen_id: constCotizacionesProductos[j].dataValues.cotp_almacen_linea
                            }
                        });

                        //Si existe el id prod y el almacen
                        if(constStockProducto)
                        {
                            //Si la cantidad es mayor significa que no se puede surtir
                            if(constCotizacionesProductos[j].dataValues.cotp_producto_cantidad > constStockProducto.sp_cantidad)
                            {
                                console.log(111)
                                console.log("NO SE PUEDE SURTIR")
                                General_nivelStockCumpleCondiciones = false
                                prod_nivelStockCumpleCondiciones = false

                                if(constStockProducto.sp_cantidad > 0)
                                {
                                    prod_surtirParcialPosible = true
                                    prod_surtirParcialPosibleCantidad = constStockProducto.sp_cantidad
                                }
                                else
                                {
                                    prod_surtirParcialPosible = false
                                    prod_lineaEliminadaPorStock = true
                                }
                            }
                            else
                            {
                                console.log(111)
                                console.log("TODO BIEN, CONSOLE LOG LUEGO BORRAR")
                            }
                        }
                        //Si no existe setteara la variable para que se rehagan las lineas
                        else
                        {
                            console.log(111)
                            console.log("NO EXISTE EL STOCK BUSCADO")
                            General_nivelStockCumpleCondiciones = false
                            prod_nivelStockCumpleCondiciones = false
                        }
                    }
                    else
                    {
                        const constProductoIsBackorder = await models.Producto.findOne(
                        {
                            where: {
                                prod_producto_id: constCotizacionesProductos[j].dataValues.cotp_prod_producto_id
                            }
                        });

                        if(constProductoIsBackorder)
                        {
                            //agregar cambio de tipo de backorder si es pendiente o sigue activo
                            var backorderActualmenteActivo
                            
                            //Si es 0 significa que actualmente el backorder no esta disponible
                            if(constProductoIsBackorder.prod_dias_resurtimiento == 0)
                            {
                                backorderActualmenteActivo = false
                            }
                            else
                            {
                                backorderActualmenteActivo = true
                            }



                            console.log(backorderActualmenteActivo)
                            console.log(constCotizacionesProductos[j].dataValues.cotp_backorder_fecha_envio_pendiente)
                            if(backorderActualmenteActivo == false && constCotizacionesProductos[j].dataValues.cotp_backorder_fecha_envio_pendiente == false)
                            {
                                console.log("entro 1")
                                prod_lineaBackorderTieneCambio = true
                            }
                            else if(backorderActualmenteActivo == false && constCotizacionesProductos[j].dataValues.cotp_backorder_fecha_envio_pendiente == true)
                            {
                                console.log("entro 2")
                                prod_lineaBackorderTieneCambio = false
                            }
                            else if(backorderActualmenteActivo == true && constCotizacionesProductos[j].dataValues.cotp_backorder_fecha_envio_pendiente == false)
                            {
                                console.log("entro 3")
                                prod_lineaBackorderTieneCambio = false
                            }
                            else if(backorderActualmenteActivo == true && constCotizacionesProductos[j].dataValues.cotp_backorder_fecha_envio_pendiente == true)
                            {
                                console.log("entro 4")
                                prod_lineaBackorderTieneCambio = true
                            }   



                            //si es igual a cero significa que no tiene backorder por lo tanto la linea no se puede surtir
                            if(constProductoIsBackorder.prod_dias_resurtimiento == 0)
                            {
                                General_nivelStockCumpleCondiciones = false
                                prod_nivelStockCumpleCondiciones = false
                                console.log(111)
                                console.log("BACKORDER NO PUEDE SURTIRSE")
                            }
                            else
                            {
                                console.log(111)
                                console.log("TODO BIEN BACKORDER SURTIR, CONSOLE LOG LUEGO BORRAR")
                            }
                        }
                        //Si no existe setteara la variable para que se rehagan las lineas
                        else
                        {
                            General_nivelStockCumpleCondiciones = false
                            prod_nivelStockCumpleCondiciones = false
                            console.log(111)
                            console.log("NO EXISTE EL PRODUCTO BUSCADO")
                        }
                    }

                    constCotizacionesProductos[j].dataValues.prod_nivelStockCumpleCondiciones = prod_nivelStockCumpleCondiciones
                    constCotizacionesProductos[j].dataValues.prod_surtirParcialPosible = prod_surtirParcialPosible
                    constCotizacionesProductos[j].dataValues.prod_surtirParcialPosibleCantidad = prod_surtirParcialPosibleCantidad
                    constCotizacionesProductos[j].dataValues.prod_lineaEliminadaPorStock = prod_lineaEliminadaPorStock
                    constCotizacionesProductos[j].dataValues.prod_lineaBackorderTieneCambio = prod_lineaBackorderTieneCambio


                    console.log("General_nivelStockCumpleCondiciones Despues de validacion: " + General_nivelStockCumpleCondiciones)
                } //final For lineas checar inventarios

                constCotizaciones.dataValues.General_nivelStockCumpleCondiciones = General_nivelStockCumpleCondiciones
            }








            //Despues de obtener todo lo referente a stock se procesara la informacion
            //paso 0.2
            //Si es falso significa que no se cumplieron las condiciones de la actual cotizacion y se tiene que hacer movimiento de stock
            if(Permitir_Cambiar_Precios_O_Descuentos == true)
            {
                if(General_nivelStockCumpleCondiciones == false)
                {
                    //Validar linea por linea las validaciones anteriores para resolverlas
                    // for (var j = 0; j < 2; j++) 
                    for (var j = 0; j < constCotizacionesProductos.length; j++) 
                    {
                        //ver si es alguna linea que no cumple
                        if(constCotizacionesProductos[j].dataValues.prod_nivelStockCumpleCondiciones == false && constCotizacionesProductos[j].dataValues.cotp_backorder_precio_lista == false)
                        {
                            //Si se puede surtir parcial
                            if(constCotizacionesProductos[j].dataValues.prod_surtirParcialPosible == true)
                            {
                                console.log("LINEA SURTIDA PARCIALMENTE")
                                //Buscar producto cotizacion para actualizar cantidades
                                const constCotizacionesProductosUpdate2 = await models.CotizacionesProductos.findOne(
                                {
                                    where: {
                                        cotp_cotizaciones_productos_id: constCotizacionesProductos[j].dataValues.cotp_cotizaciones_productos_id
                                    }  
                                });

                                const bodyUpdateSurtirParcial = {
                                    "cotp_producto_cantidad": constCotizacionesProductos[j].dataValues.prod_surtirParcialPosibleCantidad,
                                    updatedAt: Date()
                                }

                                console.log(bodyUpdateSurtirParcial)
                                
                                await constCotizacionesProductosUpdate2.update(bodyUpdateSurtirParcial);

                                //Buscar backorder para sumarle una cantidad de stock
                                const constCotizacionesProductosExisteBackorder = await models.CotizacionesProductos.findOne(
                                {
                                    where: {
                                        cotp_prod_producto_id: constCotizacionesProductos[j].dataValues.cotp_prod_producto_id,
                                        cotp_backorder_precio_lista: true,
                                        cotp_cotizacion_id: constCotizacionesProductos[j].dataValues.cotp_cotizacion_id
                                    }  
                                });

                                //Si Existe actualizar la cantidad final
                                if(constCotizacionesProductosExisteBackorder)
                                {
                                    console.log("SURTIR PARCIAL ACTUALIZAR BACKORDER")
                                    var cantidadRestante = constCotizacionesProductos[j].dataValues.cotp_producto_cantidad - constCotizacionesProductos[j].dataValues.prod_surtirParcialPosibleCantidad
                                    var cantidadParaBackorder = constCotizacionesProductosExisteBackorder.cotp_producto_cantidad + cantidadRestante

                                    const bodyUpdateBackorder = {
                                        "cotp_producto_cantidad": cantidadParaBackorder,
                                        updatedAt: Date()
                                    }

                                    console.log(bodyUpdateBackorder)
                                    
                                    await constCotizacionesProductosExisteBackorder.update(bodyUpdateBackorder);
                                }
                                //Si no existe crear la linea
                                else
                                {
                                    var cantidadRestante = constCotizacionesProductos[j].dataValues.cotp_producto_cantidad - constCotizacionesProductos[j].dataValues.prod_surtirParcialPosibleCantidad
                                    // var cantidadParaBackorder = constCotizacionesProductosBackorderUpdate.cotp_producto_cantidad + cantidadRestante

                                    console.log("SURTIR PARCIAL CREAR BACKORDER")
                                    const bodyCreateBackorder = {
                                        "cotp_prod_producto_id": constCotizacionesProductos[j].dataValues.cotp_prod_producto_id,
                                        "cotp_cotizacion_id": constCotizacionesProductos[j].dataValues.cotp_cotizacion_id,
                                        "cotp_producto_cantidad": cantidadRestante,
                                        "cotp_precio_base_lista": constCotizacionesProductos[j].dataValues.cotp_precio_base_lista,
                                        "cotp_precio_menos_promociones": constCotizacionesProductos[j].dataValues.cotp_precio_menos_promociones,
                                        "cotp_almacen_linea": constCotizacionesProductos[j].dataValues.cotp_almacen_linea,
                                        "cotp_porcentaje_descuento_vendedor": constCotizacionesProductos[j].dataValues.cotp_porcentaje_descuento_vendedor,
                                        "cotp_precio_descuento_vendedor": constCotizacionesProductos[j].dataValues.cotp_precio_descuento_vendedor,
                                        "cotp_usu_descuento_cotizacion": constCotizacionesProductos[j].dataValues.cotp_usu_descuento_cotizacion,
                                        "cotp_disponible_para_compra": constCotizacionesProductos[j].dataValues.cotp_disponible_para_compra,
                                        "cotp_back_order": true,
                                        "cotp_usu_usuario_modificado_id": constCotizacionesProductos[j].dataValues.cotp_usu_usuario_modificado_id,
                                        "cotp_tipo_precio_lista": constCotizacionesProductos[j].dataValues.cotp_tipo_precio_lista,
                                        "cotp_dias_resurtimiento": constCotizacionesProductos[j].dataValues.cotp_dias_resurtimiento,
                                        "cotp_recoleccion_resurtimiento": constCotizacionesProductos[j].dataValues.cotp_recoleccion_resurtimiento,
                                        "cotp_fecha_entrega": constCotizacionesProductos[j].dataValues.cotp_fecha_entrega,
                                        "cotp_backorder_precio_lista": true,
                                        "cotp_descuento_porcentual": constCotizacionesProductos[j].dataValues.cotp_descuento_porcentual
                                    };
                                    console.log(bodyCreateBackorder)

                                    await models.CotizacionesProductos.create(bodyCreateBackorder);
                                }
                            }
                            //Si no se puede surtir parcialmente se eliminara la linea y se mandara a backorder
                            else
                            {
                                console.log("LINEA NOOOO PUEDE SER SURTIDA PARCIUALMENTE MANDAR TODO BACKORDER")

                                //Buscar cot prod para luego borrar y obtener sus productos
                                const constCotizacionesProductosAEliminar = await models.CotizacionesProductos.findOne(
                                {
                                    where: {
                                        cotp_cotizaciones_productos_id: constCotizacionesProductos[j].dataValues.cotp_cotizaciones_productos_id
                                    }  
                                });
                                var CantidadDeProductoABackorder = constCotizacionesProductosAEliminar.cotp_producto_cantidad

                                //Buscar backorder para sumarle una cantidad de stock
                                const constCotizacionesProductosBackorderUpdate = await models.CotizacionesProductos.findOne(
                                {
                                    where: {
                                        cotp_prod_producto_id: constCotizacionesProductos[j].dataValues.cotp_prod_producto_id,
                                        cotp_backorder_precio_lista: true,
                                        cotp_cotizacion_id: constCotizacionesProductos[j].dataValues.cotp_cotizacion_id
                                    }  
                                });

                                //Si Existe actualizar la cantidad final
                                if(constCotizacionesProductosBackorderUpdate)
                                {
                                    console.log(constCotizacionesProductosBackorderUpdate.cotp_producto_cantidad)
                                    console.log(CantidadDeProductoABackorder)
                                    var cantidadParaBackorder = constCotizacionesProductosBackorderUpdate.cotp_producto_cantidad + CantidadDeProductoABackorder
                                    console.log(cantidadParaBackorder)

                                    console.log("NO SURTIR ACTUALIZAR BACKORDER")
                                    const bodyUpdateBackorder = {
                                        "cotp_producto_cantidad": cantidadParaBackorder,
                                        updatedAt: Date()
                                    }

                                    console.log(bodyUpdateBackorder)
                                    
                                    await constCotizacionesProductosBackorderUpdate.update(bodyUpdateBackorder);
                                }
                                //Si no existe crear la linea
                                else
                                {
                                    console.log("NO SURTIR CREAR BACKORDER")
                                    const bodyCreateBackorder = {
                                        "cotp_prod_producto_id": constCotizacionesProductos[j].dataValues.cotp_prod_producto_id,
                                        "cotp_cotizacion_id": constCotizacionesProductos[j].dataValues.cotp_cotizacion_id,
                                        "cotp_producto_cantidad": CantidadDeProductoABackorder,
                                        "cotp_precio_base_lista": constCotizacionesProductos[j].dataValues.cotp_precio_base_lista,
                                        "cotp_precio_menos_promociones": constCotizacionesProductos[j].dataValues.cotp_precio_menos_promociones,
                                        "cotp_almacen_linea": constCotizacionesProductos[j].dataValues.cotp_almacen_linea,
                                        "cotp_porcentaje_descuento_vendedor": constCotizacionesProductos[j].dataValues.cotp_porcentaje_descuento_vendedor,
                                        "cotp_precio_descuento_vendedor": constCotizacionesProductos[j].dataValues.cotp_precio_descuento_vendedor,
                                        "cotp_usu_descuento_cotizacion": constCotizacionesProductos[j].dataValues.cotp_usu_descuento_cotizacion,
                                        "cotp_disponible_para_compra": constCotizacionesProductos[j].dataValues.cotp_disponible_para_compra,
                                        "cotp_back_order": true,
                                        "cotp_usu_usuario_modificado_id": constCotizacionesProductos[j].dataValues.cotp_usu_usuario_modificado_id,
                                        "cotp_tipo_precio_lista": constCotizacionesProductos[j].dataValues.cotp_tipo_precio_lista,
                                        "cotp_dias_resurtimiento": constCotizacionesProductos[j].dataValues.cotp_dias_resurtimiento,
                                        "cotp_recoleccion_resurtimiento": constCotizacionesProductos[j].dataValues.cotp_recoleccion_resurtimiento,
                                        "cotp_fecha_entrega": constCotizacionesProductos[j].dataValues.cotp_fecha_entrega,
                                        "cotp_backorder_precio_lista": true,
                                        "cotp_descuento_porcentual": constCotizacionesProductos[j].dataValues.cotp_descuento_porcentual
                                    };
                                    console.log(bodyCreateBackorder)

                                    await models.CotizacionesProductos.create(bodyCreateBackorder);

                                }

                                await constCotizacionesProductosAEliminar.destroy({
                                });
                            }
                        }
                    }
                }
            }
            




            





            //Validar que las lineas de backorder sigan activas, si no poner la validacion del cuadro rojo segun el diagrama de fecha de envio pendiente
            //paso 0.3
            if(Permitir_Cambiar_Precios_O_Descuentos == true)
            {
                //Cotizacion productos
                const constCotizacionesProductosBackorderPendientes = await models.CotizacionesProductos.findAll(
                {
                    where: {
                        cotp_cotizacion_id: constCotizaciones.cot_cotizacion_id,
                        cotp_backorder_precio_lista: true
                    },
                    order: [
                        ['cotp_cotizaciones_productos_id', 'ASC']
                    ],
                });

                //Validar linea por linea las validaciones anteriores para resolverlas
                for (var j = 0; j < constCotizacionesProductosBackorderPendientes.length; j++) 
                {
                    var prod_lineaBackorderTieneCambio = false

                    //Buscar el producto y ver si sigue siendo backorder activo
                    const constProductoDiasResurtimiento = await models.Producto.findOne(
                    {
                        where: {
                            prod_producto_id: constCotizacionesProductosBackorderPendientes[j].dataValues.cotp_prod_producto_id
                        }  
                    });


                    //Si es igual a cero y existe backorder significa que se mandara a fecha de envio pendiente
                    if(constProductoDiasResurtimiento.prod_dias_resurtimiento == 0)
                    {
                        //Buscar backorder para sumarle una cantidad de stock
                        const constCotizacionesBackorderActualizarFechaPendiente = await models.CotizacionesProductos.findOne(
                        {
                            where: {
                                cotp_cotizaciones_productos_id: constCotizacionesProductosBackorderPendientes[j].dataValues.cotp_cotizaciones_productos_id
                            }
                        });

                        const bodyUpdateActualizarFechaPendiente = {
                            "cotp_backorder_fecha_envio_pendiente": true,
                            updatedAt: Date()
                        }

                        await constCotizacionesBackorderActualizarFechaPendiente.update(bodyUpdateActualizarFechaPendiente);
                    }
                    //Si es backorder y sigo activo el backorder se dejara false para el flujo normal
                    else
                    {
                        const constCotizacionesBackorderActualizarFechaPendiente = await models.CotizacionesProductos.findOne(
                        {
                            where: {
                                cotp_cotizaciones_productos_id: constCotizacionesProductosBackorderPendientes[j].dataValues.cotp_cotizaciones_productos_id
                            }
                        });

                        const bodyUpdateActualizarFechaPendiente = {
                            "cotp_backorder_fecha_envio_pendiente": false,
                            updatedAt: Date()
                        }

                        await constCotizacionesBackorderActualizarFechaPendiente.update(bodyUpdateActualizarFechaPendiente);
                    }
                }
            }



















            //Cotizacion productos, independientemente de si alguna linea fue eliminada por stock o cambios toda la informacion siguiente debera caer aqui
            const constCotizacionesProductosNewLines = await models.CotizacionesProductos.findAll(
            {
                where: {
                    cotp_cotizacion_id: constCotizaciones.cot_cotizacion_id
                },
                order: [
                    ['cotp_cotizaciones_productos_id', 'ASC']
                ],
            });


            //Validar lineas que no sean backorder de que los precios no ayan cambiado
            //paso 0.4
            var General_listaDePreciosCambiaron = false
            var General_preciosBaseCambiaron = false
            if(Permitir_Cambiar_Precios_O_Descuentos == true)
            {
                //Cotizacion productos
                const constCotizacionesProductosChecarPrecios = await models.CotizacionesProductos.findAll(
                {
                    where: {
                        cotp_cotizacion_id: constCotizaciones.cot_cotizacion_id
                    },
                    order: [
                        ['cotp_cotizaciones_productos_id', 'ASC']
                    ],
                });

                //Validar linea por linea los que sean precio especial
                for (var j = 0; j < constCotizacionesProductosChecarPrecios.length; j++) 
                {
                    var prod_precioCambioTipoLista = false
                    var prod_precioBaseCambio = false
                    var prod_precioBaseCambioAnterior = 0
                    var prod_precioBaseCambioNuevo = 0
                    // var prod_precioCambioTipoListaSigueSiendoEspecial = false


                    //Solo productos que no sean backorder aplica
                    if(constCotizacionesProductosChecarPrecios[j].dataValues.cotp_back_order == false)
                    {
                       //obtener producto
                        const constProductoPrecioEspecial = await models.Producto.findOne(
                        {
                            where: {
                                prod_producto_id: constCotizacionesProductosChecarPrecios[j].dataValues.cotp_prod_producto_id
                            }  
                        });

                        //Obtiene los precios de lista y valida si siguen siendo iguales
                        console.log(constProductoPrecioEspecial.prod_tipo_precio_base)
                        console.log(constCotizacionesProductosChecarPrecios[j].dataValues.cotp_tipo_precio_lista)
                        if(constProductoPrecioEspecial.prod_tipo_precio_base != constCotizacionesProductosChecarPrecios[j].dataValues.cotp_tipo_precio_lista)
                        {
                            prod_precioCambioTipoLista = true
                            General_listaDePreciosCambiaron = true

                            //Buscar linea para actualizarla con nuevo tipo de lista
                            const constCotizacionesUpdateTipoLista = await models.CotizacionesProductos.findOne(
                            {
                                where: {
                                    cotp_cotizaciones_productos_id: constCotizacionesProductosChecarPrecios[j].dataValues.cotp_cotizaciones_productos_id
                                }
                            });

                            const bodyUpdateTipoPrecioEspecial = {
                                "cotp_tipo_precio_lista": constProductoPrecioEspecial.prod_tipo_precio_base,
                                updatedAt: Date()
                            }

                            await constCotizacionesUpdateTipoLista.update(bodyUpdateTipoPrecioEspecial);
                        }


                        //Buscar si el precio base a cambiado
                        if(constProductoPrecioEspecial.prod_precio != constCotizacionesProductosChecarPrecios[j].dataValues.cotp_precio_base_lista)
                        {
                            General_preciosBaseCambiaron = true
                            prod_precioBaseCambio = true
                            prod_precioBaseCambioAnterior = constCotizacionesProductosChecarPrecios[j].dataValues.cotp_precio_base_lista
                            prod_precioBaseCambioNuevo = constProductoPrecioEspecial.prod_precio

                            //Buscar linea para actualizarla con nuevo tipo de lista
                            const constCotizacionesUpdatePrecioBase = await models.CotizacionesProductos.findOne(
                            {
                                where: {
                                    cotp_cotizaciones_productos_id: constCotizacionesProductosChecarPrecios[j].dataValues.cotp_cotizaciones_productos_id
                                }
                            });

                            const bodyUpdateUpdatePrecioBase = {
                                "cotp_precio_base_lista": constProductoPrecioEspecial.prod_precio,
                                updatedAt: Date()
                            }

                            await constCotizacionesUpdatePrecioBase.update(bodyUpdateUpdatePrecioBase);
                        }
                        constCotizacionesProductosNewLines[j].dataValues.prod_precioCambioTipoLista = prod_precioCambioTipoLista
                        constCotizacionesProductosNewLines[j].dataValues.prod_precioBaseCambio = prod_precioBaseCambio
                        constCotizacionesProductosNewLines[j].dataValues.prod_precioBaseCambioAnterior = prod_precioBaseCambioAnterior
                        constCotizacionesProductosNewLines[j].dataValues.prod_precioBaseCambioNuevo = prod_precioBaseCambioNuevo
                    }
                }
            }



































            //Validar que las lineas que sean backorder tengan precio de lista  
            //paso 0.5
            if(Permitir_Cambiar_Precios_O_Descuentos == true)
            {
                //Cotizacion productos
                const constCotizacionesProductosChecarPrecios = await models.CotizacionesProductos.findAll(
                {
                    where: {
                        cotp_cotizacion_id: constCotizaciones.cot_cotizacion_id
                    },
                    order: [
                        ['cotp_cotizaciones_productos_id', 'ASC']
                    ],
                });

                //Validar linea por linea los que sean precio especial
                for (var j = 0; j < constCotizacionesProductosChecarPrecios.length; j++) 
                {
                    var prod_precioCambioTipoLista = false
                    var prod_precioBaseCambio = false
                    var prod_precioBaseCambioAnterior = 0
                    var prod_precioBaseCambioNuevo = 0
                    // var prod_precioCambioTipoListaSigueSiendoEspecial = false


                    //Solo productos que no sean backorder aplica
                    if(constCotizacionesProductosChecarPrecios[j].dataValues.cotp_back_order == true)
                    {
                        //obtener producto 
                        const constProductoBackorder = await models.Producto.findOne(
                        {
                            where: {
                                prod_producto_id: constCotizacionesProductosChecarPrecios[j].dataValues.cotp_prod_producto_id
                            }  
                        });

                        //Obtener precio original de lista de precios
                        const constProductoListaPrecioBase = await models.ProductoListaPrecio.findOne(
                        {
                            where: {
                                pl_prod_producto_id: constCotizacionesProductosChecarPrecios[j].dataValues.cotp_prod_producto_id,
                                pl_listp_lista_de_precio_id: 1
                            }
                        });

                        if(constProductoListaPrecioBase.pl_precio_producto != constCotizacionesProductosChecarPrecios[j].dataValues.cotp_precio_base_lista)
                        {
                            General_preciosBaseCambiaron = true
                            prod_precioBaseCambio = true
                            prod_precioBaseCambioAnterior = constProductoListaPrecioBase.pl_precio_producto
                            prod_precioBaseCambioNuevo = constProductoBackorder.prod_precio

                            //Buscar linea para actualizarla con nuevo tipo de lista
                            const constCotizacionesUpdatePrecioBase = await models.CotizacionesProductos.findOne(
                            {
                                where: {
                                    cotp_cotizaciones_productos_id: constCotizacionesProductosChecarPrecios[j].dataValues.cotp_cotizaciones_productos_id
                                }
                            });

                            const bodyUpdateUpdatePrecioBase = {
                                "cotp_precio_base_lista": constProductoBackorder.prod_precio,
                                "cotp_tipo_precio_lista": "Precio de Lista",
                                updatedAt: Date()
                            }
                            await constCotizacionesUpdatePrecioBase.update(bodyUpdateUpdatePrecioBase);

                        }

                        constCotizacionesProductosNewLines[j].dataValues.prod_precioCambioTipoLista = prod_precioCambioTipoLista
                        constCotizacionesProductosNewLines[j].dataValues.prod_precioBaseCambio = prod_precioBaseCambio
                        constCotizacionesProductosNewLines[j].dataValues.prod_precioBaseCambioAnterior = prod_precioBaseCambioAnterior
                        constCotizacionesProductosNewLines[j].dataValues.prod_precioBaseCambioNuevo = prod_precioBaseCambioNuevo
                    }
                }
                //Validacion global de si un precio especial cambio
            }


            constCotizaciones.dataValues.General_listaDePreciosCambiaron = General_listaDePreciosCambiaron
            constCotizaciones.dataValues.General_preciosBaseCambiaron = General_preciosBaseCambiaron













            //Validar lineas con precio promocion y sus promociones excluir lineas de backorder
            //paso 0.6
            if(Permitir_Cambiar_Precios_O_Descuentos == true)
            {
                var preciosListaCambiaron = false
                //Cotizacion productos
                const constCotizacionesProductosChecarPrecios = await models.CotizacionesProductos.findAll(
                {
                    where: {
                        cotp_cotizacion_id: constCotizaciones.cot_cotizacion_id
                    },
                    order: [
                        ['cotp_cotizaciones_productos_id', 'ASC']
                    ],
                });

                //Validar linea por linea
                for (var j = 0; j < constCotizacionesProductosChecarPrecios.length; j++) 
                {
                    
                    // var prod_precioBaseCambio = false
                    // var prod_precioBaseCambioAnterior = 0
                    // var prod_precioBaseCambioNuevo = 0

                    var prod_precioPromocionCambio = false
                    var prod_precioPromocionCambioAnterior = 0
                    var prod_precioPromocionCambioNuevo = 0

                    // var prod_precioCambioTipoListaSigueSiendoEspecial = false


                    //Si es precio de lista y no es backorder
                    if(constCotizacionesProductosChecarPrecios[j].dataValues.cotp_back_order == false && constCotizacionesProductosChecarPrecios[j].dataValues.cotp_tipo_precio_lista == 'Precio de Lista')
                    {
                        //obtener producto 
                        const constProductoBuscarPromociones = await models.Producto.findOne(
                        {
                            where: {
                                prod_producto_id: constCotizacionesProductosChecarPrecios[j].dataValues.cotp_prod_producto_id
                            }  
                        });

                        //Obtener precio original de lista de precios
                        const constProductoListaPrecioBase = await models.ProductoListaPrecio.findOne(
                        {
                            where: {
                                pl_prod_producto_id: constCotizacionesProductosChecarPrecios[j].dataValues.cotp_prod_producto_id,
                                pl_listp_lista_de_precio_id: 1
                            }
                        });


                        // //Si el precio base actual (Cotizacion) es diferente al que viene de la lista de precios
                        // console.log(3333444333)
                        // if(constProductoListaPrecioBase.pl_precio_producto != constCotizacionesProductosChecarPrecios[j].dataValues.cotp_precio_base_lista)
                        // {
                        //     console.log("ENTRO AL CAMBIAR PRECIO BASE")
                        //     // General_preciosBaseCambiaron = true
                        //     preciosListaCambiaron = true
                        //     prod_precioBaseCambio = true
                        //     prod_precioBaseCambioAnterior = constCotizacionesProductosChecarPrecios[j].dataValues.cotp_precio_base_lista
                        //     prod_precioBaseCambioNuevo = constProductoBuscarPromociones.prod_precio

                        //     //Buscar linea para actualizarla
                        //     const constCotizacionesUpdatePrecioBase = await models.CotizacionesProductos.findOne(
                        //     {
                        //         where: {
                        //             cotp_cotizaciones_productos_id: constCotizacionesProductosChecarPrecios[j].dataValues.cotp_cotizaciones_productos_id
                        //         }
                        //     });

                        //     const bodyUpdateUpdatePrecioBase = {
                        //         "cotp_precio_base_lista": constProductoBuscarPromociones.prod_precio,
                        //         updatedAt: Date()
                        //     }
                        //     await constCotizacionesUpdatePrecioBase.update(bodyUpdateUpdatePrecioBase);
                        // }
                        // console.log(1112223333)



                        //Buscar precio promocion del producto, se tiene que validar el tipo de cotizacion y ver como obtener este valor
                        constCotizacionesProductosChecarPrecios[j].dataValues.prod_precio = constProductoBuscarPromociones.dataValues.prod_precio
                        constCotizacionesProductosChecarPrecios[j].dataValues.prod_codigo_prop_list = constProductoBuscarPromociones.dataValues.prod_codigo_prop_list
                        
                        var productoMejorPromocionPrecio = await cotizacionesUtils.cotizacionesObtenerPromocionesProductosOneProductCotInicio(body, constCotizacionesProductosChecarPrecios[j], 0);

                        console.log(666777888)
                        console.log(productoMejorPromocionPrecio.dataValues.precioFinal)

                        //Validar si el precio promocion final es igual al precio que tiene la linea de cotizacion
                        if(productoMejorPromocionPrecio.dataValues.precioFinal != constCotizacionesProductosChecarPrecios[j].dataValues.cotp_precio_menos_promociones)
                        {
                            preciosListaCambiaron = true
                            console.log("ENTRO A ACTUALIZAR LAS PROMOCIONES DE LINEAS")
                            var prod_precioPromocionCambio = true
                            var prod_precioPromocionCambioAnterior = constCotizacionesProductosChecarPrecios[j].dataValues.cotp_precio_menos_promociones
                            var prod_precioPromocionCambioNuevo = productoMejorPromocionPrecio.dataValues.precioFinal

                            //Buscar linea para actualizarla
                            const constCotizacionesUpdatePrecioPromocion = await models.CotizacionesProductos.findOne(
                            {
                                where: {
                                    cotp_cotizaciones_productos_id: constCotizacionesProductosChecarPrecios[j].dataValues.cotp_cotizaciones_productos_id
                                }
                            });

                            const bodyUpdateUpdatePrecioPromocion = {
                                "cotp_precio_menos_promociones": productoMejorPromocionPrecio.dataValues.precioFinal,
                                updatedAt: Date()
                            }

                            await constCotizacionesUpdatePrecioPromocion.update(bodyUpdateUpdatePrecioPromocion);
                        }

                        // constCotizacionesProductos[j].dataValues.prod_precioCambioTipoLista = prod_precioCambioTipoLista
                        // constCotizacionesProductos[j].dataValues.prod_precioBaseCambio = prod_precioBaseCambio
                        // constCotizacionesProductos[j].dataValues.prod_precioBaseCambioAnterior = prod_precioBaseCambioAnterior
                        // constCotizacionesProductos[j].dataValues.prod_precioBaseCambioNuevo = prod_precioBaseCambioNuevo

                        constCotizacionesProductosNewLines[j].dataValues.prod_precioPromocionCambio = prod_precioPromocionCambio
                        constCotizacionesProductosNewLines[j].dataValues.prod_precioPromocionCambioAnterior = prod_precioPromocionCambioAnterior
                        constCotizacionesProductosNewLines[j].dataValues.prod_precioPromocionCambioNuevo = prod_precioPromocionCambioNuevo
                    }
                    else
                    {
                        constCotizacionesProductosNewLines[j].dataValues.prod_precioPromocionCambio = prod_precioPromocionCambio
                        constCotizacionesProductosNewLines[j].dataValues.prod_precioPromocionCambioAnterior = prod_precioPromocionCambioAnterior
                        constCotizacionesProductosNewLines[j].dataValues.prod_precioPromocionCambioNuevo = prod_precioPromocionCambioNuevo
                        
                    }
                }
                //fin Validar linea por linea
            }

            var cotizacionSetReturn = await cotizacionesUtils.cotizacionSetTotalsByID(req.params.id);

















            //Get detalle cotizacion base
                const constCotizacionesFinal = await models.Cotizaciones.findOne(
                {
                    where: {
                        cot_cotizacion_id: req.params.id
                    },
                });

                //Cotizacion productos
                const constCotizacionesProductosFinal = await models.CotizacionesProductos.findAll(
                {
                    where: {
                        cotp_cotizacion_id: constCotizaciones.cot_cotizacion_id
                    },
                    order: [
                        ['cotp_cotizaciones_productos_id', 'ASC']
                    ],
                });
            //fin Get detalle cotizacion base

            res.status(200).send({
                message: 'todo bien',
                // productos,
                // Permitir_Cambiar_Precios_O_Descuentos,
                constCotizaciones,
                constCotizacionesProductos,
                constCotizacionesProductosNewLines,
                // constCotizacionesFinal,
                // constCotizacionesProductosFinal
            })

        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    //Hace update a la cotizacion en general (informacion)
    V3updateTerminosYCondiciones: async(req, res, next) =>{
        try{
            const constCotizacion = await models.Cotizaciones.findOne({
                where: {
                    cot_cotizacion_id: req.body.cot_cotizacion_id
                }
            });

            var actualizacion = await constCotizacion.update({
                cot_terminos_y_condiciones: !!req.body.cot_terminos_y_condiciones ? req.body.cot_terminos_y_condiciones : constCotizacion.dataValues.cot_terminos_y_condiciones,
                updatedAt: Date()
            });

            res.status(200).send({
                message: 'Actualización correcta',
                actualizacion
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    //Crea la cotizacion de SN o Prospecto ORIGINAL, fui movida a cotizacionUtils y se llamara como api interna
    V4updateCotizacionInicio: async (req, res, next)  =>{
        
        try{
            var response = await cotizacionesUtils.cotizacionesUpdateAutomaticoService(req.params.id, null, false);

            res.status(200).send({
                message: 'Error en la petición',
                response
            });
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },



    //Actualiza las cantidades de las lineas, esta api deberia utilizarse solo para el editar cotizacion
    V3UpdateLineasCantidades: async (req, res, next)  =>{
        try{





            var response = await cotizacionesUtils.cotizacionesUpdateAutomaticoService(req.body.cot_cotizacion_id, req.body.productos, true);











            res.status(200).send({
                message: 'Error en la petición',
                response
            });
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },





    //Actualiza las cantidades de las lineas, esta api deberia utilizarse solo para el editar cotizacion
    V3UpdateLineasDescuentoVendedor: async (req, res, next)  =>{
        try{





            var response = await cotizacionesUtils.cotizacionesUpdateAutomaticoService(req.body.cot_cotizacion_id, req.body.productos, true);











            res.status(200).send({
                message: 'Error en la petición',
                response
            });
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    }



};