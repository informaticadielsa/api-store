import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
export default {
   

    createAlmacenes: async(req, res, next) =>{
        try
        {
            await models.Almacenes.create(req.body)
            res.status(200).send(
            {
                message: 'Almacen creado exitosamente'
            })
        }
        catch(e)
        {
            res.status(500).send(
            {
              message: 'Error al crear Almacen',
              e
            });
            next(e);
        }
    },
    getAlmacenesId: async(req, res, next) =>{
        try{
            const listaAlmacenes = await models.Almacenes.findOne(
            {
                where: {
                    alm_almacen_id: req.params.id
                },
                    attributes: {exclude: ['createdAt', 'updatedAt']},
                include: [
                    {
                        model: models.ControlMaestroMultiple,
                        as: 'estatusAlmacen',
                        attributes: {
                            exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                        }
                    },
                    {
                        model: models.ControlMaestroMultiple,
                        as: 'tipoAlmacen',
                        attributes: {
                            exclude: ['cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                        }
                    }
                ]
                    
            });
            res.status(200).send({
                message: 'Lista de Almacenes',
                listaAlmacenes
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    getListAlmacenes: async(req, res, next) =>{
        try{
            const listaAlmacenes = await models.Almacenes.findAll(
                {
                    where: {
                        alm_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_ALMACENES.ELIMINADA }
                    },
                    include: [
                        {
                            model: models.Pais,
                            attributes: 
                            {
                                exclude: ['pais_usu_usuario_creador_id','createdAt','pais_usu_modificado_por_id','updatedAt']
                            }
                        },
                        {
                            model: models.Estado,
                            attributes: 
                            {
                                exclude: ['estpa_usu_usuario_creador_id','createdAt','estpa_usu_usuario_modificador_id','updatedAt']
                            }
                        },
                    ],
                    attributes: {
                    exclude : ['alm_usu_usuario_creador_id','createdAt','alm_usu_usuario_modificado_id','updatedAt']
                    }
                });
            res.status(200).send({
                message: 'Lista de Almacenes',
                listaAlmacenes
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    getListAlmacenesPublic: async(req, res, next) =>{
        try{
            const listaAlmacenes = await models.Almacenes.findAll(
                {
                    where: {
                        alm_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_ALMACENES.ELIMINADA },
                        alm_tipo_almacen: statusControles.TIPO_ALMACEN.FISICO
                    },
                    include: [
                        {
                            model: models.Pais,
                            attributes: 
                            {
                                exclude: ['pais_usu_usuario_creador_id','createdAt','pais_usu_modificado_por_id','updatedAt']
                            }
                        },
                        {
                            model: models.Estado,
                            attributes: 
                            {
                                exclude: ['estpa_usu_usuario_creador_id','createdAt','estpa_usu_usuario_modificador_id','updatedAt']
                            }
                        },
                    ],
                    attributes: {
                    exclude : ['alm_usu_usuario_creador_id','createdAt','alm_usu_usuario_modificado_id','updatedAt']
                    }
                });
            res.status(200).send({
                message: 'Lista de Almacenes',
                listaAlmacenes
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    updateAlmacenes: async(req, res, next) =>{
        try{
            const almacenesUpdate = await models.Almacenes.findOne({
                where: {
                    alm_almacen_id: req.body.alm_almacen_id
                }
            });

            await almacenesUpdate.update({
                alm_nombre : !!req.body.alm_nombre ? req.body.alm_nombre : almacenesUpdate.dataValues.alm_nombre,
                alm_codigo_postal : !!req.body.alm_codigo_postal ? req.body.alm_codigo_postal : almacenesUpdate.dataValues.alm_codigo_postal,
                alm_estado_pais_id : !!req.body.alm_estado_pais_id ? req.body.alm_estado_pais_id : almacenesUpdate.dataValues.alm_estado_pais_id,
                alm_pais_id: !!req.body.alm_pais_id ? req.body.alm_pais_id : almacenesUpdate.dataValues.alm_pais_id,
                alm_direccion : !!req.body.alm_direccion ? req.body.alm_direccion : almacenesUpdate.dataValues.alm_direccion,
                alm_tipo_almacen : !!req.body.alm_tipo_almacen ? req.body.alm_tipo_almacen : almacenesUpdate.dataValues.alm_tipo_almacen,
                alm_cmm_estatus_id : !!req.body.alm_cmm_estatus_id ? req.body.alm_cmm_estatus_id : almacenesUpdate.dataValues.alm_cmm_estatus_id,
                alm_usu_usuario_modificado_id : req.body.alm_usu_usuario_modificado_id,
                alm_pickup_stores: !!req.body.alm_pickup_stores ? req.body.alm_pickup_stores : almacenesUpdate.dataValues.alm_pickup_stores,
                updatedAt: Date()
            });

            if(!!req.body.alm_cmm_estatus_id){
                if(req.body.alm_cmm_estatus_id == statusControles.ESTATUS_ALMACENES.ELIMINADA){
                    console.log('Se destruye el almacen');
                    await sequelize.query(`
                        delete from stocks_productos  where sp_almacen_id = ` + almacenesUpdate.dataValues.alm_almacen_id + `;`, 
                    { 
                        type: sequelize.QueryTypes.SELECT 
                    });
                }else if(req.body.alm_cmm_estatus_id == statusControles.ESTATUS_ALMACENES.INACTIVA){
                    console.log('Se destruye el almacen');
                    await sequelize.query(`
                        delete from stocks_productos  where sp_almacen_id = ` + almacenesUpdate.dataValues.alm_almacen_id + `;`, 
                    { 
                        type: sequelize.QueryTypes.SELECT 
                    });
                }else if(req.body.alm_cmm_estatus_id == statusControles.ESTATUS_ALMACENES.ACTIVA){
                    const almacenesStock = await models.StockProducto.findAll({
                        where: {
                            sp_almacen_id:  req.body.alm_almacen_id
                        }
                    });
                    if(almacenesStock.length <= 0){
                        console.log('CREAREMOS PRODUCTOS');
                        await sequelize.query(`
                            insert into stocks_productos 
                            (
                                sp_prod_producto_id,
                                sp_fecha_ingreso,
                                sp_cantidad,
                                sp_usu_usuario_creador_id,
                                "createdAt",
                                sp_almacen_id
                            )
                            select 
                                producto.prod_producto_id as sp_prod_producto_id,
                                current_Date as sp_fecha_ingreso,
                                0 as sp_cantidad,
                                ` + req.body.alm_usu_usuario_modificado_id + ` as sp_usu_usuario_creador_id,
                                current_date as "createdAt",
                                producto.alm_almacen_id as sp_almacen_id
                            from(
                                select
                                    p.prod_producto_id ,
                                    a3.alm_almacen_id
                                from productos p 
                                left join almacenes a3  on  a3.alm_cmm_estatus_id != ` + statusControles.ESTATUS_ALMACENES.ELIMINADA + ` and a3.alm_almacen_id = ` + almacenesUpdate.dataValues.alm_almacen_id + `
                                where p.prod_prod_producto_padre_sku  notnull
                                and p.prod_cmm_estatus_id  != ` + statusControles.ESTATUS_PRODUCTO.ELIMINADO + `
                            )producto ;`, 
                        { 
                            type: sequelize.QueryTypes.SELECT 
                        });  
                    }
                }
            }
            res.status(200).send({
                message: 'Actualización correcta de almacen',
                almacenesUpdate
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al actualizar el almacen',
                error: e
            });
            next(e);
        }
    },
    deleteAlmacenes: async(req, res, next) =>
    {
        try{
            const deleteAlmacenes = await models.Almacenes.findOne({
                where: {
                    alm_almacen_id: req.body.alm_almacen_id
                }
            });

            await deleteAlmacenes.update(
            {
              alm_cmm_estatus_id : statusControles.ESTATUS_ALMACENES.ELIMINADA,
              alm_usu_usuario_modificado_id: req.body.alm_usu_usuario_modificado_id,
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
    },
    getAlmacenesPickUp: async(req, res, next) =>{
        try{
            const listaAlmacenes = await models.Almacenes.findAll(
            {
                where: {
                    alm_pickup_stores: true,
                    alm_cmm_estatus_id: statusControles.ESTATUS_ALMACENES.ACTIVA 
                }
            });


            res.status(200).send({
                message: 'Lista de Almacenes',
                listaAlmacenes
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