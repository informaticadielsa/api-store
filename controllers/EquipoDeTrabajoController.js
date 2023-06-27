import models from '../models';
const { Op } = require("sequelize");
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
import {  Sequelize } from 'sequelize';

const anioBisiesto = async function (Anio)
{
    var checkYear = (((Anio % 4 == 0) && (Anio % 100 != 0)) || (Anio % 400 == 0)) ? 1 : 0;
    if (! checkYear )  
        return false;
    else 
        return true;
}

export default {
    createEquipoDeTrabajo: async (req, res, next) =>{
        try{
            //Validamos que el usuario asignado al equipo de trabajo sea gerente
            const gerente = await models.Usuario.findOne({
                where:{
                    usu_usuario_id: req.body.et_usu_usuario_gerente_id,
                    usu_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_USUARIO.ELIMINADO }
                },
                include: [
                    {
                        model: models.Rol,
                        where: {
                            rol_tipo_rol_id: statusControles.TIPO_ROL_MENU.VENDEDORES,
                            rol_nombre: statusControles.ROLES_VENDEDORES.admin
                        }
                    }
                ]
            });
            if(!!gerente){
                const equipoDeTrabajo = await models.EquipoDeTrabajo.create(req.body, {
                    include: [
                        {
                            model: models.UsuarioEquipoDeTrabajo,
                            as: 'usuarios_de_equipo'
                        }
                    ]
                });
                if(!!equipoDeTrabajo){
                    let fecha = new Date();
                    let anio = fecha.getFullYear();
                    let isBisiesto = await anioBisiesto(anio);
                    let origenes = await  [
                        //Enero
                        {
                            inicio  :   "" + anio + "/01/01",
                            final   :   "" + anio + "/01/31"
                        },
                        //Febrero
                        {
                            inicio  :   "" + anio + "/02/01",
                            final   :   isBisiesto ? "" + anio + "/02/29" : "" + anio + "/02/28"
                        },
                        //Marzo
                        {
                            inicio  :   "" + anio + "/03/01",
                            final   :   "" + anio + "/03/31"
                        },
                        //Abril
                        {
                            inicio  :   "" + anio + "/04/01",
                            final   :   "" + anio + "/04/30"
                        },
                        //Mayo
                        {
                            inicio  :   "" + anio + "/05/01",
                            final   :   "" + anio + "/05/31"
                        },
                        //Junio
                        {
                            inicio  :   "" + anio + "/06/01",
                            final   :   "" + anio + "/06/30"
                        },
                        //Julio
                        {
                            inicio  :   "" + anio + "/07/01",
                            final   :   "" + anio + "/07/31"
                        },
                        //Agosto
                        {
                            inicio  :   "" + anio + "/08/01",
                            final   :   "" + anio + "/08/31"
                        },
                        //Septiembre
                        {
                            inicio  :   "" + anio + "/09/01",
                            final   :   "" + anio + "/09/30"
                        },
                        //Octubre
                        {
                            inicio  :   "" + anio + "/10/01",
                            final   :   "" + anio + "/10/31"
                        },
                        //Noviembre
                        {
                            inicio  :   "" + anio + "/11/01",
                            final   :   "" + anio + "/11/30"
                        },
                        //Diciembre
                        {
                            inicio  :   "" + anio + "/12/01",
                            final   :   "" + anio + "/12/31"
                        }
                    ]
                    console.log('Anio', anio, isBisiesto, origenes);

                    origenes.forEach(async function(fecha, indexFecha){
                        console.log('Fecha', fecha, fecha.inicio, fecha.final);
                        await models.MetaEquipoTrabajo.create({
                            met_et_equipo_trabajo_id: equipoDeTrabajo.dataValues.et_equipo_trabajo_id,
                            met_fecha_apertura: fecha.inicio,
                            met_fecha_finalizacion: fecha.final,
                            met_meta_equipo: 0,
                            met_usu_usuario_por_id: req.body.et_usu_usuario_creador_id,
                            met_cmm_estatus_id: statusControles.ESTATUS_META_EQUIPO.ACTIVO
                        });
                        if((origenes.length - 1) == indexFecha){
                            const equipo_de_trabajo = await models.EquipoDeTrabajo.findOne({
                                where:{
                                    et_equipo_trabajo_id: equipoDeTrabajo.dataValues.et_equipo_trabajo_id
                                },
                                include: [
                                    {
                                        model: models.UsuarioEquipoDeTrabajo,
                                        as: 'usuarios_de_equipo',
                                        attributes: {
                                            exclude: ['createdAt','uedt_usuario_equipo_de_trabajo_id','uedt_et_equipo_de_trabajo_id','updatedAt']
                                        },
                                        include: [
                                            {
                                                model: models.Usuario,
                                                as: 'vendedor',
                                                attributes: {
                                                    exclude: [
                                                        'usu_contrasenia',
                                                        'usu_imagen_perfil_id',
                                                        'usu_cmm_estatus_id',
                                                        'usu_usuario_creado_por_id',
                                                        'createdAt',
                                                        'usu_usuario_modificado_por_id',
                                                        'usu_usuario_telefono',
                                                        'usu_usuario_mobil',
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
                                            }
                                        ]
                                    },
                                    {
                                        model: models.MetaEquipoTrabajo,
                                        as: 'metas'
                                    }
                                ]
                            });
                            res.status(200).send({
                                message: 'Equipo de trabajo registrado con éxito',
                                equipo_de_trabajo
                            });
                        }
                    });
                }else{
                    res.status(300).send({
                        message: 'Error al crear el equipo de trabajo'
                    })
                }
            }else{
                res.status(300).send({
                    message: 'No es posible crear un grupo sin un gerente'
                });
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al crear el equipo de trabajo',
                e
            });
            next(e);
        }
    },
    updateEquipoDeTrabajo: async(req, res, next) =>{
        try{
            let equipoDeTrabajoUpdate = await models.EquipoDeTrabajo.findOne({
                where: {
                    et_equipo_trabajo_id: req.body.et_equipo_trabajo_id
                },
                include: [
                    {
                        model: models.UsuarioEquipoDeTrabajo,
                        as: 'usuarios_de_equipo'
                    }
                ]
            });
            if(!!equipoDeTrabajoUpdate){
                await equipoDeTrabajoUpdate.update({
                    et_nombre: !!req.body.et_nombre ? req.body.et_nombre : equipoDeTrabajoUpdate.dataValues.et_nombre,
                    et_descripcion: !!req.body.et_descripcion ? req.body.et_descripcion : equipoDeTrabajoUpdate.dataValues.et_descripcion,
                    et_cmm_estatus_id: !!req.body.et_cmm_estatus_id ? req.body.et_cmm_estatus_id : equipoDeTrabajoUpdate.dataValues.et_cmm_estatus_id,
                    et_usu_usuario_modificado_id: !!req.body.et_usu_usuario_modificado_id ? req.body.et_usu_usuario_modificado_id : equipoDeTrabajoUpdate.dataValues.et_usu_usuario_modificado_id,
                    et_usu_usuario_gerente_id: !!req.body.et_usu_usuario_gerente_id ? req.body.et_usu_usuario_gerente_id : equipoDeTrabajoUpdate.dataValues.et_usu_usuario_gerente_id,
                    updatedAt: Date()
                },
                {
                    include: [
                        {
                            model: models.UsuarioEquipoDeTrabajo,
                            as: 'usuarios_de_equipo'
                        }
                    ]
                });
                if(!!req.body.usuarios_de_equipo){
                    await models.UsuarioEquipoDeTrabajo.destroy({
                        where: {
                            uedt_et_equipo_de_trabajo_id: equipoDeTrabajoUpdate.dataValues.et_equipo_trabajo_id
                        }
                    });
                    req.body.usuarios_de_equipo.forEach(async function(usuario, indexUsuario){
                        await models.UsuarioEquipoDeTrabajo.create({
                            uedt_et_equipo_de_trabajo_id: equipoDeTrabajoUpdate.dataValues.et_equipo_trabajo_id,
                            uedt_usu_usuario_id: usuario.uedt_usu_usuario_id
                        })
                        if((req.body.usuarios_de_equipo.length -1) == indexUsuario){
                            equipoDeTrabajoUpdate = await models.EquipoDeTrabajo.findOne({
                                where: {
                                    et_equipo_trabajo_id: req.body.et_equipo_trabajo_id
                                },
                                include: [
                                    {
                                        model: models.UsuarioEquipoDeTrabajo,
                                        as: 'usuarios_de_equipo',
                                        include: [
                                            {
                                                model: models.Usuario,
                                                as: 'vendedor'
                                            }
                                        ]
                                    }
                                ]
                            });
                            res.status(200).send({
                                message: 'Datos actualizados con exito',
                                equipoDeTrabajoUpdate
                            });
                        }
                    });
                }else if((!!req.body.update_status) && (req.body.et_cmm_estatus_id != statusControles.ESTATUS_EQUIPO_DE_TRABAJO.ELIMINADO)){
                    equipoDeTrabajoUpdate = await models.EquipoDeTrabajo.findOne({
                        where: {
                            et_equipo_trabajo_id: req.body.et_equipo_trabajo_id
                        },
                        include: [
                            {
                                model: models.UsuarioEquipoDeTrabajo,
                                as: 'usuarios_de_equipo',
                                include: [
                                    {
                                        model: models.Usuario,
                                        as: 'vendedor'
                                    }
                                ]
                            }
                        ]
                    });
                    res.status(200).send({
                        message: 'Datos actualizados con exito',
                        equipoDeTrabajoUpdate
                    });
                }
            }else{
                res.status(300).send({
                    message: 'Equipo de trabajo no existente'
                });
            }
        }catch(e){
            res.status(500).send({
                message: 'Erro al actualizar equipo de trabajo',
                e
            });
            next(e);
        }
    },
    getlistEquiposDeTrabajo: async (req, res, next) =>{
        try{

            const usuarioSolicitud = await models.Usuario.findOne({
                where:{
                    usu_usuario_id: req.params.idUsuario,
                    usu_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_USUARIO.ELIMINADO }
                },
                include: [
                    {
                        model: models.Rol
                    }
                ]
            });
            if(!!usuarioSolicitud){
                if((usuarioSolicitud.dataValues.role.rol_tipo_rol_id == statusControles.TIPO_ROL_MENU.VENDEDORES) && (usuarioSolicitud.dataValues.role.rol_nombre == statusControles.ROLES_VENDEDORES.admin)){
                    const equiposDeTrabajo = await models.EquipoDeTrabajo.findAll({
                        where: {
                            et_usu_usuario_gerente_id: usuarioSolicitud.dataValues.usu_usuario_id,
                            et_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_EQUIPO_DE_TRABAJO.ELIMINADO }
                        },
                        include: [
                            {
                                model: models.ControlMaestroMultiple,
                                attributes: {
                                    exclude: ['cmm_control_id','cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                }
                            }
                        ]
                    });
                    res.status(200).send({
                        message: 'Listado de equipos de trabajo, cargado correctamente',
                        equiposDeTrabajo
                    })
                }else if((usuarioSolicitud.dataValues.role.rol_tipo_rol_id == statusControles.TIPO_ROL_MENU.ADMINISTRADOR) && (usuarioSolicitud.dataValues.role.rol_nombre == statusControles.ROLES_ADMIN.admin)){
                    console.log('Es un admin');
                    const equiposDeTrabajo = await models.EquipoDeTrabajo.findAll({
                        where: {
                            et_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_EQUIPO_DE_TRABAJO.ELIMINADO },
                            et_usu_usuario_gerente_id: {[Op.ne]: null }
                        },
                        include: [
                            {
                                model: models.ControlMaestroMultiple,
                                attributes: {
                                    exclude: ['cmm_control_id','cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                }
                            },
                            {
                                model: models.Usuario,
                                as: 'gerente',
                                attributes: {
                                    exclude: ['usu_contrasenia','usu_imagen_perfil_id','usu_rol_rol_id','usu_cmm_estatus_id','usu_usuario_creado_por_id','createdAt','usu_usuario_modificado_por_id','usu_usuario_telefono','usu_usuario_mobil','updatedAt',]
                                },
                                include: [
                                    {
                                        model: models.Rol,
                                        attributes: {
                                            exclude: ['rol_rol_id','rol_descripcion','rol_usu_usuario_creado_por_id','createdAt','rol_usu_usuario_modificado_por_id','updatedAt','rol_tipo_rol_id',]
                                        }
                                    }
                                ]
                            }
                        ]
                    });
                    res.status(200).send({
                        message: 'Listado de equipos de trabajo, cargado correctamente',
                        equiposDeTrabajo
                    });
                }else{
                    res.status(300).send({
                        message: 'Usuario no permitido en esta sección, autorizacion no permitida.'
                    })
                }
            }else{
                res.status(300).send({
                    message: 'Usuario no exite o no es valido'
                });
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al traer la lista',
                e
            });
            next(e);
        }
    },
    getEquipoDeTrabajoById: async(req, res, next) =>{
        try{

            const equipo_de_trabajo = await models.EquipoDeTrabajo.findOne({
                where:{
                    et_equipo_trabajo_id: req.params.idEquipoTrabajo
                },
                include: [
                    {
                        model: models.UsuarioEquipoDeTrabajo,
                        as: 'usuarios_de_equipo',
                        attributes: {
                            exclude: ['createdAt','uedt_usuario_equipo_de_trabajo_id','uedt_et_equipo_de_trabajo_id','updatedAt']
                        },
                        include: [
                            {
                                model: models.Usuario,
                                as: 'vendedor',
                                attributes: {
                                    exclude: [
                                        'usu_contrasenia',
                                        'usu_imagen_perfil_id',
                                        'usu_cmm_estatus_id',
                                        'usu_usuario_creado_por_id',
                                        'createdAt',
                                        'usu_usuario_modificado_por_id',
                                        'usu_usuario_telefono',
                                        'usu_usuario_mobil',
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
                            }
                        ]
                    },
                    {
                        model: models.MetaEquipoTrabajo,
                        as: 'metas',
                        order: [
                            ['met_meta_equipo_trabajo_id', 'ASC']
                        ]
                    },
                    {
                        model: models.ControlMaestroMultiple,
                        attributes: {
                            exclude: [
                                'cmm_control_id',
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
            res.status(200).send({
                message: 'Detalle de equipo de trabajo',
                equipo_de_trabajo
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al traer detalle',
                e
            });
            next(e);
        }
    },
    deleteEquipoDeTrabajo: async(req, res, next) =>{
        try{
            const deleteEquipoDeTrabajo = await models.EquipoDeTrabajo.findOne({ 
                where: {
                    et_equipo_trabajo_id: req.body.et_equipo_trabajo_id
                } 
            });
            if(!!deleteEquipoDeTrabajo){
                deleteEquipoDeTrabajo.update({
                    et_cmm_estatus_id: statusControles.ESTATUS_EQUIPO_DE_TRABAJO.ELIMINADO,
                    updateAt: Date(),
                    et_usu_usuario_modificado_id: req.body.et_usu_usuario_modificado_id
                });
                await models.UsuarioEquipoDeTrabajo.destroy({
                    where: {
                        uedt_et_equipo_de_trabajo_id : deleteEquipoDeTrabajo.dataValues.et_equipo_trabajo_id
                    }
                });
                res.status(200).send({
                    message: 'Equipo de trabajo, eliminado exitosamente'
                });
            }else{
                res.status(300).send({
                    message: 'Error al intentar eliminar este registro,  no exite o no esta disponible'
                });
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al eliminar equipo de trabajo',
                e
            });
            next(e);
        }
    }
}