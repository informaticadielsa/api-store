import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
export default {
   

    createNewsletter: async(req, res, next) =>{
        try
        {
            const constNewsletter = await models.Newsletter.findOne(
            {
                where: {
                    nlt_email: req.body.nlt_email.toLowerCase()
                }
            });

            if(constNewsletter)
            {
                res.status(500).send(
                {
                    message: 'El email ya existe'
                })

            }
            else
            {
                var body = {
                    "nlt_email": req.body.nlt_email.toLowerCase()
                }

                await models.Newsletter.create(body)

                res.status(200).send(
                {
                    message: 'Newsletter creado con correctamente'
                })
            }
        }
        catch(e)
        {
            res.status(500).send(
            {
                message: 'Formato de correo incorrecto',
                e
            });
        }
    },


    getListNewsletter: async(req, res, next) =>{
        try{
            const constNewsletter = await models.Newsletter.findAll(
            {
            });


            res.status(200).send({
                message: 'Lista de Almacenes',
                constNewsletter
            })

        }
        catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    }

 
}