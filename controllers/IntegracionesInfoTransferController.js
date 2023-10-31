import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import request from 'request-promise';
import email_validator from 'email-validator';
const {ordenAbiertaCreadaEmail} = require('../services/ordenAbiertaCreadaEmail');
const {ordenCreadaUsuarioDielsaEmail} = require('../services/ordenCreadaUsuarioDielsaEmail');
const {ordenFallidaToSapEmail} = require('../services/ordenFallidaToSapEmail');

const {lineasTransitoEmail} = require('../services/lineasTransitoEmail');
const {lineasEntregaEmail} = require('../services/lineasEntregaEmail');

//Integrar SN a SNU y mandar usuarios correo contraseña nueva
import bcrypt from 'bcryptjs';
const { nuevoUsuario } = require('../services/nuevoClienteB2B');
// Si se modifica en sociosnegociousuario este tambien tiene que ser modificado
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
const generadorPassword = function(num){
    const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result1= '';
    const charactersLength = characters.length;
    for ( let i = 0; i < num; i++ ) {
        result1 += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result1;
}

export default {
    
    //Integra el tipo de cambio de SAP
    IntegracionInfoTransferTipoCambioUSD: async(req, res, next) =>{
        try{
            var d = new Date();
            var dia = d.getDate();
            var mes = d.getMonth() + 1;
            var año = d.getYear() + 1900;

            console.log(dia)
            console.log(mes)
            console.log(año)

            if(mes < 10)
            {
                mes = "0"+mes;
            }
            if(dia < 10)
            {
                dia = "0"+dia;
            }

            var fechaTotal = año.toString()+mes.toString()+dia.toString();

            //REQUEST DE LA API Y DATOS DE RETORNO
                var options = {
                    'method': 'GET',
                    'url': process.env.INTEGRATIONS_URL + '/Service1.svc/TipoCambio/' + fechaTotal,
                    'headers': {
                        'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                    } 
                };
                var result = await request(options, function (error, response) 
                {
                    if (error) throw new Error(error);
                });
                var resultJson = JSON.parse(result);


            //FIN RETORN REQUEST

            //Si Estatus es 2 Significa que la API trajo datos
            if(resultJson.estatus == 2)
            {
                var jsonApi = resultJson.tiposCambio;

                if(jsonApi.length > 0)
                {

                    //obtener tipo de cambio cmm
                    const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
                    {
                        where: {
                            cmm_nombre: "TIPO_CAMBIO_USD"
                        }
                    });

                    //Actualizar el tipo de cambio valor
                    await constControlMaestroMultiple.update({
                        cmm_valor: jsonApi[0].tipoCambio,
                        updatedAt: Date()
                    });

                    //Response
                    res.status(200).send(
                    {
                        message: 'Actualizado el tipo del cambio al dia: ' + fechaTotal,
                        cambio: jsonApi[0].tipoCambio
                    })

                }
                else
                {
                    //Response
                    res.status(500).send(
                    {
                        message: 'Actualizar el tipo de cambio en SAP del dia: ' + fechaTotal,
                    })
                }
            }
            else
            {
                //Response
                res.status(500).send(
                {
                    message: 'La peticion SAP Retorno Error',
                })
            }
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },   

    //Transfiere la informacion de la tabla raw SN a la SN pcp
    IntegracionInfoTransferSociosNegocios: async(req, res, next) =>{
        try{

            //Carga todos los registros desde la tabla RAW
            const constRawSociosNegocios = await models.RawSociosNegocios.findAll({
            });

            for (var i = 0; i < constRawSociosNegocios.length; i++) 
            {
                //console.log(constRawSociosNegocios[i].dataValues.codigoCliente)

                //Buscar Socio de negocios en tabla PCP
                const costSociosNegocios = await models.SociosNegocio.findOne(
                {
                    where: {
                        sn_cardcode: constRawSociosNegocios[i].dataValues.codigoCliente
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });


                //Busca la direccion de facturacion del SN en la tabla raw sn Direcciones
                const costRawSociosNegociosDirecciones = await models.RawSociosNegociosDirecciones.findOne(
                {
                    where: {
                        codigoClientePadre: constRawSociosNegocios[i].dataValues.codigoCliente,
                        idDireccion: constRawSociosNegocios[i].dataValues.idDireccionB,
                        tipoDir: "B"
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });


                //Variables Direccion Facturacion / Si no existe lo dejara vacio para evitar problemas de que una varible no exista
                    var direccionFacturacion;
                    if(costRawSociosNegociosDirecciones)
                    {
                        direccionFacturacion = costRawSociosNegociosDirecciones.dataValues.calle + " " + costRawSociosNegociosDirecciones.dataValues.colonia + " " +  costRawSociosNegociosDirecciones.dataValues.ciudad + " " + costRawSociosNegociosDirecciones.dataValues.codigoPostal + " " + costRawSociosNegociosDirecciones.dataValues.pais;
                    }
                    else
                    {
                        direccionFacturacion = "";
                    }
                //Fin variables direccion

                //Variable para estatus del cliente tomado desde los mapeos cmm
                    var StatusSN;

                    //Estatus del cliente desde sap
                        if(constRawSociosNegocios[i].dataValues.activo == "Y"){
                            StatusSN = statusControles.ESTATUS_SOCIOS_NEGOCIO.ACTIVA;
                        }
                        else{
                            StatusSN = statusControles.ESTATUS_SOCIOS_NEGOCIO.INACTIVA;
                        }
                //FIn estatus SN

                //Buscar el ID del pais de la tabla raw SN
                const costPaisGetID = await models.Pais.findOne(
                {
                    where: {
                        pais_abreviatura: constRawSociosNegocios[i].dataValues.pais
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });

                if(costPaisGetID)
                {
                    var PaisId = costPaisGetID.pais_pais_id;
                }
                else
                {
                    var PaisId = 52;
                }
               

                //Buscar el id del estado de la tabla raw SN
                const costEstadoGetID = await models.Estado.findOne(
                {
                    where: {
                        estpa_codigo_estado: constRawSociosNegocios[i].dataValues.estado
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });



                if(costEstadoGetID)
                {
                    var EstadoId = costEstadoGetID.estpa_estado_pais_id;
                }
                else
                {
                    var EstadoId = 1;
                }

                //console.log(EstadoId)

                // Actualizar BD
                if(costSociosNegocios) 
                {
                    const bodyUpdate = {
                        "sn_socios_negocio_id": costSociosNegocios.dataValues.sn_socios_negocio_id,
                        "sn_cfdi": constRawSociosNegocios[i].dataValues.usoCfdi,
                        "sn_rfc": constRawSociosNegocios[i].dataValues.rfc,
                        "sn_cardcode": costSociosNegocios.dataValues.sn_cardcode,
                        "sn_credito": constRawSociosNegocios[i].dataValues.limiteCredito,
                        "sn_moneda": "MXP",
                        "sn_nombre_empresa": constRawSociosNegocios[i].dataValues.razonSocial,
                        "sn_tax": costSociosNegocios.dataValues.sn_tax,
                        "sn_direccion_facturacion": direccionFacturacion,
                        "sn_razon_social": constRawSociosNegocios[i].dataValues.razonSocial,
                        "sn_nombre_comercial": constRawSociosNegocios[i].dataValues.nombreComercial,
                        "sn_email_facturacion": constRawSociosNegocios[i].dataValues.email,
                        "sn_telefono_empresa": costSociosNegocios.dataValues.sn_telefono_empresa,
                        "sn_pais_id": PaisId,
                        "sn_estado_id": EstadoId,
                        "sn_direccion_empresa": costSociosNegocios.dataValues.sn_direccion_empresa,
                        "sn_lista_precios": constRawSociosNegocios[i].dataValues.codigoListaPrecios,
                        "sn_descripcion_empresa": costSociosNegocios.dataValues.sn_descripcion_empresa,
                        "sn_cmm_estatus_id": StatusSN,
                        "sn_almacen_asignado": costSociosNegocios.dataValues.sn_almacen_asignado,
                        "sn_usu_usuario_modificado_id": 1,
                        "sn_cmm_tipo_impuesto": costSociosNegocios.dataValues.sn_cmm_tipo_impuesto,
                        "sn_credito_disponible": constRawSociosNegocios[i].dataValues.creditoDisponible,
                        "sn_vendedor_codigo_sap": constRawSociosNegocios[i].dataValues.codigoVendedor,
                        "sn_condiciones_credito": constRawSociosNegocios[i].dataValues.condicionesCredito,
                        "sn_almacen_asignado": constRawSociosNegocios[i].dataValues.almacen,
                        "sn_codigo_direccion_facturacion": constRawSociosNegocios[i].dataValues.idDireccionB,
                        "sn_codigo_grupo": constRawSociosNegocios[i].dataValues.codigoGrupo,
                        "sn_porcentaje_descuento_total": constRawSociosNegocios[i].dataValues.procentajeDescuentoTotal,
                        "sn_prop_10": constRawSociosNegocios[i].dataValues.prop10,
                        updatedAt: Date()
                    }
                    
                    await costSociosNegocios.update(bodyUpdate);

                }
                else //Crear
                {
                    const bodyCreate = {
                        "sn_cfdi": constRawSociosNegocios[i].dataValues.usoCfdi,
                        "sn_rfc": constRawSociosNegocios[i].dataValues.rfc,
                        "sn_cardcode": constRawSociosNegocios[i].dataValues.codigoCliente,
                        "sn_credito": constRawSociosNegocios[i].dataValues.limiteCredito,
                        "sn_moneda": 'MXP',
                        "sn_nombre_empresa": constRawSociosNegocios[i].dataValues.razonSocial,
                        "sn_tax": 'NA',
                        "sn_direccion_facturacion": direccionFacturacion,
                        "sn_razon_social": constRawSociosNegocios[i].dataValues.razonSocial,
                        "sn_nombre_comercial": constRawSociosNegocios[i].dataValues.nombreComercial,
                        "sn_email_facturacion": constRawSociosNegocios[i].dataValues.email,
                        "sn_telefono_empresa": 'NA',
                        "sn_pais_id": PaisId,
                        "sn_estado_id": EstadoId,
                        "sn_direccion_empresa": '',
                        "sn_lista_precios": constRawSociosNegocios[i].dataValues.codigoListaPrecios,
                        "sn_descripcion_empresa": 'NA',
                        "sn_cmm_estatus_id": StatusSN,
                        "sn_almacen_asignado": 'NA',
                        "sn_usu_usuario_creador_id": 1,
                        "sn_cmm_tipo_impuesto": 1000085,
                        "sn_descuento": 0,
                        "sn_credito_disponible": constRawSociosNegocios[i].dataValues.creditoDisponible,
                        "sn_vendedor_codigo_sap": constRawSociosNegocios[i].dataValues.codigoVendedor,
                        "sn_condiciones_credito": constRawSociosNegocios[i].dataValues.condicionesCredito,
                        "sn_almacen_asignado": constRawSociosNegocios[i].dataValues.almacen,
                        "sn_codigo_direccion_facturacion": constRawSociosNegocios[i].dataValues.idDireccionB,
                        "sn_codigo_grupo": constRawSociosNegocios[i].dataValues.codigoGrupo,
                        "sn_porcentaje_descuento_total": constRawSociosNegocios[i].dataValues.procentajeDescuentoTotal,
                        "sn_prop_10": constRawSociosNegocios[i].dataValues.prop10
                    };
                         
                    await models.SociosNegocio.create(bodyCreate);
                }
            }

            //Response
            res.status(200).send(
            {
                message: 'Integracion Transfer SN Correcta'
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    //Transfiere la informacion de la tabla raw SN a la SN pcp SOLO UNO
    IntegracionInfoTransferSociosNegociosOnlyOne: async(req, res, next) =>{
        try{


            //Carga todos los registros desde la tabla RAW
            const constRawSociosNegocios = await models.RawSociosNegocios.findAll({
                where: {
                    codigoCliente: req.body.factor_integracion
                },    
            });

            for (var i = 0; i < constRawSociosNegocios.length; i++) 
            {
                //console.log(constRawSociosNegocios[i].dataValues.codigoCliente)

                //Buscar Socio de negocios en tabla PCP
                const costSociosNegocios = await models.SociosNegocio.findOne(
                {
                    where: {
                        sn_cardcode: constRawSociosNegocios[i].dataValues.codigoCliente
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });


                //Busca la direccion de facturacion del SN en la tabla raw sn Direcciones
                const costRawSociosNegociosDirecciones = await models.RawSociosNegociosDirecciones.findOne(
                {
                    where: {
                        codigoClientePadre: constRawSociosNegocios[i].dataValues.codigoCliente,
                        idDireccion: constRawSociosNegocios[i].dataValues.idDireccionB,
                        tipoDir: "B"
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });


                //Variables Direccion Facturacion / Si no existe lo dejara vacio para evitar problemas de que una varible no exista
                    var direccionFacturacion;
                    if(costRawSociosNegociosDirecciones)
                    {
                        direccionFacturacion = costRawSociosNegociosDirecciones.dataValues.calle + " " + costRawSociosNegociosDirecciones.dataValues.colonia + " " +  costRawSociosNegociosDirecciones.dataValues.ciudad + " " + costRawSociosNegociosDirecciones.dataValues.codigoPostal + " " + costRawSociosNegociosDirecciones.dataValues.pais;
                    }
                    else
                    {
                        direccionFacturacion = "";
                    }
                //Fin variables direccion

                //Variable para estatus del cliente tomado desde los mapeos cmm
                    var StatusSN;

                    //Estatus del cliente desde sap
                        if(constRawSociosNegocios[i].dataValues.activo == "Y"){
                            StatusSN = statusControles.ESTATUS_SOCIOS_NEGOCIO.ACTIVA;
                        }
                        else{
                            StatusSN = statusControles.ESTATUS_SOCIOS_NEGOCIO.INACTIVA;
                        }
                //FIn estatus SN


                

                //Buscar el ID del pais de la tabla raw SN
                const costPaisGetID = await models.Pais.findOne(
                {
                    where: {
                        pais_abreviatura: constRawSociosNegocios[i].dataValues.pais
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });

                if(costPaisGetID)
                {
                    var PaisId = costPaisGetID.pais_pais_id;
                }
                else
                {
                    var PaisId = 52;
                }
               

                //Buscar el id del estado de la tabla raw SN
                const costEstadoGetID = await models.Estado.findOne(
                {
                    where: {
                        estpa_codigo_estado: constRawSociosNegocios[i].dataValues.estado
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });



                if(costEstadoGetID)
                {
                    var EstadoId = costEstadoGetID.estpa_estado_pais_id;
                }
                else
                {
                    var EstadoId = 1;
                }

                //console.log(EstadoId)

                // Actualizar BD
                if(costSociosNegocios) 
                {
                    const bodyUpdate = {
                        "sn_socios_negocio_id": costSociosNegocios.dataValues.sn_socios_negocio_id,
                        "sn_cfdi": constRawSociosNegocios[i].dataValues.usoCfdi,
                        "sn_rfc": constRawSociosNegocios[i].dataValues.rfc,
                        "sn_cardcode": costSociosNegocios.dataValues.sn_cardcode,
                        "sn_credito": constRawSociosNegocios[i].dataValues.limiteCredito,
                        "sn_moneda": "MXP",
                        "sn_nombre_empresa": constRawSociosNegocios[i].dataValues.razonSocial,
                        "sn_tax": costSociosNegocios.dataValues.sn_tax,
                        "sn_direccion_facturacion": direccionFacturacion,
                        "sn_razon_social": constRawSociosNegocios[i].dataValues.razonSocial,
                        "sn_nombre_comercial": constRawSociosNegocios[i].dataValues.nombreComercial,
                        "sn_email_facturacion": constRawSociosNegocios[i].dataValues.email,
                        "sn_telefono_empresa": costSociosNegocios.dataValues.sn_telefono_empresa,
                        "sn_pais_id": PaisId,
                        "sn_estado_id": EstadoId,
                        "sn_direccion_empresa": costSociosNegocios.dataValues.sn_direccion_empresa,
                        "sn_lista_precios": constRawSociosNegocios[i].dataValues.codigoListaPrecios,
                        "sn_descripcion_empresa": costSociosNegocios.dataValues.sn_descripcion_empresa,
                        "sn_cmm_estatus_id": StatusSN,
                        "sn_almacen_asignado": costSociosNegocios.dataValues.sn_almacen_asignado,
                        "sn_usu_usuario_modificado_id": 1,
                        "sn_cmm_tipo_impuesto": costSociosNegocios.dataValues.sn_cmm_tipo_impuesto,
                        "sn_credito_disponible": constRawSociosNegocios[i].dataValues.creditoDisponible,
                        "sn_vendedor_codigo_sap": constRawSociosNegocios[i].dataValues.codigoVendedor,
                        "sn_condiciones_credito": constRawSociosNegocios[i].dataValues.condicionesCredito,
                        "sn_almacen_asignado": constRawSociosNegocios[i].dataValues.almacen,
                        "sn_codigo_direccion_facturacion": constRawSociosNegocios[i].dataValues.idDireccionB,
                        updatedAt: Date()
                    }
                    
                    await costSociosNegocios.update(bodyUpdate);

                }
                else //Crear
                {
                
                    const bodyCreate = {
                        "sn_cfdi": constRawSociosNegocios[i].dataValues.usoCfdi,
                        "sn_rfc": constRawSociosNegocios[i].dataValues.rfc,
                        "sn_cardcode": constRawSociosNegocios[i].dataValues.codigoCliente,
                        "sn_credito": constRawSociosNegocios[i].dataValues.limiteCredito,
                        "sn_moneda": 'MXP',
                        "sn_nombre_empresa": constRawSociosNegocios[i].dataValues.razonSocial,
                        "sn_tax": 'NA',
                        "sn_direccion_facturacion": direccionFacturacion,
                        "sn_razon_social": constRawSociosNegocios[i].dataValues.razonSocial,
                        "sn_nombre_comercial": constRawSociosNegocios[i].dataValues.nombreComercial,
                        "sn_email_facturacion": constRawSociosNegocios[i].dataValues.email,
                        "sn_telefono_empresa": 'NA',
                        "sn_pais_id": PaisId,
                        "sn_estado_id": EstadoId,
                        "sn_direccion_empresa": '',
                        "sn_lista_precios": constRawSociosNegocios[i].dataValues.codigoListaPrecios,
                        "sn_descripcion_empresa": 'NA',
                        "sn_cmm_estatus_id": StatusSN,
                        "sn_almacen_asignado": 'NA',
                        "sn_usu_usuario_creador_id": 1,
                        "sn_cmm_tipo_impuesto": 1000085,
                        "sn_descuento": 0,
                        "sn_credito_disponible": constRawSociosNegocios[i].dataValues.creditoDisponible,
                        "sn_vendedor_codigo_sap": constRawSociosNegocios[i].dataValues.codigoVendedor,
                        "sn_condiciones_credito": constRawSociosNegocios[i].dataValues.condicionesCredito,
                        "sn_almacen_asignado": constRawSociosNegocios[i].dataValues.almacen,
                        "sn_codigo_direccion_facturacion": constRawSociosNegocios[i].dataValues.idDireccionB
                    };
                         
                    await models.SociosNegocio.create(bodyCreate);
                }
            }

            //Response
            res.status(200).send(
            {
                message: 'Integracion Transfer SN Correcta'
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    //Crea las direcciones de la tabla raw sn direcciones a la tabla SN direcciones pcp
    IntegracionInfoTransferSociosNegociosDirecciones: async(req, res, next) =>{
        try{

            //Carga todos los registros desde la tabla socios de negocios ya registrados
            const constSociosNegocio = await models.SociosNegocio.findAll({
            });


            
            //console.log(constSociosNegocio.length);
            for (var i = 0; i < constSociosNegocio.length; i++) 
            {
                //console.log(constSociosNegocio[i].dataValues.sn_cardcode)

                //Busca todas las direcciones con un SN padre en la tabla raw sn direcciones
                const constRawSociosNegociosDirecciones = await models.RawSociosNegociosDirecciones.findAll(
                {
                    where: {
                        codigoClientePadre: constSociosNegocio[i].dataValues.sn_cardcode
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}  
                });


                //Lista de direcciones asociadas a un SN hacia la tabla raw sn Direcciones
                for (var j = 0; j < constRawSociosNegociosDirecciones.length; j++) 
                {
                    //Busca si la direccion ya existe en la tabla de sn direcciones real
                    const constSociosNegocioDirecciones = await models.SociosNegocioDirecciones.findOne(
                    {
                        where: {
                            snd_cardcode: constSociosNegocio[i].dataValues.sn_cardcode,
                            snd_idDireccion: constRawSociosNegociosDirecciones[j].idDireccion,
                            snd_tipoDir: constRawSociosNegociosDirecciones[j].tipoDir
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}  
                    });


                    //Buscar el ID del pais de la tabla raw SN
                    const costPaisGetID = await models.Pais.findOne(
                    {
                        where: {
                            pais_abreviatura: constRawSociosNegociosDirecciones[j].pais
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });

                    if(costPaisGetID)
                    {
                        var PaisId = costPaisGetID.pais_pais_id;
                    }
                    else
                    {
                        var PaisId = 52;
                    }
                   

                    //Buscar el id del estado de la tabla raw SN
                    const costEstadoGetID = await models.Estado.findOne(
                    {
                        where: {
                            estpa_codigo_estado: constRawSociosNegociosDirecciones[j].estado
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });



                    if(costEstadoGetID)
                    {
                        var EstadoId = costEstadoGetID.estpa_estado_pais_id;
                    }
                    else
                    {
                        var EstadoId = 1;
                    }



                    //Si existe actualizara
                    if(constSociosNegocioDirecciones)
                    {
                        const bodyUpdate = {
                            "snd_pais_id": PaisId,
                            "snd_estado_id": EstadoId,
                            "snd_ciudad": constRawSociosNegociosDirecciones[j].ciudad,
                            "snd_direccion": constRawSociosNegociosDirecciones[j].calle,
                            "snd_direccion_num_ext": "",
                            "snd_direccion_num_int": constRawSociosNegociosDirecciones[j].numInterior,
                            "snd_direccion_telefono": "",
                            "snd_calle1": constRawSociosNegociosDirecciones[j].calle,
                            "snd_calle2": "",
                            "snd_cardcode": constSociosNegocio[i].dataValues.sn_cardcode,
                            "snd_cmm_estatus_id": 1000051,
                            "snd_usu_usuario_creador_id": 1,
                            "snd_idDireccion": constRawSociosNegociosDirecciones[j].idDireccion,
                            "snd_codigo_postal": constRawSociosNegociosDirecciones[j].codigoPostal,
                            "snd_tipoDir": constRawSociosNegociosDirecciones[j].tipoDir,
                            "snd_colonia": constRawSociosNegociosDirecciones[j].colonia
                        };

                        await constSociosNegocioDirecciones.update(bodyUpdate);

                    }
                    else //Si no existe Creara un nuevo registro basado en el idDireccion y el sn padre
                    {
                        const bodyCreate = {
                            "snd_pais_id": PaisId,
                            "snd_estado_id": EstadoId,
                            "snd_ciudad": constRawSociosNegociosDirecciones[j].ciudad,
                            "snd_direccion": constRawSociosNegociosDirecciones[j].calle,
                            "snd_direccion_num_ext": "",
                            "snd_direccion_num_int": constRawSociosNegociosDirecciones[j].numInterior,
                            "snd_direccion_telefono": "",
                            "snd_calle1": constRawSociosNegociosDirecciones[j].calle,
                            "snd_calle2": "",
                            "snd_cardcode": constSociosNegocio[i].dataValues.sn_cardcode,
                            "snd_cmm_estatus_id": 1000051,
                            "snd_usu_usuario_creador_id": 1,
                            "snd_idDireccion": constRawSociosNegociosDirecciones[j].idDireccion,
                            "snd_codigo_postal": constRawSociosNegociosDirecciones[j].codigoPostal,
                            "snd_tipoDir": constRawSociosNegociosDirecciones[j].tipoDir,
                            "snd_colonia": constRawSociosNegociosDirecciones[j].colonia
                        };
                        //console.log(bodyCreate);
                        await models.SociosNegocioDirecciones.create(bodyCreate);
                    }

                }
            }//Fin FOR

            //Response
            res.status(200).send(
            {
                message: 'Integracion Transfer SN Direcciones Correcta',
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    IntegracionInfoTransferProyectos: async(req, res, next) => {
        try {
            
            const options = {
                'method': 'GET',
                'url': (process.env.INTEGRATIONS_URL = 'http://35.224.2.75:89' ? 'http://10.128.0.2:90' : process.env.INTEGRATIONS_URL) + '/Service1.svc/proyectos',
                'headers': {
                    'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                } 
            };
            const result = await request(options, function (error, response) 
            {
                if (error) throw new Error(error);
            });
            const resultJson = JSON.parse(result);

            const dataSocioNegocio = await models.SociosNegocioUsuario.findAll({
                where: {
                    snu_cmm_estatus_id: '1000048',
                },
                attributes: ["snu_cardcode"]
            });
            const socioNegocioCardCode = dataSocioNegocio.map((item) => item.dataValues.snu_cardcode);

            for (let index = 0; index < resultJson.proyectos.length; index++) {
                const element = resultJson.proyectos[index];
                const evaluacion = socioNegocioCardCode.includes(element.codigoCliente);

                if(evaluacion) {
                    const proyectos = await models.Proyectos.findOne({
                        where: {
                            idProyecto: element.id,
                        },
                    });

                    if(proyectos) {
                        await proyectos.update({
                            CodigoEjecutivo: element.CodigoEjecutivo,
                            NombreEjecutivo: element.NombreEjecutivo,
                            codigoCliente: element.codigoCliente,
                            estatus: element.estatus,
                            fechaInicio: element.fechaInicio,
                            fechaVencimiento: element.fechaVencimiento,
                            idProyecto: element.id,
                            moneda: element.moneda,
                            nombreCliente: element.nombreCliente,
                            nombreProyecto: element.nombreProyecto,
                            recordatorio: element.recordatorio,
                            referenciaFabrica: element.referenciaFabrica,
                            renovacion: element.renovacion,
                            total: element.total,
                            unidadesRecordatorio: element.unidadesRecordatorio,
                            updatedAt: Date(),
                        });

                        for (let e = 0; e < element.lineas.length; e++) {
                            const data = element.lineas[e];

                            const lineasProyecto = await models.LineasProyectos.findOne({
                                idProyecto: proyectos.dataValues.id,
                                codigoArticulo: data.codigoArticulo,
                            });

                            await lineasProyecto.update({
                                cantidadAcumulada: data.cantidadAcumulada,
                                importeAcumulado: data.importeAcumulado,
                                nombreArticulo: data.nombreArticulo,
                                precio: data.precio
                            });
                        }

                    } else {
                        const proyectoId = await models.Proyectos.create({
                            CodigoEjecutivo: element.CodigoEjecutivo,
                            NombreEjecutivo: element.NombreEjecutivo,
                            codigoCliente: element.codigoCliente,
                            estatus: element.estatus,
                            fechaInicio: element.fechaInicio,
                            fechaVencimiento: element.fechaVencimiento,
                            idProyecto: element.id,
                            moneda: element.moneda,
                            nombreCliente: element.nombreCliente,
                            nombreProyecto: element.nombreProyecto,
                            recordatorio: element.recordatorio,
                            referenciaFabrica: element.referenciaFabrica,
                            renovacion: element.renovacion,
                            total: element.total,
                            unidadesRecordatorio: element.unidadesRecordatorio,
                            activo: 1,
                            updatedAt: Date(),
                            createdAt: Date(),
                        });

                        for (let e = 0; e < element.lineas.length; e++) {
                            const data = element.lineas[e];

                            await models.LineasProyectos.create({
                                idProyecto: proyectoId.dataValues.id,
                                cantidadAcumulada: data.cantidadAcumulada,
                                codigoArticulo: data.codigoArticulo,
                                importeAcumulado: data.importeAcumulado,
                                nombreArticulo: data.nombreArticulo,
                                precio: data.precio
                            });
                            console.log('data -> ', data);
                        }
                    }
                }
            }

            res.status(200).send(
            {
                message: 'Integracion de proyectos se realizo correctamente.',
            });
        } catch (error) {
            console.error('Error en IntegracionInfoTranferProyectos, ----> ', error);
            res.status(500).send({
                message: 'Error en la petición',
                error
            });
            next(error);
        }
    },

    //Transfiere la informacion de la tabla raw listas de precios grupos (descentos SN por grupos) a la tabla socios de negocios descuentos
    IntegracionInfoTransferSociosNegociosDescuentos: async(req, res, next) =>{
        try{
            //Carga todos los registros desde la tabla RAW
            const constRawListasPreciosGrupo = await models.RawListasPreciosGrupo.findAll({
            });

            if(constRawListasPreciosGrupo.length > 0)
            {
                var DeleteAll = `
                    delete from socios_negocio_descuentos
                `;

                await sequelize.query(DeleteAll,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });
            }


            for (var i = 0; i < constRawListasPreciosGrupo.length; i++) 
            {
                //Estatus to CMM
                var StatusSNDescuento;
            
                if(constRawListasPreciosGrupo[i].dataValues.activo == "Y"){
                    StatusSNDescuento = statusControles.ESTATUS_SOCIOS_NEGOCIO_DESCUENTOS.ACTIVO;
                }
                else{
                    StatusSNDescuento = statusControles.ESTATUS_SOCIOS_NEGOCIO_DESCUENTOS.INACTIVA;
                }

                const constSociosNegocioDescuentos = await models.SociosNegocioDescuentos.findOne(
                {
                    where: {
                        sndes_tipo: constRawListasPreciosGrupo[i].dataValues.tipo,
                        sndes_subtipo: constRawListasPreciosGrupo[i].dataValues.subTipo,
                        sndes_codigo: constRawListasPreciosGrupo[i].dataValues.codigo,
                        sndes_sub_codigo: constRawListasPreciosGrupo[i].dataValues.subCodigo

                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });

                var dia, mes, año, dateTemporal, sndes_fecha_inicio, sndes_fecha_final

                var dateTemporal = constRawListasPreciosGrupo[i].dataValues.validoDesde
                dia = dateTemporal.slice(0, 4)
                mes = dateTemporal.slice(4, 6)
                año = dateTemporal.slice(6, 8)
                sndes_fecha_inicio = dia + "-" + mes + "-" + año


                var dateTemporal = constRawListasPreciosGrupo[i].dataValues.validoHasta
                dia = dateTemporal.slice(0, 4)
                mes = dateTemporal.slice(4, 6)
                año = dateTemporal.slice(6, 8)
                sndes_fecha_final = dia + "-" + mes + "-" + año

                if(constSociosNegocioDescuentos) 
                {
                    const bodyUpdate = {
                        "sndes_codigo": constRawListasPreciosGrupo[i].dataValues.codigo,
                        "sndes_tipo": constRawListasPreciosGrupo[i].dataValues.tipo,
                        "sndes_fecha_inicio": sndes_fecha_inicio,
                        "sndes_fecha_final": sndes_fecha_final,
                        "sndes_cmm_estatus_id": StatusSNDescuento,
                        "sndes_porcentaje_descuento": constRawListasPreciosGrupo[i].dataValues.porcentajeDescuento,
                        "sndes_sub_codigo": constRawListasPreciosGrupo[i].dataValues.subCodigo,
                        "sndes_subtipo": constRawListasPreciosGrupo[i].dataValues.subTipo,
                        updatedAt: Date()
                    }
                    
                    await constSociosNegocioDescuentos.update(bodyUpdate);

                }
                else //Crear
                {
                
                    const bodyCreate = {
                        "sndes_codigo": constRawListasPreciosGrupo[i].dataValues.codigo,
                        "sndes_tipo": constRawListasPreciosGrupo[i].dataValues.tipo,
                        "sndes_fecha_inicio": sndes_fecha_inicio,
                        "sndes_fecha_final": sndes_fecha_final,
                        "sndes_cmm_estatus_id": StatusSNDescuento,
                        "sndes_porcentaje_descuento": constRawListasPreciosGrupo[i].dataValues.porcentajeDescuento,
                        "sndes_sub_codigo": constRawListasPreciosGrupo[i].dataValues.subCodigo,
                        "sndes_subtipo": constRawListasPreciosGrupo[i].dataValues.subTipo
                    };
                         
                    await models.SociosNegocioDescuentos.create(bodyCreate);
                }
            }

            //Response
            res.status(200).send(
            {
                message: 'Integracion Transfer SN Descuentos'
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    //Crea las direcciones de la tabla raw sn direcciones a la tabla SN direcciones pcp SOLO UNO
    IntegracionInfoTransferSociosNegociosDireccionesOnlyOne: async(req, res, next) =>{
        try{

            //Carga todos los registros desde la tabla socios de negocios ya registrados
            const constSociosNegocio = await models.SociosNegocio.findAll({
                where: {
                    sn_cardcode: req.body.factor_integracion
                },
            });
            
            //console.log(constSociosNegocio.length);
            for (var i = 0; i < constSociosNegocio.length; i++) 
            {
                //console.log(constSociosNegocio[i].dataValues.sn_cardcode)

                //Busca todas las direcciones con un SN padre en la tabla raw sn direcciones
                const constRawSociosNegociosDirecciones = await models.RawSociosNegociosDirecciones.findAll(
                {
                    where: {
                        codigoClientePadre: constSociosNegocio[i].dataValues.sn_cardcode
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}  
                });


                //Lista de direcciones asociadas a un SN hacia la tabla raw sn Direcciones
                for (var j = 0; j < constRawSociosNegociosDirecciones.length; j++) 
                {
                    //Busca si la direccion ya existe en la tabla de sn direcciones real
                    const constSociosNegocioDirecciones = await models.SociosNegocioDirecciones.findOne(
                    {
                        where: {
                            snd_cardcode: constSociosNegocio[i].dataValues.sn_cardcode,
                            snd_idDireccion: constRawSociosNegociosDirecciones[j].idDireccion,
                            snd_tipoDir: constRawSociosNegociosDirecciones[j].tipoDir
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}  
                    });


                    //Buscar el ID del pais de la tabla raw SN
                    const costPaisGetID = await models.Pais.findOne(
                    {
                        where: {
                            pais_abreviatura: constRawSociosNegociosDirecciones[j].pais
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });

                    if(costPaisGetID)
                    {
                        var PaisId = costPaisGetID.pais_pais_id;
                    }
                    else
                    {
                        var PaisId = 52;
                    }
                   

                    //Buscar el id del estado de la tabla raw SN
                    const costEstadoGetID = await models.Estado.findOne(
                    {
                        where: {
                            estpa_codigo_estado: constRawSociosNegociosDirecciones[j].estado
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });



                    if(costEstadoGetID)
                    {
                        var EstadoId = costEstadoGetID.estpa_estado_pais_id;
                    }
                    else
                    {
                        var EstadoId = 1;
                    }



                    //Si existe actualizara
                    if(constSociosNegocioDirecciones)
                    {
                        const bodyUpdate = {
                            "snd_pais_id": PaisId,
                            "snd_estado_id": EstadoId,
                            "snd_ciudad": constRawSociosNegociosDirecciones[j].ciudad,
                            "snd_direccion": constRawSociosNegociosDirecciones[j].calle,
                            "snd_direccion_num_ext": "",
                            "snd_direccion_num_int": constRawSociosNegociosDirecciones[j].numInterior,
                            "snd_direccion_telefono": "",
                            "snd_calle1": constRawSociosNegociosDirecciones[j].calle,
                            "snd_calle2": "",
                            "snd_cardcode": constSociosNegocio[i].dataValues.sn_cardcode,
                            "snd_cmm_estatus_id": 1000051,
                            "snd_usu_usuario_creador_id": 1,
                            "snd_idDireccion": constRawSociosNegociosDirecciones[j].idDireccion,
                            "snd_codigo_postal": constRawSociosNegociosDirecciones[j].codigoPostal,
                            "snd_tipoDir": constRawSociosNegociosDirecciones[j].tipoDir,
                            "snd_colonia": constRawSociosNegociosDirecciones[j].colonia
                        };

                        await constSociosNegocioDirecciones.update(bodyUpdate);

                    }
                    else //Si no existe Creara un nuevo registro basado en el idDireccion y el sn padre
                    {
                        const bodyCreate = {
                            "snd_pais_id": PaisId,
                            "snd_estado_id": EstadoId,
                            "snd_ciudad": constRawSociosNegociosDirecciones[j].ciudad,
                            "snd_direccion": constRawSociosNegociosDirecciones[j].calle,
                            "snd_direccion_num_ext": "",
                            "snd_direccion_num_int": constRawSociosNegociosDirecciones[j].numInterior,
                            "snd_direccion_telefono": "",
                            "snd_calle1": constRawSociosNegociosDirecciones[j].calle,
                            "snd_calle2": "",
                            "snd_cardcode": constSociosNegocio[i].dataValues.sn_cardcode,
                            "snd_cmm_estatus_id": 1000051,
                            "snd_usu_usuario_creador_id": 1,
                            "snd_idDireccion": constRawSociosNegociosDirecciones[j].idDireccion,
                            "snd_codigo_postal": constRawSociosNegociosDirecciones[j].codigoPostal,
                            "snd_tipoDir": constRawSociosNegociosDirecciones[j].tipoDir,
                            "snd_colonia": constRawSociosNegociosDirecciones[j].colonia
                        };
                        //console.log(bodyCreate);
                        await models.SociosNegocioDirecciones.create(bodyCreate);
                    }

                }
            }//Fin FOR

            //Response
            res.status(200).send(
            {
                message: 'Integracion Transfer SN Direcciones Correcta',
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    //Transfiere la informacion de la tabla raw SN a la SN pcp
    IntegracionInfoTransferAsignarSNAVendedores: async(req, res, next) =>{
        try{

            //Carga todos los registros desde la tabla RAW
            const constSociosNegocio = await models.SociosNegocio.findAll({
                attributes: ['sn_socios_negocio_id', 'sn_cardcode', 'sn_vendedor_codigo_sap']
            });



            



            for (var i = 0; i < constSociosNegocio.length; i++) 
            {

                //Busca en la tabla de usuario de sn el codigo sap similar
                const constUsuario = await models.Usuario.findOne({
                    where: {
                        usu_codigo_vendedor: constSociosNegocio[i].sn_vendedor_codigo_sap
                    },
                    attributes: ['usu_usuario_id']
                });


                //console.log(constUsuario.usu_usuario_id)
                //Si coincide el cod vendedor de SN y Usuarios continuara
                
                if(constUsuario)
                {
                    const constUsuariosSociosDeNegocios = await models.UsuariosSociosDeNegocios.findOne({
                        where: {
                            usn_sn_socio_de_negocio_id: constSociosNegocio[i].dataValues.sn_socios_negocio_id
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}  
                    })


                    if(constUsuariosSociosDeNegocios)
                    {
                        console.log("entro aqui?")
                        const bodyUpdate = {
                            "usn_usu_usuario_id": constUsuario.usu_usuario_id,
                            "usn_sn_socio_de_negocio_id": constSociosNegocio[i].dataValues.sn_socios_negocio_id,
                            "usn_usu_usuario_asignado_por_id": 1
                        }
                        await constUsuariosSociosDeNegocios.update(bodyUpdate);
                    }
                    else
                    {
                        console.log("Aqui esta chilo")
                        const bodyCreate = {
                            "usn_usu_usuario_id": constUsuario.usu_usuario_id,
                            "usn_sn_socio_de_negocio_id": constSociosNegocio[i].dataValues.sn_socios_negocio_id,
                            "usn_usu_usuario_asignado_por_id": 1,
                            updatedAt: Date()
                        }

                        await models.UsuariosSociosDeNegocios.create(bodyCreate);
                    }

                }
            }
            

            //Response
            res.status(200).send(
            {
                message: 'Integracion Transfer Asignacion SN a vendedores'
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    //Transfiere la informacion de la tabla raw almacenes a almacenes pcp
    IntegracionInfoTransferAlmacenes: async(req, res, next) =>{
        try{

            //Carga todos los registros desde la tabla RAW de almacenes
            const constRawAlmacenes = await models.RawAlmacenes.findAll({
            });

            for (var i = 0; i < constRawAlmacenes.length; i++) 
            {
                //console.log(constRawAlmacenes[i].dataValues)


                //Buscar si el almacen ya existe en la tabla PCP
                const costPaisID = await models.Pais.findOne(
                {
                    where: {
                        pais_abreviatura: constRawAlmacenes[i].dataValues.pais
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });

                //Buscar si el almacen ya existe en la tabla PCP
                const costEstadoID = await models.Estado.findOne(
                {
                    where: {
                        estpa_codigo_estado: constRawAlmacenes[i].dataValues.estado
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });

                //Buscar si el almacen ya existe en la tabla PCP
                const costAlmacenes = await models.Almacenes.findOne(
                {
                    where: {
                        alm_codigoAlmacen: constRawAlmacenes[i].dataValues.codigoAlmacen
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });


                var estatusAlmacenBloqueado;
                if(constRawAlmacenes[i].dataValues.bloqueado == "N")
                {
                    estatusAlmacenBloqueado = statusControles.ESTATUS_ALMACENES.ACTIVA;
                }
                else
                {
                    estatusAlmacenBloqueado = statusControles.ESTATUS_ALMACENES.INACTIVA;
                }

                if(constRawAlmacenes[i].dataValues.codigoPostal == '')
                {
                    constRawAlmacenes[i].dataValues.codigoPostal = "00000"
                }


                var estadoValor = costEstadoID.dataValues.estpa_estado_nombre

                var paisValor = costPaisID.dataValues.pais_nombre

                var direccion = constRawAlmacenes[i].dataValues.calle +" "+ constRawAlmacenes[i].dataValues.numeroCalle + ", "
                + constRawAlmacenes[i].dataValues.ciudad + ", " + constRawAlmacenes[i].dataValues.colonia + ", "+ constRawAlmacenes[i].dataValues.codigoPostal + ", " + estadoValor + ", " + paisValor
      
                //Actualizar BD
                if(costAlmacenes) 
                {
                    const bodyUpdate = {
                        "alm_nombre" : constRawAlmacenes[i].dataValues.nombreAlmacen,
                        "alm_codigo_postal" :  constRawAlmacenes[i].dataValues.codigoPostal,
                        "alm_pais_id":  costPaisID.pais_pais_id,   
                        "alm_estado_pais_id": costEstadoID.estpa_estado_pais_id,
                        "alm_direccion" : direccion,
                        "alm_cmm_estatus_id" : estatusAlmacenBloqueado,
                        "alm_codigoAlmacen": constRawAlmacenes[i].dataValues.codigoAlmacen,
                        "alm_tipo_almacen": statusControles.TIPO_ALMACEN.FISICO,
                        "alm_usu_usuario_modificado_id": 1
                    };
                    
                    await costAlmacenes.update(bodyUpdate);

                }
                else //Crear
                {
                
                    const bodyCreate = {
                        "alm_nombre" : constRawAlmacenes[i].dataValues.nombreAlmacen,
                        "alm_codigo_postal" :  constRawAlmacenes[i].dataValues.codigoPostal,
                        "alm_pais_id":  costPaisID.pais_pais_id,   
                        "alm_estado_pais_id": costEstadoID.estpa_estado_pais_id,
                        "alm_direccion" : direccion,
                        "alm_cmm_estatus_id" : estatusAlmacenBloqueado,
                        "alm_codigoAlmacen": constRawAlmacenes[i].dataValues.codigoAlmacen,
                        "alm_tipo_almacen": statusControles.TIPO_ALMACEN.FISICO,
                        "alm_usu_usuario_creador_id" : 1
                    };
                         
                    await models.Almacenes.create(bodyCreate);
                }
            }

            //Response
            res.status(200).send(
            {
                message: 'Integracion Transfer Almacenes',
                //costSociosNegocios: costSociosNegocios.dataValues.sn_cardcode,
                //constRawSociosNegocios
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    //Transfiere la informacion de la tabla raw articulos grupos a categorias
    IntegracionInfoTransferCategorias: async(req, res, next) =>{
        try{

            //Carga todos los registros desde la tabla RAW de almacenes
            const constRawArticulosGrupos = await models.RawArticulosGrupos.findAll({
            });

            console.log(constRawArticulosGrupos);

            for (var i = 0; i < constRawArticulosGrupos.length; i++) 
            {
                //console.log(constRawSociosNegocios[i].dataValues.codigoCliente)

                //Buscar si la categoria ya existe en la tabla PCP
                const costCategoria = await models.Categoria.findOne(
                {
                    where: {
                        cat_categoria_id: constRawArticulosGrupos[i].dataValues.codigoGrupo
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });

      
                //Actualizar o crear en  BD
                if(costCategoria) 
                {

                    var bodyUpdate 
                    if(costCategoria.cat_nombre_tienda == null || costCategoria.cat_nombre_tienda == '')
                    {
                        bodyUpdate = {
                            "cat_nombre" :  constRawArticulosGrupos[i].dataValues.nombreGrupo.toUpperCase(),
                            "cat_descripcion":  "", 
                            "cat_usu_usuario_modificado_id": 1,
                            "cat_nombre_tienda" :  constRawArticulosGrupos[i].dataValues.nombreGrupo.toUpperCase(),
                        };

                    }
                    else
                    {
                        bodyUpdate = {
                            "cat_nombre" :  constRawArticulosGrupos[i].dataValues.nombreGrupo.toUpperCase(),
                            "cat_descripcion":  "", 
                            "cat_usu_usuario_modificado_id": 1
                        };
                    }
                    
                    
                    await costCategoria.update(bodyUpdate);

                }
                else //Crear
                {
                    
                    const bodyCreate = {
                        "cat_categoria_id" : constRawArticulosGrupos[i].dataValues.codigoGrupo,
                        "cat_nombre" :  constRawArticulosGrupos[i].dataValues.nombreGrupo.toUpperCase(),
                        "cat_descripcion":  "",   
                        "cat_usu_usuario_creador_id": 1,
                        "cat_cmm_estatus_id" : statusControles.ESTATUS_CATEGORIA.ACTIVO,
                        "cat_nombre_tienda" :  constRawArticulosGrupos[i].dataValues.nombreGrupo.toUpperCase(),
                    };
                         
                    await models.Categoria.create(bodyCreate);
                }
            }

            //Response
            res.status(200).send(
            {
                message: 'Integracion Transfer Categorias from Articulos Grupos',
                //costSociosNegocios: costSociosNegocios.dataValues.sn_cardcode,
                //constRawSociosNegocios
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    //Transfiere la informacion de la tabla raw articulos grupos a categorias
    IntegracionInfoTransferMarcas: async(req, res, next) =>{
        try{

            //REQUEST DE LA API Y DATOS DE RETORNO

                var options = {
                    'method': 'GET',
                    'url': process.env.INTEGRATIONS_URL + '/Service1.svc/Marcas',
                    'headers': {
                        'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                    } 
                };
                var result = await request(options, function (error, response) 
                {
                    if (error) throw new Error(error);
                });
                var resultJson = JSON.parse(result);

            //FIN RETORN REQUEST

            //Si Estatus es 2 Significa que la API trajo datos
            if(resultJson.estatus == 2)
            {
                var jsonApi = resultJson.marcas;

                for (var i =  0; i < jsonApi.length; i++) 
                {
                    //Busca si el almacen existe
                    const constMarca = await models.Marca.findOne(
                    {
                        where: {
                            mar_marca_id: jsonApi[i].codigoMarca
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });

                    //Actualizar o crear en  BD
                    if(constMarca) 
                    {
                        const bodyUpdate = {
                            "mar_nombre" :  jsonApi[i].nombreMarca.toUpperCase(),
                            "mar_abreviatura":  jsonApi[i].nombreMarca.toUpperCase(),
                            "mar_descripcion": "",
                            "mar_cmm_estatus_id": statusControles.ESTATUS_MARCAS.ACTIVA,
                            "mar_usu_usuario_creado_id": 1
                        };
                        
                        await constMarca.update(bodyUpdate);

                    }
                    else //Crear
                    {
                        
                        const bodyCreate = {
                            "mar_marca_id" : jsonApi[i].codigoMarca,
                            "mar_nombre" :  jsonApi[i].nombreMarca.toUpperCase(),
                            "mar_abreviatura":  jsonApi[i].nombreMarca.toUpperCase(),
                            "mar_descripcion": "",
                            "mar_cmm_estatus_id" : statusControles.ESTATUS_MARCAS.ACTIVA,
                            "mar_usu_usuario_creado_id": 1
                        };
                             
                        await models.Marca.create(bodyCreate);
                    }


                }//FIN FOR TODOS LOS REGISTROS SN

            }


            //Response
            res.status(200).send(
            {
                message: 'Integracion Marcas directo a tablas PCP OK',
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    //Transfiere la informacion de la tabla raw articulos a productos
    IntegracionInfoTransferProductos: async(req, res, next) =>{
        try{

            //Carga todos los registros desde la tabla RAW de almacenes
            const constRawArticulos = await models.RawArticulos.findAll({
            });

            // for (var i = 0; i < 1; i++) 
            for (var i = 0; i < constRawArticulos.length; i++) 
            {
                //console.log(constRawSociosNegocios[i].dataValues.codigoCliente)
                //console.log(constRawArticulos[i].dataValues.codigoArticulo);
      
                //Settea el status del producto en base a los CMM
                    var estatusProducto;
                    //Estatus del cliente desde sap
                        if(constRawArticulos[i].dataValues.activo == "Y"){
                            estatusProducto = statusControles.ESTATUS_PRODUCTO.ACTIVO;
                        }
                        else{
                            estatusProducto = statusControles.ESTATUS_PRODUCTO.INACTIVO;
                        }
                //FIn estatus SN


                //Creara el producto padre con el SKU original (busca primero el sku padre)
                const constProductoPadre = await models.Producto.findOne(
                {
                    where: {
                        prod_sku: constRawArticulos[i].dataValues.skuPadre
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });

                var prop7Mostrar = false
                if(constRawArticulos[i].prop7 == "Y")
                {
                    prop7Mostrar = true
                }


                //console.log(constRawArticulos[i].dataValues.codigoArticulo + "-P");

                var volumenFinal = constRawArticulos[i].medida_v_altura * constRawArticulos[i].medida_v_ancho * constRawArticulos[i].medida_v_logitud

                //Actualizar o crear en  BD CREA PRODUCTO Padre
                if(constProductoPadre) 
                {

                    const bodyUpdate = {
                        // "prod_nombre" :  constRawArticulos[i].dataValues.nombreMarca.toUpperCase() + " " + constRawArticulos[i].dataValues.nombreArticulo.toUpperCase(),
                        // "prod_cat_categoria_id" : constRawArticulos[i].dataValues.codigoGrupo,
                        "prod_usu_usuario_modificado_id" :  1,
                        "prod_cmm_estatus_id":  estatusProducto,
                        "prod_mar_marca_id": constRawArticulos[i].codigoMarca,
                        "prod_unidad_medida_venta" : constRawArticulos[i].UMedidaVenta,
                        "prod_altura" : constRawArticulos[i].medida_v_altura,
                        "prod_ancho" : constRawArticulos[i].medida_v_ancho,
                        "prod_longitud" : constRawArticulos[i].medida_v_logitud,
                        "prod_peso" : constRawArticulos[i].medida_v_peso,
                        "prod_volumen" : volumenFinal,
                        "prod_nombre_extranjero": constRawArticulos[i].nombreExtranjero.toUpperCase(),
                        "prod_mostrar_en_tienda": prop7Mostrar,
                        "prod_dias_resurtimiento": parseInt(constRawArticulos[i].diasResurtimiento),
                        "prod_codigo_grupo": null
                    };
                    await constProductoPadre.update(bodyUpdate);

                }
                else //Crear
                {
                    const bodyCreate = {
                        "prod_sku" : constRawArticulos[i].dataValues.skuPadre,    //Se obtiene el sku padre
                        "prod_nombre" :// constRawArticulos[i].dataValues.nombreMarca.toUpperCase() + " " +
                          constRawArticulos[i].dataValues.nombreArticulo.toUpperCase(),
                        "prod_descripcion":  "",
                        "prod_cat_categoria_id" : constRawArticulos[i].dataValues.codigoGrupo,
                        "prod_usu_usuario_creado_id" :  1,
                        "prod_cmm_estatus_id":  estatusProducto,
                        "prod_mar_marca_id": constRawArticulos[i].codigoMarca,
                        "prod_descripcion_corta" : "",
                        "prod_unidad_medida_venta" : constRawArticulos[i].UMedidaVenta,
                        "prod_altura" : constRawArticulos[i].medida_v_altura,
                        "prod_ancho" : constRawArticulos[i].medida_v_ancho,
                        "prod_longitud" : constRawArticulos[i].medida_v_logitud,
                        "prod_peso" : constRawArticulos[i].medida_v_peso,
                        "prod_volumen" : volumenFinal,
                        "prod_nombre_extranjero": constRawArticulos[i].nombreExtranjero.toUpperCase(),
                        "prod_mostrar_en_tienda": prop7Mostrar,
                        "prod_dias_resurtimiento": parseInt(constRawArticulos[i].diasResurtimiento),
                        "prod_codigo_grupo": null
                    };
                         
                    await models.Producto.create(bodyCreate);
                }

                //Buscar si ya existe el padre si no, no intentara insertar el hijo (en caso de que falle algo)
                const constProductoPadre2 = await models.Producto.findOne(
                {
                    where: {
                        prod_sku: constRawArticulos[i].dataValues.skuPadre
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });

                if(constProductoPadre2)
                {
                    // Buscar si EL PRODUCTO hijo ya existe en la tabla PCP
                    const constProductoHijo = await models.Producto.findOne(
                    {
                        where: {
                            prod_sku: constRawArticulos[i].dataValues.codigoArticulo
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });


                    var arrayCodigos = []
                    if(constRawArticulos[i].dataValues.prop1 == 'Y'){arrayCodigos.push(1)}
                    if(constRawArticulos[i].dataValues.prop2 == 'Y'){arrayCodigos.push(2)}
                    if(constRawArticulos[i].dataValues.prop3 == 'Y'){arrayCodigos.push(3)}
                    if(constRawArticulos[i].dataValues.prop4 == 'Y'){arrayCodigos.push(4)}
                    if(constRawArticulos[i].dataValues.prop5 == 'Y'){arrayCodigos.push(5)}
                    if(constRawArticulos[i].dataValues.prop6 == 'Y'){arrayCodigos.push(6)}
                    if(constRawArticulos[i].dataValues.prop7 == 'Y'){arrayCodigos.push(7)}
                    if(constRawArticulos[i].dataValues.prop8 == 'Y'){arrayCodigos.push(8)}
                    if(constRawArticulos[i].dataValues.prop9 == 'Y'){arrayCodigos.push(9)}
                    if(constRawArticulos[i].dataValues.prop10 == 'Y'){arrayCodigos.push(10)}
                    if(constRawArticulos[i].dataValues.prop11 == 'Y'){arrayCodigos.push(11)}
                    if(constRawArticulos[i].dataValues.prop12 == 'Y'){arrayCodigos.push(12)}
                    if(constRawArticulos[i].dataValues.prop13 == 'Y'){arrayCodigos.push(13)}
                    if(constRawArticulos[i].dataValues.prop14 == 'Y'){arrayCodigos.push(14)}
                    if(constRawArticulos[i].dataValues.prop15 == 'Y'){arrayCodigos.push(15)}
                    if(constRawArticulos[i].dataValues.prop16 == 'Y'){arrayCodigos.push(16)}
                    if(constRawArticulos[i].dataValues.prop17 == 'Y'){arrayCodigos.push(17)}
                    if(constRawArticulos[i].dataValues.prop18 == 'Y'){arrayCodigos.push(18)}
                    if(constRawArticulos[i].dataValues.prop19 == 'Y'){arrayCodigos.push(19)}
                    if(constRawArticulos[i].dataValues.prop20 == 'Y'){arrayCodigos.push(20)}
                    if(constRawArticulos[i].dataValues.prop21 == 'Y'){arrayCodigos.push(21)}
                    if(constRawArticulos[i].dataValues.prop22 == 'Y'){arrayCodigos.push(22)}
                    if(constRawArticulos[i].dataValues.prop23 == 'Y'){arrayCodigos.push(23)}
                    if(constRawArticulos[i].dataValues.prop24 == 'Y'){arrayCodigos.push(24)}
                    if(constRawArticulos[i].dataValues.prop25 == 'Y'){arrayCodigos.push(25)}
                    if(constRawArticulos[i].dataValues.prop26 == 'Y'){arrayCodigos.push(26)}
                    if(constRawArticulos[i].dataValues.prop27 == 'Y'){arrayCodigos.push(27)}
                    if(constRawArticulos[i].dataValues.prop28 == 'Y'){arrayCodigos.push(28)}
                    if(constRawArticulos[i].dataValues.prop29 == 'Y'){arrayCodigos.push(29)}
                    if(constRawArticulos[i].dataValues.prop30 == 'Y'){arrayCodigos.push(30)}
                    if(constRawArticulos[i].dataValues.prop31 == 'Y'){arrayCodigos.push(31)}
                    if(constRawArticulos[i].dataValues.prop32 == 'Y'){arrayCodigos.push(32)}
                    if(constRawArticulos[i].dataValues.prop33 == 'Y'){arrayCodigos.push(33)}
                    if(constRawArticulos[i].dataValues.prop34 == 'Y'){arrayCodigos.push(34)}
                    if(constRawArticulos[i].dataValues.prop35 == 'Y'){arrayCodigos.push(35)}
                    if(constRawArticulos[i].dataValues.prop36 == 'Y'){arrayCodigos.push(36)}
                    if(constRawArticulos[i].dataValues.prop37 == 'Y'){arrayCodigos.push(37)}
                    if(constRawArticulos[i].dataValues.prop38 == 'Y'){arrayCodigos.push(38)}
                    if(constRawArticulos[i].dataValues.prop39 == 'Y'){arrayCodigos.push(39)}
                    if(constRawArticulos[i].dataValues.prop40 == 'Y'){arrayCodigos.push(40)}
                    if(constRawArticulos[i].dataValues.prop41 == 'Y'){arrayCodigos.push(41)}
                    if(constRawArticulos[i].dataValues.prop42 == 'Y'){arrayCodigos.push(42)}
                    if(constRawArticulos[i].dataValues.prop43 == 'Y'){arrayCodigos.push(43)}
                    if(constRawArticulos[i].dataValues.prop44 == 'Y'){arrayCodigos.push(44)}
                    if(constRawArticulos[i].dataValues.prop45 == 'Y'){arrayCodigos.push(45)}
                    if(constRawArticulos[i].dataValues.prop46 == 'Y'){arrayCodigos.push(46)}
                    if(constRawArticulos[i].dataValues.prop47 == 'Y'){arrayCodigos.push(47)}
                    if(constRawArticulos[i].dataValues.prop48 == 'Y'){arrayCodigos.push(48)}
                    if(constRawArticulos[i].dataValues.prop49 == 'Y'){arrayCodigos.push(49)}
                    if(constRawArticulos[i].dataValues.prop50 == 'Y'){arrayCodigos.push(50)}
                    if(constRawArticulos[i].dataValues.prop51 == 'Y'){arrayCodigos.push(51)}
                    if(constRawArticulos[i].dataValues.prop52 == 'Y'){arrayCodigos.push(52)}
                    if(constRawArticulos[i].dataValues.prop53 == 'Y'){arrayCodigos.push(53)}
                    if(constRawArticulos[i].dataValues.prop54 == 'Y'){arrayCodigos.push(54)}
                    if(constRawArticulos[i].dataValues.prop55 == 'Y'){arrayCodigos.push(55)}
                    if(constRawArticulos[i].dataValues.prop56 == 'Y'){arrayCodigos.push(56)}
                    if(constRawArticulos[i].dataValues.prop57 == 'Y'){arrayCodigos.push(57)}
                    if(constRawArticulos[i].dataValues.prop58 == 'Y'){arrayCodigos.push(58)}
                    if(constRawArticulos[i].dataValues.prop59 == 'Y'){arrayCodigos.push(59)}
                    if(constRawArticulos[i].dataValues.prop60 == 'Y'){arrayCodigos.push(60)}
                    if(constRawArticulos[i].dataValues.prop61 == 'Y'){arrayCodigos.push(61)}
                    if(constRawArticulos[i].dataValues.prop62 == 'Y'){arrayCodigos.push(62)}
                    if(constRawArticulos[i].dataValues.prop63 == 'Y'){arrayCodigos.push(63)}
                    if(constRawArticulos[i].dataValues.prop64 == 'Y'){arrayCodigos.push(64)}


                    var HijoMostrarEnTienda = false
                    if(constRawArticulos[i].dataValues.prop7 == 'Y')
                    {
                        HijoMostrarEnTienda = true
                    }

                        
                    //Actualizar o crear en  BD CREA PRODUCTO HIJO
                    if(constProductoHijo) 
                    {
                        const bodyUpdate = {
                            // "prod_nombre" :  constRawArticulos[i].dataValues.nombreMarca.toUpperCase() + " " + constRawArticulos[i].dataValues.nombreArticulo.toUpperCase(),
                            "prod_usu_usuario_modificado_id" :  1,
                            "prod_cmm_estatus_id":  estatusProducto,
                            "prod_prod_producto_padre_sku": constRawArticulos[i].dataValues.skuPadre,
                            "prod_unidad_medida_venta" : constRawArticulos[i].UMedidaVenta,
                            "prod_altura" : constRawArticulos[i].medida_v_altura,
                            "prod_ancho" : constRawArticulos[i].medida_v_ancho,
                            "prod_longitud" : constRawArticulos[i].medida_v_logitud,
                            "prod_peso" : constRawArticulos[i].medida_v_peso,
                            "prod_volumen" : volumenFinal,
                            "prod_nombre_extranjero": constRawArticulos[i].nombreExtranjero.toUpperCase(),
                            "prod_dias_resurtimiento": parseInt(constRawArticulos[i].diasResurtimiento),
                            // "prod_codigo_grupo": constRawArticulos[i].dataValues.codigoGrupo,
                            "prod_codigo_marca": constRawArticulos[i].codigoMarca,
                            "prod_mostrar_en_tienda": HijoMostrarEnTienda,
                            "prod_codigo_prop_list": arrayCodigos
                        };
                        await constProductoHijo.update(bodyUpdate);
                    }
                    else //Crear
                    {
                        const bodyCreate = {
                            "prod_sku" : constRawArticulos[i].dataValues.codigoArticulo,
                            "prod_nombre" : // constRawArticulos[i].dataValues.nombreMarca.toUpperCase() + " " +
                             constRawArticulos[i].dataValues.nombreArticulo.toUpperCase(),
                            "prod_descripcion":  "",
                            "prod_usu_usuario_creado_id" :  1,
                            "prod_cmm_estatus_id":  estatusProducto,
                            "prod_descripcion_corta" : "",
                            "prod_prod_producto_padre_sku": constRawArticulos[i].dataValues.skuPadre,
                            "prod_unidad_medida_venta" : constRawArticulos[i].UMedidaVenta,
                            "prod_altura" : constRawArticulos[i].medida_v_altura,
                            "prod_ancho" : constRawArticulos[i].medida_v_ancho,
                            "prod_longitud" : constRawArticulos[i].medida_v_logitud,
                            "prod_peso" : constRawArticulos[i].medida_v_peso,
                            "prod_volumen" : volumenFinal,
                            "prod_nombre_extranjero": constRawArticulos[i].nombreExtranjero.toUpperCase(),
                            "prod_dias_resurtimiento": parseInt(constRawArticulos[i].diasResurtimiento),
                            "prod_codigo_grupo": constRawArticulos[i].dataValues.codigoGrupo,
                            "prod_codigo_marca": constRawArticulos[i].codigoMarca,
                            "prod_mostrar_en_tienda": HijoMostrarEnTienda,
                            "prod_codigo_prop_list": arrayCodigos
                        };
                            
                        await models.Producto.create(bodyCreate);
                    }
                }
            }

            //Response
            res.status(200).send(
            {
                message: 'Integracion Transfer Productos Padres e Hijos'

                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    //Transfiere la informacion de la tabla raw NOMBRES listas precios a la listas de precios pcp
    IntegracionInfoTransferListasPrecios: async(req, res, next) =>{
        try{

            //Carga todos los registros desde la tabla RAW de listas de precios
            const constRawNombreListasPrecios = await models.RawNombreListasPrecios.findAll({
            });

            for (var i = 0; i < constRawNombreListasPrecios.length; i++) 
            {


                // console.log(constRawNombreListasPrecios[i].dataValues)

                // Buscar si EL PRODUCTO ya existe en la tabla PCP
                const constListaPrecio = await models.ListaPrecio.findOne(
                {
                    where: {
                            listp_lista_de_precio_id: constRawNombreListasPrecios[i].dataValues.codigoListaPrecios
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });

                // //Actualizar o crear en  BD
                if(constListaPrecio) 
                {

                    const bodyUpdate = {
                        "listp_lista_de_precio_id" : constRawNombreListasPrecios[i].dataValues.codigoListaPrecios,
                        "listp_nombre" :  constRawNombreListasPrecios[i].dataValues.nombreListaPrecios,
                        "listp_descripcion":  "",
                        "listp_cmm_estatus_id" : statusControles.ESTATUS_LISTA_DE_PRECIO.ACTIVO,
                        "listp_usu_usuario_modificador_id" :  1,
                        "listp_tipo_precio":  1,
                        "listp_descuento": 0
                    };
                    
                    await constListaPrecio.update(bodyUpdate);

                }
                else //Crear
                {
                    
                    const bodyCreate = {
                        "listp_lista_de_precio_id" : constRawNombreListasPrecios[i].dataValues.codigoListaPrecios,
                        "listp_nombre" :  constRawNombreListasPrecios[i].dataValues.nombreListaPrecios,
                        "listp_descripcion":  "",
                        "listp_cmm_estatus_id" : statusControles.ESTATUS_LISTA_DE_PRECIO.ACTIVO,
                        "listp_usu_usuario_creador_id" :  1,
                        "listp_tipo_precio":  1,
                        "listp_descuento": 0
                    };
                         
                    await models.ListaPrecio.create(bodyCreate);


                }
            }

            //Response
            res.status(200).send(
            {
                message: 'Integracion Transfer Listas Precios (Nombres Codigos)'

                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    //Transfiere la informacion de la tabla raw articulos a productos
    IntegracionInfoTransferInventarios: async(req, res, next) =>{
        try{

            //Carga todos los almacenes para comparar codigoAlmacen con su ID para tabla stock
            const constAlmacenes = await models.Almacenes.findAll({
            });

            //Carga todos los productos que no tengan sku padre
            const constProducto = await models.Producto.findAll({
                where: {
                    prod_prod_producto_padre_sku: { [Op.ne] : null }
                    // prod_sku: 'COP00142' //pruebas con un solo articulo
                },
            });
            
            for (var i = 0; i < constProducto.length; i++) 
            {
                // console.log("Articulo numero: " + i + "   SKU: " + constProducto[i].dataValues.prod_sku)

                //Obtener ID del producto a actualizar
                var productoId = constProducto[i].dataValues.prod_producto_id;

                //Carga todos los inventarios de la tabla Row de este SKU
                const constRawInventario = await models.RawInventario.findAll({
                    where: {
                        codigoArticulo: constProducto[i].dataValues.prod_sku
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });



                //Recorre todos los registros encontrados de un SKU de la tabla raw
                for (var j = 0; j < constRawInventario.length; j++) 
                {
                    //Buscar el ID del almacen asignado segun el codigo de almacenes
                    var almacenId;
                    for (var k = 0; k < constAlmacenes.length; k++) 
                    {
                        if(constAlmacenes[k].dataValues.alm_codigoAlmacen == constRawInventario[j].dataValues.codigoAlmacen)
                        {
                            almacenId = constAlmacenes[k].dataValues.alm_almacen_id
                        }
                    }










                    // console.log(constRawInventario[j].dataValues.codigoAlmacen)


                    var totalStockFinal = 0

                    //calcular el stock que tendra para el almacen 01
                    if(constRawInventario[j].dataValues.codigoAlmacen == "01")
                    {
                        var tempCantidad = 0
                        var tempComprometidos = 0

                        const almacen1 = await models.RawInventario.findOne({
                            where: {
                                codigoArticulo: constProducto[i].dataValues.prod_sku,
                                codigoAlmacen: "01"
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}   
                        });


                        const almacen3 = await models.RawInventario.findOne({
                            where: {
                                codigoArticulo: constProducto[i].dataValues.prod_sku,
                                codigoAlmacen: "03"
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}   
                        });


                        tempCantidad = almacen1.cantidad + almacen3.cantidad
                        tempComprometidos = almacen1.comprometido + almacen3.comprometido

                        // console.log(tempCantidad)
                        // console.log(tempComprometidos)

                        if(tempComprometidos == 0)
                        {
                            // console.log("entro al 1")
                            totalStockFinal = constRawInventario[j].cantidad
                        }
                        else if (tempComprometidos > tempCantidad)
                        {
                            // console.log("entro al 2")
                            totalStockFinal = 0
                        }
                        else if(tempComprometidos < tempCantidad)
                        {
                            // console.log("entro al 3")
                            var tempCantAlm01 = 0
                            var tempCantAlm03 = 0

                            tempCantAlm01 = almacen1.cantidad - almacen1.comprometido
                            tempCantAlm03 = almacen3.cantidad - almacen3.comprometido

                            // console.log(tempCantAlm01)
                            // console.log(tempCantAlm03)



                            if(tempCantAlm01 <= 0)
                            {
                                totalStockFinal = 0
                            }   
                            else if(tempCantAlm03 < 0)
                            {
                                totalStockFinal = tempCantAlm01-tempCantAlm03
                            }
                            else
                            {
                                totalStockFinal = tempCantAlm01
                            }
                        }
                    }
                    else if(constRawInventario[j].dataValues.codigoAlmacen == "03")
                    {
                        var tempCantidad = 0
                        var tempComprometidos = 0

                        const almacen1 = await models.RawInventario.findOne({
                            where: {
                                codigoArticulo: constProducto[i].dataValues.prod_sku,
                                codigoAlmacen: "01"
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}   
                        });

                        const almacen3 = await models.RawInventario.findOne({
                            where: {
                                codigoArticulo: constProducto[i].dataValues.prod_sku,
                                codigoAlmacen: "03"
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}   
                        });

                        tempCantidad = almacen1.cantidad + almacen3.cantidad
                        tempComprometidos = almacen1.comprometido + almacen3.comprometido

                        if(tempComprometidos == 0)
                        {
                            // console.log("entro al 1")
                            totalStockFinal = constRawInventario[j].cantidad

                        }
                        else if (tempComprometidos > tempCantidad)
                        {
                            // console.log("entro al 2")
                            totalStockFinal = 0
                        }
                        else if(tempComprometidos < tempCantidad)
                        {
                            // console.log("entro al 3")
                            var tempCantAlm01 = 0
                            var tempCantAlm03 = 0

                            tempCantAlm01 = almacen1.cantidad - almacen1.comprometido
                            tempCantAlm03 = almacen3.cantidad - almacen3.comprometido

                            // console.log(tempCantAlm01)
                            // console.log(tempCantAlm03)
                            

                            if(tempCantAlm03 <= 0)
                            {
                                totalStockFinal = 0
                            }   
                            else if(tempCantAlm01 < 0)
                            {
                                totalStockFinal = tempCantAlm03-tempCantAlm01
                            }
                            else
                            {
                                totalStockFinal = tempCantAlm03
                            }
                        }
                    }
                    else
                    {
                        // console.log("entro al 4")
                        totalStockFinal = constRawInventario[j].cantidad
                    }




                    // console.log(totalStockFinal)










                    //Buscar e integrar un inventario por id producto y almacen
                    // Busca el id de stock producto pcp con el where en id producto y almacen id
                    const constStockProducto = await models.StockProducto.findOne(
                    {
                        where: {
                            sp_prod_producto_id: productoId,
                            sp_almacen_id: almacenId
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });




                    //Actualizar
                    if(constStockProducto) 
                    {
                        const bodyUpdate = {
                            "sp_cantidad" :  totalStockFinal,
                            // "sp_comprometido" :  constRawInventario[j].comprometido,
                            "sp_comprometido" :  0, //dejar en 0 porque se hara el calculo al mandar a la tabla stock
                        };
                        await constStockProducto.update(bodyUpdate);
                    }






                }
                
            }//Fin for i (lista de productos base (SKU))
            

            

            //Response
            res.status(200).send(
            {
                message: 'Integracion Transfer Inventario',
               
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    //Transfiere la informacion de la tabla raw articulos a productos SOLO UNO
    IntegracionInfoTransferInventariosOnlyOne: async(req, res, next) =>{
        try{

            //Carga todos los almacenes para comparar codigoAlmacen con su ID para tabla stock
            const constAlmacenes = await models.Almacenes.findAll({
            });

            //Carga todos los registros desde la tabla RAW de almacenes
            const constProducto = await models.Producto.findAll({
                where: {
                    prod_prod_producto_padre_sku: { [Op.ne] : null },
                    prod_sku: req.body.factor_integracion
                },
            });

            console.log(constProducto.length);
            
            for (var i = 0; i < constProducto.length; i++) 
            {
                console.log("Articulo numero: " + i + "   SKU: " + constProducto[i].dataValues.prod_sku)

                //Obtener ID del producto a actualizar
                var productoId = constProducto[i].dataValues.prod_producto_id;


                //Carga todos los inventarios de la tabla Row de este SKU
                const constRawInventario = await models.RawInventario.findAll({
                    where: {
                        codigoArticulo: constProducto[i].dataValues.prod_sku
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });

                //For de los "14 almacenes que se tienen al momento de hacer esta integracion"
                for (var j = 0; j < constRawInventario.length; j++) {
                    //console.log(constRawInventario[j].dataValues.codigoAlmacen)


                    
                    //Buscar el ID del almacen asignado segun el codigo de almacenes
                        var almacenId;
                        for (var k = 0; k < constAlmacenes.length; k++) 
                        {
                            if(constAlmacenes[k].dataValues.alm_codigoAlmacen == constRawInventario[j].dataValues.codigoAlmacen)
                            {
                                almacenId = constAlmacenes[k].dataValues.alm_almacen_id
                            }

                        }


                        // Busca el id de stock producto pcp con el where en id producto y almacen id
                        const constStockProducto = await models.StockProducto.findOne(
                        {
                            where: {
                                sp_prod_producto_id: productoId,
                                sp_almacen_id: almacenId
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}   
                        });

                        //Actualizar o crear en  BD
                        if(constStockProducto) 
                        {

                            const bodyUpdate = {
                                "sp_cantidad" :  constRawInventario[j].disponible
                            };
                            
                            await constStockProducto.update(bodyUpdate);

                        }

                }
                
            }//Fin for i (lista de productos base (SKU))
            

            

            //Response
            res.status(200).send(
            {
                message: 'Integracion Transfer Inventario',
               
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    //Transfiere la informacion de la tabla raw nombres listas precios a la listas de precios pcp (SOLO ACTUALIZARA LA TABLA PRECIOS LISTAS NO EL PRECIO BASE)
    IntegracionInfoTransferProductosListasPrecios: async(req, res, next) =>{
        try{


            //Carga El precio del dolar del dia
            const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_nombre: "TIPO_CAMBIO_USD"
                }
            });

            var precioTipoCambioUSD = constControlMaestroMultiple.cmm_valor

            //Carga todos los registros
            const constProducto = await models.Producto.findAll(
            {
                where: {
                    prod_prod_producto_padre_sku: { [Op.ne] : null }
                },
            });

            for (var i = 0; i < constProducto.length; i++) 
            {
                //Obtener ID del producto a actualizar
                var productoId = constProducto[i].dataValues.prod_producto_id;

                //Carga todas las listas de precios de productos basicas a partir de un SKU
                const constRawListasPreciosBasicas = await models.RawListasPreciosBasicas.findAll({
                    where: {
                            codigoArticulo: constProducto[i].prod_sku
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                });

                // For para las X listas de precios actuales de la BD pruebas de SAP
                for (var j = 0; j < constRawListasPreciosBasicas.length; j++) 
                {
                    // Busca el id de stock producto pcp con el where en id producto y almacen id
                    const constProductoListaPrecio = await models.ProductoListaPrecio.findOne(
                    {
                        where: {
                            pl_prod_producto_id: productoId,
                            pl_listp_lista_de_precio_id: constRawListasPreciosBasicas[j].dataValues.codigoListaPrecios
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });
                    
                    //Variable con nuevo precio y tipo moneda
                    var newPrice
                    var tipoMoneda
                    var precioBaseUSD

                    if(constRawListasPreciosBasicas[j].dataValues.moneda == "USD")
                    {
                        newPrice = parseFloat(constRawListasPreciosBasicas[j].dataValues.precio) * parseFloat(precioTipoCambioUSD) 
                        tipoMoneda = constRawListasPreciosBasicas[j].dataValues.moneda
                        precioBaseUSD = constRawListasPreciosBasicas[j].dataValues.precio
                    }
                    else
                    {
                        newPrice = constRawListasPreciosBasicas[j].dataValues.precio
                        tipoMoneda = constRawListasPreciosBasicas[j].dataValues.moneda
                        precioBaseUSD = null
                    }

                    if(constProductoListaPrecio) 
                    {
                        const bodyUpdate = {
                            "pl_precio_producto":  newPrice,
                            "pl_tipo_moneda":  tipoMoneda,
                            "pl_precio_usd":  precioBaseUSD
                        };

                        await constProductoListaPrecio.update(bodyUpdate);
                    }
                    else //Crear
                    {
                        const bodyCreate = {
                            "pl_prod_producto_id" : productoId,
                            "pl_listp_lista_de_precio_id" :  constRawListasPreciosBasicas[j].dataValues.codigoListaPrecios,
                            "pl_precio_producto":  newPrice,
                            "pl_tipo_moneda":  tipoMoneda,
                            "pl_precio_usd":  precioBaseUSD
                        };
                             
                        await models.ProductoListaPrecio.create(bodyCreate);
                    }
                }
            }//Fin for i (lista de productos base (SKU))
            

            //Response
            res.status(200).send(
            {
                message: 'Integracion Transfer Productos Listas Precios',
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    //Transifere la informacion de listas de precios obtiene el mayor y lo mete en prod_producto_precio
    IntegracionInfoTransferProductosPreciosListasPrecios: async(req, res, next) =>{
        try{

            var queryAllproductosId = `
                select 
                    pl_prod_producto_id 
                from
                    productos_lista_de_precio pldp 
                    left join productos p2 on pldp.pl_prod_producto_id = p2.prod_producto_id 
                where 
                    pl_precio_producto != 0
                group by  pl_prod_producto_id 
            `;


            //OBTIENE LOS ELEMENTOS BUSCADOS
            const constProductosListasDePrecios = await sequelize.query(queryAllproductosId,
            { 
                type: sequelize.QueryTypes.SELECT 
            });



            for (var i = 0; i < constProductosListasDePrecios.length; i++) 
            {
                console.log(constProductosListasDePrecios[i].pl_prod_producto_id)
                



                var queryGetMayor = `
                    select 
                        *
                    from 
                        productos_lista_de_precio pldp 
                    where 
                        pl_prod_producto_id = `+constProductosListasDePrecios[i].pl_prod_producto_id+`
                    order by pl_precio_producto desc
                    limit 1
                `;



                //OBTIENE LOS ELEMENTOS BUSCADOS
                const constqueryGetMayor = await sequelize.query(queryGetMayor,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });



                // console.log(constqueryGetMayor[0].pl_precio_producto)


                var updateQuery = `
                    UPDATE productos 
                    SET prod_precio = `+constqueryGetMayor[0].pl_precio_producto+`
                    WHERE prod_producto_id = `+constProductosListasDePrecios[i].pl_prod_producto_id+`
                `;



                //OBTIENE LOS ELEMENTOS BUSCADOS
                const constupdateQuery = await sequelize.query(updateQuery,
                { 
                    type: sequelize.QueryTypes.UPDATE 
                });






















                // //console.log("Articulo numero: " + i + "   SKU: " + constProducto[i].dataValues.prod_sku)

                // //Obtener ID del producto a actualizar
                // var productoId = constProducto[i].dataValues.prod_producto_id;


                // //Carga todas las listas de precios de productos basicas a partir de un SKU
                // const constRawListasPreciosBasicas = await models.RawListasPreciosBasicas.findAll({
                //     where: {
                //             codigoArticulo: constProducto[i].prod_sku
                //         },
                //         attributes: {exclude: ['createdAt', 'updatedAt']}   
                // });

                // //console.log(constRawListasPreciosBasicas)

                // // For para las 9 listas de precios actuales de la BD pruebas de SAP
                // for (var j = 0; j < constRawListasPreciosBasicas.length; j++) 
                // {
                    
                //     // Busca el id de stock producto pcp con el where en id producto y almacen id
                //     const constProductoListaPrecio = await models.ProductoListaPrecio.findOne(
                //     {
                //         where: {
                //             pl_prod_producto_id: productoId,
                //             pl_listp_lista_de_precio_id: constRawListasPreciosBasicas[j].dataValues.codigoListaPrecios
                //         },
                //         attributes: {exclude: ['createdAt', 'updatedAt']}   
                //     });
                   
                //     if(constProductoListaPrecio) 
                //     {
                //         console.log("Actualizado")
                //         const bodyUpdate = {
                //             "pl_precio_producto":  constRawListasPreciosBasicas[j].dataValues.precio
                //         };
                        
                //         await constProductoListaPrecio.update(bodyUpdate);

                //     }
                //     else //Crear
                //     {
                //         const bodyCreate = {
                //             "pl_prod_producto_id" : productoId,
                //             "pl_listp_lista_de_precio_id" :  constRawListasPreciosBasicas[j].dataValues.codigoListaPrecios,
                //             "pl_precio_producto":  constRawListasPreciosBasicas[j].dataValues.precio
                //         };
                             
                //         await models.ProductoListaPrecio.create(bodyCreate);
                //     }
                // }
            }//Fin for i (lista de productos base (SKU))
            

            //Response
            res.status(200).send(
            {
                message: 'Integracion Transfer Productos Listas Precios',
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    //Transifere la informacion de listas de precios obtiene el mayor y lo mete en prod_producto_precio
    IntegracionInfoTransferProductosSetPrecioBaseFromListasPrecios: async(req, res, next) =>{
        try{
            //Settear hijos con las 3 listas de precios
                //Buscara solo elementos que tengan un precio mayor a 0 y listara su ID de producto
                var queryAllproductosId = `
                    select  
                        pl_prod_producto_id 
                    from
                        productos_lista_de_precio pldp 
                        left join productos p2 on pldp.pl_prod_producto_id = p2.prod_producto_id 
                    where 
                        pl_precio_producto != 0
                    group by pl_prod_producto_id 
                `;


                //OBTIENE LOS ELEMENTOS BUSCADOS
                const constProductosListasDePrecios = await sequelize.query(queryAllproductosId,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });



                for (var i = 0; i < constProductosListasDePrecios.length; i++) 
                {
                    var queryGetAllPrecios = `
                        select 
                            pl_prod_producto_id,
                            pl_listp_lista_de_precio_id,
                            pl_precio_producto,
                            listp_nombre,
                            pl_tipo_moneda
                        from 
                            productos_lista_de_precio pldp 
                            left join listas_de_precios ldp on pldp.pl_listp_lista_de_precio_id = ldp.listp_lista_de_precio_id 
                        where 
                            pl_prod_producto_id = `+constProductosListasDePrecios[i].pl_prod_producto_id+`
                            and (ldp.listp_nombre = 'Precio de Lista'
                            or ldp.listp_nombre = 'Precio hasta agotar existencias'
                            or ldp.listp_nombre = 'Stock Inactivo')
                        order by pl_listp_lista_de_precio_id asc
                    `;

                    console.log(queryGetAllPrecios)

                    //OBTIENE LOS ELEMENTOS BUSCADOS
                    const constqueryGetAllPrecios = await sequelize.query(queryGetAllPrecios,
                    { 
                        type: sequelize.QueryTypes.SELECT 
                    });


                    console.log(constqueryGetAllPrecios)

                    var newPrecioBase = 0;
                    var is_stock_inactive  = false;
                    var tipo_precio_base = '';
                    var tipo_cambio = '';
 
                    //Si el [1] es stock inactivo
                    if(constqueryGetAllPrecios[1].listp_nombre == "Stock Inactivo" && constqueryGetAllPrecios[1].pl_precio_producto > 0)
                    {
                        newPrecioBase = constqueryGetAllPrecios[1].pl_precio_producto
                        is_stock_inactive = true
                        tipo_precio_base = constqueryGetAllPrecios[1].listp_nombre
                        tipo_cambio = constqueryGetAllPrecios[1].pl_tipo_moneda
                    }

                    //Si el precio es hasta agotar existencia tomara ese precio
                    else if(constqueryGetAllPrecios[2].listp_nombre == "Precio hasta agotar existencias" && constqueryGetAllPrecios[2].pl_precio_producto > 0)
                    {
                        newPrecioBase = constqueryGetAllPrecios[2].pl_precio_producto
                        is_stock_inactive = false
                        tipo_precio_base = constqueryGetAllPrecios[2].listp_nombre
                        tipo_cambio = constqueryGetAllPrecios[2].pl_tipo_moneda
                    }
                    else
                    {
                        newPrecioBase = constqueryGetAllPrecios[0].pl_precio_producto
                        is_stock_inactive = false
                        tipo_precio_base = constqueryGetAllPrecios[0].listp_nombre
                        tipo_cambio = constqueryGetAllPrecios[0].pl_tipo_moneda
                    }


                    //Carga el nuevo precio base en el prod_precio de la tabla productos
                    var updateQuery = `
                        UPDATE productos 
                        SET 
                            prod_precio = `+newPrecioBase+`, 
                            prod_es_stock_inactivo = `+is_stock_inactive+`, 
                            prod_tipo_precio_base = '`+tipo_precio_base+`',
                            prod_tipo_cambio_base = '`+tipo_cambio+`'
                        WHERE prod_producto_id = `+constProductosListasDePrecios[i].pl_prod_producto_id+`
                    `;



                    //OBTIENE LOS ELEMENTOS BUSCADOS
                    const constupdateQuery = await sequelize.query(updateQuery,
                    { 
                        type: sequelize.QueryTypes.UPDATE 
                    });

                }//Fin for i (lista de productos base (SKU))
            //Fin Sett hijos


            //Settear productos precio padre
                //Buscara todos los padres para preguntar por sus hijos
                var queryAllProdPadres = `
                    select 
                        * 
                    from 
                        productos p
                    where
                        prod_prod_producto_padre_sku is null 
                        or prod_prod_producto_padre_sku = ''
                `;
                //OBTIENE LOS ELEMENTOS BUSCADOS
                const constqueryAllProdPadres = await sequelize.query(queryAllProdPadres,
                { 
                    type: sequelize.QueryTypes.SELECT 
                });

                //For que recorre a los padres.
                for (var i = 0; i < constqueryAllProdPadres.length; i++) 
                {

                    console.log(constqueryAllProdPadres[i].prod_sku)
                    //Buscara a todos los hijos y solo regresara el que tenga menor precio para luego guardarlo
                    var queryPrecioMasBajoParaPadre = `
                        select
                            prod_precio 
                        from 
                            productos p 
                        where
                            prod_prod_producto_padre_sku = '`+constqueryAllProdPadres[i].prod_sku+`'
                        order by prod_precio asc
                        limit 1
                    `;

                    //OBTIENE LOS ELEMENTOS BUSCADOS
                    const constqueryPrecioMasBajoParaPadre = await sequelize.query(queryPrecioMasBajoParaPadre,
                    { 
                        type: sequelize.QueryTypes.SELECT 
                    });  

                    if(constqueryPrecioMasBajoParaPadre.length > 0)
                    {
                        //Carga el nuevo precio base en el prod_precio de la tabla productos
                        var updateQuery = `
                            UPDATE productos 
                            SET prod_precio = `+constqueryPrecioMasBajoParaPadre[0].prod_precio+` 
                            WHERE prod_sku = '`+constqueryAllProdPadres[i].prod_sku+`'
                        `;
                        
                        //OBTIENE LOS ELEMENTOS BUSCADOS
                        const constupdateQuery = await sequelize.query(updateQuery,
                        { 
                            type: sequelize.QueryTypes.UPDATE 
                        });

                    }

                    
                }
            //Fin Settear Padres

            //Response
            res.status(200).send(
            {
                message: 'Integracion Transfer Productos set Prices',
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    //Transfiere la informacion de la tabla raw nombres listas precios a la listas de precios pcp
    IntegracionInfoTransferProductosListasPreciosOnlyOne: async(req, res, next) =>{
        try{

            //Carga todos los registros desde la tabla RAW de almacenes
            const constProducto = await models.Producto.findAll(
            {
                where: {
                    prod_prod_producto_padre_sku: { [Op.ne] : null },
                    prod_sku: req.body.factor_integracion
                },
            });

            for (var i = 0; i < constProducto.length; i++) 
            {
                //console.log("Articulo numero: " + i + "   SKU: " + constProducto[i].dataValues.prod_sku)

                //Obtener ID del producto a actualizar
                var productoId = constProducto[i].dataValues.prod_producto_id;


                //Carga todas las listas de precios de productos basicas a partir de un SKU
                const constRawListasPreciosBasicas = await models.RawListasPreciosBasicas.findAll({
                    where: {
                            codigoArticulo: constProducto[i].prod_sku
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                });

                //console.log(constRawListasPreciosBasicas)

                // For para las 9 listas de precios actuales de la BD pruebas de SAP
                for (var j = 0; j < constRawListasPreciosBasicas.length; j++) 
                {
                    
                    // Busca el id de stock producto pcp con el where en id producto y almacen id
                    const constProductoListaPrecio = await models.ProductoListaPrecio.findOne(
                    {
                        where: {
                            pl_prod_producto_id: productoId,
                            pl_listp_lista_de_precio_id: constRawListasPreciosBasicas[j].dataValues.codigoListaPrecios
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });
                   
                    if(constProductoListaPrecio) 
                    {
                        console.log("Actualizado")
                        const bodyUpdate = {
                            "pl_precio_producto":  constRawListasPreciosBasicas[j].dataValues.precio
                        };
                        
                        await constProductoListaPrecio.update(bodyUpdate);

                    }
                    else //Crear
                    {
                        const bodyCreate = {
                            "pl_prod_producto_id" : productoId,
                            "pl_listp_lista_de_precio_id" :  constRawListasPreciosBasicas[j].dataValues.codigoListaPrecios,
                            "pl_precio_producto":  constRawListasPreciosBasicas[j].dataValues.precio
                        };
                             
                        await models.ProductoListaPrecio.create(bodyCreate);
                    }
                }
            }//Fin for i (lista de productos base (SKU))
            

            //Response
            res.status(200).send(
            {
                message: 'Integracion Transfer Productos Listas Precios',
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

    //Transfiere la informacion de la tabla raw nombres listas precios a la listas de precios pcp
    IntegracionCrearOrdenSapVALIDACIONESPREVIAS: async(req, res, next) =>{
        var d = new Date();
        var dia = d.getDate();
        var mes = d.getMonth() + 1;
        var año = d.getYear() + 1900;

        if(mes < 10)
        {
            mes = "0"+mes;
        }
        if(dia < 10)
        {
            dia = "0"+dia;
        }

        var fechaTotal = año.toString()+mes.toString()+dia.toString();

        try{





            //EN BASE AL NUMERO DE ORDEN (NO ID) CARGA SU INFORMACION DE LA TABLA COMPRASFINALIZADAS 
            const constCarritoDeCompra = await models.CarritoDeCompra.findOne(
            {
                where: {
                    cdc_carrito_de_compra_id: req.body.cdc_carrito_de_compra_id
                }
            });




            //Si carrito de compras existe todo bien
            if(constCarritoDeCompra)
            {
                //Buscar productos de con un id de carrito
                const constProductoCarritoDeCompra = await models.ProductoCarritoDeCompra.findOne(
                {
                    where: {
                        pcdc_carrito_de_compra_id: req.body.cdc_carrito_de_compra_id
                    }
                });



                //Si existe el carrto con producto too bien
                if(constProductoCarritoDeCompra)
                {


                    //Buscar la informacion del socio de negocio
                    const constSociosNegocio = await models.SociosNegocio.findOne(
                    {
                        where: {
                            sn_socios_negocio_id: constCarritoDeCompra.cdc_sn_socio_de_negocio_id
                        }
                    });


                    //Si el socio de negocio existe y todo bien
                    if(constSociosNegocio)
                    {
                        //Obtener direccion de facturacion


                                    //Crear Direccion Facturacion
                                    const constSociosNegocioDireccionesFacturacion = await models.SociosNegocioDirecciones.findOne(
                                    {
                                        where: {
                                            snd_tipoDir: "B",
                                            snd_cardcode: constSociosNegocio.dataValues.sn_cardcode,
                                            snd_idDireccion: constSociosNegocio.dataValues.sn_codigo_direccion_facturacion
                                        }
                                    });

                                    if(constSociosNegocioDireccionesFacturacion)
                                    {

                                        //Obtener Estado Nombre
                                        const constEstadoFacturacion = await models.Estado.findOne(
                                        {
                                            where: {
                                                estpa_estado_pais_id: constSociosNegocioDireccionesFacturacion.snd_estado_id
                                            }
                                        });



                                        var estadoValorFacturacion = ''
                                        var paisValorFacturacion = ''


                                        if(constEstadoFacturacion)
                                        {
                                            estadoValorFacturacion = constEstadoFacturacion.dataValues.estpa_estado_nombre
                                        }
                                        else
                                        {
                                            res.status(300).send(
                                            {
                                                message: 'La informacion de facturacion no tiene un estado->pais asignado.',
                                            })
                                        }


                                        //Obtener Pais Nombre
                                        const constPaisFacturacion = await models.Pais.findOne(
                                        {
                                            where: {
                                                pais_pais_id: constSociosNegocioDireccionesFacturacion.snd_pais_id
                                            }
                                        });
                                        if(constPaisFacturacion)
                                        {
                                            paisValorFacturacion = constPaisFacturacion.dataValues.pais_nombre
                                        }
                                        else
                                        {
                                            res.status(300).send(
                                            {
                                                message: 'La informacion de facturacion no tiene un pais asignado.',
                                            })
                                        }
                                        

                                        if(estadoValorFacturacion != '' && paisValorFacturacion != '')
                                        {
                                            // //Set Direccion FACTURACION
                                            var constSNDFacturacion = constSociosNegocioDireccionesFacturacion.dataValues;
                                            var direccionFacturacion = constSNDFacturacion.snd_direccion +", "+ constSNDFacturacion.snd_direccion_num_int +", "
                                                                        + constSNDFacturacion.snd_ciudad +", "+ constSNDFacturacion.snd_colonia +", "
                                                                        + constSNDFacturacion.snd_codigo_postal +", "+ estadoValorFacturacion +", "
                                                                        + paisValorFacturacion

                                            //Si la direccion de facturacion existe todo bien.
                                            if(direccionFacturacion != '')
                                            {

                                                //Obtener informacion basado en recoleccion o envio a domicilio

                                                //Si es envio a domicilio
                                                if(req.body.tipo_envio == 16)
                                                {
                                                    //Buscar direccion de envio
                                                    const constSociosNegocioDirecciones = await models.SociosNegocioDirecciones.findOne(
                                                    {
                                                        where: {
                                                            snd_direcciones_id: req.body.snd_direcciones_id
                                                        }
                                                    });

                                                    //Si la direccion de socio de negocio existe
                                                    if(constSociosNegocioDirecciones)
                                                    {

                                                        var estadoValor = ''
                                                        var paisValor = ''

                                                        //Obtener Estado Nombre
                                                        const constEstado = await models.Estado.findOne(
                                                        {
                                                            where: {
                                                                estpa_estado_pais_id: constSociosNegocioDirecciones.snd_estado_id
                                                            }
                                                        });

                                                        //Si el estado no jala dara error
                                                        if(constEstado)
                                                        {
                                                            estadoValor = constEstado.dataValues.estpa_estado_nombre
                                                        }
                                                        else
                                                        {
                                                            res.status(300).send(
                                                            {
                                                                message: 'el estado-pais no esta asignado en la direccion de envio.',
                                                            })
                                                        }

                                                        
                                                        //Obtener Pais Nombre
                                                        const constPais = await models.Pais.findOne(
                                                        {
                                                            where: {
                                                                pais_pais_id: constSociosNegocioDirecciones.snd_pais_id
                                                            }
                                                        });

                                                        if(constPais)
                                                        {
                                                            paisValor = constPais.dataValues.pais_nombre
                                                        }
                                                        else
                                                        {
                                                            res.status(300).send(
                                                            {
                                                                message: 'El pais no esta asignado a la direccion de envio.',
                                                            })
                                                        }

                                                        
                                                        //validacion adicional para ver si se settearon correctamente las variables
                                                        if(estadoValor != '' && paisValor != '')
                                                        {

                                                            //Set Direccion Entrega
                                                            var constSND = constSociosNegocioDirecciones.dataValues;
                                                            var direccionEntrega = constSND.snd_direccion +", "+ constSND.snd_direccion_num_int +", "
                                                                                    + constSND.snd_ciudad +", "+ constSND.snd_colonia +", "+ constSND.snd_codigo_postal 
                                                                                    +", "+ estadoValor +", "+ paisValor

                                                    












                                                            


                                                            //OBTENER IMPUESTO
                                                            var codPostalBase = constSociosNegocioDirecciones.snd_codigo_postal
                                                            const constCodigosPostales = await models.CodigosPostales.findOne(
                                                            {
                                                                where: {
                                                                    cp_codigo_postal: String(codPostalBase)
                                                                }
                                                            });


                                                            var ImpuestoFinal = ''

                                                            if(constCodigosPostales.dataValues.cp_frontera == 0)
                                                            {
                                                                ImpuestoFinal = "IVAP16"
                                                            }
                                                            else
                                                            {
                                                                ImpuestoFinal = "IVAP8"
                                                            }



                                                            //Si el impuesto esta bien too bien.
                                                            if(ImpuestoFinal != '')
                                                            {
                                                                

                                                                //obtener fletera
                                                                const constFleteras = await models.Fleteras.findOne(
                                                                {
                                                                    where: {
                                                                        flet_fletera_id: req.body.flet_fletera_id
                                                                    }
                                                                });

                                                                if(constFleteras)
                                                                {
                                                                    var codigoFleteraSap = constFleteras.flet_codigo;


                                                                    if(constSociosNegocio.dataValues.sn_razon_social == null)
                                                                    {
                                                                        res.status(300).send(
                                                                        {
                                                                            message: 'el SN no tiene razon social.',
                                                                        })
                                                                    }
                                                                    else if(constSociosNegocio.dataValues.sn_rfc == null)
                                                                    {
                                                                        res.status(300).send(
                                                                        {
                                                                            message: 'el SN no tiene rfc.',
                                                                        })
                                                                    }
                                                                    else if(constSociosNegocio.dataValues.sn_cfdi == null)
                                                                    {
                                                                        res.status(300).send(
                                                                        {
                                                                            message: 'el SN no tiene cfdi.',
                                                                        })
                                                                    }







                                                                    //JSON BODY que se mandara al crear la peticion
                                                                    // const dataCreateOrder = 
                                                                    // {
                                                                    //     "codigoCliente": constSociosNegocio.dataValues.sn_cardcode,
                                                                    //     "idPortal": constCompraFinalizada.dataValues.cf_compra_numero_orden,
                                                                    //     "razonSocial": constSociosNegocio.dataValues.sn_razon_social,
                                                                    //     "rfc": constSociosNegocio.dataValues.sn_rfc,
                                                                    //     "email": constSociosNegocio.dataValues.sn_email_facturacion,
                                                                    //     "comentarios": "",
                                                                    //     "fechaContabilizacion": fechaTotal,
                                                                    //     "fechaVencimiento": fechaTotal,
                                                                    //     "fechaReferencia": fechaTotal,
                                                                    //     "referencia": constCompraFinalizada.dataValues.cf_compra_numero_orden,
                                                                    //     "moneda": "MXP",
                                                                    //     "fletera": codigoFleteraSap,
                                                                    //     "direccionEntrega": direccionEntrega,
                                                                    //     "direccionFactura": direccionFacturacion,
                                                                    //     "metodoPago": constCompraFinalizada.dataValues.cf_sap_metodos_pago_codigo,
                                                                    //     "formaPago": constCompraFinalizada.dataValues.cf_sap_forma_pago_codigo,
                                                                    //     "usoCfdi":constSociosNegocio.dataValues.sn_cfdi,
                                                                    //     "lineas": array
                                                                    // }






                                                                    res.status(200).send(
                                                                    {
                                                                        message: 'TODO BIEN LLEGO AL FINAL.',
                                                                    })





























                                                                }
                                                                //no existe la fletera
                                                                else
                                                                {
                                                                    res.status(300).send(
                                                                    {
                                                                        message: 'Envio a domicilio: fletera no existe.',
                                                                    })
                                                                }




                                                            }
                                                            else
                                                            {
                                                                res.status(300).send(
                                                                {
                                                                    message: 'El impuesto no fue colocado correctamente.',
                                                                })
                                                            }
                                                            


                                                        }
                                                        else
                                                        {
                                                            res.status(300).send(
                                                            {
                                                                message: 'error al settear las variables estado y pais de direccion de envio.',
                                                            })
                                                        }


                                                        



                                                    }
                                                    //direccion socio negocio no existe
                                                    else
                                                    {
                                                        res.status(300).send(
                                                        {
                                                            message: 'la direccion de envio del socio de negocio no existe.',
                                                        })
                                                    }










                                                }
                                                //RECOLECCION
                                                else
                                                {
                                                    //Buscar direccion de entrega recoleccion
                                                    const constAlmacenes = await models.Almacenes.findOne(
                                                    {
                                                        where: {
                                                            alm_almacen_id: req.body.almacen_recoleccion
                                                        }
                                                    });

                                                    //almacenAsignadoPerProducto = constAlmacenes.alm_codigoAlmacen;

                                                    constAlm = constAlmacenes.dataValues;



                                                    //Si el almacen existe trara la infromacion de entrega?
                                                    if(constAlm)
                                                    {

                                                        var estadoValor = ''
                                                        var paisValor = ''

                                                        //Obtener Estado Nombre
                                                        const constEstado = await models.Estado.findOne(
                                                        {
                                                            where: {
                                                                estpa_estado_pais_id: constAlm.alm_estado_pais_id
                                                            }
                                                        });

                                                        //Si el estado no jala dara error
                                                        if(constEstado)
                                                        {
                                                            estadoValor = constEstado.dataValues.estpa_estado_nombre
                                                        }
                                                        else
                                                        {
                                                            res.status(300).send(
                                                            {
                                                                message: 'el estado-pais no esta asignado en la direccion de envio.',
                                                            })
                                                        }

                                                        
                                                        //Obtener Pais Nombre
                                                        const constPais = await models.Pais.findOne(
                                                        {
                                                            where: {
                                                                pais_pais_id: constAlm.alm_pais_id
                                                            }
                                                        });

                                                        if(constPais)
                                                        {
                                                            paisValor = constPais.dataValues.pais_nombre
                                                        }
                                                        else
                                                        {
                                                            res.status(300).send(
                                                            {
                                                                message: 'El pais no esta asignado a la direccion de envio.',
                                                            })
                                                        }

                                                        
                                                        //validacion adicional para ver si se settearon correctamente las variables
                                                        if(estadoValor != '' && paisValor != '')
                                                        {

                                                            //Set Direccion Entrega
                                                            var constSND = constSociosNegocioDirecciones.dataValues;
                                                            var direccionEntrega = constSND.snd_direccion +", "+ constSND.snd_direccion_num_int +", "
                                                                                    + constSND.snd_ciudad +", "+ constSND.snd_colonia +", "+ constSND.snd_codigo_postal 
                                                                                    +", "+ estadoValor +", "+ paisValor

                                                    












                                                            


                                                            //OBTENER IMPUESTO
                                                            var codPostalBase = constSociosNegocioDirecciones.snd_codigo_postal
                                                            const constCodigosPostales = await models.CodigosPostales.findOne(
                                                            {
                                                                where: {
                                                                    cp_codigo_postal: String(codPostalBase)
                                                                }
                                                            });


                                                            var ImpuestoFinal = ''

                                                            if(constCodigosPostales.dataValues.cp_frontera == 0)
                                                            {
                                                                ImpuestoFinal = "IVAP16"
                                                            }
                                                            else
                                                            {
                                                                ImpuestoFinal = "IVAP8"
                                                            }



                                                            //Si el impuesto esta bien too bien.
                                                            if(ImpuestoFinal != '')
                                                            {
                                                                

                                                                //obtener fletera
                                                                const constFleteras = await models.Fleteras.findOne(
                                                                {
                                                                    where: {
                                                                        flet_fletera_id: req.body.flet_fletera_id
                                                                    }
                                                                });

                                                                if(constFleteras)
                                                                {
                                                                    var codigoFleteraSap = constFleteras.flet_codigo;


                                                                    if(constSociosNegocio.dataValues.sn_razon_social == null)
                                                                    {
                                                                        res.status(300).send(
                                                                        {
                                                                            message: 'el SN no tiene razon social.',
                                                                        })
                                                                    }
                                                                    else if(constSociosNegocio.dataValues.sn_rfc == null)
                                                                    {
                                                                        res.status(300).send(
                                                                        {
                                                                            message: 'el SN no tiene rfc.',
                                                                        })
                                                                    }
                                                                    else if(constSociosNegocio.dataValues.sn_cfdi == null)
                                                                    {
                                                                        res.status(300).send(
                                                                        {
                                                                            message: 'el SN no tiene cfdi.',
                                                                        })
                                                                    }
                                                                    else
                                                                    {
                                                                        res.status(200).send(
                                                                        {
                                                                            message: 'TODO BIEN LLEGO AL FINAL.',
                                                                        })
                                                                    }







                                                                    //JSON BODY que se mandara al crear la peticion
                                                                    // const dataCreateOrder = 
                                                                    // {
                                                                    //     "codigoCliente": constSociosNegocio.dataValues.sn_cardcode,
                                                                    //     "idPortal": constCompraFinalizada.dataValues.cf_compra_numero_orden,
                                                                    //     "razonSocial": constSociosNegocio.dataValues.sn_razon_social,
                                                                    //     "rfc": constSociosNegocio.dataValues.sn_rfc,
                                                                    //     "email": constSociosNegocio.dataValues.sn_email_facturacion,
                                                                    //     "comentarios": "",
                                                                    //     "fechaContabilizacion": fechaTotal,
                                                                    //     "fechaVencimiento": fechaTotal,
                                                                    //     "fechaReferencia": fechaTotal,
                                                                    //     "referencia": constCompraFinalizada.dataValues.cf_compra_numero_orden,
                                                                    //     "moneda": "MXP",
                                                                    //     "fletera": codigoFleteraSap,
                                                                    //     "direccionEntrega": direccionEntrega,
                                                                    //     "direccionFactura": direccionFacturacion,
                                                                    //     "metodoPago": constCompraFinalizada.dataValues.cf_sap_metodos_pago_codigo,
                                                                    //     "formaPago": constCompraFinalizada.dataValues.cf_sap_forma_pago_codigo,
                                                                    //     "usoCfdi":constSociosNegocio.dataValues.sn_cfdi,
                                                                    //     "lineas": array
                                                                    // }






                                                                    





























                                                                }
                                                                //no existe la fletera
                                                                else
                                                                {
                                                                    res.status(300).send(
                                                                    {
                                                                        message: 'Envio a domicilio: fletera no existe.',
                                                                    })
                                                                }




                                                            }
                                                            else
                                                            {
                                                                res.status(300).send(
                                                                {
                                                                    message: 'El impuesto no fue colocado correctamente.',
                                                                })
                                                            }
                                                            


                                                        }
                                                        else
                                                        {
                                                            res.status(300).send(
                                                            {
                                                                message: 'error al settear las variables estado y pais de direccion de envio.',
                                                            })
                                                        }


                                                        



                                                    }
                                                    //direccion socio negocio no existe
                                                    else
                                                    {
                                                        res.status(300).send(
                                                        {
                                                            message: 'la direccion de envio del socio de negocio no existe.',
                                                        })
                                                    }

                                                }//FIN RECOLECCION




















                                            }













                                            //Error al settear direccion de facturacion completa
                                            else
                                            {



                                                res.status(300).send(
                                                {
                                                    message: 'Error al setear variable con direccion facturacion completa',
                                                })
                                            }
                                        }






                                        //Por si fallo algo en facturacion
                                        else
                                        {
                                            res.status(300).send(
                                            {
                                                message: 'Facturacion: Campo pais o estado no tienen dato: Estado: '+ estadoValorFacturacion + '   Pais: '+paisValorFacturacion,
                                            })
                                        }
                                        
                                    }
















                                    //SI NO ENCONTRO DIRECCION DE FACTURACION ARROJARA ERROR
                                    else
                                    {
                                        res.status(300).send(
                                        {
                                            message: 'Socio de negocio NO TIENE ASIGNADO UNA DIRECCION DE FACTURACION.',
                                        })
                                    }

                                    //Fin Crear direccion entrega











                    }














                    //Mandara error si el sn no existe
                    else
                    {
                        res.status(300).send(
                        {
                            message: 'Socio de negocio no existe.',
                        })
                    }


                    //console.log(constSociosNegocio)






                   





                    // if(constCompraFinalizada.dataValues.cf_cmm_tipo_envio_id == 17)
                    // {


                }
                //Si no tiene articulos el carrito mandara error
                else
                {
                    res.status(300).send(
                    {
                        message: 'El carrito existe pero no tiene articulos registrados.',
                    })
                }





            }
            //Si la orden no existe se mandara 
            else
            {
                res.status(300).send(
                {
                    message: 'NO EXISTE EL CARRITO DE COMPRAS.',
                })
            }












        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },
































































    IntegracionCrearOrdenSap: async(req, res, next) =>{
        var d = new Date();
        var dia = d.getDate();
        var mes = d.getMonth() + 1;
        var año = d.getYear() + 1900;

        if(mes < 10)
        {
            mes = "0"+mes;
        }
        if(dia < 10)
        {
            dia = "0"+dia;
        }

        var fechaTotal = año.toString()+mes.toString()+dia.toString();

        try{





            //EN BASE AL NUMERO DE ORDEN (NO ID) CARGA SU INFORMACION DE LA TABLA COMPRASFINALIZADAS 
            const constCompraFinalizada = await models.CompraFinalizada.findOne(
            {
                where: {
                    cf_compra_numero_orden: req.body.cf_compra_numero_orden
                }
            });



            //CARGA LOS PRODUCTOS DE LA ORDEN DESDE LA TABLA PRODUCTOSCOMPRASFINALIZADAS
            const constProductoCompraFinalizada = await models.ProductoCompraFinalizada.findAll(
            {
                where: {
                    pcf_cf_compra_finalizada_id: constCompraFinalizada.dataValues.cf_compra_finalizada_id
                },
            });




            //OBTIENE LA INFORMACION DEL SOCIO DE NEGOCIO A PARTIR DE LA ORDEN
            const constSociosNegocio = await models.SociosNegocio.findOne(
            {
                where: {
                    sn_socios_negocio_id: constCompraFinalizada.dataValues.cf_vendido_a_socio_negocio_id
                }
            });





            var almacenAsignadoPerProducto = '';
            var constAlm = ''





            //Si es recoleccion buscara la informacion del almacen y la guardara en una variable
            if(constCompraFinalizada.dataValues.cf_cmm_tipo_envio_id == 17)
            {
                //Obtener informacion del almacen a partir de la orden
                const constAlmacenes = await models.Almacenes.findOne(
                {
                    where: {
                        alm_almacen_id: constCompraFinalizada.dataValues.cf_alm_almacen_recoleccion
                    }
                });

                almacenAsignadoPerProducto = constAlmacenes.alm_codigoAlmacen;
                constAlm = constAlmacenes.dataValues;
            }
            //Si el tipo de envio es 16 sera envio a domicilio, buscara el almacen asignado a un 
            //cliente apartir de la informacion del SN
            else
            {


                if(constSociosNegocio.sn_almacen_asignado == '' || constSociosNegocio.sn_almacen_asignado == null)
                {   
                    console.log("ewntrt")
                    //Obtener infromacion de envio desde la direccion selecionada
                    const constSociosNegocioDirecciones2 = await models.SociosNegocioDirecciones.findOne(
                    {
                        where: {
                            snd_direcciones_id: constCompraFinalizada.dataValues.cf_direccion_envio_id
                        }
                    });

                    //Obtener Estado Nombre
                    const constEstado2 = await models.Estado.findOne(
                    {
                        where: {
                            estpa_estado_pais_id: constSociosNegocioDirecciones2.snd_estado_id
                        }
                    });
                    var estadoValor2 = constEstado2.dataValues.estpa_estado_nombre



                    //Obtener almacen de logistica
                    const AlmacenesLogistica = await models.AlmacenesLogistica.findOne(
                    {
                        where: {
                            almlog_estpa_estado_pais_nombre: estadoValor2
                        }
                    });

                    //dar valor al almacen asignado
                    almacenAsignadoPerProducto = AlmacenesLogistica.almlog_almacen_codigo


                }
                //Cuando Tiene un almacen asignado la mercancia saldra ahi
                else
                {
                    console.log("NO ENTRO")
                    almacenAsignadoPerProducto = constSociosNegocio.sn_almacen_asignado
                }
                
            }








            //Obtener impuesto total en base a si es recoleccion o envio a domicilio
            var ImpuestoFinal = '';





            //OBTENER IMPUESTO REC O ENVIO y crear direccion de envio
                //ENVIO A DOMICILIO
                if(constCompraFinalizada.cf_cmm_tipo_envio_id == 16)
                {
                    //Crear Direccion entrega apartir de un ID
                    //CARGA INFORMACION DE ENVIO DESDE LA TABLA DIRECCION A PARTIR DE LO QUE SE GUARDO EN LA COMPRA
                    const constSociosNegocioDirecciones = await models.SociosNegocioDirecciones.findOne(
                    {
                        where: {
                            snd_direcciones_id: constCompraFinalizada.dataValues.cf_direccion_envio_id
                        }
                    });

                    //Si la direccion de socio de negocio existe
                    if(constSociosNegocioDirecciones)
                    {


                        //Obtener Estado Nombre
                        const constEstado = await models.Estado.findOne(
                        {
                            where: {
                                estpa_estado_pais_id: constSociosNegocioDirecciones.snd_estado_id
                            }
                        });

                        var estadoValor = constEstado.dataValues.estpa_estado_nombre





                        //Obtener Pais Nombre
                        const constPais = await models.Pais.findOne(
                        {
                            where: {
                                pais_pais_id: constSociosNegocioDirecciones.snd_pais_id
                            }
                        });

                        var paisValor = constPais.dataValues.pais_nombre




                        //Set Direccion Entrega
                        var constSND = constSociosNegocioDirecciones.dataValues;
                        var direccionEntrega = constSND.snd_direccion +", "+ constSND.snd_direccion_num_int +", "+ constSND.snd_ciudad +", "+ constSND.snd_colonia +", "+ constSND.snd_codigo_postal +", "+ estadoValor +", "+ paisValor

                    


                        //OBTENER IMPUESTO
                        var codPostalBase = constSociosNegocioDirecciones.snd_codigo_postal
                        const constCodigosPostales = await models.CodigosPostales.findOne(
                        {
                            where: {
                                cp_codigo_postal: String(codPostalBase)
                            }
                        });


                        if(constCodigosPostales.dataValues.cp_frontera == 0)
                        {
                            ImpuestoFinal = "IVAP16"
                        }
                        else
                        {
                            ImpuestoFinal = "IVAP8"
                        }
                    }


                }

                //RECOLECCION
                else
                {
                    //Crear direccion entrega apartir de un ID de almacen cuando es recoleccion
                    //Set Direccion Entrega
                    var direccionEntrega = constAlm.alm_direccion


                    //OBTENER IMPUESTO
                    var codPostalBase = constAlm.alm_codigo_postal
                    
                    const constCodigosPostales = await models.CodigosPostales.findOne(
                    {
                        where: {
                            cp_codigo_postal: String(codPostalBase)
                        }
                    });

                    if(constCodigosPostales.dataValues.cp_frontera == 0)
                    {
                        ImpuestoFinal = "IVAP16"
                    }
                    else
                    {
                        ImpuestoFinal = "IVAP8"
                    }

                }

            //


            


            //Crear Direccion Facturacion

                //Direccion de SOCIO DE NEGOCIO
                const constSociosNegocioDireccionesFacturacion = await models.SociosNegocioDirecciones.findOne(
                {
                    where: {
                        snd_tipoDir: "B",
                        snd_cardcode: constSociosNegocio.dataValues.sn_cardcode,
                        snd_idDireccion: constSociosNegocio.dataValues.sn_codigo_direccion_facturacion
                    }
                });

                if(constSociosNegocioDireccionesFacturacion)
                {
                    //Obtener Estado Nombre
                    const constEstadoFacturacion = await models.Estado.findOne(
                    {
                        where: {
                            estpa_estado_pais_id: constSociosNegocioDireccionesFacturacion.snd_estado_id
                        }
                    });
                    var estadoValorFacturacion = constEstadoFacturacion.dataValues.estpa_estado_nombre

                    //Obtener Pais Nombre
                    const constPaisFacturacion = await models.Pais.findOne(
                    {
                        where: {
                            pais_pais_id: constSociosNegocioDireccionesFacturacion.snd_pais_id
                        }
                    });
                    var paisValorFacturacion = constPaisFacturacion.dataValues.pais_nombre

                    // //Set Direccion FACTURACION
                    var constSNDFacturacion = constSociosNegocioDireccionesFacturacion.dataValues;
                    var direccionFacturacion = constSNDFacturacion.snd_direccion +", "+ constSNDFacturacion.snd_direccion_num_int +", "+ constSNDFacturacion.snd_ciudad +", "+ constSNDFacturacion.snd_colonia +", "+ constSNDFacturacion.snd_codigo_postal +", "+ estadoValorFacturacion +", "+ paisValorFacturacion
                }

            //Fin Crear direccion entrega


           

            //Obtener Fletera
            //CUANDO ES ENVIO A CASA SE OBTIENE LA FLETERA
            if(constCompraFinalizada.cf_cmm_tipo_envio_id == 16)
            {
                const constFleteras = await models.Fleteras.findOne(
                {
                    where: {
                        flet_fletera_id: constCompraFinalizada.dataValues.cf_fletera_id
                    }
                });


                var codigoFleteraSap = constFleteras.flet_codigo;

            }
            //Si es recoleccion fleteras sera 1 (sujeto a cambios)
            else
            {
                var codigoFleteraSap = '';
            }


            var array = [];
            






            //Obtener Lineas /Productos poner el acuerdo
            for (var i = 0; i < constProductoCompraFinalizada.length; i++) 
            {
                //Busca el SKU de los productos que se mandara
                const constProducto = await models.Producto.findOne(
                {
                    where: {
                        prod_producto_id: constProductoCompraFinalizada[i].dataValues.pcf_prod_producto_id
                    }
                });

                //Variable para Lineas

                const data = await sequelize.query(`
                SELECT lpro.*, pro.moneda, pro."idProyecto" FROM socios_negocio AS sn
                INNER JOIN proyectos AS pro ON pro."codigoCliente" = sn.sn_cardcode
                INNER JOIN lineas_proyectos AS lpro ON lpro."idProyecto" = pro."id"
                WHERE sn.sn_socios_negocio_id = '${constSociosNegocio.sn_socios_negocio_id}'
                AND lpro."codigoArticulo" = '${constProducto.dataValues.prod_sku}'
                AND pro.estatus = 'Autorizado' AND CURRENT_DATE < "date"(pro."fechaVencimiento")`,
            {
                type: sequelize.QueryTypes.SELECT 
            });
            const newProductProyect =data[0];
                  //Variable para Lineas 
                var jsonArray = {
                    "codigoArticulo": constProducto.dataValues.prod_sku,
                    "codigoAlmacen": almacenAsignadoPerProducto,
                    "precioUnitario":newProductProyect ? Number(newProductProyect.precio): constProductoCompraFinalizada[i].dataValues.pcf_precio,
                    "codigoImpuesto": ImpuestoFinal,
                    "cantidad": constProductoCompraFinalizada[i].dataValues.pcf_cantidad_producto,
                    "acuerdoG": newProductProyect ? parseInt(newProductProyect.idProyecto) : null
                }
               
          
             
                array.push(jsonArray);
            }

            //JSON BODY que se mandara al crear la peticion
            const dataCreateOrder = 
            {
                "codigoCliente": constSociosNegocio.dataValues.sn_cardcode,
                "idPortal": constCompraFinalizada.dataValues.cf_compra_numero_orden,
                "razonSocial": constSociosNegocio.dataValues.sn_razon_social,
                "rfc": constSociosNegocio.dataValues.sn_rfc,
                "email": constSociosNegocio.dataValues.sn_email_facturacion,
                "comentarios": "",
                "fechaContabilizacion": fechaTotal,
                "fechaVencimiento": fechaTotal,
                "fechaReferencia": fechaTotal,
                "referencia": constCompraFinalizada.dataValues.cf_compra_numero_orden,
                "moneda": "MXP",
                "fletera": codigoFleteraSap,
                "direccionEntrega": direccionEntrega,
                "direccionFactura": direccionFacturacion,
                "metodoPago": constCompraFinalizada.dataValues.cf_sap_metodos_pago_codigo,
                "formaPago": constCompraFinalizada.dataValues.cf_sap_forma_pago_codigo,
                "usoCfdi":constSociosNegocio.dataValues.sn_cfdi,
                "lineas": array
            }


            console.log(dataCreateOrder)










            //INTEGRAR
            var options = {
                'method': 'POST',
                'url': process.env.INTEGRATIONS_URL + '/Service1.svc/OrdenVenta',
                'headers': 
                {
                    'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid',
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(dataCreateOrder)
            };

            var result = await request(options, function (error, response) 
            {
                if (error) throw new Error(error);
            });

            var resultJson = JSON.parse(result);
            











            if(resultJson)
            {
                if(resultJson.descripcion == "ERROR - Este documento ya ha sido creado en SAP")
                {
                    resultJson.estatus = 2
                }
                const bodyUpdate = {
                    "cf_descripcion_sap" :  resultJson.descripcion,
                    "cf_estatus_creacion_sap" :  resultJson.estatus,
                };
                // console.log(bodyUpdate)
                await constCompraFinalizada.update(bodyUpdate);
            }






            //Response
            res.status(200).send(
            {
                message: 'Proceso Orden Creado terminado con exito.'
                // dataCreateOrder
                // resultJson,
                // resultJson
            })
            




        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },


    IntegracionAutoCrearOrdenSap: async(req, res, next) =>{
        var BackUrl = '';
        if(process.env.PORT == 7000)
        {
            BackUrl = "http://70.35.204.203/back2"
        }
        else if(process.env.PORT == 8000)
        {
            BackUrl = "http://70.35.204.203/back"
        }
        else
        {
            BackUrl = "http://localhost:5000"
        }

        var d = new Date();
        var dia = d.getDate();
        var mes = d.getMonth() + 1;
        var año = d.getYear() + 1900;
        if(mes < 10)
        {
            mes = "0"+mes;
        }
        var fechaTotal = año.toString()+mes.toString()+dia.toString();

        try{

            //Carga todas las ordenes con status diferente 2
            const constCompraFinalizadaTotal = await models.CompraFinalizada.findAll(
            {
                // where: {
                //     [Op.or]: 
                //     [
                //         {
                //             cf_estatus_creacion_sap: { [Op.ne] : 2 }
                //         }, 
                //         {
                //             cf_estatus_creacion_sap: null
                //         }
                //     ]
                // }
                where: {
                    [Op.and]: 
                    [
                        {
                            cf_estatus_creacion_sap: { [Op.ne] : 2 }
                        }, 
                        {
                            cf_estatus_creacion_sap: { [Op.ne] : null }
                        }
                    ]
                },
            });

            //Ordenes normales sin precios USD
            var ListaDeOrdenesIntentadasCrearSap = []
            for (var h = 0; h < constCompraFinalizadaTotal.length; h++) 
            {
                //Cargar informacion de la orden (compra finalizada) para luego actualizarla
                const constCompraFinalizadaUpdate = await models.CompraFinalizada.findOne(
                {
                    where: {
                        cf_compra_finalizada_id: constCompraFinalizadaTotal[h].dataValues.cf_compra_finalizada_id
                    }
                });

                ListaDeOrdenesIntentadasCrearSap.push(constCompraFinalizadaTotal[h].dataValues.cf_compra_finalizada_id)

                //Hacer variable json por los //" que puedan venir
                var bodyJson = JSON.parse(constCompraFinalizadaTotal[h].dataValues.cf_sap_json_creacion)

                //INTEGRAR
                var options = {
                    'method': 'POST',
                    'url': process.env.INTEGRATIONS_URL + '/Service1.svc/OrdenVenta',
                    'headers': 
                    {
                        'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(bodyJson)
                };

                var result = await request(options, function (error, response) 
                {
                });

                var resultJson = JSON.parse(result);

                if(resultJson)
                {
                    if(resultJson.descripcion == "ERROR - Este documento ya ha sido creado en SAP")
                    {
                        resultJson.estatus = 2
                    }

                    const bodyUpdate = {
                        "cf_descripcion_sap" :  resultJson.descripcion,
                        "cf_estatus_creacion_sap" :  resultJson.estatus
                    };


                    await constCompraFinalizadaUpdate.update(bodyUpdate);
                }
                else
                {
                    const bodyUpdate = {
                        "cf_descripcion_sap" :  "se genero un error al momento de crear la orden JSON",
                        "cf_estatus_creacion_sap" :  "-1"
                    };
                    await constCompraFinalizadaUpdate.update(bodyUpdate);
                }




















                // var OrdenNumero = constCompraFinalizadaTotal[h].dataValues.cf_compra_numero_orden

                // const options = {
                //     method: 'POST',
                //     url: BackUrl + '/api/integraciones_info_transfer/IntegracionCrearOrdenSap/',
                //     headers: {'Content-Type': 'application/json'},
                //     body: {cf_compra_numero_orden: OrdenNumero},
                //     json: true
                // };

                // var result = await request(options, function (error, response) 
                // {
                //     if (error) throw new Error(error);
                // });
                // result.orden = OrdenNumero
                // ListaDeOrdenesIntentadasCrearSap.push(result)
                //var resultJson = JSON.parse(result);
            }






















            //ORDENES EN USD
            //Carga todas las ordenes con status diferente 2
            const constCompraFinalizadaTotalUSD = await models.CompraFinalizada.findAll(
            {
                // where: {
                //     [Op.or]: 
                //     [
                //         {
                //             cf_estatus_creacion_sap_usd: { [Op.ne] : 2 }
                //         }, 
                //         {
                //             cf_estatus_creacion_sap_usd: null
                //         }
                //     ]
                // }
                where: {
                    [Op.and]: 
                    [
                        {
                            cf_estatus_creacion_sap_usd: { [Op.ne] : 2 }
                        }, 
                        {
                            cf_estatus_creacion_sap_usd: { [Op.ne] : null }
                        }
                    ]
                },
            });

            //Ordenes CON USD
            var ListaDeOrdenesIntentadasCrearSapUSD = []
            for (var h = 0; h < constCompraFinalizadaTotalUSD.length; h++) 
            {
                //Cargar informacion de la orden (compra finalizada) para luego actualizarla
                const constCompraFinalizadaUpdateUSD = await models.CompraFinalizada.findOne(
                {
                    where: {
                        cf_compra_finalizada_id: constCompraFinalizadaTotalUSD[h].dataValues.cf_compra_finalizada_id
                    }
                });

                ListaDeOrdenesIntentadasCrearSapUSD.push(constCompraFinalizadaTotalUSD[h].dataValues.cf_compra_finalizada_id)

                //Hacer variable json por los //" que puedan venir
                var bodyJson = JSON.parse(constCompraFinalizadaTotalUSD[h].dataValues.cf_sap_json_creacion)

                //INTEGRAR
                var options = {
                    'method': 'POST',
                    'url': process.env.INTEGRATIONS_URL + '/Service1.svc/OrdenVenta',
                    'headers': 
                    {
                        'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(bodyJson)
                };

                console.log(options)

                var resultUSD = await request(options, function (error, response) 
                {
                });

                var resultJsonUSD = JSON.parse(resultUSD);

                if(resultJsonUSD)
                {
                    if(resultJsonUSD.descripcion == "ERROR - Este documento ya ha sido creado en SAP")
                    {
                        resultJsonUSD.estatus = 2
                    }

                    const bodyUpdate = {
                        "cf_descripcion_sap_usd" :  resultJsonUSD.descripcion,
                        "cf_estatus_creacion_sap_usd" :  resultJsonUSD.estatus
                    };


                    await constCompraFinalizadaUpdateUSD.update(bodyUpdate);
                }
                else
                {
                    const bodyUpdate = {
                        "cf_descripcion_sap_usd" :  "se genero un error al momento de crear la orden JSON",
                        "cf_estatus_creacion_sap_usd" :  "-1"
                    };
                    await constCompraFinalizadaUpdateUSD.update(bodyUpdate);
                }


            }







            //Response
            res.status(200).send(
            {
                message: 'Proceso AUTO Crear ordenes sap terminado con exito.',
                ListaDeOrdenesIntentadasCrearSap,
                ListaDeOrdenesIntentadasCrearSapUSD
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },


    //Transfiere la informacion de la tabla raw nombres listas precios a la listas de precios pcp
    IntegracionAutorizarOrdenSap: async(req, res, next) =>{
        try{
            var ordenVentaNum = req.body.cf_compra_numero_orden
            var eleccion = req.body.eleccion


            //JSON BODY que se mandara al crear la peticion
            const AuthPutJson = 
            {
                "idPortal": ordenVentaNum,
                "eleccion": eleccion
            }



            var options = {
                'method': 'POST',
                'url': process.env.INTEGRATIONS_URL + '/Service1.svc/OrdenVenta',
                'headers': 
                {
                    'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid',
                    'Content-Type': 'application/json'
                },
            body: JSON.stringify(AuthPutJson)

            };

            var result = await request(options, function (error, response) 
            {
                if (error) throw new Error(error);
            });

            var resultJson = JSON.parse(result);
            


            //Response
            res.status(200).send(
            {
                message: 'Proceso Auth Orden terminado con exito.',
                resultJson
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },


    //Transfiere la informacion de la tabla raw nombres listas precios a la listas de precios pcp
    IntegracionActualizarOrdenes: async(req, res, next) =>{
        try{

            var ordenesMXN = []
            var ordenesUSD = []
  
            const constCompraFinalizada = await models.CompraFinalizada.findAll(
            {
                where: {
                    createdAt: {
                        [Op.gt]: sequelize.literal("NOW() - INTERVAL '240 HOURS'"),
                    },
                    cf_sap_json_creacion: { [Op.ne] : null },
                    [Op.or]: [
                        Sequelize.literal("cf_estatus_orden != 1000110 or cf_estatus_orden != 1000186"),
                    ]
                }
            });

            //Actualizar cada orden (SUBJETO A CAMBIOS PARA DESPUES USAR FECHAS TAL VEz?)
            for (var i = 0; i < constCompraFinalizada.length; i++) 
            {
                //Order id
                var orderID = constCompraFinalizada[i].dataValues.cf_compra_finalizada_id

                var orderJsonTemp = {
                    "orderID": orderID
                }

                

                //Si la orden se a creado con MXP
                if(constCompraFinalizada[i].dataValues.cf_estatus_creacion_sap != null)
                {
                    //OBTENER ORDEN BY ORDER NUM PCP
                    var options = {
                        'method': 'GET',
                        'url': process.env.INTEGRATIONS_URL + '/Service1.svc/OrdenVenta/'+constCompraFinalizada[i].dataValues.cf_compra_numero_orden,
                        'headers': {
                            'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                        }
                    };
                    
                    var result = await request(options, function (error, response) {
                    });

                    console.log('Resultados sap integrar', result)
                    var resultJson = JSON.parse(result);

                    //Busca la orden para luego actualizarla
                    const constCompraFinalizadaActualizarOrderNum = await models.CompraFinalizada.findOne(
                    {
                        where: {
                            cf_compra_numero_orden: constCompraFinalizada[i].dataValues.cf_compra_numero_orden
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });

                    if(constCompraFinalizadaActualizarOrderNum)
                    {
                        var statusOV = resultJson.documentos[0].estatusOV;
                        var StatusFinal = statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA[statusOV];
                        var mensajeOV = resultJson.documentos[0].mensajeOV;
                        var entregado = resultJson.documentos[0].entregado;



                        //Crea email de pedido confirmado
                        // if((constCompraFinalizada[i].dataValues.cf_estatus_orden == statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA.PENDIENTE || constCompraFinalizada[i].dataValues.cf_estatus_orden == statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA["REPLICA PENDIENTE"]) && (StatusFinal == statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA.ABIERTA || StatusFinal == statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA["AUTORIZACION PENDIENTE"]))
                        if(constCompraFinalizada[i].dataValues.cf_estatus_orden == statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA["Pendiente de confirmar"] && StatusFinal == statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA["En Proceso"])
                        {
                            await ordenAbiertaCreadaEmail(constCompraFinalizada[i].dataValues.cf_compra_finalizada_id);
                            // await ordenCreadaUsuarioDielsaEmail(constCompraFinalizada[i].dataValues.cf_compra_finalizada_id);
                        }

 
                        orderJsonTemp = {
                            "orderID": orderID,
                            "cf_estatus_orden": StatusFinal
                        }



                        const bodyUpdate = {
                            "cf_estatus_orden": StatusFinal,
                            "cf_mensajeov": mensajeOV,
                            "cf_sap_entregado": entregado,
                            updatedAt: Date()
                        };
                        await constCompraFinalizadaActualizarOrderNum.update(bodyUpdate);


                        //Crea email de replica error
                        if((constCompraFinalizada[i].dataValues.cf_estatus_orden == statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA.PENDIENTE || constCompraFinalizada[i].dataValues.cf_estatus_orden == statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA["REPLICA PENDIENTE"]) && (StatusFinal == statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA["REPLICA ERROR"]))
                        {
                            await ordenFallidaToSapEmail(constCompraFinalizada[i].dataValues.cf_compra_finalizada_id);


                            //Crear registro en tabla compras finalizadas SAP errores
                            const bodyCreate = {
                                "cfse_cf_compra_numero_orden": constCompraFinalizada[i].dataValues.cf_compra_numero_orden,
                                "cfse_cf_mensajeov": mensajeOV,
                                "cfse_cmm_estatus_id": statusControles.ESTATUS_COMPRAS_FINALIZADAS_SAP_ERRORES.ACTIVO
                            };
                            await models.CompraFinalizadaSAPErrores.create(bodyCreate);
                        }
                    }


                    var jsonLineaTemp = []

                    console.log(resultJson.documentos[0].lineas.length)
                    //Actualizar lineas
                    for (var u = 0; u < resultJson.documentos[0].lineas.length; u++) 
                    {
                        //Busca los productos de la orden para actualizar por linea
                        const constProducto = await models.Producto.findOne(
                        {
                            where: {
                                prod_sku: resultJson.documentos[0].lineas[u].codigoArticulo
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}   
                        })

                        //Si el producto existe actualizara el campo en el productos finalizados
                        if(constProducto)
                        {
                            jsonLineaTemp.push(resultJson.documentos[0].lineas[u].estatusLinea)
                            
                            console.log(constProducto)
                            //Busca los productos de la orden para actualizar por linea
                            const constProductoCompraFinalizada = await models.ProductoCompraFinalizada.findOne(
                            {
                                where: {
                                    pcf_cf_compra_finalizada_id: orderID,
                                    pcf_linea_num_sap: resultJson.documentos[0].lineas[u].linea,
                                    pcf_order_dividida_sap: false,
                                    pcf_prod_producto_id: constProducto.prod_producto_id
                                },
                                attributes: {exclude: ['createdAt', 'updatedAt']}   
                            })
                            //console.log('Empezamos las integraciones');
                            //console.log(constProductoCompraFinalizada)
                            //Crear correo para el cron de lineas que cambias de status
                            if(constProductoCompraFinalizada){

                                console.log('Empezamos las integraciones')
                            if(
                                (constProductoCompraFinalizada.pcf_linea_estatus_sap == 'En proceso' && resultJson.documentos[0].lineas[u].estatusLinea.slice(0, 11) == 'En tránsito')
                                || (constProductoCompraFinalizada.pcf_linea_estatus_sap == 'Pendiente de confirmar' && resultJson.documentos[0].lineas[u].estatusLinea.slice(0, 11) == 'En tránsito')
                                || (constProductoCompraFinalizada.pcf_linea_estatus_sap == null && resultJson.documentos[0].lineas[u].estatusLinea.slice(0, 11) == 'En tránsito')
                                )
                            {
                                const bodyCreate = {
                                    "cor_pcf_producto_compra_finalizada_id": constProductoCompraFinalizada.pcf_producto_compra_finalizada_id,
                                    "cor_cmm_tipo_correo": statusControles.TIPO_CORREO.TRANSITO,
                                    "cor_pcf_cf_compra_finalizada_id": constProductoCompraFinalizada.pcf_cf_compra_finalizada_id
                                };

                                await models.Correos.create(bodyCreate);
                            }

                            if(
                                (constProductoCompraFinalizada.pcf_linea_estatus_sap == 'En tránsito' && resultJson.documentos[0].lineas[u].estatusLinea.slice(0, 9) == 'Entregado')
                                || (constProductoCompraFinalizada.pcf_linea_estatus_sap == 'En proceso' && resultJson.documentos[0].lineas[u].estatusLinea.slice(0, 9) == 'Entregado')
                                || (constProductoCompraFinalizada.pcf_linea_estatus_sap == 'Pendiente de confirmar' && resultJson.documentos[0].lineas[u].estatusLinea.slice(0, 9) == 'Entregado')
                                || (constProductoCompraFinalizada.pcf_linea_estatus_sap == null && resultJson.documentos[0].lineas[u].estatusLinea.slice(0, 9) == 'Entregado')
                                )
                            {
                                const bodyCreate = {
                                    "cor_pcf_producto_compra_finalizada_id": constProductoCompraFinalizada.pcf_producto_compra_finalizada_id,
                                    "cor_cmm_tipo_correo": statusControles.TIPO_CORREO.ENTREGADO,
                                    "cor_pcf_cf_compra_finalizada_id": constProductoCompraFinalizada.pcf_cf_compra_finalizada_id
                                };

                                await models.Correos.create(bodyCreate);
                            }

                        

                            const bodyUpdate = {
                                pcf_linea_estatus_sap : resultJson.documentos[0].lineas[u].estatusLinea,
                                pcf_cantidad_entregada : resultJson.documentos[0].lineas[u].inventarioEntregado,
                                updatedAt: Date()
                            };
                            await constProductoCompraFinalizada.update(bodyUpdate);
                         }
                        }
                    }
                }

                orderJsonTemp.lineas = jsonLineaTemp

                ordenesMXN.push(orderJsonTemp)
            }































            const constCompraFinalizadaUSD = await models.CompraFinalizada.findAll(
            {
                where: {
                    createdAt: {
                        [Op.gt]: sequelize.literal("NOW() - INTERVAL '240 HOURS'"),
                    },
                    cf_sap_json_creacion_usd: { [Op.ne] : null },
                    [Op.or]: [
                        Sequelize.literal("cf_estatus_orden_usd != 1000110 or cf_estatus_orden_usd != 1000186"),
                    ]
                }
            });

            //Actualizar cada orden (SUBJETO A CAMBIOS PARA DESPUES USAR FECHAS TAL VEz?)
            for (var i = 0; i < constCompraFinalizadaUSD.length; i++) 
            {
                //Order id
                var orderID = constCompraFinalizadaUSD[i].dataValues.cf_compra_finalizada_id

                var orderJsonTemp = {
                    "orderID": orderID
                }


                //Si la orden se a creado con USD
                if(constCompraFinalizadaUSD[i].dataValues.cf_orden_dividida_sap != null)
                {
                    //OBTENER ORDEN BY ORDER NUM PCP
                    var options = {
                        'method': 'GET',
                        'url': process.env.INTEGRATIONS_URL + '/Service1.svc/OrdenVenta/'+constCompraFinalizadaUSD[i].dataValues.cf_orden_dividida_sap,
                        'headers': {
                            'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                        }
                    };
                    
                    var result = await request(options, function (error, response) 
                    {
                        if (error) throw new Error(error);
                    });

                    var resultJson = JSON.parse(result);

                    //Busca la orden para luego actualizarla
                    const constCompraFinalizadaActualizarOrderNumUSD = await models.CompraFinalizada.findOne(
                    {
                        where: {
                            cf_compra_numero_orden: constCompraFinalizadaUSD[i].dataValues.cf_compra_numero_orden
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });

                    if(constCompraFinalizadaActualizarOrderNumUSD)
                    {
                        var statusOV = resultJson.documentos[0].estatusOV;
                        var StatusFinal = statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA[statusOV];
                        var mensajeOV = resultJson.documentos[0].mensajeOV;
                        var entregado = resultJson.documentos[0].entregado;

                        orderJsonTemp = {
                            "orderID": orderID,
                            "cf_estatus_orden_usd": StatusFinal
                        }

                        const bodyUpdate = {
                            "cf_estatus_orden_usd": StatusFinal,
                            "cf_mensajeov_usd": mensajeOV,
                            "cf_sap_entregado_usd": entregado,
                            updatedAt: Date()
                        };
                        
                        await constCompraFinalizadaActualizarOrderNumUSD.update(bodyUpdate);

                        //Crea email de replica error
                        if((constCompraFinalizadaUSD[i].dataValues.cf_estatus_orden == statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA.PENDIENTE || constCompraFinalizadaUSD[i].dataValues.cf_estatus_orden == statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA["REPLICA PENDIENTE"]) && (StatusFinal == statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA["REPLICA ERROR"]))
                        {
                            await ordenFallidaToSapEmail(constCompraFinalizadaUSD[i].dataValues.cf_compra_finalizada_id);

                            //Crear registro en tabla compras finalizadas SAP errores
                            const bodyCreate = {
                                "cfse_cf_compra_numero_orden": constCompraFinalizadaUSD[i].dataValues.cf_orden_dividida_sap,
                                "cfse_cf_mensajeov": mensajeOV,
                                "cfse_cmm_estatus_id": statusControles.ESTATUS_COMPRAS_FINALIZADAS_SAP_ERRORES.ACTIVO
                            };
                            await models.CompraFinalizadaSAPErrores.create(bodyCreate);
                            
                        }
                    }
 

                    var jsonLineaTemp = []
                    //Actualizar lineas
                    for (var u = 0; u < resultJson.documentos[0].lineas.length; u++) 
                    {
                        //Busca los productos de la orden para actualizar por linea
                        const constProducto = await models.Producto.findOne(
                        {
                            where: {
                                prod_sku: resultJson.documentos[0].lineas[u].codigoArticulo
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}   
                        })

                        //Si el producto existe actualizara el campo en el productos finalizados
                        if(constProducto)
                        {
                            jsonLineaTemp.push(resultJson.documentos[0].lineas[u].estatusLinea)
                            //Busca los productos de la orden para actualizar por linea
                            const constProductoCompraFinalizada = await models.ProductoCompraFinalizada.findOne(
                            {
                                where: {
                                    pcf_cf_compra_finalizada_id: orderID,
                                    pcf_linea_num_sap: resultJson.documentos[0].lineas[u].linea,
                                    pcf_order_dividida_sap: true,
                                    pcf_prod_producto_id: constProducto.prod_producto_id
                                },
                                attributes: {exclude: ['createdAt', 'updatedAt']}   
                            })

                            //Crear correo para el cron de lineas que cambias de status
                            if(
                                (constProductoCompraFinalizada.pcf_linea_estatus_sap == 'En proceso' && resultJson.documentos[0].lineas[u].estatusLinea.slice(0, 11) == 'En tránsito')
                                || (constProductoCompraFinalizada.pcf_linea_estatus_sap == 'Pendiente de confirmar' && resultJson.documentos[0].lineas[u].estatusLinea.slice(0, 11) == 'En tránsito')
                                || (constProductoCompraFinalizada.pcf_linea_estatus_sap == null && resultJson.documentos[0].lineas[u].estatusLinea.slice(0, 11) == 'En tránsito')
                                )
                            {
                                //Crear registro en tabla compras finalizadas SAP errores
                                const bodyCreate = {
                                    "cor_pcf_producto_compra_finalizada_id": constProductoCompraFinalizada.pcf_producto_compra_finalizada_id,
                                    "cor_cmm_tipo_correo": statusControles.TIPO_CORREO.TRANSITO,
                                    "cor_pcf_cf_compra_finalizada_id": constProductoCompraFinalizada.pcf_cf_compra_finalizada_id
                                };

                                await models.Correos.create(bodyCreate);
                            }

                            if(
                                (constProductoCompraFinalizada.pcf_linea_estatus_sap.slice(0, 11) == 'En tránsito' && resultJson.documentos[0].lineas[u].estatusLinea.slice(0, 9) == 'Entregado')
                                || (constProductoCompraFinalizada.pcf_linea_estatus_sap == 'En proceso' && resultJson.documentos[0].lineas[u].estatusLinea.slice(0, 9) == 'Entregado')
                                || (constProductoCompraFinalizada.pcf_linea_estatus_sap == 'Pendiente de confirmar' && resultJson.documentos[0].lineas[u].estatusLinea.slice(0, 9) == 'Entregado')
                                || (constProductoCompraFinalizada.pcf_linea_estatus_sap == null && resultJson.documentos[0].lineas[u].estatusLinea.slice(0, 9) == 'Entregado')
                                )
                            {
                                //Crear registro en tabla compras finalizadas SAP errores
                                const bodyCreate = {
                                    "cor_pcf_producto_compra_finalizada_id": constProductoCompraFinalizada.pcf_producto_compra_finalizada_id,
                                    "cor_cmm_tipo_correo": statusControles.TIPO_CORREO.ENTREGADO,
                                    "cor_pcf_cf_compra_finalizada_id": constProductoCompraFinalizada.pcf_cf_compra_finalizada_id
                                };

                                await models.Correos.create(bodyCreate);
                            }

                            const bodyUpdate = {
                                pcf_linea_estatus_sap : resultJson.documentos[0].lineas[u].estatusLinea,
                                pcf_cantidad_entregada : resultJson.documentos[0].lineas[u].inventarioEntregado,
                                updatedAt: Date()
                            };
                            await constProductoCompraFinalizada.update(bodyUpdate);
                        }
                    }
                }

                orderJsonTemp.lineas = jsonLineaTemp
                ordenesUSD.push(orderJsonTemp)
            }




            //Response
            res.status(200).send(
            {
                message: 'Integrar actualizar Ordenes',
                ordenesMXN,
                ordenesUSD
            })
            
        }catch(e){
            console.log(e)
            res.status(500).send({
                message: 'Error en la petición:' + e,
                e
            });
            next(e);
        }
    },


    AnteriorIntegracionActualizarOrdenes: async(req, res, next) =>{

        try{
            
            const constCompraFinalizada = await models.CompraFinalizada.findAll(
            {
                where: {
                   createdAt: {
                        [Op.gt]: sequelize.literal("NOW() - INTERVAL '240 HOURS'"),
                    }
                }
            });

            console.log(constCompraFinalizada)

            //Actualizar cada orden (SUBJETO A CAMBIOS PARA DESPUES USAR FECHAS TAL VEz?)
            for (var i = 0; i < constCompraFinalizada.length; i++) 
            {
                //Order id
                var orderID = constCompraFinalizada[i].dataValues.cf_compra_finalizada_id
































                //Si la orden se a creado con MXP
                if(constCompraFinalizada[i].dataValues.cf_estatus_creacion_sap != null)
                {
                    //OBTENER ORDEN BY ORDER NUM PCP
                    var options = {
                        'method': 'GET',
                        'url': process.env.INTEGRATIONS_URL + '/Service1.svc/OrdenVenta/'+constCompraFinalizada[i].dataValues.cf_compra_numero_orden,
                        'headers': {
                            'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                        }
                    };
                    
                    var result = await request(options, function (error, response) 
                    {
                        // if (error) throw new Error(error);
                    });
                    var resultJson = JSON.parse(result);

                    //Busca la orden para luego actualizarla
                    const constCompraFinalizadaActualizarOrderNum = await models.CompraFinalizada.findOne(
                    {
                        where: {
                            cf_compra_numero_orden: constCompraFinalizada[i].dataValues.cf_compra_numero_orden
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });

                    if(constCompraFinalizadaActualizarOrderNum)
                    {
                        var statusOV = resultJson.documentos[0].estatusOV;
                        var StatusFinal = statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA[statusOV];
                        var mensajeOV = resultJson.documentos[0].mensajeOV;
                        var entregado = resultJson.documentos[0].entregado;

                        //Crea email de pedido confirmado
                        if((constCompraFinalizada[i].dataValues.cf_estatus_orden == statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA.PENDIENTE || constCompraFinalizada[i].dataValues.cf_estatus_orden == statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA["REPLICA PENDIENTE"]) && (StatusFinal == statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA.ABIERTA || StatusFinal == statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA["AUTORIZACION PENDIENTE"]))
                        {
                            await ordenAbiertaCreadaEmail(constCompraFinalizada[i].dataValues.cf_compra_finalizada_id);
                            // await ordenCreadaUsuarioDielsaEmail(constCompraFinalizada[i].dataValues.cf_compra_finalizada_id);
                        }


                        



                        const bodyUpdate = {
                            "cf_estatus_orden": StatusFinal,
                            "cf_mensajeov": mensajeOV,
                            "cf_sap_entregado": entregado,
                            updatedAt: Date()
                        };
                        await constCompraFinalizadaActualizarOrderNum.update(bodyUpdate);


                        //Crea email de replica error
                        if((constCompraFinalizada[i].dataValues.cf_estatus_orden == statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA.PENDIENTE || constCompraFinalizada[i].dataValues.cf_estatus_orden == statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA["REPLICA PENDIENTE"]) && (StatusFinal == statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA["REPLICA ERROR"]))
                        {
                            await ordenFallidaToSapEmail(constCompraFinalizada[i].dataValues.cf_compra_finalizada_id);


                            //Crear registro en tabla compras finalizadas SAP errores
                            const bodyCreate = {
                                "cfse_cf_compra_numero_orden": constCompraFinalizada[i].dataValues.cf_compra_numero_orden,
                                "cfse_cf_mensajeov": mensajeOV,
                                "cfse_cmm_estatus_id": statusControles.ESTATUS_COMPRAS_FINALIZADAS_SAP_ERRORES.ACTIVO
                            };
                            await models.CompraFinalizadaSAPErrores.create(bodyCreate);

                        }
                    }



                    //Actualizar lineas
                    for (var u = 0; u < resultJson.documentos[0].lineas.length; u++) 
                    {
                        //Busca los productos de la orden para actualizar por linea
                        const constProducto = await models.Producto.findOne(
                        {
                            where: {
                                prod_sku: resultJson.documentos[0].lineas[u].codigoArticulo
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}   
                        })

                        //Si el producto existe actualizara el campo en el productos finalizados
                        if(constProducto)
                        {
                            //Busca los productos de la orden para actualizar por linea
                            const constProductoCompraFinalizada = await models.ProductoCompraFinalizada.findOne(
                            {
                                where: {
                                    pcf_linea_num_sap: resultJson.documentos[0].lineas[u].linea,
                                    pcf_order_dividida_sap: false,
                                    pcf_prod_producto_id: constProducto.prod_producto_id
                                },
                                attributes: {exclude: ['createdAt', 'updatedAt']}   
                            })
                            const bodyUpdate = {
                                pcf_linea_estatus_sap : resultJson.documentos[0].lineas[u].estatusLinea,
                                pcf_cantidad_entregada : resultJson.documentos[0].lineas[u].inventarioEntregado,
                                updatedAt: Date()
                            };
                            await constProductoCompraFinalizada.update(bodyUpdate);
                        }
                    }
                }














































                //Si la orden se a creado con USD
                if(constCompraFinalizada[i].dataValues.cf_orden_dividida_sap != null)
                {
                    //OBTENER ORDEN BY ORDER NUM PCP
                    var options = {
                        'method': 'GET',
                        'url': process.env.INTEGRATIONS_URL + '/Service1.svc/OrdenVenta/'+constCompraFinalizada[i].dataValues.cf_orden_dividida_sap,
                        'headers': {
                            'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                        }
                    };
                    
                    var result = await request(options, function (error, response) 
                    {
                        if (error) throw new Error(error);
                    });

                    var resultJson = JSON.parse(result);

                    //Busca la orden para luego actualizarla
                    const constCompraFinalizadaActualizarOrderNum = await models.CompraFinalizada.findOne(
                    {
                        where: {
                            cf_compra_numero_orden: constCompraFinalizada[i].dataValues.cf_compra_numero_orden
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });

                    if(constCompraFinalizadaActualizarOrderNum)
                    {
                        var statusOV = resultJson.documentos[0].estatusOV;
                        var StatusFinal = statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA[statusOV];
                        var mensajeOV = resultJson.documentos[0].mensajeOV;
                        var entregado = resultJson.documentos[0].entregado;





                        const bodyUpdate = {
                            "cf_estatus_orden_usd": StatusFinal,
                            "cf_mensajeov_usd": mensajeOV,
                            "cf_sap_entregado_usd": entregado,
                            updatedAt: Date()
                        };
                        
                        await constCompraFinalizadaActualizarOrderNum.update(bodyUpdate);

                        //Crea email de replica error
                        if((constCompraFinalizada[i].dataValues.cf_estatus_orden == statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA.PENDIENTE || constCompraFinalizada[i].dataValues.cf_estatus_orden == statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA["REPLICA PENDIENTE"]) && (StatusFinal == statusControles.ESTATUS_STATUS_ORDEN_FINALIZADA["REPLICA ERROR"]))
                        {
                            await ordenFallidaToSapEmail(constCompraFinalizada[i].dataValues.cf_compra_finalizada_id);

                            //Crear registro en tabla compras finalizadas SAP errores
                            const bodyCreate = {
                                "cfse_cf_compra_numero_orden": constCompraFinalizada[i].dataValues.cf_orden_dividida_sap,
                                "cfse_cf_mensajeov": mensajeOV,
                                "cfse_cmm_estatus_id": statusControles.ESTATUS_COMPRAS_FINALIZADAS_SAP_ERRORES.ACTIVO
                            };
                            await models.CompraFinalizadaSAPErrores.create(bodyCreate);
                            
                        }
                    }
 
                    console.log(resultJson.documentos[0].lineas.length)
                    //Actualizar lineas
                    for (var u = 0; u < resultJson.documentos[0].lineas.length; u++) 
                    {
                        //Busca los productos de la orden para actualizar por linea
                        const constProducto = await models.Producto.findOne(
                        {
                            where: {
                                prod_sku: resultJson.documentos[0].lineas[u].codigoArticulo
                            },
                            attributes: {exclude: ['createdAt', 'updatedAt']}   
                        })

                        //Si el producto existe actualizara el campo en el productos finalizados
                        if(constProducto)
                        {
                            //Busca los productos de la orden para actualizar por linea
                            const constProductoCompraFinalizada = await models.ProductoCompraFinalizada.findOne(
                            {
                                where: {
                                    // pcf_cf_compra_finalizada_id: orderID,
                                    pcf_linea_num_sap: resultJson.documentos[0].lineas[u].linea,
                                    pcf_order_dividida_sap: true,
                                    pcf_prod_producto_id: constProducto.prod_producto_id
                                },
                                attributes: {exclude: ['createdAt', 'updatedAt']}   
                            })
                            const bodyUpdate = {
                                pcf_linea_estatus_sap : resultJson.documentos[0].lineas[u].estatusLinea,
                                pcf_cantidad_entregada : resultJson.documentos[0].lineas[u].inventarioEntregado,
                                updatedAt: Date()
                            };
                            await constProductoCompraFinalizada.update(bodyUpdate);
                        }
                    }
                }






















            }


            //Response
            res.status(200).send(
            {
                message: 'Integrar actualizar Ordenes'
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición, al integrar las ordenes de compra.',
                e
            });
            next(e);
        }
    },


    //Transfiere la informacion de la tabla raw articulos grupos a categorias
    IntegracionInfoTransferPaisesEstados: async(req, res, next) =>{
        try{

            //REQUEST DE LA API Y DATOS DE RETORNO

                var options = {
                    'method': 'GET',
                    'url': process.env.INTEGRATIONS_URL + '/Service1.svc/Estados',
                    'headers': {
                        'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                    } 
                };
                var result = await request(options, function (error, response) 
                {
                    if (error) throw new Error(error);
                });
                var resultJson = JSON.parse(result);

            //FIN RETORN REQUEST

            //Si Estatus es 2 Significa que la API trajo datos
            if(resultJson.estatus == 2)
            {
                
                var jsonApi = resultJson.paises;

                //Total de paises
                for (var i =  0; i < jsonApi.length; i++) 
                {
                    //Busca si el pais existe
                    const constPais = await models.Pais.findOne(
                    {
                        where: {
                            pais_abreviatura: jsonApi[i].codigoPais
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });


                    //Actualizar o crear en  BD
                    if(constPais) 
                    {
                        const bodyUpdate = {
                            "pais_abreviatura" : jsonApi[i].codigoPais,
                            "pais_nombre" :  jsonApi[i].nombrePais,
                            "pais_usu_usuario_creador_id": 1
                        };
                    
                        await constPais.update(bodyUpdate);
                    }
                    else //Crear
                    {
                        const bodyCreate = {
                            "pais_abreviatura" : jsonApi[i].codigoPais,
                            "pais_nombre" :  jsonApi[i].nombrePais,
                            "pais_usu_usuario_creador_id": 1
                        };
                             
                        await models.Pais.create(bodyCreate);
                    }


                    //OBTENER CODIGO YA REGISTRADO PARA LUEGO AHCER RELACION CON ESTADOS
                    const constPaisCodigoForEstado = await models.Pais.findOne(
                    {
                        where: {
                            pais_abreviatura: jsonApi[i].codigoPais
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });


                    //SI EL CODIGO EXISTE SE OBTIENE ID ENTONCES SE COLOCARA LA RELACION EN EL ESTADO
                    if(constPaisCodigoForEstado) 
                    {
                        
                        //Crear Estados de un Pais
                            for (var j =  0; j < jsonApi[i].estado.length; j++) 
                            {
                                
                                //Busca si el pais existe
                                const constEstado = await models.Estado.findOne(
                                {
                                    where: {
                                        estpa_estado_nombre: jsonApi[i].estado[j].nombreEstado
                                    },
                                    attributes: {exclude: ['createdAt', 'updatedAt']}
                                });


                                //Actualizar o crear en  BD
                                if(constEstado) 
                                {
                                    const bodyUpdate = {
                                        "estpa_pais_pais_id" : constPaisCodigoForEstado.dataValues.pais_pais_id,
                                        "estpa_codigo_estado": jsonApi[i].estado[j].codigoEstado
                                    };
                                    
                                    await constEstado.update(bodyUpdate);

                                }
                                else //Crear
                                {
                                    const bodyCreate = {
                                        "estpa_pais_pais_id" : constPaisCodigoForEstado.dataValues.pais_pais_id,
                                        "estpa_estado_nombre" :  jsonApi[i].estado[j].nombreEstado,
                                        "estpa_usu_usuario_creador_id": 1,
                                        "estpa_codigo_estado": jsonApi[i].estado[j].codigoEstado
                                    };
                                         
                                    await models.Estado.create(bodyCreate);
                                }
                            }
                        //
                    }
                }//FIN FOR TODOS LOS REGISTROS SN

            }


            //Response
            res.status(200).send(
            {
                message: 'Integracion Paises Y Estados ligados a paises',
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición', 
                e
            });
            next(e);
        }
    },


    //Transfiere la informacion de la tabla raw articulos grupos a categorias
    IntegracionInfoTransferFleteras: async(req, res, next) =>{
        try{

            //REQUEST DE LA API Y DATOS DE RETORNO

                var options = {
                    'method': 'GET',
                    'url': process.env.INTEGRATIONS_URL + '/Service1.svc/Fleteras',
                    'headers': {
                        'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                    } 
                };
                var result = await request(options, function (error, response) 
                {
                    if (error) throw new Error(error);
                });
                var resultJson = JSON.parse(result);

            //FIN RETORN REQUEST

            //Si Estatus es 2 Significa que la API trajo datos
            if(resultJson.estatus == 2)
            {
                
                var jsonApi = resultJson.fleteras;

                for (var i =  0; i < jsonApi.length; i++) 
                {
                    //Busca si el almacen existe
                    const constFleteras = await models.Fleteras.findOne(
                    {
                        where: {
                            flet_codigo: jsonApi[i].codigoFletera
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });



                    //Actualizar o crear en  BD
                    if(constFleteras) 
                    {
                        const bodyUpdate = {
                            "flet_nombre" : jsonApi[i].nombreFletera,
                            "flet_usu_usuario_modificado_id": 1
                        };
                        
                        await constFleteras.update(bodyUpdate);

                    }
                    else //Crear
                    {
                        
                        const bodyCreate = {
                            "flet_nombre" : jsonApi[i].nombreFletera,
                            "flet_codigo" :  jsonApi[i].codigoFletera,
                            "flet_cmm_estatus_id":  statusControles.ESTATUS_FLETERA.ACTIVO,
                            "flet_usu_usuario_creador_id": 1
                        };
                             
                        await models.Fleteras.create(bodyCreate);
                    }


                }//FIN FOR TODOS LOS REGISTROS SN

            }


            //Response
            res.status(200).send(
            {
                message: 'Integracion Fleteras a PCP',
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },


    //Transfiere informacion de vendedores sap desde SN Raw a vendededores_sap pcp
    IntegracionInfoTransferVendedoresSap: async(req, res, next) =>{
        try{
            

            //REQUEST DE LA API Y DATOS DE RETORNO

                var options = {
                    'method': 'GET',
                    'url': process.env.INTEGRATIONS_URL + '/Service1.svc/Vendedores',
                    'headers': {
                        'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                    } 
                };
                var result = await request(options, function (error, response) 
                {
                    if (error) throw new Error(error);
                });
                var resultJson = JSON.parse(result);

            //FIN RETORN REQUEST

            //Si Estatus es 2 Significa que la API trajo datos
            if(resultJson.estatus == 2)
            {
                
                var jsonApi = resultJson.vendedores;

                for (var i =  0; i < jsonApi.length; i++) 
                {

                    var emailFinal = jsonApi[i].email

                    if(emailFinal == '')
                    {
                        var name = jsonApi[i].nombreVendedor
                        emailFinal = name.replace(/\s/g, '-noEmail-')
                        emailFinal = emailFinal + "@NO.EMAIL.COM"
                    }
                    

                    //Busca si vendedor existe en la tabla usuarios sap
                    const constUsuario = await models.Usuario.findOne(
                    {
                        where: {
                            usu_codigo_vendedor: jsonApi[i].codigoVendedor
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });



                    var idStatuscmm = statusControles.ESTATUS_USUARIO.INACTIVO
                    
                    if(jsonApi[i].activo == "Y")
                    {
                        idStatuscmm = statusControles.ESTATUS_USUARIO.ACTIVO

                    }

                    console.log(emailFinal)
                    //Actualizar o crear en  BD
                    if(constUsuario) 
                    {

                        const bodyUpdate = {
                            "usu_nombre" :  jsonApi[i].nombreVendedor,
                            "usu_correo_electronico": emailFinal,
                            "usu_usuario_mobil" :  jsonApi[i].mobil,
                            "usu_usuario_telefono" :  jsonApi[i].telefono,
                            "usu_cmm_estatus_id" :  idStatuscmm
                        };

                        await constUsuario.update(bodyUpdate);

                    }
                    else //Crear
                    {
                        
                        const bodyCreate = {
                            "usu_codigo_vendedor" : jsonApi[i].codigoVendedor,
                            "usu_nombre" :  jsonApi[i].nombreVendedor,
                            "usu_primer_apellido" :  jsonApi[i].nombreVendedor,
                            "usu_usuario_creado_por_id":  1,
                            "usu_correo_electronico": emailFinal,
                            "usu_contrasenia" : "SIN PASSWORD",
                            "usu_rol_rol_id" : 3,
                            "usu_usuario_mobil" :  jsonApi[i].mobil,
                            "usu_usuario_telefono" :  jsonApi[i].telefono,
                            "usu_cmm_estatus_id" :  idStatuscmm
                        };
                             
                        await models.Usuario.create(bodyCreate);
                    }


                }//FIN FOR TODOS LOS REGISTROS SN

            }







            //Response
            res.status(200).send(
            {
                message: 'Integracion vendedores sap from raw SN a PCP',
                
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },



    //Integra Facturas a partir de la tabla compras finalizadas/fecha/solicitar id orden
    IntegracionInfoTransferFacturasSAP: async(req, res, next) =>{
        try{
            

            const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 15))
            const startedDate = sevenDaysAgo
            const endDate = new Date(new Date().setDate(new Date().getDate()))


            const constCompraFinalizada = await models.CompraFinalizada.findAll(
            {
                where:
                {
                    createdAt: {
                        [Op.between]: [startedDate, endDate]
                    }
                }
            });

            


            for (var i =  0; i < constCompraFinalizada.length; i++) 
            {

                //console.log("asdasd: " +  constCompraFinalizada[i].cf_compra_numero_orden)

                //REQUEST DE LA API Y DATOS DE RETORNO
                    var options = {
                        'method': 'GET',
                        'url': process.env.INTEGRATIONS_URL + '/Service1.svc/OrdenVenta/'+constCompraFinalizada[i].cf_compra_numero_orden,
                        'headers': {
                            'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                        } 
                    };
                    var result = await request(options, function (error, response) 
                    {
                        if (error) throw new Error(error);
                    });

                    var resultJson = JSON.parse(result);

                //FIN RETORN REQUEST


                if(resultJson.documentos.length > 0)
                {

                    const constFacturas = await models.Facturas.findOne(
                    {
                        where: {
                            fac_factura_sap: resultJson.documentos[0].facturaSAP
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });



                    //Actualizar o crear en  BD
                    if(constFacturas) 
                    {
                        const bodyUpdate = {
                            "fac_cardcode" : resultJson.documentos[0].codigoCliente,
                            "fac_order_num" :  resultJson.documentos[0].idPortal,
                            "fac_estatus":  resultJson.documentos[0].facturaEstatus,
                            "fac_fecha_conta" : resultJson.documentos[0].facturaFechaConta,
                            "fac_fecha_venc" : resultJson.documentos[0].facturaFechaVenc,
                            "fac_factura_total":  resultJson.documentos[0].facturaTotal,
                            "fac_folio":  resultJson.documentos[0].folio,
                            "fac_folio_interno":  resultJson.documentos[0].folioInterno,
                            "fac_id_portal":  resultJson.documentos[0].idPortal,
                            "fac_ruta_pdf":  resultJson.documentos[0].rutaPDF,
                            "fac_ruta_xml":  resultJson.documentos[0].rutaXML,
                            "fac_total":  resultJson.documentos[0].total,
                            "fac_direccion_entrega":  resultJson.documentos[0].direccionEntrega,
                            "fac_direccion_factura":  resultJson.documentos[0].direccionFactura,
                            "fac_usu_usuario_modificador_id":  1,
                            "fac_factura_sap": resultJson.documentos[0].facturaSAP
                        };
                        
                        await constFacturas.update(bodyUpdate);

                    }
                    else //Crear
                    {
                        const bodyCreate = {
                            "fac_cardcode" : resultJson.documentos[0].codigoCliente,
                            "fac_order_num" :  resultJson.documentos[0].idPortal,
                            "fac_estatus":  resultJson.documentos[0].facturaEstatus,
                            "fac_fecha_conta" : resultJson.documentos[0].facturaFechaConta,
                            "fac_fecha_venc" : resultJson.documentos[0].facturaFechaVenc,
                            "fac_factura_total":  resultJson.documentos[0].facturaTotal,
                            "fac_folio":  resultJson.documentos[0].folio,
                            "fac_folio_interno":  resultJson.documentos[0].folioInterno,
                            "fac_id_portal":  resultJson.documentos[0].idPortal,
                            "fac_ruta_pdf":  resultJson.documentos[0].rutaPDF,
                            "fac_ruta_xml":  resultJson.documentos[0].rutaXML,
                            "fac_total":  resultJson.documentos[0].total,
                            "fac_direccion_entrega":  resultJson.documentos[0].direccionEntrega,
                            "fac_direccion_factura":  resultJson.documentos[0].direccionFactura,
                            "fac_usu_usuario_creador_id":  1,
                            "fac_factura_sap": resultJson.documentos[0].facturaSAP
                        };
                        
                        await models.Facturas.create(bodyCreate);
                    }
                }
            }


            //Response
            res.status(200).send(
            {
                message: 'Integracion Facturacion OK',
                TotalIntentosFacturas: constCompraFinalizada.length
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },



    //Transfiere la informacion de la tabla raw articulos a productos
    IntegracionInfoTransferTotalStockToProductoHijos: async(req, res, next) =>{
        try{

            //Carga todos los almacenes para comparar codigoAlmacen con su ID para tabla stock
            // const constAlmacenes = await models.Almacenes.findAll({
            // });

            //TRAER TODOS LOS PRODUCTOS HIJOS
            const constProducto = await models.Producto.findAll({
                where: {
                    prod_prod_producto_padre_sku: { [Op.ne] : null }
                },
            });

            //RECORRER EL TOTAL DE PRODUCTOS PARA OBTENER SU SKU O ID PARA LUEGO BUSCARLO EN LA TABLA DE STOCKS PARA SUMARLOS
            for (var i = 0; i < constProducto.length; i++)
            {
                //console.log(constProducto[i].dataValues.prod_producto_id)


                //TRAER TODOS LOS PRODUCTOS HIJOS
                const constStockProducto = await models.StockProducto.findAll({
                    where: {
                        sp_prod_producto_id: constProducto[i].dataValues.prod_producto_id
                    },
                });


                //console.log(constStockProducto)
                var cantidadTotalStockForProductID = 0;
                for (var j = 0; j < constStockProducto.length; j++)
                {   
                    cantidadTotalStockForProductID = cantidadTotalStockForProductID + constStockProducto[j].dataValues.sp_cantidad
                }


                //Guardara el nuevo stock en la columan total de productos generales hijos
                const constProductoTotalStock = await models.Producto.findOne(
                {
                    where: {
                        prod_producto_id: constProducto[i].dataValues.prod_producto_id
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });

                //Actualizar o crear en  BD
                if(constProductoTotalStock) 
                {

                    const bodyUpdate = {
                        "prod_total_stock" :  cantidadTotalStockForProductID
                    };
                    
                    console.log(bodyUpdate)
                    await constProductoTotalStock.update(bodyUpdate);
                }

            }


            //Response
            res.status(200).send(
            {
                message: 'Integracion Transfer Inventario',
               
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },


    //Integra el total de inventario a la tabla productos desde la tabla stock de pcp (se necesita correr primero inventarios de sap)
    IntegracionInfoTransferTotalStockToProductoPadresEHijos: async(req, res, next) =>{
        try{


            // const constStockHijosByIDProd = await sequelize.query(`
            //     select sp_prod_producto_id, sum(sp_cantidad), prod_sku 
            //     from stocks_productos sp left join productos p2 on sp.sp_prod_producto_id = p2.prod_producto_id 
            //     where sp_cantidad != 0 
            //     group by sp_prod_producto_id, prod_sku
            //     `,
            // { 
            //     type: sequelize.QueryTypes.SELECT 
            // });

            //Solo almacenes monterrey y mexico po codigo 01 y 03
            const constStockHijosByIDProd = await sequelize.query(`
                select sp_prod_producto_id, sum(sp_cantidad) as "sp_cantidad", sum(sp_comprometido) as "sp_comprometido", prod_sku 
                from 
                    stocks_productos sp 
                    left join productos p2 on sp.sp_prod_producto_id = p2.prod_producto_id 
                    left join almacenes a2 on a2.alm_almacen_id = sp.sp_almacen_id 
                where 
                    (sp_cantidad != 0 or sp_comprometido != 0)
                    and (a2."alm_codigoAlmacen" = '01' or a2."alm_codigoAlmacen" = '03')
                group by sp_prod_producto_id, prod_sku
                `,
            { 
                type: sequelize.QueryTypes.SELECT 
            });


            

            //poner todos los stock en 0 cuando los productos realemnte no tienen
            const constEstablecerProductosToZero = await sequelize.query(`
                update productos 
                set prod_total_stock = 0
                where prod_producto_id not in 
                    (
                    select sp_prod_producto_id
                    from 
                        stocks_productos sp 
                        left join productos p2 on sp.sp_prod_producto_id = p2.prod_producto_id 
                        left join almacenes a2 on a2.alm_almacen_id = sp.sp_almacen_id 
                    where 
                        sp_cantidad != 0 
                        and (a2."alm_codigoAlmacen" = '01' or a2."alm_codigoAlmacen" = '03')
                    group by sp_prod_producto_id, prod_sku
                    )
                `,
            { 
                type: sequelize.QueryTypes.SELECT 
            });



            //ACTUALIZA HIJOS EN BASE A LOS QUE TENGAN INVENTARIO EN STOCK
            for (var i = 0; i < constStockHijosByIDProd.length; i++)
            {
                //Guardara el nuevo stock en la columan total de productos generales hijos
                const constProductoTotalStock = await models.Producto.findOne(
                {
                    where: {
                        prod_producto_id: constStockHijosByIDProd[i].sp_prod_producto_id
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });

                //Actualizar 
                if(constProductoTotalStock) 
                {
                    // var totalStockFinal = constStockHijosByIDProd[i].sp_cantidad - constStockHijosByIDProd[i].sp_comprometido

                    // if(totalStockFinal < 0)
                    // {
                    //     totalStockFinal = 0
                    // }

                    const bodyUpdate = {
                        "prod_total_stock" :  constStockHijosByIDProd[i].sp_cantidad
                    };
                    
                    await constProductoTotalStock.update(bodyUpdate);
                }
            }

            // const constStockPadresByIDProd = await sequelize.query(`
            //     select prod_prod_producto_padre_sku, sum(cantidad) from 
            //     (
            //         select sum(sp_cantidad) as cantidad, prod_prod_producto_padre_sku
            //         from stocks_productos sp left join productos p2 on sp.sp_prod_producto_id = p2.prod_producto_id 
            //         where sp_cantidad != 0 
            //         group by prod_prod_producto_padre_sku 
            //     ) as consulta group by prod_prod_producto_padre_sku 
            //     `,
            // { 
            //     type: sequelize.QueryTypes.SELECT 
            // });

            const constStockPadresByIDProd = await sequelize.query(`
                select prod_prod_producto_padre_sku, sum(cantidad) from 
                (
                    select sum(sp_cantidad) as cantidad, prod_prod_producto_padre_sku
                    from 
                        stocks_productos sp 
                        left join productos p2 on sp.sp_prod_producto_id = p2.prod_producto_id
                        left join almacenes a2 on a2.alm_almacen_id = sp.sp_almacen_id
                    where 
                        sp_cantidad != 0 
                        and (a2."alm_codigoAlmacen" = '01' or a2."alm_codigoAlmacen" = '03')
                    group by prod_prod_producto_padre_sku 
                ) as consulta group by prod_prod_producto_padre_sku
                `,
            { 
                type: sequelize.QueryTypes.SELECT 
            });


            
            //La consulta ya regresa los sku padres con el total de articulos de sus hijos solo paara ser guardados
            for (var k = 0; k < constStockPadresByIDProd.length; k++)
            {
                //console.log(constStockPadresByIDProd[k].prod_prod_producto_padre_sku)

                //Obtener id del sku padre
                const constProductoTotalStock = await models.Producto.findOne(
                {
                    where: {
                        prod_sku: constStockPadresByIDProd[k].prod_prod_producto_padre_sku
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });

                //Actualizar o crear en  BD
                if(constProductoTotalStock) 
                {
                    const bodyUpdate = {
                        "prod_total_stock" :  constStockPadresByIDProd[k].sum
                    };
                    
                    await constProductoTotalStock.update(bodyUpdate);
                }
            }

            //Response
            res.status(200).send(
            {
                message: 'Integracion Transfer Inventario'
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },


    //integra el detalle de ivnentario para la fibra optica
    IntegracionInfoTransferInventariosDetalle: async(req, res, next) =>{
        try{

            //Vaciar tabla
            var DeleteAll = `
                delete from stocks_productos_detalle
            `;

            await sequelize.query(DeleteAll,
            { 
                type: sequelize.QueryTypes.SELECT 
            });



            // Busca si LA LISTA CONCINCIDE CON ALGUN REGISTRO
            const constRawInventarioDetalle = await models.RawInventarioDetalle.findAll(
            {
                where: {
                    [Op.or]: 
                    [
                        {
                            codigoAlmacen: "01"
                        }, 
                        {
                            codigoAlmacen: "03"
                        }
                    ]
                },
                attributes: {exclude: ['createdAt', 'updatedAt']}   
            });
            console.log(constRawInventarioDetalle.length)






            //Recorrer todos los rows para integrar solo lso que tengan lote con cantidad
            for (var k = 0; k < constRawInventarioDetalle.length; k++)
            {

                var jsonUbicacion = JSON.parse(constRawInventarioDetalle[k].dataValues.ubicaciones)

                console.log(jsonUbicacion)
                console.log("jsonUbicacion.length: "+ jsonUbicacion.length)

                for (var j = 0; j < jsonUbicacion.length; j++)
                {

                    console.log(jsonUbicacion[j].disponible)


                    if(jsonUbicacion[j].disponible > 0)
                    {

                        // Obtener info Producto id
                        const constProductoTotalStock = await models.Producto.findOne(
                        {
                            where: {
                                prod_sku: constRawInventarioDetalle[k].dataValues.codigoArticulo
                            },
                            attributes: ["prod_producto_id"] 
                        });


                        // Obtener info almacenes id
                        const constAlmacenes = await models.Almacenes.findOne(
                        {
                            where: {
                                alm_codigoAlmacen: constRawInventarioDetalle[k].dataValues.codigoAlmacen
                            },
                            attributes: ["alm_almacen_id"] 
                        });


                        const bodyCreate = {
                            "spd_prod_producto_id": constProductoTotalStock.prod_producto_id,
                            "spd_alm_almacen_id": constAlmacenes.alm_almacen_id,
                            "spd_codigo_lote": constRawInventarioDetalle[k].dataValues.codigoLote,
                            "spd_disponible": jsonUbicacion[j].disponible
                        };
                             
                        await models.StockProductoDetalle.create(bodyCreate);
                    }
                }

            }




            //Response
            res.status(200).send(
            {
                message: 'Integracion Transfer Inventario'
            })
            
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },


    //Integrar Socios Negocios a Socios negocio usuarios
    IntegracionInfoTransferSNtoSNUEmailPassword: async(req, res, next) =>{
        try{

            //OBTIENE EL TOTAL DEL COUNT
            const constAllSNWithEmailFacturacion = await sequelize.query(`
                select 
                    *
                from    
                    socios_negocio sn left join
                    socios_negocio_usuario snu on sn.sn_cardcode = snu.snu_cardcode 
                where 
                    (sn_email_facturacion != '' or sn_email_facturacion != null)
                    and sn_cmm_estatus_id = 1000045
                `,
            { 
                type: sequelize.QueryTypes.SELECT 
            });



            for (var i =  0; i < constAllSNWithEmailFacturacion.length; i++) 
            {
                //Validar si es email
                var isemail = email_validator.validate(constAllSNWithEmailFacturacion[i].sn_email_facturacion)

                if(isemail == true)
                {
                    //buscar por SN si existe super user
                    const constExisteSuperUserOEmail = await sequelize.query(`
                        select 
                            *
                        from    
                            socios_negocio_usuario snu
                        where 
                            (snu_cardcode = '`+constAllSNWithEmailFacturacion[i].sn_cardcode+`'        --super usuario  + cc
                            and snu_super_usuario = true)   --Si ya existe super usuario no lo integrara
                            or snu_correo_electronico = '`+constAllSNWithEmailFacturacion[i].sn_email_facturacion+`' --Si ya existe el correo no lo intentara integrar
                        `,
                    { 
                        type: sequelize.QueryTypes.SELECT 
                    });


                    if(constExisteSuperUserOEmail.length > 0)
                    {
                    }
                    //Si no tiene super user lo creara
                    else
                    {
                        var menuFinal = await String(JSON.stringify(super_user));
                        const bodyCreate = {
                            "snu_cardcode": constAllSNWithEmailFacturacion[i].sn_cardcode,
                            "snu_nombre": constAllSNWithEmailFacturacion[i].sn_razon_social,
                            "snu_primer_apellido": "",
                            "snu_segundo_apellido": "",
                            "snu_correo_electronico": constAllSNWithEmailFacturacion[i].sn_email_facturacion,
                            "snu_direccion": constAllSNWithEmailFacturacion[i].sn_direccion_facturacion,
                            "snu_telefono": '',
                            "snu_usuario": constAllSNWithEmailFacturacion[i].sn_razon_social,
                            "snu_contrasenia": "NO PASSWORD",
                            "snu_genero": "",
                            "snu_usu_usuario_creador_id": 1,
                            "snu_cmm_estatus_id": statusControles.ESTATUS_SOCIOS_NEGOCIO_USUARIO.ACTIVA,
                            "snu_sn_socio_de_negocio_id": constAllSNWithEmailFacturacion[i].sn_socios_negocio_id,
                            "snu_super_usuario": true,
                            "snu_menu_roles": menuFinal,
                            "snu_area": 'Super Administrador',
                            "snu_puesto": 'Super Administrador'
                        };
                        await models.SociosNegocioUsuario.create(bodyCreate);
                    }
                }//fin is email
            }//end for





            //Obtener SNU con NO PASSWORD field para generar nueva contraseña y mandar correo
            const constSociosNegocioUsuario = await models.SociosNegocioUsuario.findAll(
            {
                where: {
                    snu_contrasenia: "NO PASSWORD"
                },
                attributes: {exclude: ['createdAt', 'updatedAt']}   
            });


            for (var j =  0; j < constSociosNegocioUsuario.length; j++) 
            {
                let pass = generadorPassword(8);
                let passEncriptada = await bcrypt.hash(pass, 10);


                //Obtener SNU con NO PASSWORD field para generar nueva contraseña y mandar correo
                const updateSociosNegocioUsuario = await models.SociosNegocioUsuario.findOne(
                {
                    where: {
                        snu_usuario_snu_id: constSociosNegocioUsuario[j].dataValues.snu_usuario_snu_id
                    },
                });

                await updateSociosNegocioUsuario.update({
                    snu_contrasenia : passEncriptada,
                    updatedAt: Date()
                });

                // await nuevoUsuario(constSociosNegocioUsuario[j].dataValues.snu_correo_electronico, pass);
            }





            


            //Response
            res.status(200).send(
            {
                message: 'Todo elegante'
            })
        }catch(e){
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },

























    //Transfiere la informacion de la tabla raw nombres listas precios a la listas de precios pcp
    IntegracionCorreos: async(req, res, next) =>{
        try{

            const constCorreos = await models.Correos.findAll(
            {
                where: {
                    cor_cmm_tipo_correo: statusControles.TIPO_CORREO.TRANSITO
                }
            });

            for (var i = 0; i < constCorreos.length; i++) 
            {
                //Como las lineas van a ser eliminadas por grupo, algunas lineas ya no van a existir, esta comprobacion buscara si las lineas siguen existiendo.
                const constCorreos2 = await models.Correos.findOne(
                {
                    where: {
                        cor_pcf_producto_compra_finalizada_id: constCorreos[i].dataValues.cor_pcf_producto_compra_finalizada_id
                    }
                });

                if(constCorreos2)
                {
                    //Obtener informacion de la orden
                    const constProductoCompraFinalizada = await models.ProductoCompraFinalizada.findOne(
                    {
                        where: {
                            pcf_producto_compra_finalizada_id: constCorreos[i].dataValues.cor_pcf_producto_compra_finalizada_id
                        }
                    });

                    await lineasTransitoEmail(constProductoCompraFinalizada.pcf_cf_compra_finalizada_id);

                    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
                    await delay(1000) /// waiting 1 second.


                    //Buscara las lineas en correos que tengan una orden y sean tipo transito para borrarlas
                    await models.Correos.destroy({
                        where: {
                            cor_pcf_cf_compra_finalizada_id: constProductoCompraFinalizada.pcf_cf_compra_finalizada_id,
                            cor_cmm_tipo_correo: statusControles.TIPO_CORREO.TRANSITO
                        }
                    });
                    await delay(1000) /// waiting 1 second.

                }


            }   


            const constCorreosEntregado = await models.Correos.findAll(
            {
                where: {
                    cor_cmm_tipo_correo: statusControles.TIPO_CORREO.ENTREGADO
                }
            });

            for (var i = 0; i < constCorreosEntregado.length; i++) 
            {
                //Como las lineas van a ser eliminadas por grupo, algunas lineas ya no van a existir, esta comprobacion buscara si las lineas siguen existiendo.
                const constCorreosEntregado2 = await models.Correos.findOne(
                {
                    where: {
                        cor_pcf_producto_compra_finalizada_id: constCorreosEntregado[i].dataValues.cor_pcf_producto_compra_finalizada_id
                    }
                });

                if(constCorreosEntregado2)
                {
                    //Obtener informacion de la orden
                    const constProductoCompraFinalizada = await models.ProductoCompraFinalizada.findOne(
                    {
                        where: {
                            pcf_producto_compra_finalizada_id: constCorreosEntregado[i].dataValues.cor_pcf_producto_compra_finalizada_id
                        }
                    });

                    await lineasEntregaEmail(constProductoCompraFinalizada.pcf_cf_compra_finalizada_id);

                    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
                    await delay(1000) /// waiting 1 second.


                    //Buscara las lineas en correos que tengan una orden y sean tipo transito para borrarlas
                    await models.Correos.destroy({
                        where: {
                            cor_pcf_cf_compra_finalizada_id: constProductoCompraFinalizada.pcf_cf_compra_finalizada_id,
                            cor_cmm_tipo_correo: statusControles.TIPO_CORREO.ENTREGADO
                        }
                    });
                    await delay(1000) /// waiting 1 second.

                }


            }   













            //Response
            res.status(200).send(
            {
                message: 'Correos Cron OK',
            })
            
        }catch(e){
            console.log(e)
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },













    //Raw rawIntegracionArticulos Infotransfer IntegracionInfoTransferProductos
    IntegracionRawArticulosAndInfoTransferProductos: async(req, res, next) =>{
        try{

       
            //REQUEST DE LA API Y DATOS DE RETORNO
            var options2 = {
                'method': 'GET',
                'url': process.env.INTEGRATIONS_URL + '/Service1.svc/Articulos/0---1',
                'headers': {
                    'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                }
            };

            var resultCantidadArticulos = await request(options2, function (error, response) 
            {
                if (error) throw new Error(error);
            });

            //Resultado API para obtener total Articulos
            resultCantidadArticulos = JSON.parse(resultCantidadArticulos);


            //Si se tiene un total de articulos de la API comenzara a integrar
            if(resultCantidadArticulos.estatus == 2)
            {
                //console.log("Funciona: " + resultCantidadArticulos.totalRegs);

                var TotalArticulos = resultCantidadArticulos.totalRegs;
                //For que recorrera todos los articulos de 10,000 en 10,000
                for (var j = 0; j < TotalArticulos; j++) 
                {

                    //Controla el final de articulos
                    var tempFinal = j+10000;
                    if(tempFinal > TotalArticulos)
                    {
                        tempFinal = TotalArticulos;
                    }

                    //Llama la api en rangos de 0 a 10,000
                    var options2 = {
                        'method': 'GET',
                        'url': process.env.INTEGRATIONS_URL + '/Service1.svc/Articulos/'+j+'---'+tempFinal,
                        'headers': {
                            'Authorization': 'Xswirudy9s873g@id%$sk04mcfnaid'
                        }
                    };

                    var result = await request(options2, function (error, response) 
                    {
                        if (error) throw new Error(error);
                    });

                    //Resultado API para obtener total Articulos
                    var resultJson = JSON.parse(result);

                    //Si estatus 2 significa que todo bien en la consulta a la API
                    if(resultJson.estatus == 2)
                    {
                        var jsonApi = resultJson.articulos;

                        //Recorrera el total de articulos traidos
                        for (var i =  0; i < jsonApi.length; i++) 
                        {

                            if(jsonApi[i].skuPadre != '')
                            {
                                //Busca si el grupo existe
                                const constRawArticulos = await models.RawArticulos.findOne(
                                {
                                    where: {
                                        codigoArticulo: jsonApi[i].codigoArticulo
                                    },
                                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                                });


                                //Actualiza o crea en la BD
                                if(constRawArticulos) {
                                    var creado = await constRawArticulos.update(jsonApi[i]);
                                }
                                else{
                                    var creado = await models.RawArticulos.create(jsonApi[i]);
                                }
                            }
                            


                        }//FIN FOR TODOS LOS REGISTROS SN

                    }

                    //Variable que establece el nuevo inicio al finalizar un ciclo for
                    j = tempFinal;
                
                }

            }
            //Fin RAW ARTICULOS


            
            //Carga todos los registros desde la tabla RAW de almacenes
            const constRawArticulos = await models.RawArticulos.findAll({
            });

            // for (var i = 0; i < 1; i++) 
            for (var i = 0; i < constRawArticulos.length; i++) 
            {
                //console.log(constRawSociosNegocios[i].dataValues.codigoCliente)
                //console.log(constRawArticulos[i].dataValues.codigoArticulo);
      
                //Settea el status del producto en base a los CMM
                    var estatusProducto;
                    //Estatus del cliente desde sap
                        if(constRawArticulos[i].dataValues.activo == "Y"){
                            estatusProducto = statusControles.ESTATUS_PRODUCTO.ACTIVO;
                        }
                        else{
                            estatusProducto = statusControles.ESTATUS_PRODUCTO.INACTIVO;
                        }
                //FIn estatus SN


                //Creara el producto padre con el SKU original (busca primero el sku padre)
                const constProductoPadre = await models.Producto.findOne(
                {
                    where: {
                        prod_sku: constRawArticulos[i].dataValues.skuPadre
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });

                var prop7Mostrar = false
                if(constRawArticulos[i].prop7 == "Y")
                {
                    prop7Mostrar = true
                }


                //console.log(constRawArticulos[i].dataValues.codigoArticulo + "-P");

                var volumenFinal = constRawArticulos[i].medida_v_altura * constRawArticulos[i].medida_v_ancho * constRawArticulos[i].medida_v_logitud

                //Actualizar o crear en  BD CREA PRODUCTO Padre
                if(constProductoPadre) 
                {

                    const bodyUpdate = {
                        // "prod_nombre" :  constRawArticulos[i].dataValues.nombreMarca.toUpperCase() + " " + constRawArticulos[i].dataValues.nombreArticulo.toUpperCase(),
                        // "prod_cat_categoria_id" : constRawArticulos[i].dataValues.codigoGrupo,
                        "prod_usu_usuario_modificado_id" :  1,
                        "prod_cmm_estatus_id":  estatusProducto,
                        "prod_mar_marca_id": constRawArticulos[i].codigoMarca,
                        "prod_unidad_medida_venta" : constRawArticulos[i].UMedidaVenta,
                        "prod_altura" : constRawArticulos[i].medida_v_altura,
                        "prod_ancho" : constRawArticulos[i].medida_v_ancho,
                        "prod_longitud" : constRawArticulos[i].medida_v_logitud,
                        "prod_peso" : constRawArticulos[i].medida_v_peso,
                        "prod_volumen" : volumenFinal,
                        "prod_nombre_extranjero": constRawArticulos[i].nombreExtranjero.toUpperCase(),
                        "prod_mostrar_en_tienda": prop7Mostrar,
                        "prod_dias_resurtimiento": parseInt(constRawArticulos[i].diasResurtimiento),
                        "prod_codigo_grupo": null
                    };
                    await constProductoPadre.update(bodyUpdate);

                }
                else //Crear
                {
                    const bodyCreate = {
                        "prod_sku" : constRawArticulos[i].dataValues.skuPadre,    //Se obtiene el sku padre
                        "prod_nombre" : //constRawArticulos[i].dataValues.nombreMarca.toUpperCase() + " " + 
                        constRawArticulos[i].dataValues.nombreArticulo.toUpperCase(),
                        "prod_descripcion":  "",
                        "prod_cat_categoria_id" : constRawArticulos[i].dataValues.codigoGrupo,
                        "prod_usu_usuario_creado_id" :  1,
                        "prod_cmm_estatus_id":  estatusProducto,
                        "prod_mar_marca_id": constRawArticulos[i].codigoMarca,
                        "prod_descripcion_corta" : "",
                        "prod_unidad_medida_venta" : constRawArticulos[i].UMedidaVenta,
                        "prod_altura" : constRawArticulos[i].medida_v_altura,
                        "prod_ancho" : constRawArticulos[i].medida_v_ancho,
                        "prod_longitud" : constRawArticulos[i].medida_v_logitud,
                        "prod_peso" : constRawArticulos[i].medida_v_peso,
                        "prod_volumen" : volumenFinal,
                        "prod_nombre_extranjero": constRawArticulos[i].nombreExtranjero.toUpperCase(),
                        "prod_mostrar_en_tienda": prop7Mostrar,
                        "prod_dias_resurtimiento": parseInt(constRawArticulos[i].diasResurtimiento),
                        "prod_codigo_grupo": null
                    };
                         
                    await models.Producto.create(bodyCreate);
                }

                //Buscar si ya existe el padre si no, no intentara insertar el hijo (en caso de que falle algo)
                const constProductoPadre2 = await models.Producto.findOne(
                {
                    where: {
                        prod_sku: constRawArticulos[i].dataValues.skuPadre
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}   
                });

                if(constProductoPadre2)
                {
                    // Buscar si EL PRODUCTO hijo ya existe en la tabla PCP
                    const constProductoHijo = await models.Producto.findOne(
                    {
                        where: {
                            prod_sku: constRawArticulos[i].dataValues.codigoArticulo
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}   
                    });


                    var arrayCodigos = []
                    if(constRawArticulos[i].dataValues.prop1 == 'Y'){arrayCodigos.push(1)}
                    if(constRawArticulos[i].dataValues.prop2 == 'Y'){arrayCodigos.push(2)}
                    if(constRawArticulos[i].dataValues.prop3 == 'Y'){arrayCodigos.push(3)}
                    if(constRawArticulos[i].dataValues.prop4 == 'Y'){arrayCodigos.push(4)}
                    if(constRawArticulos[i].dataValues.prop5 == 'Y'){arrayCodigos.push(5)}
                    if(constRawArticulos[i].dataValues.prop6 == 'Y'){arrayCodigos.push(6)}
                    if(constRawArticulos[i].dataValues.prop7 == 'Y'){arrayCodigos.push(7)}
                    if(constRawArticulos[i].dataValues.prop8 == 'Y'){arrayCodigos.push(8)}
                    if(constRawArticulos[i].dataValues.prop9 == 'Y'){arrayCodigos.push(9)}
                    if(constRawArticulos[i].dataValues.prop10 == 'Y'){arrayCodigos.push(10)}
                    if(constRawArticulos[i].dataValues.prop11 == 'Y'){arrayCodigos.push(11)}
                    if(constRawArticulos[i].dataValues.prop12 == 'Y'){arrayCodigos.push(12)}
                    if(constRawArticulos[i].dataValues.prop13 == 'Y'){arrayCodigos.push(13)}
                    if(constRawArticulos[i].dataValues.prop14 == 'Y'){arrayCodigos.push(14)}
                    if(constRawArticulos[i].dataValues.prop15 == 'Y'){arrayCodigos.push(15)}
                    if(constRawArticulos[i].dataValues.prop16 == 'Y'){arrayCodigos.push(16)}
                    if(constRawArticulos[i].dataValues.prop17 == 'Y'){arrayCodigos.push(17)}
                    if(constRawArticulos[i].dataValues.prop18 == 'Y'){arrayCodigos.push(18)}
                    if(constRawArticulos[i].dataValues.prop19 == 'Y'){arrayCodigos.push(19)}
                    if(constRawArticulos[i].dataValues.prop20 == 'Y'){arrayCodigos.push(20)}
                    if(constRawArticulos[i].dataValues.prop21 == 'Y'){arrayCodigos.push(21)}
                    if(constRawArticulos[i].dataValues.prop22 == 'Y'){arrayCodigos.push(22)}
                    if(constRawArticulos[i].dataValues.prop23 == 'Y'){arrayCodigos.push(23)}
                    if(constRawArticulos[i].dataValues.prop24 == 'Y'){arrayCodigos.push(24)}
                    if(constRawArticulos[i].dataValues.prop25 == 'Y'){arrayCodigos.push(25)}
                    if(constRawArticulos[i].dataValues.prop26 == 'Y'){arrayCodigos.push(26)}
                    if(constRawArticulos[i].dataValues.prop27 == 'Y'){arrayCodigos.push(27)}
                    if(constRawArticulos[i].dataValues.prop28 == 'Y'){arrayCodigos.push(28)}
                    if(constRawArticulos[i].dataValues.prop29 == 'Y'){arrayCodigos.push(29)}
                    if(constRawArticulos[i].dataValues.prop30 == 'Y'){arrayCodigos.push(30)}
                    if(constRawArticulos[i].dataValues.prop31 == 'Y'){arrayCodigos.push(31)}
                    if(constRawArticulos[i].dataValues.prop32 == 'Y'){arrayCodigos.push(32)}
                    if(constRawArticulos[i].dataValues.prop33 == 'Y'){arrayCodigos.push(33)}
                    if(constRawArticulos[i].dataValues.prop34 == 'Y'){arrayCodigos.push(34)}
                    if(constRawArticulos[i].dataValues.prop35 == 'Y'){arrayCodigos.push(35)}
                    if(constRawArticulos[i].dataValues.prop36 == 'Y'){arrayCodigos.push(36)}
                    if(constRawArticulos[i].dataValues.prop37 == 'Y'){arrayCodigos.push(37)}
                    if(constRawArticulos[i].dataValues.prop38 == 'Y'){arrayCodigos.push(38)}
                    if(constRawArticulos[i].dataValues.prop39 == 'Y'){arrayCodigos.push(39)}
                    if(constRawArticulos[i].dataValues.prop40 == 'Y'){arrayCodigos.push(40)}
                    if(constRawArticulos[i].dataValues.prop41 == 'Y'){arrayCodigos.push(41)}
                    if(constRawArticulos[i].dataValues.prop42 == 'Y'){arrayCodigos.push(42)}
                    if(constRawArticulos[i].dataValues.prop43 == 'Y'){arrayCodigos.push(43)}
                    if(constRawArticulos[i].dataValues.prop44 == 'Y'){arrayCodigos.push(44)}
                    if(constRawArticulos[i].dataValues.prop45 == 'Y'){arrayCodigos.push(45)}
                    if(constRawArticulos[i].dataValues.prop46 == 'Y'){arrayCodigos.push(46)}
                    if(constRawArticulos[i].dataValues.prop47 == 'Y'){arrayCodigos.push(47)}
                    if(constRawArticulos[i].dataValues.prop48 == 'Y'){arrayCodigos.push(48)}
                    if(constRawArticulos[i].dataValues.prop49 == 'Y'){arrayCodigos.push(49)}
                    if(constRawArticulos[i].dataValues.prop50 == 'Y'){arrayCodigos.push(50)}
                    if(constRawArticulos[i].dataValues.prop51 == 'Y'){arrayCodigos.push(51)}
                    if(constRawArticulos[i].dataValues.prop52 == 'Y'){arrayCodigos.push(52)}
                    if(constRawArticulos[i].dataValues.prop53 == 'Y'){arrayCodigos.push(53)}
                    if(constRawArticulos[i].dataValues.prop54 == 'Y'){arrayCodigos.push(54)}
                    if(constRawArticulos[i].dataValues.prop55 == 'Y'){arrayCodigos.push(55)}
                    if(constRawArticulos[i].dataValues.prop56 == 'Y'){arrayCodigos.push(56)}
                    if(constRawArticulos[i].dataValues.prop57 == 'Y'){arrayCodigos.push(57)}
                    if(constRawArticulos[i].dataValues.prop58 == 'Y'){arrayCodigos.push(58)}
                    if(constRawArticulos[i].dataValues.prop59 == 'Y'){arrayCodigos.push(59)}
                    if(constRawArticulos[i].dataValues.prop60 == 'Y'){arrayCodigos.push(60)}
                    if(constRawArticulos[i].dataValues.prop61 == 'Y'){arrayCodigos.push(61)}
                    if(constRawArticulos[i].dataValues.prop62 == 'Y'){arrayCodigos.push(62)}
                    if(constRawArticulos[i].dataValues.prop63 == 'Y'){arrayCodigos.push(63)}
                    if(constRawArticulos[i].dataValues.prop64 == 'Y'){arrayCodigos.push(64)}


                    var HijoMostrarEnTienda = false
                    if(constRawArticulos[i].dataValues.prop7 == 'Y')
                    {
                        HijoMostrarEnTienda = true
                    }

                        
                    //Actualizar o crear en  BD CREA PRODUCTO HIJO
                    if(constProductoHijo) 
                    {
                        const bodyUpdate = {
                            // "prod_nombre" :  constRawArticulos[i].dataValues.nombreMarca.toUpperCase() + " " + constRawArticulos[i].dataValues.nombreArticulo.toUpperCase(),
                            "prod_usu_usuario_modificado_id" :  1,
                            "prod_cmm_estatus_id":  estatusProducto,
                            "prod_prod_producto_padre_sku": constRawArticulos[i].dataValues.skuPadre,
                            "prod_unidad_medida_venta" : constRawArticulos[i].UMedidaVenta,
                            "prod_altura" : constRawArticulos[i].medida_v_altura,
                            "prod_ancho" : constRawArticulos[i].medida_v_ancho,
                            "prod_longitud" : constRawArticulos[i].medida_v_logitud,
                            "prod_peso" : constRawArticulos[i].medida_v_peso,
                            "prod_volumen" : volumenFinal,
                            "prod_nombre_extranjero": constRawArticulos[i].nombreExtranjero.toUpperCase(),
                            "prod_dias_resurtimiento": parseInt(constRawArticulos[i].diasResurtimiento),
                            // "prod_codigo_grupo": constRawArticulos[i].dataValues.codigoGrupo,
                            "prod_codigo_marca": constRawArticulos[i].codigoMarca,
                            "prod_mostrar_en_tienda": HijoMostrarEnTienda,
                            "prod_codigo_prop_list": arrayCodigos
                        };
                        await constProductoHijo.update(bodyUpdate);
                    }
                    else //Crear
                    {
                        const bodyCreate = {
                            "prod_sku" : constRawArticulos[i].dataValues.codigoArticulo,
                            "prod_nombre" :  //constRawArticulos[i].dataValues.nombreMarca.toUpperCase() + " " + 
                            constRawArticulos[i].dataValues.nombreArticulo.toUpperCase(),
                            "prod_descripcion":  "",
                            "prod_usu_usuario_creado_id" :  1,
                            "prod_cmm_estatus_id":  estatusProducto,
                            "prod_descripcion_corta" : "",
                            "prod_prod_producto_padre_sku": constRawArticulos[i].dataValues.skuPadre,
                            "prod_unidad_medida_venta" : constRawArticulos[i].UMedidaVenta,
                            "prod_altura" : constRawArticulos[i].medida_v_altura,
                            "prod_ancho" : constRawArticulos[i].medida_v_ancho,
                            "prod_longitud" : constRawArticulos[i].medida_v_logitud,
                            "prod_peso" : constRawArticulos[i].medida_v_peso,
                            "prod_volumen" : volumenFinal,
                            "prod_nombre_extranjero": constRawArticulos[i].nombreExtranjero.toUpperCase(),
                            "prod_dias_resurtimiento": parseInt(constRawArticulos[i].diasResurtimiento),
                            "prod_codigo_grupo": constRawArticulos[i].dataValues.codigoGrupo,
                            "prod_codigo_marca": constRawArticulos[i].codigoMarca,
                            "prod_mostrar_en_tienda": HijoMostrarEnTienda,
                            "prod_codigo_prop_list": arrayCodigos
                        };
                            
                        await models.Producto.create(bodyCreate);
                    }
                }
            }

            






            //Response
            res.status(200).send(
            {
                message: 'Integrado Correctamente',
            })
            
        }catch(e){
            console.log(e)
            res.status(500).send({
                message: 'Error en la petición',
                e
            });
            next(e);
        }
    },



    //Testing purpose
    testingCrons: async(req, res, next) =>{
        try{

            console.log("nada")

            //Response
            res.status(200).send(
            {
                message: 'return'
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