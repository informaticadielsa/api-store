import models from '../models';
import status from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
export default {
    getRolesVendedores: async (req, res, next)=>{
        try{
            const listRoles = await models.Rol.findAll({
                order: [['rol_rol_id','DESC']], 
                attributes: {
                    exclude : ['rol_usu_usuario_creado_por_id', 'createdAt', 'rol_usu_usuario_modificado_por_id', 'updatedAt']
                },
                include: [
                    { 
                        model: models.ControlMaestroMultiple, 
                        attributes: { 
                            exclude: ['cmm_nombre', 'cmm_sistema', 'cmm_activo', 'cmm_usu_usuario_creado_por_id', 'createdAt', 'cmm_usu_usuario_modificado_por_id', 'updatedAt']
                        },
                        as: 'estatusId'
                    },
                    { 
                        model: models.ControlMaestroMultiple, 
                        attributes: { 
                            exclude: ['cmm_nombre', 'cmm_sistema', 'cmm_activo', 'cmm_usu_usuario_creado_por_id', 'createdAt', 'cmm_usu_usuario_modificado_por_id', 'updatedAt']
                        },
                        as: 'tipoRol'
                    }
                ],
                where: { 
                    rol_cmm_estatus : { [Op.ne]: status.ESTATUS_ROL.ELIMINADO },
                    rol_tipo_rol_id :  status.TIPO_ROL_MENU.VENDEDORES  
                },
                order: [
                    ['rol_rol_id', 'ASC'],
                ],
            });
            //const listRoles = await models.Rol.findAll({where: { rol_cmm_estatus: status.ESTATUS_ROL.ACTIVO }});
            res.status(200).send({
                message: 'Lista obtenida con exito',
                listRoles
            })
        }catch(e){
            res.status(500).send({
                message: 'Error, al obtener roles',
                e
            });
            next(e);
        }
    },
    getRolesSocioNegocio: async (req, res, next)=>{
        try{
            const listRoles = await models.Rol.findAll({
                order: [['rol_rol_id','DESC']], 
                attributes: {
                    exclude : ['rol_usu_usuario_creado_por_id', 'createdAt', 'rol_usu_usuario_modificado_por_id', 'updatedAt']
                },
                include: [
                    { 
                        model: models.ControlMaestroMultiple, 
                        attributes: { 
                            exclude: ['cmm_nombre', 'cmm_sistema', 'cmm_activo', 'cmm_usu_usuario_creado_por_id', 'createdAt', 'cmm_usu_usuario_modificado_por_id', 'updatedAt']
                        },
                        as: 'estatusId'
                    },
                    { 
                        model: models.ControlMaestroMultiple, 
                        attributes: { 
                            exclude: ['cmm_nombre', 'cmm_sistema', 'cmm_activo', 'cmm_usu_usuario_creado_por_id', 'createdAt', 'cmm_usu_usuario_modificado_por_id', 'updatedAt']
                        },
                        as: 'tipoRol'
                    }
                ],
                where: { 
                    rol_cmm_estatus : { [Op.ne]: status.ESTATUS_ROL.ELIMINADO },
                    rol_tipo_rol_id :   status.TIPO_ROL_MENU.SOCIO_DE_NEGOCIO
                },
                order: [
                    ['rol_rol_id', 'ASC'],
                ],
            });
            //const listRoles = await models.Rol.findAll({where: { rol_cmm_estatus: status.ESTATUS_ROL.ACTIVO }});
            res.status(200).send({
                message: 'Lista obtenida con exito',
                listRoles
            })
        }catch(e){
            res.status(500).send({
                message: 'Error, al obtener roles',
                e
            });
            next(e);
        }
    },
    getRoles: async (req, res, next)=>{
        try{
            const listRoles = await models.Rol.findAll({
                attributes: {
                    exclude : ['rol_usu_usuario_creado_por_id', 'createdAt', 'rol_usu_usuario_modificado_por_id', 'updatedAt']
                },
                include: [
                    { 
                        model: models.ControlMaestroMultiple, 
                        attributes: { 
                            exclude: ['cmm_nombre', 'cmm_sistema', 'cmm_activo', 'cmm_usu_usuario_creado_por_id', 'createdAt', 'cmm_usu_usuario_modificado_por_id', 'updatedAt']
                        },
                        as: 'estatusId'
                    },
                    { 
                        model: models.ControlMaestroMultiple, 
                        attributes: { 
                            exclude: ['cmm_nombre', 'cmm_sistema', 'cmm_activo', 'cmm_usu_usuario_creado_por_id', 'createdAt', 'cmm_usu_usuario_modificado_por_id', 'updatedAt']
                        },
                        as: 'tipoRol'
                    }
                ],
                where: { 
                    rol_cmm_estatus : { [Op.ne]: status.ESTATUS_ROL.ELIMINADO }
                },
                order: [
                    ['rol_rol_id', 'ASC'],
                ],
            });
            //const listRoles = await models.Rol.findAll({where: { rol_cmm_estatus: status.ESTATUS_ROL.ACTIVO }});
            res.status(200).send({
                message: 'Lista obtenida con exito',
                listRoles
            })
        }catch(e){
            res.status(500).send({
                message: 'Error, al obtener roles',
                e
            });
            next(e);
        }
    },
    getRolById: async (req, res, next) =>{
        try{
            const rol = await models.Rol.findOne({
                include: [
                    {
                        model: models.RolPermiso,
                        attributes: {
                            exclude: ['createdAt', 'updatedAt']
                        },
                        include: [
                            {
                                model: models.Menu,
                                attributes: {
                                    exclude: ['updatedAt', 'createdAt', 'cm_usu_usuario_modificado_id', 'cm_usu_usario_creado_id', 'mn_cmm_estatus_id']
                                },
                                where: {
                                    mn_cmm_estatus_id: { [Op.ne] : status.ESTATUS_MENU.ELIMINADO }
                                }
                            }
                        ],
                        order: [
                            ['rol_per_mu_menu_id', 'ASC']
                        ]
                    }, 
                    { 
                        model: models.ControlMaestroMultiple, 
                        attributes: { 
                            exclude: ['cmm_nombre', 'cmm_sistema', 'cmm_activo', 'cmm_usu_usuario_creado_por_id', 'createdAt', 'cmm_usu_usuario_modificado_por_id', 'updatedAt']
                        },
                        as: 'estatusId'
                    },
                    { 
                        model: models.ControlMaestroMultiple, 
                        attributes: { 
                            exclude: ['cmm_nombre', 'cmm_sistema', 'cmm_activo', 'cmm_usu_usuario_creado_por_id', 'createdAt', 'cmm_usu_usuario_modificado_por_id', 'updatedAt']
                        },
                        as: 'tipoRol'
                    }
                ],
                where: { rol_rol_id: req.params.id }
            });
            res.status(200).send({
                message: 'Rol obtenido con exito',
                rol
            })
        }catch(e){
            res.status(500).send({
                message: 'Error, a traer rol',
                e
            });
            next(e);
        }
    },
    createRol: async (req, res, next) =>{
        try{
            const newRol = await models.Rol.create(req.body);
            res.status(200).send({
                message: 'Rol, creado correctamente',
                newRol
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la creación del rol',
                e
            })
            next(e);
        }
    },
    updateRol: async(req, res, next) =>{
        try{
            const rolUpdate = await models.Rol.findOne({where: { rol_rol_id: req.body.rol_rol_id }});
            await rolUpdate.update({
                rol_nombre : req.body.rol_nombre,
                rol_descripcion : req.body.rol_descripcion,
                rol_cmm_estatus : req.body.rol_cmm_estatus,
                rol_usu_usuario_modificado_por_id : req.body.rol_usu_usuario_modificado_por_id,
                updatedAt : Date()
            },{where: { rol_rol_id : req.body.rol_rol_id}})
            console.log('RolUpdate', rolUpdate);
            res.status(200).send({
                message: 'Rol, actualizados correctamente.',
                rolUpdate
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al actualizar',
                e
            })
            next(e);
        }
    },
    updatePermisosRoles: async (req, res, next) =>{
        try{
            const rol = await models.Rol.findOne({
                where: { rol_rol_id : req.body.rol_rol_id },
                include : [{
                    model: models.RolPermiso,
                    where: { rol_per_mu_menu_id: req.body.rol_per_mu_menu_id }
                }]
            });
            console.log(req.body.rol_per_ver, req.body.rol_per_editar, req.body.rol_per_eliminar)
            const rolPermiso = await models.RolPermiso.findOne({where: { rol_per_mu_menu_id: req.body.rol_per_mu_menu_id, rol_per_rol_rol_id: req.body.rol_per_rol_rol_id}});
            await rolPermiso.update({
                rol_per_ver : req.body.rol_per_ver != 'undefined' ? req.body.rol_per_ver : rolPermiso.rol_per_ver,
                rol_per_editar : req.body.rol_per_editar != 'undefinded' ? req.body.rol_per_editar : rolPermiso.rol_per_editar,
                rol_per_crear : req.body.rol_per_crear != 'undefinded' ? req.body.rol_per_crear : rolPermiso.rol_per_crear,
                rol_per_eliminar : req.body.rol_per_eliminar != 'undefined' ? req.body.rol_per_eliminar : rolPermiso.rol_per_eliminar,
                updatedAt: Date()
            },{
                where: { rol_per_mu_menu_id: req.body.rol_per_mu_menu_id, rol_per_rol_rol_id: req.body.rol_per_rol_rol_id }
            })
            console.log('RolPermiso', rol);
            res.status(200).send({
                message: 'Permisos actualizados correctamente',
                rol,
                rolPermiso
            });
        }catch(e){
            res.status(500).send({
                message: 'Error, al actualizar permisos',
                e
            });
            next(e);
        }
    }
}