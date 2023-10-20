import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

export default {

    getAllProyectos: async (req, res, next) => {
        try {
            const dataProyecto = await models.Proyectos.findAll({
                attributes: {
                    exclude: ['eliminado', 'updatedAt', 'createdAt']
                }
            });

            res.status(200).send({
                message: 'Lista de Proyectos',
                proyectos: dataProyecto,
            });

        } catch (error) {
            console.error('Error en la funcion getAllProyectos ---> ', e);
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    getListProyectos: async (req, res, next) => {
        try{
            let dataProyecto = await models.Proyectos.findAll({
                where: {
                    codigoCliente: req.body.cardcodeSocioNegocio
                },
                attributes: {
                    exclude: ['eliminado', 'updatedAt', 'createdAt']
                }
            });

            if(dataProyecto) {
                for (let i = 0; i < dataProyecto.length; i++) {
                    const element = dataProyecto[i].dataValues;
                    const dataLineasProyecto = await models.LineasProyectos.findAll({
                        where: {
                            idProyecto: element.id
                        },
                    });
                    dataProyecto[i].dataValues = { ...dataProyecto[i].dataValues, LineasProyecto: dataLineasProyecto };
                }

                res.status(200).send({
                    message: 'Lista de Proyectos',
                    proyectos: dataProyecto,
                });
            } else {
                res.status(200).send({
                    message: 'No se encontraron proyectos',
                });
            }
            
        }catch(e){
            console.error('Error en la funcion getListProyectos ---> ', e);
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    getListProductosProyecto: async (req, res, next) => {
        try {
            const dataProyecto = await models.Proyectos.findOne({
                where: {
                    codigoCliente: req.body.cardcodeSocioNegocio,
                    idProyecto: req.body.idProyecto,
                },
                attributes: {
                    exclude: ['eliminado', 'updatedAt', 'createdAt']
                }
            });

            const dataLineasProyecto = await models.LineasProyectos.findAll({
                where: {
                    idProyecto: dataProyecto.dataValues.id
                },
            });

            res.status(200).send({
                message: 'Lista de productos de proyecto',
                ListaProductosProyecto: dataLineasProyecto
            });
        } catch (error) {
            console.error('Error en la funcion getListProductosProyecto ---> ', e);
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    getListProductosProyecto: async (req, res, next) => {
        try {
            const dataProyecto = await models.Proyectos.findOne({
                where: {
                    codigoCliente: req.body.cardcodeSocioNegocio,
                    idProyecto: req.body.idProyecto,
                },
                attributes: {
                    exclude: ['eliminado', 'updatedAt', 'createdAt']
                }
            });

            const dataLineasProyecto = await models.LineasProyectos.findAll({
                where: {
                    idProyecto: dataProyecto.dataValues.id
                },
            });

            res.status(200).send({
                message: 'Lista de productos de proyecto',
                ListaProductosProyecto: dataLineasProyecto
            });
        } catch (error) {
            console.error('Error en la funcion getListProductosProyecto ---> ', e);
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    }

}