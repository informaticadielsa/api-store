import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
import XLSX from  'xlsx';
const sequelize = new Sequelize(process.env.POSTGRESQL);

export default{
    //Create new shipping policies
    CreateShippingPolicies: async(req, res, next) =>{
        var creadoPoliticaEnvio = false
        var creadoPoliticaEnvioAlmacen = false
        var creadoPoliticaEnvioData = false
        var id_politica_global = ''
        var mensajeError = ''
        try{

            //Validar que no exista ya
            const constPoliticasEnvio = await models.PoliticasEnvio.findOne({
                where: {
                    poe_nombre: req.body.poe_nombre,
                    poe_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_POLITICA_ENVIO.ELIMINADA }
                }
            });

            //Existe (cancelar operacion)
            if(constPoliticasEnvio)
            {
                res.status(200).send({
                    message: 'Ya existe esta politica'
                })
            }
            else
            {
                const bodyCreate = {
                    "poe_nombre": req.body.poe_nombre,
                    "poe_monto": req.body.poe_monto,
                    "poe_dias_minimo": req.body.poe_dias_minimo,
                    "poe_dias_maximo": req.body.poe_dias_maximo,
                    "poe_cmm_tipo_politica_envio": req.body.poe_cmm_tipo_politica_envio,
                    "poe_cmm_estatus_id": req.body.poe_cmm_estatus_id,
                    "poe_usu_usuario_creador_id": req.body.poe_usu_usuario_creador_id,
                    "poe_monto_compra_minimo": req.body.poe_monto_compra_minimo
                };
                
                const constPoliticaExito = await models.PoliticasEnvio.create(bodyCreate);

                if(typeof constPoliticaExito.dataValues.poe_politicas_envio_id == 'number')
                {
                    id_politica_global = constPoliticaExito.dataValues.poe_politicas_envio_id
                    creadoPoliticaEnvio = true
                    var sqlPoliticasEnvioDataSQL = ''
                    var sqlPoliticasEnvioAlmacenesSQL = ''
                    var politica_envio_id_creada = constPoliticaExito.dataValues.poe_politicas_envio_id

                    //politicas envio data SQL
                        if(req.body.politicas_envio_data.length > 0)
                        {
                            var totalComasParaInsertar = req.body.politicas_envio_data.length

                            sqlPoliticasEnvioDataSQL = sqlPoliticasEnvioDataSQL + `
                                INSERT INTO politicas_envio_data (
                                    poedata_poe_politicas_envio_id,
                                    poedata_pais_pais_id,
                                    poedata_estpa_estado_pais_id,
                                    poedata_city_ciudades_estados_id,
                                    poedata_cp_inicio,
                                    poedata_cp_final,
                                    poedata_usu_usuario_creador_id,
                                    "createdAt" 
                                )
                                VALUES
                            `;

                            for (var i = 0; i < req.body.politicas_envio_data.length; i++) 
                            {
                               
                                sqlPoliticasEnvioDataSQL = sqlPoliticasEnvioDataSQL + `(
                                    `+politica_envio_id_creada+`,
                                    `+req.body.politicas_envio_data[i].poedata_pais_pais_id+`,
                                    `+req.body.politicas_envio_data[i].poedata_estpa_estado_pais_id+`,
                                    `+req.body.politicas_envio_data[i].poedata_city_ciudades_estados_id+`,
                                    `+req.body.politicas_envio_data[i].poedata_cp_inicio+`,
                                    `+req.body.politicas_envio_data[i].poedata_cp_final+`,
                                    `+req.body.poe_usu_usuario_creador_id+`,
                                    now()
                                )`;

                                if(i+1 < totalComasParaInsertar)
                                {
                                    sqlPoliticasEnvioDataSQL = sqlPoliticasEnvioDataSQL + ","
                                }
                            }
                        }
                        else
                        {
                            mensajeError = 'Error: No hay lineas de politicas de envio'
                            errorBool = true
                        }
                    //Fin politicas envio data SQL

                    //politicas envio almacen SQL
                        if(req.body.politicas_envio_almacenes.length > 0)
                        {
                            var totalComasParaInsertar = req.body.politicas_envio_almacenes.length

                            sqlPoliticasEnvioAlmacenesSQL = sqlPoliticasEnvioAlmacenesSQL + `
                                INSERT INTO politicas_envio_almacenes (
                                    poew_poe_politicas_envio_id,
                                    poew_alm_almacen_id,
                                    poew_usu_usuario_creador_id,
                                    "createdAt" 
                                )
                                VALUES
                            `;

                            for (var i = 0; i < req.body.politicas_envio_almacenes.length; i++) 
                            {
                                sqlPoliticasEnvioAlmacenesSQL = sqlPoliticasEnvioAlmacenesSQL + `(
                                    `+politica_envio_id_creada+`,
                                    `+req.body.politicas_envio_almacenes[i].poew_alm_almacen_id+`,
                                    `+req.body.poe_usu_usuario_creador_id+`,
                                    now()
                                )`;

                                if(i+1 < totalComasParaInsertar)
                                {
                                    sqlPoliticasEnvioAlmacenesSQL = sqlPoliticasEnvioAlmacenesSQL + ","
                                }
                            }

                            console.log(sqlPoliticasEnvioAlmacenesSQL)


                        }
                        else
                        {
                            mensajeError = 'Error: No hay lineas de politicas de envio'
                            errorBool = true
                        }
                    //Fin politicas envio almacen SQL

                    const constsqlPoliticasEnvioDataSQL = await sequelize.query(sqlPoliticasEnvioDataSQL,
                    { 
                        type: sequelize.QueryTypes.SELECT 
                    });

                    creadoPoliticaEnvioData = true

                    const constsqlPoliticasEnvioAlmacenesSQL = await sequelize.query(sqlPoliticasEnvioAlmacenesSQL,
                    { 
                        type: sequelize.QueryTypes.SELECT 
                    });
                    creadoPoliticaEnvioAlmacen = true

                    res.status(200).send({
                        message: 'Creado con exito',
                        "mensajeError": mensajeError
                    })
                }
            }
        }catch(e){
            if(creadoPoliticaEnvio == true || creadoPoliticaEnvioAlmacen == true || creadoPoliticaEnvioData == true)
            {
                //Eliminara los almacenes si se crearon
                if(creadoPoliticaEnvioAlmacen == true)
                {
                    await models.PoliticasEnvioAlmacenes.destroy({
                        where: {
                            poew_poe_politicas_envio_id: id_politica_global
                        }
                    });
                }
                //Eliminara la data si se creo
                if(creadoPoliticaEnvioData == true)
                {
                    await models.PoliticasEnvioData.destroy({
                        where: {
                            poedata_poe_politicas_envio_id: id_politica_global
                        }
                    });
                }
                if(creadoPoliticaEnvio == true)
                {
                    await models.PoliticasEnvio.destroy({
                        where: {
                            poe_politicas_envio_id: id_politica_global
                        }
                    });
                }
                
            }

            res.status(500).send({
                message: 'Error',
                e
            });
            next(e);
        }
    },

    //get detail from policies by id
    getShippingPoliciesDetail: async(req, res, next) =>{
        try{
            var poe_politicas_envio_id = req.params.poe_politicas_envio_id
   
            //Validadores de que existe la promocion
            const constPoliticasEnvio = await models.PoliticasEnvio.findOne(
            {
                where: {
                    poe_politicas_envio_id: poe_politicas_envio_id,
                    poe_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_POLITICA_ENVIO.ELIMINADA }
                },
                attributes: {
                    exclude: ['poe_usu_usuario_creador_id','createdAt','poe_usu_usuario_modificador_id', 'updatedAt']
                },
            });

            const constPoliticasEnvioAlmacenes = await models.PoliticasEnvioAlmacenes.findAll(
            {
                where: {
                    poew_poe_politicas_envio_id: poe_politicas_envio_id
                },
                attributes: {
                    exclude: ['poedata_usu_usuario_creador_id','createdAt','poedata_usu_usuario_modificador_id', 'updatedAt']
                },
            });

            const constPoliticasEnvioData = await models.PoliticasEnvioData.findAll(
            {
                where: {
                    poedata_poe_politicas_envio_id: poe_politicas_envio_id
                },
                attributes: {
                    exclude: ['poew_usu_usuario_creador_id','createdAt','poew_usu_usuario_modificador_id', 'updatedAt']
                },
            });



            //Concatenar informacion extra
            for (var i = 0; i < constPoliticasEnvioData.length; i++) 
            {       

                if(constPoliticasEnvioData[i].poedata_pais_pais_id != null)
                {
                    const costPaisGetID = await models.Pais.findOne(
                    {
                        where: {
                            pais_pais_id: constPoliticasEnvioData[i].poedata_pais_pais_id
                        }
                    })

                    constPoliticasEnvioData[i].dataValues.pais = costPaisGetID
                }
                else
                {
                    constPoliticasEnvioData[i].dataValues.pais = []
                }





                if(constPoliticasEnvioData[i].poedata_estpa_estado_pais_id != null)
                {
                    const constEstado = await models.Estado.findOne(
                    {
                        where: {
                            
                            estpa_estado_pais_id: constPoliticasEnvioData[i].poedata_estpa_estado_pais_id
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });
                    constPoliticasEnvioData[i].dataValues.estado = constEstado

                }
                else
                {
                    constPoliticasEnvioData[i].dataValues.estado = []
                }
               
                if(constPoliticasEnvioData[i].poedata_city_ciudades_estados_id != null)
                {
                    //Obtener informacion de la ciudad mediante el id que viene en los envios_data
                    const costCiudadesEstados = await models.CiudadesEstados.findOne(
                    {
                        where: {
                            city_ciudades_estados_id: constPoliticasEnvioData[i].poedata_city_ciudades_estados_id
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });

                    // const costCiudadesEstadosCp = await models.CiudadesEstadosCp.findOne(
                    // {
                    //     where: {
                    //         citycp_ciudades_estados_cp: constPoliticasEnvioData[i].poedata_city_ciudades_estados_id
                    //     },
                    //     attributes: {exclude: ['createdAt', 'updatedAt']}   
                    // });

                    constPoliticasEnvioData[i].dataValues.ciudad = costCiudadesEstados
                    // constPoliticasEnvioData[i].dataValues.ciudad_codigo_postal = costCiudadesEstadosCp
                }
                else
                {
                    constPoliticasEnvioData[i].dataValues.ciudad = []
                    // constPoliticasEnvioData[i].dataValues.ciudad_codigo_postal = []
                }
            }
            


            constPoliticasEnvio.dataValues.politicas_envio_data = constPoliticasEnvioData
            constPoliticasEnvio.dataValues.politicas_envio_almacenes = constPoliticasEnvioAlmacenes

            res.status(200).send({
                message: 'Detalle de Politica de Envio',
                constPoliticasEnvio
            })
        }
        catch(e){
            res.status(500).send({
                message: 'Error Al Obtener Detalle de Politica de Envio',
                e
            });
            next(e);
        }
    },

    //get list of shipping policies
    getShippingPoliciesList: async(req, res, next) =>{
        try{
            //Validadores de que existe la promocion
            const constPoliticasEnvio = await models.PoliticasEnvio.findAll(
            {
                where: {
                    poe_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_POLITICA_ENVIO.ELIMINADA }
                }
            });

            res.status(200).send({
                message: 'Promocion Obtenida',
                constPoliticasEnvio
            })
        }
        catch(e){
            res.status(500).send({
                message: 'Error al obtener listado',
                e
            });
            next(e);
        }
    },


    //Update
    UpdateShippingPolicies: async(req, res, next) =>{
        var DestruidoPoliticaEnvioAlmacen = false
        var DestruidoPoliticaEnvioData = false
        var id_politica_global = ''
        var varPoliticasEnvioData = ''
        var varPoliticasEnvioAlmacenes = ''
        try{

            //Obtener Politica de envio detalle
            const constPoliticasEnvio = await models.PoliticasEnvio.findOne({
                where: {
                    poe_politicas_envio_id: req.body.poe_politicas_envio_id,
                    poe_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_POLITICA_ENVIO.ELIMINADA }
                }
            });

            if(constPoliticasEnvio)
            {
                const constPoliticasEnvioData = await models.PoliticasEnvioData.findAll({
                    where: {
                        poedata_poe_politicas_envio_id: req.body.poe_politicas_envio_id
                    }
                });

                const constPoliticasEnvioAlmacenes = await models.PoliticasEnvioAlmacenes.findAll({
                    where: {
                        poew_poe_politicas_envio_id: req.body.poe_politicas_envio_id
                    }
                });

                //variables de seguridad por si falla en alguna punto
                varPoliticasEnvioData = constPoliticasEnvioData
                varPoliticasEnvioAlmacenes = constPoliticasEnvioAlmacenes





                id_politica_global = req.body.poe_politicas_envio_id
                var sqlPoliticasEnvioDataSQL = ''
                var sqlPoliticasEnvioAlmacenesSQL = ''
                var politica_envio_id_creada = req.body.poe_politicas_envio_id

                //politicas envio data SQL
                    if(req.body.politicas_envio_data.length > 0)
                    {
                        var totalComasParaInsertar = req.body.politicas_envio_data.length

                        sqlPoliticasEnvioDataSQL = sqlPoliticasEnvioDataSQL + `
                            INSERT INTO politicas_envio_data (
                                poedata_poe_politicas_envio_id,
                                poedata_pais_pais_id,
                                poedata_estpa_estado_pais_id,
                                poedata_city_ciudades_estados_id,
                                poedata_cp_inicio,
                                poedata_cp_final,
                                poedata_usu_usuario_modificador_id,
                                "createdAt" 
                            )
                            VALUES
                        `;

                        for (var i = 0; i < req.body.politicas_envio_data.length; i++) 
                        {
                           
                            sqlPoliticasEnvioDataSQL = sqlPoliticasEnvioDataSQL + `(
                                `+politica_envio_id_creada+`,
                                `+req.body.politicas_envio_data[i].poedata_pais_pais_id+`,
                                `+req.body.politicas_envio_data[i].poedata_estpa_estado_pais_id+`,
                                `+req.body.politicas_envio_data[i].poedata_city_ciudades_estados_id+`,
                                `+req.body.politicas_envio_data[i].poedata_cp_inicio+`,
                                `+req.body.politicas_envio_data[i].poedata_cp_final+`,
                                `+req.body.poe_usu_usuario_modificador_id+`,
                                now()
                            )`;

                            if(i+1 < totalComasParaInsertar)
                            {
                                sqlPoliticasEnvioDataSQL = sqlPoliticasEnvioDataSQL + ","
                            }
                        }
                    }
                    else
                    {
                        mensajeError = 'Error: No hay lineas de politicas de envio'
                        errorBool = true
                    }
                //Fin politicas envio data SQL

                //politicas envio almacen SQL
                    if(req.body.politicas_envio_almacenes.length > 0)
                    {
                        var totalComasParaInsertar = req.body.politicas_envio_almacenes.length

                        sqlPoliticasEnvioAlmacenesSQL = sqlPoliticasEnvioAlmacenesSQL + `
                            INSERT INTO politicas_envio_almacenes (
                                poew_poe_politicas_envio_id,
                                poew_alm_almacen_id,
                                poew_usu_usuario_modificador_id,
                                "createdAt" 
                            )
                            VALUES
                        `;

                        for (var i = 0; i < req.body.politicas_envio_almacenes.length; i++) 
                        {
                            sqlPoliticasEnvioAlmacenesSQL = sqlPoliticasEnvioAlmacenesSQL + `(
                                `+politica_envio_id_creada+`,
                                `+req.body.politicas_envio_almacenes[i].poew_alm_almacen_id+`,
                                `+req.body.poe_usu_usuario_modificador_id+`,
                                now()
                            )`;

                            if(i+1 < totalComasParaInsertar)
                            {
                                sqlPoliticasEnvioAlmacenesSQL = sqlPoliticasEnvioAlmacenesSQL + ","
                            }
                        }
                    }
                    else
                    {
                        mensajeError = 'Error: No hay lineas de politicas de envio'
                        errorBool = true
                    }
                //Fin politicas envio almacen SQL




                //Actualizar los Almacenes
                await models.PoliticasEnvioAlmacenes.destroy({
                    where: {
                        poew_poe_politicas_envio_id: req.body.poe_politicas_envio_id
                    }
                });

                DestruidoPoliticaEnvioAlmacen = true

                const constsqlPoliticasEnvioAlmacenesSQL = await sequelize.query(sqlPoliticasEnvioAlmacenesSQL,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });






                //Actualizar los data
                await models.PoliticasEnvioData.destroy({
                    where: {
                        poedata_poe_politicas_envio_id: req.body.poe_politicas_envio_id
                    }
                });

                DestruidoPoliticaEnvioData = true

                const constsqlPoliticasEnvioDataSQL = await sequelize.query(sqlPoliticasEnvioDataSQL,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });

                //Actualizar la politica
                await constPoliticasEnvio.update({
                    poe_nombre: !!req.body.poe_nombre ? req.body.poe_nombre : constPoliticasEnvio.dataValues.poe_nombre,
                    poe_monto: !!req.body.poe_monto ? req.body.poe_monto : constPoliticasEnvio.dataValues.poe_monto,
                    poe_dias_minimo: !!req.body.poe_dias_minimo ? req.body.poe_dias_minimo : constPoliticasEnvio.dataValues.poe_dias_minimo,
                    poe_dias_maximo: !!req.body.poe_dias_maximo ? req.body.poe_dias_maximo : constPoliticasEnvio.dataValues.poe_dias_maximo,
                    poe_cmm_tipo_politica_envio: !!req.body.poe_cmm_tipo_politica_envio ? req.body.poe_cmm_tipo_politica_envio : constPoliticasEnvio.dataValues.poe_cmm_tipo_politica_envio,
                    poe_cmm_estatus_id: !!req.body.poe_cmm_estatus_id ? req.body.poe_cmm_estatus_id : constPoliticasEnvio.dataValues.poe_cmm_estatus_id,
                    poe_usu_usuario_modificador_id: !!req.body.poe_usu_usuario_modificador_id ? req.body.poe_usu_usuario_modificador_id : constPoliticasEnvio.dataValues.poe_usu_usuario_modificador_id,
                    poe_monto_compra_minimo: !!req.body.poe_monto_compra_minimo ? req.body.poe_monto_compra_minimo : constPoliticasEnvio.dataValues.poe_monto_compra_minimo,
                    updatedAt: Date()
                });






                res.status(200).send({
                    message: 'Finalizado'
                })

            }
            else
            {
                res.status(200).send({
                    message: 'No existe la politica de envio'
                })
            }










            
        }catch(e){
            if(DestruidoPoliticaEnvioAlmacen == true || DestruidoPoliticaEnvioData == true)
            {
                //Eliminara los almacenes si se crearon
                if(DestruidoPoliticaEnvioAlmacen == true)
                {
                    await models.PoliticasEnvioAlmacenes.destroy({
                        where: {
                            poew_poe_politicas_envio_id: id_politica_global
                        }
                    });

                    console.log(varPoliticasEnvioAlmacenes[0].dataValues)



                    for (var b = 0; b < varPoliticasEnvioAlmacenes.length; b++) 
                    {
                        await models.PoliticasEnvioAlmacenes.create(varPoliticasEnvioAlmacenes[b].dataValues)
                    }
                }

                //Eliminara los data si se crearon
                if(DestruidoPoliticaEnvioData == true)
                {
                    console.log("Entro a destruir los envio data")
                    await models.PoliticasEnvioData.destroy({
                        where: {
                            poedata_poe_politicas_envio_id: id_politica_global
                        }
                    });

                    for (var f = 0; f < varPoliticasEnvioData.length; f++) 
                    {
                        await models.PoliticasEnvioData.create(varPoliticasEnvioData[f].dataValues)
                    }
                }
            }
            res.status(500).send({
                message: 'Error',
                e
            });
            next(e);
        }
    },

    //Update just status
    UpdateShippingPoliciesStatus: async(req, res, next) =>{
        try{
            const deletePoliticasEnvio = await models.PoliticasEnvio.findOne({
                where: {
                    poe_politicas_envio_id: req.body.poe_politicas_envio_id
                }
            });

            await deletePoliticasEnvio.update(
            {
                poe_cmm_estatus_id : req.body.poe_cmm_estatus_id,
                poe_usu_usuario_modificador_id: req.body.poe_usu_usuario_modificador_id,
                updatedAt: Date()
            })

            res.status(200).send({
                message: 'Actualizado Estatus Correctamente'
            });
        }
        catch(e)
        {
            res.status(500).send({
                message: 'Error al actualizar',
                e
            });
            next(e);
        }
    },

    //Delete
    DeleteShippingPolicies: async(req, res, next) =>{
        try{
            const deletePoliticasEnvio = await models.PoliticasEnvio.findOne({
                where: {
                    poe_politicas_envio_id: req.body.poe_politicas_envio_id
                }
            });

            await deletePoliticasEnvio.update(
            {
                poe_cmm_estatus_id : statusControles.ESTATUS_POLITICA_ENVIO.ELIMINADA,
                poe_usu_usuario_modificador_id: req.body.poe_usu_usuario_modificador_id,
                updatedAt: Date()
            })

            res.status(200).send({
                message: 'Eliminado correctamente'
            });

        }
        catch(e)
        {
            res.status(500).send({
                message: 'Error al eliminar el atributo',
                e
            });
            next(e);
        }
    },

};