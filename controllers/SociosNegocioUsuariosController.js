import models from '../models';
import token from '../services/token';
import jwt from 'jsonwebtoken';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const {recoveryEmail} = require('../services/recoveryEmailB2B');
const { nuevoUsuario } = require('../services/nuevoClienteB2B');


import bcrypt from 'bcryptjs';

const generadorPassword = function(num){
    const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result1= '';
    const charactersLength = characters.length;
    for ( let i = 0; i < num; i++ ) {
        result1 += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result1;
    
}

const super_user = [
    {
      menu: "Mi cuenta",
      key: "perfil",
      key_id: 0,
      permisos: [
        {
          titulo: "Ver todo el módulo de mi cuenta",
          key: "view",
          permiso: true,
        },
        {
          titulo: "Cambiar contraseña y datos de usuario",
          key: "edit",
          permiso: true,
        },      
      ],
      submenu: [
        {
          menu: "Mis direcciones",
          key: "direcciones",
          key_id: 1,
          permisos: [
            {
              titulo: "Ver direcciones de envío",
              key: "view",
              permiso: true,
            },
            {
              titulo:
                "Actualizar direcciones de envío y de ellas seleccionar la predeterminada",
              key: "edit",
              permiso: true,
            },
            {
              titulo: "Crear nuevas direcciones de envío",
              key: "create",
              permiso: true,
            },
            {
              titulo: "Eliminar direcciones de envío",
              key: "delete",
              permiso: true,
            },
          ],
        },
        {
          menu: "Perfiles de acceso",
          key: "usuarios",
          key_id: 2,
          permisos: [
            {
              titulo: "Ver usuarios del cliente",
              key: "view",
              permiso: true,
            },
            {
              titulo: "Actualizar usuarios del cliente y sus permisos",
              key: "edit",
              permiso: true,
            },
            {
              titulo: "Crear nuevos usuarios del cliente",
              key: "create",
              permiso: true,
            },
            {
              titulo: "Eliminar usuarios del cliente",
              key: "delete",
              permiso: true,
            },
          ],
        },
      ],
    },
    {
      menu: "Mis facturas",
      key: "facturas",
      key_id: 3,
      permisos: [
        {
          titulo: "Acceso módulo de facturas",
          key: "view",
          permiso: true,
        },
        {
          titulo: "Acceso a estado de cuenta y consultar mi crédito",
          key: "view_credit",
          permiso: true,
        },
      ],
    },
    {
      menu: "Mis pedidos",
      key: "pedidos",
      key_id: 4,
      permisos: [
        {
          titulo: "Acceso módulo de mis pedidos",
          key: "view",
          permiso: true,
        },
        {
          titulo: "Cancelar pedidos",
          key: "edit",
          permiso: true,
        },
      ],
    },
    {
      menu: "Mis cotizaciones y proyectos",
      key: "cotizaciones",
      key_id: 5,
      permisos: [
        {
          titulo: "Historial de cotizaciones y proyectos",
          key: "view",
          permiso: true,
        },
        {
          titulo: "Modificación de cotizaciones de cotizaciones y proyectos",
          key: "edit",
          permiso: true,
        },
        {
          titulo: "Crear cotizaciones y proyectos",
          key: "create",
          permiso: true,
        },
        {
          titulo: "Eliminar cotizaciones y proyectos",
          key: "delete",
          permiso: true,
        },
      ],
    },  
    {
      menu: "Mis favoritos",
      key: "favoritos",
      key_id: 6,
      permisos: [
        {
          titulo: "Ver mi lista de favoritos",
          key: "view",
          permiso: true,
        },
        {
          titulo: "Actualizar mi lista de favoritos",
          key: "edit",
          permiso: true,
        },
      ],
    },
  ];
const user_b2b =  [
    {
      menu: "Mi cuenta",
      key: "perfil",
      key_id: 0,
      permisos: [
        {
          titulo: "Ver todo el módulo de mi cuenta",
          key: "view",
          permiso: true,
        },
        {
          titulo: "Cambiar contraseña y datos de usuario",
          key: "edit",
          permiso: true,
        },
      ],
      submenu: [
        {
          menu: "Mis direcciones",
          key: "direcciones",
          key_id: 1,
          permisos: [
            {
              titulo: "Ver direcciones de envío",
              key: "view",
              permiso: true,
            },
            {
              titulo:
                "Actualizar direcciones de envío y de ellas seleccionar la predeterminada",
              key: "edit",
              permiso: true,
            },
            {
              titulo: "Crear nuevas direcciones de envío",
              key: "create",
              permiso: true,
            },
            {
              titulo: "Eliminar direcciones de envío",
              key: "delete",
              permiso: true,
            },
          ],
        },
      ],
    },
    {
      // menu: "Mis facturas",
      menu: "Mi estado de cuenta",
      key: "facturas",
      key_id: 3,
      permisos: [
        {
          titulo: "Acceso módulo de facturas",
          key: "view",
          permiso: true,
        },
        {
          titulo: "Acceso a estado de cuenta y consultar mi crédito",
          key: "view_credit",
          permiso: true,
        },
      ],
    },
    {
      menu: "Mis pedidos",
      key: "pedidos",
      key_id: 4,
      permisos: [
        {
          titulo: "Acceso módulo de mis pedidos",
          key: "view",
          permiso: true,
        },
        {
          titulo: "Cancelar pedidos",
          key: "edit",
          permiso: true,
        },
      ],
    },
    // {
    //   menu: "Mis cotizaciones y proyectos",
    //   key: "cotizaciones",
    //   key_id: 5,
    //   permisos: [
    //     {
    //       titulo: "Historial de cotizaciones y proyectos",
    //       key: "view",
    //       permiso: true,
    //     },
    //     {
    //       titulo: "Modificación de cotizaciones de cotizaciones y proyectos",
    //       key: "edit",
    //       permiso: true,
    //     },
    //     {
    //       titulo: "Crear cotizaciones y proyectos",
    //       key: "create",
    //       permiso: true,
    //     },
    //     {
    //       titulo: "Eliminar cotizaciones y proyectos",
    //       key: "delete",
    //       permiso: true,
    //     },
    //   ],
    // },
    // {
    //   menu: "Mis favoritos",
    //   key: "favoritos",
    //   key_id: 6,
    //   permisos: [
    //     {
    //       titulo: "Ver mi lista de favoritos",
    //       key: "view",
    //       permiso: true,
    //     },
    //     {
    //       titulo: "Actualizar mi lista de favoritos",
    //       key: "edit",
    //       permiso: true,
    //     },
    //   ],
    // },
  ];
export default {
    getListSociosNegocioUsuarios: async(req, res, next) =>{
        try{
            const listaSocioNegociosUsuarios = await models.SociosNegocioUsuario.findAll(
            {
                where: 
                {
                    snu_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_SOCIOS_NEGOCIO_USUARIO.ELIMINADA }
                }
            }
            );
            res.status(200).send({
                message: 'Lista de Usuarios de Socios Negocios',
                listaSocioNegociosUsuarios
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    getListSociosNegocioUsuarioByID: async(req, res, next) =>{
        try{
            const listaSnubyid = await models.SociosNegocioUsuario.findOne(
            {
                where: {
                    snu_usuario_snu_id: req.params.id
                },
                attributes: {exclude: ['createdAt', 'updatedAt']},
                include: 
                [
                    {
                        model: models.Rol,
                        attributes: 
                        {
                            exclude: ['rol_usu_usuario_creado_por_id','createdAt','rol_usu_usuario_modificado_por_id','updatedAt']
                        }
                    }
                ],
            });
            console.log('req.params.id', req.params.id, listaSnubyid)
            res.status(200).send({
                message: 'Usuario SN con id',
                listaSnubyid
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    createSociosNegocioUsuario: async(req, res, next) =>{
        try{
            req.body.snu_correo_electronico = req.body.snu_correo_electronico.toLowerCase();
            const existe_super_usuario = await models.SociosNegocioUsuario.findAll({
                where:{
                    snu_sn_socio_de_negocio_id: req.body.snu_sn_socio_de_negocio_id,
                    snu_super_usuario: true
                }
            });

            console.log(req.body.snu_sn_socio_de_negocio_id)
            console.log(existe_super_usuario)


            if(existe_super_usuario.length > 0){
                console.log("entro aqui")
                req.body.snu_menu_roles = !!req.body.snu_usu_usuario_creador_id ?  await String(JSON.stringify(user_b2b)) : !!req.body.snu_snu_usuario_snu_creador_id ? String(JSON.stringify(req.body.snu_menu_roles)) : await String(JSON.stringify(user_b2b));
                req.body.snu_area = !!req.body.snu_usu_usuario_creador_id ?  'Administrador' : !!req.body.snu_snu_usuario_snu_creador_id ? req.body.snu_area : 'Administrador';
                req.body.snu_puesto = !!req.body.snu_usu_usuario_creador_id ?  'Administrador' : !!req.body.snu_snu_usuario_snu_creador_id ? req.body.snu_puesto : 'Administrador';
                let pass = generadorPassword(8);
                let passEncriptada = await bcrypt.hash(pass, 10);
                req.body.snu_contrasenia = passEncriptada;
                const usuario = await models.SociosNegocioUsuario.create(req.body);
                if(!!usuario){                    
                    await nuevoUsuario(req.body.snu_correo_electronico, pass);
                }
                res.status(200).send({
                    message: 'Usuario de Socio de Negocio creado con exito',
                    usuario
                });
            }else if(existe_super_usuario.length <= 0){
                console.log("entro al 2")
                req.body.snu_menu_roles = await String(JSON.stringify(super_user));
                req.body.snu_super_usuario = true;
                req.body.snu_area = 'Super Administrador';
                req.body.snu_puesto = 'Super Administrador';
                let pass = generadorPassword(8);
                let passEncriptada = await bcrypt.hash(pass, 10);
                req.body.snu_contrasenia = passEncriptada;
                const usuario = await models.SociosNegocioUsuario.create(req.body);
                if(!!usuario){                    
                    await nuevoUsuario(req.body.snu_correo_electronico, pass);
                }
                res.status(200).send({
                    message: 'Usuario de Socio de Negocio creado con exito',
                    usuario
                });
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al crear usuario de Socio de Negocio',
                e
            });
            next(e);
        }
    },
    getListUsuariosSociosNegocio: async(req, res, next) =>{
        try{
            const usuarios = await models.SociosNegocioUsuario.findAll({
                where: {
                    snu_sn_socio_de_negocio_id: req.params.id,
                    snu_super_usuario: false,
                    snu_cmm_estatus_id: { [Op.ne]: statusControles.ESTATUS_SOCIOS_NEGOCIO_USUARIO.ELIMINADA }
                },
                attributes: {
                    exclude: [
                        'snu_contrasenia',
                        'snu_cmm_estatus_id',
                        'snu_usu_usuario_creador_id',
                        'snu_usu_usuario_modificado_id',
                        'updatedAt',
                        'snu_snu_usuario_snu_creador_id'
                    ]
                },
                include: [
                    {
                        model: models.ControlMaestroMultiple
                    }
                ]
            });
            res.status(200).send({
                message: 'Lista de usuarios',
                usuarios
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al obtener la lista',
                e
            });
            next(e);
        }
    },
    updateSociosNegocioUsuario: async(req, res, next) =>{
        try{


            //var contra = await bcrypt.hash(req.body.snu_contrasenia, 10);
            const SNUpdate = await models.SociosNegocioUsuario.findOne({
                where: {
                    snu_usuario_snu_id : req.body.snu_usuario_snu_id
                }
            });

            await SNUpdate.update({
                snu_cardcode: !!req.body.snu_cardcode ? req.body.snu_cardcode : SNUpdate.dataValues.snu_cardcode,
                snu_nombre: !!req.body.snu_nombre ? req.body.snu_nombre : SNUpdate.dataValues.snu_nombre,
                snu_primer_apellido: !!req.body.snu_primer_apellido ? req.body.snu_primer_apellido : SNUpdate.dataValues.snu_primer_apellido,
                snu_segundo_apellido: !!req.body.snu_segundo_apellido ? req.body.snu_segundo_apellido : SNUpdate.dataValues.snu_segundo_apellido,
                snu_correo_electronico: !!req.body.snu_correo_electronico ? req.body.snu_correo_electronico : SNUpdate.dataValues.snu_correo_electronico,
                snu_direccion: !!req.body.snu_direccion ? req.body.snu_direccion : SNUpdate.dataValues.snu_direccion,
                snu_telefono: !!req.body.snu_telefono ? req.body.snu_telefono : SNUpdate.dataValues.snu_telefono,
                snu_usuario: !!req.body.snu_usuario ? req.body.snu_usuario : SNUpdate.dataValues.snu_usuario,
                //snu_contrasenia: !!req.body.snu_contrasenia ? contra : SNUpdate.dataValues.snu_contrasenia,
                snu_genero: !!req.body.snu_genero ? req.body.snu_genero : SNUpdate.dataValues.snu_genero,
                snu_cmm_estatus_id: !!req.body.snu_cmm_estatus_id ? req.body.snu_cmm_estatus_id : SNUpdate.dataValues.snu_cmm_estatus_id,
                snu_usu_usuario_modificado_id: !!req.body.snu_usu_usuario_modificado_id ? req.body.snu_usu_usuario_modificado_id : SNUpdate.dataValues.snu_usu_usuario_modificado_id,
                updatedAt: Date()
            });
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
    deleteSociosNegocioUsuarios: async(req, res, next) =>{
        try{
            const deleteSocioNegocioUsuarios = await models.SociosNegocioUsuario.findOne({
                where: {
                    snu_usuario_snu_id : req.body.snu_usuario_snu_id
                }
            });
            await deleteSocioNegocioUsuarios.update(
            {
              snu_cmm_estatus_id : statusControles.ESTATUS_SOCIOS_NEGOCIO_USUARIO.ELIMINADA,
              snu_usu_usuario_modificado_id: req.body.snu_usu_usuario_modificado_id,
              updatedAt: Date()
            })

            res.status(200).send({
              message: 'Eliminado correctamente'
            });
            }catch(e){
            res.status(500).send({
              message: 'Error al eliminar el atributo',
              e
            });
            next(e);
        }
    },
    getListSociosNegocioUsuarioByCardCode: async(req, res, next) =>{
        try{
            const listaSnubycardcode = await models.SociosNegocioUsuario.findAll(
            {
                where: 
                {
                    snu_cardcode: req.body.snu_cardcode,
                    snu_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_SOCIOS_NEGOCIO_USUARIO.ELIMINADA } 
                },
                attributes: {exclude: ['createdAt', 'updatedAt']}
            });
            res.status(200).send({
                message: 'Lista de Usuarios de Socios Negocios por cardcode',
                listaSnubycardcode
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al obtener Usuarios SN por cardcode',
                e
            });
            next(e);
        }
    },
    loginUsuarioSocioNegocio: async (req, res, next) =>{
        try{
            const usuario = await  models.SociosNegocioUsuario.findOne({
                where: {
                    [Op.or]: [
                        {
                            snu_correo_electronico: !!req.body.snu_correo_electronico ? req.body.snu_correo_electronico : ''
                        },
                        { 
                            snu_usuario: !!req.body.snu_usuario ? req.body.snu_usuario : '' 
                        }
                    ],
                    snu_cmm_estatus_id: statusControles.ESTATUS_SOCIOS_NEGOCIO_USUARIO.ACTIVA
                }
            }); 

            if(usuario){
            
                const match = await bcrypt.compare(req.body.snu_contrasenia, usuario.dataValues.snu_contrasenia);
                if(match){
                  const tokenData = {
                    'snu_socio': true,
                    'snu_usuario_snu_id':  usuarioLogin.usu_usuario_id,
                    'snu_correo_electronico' : usuario.dataValues.snu_correo_electronico,
                    'snu_nombre' : usuario.dataValues.snu_nombre,
                    'snu_primer_apellido' : usuario.dataValues.snu_primer_apellido
                  }
                  let tokenReturn = await token.encode(tokenData);
                  //usuario.dataValues.idUser= usuarioLogin.usu_usuario_id
                  usuario.dataValues.token = tokenReturn;
                  delete usuario.dataValues['snu_contrasenia'];
                  const carrito_de_compras = await models.CarritoDeCompra.findOne({
                    where: {
                      cdc_sn_socio_de_negocio_id: usuario.dataValues.snu_sn_socio_de_negocio_id
                    },
                    include: [
                      {
                        model: models.ProductoCarritoDeCompra
                      }
                    ]
                  });
                  let id_carrito;
                  let carritoExistenteID = !!carrito_de_compras ? carrito_de_compras.dataValues.cdc_carrito_de_compra_id : null;
                  if(!!carrito_de_compras && !!req.body.cart_id){
                    //Obtenemos los productos que son iguales
                    const productos_carrito_nuevo_viejo = await sequelize.query(`
                      select 
                        pcdc_prod_producto_id
                      from productos_carrito_de_compra pcdc 
                      where pcdc_prod_producto_id in(select pcdc2.pcdc_prod_producto_id from productos_carrito_de_compra pcdc2 where pcdc_carrito_de_compra_id = ` + req.body.cart_id + `)
                      and pcdc_carrito_de_compra_id  = ` + carritoExistenteID + `;
                    `, {
                      type: sequelize.QueryTypes.SELECT
                    });
                    if(productos_carrito_nuevo_viejo.length >= 1){
                      productos_carrito_nuevo_viejo.forEach(async function(producto, indexProducto){
                        await models.ProductoCarritoDeCompra.destroy({
                          where: {
                            pcdc_carrito_de_compra_id: carritoExistenteID,
                            pcdc_prod_producto_id: producto.pcdc_prod_producto_id
                          }
                        }); 
                        const nuevo = await models.ProductoCarritoDeCompra.findOne({
                          where: {
                            pcdc_carrito_de_compra_id: req.body.cart_id,
                            pcdc_prod_producto_id: producto.pcdc_prod_producto_id
                          }
                        });

                        let creaNuevo = {
                          pcdc_carrito_de_compra_id: carritoExistenteID,
                          pcdc_precio: nuevo.dataValues.pcdc_precio,
                          pcdc_prod_producto_id: nuevo.dataValues.pcdc_prod_producto_id,
                          pcdc_producto_cantidad: nuevo.dataValues.pcdc_producto_cantidad
                        }
                        await models.ProductoCarritoDeCompra.create(creaNuevo);
                        await nuevo.destroy();
                        if((productos_carrito_nuevo_viejo.length -1) == indexProducto){
                          const carrito = await models.CarritoDeCompra.findOne({
                            where: {
                              cdc_carrito_de_compra_id: req.body.cart_id
                            },
                            include: [
                              {
                                model: models.ProductoCarritoDeCompra
                              }
                            ]
                          });
                          if(carrito.dataValues.productos_carrito_de_compras.length >= 1){
                            carrito.dataValues.productos_carrito_de_compras.forEach(async function(nuevoBusqueda, nuevoIndex){
                                const nuevo = await models.ProductoCarritoDeCompra.findOne({
                                  where: {
                                    pcdc_carrito_de_compra_id: nuevoBusqueda.dataValues.pcdc_carrito_de_compra_id,
                                    pcdc_prod_producto_id: nuevoBusqueda.dataValues.pcdc_prod_producto_id
                                  }
                                });
                                let creaNuevo = {
                                  pcdc_carrito_de_compra_id: carritoExistenteID,
                                  pcdc_precio: nuevo.dataValues.pcdc_precio,
                                  pcdc_prod_producto_id: nuevo.dataValues.pcdc_prod_producto_id,
                                  pcdc_producto_cantidad: nuevo.dataValues.pcdc_producto_cantidad
                                }
                                await models.ProductoCarritoDeCompra.create(creaNuevo);
                                if((carrito.dataValues.productos_carrito_de_compras.length -1 ) == nuevoIndex){
                                  await models.ProductoCarritoDeCompra.destroy({
                                    where: { 
                                      pcdc_carrito_de_compra_id: req.body.cart_id
                                    }
                                  });
                                  await models.CarritoDeCompra.destroy({
                                    where: {
                                      cdc_carrito_de_compra_id: req.body.cart_id
                                    }
                                  });
                                  id_carrito = await carritoExistenteID;
                                  res.status(200).send({
                                      message: 'Login exitos',
                                      usuario,
                                      id_carrito
                                  });
                                }
                            });
                          }else{
                            await models.ProductoCarritoDeCompra.destroy({
                              pcdc_carrito_de_compra_id: req.body.cart_id
                            });
                            await models.CarritoDeCompra.destroy({
                              where: {
                                cdc_carrito_de_compra_id: req.body.cart_id
                              }
                            });
                            id_carrito = await carritoExistenteID;
                            res.status(200).send({
                                message: 'Login exitos',
                                usuario,
                                id_carrito
                            });
                          }
                        }
                      });
                    }else{
                      //Cuando no exiten productos repetidos
                      const carrito = await models.CarritoDeCompra.findOne({
                        where: {
                          cdc_carrito_de_compra_id: req.body.cart_id
                        },
                        include: [
                          {
                            model: models.ProductoCarritoDeCompra
                          }
                        ]
                      });
                      if(carrito.dataValues.productos_carrito_de_compras.length >= 1){
                        carrito.dataValues.productos_carrito_de_compras.forEach(async function(nuevoBusqueda, nuevoIndex){
                            const nuevo = await models.ProductoCarritoDeCompra.findOne({
                              where: {
                                pcdc_carrito_de_compra_id: nuevoBusqueda.dataValues.pcdc_carrito_de_compra_id,
                                pcdc_prod_producto_id: nuevoBusqueda.dataValues.pcdc_prod_producto_id
                              }
                            });
                            let creaNuevo = {
                              pcdc_carrito_de_compra_id: carritoExistenteID,
                              pcdc_precio: nuevo.dataValues.pcdc_precio,
                              pcdc_prod_producto_id: nuevo.dataValues.pcdc_prod_producto_id,
                              pcdc_producto_cantidad: nuevo.dataValues.pcdc_producto_cantidad
                            }
                            await models.ProductoCarritoDeCompra.create(creaNuevo);
                            if((carrito.dataValues.productos_carrito_de_compras.length -1 ) == nuevoIndex){
                              await models.ProductoCarritoDeCompra.destroy({
                                where: { 
                                  pcdc_carrito_de_compra_id: req.body.cart_id
                                }
                              });
                              await models.CarritoDeCompra.destroy({
                                where: {
                                  cdc_carrito_de_compra_id: req.body.cart_id
                                }
                              });
                              res.status(200).send({
                                  message: 'Login exitos',
                                  usuario,
                                  id_carrito
                              });
                            }
                        });
                      }else{
                        await models.CarritoDeCompra.destroy({
                          where: {
                            cdc_carrito_de_compra_id: req.body.cart_id
                          }
                        })
                        res.status(200).send({
                            message: 'Login exitos',
                            usuario,
                            id_carrito
                        });
                      }
                    }
                  }else if(!!req.body.cart_id){
                    const carrito = await models.CarritoDeCompra.findOne({
                      where: {
                        cdc_carrito_de_compra_id: req.body.cart_id
                      }
                    });
                    await carrito.update({
                      cdc_sn_socio_de_negocio_id: usuario.dataValues.snu_sn_socio_de_negocio_id
                    });
                    id_carrito = await carrito.dataValues.cdc_carrito_de_compra_id;
                    res.status(200).send({
                        message: 'Login exitos',
                        usuario,
                        id_carrito
                    });
                  }else{
                    id_carrito = await carritoExistenteID;
                    res.status(200).send({
                        message: 'Login exitos',
                        usuario,
                        id_carrito
                    });
                  }
                }else{
                    res.status(300).send({
                        message: 'Datos no validos'
                    });
                }
            }else{
                res.status(300).send({
                    message: 'Usuario no encontrado'
                });
            }
        }catch(e){
            res.status(500).send({
                message: 'Error al iniciar sesión', 
                e
            });
            next(e);
        }
    },
    recoveryPassword: async (req, res, next) =>{
        try{
            req.body.snu_correo_electronico = req.body.snu_correo_electronico.toLowerCase();
            const usuarioSolicitud = await models.SociosNegocioUsuario.findOne({
                where: { 
                    snu_correo_electronico : req.body.snu_correo_electronico,
                    snu_cmm_estatus_id: statusControles.ESTATUS_SOCIOS_NEGOCIO_USUARIO.ACTIVA
                },
                attributes: {
                    exclude: [
                        'snu_direccion',
                        'snu_telefono',
                        'snu_contrasenia',
                        'snu_genero',
                        'snu_cmm_estatus_id',
                        'snu_usu_usuario_creador_id',
                        'createdAt',
                        'snu_usu_usuario_modificado_id',
                        'updatedAt'
                ]}
            });
            if(!!usuarioSolicitud){
                const tokenData = {
                    'snu_usuario_snu_id': usuarioSolicitud.dataValues.snu_usuario_snu_id,
                    'snu_correo_electronico': usuarioSolicitud.dataValues.snu_correo_electronico,
                    'snu_nombre': usuarioSolicitud.dataValues.snu_nombre,
                    'snu_primer_apellido': usuarioSolicitud.dataValues.snu_primer_apellido,
                    'usu_recovery' : true
                }
                let tokenReturn = await token.encode(tokenData);
                console.log(usuarioSolicitud.dataValues.snu_usuario_snu_id,
                    usuarioSolicitud.dataValues.snu_correo_electronico,
                    usuarioSolicitud.dataValues.snu_nombre,
                    usuarioSolicitud.dataValues.snu_primer_apellido, tokenReturn);
                await recoveryEmail(usuarioSolicitud.dataValues.snu_correo_electronico, tokenReturn, usuarioSolicitud.dataValues.snu_usuario_snu_id);
                res.status(200).send({
                    message: "Solicitud exitosa."
                });
            }else{
                res.status(300).send({
                    message: 'Usuario no encontrado y/o no disponible para esta acción'
                });
            }
        }catch(e){
            res.status(500).send({
                message: "Error, al generar la petición"
            })
            next();
        }
    },   
    validRecovery: async (req, res, next) =>{
        const token = req.headers['token'];
        console.log('TOKEN', token);
        const jwtInformation = await jwt.decode(token);
        
        console.log(jwtInformation.dataAllUser.snu_usuario_snu_id);
        try{
            if(req.body.snu_contrasenia == req.body.snu_contrasenia_confirm){
                //const jwtInformation = await jwt.decode(token);   
                const newPassWord = await models.SociosNegocioUsuario.findOne({ 
                    where:{ 
                        snu_usuario_snu_id: jwtInformation.dataAllUser.snu_usuario_snu_id
                    }
                });

                if(!!newPassWord){
                    req.body.snu_contrasenia = await bcrypt.hash(req.body.snu_contrasenia, 10);
                    await newPassWord.update({
                        snu_contrasenia: req.body.snu_contrasenia,
                        updatedAt: Date(),
                        snu_usu_usuario_modificado_id: jwtInformation.dataAllUser.snu_usuario_snu_id
                    },{
                        where: {
                            snu_usuario_snu_id : jwtInformation.dataAllUser.snu_usuario_snu_id
                        }
                    });
                    res.status(200).send({
                        message: 'Actualización de contraseña exitosa'
                    });
                }else{
                    res.status(300).send({
                        message: 'No es posible cambiar la contraseña usuario inactivo y/o no valido'
                    });
                }
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







    //APIS CON TOKEN SN
    ChangePassword: async(req, res, next) =>{
        try{
            
            var usuario_id = req.body.snu_usuario_snu_id
            const usuario = await  models.SociosNegocioUsuario.findOne({
                where: {
                    snu_usuario_snu_id: usuario_id,
                    snu_cmm_estatus_id: statusControles.ESTATUS_SOCIOS_NEGOCIO_USUARIO.ACTIVA
                }
            });

            var contraseña_vieja = req.body.old_password
            var contraseña_nueva = req.body.new_password

            const match = await bcrypt.compare(contraseña_vieja, usuario.dataValues.snu_contrasenia);
            if(match)
            {
                var contra = await bcrypt.hash(contraseña_nueva, 10);

                await usuario.update({
                    snu_contrasenia: !!contra ? contra : usuario.dataValues.snu_contrasenia,
                    updatedAt: Date()
                });

                console.log("Entro al match")

            }
            else
            {
                res.status(300).send({
                    message: 'Datos no validos'
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

    updateSociosNegocioUsuario_SN_token: async(req, res, next) =>{
        try{
            //var contra = await bcrypt.hash(req.body.snu_contrasenia, 10);
            const SNUpdate = await models.SociosNegocioUsuario.findOne({
                where: {
                    snu_usuario_snu_id : req.body.snu_usuario_snu_id
                }
            });
            
            await SNUpdate.update({
                snu_cardcode: !!req.body.snu_cardcode ? req.body.snu_cardcode : SNUpdate.dataValues.snu_cardcode,
                snu_nombre: !!req.body.snu_nombre ? req.body.snu_nombre : SNUpdate.dataValues.snu_nombre,
                snu_primer_apellido: !!req.body.snu_primer_apellido ? req.body.snu_primer_apellido : SNUpdate.dataValues.snu_primer_apellido,
                snu_segundo_apellido: !!req.body.snu_segundo_apellido ? req.body.snu_segundo_apellido : SNUpdate.dataValues.snu_segundo_apellido,
                snu_correo_electronico: !!req.body.snu_correo_electronico ? req.body.snu_correo_electronico : SNUpdate.dataValues.snu_correo_electronico,
                snu_direccion: !!req.body.snu_direccion ? req.body.snu_direccion : SNUpdate.dataValues.snu_direccion,
                snu_telefono: !!req.body.snu_telefono ? req.body.snu_telefono : SNUpdate.dataValues.snu_telefono,
                snu_usuario: !!req.body.snu_usuario ? req.body.snu_usuario : SNUpdate.dataValues.snu_usuario,
                snu_genero: !!req.body.snu_genero ? req.body.snu_genero : SNUpdate.dataValues.snu_genero,
                snu_cmm_estatus_id: !!req.body.snu_cmm_estatus_id ? req.body.snu_cmm_estatus_id : SNUpdate.dataValues.snu_cmm_estatus_id,
                snu_usu_usuario_modificado_id: !!req.body.snu_usu_usuario_modificado_id ? req.body.snu_usu_usuario_modificado_id : SNUpdate.dataValues.snu_usu_usuario_modificado_id,
                snu_menu_roles: !!req.body.snu_menu_roles ? String(JSON.stringify(req.body.snu_menu_roles)) : SNUpdate.dataValues.snu_menu_roles,
                snu_area: !!req.body.snu_area ? req.body.snu_area : SNUpdate.dataValues.snu_area,
                snu_puesto: !!req.body.snu_puesto ? req.body.snu_puesto : SNUpdate.dataValues.snu_puesto,
                updatedAt: Date()
            });
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





    getSociosNegocioUsuariosById: async(req, res, next) =>{
        try{


            const listaSocioNegociosUsuarios = await models.SociosNegocioUsuario.findAll(
            {
                where: 
                {
                    // snu_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_SOCIOS_NEGOCIO_USUARIO.ELIMINADA },
                    snu_usuario_snu_id: req.params.id
                },
                attributes: {
                    exclude : ['snu_contrasenia','snu_usuario','updatedAt','createdAt']
                }
            });




            res.status(200).send({
                message: 'Lista de Usuarios de Socios Negocios',
                usuario: listaSocioNegociosUsuarios
            })


        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
}