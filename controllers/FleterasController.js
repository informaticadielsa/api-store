import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import request from 'request-promise';

export default {
   


    getListFleteras: async(req, res, next) =>{
        try{
            const listaFleteras = await models.Fleteras.findAll(
            {
                exclude: ['flet_usu_usuario_creador_id','createdAt','flet_usu_usuario_modificador_id','updatedAt']
            });
            res.status(200).send({
                message: 'Lista de Facturas',
                listaFleteras
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    getListFleterasSN: async(req, res, next) =>{
        try{
            const listaFleteras = await models.Fleteras.findAll(
            {   
                where: {
                    flet_cmm_estatus_id: statusControles.ESTATUS_FLETERA.ACTIVO
                },
                exclude: ['flet_usu_usuario_creador_id','createdAt','flet_usu_usuario_modificador_id','updatedAt']
            });
            res.status(200).send({
                message: 'Lista de Facturas',
                listaFleteras
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    createFletera: async(req, res, next) =>{
        try{
            await models.Fleteras.create(req.body);
            res.status(200).send({
                message: 'Creada Fletera con exito'
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al crear la Socio de Negocio',
                e
            });
            next(e);
        }
    },
    updateFleteras: async(req, res, next) =>{
        try{
            const constFleteras = await models.Fleteras.findOne({
                where: {
                    flet_fletera_id : req.body.flet_fletera_id
                }
            });

            await constFleteras.update({
                flet_nombre: !!req.body.flet_nombre ? req.body.flet_nombre : constFleteras.dataValues.flet_nombre,
                flet_codigo: !!req.body.flet_codigo ? req.body.flet_codigo : constFleteras.dataValues.flet_codigo,
                flet_usu_usuario_modificado_id: !!req.body.flet_usu_usuario_modificado_id ? req.body.flet_usu_usuario_modificado_id : constFleteras.dataValues.flet_usu_usuario_modificado_id,
                flet_cmm_estatus_id: !!req.body.flet_cmm_estatus_id ? req.body.flet_cmm_estatus_id : constFleteras.dataValues.flet_cmm_estatus_id,
                updatedAt: Date()
            });
            res.status(200).send({
                message: 'Actualización correcta'
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al actualizar datos',
                e
            });
            next(e);
        }
    },
    deleteFleteras: async(req, res, next) =>
    {
        try{
            const deleteFleteras = await models.Fleteras.findOne({
                where: {
                    flet_fletera_id : req.body.flet_fletera_id
                }
            });

            await deleteFleteras.update(
            {
              flet_cmm_estatus_id : statusControles.ESTATUS_FLETERA.ELIMINADA,
              flet_usu_usuario_modificado_id: req.body.flet_usu_usuario_modificado_id,
              updatedAt: Date()
            })

            res.status(200).send({
              message: 'Eliminado correctamente'
            });
            }catch(e){
            res.status(500).send({
              message: 'Error al eliminar',
              e
            });
            next(e);
        }
    },


    CotizarCarritoFleteraFront: async(req, res, next) =>{
        try{
            var BackUrl = '';
            if(process.env.PORT == 7000)
            {
                BackUrl = "http://70.35.204.203/back2"
            }
            else if(process.env.PORT == 8000)
            {
                BackUrl = "http://70.35.204.203/back"
            }
            else
            {
                BackUrl = "http://localhost:5000"
            }


            const listaFleteras = await models.Fleteras.findAll(
            {
                where: {
                    flet_cmm_estatus_id: statusControles.ESTATUS_FLETERA.ACTIVO
                },
                exclude: ['flet_usu_usuario_creador_id','createdAt','flet_usu_usuario_modificador_id','updatedAt']
            });



            console.log(listaFleteras)





            for(var z = 0; z < listaFleteras.length; z++)
            {


                if(listaFleteras[z].dataValues.flet_nombre == "Paquetexpress")
                {

                    const options = {
                        method: 'POST',
                        url: BackUrl + '/api/paquete_express/cotizar_carrito',
                        headers: {'Content-Type': 'application/json'},
                        body: {cdc_carrito_de_compra_id: req.body.cdc_carrito_de_compra_id, snd_direcciones_id: req.body.snd_direcciones_id},
                        json: true
                    };

                    var result = await request(options, function (error, response) 
                    {
                    });

                    console.log(result.tipo_envio)

                    if(result.tipo_envio == "No disponible")
                    {
                        listaFleteras[z].dataValues.tipo_envio = "No Disponible"
                        listaFleteras[z].dataValues.costoEnvio = 0
                    }
                    else
                    {
                        listaFleteras[z].dataValues.tipo_envio = result.tipo_envio
                        listaFleteras[z].dataValues.costoEnvio = result.costoEnvio
                    }

                }
                else
                {
                    listaFleteras[z].dataValues.tipo_envio = "No Disponible"
                    listaFleteras[z].dataValues.costoEnvio = 0
                }



            }


            

            res.status(200).send({
                message: 'Paquete express',
                listaFleteras
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Paqueteria no disponible',
                e
            });
            next(e);
        }
    },

 
}