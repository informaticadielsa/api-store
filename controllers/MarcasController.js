import models from '../models';
const { Op } = require("sequelize");
import statusControlesMaestros from '../mapeos/mapeoControlesMaestrosMultiples';
export default{
    createMarca: async(req, res, next) =>{
        try{
            await models.Marca.create(req.body);
            res.status(200).send({
                message: 'Marca creda con exito'
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al crear la marca de producto',
                e
            });
            next(e);
        }
    },
    getMarcaById: async(req, res, next) =>{
        try{
            const marca = await models.Marca.findOne({
                where: {
                    mar_marca_id: req.params.id
                },
                include: [
                    {
                        model: models.ControlMaestroMultiple,
                        attributes: {
                            exclude: ['cmm_control_id','cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                        }
                    }
                ],
                attributes: {
                    exclude : ['mar_usu_usuario_creado_id','createdAt','mar_usu_usuario_modificado_id','updatedAt']
                }
            })
            res.status(200).send({
                message:'Marca obtenida con exito',
                marca
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al obtener detalle de marca',
                e
            });
            next(e);
        }
    },
    getListadoMarcas: async(req, res, next) =>{
        try{
            const marcas = await models.Marca.findAll({
                where: {
                    mar_cmm_estatus_id: { [Op.ne] : statusControlesMaestros.ESTATUS_MARCAS.ELIMINADA }
                },
                include: [ 
                    {  
                        model: models.ControlMaestroMultiple,
                        attributes: {
                            exclude: ['cmm_control_id','cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                        }
                    }
                ],
                attributes: {
                    exclude : ['mar_usu_usuario_creado_id','createdAt','mar_usu_usuario_modificado_id','updatedAt']
                }
            })
            res.status(200).send({
                message: 'Listado marcas',
                marcas
            })
        }catch(e){
            res.status(500).send({
                message:  'Error al obtener listado de marcas',
                e
            });
            next(e);
        }
    },
    updateMarca: async(req, res, next) =>{
        try{
            const marcaUpdate = await models.Marca.findOne({
                where: {
                    mar_marca_id : req.body.mar_marca_id
                }
            });
            await marcaUpdate.update({
                mar_nombre: !!req.body.mar_nombre ? req.body.mar_nombre : marcaUpdate.dataValues.mar_nombre,
                mar_abreviatura: !!req.body.mar_abreviatura ? req.body.mar_abreviatura : marcaUpdate.dataValues.mar_abreviatura,
                mar_descripcion: !!req.body.mar_descripcion ? req.body.mar_descripcion : marcaUpdate.dataValues.mar_descripcion,
                mar_cmm_estatus_id: !!req.body.mar_cmm_estatus_id ? req.body.mar_cmm_estatus_id : marcaUpdate.dataValues.mar_cmm_estatus_id,
                mar_usu_usuario_modificado_id: req.body.mar_usu_usuario_modificado_id,
                updatedAt: Date(),
                mar_limitante: !!req.body.mar_limitante ? req.body.mar_limitante : marcaUpdate.dataValues.mar_limitante,
                mar_meta_titulo: !!req.body.mar_meta_titulo ? req.body.mar_meta_titulo : marcaUpdate.dataValues.mar_meta_titulo,
                mar_meta_descripcion: !!req.body.mar_meta_descripcion ? req.body.mar_meta_descripcion : marcaUpdate.dataValues.mar_meta_descripcion,
                mar_importe: !!req.body.mar_importe ? req.body.mar_importe : marcaUpdate.dataValues.mar_importe,
                mar_propiedades_extras: !!req.body.mar_propiedades_extras ? req.body.mar_propiedades_extras : marcaUpdate.dataValues.mar_propiedades_extras,
                mar_cantidad_producto: !!req.body.mar_cantidad_producto ? req.body.mar_cantidad_producto : marcaUpdate.dataValues.mar_cantidad_producto,
                rol_permiso_especial: !!req.body.rol_permiso_especial ? req.body.rol_permiso_especial : marcaUpdate.dataValues.rol_permiso_especial,
                mar_marca_link: !!req.body.mar_marca_link ? req.body.mar_marca_link : marcaUpdate.dataValues.mar_marca_link
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
    deleteMarca: async(req, res, next) =>{
        try{
            const marcaUpdate = await models.Marca.findOne({
                where: {
                    mar_marca_id : req.body.mar_marca_id
                }
            });
            await marcaUpdate.update({
                mar_cmm_estatus_id: statusControlesMaestros.ESTATUS_MARCAS.ELIMINADA,
                mar_usu_usuario_modificado_id: req.body.mar_usu_usuario_modificado_id,
                updatedAt: Date()
            });
            res.status(200).send({
                message: 'Marca eliminada exitosamente'
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al eliminar la marca seleccionada',
                e
            });
            next(e);
        }
    }
};