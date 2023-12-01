import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import conekta from 'conekta';
const { pagoAceptado } = require('../services/pagoAceptadoEmail');
const { pagoRechazado } = require('../services/pagoRechazadoEmail')
import getCheckout from "../services/checkoutAPI";
import {pruebaTester} from "../services/pruebaTester"
export default {
   

    conektaTesting: async(req, res, next) =>{
        try
        {
            // conekta.api_key = 'key_8RztYbWJrMy4QZymssBchQ';
            // conekta.locale = 'es';

            var conekta = require('conekta');

            conekta.api_key = 'key_7grxzxkWD6NdCs3JnX9EkQ';
            conekta.locale = 'es';

            conekta.Order.create({
              "currency": "MXN",
              "customer_info": {
                "name": "Henry Kishi",
                "phone": "6621673823",
                "email": "henry@puntocommerce.com"
              },
              "line_items": [{
                "name": "kakatua",
                "unit_price": 1000,
                "quantity": 10
              }],
              "charges": [{
                "payment_method": {
                  "type": "card",
                  "token_id": "tok_test_mastercard_4444"
                }
              }]
            }).then(function (result) {
              console.log(result.toObject().charges.data)
            }, function (error) {
              console.log(error)
            })
















            res.status(200).send(
            {
                message: 'End of testing'
            })
        }
        catch(e)
        {
            res.status(500).send(
            {
              message: 'error testing',
              e
            });
            next(e);
        }
    },


    getConektaPublicKey: async(req, res, next) =>{
        try{
            const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_nombre: "CONEKTA_KEY_PUBLIC"
                },
                attributes: ["cmm_valor"]
            });


            res.status(200).send({
                message: 'Obtenido correctamente',
                constControlMaestroMultiple
            })


        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },


    getConektaPrivateKey: async(req, res, next) =>{
        try{
            const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_nombre: "CONEKTA_KEY_PRIVATE"
                },
                attributes: ["cmm_valor"]
            });

            res.status(200).send({
                message: 'Obtenido correctamente',
                constControlMaestroMultiple
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },


    updatePublicKey: async(req, res, next) =>{
        try{
            const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_nombre: "CONEKTA_KEY_PUBLIC"
                }
            });

            console.log(constControlMaestroMultiple)

            await constControlMaestroMultiple.update({
                cmm_valor : !!req.body.cmm_valor ? req.body.cmm_valor : constControlMaestroMultiple.dataValues.cmm_valor,
                cmm_usu_usuario_modificado_por_id : !!req.body.cmm_usu_usuario_modificado_por_id ? req.body.cmm_usu_usuario_modificado_por_id : constControlMaestroMultiple.dataValues.cmm_usu_usuario_modificado_por_id,
                updatedAt: Date()
            });

            res.status(200).send({
                message: 'Actualización correcta',
                constControlMaestroMultiple
            })

        }catch(e){
            res.status(500).send({
                message: 'Error al actualizar el almacen',
                error: e
            });
            next(e);
        }
    },

    updatePrivateKey: async(req, res, next) =>{
        try{
            const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_nombre: "CONEKTA_KEY_PRIVATE"
                }
            });

            console.log(constControlMaestroMultiple)

            await constControlMaestroMultiple.update({
                cmm_valor : !!req.body.cmm_valor ? req.body.cmm_valor : constControlMaestroMultiple.dataValues.cmm_valor,
                cmm_usu_usuario_modificado_por_id : !!req.body.cmm_usu_usuario_modificado_por_id ? req.body.cmm_usu_usuario_modificado_por_id : constControlMaestroMultiple.dataValues.cmm_usu_usuario_modificado_por_id,
                updatedAt: Date()
            });

            res.status(200).send({
                message: 'Actualización correcta',
                constControlMaestroMultiple
            })

        }catch(e){
            res.status(500).send({
                message: 'Error al actualizar el almacen',
                error: e
            });
            next(e);
        }
    },



    conektaDevoluciones: async(req, res, next) =>{
        try{
            var razon_devolucion = req.body.razon_devolucion
            const constCompraFinalizada = await models.CompraFinalizada.findOne(
            {
                where: {
                    cf_compra_finalizada_id: req.body.cf_compra_finalizada_id
                }
            });

            const constConektaPagos = await models.ConektaPagos.findOne(
            {
                where: {
                    cnk_cdc_numero_orden: constCompraFinalizada.cf_compra_numero_orden,
                    cnk_estatus_pago: "paid"
                }
            });

            var orderFind

            if(constConektaPagos)
            {
                var conekta = require('conekta');
                //Obtener private key
                const constControlMaestroMultiplePrivateKey = await models.ControlMaestroMultiple.findOne(
                {
                    where: {
                        cmm_nombre: "CONEKTA_KEY_PRIVATE"
                    }
                });
                conekta.api_key = constControlMaestroMultiplePrivateKey.cmm_valor
                conekta.locale = 'es';
                conekta.api_version = '2.0.0';


                conekta.Order.find(constConektaPagos.cnk_conekta_order_id, function(err, order) {
                    order.createRefund({
                        "reason": razon_devolucion,
                        "amount": constConektaPagos.cnk_amount_devolucion
                    }, function(err, res) {
                        if(err)
                        {
                            console.log(err.details[0].message)



                            const bodyCreate = 
                            {
                                "cnkd_cdc_numero_orden": constCompraFinalizada.cf_compra_numero_orden,
                                "cnkd_respuesta": err,
                                "cnkd_usu_usuario_creador_id": 1,
                                "cnkd_conekta_error_message": err.details[0].message,
                                "cnkd_conekta_status": null
                            }

                            models.ConektaPagosDevoluciones.create(bodyCreate);


                        }
                        else
                        {
                            console.log(res.payment_status)


                            const bodyCreate = 
                            {
                                "cnkd_cdc_numero_orden": constCompraFinalizada.cf_compra_numero_orden,
                                "cnkd_respuesta": res,
                                "cnkd_usu_usuario_creador_id": 1,
                                "cnkd_conekta_error_message": null,
                                "cnkd_conekta_status": res.payment_status
                            }

                            models.ConektaPagosDevoluciones.create(bodyCreate);



                        }
                    });
                });





                // var conektaOrderId = constConektaPagos.cnk_conekta_order_id
                // console.log(conektaOrderId)


                // conekta.Order.find(conektaOrderId, function(err, order) {
                //     order.createRefund({
                //         "reason": razon_devolucion,
                //         "amount": 1000
                //     }, function(err, res) {
                //         console.log(res);
                //     });
                // });

              



            }



            res.status(200).send({
                message: 'Actualización correcta',
                orderFind
            })

        }catch(e){
            res.status(500).send({
                message: 'Error al actualizar el almacen',
                error: e
            });
            next(e);
        }
    },
    conektaGetDevoluciones: async(req, res, next) =>{
        try{
            const constCompraFinalizada = await models.CompraFinalizada.findOne(
            {
                where: {
                    cf_compra_finalizada_id: req.params.id
                }
            });


            const constConektaPagosDevoluciones = await models.ConektaPagosDevoluciones.findOne(
            {
                where: {
                    cnkd_cdc_numero_orden: constCompraFinalizada.cf_compra_numero_orden
                }
            });


            res.status(200).send({
                message: 'Lista de Almacenes',
                constConektaPagosDevoluciones
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },



    conektaCrearOrden: async(req, res, next) =>{
      try
      {
        var conekta = require('conekta');
        
        var Token_ID = req.body.token_ID

        //API PRUEBAS DIELSA key_8RztYbWJrMy4QZymssBchQ
        // conekta.api_key = 'key_8RztYbWJrMy4QZymssBchQ';


        //Obtener private key
        const constControlMaestroMultiplePrivateKey = await models.ControlMaestroMultiple.findOne(
        {
            where: {
                cmm_nombre: "CONEKTA_KEY_PRIVATE"
            }
        });


        // conekta.api_key = 'key_7grxzxkWD6NdCs3JnX9EkQ';
        conekta.api_key = constControlMaestroMultiplePrivateKey.cmm_valor
        console.log(constControlMaestroMultiplePrivateKey.cmm_valor)
        conekta.locale = 'es';
        conekta.api_version = '2.0.0';


        var token_id_card = req.body.token_id
        var cdc_sn_socio_de_negocio_id = req.body.cdc_sn_socio_de_negocio_id



        //Obtener informacion del Socio de Negocio
        const constSociosNegocio = await models.SociosNegocio.findOne(
        {
            where: {
                sn_socios_negocio_id: cdc_sn_socio_de_negocio_id
            }
        })

        // //validar email de facturacion para conekta (VIEJO obtener super user de un SNU)
        // const constSociosNegocioUsuario = await models.SociosNegocioUsuario.findOne({
        //     where: {
        //         snu_cardcode: constSociosNegocio.sn_cardcode,
        //         snu_super_usuario: true
        //     }
        // });

        //Nuevo obtener el id del que esta comprando SNU
        const constSociosNegocioUsuario = await models.SociosNegocioUsuario.findOne({
            where: {
                snu_usuario_snu_id: req.body.snu_usuario_snu_id
            }
        });

      
        //Obtener carrito
        const constCarritoDeCompra = await models.CarritoDeCompra.findOne(
        {
            where: {
                cdc_sn_socio_de_negocio_id: cdc_sn_socio_de_negocio_id
            }
        })

        
        //Productos del carrito de compra
        const constProductoCarritoDeCompra = await models.ProductoCarritoDeCompra.findAll(
        {
            where: {
                pcdc_carrito_de_compra_id: constCarritoDeCompra.cdc_carrito_de_compra_id
            },
            attributes: {
                exclude: ['createdAt','updatedAt','pcdc_lista_precio','pcdc_precio','pcdc_prod_producto_id_regalo','pcdc_cantidad_producto_regalo',
                'pcdc_descuento_promocion', 'pcdc_prod_producto_id_promocion', 'pcdc_cantidad_producto_promocion', 'pcdc_cupon_aplicado',
                'pcdc_mejor_descuento', 'pcdc_almacen_surtido', 'pcdc_no_disponible_para_compra', 'pcdc_back_order', 'pcdc_validado']
            }
        })

        var checkoutJson = await getCheckout.getCheckoutAPI2(cdc_sn_socio_de_negocio_id) 

       pruebaTester(JSON.stringify(checkoutJson))
        var productos = checkoutJson.dataValues.productos

        var array = []


        for (var i = 0; i < productos.length; i++) 
        {
            if(productos[i].dataValues.projectProductPriceFinalImpuestos){
           productos[i].dataValues.projectProductPriceFinalImpuestos= (productos[i].dataValues.projectProductPriceFinalImpuestos==0? 
           productos[i].dataValues.projectProductPriceUSDFinalImpuestos : productos[i].dataValues.projectProductPriceFinalImpuestos)
            }

          let newPrice =(productos[i].dataValues.projectProductPriceFinalImpuestos&& (productos[i].dataValues.projectProductPriceFinalImpuestos < productos[i].dataValues.precioFinalMasImpuesto || productos[i].dataValues.precioFinalMasImpuesto ==0)? productos[i].dataValues.projectProductPriceFinalImpuestos: productos[i].dataValues.precioFinalMasImpuesto)
          var priceWithoutDot = newPrice.toFixed(2).split('.').join("");

          var body = {
            "name": productos[i].dataValues.prod_nombre,
            "unit_price": priceWithoutDot,
            "quantity": productos[i].dataValues.pcdc_producto_cantidad
          }
          array.push(body)
        }



        //obtener tipo impuesto cmm
        const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
        {
            where: {
                cmm_control_id: checkoutJson.dataValues.cdc_cmm_tipo_envio_id
            }
        })


        if(constControlMaestroMultiple.cmm_valor == 'Envío domicilio')
        {

          var priceWithoutDot = checkoutJson.dataValues.costoEnvioMasImpuesto.toFixed(2).split('.').join("");

          var body = {
            "name": "COSTO DE ENVÍO",
            "unit_price": priceWithoutDot,
            "quantity": 1
          }
          array.push(body)
        }


        
        //EmailFinal
        var existeEmail = true
        var EmailFinal = ''

        if(constSociosNegocio.sn_email_facturacion == null || constSociosNegocio.sn_email_facturacion == '')
        {
            existeEmail = false
        }
        else
        {
            EmailFinal = constSociosNegocio.sn_email_facturacion
        }


        if(existeEmail == false)
        {
            if(constSociosNegocioUsuario)
            {
                if(constSociosNegocioUsuario.snu_correo_electronico != '' && constSociosNegocioUsuario.snu_correo_electronico != null)
                {
                    existeEmail = true
                    EmailFinal = constSociosNegocioUsuario.snu_correo_electronico
                }
            }
        }








        var pagado = false;

        var order = await conekta.Order.create({
            "line_items": array,
            "currency": "MXN",
            "shipping_lines":
            [
              {
                 "amount": 0, //Envio gratis = cero, de lo contrario, costo del envio
                 "carrier": "Fedex",
              }
            ],
            "customer_info": 
            {
              'name': constSociosNegocio.sn_razon_social,
              'email': EmailFinal,
              'phone': "0000000000"
            },
            "shipping_contact":
            {
                "receiver":"Cliente",
                "phone":"5555555555",
                "between_streets": "no street",
                "address":
                {
                    "street1":"CALLE Y EXTERIOR",
                    "city":"CDMX",
                    "state":"CDMX",
                    "country":"mx",
                    "residential":true,
                    "object":"shipping_address",
                    "postal_code":"06100"
                }
            },
            "metadata": 
            { 
              "description": checkoutJson.dataValues.cdc_numero_orden, 
              "reference": checkoutJson.dataValues.cdc_numero_orden
            },
            "charges":
            [
            {
              "payment_method": 
              {
                // 'monthly_installments': 3, //optional 
                'type': 'card',
                'token_id': token_id_card
              } 
            }]
        }).then(function (result) {
            //pruebaTester(JSON.stringify(result))
          pagado = true
          console.log(result.toObject().charges.data)
          return result.toObject()
        }, function (error) {
          console.log(error)
          //pruebaTester(JSON.stringify(error))
          return error
        })

        // var order = await conekta.Order.create({
        //   "line_items": array,
        //     "currency": "MXN",
        //     "customer_info": 
        //     {
        //       'name': constSociosNegocio.sn_razon_social,
        //       'email': EmailFinal,
        //       'phone': "0000000000"
        //     },
        //     "metadata": 
        //     { 
        //       "description": checkoutJson.dataValues.cdc_numero_orden, 
        //       "reference": checkoutJson.dataValues.cdc_numero_orden
        //     },
        //     "charges":[
        //     {
        //       "payment_method": 
        //       {
        //         // 'monthly_installments': 3, //optional 
        //         'type': 'card',
        //         'token_id': token_id_card
        //       } 
        //     }]
        // }).then(function (result) {
        //   pagado = true
        //   console.log(result.toObject().charges.data)
        //   return result.toObject()
        // }, function (error) {
        //   console.log(error)
        //   return error
        // })









        if(pagado == true)
        {
          const responseConekta = order;

          //Crea un historial de cuando se hizo el pago incluso si falla
          const bodyCreate = 
          {
              "cnk_cdc_numero_orden": checkoutJson.dataValues.cdc_numero_orden,
              "cnk_respuesta": responseConekta,
              "cnk_usu_usuario_creador_id": 1,
              "cnk_estatus_pago": responseConekta.payment_status,
              "cnk_amount_devolucion": responseConekta.amount,
              "cnk_conekta_order_id": responseConekta.id
          }

          await models.ConektaPagos.create(bodyCreate);


          const paymentMethod = order.charges.data
          var tipoTarjetaCodigoSAP
          //Genera el codigo de forma de pago para el carrito
          if(paymentMethod[0].payment_method.type == "debit")
          {
              const constSapFormasPago = await models.SapFormasPago.findOne(
              {
                  where: {
                      sfp_descripcion: "Tarjeta de débito"
                  }
              })

              tipoTarjetaCodigoSAP = constSapFormasPago.sfp_clave
          }
          else
          {
              const constSapFormasPago = await models.SapFormasPago.findOne(
              {
                  where: {
                      sfp_descripcion: "Tarjeta de crédito"
                  }
              })

              tipoTarjetaCodigoSAP = constSapFormasPago.sfp_clave
          }

          await constCarritoDeCompra.update({
              cdc_forma_pago_codigo : tipoTarjetaCodigoSAP,
              updatedAt: Date()
          });



          // await pagoAceptado(constSociosNegocioUsuario.snu_correo_electronico, usuario_sn_id, checkoutJson.dataValues.cdc_numero_orden);
          await pagoAceptado("informatica@dielsa.com", constSociosNegocioUsuario.dataValues.snu_usuario_snu_id, checkoutJson.dataValues.cdc_numero_orden, checkoutJson);
          //await pagoAceptado("gabriel@puntocommerce.com", constSociosNegocioUsuario.dataValues.snu_usuario_snu_id, checkoutJson.dataValues.cdc_numero_orden, checkoutJson);
          // console.log("paso el await")

          

          


          res.status(200).send(
          {
            message: 'Transacción Exitosa',
            result: responseConekta.payment_status
          })  
        }
        else
        {
          const bodyCreate = 
          {
              "cnk_cdc_numero_orden": checkoutJson.dataValues.cdc_numero_orden,
              "cnk_respuesta": order,
              "cnk_usu_usuario_creador_id": 1,
              "cnk_estatus_pago": order.details[0].message,
              "cnk_amount_devolucion": null,
              "cnk_conekta_order_id": order.data.id
          }
          models.ConektaPagos.create(bodyCreate);

          // await pagoRechazado(constSociosNegocioUsuario.snu_correo_electronico);
          await pagoRechazado(constSociosNegocioUsuario.dataValues.snu_usuario_snu_id);

          res.status(200).send(
          {
            message: 'Transacción declinada',
            err: order.details[0].message
          })
        }


          //     Si la orden fue exitosa la consola debería imprimir lo siguiente respuesta:
          //     console.log(res.toObject());
          //     console.log("ID: " + res.toObject().id);
          //     console.log("Status: " + res.toObject().payment_status);
          //     console.log("$" + (res.toObject().amount/100) + res.toObject().currency);
          //     console.log("Order");
          //     console.log(res.toObject().line_items.data[0].quantity + " - "
          //         + res.toObject().line_items.data[0].name + " - "
          //         + (res.toObject().line_items.data[0].unit_price/100));
          //     console.log("Payment info");
          //     console.log("Code: " + res.toObject().charges.data[0].payment_method.auth_code);
          //     console.log("Card info: "
          //           + res.toObject().charges.data[0].payment_method.name + " - "
          //           + res.toObject().charges.data[0].payment_method.last4 + " - "
          //           + res.toObject().charges.data[0].payment_method.brand + " - "
          //           + res.toObject().charges.data[0].payment_method.type);

      }
      catch(e)
      {
          console.log(e)
          res.status(500).send(
          {
            message: 'error testing',
            e
          });
          next(e);
      }
    }
}