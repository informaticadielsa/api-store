import models from '../models';
import statusController from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
export default{
    createPaginaInstituciona: async (req, res, next) =>{
        try{
            if(!!req.body){
                req.body.pi_cmm_status_id = statusController.STATUS_PAGINA_INSTITUCIONAL.ACTIVA;
                console.log(req.body);
                



                const pagina_institucional = await models.PaginaInstitucional.create(req.body);
                



                res.status(200).send({
                    message: 'Pagina institucional, creada con exito',
                    pagina_institucional
                });
            }else{
                res.status(300).send({
                    message: 'A ocurrido un error inesperado'
                });
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al procesar la petición',
                e
            });
            next(e);
        }
    },
    updatePaginaInstitucional: async (req, res, next) =>{
        try{
            const pagina_institucional = await models.PaginaInstitucional.findOne({
                where: {
                    pi_pagina_institucional_id: req.body.pi_pagina_institucional_id,
                    pi_cmm_status_id: { [Op.ne] : statusController.STATUS_PAGINA_INSTITUCIONAL.ELIMINADA }
                }
            });
            if(!!pagina_institucional){
                await pagina_institucional.update({
                    pi_nombre_seccion: !!req.body.pi_nombre_seccion ? req.body.pi_nombre_seccion : pagina_institucional.dataValues.pi_nombre_seccion,
                    pi_contenido_html: !!req.body.pi_contenido_html ? req.body.pi_contenido_html : pagina_institucional.dataValues.pi_contenido_html,
                    pi_usu_usuario_modificador_id: !!req.body.pi_usu_usuario_modificador_id ? req.body.pi_usu_usuario_modificador_id : pagina_institucional.dataValues.pi_usu_usuario_modificador_id,
                    updatedAt: Date(),
                    pi_cmm_status_id: !!req.body.pi_cmm_status_id ? req.body.pi_cmm_status_id : pagina_institucional.dataValues.pi_cmm_status_id,
                    pi_seccion_cmm: !!req.body.pi_seccion_cmm ? req.body.pi_seccion_cmm : pagina_institucional.dataValues.pi_seccion_cmm,
                });
                res.status(200).send({
                    message: 'Pagina institucional actualizada con exito'
                });
            }else{
                res.status(300).send({
                    message: 'Pagina institucional no localizada'
                })
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al actualizar la página institucional',
                e
            });
            next(e);
        }
    },
    deletePaginaInstitucional: async(req, res, next) =>{
        try{
            const pagina_institucional = await models.PaginaInstitucional.findOne({
                where: {
                    pi_pagina_institucional_id: req.body.pi_pagina_institucional_id,
                    pi_cmm_status_id: { [Op.ne] : statusController.STATUS_PAGINA_INSTITUCIONAL.ELIMINADA }
                }
            });
            if(!!pagina_institucional){
                await pagina_institucional.update({
                    pi_cmm_status_id: statusController.STATUS_PAGINA_INSTITUCIONAL.ELIMINADA,
                    updatedAt: Date(),
                    pi_usu_usuario_modificador_id: req.body.pi_usu_usuario_modificador_id
                });
                res.status(200).send({
                    message: 'Pagina institucional eliminada correctamente'
                });
            }else{
                res.status(300).send({
                    message: 'Error al procesar la petición'
                });
            }  
        }catch(e){
            res.status(500).send({
                message: 'Error al eliminar y/o procesar la solicitud',
                e
            });
            next(e);
        }
    },
    getDetalleForAdmin: async (req, res, next) =>{
        try{
            const pagina_institucional = await models.PaginaInstitucional.findOne({
                where: {
                    pi_pagina_institucional_id: req.params.id,
                    pi_cmm_status_id: { [Op.ne] : statusController.STATUS_PAGINA_INSTITUCIONAL.ELIMINADA }
                },
                include: [
                    {
                        model: models.Usuario,
                        as: 'usuario_creador',
                        attributes: {
                            exclude: [
                                'usu_contrasenia',
                                'usu_imagen_perfil_id',
                                'usu_usuario_creado_por_id',
                                'createdAt',
                                'usu_usuario_modificado_por_id',
                                'usu_codigo_vendedor',
                                'updatedAt'
                            ]
                        },
                        include: [
                            {
                                model: models.ControlMaestroMultiple,
                                as: 'estatus_usuario',
                                attributes: {
                                    exclude: [
                                        'cmm_nombre',
                                        'cmm_sistema',
                                        'cmm_activo',
                                        'cmm_usu_usuario_creado_por_id',
                                        'createdAt',
                                        'cmm_usu_usuario_modificado_por_id',
                                        'updatedAt'
                                    ]
                                }
                            },
                            {
                                model: models.Rol,
                                attributes: {
                                    exclude: [
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
                    },
                    {
                        model: models.Usuario,
                        as: 'usuario_modificador',
                        attributes: {
                            exclude: [
                                'usu_contrasenia',
                                'usu_imagen_perfil_id',
                                'usu_usuario_creado_por_id',
                                'createdAt',
                                'usu_usuario_modificado_por_id',
                                'usu_codigo_vendedor',
                                'updatedAt'
                            ]
                        },
                        include: [
                            {
                                model: models.ControlMaestroMultiple,
                                as: 'estatus_usuario',
                                attributes: {
                                    exclude: [
                                        'cmm_nombre',
                                        'cmm_sistema',
                                        'cmm_activo',
                                        'cmm_usu_usuario_creado_por_id',
                                        'createdAt',
                                        'cmm_usu_usuario_modificado_por_id',
                                        'updatedAt'
                                    ]
                                }
                            },
                            {
                                model: models.Rol,
                                attributes: {
                                    exclude: [
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
                    },
                    {
                        model: models.ControlMaestroMultiple,
                        as: 'estatus',
                        attributes: {
                            exclude: [
                                'cmm_nombre',
                                'cmm_sistema',
                                'cmm_activo',
                                'cmm_usu_usuario_creado_por_id',
                                'createdAt',
                                'cmm_usu_usuario_modificado_por_id',
                                'updatedAt'
                            ]
                        }
                    }
                ]
            });
            if(!!pagina_institucional){
                res.status(200).send({
                    message: 'Página institucional, recuperada con éxito',
                    pagina_institucional
                })
            }else{
                res.status(300).send({
                    message: 'Página institucional, no disponible o eliminada'
                });
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al obtener detalle de la pagina institucional',
                e
            }); 
            next(e);
        }
    },
    getListadoForAdmin: async (req, res, next) =>{
        try{
            const paginas_institucionales = await models.PaginaInstitucional.findAll({
                where: {
                    pi_cmm_status_id: { [Op.ne] : statusController.STATUS_PAGINA_INSTITUCIONAL.ELIMINADA }
                },
                attributes: {
                    exclude: ['pi_contenido_html']
                },
                include: [
                    {
                        model: models.Usuario,
                        as: 'usuario_creador',
                        attributes: {
                            exclude: [
                                'usu_contrasenia',
                                'usu_imagen_perfil_id',
                                'usu_usuario_creado_por_id',
                                'createdAt',
                                'usu_usuario_modificado_por_id',
                                'usu_codigo_vendedor',
                                'updatedAt'
                            ]
                        },
                        include: [
                            {
                                model: models.ControlMaestroMultiple,
                                as: 'estatus_usuario',
                                attributes: {
                                    exclude: [
                                        'cmm_nombre',
                                        'cmm_sistema',
                                        'cmm_activo',
                                        'cmm_usu_usuario_creado_por_id',
                                        'createdAt',
                                        'cmm_usu_usuario_modificado_por_id',
                                        'updatedAt'
                                    ]
                                }
                            },
                            {
                                model: models.Rol,
                                attributes: {
                                    exclude: [
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
                    },
                    {
                        model: models.Usuario,
                        as: 'usuario_modificador',
                        attributes: {
                            exclude: [
                                'usu_contrasenia',
                                'usu_imagen_perfil_id',
                                'usu_usuario_creado_por_id',
                                'createdAt',
                                'usu_usuario_modificado_por_id',
                                'usu_codigo_vendedor',
                                'updatedAt'
                            ]
                        },
                        include: [
                            {
                                model: models.ControlMaestroMultiple,
                                as: 'estatus_usuario',
                                attributes: {
                                    exclude: [
                                        'cmm_nombre',
                                        'cmm_sistema',
                                        'cmm_activo',
                                        'cmm_usu_usuario_creado_por_id',
                                        'createdAt',
                                        'cmm_usu_usuario_modificado_por_id',
                                        'updatedAt'
                                    ]
                                }
                            },
                            {
                                model: models.Rol,
                                attributes: {
                                    exclude: [
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
                    },
                    {
                        model: models.ControlMaestroMultiple,
                        as: 'estatus',
                        attributes: {
                            exclude: [
                                'cmm_nombre',
                                'cmm_sistema',
                                'cmm_activo',
                                'cmm_usu_usuario_creado_por_id',
                                'createdAt',
                                'cmm_usu_usuario_modificado_por_id',
                                'updatedAt'
                            ]
                        }
                    }
                ]
            });
            if(!!paginas_institucionales){
                res.status(200).send({
                    message: 'Página institucional, recuperada con éxito',
                    paginas_institucionales
                })
            }else{
                res.status(300).send({
                    message: 'Página institucional, no disponible o eliminada'
                });
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al obtener detalle de la pagina institucional',
                e
            }); 
            next(e);
        }
    },
    getDetallePublic: async (req, res, next) =>{
        try{
            const pagina_institucional = await models.PaginaInstitucional.findOne({
                where: {
                    pi_pagina_institucional_id: req.params.id,
                    pi_cmm_status_id: { [Op.ne] : statusController.STATUS_PAGINA_INSTITUCIONAL.ELIMINADA }
                },
                attributes: {
                    exclude: [
                        'pi_usu_usuario_creador_id',
                        'pi_usu_usuario_modificador_id',
                        'createdAt',
                        'updatedAt',
                        'pi_cmm_status_id'
                    ]
                }
            });
            if(!!pagina_institucional){
                res.status(200).send({
                    message: 'Página institucional, recuperada con éxito',
                    pagina_institucional
                })
            }else{
                res.status(300).send({
                    message: 'Página institucional, no disponible o eliminada'
                });
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al obtener detalle de la pagina institucional',
                e
            }); 
            next(e);
        }
    },
    getListadoPublic: async (req, res, next) =>{
        try{
            const paginas_institucionales = await models.PaginaInstitucional.findAll({
                where: {
                    pi_cmm_status_id: { [Op.ne] : statusController.STATUS_PAGINA_INSTITUCIONAL.ELIMINADA }
                },
                attributes: {
                    exclude: [
                        'pi_usu_usuario_creador_id',
                        'pi_usu_usuario_modificador_id',
                        'createdAt',
                        'updatedAt',
                        'pi_cmm_status_id',
                        'pi_contenido_html'
                    ]
                }
            });
            if(!!paginas_institucionales){
                res.status(200).send({
                    message: 'Página institucional, recuperada con éxito',
                    paginas_institucionales
                })
            }else{
                res.status(300).send({
                    message: 'Página institucional, no disponible o eliminada'
                });
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al obtener detalle de la pagina institucional',
                e
            }); 
            next(e);
        }
    },
}