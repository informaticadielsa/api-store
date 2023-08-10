import bcrypt from 'bcryptjs';
import token from '../services/token';
import jwt from 'jsonwebtoken';
import models from '../models';
const { Op } = require("sequelize");
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const {recoveryEmail} = require('../services/recoveryEmail');
export default {
    getUsuarioId: async (req, res, next) => {
        try {
            const usuario = await models.Usuario.findOne({
                where: {
                    usu_usuario_id: req.params.id
                },
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'usu_contrasenia']
                    },
                    include: [
                        {
                            model: models.ControlMaestroMultiple,
                            as: 'estatus_usuario',
                            attributes: {
                                exclude: [
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
                                    'rol_rol_id',
                                    'rol_cmm_estatus',
                                    'rol_usu_usuario_creado_por_id',
                                    'createdAt',
                                    'rol_usu_usuario_modificado_por_id',
                                    'updatedAt'
                                ]
                            },
                            include: [
                                {
                                    model: models.ControlMaestroMultiple,
                                    as: 'tipoRol',
                                    attributes: {
                                        exclude: ['cmm_control_id','cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                    }
                                }
                            ]
                        },
                        {
                            model: models.Usuario,
                            as: 'creador',
                            attributes: {
                                exclude: [
                                        'usu_usuario_id',
                                        'usu_contrasenia',
                                        'usu_imagen_perfil_id',
                                        'usu_cmm_estatus_id',
                                        'usu_usuario_creado_por_id',
                                        'createdAt',
                                        'usu_usuario_modificado_por_id',
                                        'usu_codigo_vendedor',
                                        'updatedAt'
                                ]
                            },
                            include: [
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
            });
            res.status(200).send({ message: 'Registro obtenido con exito', usuario})
        } catch (e) { 
            res.status(500).send({message: 'Algo malo ha ocurrido', e});
            next(e);
        }
    },
    addNuevoUsuario: async(req, res, next) =>{
        try{
            try{
                req.body.usu_contrasenia = await bcrypt.hash(req.body.usu_contrasenia, 10);
                req.body.usu_correo_electronico = req.body.usu_correo_electronico.toLowerCase();
                const newUser = await models.Usuario.create(req.body);
                res.status(200).send({message: "Usuario registrado correctamente"});
            }catch(e){
                res.status(300).send({
                    message: 'No se puede registrar el usuario',
                    e
                });
                next(e);
            }
        }catch(e){
            res.status(500).send({message: 'Error al registrar el usuario', e});
            next(e);
        }
    },
    updateUsuarioById: async(req, res, next) =>{
        try{
            const usuarioUpdate = await models.Usuario.findOne({
                where: {
                    usu_usuario_id : req.body.usu_usuario_id 
                },
                include: [
                    {
                        model: models.Rol,
                        include: [
                            {
                                model: models.ControlMaestroMultiple,
                                as: 'tipoRol'
                            }
                        ]
                    }
                ]
            });
            if(!!req.body.usu_contrasenia){
                req.body.usu_contrasenia = await bcrypt.hash(req.body.usu_contrasenia, 10);
            }
            
            if(usuarioUpdate.dataValues.role.dataValues.rol_nombre == statusControles.ROLES_VENDEDORES.admin){
                if(req.body.usu_cmm_estatus_id == statusControles.ESTATUS_USUARIO.ELIMINADO){
                    await models.GerentesSocioNegocios.destroy({
                        where: {
                            gs_gerente_id: deleteUsuario.dataValues.usu_usuario_id
                        }
                    });
                }
            }
            await usuarioUpdate.update({
                    usu_nombre: !!req.body.usu_nombre ? req.body.usu_nombre : usuarioUpdate.dataValues.usu_nombre,
                    usu_primer_apellido: !!req.body.usu_primer_apellido ? req.body.usu_primer_apellido : usuarioUpdate.dataValues.usu_primer_apellido,
                    usu_segundo_apellido: !!req.body.usu_segundo_apellido ? req.body.usu_segundo_apellido : usuarioUpdate.dataValues.usu_segundo_apellido,
                    usu_cmm_estatus_id: !!req.body.usu_cmm_estatus_id ? req.body.usu_cmm_estatus_id : usuarioUpdate.dataValues.usu_cmm_estatus_id,
                    usu_contrasenia: !!req.body.usu_contrasenia ? req.body.usu_contrasenia : usuarioUpdate.dataValues.usu_contrasenia,
                    usu_usuario_modificado_por_id: req.body.usu_usuario_modificado_por_id,
                    usu_rol_rol_id: !!req.body.usu_rol_rol_id ? req.body.usu_rol_rol_id : usuarioUpdate.dataValues.usu_rol_rol_id,
                    updatedAt: Date()
                });
            res.status(200).send({
                message: 'Actualización correcta'
            });
        }catch(e){
            res.status(500).send({ message: 'Error', e});
            next(e);
        }
    },
    deleteUsuarioById: async(req, res, next) =>{
        try{
            const deleteUsuario = await models.Usuario.findOne({ 
                where: { 
                    usu_usuario_id : req.body.usu_usuario_id 
                },
                include: [
                    {
                        model: models.Rol,
                        include: [
                            {
                                model: models.ControlMaestroMultiple,
                                as: 'tipoRol'
                            }
                        ]
                    }
                ]
            });
            if(deleteUsuario.dataValues.role.dataValues.rol_nombre == statusControles.ROLES_VENDEDORES.admin){
                await models.GerentesSocioNegocios.destroy({
                    where: {
                        gs_gerente_id: deleteUsuario.dataValues.usu_usuario_id
                    }
                });
            }

            await deleteUsuario.update({
                usu_cmm_estatus_id : statusControles.ESTATUS_USUARIO.ELIMINADO,
                usu_usuario_modificado_por_id: req.body.usu_usuario_modificado_por_id,
                // usu_correo_electronico: "DELETED" + Math.floor(Math.random() * (1000 - 0) + 0) + deleteUsuario.usu_correo_electronico ,
                usu_correo_electronico: String(Date.now()) + String(!!req.body.cdc_sn_socio_de_negocio_id ? req.body.cdc_sn_socio_de_negocio_id : 0 ) + String(!!req.body.cdc_usu_usuario_vendedor_id ? req.body.cdc_usu_usuario_vendedor_id : 0) + "@Eliminado.com",
                updatedAt: Date()
            });

            if(deleteUsuario.dataValues.role.dataValues.rol_tipo_rol_id == statusControles.TIPO_ROL_MENU.VENDEDORES){
                try{
                    await models.UsuarioEquipoDeTrabajo.destroy({where: {uet_usu_usuario_id: req.body.usu_usuario_id }});
                }catch(e){
                    console.log('No hay nada que eliminar');
                }
            }
            res.status(200).send({
                message: 'Usuario eliminado extiosamente'
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al eliminar el usuario',
                e
            });
            next(e);
        }
    },
    getListaGerentes: async(req, res, next) => {
        try{
            const solicitante = await models.Usuario.findOne({
                where:{
                    usu_usuario_id: req.params.id
                },
                include: [
                    {
                        model: models.Rol
                    }
                ]
            });
            if(!!solicitante){
                const gerentes = await models.Usuario.findAll({
                    where:{
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
                    ],
                    order: [ 
                        ['usu_usuario_id']
                    ]
                });
                res.status(200).send({
                    message: 'Listado de gerentes',
                    gerentes
                });
            }else{
                res.status(300).send({
                    message: 'Lo sentimos, no tienes permisos suficientes.'
                })
            }
        }catch(e){
            res.status(500).send({
                message: 'Error, al obtener gerentes',
                e
            });
            next(e);
        }
    },
    getlistUsuarios: async(req, res, next) =>{
        try{
            const usuarioActual = await models.Usuario.findOne({
                where : { usu_usuario_id : req.params.idUsuario },
                include: [
                    {
                        model: models.Rol,
                        include: [
                            {
                                model: models.ControlMaestroMultiple,
                                as: 'tipoRol'
                            }
                        ]
                    }
                ]
            });
            if(usuarioActual.dataValues.role.dataValues.rol_tipo_rol_id == statusControles.TIPO_ROL_MENU.VENDEDORES){
                const usuarios = await models.Usuario.findAll({
                    order: [['usu_usuario_id','DESC']], 
                    attributes: {exclude : ['usu_contrasenia']},
                    include: [
                        {
                            model: models.ControlMaestroMultiple,
                            attributes: {
                                exclude: ['cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                            },
                            as: 'estatus_usuario'
                        },
                        {
                            model: models.Rol,
                            where: {
                                rol_tipo_rol_id : statusControles.TIPO_ROL_MENU.VENDEDORES
                            },
                            attributes: {
                                exclude: ['rol_descripcion','rol_cmm_estatus','rol_usu_usuario_creado_por_id','createdAt','rol_usu_usuario_modificado_por_id','updatedAt' ]
                            }
                        }
                    ],
                    where: { 
                        usu_cmm_estatus_id : { [Op.ne]: statusControles.ESTATUS_USUARIO.ELIMINADO },
                        usu_usuario_id: {[Op.ne]: req.params.idUsuario ? req.params.idUsuario : null },
                        usu_usuario_creado_por_id : req.params.idUsuario
                    }
                });
                res.status(200).send({
                    message: 'Lista usuarios',
                    usuarios
                })
            }else{
                const usuarios = await models.Usuario.findAll({
                    order: [['usu_usuario_id','DESC']], 
                    attributes: {
                        exclude : ['usu_contrasenia']
                    },
                    include: [
                        {
                            model: models.ControlMaestroMultiple,
                            as: 'estatus_usuario',
                        },
                        {
                            model: models.Rol
                        }
                    ],
                    where: { 
                        usu_cmm_estatus_id : { [Op.ne]: statusControles.ESTATUS_USUARIO.ELIMINADO },
                        usu_usuario_id: {[Op.ne]: req.params.idUsuario ? req.params.idUsuario : null }
                    }
                });
                res.status(200).send({
                    message: 'Lista usuarios',
                    usuarios
                })
            }
        }catch(e){
            res.status(500).send({message: 'Petición no procesada', e});
            next(e);
        }
    },
    loginUsuario: async(req, res, next) =>{
        req.body.usu_correo_electronico = req.body.usu_correo_electronico.toLowerCase();
        try{
            const usuario = await models.Usuario.findOne({
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                }, 
                where: {
                    usu_correo_electronico: req.body.usu_correo_electronico, 
                    usu_cmm_estatus_id : statusControles.ESTATUS_USUARIO.ACTIVO
                } 
            });
            if(usuario){
                const match = await bcrypt.compare(req.body.usu_contrasenia, usuario.dataValues.usu_contrasenia);
                if(match){
                    const tokenData = {
                        
                        'usu_usuario_id':  usuario.dataValues.usu_usuario_id,
                        'usu_correo_electronico' : usuario.dataValues.usu_correo_electronico,
                        'usu_nombre' : usuario.dataValues.usu_nombre,
                        'usu_primer_apellido' : usuario.dataValues.usu_primer_apellido
                    }
                    let tokenReturn = await token.encode(tokenData);
                    const usuarioResponse = await models.Usuario.findOne({
                        attributes: {
                            exclude: ['createdAt', 'updatedAt', 'usu_contrasenia', 'usu_usuario_creado_por_id', 'usu_usuario_modificado_por_id']
                        }, 
                        where: {
                            usu_correo_electronico: req.body.usu_correo_electronico
                        },
                        include: [
                            {
                                iduser:models.Usuario,
                                model: models.ControlMaestroMultiple,
                                as: 'estatus_usuario'
                            },
                            {
                                model: models.Rol
                            }
                        ]
                    });
                    const permisos = await models.RolPermiso.findAll({
                        attributes: {
                            exclude: ['updatedAt', 'createdAt', 'rol_per_roles_permisos_id', 'rol_per_rol_rol_id', 'rol_per_mu_menu_id']
                        },
                        where: {
                            rol_per_rol_rol_id: usuarioResponse.dataValues.usu_rol_rol_id,
                            [Op.or] : [
                                {rol_per_ver: true},
                                {rol_per_editar : true},
                                {rol_per_crear : true},
                                {rol_per_eliminar : true}
                            ]
                        },
                        include: [
                            {
                                model: models.Menu,
                                attributes: {
                                    exclude: ['createdAt', 'updatedAt', 'mn_menu_id', 'cm_usu_usario_creado_id','cm_usu_usuario_modificado_id']
                                },
                                include: [
                                    {
                                        model: models.ControlMaestroMultiple,
                                        attributes: { 
                                            exclude: ['cmm_control_id', 'cmm_nombre', 'cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','updatedAt']
                                        }
                                    }
                                ],
                                where: {
                                    mn_cmm_estatus_id: statusControles.ESTATUS_MENU.ACTIVO
                                },
                                required: true
                            }
                        ],
                    });
                    usuarioResponse.dataValues.token = tokenReturn;
                    usuarioResponse.dataValues.permisos = permisos;
                    res.status(200).send({
                        message: 'Acceso Correcto, !Bienvenido!',
                        usuarioResponse
                    });
                }else{
                    res.status(300).send({message: 'Error, datos no validos'});
                }
            }else{
                res.status(300).send({message: 'Usuario no registrado o activo'});
            }
        }catch(e){
            res.status(500).send({ 
                message: 'Error al hacer login',
                e
            });
            next(e);
        }
    },
    recoveryPassword: async (req, res, next) =>{
        try{
            req.body.usu_correo_electronico = req.body.usu_correo_electronico.toLowerCase();
            const usuarioSolicitud = await models.Usuario.findOne({
                where: { 
                    usu_correo_electronico : req.body.usu_correo_electronico,
                    usu_cmm_estatus_id: statusControles.ESTATUS_USUARIO.ACTIVO
                },
                attributes: {
                    exclude: [
                    'usu_contrasenia',
                    'usu_imagen_perfil_id',
                    'usu_rol_rol_id',
                    'usu_usuario_creado_por_id',
                    'createdAt',
                    'usu_usuario_modificado_por_id',
                    'updatedAt'
                ]}
            });
            const tokenData = {
                        
                'usu_usuario_id': usuarioSolicitud.dataValues.usu_usuario_id,
                'usu_correo_electronico' :usuarioSolicitud.dataValues.usu_correo_electronico,
                'usu_nombre' :usuarioSolicitud.dataValues.usu_nombre,
                'usu_primer_apellido' :usuarioSolicitud.dataValues.usu_primer_apellido,
                'usu_recovery' : true
            }
            let tokenReturn = await token.encode(tokenData);
            await recoveryEmail(usuarioSolicitud.dataValues.usu_correo_electronico, tokenReturn);
            res.status(200).send({
                message: "Solicitud exitosa."
            })
        }catch(e){
            res.status(500).send({
                message: "Error, al generar la petición"
            })
            next();
        }
    },
    validRecovery: async (req, res, next) =>{
        const token = req.headers['token'];
        try{
            if(req.body.usu_contrasenia == req.body.usu_contrasenia_confirm){
                const jwtInformation = await jwt.decode(token);
                const newPassWord = await models.Usuario.findOne({ where:{ 
                    usu_correo_electronico : jwtInformation.dataAllUser.usu_correo_electronico, 
                    usu_usuario_id: jwtInformation.dataAllUser.usu_usuario_id
                    }
                });
                req.body.usu_contrasenia = await bcrypt.hash(req.body.usu_contrasenia, 10);
                req.body.usu_contrasenia = req.body.usu_contrasenia;
                await newPassWord.update({usu_contrasenia: req.body.usu_contrasenia, updatedAt: Date(), usu_usuario_modificado_por_id: jwtInformation.dataAllUser.usu_usuario_id }, {where: {usu_usuario_id : jwtInformation.dataAllUser.usu_usuario_id}})
                res.status(200).send({
                    message: 'Actualización de contraseña exitosa'
                });
            }else{
                res.status(300).send({
                    message: 'Error, al actualizar contraseña'
                })
            }
        }catch(e){
            res.status(500).send({
                message: 'Error',
                e
            });
            next();
        }
    },
    sociosDeNegociosListByUsuario: async (req, res, next) =>{
        try{



            // rol_tipo_rol_id: statusControles.TIPO_ROL_MENU.VENDEDORES
            
            const usuario = await models.Usuario.findOne({
                where: {
                    usu_usuario_id: req.params.id,
                    usu_cmm_estatus_id: statusControles.ESTATUS_USUARIO.ACTIVO
                },
                include: [
                    {
                        model: models.Rol,
                        include: [
                            {
                                model: models.ControlMaestroMultiple,
                                as: 'tipoRol',
                                attributes: {
                                    exclude: [
                                        'cmm_sistema',
                                        'cmm_activo',
                                        'cmm_usu_usuario_creado_por_id',
                                        'createdAt',
                                        'cmm_usu_usuario_modificado_por_id',
                                        'updatedAt'
                                    ]
                                }
                            }
                        ],
                        attributes: {
                            exclude: [
                                'rol_descripcion',
                                'rol_usu_usuario_creado_por_id',
                                'createdAt',
                                'rol_usu_usuario_modificado_por_id',
                                'updatedAt'
                            ]
                        }
                    }
                ],
                attributes: {
                    exclude: [
                        'usu_contrasenia',
                        'usu_imagen_perfil_id',
                        'createdAt',
                        'usu_usuario_telefono',
                        'usu_usuario_mobil',
                        'updatedAt'
                    ]
                }
            });

            if(!!usuario){
                if(usuario.dataValues.role.rol_tipo_rol_id == statusControles.TIPO_ROL_MENU.ADMINISTRADOR){
                    //Traemos todos los socios que tienen un vendedor
                    const socios = await sequelize.query(`
                    select 
                        usn_sn_socio_de_negocio_id 
                    from usuarios_socios_de_negocio usdn;
                    `,{ 
                        type: sequelize.QueryTypes.SELECT 
                    });
                    if(socios.length > 0){
                        let idSocio = [];
                        socios.forEach(async function(socio, indexSocio){
                            idSocio.push(socio.usn_sn_socio_de_negocio_id);
                            if((socios.length -1) == indexSocio){
                                //Traemos los gerentes, pueden tener socios que no esten asginados a vendedor
                                const sociosToGerentes = await sequelize.query(`
                                select 
                                    gs_socio_negocio_id 
                                from gerentes_socios_de_negocio gsdn 
                                where gs_socio_negocio_id not in (` + idSocio + `);
                                `,{ 
                                    type: sequelize.QueryTypes.SELECT 
                                });
                                if(sociosToGerentes.length > 0){
                                    let gerenteid = [];
                                    sociosToGerentes.forEach(async function(gerente, indexGerente){
                                        gerenteid.push(gerente.gs_socio_negocio_id)
                                        if((sociosToGerentes.length - 1) == indexGerente){
                                            
                                            let allids = await [gerenteid.concat(idSocio)];
                                            const socios_sin_asignar = await sequelize.query(`
                                            select
                                                sn_socios_negocio_id 
                                            from socios_negocio sn
                                            where sn_socios_negocio_id  not in (` + allids + `);
                                            `,{ 
                                                type: sequelize.QueryTypes.SELECT 
                                            });
                                            if(socios_sin_asignar.length > 0){
                                                let sinAsignarIds = [];
                                                socios_sin_asignar.forEach(async function(sinAsignar, indexSinAsignar){
                                                    sinAsignarIds.push(sinAsignar.sn_socios_negocio_id);
                                                    if((socios_sin_asignar.length - 1) == indexSinAsignar){
                                                        const socios_de_negocios_sin_asginar = await models.SociosNegocio.findAll({
                                                            where: {
                                                                sn_socios_negocio_id: sinAsignarIds
                                                            }
                                                        });
                                                        const socios_negocios_with_gerente = await models.GerentesSocioNegocios.findAll({
                                                            where: {
                                                                gs_socio_negocio_id: gerenteid
                                                            },
                                                            attributes: {
                                                                exclude: [
                                                                    'gs_gerente_socio_negocio_id',
                                                                    'createdAt',
                                                                    'updatedAt',
                                                                    'gs_usu_usuario_creador_id',
                                                                    'gs_usu_usuario_modificado_por_id'
                                                                ]
                                                            },
                                                            include: [
                                                                {
                                                                    model: models.SociosNegocio,
                                                                    as: 'socio_de_negocio',
                                                                    attributes: {
                                                                        exclude: [
                                                                            'sn_credito',
                                                                            'sn_moneda',
                                                                            'sn_tax',
                                                                            'sn_usu_usuario_creador_id',
                                                                            'createdAt',
                                                                            'sn_usu_usuario_modificado_id',
                                                                            'updatedAt'
                                                                        ]
                                                                    },
                                                                    include: [
                                                                        {
                                                                            model: models.ControlMaestroMultiple,
                                                                            as: 'estatus_id',
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
                                                                },
                                                                {
                                                                    model: models.Usuario,
                                                                    as: 'gerente',
                                                                    attributes: {
                                                                        exclude: [
                                                                            'usu_segundo_apellido',
                                                                            'usu_contrasenia',
                                                                            'usu_imagen_perfil_id',
                                                                            'createdAt',
                                                                            'usu_usuario_modificado_por_id',
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
                                                        });
                                                        
                                                        const lista_socios_negocio = await models.UsuariosSociosDeNegocios.findAll({
                                                            where: {
                                                                usn_sn_socio_de_negocio_id: idSocio
                                                            },
                                                            include: [
                                                                {
                                                                    model: models.Usuario,
                                                                    as: 'vendedor',
                                                                    attributes: {
                                                                        exclude: [
                                                                            'usu_segundo_apellido',
                                                                            'usu_contrasenia',
                                                                            'usu_imagen_perfil_id',
                                                                            'createdAt',
                                                                            'usu_usuario_modificado_por_id',
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
                                                                },
                                                                {
                                                                    model: models.SociosNegocio,
                                                                    as: 'socio_de_negocio',
                                                                    attributes: {
                                                                        exclude: [
                                                                            'sn_credito',
                                                                            'sn_moneda',
                                                                            'sn_tax',
                                                                            'sn_usu_usuario_creador_id',
                                                                            'createdAt',
                                                                            'sn_usu_usuario_modificado_id',
                                                                            'updatedAt'
                                                                        ]
                                                                    },
                                                                    include: [
                                                                        {
                                                                            model: models.ControlMaestroMultiple,
                                                                            as: 'estatus_id',
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
                                                        });
                                                        res.status(200).send({
                                                            message: 'Lista de socios de negocio',
                                                            socios_negocios_with_gerente,
                                                            lista_socios_negocio,
                                                            socios_de_negocios_sin_asginar
                                                        });

                                                    }
                                                });
                                            }else if(socios_sin_asignar == 0){
                                                const socios_negocios_with_gerente = await models.GerentesSocioNegocios.findAll({
                                                    where: {
                                                        gs_socio_negocio_id: gerenteid
                                                    },
                                                    attributes: {
                                                        exclude: [
                                                            'gs_gerente_socio_negocio_id',
                                                            'createdAt',
                                                            'updatedAt',
                                                            'gs_usu_usuario_creador_id',
                                                            'gs_usu_usuario_modificado_por_id'
                                                        ]
                                                    },
                                                    include: [
                                                        {
                                                            model: models.SociosNegocio,
                                                            as: 'socio_de_negocio',
                                                            attributes: {
                                                                exclude: [
                                                                    'sn_credito',
                                                                    'sn_moneda',
                                                                    'sn_tax',
                                                                    'sn_usu_usuario_creador_id',
                                                                    'createdAt',
                                                                    'sn_usu_usuario_modificado_id',
                                                                    'updatedAt'
                                                                ]
                                                            },
                                                            include: [
                                                                {
                                                                    model: models.ControlMaestroMultiple,
                                                                    as: 'estatus_id',
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
                                                        },
                                                        {
                                                            model: models.Usuario,
                                                            as: 'gerente',
                                                            attributes: {
                                                                exclude: [
                                                                    'usu_segundo_apellido',
                                                                    'usu_contrasenia',
                                                                    'usu_imagen_perfil_id',
                                                                    'createdAt',
                                                                    'usu_usuario_modificado_por_id',
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
                                                });
                                                
                                                const lista_socios_negocio = await models.UsuariosSociosDeNegocios.findAll({
                                                    where: {
                                                        usn_sn_socio_de_negocio_id: idSocio
                                                    },
                                                    include: [
                                                        {
                                                            model: models.Usuario,
                                                            as: 'vendedor',
                                                            attributes: {
                                                                exclude: [
                                                                    'usu_segundo_apellido',
                                                                    'usu_contrasenia',
                                                                    'usu_imagen_perfil_id',
                                                                    'createdAt',
                                                                    'usu_usuario_modificado_por_id',
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
                                                        },
                                                        {
                                                            model: models.SociosNegocio,
                                                            as: 'socio_de_negocio',
                                                            attributes: {
                                                                exclude: [
                                                                    'sn_credito',
                                                                    'sn_moneda',
                                                                    'sn_tax',
                                                                    'sn_usu_usuario_creador_id',
                                                                    'createdAt',
                                                                    'sn_usu_usuario_modificado_id',
                                                                    'updatedAt'
                                                                ]
                                                            },
                                                            include: [
                                                                {
                                                                    model: models.ControlMaestroMultiple,
                                                                    as: 'estatus_id',
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
                                                });
                                                res.status(200).send({
                                                    message: 'Lista de socios de negocio',
                                                    socios_negocios_with_gerente,
                                                    lista_socios_negocio
                                                });
                                            }
                                        }
                                    });
                                }else{
                                    res.status(300).send({
                                        message: 'Parece que hay un problema'
                                    });
                                }
                            }
                        })
                    }else if(socios.length == 0){
                        //Verificamos cuantos tienen gerentes
                        const sociosToGerentes = await sequelize.query(`
                        select 
                            gs_socio_negocio_id 
                        from gerentes_socios_de_negocio gsdn ;
                        `,{ 
                            type: sequelize.QueryTypes.SELECT 
                        });
                        let idsGerentes = [];
                        if(sociosToGerentes.length > 0){
                            //Si hay asignados a gerentes
                            sociosToGerentes.forEach(async function(socioGerente, indexSocioGerente){
                                idsGerentes.push(socioGerente.gs_socio_negocio_id);
                                if((sociosToGerentes.length - 1) == indexSocioGerente){
                                    const socios_sin_gerentes = await sequelize.query(`
                                    select
                                        sn_socios_negocio_id 
                                    from socios_negocio sn
                                    where sn_socios_negocio_id  not in ( ` + idsGerentes + ` )
                                    `,{ 
                                        type: sequelize.QueryTypes.SELECT 
                                    });
                                    if(socios_sin_gerentes.length > 0){
                                        let idSocios_sin_gerentes = [];
                                        socios_sin_gerentes.forEach(async function(socio_buscar, socioIndexBuscar){
                                            idSocios_sin_gerentes.push(socio_buscar.sn_socios_negocio_id);
                                            if((socios_sin_gerentes.length - 1) == socioIndexBuscar){

                                                const socios_de_negocios_sin_asginar = await models.SociosNegocio.findAll({
                                                    where: {
                                                        sn_socios_negocio_id: idSocios_sin_gerentes
                                                    }
                                                });
                                                const socios_negocios_with_gerente = await models.GerentesSocioNegocios.findAll({
                                                    where: {
                                                        gs_socio_negocio_id: idsToGerente
                                                    },
                                                    attributes: {
                                                        exclude: [
                                                            'gs_gerente_socio_negocio_id',
                                                            'createdAt',
                                                            'updatedAt',
                                                            'gs_usu_usuario_creador_id',
                                                            'gs_usu_usuario_modificado_por_id'
                                                        ]
                                                    },
                                                    include: [
                                                        {
                                                            model: models.SociosNegocio,
                                                            as: 'socio_de_negocio',
                                                            attributes: {
                                                                exclude: [
                                                                    'sn_credito',
                                                                    'sn_moneda',
                                                                    'sn_tax',
                                                                    'sn_usu_usuario_creador_id',
                                                                    'createdAt',
                                                                    'sn_usu_usuario_modificado_id',
                                                                    'updatedAt'
                                                                ]
                                                            },
                                                            include: [
                                                                {
                                                                    model: models.ControlMaestroMultiple,
                                                                    as: 'estatus_id',
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
                                                        },
                                                        {
                                                            model: models.Usuario,
                                                            as: 'gerente',
                                                            attributes: {
                                                                exclude: [
                                                                    'usu_segundo_apellido',
                                                                    'usu_contrasenia',
                                                                    'usu_imagen_perfil_id',
                                                                    'createdAt',
                                                                    'usu_usuario_modificado_por_id',
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
                                                });
                                                res.status(200).send({
                                                    message: 'Listado de socios de negocio',
                                                    socios_de_negocios_sin_asginar,
                                                    socios_negocios_with_gerente
                                                });
                                            }
                                        });
                                    }else{
                                        res.status(300).send({
                                            message: 'Ocurrio un erro al procesar la petición'
                                        });
                                    }
                                }
                            })
                        }else if(sociosToGerentes.length == 0){
                            //Si nuestros socios de negocios, no cuentan sin ninguna asignación
                            const socios_de_negoci_sin_asignar = await models.findAll({
                                where:{
                                    sn_cmm_estatus_id: { [Op.ne]: statusControles.ESTATUS_SOCIOS_NEGOCIO.ELIMINADA }
                                }
                            });
                            res.status(200).send({
                                message: 'Lista de socios de negocio',
                                socios_de_negoci_sin_asignar
                            });
                        }
                    }
                }else if(usuario.dataValues.role.rol_tipo_rol_id == statusControles.TIPO_ROL_MENU.VENDEDORES){
                    if(usuario.dataValues.role.rol_nombre == statusControles.ROLES_VENDEDORES.admin){
                        const socios = await sequelize.query(`                       
                        select
                            usdn.usn_sn_socio_de_negocio_id
                        from (
                            select 
                                *
                            from usuarios u
                            where u.usu_usuario_creado_por_id  = ` + usuario.dataValues.usu_usuario_id +`
                        )usuario
                        left join usuarios_socios_de_negocio usdn on usdn.usn_usu_usuario_id  = usuario.usu_usuario_id
                        where usdn.usn_usu_usuario_id notnull;`,{ 
                            type: sequelize.QueryTypes.SELECT 
                        });
                        let ids = [];
                        if(!!socios){
                            if(socios.length > 0){
                                socios.forEach(async function(socio, indexSocio){
                                    console.log('Socio', socio);
                                    ids.push(socio.usn_sn_socio_de_negocio_id);
                                    if((socios.length - 1)  == indexSocio){
                                        const socios_by_gerente = await sequelize.query(`
                                        select 
                                            gsdn.gs_socio_negocio_id
                                        from gerentes_socios_de_negocio gsdn 
                                        where gsdn.gs_gerente_id  = ` + usuario.dataValues.usu_usuario_id +` and gsdn.gs_socio_negocio_id  not in (` + ids + `);
                                        
                                        `,{ 
                                            type: sequelize.QueryTypes.SELECT 
                                        });
                                        const lista_socios_negocio = await models.UsuariosSociosDeNegocios.findAll({
                                            where: {
                                                usn_sn_socio_de_negocio_id: ids
                                            },
                                            include: [
                                                {
                                                    model: models.Usuario,
                                                    as: 'vendedor',
                                                    attributes: {
                                                        exclude: [
                                                            'usu_segundo_apellido',
                                                            'usu_contrasenia',
                                                            'usu_imagen_perfil_id',
                                                            'createdAt',
                                                            'usu_usuario_modificado_por_id',
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
                                                },
                                                {
                                                    model: models.SociosNegocio,
                                                    as: 'socio_de_negocio',
                                                    attributes: {
                                                        exclude: [
                                                            'sn_credito',
                                                            'sn_moneda',
                                                            'sn_tax',
                                                            'sn_usu_usuario_creador_id',
                                                            'createdAt',
                                                            'sn_usu_usuario_modificado_id',
                                                            'updatedAt'
                                                        ]
                                                    },
                                                    include: [
                                                        {
                                                            model: models.ControlMaestroMultiple,
                                                            as: 'estatus_id',
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
                                        });
                                        if(socios_by_gerente.length > 0){
                                            let idsToGerente = [];
                                            socios_by_gerente.forEach(async function(socio_gerente, indexSocio){
                                                idsToGerente.push(socio_gerente.gs_socio_negocio_id)
                                                if((socios_by_gerente.length -1) == indexSocio){
                                                    const socios_negocios = await models.GerentesSocioNegocios.findAll({
                                                        where: {
                                                            gs_gerente_id: usuario.dataValues.usu_usuario_id,
                                                            gs_socio_negocio_id: idsToGerente
                                                        },
                                                        attributes: {
                                                            exclude: [
                                                                'gs_gerente_socio_negocio_id',
                                                                'createdAt',
                                                                'updatedAt',
                                                                'gs_usu_usuario_creador_id',
                                                                'gs_usu_usuario_modificado_por_id'
                                                            ]
                                                        },
                                                        include: [
                                                            {
                                                                model: models.SociosNegocio,
                                                                as: 'socio_de_negocio',
                                                                attributes: {
                                                                    exclude: [
                                                                        'sn_credito',
                                                                        'sn_moneda',
                                                                        'sn_tax',
                                                                        'sn_usu_usuario_creador_id',
                                                                        'createdAt',
                                                                        'sn_usu_usuario_modificado_id',
                                                                        'updatedAt'
                                                                    ]
                                                                },
                                                                include: [
                                                                    {
                                                                        model: models.ControlMaestroMultiple,
                                                                        as: 'estatus_id',
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
                                                    });
                                                    res.status(200).send({
                                                        message: 'Socios de negocio y gerentes',
                                                        socios_negocios,
                                                        lista_socios_negocio
                                                    });
                                                }
                                            });
                                        }else if(socios_by_gerente.length == 0){
                                            res.status(200).send({
                                                message: 'Socios de negocios y vendedores',
                                                lista_socios_negocio
                                            })
                                        }
                                    }
                                });
                            }else if(socios.length == 0){
                                const socios_by_gerente = await sequelize.query(`
                                select 
                                    gsdn.gs_socio_negocio_id
                                from gerentes_socios_de_negocio gsdn 
                                where gsdn.gs_gerente_id  = ` + usuario.dataValues.usu_usuario_id + `;`,
                                { 
                                    type: sequelize.QueryTypes.SELECT 
                                });
                                if(socios_by_gerente.length > 0){
                                    let idsToGerente = [];
                                    socios_by_gerente.forEach(async function(socio_gerente, indexSocio){
                                        idsToGerente.push(socio_gerente.gs_socio_negocio_id)
                                        if((socios_by_gerente.length -1) == indexSocio){
                                            const socios_negocios = await models.GerentesSocioNegocios.findAll({
                                                where: {
                                                    gs_gerente_id: usuario.dataValues.usu_usuario_id,
                                                    gs_socio_negocio_id: idsToGerente
                                                },
                                                attributes: {
                                                    exclude: [
                                                        'gs_gerente_socio_negocio_id',
                                                        'createdAt',
                                                        'updatedAt',
                                                        'gs_usu_usuario_creador_id',
                                                        'gs_usu_usuario_modificado_por_id'
                                                    ]
                                                },
                                                include: [
                                                    {
                                                        model: models.SociosNegocio,
                                                        as: 'socio_de_negocio',
                                                        attributes: {
                                                            exclude: [
                                                                'sn_credito',
                                                                'sn_moneda',
                                                                'sn_tax',
                                                                'sn_usu_usuario_creador_id',
                                                                'createdAt',
                                                                'sn_usu_usuario_modificado_id',
                                                                'updatedAt'
                                                            ]
                                                        },
                                                        include: [
                                                            {
                                                                model: models.ControlMaestroMultiple,
                                                                as: 'estatus_id',
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
                                            });
                                            res.status(200).send({
                                                message: 'Socios de negocio y gerentes',
                                                socios_negocios
                                            });
                                        }
                                    });
                                }else if(socios_by_gerente.length == 0){
                                    res.status(200).send({
                                        message: 'Actualmente no cuentas con socios asignados'
                                    })
                                }
                            }
                        }else{
                            res.status(300).send({
                                message: 'Petición no se pudo procesar adecuadamente'
                            });
                        }
                    }else if(usuario.dataValues.role.rol_nombre == statusControles.ROLES_VENDEDORES.vendedor){ 
                        const socios = await sequelize.query(
                        `select 
                            distinct(usn_sn_socio_de_negocio_id)
                            from usuarios_socios_de_negocio usdn
                        where usdn.usn_usu_usuario_id = ` + usuario.dataValues.usu_usuario_id +`;`,{ 
                            type: sequelize.QueryTypes.SELECT 
                        });
                        let ids = [];
                        if(!!socios){
                            if(socios.length > 0){
                                socios.forEach(async function(socio, indexSocio){
                                    ids.push(socio.usn_sn_socio_de_negocio_id);
                                    if((socios.length - 1)  == indexSocio){
                                        const lista_socios_negocio = await models.UsuariosSociosDeNegocios.findAll({
                                            where: {
                                                usn_sn_socio_de_negocio_id: ids
                                            },
                                            include: [
                                                {
                                                    model: models.Usuario,
                                                    as: 'vendedor',
                                                    attributes: {
                                                        exclude: [
                                                            'usu_segundo_apellido',
                                                            'usu_contrasenia',
                                                            'usu_imagen_perfil_id',
                                                            'createdAt',
                                                            'usu_usuario_modificado_por_id',
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
                                                },
                                                {
                                                    model: models.SociosNegocio,
                                                    as: 'socio_de_negocio',
                                                    attributes: {
                                                        exclude: [
                                                            'sn_credito',
                                                            'sn_moneda',
                                                            'sn_tax',
                                                            'sn_usu_usuario_creador_id',
                                                            'createdAt',
                                                            'sn_usu_usuario_modificado_id',
                                                            'updatedAt'
                                                        ]
                                                    },
                                                    include: [
                                                        {
                                                            model: models.ControlMaestroMultiple,
                                                            as: 'estatus_id',
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
                                        });
                                        res.status(200).send({
                                            message: 'Socios de negocios',
                                            lista_socios_negocio
                                        });
                                    }
                                });
                            }else if(socios.length ==  0){
                                res.status(200).send({
                                    message: 'Actualmente, no cuentas con ningún socio de negocio asignado'
                                });
                            }
                        }else{
                            res.status(300).send({
                                message: 'Petición no se puedo procesar adecuadamente'
                            });
                        }
                    }else{
                        res.status(300).send({
                            message: 'Usuario invalido'
                        });
                    }
                }else{
                    res.status(300).send({
                        message: 'Usuario sin permisos a este apartado'
                    })
                }
            }else{
                res.status(300).send({
                    message: 'Error al recuperar usuarios, usuario no valido o no existente.'
                })
            }

            //console.log(usuario.role.rol_nombre)
            /*
            if(usuario.role.rol_nombre == "Gerente" || usuario.role.rol_nombre == "Vendedor")
            {
                if(usuario)
                {

                    const listusuarios = await models.Usuario.findAll({
                        where: {
                            usu_usuario_creado_por_id: usuario.dataValues.usu_usuario_id,
                            usu_cmm_estatus_id: {
                                [Op.ne]: statusControles.ESTATUS_USUARIO.ELIMINADO
                            }
                        }
                    });


                    console.log(listusuarios)


                    if(listusuarios.length > 0)
                    {
                        const arrayUsuariosRegistrados = [];

                        listusuarios.forEach(async function(element)
                        {
                            arrayUsuariosRegistrados.push(element.dataValues.usu_usuario_id);
                        });

                        const listSociosNegociosByUsuario = await models.UsuariosSociosDeNegocios.findAll({
                            where: {
                                usn_usu_usuario_id: arrayUsuariosRegistrados
                            },
                            include: [
                                {
                                    model: models.SociosNegocio,
                                }
                            ]
                        });

                        const listaFinal = [];

                        listSociosNegociosByUsuario.forEach(async function(element, index)
                        {
                            const usuario = await sequelize.query('
                            select 
                            	distinct(usn_sn_socio_de_negocio_id)
                            from usuarios_socios_de_negocio usdn
                            where usdn.usn_usu_usuario_id = 112;
                            select usu_usuario_id, usu_nombre, usu_primer_apellido, usu_segundo_apellido, usu_correo_electronico from usuarios where usu_usuario_id = ' + element.dataValues.usn_usu_usuario_id + ';');
                            element.dataValues.usuario = usuario[0];
                            await listaFinal.push(element);
                            if((listSociosNegociosByUsuario.length -1) == index){
                                res.status(200).send({
                                    message: 'Lista socios negocio',
                                    listaFinal
                                });
                            }
                        });
                    }
                    //Busca todos los Socios de negocios en la tabla usuarios socios de negocios que tengan el mismo id que se solicito
                    //esto pasara porque el usuario que esta solicitando tiene id de vendedor el cual no esta como creador en la tabla usuaarios
                    else
                    {
                        const listSociosNegociosByUsuario = await models.UsuariosSociosDeNegocios.findAll({
                            where: {
                                usn_usu_usuario_id: usuario.dataValues.usu_usuario_id
                            },
                            include: [
                                {
                                    model: models.SociosNegocio,
                                }
                            ]
                        });
                        res.status(200).send({
                            message: 'Lista socios negocio',
                            listSociosNegociosByUsuario
                        });
                    }
                }else{
                    res.status(300).send({
                        message: 'Usuario, no valido'
                    })
                }

            }
            else
            {    
                res.status(200).send({
                    message: 'Usuario no VALIDO',
                    usuario
                })
            }
            */
            

        }catch(e){
            res.status(500).send({
                message: 'Erro, al obtener la información',
                e
            });
            next(e);
        }
    },
    asignarSocioNegocio: async (req, res, next) =>{
        try{
            const usuario = await models.Usuario.findOne({
                where: {
                    usu_usuario_id: req.body.usn_usu_usuario_id,
                    usu_cmm_estatus_id: statusControles.ESTATUS_USUARIO.ACTIVO
                },
                include: [
                    {
                        model: models.Rol,
                        include: [
                            {
                                model: models.ControlMaestroMultiple,
                                as: 'tipoRol'
                            }
                        ],
                        where: {
                            rol_tipo_rol_id: statusControles.TIPO_ROL_MENU.VENDEDORES
                        }
                    }
                ]
            });
            
            if(usuario){
                if(usuario.dataValues.role.dataValues.rol_nombre != 'Gerente'){
                    const socio = await models.SociosNegocio.findOne({
                        where: {
                            sn_socios_negocio_id: req.body.usn_sn_socio_de_negocio_id,
                            sn_cmm_estatus_id: statusControles.ESTATUS_SOCIOS_NEGOCIO.ACTIVA
                        }
                    });
                    if(socio){
                        await models.UsuariosSociosDeNegocios.create(req.body);
                        res.status(200).send({
                            message: 'Solicidud, procesada exitosamente.'
                        });
                    }else{
                        res.status(300).send({
                            message: 'Socio de negocio, no activo o eliminado'
                        });
                    }
                }else{
                    res.status(300).send({
                        message: 'Erro, no se le puede asignar este socio a un gerente.'
                    });
                }
            }else{
                res.status(300).send({
                    message: 'Usuario no valido para asignar, puede que no sea vendedor.'
                })
            }
        }catch(e){
            res.status(500).send({
                message: 'Error, no se pudo procesar la solicitud adecuadamente.',
                e
            });
            next(e);
        }
    },
    eliminarAsignarSocioNegocio: async (req, res, next) =>{
        try{
            await models.UsuariosSociosDeNegocios.destroy({
                where: {
                    usn_usu_usuario_id: req.body.usn_usu_usuario_id,
                    usn_sn_socio_de_negocio_id: req.body.usn_sn_socio_de_negocio_id
                }
            });
                res.status(200).send({
                    message: 'Solicidud, procesada exitosamente.'
                });
        }catch(e){
            res.status(500).send({
                message: 'Error, no se pudo procesar la solicitud adecuadamente.',
                e
            });
            next(e);
        }
    },
    usuariosNoRelacionados: async(req, res,  next) =>{
        try{
            const usuario = await models.Usuario.findOne({
                where: {
                    usu_usuario_id: req.params.id
                },
                include: [
                    {
                        model: models.Rol
                    }
                ]
            });
            if(usuario.dataValues.role.dataValues.rol_tipo_rol_id == statusControles.TIPO_ROL_MENU.ADMINISTRADOR){
                const vendedores = await models.Usuario.findAll({
                    include: [
                        {
                            model: models.Rol,
                            where: {
                                rol_nombre: 'Vendedor'
                            },
                            attributes: {
                                exclude: ['rol_descripcion','rol_cmm_estatus','rol_usu_usuario_creado_por_id','createdAt','rol_usu_usuario_modificado_por_id','updatedAt']
                            }
                        },
                        {
                            model: models.ControlMaestroMultiple,
                            attributes: {
                                exclude: ['cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                            },
                            as: 'estatus_usuario'
                        }
                    ],
                    where: { 
                        usu_cmm_estatus_id : { [Op.ne]: statusControles.ESTATUS_USUARIO.ELIMINADO },
                    },
                    attributes: {
                        exclude: ['usu_contrasenia','usu_imagen_perfil_id','usu_usuario_creado_por_id','createdAt','usu_usuario_modificado_por_id']
                    }
                });
                const idsSociosNegocios = await models.UsuariosSociosDeNegocios.findAll({
                    attributes: ['usn_sn_socio_de_negocio_id'],
                    distinct: true
                });
                var arrayIds = [];
                idsSociosNegocios.forEach(async function(elemento, index){
                    arrayIds.push(elemento.dataValues.usn_sn_socio_de_negocio_id);
                });
                const socios_negocios = await models.SociosNegocio.findAll({
                    where: {
                        sn_cmm_estatus_id: {
                            [Op.ne]: statusControles.ESTATUS_SOCIOS_NEGOCIO.ELIMINADA
                        }
                    }
                });
                var arraySocios = [];
                socios_negocios.forEach(async function(elemento, index){
                    arraySocios.push(elemento.sn_socios_negocio_id);
                });
                arrayIds.forEach(async function(elemento, index1){
                    arraySocios.forEach(async function(elementoFinal, index2){
                        if(elemento == elementoFinal){
                            delete arraySocios[index2];
                        }
                    });
                });
                const socio_negocio_no_asociados = await models.SociosNegocio.findAll({
                    where: {
                        sn_cmm_estatus_id: {
                            [Op.ne]: statusControles.ESTATUS_SOCIOS_NEGOCIO.ELIMINADA
                        },
                        sn_socios_negocio_id: arraySocios
                    }
                }); 
                res.status(200).send({
                    message: 'Listado de usuarios ',
                    vendedores,
                    socio_negocio_no_asociados
                })
            }else if(usuario.dataValues.role.dataValues.rol_tipo_rol_id == statusControles.TIPO_ROL_MENU.VENDEDORES){
                if(usuario.dataValues.role.dataValues.rol_nombre == 'Gerente'){
                    res.status(200).send({
                        message: 'Tus usuarios y sus socios de negocios'
                    })
                }else{
                    res.status(300).send({
                        message: 'Esta petición, no puede ser resuelto'
                    })
                }
            }
        }catch(e){
            res.status(500).send({
                message: 'Error, no se puedo generar la petisión exitosamete',
                e
            });
            next(e);
        }
    },
    ListaNoRelacionesSN: async(req, res,  next) =>{
        try{
            const usuario = await models.Usuario.findOne({
                where: {
                    usu_usuario_id: req.params.id
                },
                include: [
                    {
                        model: models.Rol
                    }
                ]
            });



            if(usuario.dataValues.role.dataValues.rol_tipo_rol_id == statusControles.TIPO_ROL_MENU.ADMINISTRADOR){
                
                const vendedores = await models.Usuario.findAll({
                    include: [
                        {
                            model: models.Rol,
                            where: {
                                rol_nombre: 'Vendedor'
                            },
                            attributes: {
                                exclude: ['rol_descripcion','rol_cmm_estatus','rol_usu_usuario_creado_por_id','createdAt','rol_usu_usuario_modificado_por_id','updatedAt']
                            }
                        },
                        {
                            model: models.ControlMaestroMultiple,
                            attributes: {
                                exclude: ['cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                            },
                            as: 'estatus_usuario'
                        }
                    ],
                    where: { 
                        usu_cmm_estatus_id : { [Op.ne]: statusControles.ESTATUS_USUARIO.ELIMINADO },
                    },
                    attributes: {
                        exclude: ['usu_contrasenia','usu_imagen_perfil_id','usu_usuario_creado_por_id','createdAt','usu_usuario_modificado_por_id']
                    }
                });
                const idsSociosNegocios = await models.UsuariosSociosDeNegocios.findAll({
                    attributes: ['usn_sn_socio_de_negocio_id'],
                    distinct: true
                });
                var arrayIds = [];
                idsSociosNegocios.forEach(async function(elemento, index){
                    arrayIds.push(elemento.dataValues.usn_sn_socio_de_negocio_id);
                });
                const socios_negocios = await models.SociosNegocio.findAll({
                    where: {
                        sn_cmm_estatus_id: {
                            [Op.ne]: statusControles.ESTATUS_SOCIOS_NEGOCIO.ELIMINADA
                        }
                    }
                });
                var arraySocios = [];
                socios_negocios.forEach(async function(elemento, index){
                    arraySocios.push(elemento.sn_socios_negocio_id);
                });
                arrayIds.forEach(async function(elemento, index1){
                    arraySocios.forEach(async function(elementoFinal, index2){
                        if(elemento == elementoFinal){
                            delete arraySocios[index2];
                        }
                    });
                });
                const socio_negocio_no_asociados = await models.SociosNegocio.findAll({
                    where: {
                        sn_cmm_estatus_id: {
                            [Op.ne]: statusControles.ESTATUS_SOCIOS_NEGOCIO.ELIMINADA
                        },
                        sn_socios_negocio_id: arraySocios
                    }
                }); 
                res.status(200).send({
                    message: 'Listado de usuarios ',
                    vendedores,
                    socio_negocio_no_asociados
                })
            }else if(usuario.dataValues.role.dataValues.rol_tipo_rol_id == statusControles.TIPO_ROL_MENU.VENDEDORES){
                if(usuario.dataValues.role.dataValues.rol_nombre == 'Gerente'){
                    res.status(200).send({
                        message: 'Tus usuarios y sus socios de negocios'
                    })
                }else{
                    res.status(300).send({
                        message: 'Esta petición, no puede ser resuelto'
                    })
                }
            }
        }catch(e){
            res.status(500).send({
                message: 'Error, no se puedo generar la petisión exitosamete',
                e
            });
            next(e);
        }
    },
    eliminarSocioNegocioGerente: async(req, res, next) =>{
        try{

            if(!!req.body.gs_gerente_id && !!req.body.gs_socio_negocio_id){
                await models.GerentesSocioNegocios.destroy({
                    where: {
                        gs_gerente_id: req.body.gs_gerente_id,
                        gs_socio_negocio_id: req.body.gs_socio_negocio_id
                    }
                });
                await models.UsuariosSociosDeNegocios.destroy({
                    where: {
                        usn_sn_socio_de_negocio_id: req.body.gs_socio_negocio_id
                    }
                });
                res.status(200).send({
                    message: 'Eliminación correcta de gerente'
                });
            }else{
                res.status(300).send({
                    message: 'Operación no se pudo completar con exito'
                })
            }
        }catch(e){
            res.status(500).send({
                message: 'No se pudo procesar la solicitud adecuadamente',
                e
            });
            next(e);
        }
    },
    reasignarVendedorToGerente: async(req, res, next) =>{
        try{
            const gerente = await models.Usuario.findOne({
                where: {
                    usu_usuario_id: req.body.usu_usuario_creado_por_id
                },
                include: [
                    {
                        model: models.Rol
                    }
                ]
            });
            if(gerente.dataValues.role.dataValues.rol_nombre == statusControles.ROLES_VENDEDORES.admin){
                const vendedor = await models.Usuario.findOne({
                    where: {
                        usu_usuario_id: req.body.usu_usuario_id
                    },
                    include: [
                        {
                            model: models.Rol
                        }
                    ]
                });
                const oldGerente = await models.Usuario.findOne({
                    where: {
                        usu_usuario_id: vendedor.dataValues.usu_usuario_creado_por_id
                    },
                    include: [
                        {
                            model: models.Rol
                        }
                    ]
                });
                if((gerente.dataValues.usu_usuario_id != vendedor.dataValues.usu_usuario_creado_por_id) && (vendedor.dataValues.role.dataValues.rol_nombre == statusControles.ROLES_VENDEDORES.vendedor)){
                    if(oldGerente.dataValues.usu_cmm_estatus_id == statusControles.ESTATUS_USUARIO.ACTIVO){
                        await models.UsuariosSociosDeNegocios.destroy({
                            where: {
                                usn_usu_usuario_id: vendedor.dataValues.usu_usuario_id
                            }
                        });
                        await vendedor.update({
                            usu_usuario_creado_por_id: gerente.dataValues.usu_usuario_id,
                            usu_usuario_modificado_por_id: req.body.usu_usuario_modificado_por_id
                        });
                        res.status(200).send({
                            message: 'Solicitud procesada exitosamente.'
                        });
                    }else if(oldGerente.dataValues.usu_cmm_estatus_id != statusControles.ESTATUS_USUARIO.ACTIVO){
                        await vendedor.update({
                            usu_usuario_creado_por_id: gerente.dataValues.usu_usuario_id,
                            usu_usuario_modificado_por_id: req.body.usu_usuario_modificado_por_id
                        });
                        const socios_de_vendedor =  await models.UsuariosSociosDeNegocios.findAll({
                            where: {
                                usn_usu_usuario_id: vendedor.dataValues.usu_usuario_id
                            }
                        });
                        var createForNewGerente = [];
                        socios_de_vendedor.forEach(async function(elemento, index){
                            createForNewGerente.push(elemento.dataValues.usn_sn_socio_de_negocio_id);
                            await models.GerentesSocioNegocios.destroy({
                                where:{
                                    gs_gerente_id: oldGerente.dataValues.usu_usuario_id,
                                    gs_socio_negocio_id: elemento.dataValues.usn_sn_socio_de_negocio_id
                                }
                            });
                            if(index == (socios_de_vendedor.length - 1 )){
                                createForNewGerente.forEach(async function(toGerente, index2){
                                    await models.GerentesSocioNegocios.create({
                                        gs_gerente_id: gerente.dataValues.usu_usuario_id,
                                        gs_socio_negocio_id: toGerente,
                                        gs_usu_usuario_creador_id: req.body.usu_usuario_modificado_por_id
                                    });
                                    if(index2 == (createForNewGerente.length -1 )){
                                        res.status(200).send({
                                            message: 'Solicitud procesada exitosamente'
                                        });
                                    }
                                })
                            }
                        })
                    }
                }else{
                    res.status(300).send({
                        message: 'Lo sentimos, esta acción no puede ser completada, por que viola una acción no permitida. (Contacte al administrador)'
                    })
                }
            }else{
                res.status(300).send({
                    message: 'No es posible asignar este usuario, el usuario actual no es gerente'
                })
            }
        }catch(e){
            res.status(500).send({
                message: 'No se pudo procesar la solicitud adecuadamente',
                e
            });
            next(e);
        }
    },
    changeSocioToGerente: async (req, res, next) =>{
        try{
            const gerente = await models.Usuario.findOne({
                where: {
                    usu_usuario_id: req.body.gs_gerente_id
                },
                include: [
                    {
                        model: models.Rol
                    }
                ]
            });
            if(gerente.dataValues.role.dataValues.rol_nombre == statusControles.ROLES_VENDEDORES.admin){
                await models.UsuariosSociosDeNegocios.destroy({
                    where: {
                        usn_sn_socio_de_negocio_id: req.body.gs_socio_negocio_id
                    }
                });
                await models.GerentesSocioNegocios.destroy({
                    where:{
                        gs_socio_negocio_id: req.body.gs_socio_negocio_id
                    }
                });
                await models.GerentesSocioNegocios.create({
                    gs_gerente_id: req.body.gs_gerente_id,
                    gs_socio_negocio_id: req.body.gs_socio_negocio_id,
                    gs_usu_usuario_creador_id: req.body.gs_usu_usuario_creador_id
                });
                res.status(200).send({
                    message: 'Solicitud, generada exitosamente.'
                });
            }else{
                res.status(300).send({
                    message: 'Error al generar la petición, el usuario no es un gerente'
                });
            }
        }catch(e){
            res.status(500).send({
                message: 'Error, al obtener la petición',
                e
            });
            next(e);
        }
    }
}