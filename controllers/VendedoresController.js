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

    desasignarVendedorASN: async (req, res, next) => {
        try
        {
            const constSociosNegocio = await models.SociosNegocio.findOne(
            {
                where: {
                    sn_socios_negocio_id: req.body.sn_socios_negocio_id
                }
            });

            if(constSociosNegocio)
            {
                const bodyUpdate = {
                    "sn_vendedor_codigo_sap": null,
                    "sn_usu_usuario_modificado_id": req.body.usu_usuario_modificado_por_id,
                    updatedAt: Date()
                }
                await constSociosNegocio.update(bodyUpdate);
            }

            res.status(200).send(
            {
                message: 'Vendedor desasignado correctamente'
            })
        }
        catch(e)
        {
            res.status(500).send(
            {
                message: 'Error',
                e
            });
            next(e);
        }
    },

    sociosNegocioDeVendedor: async (req, res, next) => {
        try
        {
            const constUsuario = await models.Usuario.findOne(
            {
                where: {
                    usu_usuario_id: req.params.id,
                    usu_cmm_estatus_id: statusControles.ESTATUS_USUARIO.ACTIVO
                }
            });

            //Si existe
            if(constUsuario)
            {
                // validar que id vendedor sea vendedor
                const constRol = await models.Rol.findOne(
                {
                    where: {
                        rol_rol_id: constUsuario.usu_rol_rol_id
                    }
                });

                if(constRol)
                {
                    if(constRol.rol_tipo_rol_id == statusControles.TIPO_ROL_MENU.VENDEDORES)
                    {

                        const constSociosNegocio = await models.SociosNegocio.findAll(
                        {
                            where: {
                                sn_vendedor_codigo_sap: constUsuario.usu_codigo_vendedor
                            }
                        });

                        res.status(200).send(
                        {
                            message: 'Obtenido correctamente',
                            constSociosNegocio
                        })
                    }
                    else
                    {
                        res.status(500).send(
                        {
                            message: 'El usuario no tiene rol de vendedor'
                        })
                    }
                }
                else
                {
                    res.status(500).send(
                    {
                        message: 'Rol no existe'
                    })
                }
            }
            else
            {
                res.status(500).send(
                {
                    message: 'El usuario no existe o no esta activo'
                })
            }
        }
        catch(e)
        {
            res.status(500).send(
            {
                message: 'Error',
                e
            });
            next(e);
        }
    },

    sociosNegocioDeVendedorPaginada: async (req, res, next) => {
        try
        {
            const constUsuario = await models.Usuario.findOne(
            {
                where: {
                    usu_usuario_id: req.body.usu_usuario_id,
                    usu_cmm_estatus_id: statusControles.ESTATUS_USUARIO.ACTIVO
                }
            });

            //Si existe
            if(constUsuario)
            {
                // validar que id vendedor sea vendedor
                const constRol = await models.Rol.findOne(
                {
                    where: {
                        rol_rol_id: constUsuario.usu_rol_rol_id
                    }
                });

                if(constRol)
                {
                    if(constRol.rol_tipo_rol_id == statusControles.TIPO_ROL_MENU.VENDEDORES)
                    {
                        var varlimit = req.body.limite
                        var varoffset = 0 + (req.body.pagina) * varlimit

                        const constSociosNegocio = await models.SociosNegocio.findAndCountAll(
                        {
                            where: {
                                sn_vendedor_codigo_sap: constUsuario.usu_codigo_vendedor
                            },
                            limit: varlimit,
                            offset: varoffset
                        });


                        res.status(200).send(
                        {
                            message: 'Obtenido correctamente',
                            constSociosNegocio
                        })
                    }
                    else
                    {
                        res.status(500).send(
                        {
                            message: 'El usuario no tiene rol de vendedor'
                        })
                    }
                }
                else
                {
                    res.status(500).send(
                    {
                        message: 'Rol no existe'
                    })
                }
            }
            else
            {
                res.status(500).send(
                {
                    message: 'El usuario no existe o no esta activo'
                })
            }
        }
        catch(e)
        {
            res.status(500).send(
            {
                message: 'Error',
                e
            });
            next(e);
        }
    },

    getVendedorCompraFinalizadaBySN: async (req, res, next) => {
        try
        {
            const constUsuario = await models.Usuario.findOne(
            {
                where: {
                    usu_usuario_id: req.body.usu_usuario_id,
                    usu_cmm_estatus_id: statusControles.ESTATUS_USUARIO.ACTIVO
                }
            });

            //Si existe
            if(constUsuario)
            {
                // validar que id vendedor sea vendedor
                const constRol = await models.Rol.findOne(
                {
                    where: {
                        rol_rol_id: constUsuario.usu_rol_rol_id
                    }
                });

                if(constRol)
                {
                    if(constRol.rol_tipo_rol_id == statusControles.TIPO_ROL_MENU.VENDEDORES)
                    {
                        // var varlimit = req.body.limite
                        // var varoffset = 0 + (req.body.pagina) * varlimit

                        // const constSociosNegocio = await models.SociosNegocio.findAndCountAll(
                        // {
                        //     where: {
                        //         sn_vendedor_codigo_sap: constUsuario.usu_codigo_vendedor
                        //     },
                        //     limit: varlimit,
                        //     offset: varoffset
                        // });
















                        const usuarios = await models.Usuario.findAll(
                        {
                            where: {
                                usu_usuario_creado_por_id: req.body.usu_usuario_id
                            }
                        });

                        var auxTemp = []
                        usuarios.forEach(async function(element, index)
                        {
                            auxTemp.push(element.dataValues.usu_usuario_id);
                            if((usuarios.length - 1) == index)
                            {
                                const compras_finalizadas = await models.CompraFinalizada.findAll(
                                {
                                    where: 
                                    {
                                        cf_vendido_por_usu_usuario_id: auxTemp
                                    },
                                    include: 
                                    [
                                        {
                                            model: models.ControlMaestroMultiple,
                                            as:'tipo_compra_id',
                                            attributes: {
                                                exclude: ['cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                            }
                                        },
                                        {
                                            model: models.ControlMaestroMultiple,
                                            as:'tipo_envio_id',
                                            attributes: {
                                                exclude: ['cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                            }
                                        },
                                        {
                                            model: models.Facturas,
                                            attributes: {
                                                exclude: ['createdAt', 'updatedAt']
                                            }
                                        }
                                    ]
                                });
                                var compras_finales = [];
                                if(compras_finalizadas.length > 0)
                                {
                                    compras_finalizadas.forEach(async function(elemento, index)
                                    {
                                        console.log('VENDEDOR', elemento.dataValues) 
                                        const usuario = await models.Usuario.findOne(
                                        {
                                            where: 
                                            {
                                                usu_usuario_id: elemento.dataValues.cf_vendido_por_usu_usuario_id
                                            },
                                            attributes: 
                                            {
                                                exclude: ['usu_contrasenia','usu_imagen_perfil_id','usu_usuario_creado_por_id','createdAt','usu_usuario_modificado_por_id','updatedAt']
                                            },
                                            include: 
                                            [
                                                {
                                                    model: models.ControlMaestroMultiple,
                                                    as: 'estatus_usuario',
                                                    attributes: {
                                                        exclude: ['cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                                    }
                                                }
                                            ]
                                        });
                                        const socio_negocio = await models.SociosNegocio.findOne(
                                        {
                                            where: 
                                            {
                                                sn_socios_negocio_id : elemento.dataValues.cf_vendido_a_socio_negocio_id
                                            }
                                        });

                                        elemento.dataValues.vendido_por_usuario = usuario;
                                        elemento.dataValues.socio_negocio = socio_negocio;
                                        compras_finales.push(elemento);
                                        if((compras_finalizadas.length -1 ) == index)
                                        {
                                            res.status(200).send({
                                                message: 'Ventas finalizadas',
                                                compras_finales
                                            });
                                        }
                                    });
                                }else{
                                    res.status(200).send({
                                        message: 'Ventas finalizadas'
                                    })
                                }

                            }
                        });


                        res.status(200).send(
                        {
                            message: 'Obtenido correctamente',
                            // constSociosNegocio
                        })
                    }
                    else
                    {
                        res.status(500).send(
                        {
                            message: 'El usuario no tiene rol de vendedor'
                        })
                    }
                }
                else
                {
                    res.status(500).send(
                    {
                        message: 'Rol no existe'
                    })
                }
            }
            else
            {
                res.status(500).send(
                {
                    message: 'El usuario no existe o no esta activo'
                })
            }
        }
        catch(e)
        {
            res.status(500).send(
            {
                message: 'Error',
                e
            });
            next(e);
        }
    },



    //Obtiene todos las compras finalizadas de un vendedor segun el codigo de vendedor que salga en la compra finalizada
    getVendedorCompraFinalizadaList: async (req, res, next) => {
        try
        {
            const constUsuario = await models.Usuario.findOne(
            {
                where: {
                    usu_usuario_id: req.body.usu_usuario_id,
                    usu_cmm_estatus_id: statusControles.ESTATUS_USUARIO.ACTIVO
                }
            });

            //Si existe
            if(constUsuario)
            {
                // validar que id vendedor sea vendedor
                const constRol = await models.Rol.findOne(
                {
                    where: {
                        rol_rol_id: constUsuario.usu_rol_rol_id
                    }
                });

                    //Si existe el rol del vendedor
                if(constRol)
                {
                    if(constRol.rol_tipo_rol_id == statusControles.TIPO_ROL_MENU.VENDEDORES)
                    {
                        const ventasUsuario = await models.CompraFinalizada.findAll({
                        where: {
                            cf_vendido_por_usu_usuario_id: req.body.usu_usuario_id
                        },
                        include: [
                            {
                                model: models.ControlMaestroMultiple,
                                as:'tipo_compra_id',
                                attributes: {
                                    exclude: ['cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                }
                            },
                            {
                                model: models.ControlMaestroMultiple,
                                as:'tipo_envio_id',
                                attributes: {
                                    exclude: ['cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                }
                            },
                            {
                                model: models.Facturas,
                                attributes: {
                                    exclude: ['createdAt', 'updatedAt']
                                }
                            }
                        ]
                    });
                    var compras_finales = [];
                    ventasUsuario.forEach(async function(elemento, index){
                        const socio_negocio = await models.SociosNegocio.findOne({
                            where: {
                             sn_socios_negocio_id : elemento.dataValues.cf_vendido_a_socio_negocio_id
                            }
                         });
                         elemento.dataValues.socio_negocio = socio_negocio;
                         compras_finales.push(elemento);
                        if((ventasUsuario.length - 1) == index){
                            res.status(200).send({
                                message: 'Ventas finalizadas',
                                compras_finales
                            })

                        }
                    });

                    }
                    else
                    {
                        res.status(500).send(
                        {
                            message: 'El usuario no tiene rol de vendedor'
                        })
                    }
                }
                else
                {
                    res.status(500).send(
                    {
                        message: 'Rol no existe'
                    })
                }
            }
            else
            {
                res.status(500).send(
                {
                    message: 'El usuario no existe o no esta activo'
                })
            }
        }
        catch(e)
        {
            res.status(500).send(
            {
                message: 'Error',
                e
            });
            next(e);
        }
    },

    getVendedorCompraFinalizadaListByCardCode: async (req, res, next) => {
        try
        {
            const constUsuario = await models.Usuario.findOne(
            {
                where: {
                    usu_usuario_id: req.body.usu_usuario_id,
                    usu_cmm_estatus_id: statusControles.ESTATUS_USUARIO.ACTIVO
                }
            });

            //Si existe
            if(constUsuario)
            {
                //Validar que id vendedor sea vendedor
                const constRol = await models.Rol.findOne(
                {
                    where: {
                        rol_rol_id: constUsuario.usu_rol_rol_id
                    }
                });

                //Si existe el rol del vendedor
                if(constRol)
                {
                    if(constRol.rol_tipo_rol_id == statusControles.TIPO_ROL_MENU.VENDEDORES)
                    {






                        // Obtener todos los SN asociados a un usuario vendedor
                        const constSociosNegocio = await models.SociosNegocio.findAll(
                        {
                            where: {
                                sn_vendedor_codigo_sap: constUsuario.usu_codigo_vendedor
                            }
                        });




                        var compras_finales = [];
                        for (var i = 0; i < constSociosNegocio.length; i++) 
                        {
                            // Obtener todos los SN asociados a un usuario vendedor
                            const cosntCompraFinalizada = await models.CompraFinalizada.findAll(
                            {
                                where: {
                                    cf_vendido_a_socio_negocio_id: constSociosNegocio[i].dataValues.sn_socios_negocio_id
                                }
                            });


                            if(cosntCompraFinalizada.length > 0)
                            {
                                for (var j = 0; j < cosntCompraFinalizada.length; j++) 
                                {
                                    compras_finales.push(cosntCompraFinalizada[j].dataValues)

                                }
                            }
                        }


                        





                        res.status(200).send({
                            message: 'Ventas finalizadas',
                            compras_finales
                        })








                        // const ventasUsuario = await models.CompraFinalizada.findAll(
                        // {
                        //     where: {
                        //         cf_vendido_por_usu_usuario_id: req.body.usu_usuario_id
                        //     },
                        //     include: [
                        //         {
                        //             model: models.ControlMaestroMultiple,
                        //             as:'tipo_compra_id',
                        //             attributes: {
                        //                 exclude: ['cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                        //             }
                        //         },
                        //         {
                        //             model: models.ControlMaestroMultiple,
                        //             as:'tipo_envio_id',
                        //             attributes: {
                        //                 exclude: ['cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                        //             }
                        //         },
                        //         {
                        //             model: models.Facturas,
                        //             attributes: {
                        //                 exclude: ['createdAt', 'updatedAt']
                        //             }
                        //         }
                        //     ]
                        // });


                        // var compras_finales = [];


                        // ventasUsuario.forEach(async function(elemento, index)
                        // {
                        //     const socio_negocio = await models.SociosNegocio.findOne(
                        //     {
                        //         where: {
                        //             sn_socios_negocio_id : elemento.dataValues.cf_vendido_a_socio_negocio_id
                        //         }
                        //     });
                        //     elemento.dataValues.socio_negocio = socio_negocio;
                        //     compras_finales.push(elemento);

                        //     if((ventasUsuario.length - 1) == index)
                        //     {
                        //         res.status(200).send({
                        //             message: 'Ventas finalizadas',
                        //             compras_finales
                        //         })
                        //     }
                        // });














                    }
                    else
                    {
                        res.status(500).send(
                        {
                            message: 'El usuario no tiene rol de vendedor'
                        })
                    }
                }
                else
                {
                    res.status(500).send(
                    {
                        message: 'Rol no existe'
                    })
                }
            }
            else
            {
                res.status(500).send(
                {
                    message: 'El usuario no existe o no esta activo'
                })
            }
        }
        catch(e)
        {
            res.status(500).send(
            {
                message: 'Error',
                e
            });
            next(e);
        }
    },

    // getVendedorCompraFinalizadaBySNOriginal: async (req, res, next) => {
    //     try
    //     {
    //         const constUsuario = await models.Usuario.findOne(
    //         {
    //             where: {
    //                 usu_usuario_id: req.body.usu_usuario_id,
    //                 usu_cmm_estatus_id: statusControles.ESTATUS_USUARIO.ACTIVO
    //             }
    //         });

    //         //Si existe
    //         if(constUsuario)
    //         {
    //             // validar que id vendedor sea vendedor
    //             const constRol = await models.Rol.findOne(
    //             {
    //                 where: {
    //                     rol_rol_id: constUsuario.usu_rol_rol_id
    //                 }
    //             });

    //             if(constRol)
    //             {
    //                 if(constRol.rol_tipo_rol_id == statusControles.TIPO_ROL_MENU.VENDEDORES)
    //                 {
    //                     var varlimit = req.body.limite
    //                     var varoffset = 0 + (req.body.pagina) * varlimit

    //                     const constSociosNegocio = await models.SociosNegocio.findAndCountAll(
    //                     {
    //                         where: {
    //                             sn_vendedor_codigo_sap: constUsuario.usu_codigo_vendedor
    //                         },
    //                         limit: varlimit,
    //                         offset: varoffset
    //                     });


    //                     res.status(200).send(
    //                     {
    //                         message: 'Obtenido correctamente',
    //                         constSociosNegocio
    //                     })
    //                 }
    //                 else
    //                 {
    //                     res.status(500).send(
    //                     {
    //                         message: 'El usuario no tiene rol de vendedor'
    //                     })
    //                 }
    //             }
    //             else
    //             {
    //                 res.status(500).send(
    //                 {
    //                     message: 'Rol no existe'
    //                 })
    //             }
    //         }
    //         else
    //         {
    //             res.status(500).send(
    //             {
    //                 message: 'El usuario no existe o no esta activo'
    //             })
    //         }
    //     }
    //     catch(e)
    //     {
    //         res.status(500).send(
    //         {
    //             message: 'Error',
    //             e
    //         });
    //         next(e);
    //     }
    // },


}