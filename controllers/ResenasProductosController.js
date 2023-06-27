import models from '../models';
const { Op } = require("sequelize");
import statusControlesMaestros from '../mapeos/mapeoControlesMaestrosMultiples';
export default{

    createResenasProductos: async(req, res, next) =>{
        try{

            const constResenasProductos = await models.ResenasProductos.findOne({
                where: {
                    //El usuario es SN
                    rep_snu_usuario_snu_id: req.body.rep_snu_usuario_snu_id,
                    rep_prod_producto_id: req.body.rep_prod_producto_id
                }
            })

            if(constResenasProductos)
            {
                res.status(500).send({
                    message: 'No se puede ingresar la reseña.',
                    e: 'Reseña ya existe'
                });
            }
            else
            {
                await models.ResenasProductos.create(req.body);

                res.status(200).send({
                    message: 'Reseña creada con exito.'
                })
            }

        }catch(e){
            res.status(500).send({
                message: 'Error al crear la reseña',
                e
            });
            next(e);
        }
    },
    getListResenasProductosByIDProducto: async(req, res, next) =>{
        try{
            var prod_producto_id = req.params.id

            const constResenasProductos = await models.ResenasProductos.findAll({
                where: {
                    rep_prod_producto_id: prod_producto_id,
                    rep_aprobado: true
                }
            })


            for (var i = 0; i < constResenasProductos.length; i++) 
            {
                var usuarioID = constResenasProductos[i].dataValues.rep_snu_usuario_snu_id

                const constSociosNegocioUsuario = await models.SociosNegocioUsuario.findOne({
                where: {
                        snu_usuario_snu_id: usuarioID
                    },
                    attributes: ['snu_nombre', 'snu_primer_apellido']
                })

                constResenasProductos[i].dataValues.Usuario = constSociosNegocioUsuario

            }



            res.status(200).send({
                message: 'Lista de Reseñas',
                constResenasProductos
            })

        }catch(e){
            res.status(500).send({
                message:  'Error al obtener listado',
                e
            });
            next(e);
        }
    },
    AprobarResenasProductos: async(req, res, next) =>{
        try{
            var resenaID = req.body.rep_resenas_productos_id
            var usuarioAutorizo = req.body.rep_usu_usuario_modificador_id

            const constResenasProductos = await models.ResenasProductos.findOne({
                where: {
                    rep_resenas_productos_id : resenaID
                }
            });

            if(constResenasProductos)
            {
                await constResenasProductos.update({
                    rep_aprobado: true,
                    rep_usu_usuario_modificador_id: usuarioAutorizo,
                    updatedAt: Date()
                });
            }
            

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
    NOAprobarResenasProductos: async(req, res, next) =>{
        try{
            var resenaID = req.body.rep_resenas_productos_id
            var usuarioAutorizo = req.body.rep_usu_usuario_modificador_id

            const constResenasProductos = await models.ResenasProductos.findOne({
                where: {
                    rep_resenas_productos_id : resenaID
                }
            });

            console.log(constResenasProductos)
            if(constResenasProductos)
            {
                console.log("entro")
                await constResenasProductos.update({
                    rep_aprobado: "false",
                    rep_usu_usuario_modificador_id: usuarioAutorizo,
                    updatedAt: Date()
                });
            }
            

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
    getListResenasNoAprobadas: async(req, res, next) =>{
        try{
            var prod_producto_id = req.params.id

            const constResenasProductos = await models.ResenasProductos.findAll({
                where: {
                    rep_aprobado: { [Op.ne] : true }
                }
            })


            for (var i = 0; i < constResenasProductos.length; i++) 
            {
                var usuarioID = constResenasProductos[i].dataValues.rep_usu_usuario_id

                const constUsuario = await models.Usuario.findOne({
                where: {
                        usu_usuario_id: usuarioID
                    },
                    attributes: ['usu_nombre']
                })

                constResenasProductos[i].dataValues.Usuario = constUsuario
            }



            res.status(200).send({
                message: 'Lista de Reseñas',
                constResenasProductos
            })

        }catch(e){
            res.status(500).send({
                message:  'Error al obtener listado de faqs',
                e
            });
            next(e);
        }
    },
    getListResenas: async(req, res, next) =>{
        try{

            const constResenasProductos = await models.ResenasProductos.findAll({
            })


            for (var i = 0; i < constResenasProductos.length; i++) 
            {
                var usuarioID = constResenasProductos[i].dataValues.rep_snu_usuario_snu_id

                const constSociosNegocioUsuario = await models.SociosNegocioUsuario.findOne({
                where: {
                        snu_usuario_snu_id: usuarioID
                    },
                    attributes: ['snu_nombre', 'snu_primer_apellido']
                })

                constResenasProductos[i].dataValues.Usuario = constSociosNegocioUsuario

            }




            res.status(200).send({
                message: 'Lista de Reseñas',
                constResenasProductos
            })

        }catch(e){
            res.status(500).send({
                message:  'Error al obtener listado de faqs',
                e
            });
            next(e);
        }
    },
    
};