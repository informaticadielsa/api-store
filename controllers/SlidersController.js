import models from '../models';
const { Op } = require("sequelize");
import statusControlesMaestros from '../mapeos/mapeoControlesMaestrosMultiples';
export default{

    createSliders: async(req, res, next) =>{
        try{
            await models.Sliders.create(req.body);
            res.status(200).send({
                message: 'Sliders creada con exito'
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al crear el Sliders',
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
    getListSliders: async(req, res, next) =>{
        try{
            const constSliders = await models.Sliders.findAll({
                where: {
                    sld_cmm_estatus_id: { [Op.ne] : statusControlesMaestros.ESTATUS_SLIDERS.ELIMINADA }
                }
            })
            res.status(200).send({
                message: 'Listado de sliders',
                constSliders
            })
        }catch(e){
            res.status(500).send({
                message:  'Error al obtener listado de sliders',
                e
            });
            next(e);
        }
    },
    updateSliders: async(req, res, next) =>{
        try{
            const slidersUpdate = await models.Sliders.findOne({
                where: {
                    sld_sliders_id : req.body.sld_sliders_id
                }
            });

            await slidersUpdate.update({
                sld_identificador: !!req.body.sld_identificador ? req.body.sld_identificador : slidersUpdate.dataValues.sld_identificador,
                sld_nombre: !!req.body.sld_nombre ? req.body.sld_nombre : slidersUpdate.dataValues.sld_nombre,
                sld_descripcion: !!req.body.sld_descripcion ? req.body.sld_descripcion : slidersUpdate.dataValues.sld_descripcion,
                sld_url_img: !!req.body.sld_url_img ? req.body.sld_url_img : slidersUpdate.dataValues.sld_url_img,
                sld_cmm_estatus_id: !!req.body.sld_cmm_estatus_id ? req.body.sld_cmm_estatus_id : slidersUpdate.dataValues.sld_cmm_estatus_id,
                sld_usu_usuario_modificador_id: req.body.sld_usu_usuario_modificador_id,
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
            const SlidersUpdate = await models.Sliders.findOne({
                where: {
                    sld_sliders_id : req.body.sld_sliders_id
                }
            });
            await SlidersUpdate.update({
                sld_cmm_estatus_id: statusControlesMaestros.ESTATUS_SLIDERS.ELIMINADA,
                sld_usu_usuario_modificador_id: req.body.sld_usu_usuario_modificador_id,
                updatedAt: Date()
            });
            res.status(200).send({
                message: 'Slider eliminado exitosamente'
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al eliminar el Slider seleccionado',
                e
            });
            next(e);
        }
    }
};