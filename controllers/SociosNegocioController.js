import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import bcrypt from 'bcryptjs';
const { newUserController, nuevoUsuario } = require('../services/nuevoClienteB2B');

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
        "menu": "Mi cuenta",
        "key": "perfil",
        "key_id": 0,
        "permisos": [
            {
                "titulo": "Ver todo el módulo de mi cuenta",
                "key": "view",
                "permiso": true
            },
            {
                "titulo": "Cambiar contraseña y datos de usuario",
                "key": "edit",
                "permiso": true
            },
            {
                "titulo": "Acceso a estado de cuenta y consultar mi crédito",
                "key": "credit",
                "permiso": true
            }
        ],
        "submenu": [
            {
                "menu": "Mis direcciones",
                "key": "direcciones",
                "key_id": 1,
                "permisos": [
                    {
                        "titulo": "Ver direcciones de envío",
                        "key": "view",
                        "permiso": true
                    },
                    {
                        "titulo": "Actualizar direcciones de envío y de ellas seleccionar la predeterminada",
                        "key": "edit",
                        "permiso": true
                    },
                    {
                        "titulo": "Crear nuevas direcciones de envío",
                        "key": "create",
                        "permiso": true
                    },
                    {
                        "titulo": "Eliminar direcciones de envío",
                        "key": "delete",
                        "permiso": true
                    }
                ]
            },
            {
                "menu": "Perfiles de acceso",
                "key": "usuarios",
                "key_id": 2,
                "permisos": [
                    {
                        "titulo": "Ver usuarios del cliente",
                        "key": "view",
                        "permiso": true
                    },
                    {
                        "titulo": "Actualizar usuarios del cliente y sus permisos",
                        "key": "edit",
                        "permiso": true
                    },
                    {
                        "titulo": "Crear nuevos usuarios del cliente",
                        "key": "create",
                        "permiso": true
                    },
                    {
                        "titulo": "Eliminar usuarios del cliente",
                        "key": "delete",
                        "permiso": true
                    }
                ]
            }
        ]
    },
    {
        "menu": "Mis facturas",
        "key": "facturas",
        "key_id": 3,
        "permisos": [
            {
                "titulo": "Acceso módulo de facturas",
                "key": "view",
                "permiso": true
            }
        ]
    },
    {
        "menu": "Mis pedidos",
        "key": "pedidos",
        "key_id": 4,
        "permisos": [
            {
                "titulo": "Acceso módulo de mis pedidos",
                "key": "view",
                "permiso": true
            },
            {
                "titulo": "Cancelar pedidos",
                "key": "edit",
                "permiso": true
            }
        ]
    },
    {
        "menu": "Mis cotizaciones",
        "key": "cotizaciones",
        "key_id": 6,
        "permisos": [
            {
                "titulo": "Historial de cotizaciones",
                "key": "view",
                "permiso": true
            },
            {
                "titulo": "Modificación de cotizaciones",
                "key": "edit",
                "permiso": true
            },
            {
                "titulo": "Crear cotizaciones",
                "key": "create",
                "permiso": true
            },
            {
                "titulo": "Eliminar cotizaciones",
                "key": "delete",
                "permiso": true
            }
        ]
    },
    {
        "menu": "Mis proyectos",
        "key": "proyectos",
        "key_id": 7,
        "permisos": [
            {
                "titulo": "Historial de proyectos",
                "key": "view",
                "permiso": true
            },
            {
                "titulo": "Modificación de proyectos",
                "key": "edit",
                "permiso": true
            },
            {
                "titulo": "Crear proyectos",
                "key": "create",
                "permiso": true
            },
            {
                "titulo": "Eliminar proyectos",
                "key": "delete",
                "permiso": true
            }
        ]
    },
    {
        "menu": "Mis favoritos",
        "key": "favoritos",
        "key_id": 8,
        "permisos": [
            {
                "titulo": "Ver mi lista de favoritos",
                "key": "view",
                "permiso": true
            },
            {
                "titulo": "Actualizar mi lista de favoritos",
                "key": "edit",
                "permiso": true
            }
        ]
    }
];
export default {
    getListSociosNegocio: async(req, res, next) =>{
        try{
            /*
            const listaSocioNegocios = await models.SociosNegocio.findAll(
            {
                where: {
                        sn_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_SOCIOS_NEGOCIO.ELIMINADA } 
                    },
                include: 
                [
                    {
                        model: models.Pais,
                        attributes: 
                        {
                            exclude: ['pais_usu_usuario_creador_id','createdAt','pais_usu_modificado_por_id','updatedAt']
                        }
                    },
                    {
                        model: models.Estado,
                        attributes: 
                        {
                            exclude: ['estpa_usu_usuario_creador_id','createdAt','estpa_usu_usuario_modificador_id','updatedAt']
                        }
                    },
                ],
            });
            */
           
            // const listaSocioNegocios = await sequelize.query(`
            //     select * from socios_negocio sn  
            //     left join controles_maestros_multiples cmm  on cmm.cmm_control_id  = sn.sn_cmm_estatus_id  `,
            // { 
            //     type: sequelize.QueryTypes.SELECT 
            // });
            const listaSocioNegocios = await models.SociosNegocio.findAll(
            {
                where: {
                    sn_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_SOCIOS_NEGOCIO.ELIMINADA } 
                },
                include: 
                [
                    {
                        model: models.Pais,
                        attributes: 
                        {
                            exclude: ['pais_usu_usuario_creador_id','createdAt','pais_usu_modificado_por_id','updatedAt']
                        }
                    },
                    {
                        model: models.Estado,
                        attributes: 
                        {
                            exclude: ['estpa_usu_usuario_creador_id','createdAt','estpa_usu_usuario_modificador_id','updatedAt']
                        }
                    },
                    {
                        model: models.Usuario,
                        attributes: 
                        {
                            exclude: ['usu_usuario_creado_por_id','createdAt','usu_usuario_modificado_por_id','updatedAt']
                        },
                        require: false
                    }
                ]
            });
            

            for (var i = 0; i < listaSocioNegocios.length; i++) 
            {
                // console.log(listaSocioNegocios.rows[i].dataValues)
                var sn_id = listaSocioNegocios[i].dataValues.sn_socios_negocio_id

                const selectVendedores = await sequelize.query(`
                select usn_usu_usuario_id, usu_nombre, usu_usuario_telefono
                from usuarios_socios_de_negocio sn left join usuarios u2 on sn.usn_usu_usuario_id = u2.usu_usuario_id 
                where usn_sn_socio_de_negocio_id = `+sn_id+`
                `,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });

                console.log(listaSocioNegocios[i].dataValues)

                //Si existe concatenara
                if(selectVendedores)
                {
                    listaSocioNegocios[i].dataValues.vendedor = selectVendedores
                }
                //Si no existe mandara null los campos
                else
                {
                    listaSocioNegocios[i].dataValues.vendedor = null
                }
            }

            res.status(200).send({
                message: 'Lista de Socios Negocios',
                listaSocioNegocios
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    getListSociosNegocioByID: async(req, res, next) =>{
        try{
            
            const listaSnbyid = await sequelize.query(`
                select * from socios_negocio sn  
                left join paises p on p.pais_pais_id = sn.sn_pais_id
                left join estados_paises ep  on ep.estpa_pais_pais_id = sn.sn_estado_id 
                left join listas_de_precios ldp on ldp.listp_lista_de_precio_id  = sn.sn_lista_precios  
                left join carrito_de_compras on cdc_sn_socio_de_negocio_id = sn_socios_negocio_id 
                where sn.sn_socios_negocio_id  =  ` + req.params.id, 
            { 
                type: sequelize.QueryTypes.SELECT 
            });
            res.status(200).send({
                message: 'Lista de SN',
                listaSnbyid
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    createSociosNegocio: async(req, res, next) =>{
        try{
            await models.SociosNegocio.create(req.body);
            res.status(200).send({
                message: 'Socio de Negocio creado con exito'
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al crear la Socio de Negocio',
                e
            });
            next(e);
        }
    },
    createOfProfileInB2B: async(req, res, next) =>{
        console.log('JSON', req.body.sn_datos_b2b);
        let temp = JSON.stringify(req.body.sn_datos_b2b);
        try{
            req.body.sn_email_facturacion = req.body.sn_email_facturacion.toLowerCase();
            let socio_negocio = await models.SociosNegocio.create({
                sn_cfdi: req.body.sn_cfdi,
                sn_rfc: req.body.sn_rfc,
                sn_nombre_empresa: req.body.sn_razon_social,
                sn_nombre_comercial: req.body.sn_nombre_comercial,
                sn_direccion_facturacion: req.body.sn_direccion_facturacion,
                sn_razon_social: req.body.sn_razon_social,
                sn_email_facturacion: req.body.sn_email_facturacion,
                sn_pais_id: req.body.sn_pais_id,
                sn_estado_id: req.body.sn_estado_id,
                sn_direccion_empresa: req.body.sn_direccion_facturacion,
                sn_cmm_estatus_id: statusControles.ESTATUS_SOCIOS_NEGOCIO.PENDIENTE,
                sn_cmm_tipo_impuesto: statusControles.TIPO_IMPUESTO['16%'],
                sn_credito_disponible: 0,
                sn_descuento: 0,
                sn_datos_b2b: temp
            });
            if(!!socio_negocio){
                let rol = await models.Rol.findOne({
                    where: {
                        rol_nombre: statusControles.ROLES_SOCIO_NEGOCIO.admin,
                        rol_tipo_rol_id: statusControles.TIPO_ROL_MENU.SOCIO_DE_NEGOCIO
                    }
                });
                let pass = generadorPassword(8);
                await nuevoUsuario(socio_negocio.dataValues.sn_email_facturacion, pass);
                let passEncriptada = await bcrypt.hash(pass, 10);
                let menu = await String(JSON.stringify(super_user));
                let socio_negocio_usuario = await models.SociosNegocioUsuario.create({
                    snu_nombre: req.body.sn_nombre_comercial,
                    snu_primer_apellido: req.body.sn_razon_social,
                    snu_correo_electronico: req.body.sn_email_facturacion,
                    snu_direccion: req.body.snu_direccion,
                    snu_usuario: req.body.sn_rfc,
                    snu_contrasenia: passEncriptada,
                    snu_cmm_estatus_id: statusControles.ESTATUS_SOCIOS_NEGOCIO_USUARIO.ACTIVA,
                    snu_rol_rol_id: rol.dataValues.rol_rol_id,
                    snu_sn_socio_de_negocio_id: socio_negocio.dataValues.sn_socios_negocio_id,
                    snu_menu_roles: menu
                });
                let direccion_socio_negocio = await models.SociosNegocioDirecciones.create({
                    snd_pais_id : req.body.sn_pais_id,
                    snd_colonia: req.body.snd_colonia,
                    snd_estado_id : req.body.sn_estado_id,
                    snd_ciudad : req.body.snd_ciudad,
                    snd_direccion : req.body.snd_direccion,
                    snd_direccion_num_ext : req.body.snd_direccion_num_ext,
                    snd_codigo_postal : req.body.snd_codigo_postal,
                    snd_sn_socio_de_negocio_id : socio_negocio.dataValues.sn_socios_negocio_id
                })
                if(!!socio_negocio_usuario && !!direccion_socio_negocio){

                    res.status(200).send({
                        message: 'Socio de negocio y Usuario maestro creado con exito'
                    });
                }else{
                    await models.SociosNegocio.destroy({
                        where: {
                            sn_socios_negocio_id: socio_negocio.dataValues.sn_socios_negocio_id
                        }
                    });
                    await models.SociosNegocioUsuario.destroy({
                        where: {
                            snu_sn_socio_de_negocio_id: socio_negocio.dataValues.sn_socios_negocio_id
                        }
                    });
                    await models.SociosNegocioDirecciones.destroy({
                        where:{
                            snd_sn_socio_de_negocio_id : socio_negocio.dataValues.sn_socios_negocio_id
                        }
                    });
                    res.status(300).send({
                        message: 'Ocurrio un error al crear el usuario maestro.'
                    });
                }
            }else{
                res.status(300).send({
                    message: 'Error al crear socio de negocio'
                });
            }
        }catch(e){
            console.log(e)
            res.status(500).send({
                message: 'Error al procesar el formulario',
                e
            }),
            next(e);
        }
    },
    updateSociosNegocio: async(req, res, next) =>{
        try{
            const SNUpdate = await models.SociosNegocio.findOne({
                where: {
                    sn_socios_negocio_id : req.body.sn_socios_negocio_id
                }
            });
            await SNUpdate.update({
                sn_cfdi: !!req.body.sn_cfdi ? req.body.sn_cfdi : SNUpdate.dataValues.sn_cfdi,
                sn_rfc: !!req.body.sn_rfc ? req.body.sn_rfc : SNUpdate.dataValues.sn_rfc,
                sn_cardcode: !!req.body.sn_cardcode ? req.body.sn_cardcode : SNUpdate.dataValues.sn_cardcode,
                sn_credito: !!req.body.sn_credito ? req.body.sn_credito : SNUpdate.dataValues.sn_credito,
                sn_moneda: !!req.body.sn_moneda ? req.body.sn_moneda : SNUpdate.dataValues.sn_moneda,
                sn_nombre_empresa: !!req.body.sn_nombre_empresa ? req.body.sn_nombre_empresa : SNUpdate.dataValues.sn_nombre_empresa,
                sn_tax: !!req.body.sn_tax ? req.body.sn_tax : SNUpdate.dataValues.sn_tax,
                sn_direccion_facturacion: !!req.body.sn_direccion_facturacion ? req.body.sn_direccion_facturacion : SNUpdate.dataValues.sn_direccion_facturacion,
                sn_razon_social: !!req.body.sn_razon_social ? req.body.sn_razon_social : SNUpdate.dataValues.sn_razon_social,
                sn_nombre_comercial: !!req.body.sn_nombre_comercial ? req.body.sn_nombre_comercial : SNUpdate.dataValues.sn_nombre_comercial,
                sn_email_facturacion: !!req.body.sn_email_facturacion ? req.body.sn_email_facturacion : SNUpdate.dataValues.sn_email_facturacion,
                sn_telefono_empresa: !!req.body.sn_telefono_empresa ? req.body.sn_telefono_empresa : SNUpdate.dataValues.sn_telefono_empresa,
                sn_pais_id: !!req.body.sn_pais_id ? req.body.sn_pais_id : SNUpdate.dataValues.sn_pais_id,
                sn_estado_id: !!req.body.sn_estado_id ? req.body.sn_estado_id : SNUpdate.dataValues.sn_estado_id,
                sn_direccion_empresa: !!req.body.sn_direccion_empresa ? req.body.sn_direccion_empresa : SNUpdate.dataValues.sn_direccion_empresa,
                sn_lista_precios: !!req.body.sn_lista_precios ? req.body.sn_lista_precios : SNUpdate.dataValues.sn_lista_precios,
                sn_descripcion_empresa: !!req.body.sn_descripcion_empresa ? req.body.sn_descripcion_empresa : SNUpdate.dataValues.sn_descripcion_empresa,
                sn_almacen_asignado: !!req.body.sn_almacen_asignado ? req.body.sn_almacen_asignado : SNUpdate.dataValues.sn_almacen_asignado,
                sn_usu_usuario_modificado_id: !!req.body.sn_usu_usuario_modificado_id ? req.body.sn_usu_usuario_modificado_id : SNUpdate.dataValues.sn_usu_usuario_modificado_id,
                sn_cmm_estatus_id: !!req.body.sn_cmm_estatus_id ? req.body.sn_cmm_estatus_id : SNUpdate.dataValues.sn_cmm_estatus_id,
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
    deleteSociosNegocio: async(req, res, next) =>
    {
        try{
            const deleteSocioNegocio = await models.SociosNegocio.findOne({
                where: {
                    sn_socios_negocio_id : req.body.sn_socios_negocio_id
                }
            });
            await deleteSocioNegocio.update(
            {
              sn_cmm_estatus_id : statusControles.ESTATUS_SOCIOS_NEGOCIO.ELIMINADA,
              sn_usu_usuario_modificado_id: req.body.sn_usu_usuario_modificado_id,
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
    getListSociosNegocioPaginada: async(req, res, next) =>{
        try{
            
            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit

            const listaSocioNegocios = await models.SociosNegocio.findAndCountAll(
            {
                where: {
                    sn_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_SOCIOS_NEGOCIO.ELIMINADA } 
                },
                limit: varlimit,
                offset: varoffset,
                include: 
                [
                    {
                        model: models.Pais,
                        attributes: 
                        {
                            exclude: ['pais_usu_usuario_creador_id','createdAt','pais_usu_modificado_por_id','updatedAt']
                        }
                    },
                    {
                        model: models.Estado,
                        attributes: 
                        {
                            exclude: ['estpa_usu_usuario_creador_id','createdAt','estpa_usu_usuario_modificador_id','updatedAt']
                        }
                    },
                    {
                        model: models.Usuario,
                        attributes: 
                        {
                            exclude: ['usu_usuario_creado_por_id','createdAt','usu_usuario_modificado_por_id','updatedAt']
                        },
                        require: false
                    }
                ]
            });
            

            for (var i = 0; i < listaSocioNegocios.rows.length; i++) 
            {
                // console.log(listaSocioNegocios.rows[i].dataValues)
                var sn_id = listaSocioNegocios.rows[i].dataValues.sn_socios_negocio_id

                const selectVendedores = await sequelize.query(`
                select usn_usu_usuario_id, usu_nombre, usu_usuario_telefono
                from usuarios_socios_de_negocio sn left join usuarios u2 on sn.usn_usu_usuario_id = u2.usu_usuario_id 
                where usn_sn_socio_de_negocio_id = `+sn_id+`
                `,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });

                console.log(listaSocioNegocios.rows[i].dataValues)

                //Si existe concatenara
                if(selectVendedores)
                {
                    listaSocioNegocios.rows[i].dataValues.vendedor = selectVendedores
                }
                //Si no existe mandara null los campos
                else
                {
                    listaSocioNegocios.rows[i].dataValues.vendedor = null
                }
            }

            res.status(200).send({
                message: 'Lista de Socios Negocios',
                listaSocioNegocios
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    getListSociosNegocioPaginadaByCardCode: async(req, res, next) =>{
        try{
            
            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit

            const listaSocioNegocios = await models.SociosNegocio.findAndCountAll(
            {
                where: {
                    sn_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_SOCIOS_NEGOCIO.ELIMINADA },
                    sn_cardcode: {
                        [Op.like]: '%'+req.body.sn_cardcode+'%'
                    }
                },
                limit: varlimit,
                offset: varoffset,
                include: 
                [
                    {
                        model: models.Pais,
                        attributes: 
                        {
                            exclude: ['pais_usu_usuario_creador_id','createdAt','pais_usu_modificado_por_id','updatedAt']
                        }
                    },
                    {
                        model: models.Estado,
                        attributes: 
                        {
                            exclude: ['estpa_usu_usuario_creador_id','createdAt','estpa_usu_usuario_modificador_id','updatedAt']
                        }
                    },
                    {
                        model: models.Usuario,
                        attributes: 
                        {
                            exclude: ['usu_usuario_creado_por_id','createdAt','usu_usuario_modificado_por_id','updatedAt']
                        },
                        require: false
                    }
                ]
            });
            
            
            for (var i = 0; i < listaSocioNegocios.rows.length; i++) 
            {
                // console.log(listaSocioNegocios.rows[i].dataValues)
                var sn_id = listaSocioNegocios.rows[i].dataValues.sn_socios_negocio_id

                const selectVendedores = await sequelize.query(`
                select usn_usu_usuario_id, usu_nombre, usu_usuario_telefono
                from usuarios_socios_de_negocio sn left join usuarios u2 on sn.usn_usu_usuario_id = u2.usu_usuario_id 
                where usn_sn_socio_de_negocio_id = `+sn_id+`
                `,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });

                console.log(listaSocioNegocios.rows[i].dataValues)

                //Si existe concatenara
                if(selectVendedores)
                {
                    listaSocioNegocios.rows[i].dataValues.vendedor = selectVendedores
                }
                //Si no existe mandara null los campos
                else
                {
                    listaSocioNegocios.rows[i].dataValues.vendedor = null
                }
            }

            res.status(200).send({
                message: 'Lista de Socios Negocios',
                listaSocioNegocios
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    getListSociosNegocioPaginadaByVendedor: async(req, res, next) =>{
        try{
            
            var varlimit = req.body.limite
            var varoffset = 0 + (req.body.pagina) * varlimit



            var id_vendedor = req.body.usn_usu_usuario_id

            //Busca los cardcodes de los vendedores
            const selectVendedores = await sequelize.query(`
                select usn_usu_usuario_id, usn_sn_socio_de_negocio_id, sn2.sn_cardcode
                from usuarios_socios_de_negocio usn
                left join usuarios u2 on usn.usn_usu_usuario_id = u2.usu_usuario_id 
                left join socios_negocio sn2 on sn_socios_negocio_id = usn.usn_sn_socio_de_negocio_id 
                where usn_usu_usuario_id = `+id_vendedor+`
            `,
            { 
                type: sequelize.QueryTypes.SELECT 
            });



            var listaCardCodes = '';
            for (var i = 0; i < selectVendedores.length; i++) 
            {
                //console.log(ListaDeVendedoresYSuCardcode[i])


                listaCardCodes = listaCardCodes + "'"+  selectVendedores[i].sn_cardcode  + "'"

                //console.log(ListaDeVendedoresYSuCardcode.length)

                if(i+1 < selectVendedores.length)
                {
                    listaCardCodes = listaCardCodes + ","
                }
                else
                {
                    
                }

            }

            const listaSocioNegocios = await models.SociosNegocio.findAndCountAll(
            {
                where: {
                    sn_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_SOCIOS_NEGOCIO.ELIMINADA },
                    [Op.or]: [
                        Sequelize.literal("sn_cardcode in (" + listaCardCodes + ")"),
                    ]
                },
                limit: varlimit,
                offset: varoffset,
                include: 
                [
                    {
                        model: models.Pais,
                        attributes: 
                        {
                            exclude: ['pais_usu_usuario_creador_id','createdAt','pais_usu_modificado_por_id','updatedAt']
                        }
                    },
                    {
                        model: models.Estado,
                        attributes: 
                        {
                            exclude: ['estpa_usu_usuario_creador_id','createdAt','estpa_usu_usuario_modificador_id','updatedAt']
                        }
                    },
                    {
                        model: models.Usuario,
                        attributes: 
                        {
                            exclude: ['usu_usuario_creado_por_id','createdAt','usu_usuario_modificado_por_id','updatedAt']
                        },
                        require: false
                    }
                ]
            });
            
            
            for (var i = 0; i < listaSocioNegocios.rows.length; i++) 
            {
                // console.log(listaSocioNegocios.rows[i].dataValues)
                var sn_id = listaSocioNegocios.rows[i].dataValues.sn_socios_negocio_id

                const selectVendedores = await sequelize.query(`
                select usn_usu_usuario_id, usu_nombre, usu_usuario_telefono
                from usuarios_socios_de_negocio sn left join usuarios u2 on sn.usn_usu_usuario_id = u2.usu_usuario_id 
                where usn_sn_socio_de_negocio_id = `+sn_id+`
                `,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });

                console.log(listaSocioNegocios.rows[i].dataValues)

                //Si existe concatenara
                if(selectVendedores)
                {
                    listaSocioNegocios.rows[i].dataValues.vendedor = selectVendedores
                }
                //Si no existe mandara null los campos
                else
                {
                    listaSocioNegocios.rows[i].dataValues.vendedor = null
                }
            }

            res.status(200).send({
                message: 'Lista de Socios Negocios',
                listaSocioNegocios
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
 


    updateSociosNegocioSNToken: async(req, res, next) =>{
        try{
            const SNUpdate = await models.SociosNegocio.findOne({
                where: {
                    sn_socios_negocio_id : req.body.sn_socios_negocio_id
                }
            });
            await SNUpdate.update({
                sn_cfdi: !!req.body.sn_cfdi ? req.body.sn_cfdi : SNUpdate.dataValues.sn_cfdi,
                sn_rfc: !!req.body.sn_rfc ? req.body.sn_rfc : SNUpdate.dataValues.sn_rfc,
                sn_cardcode: !!req.body.sn_cardcode ? req.body.sn_cardcode : SNUpdate.dataValues.sn_cardcode,
                sn_credito: !!req.body.sn_credito ? req.body.sn_credito : SNUpdate.dataValues.sn_credito,
                sn_moneda: !!req.body.sn_moneda ? req.body.sn_moneda : SNUpdate.dataValues.sn_moneda,
                sn_nombre_empresa: !!req.body.sn_nombre_empresa ? req.body.sn_nombre_empresa : SNUpdate.dataValues.sn_nombre_empresa,
                sn_tax: !!req.body.sn_tax ? req.body.sn_tax : SNUpdate.dataValues.sn_tax,
                sn_direccion_facturacion: !!req.body.sn_direccion_facturacion ? req.body.sn_direccion_facturacion : SNUpdate.dataValues.sn_direccion_facturacion,
                sn_razon_social: !!req.body.sn_razon_social ? req.body.sn_razon_social : SNUpdate.dataValues.sn_razon_social,
                sn_nombre_comercial: !!req.body.sn_nombre_comercial ? req.body.sn_nombre_comercial : SNUpdate.dataValues.sn_nombre_comercial,
                sn_email_facturacion: !!req.body.sn_email_facturacion ? req.body.sn_email_facturacion : SNUpdate.dataValues.sn_email_facturacion,
                sn_telefono_empresa: !!req.body.sn_telefono_empresa ? req.body.sn_telefono_empresa : SNUpdate.dataValues.sn_telefono_empresa,
                sn_pais_id: !!req.body.sn_pais_id ? req.body.sn_pais_id : SNUpdate.dataValues.sn_pais_id,
                sn_estado_id: !!req.body.sn_estado_id ? req.body.sn_estado_id : SNUpdate.dataValues.sn_estado_id,
                sn_direccion_empresa: !!req.body.sn_direccion_empresa ? req.body.sn_direccion_empresa : SNUpdate.dataValues.sn_direccion_empresa,
                sn_lista_precios: !!req.body.sn_lista_precios ? req.body.sn_lista_precios : SNUpdate.dataValues.sn_lista_precios,
                sn_descripcion_empresa: !!req.body.sn_descripcion_empresa ? req.body.sn_descripcion_empresa : SNUpdate.dataValues.sn_descripcion_empresa,
                sn_almacen_asignado: !!req.body.sn_almacen_asignado ? req.body.sn_almacen_asignado : SNUpdate.dataValues.sn_almacen_asignado,
                sn_usu_usuario_modificado_id: !!req.body.sn_usu_usuario_modificado_id ? req.body.sn_usu_usuario_modificado_id : SNUpdate.dataValues.sn_usu_usuario_modificado_id,
                sn_cmm_estatus_id: !!req.body.sn_cmm_estatus_id ? req.body.sn_cmm_estatus_id : SNUpdate.dataValues.sn_cmm_estatus_id,
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


    getListSociosNegocioByID_SN_TOKEN: async(req, res, next) =>{
        try{
            
            const listaSnbyid = await sequelize.query(`
                select sn.*, cp.*  from socios_negocio sn  
                left join paises p on p.pais_pais_id = sn.sn_pais_id
                left join estados_paises ep  on ep.estpa_pais_pais_id = sn.sn_estado_id 
                left join listas_de_precios ldp on ldp.listp_lista_de_precio_id  = sn.sn_lista_precios  
                left join carrito_de_compras cp on cp.cdc_sn_socio_de_negocio_id = sn.sn_socios_negocio_id
                where sn.sn_socios_negocio_id  =  ` + req.params.id, 
                
            { 
                type: sequelize.QueryTypes.SELECT 
            });
            res.status(200).send({
                message: 'Lista de SN',
                listaSnbyid
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