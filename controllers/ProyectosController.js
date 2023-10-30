import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
import proyectoEmail from './SolicitudCreacionProyectoEmail';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

export default {

    getAllProyectos: async (req, res, next) => {
        try {
            const dataProyecto = await models.Proyectos.findAll({
                attributes: {
                    exclude: ['activo', 'updatedAt', 'createdAt']
                }
            });

            res.status(200).send({
                message: 'Lista de Proyectos',
                proyectos: dataProyecto,
            });

        } catch (error) {
            console.error('Error en la funcion getAllProyectos ---> ', error);
            res.status(500).send({
                message: 'Error en la petición',
                error
            });
            next(error);
        }
    },
    getListProyectos: async (req, res, next) => {
        try{
            let dataProyecto = await models.Proyectos.findAll({
                where: {
                    codigoCliente: req.body.cardcodeSocioNegocio
                },
                attributes: {
                    exclude: ['activo', 'updatedAt', 'createdAt']
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
                    exclude: ['activo', 'updatedAt', 'createdAt']
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
            console.error('Error en la funcion getListProductosProyecto ---> ', error);
            res.status(500).send({
                message: 'Error en la petición',
                error
            });
            next(error);
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
                    exclude: ['activo', 'updatedAt', 'createdAt']
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
            console.error('Error en la funcion getListProductosProyecto ---> ', error);
            res.status(500).send({
                message: 'Error en la petición',
                error
            });
            next(error);
        }
    },
    newProyecto: async (req, res, next) => {
        try {
            const dataSocioNegocio = await models.SociosNegocioUsuario.findOne({
                where: {
                    snu_cardcode: req.body.cardcodeSocioNegocio
                }
            })
            console.log('req ', req.body);
            await models.ProyectoSolicitudes.create({
                id: null,
                contacto: req.body.contacto,
                telefono: req.body.telefono,
                correo: req.body.correo,
                usuarioFinal: req.body.usuario_final,
                ciudad: req.body.ciudad,
                updatedAt: Date(),
                createdAt: Date(),
                cardcode: req.body.cardcodeSocioNegocio
            });

            await proyectoEmail.solicitudCreacionProyectoEmail(null, dataSocioNegocio, req.body);

            res.status(200).send({
                message: 'Proyecto creado correctamente'
            });
        } catch (error) {
            console.error('Error en la funcion newProyecto ---> ', error);
            res.status(500).send({
                message: 'Error en la petición',
                error
            });
            next(error);
        }
    },
    getPriceProductProyecto: async (req, res, next) => {
        try {
            console.log('req -> ', req.body);
            const data = await sequelize.query(`
                SELECT lpro.*, pro.moneda, pro."idProyecto" FROM socios_negocio AS sn
                INNER JOIN proyectos AS pro ON pro."codigoCliente" = sn.sn_cardcode
                INNER JOIN lineas_proyectos AS lpro ON lpro."idProyecto" = pro."id"
                WHERE sn.sn_socios_negocio_id = '${req.body.socio_de_negocio_id}'
                AND lpro."codigoArticulo" = '${req.body.prod_sku}'
                AND pro.estatus = 'Aprobado'`,
            {
                type: sequelize.QueryTypes.SELECT 
            });

            const newData = data[0];
            console.log(data ? data[0]: 'no existe')
            res.status(200).send({
                message: 'Precio del producto en proyecto',
                data: newData ? newData : ' no existe'
            });
        } catch (error) {
            console.error('Error en la funcion getPriceProductProyecto ---> ', error);
            res.status(500).send({
                message: 'Error en la petición',
                error
            });
            next(error);
        }
    },

}