import models from '../models';
const { Op } = require("sequelize");
import statusControlesMaestros from '../mapeos/mapeoControlesMaestrosMultiples';
export default{
    getListadoSapFormasPago: async(req, res, next) =>{
        try{
            const constSapFormasPago = await models.SapFormasPago.findAll({
                where: {
                    sfp_cmm_estatus_id: statusControlesMaestros.SAP_FORMAS_PAGO.ACTIVO 
                },
                attributes: {
                    exclude : ['createdAt','updatedAt']
                }
            })
            res.status(200).send({
                message: 'Listado de metodos de pago de sap basicos de SAT',
                constSapFormasPago
            })
        }catch(e){
            res.status(500).send({
                message:  'Error al obtener listado de marcas',
                e
            });
            next(e);
        }
    },
    updateSapFormasPago: async(req, res, next) =>{
        try{
            const constSapFormasPago = await models.SapFormasPago.findOne({
                where: {
                    sfp_sap_formas_pago_id : req.body.sfp_sap_formas_pago_id
                },
                attributes: {
                    exclude : ['createdAt','updatedAt']
                }
            });

            await constSapFormasPago.update({
                sfp_descripcion: !!req.body.sfp_descripcion ? req.body.sfp_descripcion : constSapFormasPago.dataValues.sfp_descripcion,
                sfp_cmm_estatus_id: !!req.body.sfp_cmm_estatus_id ? req.body.sfp_cmm_estatus_id : constSapFormasPago.dataValues.sfp_cmm_estatus_id,
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
    }
};