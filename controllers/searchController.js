import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
import {  Sequelize, Op } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const {recoveryEmail} = require('../services/recoveryEmail');

export default {

    searchPrediction: async (req, res, next) => {
        try
        {
            const wordToSearch = req.body.wordToSearch.toUpperCase();
            const word = wordToSearch.trim();

            const respondProduct = await models.Producto.findAll({
                attributes: ['prod_nombre'],
                where: {
                    prod_cmm_estatus_id: 1000016,
                    prod_nombre: {
                        [Sequelize.Op.like]: `${word}%`,
                    }
                    // [Op.or]: [
                    //     {
                    //         prod_nombre: {
                    //             [Sequelize.Op.like]: `${word}%`,
                    //         }
                    //     },
                    //     {
                    //         prod_nombre_extranjero: {
                    //             [Sequelize.Op.like]: `${word}%`,
                    //         }
                    //     }
                    // ],
                },
                limit: 10,
            });

            res.status(200).send(
            {
                message: 'Busqueda realizada correctamente',
                data: respondProduct
            });
        }
        catch(e)
        {
            res.status(500).send(
            {
                message: 'Error',
                e
            });
            next(e);
        }
    },
}