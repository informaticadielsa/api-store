import models from '../models';
const { Op } = require("sequelize");
import {  Sequelize } from 'sequelize';
import controles from '../mapeos/mapeoControlesMaestrosMultiples';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import getCheckout from "../services/checkoutAPI";
import CreacionOrdenSAP from "../services/CreacionOrdenSAP";
import request from 'request-promise';
const {ordenCreadaEmail} = require('../services/ordenCreadaEmail');
const {ordenAbiertaCreadaEmail} = require('../services/ordenAbiertaCreadaEmail');
const {ordenCreadaUsuarioDielsaEmail} = require('../services/ordenCreadaUsuarioDielsaEmail');

const sortJSON = function(data, key, orden) {
    return data.sort(function (a, b) {
        var x = a[key],
        y = b[key];

        if (orden === 'asc') {
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        }

        if (orden === 'desc') {
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        }
    });
}
export default{
    finalizarCompra: async(req, res, next) =>{
        try{
            const carrito_de_compras = await models.CarritoDeCompra.findOne({
                where: {
                    cdc_numero_orden: req.body.cf_compra_numero_orden
                },
                include: [
                    {
                        model: models.ProductoCarritoDeCompra
                    }
                ]
            });
            const total_compra = await sequelize.query(`
                select 
                    sum(total.total)
                from(
                select 
                    case 
                        when pcdc.pcdc_mejor_descuento >= 10 then   (pcdc.pcdc_precio - (pcdc.pcdc_precio * cast(concat('0.' || pcdc.pcdc_mejor_descuento) as float))) * pcdc.pcdc_producto_cantidad
                        when pcdc.pcdc_mejor_descuento <= 9 then    (pcdc.pcdc_precio - (pcdc.pcdc_precio * cast(concat('0.0' || pcdc.pcdc_mejor_descuento) as float))) * pcdc.pcdc_producto_cantidad
                    end as total
                from carrito_de_compras cdc  
                left join productos_carrito_de_compra pcdc  on pcdc.pcdc_carrito_de_compra_id  = cdc.cdc_carrito_de_compra_id 
                where cdc.cdc_carrito_de_compra_id  = ` + carrito_de_compras.dataValues.cdc_carrito_de_compra_id + `
                )total
            `,
            {
                type: sequelize.QueryTypes.SELECT
            });
            console.log(total_compra, total_compra[0]);
            let total_de_la_compra = total_compra.length > 0 ? total_compra[0].sum : 0
            if(!!carrito_de_compras){
                if(carrito_de_compras.dataValues.productos_carrito_de_compras.length > 0){
                    const socio_negocio = await models.SociosNegocio.findOne({
                        where: {
                            sn_socios_negocio_id: req.body.cf_vendido_a_socio_negocio_id
                        }
                    });
                    console.log('Socio de negocio', socio_negocio.dataValues);
                    if(!!socio_negocio){
                        const compraFinalizada = await models.CompraFinalizada.create({
                            cf_compra_numero_orden: carrito_de_compras.dataValues.cdc_numero_orden,
                            cf_compra_fecha: req.body.cf_compra_fecha,
                            cf_vendido_por_usu_usuario_id: !!req.body.cf_vendido_por_usu_usuario_id ? req.body.cf_vendido_por_usu_usuario_id : null,
                            cf_cmm_tipo_compra_id: req.body.cf_cmm_tipo_compra_id, 
                            cf_vendido_a_socio_negocio_id: req.body.cf_vendido_a_socio_negocio_id,
                            cf_cmm_tipo_envio_id: req.body.cf_cmm_tipo_envio_id, 
                            cf_direccion_envio_id: !!req.body.cf_direccion_envio_id ? req.body.cf_direccion_envio_id : null,
                            cf_cmm_tipo_impuesto: socio_negocio.dataValues.sn_cmm_tipo_impuesto, 
                            cf_alm_almacen_recoleccion: !!req.body.cf_alm_almacen_recoleccion ? req.body.cf_alm_almacen_recoleccion : null,
                            cf_total_compra: total_de_la_compra,
                            cf_estatus_orden: req.body.cf_estatus_orden,
                            cf_fletera_id: !!req.body.cf_fletera_id ? req.body.cf_fletera_id : null,
                            cf_sap_metodos_pago_codigo: !!req.body.cf_sap_metodos_pago_codigo ? req.body.cf_sap_metodos_pago_codigo : null,
                            cf_sap_forma_pago_codigo: !!req.body.cf_sap_forma_pago_codigo ? req.body.cf_sap_forma_pago_codigo : null,
                            cf_estatus_creacion_sap: !!req.body.cf_estatus_creacion_sap ? req.body.cf_estatus_creacion_sap : null,
                            cf_descripcion_sap: !!req.body.cf_descripcion_sap ? req.body.cf_descripcion_sap : null,
                            cf_referencia: !!req.body.cf_referencia ? req.body.cf_referencia : null
                        });
                        console.log('COMPRA FINALIZADA', compraFinalizada);
                        if(!!compraFinalizada){
                            carrito_de_compras.dataValues.productos_carrito_de_compras.forEach(async function(producto, indexProducto){
                                await models.ProductoCompraFinalizada.create({
                                    pcf_cf_compra_finalizada_id: compraFinalizada.dataValues.cf_compra_finalizada_id,
                                    pcf_prod_producto_id: producto.dataValues.pcdc_prod_producto_id,
                                    pcf_cantidad_producto: producto.dataValues.pcdc_producto_cantidad,
                                    pcf_descuento_producto: producto.dataValues.pcdc_mejor_descuento,
                                    pcf_precio: producto.dataValues.pcdc_precio,
                                    pcf_prod_producto_id_regalo: producto.dataValues.pcdc_prod_producto_id_regalo,
                                    pcf_cantidad_producto_regalo: producto.dataValues.pcdc_cantidad_producto_regalo,
                                    pcf_descuento_promocion: producto.dataValues.pcdc_descuento_promocion,
                                    pcf_prod_producto_id_promocion: producto.dataValues.pcdc_prod_producto_id_promocion,
                                    pcf_cantidad_producto_promocion: producto.dataValues.pcdc_cantidad_producto_promocion,
                                    pcf_cupon_aplicado: producto.dataValues.pcdc_cupon_aplicado
                                });
                                if((carrito_de_compras.dataValues.productos_carrito_de_compras.length -1) == indexProducto){
                                    try{
                                        await models.ProductoCarritoDeCompra.destroy({
                                            where: {
                                                pcdc_carrito_de_compra_id: carrito_de_compras.dataValues.cdc_carrito_de_compra_id
                                            }
                                        });
                                        await models.CarritoDeCompra.destroy({
                                            where: {
                                                cdc_carrito_de_compra_id: carrito_de_compras.dataValues.cdc_carrito_de_compra_id
                                            }
                                        });
                                        const compra_finalizada = await models.CompraFinalizada.findOne({
                                            where: {
                                                cf_compra_finalizada_id: compraFinalizada.dataValues.cf_compra_finalizada_id
                                            },
                                            include: [
                                                {
                                                    model: models.ProductoCompraFinalizada
                                                }
                                            ]
                                        })
                                        res.status(200).send({
                                            message: 'Compra finalizada con exito',
                                            compra_finalizada
                                        });
                                    }catch(e){
                                        res.status(300).send({
                                            message: 'A ocurrido un error al procesar la compra',
                                            e
                                        });
                                    }
                                }
                            });
                        }else{
                            try{
                                await models.CompraFinalizada.destroy({
                                    where: {
                                        cf_compra_numero_orden: carrito_de_compras.dataValues.cdc_numero_orden
                                    }
                                });
                                res.status(300).send({
                                    message: 'Error al procesar la compra'
                                });
                            }catch(error){
                                res.status(500).send({
                                    message: 'Error inesperado',
                                    error
                                });
                                next(error);
                            }
                        }
                    }else{
                        res.status(300).send({
                            message: 'Socio de negocio no registrado, no se puede continuar con la compra.'
                        })
                    }
                }else{
                    res.status(300).send({
                        message: 'No se puede procesar con la solicitud, el carrito se encuentra vacio'
                    });
                }
            }else{
                res.status(300).send({
                    message: 'No se pudo procesar el pedido, el carrito solicitado no existe'
                });
            }
        }catch(e){
            res.status(500).send({
                message: 'Error, al generar la petición',
                e
            });
            next(e);
        }
    },
    getHistorialSocioNegocio: async(req, res, next) =>{
        try{
            const historico = await models.CompraFinalizada.findAll({
                where: {
                    cf_vendido_a_socio_negocio_id: req.params.idSocio
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
                    }
                ]
            });
            res.status(200).send({
                message: 'Historial de pedidos, cagado con exito',
                historico
            })
        }catch(e){
            res.status(500).send({
                message: 'Error, al generar la petición',
                e
            });
            next(e);
        }
    },
    getListForUser: async(req, res, next) =>{
        try{
            const usuarioPeticion = await models.Usuario.findOne({
                where: {
                    usu_usuario_id: req.params.idUsuario,
                    usu_cmm_estatus_id: controles.ESTATUS_USUARIO.ACTIVO
                },
                include: [
                    {
                        model: models.Rol
                    }
                ]
            });
            if((usuarioPeticion.dataValues.role.dataValues.rol_tipo_rol_id == controles.TIPO_ROL_MENU.ADMINISTRADOR) && (!!usuarioPeticion)){
                const compras_totales = await models.CompraFinalizada.findAll({
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
                            model: models.ControlMaestroMultiple,
                            as:'tipo_impuesto',
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
                if(compras_totales.length > 0){
                    compras_totales.forEach(async function(elemento, index) {
                        const usuario = await models.Usuario.findOne({
                            where: {
                                usu_usuario_id: elemento.dataValues.cf_vendido_por_usu_usuario_id
                            },
                            attributes: {
                                exclude: ['usu_contrasenia','usu_imagen_perfil_id','usu_usuario_creado_por_id','createdAt','usu_usuario_modificado_por_id','updatedAt']
                            },
                            include: [
                                {
                                    model: models.ControlMaestroMultiple,
                                    as: 'estatus_usuario',
                                    attributes: {
                                        exclude: ['cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                    }
                                }
                            ]
                        });
                        const socio_negocio = await models.SociosNegocio.findOne({
                            where: {
                                sn_socios_negocio_id : elemento.dataValues.cf_vendido_a_socio_negocio_id
                            }
                        });
                        elemento.dataValues.vendido_por_usuario = usuario;
                        elemento.dataValues.socio_negocio = socio_negocio;
                        compras_finales.push(elemento);
                    if((compras_totales.length - 1) == index){
                            res.status(200).send({
                                message: 'Ventas fianlizadas',
                                compras_finales
                            })
                    } 
                    });
                }else{
                    res.status(200).send({
                        message: 'Compras finalizadas totales'
                    })
                }
            }else if((usuarioPeticion.dataValues.role.dataValues.rol_tipo_rol_id == controles.TIPO_ROL_MENU.VENDEDORES) && (!!usuarioPeticion)){
                if(usuarioPeticion.dataValues.role.dataValues.rol_nombre == 'Gerente'){
                    const usuarios = await models.Usuario.findAll({
                        where: {
                            usu_usuario_creado_por_id: usuarioPeticion.dataValues.usu_usuario_id
                        }
                    });
                    var auxTemp = []
                    usuarios.forEach(async function(element, index){
                        auxTemp.push(element.dataValues.usu_usuario_id);
                        if((usuarios.length - 1) == index){
                            const compras_finalizadas = await models.CompraFinalizada.findAll({
                                where: {
                                    cf_vendido_por_usu_usuario_id: auxTemp
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
                            if(compras_finalizadas.length > 0){
                                compras_finalizadas.forEach(async function(elemento, index){
                                    console.log('VENDEDOR', elemento.dataValues) 
                                    const usuario = await models.Usuario.findOne({
                                        where: {
                                            usu_usuario_id: elemento.dataValues.cf_vendido_por_usu_usuario_id
                                        },
                                        attributes: {
                                            exclude: ['usu_contrasenia','usu_imagen_perfil_id','usu_usuario_creado_por_id','createdAt','usu_usuario_modificado_por_id','updatedAt']
                                        },
                                        include: [
                                            {
                                                model: models.ControlMaestroMultiple,
                                                as: 'estatus_usuario',
                                                attributes: {
                                                    exclude: ['cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                                }
                                            }
                                        ]
                                    });
                                    const socio_negocio = await models.SociosNegocio.findOne({
                                    where: {
                                        sn_socios_negocio_id : elemento.dataValues.cf_vendido_a_socio_negocio_id
                                    }
                                    });
                                    elemento.dataValues.vendido_por_usuario = usuario;
                                    elemento.dataValues.socio_negocio = socio_negocio;
                                    compras_finales.push(elemento);
                                    if((compras_finalizadas.length -1 ) == index){
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
                }else{
                    const ventasUsuario = await models.CompraFinalizada.findAll({
                        where: {
                            cf_vendido_por_usu_usuario_id: usuarioPeticion.dataValues.usu_usuario_id
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
            }else{
                res.status(300).send({
                    message: 'No se pudo procesar, la petición.'
                });
            }
        }catch(e){
            res.status(500).send({
                message: 'Error, al generar la petición',
                e
            });
            next(e);
        }
    },
    getOnlyByID: async (req, res, next) =>{
        try{
            const detalle_pedido = await  models.CompraFinalizada.findOne({
                where: {
                    cf_compra_finalizada_id: req.params.idCompra
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
                        model: models.Almacenes,
                        as: 'almacen_recoleccion'
                    },
                    {
                        model: models.ControlMaestroMultiple,
                        as: 'tipo_impuesto'
                    },
                    {
                        model: models.ControlMaestroMultiple,
                        as: 'estatus_orden'
                    },
                    {
                        model: models.ProductoCompraFinalizada,
                        as: 'productos',
                        include: [
                            {
                                model: models.Producto
                            }
                        ]
                    }
                ]
            });
            res.status(200).send({
                message: 'Detalle de compra',
                detalle_pedido
            })
        }catch(e){
            res.status(500).send({
                message: 'Error ',
                e
            });
            next(e);
        }
    },
    GetBySkuNombre: async (req, res, next) =>{
        try{
            
            var prod_search_value = req.body.prod_search_value

            var querySQL = `
                    select
                        pcf_cf_compra_finalizada_id 
                    from 
                        productos_de_compra_finalizada pdcf 
                        left join productos p on pdcf.pcf_prod_producto_id = p.prod_producto_id 
                        where p.prod_sku like '%`+prod_search_value+`%' or p.prod_nombre like '%`+prod_search_value+`%'
                        group by pcf_cf_compra_finalizada_id
            `;

            const constFinalOrdenes = await sequelize.query(querySQL,
            { 
                type: sequelize.QueryTypes.SELECT 
            });

            //Generar IN para sql
            var ListaFinal = '';
            for (var u = 0; u < constFinalOrdenes.length; u++) 
            {
                ListaFinal = ListaFinal + "'"+  constFinalOrdenes[u].pcf_cf_compra_finalizada_id  + "'"

                if(u+1 < constFinalOrdenes.length)
                {
                    ListaFinal = ListaFinal + ","
                }
            }

            if(ListaFinal != '')
            {
                const compras_totales = await models.CompraFinalizada.findAll({
                    where: {
                        [Op.or]: [
                            Sequelize.literal("cf_compra_finalizada_id in (" + ListaFinal + ")"),
                        ]
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
                            model: models.ControlMaestroMultiple,
                            as:'tipo_impuesto',
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
                if(compras_totales.length > 0)
                {
                    compras_totales.forEach(async function(elemento, index) 
                    {
                        const usuario = await models.Usuario.findOne({
                            where: {
                                usu_usuario_id: elemento.dataValues.cf_vendido_por_usu_usuario_id
                            },
                            attributes: {
                                exclude: ['usu_contrasenia','usu_imagen_perfil_id','usu_usuario_creado_por_id','createdAt','usu_usuario_modificado_por_id','updatedAt']
                            },
                            include: [
                                {
                                    model: models.ControlMaestroMultiple,
                                    as: 'estatus_usuario',
                                    attributes: {
                                        exclude: ['cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                    }
                                }
                            ]
                        });
                        const socio_negocio = await models.SociosNegocio.findOne({
                            where: {
                                sn_socios_negocio_id : elemento.dataValues.cf_vendido_a_socio_negocio_id
                            }
                        });

                        elemento.dataValues.vendido_por_usuario = usuario;

                        elemento.dataValues.socio_negocio = socio_negocio;

                        compras_finales.push(elemento);


                        if((compras_totales.length - 1) == index)
                        {
                                res.status(200).send({
                                    message: 'Ventas fianlizadas',
                                    compras_finales
                                })
                        } 
                    });
                }else{
                    res.status(200).send({
                        message: 'Compras finalizadas totales'
                    })
                }
            }
            else
            {
                res.status(200).send({
                    message: 'Compras finalizadas totales'
                })
            }
            


        }catch(e){
            res.status(500).send({
                message: 'Error ',
                e
            });
            next(e);
        }
    },
    GetByEstado: async (req, res, next) =>{
        try{
            
            var estpa_estado_pais_id = req.body.estpa_estado_pais_id

            var querySQL = `
                select 
                    *
                from 
                    compras_finalizadas cf
                    left join socios_negocio_direcciones snd on cf.cf_direccion_envio_id = snd.snd_direcciones_id
                    left join almacenes a on cf.cf_alm_almacen_recoleccion = alm_almacen_id 
                    where alm_estado_pais_id = `+estpa_estado_pais_id+` or snd.snd_estado_id = `+estpa_estado_pais_id+`
            `;

            const constFinalOrdenes = await sequelize.query(querySQL,
            { 
                type: sequelize.QueryTypes.SELECT 
            });

            var listaDeIDOrdenes = []

            for (var i = 0; i < constFinalOrdenes.length; i++) 
            {
                //Si es envio tomara el campo de envio y buscara el id del estado
                if(constFinalOrdenes[i].cf_cmm_tipo_envio_id == 16 && constFinalOrdenes[i].snd_estado_id == estpa_estado_pais_id)
                {
                    //INCLUYE SOLO SKUS que no esten repetidos
                    if(listaDeIDOrdenes.includes(constFinalOrdenes[i].cf_compra_finalizada_id))
                    {

                    }
                    else
                    {
                        listaDeIDOrdenes.push(constFinalOrdenes[i].cf_compra_finalizada_id)
                    }
                }
                //Si el id es 17 tomara el campo de almacen porque es recoleccion y buscara el id del estado
                else if(constFinalOrdenes[i].cf_cmm_tipo_envio_id == 17 && constFinalOrdenes[i].alm_estado_pais_id == estpa_estado_pais_id)
                {
                    //INCLUYE SOLO SKUS que no esten repetidos
                    if(listaDeIDOrdenes.includes(constFinalOrdenes[i].cf_compra_finalizada_id))
                    {
                        
                    }
                    else
                    {
                        listaDeIDOrdenes.push(constFinalOrdenes[i].cf_compra_finalizada_id)
                    }
                }

            }

            // //Generar IN para sql
            var ListaFinal = '';

            for (var u = 0; u < listaDeIDOrdenes.length; u++) 
            {
                ListaFinal = ListaFinal + "'"+  listaDeIDOrdenes[u] + "'"

                if(u+1 < listaDeIDOrdenes.length)
                {
                    ListaFinal = ListaFinal + ","
                }
            }
            
            if(listaDeIDOrdenes.length > 0)
            {
                const compras_totales = await models.CompraFinalizada.findAll({
                    where: {
                        [Op.or]: [
                            Sequelize.literal("cf_compra_finalizada_id in (" + ListaFinal + ")"),
                        ]
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
                            model: models.ControlMaestroMultiple,
                            as:'tipo_impuesto',
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
                if(compras_totales.length > 0)
                {
                    compras_totales.forEach(async function(elemento, index) 
                    {
                        const usuario = await models.Usuario.findOne({
                            where: {
                                usu_usuario_id: elemento.dataValues.cf_vendido_por_usu_usuario_id
                            },
                            attributes: {
                                exclude: ['usu_contrasenia','usu_imagen_perfil_id','usu_usuario_creado_por_id','createdAt','usu_usuario_modificado_por_id','updatedAt']
                            },
                            include: [
                                {
                                    model: models.ControlMaestroMultiple,
                                    as: 'estatus_usuario',
                                    attributes: {
                                        exclude: ['cmm_nombre','cmm_sistema','cmm_activo','cmm_usu_usuario_creado_por_id','createdAt','cmm_usu_usuario_modificado_por_id','updatedAt']
                                    }
                                }
                            ]
                        });
                        const socio_negocio = await models.SociosNegocio.findOne({
                            where: {
                                sn_socios_negocio_id : elemento.dataValues.cf_vendido_a_socio_negocio_id
                            }
                        });

                        elemento.dataValues.vendido_por_usuario = usuario;

                        elemento.dataValues.socio_negocio = socio_negocio;

                        compras_finales.push(elemento);


                        if((compras_totales.length - 1) == index)
                        {
                                res.status(200).send({
                                    message: 'Ventas fianlizadas',
                                    compras_finales
                                })
                        } 
                    });
                }else{
                    res.status(200).send({
                        message: 'Compras finalizadas totales'
                    })
                }
            }
            else
            {
                res.status(200).send({
                    message: 'Compras finalizadas totales'
                })
            }
           

        }catch(e){
            res.status(500).send({
                message: 'Error ',
                e
            });
            next(e);
        }
    },
    getHistorialSocioNegocioTokenSN: async(req, res, next) =>{
        try{
            const historico = await models.CompraFinalizada.findAll({
                where: {
                    cf_vendido_a_socio_negocio_id: req.params.idSocio
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
                    }
                ],
                order: [
                    ['cf_compra_finalizada_id', 'DESC']
                ],
            });
            res.status(200).send({
                message: 'Historial de pedidos, cagado con exito',
                historico
            })
        }catch(e){
            res.status(500).send({
                message: 'Error, al generar la petición',
                e
            });
            next(e);
        }
    },
    getHistorialPedidosByCardCode: async(req, res, next) =>{
        try{

            


            const constSN = await models.SociosNegocio.findOne({
                where: {
                    sn_cardcode: req.body.sn_cardcode
                },
                attributes: ["sn_socios_negocio_id"]
            });





            const historico = await models.CompraFinalizada.findAll({
                where: {
                    cf_vendido_a_socio_negocio_id: constSN.sn_socios_negocio_id
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
                    }
                ]
            });


            res.status(200).send({
                message: 'Historial de pedidos, cagado con exito',
                historico
            })
        }catch(e){
            res.status(500).send({
                message: 'Error, al generar la petición',
                e
            });
            next(e);
        }
    },
    updateStatusPedido: async(req, res, next) =>{
        try{

            const constCompraFinalizada = await models.CompraFinalizada.findOne({
                where: {
                    cf_compra_finalizada_id : req.body.cf_compra_finalizada_id
                }
            });

            await constCompraFinalizada.update({
                cf_estatus_orden: !!req.body.cf_estatus_orden ? req.body.cf_estatus_orden : constCompraFinalizada.dataValues.cf_estatus_orden,
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
    getPedidoDetalleByID: async(req, res, next) =>{
        try{

            var pedido_id = req.params.id_pedido
            //ProductoCompraFinalizada
            const constCompraFinalizada = await models.CompraFinalizada.findOne({
                where: {
                    cf_compra_finalizada_id: pedido_id
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
                    }
                ]
            });



            if(constCompraFinalizada)
            {
                //Obtener todos los productos
                const constProductoCompraFinalizada = await models.ProductoCompraFinalizada.findAll({
                    where: {
                        pcf_cf_compra_finalizada_id: constCompraFinalizada.cf_compra_finalizada_id
                    },
                    order: [
                        ['pcf_order_dividida_sap', 'DESC']
                    ],
                });

                constCompraFinalizada.dataValues.ProductoCompraFinalizada = constProductoCompraFinalizada


                //Obtener todos los productos
                const constSapFormasPago = await models.SapFormasPago.findOne({
                    where: {
                        sfp_clave: constCompraFinalizada.cf_sap_forma_pago_codigo
                    }
                });



                constCompraFinalizada.dataValues.sfp_descripcion = constSapFormasPago.sfp_descripcion





                //console.log(constProductoCompraFinalizada)


                for (var i = 0; i < constProductoCompraFinalizada.length; i++) 
                {
                  
                    //Obtener todos los productos
                    const constProducto = await models.Producto.findOne({
                        where: {
                            prod_producto_id: constProductoCompraFinalizada[i].dataValues.pcf_prod_producto_id
                        }
                    });




                    constProductoCompraFinalizada[i].dataValues.prod_sku = constProducto.prod_sku
                    constProductoCompraFinalizada[i].dataValues.prod_nombre = constProducto.prod_nombre
                    constProductoCompraFinalizada[i].dataValues.prod_nombre_extranjero = constProducto.prod_nombre_extranjero



                    const constImagenProducto = await models.ImagenProducto.findOne(
                    {
                        where: {
                            imgprod_prod_producto_id: constProductoCompraFinalizada[i].dataValues.pcf_prod_producto_id
                        },
                        attributes: {
                            exclude: ['createdAt','updatedAt','imgprod_usu_usuario_creador_id']
                        }
                    });



                    constProductoCompraFinalizada[i].dataValues.imagenes = constImagenProducto
                }


                //DIRECCION DE ENVIO
                var direcion_envio = constCompraFinalizada.cf_direccion_envio_id
                if(direcion_envio == ''  || direcion_envio == null)
                {
                    direcion_envio = '001'
                }
                const constSociosNegocioDirecciones = await models.SociosNegocioDirecciones.findAll({
                    where: {
                        snd_direcciones_id: direcion_envio
                    }
                });

                constCompraFinalizada.dataValues.DireccionEnvio = constSociosNegocioDirecciones



                //Direccion recoleccion
                var direcion_recoleccion = constCompraFinalizada.cf_alm_almacen_recoleccion
                if(direcion_recoleccion == '' || direcion_recoleccion == null)
                {
                    direcion_recoleccion = '001'
                }
                const constAlmacenes = await models.Almacenes.findAll({
                    where: {
                        alm_almacen_id: direcion_recoleccion
                    }
                });

                constCompraFinalizada.dataValues.DireccionRecoleccion = constAlmacenes



                //Datos SN
                var socio_de_negocio_id = constCompraFinalizada.cf_vendido_a_socio_negocio_id
                if(socio_de_negocio_id == ''  || socio_de_negocio_id == null)
                {
                    socio_de_negocio_id = '001'
                }
                const constSociosNegocio = await models.SociosNegocio.findAll({
                    where: {
                        sn_socios_negocio_id: socio_de_negocio_id
                    }
                });

                constCompraFinalizada.dataValues.SocioDeNegocio = constSociosNegocio













                res.status(200).send({
                    message: 'Historial de pedidos, cagado con exito',
                    constCompraFinalizada
                })

            }
            else
            {
                res.status(200).send({
                    message: 'Historial de pedidos, cagado con exito',
                    constCompraFinalizada
                })
            }


           
        }catch(e){
            res.status(500).send({
                message: 'Error, al generar la petición',
                e
            });
            next(e);
        }
    },







    getOrdenesFallidasToSap: async(req, res, next) =>{
        try{







            const constCompraFinalizadaMXP = await models.CompraFinalizada.findAll({
                where: {
                    [Op.or] : 
                    [
                        {cf_estatus_creacion_sap: "-1"},
                        {

                            [Op.and] : [
                                {cf_mensajeov : { [Op.ne] : '' }},
                                {cf_mensajeov : { [Op.ne] : null }},
                            ]   

                        },
                        
                        {cf_estatus_orden : controles.ESTATUS_STATUS_ORDEN_FINALIZADA["REPLICA ERROR"] },
                    ]
                },
                attributes: 
                {
                    exclude: ['cf_sap_json_creacion','cf_sap_json_creacion_usd']
                }
            });








            const constCompraFinalizadaUSD = await models.CompraFinalizada.findAll({
                where: {
                    [Op.or] : 
                    [
                        {cf_estatus_creacion_sap_usd : "-1"},
                        {

                            [Op.and] : [
                                {cf_mensajeov_usd : { [Op.ne] : '' }},
                                {cf_mensajeov_usd : { [Op.ne] : null }},
                            ] 
                        },
                        {cf_estatus_orden_usd : controles.ESTATUS_STATUS_ORDEN_FINALIZADA["REPLICA ERROR"]},
                    ]
                },
                attributes: 
                {
                    exclude: ['cf_sap_json_creacion','cf_sap_json_creacion_usd']
                }
            });





            res.status(200).send({
                message: 'Ordenes no creadas en SAP',
                constCompraFinalizadaMXP,
                constCompraFinalizadaUSD
            })

        }
        catch(e){
            console.log(e)
            res.status(500).send({
                message: 'No fue posible crear la orden',
                e
            });
            next(e);
        }
    },





    getOrdenesFallidasToSapV2: async(req, res, next) =>{
        try{

            const constCompraFinalizadaSAPErrores = await models.CompraFinalizadaSAPErrores.findAll({
                where: {
                    cfse_cmm_estatus_id : { [Op.ne] : controles.ESTATUS_COMPRAS_FINALIZADAS_SAP_ERRORES.ELIMINADA }
                },
                order: [
                    ['cfse_compras_finalizadas_sap_errores_id', 'DESC']
                ],
            });

            res.status(200).send({
                message: 'Ordenes no creadas en SAP',
                constCompraFinalizadaSAPErrores
            })

        }
        catch(e){
            console.log(e)
            res.status(500).send({
                message: 'No fue posible crear la orden',
                e
            });
            next(e);
        }
    },




    updateOrdenesFallidasToSapV2: async(req, res, next) =>{
        try{
            const constCompraFinalizadaSAPErrores = await models.CompraFinalizadaSAPErrores.findOne({
                where: {
                    cfse_compras_finalizadas_sap_errores_id : req.body.cfse_compras_finalizadas_sap_errores_id
                }
            });

            await constCompraFinalizadaSAPErrores.update({
                cfse_solucion: !!req.body.cfse_solucion ? req.body.cfse_solucion : constCompraFinalizada.dataValues.cfse_solucion,
                updatedAt: Date(),
                cfse_cf_usu_usuario_modifica: req.body.cfse_cf_usu_usuario_modifica
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




    deleteOrdenesFallidasToSapV2: async(req, res, next) =>{
        try{
            const constCompraFinalizadaSAPErrores = await models.CompraFinalizadaSAPErrores.findOne({
                where: {
                    cfse_compras_finalizadas_sap_errores_id : req.body.cfse_compras_finalizadas_sap_errores_id
                }
            });

            await constCompraFinalizadaSAPErrores.update({
                cfse_cmm_estatus_id: controles.ESTATUS_COMPRAS_FINALIZADAS_SAP_ERRORES.ELIMINADA,
                updatedAt: Date(),
                cfse_cf_usu_usuario_modifica: req.body.cfse_cf_usu_usuario_modifica
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


    solucionadoOrdenesFallidasToSapV2: async(req, res, next) =>{
        try{
            const constCompraFinalizadaSAPErrores = await models.CompraFinalizadaSAPErrores.findOne({
                where: {
                    cfse_compras_finalizadas_sap_errores_id : req.body.cfse_compras_finalizadas_sap_errores_id
                }
            });

            await constCompraFinalizadaSAPErrores.update({
                cfse_cmm_estatus_id: controles.ESTATUS_COMPRAS_FINALIZADAS_SAP_ERRORES.SOLUCIONADO,
                updatedAt: Date(),
                cfse_cf_usu_usuario_modifica: req.body.cfse_cf_usu_usuario_modifica
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























    V2finalizarCompra: async(req, res, next) =>{
        try{
            
 
            //Obtener tipo de cambio
            const constTipoCambio = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_nombre: "TIPO_CAMBIO_USD"
                },
                attributes: ["cmm_valor"]
            })
            var USDValor = constTipoCambio.cmm_valor


            //variable de socio de negocio
            var cdc_sn_socio_de_negocio_id = req.body.cdc_sn_socio_de_negocio_id









            //Guardar carrito por seguridad
                const safeconstCarritoDeCompra = await models.CarritoDeCompra.findOne(
                {
                    where: {
                        cdc_sn_socio_de_negocio_id: cdc_sn_socio_de_negocio_id
                    }
                })

                //Productos del carrito de compra
                const safeconstProductoCarritoDeCompra = await models.ProductoCarritoDeCompra.findAll(
                {
                    where: {
                        pcdc_carrito_de_compra_id: safeconstCarritoDeCompra.cdc_carrito_de_compra_id
                    }
                })


                //Crear carritos al intentar insertar por seguridad
                if(safeconstCarritoDeCompra && safeconstProductoCarritoDeCompra)
                {
                    console.log(safeconstCarritoDeCompra)
                    await models.SafeCarritoDeCompra.create(safeconstCarritoDeCompra.dataValues)

                    for (var u = 0; u < safeconstProductoCarritoDeCompra.length; u++) 
                    {
                        await models.SafeProductoCarritoDeCompra.create(safeconstProductoCarritoDeCompra[u].dataValues)
                    }
                }
            //Fin guardar carrito








            
            //Obtener carrito
            const constCarritoDeCompra = await models.CarritoDeCompra.findOne(
            {
                where: {
                    cdc_sn_socio_de_negocio_id: cdc_sn_socio_de_negocio_id
                }
            })

            //Productos del carrito de compra
            const constProductoCarritoDeCompra = await models.ProductoCarritoDeCompra.findAll(
            {
                where: {
                    pcdc_carrito_de_compra_id: constCarritoDeCompra.cdc_carrito_de_compra_id
                },
                attributes: {
                    exclude: ['createdAt','updatedAt','pcdc_lista_precio','pcdc_precio','pcdc_prod_producto_id_regalo','pcdc_cantidad_producto_regalo',
                    'pcdc_descuento_promocion', 'pcdc_prod_producto_id_promocion', 'pcdc_cantidad_producto_promocion', 'pcdc_cupon_aplicado',
                    'pcdc_mejor_descuento', 'pcdc_almacen_surtido', 'pcdc_no_disponible_para_compra', 'pcdc_back_order', 'pcdc_validado']
                }
            })



            //informacion Vendedor
            var cf_vendido_por_usu_usuario_id
            if(req.body.cf_vendido_por_usu_usuario_id)
            {
                cf_vendido_por_usu_usuario_id = req.body.cf_vendido_por_usu_usuario_id
            }
            else
            {
                //Obtener carrito
                const constSociosNegocioVendedor = await models.SociosNegocio.findOne(
                {
                    where: {
                        sn_socios_negocio_id: constCarritoDeCompra.cdc_sn_socio_de_negocio_id
                    }
                })
                
                //Obtener carrito
                const constUsuarioSellerID = await models.Usuario.findOne(
                {
                    where: {
                        usu_codigo_vendedor: constSociosNegocioVendedor.sn_vendedor_codigo_sap
                    }
                })

                if(constUsuarioSellerID)
                {
                    cf_vendido_por_usu_usuario_id = constUsuarioSellerID.usu_usuario_id
                }
                else
                {
                    cf_vendido_por_usu_usuario_id = null
                }
            }




            

            //Obtener Checkout
            var checkoutJson = await getCheckout.getCheckoutAPI(req.body.cdc_sn_socio_de_negocio_id);

            //Validar si el carrito es de tipo credito forma de pago y si lo es restar el credito y pasar la orden
            var creditoResult = await CreacionOrdenSAP.validarCreditoDisponible(constCarritoDeCompra.cdc_forma_pago_codigo, constCarritoDeCompra.cdc_sn_socio_de_negocio_id, checkoutJson.dataValues.TotalFinal);

            console.log(checkoutJson)
            



            //obtener tipo impuesto cmm
            const constControlMaestroMultiple = await models.ControlMaestroMultiple.findOne(
            {
                where: {
                    cmm_valor: checkoutJson.dataValues.tipoImpuesto
                }
            })


            //Obtener resumenes divididos
            var resumenDividido = await getCheckout.getCheckoutResumenDetalle(req.body.cdc_sn_socio_de_negocio_id);


            //Crear compra finalizada en tabla preValidadora
            const constCompraFinalizada = await models.CompraFinalizada.create({
                cf_compra_numero_orden: constCarritoDeCompra.cdc_numero_orden,
                cf_compra_fecha: Date(),
                cf_vendido_por_usu_usuario_id: cf_vendido_por_usu_usuario_id,
                cf_cmm_tipo_compra_id: null, //no aplica, porque existe el campo forma de pago
                cf_vendido_a_socio_negocio_id: constCarritoDeCompra.cdc_sn_socio_de_negocio_id,
                cf_cmm_tipo_envio_id: constCarritoDeCompra.cdc_cmm_tipo_envio_id, 
                cf_direccion_envio_id: constCarritoDeCompra.cdc_direccion_envio_id,
                cf_cmm_tipo_impuesto: constControlMaestroMultiple.cmm_control_id, 
                cf_alm_almacen_recoleccion: constCarritoDeCompra.cdc_alm_almacen_recoleccion,
                cf_total_compra: checkoutJson.dataValues.TotalFinal,
                cf_estatus_orden: 1000185,
                cf_fletera_id: constCarritoDeCompra.cdc_fletera_id,
                cf_sap_metodos_pago_codigo: /*!!req.body.cdc_forma_pago_codigo ? req.body.cdc_forma_pago_codigo : null,*/ "PUE", //pago unico
                cf_sap_forma_pago_codigo: constCarritoDeCompra.cdc_forma_pago_codigo ? constCarritoDeCompra.cdc_forma_pago_codigo : null,
                cf_estatus_creacion_sap: null,
                cf_descripcion_sap: null,
                cf_referencia: constCarritoDeCompra.cdc_referencia, 
                cf_promcup_promociones_cupones_id: constCarritoDeCompra.cdc_promcup_promociones_cupones_id,
                cf_orden_subtotal: checkoutJson.dataValues.precioTotal,
                cf_orden_descuento: checkoutJson.dataValues.totalDescuentos,
                cf_orden_subtotal_aplicado: checkoutJson.dataValues.precioFinalTotal,
                cf_orden_gastos_envio: parseFloat(checkoutJson.dataValues.cdc_costo_envio.toFixed(2)),
                cf_order_iva: checkoutJson.dataValues.TotalImpuesto,
                cf_cfdi: constCarritoDeCompra.cdc_cfdi,
                cf_estatus_orden_usd: 1000185,
                cf_resume_mxn: resumenDividido[1],
                cf_resume_usd: resumenDividido[0],
                cf_snu_usuario_snu_id: req.body.cf_snu_usuario_snu_id,
                cf_generado_en: !!req.body.cf_generado_en ? req.body.cf_generado_en : null
            });




 
            if(constCompraFinalizada)
            {
                //Obtener Lineas para insertar en la tabla productos compra finalizada y para sap
                var lineasTemporales = await getCheckout.getLineasProductosComprasFinalizadas(checkoutJson, constCompraFinalizada.dataValues.cf_compra_finalizada_id);

                //Pago con credito dielsa
                if(constCarritoDeCompra.cdc_forma_pago_codigo == 99)
                {
                    //Regresa un array de la orden dividida en MXN y USD
                    var ordernDividida = await getCheckout.validarLineasIfDividirOrdenUSDExchage(lineasTemporales);
                    var ordenDivididaBool = false
                    var ordenNoTieneMXN = false

                    //la orden puede estar dividida en dos
                    for (var j = 0; j < ordernDividida.length; j++) 
                    {
                        

                        if(ordernDividida[j].principal.length > 0)
                        {
                            // Ordenar order por producto id (posible solucion a aveces hace lo que quiere para las lineas sap)
                            var principalTemp = sortJSON(ordernDividida[j].principal, 'pcf_prod_producto_id', 'asc');
                            ordernDividida[j].principal = principalTemp

                            //Insertar cada producto en la tabla de productos compras finalizadas
                            for (var i = 0; i < ordernDividida[j].principal.length; i++) 
                            {
                                console.log(ordernDividida[j].principal[i])
                                ordernDividida[j].principal[i].pcf_order_dividida_sap = false
                                ordernDividida[j].principal[i].pcf_numero_orden_usd_sap = null
                                await models.ProductoCompraFinalizada.create(ordernDividida[j].principal[i]);
                            }
                            ordenNoTieneMXN = true
                        }
                        else if(ordernDividida[j].secundario.length > 0)
                        {
                            // Ordenar order por producto id (posible solucion a aveces hace lo que quiere para las lineas sap)
                            var principalTemp = sortJSON(ordernDividida[j].secundario, 'pcf_prod_producto_id', 'asc');
                            ordernDividida[j].secundario = principalTemp

                            //Insertar cada producto en la tabla de productos compras finalizadas
                            for (var i = 0; i < ordernDividida[j].secundario.length; i++) 
                            {
                                console.log(ordernDividida[j].secundario[i])
                                ordernDividida[j].secundario[i].pcf_order_dividida_sap = true
                                ordernDividida[j].secundario[i].pcf_precio = parseFloat((ordernDividida[j].secundario[i].pcf_precio / USDValor).toFixed(2))
                                ordernDividida[j].secundario[i].pcf_descuento_promocion = parseFloat((ordernDividida[j].secundario[i].pcf_descuento_promocion / USDValor).toFixed(2))
                                ordernDividida[j].secundario[i].pcf_numero_orden_usd_sap = constCarritoDeCompra.cdc_numero_orden + '-01'
                                await models.ProductoCompraFinalizada.create(ordernDividida[j].secundario[i]);
                            }
                            ordenDivididaBool = true
                        }
                    }

                    // Obtener status ordenes null
                        if(ordenNoTieneMXN == false && constCarritoDeCompra.cdc_cmm_tipo_envio_id == 17)
                        {
                            //Como no vendran productos en MXN y el tipo envio es recoleccion no tendra status orden MXN
                            const bodyUpdate = {
                                "cf_estatus_orden": null
                            }
                            await constCompraFinalizada.update(bodyUpdate);
                        }

                        //Si tiene productos en USD dara valor a la parte de que tambien es orden en USD
                        if(ordenDivididaBool == true)
                        {
                            await constCompraFinalizada.update({
                                cf_orden_dividida_sap : constCarritoDeCompra.cdc_numero_orden + '-01',
                                updatedAt: Date()
                            });
                        }
                        else
                        {
                            //Como no vendran productos en USD pondre en null el status
                            const bodyUpdate = {
                                "cf_estatus_orden_usd": null
                            }
                            await constCompraFinalizada.update(bodyUpdate);
                        }
                    //

                    //Crear Num lineas para sap a la tabla productos compra finalizada
                    // var lineaNum = await CreacionOrdenSAP.CreaLineasNumSAP(constCompraFinalizada.dataValues.cf_compra_finalizada_id);

                    var jsonSAP = await CreacionOrdenSAP.CreacionOrdenSAPDivididaUSD(req.body.cdc_sn_socio_de_negocio_id, constCompraFinalizada.dataValues.cf_compra_finalizada_id, checkoutJson.dataValues.cdc_politica_envio_surtir_un_solo_almacen, checkoutJson.dataValues.cdc_politica_envio_nombre);
                }
                else
                {
                    //Como no vendran productos en USD pondre en null el status
                    const bodyUpdate = {
                        "cf_estatus_orden_usd": null
                    }
                    await constCompraFinalizada.update(bodyUpdate);

                    var lineasTemporalesTemp = sortJSON(lineasTemporales, 'pcf_prod_producto_id', 'asc');
                    lineasTemporales = lineasTemporalesTemp

                    //Insertar cada producto en la tabla de productos compras finalizadas
                    for (var i = 0; i < lineasTemporales.length; i++) 
                    {
                        await models.ProductoCompraFinalizada.create(lineasTemporales[i]);
                    }

                    // //Obtener Lineas para insertar en la tabla productos compra finalizada y para sap
                    // var lineasTemporales = await CreacionOrdenSAP.CreacionOrdenSAP(checkoutJson, constCompraFinalizada.dataValues.cf_compra_finalizada_id);


                    //Crear Num lineas para sap a la tabla productos compra finalizada
                    // var lineaNum = await CreacionOrdenSAP.CreaLineasNumSAP(constCompraFinalizada.dataValues.cf_compra_finalizada_id);

                    //Crear Orden Sap
                    var jsonSAP = await CreacionOrdenSAP.CreacionOrdenSAP(req.body.cdc_sn_socio_de_negocio_id, constCompraFinalizada.dataValues.cf_compra_finalizada_id, checkoutJson.dataValues.cdc_politica_envio_surtir_un_solo_almacen, checkoutJson.dataValues.cdc_politica_envio_nombre);
                }




                // //borrar despues el if y dejar solo codigo, Cuando se hace desde ENV no borra carrito
                // if(process.env.PORT != 5000)
                // {
                    //Borrar carrito actual
                    await models.ProductoCarritoDeCompra.destroy({
                        where: {
                            pcdc_carrito_de_compra_id: constCarritoDeCompra.dataValues.cdc_carrito_de_compra_id
                        }
                    });
                    await models.CarritoDeCompra.destroy({
                        where: {
                            cdc_carrito_de_compra_id: constCarritoDeCompra.dataValues.cdc_carrito_de_compra_id
                        }
                    });
                    
                // }
                // else
                // {
                //     var newNumeroOrden =  parseInt(constCarritoDeCompra.cdc_numero_orden)+1
                //     newNumeroOrden = "0000000" + newNumeroOrden

                     
                //     const bodyUpdate = {
                //         "cdc_numero_orden": newNumeroOrden,
                //         updatedAt: Date()
                //     };
                    
                //     await constCarritoDeCompra.update(bodyUpdate);

                // }

               //Revisar aqui envia un correo

               //Envia correo a usuarios clientres de dielsa.com

                await ordenCreadaEmail(constCompraFinalizada.dataValues.cf_compra_finalizada_id);

                //Para los usuarios de dielsa mandar correo cuando se crea una orden
                const constBussinessPartner = await models.SociosNegocio.findOne(
                    {
                        where: {
                            sn_socios_negocio_id: constCarritoDeCompra.cdc_sn_socio_de_negocio_id
                        }
                    })
                
                 console.log('hola vendedor:'+constBussinessPartner.sn_vendedor_codigo_sap);
                await ordenCreadaUsuarioDielsaEmail(constCompraFinalizada.dataValues.cf_compra_finalizada_id);


                

                // //Validar el json de sap
                // var validarOrdenSAP = await CreacionOrdenSAP.preValidarCreacionOrdenSAP(req.body.cdc_sn_socio_de_negocio_id, constCompraFinalizada.dataValues.cf_compra_finalizada_id);

                res.status(200).send({
                    message: 'Orden creada con exito',
                    cf_compra_finalizada_id: constCompraFinalizada.dataValues.cf_compra_finalizada_id
                })
            }  
            else
            {
                res.status(500).send({
                    message: 'No fue posible crear la orden de compra. revisar.'
                })
            }

        }
        catch(e){
            console.log(e)
            res.status(500).send({
                message: 'No fue posible crear la orden',
                e
            });
            next(e);
        }
    },





};