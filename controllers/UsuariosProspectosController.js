import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const {registerNewClientEmail} = require('../services/registerNewClientEmail');

export default {
   

    createProspecto: async(req, res, next) =>{
        var borrarUsuarioProspectoEnCasoDeFallo = null
        try
        {
            const constUsuariosProspectos = await models.UsuariosProspectos.findAll(
            {
                where: {
                    up_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_USUARIOS_PROSPECTOS.ELIMINADA },
                    up_email_facturacion: req.body.up_email_facturacion
                }
            });

            if(constUsuariosProspectos.length > 0)
            {
                res.status(500).send(
                {
                    message: 'Prospecto ya existe'
                })
            }
            else
            {   
                req.body.up_sitio_web = req.body.up_datos_b2b.up_sitio_web
                req.body.up_numero_cuenta_banco = req.body.up_datos_b2b.up_numero_cuenta_banco
                req.body.up_nombre_banco = req.body.up_datos_b2b.up_nombre_banco
                req.body.up_forma_pago = req.body.up_datos_b2b.up_forma_pago
                req.body.up_medio_pago = req.body.up_datos_b2b.up_medio_pago

                const constUsuariosProspectos = await models.UsuariosProspectos.create(req.body)
                borrarUsuarioProspectoEnCasoDeFallo = constUsuariosProspectos.dataValues.up_usuarios_prospectos_id


                var bodyCreate = {
                    "upd_pais_id": req.body.up_pais_id,
                    "upd_estado_id": req.body.up_estado_id,
                    "upd_ciudad": req.body.up_ciudad,
                    "upd_direccion": req.body.up_direccion,
                    "upd_direccion_num_ext": req.body.up_direccion_num_ext,
                    "upd_direccion_num_int": req.body.upd_direccion_num_int,
                    "upd_direccion_telefono": 'NA',
                    "upd_calle1": req.body.upd_calle1,
                    "upd_calle2": req.body.upd_calle2,
                    "upd_codigo_postal": req.body.up_codigo_postal,
                    "upd_colonia": req.body.up_colonia,
                    "upd_up_usuarios_prospectos_id": constUsuariosProspectos.dataValues.up_usuarios_prospectos_id,
                    "upd_alias": req.body.upd_alias,
                    "upd_contacto": req.body.upd_contacto,
                    "upd_telefono": req.body.upd_telefono
                };
                     
                await models.UsuariosProspectosDirecciones.create(bodyCreate);

                await registerNewClientEmail(req.body);
                
                res.status(200).send(
                {
                    message: 'Prospecto creado con exito',
                    up_usuarios_prospectos_id: constUsuariosProspectos.dataValues.up_usuarios_prospectos_id
                })
            }
        }
        catch(e)
        {
            await models.UsuariosProspectos.destroy({
                where: {
                    up_usuarios_prospectos_id: borrarUsuarioProspectoEnCasoDeFallo
                }
            });

            res.status(500).send(
            {
              message: 'Error al crear Prospecto',
              e
            });

            next(e);
        }
    },
    getListProspectos: async(req, res, next) =>{
        try{
            const constUsuariosProspectos = await models.UsuariosProspectos.findAll(
                {
                    where: {
                        up_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_USUARIOS_PROSPECTOS.ELIMINADA }
                    }
                });
            res.status(200).send({
                message: 'Lista de Prospectos',
                constUsuariosProspectos
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
    getDetalleProspectos: async(req, res, next) =>{
        try{
            const constUsuariosProspectos = await models.UsuariosProspectos.findOne(
            {
                where: {
                    up_cmm_estatus_id: { [Op.ne] : statusControles.ESTATUS_USUARIOS_PROSPECTOS.ELIMINADA },
                    up_usuarios_prospectos_id: req.params.id
                }
            });

            const constUsuariosProspectosDirecciones = await models.UsuariosProspectosDirecciones.findAll(
            {
                where: {
                    upd_up_usuarios_prospectos_id: req.params.id
                }
            });

            constUsuariosProspectos.dataValues.DireccionesProspectos = constUsuariosProspectosDirecciones


            res.status(200).send({
                message: 'Lista de Prospectos',
                constUsuariosProspectos
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    updateProspectos: async(req, res, next) =>{
        try{
            const constUsuariosProspectos = await models.UsuariosProspectos.findOne({
                where: {
                    up_usuarios_prospectos_id: req.body.up_usuarios_prospectos_id
                }
            });

            await constUsuariosProspectos.update({
                up_razon_social : !!req.body.up_razon_social ? req.body.up_razon_social : constUsuariosProspectos.dataValues.up_razon_social,
                up_nombre_comercial : !!req.body.up_nombre_comercial ? req.body.up_nombre_comercial : constUsuariosProspectos.dataValues.up_nombre_comercial,
                up_rfc : !!req.body.up_rfc ? req.body.up_rfc : constUsuariosProspectos.dataValues.up_rfc,
                up_email_facturacion : !!req.body.up_email_facturacion ? req.body.up_email_facturacion : constUsuariosProspectos.dataValues.up_email_facturacion,
                up_direccion_facturacion : !!req.body.up_direccion_facturacion ? req.body.up_direccion_facturacion : constUsuariosProspectos.dataValues.up_direccion_facturacion,
                up_codigo_postal : !!req.body.up_codigo_postal ? req.body.up_codigo_postal : constUsuariosProspectos.dataValues.up_codigo_postal,
                up_direccion : !!req.body.up_direccion ? req.body.up_direccion : constUsuariosProspectos.dataValues.up_direccion,
                up_direccion_num_ext : !!req.body.up_direccion_num_ext ? req.body.up_direccion_num_ext : constUsuariosProspectos.dataValues.up_direccion_num_ext,
                up_colonia : !!req.body.up_colonia ? req.body.up_colonia : constUsuariosProspectos.dataValues.up_colonia,
                up_ciudad : !!req.body.up_ciudad ? req.body.up_ciudad : constUsuariosProspectos.dataValues.up_ciudad,
                up_pais_id : !!req.body.up_pais_id ? req.body.up_pais_id : constUsuariosProspectos.dataValues.up_pais_id,
                up_estado_id : !!req.body.up_estado_id ? req.body.up_estado_id : constUsuariosProspectos.dataValues.up_estado_id,
                up_cfdi : !!req.body.up_cfdi ? req.body.up_cfdi : constUsuariosProspectos.dataValues.up_cfdi,
                up_datos_b2b : !!req.body.up_datos_b2b ? req.body.alm_nup_datos_b2bombre : constUsuariosProspectos.dataValues.up_datos_b2b,
                up_sitio_web : !!req.body.up_datos_b2b.up_sitio_web ? req.body.up_datos_b2b.up_sitio_web : constUsuariosProspectos.dataValues.up_sitio_web,
                up_numero_cuenta_banco : !!req.body.up_datos_b2b.up_numero_cuenta_banco ? req.body.up_datos_b2b.up_numero_cuenta_banco : constUsuariosProspectos.dataValues.up_numero_cuenta_banco,
                up_nombre_banco : !!req.body.up_datos_b2b.up_nombre_banco ? req.body.up_datos_b2b.up_nombre_banco : constUsuariosProspectos.dataValues.up_nombre_banco,
                up_forma_pago : !!req.body.up_datos_b2b.up_forma_pago ? req.body.up_datos_b2b.up_forma_pago : constUsuariosProspectos.dataValues.up_forma_pago,
                up_medio_pago : !!req.body.up_datos_b2b.up_medio_pago ? req.body.up_datos_b2b.up_medio_pago : constUsuariosProspectos.dataValues.up_medio_pago,
                up_cmm_estatus_id : !!req.body.up_cmm_estatus_id ? req.body.up_cmm_estatus_id : constUsuariosProspectos.dataValues.up_cmm_estatus_id,
                up_usu_usuario_modificado_id : !!req.body.up_usu_usuario_modificado_id ? req.body.up_usu_usuario_modificado_id : constUsuariosProspectos.dataValues.up_usu_usuario_modificado_id,
                updatedAt: Date()
            });


            res.status(200).send({
                message: 'Actualización correcta',
                constUsuariosProspectos
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al actualizar',
                error: e
            });
            next(e);
        }
    },
    deleteProspectos: async(req, res, next) =>{
        try{
            const constUsuariosProspectos = await models.UsuariosProspectos.findOne({
                where: {
                    up_usuarios_prospectos_id: req.body.up_usuarios_prospectos_id
                }
            });

            await constUsuariosProspectos.update(
            {
                up_cmm_estatus_id : statusControles.ESTATUS_USUARIOS_PROSPECTOS.ELIMINADA,
                up_usu_usuario_modificado_id: req.body.up_usu_usuario_modificado_id,
                updatedAt: Date()
            })

            res.status(200).send({
                message: 'Eliminado correctamente'
            });

            }
            catch(e){
            res.status(500).send({
                message: 'Error al eliminar',
                e
            });
            next(e);
        }
    },


 









}