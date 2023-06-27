import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
export default {
    crearSolicitudDeCredito: async(req, res, next) =>{
        try{
            req.body.sdc_status_cmm_control_id = statusControles.STATUS_SOLICITUD_CREDITO.INCOMPLETA;
            const solicitud_de_credito = await models.SolicitudDeCredito.create(req.body, {
                include: [
                    {
                        model: models.SucursalSolicitudDeCredito,
                        as: 'sucursales'
                    },
                    {
                        model: models.VehiculoSolicitudDeCredito,
                        as: 'vehiculos'
                    }
                ]
            });
            if(!!solicitud_de_credito){
                res.status(200).send({
                    message: 'Solicitud de credito creada con exito',
                    solicitud_de_credito
                });
            }else{
                res.status(300).send({
                    message: 'Error al crear la solicitud de credito.'
                })
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al crear solicitud de credito',
                e
            });
            next(e);
        }
    },
    getSolicitudDeCreditoById: async(req, res, next) =>{
        try{
            const solicitud_de_credito = await models.SolicitudDeCredito.findOne({
                where: {
                    sdc_solicitud_de_credito_id: req.params.id
                },
                include: [
                    {
                        model: models.SucursalSolicitudDeCredito,
                        as: 'sucursales'
                    },
                    {
                        model: models.VehiculoSolicitudDeCredito,
                        as: 'vehiculos'
                    },
                    {
                        model: models.ArchivosDeInicio,
                        as: 'anexos'
                    }
                ]
            });
            if(!!solicitud_de_credito){
                res.status(200).send({
                    message: 'Solicitud de crédito',
                    solicitud_de_credito
                });
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al obtener solicitud de credito',
                e
            });
            next(e);
        }
    },
}