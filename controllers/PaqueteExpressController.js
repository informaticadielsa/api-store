import models from '../models';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
import request from 'request-promise';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import statusControlesMaestros from '../mapeos/mapeoControlesMaestrosMultiples';
export default{




    CotizarCarrito: async(req, res, next) =>{
        try{
            //Variable con el id del carrito
            var carrito_id = req.body.cdc_carrito_de_compra_id
            var direccion_sn_id = req.body.snd_direcciones_id

            //Obtener todos los productos del carrito
            const constProductoCarritoDeCompra = await models.ProductoCarritoDeCompra.findAll(
            {
                where: {
                    pcdc_carrito_de_compra_id: carrito_id
                },
                attributes: ['pcdc_prod_producto_id', 'pcdc_producto_cantidad'],
                include: [
                    {
                        model: models.Producto,
                        attributes: ['prod_altura', 'prod_ancho', 'prod_longitud', 'prod_peso', 'prod_volumen']
                    }
                ]
            });

            //Variable que determina si el envio es gratis porque ninguna dimension del paquete es mayor a 1m
            var envioGratis = true;

            //Proceso que determina si es envio gratis
            for (var i = 0; i < constProductoCarritoDeCompra.length; i++)
            {
                if(
                    constProductoCarritoDeCompra[i].dataValues.producto.prod_altura > 1 ||
                    constProductoCarritoDeCompra[i].dataValues.producto.prod_ancho > 1 ||
                    constProductoCarritoDeCompra[i].dataValues.producto.prod_longitud > 1
                  )
                {
                    envioGratis = false
                }
            }


            if(envioGratis == false)
            {
                var precioFinal = 0
                var volumenTotal = 0
                var pesoTotal = 0

                //obtener volumen total y peso
                for (var i = 0; i < constProductoCarritoDeCompra.length; i++)
                {
                    //Volumen total (como ya viene de integracion el volumen no se calcula)
                    volumenTotal += (constProductoCarritoDeCompra[i].dataValues.producto.prod_volumen * constProductoCarritoDeCompra[i].dataValues.pcdc_producto_cantidad)
                    
                    //Peso total
                    pesoTotal += (constProductoCarritoDeCompra[i].dataValues.producto.prod_peso * constProductoCarritoDeCompra[i].dataValues.pcdc_producto_cantidad)
                }


                //Obtener informacion de direccion de envio
                const constSociosNegocioDirecciones = await models.SociosNegocioDirecciones.findOne(
                {
                    where: {
                        snd_direcciones_id: direccion_sn_id
                    }
                });

                var dividirEnvio = false
                var dividirValue = 1

                var contadorFinal = 2
                if(pesoTotal > 5000 || volumenTotal > 20)
                {
                    dividirEnvio = true
                    
                    var pesoTemporal = pesoTotal
                    var volumenTemporal = volumenTotal

                    //Mientras sea mayor que esas cantidad seguira iterando hasta tener un numero por el cual dividir una orden
                    while(pesoTemporal > 5000 || volumenTemporal > 20)
                    {
                        if((pesoTemporal/contadorFinal) < 5000 && (volumenTemporal/contadorFinal) < 20)
                        {
                            break;
                        }

                        contadorFinal++

                        if(contadorFinal == 50)
                        {
                            break;
                        }
                    }
                }


                var almacenCP = ''
                var almacenColonia = ''

                const constSociosNegocioDirecciones2 = await models.SociosNegocioDirecciones.findOne(
                {
                    where: {
                        snd_direcciones_id: req.body.snd_direcciones_id
                    }
                });

                if(constSociosNegocioDirecciones2)
                {
                    //Obtener Estado Nombre
                    const constEstado2 = await models.Estado.findOne(
                    {
                        where: {
                            estpa_estado_pais_id: constSociosNegocioDirecciones2.snd_estado_id
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
                    const constAlmacenesColonia = await models.Almacenes.findOne(
                    {
                        where: {
                            alm_codigoAlmacen: AlmacenesLogistica.almlog_almacen_codigo
                        }
                    });

                    almacenCP = constAlmacenesColonia.alm_codigo_postal
                    almacenColonia = constAlmacenesColonia.alm_nombre
                }
               



                //Si la orden se dividio al final va a multiplicar la orden dividida por la cantidad amount para obtener el total
                if(dividirEnvio == true)
                {
                    //json que se mandara a la api
                    volumenTotal = volumenTotal/contadorFinal
                    pesoTotal = pesoTotal/contadorFinal

                    var options = 
                    {
                        'method': 'POST',
                        'url': 'http://qaglp.paquetexpress.mx:7007/WsQuotePaquetexpress/api/apiQuoter/v2/getQuotation',
                        'headers': {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(
                        {
                           "header": {
                                "security": {
                                    "user": "WSDISTENELEC",
                                    "password": "1234",
                                    "type": 1,
                                    "token": "C3BC017308C7022EE053350AA8C09D76"
                                },
                                "device": {
                                    "appName": "Customer",
                                    "type": "Web",
                                    "ip": "",
                                    "idDevice": ""
                                },
                                "target": {
                                    "module": "QUOTER",
                                    "version": "1.0",
                                    "service": "quoter",
                                    "uri": "quotes",
                                    "event": "R"
                                },
                                "output": "JSON",
                                "language": null
                            },
                            "body": {
                                "request": {
                                    "data": {
                                        "clientAddrOrig": {
                                            "zipCode": almacenCP,
                                            "colonyName": almacenColonia
                                        },
                                        "clientAddrDest": {
                                            "zipCode": constSociosNegocioDirecciones.snd_codigo_postal,
                                            "colonyName": constSociosNegocioDirecciones.snd_colonia
                                        },
                                        "services": {
                                            "dlvyType": "1",
                                            "ackType": "N",
                                            "totlDeclVlue": 0,
                                            "invType": "N",
                                            "radType": "0"
                                        },
                                        "otherServices": {
                                            "otherServices": []
                                        },
                                        "shipmentDetail": {
                                            "shipments": [
                                                {
                                                    "sequence": 1,
                                                    "quantity": 1,
                                                    "shpCode": "11",
                                                    "weight": pesoTotal,
                                                    "volume": volumenTotal,
                                                    // "longShip":20,
                                                    // "widthShip":30,
                                                    // "highShip":40
                                                }
                                            ]
                                        },
                                        "quoteServices":[  
                                        "ST"
                                        ]
                                    },
                                    "objectDTO": null
                                },
                                "response": null
                            }
                        })
                    }


                    var result = await request(options, function (error, response) {
                        if (error) throw new Error(error);
                        
                    });

                    var resultJson = JSON.parse(result);

                    //Si la variable existe significa que si jalo la cotizacion
                    if(typeof resultJson.body.response.data.quotations[0].amount.totalAmnt !== 'undefined') 
                    {
                        precioFinal = (resultJson.body.response.data.quotations[0].amount.totalAmnt) * contadorFinal
                    }
                    else
                    {
                        precioFinal = "Paquete Express no disponible"
                    }
                    console.log(options)
                    //console.log(resultJson.body.response.data.quotations[0].amount.totalAmnt)
                    
                }
                else
                {
                    //json que se mandara a la api
                    var options = 
                    {
                        'method': 'POST',
                        'url': 'http://qaglp.paquetexpress.mx:7007/WsQuotePaquetexpress/api/apiQuoter/v2/getQuotation',
                        'headers': {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(
                        {
                           "header": {
                                "security": {
                                    "user": "WSDISTENELEC",
                                    "password": "1234",
                                    "type": 1,
                                    "token": "C3BC017308C7022EE053350AA8C09D76"
                                },
                                "device": {
                                    "appName": "Customer",
                                    "type": "Web",
                                    "ip": "",
                                    "idDevice": ""
                                },
                                "target": {
                                    "module": "QUOTER",
                                    "version": "1.0",
                                    "service": "quoter",
                                    "uri": "quotes",
                                    "event": "R"
                                },
                                "output": "JSON",
                                "language": null
                            },
                            "body": {
                                "request": {
                                    "data": {
                                        "clientAddrOrig": {
                                            "zipCode": almacenCP,
                                            "colonyName": almacenColonia
                                        },
                                        "clientAddrDest": {
                                            "zipCode": constSociosNegocioDirecciones.snd_codigo_postal,
                                            "colonyName": constSociosNegocioDirecciones.snd_colonia
                                        },
                                        "services": {
                                            "dlvyType": "1",
                                            "ackType": "N",
                                            "totlDeclVlue": 0,
                                            "invType": "N",
                                            "radType": "0"
                                        },
                                        "otherServices": {
                                            "otherServices": []
                                        },
                                        "shipmentDetail": {
                                            "shipments": [
                                                {
                                                    "sequence": 1,
                                                    "quantity": 1,
                                                    "shpCode": "11",
                                                    "weight": pesoTotal,
                                                    "volume": volumenTotal,
                                                    // "longShip":20,
                                                    // "widthShip":30,
                                                    // "highShip":40
                                                }
                                            ]
                                        },
                                        "quoteServices":[  
                                        "ST"
                                        ]
                                    },
                                    "objectDTO": null
                                },
                                "response": null
                            }
                        })
                    }
                    
                    console.log("paso por aqui")
                    console.log(options)

                    var result = await request(options, function (error, response) {
                        if (error) throw new Error(error);
                        
                    });

                    var resultJson = JSON.parse(result);

                    //Si la variable existe significa que si jalo la cotizacion
                    if(typeof resultJson.body.response.data.quotations[0].amount.totalAmnt !== 'undefined') 
                    {
                        precioFinal = resultJson.body.response.data.quotations[0].amount.totalAmnt
                    }
                    else
                    {
                        precioFinal = "Paquete Express no disponible"
                    }

                }


                res.status(200).send({
                    message: 'Paquete express',
                    costoEnvio: precioFinal,
                    tipo_envio: 'Pago'
                })
            }
            //Regresa respuesta de que el envio es gratis porque ningun producto supero el metro de cm (sujeto a cambios)
            else
            {
                res.status(200).send({
                    message: 'Paquete express',
                    costoEnvio: 0,
                    tipo_envio: 'Gratis'
                })
            }


            
        }catch(e){
            res.status(200).send({
                message: 'Paquete Express no disponible',
                costoEnvio: 0,
                tipo_envio: 'No disponible'
            });
            next(e);
        }
    },
    CrearGuia: async(req, res, next) =>{
        try{

            //Variable con el id del carrito
            var carrito_id = req.body.cdc_carrito_de_compra_id
            var direccion_sn_id = req.body.snd_direcciones_id

            //Obtener todos los productos del carrito
            const constProductoCarritoDeCompra = await models.ProductoCarritoDeCompra.findAll(
            {
                where: {
                    pcdc_carrito_de_compra_id: carrito_id
                },
                attributes: ['pcdc_prod_producto_id', 'pcdc_producto_cantidad'],
                include: [
                    {
                        model: models.Producto,
                        attributes: ['prod_altura', 'prod_ancho', 'prod_longitud', 'prod_peso', 'prod_volumen']
                    }
                ]
            });

            //Variable que determina si el envio es gratis porque ninguna dimension del paquete es mayor a 1m
            var envioGratis = true;

            //Proceso que determina si es envio gratis
            for (var i = 0; i < constProductoCarritoDeCompra.length; i++)
            {
                if(
                    constProductoCarritoDeCompra[i].dataValues.producto.prod_altura > 1 ||
                    constProductoCarritoDeCompra[i].dataValues.producto.prod_ancho > 1 ||
                    constProductoCarritoDeCompra[i].dataValues.producto.prod_longitud > 1
                  )
                {
                    envioGratis = false
                }
            }


            if(envioGratis == false)
            {
                var precioFinal = 0
                var volumenTotal = 0
                var pesoTotal = 0

                //obtener volumen total y peso
                for (var i = 0; i < constProductoCarritoDeCompra.length; i++)
                {
                    //Volumen total (como ya viene de integracion el volumen no se calcula)
                    volumenTotal += (constProductoCarritoDeCompra[i].dataValues.producto.prod_volumen * constProductoCarritoDeCompra[i].dataValues.pcdc_producto_cantidad)
                    
                    //Peso total
                    pesoTotal += (constProductoCarritoDeCompra[i].dataValues.producto.prod_peso * constProductoCarritoDeCompra[i].dataValues.pcdc_producto_cantidad)
                }


                //Obtener informacion de direccion de envio
                const constSociosNegocioDirecciones = await models.SociosNegocioDirecciones.findOne(
                {
                    where: {
                        snd_direcciones_id: direccion_sn_id
                    }
                });

                var dividirEnvio = false
                var dividirValue = 1

                var contadorFinal = 2
                if(pesoTotal > 5000 || volumenTotal > 20)
                {
                    dividirEnvio = true
                    
                    var pesoTemporal = pesoTotal
                    var volumenTemporal = volumenTotal

                    //Mientras sea mayor que esas cantidad seguira iterando hasta tener un numero por el cual dividir una orden
                    while(pesoTemporal > 5000 || volumenTemporal > 20)
                    {
                        if((pesoTemporal/contadorFinal) < 5000 && (volumenTemporal/contadorFinal) < 20)
                        {
                            break;
                        }

                        contadorFinal++

                        if(contadorFinal == 50)
                        {
                            break;
                        }
                    }
                }






                //Si la orden se dividio al final va a multiplicar la orden dividida por la cantidad amount para obtener el total
                if(dividirEnvio == true)
                {
                    //json que se mandara a la api
                    volumenTotal = volumenTotal/contadorFinal
                    pesoTotal = pesoTotal/contadorFinal

                    var options = 
                    {
                        'method': 'POST',
                        'url': 'http://qaglp.paquetexpress.mx:7007/WsQuotePaquetexpress/api/apiQuoter/v2/getQuotation',
                        'headers': {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(
                        {
                           "header": {
                                "security": {
                                    "user": "WSDISTENELEC",
                                    "password": "1234",
                                    "type": 1,
                                    "token": "C3BC017308C7022EE053350AA8C09D76"
                                },
                                "device": {
                                    "appName": "Customer",
                                    "type": "Web",
                                    "ip": "",
                                    "idDevice": ""
                                },
                                "target": {
                                    "module": "QUOTER",
                                    "version": "1.0",
                                    "service": "quoter",
                                    "uri": "quotes",
                                    "event": "R"
                                },
                                "output": "JSON",
                                "language": null
                            },
                            "body": {
                                "request": {
                                    "data": {
                                        "clientAddrOrig": {
                                            "zipCode": "51950",
                                            "colonyName": "PORTON DE SUEÑO"
                                        },
                                        "clientAddrDest": {
                                            "zipCode": constSociosNegocioDirecciones.snd_codigo_postal,
                                            "colonyName": constSociosNegocioDirecciones.snd_colonia
                                        },
                                        "services": {
                                            "dlvyType": "1",
                                            "ackType": "N",
                                            "totlDeclVlue": 0,
                                            "invType": "N",
                                            "radType": "0"
                                        },
                                        "otherServices": {
                                            "otherServices": []
                                        },
                                        "shipmentDetail": {
                                            "shipments": [
                                                {
                                                    "sequence": 1,
                                                    "quantity": 1,
                                                    "shpCode": "11",
                                                    "weight": pesoTotal,
                                                    "volume": volumenTotal,
                                                    // "longShip":20,
                                                    // "widthShip":30,
                                                    // "highShip":40
                                                }
                                            ]
                                        },
                                        "quoteServices":[  
                                        "ST"
                                        ]
                                    },
                                    "objectDTO": null
                                },
                                "response": null
                            }
                        })
                    }

                    var result = await request(options, function (error, response) {
                        if (error) throw new Error(error);
                        
                    });

                    var resultJson = JSON.parse(result);

                    //Si la variable existe significa que si jalo la cotizacion
                    if(typeof resultJson.body.response.data.quotations[0].amount.totalAmnt !== 'undefined') 
                    {
                        precioFinal = (resultJson.body.response.data.quotations[0].amount.totalAmnt) * contadorFinal
                    }
                    else
                    {
                        precioFinal = "Paquete Express no disponible"
                    }
                    console.log(options)
                    //console.log(resultJson.body.response.data.quotations[0].amount.totalAmnt)
                    
                }
                else
                {
                    //json que se mandara a la api
                    var options = 
                    {
                        'method': 'POST',
                        'url': 'http://qaglp.paquetexpress.mx:7007/WsQuotePaquetexpress/api/apiQuoter/v2/getQuotation',
                        'headers': {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(
                        {
                           "header": {
                                "security": {
                                    "user": "WSDISTENELEC",
                                    "password": "1234",
                                    "type": 1,
                                    "token": "C3BC017308C7022EE053350AA8C09D76"
                                },
                                "device": {
                                    "appName": "Customer",
                                    "type": "Web",
                                    "ip": "",
                                    "idDevice": ""
                                },
                                "target": {
                                    "module": "QUOTER",
                                    "version": "1.0",
                                    "service": "quoter",
                                    "uri": "quotes",
                                    "event": "R"
                                },
                                "output": "JSON",
                                "language": null
                            },
                            "body": {
                                "request": {
                                    "data": {
                                        "clientAddrOrig": {
                                            "zipCode": "51950",
                                            "colonyName": "PORTON DE SUEÑO"
                                        },
                                        "clientAddrDest": {
                                            "zipCode": constSociosNegocioDirecciones.snd_codigo_postal,
                                            "colonyName": constSociosNegocioDirecciones.snd_colonia
                                        },
                                        "services": {
                                            "dlvyType": "1",
                                            "ackType": "N",
                                            "totlDeclVlue": 0,
                                            "invType": "N",
                                            "radType": "0"
                                        },
                                        "otherServices": {
                                            "otherServices": []
                                        },
                                        "shipmentDetail": {
                                            "shipments": [
                                                {
                                                    "sequence": 1,
                                                    "quantity": 1,
                                                    "shpCode": "11",
                                                    "weight": pesoTotal,
                                                    "volume": volumenTotal,
                                                    // "longShip":20,
                                                    // "widthShip":30,
                                                    // "highShip":40
                                                }
                                            ]
                                        },
                                        "quoteServices":[  
                                        "ST"
                                        ]
                                    },
                                    "objectDTO": null
                                },
                                "response": null
                            }
                        })
                    }

                    var result = await request(options, function (error, response) {
                        if (error) throw new Error(error);
                        
                    });

                    var resultJson = JSON.parse(result);

                    //Si la variable existe significa que si jalo la cotizacion
                    if(typeof resultJson.body.response.data.quotations[0].amount.totalAmnt !== 'undefined') 
                    {
                        precioFinal = resultJson.body.response.data.quotations[0].amount.totalAmnt
                    }
                    else
                    {
                        precioFinal = "Paquete Express no disponible"
                    }

                }


                res.status(200).send({
                    message: 'Paquete express',
                    costoEnvio: precioFinal,
                    tipo_envio: 'Pago'
                })
            }
            //Regresa respuesta de que el envio es gratis porque ningun producto supero el metro de cm (sujeto a cambios)
            else
            {
                res.status(200).send({
                    message: 'Paquete express',
                    costoEnvio: 0,
                    tipo_envio: 'Gratis'
                })
            }


            
        }catch(e){
            res.status(500).send({
                message: 'Paquete Express no disponible',
                e
            });
            next(e);
        }
    },
    CotizarCarritoFleteraFront: async(req, res, next) =>{
        try{



            const listaFleteras = await models.Fleteras.findAll(
            {
                where: {
                    pcdc_carrito_de_compra_id: carrito_id,
                    pcdc_carrito_de_compra_id:  statusControles.ESTATUS_SOCIOS_NEGOCIO.ACTIVA
                },
                exclude: ['flet_usu_usuario_creador_id','createdAt','flet_usu_usuario_modificador_id','updatedAt']
            });






            // //Variable con el id del carrito
            // var carrito_id = req.body.cdc_carrito_de_compra_id
            // var direccion_sn_id = req.body.snd_direcciones_id

            // //Obtener todos los productos del carrito
            // const constProductoCarritoDeCompra = await models.ProductoCarritoDeCompra.findAll(
            // {
            //     where: {
            //         pcdc_carrito_de_compra_id: carrito_id
            //     },
            //     attributes: ['pcdc_prod_producto_id', 'pcdc_producto_cantidad'],
            //     include: [
            //         {
            //             model: models.Producto,
            //             attributes: ['prod_altura', 'prod_ancho', 'prod_longitud', 'prod_peso', 'prod_volumen']
            //         }
            //     ]
            // });

            // //Variable que determina si el envio es gratis porque ninguna dimension del paquete es mayor a 1m
            // var envioGratis = true;

            // //Proceso que determina si es envio gratis
            // for (var i = 0; i < constProductoCarritoDeCompra.length; i++)
            // {
            //     if(
            //         constProductoCarritoDeCompra[i].dataValues.producto.prod_altura > 1 ||
            //         constProductoCarritoDeCompra[i].dataValues.producto.prod_ancho > 1 ||
            //         constProductoCarritoDeCompra[i].dataValues.producto.prod_longitud > 1
            //       )
            //     {
            //         envioGratis = false
            //     }
            // }


            // if(envioGratis == false)
            // {
            //     var precioFinal = 0
            //     var volumenTotal = 0
            //     var pesoTotal = 0

            //     //obtener volumen total y peso
            //     for (var i = 0; i < constProductoCarritoDeCompra.length; i++)
            //     {
            //         //Volumen total (como ya viene de integracion el volumen no se calcula)
            //         volumenTotal += (constProductoCarritoDeCompra[i].dataValues.producto.prod_volumen * constProductoCarritoDeCompra[i].dataValues.pcdc_producto_cantidad)
                    
            //         //Peso total
            //         pesoTotal += (constProductoCarritoDeCompra[i].dataValues.producto.prod_peso * constProductoCarritoDeCompra[i].dataValues.pcdc_producto_cantidad)
            //     }


            //     //Obtener informacion de direccion de envio
            //     const constSociosNegocioDirecciones = await models.SociosNegocioDirecciones.findOne(
            //     {
            //         where: {
            //             snd_direcciones_id: direccion_sn_id
            //         }
            //     });

            //     var dividirEnvio = false
            //     var dividirValue = 1

            //     var contadorFinal = 2
            //     if(pesoTotal > 5000 || volumenTotal > 20)
            //     {
            //         dividirEnvio = true
                    
            //         var pesoTemporal = pesoTotal
            //         var volumenTemporal = volumenTotal

            //         //Mientras sea mayor que esas cantidad seguira iterando hasta tener un numero por el cual dividir una orden
            //         while(pesoTemporal > 5000 || volumenTemporal > 20)
            //         {
            //             if((pesoTemporal/contadorFinal) < 5000 && (volumenTemporal/contadorFinal) < 20)
            //             {
            //                 break;
            //             }

            //             contadorFinal++

            //             if(contadorFinal == 50)
            //             {
            //                 break;
            //             }
            //         }
            //     }



            //     //Si la orden se dividio al final va a multiplicar la orden dividida por la cantidad amount para obtener el total
            //     if(dividirEnvio == true)
            //     {
            //         //json que se mandara a la api
            //         volumenTotal = volumenTotal/contadorFinal
            //         pesoTotal = pesoTotal/contadorFinal

            //         var options = 
            //         {
            //             'method': 'POST',
            //             'url': 'http://qaglp.paquetexpress.mx:7007/WsQuotePaquetexpress/api/apiQuoter/v2/getQuotation',
            //             'headers': {
            //                 'Content-Type': 'application/json'
            //             },
            //             body: JSON.stringify(
            //             {
            //                "header": {
            //                     "security": {
            //                         "user": "WSDISTENELEC",
            //                         "password": "1234",
            //                         "type": 1,
            //                         "token": "C3BC017308C7022EE053350AA8C09D76"
            //                     },
            //                     "device": {
            //                         "appName": "Customer",
            //                         "type": "Web",
            //                         "ip": "",
            //                         "idDevice": ""
            //                     },
            //                     "target": {
            //                         "module": "QUOTER",
            //                         "version": "1.0",
            //                         "service": "quoter",
            //                         "uri": "quotes",
            //                         "event": "R"
            //                     },
            //                     "output": "JSON",
            //                     "language": null
            //                 },
            //                 "body": {
            //                     "request": {
            //                         "data": {
            //                             "clientAddrOrig": {
            //                                 "zipCode": "51950",
            //                                 "colonyName": "PORTON DE SUEÑO"
            //                             },
            //                             "clientAddrDest": {
            //                                 "zipCode": constSociosNegocioDirecciones.snd_codigo_postal,
            //                                 "colonyName": constSociosNegocioDirecciones.snd_colonia
            //                             },
            //                             "services": {
            //                                 "dlvyType": "1",
            //                                 "ackType": "N",
            //                                 "totlDeclVlue": 0,
            //                                 "invType": "N",
            //                                 "radType": "0"
            //                             },
            //                             "otherServices": {
            //                                 "otherServices": []
            //                             },
            //                             "shipmentDetail": {
            //                                 "shipments": [
            //                                     {
            //                                         "sequence": 1,
            //                                         "quantity": 1,
            //                                         "shpCode": "11",
            //                                         "weight": pesoTotal,
            //                                         "volume": volumenTotal,
            //                                         // "longShip":20,
            //                                         // "widthShip":30,
            //                                         // "highShip":40
            //                                     }
            //                                 ]
            //                             },
            //                             "quoteServices":[  
            //                             "ST"
            //                             ]
            //                         },
            //                         "objectDTO": null
            //                     },
            //                     "response": null
            //                 }
            //             })
            //         }

            //         var result = await request(options, function (error, response) {
            //             if (error) throw new Error(error);
                        
            //         });

            //         var resultJson = JSON.parse(result);

            //         //Si la variable existe significa que si jalo la cotizacion
            //         if(typeof resultJson.body.response.data.quotations[0].amount.totalAmnt !== 'undefined') 
            //         {
            //             precioFinal = (resultJson.body.response.data.quotations[0].amount.totalAmnt) * contadorFinal
            //         }
            //         else
            //         {
            //             precioFinal = "Paquete Express no disponible"
            //         }
            //         console.log(options)
            //         //console.log(resultJson.body.response.data.quotations[0].amount.totalAmnt)
                    
            //     }
            //     else
            //     {
            //         //json que se mandara a la api
            //         var options = 
            //         {
            //             'method': 'POST',
            //             'url': 'http://qaglp.paquetexpress.mx:7007/WsQuotePaquetexpress/api/apiQuoter/v2/getQuotation',
            //             'headers': {
            //                 'Content-Type': 'application/json'
            //             },
            //             body: JSON.stringify(
            //             {
            //                "header": {
            //                     "security": {
            //                         "user": "WSDISTENELEC",
            //                         "password": "1234",
            //                         "type": 1,
            //                         "token": "C3BC017308C7022EE053350AA8C09D76"
            //                     },
            //                     "device": {
            //                         "appName": "Customer",
            //                         "type": "Web",
            //                         "ip": "",
            //                         "idDevice": ""
            //                     },
            //                     "target": {
            //                         "module": "QUOTER",
            //                         "version": "1.0",
            //                         "service": "quoter",
            //                         "uri": "quotes",
            //                         "event": "R"
            //                     },
            //                     "output": "JSON",
            //                     "language": null
            //                 },
            //                 "body": {
            //                     "request": {
            //                         "data": {
            //                             "clientAddrOrig": {
            //                                 "zipCode": "51950",
            //                                 "colonyName": "PORTON DE SUEÑO"
            //                             },
            //                             "clientAddrDest": {
            //                                 "zipCode": constSociosNegocioDirecciones.snd_codigo_postal,
            //                                 "colonyName": constSociosNegocioDirecciones.snd_colonia
            //                             },
            //                             "services": {
            //                                 "dlvyType": "1",
            //                                 "ackType": "N",
            //                                 "totlDeclVlue": 0,
            //                                 "invType": "N",
            //                                 "radType": "0"
            //                             },
            //                             "otherServices": {
            //                                 "otherServices": []
            //                             },
            //                             "shipmentDetail": {
            //                                 "shipments": [
            //                                     {
            //                                         "sequence": 1,
            //                                         "quantity": 1,
            //                                         "shpCode": "11",
            //                                         "weight": pesoTotal,
            //                                         "volume": volumenTotal,
            //                                         // "longShip":20,
            //                                         // "widthShip":30,
            //                                         // "highShip":40
            //                                     }
            //                                 ]
            //                             },
            //                             "quoteServices":[  
            //                             "ST"
            //                             ]
            //                         },
            //                         "objectDTO": null
            //                     },
            //                     "response": null
            //                 }
            //             })
            //         }

            //         var result = await request(options, function (error, response) {
            //             if (error) throw new Error(error);
                        
            //         });

            //         var resultJson = JSON.parse(result);

            //         //Si la variable existe significa que si jalo la cotizacion
            //         if(typeof resultJson.body.response.data.quotations[0].amount.totalAmnt !== 'undefined') 
            //         {
            //             precioFinal = resultJson.body.response.data.quotations[0].amount.totalAmnt
            //         }
            //         else
            //         {
            //             precioFinal = "Paquete Express no disponible"
            //         }

            //     }


            //     res.status(200).send({
            //         message: 'Paquete express',
            //         precioFinal: precioFinal,
            //         tipo_envio: 'Pago'
            //     })
            // }
            // //Regresa respuesta de que el envio es gratis porque ningun producto supero el metro de cm (sujeto a cambios)
            // else
            // {
            //     res.status(200).send({
            //         message: 'Paquete express',
            //         costoEnvio: 0,
            //         tipo_envio: 'Gratis'
            //     })
            // }


            
        }catch(e){
            res.status(500).send({
                message: 'Paquete Express no disponible',
                e
            });
            next(e);
        }
    },





    //temporalmente no se usara/ se usara el cotizarCarritoFunctions de services
    V2GetCotizarCarrito: async(req, res, next) =>{
        try{

            var cdc_sn_socio_de_negocio_id = req.body.cdc_sn_socio_de_negocio_id

            //Buscar el nombre del cmm de tipo de envio
            const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_control_id: req.body.cdc_cmm_tipo_envio_id
                }
            });

            //Obtener carrito id
            const constCarritoDeCompra = await models.CarritoDeCompra.findOne(
            {
                where: {
                    cdc_sn_socio_de_negocio_id: cdc_sn_socio_de_negocio_id
                }
            });

            //16 envio a domicilio
            if(constControlMaestroMultiple.cmm_valor == "Envío domicilio")
            {
                if(req.body.cdc_direccion_envio_id != null && req.body.cdc_fletera_id != null)
                {
                    //Variable con el id del carrito
                    var carrito_id = constCarritoDeCompra.cdc_carrito_de_compra_id
                    var direccion_sn_id = req.body.cdc_direccion_envio_id


                    //Obtener todos los productos del carrito
                    const constProductoCarritoDeCompra = await models.ProductoCarritoDeCompra.findAll(
                    {
                        where: {
                            pcdc_carrito_de_compra_id: carrito_id
                        },
                        attributes: ['pcdc_prod_producto_id', 'pcdc_producto_cantidad'],
                        include: [
                            {
                                model: models.Producto,
                                attributes: ['prod_altura', 'prod_ancho', 'prod_longitud', 'prod_peso', 'prod_volumen']
                            }
                        ]
                    });

                    //Variable que determina si el envio es gratis porque ninguna dimension del paquete es mayor a 1m
                    var precioFinal = 0
                    var volumenTotal = 0
                    var pesoTotal = 0

                    //obtener volumen total y peso
                    for (var i = 0; i < constProductoCarritoDeCompra.length; i++)
                    {
                        //Volumen total (como ya viene de integracion el volumen no se calcula)
                        volumenTotal += (constProductoCarritoDeCompra[i].dataValues.producto.prod_volumen * constProductoCarritoDeCompra[i].dataValues.pcdc_producto_cantidad)
                        
                        //Peso total
                        pesoTotal += (constProductoCarritoDeCompra[i].dataValues.producto.prod_peso * constProductoCarritoDeCompra[i].dataValues.pcdc_producto_cantidad)
                    }

                    //Obtener informacion de direccion de envio
                    const constSociosNegocioDirecciones = await models.SociosNegocioDirecciones.findOne(
                    {
                        where: {
                            snd_direcciones_id: direccion_sn_id
                        }
                    });

                    var dividirEnvio = false
                    var dividirValue = 1

                    var contadorFinal = 2
                    if(pesoTotal > 5000 || volumenTotal > 20)
                    {
                        dividirEnvio = true
                        
                        var pesoTemporal = pesoTotal
                        var volumenTemporal = volumenTotal

                        //Mientras sea mayor que esas cantidad seguira iterando hasta tener un numero por el cual dividir una orden
                        while(pesoTemporal > 5000 || volumenTemporal > 20)
                        {
                            if((pesoTemporal/contadorFinal) < 5000 && (volumenTemporal/contadorFinal) < 20)
                            {
                                break;
                            }

                            contadorFinal++

                            if(contadorFinal == 50)
                            {
                                break;
                            }
                        }
                    }

                    var almacenCP = ''
                    var almacenColonia = ''

                    const constSociosNegocioDirecciones2 = await models.SociosNegocioDirecciones.findOne(
                    {
                        where: {
                            snd_direcciones_id: direccion_sn_id
                        }
                    });

                    if(constSociosNegocioDirecciones2)
                    {
                        //Obtener Estado Nombre
                        const constEstado2 = await models.Estado.findOne(
                        {
                            where: {
                                estpa_estado_pais_id: constSociosNegocioDirecciones2.snd_estado_id
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
                        const constAlmacenesColonia = await models.Almacenes.findOne(
                        {
                            where: {
                                alm_codigoAlmacen: AlmacenesLogistica.almlog_almacen_codigo
                            }
                        });

                        almacenCP = constAlmacenesColonia.alm_codigo_postal
                        almacenColonia = constAlmacenesColonia.alm_nombre
                    }


                    //Si la orden se dividio al final va a multiplicar la orden dividida por la cantidad amount para obtener el total
                    if(dividirEnvio == true)
                    {
                        //json que se mandara a la api
                        volumenTotal = volumenTotal/contadorFinal
                        pesoTotal = pesoTotal/contadorFinal

                        var options = 
                        {
                            'method': 'POST',
                            'url': 'http://qaglp.paquetexpress.mx:7007/WsQuotePaquetexpress/api/apiQuoter/v2/getQuotation',
                            'headers': {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(
                            {
                               "header": {
                                    "security": {
                                        "user": "WSDISTENELEC",
                                        "password": "1234",
                                        "type": 1,
                                        "token": "C3BC017308C7022EE053350AA8C09D76"
                                    },
                                    "device": {
                                        "appName": "Customer",
                                        "type": "Web",
                                        "ip": "",
                                        "idDevice": ""
                                    },
                                    "target": {
                                        "module": "QUOTER",
                                        "version": "1.0",
                                        "service": "quoter",
                                        "uri": "quotes",
                                        "event": "R"
                                    },
                                    "output": "JSON",
                                    "language": null
                                },
                                "body": {
                                    "request": {
                                        "data": {
                                            "clientAddrOrig": {
                                                "zipCode": almacenCP,
                                                "colonyName": almacenColonia
                                            },
                                            "clientAddrDest": {
                                                "zipCode": constSociosNegocioDirecciones.snd_codigo_postal,
                                                "colonyName": constSociosNegocioDirecciones.snd_colonia
                                            },
                                            "services": {
                                                "dlvyType": "1",
                                                "ackType": "N",
                                                "totlDeclVlue": 0,
                                                "invType": "N",
                                                "radType": "0"
                                            },
                                            "otherServices": {
                                                "otherServices": []
                                            },
                                            "shipmentDetail": {
                                                "shipments": [
                                                    {
                                                        "sequence": 1,
                                                        "quantity": 1,
                                                        "shpCode": "11",
                                                        "weight": pesoTotal,
                                                        "volume": volumenTotal,
                                                        // "longShip":20,
                                                        // "widthShip":30,
                                                        // "highShip":40
                                                    }
                                                ]
                                            },
                                            "quoteServices":[  
                                            "ST"
                                            ]
                                        },
                                        "objectDTO": null
                                    },
                                    "response": null
                                }
                            })
                        }


                        var result = await request(options, function (error, response) {
                            if (error) throw new Error(error);
                            
                        });

                        var resultJson = JSON.parse(result);

                        //Si la variable existe significa que si jalo la cotizacion
                        if(typeof resultJson.body.response.data.quotations[0].amount.totalAmnt !== 'undefined') 
                        {
                            precioFinal = (resultJson.body.response.data.quotations[0].amount.totalAmnt) * contadorFinal
                        }
                        else
                        {
                            precioFinal = "Paquete Express no disponible"
                        }
                    }
                    else
                    {
                        //json que se mandara a la api
                        var options = 
                        {
                            'method': 'POST',
                            'url': 'http://qaglp.paquetexpress.mx:7007/WsQuotePaquetexpress/api/apiQuoter/v2/getQuotation',
                            'headers': {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(
                            {
                               "header": {
                                    "security": {
                                        "user": "WSDISTENELEC",
                                        "password": "1234",
                                        "type": 1,
                                        "token": "C3BC017308C7022EE053350AA8C09D76"
                                    },
                                    "device": {
                                        "appName": "Customer",
                                        "type": "Web",
                                        "ip": "",
                                        "idDevice": ""
                                    },
                                    "target": {
                                        "module": "QUOTER",
                                        "version": "1.0",
                                        "service": "quoter",
                                        "uri": "quotes",
                                        "event": "R"
                                    },
                                    "output": "JSON",
                                    "language": null
                                },
                                "body": {
                                    "request": {
                                        "data": {
                                            "clientAddrOrig": {
                                                "zipCode": almacenCP,
                                                "colonyName": almacenColonia
                                            },
                                            "clientAddrDest": {
                                                "zipCode": constSociosNegocioDirecciones.snd_codigo_postal,
                                                "colonyName": constSociosNegocioDirecciones.snd_colonia
                                            },
                                            "services": {
                                                "dlvyType": "1",
                                                "ackType": "N",
                                                "totlDeclVlue": 0,
                                                "invType": "N",
                                                "radType": "0"
                                            },
                                            "otherServices": {
                                                "otherServices": []
                                            },
                                            "shipmentDetail": {
                                                "shipments": [
                                                    {
                                                        "sequence": 1,
                                                        "quantity": 1,
                                                        "shpCode": "11",
                                                        "weight": pesoTotal,
                                                        "volume": volumenTotal,
                                                        // "longShip":20,
                                                        // "widthShip":30,
                                                        // "highShip":40
                                                    }
                                                ]
                                            },
                                            "quoteServices":[  
                                            "ST"
                                            ]
                                        },
                                        "objectDTO": null
                                    },
                                    "response": null
                                }
                            })
                        }

                        var result = await request(options, function (error, response) {
                            if (error) throw new Error(error);
                            
                        });

                        var resultJson = JSON.parse(result);

                        //Si la variable existe significa que si jalo la cotizacion
                        if(typeof resultJson.body.response.data.quotations[0].amount.totalAmnt !== 'undefined') 
                        {
                            precioFinal = resultJson.body.response.data.quotations[0].amount.totalAmnt
                        }
                        else
                        {
                            precioFinal = "Paquete Express no disponible"
                        }
                    }

                    if(precioFinal != 0 || precioFinal != 'Paquete Express no disponible')
                    {

                        await constCarritoDeCompra.update({
                            cdc_cmm_tipo_envio_id: !!req.body.cdc_cmm_tipo_envio_id ? req.body.cdc_cmm_tipo_envio_id : constCarritoDeCompra.dataValues.cdc_cmm_tipo_envio_id,
                            cdc_direccion_envio_id: !!req.body.cdc_direccion_envio_id ? req.body.cdc_direccion_envio_id : constCarritoDeCompra.dataValues.cdc_direccion_envio_id,
                            cdc_alm_almacen_recoleccion: null,
                            cdc_fletera_id: !!req.body.cdc_fletera_id ? req.body.cdc_fletera_id : constCarritoDeCompra.dataValues.cdc_fletera_id,
                            cdc_costo_envio: precioFinal,
                            updatedAt: Date()
                        });

                        res.status(200).send({
                            message: 'Carrito actualizado con exito',
                            costoEnvio: precioFinal
                        })
                    }
                    else
                    {
                        res.status(200).send({
                            message: 'No se pudo actualizar el carrito',
                            costoEnvio: precioFinal
                        })
                    }
                }
            }
            //17 recoleccion
            else
            {
                if(req.body.cdc_alm_almacen_recoleccion != null)
                {

                    await constCarritoDeCompra.update({
                        cdc_cmm_tipo_envio_id: !!req.body.cdc_cmm_tipo_envio_id ? req.body.cdc_cmm_tipo_envio_id : constCarritoDeCompra.dataValues.cdc_cmm_tipo_envio_id,
                        cdc_direccion_envio_id: null,
                        cdc_alm_almacen_recoleccion: !!req.body.cdc_alm_almacen_recoleccion ? req.body.cdc_alm_almacen_recoleccion : constCarritoDeCompra.dataValues.cdc_alm_almacen_recoleccion,
                        cdc_fletera_id: null,
                        cdc_costo_envio: 0,
                        updatedAt: Date()
                    });

                    res.status(200).send({
                        message: 'Carrito actualizado con exito',
                        costoEnvio: precioFinal
                    })
                }
            }




        }catch(e){
            res.status(200).send({
                message: 'Paquete Express no disponible',
                costoEnvio: 0,
                tipo_envio: 'No disponible'
            });
            next(e);
        }
    },



};