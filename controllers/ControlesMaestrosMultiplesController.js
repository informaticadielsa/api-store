import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
export default {
    getControlesMaestros: async(req, res, next) =>{
        try{
            console.log('getControles');
            const controles_maestros = await models.ControlMaestroMultiple.findAll();
            res.status(200).send({
                message: 'Controles maestros',
                controles_maestros
            });
        }catch(e){
           res.status(500).send({
               message: 'Error al obtener controles maestros multiples',

           });
           next(e);
        }
    },
    getListByName: async(req, res, next) =>{
        try{
            console.log('Entra en get List by name', req.params.name)
            const controles_maestros = await models.ControlMaestroMultiple.findAll({
                where: {
                    cmm_nombre: req.params.name,
                    cmm_activo: true
                },
                attributes: {
                    exclude: ['cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                }
            });
            res.status(200).send({
                message: 'Controles Maestros',
                controles_maestros
            })
        }catch(e){
            res.status(500).send({
                message: 'Error, al procesar la petición',
                e
            });
            next(e);
        }
    },
    update: async(req, res, next) =>{
        try{
            var nombreControlMaestro = req.body.cmm_nombre

            const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne({
                where: {
                    cmm_nombre : nombreControlMaestro
                }
            });

            await constControlMaestroMultiple.update({
                cmm_valor: !!req.body.cmm_valor ? req.body.cmm_valor : faqsUpdate.dataValues.cmm_valor,
                faqs_usu_usuario_modificado_id: req.body.faqs_usu_usuario_modificado_id,
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



    getFrontURL: async(req, res, next) =>{
        try{

            res.status(200).send({
                message: 'Obtenido correctamente',
                frontURL: process.env.STORE_LINK
            })


        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
}