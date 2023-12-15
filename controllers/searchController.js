import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
import {  Sequelize, Op } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const {recoveryEmail} = require('../services/recoveryEmail');

export default {

    searchPrediction: async (req, res) => {
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
                    [Op.or]: [
                        {
                            prod_nombre: {
                                [Sequelize.Op.like]: `${word}%`,
                            },
                        },
                        {
                            prod_nombre: {
                                [Sequelize.Op.like]: `%${word}%`,
                            },
                        },
                    ],
                    prod_prod_producto_padre_sku: {
                        [Op.ne]: null
                    }
                },
                limit: 10,
            });

            let respondProdDesc = await models.Producto.findAll({
                attributes: ['prod_descripcion'],
                where: {
                    prod_cmm_estatus_id: 1000016,
                    [Op.or]: [
                        {
                            prod_descripcion: {
                                [Op.iLike]: Sequelize.fn("LOWER", `${word}%`),
                            },
                            prod_descripcion: {
                                [Op.iLike]: Sequelize.fn("LOWER", `%${word}%`),
                            }
                        }
                    ],
                },
                limit: 10,
            });

            respondProdDesc = respondProdDesc.map((item) => {
                let textoEncontrado = '';
                const palabrasDivididas = word.split(/\s+/);
                const expresionRegular = new RegExp(`\\b${palabrasDivididas.join('\\s*')}\\w*\\b`, 'i');
                const coincidencia = item.prod_descripcion.match(expresionRegular);
                if (coincidencia) {
                    const indiceInicio = coincidencia.index;
                    const indiceFin = indiceInicio + 55;

                    textoEncontrado = item.prod_descripcion.substring(indiceInicio, Math.min(indiceFin, item.prod_descripcion.length));
                  }
                return {
                    prod_nombre: textoEncontrado
                }
            });

            const dataProdResult = [...respondProductsId, ...respondProductMarca, ...respondProduct, ...respondProdDesc];
            const setSinDuplicados = new Set(dataProdResult);
            const dataProd = setSinDuplicados;
            res.status(200).send(
            {
                message: 'Busqueda realizada correctamente',
                data: dataProd,
            });
        }
        catch(e)
        {
            console.log('Error: ', e);
            res.status(500).send(
            {
                message: 'Error',
                e
            });
            // next(e);
        }
    },
}