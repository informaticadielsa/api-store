import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import request from 'request-promise';
import systemLog from "../services/systemLog"
import {integracionEmail} from '../services/integracionEmail'

export default {
   


    rawIntegracionSociosNegocios: async(req, res, next) =>{
        try{


            var options = {
                  'method': 'GET',
                  'url': process.env.INTEGRATIONS_URL + '/Service1.svc/SociosNegocios',
                  'headers': {
                    'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                }
            };

            console.log(options)

            var result = await request(options, function (error, response) {
                if (error) throw new Error(error);
                
            });

            var resultJson = JSON.parse(result);

            console.log(resultJson.estatus);




            //Si Estatus es 2 Significa que la API trajo datos
            if(resultJson.estatus == 2)
            {
                //console.log('El Status es: ' + resultJson.Estatus);
                var jsonApi = resultJson.sociosNegocios;

                // for (var i =  0; i <= AllItems.length; i++)
                for (var i =  0; i < jsonApi.length; i++) 
                {
                    console.log("El numero de entrada es: " + i);
                    //console.log("INTENTANDO: " + AllItems[i].CardCode);


                    //Busca si el socio de negocio existe
                    const constRawSociosNegocios = await models.RawSociosNegocios.findOne(
                    {
                        where: {
                            codigoCliente: jsonApi[i].codigoCliente
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });


                    //Actualiza o crea en la BD
                    if(constRawSociosNegocios) {
                        var creado = await constRawSociosNegocios.update(jsonApi[i]);

                        //if false es que ya existe
                        //var isNew = creado._options.isNewRecord;  
                    }
                    else{
                        var creado = await models.RawSociosNegocios.create(jsonApi[i]);
                        //if true es que ya existe
                        //var isNew = creado._options.isNewRecord;
                    }


                    //DIRECCIONES
                        //Busca si el codigo de cliente se inserto, actualizo o existe para luego actualizar sus direcciones
                        const constRawSociosNegociosParaDirecciones = await models.RawSociosNegocios.findOne(
                        {
                            where: {
                                codigoCliente: jsonApi[i].codigoCliente
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}   
                        });

                        
                        //Si el socio de negocio existe, actualizara o creara las direcciones
                        if(constRawSociosNegociosParaDirecciones)
                        {
                            //for de direcciones update/insert
                            for (var j = 0; j < jsonApi[i].direcciones.length; j++){
                                //Agrega la columna codigoClientePadreParaRelacionar
                                jsonApi[i].direcciones[j].codigoClientePadre = jsonApi[i].codigoCliente;

                                //Busca si el registro de direcciones ya existe
                                const constRawSociosNegociosDirecciones = await models.RawSociosNegociosDirecciones.findOne(
                                {
                                    where: {
                                        idDireccion: jsonApi[i].direcciones[j].idDireccion.toString(),
                                        codigoClientePadre: jsonApi[i].codigoCliente.toString(),
                                        tipoDir: jsonApi[i].direcciones[j].tipoDir.toString()
                                    },
                                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                                });


                                //Actualiza/Inserta Direcciones en la BD
                                if(constRawSociosNegociosDirecciones) {
                                    var creado = await constRawSociosNegociosDirecciones.update(jsonApi[i].direcciones[j]);
                                }
                                else{
                                    var creado = await models.RawSociosNegociosDirecciones.create(jsonApi[i].direcciones[j]);
                                }
                            } //Fir FOR direcciones
                        }

                    //FIN DIRECCIONES

                }//FIN FOR TODOS LOS REGISTROS SN

            }

            await systemLog.insertLog('Integracion Socio Negocios Raw','Integracion Socio Negocios Raw: correctamente.', '1.-webApi', 'Sistema', 'informative')
          //  integracionEmail('Integracion Socio Negocios Raw: correctamente.')

            //Response
            res.status(200).send(
            {
                message: 'Integracion Raw Socios Negocios OK',
                
            })
            
        }catch(e){
            await systemLog.insertLog('Integracion Socio Negocios Raw','Integracion Socio Negocios Raw: error en la petición.', '1.-webApi', 'Sistema', 'warning')
            integracionEmail('Integracion Socio Negocios Raw: error en la petición.')
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    rawIntegracionSociosNegociosOnlyOne: async(req, res, next) =>{
        try{



            if(req.body.factor_integracion == null || req.body.factor_integracion == '')
            {
                var options = {
                      'method': 'GET',
                      'url': process.env.INTEGRATIONS_URL + '/Service1.svc/SociosNegocios',
                      'headers': {
                        'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                    }
                };
                var result = await request(options, function (error, response) {
                    if (error) throw new Error(error);
                    
                });

                var resultJson = JSON.parse(result);

            }
            else
            {
                var options = {
                      'method': 'GET',
                      'url': process.env.INTEGRATIONS_URL + '/Service1.svc/SociosNegocios/'+req.body.factor_integracion,
                      'headers': {
                        'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                    }
                };
                var result = await request(options, function (error, response) {
                    if (error) throw new Error(error);
                    
                });

                var resultJson = JSON.parse(result);
                console.log(options)
            }

            
            //console.log(resultJson.estatus);




            //Si Estatus es 2 Significa que la API trajo datos
            if(resultJson.estatus == 2)
            {
                console.log("entro")
                //console.log('El Status es: ' + resultJson.Estatus);
                var jsonApi = resultJson.sociosNegocios;


                   console.log(jsonApi.length)
                // for (var i =  0; i <= AllItems.length; i++)
                for (var i =  0; i < jsonApi.length; i++) 
                {
                    console.log("El numero de entrada es: " + i);
                    //console.log("INTENTANDO: " + AllItems[i].CardCode);


                    //Busca si el socio de negocio existe
                    const constRawSociosNegocios = await models.RawSociosNegocios.findOne(
                    {
                        where: {
                            codigoCliente: jsonApi[i].codigoCliente
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });


                    //Actualiza o crea en la BD
                    if(constRawSociosNegocios) {
                        var creado = await constRawSociosNegocios.update(jsonApi[i]);

                        //if false es que ya existe
                        //var isNew = creado._options.isNewRecord;  
                    }
                    else{
                        var creado = await models.RawSociosNegocios.create(jsonApi[i]);
                        //if true es que ya existe
                        //var isNew = creado._options.isNewRecord;
                    }


                    //DIRECCIONES
                        //Busca si el codigo de cliente se inserto, actualizo o existe para luego actualizar sus direcciones
                        const constRawSociosNegociosParaDirecciones = await models.RawSociosNegocios.findOne(
                        {
                            where: {
                                codigoCliente: jsonApi[i].codigoCliente
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}   
                        });

                        
                        //Si el socio de negocio existe, actualizara o creara las direcciones
                        if(constRawSociosNegociosParaDirecciones)
                        {
                            //for de direcciones update/insert
                            for (var j = 0; j < jsonApi[i].direcciones.length; j++){
                                //Agrega la columna codigoClientePadreParaRelacionar
                                jsonApi[i].direcciones[j].codigoClientePadre = jsonApi[i].codigoCliente;

                                //Busca si el registro de direcciones ya existe
                                const constRawSociosNegociosDirecciones = await models.RawSociosNegociosDirecciones.findOne(
                                {
                                    where: {
                                        idDireccion: jsonApi[i].direcciones[j].idDireccion.toString(),
                                        codigoClientePadre: jsonApi[i].codigoCliente.toString(),
                                        tipoDir: jsonApi[i].direcciones[j].tipoDir.toString()
                                    },
                                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                                });


                                //Actualiza/Inserta Direcciones en la BD
                                if(constRawSociosNegociosDirecciones) {
                                    var creado = await constRawSociosNegociosDirecciones.update(jsonApi[i].direcciones[j]);
                                }
                                else{
                                    var creado = await models.RawSociosNegociosDirecciones.create(jsonApi[i].direcciones[j]);
                                }
                            } //Fir FOR direcciones
                        }

                    //FIN DIRECCIONES

                }//FIN FOR TODOS LOS REGISTROS SN

            }


            //Response
            res.status(200).send(
            {
                message: 'Integracion Raw Socios Negocios OK',
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },


    rawIntegracionSnPropiedades: async(req, res, next) =>{
        try{

            //REQUEST DE LA API Y DATOS DE RETORNO
                
                var options = {
                    'method': 'GET',
                    'url': process.env.INTEGRATIONS_URL + '/Service1.svc/SnPropiedades',
                    'headers': {
                        'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                    }
                };
                
                var result = await request(options, function (error, response) 
                {
                    if (error) throw new Error(error);
                });

                var resultJson = JSON.parse(result);

            //FIN RETORN REQUEST

          
            //Si Estatus es 2 Significa que la API trajo datos
            if(resultJson.estatus == 2)
            {
                var jsonApi = resultJson.propiedades;
                   
                for (var i =  0; i < jsonApi.length; i++) 
                {
                  
                    //Busca si la propiedad de snPropiedad existe
                    const constRawSnPropiedades = await models.RawSnPropiedades.findOne(
                    {
                        where: {
                            propiedad: jsonApi[i].propiedad
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });


                    //Actualiza o crea en la BD
                    if(constRawSnPropiedades) {
                        var creado = await constRawSnPropiedades.update(jsonApi[i]);
                    }
                    else{
                        var creado = await models.RawSnPropiedades.create(jsonApi[i]);
                    }


                }//FIN FOR TODOS LOS REGISTROS SN

            }


            await systemLog.insertLog('Integracion SN Propiedades Raw','Integracion SN Propiedades Raw: correctamente.', '1.-webApi', 'Sistema', 'informative')
           // integracionEmail('Integracion SN Propiedades Raw: correctamente.')
            //Response
            res.status(200).send(
            {
                message: 'Integracion Raw SnPropiedades OK',
                
            })
            
        }catch(e){
            await systemLog.insertLog('Integracion SN Propiedades Raw','Integracion SN Propiedades Raw: error en la petición.', '1.-webApi', 'Sistema', 'warning')
            integracionEmail('Integracion SN Propiedades Raw: error en la petición.')
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },


    rawIntegracionSnGrupos: async(req, res, next) =>{
        try{

            //REQUEST DE LA API Y DATOS DE RETORNO
                var options = 
                {
                    'method': 'GET',
                    'url': process.env.INTEGRATIONS_URL + '/Service1.svc/SnGrupos',
                    'headers': {
                        'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                    }
                };

                var result = await request(options, function (error, response) 
                {
                    if (error) throw new Error(error);
                });

                var resultJson = JSON.parse(result);

            //FIN RETORN REQUEST

            




            //Si Estatus es 2 Significa que la API trajo datos
            if(resultJson.estatus == 2)
            {
                
                var jsonApi = resultJson.grupos;
                for (var i =  0; i < jsonApi.length; i++) 
                {
                    
                    //Busca si el grupo existe
                    const constRawSnGrupos = await models.RawSnGrupos.findOne(
                    {
                        where: {
                            codigoGrupo: jsonApi[i].codigoGrupo
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });


                    //Actualiza o crea en la BD
                    if(constRawSnGrupos) {
                        var creado = await constRawSnGrupos.update(jsonApi[i]);
                    }
                    else{
                        var creado = await models.RawSnGrupos.create(jsonApi[i]);
                    }


                }//FIN FOR TODOS LOS REGISTROS SN

            }

            await systemLog.insertLog('Integracion sn Grupos Raw','Integracion sn Grupos Raw: correctamente.', '1.-webApi', 'Sistema', 'informative')
           // integracionEmail('Integracion sn Grupos Raw: correctamente.')
            //Response
            res.status(200).send(
            {
                message: 'Integracion Raw SnGrupos OK',
                
            })
            
        }catch(e){
            await systemLog.insertLog('Integracion sn Grupos Raw','Integracion sn Grupos Raw: error en la petición.', '1.-webApi', 'Sistema', 'warning')
            integracionEmail('Integracion sn Grupos Raw: error en la petición.')
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },


    rawIntegracionArticulos: async(req, res, next) =>{
        try{

            //REQUEST DE LA API Y DATOS DE RETORNO
                var options = {
                    'method': 'GET',
                    'url': process.env.INTEGRATIONS_URL + '/Service1.svc/Articulos/0---1',
                    'headers': {
                        'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                    }
                };
 
                var resultCantidadArticulos = await request(options, function (error, response) 
                {
                    if (error) throw new Error(error);
                });

                //Resultado API para obtener total Articulos
                resultCantidadArticulos = JSON.parse(resultCantidadArticulos);


                //Si se tiene un total de articulos de la API comenzara a integrar
                if(resultCantidadArticulos.estatus == 2)
                {
                    //console.log("Funciona: " + resultCantidadArticulos.totalRegs);

                    var TotalArticulos = resultCantidadArticulos.totalRegs;
                    //For que recorrera todos los articulos de 10,000 en 10,000
                    for (var j = 0; j < TotalArticulos; j++) 
                    {

                        //Controla el final de articulos
                        var tempFinal = j+10000;
                        if(tempFinal > TotalArticulos)
                        {
                            tempFinal = TotalArticulos;
                        }

                        //Llama la api en rangos de 0 a 10,000
                        var options = {
                            'method': 'GET',
                            'url': process.env.INTEGRATIONS_URL + '/Service1.svc/Articulos/'+j+'---'+tempFinal,
                            'headers': {
                                'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                            }
                        };

                        var result = await request(options, function (error, response) 
                        {
                            if (error) throw new Error(error);
                        });

                        //Resultado API para obtener total Articulos
                        var resultJson = JSON.parse(result);

                        //Si estatus 2 significa que todo bien en la consulta a la API
                        if(resultJson.estatus == 2)
                        {
                            var jsonApi = resultJson.articulos;

                            //Recorrera el total de articulos traidos
                            for (var i =  0; i < jsonApi.length; i++) 
                            {

                                if(jsonApi[i].skuPadre != '')
                                {
                                    //Busca si el grupo existe
                                    const constRawArticulos = await models.RawArticulos.findOne(
                                    {
                                        where: {
                                            codigoArticulo: jsonApi[i].codigoArticulo
                                        },
                                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                                    });


                                    //Actualiza o crea en la BD
                                    if(constRawArticulos) {
                                        var creado = await constRawArticulos.update(jsonApi[i]);
                                    }
                                    else{
                                        var creado = await models.RawArticulos.create(jsonApi[i]);
                                    }
                                }
                                


                            }//FIN FOR TODOS LOS REGISTROS SN

                        }

                        //Variable que establece el nuevo inicio al finalizar un ciclo for
                        j = tempFinal;
                    
                    }

                }

                await systemLog.insertLog('Integracion Articulos raw','Integracion Articulos raw: correctamente.', '1.-webApi', 'Sistema', 'informative')
              //  integracionEmail('Integracion Articulos raw: correctamente.')


            //Response
            res.status(200).send(
            {
                message: 'Testing Peticion',
                
            })
            
        }catch(e){
            await systemLog.insertLog('Integracion Articulos raw','Integracion Articulos raw: error en la petición.', '1.-webApi', 'Sistema', 'warning')
            integracionEmail('Integracion Articulos raw: error en la petición.')
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },


    rawIntegracionArticulosPropiedades: async(req, res, next) =>{
        try{

            //REQUEST DE LA API Y DATOS DE RETORNO
                var options = {
                    'method': 'GET',
                    'url': process.env.INTEGRATIONS_URL + '/Service1.svc/ArticulosPropiedades',
                    'headers': {
                        'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                    }
                };

                var result = await request(options, function (error, response) 
                {
                    if (error) throw new Error(error);
                });
                var resultJson = JSON.parse(result);



            //FIN RETORN REQUEST

            
            //Si Estatus es 2 Significa que la API trajo datos
            if(resultJson.estatus == 2)
            {
                //console.log('El Status es: ' + resultJson.Estatus);
                var jsonApi = resultJson.propiedades;
                    
                for (var i =  0; i < jsonApi.length; i++) 
                {
                    
                    //Busca si el grupo existe
                    const constRawArticulosPropiedades = await models.RawArticulosPropiedades.findOne(
                    {
                        where: {
                            propiedad: jsonApi[i].propiedad
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });


                    //Actualiza o crea en la BD
                    if(constRawArticulosPropiedades) {
                        var creado = await constRawArticulosPropiedades.update(jsonApi[i]);
                    }
                    else{
                        var creado = await models.RawArticulosPropiedades.create(jsonApi[i]);
                    }


                }//FIN FOR TODOS LOS REGISTROS SN

            }


            //Response
            res.status(200).send(
            {
                message: 'Integracion Raw Articulos Propiedades',
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },


    rawIntegracionArticulosGrupos: async(req, res, next) =>{
        try{

            //REQUEST DE LA API Y DATOS DE RETORNO
                
                var options = {
                    'method': 'GET',
                    'url': process.env.INTEGRATIONS_URL + '/Service1.svc/ArticulosGrupos',
                    'headers': {
                        'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                    }
                };
                
                var result = await request(options, function (error, response) 
                {
                    if (error) throw new Error(error);
                });
                var resultJson = JSON.parse(result);


            //FIN RETORN REQUEST


            //Si Estatus es 2 Significa que la API trajo datos
            if(resultJson.estatus == 2)
            {
                
                var jsonApi = resultJson.grupos

                for (var i =  0; i < jsonApi.length; i++) 
                {
                    //Busca si el grupo existe
                    const constRawArticulosGrupos = await models.RawArticulosGrupos.findOne(
                    {
                        where: {
                            codigoGrupo: jsonApi[i].codigoGrupo
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });


                    //Actualiza o crea en la BD
                    if(constRawArticulosGrupos) {
                        var creado = await constRawArticulosGrupos.update(jsonApi[i]);
                    }
                    else{
                        var creado = await models.RawArticulosGrupos.create(jsonApi[i]);
                    }


                }//FIN FOR TODOS LOS REGISTROS SN

            }
            await systemLog.insertLog('Integracion Articulos Grupos','Integracion Articulos Grupos: correctamente.', '1.-webApi', 'Sistema', 'informative')
           // integracionEmail('Integracion Articulos Grupos: correctamente.')


            //Response
            res.status(200).send(
            {
                message: 'Integracion Raw Articulos Grupos OK',
                
            })
            
        }catch(e){
            await systemLog.insertLog('Integracion Articulos Grupos','Integracion Articulos Grupos: error en la petición.', '1.-webApi', 'Sistema', 'warning')
            integracionEmail('Integracion Articulos Grupos: error en la petición.')
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },



    rawIntegracionArticulosBom: async(req, res, next) =>{
        try{

            //REQUEST DE LA API Y DATOS DE RETORNO
                var options = {
                    'method': 'GET',
                    'url': process.env.INTEGRATIONS_URL + '/Service1.svc/ArticulosBOM',
                    'headers': {
                        'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                    }
                };

                var result = await request(options, function (error, response) 
                {
                    if (error) throw new Error(error);
                });
                var resultJson = JSON.parse(result);

            //FIN RETORN REQUEST



            if(resultJson.estatus == 2)
            {
                var jsonApi = resultJson.articulos

                for (var i =  0; i < jsonApi.length; i++) 
                {


                    //Busca si el Articulo Bom existe
                    const constRawArticulosBom = await models.RawArticulosBom.findOne(
                    {
                        where: {
                            codigoArticulo: jsonApi[i].codigoArticulo
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });


                    //Actualiza o crea en la BD
                    if(constRawArticulosBom) {
                        var creado = await constRawArticulosBom.update(jsonApi[i]);
                    }
                    else{
                        var creado = await models.RawArticulosBom.create(jsonApi[i]);
                    }



                    //Componentes
                        //Busca si el codigo del articulo inserto, actualizo o existe para luego actualizar sus componentes
                        const constRawArticulosBomComponentes = await models.RawArticulosBom.findOne(
                        {
                            where: {
                                codigoArticulo: jsonApi[i].codigoArticulo
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}   
                        });

                        
                        //Si el codigo de articulo existe agregara sus ocmponentes
                        if(constRawArticulosBomComponentes)
                        {
                            //for de componentes update/insert
                            for (var j = 0; j < jsonApi[i].componentes.length; j++){
                                //Agrega la columna codigoClientePadre Para Relacionar bom - componentes
                                jsonApi[i].componentes[j].codigoArticulo_padre = jsonApi[i].codigoArticulo.toString();


                                //Busca si el registro de componente de articulo ya existe
                                const constRawArticulosBomComponentesDetalle = await models.RawArticulosBomComponentes.findOne(
                                {
                                    where: {
                                        codigoArticulo: jsonApi[i].componentes[j].codigoArticulo.toString(),
                                        codigoArticulo_padre: jsonApi[i].componentes[j].codigoArticulo_padre
                                    },
                                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                                });


                                //Actualiza/Inserta componentes de articulo en la BD
                                if(constRawArticulosBomComponentesDetalle) {
                                    var creado = await constRawArticulosBomComponentesDetalle.update(jsonApi[i].componentes[j]);
                                }
                                else{
                                    var creado = await models.RawArticulosBomComponentes.create(jsonApi[i].componentes[j]);
                                }
                            } //Fir FOR direcciones
                        }
                    // FIN Componentes

                }//FIN FOR TODOS LOS REGISTROS SN

            }


            //Response
            res.status(200).send(
            {
                message: 'Integracion Raw Articulos BOM OK',
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },


    rawIntegracionAlmacenes: async(req, res, next) =>{
        try{

            //REQUEST DE LA API Y DATOS DE RETORNO

                var options = {
                    'method': 'GET',
                    'url': process.env.INTEGRATIONS_URL + '/Service1.svc/Almacenes',
                    'headers': {
                        'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                    } 
                };
                var result = await request(options, function (error, response) 
                {
                    if (error) throw new Error(error);
                });
                var resultJson = JSON.parse(result);

            //FIN RETORN REQUEST

            //Si Estatus es 2 Significa que la API trajo datos

            if(resultJson.estatus == 2)
            {
                
                var jsonApi = resultJson.almacenes;

                for (var i =  0; i < jsonApi.length; i++) 
                {
                    //Busca si el almacen existe
                    const constRawAlmacenes = await models.RawAlmacenes.findOne(
                    {
                        where: {
                            codigoAlmacen: jsonApi[i].codigoAlmacen
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });


                    //Actualiza o crea en la BD
                    if(constRawAlmacenes) {
                        var creado = await constRawAlmacenes.update(jsonApi[i]);
                    }
                    else{
                        var creado = await models.RawAlmacenes.create(jsonApi[i]);
                    }


                }//FIN FOR TODOS LOS REGISTROS SN

            }

           

            await systemLog.insertLog('Integracion Almacenes','Integracion Almacenes: correctamente.', '1.-webApi', 'Sistema', 'informative')
           // integracionEmail('Integracion Almacenes: correctamente.')
            //Response
            res.status(200).send(
            {
                message: 'Integracion Raw Almacenes OK',
                
            })
            
        }catch(e){
            await systemLog.insertLog('Integracion Almacenes','Integracion Almacenes: error en la petición.', '1.-webApi', 'Sistema', 'warning')
            integracionEmail('Integracion Almacenes: error en la petición.')
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },



    // rawIntegracionInventario: async(req, res, next) =>{
    //     try{

    //         //REQUEST DE LA API Y DATOS DE RETORNO
    //         var options = {
    //             'method': 'GET',
    //             'url': process.env.INTEGRATIONS_URL + '/Service1.svc/Inventario/1---3',
    //             'headers': {
    //                 'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
    //             }
    //         };

    //         var resultCantidadArticulos = await request(options, function (error, response) 
    //         {
    //             if (error) throw new Error(error);
    //         });

    //         //Resultado API para obtener total Articulos
    //         resultCantidadArticulos = JSON.parse(resultCantidadArticulos);


    //         //Si se tiene un total de articulos de la API comenzara a integrar
    //         if(resultCantidadArticulos.estatus == 2)
    //         {
    //             //console.log("Funciona: " + resultCantidadArticulos.totalRegs);

    //             var TotalArticulos = resultCantidadArticulos.totalRegs;
    //             //For que recorrera todos los articulos de 10,000 en 10,000
    //             for (var j = 0; j < TotalArticulos; j++) 
    //             {

    //                 //Controla el final de articulos
    //                 var tempFinal = j+10000;
    //                 if(tempFinal > TotalArticulos)
    //                 {
    //                     tempFinal = TotalArticulos;
    //                 }

    //                 //Llama la api en rangos de 0 a 10,000
    //                 var options = {
    //                     'method': 'GET',
    //                     'url': process.env.INTEGRATIONS_URL + '/Service1.svc/Inventario/'+j+'---'+tempFinal,
    //                     'headers': {
    //                         'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
    //                     }
    //                 };

    //                 var result = await request(options, function (error, response) 
    //                 {
    //                     if (error) throw new Error(error);
    //                 });

    //                 //Resultado API para obtener total Articulos
    //                 var resultJson = JSON.parse(result);

    //                 //Si estatus 2 significa que todo bien en la consulta a la API
    //                 if(resultJson.estatus == 2)
    //                 {
    //                     var jsonApi = resultJson.articulos;

    //                     for (var i =  0; i < jsonApi.length; i++) 
    //                     {
                            
    //                         for (var k =  0; k < jsonApi[i].inventarios.length; k++) 
    //                         {
                                
    //                             jsonApi[i].inventarios[k].codigoArticulo = jsonApi[i].codigoArticulo;

                                
    //                             //Busca si el inventario y almacen coinciden 
    //                             const constRawInventario = await models.RawInventario.findOne(
    //                             {
    //                                 where: {
    //                                     codigoArticulo: jsonApi[i].inventarios[k].codigoArticulo.toString(),
    //                                     codigoAlmacen: jsonApi[i].inventarios[k].codigoAlmacen.toString()

    //                                 },
    //                                 attributes: {exclude: ['createdAt', 'updatedAt']}   
    //                             });


    //                             //Actualiza o crea en la BD
    //                             if(constRawInventario) {
    //                                 var creado = await constRawInventario.update(jsonApi[i].inventarios[k]);
    //                             }
    //                             else{
    //                                 var creado = await models.RawInventario.create(jsonApi[i].inventarios[k]);
    //                             }
    //                         }

    //                     }

    //                 }
    //                 break;
    //                 //Variable que establece el nuevo inicio al finalizar un ciclo for
    //                 j = tempFinal;
                
    //             }

    //         }



    //         //Response
    //         res.status(200).send(
    //         {
    //             message: 'Testing Peticion',
                
    //         })
            
    //     }catch(e){
    //         res.status(500).send({
    //             message: 'Error en la petición',
    //             e
    //         });
    //         next(e);
    //     }
    // },


    rawIntegracionInventario: async(req, res, next) =>{
        try{

            //REQUEST DE LA API Y DATOS DE RETORNO
            var options = {
                'method': 'GET',
                'url': process.env.INTEGRATIONS_URL + '/Service1.svc/Inventario/0---1',
                'headers': {
                    'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                }
            };

            var resultCantidadArticulos = await request(options, function (error, response) 
            {
                if (error) throw new Error(error);
            });

            //Resultado API para obtener total Articulos
            resultCantidadArticulos = JSON.parse(resultCantidadArticulos);


            //Si se tiene un total de articulos de la API comenzara a integrar
            if(resultCantidadArticulos.estatus == 2)
            {
                //console.log("Funciona: " + resultCantidadArticulos.totalRegs);
                var TotalArticulos = resultCantidadArticulos.totalRegs;

                //For que recorrera todos los articulos de 10,000 en 10,000
                for (var j = 0; j < TotalArticulos; j++) 
                {

                    //Controla el final de articulos
                    var tempFinal = j+10000;
                    if(tempFinal > TotalArticulos)
                    {
                        tempFinal = TotalArticulos;
                    }

                    //Llama la api en rangos de 0 a 10,000
                    var options = {
                        'method': 'GET',
                        'url': process.env.INTEGRATIONS_URL + '/Service1.svc/Inventario/'+j+'---'+tempFinal,
                        'headers': {
                            'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                        }
                    };

                    var result = await request(options, function (error, response) 
                    {
                        if (error) throw new Error(error);
                    });

                    //Resultado API para obtener total Articulos
                    var resultJson = JSON.parse(result);

                    //Si estatus 2 significa que todo bien en la consulta a la API
                    if(resultJson.estatus == 2)
                    {
                        var jsonApi = resultJson.articulos;

                        for (var i =  0; i < jsonApi.length; i++) 
                        {
                            
                            for (var k =  0; k < jsonApi[i].inventarios.length; k++) 
                            {
                                jsonApi[i].inventarios[k].codigoArticulo = jsonApi[i].codigoArticulo;
                                
                                //Busca si el inventario y almacen coinciden 
                                const constRawInventario = await models.RawInventario.findOne(
                                {
                                    where: {
                                        codigoArticulo: jsonApi[i].inventarios[k].codigoArticulo.toString(),
                                        codigoAlmacen: jsonApi[i].inventarios[k].codigoAlmacen.toString()

                                    },
                                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                                });

                                //Actualiza o crea en la BD
                                if(constRawInventario) {
                                    var creado = await constRawInventario.update(jsonApi[i].inventarios[k]);
                                }
                                else{
                                    var creado = await models.RawInventario.create(jsonApi[i].inventarios[k]);
                                }
                            }
                        }
                    }

                    //Variable que establece el nuevo inicio al finalizar un ciclo for
                    j = tempFinal;
                }
            }




            



            //Response
            res.status(200).send(
            {
                message: 'Testing Peticion',
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    rawIntegracionInventarioAllApis: async(req, res, next) =>{
        try{

            //REQUEST DE LA API Y DATOS DE RETORNO
            var options = {
                'method': 'GET',
                'url': process.env.INTEGRATIONS_URL + '/Service1.svc/Inventario/0---1',
                'headers': {
                    'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                }
            };

            var resultCantidadArticulos = await request(options, function (error, response) 
            {
                if (error) throw new Error(error);
            });

            //Resultado API para obtener total Articulos
            resultCantidadArticulos = JSON.parse(resultCantidadArticulos);


            //Si se tiene un total de articulos de la API comenzara a integrar
            if(resultCantidadArticulos.estatus == 2)
            {
                //console.log("Funciona: " + resultCantidadArticulos.totalRegs);
                var TotalArticulos = resultCantidadArticulos.totalRegs;

                //For que recorrera todos los articulos de 10,000 en 10,000
                for (var j = 0; j < TotalArticulos; j++) 
                {

                    //Controla el final de articulos
                    var tempFinal = j+10000;
                    if(tempFinal > TotalArticulos)
                    {
                        tempFinal = TotalArticulos;
                    }

                    //Llama la api en rangos de 0 a 10,000
                    var options = {
                        'method': 'GET',
                        'url': process.env.INTEGRATIONS_URL + '/Service1.svc/Inventario/'+j+'---'+tempFinal,
                        'headers': {
                            'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                        }
                    };

                    var result = await request(options, function (error, response) 
                    {
                        if (error) throw new Error(error);
                    });

                    //Resultado API para obtener total Articulos
                    var resultJson = JSON.parse(result);

                    //Si estatus 2 significa que todo bien en la consulta a la API
                    if(resultJson.estatus == 2)
                    {
                        var jsonApi = resultJson.articulos;

                        for (var i =  0; i < jsonApi.length; i++) 
                        {
                            
                            for (var k =  0; k < jsonApi[i].inventarios.length; k++) 
                            {
                                jsonApi[i].inventarios[k].codigoArticulo = jsonApi[i].codigoArticulo;
                                
                                //Busca si el inventario y almacen coinciden 
                                const constRawInventario = await models.RawInventario.findOne(
                                {
                                    where: {
                                        codigoArticulo: jsonApi[i].inventarios[k].codigoArticulo.toString(),
                                        codigoAlmacen: jsonApi[i].inventarios[k].codigoAlmacen.toString()

                                    },
                                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                                });

                                //Actualiza o crea en la BD
                                if(constRawInventario) {
                                    var creado = await constRawInventario.update(jsonApi[i].inventarios[k]);
                                }
                                else{
                                    var creado = await models.RawInventario.create(jsonApi[i].inventarios[k]);
                                }
                            }
                        }
                    }

                    //Variable que establece el nuevo inicio al finalizar un ciclo for
                    j = tempFinal;
                }
            }











            //Carga todos los almacenes para comparar codigoAlmacen con su ID para tabla stock
            const constAlmacenes = await models.Almacenes.findAll({
            });

            //Carga todos los productos que no tengan sku padre
            const constProducto = await models.Producto.findAll({
                where: {
                    prod_prod_producto_padre_sku: { [Op.ne] : null }
                    // prod_sku: 'SUP00005' //pruebas con un solo articulo
                },
            });
            
            for (var i = 0; i < constProducto.length; i++) 
            {
                // console.log("Articulo numero: " + i + "   SKU: " + constProducto[i].dataValues.prod_sku)

                //Obtener ID del producto a actualizar
                var productoId = constProducto[i].dataValues.prod_producto_id;

                //Carga todos los inventarios de la tabla Row de este SKU
                const constRawInventario = await models.RawInventario.findAll({
                    where: {
                        codigoArticulo: constProducto[i].dataValues.prod_sku
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });



                //Recorre todos los registros encontrados de un SKU de la tabla raw
                for (var j = 0; j < constRawInventario.length; j++) 
                {
                    //Buscar el ID del almacen asignado segun el codigo de almacenes
                    var almacenId;
                    for (var k = 0; k < constAlmacenes.length; k++) 
                    {
                        if(constAlmacenes[k].dataValues.alm_codigoAlmacen == constRawInventario[j].dataValues.codigoAlmacen)
                        {
                            almacenId = constAlmacenes[k].dataValues.alm_almacen_id
                        }
                    }










                    // console.log(constRawInventario[j].dataValues.codigoAlmacen)


                    var totalStockFinal = 0

                    //calcular el stock que tendra para el almacen 01
                    if(constRawInventario[j].dataValues.codigoAlmacen == "01")
                    {
                        var tempCantidad = 0
                        var tempComprometidos = 0

                        const almacen1 = await models.RawInventario.findOne({
                            where: {
                                codigoArticulo: constProducto[i].dataValues.prod_sku,
                                codigoAlmacen: "01"
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}   
                        });


                        const almacen3 = await models.RawInventario.findOne({
                            where: {
                                codigoArticulo: constProducto[i].dataValues.prod_sku,
                                codigoAlmacen: "03"
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}   
                        });


                        tempCantidad = almacen1.cantidad + almacen3.cantidad
                        tempComprometidos = almacen1.comprometido + almacen3.comprometido

                        // console.log(tempCantidad)
                        // console.log(tempComprometidos)

                        // console.log(tempCantidad)
                        // console.log(tempComprometidos)

                        if(tempComprometidos == 0)
                        {
                            // console.log("entro al 1")
                            totalStockFinal = constRawInventario[j].cantidad
                        }
                        else if (tempComprometidos > tempCantidad)
                        {
                            // console.log("entro al 2")
                            totalStockFinal = 0
                        }
                        else if(tempComprometidos < tempCantidad)
                        {
                            // console.log("entro al 3")
                            var tempCantAlm01 = 0
                            var tempCantAlm03 = 0

                            tempCantAlm01 = almacen1.cantidad - almacen1.comprometido
                            tempCantAlm03 = almacen3.cantidad - almacen3.comprometido

                            // console.log(tempCantAlm01)
                            // console.log(tempCantAlm03)



                            if(tempCantAlm01 <= 0)
                            {
                                totalStockFinal = 0
                            }   
                            else if(tempCantAlm03 < 0)
                            {
                                if(tempCantAlm03 < 0)
                                {
                                    tempCantAlm03 = tempCantAlm03*(-1)
                                }

                                totalStockFinal = tempCantAlm01-tempCantAlm03
                                // console.log("entro al restar mas inventario")
                                // console.log(totalStockFinal)
                            }
                            else
                            {
                                totalStockFinal = tempCantAlm01
                            }
                        }
                    }
                    else if(constRawInventario[j].dataValues.codigoAlmacen == "03")
                    {
                        var tempCantidad = 0
                        var tempComprometidos = 0

                        const almacen1 = await models.RawInventario.findOne({
                            where: {
                                codigoArticulo: constProducto[i].dataValues.prod_sku,
                                codigoAlmacen: "01"
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}   
                        });

                        const almacen3 = await models.RawInventario.findOne({
                            where: {
                                codigoArticulo: constProducto[i].dataValues.prod_sku,
                                codigoAlmacen: "03"
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}   
                        });

                        tempCantidad = almacen1.cantidad + almacen3.cantidad
                        tempComprometidos = almacen1.comprometido + almacen3.comprometido

                        if(tempComprometidos == 0)
                        {
                            // console.log("entro al 1")
                            totalStockFinal = constRawInventario[j].cantidad

                        }
                        else if (tempComprometidos > tempCantidad)
                        {
                            // console.log("entro al 2")
                            totalStockFinal = 0
                        }
                        else if(tempComprometidos < tempCantidad)
                        {
                            // console.log("entro al 3")
                            var tempCantAlm01 = 0
                            var tempCantAlm03 = 0

                            tempCantAlm01 = almacen1.cantidad - almacen1.comprometido
                            tempCantAlm03 = almacen3.cantidad - almacen3.comprometido

                            // console.log(tempCantAlm01)
                            // console.log(tempCantAlm03)
                            

                            if(tempCantAlm03 <= 0)
                            {
                                totalStockFinal = 0
                            }   
                            else if(tempCantAlm01 < 0)
                            {
                                if(tempCantAlm01 < 0)
                                {
                                    tempCantAlm01 = tempCantAlm01*(-1)
                                }
                                totalStockFinal = tempCantAlm03-tempCantAlm01
                            }
                            else
                            {
                                totalStockFinal = tempCantAlm03
                            }
                        }
                    }
                    else
                    {
                        // console.log("entro al 4")
                        totalStockFinal = constRawInventario[j].cantidad
                    }




                    // console.log(totalStockFinal)










                    //Buscar e integrar un inventario por id producto y almacen
                    // Busca el id de stock producto pcp con el where en id producto y almacen id
                    const constStockProducto = await models.StockProducto.findOne(
                    {
                        where: {
                            sp_prod_producto_id: productoId,
                            sp_almacen_id: almacenId
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });




                    //Actualizar
                    if(constStockProducto) 
                    {
                        const bodyUpdate = {
                            "sp_cantidad" :  totalStockFinal,
                            // "sp_comprometido" :  constRawInventario[j].comprometido,
                            "sp_comprometido" :  0, //dejar en 0 porque se hara el calculo al mandar a la tabla stock
                        };
                        await constStockProducto.update(bodyUpdate);
                    }






                }
                
            }//Fin for i (lista de productos base (SKU))









            //Solo almacenes monterrey y mexico po codigo 01 y 03
            const constStockHijosByIDProd = await sequelize.query(`
                select sp_prod_producto_id, sum(sp_cantidad) as "sp_cantidad", sum(sp_comprometido) as "sp_comprometido", prod_sku 
                from 
                    stocks_productos sp 
                    left join productos p2 on sp.sp_prod_producto_id = p2.prod_producto_id 
                    left join almacenes a2 on a2.alm_almacen_id = sp.sp_almacen_id 
                where 
                    (sp_cantidad != 0 or sp_comprometido != 0)
                    and (a2."alm_codigoAlmacen" = '01' or a2."alm_codigoAlmacen" = '03')
                group by sp_prod_producto_id, prod_sku
                `,
            { 
                type: sequelize.QueryTypes.SELECT 
            });

            //poner todos los stock en 0 cuando los productos realemnte no tienen
            const constEstablecerProductosToZero = await sequelize.query(`
                update productos 
                set prod_total_stock = 0
                where prod_producto_id not in 
                    (
                    select sp_prod_producto_id
                    from 
                        stocks_productos sp 
                        left join productos p2 on sp.sp_prod_producto_id = p2.prod_producto_id 
                        left join almacenes a2 on a2.alm_almacen_id = sp.sp_almacen_id 
                    where 
                        sp_cantidad != 0 
                        and (a2."alm_codigoAlmacen" = '01' or a2."alm_codigoAlmacen" = '03')
                    group by sp_prod_producto_id, prod_sku
                    )
                `,
            { 
                type: sequelize.QueryTypes.SELECT 
            });



            //ACTUALIZA HIJOS EN BASE A LOS QUE TENGAN INVENTARIO EN STOCK
            for (var i = 0; i < constStockHijosByIDProd.length; i++)
            {
                //Guardara el nuevo stock en la columan total de productos generales hijos
                const constProductoTotalStock = await models.Producto.findOne(
                {
                    where: {
                        prod_producto_id: constStockHijosByIDProd[i].sp_prod_producto_id
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });

                //Actualizar 
                if(constProductoTotalStock) 
                {
                    // var totalStockFinal = constStockHijosByIDProd[i].sp_cantidad - constStockHijosByIDProd[i].sp_comprometido

                    // if(totalStockFinal < 0)
                    // {
                    //     totalStockFinal = 0
                    // }


                    const bodyUpdate = {
                        "prod_total_stock" :  constStockHijosByIDProd[i].sp_cantidad
                    };
                    
                    await constProductoTotalStock.update(bodyUpdate);
                }
            }

            const constStockPadresByIDProd = await sequelize.query(`
                select prod_prod_producto_padre_sku, sum(cantidad) from 
                (
                    select sum(sp_cantidad) as cantidad, prod_prod_producto_padre_sku
                    from 
                        stocks_productos sp 
                        left join productos p2 on sp.sp_prod_producto_id = p2.prod_producto_id
                        left join almacenes a2 on a2.alm_almacen_id = sp.sp_almacen_id
                    where 
                        sp_cantidad != 0 
                        and (a2."alm_codigoAlmacen" = '01' or a2."alm_codigoAlmacen" = '03')
                    group by prod_prod_producto_padre_sku 
                ) as consulta group by prod_prod_producto_padre_sku
                `,
            { 
                type: sequelize.QueryTypes.SELECT 
            });


            
            //La consulta ya regresa los sku padres con el total de articulos de sus hijos solo paara ser guardados
            for (var k = 0; k < constStockPadresByIDProd.length; k++)
            {
                //console.log(constStockPadresByIDProd[k].prod_prod_producto_padre_sku)

                //Obtener id del sku padre
                const constProductoTotalStock = await models.Producto.findOne(
                {
                    where: {
                        prod_sku: constStockPadresByIDProd[k].prod_prod_producto_padre_sku
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });

                //Actualizar o crear en  BD
                if(constProductoTotalStock) 
                {
                    const bodyUpdate = {
                        "prod_total_stock" :  constStockPadresByIDProd[k].sum
                    };
                    
                    await constProductoTotalStock.update(bodyUpdate);
                }
            }

            

            await systemLog.insertLog('Integracion Inventario All Apis raw','Integracion Inventario All Apis raw: correctamente.', '1.-webApi', 'Sistema', 'informative')
            //integracionEmail('Integracion Inventario All Apis raw: correctamente.')


            //Response
            res.status(200).send(
            {
                message: 'Testing Peticion',
                
            })
            
        }catch(e){
            await systemLog.insertLog('Integracion Inventario All Apis raw','Integracion Inventario All Apis raw: error en la petición.', '1.-webApi', 'Sistema', 'warning')
            integracionEmail('Integracion Inventario All Apis raw: error en la petición.')

            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    rawIntegracionInventarioAllProductosInBD: async(req, res, next) =>{
        try{

            const productoUpdate = await models.Producto.findAll({
                where: {
                    prod_prod_producto_padre_sku: { [Op.ne]: null }
                },
                attributes: ['prod_sku']
            });


            for (var zz = 0; zz < productoUpdate.length; zz++) 
            {
                //REQUEST DE LA API Y DATOS DE RETORNO
                var options = {
                    'method': 'GET',
                    'url': process.env.INTEGRATIONS_URL + '/Service1.svc/Inventario/'+productoUpdate[zz].prod_sku,
                    'headers': {
                        'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                    }
                };

                var resultCantidadArticulos = await request(options, function (error, response) 
                {
                    if (error) throw new Error(error);
                });

                //Resultado API para obtener total Articulos
                resultCantidadArticulos = JSON.parse(resultCantidadArticulos);


                //Si se tiene un total de articulos de la API comenzara a integrar
                if(resultCantidadArticulos.estatus == 2)
                {
                    //console.log("Funciona: " + resultCantidadArticulos.totalRegs);

                    var TotalArticulos = resultCantidadArticulos.totalRegs;
                    //For que recorrera todos los articulos de 10,000 en 10,000
                    for (var j = 0; j < TotalArticulos; j++) 
                    {

                        //Controla el final de articulos
                        var tempFinal = j+10000;
                        if(tempFinal > TotalArticulos)
                        {
                            tempFinal = TotalArticulos;
                        }

                        //Llama la api en rangos de 0 a 10,000
                        var options = {
                            'method': 'GET',
                            'url': process.env.INTEGRATIONS_URL + '/Service1.svc/Inventario/'+productoUpdate[zz].prod_sku,
                            'headers': {
                                'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                            }
                        };

                        var result = await request(options, function (error, response) 
                        {
                            if (error) throw new Error(error);
                        });

                        //Resultado API para obtener total Articulos
                        var resultJson = JSON.parse(result);

                        //Si estatus 2 significa que todo bien en la consulta a la API
                        if(resultJson.estatus == 2)
                        {
                            var jsonApi = resultJson.articulos;

                            for (var i =  0; i < jsonApi.length; i++) 
                            {
                                
                                for (var k =  0; k < jsonApi[i].inventarios.length; k++) 
                                {
                                    
                                    jsonApi[i].inventarios[k].codigoArticulo = jsonApi[i].codigoArticulo;

                                    
                                    //Busca si el inventario y almacen coinciden 
                                    const constRawInventario = await models.RawInventario.findOne(
                                    {
                                        where: {
                                            codigoArticulo: jsonApi[i].inventarios[k].codigoArticulo.toString(),
                                            codigoAlmacen: jsonApi[i].inventarios[k].codigoAlmacen.toString()

                                        },
                                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                                    });


                                    //Actualiza o crea en la BD
                                    if(constRawInventario) {
                                        var creado = await constRawInventario.update(jsonApi[i].inventarios[k]);
                                    }
                                    else{
                                        var creado = await models.RawInventario.create(jsonApi[i].inventarios[k]);
                                    }
                                }

                            }

                        }
                        break;
                        //Variable que establece el nuevo inicio al finalizar un ciclo for
                        j = tempFinal;
                    
                    }

                }

            }


            



            //Response
            res.status(200).send(
            {
                message: 'Testing Peticion',
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },


    rawIntegracionInventarioOnlyOne: async(req, res, next) =>{
        try{



            //REQUEST DE LA API Y DATOS DE RETORNO
            var options = {
                'method': 'GET',
                'url': process.env.INTEGRATIONS_URL + '/Service1.svc/Inventario/'+req.body.factor_integracion,
                'headers': {
                    'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                }
            };

            var resultCantidadArticulos = await request(options, function (error, response) 
            {
                if (error) throw new Error(error);
            });

            //Resultado API para obtener total Articulos
            resultCantidadArticulos = JSON.parse(resultCantidadArticulos);


            //Si se tiene un total de articulos de la API comenzara a integrar
            if(resultCantidadArticulos.estatus == 2)
            {
                //console.log("Funciona: " + resultCantidadArticulos.totalRegs);

                var TotalArticulos = resultCantidadArticulos.totalRegs;
                //For que recorrera todos los articulos de 10,000 en 10,000
                for (var j = 0; j < TotalArticulos; j++) 
                {

                    //Controla el final de articulos
                    var tempFinal = j+10000;
                    if(tempFinal > TotalArticulos)
                    {
                        tempFinal = TotalArticulos;
                    }

                    //Llama la api en rangos de 0 a 10,000
                    var options = {
                        'method': 'GET',
                        'url': process.env.INTEGRATIONS_URL + '/Service1.svc/Inventario/'+req.body.factor_integracion,
                        'headers': {
                            'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                        }
                    };

                    var result = await request(options, function (error, response) 
                    {
                        if (error) throw new Error(error);
                    });

                    //Resultado API para obtener total Articulos
                    var resultJson = JSON.parse(result);

                    //Si estatus 2 significa que todo bien en la consulta a la API
                    if(resultJson.estatus == 2)
                    {
                        var jsonApi = resultJson.articulos;

                        for (var i =  0; i < jsonApi.length; i++) 
                        {
                            
                            for (var k =  0; k < jsonApi[i].inventarios.length; k++) 
                            {
                                
                                jsonApi[i].inventarios[k].codigoArticulo = jsonApi[i].codigoArticulo;

                                
                                //Busca si el inventario y almacen coinciden 
                                const constRawInventario = await models.RawInventario.findOne(
                                {
                                    where: {
                                        codigoArticulo: jsonApi[i].inventarios[k].codigoArticulo.toString(),
                                        codigoAlmacen: jsonApi[i].inventarios[k].codigoAlmacen.toString()

                                    },
                                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                                });


                                //Actualiza o crea en la BD
                                if(constRawInventario) {
                                    var creado = await constRawInventario.update(jsonApi[i].inventarios[k]);
                                }
                                else{
                                    var creado = await models.RawInventario.create(jsonApi[i].inventarios[k]);
                                }
                            }

                        }

                    }
                    break;
                    //Variable que establece el nuevo inicio al finalizar un ciclo for
                    j = tempFinal;
                
                }

            }



            //Response
            res.status(200).send(
            {
                message: 'Testing Peticion',
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },



    rawIntegracionNombreListasPrecios: async(req, res, next) =>{
        try{

            //REQUEST DE LA API Y DATOS DE RETORNO
           
                var options = {
                    'method': 'GET',
                    'url': process.env.INTEGRATIONS_URL + '/Service1.svc/NombreListasPrecios',
                    'headers': {
                        'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                    }
                };
                var result = await request(options, function (error, response) 
                {
                    if (error) throw new Error(error);
                });
                var resultJson = JSON.parse(result);


            //FIN RETORN REQUEST



            //Si Estatus es 2 Significa que la API trajo datos

            if(resultJson.estatus == 2)
            {
                
                var jsonApi = resultJson.ListasPrecios;

                for (var i =  0; i < jsonApi.length; i++) 
                {
                    //Busca si el almacen existe
                    const constRawNombreListasPrecios = await models.RawNombreListasPrecios.findOne(
                    {
                        where: {
                            codigoListaPrecios: jsonApi[i].codigoListaPrecios
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });


                    //Actualiza o crea en la BD
                    if(constRawNombreListasPrecios) {
                        var creado = await constRawNombreListasPrecios.update(jsonApi[i]);
                    }
                    else{
                        var creado = await models.RawNombreListasPrecios.create(jsonApi[i]);
                    }


                }//FIN FOR TODOS LOS REGISTROS SN

            }

            await systemLog.insertLog('Integracion Nombre Listas Precios','Integracion Nombre Listas Precios: correctamente.', '1.-webApi', 'Sistema', 'informative')
           // integracionEmail('Integracion Nombre Listas Precios: correctamente.')

            //Response
            res.status(200).send(
            {
                message: 'Integracion Raw Listas de Precios',
                
            })
            
        }catch(e){
            await systemLog.insertLog('Integracion Nombre Listas Precios','Integracion Nombre Listas Precios: error en la petición.', '1.-webApi', 'Sistema', 'warning')
            integracionEmail('Integracion Nombre Listas Precios: error en la petición.')
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },



    //integracion funcionando pero tarda bastante.
    rawIntegracionListasPreciosBasicas: async(req, res, next) =>{
        try{
            //REQUEST DE LA API Y DATOS DE RETORNO
            var options = {
                'method': 'GET',
                'url': process.env.INTEGRATIONS_URL + '/Service1.svc/ListasPrecios/0---1',
                'headers': {
                    'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                }
            };

            var resultCantidadArticulos = await request(options, function (error, response) 
            {
                if (error) throw new Error(error);
            });

            //Resultado API para obtener total Articulos
            resultCantidadArticulos = JSON.parse(resultCantidadArticulos);

            //Si se tiene un total de articulos de la API comenzara a integrar
            if(resultCantidadArticulos.estatus == 2)
            {
                //console.log("Funciona: " + resultCantidadArticulos.totalRegs);

                var TotalArticulos = resultCantidadArticulos.totalRegs;
                //For que recorrera todos los articulos de 10,000 en 10,000
                for (var k = 0; k < TotalArticulos; k++) 
                {
                    //Controla el final de articulos
                    var tempFinal = k+10000;
                    if(tempFinal > TotalArticulos)
                    {
                        tempFinal = TotalArticulos;
                    }

                    //Llama la api en rangos de 0 a 10,000
                    var options = {
                        'method': 'GET',
                        'url': process.env.INTEGRATIONS_URL + '/Service1.svc/ListasPrecios/'+k+'---'+tempFinal,
                        'headers': {
                            'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                        }
                    };

                    var result = await request(options, function (error, response) 
                    {
                        if (error) throw new Error(error);
                    });

                    //Resultado API para obtener total Articulos
                    var resultJson = JSON.parse(result);

                    //Si estatus 2 significa que todo bien en la consulta a la API
                    if(resultJson.estatus == 2)
                    {
                        var jsonApi = resultJson.articulos;

                        for (var i =  0; i < jsonApi.length; i++) 
                        {
                            console.log(jsonApi[i].codigoArticulo)
                            
                            //Variables para resetear a 0 precios que ya no vengan
                            var listaPrecioBool = false
                            var stockInactivoBool = false
                            var hastaAgotarExistenciaBool = false
                            
                            for (var j =  0; j < jsonApi[i].precios.length; j++) 
                            {
                                jsonApi[i].precios[j].codigoArticulo = jsonApi[i].codigoArticulo;
                                jsonApi[i].precios[j].nombreArticulo = jsonApi[i].nombreArticulo;
                                
                                //Busca si LA LISTA CONCINCIDE CON ALGUN REGISTRO
                                const constRawListasPreciosBasicas = await models.RawListasPreciosBasicas.findOne(
                                {
                                    where: {
                                        codigoArticulo: jsonApi[i].precios[j].codigoArticulo.toString(),
                                        codigoListaPrecios: jsonApi[i].precios[j].codigoListaPrecios.toString()

                                    },
                                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                                });

                                //Actualiza o crea en la BD
                                if(constRawListasPreciosBasicas) {
                                    var creado = await constRawListasPreciosBasicas.update(jsonApi[i].precios[j]);
                                }
                                else{
                                    var creado = await models.RawListasPreciosBasicas.create(jsonApi[i].precios[j]);
                                }


                                //Si el el for completo no vienen esos 3 entonces al final se declararan como cero dentro de la bd
                                if(jsonApi[i].precios[j].codigoListaPrecios.toString() == "1")
                                {
                                    console.log("entro al 1")
                                    listaPrecioBool = true
                                }

                                if(jsonApi[i].precios[j].codigoListaPrecios.toString() == "6")
                                {
                                    console.log("entro al 6")
                                    stockInactivoBool = true
                                }

                                if(jsonApi[i].precios[j].codigoListaPrecios.toString() == "7")
                                {
                                    console.log("entro al 7")
                                    hastaAgotarExistenciaBool = true
                                }

                                console.log(listaPrecioBool)
                                console.log(hastaAgotarExistenciaBool)
                                console.log(stockInactivoBool)

                                //Si al final las 3 variables llegan como falso significa que las listas de precios no existieron entonces hay que settearlas a 0
                                if(listaPrecioBool == false)
                                {
                                    console.log("entro a actualizar precio basico Lista")
                                    //Busca si LA LISTA CONCINCIDE CON ALGUN REGISTRO
                                    const constRawListasPreciosBasicas2 = await models.RawListasPreciosBasicas.findOne(
                                    {
                                        where: {
                                            codigoArticulo: jsonApi[i].codigoArticulo,
                                            codigoListaPrecios: "1"

                                        },
                                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                                    });
                                    //Actualiza o crea en la BD
                                    if(constRawListasPreciosBasicas2) {

                                        const bodyUpdate = {
                                            "precio": 0,
                                            updatedAt: Date()
                                        }
                                        await constRawListasPreciosBasicas2.update(bodyUpdate);
                                    }
                                }

                                if(stockInactivoBool == false)
                                {
                                    console.log("entro a actualizar precio stock inactivo")
                                    //Busca si LA LISTA CONCINCIDE CON ALGUN REGISTRO
                                    const constRawListasPreciosBasicas4 = await models.RawListasPreciosBasicas.findOne(
                                    {
                                        where: {
                                            codigoArticulo: jsonApi[i].codigoArticulo,
                                            codigoListaPrecios: "6"

                                        },
                                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                                    });

                                    //Actualiza o crea en la BD
                                    if(constRawListasPreciosBasicas4) {

                                        const bodyUpdate = {
                                            "precio": 0,
                                            updatedAt: Date()
                                        }
                                        await constRawListasPreciosBasicas4.update(bodyUpdate);
                                    }
                                }

                                if(hastaAgotarExistenciaBool == false)
                                {
                                    console.log("entro a actualizar precio hasta agotar existencia")
                                    //Busca si LA LISTA CONCINCIDE CON ALGUN REGISTRO
                                    const constRawListasPreciosBasicas3 = await models.RawListasPreciosBasicas.findOne(
                                    {
                                        where: {
                                            codigoArticulo: jsonApi[i].codigoArticulo,
                                            codigoListaPrecios: "7"

                                        },
                                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                                    });
                                    //Actualiza o crea en la BD
                                    if(constRawListasPreciosBasicas3) {

                                        const bodyUpdate = {
                                            "precio": 0,
                                            updatedAt: Date()
                                        }
                                        await constRawListasPreciosBasicas3.update(bodyUpdate);
                                    }
                                }
                            }

                        }//FIN FOR TODOS LOS REGISTROS 
                    }
                    //Variable que establece el nuevo inicio al finalizar un ciclo for
                    k = tempFinal;
                }
            }

            await systemLog.insertLog('Integracion Listas Precios Basicas raw','Integracion Listas Precios Basicas raw: correctamente.', '1.-webApi', 'Sistema', 'informative')
            //integracionEmail('Integracion Listas Precios Basicas raw: correctamente.')
            //Response
            res.status(200).send(
            {
                message: 'Integracion Raw Listas Precios Basicas',
                
            })
            
        }catch(e){
            await systemLog.insertLog('Integracion Listas Precios Basicas raw','Integracion Listas Precios Basicas raw: error en la petición.', '1.-webApi', 'Sistema', 'warning')
            integracionEmail('Integracion Listas Precios Basicas raw: error en petición.')
            console.log(e)
            res.status(500).send({ 
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },


    //integracion precios basicos pero solo los que esten en la BD
    IntegracionListasPreciosBasicasAllProductosInBD: async(req, res, next) =>{
        try{


            const productoUpdate = await models.Producto.findAll({
                where: {
                    prod_prod_producto_padre_sku: { [Op.ne]: null }
                },
                attributes: ['prod_sku']
            });


            for (var zz = 0; zz < productoUpdate.length; zz++) 
            {
                //REQUEST DE LA API Y DATOS DE RETORNO
                var options = {
                    'method': 'GET',
                    'url': process.env.INTEGRATIONS_URL + '/Service1.svc/ListasPrecios/'+productoUpdate[zz].prod_sku,
                    'headers': {
                        'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                    }
                };

                var resultCantidadArticulos = await request(options, function (error, response) 
                {
                    if (error) throw new Error(error);
                });

                //Resultado API para obtener total Articulos
                resultCantidadArticulos = JSON.parse(resultCantidadArticulos);

                //Si se tiene un total de articulos de la API comenzara a integrar
                if(resultCantidadArticulos.estatus == 2)
                {
                    //console.log("Funciona: " + resultCantidadArticulos.totalRegs);

                    var TotalArticulos = 1;

                    //For que recorrera todos los articulos de 10,000 en 10,000
                    for (var k = 0; k < TotalArticulos; k++) 
                    {
                        //Controla el final de articulos
                        var tempFinal = k+10000;
                        if(tempFinal > TotalArticulos)
                        {
                            tempFinal = TotalArticulos;
                        }

                        //Llama la api en rangos de 0 a 10,000
                        var options = {
                            'method': 'GET',
                            'url': process.env.INTEGRATIONS_URL + '/Service1.svc/ListasPrecios/'+productoUpdate[zz].prod_sku,
                            'headers': {
                                'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                            }
                        };

                        var result = await request(options, function (error, response) 
                        {
                            if (error) throw new Error(error);
                        });

                        //Resultado API para obtener total Articulos
                        var resultJson = JSON.parse(result);

                        //Si estatus 2 significa que todo bien en la consulta a la API
                        if(resultJson.estatus == 2)
                        {
                            var jsonApi = resultJson.articulos;

                            for (var i =  0; i < jsonApi.length; i++) 
                            {
                                
                                for (var j =  0; j < jsonApi[i].precios.length; j++) 
                                {
                                    jsonApi[i].precios[j].codigoArticulo = jsonApi[i].codigoArticulo;
                                    jsonApi[i].precios[j].nombreArticulo = jsonApi[i].nombreArticulo;
                                    
                                    console.log(jsonApi[i].precios[j]);
                                    //Busca si LA LISTA CONCINCIDE CON ALGUN REGISTRO
                                    const constRawListasPreciosBasicas = await models.RawListasPreciosBasicas.findOne(
                                    {
                                        where: {
                                            codigoArticulo: jsonApi[i].precios[j].codigoArticulo.toString(),
                                            codigoListaPrecios: jsonApi[i].precios[j].codigoListaPrecios.toString()

                                        },
                                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                                    });


                                    //Actualiza o crea en la BD
                                    if(constRawListasPreciosBasicas) {
                                        var creado = await constRawListasPreciosBasicas.update(jsonApi[i].precios[j]);
                                    }
                                    else{
                                        var creado = await models.RawListasPreciosBasicas.create(jsonApi[i].precios[j]);
                                    }
                                }
                            }//FIN FOR TODOS LOS REGISTROS 
                        }

                        //Variable que establece el nuevo inicio al finalizar un ciclo for
                        k = tempFinal;
                    
                    }

                }

            }


            //Response
            res.status(200).send(
            {
                message: 'Integracion Raw Listas Precios Basicas',
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },


    //integracion funcionando pero tarda bastante.
    IntegracionListasPreciosBasicasOnlyOne: async(req, res, next) =>{
        try{


            //REQUEST DE LA API Y DATOS DE RETORNO
                var options = {
                    'method': 'GET',
                    'url': process.env.INTEGRATIONS_URL + '/Service1.svc/ListasPrecios/'+req.body.factor_integracion,
                    'headers': {
                        'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                    }
                };

                var resultCantidadArticulos = await request(options, function (error, response) 
                {
                    if (error) throw new Error(error);
                });

                //Resultado API para obtener total Articulos
                resultCantidadArticulos = JSON.parse(resultCantidadArticulos);

                //Si se tiene un total de articulos de la API comenzara a integrar
                if(resultCantidadArticulos.estatus == 2)
                {
                    //console.log("Funciona: " + resultCantidadArticulos.totalRegs);

                    var TotalArticulos = 1;

                    //For que recorrera todos los articulos de 10,000 en 10,000
                    for (var k = 0; k < TotalArticulos; k++) 
                    {
                        //Controla el final de articulos
                        var tempFinal = k+10000;
                        if(tempFinal > TotalArticulos)
                        {
                            tempFinal = TotalArticulos;
                        }

                        //Llama la api en rangos de 0 a 10,000
                        var options = {
                            'method': 'GET',
                            'url': process.env.INTEGRATIONS_URL + '/Service1.svc/ListasPrecios/'+req.body.factor_integracion,
                            'headers': {
                                'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                            }
                        };

                        var result = await request(options, function (error, response) 
                        {
                            if (error) throw new Error(error);
                        });

                        //Resultado API para obtener total Articulos
                        var resultJson = JSON.parse(result);

                        //Si estatus 2 significa que todo bien en la consulta a la API
                        if(resultJson.estatus == 2)
                        {
                            var jsonApi = resultJson.articulos;

                            for (var i =  0; i < jsonApi.length; i++) 
                            {
                                
                                for (var j =  0; j < jsonApi[i].precios.length; j++) 
                                {
                                    jsonApi[i].precios[j].codigoArticulo = jsonApi[i].codigoArticulo;
                                    jsonApi[i].precios[j].nombreArticulo = jsonApi[i].nombreArticulo;
                                    
                                    console.log(jsonApi[i].precios[j]);
                                    //Busca si LA LISTA CONCINCIDE CON ALGUN REGISTRO
                                    const constRawListasPreciosBasicas = await models.RawListasPreciosBasicas.findOne(
                                    {
                                        where: {
                                            codigoArticulo: jsonApi[i].precios[j].codigoArticulo.toString(),
                                            codigoListaPrecios: jsonApi[i].precios[j].codigoListaPrecios.toString()

                                        },
                                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                                    });


                                    //Actualiza o crea en la BD
                                    if(constRawListasPreciosBasicas) {
                                        var creado = await constRawListasPreciosBasicas.update(jsonApi[i].precios[j]);
                                    }
                                    else{
                                        var creado = await models.RawListasPreciosBasicas.create(jsonApi[i].precios[j]);
                                    }
                                }
                            }//FIN FOR TODOS LOS REGISTROS 
                        }

                        //Variable que establece el nuevo inicio al finalizar un ciclo for
                        k = tempFinal;
                    
                    }

                }

            //Response
            res.status(200).send(
            {
                message: 'Integracion Raw Listas Precios Basicas',
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },







    rawIntegracionListasPreciosPeriodo: async(req, res, next) =>{
        try{

            //REQUEST DE LA API Y DATOS DE RETORNO
                var options = {
                    'method': 'GET',
                    'url': process.env.INTEGRATIONS_URL + '/Service1.svc/PreciosPeriodo',
                    'headers': {
                        'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                    }
                };
                
                var result = await request(options, function (error, response) 
                {
                    if (error) throw new Error(error);
                });

                var resultJson = JSON.parse(result);

            //FIN RETORN REQUEST



            //Si Estatus es 2 Significa que la API trajo datos

            if(resultJson.estatus == 2)
            {

                var jsonApi = resultJson.articulos;
                // for (var i =  0; i <= AllItems.length; i++)
                for (var i =  0; i < jsonApi.length; i++) 
                {
                    
                    for (var j =  0; j < jsonApi[i].precios.length; j++) 
                    {
                        
                        jsonApi[i].precios[j].codigoArticulo = jsonApi[i].codigoArticulo;
                        //jsonApi[i].precios[j].nombreArticulo = jsonApi[i].nombreArticulo;
                        
                        console.log(jsonApi[i].precios[j]);
                        //Busca si LA LISTA CONCINCIDE CON ALGUN REGISTRO
                        const constRawListasPreciosPeriodo = await models.RawListasPreciosPeriodo.findOne(
                        {
                            where: {
                                codigoArticulo: jsonApi[i].precios[j].codigoArticulo.toString(),
                                codigoListaPrecios: jsonApi[i].precios[j].codigoListaPrecios.toString()

                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}   
                        });


                        //Actualiza o crea en la BD
                        if(constRawListasPreciosPeriodo) {
                            var creado = await constRawListasPreciosPeriodo.update(jsonApi[i].precios[j]);
                        }
                        else{
                            var creado = await models.RawListasPreciosPeriodo.create(jsonApi[i].precios[j]);
                        }
                    }

                }//FIN FOR TODOS LOS REGISTROS 

            }


            //Response
            res.status(200).send(
            {
                message: 'Integracion Raw Precios Periodo',
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },


    rawIntegracionListasPreciosCantidad: async(req, res, next) =>{
        try{

            //REQUEST DE LA API Y DATOS DE RETORNO
                var options = {
                    'method': 'GET',
                    'url': process.env.INTEGRATIONS_URL + '/Service1.svc/PreciosCantidad',
                    'headers': {
                        'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                    }
                };

                var result = await request(options, function (error, response) 
                {
                    if (error) throw new Error(error);
                });

                var resultJson = JSON.parse(result);
            //FIN RETORN REQUEST



            //Si Estatus es 2 Significa que la API trajo datos
            if(resultJson.estatus == 2)
            {
                var jsonApi = resultJson.articulos;

                // for (var i =  0; i <= AllItems.length; i++)
                for (var i =  0; i < jsonApi.length; i++) 
                {
                    for (var j =  0; j < jsonApi[i].precios.length; j++) 
                    {
                        jsonApi[i].precios[j].codigoArticulo = jsonApi[i].codigoArticulo;
                       
                        console.log(jsonApi[i].precios[j]);
                        //Busca si LA LISTA CONCINCIDE CON ALGUN REGISTRO
                        const constRawListasPreciosCantidad = await models.RawListasPreciosCantidad.findOne(
                        {
                            where: {
                                codigoArticulo: jsonApi[i].precios[j].codigoArticulo.toString(),
                                codigoListaPrecios: jsonApi[i].precios[j].codigoListaPrecios.toString()

                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}   
                        });


                        //Actualiza o crea en la BD
                        if(constRawListasPreciosCantidad) {
                            var creado = await constRawListasPreciosCantidad.update(jsonApi[i].precios[j]);
                        }
                        else{
                            var creado = await models.RawListasPreciosCantidad.create(jsonApi[i].precios[j]);
                        }
                    }

                }//FIN FOR TODOS LOS REGISTROS 

            }


            //Response
            res.status(200).send(
            {
                message: 'Integracion Raw Precios Cantidad',
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },


    rawIntegracionListasPreciosGrupo: async(req, res, next) =>{
        try{

            //REQUEST DE LA API Y DATOS DE RETORNO
                var options = {
                    'method': 'GET',
                    'url': process.env.INTEGRATIONS_URL + '/Service1.svc/PreciosGrupo',
                    'headers': {
                        'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                    }
                };

                var result = await request(options, function (error, response) 
                {
                    if (error) throw new Error(error);
                });
                var resultJson = JSON.parse(result);

            //FIN RETORN REQUEST





            //Si Estatus es 2 Significa que la API trajo datos

            if(resultJson.estatus == 2)
            {

                var DeleteAll = `
                    delete from raw_listas_precios_grupo
                `;

                await sequelize.query(DeleteAll,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });

                var jsonApi = resultJson.tipos;
                
                for (var i =  0; i < jsonApi.length; i++) 
                {
                    
                    for (var j =  0; j < jsonApi[i].precios.length; j++) 
                    {
                        
                        jsonApi[i].precios[j].tipo = jsonApi[i].tipo;
                        jsonApi[i].precios[j].activo = jsonApi[i].activo;
                        jsonApi[i].precios[j].codigo = jsonApi[i].codigo;
                        jsonApi[i].precios[j].validoDesde = jsonApi[i].validoDesde;
                        jsonApi[i].precios[j].validoHasta = jsonApi[i].validoHasta;
                        
                        console.log(jsonApi[i].precios[j]);
                        //Busca si LA LISTA CONCINCIDE CON ALGUN REGISTRO
                        const constRawListasPreciosGrupo = await models.RawListasPreciosGrupo.findOne(
                        {
                            where: {
                                codigo: jsonApi[i].precios[j].codigo.toString(),
                                subCodigo: jsonApi[i].precios[j].subCodigo.toString()

                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}   
                        });


                        //Actualiza o crea en la BD
                        if(constRawListasPreciosGrupo) {
                            var creado = await constRawListasPreciosGrupo.update(jsonApi[i].precios[j]);
                        }
                        else{
                            var creado = await models.RawListasPreciosGrupo.create(jsonApi[i].precios[j]);
                        }
                    }

                }//FIN FOR TODOS LOS REGISTROS 

            }


            //Response
            res.status(200).send(
            {
                message: 'Integracion Raw Listas Precios Grupos OK',
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },


    //por el momento no viene nada.
    rawIntegracionListasPreciosEspeciales: async(req, res, next) =>{
        try{

            //REQUEST DE LA API Y DATOS DE RETORNO
                var options = {
                    'method': 'GET',
                    'url': process.env.INTEGRATIONS_URL + '/Service1.svc/PreciosEspeciales',
                    'headers': {
                        'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                    }
                };

                var result = await request(options, function (error, response) 
                {
                    if (error) throw new Error(error);
                });
                var resultJson = JSON.parse(result);

            //FIN RETORN REQUEST




            //Si Estatus es 2 Significa que la API trajo datos

            if(resultJson.Estatus == 2)
            {
                jsonApi = resultJson.socioNegocios
                // for (var i =  0; i <= AllItems.length; i++)
                for (var i =  0; i < jsonApi.length; i++) 
                {
                    
                    for (var j =  0; j < jsonApi[i].articulos.length; j++) 
                    {
                        
                        jsonApi[i].articulos[j].codigoSocioNegocio = jsonApi[i].codigoSocioNegocio;
                        
                        console.log(jsonApi[i].articulos[j]);
                        //Busca si LA LISTA CONCINCIDE CON ALGUN REGISTRO
                        const constRawListasPreciosEspeciales = await models.RawListasPreciosEspeciales.findOne(
                        {
                            where: {
                                codigoSocioNegocio: jsonApi[i].articulos[j].codigoSocioNegocio.toString(),
                                codigoArticulo: jsonApi[i].articulos[j].codigoArticulo.toString()

                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}   
                        });


                        //Actualiza o crea en la BD
                        if(constRawListasPreciosEspeciales) {
                            var creado = await constRawListasPreciosEspeciales.update(jsonApi[i].articulos[j]);
                        }
                        else{
                            var creado = await models.RawListasPreciosEspeciales.create(jsonApi[i].articulos[j]);
                        }
                    }

                }//FIN FOR TODOS LOS REGISTROS 

            }


            //Response
            res.status(200).send(
            {
                message: 'Testing Peticion',
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },


    rawIntegracionInventarioDetalle: async(req, res, next) =>{
        try{


            //Vaciar tabla
            var DeleteAll = `
                delete from raw_inventario_detalle
            `;
            await sequelize.query(DeleteAll,
            { 
                type: sequelize.QueryTypes.SELECT 
            });


            

            // Busca si LA LISTA CONCINCIDE CON ALGUN REGISTRO
            const constCategoria = await models.Categoria.findOne(
            {
                where: {
                    cat_nombre: "FIBRA OPTICA"
                },
                attributes: {exclude: ['createdAt', 'updatedAt']}   
            });


            // Busca si LA LISTA CONCINCIDE CON ALGUN REGISTRO
            const constProducto = await models.Producto.findAll(
            {
                where: {
                    prod_codigo_grupo: constCategoria.cat_categoria_id.toString()
                },
                attributes: ["prod_producto_id", "prod_sku"]
            });
            // console.log(constProducto.length)


            // for (var b =  0; b < 2; b++) 
            for (var b =  0; b < constProducto.length; b++) 
            {
                //REQUEST DE LA API Y DATOS DE RETORNO
                    var options = 
                    {
                        'method': 'GET',
                        'url': process.env.INTEGRATIONS_URL + '/Service1.svc/InventarioDetalle/' + constProducto[b].prod_sku,
                        'headers': 
                        {
                            'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                        }
                    };

                    // console.log(options)

                    var result = await request(options, function (error, response) 
                    {
                        if (error) throw new Error(error);
                    });

                    var resultJson = JSON.parse(result);
                //FIN RETORN REQUEST


                console.log(resultJson)
                if(resultJson.estatus == 2)
                {
                    if(resultJson.articulos.length > 0)
                    {

                        var jsonApi = resultJson.articulos
                        // for (var i =  0; i <= AllItems.length; i++)
                        for (var i =  0; i < jsonApi.length; i++) 
                        {
                            
                            for (var j =  0; j < jsonApi[i].almacenes.length; j++) 
                            {

                                for (var k =  0; k < jsonApi[i].almacenes[j].lotes.length; k++) 
                                {
                                    jsonApi[i].almacenes[j].lotes[k].codigoAlmacen = jsonApi[i].almacenes[j].codigoAlmacen;
                                    jsonApi[i].almacenes[j].lotes[k].codigoArticulo = jsonApi[i].codigoArticulo;


                                    // Busca si LA LISTA CONCINCIDE CON ALGUN REGISTRO
                                    const constRawInventarioDetalle = await models.RawInventarioDetalle.findOne(
                                    {
                                        where: {
                                            codigoAlmacen: jsonApi[i].almacenes[j].lotes[k].codigoAlmacen.toString(),
                                            codigoArticulo: jsonApi[i].almacenes[j].lotes[k].codigoArticulo.toString(),
                                            codigoLote: jsonApi[i].almacenes[j].lotes[k].codigoLote.toString()
                                        },
                                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                                    });


                                    //Actualiza o crea en la BD
                                    if(constRawInventarioDetalle) {
                                        var creado = await constRawInventarioDetalle.update(jsonApi[i].almacenes[j].lotes[k]);
                                    }
                                    else{
                                        var creado = await models.RawInventarioDetalle.create(jsonApi[i].almacenes[j].lotes[k]);
                                    }

                                    //INTEGRARA LA UBICACION DE N LOTES EXISTENTES DENTRO DE UN ALMACEN ASIGNADO A UN ARTICULO
                                    for (var l =  0; l < jsonApi[i].almacenes[j].lotes[k].ubicaciones.length; l++) 
                                    {
                                        


                                        jsonApi[i].almacenes[j].lotes[k].ubicaciones[l].codigoAlmacen = jsonApi[i].almacenes[j].codigoAlmacen;
                                        jsonApi[i].almacenes[j].lotes[k].ubicaciones[l].codigoArticulo = jsonApi[i].codigoArticulo;
                                        jsonApi[i].almacenes[j].lotes[k].ubicaciones[l].codigoLote = jsonApi[i].almacenes[j].lotes[k].codigoLote;

                                        console.log(jsonApi[i].almacenes[j].lotes[k].ubicaciones[l]);


                                        // Busca si LA LISTA CONCINCIDE CON ALGUN REGISTRO
                                        const constRawInventarioDetalleUbicacion = await models.RawInventarioDetalleUbicacion.findOne(
                                        {
                                            where: {
                                                codigoAlmacen: jsonApi[i].almacenes[j].lotes[k].ubicaciones[l].codigoAlmacen.toString(),
                                                codigoArticulo: jsonApi[i].almacenes[j].lotes[k].ubicaciones[l].codigoArticulo.toString(),
                                                codigoLote: jsonApi[i].almacenes[j].lotes[k].ubicaciones[l].codigoLote.toString(),
                                                codigoUbicacion: jsonApi[i].almacenes[j].lotes[k].ubicaciones[l].codigoUbicacion.toString()
                                            },
                                            attributes: {exclude: ['createdAt', 'updatedAt']}   
                                        });


                                        //Actualiza o crea en la BD
                                        if(constRawInventarioDetalleUbicacion) {
                                            var creado = await constRawInventarioDetalleUbicacion.update(jsonApi[i].almacenes[j].lotes[k].ubicaciones[l]);
                                        }
                                        else{
                                            var creado = await models.RawInventarioDetalleUbicacion.create(jsonApi[i].almacenes[j].lotes[k].ubicaciones[l]);
                                        }
                                    }
                                }
                            }
                        }//FIN FOR TODOS LOS REGISTROS 
                    }
                }
            }



            //Response
            res.status(200).send(
            {
                message: 'Testing Peticion',
                
            })
            
        }catch(e){
            console.log(e)
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },


    


}