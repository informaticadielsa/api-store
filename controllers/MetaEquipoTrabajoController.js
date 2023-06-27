import models from '../models';
const { Op } = require("sequelize");
export default{
    updateMetaEquipoTrabajo: async(req, res, next) =>{
        try{
            const updateMetaEquipo = await models.MetaEquipoTrabajo.findOne({
                where: {
                    met_meta_equipo_trabajo_id : req.body.met_meta_equipo_trabajo_id,
                    met_et_equipo_trabajo_id : req.body.met_et_equipo_trabajo_id
                }
            });
            await updateMetaEquipo.update({
                met_meta_equipo: !!req.body.met_meta_equipo ? req.body.met_meta_equipo : updateMetaEquipo.dataValues.met_meta_equipo,
                update: Date(),
                met_usu_modificado_por_id: req.body.met_usu_modificado_por_id
            });
            res.status(200).send({
                message: 'Datos actualizados'
            })
        }catch(e){
            res.status(200).send({
                message: 'Error, al actualizar la meta del equipo',
                e
            });
            next(e);
        }
    },
    getDetalleMeta: async(req, res, next) =>{
        try{
            const meta_equipo_trabajo = await models.MetaEquipoTrabajo.findOne({
                where: {
                    met_meta_equipo_trabajo_id: req.params.id
                },
                include: [
                    {
                        model: models.MetaUsuario,
                        include: [
                            {
                                model: models.Usuario,
                                as: 'vendedor',
                                attributes: {
                                    exclude: [                          
                                        'usu_contrasenia',
                                        'usu_imagen_perfil_id',
                                        'usu_rol_rol_id',
                                        'usu_usuario_creado_por_id',
                                        'createdAt',
                                        'updatedAt'
                                    ]
                                },
                                include: [
                                    {
                                        model: models.ControlMaestroMultiple,
                                        as: 'estatus_usuario',
                                        attributes: {
                                            exclude: [
                                                'cmm_control_id',
                                                'cmm_nombre',
                                                'cmm_sistema',
                                                'cmm_activo',
                                                'cmm_usu_usuario_creado_',
                                                'createdAt',
                                                'cmm_usu_usuario_modific',
                                                'updatedAt'
                                            ]
                                        }
                                    },
                                    {
                                        model: models.Rol,
                                        attributes: {
                                            exclude: [
                                                'rol_rol_id',
                                                'rol_descripcion',
                                                'rol_cmm_estatus',
                                                'rol_usu_usuario_creado_por_id',
                                                'createdAt',
                                                'rol_usu_usuario_modificado_por_id',
                                                'updatedAt',
                                                'rol_tipo_rol_id'
                                            ]
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });
            if(!!meta_equipo_trabajo){
                res.status(200).send({
                    message: 'Meta de equipo de trabajo',
                    meta_equipo_trabajo
                });
            }else{
                res.status(300).send({
                    message: 'Error al obtener meta, no existe y/o fue eliminada'
                })
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al obtener detalle de Meta Equipo de Trabajo',
                e
            });
            next(e);
        }
    }
}