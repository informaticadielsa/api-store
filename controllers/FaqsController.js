import models from '../models';
const { Op } = require("sequelize");
import statusControlesMaestros from '../mapeos/mapeoControlesMaestrosMultiples';
export default{
    createFaqs: async(req, res, next) =>{
        try{
            await models.Faqs.create(req.body);
            res.status(200).send({
                message: 'Faqs creda con exito'
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al crear la Faqs',
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
    getListadoFaqs: async(req, res, next) =>{
        try{
            const constFaqs = await models.Faqs.findAll({
                where: {
                    faqs_cmm_estatus_id: { [Op.ne] : statusControlesMaestros.FAQS_STATUS.ELIMINADA }
                }
            })
            res.status(200).send({
                message: 'Listado faqs',
                constFaqs
            })
        }catch(e){
            res.status(500).send({
                message:  'Error al obtener listado de faqs',
                e
            });
            next(e);
        }
    },
    updateFaqs: async(req, res, next) =>{
        try{

            const faqsUpdate = await models.Faqs.findOne({
                where: {
                    faqs_faqs_id : req.body.faqs_faqs_id
                }
            });
            await faqsUpdate.update({
                faqs_identificador: !!req.body.faqs_identificador ? req.body.faqs_identificador : faqsUpdate.dataValues.faqs_identificador,
                faqs_pregunta: !!req.body.faqs_pregunta ? req.body.faqs_pregunta : faqsUpdate.dataValues.faqs_pregunta,
                faqs_respuesta: !!req.body.faqs_respuesta ? req.body.faqs_respuesta : faqsUpdate.dataValues.faqs_respuesta,
                faqs_orden: !!req.body.faqs_orden ? req.body.faqs_orden : faqsUpdate.dataValues.faqs_orden,
                faqs_cmm_estatus_id: !!req.body.faqs_cmm_estatus_id ? req.body.faqs_cmm_estatus_id : faqsUpdate.dataValues.faqs_cmm_estatus_id,
                faqs_usu_usuario_modificado_id: req.body.faqs_usu_usuario_modificado_id,
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
    deleteFaqs: async(req, res, next) =>{
        try{
            const FaqsUpdate = await models.Faqs.findOne({
                where: {
                    faqs_faqs_id : req.body.faqs_faqs_id
                }
            });
            await FaqsUpdate.update({
                faqs_cmm_estatus_id: statusControlesMaestros.FAQS_STATUS.ELIMINADA,
                faqs_usu_usuario_modificado_id: req.body.faqs_usu_usuario_modificado_id,
                updatedAt: Date()
            });
            res.status(200).send({
                message: 'FAQS eliminada exitosamente'
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al eliminar la FAQS seleccionada',
                e
            });
            next(e);
        }
    }
};