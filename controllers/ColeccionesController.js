import models from '../models';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
export default {

    createCollection: async(req, res, next) =>{
        try
        {
            await models.ProductosColecciones.create()
            await models.Colecciones.create()

            res.status(200).send(
            {
               // arrayProducts,
                message: 'Se actualizó correctamente la cotización.',
                status:'success'
            })
           
                res.status(500).send({
                    message: 'No encontramos la cotización, para actualizar el estatus.',
                    status:'fail'
                })
            
        }
        catch(e)
        {
            res.status(500).send(
            {
              message: 'Error al actualizar el estatus de la cotización',
              e
            });
            next(e);
        }
    }

}