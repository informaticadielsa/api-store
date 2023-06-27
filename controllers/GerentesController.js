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

    asignarVendedorAGerente: async (req, res, next) => {
        try
        {
            const constVendedor = await models.Usuario.findOne(
            {
                where: {
                    usu_usuario_id: req.body.usu_usuario_id_vendedor
                }
            });

            const constGerente = await models.Usuario.findOne(
            {
                where: {
                    usu_usuario_id: req.body.usu_usuario_id_gerente
                }
            });

            if(constVendedor)
            {
                if(constGerente)
                {
                    const constVendedorRol = await models.Rol.findOne(
                    {
                        where: {
                            rol_rol_id: constVendedor.usu_rol_rol_id
                        }
                    });

                    const constGerenteRol = await models.Rol.findOne(
                    {
                        where: {
                            rol_rol_id: constGerente.usu_rol_rol_id
                        }
                    });

                    if(constVendedorRol.rol_tipo_rol_id == statusControles.TIPO_ROL_MENU.VENDEDORES)
                    {
                        if(constGerenteRol.rol_tipo_rol_id == statusControles.TIPO_ROL_MENU.GERENTES)
                        {
                            const bodyUpdate = {
                                "usu_vendedor_gerente": req.body.usu_usuario_id_gerente,
                                "usu_usuario_modificado_por_id": req.body.usu_usuario_modificado_por_id,
                                updatedAt: Date()
                            }
                            await constVendedor.update(bodyUpdate);

                            res.status(200).send(
                            {
                                message: 'Vendedor asignado a gerente correctamente'
                            })
                        }
                        else
                        {
                            res.status(500).send(
                            {
                                message: 'El id de gerent no es gerente'
                            })
                        }
                    }
                    else
                    {
                        res.status(500).send(
                        {
                            message: 'El id de vendedor no es vendedor'
                        })
                    }
                }
                else
                {
                    res.status(500).send(
                    {
                        message: 'Gerente no existe'
                    })
                }
            }
            else
            {
                res.status(500).send(
                {
                    message: 'Vendedor no existe'
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
    desasignarVendedorAGerente: async (req, res, next) => {
        try
        {
            const constVendedor = await models.Usuario.findOne(
            {
                where: {
                    usu_usuario_id: req.body.usu_usuario_id
                }
            });

            if(constVendedor)
            {
                
                const constVendedorRol = await models.Rol.findOne(
                {
                    where: {
                        rol_rol_id: constVendedor.usu_rol_rol_id
                    }
                });

                if(constVendedorRol.rol_tipo_rol_id == statusControles.TIPO_ROL_MENU.VENDEDORES)
                {
                    const bodyUpdate = {
                        "usu_vendedor_gerente": null,
                        "usu_usuario_modificado_por_id": req.body.usu_usuario_modificado_por_id,
                        updatedAt: Date()
                    }
                    await constVendedor.update(bodyUpdate);

                    res.status(200).send(
                    {
                        message: 'Vendedor desasignado correctamente de Gerente'
                    })
                }
                else
                {
                    res.status(500).send(
                    {
                        message: 'El id de vendedor no es vendedor'
                    })
                }
            }
            else
            {
                res.status(500).send(
                {
                    message: 'El usuario no existe'
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








    getComprasFinalizadasFromVendedoresByGerentes: async (req, res, next) => {
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
                    if(constRol.rol_tipo_rol_id == statusControles.TIPO_ROL_MENU.GERENTES)
                    {
                        const usuarios = await models.Usuario.findAll(
                        {
                            where: {
                                usu_vendedor_gerente: req.body.usu_usuario_id
                            }
                        });

                        console.log(usuarios)

                        var auxTemp = []
                        usuarios.forEach(async function(element, index)
                        {
                            console.log(element.dataValues.usu_usuario_id)
                            auxTemp.push(element.dataValues.usu_usuario_id);
                            if((usuarios.length - 1) == index)
                            {
                                console.log(auxTemp)
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

                                console.log(compras_finalizadas)
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




    getComprasFinalizadasFromVendedoresByGerentesByCardCode: async (req, res, next) => {
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
                //Validar que tipo de rol tiene
                const constRol = await models.Rol.findOne(
                {
                    where: {
                        rol_rol_id: constUsuario.usu_rol_rol_id
                    }
                });

                //Si existe el rol de gerente
                if(constRol)
                {
                    if(constRol.rol_tipo_rol_id == statusControles.TIPO_ROL_MENU.GERENTES)
                    {
                        const constListaVendedores = await models.Usuario.findAll(
                        {
                            where: {
                                usu_vendedor_gerente: req.body.usu_usuario_id
                            }
                        });

                        



                        var compras_finales = [];

                        //Si la lista es mayor que 0
                        if(constListaVendedores.length > 0)
                        {

                            for (var h = 0; h < constListaVendedores.length; h++) 
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
                                        }
                                    }
                                }
                            }
                        }

                        res.status(200).send(
                        {
                            message: 'Ventas finalizadas',
                            compras_finales
                        })



                    }
                    else
                    {
                        res.status(500).send(
                        {
                            message: 'El usuario no tiene rol de gerente'
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



    

    sociosNegocioDeVendedorDeGerente: async (req, res, next) => {
        try
        {
            const constUsuarioGerente = await models.Usuario.findOne(
            {
                where: {
                    usu_usuario_id: req.params.id,
                    usu_cmm_estatus_id: statusControles.ESTATUS_USUARIO.ACTIVO
                }
            });

            //Validar que id vendedor sea vendedor
            const constRolgerente = await models.Rol.findOne(
            {
                where: {
                    rol_rol_id: constUsuarioGerente.usu_rol_rol_id
                }
            });

            var esGerente = true
            if(constRolgerente.rol_tipo_rol_id != statusControles.TIPO_ROL_MENU.GERENTES)
            {
                esGerente = false
            }


            if(esGerente == true)
            {

                const constUsuario = await models.Usuario.findAll(
                {
                    where: {
                        usu_vendedor_gerente: req.params.id,
                        usu_cmm_estatus_id: statusControles.ESTATUS_USUARIO.ACTIVO
                    }
                });

                //Si existe
                if(constUsuario.length > 0 && esGerente == true)
                {
                    var todosSonVendedores = true
                    for (var i = 0; i < constUsuario.length; i++) 
                    {
                        //Validar que id vendedor sea vendedor
                        const constRol = await models.Rol.findOne(
                        {
                            where: {
                                rol_rol_id: constUsuario[i].dataValues.usu_rol_rol_id
                            }
                        });

                        if(constRol.rol_tipo_rol_id != statusControles.TIPO_ROL_MENU.VENDEDORES)
                        {
                            todosSonVendedores = false
                        }
                    }

                    if(todosSonVendedores == true)
                    {
                        var usuarioJson = []
                        for (var j = 0; j < constUsuario.length; j++) 
                        {
                            usuarioJson.push(constUsuario[j].dataValues.usu_codigo_vendedor)
                        }

                        const constSociosNegocio = await models.SociosNegocio.findAll(
                        {
                            where: {
                                sn_vendedor_codigo_sap: usuarioJson
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
                            message: 'Un usuario asignado no es vendedor'
                        })
                    }
                }
                else
                {
                    res.status(500).send(
                    {
                        message: 'Usuarios asignados a gerente no son vendedor'
                    })
                }


            }
            else
            {
                res.status(500).send(
                {
                    message: 'Gerente no existe o Rol no es gerente'
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



    sociosNegocioDeVendedorDeGerentePaginada: async (req, res, next) => {
        try
        {
            const constUsuarioGerente = await models.Usuario.findOne(
            {
                where: {
                    usu_usuario_id: req.body.usu_usuario_id,
                    usu_cmm_estatus_id: statusControles.ESTATUS_USUARIO.ACTIVO
                }
            });

            //Validar que id vendedor sea vendedor
            const constRolgerente = await models.Rol.findOne(
            {
                where: {
                    rol_rol_id: constUsuarioGerente.usu_rol_rol_id
                }
            });

            var esGerente = true
            if(constRolgerente.rol_tipo_rol_id != statusControles.TIPO_ROL_MENU.GERENTES)
            {
                esGerente = false
            }


            if(esGerente == true)
            {

                const constUsuario = await models.Usuario.findAll(
                {
                    where: {
                        usu_vendedor_gerente: req.body.usu_usuario_id,
                        usu_cmm_estatus_id: statusControles.ESTATUS_USUARIO.ACTIVO
                    }
                });

                //Si existe
                if(constUsuario.length > 0 && esGerente == true)
                {
                    var todosSonVendedores = true
                    for (var i = 0; i < constUsuario.length; i++) 
                    {
                        //Validar que id vendedor sea vendedor
                        const constRol = await models.Rol.findOne(
                        {
                            where: {
                                rol_rol_id: constUsuario[i].dataValues.usu_rol_rol_id
                            }
                        });

                        if(constRol.rol_tipo_rol_id != statusControles.TIPO_ROL_MENU.VENDEDORES)
                        {
                            todosSonVendedores = false
                        }
                    }

                    if(todosSonVendedores == true)
                    {
                        var usuarioJson = []
                        for (var j = 0; j < constUsuario.length; j++) 
                        {
                            usuarioJson.push(constUsuario[j].dataValues.usu_codigo_vendedor)
                        }

                        var varlimit = req.body.limite
                        var varoffset = 0 + (req.body.pagina) * varlimit

                        const constSociosNegocio = await models.SociosNegocio.findAndCountAll(
                        {
                            where: {
                                sn_vendedor_codigo_sap: usuarioJson
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
                            message: 'Un usuario asignado no es vendedor'
                        })
                    }
                }
                else
                {
                    res.status(500).send(
                    {
                        message: 'Usuarios asignados a gerente no son vendedor'
                    })
                }


            }
            else
            {
                res.status(500).send(
                {
                    message: 'Gerente no existe o Rol no es gerente'
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
}