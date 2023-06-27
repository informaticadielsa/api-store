import models from '../models';
import statusControls from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
export default{
    updateMetaUsuario: async(req, res, next) =>{
        try{
            const metaUsuarioUpdate = await models.MetaUsuario.findOne({
                where: {
                    mv_meta_vendedor_id: req.body.mv_meta_vendedor_id
                }
            });
            await metaUsuarioUpdate.update({
                mv_cuota: !!req.body.mv_cuota ? req.body.mv_cuota : metaUsuarioUpdate.dataValues.mv_cuota,
                updateAt: Date()
            })
            res.status(200).send({
                message: 'Actualización correcta'
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la actualización',
                e
            });
            next(e);
        }
    }
}