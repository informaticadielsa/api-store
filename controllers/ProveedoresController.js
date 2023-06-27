import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
export default {
   
    getListProveedores: async(req, res, next) =>{
        try{
            const listaProveedores = await models.Proveedores.findAll(
            {
                exclude: ['prv_usu_usuario_creador_id','createdAt','prv_usu_usuario_modificador_id','updatedAt']
            });
            res.status(200).send({
                message: 'Lista de Proveedores',
                listaProveedores
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    createProveedores: async(req, res, next) =>{
        try{
            await models.Proveedores.create(req.body);
            res.status(200).send({
                message: 'Creado con Exito'
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al crear proveedor',
                e
            });
            next(e);
        }
    },
    updateProveedores: async(req, res, next) =>{
        try{
            const constProveedores = await models.Proveedores.findOne({
                where: {
                    prv_proveedores_id : req.body.prv_proveedores_id
                }
            });
            await constProveedores.update({
                prv_nombre: !!req.body.prv_nombre ? req.body.prv_nombre : constProveedores.dataValues.prv_nombre,
                prv_usu_usuario_modificador_id: !!req.body.prv_usu_usuario_modificador_id ? req.body.prv_usu_usuario_modificador_id : constProveedores.dataValues.prv_usu_usuario_modificador_id,
                prv_cmm_estatus_id: !!req.body.prv_cmm_estatus_id ? req.body.prv_cmm_estatus_id : constProveedores.dataValues.prv_cmm_estatus_id,
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
    deleteProveedores: async(req, res, next) =>
    {
        try{
            const deleteProveedores = await models.Proveedores.findOne({
                where: {
                    prv_proveedores_id : req.body.prv_proveedores_id
                }
            });

            await deleteProveedores.update(
            {
                prv_cmm_estatus_id : statusControles.ESTATUS_PROVEEDORES.ELIMINADA,
                prv_usu_usuario_modificador_id: req.body.prv_usu_usuario_modificador_id,
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
    }
 
}