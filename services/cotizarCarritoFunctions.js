import models from '../models';
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const { Op } = require("sequelize");
import statusControllers from '../mapeos/mapeoControlesMaestrosMultiples';
import request from 'request-promise';
import getCheckout from "../services/checkoutAPI";
import productosUtils from "../services/productosUtils";

module.exports = {
    CotizarCarritoFunction: async function (cdc_sn_socio_de_negocio_id, cdc_cmm_tipo_envio_id, cdc_direccion_envio_id, cdc_alm_almacen_recoleccion, cdc_fletera_id, checkoutJson) {
        try{
            var cdc_sn_socio_de_negocio_id = cdc_sn_socio_de_negocio_id
            var precioFinal = 0
            var jsonFinal 
            
            //Buscar el nombre del cmm de tipo de envio
            const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_control_id: cdc_cmm_tipo_envio_id
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

                var totalFinalCheckout = checkoutJson.dataValues.TotalFinal

                //obtener tipo de cambio para convertir a USD y luego comparar
                const constValorUSD = await models.ControlMaestroMultiple.findOne(
                {
                    where: {
                        cmm_nombre: "TIPO_CAMBIO_USD"
                    }
                })

                //Valor de la orden final en USD
                var totalFinalUSD = totalFinalCheckout/constValorUSD.cmm_valor
                console.log(totalFinalUSD)

                //Buscara si cuenta con una politica de envio activa antes de cotizar con paquete express
                var resultPoliticas = await this.getPoliticasEnvioActiva(cdc_sn_socio_de_negocio_id, constCarritoDeCompra, cdc_direccion_envio_id, checkoutJson, totalFinalCheckout, totalFinalUSD);
                // var suertirUnSoloAlmacen = false

                const constPoliticasEnvioForaneo = await models.PoliticasEnvio.findOne(
                {
                    where: {
                        poe_nombre: "Envio Foraneo Gratis",
                        poe_cmm_estatus_id: 1000172
                    }
                })

                console.log(constPoliticasEnvioForaneo)


                console.log(11111111)
                console.log(resultPoliticas)

                //Si aplica una politica directamente (ACTUALMENTE SOLO CIUDADES Y MONTO MINIMO COMPRA)
                if(resultPoliticas.BoolPolitica == true)
                {
                    if(resultPoliticas.BoolPolitica > 0)
                    {
                        jsonFinal = {
                            tipoEnvio: "Dielsa",
                            fleteraID: 6,
                            totalFinal: resultPoliticas.totalFinal,
                            politicaBool: true,
                            politicaNombre: resultPoliticas.politicaNombre,
                            suertirUnSoloAlmacen: resultPoliticas.suertirUnSoloAlmacen
                        }

                        return jsonFinal
                    }
                    else
                    {
                        jsonFinal = {
                            tipoEnvio: "No fue posible obtener una cotizacion: Error en politica envio",
                            fleteraID: 6,
                            totalFinal: resultPoliticas.totalFinal,
                            politicaBool: false,
                            politicaNombre: '',
                            suertirUnSoloAlmacen: false
                        }
                        return jsonFinal
                    }
                }
                //Validacion directa de si es 250 dolares la orden y los articulos no son mayor a 1 metro
                else if(constPoliticasEnvioForaneo)
                {
                    console.log(98989898)
                    console.log(constPoliticasEnvioForaneo.poe_monto_compra_minimo)


                    if(constPoliticasEnvioForaneo.poe_monto_compra_minimo < totalFinalUSD)
                    {
                        console.log(22222222)
                        console.log("entro al USD")
                        var carrito_id = constCarritoDeCompra.cdc_carrito_de_compra_id

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

                        var boolMayor1MetroLados = false
                        console.log(33333333)

                        //Validar dimensiones de los productos
                        for (var i = 0; i < constProductoCarritoDeCompra.length; i++) 
                        {
                            console.log(constProductoCarritoDeCompra[i].dataValues.producto.prod_ancho)

                            if(constProductoCarritoDeCompra[i].dataValues.producto.prod_altura > 1)
                            {
                                boolMayor1MetroLados = true
                            }
                            if(constProductoCarritoDeCompra[i].dataValues.producto.prod_ancho > 1)
                            {
                                boolMayor1MetroLados = true
                            }
                            if(constProductoCarritoDeCompra[i].dataValues.producto.prod_longitud > 1)
                            {
                                boolMayor1MetroLados = true
                            }
                        }

                        //Si la politica de que ningun lado es mayor a 1 metro se aplicara la politica dielsa con costo 0
                        if(boolMayor1MetroLados == false)
                        {
                            console.log(4444444444)
                            jsonFinal = {
                                tipoEnvio: "Dielsa",
                                fleteraID: 6,
                                totalFinal: constPoliticasEnvioForaneo.poe_monto,
                                politicaBool: true,
                                politicaNombre: 'Envio Foraneo Gratis',
                                suertirUnSoloAlmacen: false
                            }

                            return jsonFinal
                        }
                        //Se mandara a llamar a la function de paqueteria express
                        else
                        {
                            console.log(555555555)
                            var resultPaqueteExpress = await this.getPaqueteExpressApiCotizacion(constCarritoDeCompra, cdc_direccion_envio_id);
                            console.log(resultPaqueteExpress)

                            //Si es numero regresara todo bien
                            if(typeof resultPaqueteExpress == 'number')
                            {
                                jsonFinal = {
                                    tipoEnvio: "Paquetexpress",
                                    fleteraID: 3,
                                    totalFinal: resultPaqueteExpress,
                                    politicaBool: false,
                                    politicaNombre: null,
                                    suertirUnSoloAlmacen: false
                                }

                                return jsonFinal
                            }
                            else
                            {
                                jsonFinal = {
                                    tipoEnvio: "No disponible",
                                    fleteraID: 0,
                                    totalFinal: resultPaqueteExpress,
                                    politicaBool: false,
                                    politicaNombre: null,
                                    suertirUnSoloAlmacen: false
                                }

                                return jsonFinal
                            }

                        }


                    }
                    //usar paquete express
                    else
                    {
                        console.log(456456456)
                        var resultPaqueteExpress = await this.getPaqueteExpressApiCotizacion(constCarritoDeCompra, cdc_direccion_envio_id);
                        console.log(resultPaqueteExpress)

                        //Si es numero regresara todo bien
                        if(typeof resultPaqueteExpress == 'number')
                        {
                            jsonFinal = {
                                tipoEnvio: "Paquetexpress",
                                fleteraID: 3,
                                totalFinal: resultPaqueteExpress,
                                politicaBool: false,
                                politicaNombre: null,
                                suertirUnSoloAlmacen: false
                            }

                            return jsonFinal
                        }
                        else
                        {
                            jsonFinal = {
                                tipoEnvio: "No disponible",
                                fleteraID: 0,
                                totalFinal: resultPaqueteExpress,
                                politicaBool: false,
                                politicaNombre: null,
                                suertirUnSoloAlmacen: false
                            }

                            return jsonFinal
                        }

                    }

                    



                }
                else if(cdc_direccion_envio_id != null && cdc_fletera_id != null)
                {
                    console.log(99999999999)
                    var resultPaqueteExpress = await this.getPaqueteExpressApiCotizacion(constCarritoDeCompra, cdc_direccion_envio_id);
                    //Si es numero regresara todo bien
                    if(typeof resultPaqueteExpress == 'number')
                    {
                        jsonFinal = {
                            tipoEnvio: "Paquetexpress",
                            fleteraID: 3,
                            totalFinal: resultPaqueteExpress,
                            politicaBool: false,
                            politicaNombre: null,
                            suertirUnSoloAlmacen: false
                        }

                        return jsonFinal
                    }
                    else
                    {
                        jsonFinal = {
                            tipoEnvio: "No disponible",
                            fleteraID: 0,
                            totalFinal: resultPaqueteExpress,
                            politicaBool: false,
                            politicaNombre: null,
                            suertirUnSoloAlmacen: false
                        }

                        return jsonFinal
                    }
                }

            }
            //17 recoleccion
            else
            {
                if(cdc_alm_almacen_recoleccion != null)
                {
                    return precioFinal
                }
            }
        }
        catch(e){
            console.log(e)
            return "Error al cotizar carrito"
        }
    },

    getPoliticasEnvioActiva: async function (cdc_sn_socio_de_negocio_id, constCarritoDeCompra, cdc_direccion_envio_id, checkoutJson, totalFinalCheckout, totalFinalUSD) {
        try{

            var resultadoFinal = {
                "BoolPolitica": false,
                "totalFinal": 0,
                "tipoPoliticaEnvio": '',
                "politicaID": '',
                "politicaNombre": ''
            }


            //Buscar politica de codigo postal

            //Obtener Informacion de la direccion de envio
            const constSociosNegocioDirecciones = await models.SociosNegocioDirecciones.findOne(
            {
                where: {
                    snd_direcciones_id: cdc_direccion_envio_id
                }
            })

            //Si existe la direccion de envio continuara
            if(constSociosNegocioDirecciones)
            {
                var aplicaPoliticaBool = false
                var totalFinal = 99999999999
                var tipoPoliticaEnvio
                var politicaID
                var politicaNombre
                var suertirUnSoloAlmacen = false
                

                // SELECT 
                //     poedata_poe_politicas_envio_id,
                //     poe_monto
                // FROM politicas_envio_data ped
                // left join politicas_envio pe on pe.poe_politicas_envio_id = ped.poedata_poe_politicas_envio_id 
                // where
                //     45500 between poedata_cp_inicio and poedata_cp_final
                //     and pe.poe_cmm_estatus_id = 1000172
                // group by poedata_poe_politicas_envio_id, poe_monto


                //Obtener ciudad ID para hacer match con las politicas de ciudades
                var queryCiudades = `
                    select 
                        city_ciudades_estados_id 
                    from 
                        ciudades_estados ce 
                    where
                        lower(ce.city_ciudad) = lower('`+constSociosNegocioDirecciones.snd_ciudad+`') 
                `;

                //OBTIENE LOS ELEMENTOS BUSCADOS
                const constqueryCiudades = await sequelize.query(queryCiudades,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });


                if(constqueryCiudades.length > 0)
                {
                    //Buscar politica por ciudad y por monto minimo
                    var queryconstPoliticasEnvioDataByCP = `
                        SELECT 
                            poedata_poe_politicas_envio_id,
                            poe_monto,
                            poe_nombre
                        FROM politicas_envio_data ped
                        left join politicas_envio pe on pe.poe_politicas_envio_id = ped.poedata_poe_politicas_envio_id 
                        where
                            ped.poedata_city_ciudades_estados_id = `+constqueryCiudades[0].city_ciudades_estados_id+`
                            and `+totalFinalUSD+` > pe.poe_monto_compra_minimo 
                            and pe.poe_cmm_estatus_id = 1000172
                            and pe.poe_nombre != 'Envio Foraneo Gratis'
                        group by poedata_poe_politicas_envio_id, poe_monto, poe_nombre
                        
                    `;

                    //OBTIENE LOS ELEMENTOS BUSCADOS
                    const constPoliticasEnvioDataByCP = await sequelize.query(queryconstPoliticasEnvioDataByCP,
                    { 
                        type: sequelize.QueryTypes.SELECT 
                    });


                    

                    //Recorrer las politicas de envio por CP
                    if(constPoliticasEnvioDataByCP.length > 0)
                    {
                        //Buscara en el arreglo la mejor politica o las mas "barata" para establecerla como final
                        for (var i = 0; i < constPoliticasEnvioDataByCP.length; i++) 
                        {
                            //Variable bool (validar si la orden puede ser surtida de un solo almacen)
                            var resultSurtidoFromAlmacenes = await this.getPoliticasLineasAlmacenes(checkoutJson, 1, cdc_direccion_envio_id);

                            //Significa que toda la orden se puede surtir de esta politica (NO ACTIVO)
                            if(resultSurtidoFromAlmacenes == true)
                            {
                                //Comparar precios para tomar el menor en caso de que vengan mas de 1
                                if(constPoliticasEnvioDataByCP[i].poe_monto < totalFinal)
                                {
                                    totalFinal = constPoliticasEnvioDataByCP[i].poe_monto
                                    tipoPoliticaEnvio = "Codigo Postal"
                                    politicaID = constPoliticasEnvioDataByCP[i].poedata_poe_politicas_envio_id
                                    aplicaPoliticaBool = true
                                    politicaNombre = constPoliticasEnvioDataByCP[i].poe_nombre
                                    suertirUnSoloAlmacen = true
                                }
                            }
                            else
                            {
                                //Comparar precios para tomar el menor en caso de que vengan mas de 1
                                if(constPoliticasEnvioDataByCP[i].poe_monto < totalFinal)
                                {
                                    totalFinal = constPoliticasEnvioDataByCP[i].poe_monto
                                    tipoPoliticaEnvio = "Codigo Postal"
                                    politicaID = constPoliticasEnvioDataByCP[i].poedata_poe_politicas_envio_id
                                    aplicaPoliticaBool = true
                                    politicaNombre = constPoliticasEnvioDataByCP[i].poe_nombre
                                }
                            }
                        }
                    }   //Fin IF politicas CP

                }


                











                //Resultado final despues de validar todas las politicas de envio

                if(aplicaPoliticaBool == true)
                {
                    resultadoFinal = {
                        "BoolPolitica": true,
                        "totalFinal": totalFinal,
                        "tipoPoliticaEnvio": tipoPoliticaEnvio,
                        "politicaID": politicaID,
                        "politicaNombre": politicaNombre,
                        "suertirUnSoloAlmacen": suertirUnSoloAlmacen
                    }
                }

            }




















































































            return resultadoFinal
        }
        catch(e){
            console.log(e)
            return "No fue posible regresar las lineas de productos para dividir la orden en almacenes"
        }
    },

    getPaqueteExpressApiCotizacion: async function (constCarritoDeCompra, cdc_direccion_envio_id) {
        try{
            var precioFinal = -1
            console.log(66666666)
            // Si no tiene politicas de envio aplicables se ira por paquete express (COTIZADOR PAQUETE)
            //Variable con el id del carrito
            var carrito_id = constCarritoDeCompra.cdc_carrito_de_compra_id
            var direccion_sn_id = cdc_direccion_envio_id

            //Obtener todos los productos del carrito
            let constProductoCarritoDeCompra = await models.ProductoCarritoDeCompra.findAll(
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

            constProductoCarritoDeCompra = constProductoCarritoDeCompra.filter((item) =>
                item.dataValues.producto.prod_peso > 0 && item.dataValues.producto.prod_volumen > 0 );
            //Validar si hay stock en los productos o aplican back orden
            var boolValidarDimensiones = await this.validarDimensionesCarritoProducto(constProductoCarritoDeCompra);

            console.log(7777777777777777)
            if(boolValidarDimensiones == true)
            {

                //Variable que determina si el envio es gratis porque ninguna dimension del paquete es mayor a 1m

                var volumenTotal = 0
                var pesoTotal = 0

                var anchoTotal = 0
                var alturaTotal = 0
                var longitudTotal = 0

                //obtener volumen total y peso
                for (var i = 0; i < constProductoCarritoDeCompra.length; i++)
                {
                    // anchoTotal += (constProductoCarritoDeCompra[i].dataValues.producto.prod_ancho * constProductoCarritoDeCompra[i].dataValues.pcdc_producto_cantidad)
                    // alturaTotal += (constProductoCarritoDeCompra[i].dataValues.producto.prod_altura * constProductoCarritoDeCompra[i].dataValues.pcdc_producto_cantidad)
                    // longitudTotal += (constProductoCarritoDeCompra[i].dataValues.producto.prod_longitud * constProductoCarritoDeCompra[i].dataValues.pcdc_producto_cantidad)

                    
                    //Peso total
                    volumenTotal += (constProductoCarritoDeCompra[i].dataValues.producto.prod_volumen * constProductoCarritoDeCompra[i].dataValues.pcdc_producto_cantidad)
                    pesoTotal += (constProductoCarritoDeCompra[i].dataValues.producto.prod_peso * constProductoCarritoDeCompra[i].dataValues.pcdc_producto_cantidad)
                }

                // console.log(anchoTotal)
                // console.log(alturaTotal)
                // console.log(longitudTotal)

                //Volumen total
                // volumenTotal = anchoTotal * alturaTotal * longitudTotal
                    


                console.log("volumenTotal: " + volumenTotal)

                if(volumenTotal < 0.0062496)
                {
                    volumenTotal = 0.0062496
                }
                else
                {
                    var cantidadCajas = Math.ceil(volumenTotal/0.0062496)

                    console.log("cantidadCajas: " + cantidadCajas)


                    volumenTotal = cantidadCajas * 0.0062496
                    console.log("VolumenFinal: "+ volumenTotal)
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

                    // credenciales anteriores
                    // "user": "WSDISTENELEC",
                    // "password": "1234",
                    // "type": 1,
                    // "token": "C3BC017308C7022EE053350AA8C09D76"
                    // 'url': 'http://qaglp.paquetexpress.mx:7007/WsQuotePaquetexpress/api/apiQuoter/v2/getQuotation',

                    var options = 
                    {
                        'method': 'POST',
                        'url': 'https://cc.paquetexpress.com.mx/WsQuotePaquetexpress/api/apiQuoter/v2/getQuotation',
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
                                    "token": "E54A91979F2F0104E053C0A80A149729"
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
                                            "radType": "1"
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

                    console.log(options)


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
                        'url': 'https://cc.paquetexpress.com.mx/WsQuotePaquetexpress/api/apiQuoter/v2/getQuotation',
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
                                    "token": "E54A91979F2F0104E053C0A80A149729"
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
                                            "radType": "1"
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

                    console.log(options)

                    var result = await request(options, function (error, response) {
                        if (error) throw new Error(error);
                        
                    });

                    var resultJson = JSON.parse(result);

                    console.log(result)

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
                    return precioFinal
                }
                else
                {
                    return "No fue posible cotizar"
                }


            }
            else
            {
                return "No fue posible cotizar: productos con dimension en 0"
            }



        }
        catch(e){
            console.log(e)
            return "Error al utilizar paquete express api"
        }
    },





















    getPoliticasLineasAlmacenes: async function (checkoutJson, id_orden, cdc_direccion_envio_id) {
        try{
            var productos = checkoutJson.dataValues.productos
            var almacenCodigoPrincipal
            var almacenCodigoSecundario
            var lineasArray = [];

            //Variable que se regresara para saber si se puede surtir toda la orden del almacen principal segun la logistica almacen de la direccion de envio
            var surtinUnSoloAlmacen = true


            //Obtener almacen asignado al cliente (primario)
            const constSociosNegocioDirecciones = await models.SociosNegocioDirecciones.findOne(
            {
                where: {
                    snd_direcciones_id: cdc_direccion_envio_id
                }
            });




            //Obtener almacenes primarios
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

            console.log("almacen princiapL          " + almacenCodigoPrincipal)
            console.log("almacen secundario         " + almacenCodigoSecundario)


            //Obtener lineas
            for (var i = 0; i < productos.length; i++) 
            {
                var aplicaBackOrder = productos[i].dataValues.aplicaBackOrder
                var inventarioFaltante = productos[i].dataValues.pcdc_producto_cantidad

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
                                    // var linea = {
                                    //     pcf_cf_compra_finalizada_id: id_orden,
                                    //     pcf_prod_producto_id: productos[i].dataValues.pcdc_prod_producto_id,
                                    //     pcf_cantidad_producto: inventarioFaltante,
                                    //     pcf_descuento_producto: null,
                                    //     pcf_precio: productos[i].dataValues.precioFinal,
                                    //     pcf_prod_producto_id_regalo: null,
                                    //     pcf_cantidad_producto_regalo: null,
                                    //     pcf_descuento_promocion: productos[i].dataValues.totalDescuento,
                                    //     pcf_prod_producto_id_promocion: null,
                                    //     pcf_cantidad_producto_promocion: null,
                                    //     pcf_cupon_aplicado: null,
                                    //     pcf_almacen_linea: almacenCodigoPrincipal,
                                    //     pcf_is_backorder: false,
                                    //     pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                    //     pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                    //     pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                    //     pcf_descuento_porcentual: productos[i].dataValues.totalDescuentoPorcentual
                                    // }

                                    // lineasArray.push(linea);

                                    cantidadDisponible = 0
                                    inventarioFaltante = 0
                                    stockDisponible = 0
                                }
                                //Surtir parcial 
                                else
                                {
                                    // var linea = {
                                    //     pcf_cf_compra_finalizada_id: id_orden,
                                    //     pcf_prod_producto_id: productos[i].dataValues.pcdc_prod_producto_id,
                                    //     pcf_cantidad_producto: cantidadDisponible,
                                    //     pcf_descuento_producto: null,
                                    //     pcf_precio: productos[i].dataValues.precioFinal,
                                    //     pcf_prod_producto_id_regalo: null,
                                    //     pcf_cantidad_producto_regalo: null,
                                    //     pcf_descuento_promocion: productos[i].dataValues.totalDescuento,
                                    //     pcf_prod_producto_id_promocion: null,
                                    //     pcf_cantidad_producto_promocion: null,
                                    //     pcf_cupon_aplicado: null,
                                    //     pcf_almacen_linea: almacenCodigoPrincipal,
                                    //     pcf_is_backorder: false,
                                    //     pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                    //     pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                    //     pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                    //     pcf_descuento_porcentual: productos[i].dataValues.totalDescuentoPorcentual
                                    // }

                                    // lineasArray.push(linea);

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
                            //Si entra aqui de golpe ya seria false porque no se puede surtir de un solo lugar
                            surtinUnSoloAlmacen = false

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
                                    // var linea = {
                                    //     pcf_cf_compra_finalizada_id: id_orden,
                                    //     pcf_prod_producto_id: productos[i].dataValues.pcdc_prod_producto_id,
                                    //     pcf_cantidad_producto: inventarioFaltante,
                                    //     pcf_descuento_producto: null,
                                    //     pcf_precio: productos[i].dataValues.precioFinal,
                                    //     pcf_prod_producto_id_regalo: null,
                                    //     pcf_cantidad_producto_regalo: null,
                                    //     pcf_descuento_promocion: productos[i].dataValues.totalDescuento,
                                    //     pcf_prod_producto_id_promocion: null,
                                    //     pcf_cantidad_producto_promocion: null,
                                    //     pcf_cupon_aplicado: null,
                                    //     pcf_almacen_linea: almacenCodigoSecundario,
                                    //     pcf_is_backorder: false,
                                    //     pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                    //     pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                    //     pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                    //     pcf_descuento_porcentual: productos[i].dataValues.totalDescuentoPorcentual
                                    // }

                                    // lineasArray.push(linea);

                                    cantidadDisponible = 0
                                    inventarioFaltante = 0
                                    stockDisponible = 0
                                }
                                //Surtir parcial 
                                else
                                {
                                    // var linea = {
                                    //     pcf_cf_compra_finalizada_id: id_orden,
                                    //     pcf_prod_producto_id: productos[i].dataValues.pcdc_prod_producto_id,
                                    //     pcf_cantidad_producto: cantidadDisponible,
                                    //     pcf_descuento_producto: null,
                                    //     pcf_precio: productos[i].dataValues.precioFinal,
                                    //     pcf_prod_producto_id_regalo: null,
                                    //     pcf_cantidad_producto_regalo: null,
                                    //     pcf_descuento_promocion: productos[i].dataValues.totalDescuento,
                                    //     pcf_prod_producto_id_promocion: null,
                                    //     pcf_cantidad_producto_promocion: null,
                                    //     pcf_cupon_aplicado: null,
                                    //     pcf_almacen_linea: almacenCodigoSecundario,
                                    //     pcf_is_backorder: false,
                                    //     pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                                    //     pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                                    //     pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                                    //     pcf_descuento_porcentual: productos[i].dataValues.totalDescuentoPorcentual
                                    // }

                                    // lineasArray.push(linea);

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
                        //Si llega al backorder significa que posiblemente no se pueda de un solo almacen ver con gabo
                        // surtinUnSoloAlmacen = false


                        // //default is false
                        // var isOxen = await productosUtils.getIfIsOxenProduct(productos[i].dataValues.pcdc_prod_producto_id);

                        // if(productos[i].dataValues.prod_tipo_precio_base != 'Precio de Lista')
                        // {
                        //     const constProductoListaPrecio = await models.ProductoListaPrecio.findOne(
                        //     {
                        //         where: {
                        //             pl_prod_producto_id: productos[i].dataValues.pcdc_prod_producto_id,
                        //             pl_listp_lista_de_precio_id: 1
                        //         }
                        //     });

                        //     productos[i].dataValues.precioFinal = constProductoListaPrecio.pl_precio_producto
                        // }

                        // //Si no es oxen hara todo normal
                        // if(isOxen == false)
                        // {
                        //     // var linea = {
                        //     //     pcf_cf_compra_finalizada_id: id_orden,
                        //     //     pcf_prod_producto_id: productos[i].dataValues.pcdc_prod_producto_id,
                        //     //     pcf_cantidad_producto: inventarioFaltante,
                        //     //     pcf_descuento_producto: null,
                        //     //     pcf_precio: productos[i].dataValues.precioFinal,
                        //     //     pcf_prod_producto_id_regalo: null,
                        //     //     pcf_cantidad_producto_regalo: null,
                        //     //     pcf_descuento_promocion: productos[i].dataValues.totalDescuento,
                        //     //     pcf_prod_producto_id_promocion: null,
                        //     //     pcf_cantidad_producto_promocion: null,
                        //     //     pcf_cupon_aplicado: null,
                        //     //     pcf_almacen_linea: almacenCodigoPrincipal,
                        //     //     pcf_is_backorder: true,
                        //     //     pcf_dias_resurtimiento: productos[i].dataValues.prod_dias_resurtimiento,
                        //     //     pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                        //     //     pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                        //     //     pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                        //     //     pcf_descuento_porcentual: productos[i].dataValues.totalDescuentoPorcentual
                        //     // }
                        // }
                        // else
                        // {
                        //     // var linea = {
                        //     //     pcf_cf_compra_finalizada_id: id_orden,
                        //     //     pcf_prod_producto_id: productos[i].dataValues.pcdc_prod_producto_id,
                        //     //     pcf_cantidad_producto: inventarioFaltante,
                        //     //     pcf_descuento_producto: null,
                        //     //     pcf_precio: productos[i].dataValues.precioFinal,
                        //     //     pcf_prod_producto_id_regalo: null,
                        //     //     pcf_cantidad_producto_regalo: null,
                        //     //     pcf_descuento_promocion: productos[i].dataValues.totalDescuento,
                        //     //     pcf_prod_producto_id_promocion: null,
                        //     //     pcf_cantidad_producto_promocion: null,
                        //     //     pcf_cupon_aplicado: null,
                        //     //     pcf_almacen_linea: 1,
                        //     //     pcf_is_backorder: true,
                        //     //     pcf_dias_resurtimiento: productos[i].dataValues.prod_dias_resurtimiento,
                        //     //     pcf_backorder_precio_lista: productos[i].dataValues.backOrderPrecioLista,
                        //     //     pcf_tipo_precio_lista: productos[i].dataValues.prod_tipo_precio_base,
                        //     //     pcf_precio_base_venta: productos[i].dataValues.prod_precio,
                        //     //     pcf_descuento_porcentual: productos[i].dataValues.totalDescuentoPorcentual
                        //     // }
                        // }

                        // lineasArray.push(linea);

                        //Dejar aqui en 0 para que no se cicle si es que el codigo de arriba queda comentado
                        inventarioFaltante = 0
                    }

                    breaker++
                    if(breaker == 50)
                    {
                        break
                    } 
                }
            }






            console.log(lineasArray)



















            return surtinUnSoloAlmacen
        }
        catch(e){
            return "No fue posible regresar las lineas de productos para dividir la orden en almacenes"
        }
    },

    validarDimensionesCarritoProducto: async function (constProductoCarritoDeCompra) {
        try{
            console.log("ntro")
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
                    attributes: ["prod_peso", "prod_volumen"]
                })

                var aplicaBackOrder = false

                //Si aplica backorder bool
                if(constProducto.prod_peso == 0 || constProducto.prod_volumen == 0 )
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

    CotizarCotizacionFunction: async function (cot_cotizacion_id, cot_cmm_tipo_envio_id, cot_direccion_envio_id, cot_alm_almacen_recoleccion, cot_fletera_id) {
        try{
            var cdc_sn_socio_de_negocio_id = cot_cotizacion_id
            var precioFinal = 0 
            
            //Buscar el nombre del cmm de tipo de envio
            const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_control_id: cot_cmm_tipo_envio_id
                }
            });

            //Obtener carrito id
            const constCotizaciones = await models.Cotizaciones.findOne(
            {
                where: {
                    cot_cotizacion_id: cot_cotizacion_id
                }
            });

            //16 envio a domicilio
            if(constControlMaestroMultiple.cmm_valor == "Envío domicilio")
            {
                if(cot_direccion_envio_id != null && cot_fletera_id != null)
                {
                    //Variable con el id del carrito
                    var direccion_sn_id = cot_direccion_envio_id

                    //Obtener todos los productos de la cotizacion
                    const constCotizacionesProductos = await models.CotizacionesProductos.findAll(
                    {
                        where: {
                            cotp_cotizacion_id: constCotizaciones.cot_cotizacion_id
                        }
                    });

                    for (var i = 0; i < constCotizacionesProductos.length; i++) 
                    {
                        const constProducto = await models.Producto.findOne(
                        {
                            where: {
                                prod_producto_id: constCotizacionesProductos[i].dataValues.cotp_prod_producto_id
                            },
                        });

                        constCotizacionesProductos[i].dataValues.Producto = constProducto
                    }

                    //Validar si los productos tienen dimesiones
                    var boolValidarDimensiones = await this.validarDimensionesCotizacionProducto(constCotizacionesProductos);


                    if(boolValidarDimensiones == true)
                    {

                        //Variable que determina si el envio es gratis porque ninguna dimension del paquete es mayor a 1m

                        var volumenTotal = 0
                        var pesoTotal = 0

                        //obtener volumen total y peso
                        // for (var i = 0; i < constProductoCarritoDeCompra.length; i++)
                        for (var i = 0; i < constCotizacionesProductos.length; i++)   
                        {
                            //Volumen total (como ya viene de integracion el volumen no se calcula)
                            volumenTotal += (constCotizacionesProductos[i].dataValues.Producto.dataValues.prod_volumen * constCotizacionesProductos[i].dataValues.cotp_producto_cantidad)


                            //Peso total
                            pesoTotal += (constCotizacionesProductos[i].dataValues.Producto.dataValues.prod_peso * constCotizacionesProductos[i].dataValues.cotp_producto_cantidad)
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
                                'url': 'https://cc.paquetexpress.com.mx/WsQuotePaquetexpress/api/apiQuoter/v2/getQuotation',
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
                                            "token": "E54A91979F2F0104E053C0A80A149729"
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
                                                    "radType": "1"
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
                                'url': 'https://cc.paquetexpress.com.mx/WsQuotePaquetexpress/api/apiQuoter/v2/getQuotation',
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
                                            "token": "E54A91979F2F0104E053C0A80A149729"
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
                                                    "radType": "1"
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
                            return precioFinal
                        }
                        else
                        {
                            return "No fue posible cotizar"
                        }

                    }
                    else
                    {
                        return "No fue posible cotizar: productos con dimension en 0"
                    }
                }
            }
            //17 recoleccion
            else
            {
                if(cdc_alm_almacen_recoleccion != null)
                {
                    return precioFinal
                }
            }
        }
        catch(e){
            console.log(e)
            return "Error al cotizar carrito"
        }
    },

    validarDimensionesCotizacionProducto: async function (constCotizacionesProductos) {
        try{
            //Variable que se regresara al final
            var validarReturn = true

            //Obtener lineas
            for (var i = 0; i < constCotizacionesProductos.length; i++) 
            {
                //Obtener almacen asignado al cliente (primario)
                const constProducto = await models.Producto.findOne(
                {
                    where: {
                        prod_producto_id: constCotizacionesProductos[i].dataValues.Producto.dataValues.prod_producto_id
                    },
                    attributes: ["prod_peso", "prod_volumen"]
                })

                if(constProducto.prod_peso == 0 || constProducto.prod_volumen == 0 )
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




























    //COSAS DE COTIZACIONES QUOTING
    CotizarCarritoFunctionForCotizacionesFunctionCOPIASEGURIDAD: async function (body) {
        try{
            var productos = null
            var productosArray

            const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_nombre: "TIPO_CAMBIO_USD"
                }
            });
            var USDValor = constControlMaestroMultiple.cmm_valor

            //Obtener productos ya sea de carrito id o del array de prospectos solo regresar id de productos en mismo formato
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

            if(productosArray.length > 0)
            {

                productos = productosArray

                //Obtener precios base y final con descuento de grupo
                for (var i = 0; i < productos.length; i++) 
                {
                    var cantidad = productos[i].cantidad
                    //Informacion base de productos sustituye el id del producto por toda la informacion del producto
                    const constProducto = await models.Producto.findOne(
                    {
                        where: {
                            prod_producto_id: productos[i].prod_producto_id
                        }
                    });

                    productos[i] = constProducto

                    //DESCUENTOS SN/GRUPO/DIELSA
                        //Si es stock inactivo o prospecto no tendra ni revisara descuentos
                        if(productos[i].dataValues.prod_es_stock_inactivo == true || body.cot_prospecto == true)
                        {
                            productos[i].dataValues.descuentoGrupoBool = false
                            productos[i].dataValues.descuentoGrupo = 0
                            productos[i].dataValues.snDescuento = 0
                        }
                        //Si es cliente ID buscara descuentos de grupo
                        else
                        {
                            //Obtener info SN
                            const constSociosNegocio = await models.SociosNegocio.findOne(
                            {
                                where: {
                                    sn_socios_negocio_id: body.cdc_sn_socio_de_negocio_id
                                },
                                attributes:  ["sn_socios_negocio_id", "sn_cardcode", "sn_codigo_direccion_facturacion", "sn_lista_precios", "sn_codigo_grupo",
                                "sn_porcentaje_descuento_total"]
                            });

                            //Obtener Mejor Promocion y precio final
                            var descuentoGrupo = await productosUtils.getSocioNegocioDiscountPerProduct(productos[i].dataValues, constSociosNegocio);

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
                    

                        var totalPromocion = 0
                        var tipoDescuento = ''

                        var precioTemporal = productos[i].dataValues.prod_precio

                        productos[i].dataValues.cantidad = cantidad

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
                    //END DESCUENTOS SN/GRUPO/DIELSA

                    //Generar precio en USD
                        if(productos[i].dataValues.prod_precio > 0)
                        {
                            productos[i].dataValues.precioBase_USD = parseFloat((productos[i].dataValues.prod_precio/USDValor).toFixed(2))
                        }
                        else
                        {
                            productos[i].dataValues.precioBase_USD = 0
                        }

                        if(productos[i].dataValues.precioBaseMenosDescuentoGrupo > 0)
                        {
                            productos[i].dataValues.precioFinal_USD = parseFloat((productos[i].dataValues.precioBaseMenosDescuentoGrupo/USDValor).toFixed(2))
                        }
                        else
                        {
                            productos[i].dataValues.precioFinal_USD = 0
                        }
                        
                        if(productos[i].dataValues.prod_dias_resurtimiento > 0)
                        {
                            productos[i].dataValues.aplicaBackOrder = true
                        }
                        else
                        {
                            productos[i].dataValues.aplicaBackOrder = false
                        }
                    //Fin Generar precio en USD
                }   //End for


                //Total Cotizado en productos X cantidad
                var totalCotizacion = 0
                for (var j = 0; j < productos.length; j++) 
                {
                    totalCotizacion += (productos[j].dataValues.precioBaseMenosDescuentoGrupo * productos[j].dataValues.cantidad)
                }
                totalCotizacion = parseFloat((totalCotizacion.toFixed(2)))
                var totalCotizacionUSD = totalCotizacion/USDValor
                totalCotizacionUSD = parseFloat((totalCotizacionUSD.toFixed(2)))



                //Cotizar envio
                if(body.cot_prospecto == false)
                {
                    var CotizacionResult = await this.CotizarCarritoFunctionForCotizacionesSNandProspecto(
                        body.cot_prospecto,
                        body.cdc_sn_socio_de_negocio_id,
                        body.tipo_envio,
                        body.snd_direcciones_id,
                        body.recoleccion_almacen_id,
                        3,
                        productos, //Productos total
                        totalCotizacion
                    );
                    console.log(CotizacionResult)
                }
                else
                {
                    var CotizacionResult = await this.CotizarCarritoFunctionForCotizacionesSNandProspecto(
                        body.cot_prospecto,
                        body.up_usuarios_prospectos_id,
                        body.tipo_envio,
                        body.upd_direcciones_id,
                        body.recoleccion_almacen_id,
                        3,
                        productos, //Productos total
                        totalCotizacion
                    );
                    console.log(CotizacionResult)
                }

                var returner = {
                    message: 'Cotizacion envio obtenida con exito',
                    CotizacionResult
                }

                return returner
            }   //end if productos lenght
        }
        catch(e){
            console.log(e)
            return "Error al cotizar carrito"
        }
    },
    //PASO COT 7
    CotizarCarritoFunctionForCotizacionesFunction1: async function (body, productos, totalFinal) {
        try{
            var productosArray

            const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_nombre: "TIPO_CAMBIO_USD"
                }
            });
            var USDValor = constControlMaestroMultiple.cmm_valor

            // //Total Cotizado en productos X cantidad
            // var totalCotizacion = 0
            // for (var j = 0; j < productos.length; j++) 
            // {
            //     totalCotizacion += (productos[j].dataValues.precioBaseMenosDescuentoGrupo * productos[j].dataValues.cantidad)
            // }

            var totalCotizacion = totalFinal
            totalCotizacion = parseFloat((totalFinal.toFixed(2)))
            var totalCotizacionUSD = totalCotizacion/USDValor
            totalCotizacionUSD = parseFloat((totalCotizacionUSD.toFixed(2)))
            console.log(totalCotizacionUSD)

            //Cotizar envio
            if(body.cot_prospecto == false)
            {
                var CotizacionResult = await this.CotizarCarritoFunctionForCotizacionesSNandProspecto(
                    body.cot_prospecto,
                    body.cdc_sn_socio_de_negocio_id,
                    body.tipo_envio,
                    body.snd_direcciones_id,
                    body.recoleccion_almacen_id,
                    3,
                    productos, //Productos total
                    totalCotizacion
                );
                console.log(CotizacionResult)
            }
            else
            {
                var CotizacionResult = await this.CotizarCarritoFunctionForCotizacionesSNandProspecto(
                    body.cot_prospecto,
                    body.up_usuarios_prospectos_id,
                    body.tipo_envio,
                    body.upd_direcciones_id,
                    body.recoleccion_almacen_id,
                    3,
                    productos, //Productos total
                    totalCotizacion
                );
                console.log(CotizacionResult)
            }

            var returner = {
                message: 'Cotizacion envio obtenida con exito',
                CotizacionResult
            }

            return returner
        }
        catch(e){
            console.log(e)
            return "Error al cotizar carrito"
        }
    },
    CotizarCarritoFunctionForCotizacionesFunction: async function (body, productos, totalFinal) {
        try{
           return {
            tipoEnvio: "Recolección",
            fleteraID: 1,
            totalFinal: 0,
            politicaBool: false,
            politicaNombre: "Recolección",
            suertirUnSoloAlmacen: true
        }
        }
        catch(e){
            console.log(e)
            return "Error al cotizar carrito"
        }
    },
    CotizarCarritoFunctionForCotizacionesSNandProspecto: async function (isProspecto, SnProsID, tipoEnvio, direccionEnvioID, almacenID, fleteraID, productos, totalCotizacionUSD) {
        try{
            console.log(isProspecto)
            console.log(SnProsID)
            console.log(tipoEnvio)

            var precioFinal = 0
            var jsonFinal 
            
            //Buscar el nombre del cmm de tipo de envio
            const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_control_id: tipoEnvio
                }
            });

            //16 envio a domicilio
            if(constControlMaestroMultiple.cmm_valor == "Envío domicilio")
            {
                var totalFinalCheckout = totalCotizacionUSD

                //obtener tipo de cambio para convertir a USD y luego comparar
                const constValorUSD = await models.ControlMaestroMultiple.findOne(
                {
                    where: {
                        cmm_nombre: "TIPO_CAMBIO_USD"
                    }
                })

                //Valor de la orden final en USD
                var totalFinalUSD = totalFinalCheckout/constValorUSD.cmm_valor

                console.log(9090239032)

                
                console.log(676767)
                var resultPoliticas = await this.getPoliticasEnvioActivaForCotizacionesSNandProspectos(
                    SnProsID, 
                    direccionEnvioID, 
                    productos, 
                    totalFinalUSD,
                    isProspecto
                );
                console.log(resultPoliticas)

                const constPoliticasEnvioForaneo = await models.PoliticasEnvio.findOne(
                {
                    where: {
                        poe_nombre: "Envio Foraneo Gratis",
                        poe_cmm_estatus_id: 1000172
                    }
                })

                //Si aplica una politica directamente (ACTUALMENTE SOLO CIUDADES Y MONTO MINIMO COMPRA)
                if(resultPoliticas.BoolPolitica == true)
                {
                    if(resultPoliticas.BoolPolitica > 0)
                    {
                        jsonFinal = {
                            tipoEnvio: "Dielsa",
                            fleteraID: 6,
                            totalFinal: resultPoliticas.totalFinal,
                            politicaBool: true,
                            politicaNombre: resultPoliticas.politicaNombre,
                            suertirUnSoloAlmacen: resultPoliticas.suertirUnSoloAlmacen
                        }

                        return jsonFinal
                    }
                    else
                    {
                        jsonFinal = {
                            tipoEnvio: "No fue posible obtener una cotizacion: Error en politica envio",
                            fleteraID: 6,
                            totalFinal: resultPoliticas.totalFinal,
                            politicaBool: false,
                            politicaNombre: '',
                            suertirUnSoloAlmacen: false
                        }
                        return jsonFinal
                    }
                }
                //Validacion directa de si es 250 dolares la orden y los articulos no son mayor a 1 metro
                else if(constPoliticasEnvioForaneo)
                {
                    if(constPoliticasEnvioForaneo.poe_monto_compra_minimo < totalFinalUSD)
                    {
                        var boolMayor1MetroLados = false

                        //Validar dimensiones de los productos
                        for (var i = 0; i < productos.length; i++) 
                        {
                            console.log(9876598765)
                            console.log(productos[i].dataValues.prod_ancho)

                            if(productos[i].dataValues.prod_altura > 1)
                            {
                                boolMayor1MetroLados = true
                            }
                            if(productos[i].dataValues.prod_ancho > 1)
                            {
                                boolMayor1MetroLados = true
                            }
                            if(productos[i].dataValues.prod_longitud > 1)
                            {
                                boolMayor1MetroLados = true
                            }
                        }

                        console.log(boolMayor1MetroLados)
                        //Si la politica de que ningun lado es mayor a 1 metro se aplicara la politica dielsa con costo 0
                        if(boolMayor1MetroLados == false)
                        {
                            jsonFinal = {
                                tipoEnvio: "Dielsa",
                                fleteraID: 6,
                                totalFinal: constPoliticasEnvioForaneo.poe_monto,
                                politicaBool: true,
                                politicaNombre: 'Envio Foraneo Gratis',
                                suertirUnSoloAlmacen: false
                            }

                            return jsonFinal
                        }
                        //Se mandara a llamar a la function de paqueteria express
                        else
                        {
                            console.log("llego al cotizar empress1")
                            var resultPaqueteExpress = await this.getPaqueteExpressApiCotizacionForCotizacionesSNandProspectos(productos, direccionEnvioID, isProspecto);

                            //Si es numero regresara todo bien
                            if(typeof resultPaqueteExpress == 'number')
                            {
                                jsonFinal = {
                                    tipoEnvio: "Paquetexpress",
                                    fleteraID: 3,
                                    totalFinal: resultPaqueteExpress,
                                    politicaBool: false,
                                    politicaNombre: null,
                                    suertirUnSoloAlmacen: false
                                }

                                return jsonFinal
                            }
                            else
                            {
                                jsonFinal = {
                                    tipoEnvio: "No disponible",
                                    fleteraID: 0,
                                    totalFinal: resultPaqueteExpress,
                                    politicaBool: false,
                                    politicaNombre: null,
                                    suertirUnSoloAlmacen: false
                                }

                                return jsonFinal
                            }

                        }


                    }
                    //usar paquete express
                    else
                    {
                        console.log("llego al cotizar empress2")
                        var resultPaqueteExpress = await this.getPaqueteExpressApiCotizacionForCotizacionesSNandProspectos(productos, direccionEnvioID, isProspecto);

                        //Si es numero regresara todo bien
                        if(typeof resultPaqueteExpress == 'number')
                        {
                            jsonFinal = {
                                tipoEnvio: "Paquetexpress",
                                fleteraID: 3,
                                totalFinal: resultPaqueteExpress,
                                politicaBool: false,
                                politicaNombre: null,
                                suertirUnSoloAlmacen: false
                            }

                            return jsonFinal
                        }
                        else
                        {
                            jsonFinal = {
                                tipoEnvio: "No disponible",
                                fleteraID: 0,
                                totalFinal: resultPaqueteExpress,
                                politicaBool: false,
                                politicaNombre: null,
                                suertirUnSoloAlmacen: false
                            }

                            return jsonFinal
                        }

                    }

                    



                }
                else if(direccionEnvioID != null && fleteraID != null)
                {
                    console.log("llego al cotizar empress entro al final3")
                    var resultPaqueteExpress = await this.getPaqueteExpressApiCotizacionForCotizacionesSNandProspectos(productos, direccionEnvioID, isProspecto);
                    //Si es numero regresara todo bien
                    if(typeof resultPaqueteExpress == 'number')
                    {
                        jsonFinal = {
                            tipoEnvio: "Paquetexpress",
                            fleteraID: 3,
                            totalFinal: resultPaqueteExpress,
                            politicaBool: false,
                            politicaNombre: null,
                            suertirUnSoloAlmacen: false
                        }

                        return jsonFinal
                    }
                    else
                    {
                        jsonFinal = {
                            tipoEnvio: "No disponible",
                            fleteraID: 0,
                            totalFinal: resultPaqueteExpress,
                            politicaBool: false,
                            politicaNombre: null,
                            suertirUnSoloAlmacen: false
                        }

                        return jsonFinal
                    }
                }


                


                


                

            }
            //17 recoleccion
            else
            {
                if(almacenID != null)
                {
                    jsonFinal = {
                        tipoEnvio: "Recolección",
                        fleteraID: almacenID,
                        totalFinal: precioFinal,
                        politicaBool: false,
                        politicaNombre: "Recolección",
                        suertirUnSoloAlmacen: true
                    }
                    return jsonFinal
                }
                else 
                {
                    return precioFinal
                }
            }
        }
        catch(e){
            console.log(e)
            return "Error al cotizar carrito"
        }
    },

    getPoliticasEnvioActivaForCotizacionesSNandProspectos: async function (SnID, direccionID, productos, totalFinalUSD, isProspecto) {
        try{
            console.log(isProspecto)
            var resultadoFinal = {
                "BoolPolitica": false,
                "totalFinal": 0,
                "tipoPoliticaEnvio": '',
                "politicaID": '',
                "politicaNombre": ''
            }

            //Buscar politica de codigo postal
            //Obtener Informacion de la direccion de envio
            var ciudad_nombre = ''
            if(isProspecto == false)
            {
                //Buscar politica de codigo postal
                const constSociosNegocioDirecciones = await models.SociosNegocioDirecciones.findOne(
                {
                    where: {
                        snd_direcciones_id: direccionID
                    }
                })
                if(constSociosNegocioDirecciones)
                {
                    ciudad_nombre = constSociosNegocioDirecciones.snd_ciudad
                }
                
            }
            else
            {
                console.log("entro al getPoliticasEnvioActivaForCotizacionesSNandProspectos prospecto")
                //Buscar politica de codigo postal
                const constUsuariosProspectosDirecciones = await models.UsuariosProspectosDirecciones.findOne(
                {
                    where: {
                        upd_direcciones_id: direccionID
                    }
                })

                if(constUsuariosProspectosDirecciones)
                {
                    ciudad_nombre = constUsuariosProspectosDirecciones.upd_ciudad
                }

            }

            //Si existe la direccion de envio continuara
            var aplicaPoliticaBool = false
            var totalFinal = 99999999999
            var tipoPoliticaEnvio
            var politicaID
            var politicaNombre
            var suertirUnSoloAlmacen = false
            
            //Obtener ciudad ID para hacer match con las politicas de ciudades
            var queryCiudades = `
                select 
                    city_ciudades_estados_id 
                from 
                    ciudades_estados ce 
                where
                    lower(ce.city_ciudad) = lower('`+ciudad_nombre+`') 
            `;

            //OBTIENE LOS ELEMENTOS BUSCADOS
            const constqueryCiudades = await sequelize.query(queryCiudades,
            { 
                type: sequelize.QueryTypes.SELECT 
            });


            if(constqueryCiudades.length > 0)
            {
                //Buscar politica por ciudad y por monto minimo
                var queryconstPoliticasEnvioDataByCP = `
                    SELECT 
                        poedata_poe_politicas_envio_id,
                        poe_monto,
                        poe_nombre
                    FROM politicas_envio_data ped
                    left join politicas_envio pe on pe.poe_politicas_envio_id = ped.poedata_poe_politicas_envio_id 
                    where
                        ped.poedata_city_ciudades_estados_id = `+constqueryCiudades[0].city_ciudades_estados_id+`
                        and `+totalFinalUSD+` > pe.poe_monto_compra_minimo 
                        and pe.poe_cmm_estatus_id = 1000172
                        and pe.poe_nombre != 'Envio Foraneo Gratis'
                    group by poedata_poe_politicas_envio_id, poe_monto, poe_nombre
                    
                `;

                //OBTIENE LOS ELEMENTOS BUSCADOS
                const constPoliticasEnvioDataByCP = await sequelize.query(queryconstPoliticasEnvioDataByCP,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });
                

                //Recorrer las politicas de envio por CP
                if(constPoliticasEnvioDataByCP.length > 0)
                {
                    //Buscara en el arreglo la mejor politica o las mas "barata" para establecerla como final
                    for (var i = 0; i < constPoliticasEnvioDataByCP.length; i++) 
                    {
                        console.log(constPoliticasEnvioDataByCP[i])
                        //Variable bool (validar si la orden puede ser surtida de un solo almacen)
                        var resultSurtidoFromAlmacenes = await this.getPoliticasLineasAlmacenesForCotizacionesSNandProspectos(productos, direccionID, isProspecto);
                        //Significa que toda la orden se puede surtir de esta politica (NO ACTIVO)
                        if(resultSurtidoFromAlmacenes == true)
                        {
                            //Comparar precios para tomar el menor en caso de que vengan mas de 1
                            if(constPoliticasEnvioDataByCP[i].poe_monto < totalFinal)
                            {
                                totalFinal = constPoliticasEnvioDataByCP[i].poe_monto
                                tipoPoliticaEnvio = "Codigo Postal"
                                politicaID = constPoliticasEnvioDataByCP[i].poedata_poe_politicas_envio_id
                                aplicaPoliticaBool = true
                                politicaNombre = constPoliticasEnvioDataByCP[i].poe_nombre
                                suertirUnSoloAlmacen = true
                            }
                        }
                        else
                        {
                            //Comparar precios para tomar el menor en caso de que vengan mas de 1
                            if(constPoliticasEnvioDataByCP[i].poe_monto < totalFinal)
                            {
                                totalFinal = constPoliticasEnvioDataByCP[i].poe_monto
                                tipoPoliticaEnvio = "Codigo Postal"
                                politicaID = constPoliticasEnvioDataByCP[i].poedata_poe_politicas_envio_id
                                aplicaPoliticaBool = true
                                politicaNombre = constPoliticasEnvioDataByCP[i].poe_nombre
                            }
                        }
                    }
                }   //Fin IF politicas CP

            }


            //Resultado final despues de validar todas las politicas de envio
            if(aplicaPoliticaBool == true)
            {
                resultadoFinal = {
                    "BoolPolitica": true,
                    "totalFinal": totalFinal,
                    "tipoPoliticaEnvio": tipoPoliticaEnvio,
                    "politicaID": politicaID,
                    "politicaNombre": politicaNombre,
                    "suertirUnSoloAlmacen": suertirUnSoloAlmacen
                }
            }

            return resultadoFinal
        }
        catch(e){
            console.log(e)
            return "No fue posible regresar las lineas de productos para dividir la orden en almacenes"
        }
    },

    getPoliticasLineasAlmacenesForCotizacionesSNandProspectos: async function (productos, direccionID, isProspecto) {
        try{
            var almacenCodigoPrincipal
            var almacenCodigoSecundario

            //Variable que se regresara para saber si se puede surtir toda la orden del almacen principal segun la logistica almacen de la direccion de envio
            var surtinUnSoloAlmacen = true

            //Obtener almacen asignado al cliente (primario)
            const constSociosNegocioDirecciones = await models.SociosNegocioDirecciones.findOne(
            {
                where: {
                    snd_direcciones_id: direccionID
                }
            });

            //Obtener almacenes primarios
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

            console.log("almacen princiapL          " + almacenCodigoPrincipal)
            console.log("almacen secundario         " + almacenCodigoSecundario)


            //Obtener lineas
            for (var i = 0; i < productos.length; i++) 
            {
                console.log("entro")
                console.log(444443333)
                var aplicaBackOrder = productos[i].dataValues.aplicaBackOrder
                console.log(aplicaBackOrder)
                var inventarioFaltante = productos[i].dataValues.cantidad
                console.log(inventarioFaltante)

                var breaker = 0;
                var stockDisponible = productos[i].dataValues.prod_total_stock
                var stockPrimarioDisponible = true
                var stockSecundarioDisponible = true
                productos[i].dataValues.backOrderPrecioLista = false

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
                                    cantidadDisponible = 0
                                    inventarioFaltante = 0
                                    stockDisponible = 0
                                }
                                //Surtir parcial 
                                else
                                {
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
                            //Si entra aqui de golpe ya seria false porque no se puede surtir de un solo lugar
                            surtinUnSoloAlmacen = false

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
                                    cantidadDisponible = 0
                                    inventarioFaltante = 0
                                    stockDisponible = 0
                                }
                                //Surtir parcial 
                                else
                                {
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
                        //Dejar aqui en 0 para que no se cicle si es que el codigo de arriba queda comentado
                        inventarioFaltante = 0
                    }

                    breaker++
                    if(breaker == 50)
                    {
                        break
                    } 
                }
            }

            return surtinUnSoloAlmacen
        }
        catch(e){
            console.log(e)
            return "No fue posible regresar las lineas de productos para dividir la orden en almacenes"
        }
    },

    getPaqueteExpressApiCotizacionForCotizacionesSNandProspectos: async function (productos, direccionID, isProspecto) {
        try{
            var precioFinal = -1
            console.log(66666666)

            var boolValidarDimensiones = await this.validarDimensionesCarritoProductoForCotizacionesSNandProspectos(productos);
            console.log("boolValidarDimensiones: " + boolValidarDimensiones)

            console.log(7777777777777777)
            if(boolValidarDimensiones == true)
            {
                //Variable que determina si el envio es gratis porque ninguna dimension del paquete es mayor a 1m
                var volumenTotal = 0
                var pesoTotal = 0

                var anchoTotal = 0
                var alturaTotal = 0
                var longitudTotal = 0

                //obtener volumen total y peso
                for (var i = 0; i < productos.length; i++)
                {
                    //Peso total
                    volumenTotal += (productos[i].dataValues.prod_volumen * productos[i].dataValues.cantidad)
                    pesoTotal += (productos[i].dataValues.prod_peso * productos[i].dataValues.cantidad)
                }

                console.log("volumenTotal: " + volumenTotal)

                if(volumenTotal < 0.0062496)
                {
                    volumenTotal = 0.0062496
                }
                else
                {
                    var cantidadCajas = Math.ceil(volumenTotal/0.0062496)

                    console.log("cantidadCajas: " + cantidadCajas)


                    volumenTotal = cantidadCajas * 0.0062496
                    console.log("VolumenFinal: "+ volumenTotal)
                }

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
                var codigoPostal = ''
                var colonia = ''

                if(isProspecto == false)
                {
                    //Obtener informacion de direccion de envio
                    const constSociosNegocioDirecciones = await models.SociosNegocioDirecciones.findOne(
                    {
                        where: {
                            snd_direcciones_id: direccionID
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
                        const constAlmacenesColonia = await models.Almacenes.findOne(
                        {
                            where: {
                                alm_codigoAlmacen: AlmacenesLogistica.almlog_almacen_codigo
                            }
                        });

                        almacenCP = constAlmacenesColonia.alm_codigo_postal
                        almacenColonia = constAlmacenesColonia.alm_nombre
                        codigoPostal = constSociosNegocioDirecciones.snd_codigo_postal
                        colonia = constSociosNegocioDirecciones.snd_colonia
                    }

                }
                else
                {
                    //Obtener informacion de direccion de envio
                    const constUsuariosProspectosDirecciones = await models.UsuariosProspectosDirecciones.findOne(
                    {
                        where: {
                            upd_direcciones_id: direccionID
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
                        console.log(estadoValor2)

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
                        codigoPostal = constUsuariosProspectosDirecciones.upd_codigo_postal
                        colonia = constUsuariosProspectosDirecciones.upd_colonia
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
                        'url': 'https://cc.paquetexpress.com.mx/WsQuotePaquetexpress/api/apiQuoter/v2/getQuotation',
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
                                    "token": "E54A91979F2F0104E053C0A80A149729"
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
                                            "zipCode": codigoPostal,
                                            "colonyName": colonia
                                        },
                                        "services": {
                                            "dlvyType": "1",
                                            "ackType": "N",
                                            "totlDeclVlue": 0,
                                            "invType": "N",
                                            "radType": "1"
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

                    console.log(options)

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
                        'url': 'https://cc.paquetexpress.com.mx/WsQuotePaquetexpress/api/apiQuoter/v2/getQuotation',
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
                                    "token": "E54A91979F2F0104E053C0A80A149729"
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
                                            "zipCode": codigoPostal,
                                            "colonyName": colonia
                                        },
                                        "services": {
                                            "dlvyType": "1",
                                            "ackType": "N",
                                            "totlDeclVlue": 0,
                                            "invType": "N",
                                            "radType": "1"
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

                    console.log(options)

                    var result = await request(options, function (error, response) {
                        if (error) throw new Error(error);
                        
                    });

                    var resultJson = JSON.parse(result);

                    console.log(result)

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
                    return precioFinal
                }
                else
                {
                    return "No fue posible cotizar"
                }


            }
            else
            {
                return "No fue posible cotizar: productos con dimension en 0"
            }



        }
        catch(e){
            console.log(e)
            return "Error al utilizar paquete express api"
        }
    },

    validarDimensionesCarritoProductoForCotizacionesSNandProspectos: async function (productos) {
        try{
            //Variable que se regresara al final
            var validarReturn = true

            //Obtener lineas
            for (var i = 0; i < productos.length; i++) 
            {
                //Obtener almacen asignado al cliente (primario)
                const constProducto = await models.Producto.findOne(
                {
                    where: {
                        prod_producto_id: productos[i].prod_producto_id
                    },
                    attributes: ["prod_peso", "prod_volumen"]
                })
                var aplicaBackOrder = false
                //Si aplica backorder bool
                if(constProducto.prod_peso == 0 || constProducto.prod_volumen == 0 )
                {
                    validarReturn = false
                }
            }
            return validarReturn
        }
        catch(e){
            console.log(e)
            return false
        }
    },
};


