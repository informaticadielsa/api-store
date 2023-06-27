import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
export default {
   


    getListSociosNegocioDirecciones: async(req, res, next) =>{
        try{
            const listaSocioNegociosDirecciones = await models.SociosNegocioDirecciones.findAll(
            {
                where: {
                        snd_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_SOCIOS_NEGOCIO_DIRECCIONES.ELIMINADA }
                    },
                include: 
                [
                    {
                        model: models.Pais,
                        attributes: 
                        {
                            exclude: ['pais_usu_usuario_creador_id','createdAt','pais_usu_modificado_por_id','updatedAt']
                        }
                    },
                    {
                        model: models.Estado,
                        attributes: 
                        {
                            exclude: ['estpa_usu_usuario_creador_id','createdAt','estpa_usu_usuario_modificador_id','updatedAt']
                        }
                    },
                ],
            });
            res.status(200).send({
                message: 'Lista de Direccion de Socios Negocios',
                listaSocioNegociosDirecciones
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    getListSociosNegocioDireccionesByID: async(req, res, next) =>{
        try{
            const listaSndbyid = await models.SociosNegocioDirecciones.findOne(
            {
                where: {
                    snd_direcciones_id: req.params.id
                },
                attributes: {exclude: ['createdAt', 'updatedAt']},
                include: 
                [
                    {
                        model: models.Pais,
                        attributes: 
                        {
                            exclude: ['pais_usu_usuario_creador_id','createdAt','pais_usu_modificado_por_id','updatedAt']
                        }
                    },
                    {
                        model: models.Estado,
                        attributes: 
                        {
                            exclude: ['estpa_usu_usuario_creador_id','createdAt','estpa_usu_usuario_modificador_id','updatedAt']
                        }
                    },
                    {
                        model: models.CarritoDeCompra
                    }
                ],
            });
            res.status(200).send({
                message: 'Direccion SN con id',
                listaSndbyid
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    getListSociosNegocioDireccionesByCardCode: async(req, res, next) =>{
        try{
            const listaSnubycardcode = await models.SociosNegocioDirecciones.findAll(
            {
                where: 
                {
                    snd_cardcode: req.body.snd_cardcode,
                    snd_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_SOCIOS_NEGOCIO_DIRECCIONES.ELIMINADA } 
                },
                attributes: {exclude: ['createdAt', 'updatedAt']},
                include: 
                [
                    {
                        model: models.Pais,
                        attributes: 
                        {
                            exclude: ['pais_usu_usuario_creador_id','createdAt','pais_usu_modificado_por_id','updatedAt']
                        }
                    },
                    {
                        model: models.Estado,
                        attributes: 
                        {
                            exclude: ['estpa_usu_usuario_creador_id','createdAt','estpa_usu_usuario_modificador_id','updatedAt']
                        }
                    },
                ],
                
            });
            res.status(200).send({
                message: 'Lista de Direcciones de Socios Negocios por cardcode',
                listaSnubycardcode
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al obtener Direcciones SN por cardcode',
                e
            });
            next(e);
        }
    },
    createSociosNegocioDirecciones: async(req, res, next) =>{
        try{
            await models.SociosNegocioDirecciones.create(req.body);
            res.status(200).send({
                message: 'Usuario de Socio de Negocio creado con exito'
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al crear usuario de Socio de Negocio',
                e
            });
            next(e);
        }
    },
    updateSociosNegocioDirecciones: async(req, res, next) =>{
        try{
            const SNUpdate = await models.SociosNegocioDirecciones.findOne({
                where: {
                    snd_direcciones_id : req.body.snd_direcciones_id
                }
            });
            await SNUpdate.update({
                snd_pais_id: !!req.body.snd_pais_id ? req.body.snd_pais_id : SNUpdate.dataValues.snd_pais_id,
                snd_estado_id: !!req.body.snd_estado_id ? req.body.snd_estado_id : SNUpdate.dataValues.snd_estado_id,
                snd_ciudad: !!req.body.snd_ciudad ? req.body.snd_ciudad : SNUpdate.dataValues.snd_ciudad,
                snd_direccion: !!req.body.snd_direccion ? req.body.snd_direccion : SNUpdate.dataValues.snd_direccion,
                snd_direccion_num_ext: !!req.body.snd_direccion_num_ext ? req.body.snd_direccion_num_ext : SNUpdate.dataValues.snd_direccion_num_ext,
                snd_direccion_num_int: !!req.body.snd_direccion_num_int ? req.body.snd_direccion_num_int : SNUpdate.dataValues.snd_direccion_num_int,
                snd_direccion_telefono: !!req.body.snd_direccion_telefono ? req.body.snd_direccion_telefono : SNUpdate.dataValues.snd_direccion_telefono,
                snd_calle1: !!req.body.snd_calle1 ? req.body.snd_calle1 : SNUpdate.dataValues.snd_calle1,
                snd_calle2: !!req.body.snd_calle2 ? req.body.snd_calle2 : SNUpdate.dataValues.snd_calle2,
                snd_cardcode: !!req.body.snd_cardcode ? req.body.snd_cardcode : SNUpdate.dataValues.snd_cardcode,
                snd_cmm_estatus_id: !!req.body.snd_cmm_estatus_id ? req.body.snd_cmm_estatus_id : SNUpdate.dataValues.snd_cmm_estatus_id,
                snd_usu_usuario_modificado_id: !!req.body.snu_usu_usuario_modificado_id ? req.body.snu_usu_usuario_modificado_id : SNUpdate.dataValues.snu_usu_usuario_modificado_id,
                snd_idDireccion: !!req.body.snd_idDireccion ? req.body.snd_idDireccion : SNUpdate.dataValues.snd_idDireccion,
                snd_codigo_postal: !!req.body.snd_codigo_postal ? req.body.snd_codigo_postal : SNUpdate.dataValues.snd_codigo_postal,
                snd_tipoDir: !!req.body.snd_tipoDir ? req.body.snd_tipoDir : SNUpdate.dataValues.snd_tipoDir,
                snd_colonia: !!req.body.snd_colonia ? req.body.snd_colonia : SNUpdate.dataValues.snd_colonia,
                snd_alias: !!req.body.snd_alias ? req.body.snd_alias : SNUpdate.dataValues.snd_alias,
                snd_direccion_envio_default: !!req.body.snd_direccion_envio_default ? req.body.snd_direccion_envio_default : SNUpdate.dataValues.snd_direccion_envio_default,
                snd_contacto: !!req.body.snd_contacto ? req.body.snd_contacto : SNUpdate.dataValues.snd_contacto,
                snd_telefono: !!req.body.snd_telefono ? req.body.snd_telefono : SNUpdate.dataValues.snd_telefono,
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
    deleteSociosNegocioDirecciones: async(req, res, next) =>
    {
        try{
            const deleteSocioNegocioDirecciones = await models.SociosNegocioDirecciones.findOne({
                where: {
                    snd_direcciones_id : req.body.snd_direcciones_id
                }
            });
            await deleteSocioNegocioDirecciones.update(
            {
              snd_cmm_estatus_id : statusControles.ESTATUS_SOCIOS_NEGOCIO_DIRECCIONES.ELIMINADA,
              snd_usu_usuario_modificado_id: req.body.snd_usu_usuario_modificado_id,
              updatedAt: Date()
            })

            res.status(200).send({
              message: 'Eliminado correctamente'
            });
            }catch(e){
            res.status(500).send({
              message: 'Error al eliminar el atributo',
              e
            });
            next(e);
        }
    },

 
}