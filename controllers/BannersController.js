import models from '../models';
const { Op } = require("sequelize");
import statusControlesMaestros from '../mapeos/mapeoControlesMaestrosMultiples';
export default{

    createBanners: async(req, res, next) =>{
        try{
            await models.Banners.create(req.body);
            res.status(200).send({
                message: 'Banners creada con exito'
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al crear el Banners',
                e
            });
            next(e);
        }
    },
    getByIdentificador: async(req, res, next) =>{
        try{
            //console.log(req.body.faqs_identificador)

            const constFaqs = await models.Faqs.findAll({
                where: {
                    faqs_identificador: req.body.faqs_identificador,
                    faqs_cmm_estatus_id: { [Op.ne] : statusControlesMaestros.FAQS_STATUS.ELIMINADA }
                },
                attributes: {
                    exclude : ['faqs_usu_usuario_creado_id','createdAt','faqs_usu_usuario_modificado_id','updatedAt']
                },
                 order: [
                    ['faqs_orden', 'ASC']
                ],
            })

            res.status(200).send({
                message:'Listado de faqs por identificador ' + req.body.faqs_identificador,
                constFaqs
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al obtener listado por identificador',
                e
            });
            next(e);
        }
    },
    getAllIdentificador: async(req, res, next) =>{
        try{
            const constFaqs = await models.Faqs.findAll({
                where: {
                    faqs_cmm_estatus_id: { [Op.ne] : statusControlesMaestros.FAQS_STATUS.ELIMINADA }
                },
                attributes: ['faqs_identificador'],
                group: [
                    'faqs_identificador'
                ]
            })

            res.status(200).send({
                message:'Listado de faqs por identificador' + req.body.faqs_identificador,
                constFaqs
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al obtener listado por identificador',
                e
            });
            next(e);
        }
    },
    getListBanners: async(req, res, next) =>{
        try{
            const constBanners = await models.Banners.findAll({
                where: {
                    bnr_cmm_estatus_id: { [Op.ne] : statusControlesMaestros.ESTATUS_BANNERS.ELIMINADA }
                }
            })
            res.status(200).send({
                message: 'Listado de banners',
                constBanners
            })
        }catch(e){
            res.status(500).send({
                message:  'Error al obtener listado de banners',
                e
            });
            next(e);
        }
    },
    updateBanners: async(req, res, next) =>{
        try{

            const bannersUpdate = await models.Banners.findOne({
                where: {
                    bnr_banners_id : req.body.bnr_banners_id
                }
            });
            await bannersUpdate.update({
                bnr_identificador: !!req.body.bnr_identificador ? req.body.bnr_identificador : bannersUpdate.dataValues.bnr_identificador,
                bnr_descripcion: !!req.body.bnr_descripcion ? req.body.bnr_descripcion : bannersUpdate.dataValues.bnr_descripcion,
                bnr_url_img: !!req.body.bnr_url_img ? req.body.bnr_url_img : bannersUpdate.dataValues.bnr_url_img,
                bnr_nombre: !!req.body.bnr_nombre ? req.body.bnr_nombre : bannersUpdate.dataValues.bnr_nombre,
                bnr_cmm_estatus_id: !!req.body.bnr_cmm_estatus_id ? req.body.bnr_cmm_estatus_id : bannersUpdate.dataValues.bnr_cmm_estatus_id,
                bnr_usu_usuario_modificador_id: req.body.bnr_usu_usuario_modificador_id,
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
    deleteBanners: async(req, res, next) =>{
        try{
            const BannersUpdate = await models.Banners.findOne({
                where: {
                    bnr_banners_id : req.body.bnr_banners_id
                }
            });
            await BannersUpdate.update({
                bnr_cmm_estatus_id: statusControlesMaestros.ESTATUS_BANNERS.ELIMINADA,
                bnr_usu_usuario_modificado_id: req.body.bnr_usu_usuario_modificado_id,
                updatedAt: Date()
            });
            res.status(200).send({
                message: 'Banner eliminado exitosamente'
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al eliminar el Banner seleccionado',
                e
            });
            next(e);
        }
    }
};