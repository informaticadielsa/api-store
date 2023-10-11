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

            let respondProductsId = await models.Producto.findAll({
                attributes: ['prod_nombre_extranjero', 'prod_cmm_estatus_id'],
                where: {
                    prod_cmm_estatus_id: 1000016,
                    prod_nombre_extranjero: {
                        [Sequelize.Op.like]: `${word}%`,
                    }
                },
                limit: 10,
            });

            respondProductsId = respondProductsId.map((item) => {
                return { prod_nombre: item.prod_nombre_extranjero }
            });
            
            let respondProductMarca = await models.Marca.findAll({
                attributes: ['mar_nombre', 'mar_cmm_estatus_id'],
                where: {
                    mar_cmm_estatus_id: 1000042,
                    mar_nombre: {
                        [Sequelize.Op.like]: `${word}%`,
                    }
                },
                limit: 10,
            });

            respondProductMarca = respondProductMarca.map((item) => {
                return { prod_nombre: item.mar_nombre }
            });

            const respondProduct = await models.Producto.findAll({
                attributes: ['prod_nombre'],
                where: {
                    prod_cmm_estatus_id: 1000016,
                    prod_nombre: {
                        [Sequelize.Op.like]: `${word}%`,
                    }
                },
                limit: 10,
            });

            let respondProdDesc = await models.Producto.findAll({
                attributes: ['prod_descripcion'],
                where: {
                    prod_cmm_estatus_id: 1000016,
                    prod_descripcion: {
                        [Op.iLike]: Sequelize.fn("LOWER", `${word}%`),
                    }
                },
                limit: 10,
            });

            respondProdDesc = respondProdDesc.map((item) => {
                return { prod_nombre: item.prod_descripcion.substring(0, 55) }
            });

            const dataProd = [...respondProductsId, ...respondProductMarca, ...respondProduct, ...respondProdDesc];

            res.status(200).send(
            {
                message: 'Busqueda realizada correctamente',
                data: dataProd,
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