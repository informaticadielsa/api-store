import models from '../models';
const { Op } = require("sequelize");
import statusControlesMaestros from '../mapeos/mapeoControlesMaestrosMultiples';
export default{

    getList: async(req, res, next) =>{
        try{
            const constCfdi = await models.Cfdi.findAll({
                attributes: {exclude: ['createdAt', 'updatedAt']}
            })
            res.status(200).send({
                message: 'Listado de cfdi',
                constCfdi
            })
        }catch(e){
            res.status(500).send({
                message:  'Error al obtener listado de cfdi',
                e
            });
            next(e);
        }
    }

};